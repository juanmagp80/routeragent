# Configuración OAuth para Google y GitHub

## 1. Configurar Google OAuth

### En Google Cloud Console:
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ y Google Identity
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Tipo de aplicación: "Aplicación web"
6. Nombre: "RouterAI App"
7. **URIs de origen autorizados**:
   - `http://localhost:3001`
   - `https://jmfegokyvaflwegtyaun.supabase.co`
8. **URIs de redirección autorizados**:
   - `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`
   - `http://localhost:3001/auth/callback`

### En Supabase Dashboard:
1. Ve a Auth → Providers → Google
2. Habilita Google
3. Ingresa el Client ID y Client Secret de Google
4. **Redirect URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`

## 2. Configurar GitHub OAuth

### En GitHub:
1. Ve a GitHub → Settings → Developer settings → OAuth Apps
2. Clic en "New OAuth App"
3. **Application name**: "RouterAI App"
4. **Homepage URL**: `http://localhost:3001`
5. **Authorization callback URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`

### En Supabase Dashboard:
1. Ve a Auth → Providers → GitHub
2. Habilita GitHub  
3. Ingresa el Client ID y Client Secret de GitHub
4. **Redirect URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`

## URLs importantes:
- **Supabase Auth URL**: https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback
- **App URL**: http://localhost:3001/auth/callback
- **Dashboard Supabase**: https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun/auth/providers

## Notas:
- Asegúrate de que ambos proveedores estén **habilitados** en Supabase
- El redirect URL debe ser exactamente igual en ambos servicios
- Después de configurar, prueba el login desde http://localhost:3001/register