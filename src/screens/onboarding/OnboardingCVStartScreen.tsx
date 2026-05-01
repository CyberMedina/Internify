import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import OnboardingHeader from '../../components/OnboardingHeader';
import { api } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CVStart'>;

export default function OnboardingCVStartScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsProcessing(true);
      
      const file = result.assets[0];
      const formData = new FormData();
      
      // React Native specific FormData handling
      formData.append('cv', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);

      const data = await api.post<any>('/parse-cv', formData);
      
      setIsProcessing(false);
      navigation.navigate('CVWizard', { mode: 'ai', cvData: data });

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      Alert.alert('Error', 'Hubo un error al procesar tu CV. Por favor intenta de nuevo o hazlo manualmente.');
    }
  };

  const handleManual = () => {
    navigation.navigate('CVWizard', { mode: 'manual' });
  };

  if (isProcessing) {
    return (
      <ScreenContainer safeTop safeBottom style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.View entering={FadeInDown} exiting={FadeOut} style={{ alignItems: 'center', width: '100%' }}>
          <LottieView
            source={require('../../assets/lotties/Robot Working.json')}
            autoPlay
            loop
            style={{ width: 250, height: 250, marginBottom: 12 }}
          />
          <Text style={[styles.processingTitle, { color: colors.text, fontSize: typography.sizes.xl, fontFamily: typography.bold }]}>
            Analizando tus superpoderes... 🚀
          </Text>
          <Text style={[styles.processingSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.md, marginTop: 8 }]}>
            Nuestra IA está leyendo tu documento
          </Text>
        </Animated.View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer safeTop safeBottom style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: colors.surface, 
            alignItems: 'center', 
            justifyContent: 'center',
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 24, paddingTop: 40, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader 
          icon="file-alt" 
          title="Construyamos tu perfil" 
          subtitle="¿Cómo prefieres hacerlo?" 
        />

        <View style={styles.optionsContainer}>
          {/* Option A: AI Upload */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 }]}
            onPress={handleUpload}
            activeOpacity={0.9}
          >
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>RECOMENDADO</Text>
            </View>
            
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.chipBg }]}>
                <MaterialCommunityIcons name="robot-happy" size={32} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.sizes.lg, fontFamily: typography.bold }]}>
                  Tengo mi CV o LinkedIn en PDF
                </Text>
                <Text style={[styles.cardDescription, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  Nuestra IA leerá tu archivo y llenará los datos por ti en segundos.
                </Text>
              </View>
            </View>
            
            <View style={[styles.uploadZone, { borderColor: colors.border }]}>
              <FontAwesome5 name="cloud-upload-alt" size={20} color={colors.textSecondary} />
              <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Toca para subir archivo</Text>
            </View>
          </TouchableOpacity>

          {/* Option B: Manual */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={handleManual}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.chipBg }]}>
                <MaterialCommunityIcons name="pencil-outline" size={32} color={colors.text} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.sizes.lg, fontFamily: typography.bold }]}>
                  Llenar manualmente
                </Text>
                <Text style={[styles.cardDescription, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  Si no tienes un CV listo, puedes ingresar tus datos paso a paso.
                </Text>
              </View>
            </View>
            
            <View style={[styles.uploadZone, { borderColor: colors.border, borderStyle: 'solid' }]}>
              <Text style={[styles.uploadText, { color: colors.text }]}>Comenzar formulario</Text>
              <FontAwesome5 name="arrow-right" size={14} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    lineHeight: 20,
  },
  uploadZone: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  processingTitle: {
    textAlign: 'center',
  },
  processingSubtitle: {
    textAlign: 'center',
  },
});
