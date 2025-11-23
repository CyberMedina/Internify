# app-pasantias

Pantalla inicial de una app de empleos (Expo + React Native + TypeScript) con navegación por pestañas, tema y datos mock.

## Ejecutar

1. Instala dependencias
2. Inicia el servidor de desarrollo y escanea el QR con Expo Go.

## Notas de diseño

- Paleta base: Primario azul/índigo `#3B44F6` con acento `#FFD166`, fondos claros, chips en `#EEF2FF`.
- Tipografía: usa la del sistema por ahora; se puede cambiar fácilmente en `src/theme/ThemeContext.tsx`.
- Componentes reutilizables: `Chip`, `AvatarGroup`, `JobCardLarge`, `JobCardSmall`.
- Secciones: "Suggested Jobs" (scroll horizontal) y "Recent Jobs" (chips de filtro + lista).
