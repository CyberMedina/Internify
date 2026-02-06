import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Linking, Text, Platform, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview'; // <--- Nuevo import
import ReactNativeBlobUtil from 'react-native-blob-util';
import * as FileSystem from 'expo-file-system';
const FileSystemLegacy = require('expo-file-system/legacy');
import * as Sharing from 'expo-sharing';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../context/ToastContext';

export default function PDFViewerScreen() {
    const { colors, spacing, typography } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const params = route.params as { url: string; title: string } | undefined;
    const url = params?.url;
    const title = params?.title;
    const [downloading, setDownloading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true); // Control manual de carga

    const source = React.useMemo(() => ({ uri: url, cache: true }), [url]);

    const [useGoogleViewer, setUseGoogleViewer] = useState(true);

    const handleDownload = async () => {
        if (!url) return;
        setDownloading(true);

        try {
            const { dirs } = ReactNativeBlobUtil.fs;
            const fileName = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'documento.pdf';
            const tempPath = `${dirs.CacheDir}/${fileName}`;

            // 1. Descargar a una ruta temporal primero
            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path: tempPath
            }).fetch('GET', url);
            
            // Prepare URI with file:// scheme
            const filePath = res.path();
            const fileUri = Platform.OS === 'android' && !filePath.startsWith('file://') 
                ? `file://${filePath}` 
                : filePath;

            // 2. Usar Intent de Compartir (iOS) o Storage Access Framework (Android)
            if (Platform.OS === 'android') {
                try {
                    const permissions = await FileSystemLegacy.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        const base64 = await ReactNativeBlobUtil.fs.readFile(filePath, 'base64');
                        const newUrl = await FileSystemLegacy.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
                        await FileSystemLegacy.writeAsStringAsync(newUrl, base64, { encoding: 'base64' });
                        showToast('Archivo guardado correctamente', 'success');
                    }
                } catch (e) {
                    console.error("SAF Error:", e);
                    showToast('No se pudo guardar el archivo', 'error');
                }
            } else {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri, {
                        dialogTitle: `Guardar ${fileName}`,
                        mimeType: 'application/pdf',
                        UTI: 'com.adobe.pdf' 
                    });
                } else {
                    showToast('Archivo descargado temporalmente', 'success');
                }
            }

        } catch (error) {
            console.error(error);
            showToast('Hubo un problema al intentar descargar', 'error');
            // Keeping Alert just for the fallback action question which is complex for a simple toast
            Alert.alert(
                "Error en la descarga",
                "¿Deseas intentar abrirlo en el navegador?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Abrir en Navegador", onPress: () => Linking.openURL(url) }
                ]
            );
        } finally {
            // Give it a moment before enabling the button again, though for Android the promise resolves quickly
            setTimeout(() => setDownloading(false), 2000);
        }
    };

    if (!url) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{
                paddingTop: insets.top + spacing(1),
                paddingBottom: spacing(1),
                paddingHorizontal: spacing(2),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
            }}>
                 <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: typography.sizes.lg }} numberOfLines={1}>
                        {title || 'Documento'}
                    </Text>
                </View>
                
                <TouchableOpacity
                    onPress={handleDownload}
                    disabled={downloading}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                        <Feather name="download" size={24} color={colors.text} />
                    )}
                </TouchableOpacity>
            </View>
            {useGoogleViewer ? (
                <View style={{ flex: 1 }}>
                     <WebView
                        source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` }}
                        style={{ flex: 1, backgroundColor: colors.background, opacity: isLoading ? 0 : 1 }}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        injectedJavaScript={`
                            const style = document.createElement('style');
                            style.innerHTML = \`
                                /* Botones específicos (Zoom, Página) - Clase del elemento 0 detectado */
                                .ndfHFb-c4YZDc-LgbsSe { display: none !important; }

                                /* Contenedor inmediato de botones - Clase del elemento 1 detectado */
                                .ndfHFb-c4YZDc-nJjxad-nK2kYb-i5oIFb { display: none !important; }
                                
                                /* Header de Google (Pop-out icon) */
                                .ndfHFb-c4YZDc-Wrql6b { display: none !important; }
                            \`;
                            document.head.appendChild(style);
                            true;
                        `}
                    />
                    {isLoading && (
                        <View style={{ 
                            position: 'absolute', 
                            top: 0, bottom: 0, left: 0, right: 0, 
                            alignItems: 'center', justifyContent: 'center', 
                            backgroundColor: colors.background 
                        }}>
                             <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                </View>
            ) : (
                <Pdf
                    trustAllCerts={false}
                    source={source}
                    fitPolicy={2}
                    minScale={1.0}
                    maxScale={4.0}
                    spacing={10}
                    enableAnnotationRendering={true}
                    onLoadComplete={(numberOfPages, filePath) => setTotalPages(numberOfPages)}
                    onPageChanged={(page, numberOfPages) => setCurrentPage(page)}
                    onPressLink={(uri) => {
                        console.log(`LINK DETECTADO: ${uri}`);
                        if (uri?.startsWith('http')) Linking.openURL(uri);
                    }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                />
            )}

            {!useGoogleViewer && totalPages > 0 && (
                <View style={{
                    position: 'absolute',
                    bottom: spacing(4) + insets.bottom,
                    alignSelf: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    paddingHorizontal: spacing(3),
                    paddingVertical: spacing(1),
                    borderRadius: 20,
                }}>
                    <Text style={{ 
                        color: '#FFFFFF', 
                        fontSize: typography.sizes.sm,
                        fontWeight: '600'
                    }}>
                        {currentPage} / {totalPages}
                    </Text>
                </View>
            )}
        </View>
    );
}
