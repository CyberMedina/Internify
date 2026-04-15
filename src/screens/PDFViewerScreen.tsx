import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Linking, Text, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
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
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const { showToast } = useToast();

    const source = React.useMemo(() => ({ uri: url, cache: true }), [url]);

    const handleDownload = async () => {
        if (!url) return;
        setDownloading(true);

        try {
            const { dirs } = ReactNativeBlobUtil.fs;
            const fileName = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'documento.pdf';
            const tempPath = `${dirs.CacheDir}/${fileName}`;

            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path: tempPath
            }).fetch('GET', url);
            
            const filePath = res.path();
            const fileUri = Platform.OS === 'android' && !filePath.startsWith('file://') 
                ? `file://${filePath}` 
                : filePath;

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
            Alert.alert(
                "Error en la descarga",
                "¿Deseas intentar abrirlo en el navegador?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Abrir en Navegador", onPress: () => Linking.openURL(url!) }
                ]
            );
        } finally {
            setTimeout(() => setDownloading(false), 2000);
        }
    };

    if (!url) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.card }}>
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

            {/* PDF Viewer */}
            <View style={{ flex: 1 }}>
                <Pdf
                    trustAllCerts={false}
                    source={source}
                    fitPolicy={0}
                    horizontal={false}
                    scale={1.0}
                    minScale={1.0}
                    maxScale={4.0}
                    spacing={0}
                    enablePaging={false}
                    enableAnnotationRendering={true}
                    onLoadComplete={(numberOfPages) => {
                        setTotalPages(numberOfPages);
                        setIsLoading(false);
                    }}
                    onPageChanged={(page) => setCurrentPage(page)}
                    onError={(error) => {
                        console.error(error);
                        setIsLoading(false);
                        setLoadError(true);
                    }}
                    onPressLink={(uri) => {
                        if (uri?.startsWith('http')) Linking.openURL(uri);
                    }}
                    style={{ flex: 1, backgroundColor: colors.card }}
                />

                {/* Loader / Error overlay */}
                {(isLoading || loadError) && (
                    <View style={{
                        position: 'absolute',
                        top: 0, bottom: 0, left: 0, right: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.card,
                    }}>
                        {loadError ? (
                            <View style={{ alignItems: 'center', gap: 12 }}>
                                <Feather name="alert-circle" size={40} color={colors.textSecondary} />
                                <Text style={{ color: colors.textSecondary, fontSize: 15 }}>No se pudo cargar el documento</Text>
                                <TouchableOpacity onPress={() => Linking.openURL(url!)} style={{ marginTop: 4 }}>
                                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Abrir en navegador</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ActivityIndicator size="large" color={colors.primary} />
                        )}
                    </View>
                )}
            </View>

            {/* Page counter */}
            {totalPages > 0 && (
                <View style={{
                    position: 'absolute',
                    bottom: spacing(4) + insets.bottom,
                    alignSelf: 'center',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingHorizontal: spacing(3),
                    paddingVertical: spacing(1),
                    borderRadius: 20,
                }}>
                    <Text style={{ color: '#FFF', fontSize: typography.sizes.sm, fontWeight: '600' }}>
                        {currentPage} / {totalPages}
                    </Text>
                </View>
            )}
        </View>
    );
}
