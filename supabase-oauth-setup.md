# Configuración de OAuth en Supabase

## 1. Configurar GitHub OAuth

### En GitHub:
1. Ve a GitHub → Settings → Developer settings → OAuth Apps
2. Crea una nueva OAuth App con estos datos:
   - **Application name**: RouterAI
   - **Homepage URL**: `https://tu-dominio.com` (o `http://localhost:3000` para desarrollo)
   - **Authorization callback URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`
3. Anota el **Client ID** y **Client Secret**

### En Supabase:
1. Ve a tu dashboard de Supabase → Authentication → Providers
2. Habilita GitHub
3. Introduce:
   - **Client ID**: (el de GitHub)
   - **Client Secret**: (el de GitHub)
   - **Redirect URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback` (ya debe estar ahí)

## 2. Configurar Google OAuth

### En Google Cloud Console:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google+ o Google Identity
4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configura:
   - **Application type**: Web application
   - **Name**: RouterAI
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**: 
     - `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`
6. Anota el **Client ID** y **Client Secret**

### En Supabase:
1. Ve a tu dashboard de Supabase → Authentication → Providers
2. Habilita Google
3. Introduce:
   - **Client ID**: (el de Google)
   - **Client Secret**: (el de Google)
   - **Redirect URL**: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback` (ya debe estar ahí)

## 3. Configurar URLs de redirección

En Supabase → Authentication → URL Configuration:
- **Site URL**: `http://localhost:3000` (desarrollo) o `https://tu-dominio.com` (producción)
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `https://tu-dominio.com/auth/callback`

## 4. Probar la configuración

1. Inicia el proyecto: `npm run dev`
2. Ve a `/login` o `/register`
3. Haz clic en "GitHub" o "Google"
4. Deberías ser redirigido al proveedor
5. Después de autorizar, deberías volver a `/auth/callback` y luego a `/admin`

## 5. Manejo de usuarios OAuth

Los usuarios que se registren vía OAuth:
- Se crearán automáticamente en la tabla `auth.users`
- Pueden necesitar ser sincronizados con tu tabla `users` personalizada
- Sus emails están pre-verificados

## Troubleshooting

- **Error "popup_closed"**: El usuario cerró la ventana de autorización
- **Error "access_denied"**: El usuario rechazó la autorización  
- **Error "redirect_uri_mismatch"**: Las URLs de redirección no coinciden
- **Error "unauthorized_client"**: Client ID o Secret incorrectos

## URLs importantes:
- Supabase Auth URL: `https://jmfegokyvaflwegtyaun.supabase.co/auth/v1/callback`
- Callback de tu app: `/auth/callback`