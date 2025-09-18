## 📧 CONFIGURACIÓN DE EMAIL EN SUPABASE

Para que la verificación de email funcione correctamente, necesitas configurar la URL de confirmación en Supabase:

### 1. Ve a tu Dashboard de Supabase
https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun

### 2. Navega a Authentication > URL Configuration
O ve directamente a:
https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun/auth/url-configuration

### 3. Configura las siguientes URLs:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (una por línea):**
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/login
http://localhost:3000/user
```

### 4. Configurar Email Templates (Opcional)
Ve a Authentication > Email Templates para personalizar:
- Confirm signup
- Magic Link
- Reset Password

### 5. Verificar configuración SMTP
Ve a Authentication > Settings y verifica que SMTP esté configurado.

### 🧪 PRUEBA EL FLUJO:

1. **Registrarse** → Email de verificación enviado
2. **Hacer clic en el link** del email → Redirección a /login
3. **Iniciar sesión** → Acceso exitoso

### 🐛 DEBUGGING:

Si sigues teniendo problemas:

1. **Verifica en Auth > Users** que el usuario aparezca
2. **Checa el status** de `email_confirmed_at`
3. **Revisa Auth > Logs** para ver errores específicos
