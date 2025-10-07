# 🧪 Guía para Probar la Actividad del Dashboard

Esta guía te ayudará a generar datos de actividad para probar que el dashboard principal muestre correctamente:

- ✅ **Actividad reciente** de las llamadas a la API
- ⏱️ **Tiempo promedio** de respuesta 
- 💰 **Costos** y métricas de uso
- 📊 **Estadísticas** del usuario

## 📋 Prerequisitos

1. **Usuario autenticado**: Debes estar logueado en el dashboard
2. **API Key creada**: Necesitas al menos una API key activa
3. **Base de datos configurada**: Las tablas `users`, `api_keys`, y `usage_logs` deben existir

## 🚀 Métodos para Generar Actividad de Prueba

### Método 1: Datos SQL Directos (Rápido)

Ejecuta este script en el SQL Editor de Supabase para crear datos instantáneamente:

```bash
# 1. Ve a tu dashboard de Supabase
# 2. Abre SQL Editor
# 3. Ejecuta el archivo: auto-create-test-data.sql
```

**Ventajas**: Instantáneo, muchos datos de una vez
**Desventajas**: Datos sintéticos, no prueba la API real

### Método 2: Script de Node.js (Recomendado)

Usa el script automatizado para hacer llamadas reales:

```bash
# 1. Obtén tu API key del dashboard (/admin/keys)
# 2. Ejecuta el script
node generate-test-activity.js ak_test_tu_api_key_aqui 8

# Ejemplo con parámetros:
node generate-test-activity.js ak_test_abc123def456 10
```

**Ventajas**: Datos reales, prueba toda la pipeline
**Desventajas**: Más lento, requiere API key funcionando

### Método 3: Interface Web Interactiva

Usa la nueva página de generación de actividad:

```bash
# 1. Ve a http://localhost:3000/admin/test-activity
# 2. Introduce tu API key
# 3. Haz clic en "Generar 5 llamadas de prueba"
```

**Ventajas**: Visual, fácil de usar, tiempo real
**Desventajas**: Requiere interfaz web

## 📊 Verificar los Resultados

### 1. Dashboard Principal

Ve a `http://localhost:3000/admin` y verifica:

- **Actividad Reciente**: Debería mostrar las últimas llamadas
- **Métricas**: Costos, número de requests, tiempo promedio
- **Gráficos**: Si están configurados, deberían mostrar datos

### 2. Base de Datos

Verifica los datos directamente en Supabase:

```sql
-- Ver actividad reciente del usuario
SELECT 
  task_type,
  model_used,
  cost,
  processing_time_ms,
  status,
  created_at
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id 
WHERE u.email = 'tu_email@gmail.com'
ORDER BY created_at DESC
LIMIT 10;

-- Ver estadísticas del usuario
SELECT 
  COUNT(*) as total_requests,
  SUM(cost) as total_cost,
  AVG(processing_time_ms) as avg_time,
  COUNT(DISTINCT model_used) as models_used
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id 
WHERE u.email = 'tu_email@gmail.com';
```

### 3. Logs de Consola

Revisa la consola del navegador para ver:

```
📊 Obteniendo métricas para usuario: [user_id]
✅ Real metrics loaded: { userMetrics, userStats }
```

## 🐛 Troubleshooting

### El dashboard no muestra actividad

1. **Verifica que el usuario no sea "nuevo"**:
   ```sql
   SELECT created_at, (NOW() - created_at) < INTERVAL '24 hours' as is_new
   FROM users WHERE email = 'tu_email@gmail.com';
   ```

2. **Verifica que existan API keys**:
   ```sql
   SELECT COUNT(*) FROM api_keys WHERE user_id = 'tu_user_id';
   ```

3. **Verifica que existan logs de uso**:
   ```sql
   SELECT COUNT(*) FROM usage_logs WHERE user_id = 'tu_user_id';
   ```

### Los datos no se actualizan

1. **Refresca la página** del dashboard
2. **Verifica en base de datos** que los datos se insertaron
3. **Revisa la consola** para errores de JavaScript

### Error de API Key

1. **Verifica que la API key existe**:
   ```sql
   SELECT * FROM api_keys WHERE key_preview LIKE 'ak_test_%';
   ```

2. **Verifica que esté activa**:
   ```sql
   UPDATE api_keys SET is_active = true WHERE key_preview = 'tu_key_preview';
   ```

## 📈 Datos de Ejemplo Generados

El script generará datos variados como:

- **Tipos de tarea**: general, translation, code-generation, analysis, etc.
- **Modelos**: gpt-4o, gpt-4o-mini, claude-3.5-sonnet, claude-3-haiku
- **Costos**: Entre $0.003 y $0.045 por llamada
- **Tiempos**: Entre 600ms y 3400ms
- **Estados**: completed, failed, processing

## 🎯 Objetivos de la Prueba

Después de generar actividad, deberías ver:

1. **Dashboard actualizado** con métricas reales
2. **Actividad reciente** mostrando las últimas llamadas
3. **Tiempo promedio** calculado correctamente
4. **Costos totales** sumando todas las llamadas
5. **Gráficos y estadísticas** funcionando

## 💡 Tips

- **Genera al menos 10 llamadas** para ver mejor los promedios
- **Usa diferentes tipos de tareas** para datos más variados
- **Espera unos segundos** entre llamadas para simular uso real
- **Verifica en tiempo real** abriendo el dashboard mientras generas datos

¡Listo para probar! 🚀