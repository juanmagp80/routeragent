# Pasos para Arreglar el Error OAuth "redirect_uri_mismatch"

## 1. Verificar la URL actual de la aplicación
Tu aplicación está corriendo en: **http://localhost:3000**

## 2. Configurar Google OAuth Console

### Paso A: Ir a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a "APIs & Services" > "Credentials"

### Paso B: Configurar OAuth 2.0 Client ID
1. Encuentra tu OAuth 2.0 Client ID (o crea uno nuevo si no existe)
2. Haz clic en editar (ícono de lápiz)
3. En "Authorized redirect URIs" DEBE incluir:
   ```
   https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback
   ```

### Paso C: URLs autorizadas para desarrollo local
También agrega estas URLs para desarrollo local:
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

## 3. Configurar Supabase Dashboard

### Paso A: Ir a Supabase Dashboard
1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto: `jmfegokyvaflwegtyaun`
3. Ve a "Authentication" > "Providers"

### Paso B: Configurar Google Provider
1. Habilita "Google" en la lista de proveedores
2. Ingresa las credenciales de Google:
   - **Client ID**: (del Google Cloud Console)
   - **Client Secret**: (del Google Cloud Console)

### Paso C: Configurar Site URL
1. Ve a "Authentication" > "Settings"
2. En "Site URL" debe estar: `http://localhost:3000`
3. En "Redirect URLs" agrega:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```

## 4. Variables de Entorno Requeridas

Verifica que tu `.env.local` tenga:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jmfegokyvaflwegtyaun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[tu_service_role_key]
```

## 5. Configuración de GitHub OAuth (Similar)

Para GitHub:
1. Ve a GitHub Settings > Developer settings > OAuth Apps
2. Crea una nueva OAuth App o edita la existente
3. **Authorization callback URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`

## 6. Reiniciar y Probar

Después de hacer estos cambios:
1. Reinicia el servidor de desarrollo
2. Prueba el login de Google nuevamente
3. La URL debe redirigir correctamente

## URLs Importantes para Referencia:
- **Aplicación Local**: http://localhost:3000
- **Supabase URL**: https://jmfegokyvaflwegtyaun.supabase.co
- **OAuth Callback**: https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback