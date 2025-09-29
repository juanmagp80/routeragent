# Página de Prueba de API Keys - Documentación

## Descripción
La nueva página "Prueba API" (`/admin/test-api`) permite a los usuarios probar sus API keys directamente desde el dashboard del SaaS sin necesidad de usar endpoints externos.

## Características Principales

### 🔑 **Gestión de API Keys**
- **Referencia de keys**: Muestra todas las API keys disponibles con sus nombres, prefijos y contadores de uso
- **Enlace directo**: Botón para ir directamente a la gestión de API keys
- **Campo seguro**: Input tipo password para ingresar la API key completa

### 🧪 **Sistema de Pruebas**
- **Prompts personalizados**: Campo de texto libre para escribir cualquier prompt
- **Tipos de tarea**: Selector con 6 tipos predefinidos:
  - Preguntas y Respuestas
  - Generación de Contenido  
  - Análisis
  - Traducción
  - Programación
  - Resumen

- **Prioridades**: Selector con 3 opciones:
  - Costo (Más económico)
  - Velocidad (Más rápido)
  - Calidad (Mejor resultado)

### 📝 **Ejemplos Predefinidos**
- **4 ejemplos listos**: Botones para cargar prompts de ejemplo
- **Un clic**: Cada ejemplo configura automáticamente el prompt, tipo y prioridad

### 📊 **Visualización de Resultados**
- **Estado visual**: Indicadores de éxito/error con iconos de colores
- **Métricas destacadas**: Modelo seleccionado, costo y proveedor en tarjetas destacadas
- **Uso actualizado**: Muestra el uso actual de requests después de cada prueba
- **JSON completo**: Vista completa de la respuesta de la API en formato JSON
- **Botón copiar**: Para copiar fácilmente la respuesta completa

### 🛡️ **Seguridad y Límites**
- **Validación de formato**: Verifica que la API key comience con "ar_"
- **Límites reales**: Cada prueba cuenta como uso real y se descuenta del límite
- **Información clara**: Instrucciones sobre dónde encontrar API keys completas

## Flujo de Uso

1. **Navegar**: Ir a "Prueba API" desde el sidebar
2. **Obtener API key**: Crear una nueva en "Claves API" (se muestra una sola vez)
3. **Configurar prueba**: 
   - Pegar la API key completa
   - Escribir un prompt o usar un ejemplo
   - Seleccionar tipo de tarea y prioridad
4. **Ejecutar**: Hacer clic en "Probar API Key"
5. **Revisar resultados**: Ver respuesta, métricas y uso actualizado

## Casos de Uso

### ✅ **Para Desarrolladores**
- Probar diferentes tipos de prompts sin configurar el cliente
- Verificar que las API keys funcionan correctamente
- Entender los costos antes de implementar en producción

### ✅ **Para Administradores**
- Validar el funcionamiento del sistema de límites
- Probar diferentes prioridades (costo vs calidad vs velocidad)
- Verificar el comportamiento cuando se alcanzan los límites

### ✅ **Para Testing**
- Hacer pruebas rápidas de funcionalidad
- Verificar que el router selecciona modelos apropiados
- Comprobar el sistema de billing y conteo de uso

## Beneficios

1. **Conveniente**: No necesita configurar clientes externos
2. **Seguro**: Maneja API keys de forma segura
3. **Educativo**: Muestra cómo funciona internamente el router
4. **Debugging**: Facilita identificar problemas de configuración
5. **Transparente**: Muestra costos y decisiones del router en tiempo real

## Integración con el Sistema

- **Conecta con backend**: Usa el endpoint `/v1/route` real del backend
- **Actualiza métricas**: El uso se refleja inmediatamente en la dashboard
- **Respeta límites**: Se bloquea cuando se alcanza el límite del plan
- **Navegación integrada**: Enlace directo a gestión de API keys

Esta página convierte el dashboard en una herramienta completa de testing y gestión, eliminando la necesidad de herramientas externas para probar las API keys.