import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Device from 'expo-device';
import ScreenContainer from '../components/ScreenContainer';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStack';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import * as Notifications from 'expo-notifications';
import { getNotificationConsentGranted } from '../utils/storage';
import Toast, { ToastType } from '../components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { login } = useAuth();
  const [showWebView, setShowWebView] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const BASE_AUTH_URL = 'https://overfoul-domingo-unharmable.ngrok-free.dev/api/auth/microsoft/';

  const handleLogin = async () => {
    try {
      console.log('[LoginScreen] Starting login process...');
      setIsAuthProcessing(true);
      
      let token = '';
      const consentGranted = await getNotificationConsentGranted();
      if (consentGranted) {
          // Verificar permisos de sistema antes de intentar registrar
          const { status } = await Notifications.getPermissionsAsync();
          
          if (status === 'granted') {
             token = await registerForPushNotificationsAsync() || '';
             console.log('[LoginScreen] Push Token obtenido para login:', token);
          } else {
             console.log('[LoginScreen] Permiso revocado o faltante. Redirigiendo a Consent.');
             // Si el usuario dijo SI antes en la app, pero el sistema dice NO,
             // redirigimos a la pantalla de consentimiento para manejarlo gracefully
             setIsAuthProcessing(false);
             navigation.replace('NotificationConsent');
             return;
          }
      } else {
          console.log('[LoginScreen] Push Token skipped (consent not granted)');
      }
      
      const url = token 
        ? `${BASE_AUTH_URL}?expo_push_token=${encodeURIComponent(token)}`
        : BASE_AUTH_URL;
        
      console.log('[LoginScreen] Auth URL:', url);
      setAuthUrl(url);
      setShowWebView(true);
    } catch (error) {
      console.error('[LoginScreen] Error preparando login:', error);
      setAuthUrl(BASE_AUTH_URL);
      setShowWebView(true);
    } finally {
      setIsAuthProcessing(false);
    }
  };

  // Script para inyectar en el WebView y extraer el JSON de la respuesta
  const INJECTED_JAVASCRIPT = `(function() {
    function waitForJson() {
      var body = document.body.innerText;
      try {
        // Intentar parsear para ver si es JSON
        var response = JSON.parse(body);
        
        // Log para depuración (se enviará como mensaje)
        // window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: 'JSON detected', keys: Object.keys(response) }));

        if (response.token && response.hasOwnProperty('onboarding_required')) {
          // Ocultar el JSON crudo mostrando un mensaje de carga amigable
          document.body.style.backgroundColor = '#ffffff';
          document.body.innerHTML = '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:-apple-system, BlinkMacSystemFont, sans-serif;"><h3>Iniciando sesión...</h3><p>Por favor espera un momento</p></div>';
          
          window.ReactNativeWebView.postMessage(JSON.stringify(response));
        } else if (response.error || response.message) {
           // Si es JSON pero tiene error
           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: response.message || response.error }));
        }
      } catch (e) {
        // No es JSON todavía.
        // Verificar si parece una página de error de Laravel/PHP/Servidor
        if (document.title.includes('Error') || body.includes('Whoops, looks like something went wrong') || body.includes('500 Internal Server Error')) {
           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Server Error Detected: ' + document.title }));
        }
      }
    }
    // Verificar frecuentemente
    setInterval(waitForJson, 500);
  })();`;

  const handleWebViewMessage = async (event: any) => {
    try {
      console.log('[LoginScreen] WebView message received');
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'log') {
        console.log('[LoginScreen WebView Log]', data.message, data.keys || '');
        return;
      }

      if (data.type === 'error') {
        console.error('[LoginScreen] Error from WebView:', data.message);
        setIsAuthProcessing(false);
        setShowWebView(false);
        showToast('Ocurrió un problema al intentar iniciar sesión. Por favor, inténtalo de nuevo.', 'error');
        return;
      }

      console.log('[LoginScreen] Auth Data received:', { 
        hasToken: !!data.token, 
        onboardingRequired: data.onboarding_required,
        userData: data.user_data 
      });

      if (data.token) {
        // Guardar token y datos del usuario usando el contexto
        console.log('[LoginScreen] Calling login context...');
        await login(data.token, data.user_data || {});
        console.log('[LoginScreen] Login context finished');
        
        // --- REGISTRO DE DISPOSITIVO (Opción 2) ---
        try {
          const consentGranted = await getNotificationConsentGranted();
          if (consentGranted) {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
              console.log('[LoginScreen] Registering device...');
              await api.post('/devices', {
                expo_push_token: pushToken,
                expo_token: pushToken, // Enviamos ambos para asegurar compatibilidad con el backend
                device_name: Device.modelName || Device.osName // Enviamos el nombre del dispositivo
              }, { token: data.token });
              console.log('[LoginScreen] Dispositivo registrado exitosamente en /api/devices');
            }
          }
        } catch (error) {
          console.error('[LoginScreen] Error registrando dispositivo:', error);
          // No bloqueamos el flujo si falla el registro del token
        }
        // -------------------------------------------
        
        console.log('[LoginScreen] Closing WebView and navigating...');
        setShowWebView(false);
        
        // Navegación basada en onboarding_required
        if (data.onboarding_required) {
          console.log('[LoginScreen] Navigating to Onboarding');
          navigation.replace('Onboarding');
        } else {
          console.log('[LoginScreen] Navigating to MainTabs');
          navigation.replace('MainTabs');
        }
      }
    } catch (error) {
      console.log('[LoginScreen] Error parsing webview message', error);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('[LoginScreen] WebView navigation:', url);
    // Detectar cuando estamos en el callback para ocultar el WebView antes de que renderice el JSON
    if (url.includes('/callback') || url.includes('code=')) {
      console.log('[LoginScreen] Callback detected, showing loading...');
      setIsAuthProcessing(true);
      
      // Timeout de seguridad: si en 15 segundos no recibimos el mensaje JSON, asumimos error
      setTimeout(() => {
        if (showWebView) { // Si sigue abierto
           console.log('[LoginScreen] Timeout waiting for JSON response');
           // No cerramos automáticamente para dejar que el usuario vea si hay un error en pantalla,
           // pero podríamos mostrar una alerta o habilitar un botón de cierre manual si estuviera oculto.
           // En este caso, como isAuthProcessing oculta el webview, debemos mostrarlo o cerrarlo.
           setIsAuthProcessing(false); // Volver a mostrar el webview por si hay un error visible
        }
      }, 15000);
    }
  };

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowWebView(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Iniciar Sesión</Text>
            <View style={{ width: 24 }} /> 
          </View>
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: authUrl }}
              onMessage={handleWebViewMessage}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              startInLoadingState
              scalesPageToFit
              javaScriptEnabled={true}
              domStorageEnabled={true}
              incognito={true}
              cacheEnabled={false}
              originWhitelist={['*']}
              onNavigationStateChange={handleNavigationStateChange}
              // Agregamos un UserAgent para evitar bloqueos de seguridad en algunos proveedores OAuth y mejorar compatibilidad
              userAgent={Platform.OS === 'android' 
                ? "Mozilla/5.0 (Linux; Android 10; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0" 
                : "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
              }
              style={{ opacity: isAuthProcessing ? 0 : 1 }}
            />
            {isAuthProcessing && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: colors.text, fontFamily: typography.medium, fontSize: typography.sizes.md }}>
                  Iniciando sesión...
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.content}>
        <View style={styles.header}>
          {/* Logo Placeholder */}
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name="graduation-cap" size={40} color="#FFF" />
          </View>
          
          <Text style={[styles.appName, { color: colors.text, fontSize: typography.sizes.xxl, fontFamily: typography.bold }]}>
            Internify
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.sizes.md, fontFamily: typography.regular }]}>
            Plataforma de Pasantías UNI
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.instructionText, { color: colors.text, fontSize: typography.sizes.md, fontFamily: typography.medium }]}>
            Inicia sesión con tu cuenta institucional
          </Text>

          <TouchableOpacity
            style={[styles.microsoftButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
               <FontAwesome5 name="microsoft" size={24} color="#00A4EF" />
            </View>
            <Text style={[styles.buttonText, { color: colors.text, fontSize: typography.sizes.md, fontFamily: typography.medium }]}>
              Continuar con Microsoft
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontFamily: typography.regular }]}>
            Solo disponible para estudiantes con correo @uni.edu.ni
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
          © 2025 Universidad Nacional de Ingeniería
        </Text>
      </View>

      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appName: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  microsoftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
