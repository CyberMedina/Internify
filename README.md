# 🎓 Internify - Portal de Pasantías

**Internify** es una aplicación móvil desarrollada en React Native y Expo diseñada para conectar estudiantes universitarios con oportunidades de pasantías profesionales. La aplicación ofrece un ecosistema completo para que los estudiantes gestionen su perfil profesional, descubran vacantes relevantes y realicen un seguimiento detallado de sus postulaciones.

## ✨ Características Principales

### 1. 👤 Gestión de Perfil y CV
*   **Perfil Dinámico:** Creación y edición de un perfil profesional completo.
*   **Hoja de Vida Modular:** Gestión de secciones clave mediante un asistente intuitivo:
    *   **Experiencia Laboral:** Historial de cargos y empresas.
    *   **Educación:** Formación académica.
    *   **Habilidades (Skills):** Competencias técnicas.
    *   **Idiomas:** Niveles de dominio.
    *   **Certificaciones:** Credenciales obtenidas.
*   **Nivel de Perfil:** Indicador visual del nivel del estudiante (ej. Junior, Senior) basado en la completitud de su información.

### 2. 🚀 Onboarding y Bienvenida
*   Flujo guiado para nuevos usuarios.
*   Recolección inicial de datos personales y académicos.
*   **CV Wizard:** Asistente paso a paso para la construcción inicial del perfil.

### 3. 🔍 Descubrimiento de Oportunidades
*   **Dashboard Personalizado:** Algoritmo de sugerencias basado en el perfil del estudiante.
*   **Exploración por Categorías:** Navegación intuitiva por áreas profesionales.
*   **Búsqueda Avanzada:** Buscador con historial reciente y funcionalidad de "Vistos recientemente".
*   **Filtros:** Organización de vacantes por relevancia y fecha.

### 4. 📄 Postulaciones y Seguimiento
*   **Detalle de Vacante:** Información exhaustiva, adaptación visual al color de la marca y opciones para compartir.
*   **Aplicación Simplificada:** Postulación directa a ofertas.
*   **Seguimiento de Estado:** Línea de tiempo visual para ver el progreso de cada aplicación (Enviada, En revisión, Aceptada, Rechazada).
*   **Vacantes Guardadas:** Lista de favoritos para revisión posterior.

### 5. 🔔 Notificaciones y Comunicaciones
*   **Centro de Notificaciones:** Alertas sobre cambios de estado en postulaciones y nuevas oportunidades.
*   **Push Notifications:** Integración nativa para avisos importantes.

### 6. 🎨 Experiencia de Usuario (UX/UI)
*   **Modo Oscuro/Claro:** Soporte completo para temas visuales adaptable a la preferencia del sistema.
*   **Internacionalización (i18n):** Estructura preparada para múltiples idiomas (actualmente Español).
*   **Animaciones Fluidas:** Uso de `react-native-reanimated` para transiciones y micro-interacciones.

## 🛠️ Stack Tecnológico

*   **Core:** [React Native](https://reactnative.dev/) (v0.76+), [Expo](https://expo.dev/) (SDK 52).
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/).
*   **Navegación:** [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs).
*   **Estilos y UI:** `react-native-reanimated`, `expo-linear-gradient`, `react-native-safe-area-context`.
*   **Gestión de Estado:** Context API (Auth, Theme, Applications, Saved, Toast).
*   **Rendimiento:** `@shopify/flash-list` para listas de alto rendimiento.
*   **Almacenamiento Local:** `@react-native-async-storage/async-storage`.
*   **Iconos:** `@expo/vector-icons` (Feather, Ionicons, FontAwesome5).

## 📂 Estructura del Proyecto

El código fuente se encuentra en la carpeta `src/`:

```
src/
├── assets/          # Fuentes, imágenes y animaciones Lottie
├── components/      # Componentes reutilizables (Cards, Botones, Inputs)
├── context/         # Estados globales (Auth, Theme, etc.)
├── hooks/           # Custom hooks (ej. useNotifications)
├── i18n/            # Configuración de idiomas
├── mock/            # Datos de prueba estáticos
├── navigation/      # Configuración de rutas y stacks
├── screens/         # Pantallas de la aplicación
├── services/        # Capa de comunicación con API (Axios)
├── theme/           # Definición de tokens de diseño y temas
├── types/           # Definiciones de tipos TypeScript
└── utils/           # Utilidades y funciones auxiliares
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
*   Node.js (LTS recomendado)
*   npm o yarn
*   Dispositivo móvil con Expo Go o Emulador (Android/iOS)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd app-pasantias
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Ejecutar la aplicación:**
    ```bash
    npx expo start
    ```