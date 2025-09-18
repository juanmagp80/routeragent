## 🔍 DEBUGGING DEL LOGIN

### Para verificar el estado de tu cuenta:

1. **Abre la consola del navegador** (F12)
2. **Pega este código** para verificar el estado:

```javascript
// Verificar sesión actual
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Sesión actual:', data, error);
});

// Verificar usuario actual
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Usuario actual:', data, error);
});

// Verificar si hay usuario en la tabla users
supabase.from('users').select('*').then(({ data, error }) => {
  console.log('Usuarios en tabla:', data, error);
});
```

### 📧 Verificar Email:

1. **Ve a tu email** y busca el mensaje de AgentRouter
2. **Haz clic en el link** de verificación
3. **Verifica que te redirija** a la aplicación

### 🔄 Si el email no llega:

1. **Revisa spam/promociones**
2. **Usa el botón "Reenviar"** en la página de login
3. **Verifica en Supabase Dashboard** > Auth > Users que el usuario existe

### 🐛 Para debug avanzado:

```javascript
// Forzar login sin verificar email (solo para testing)
supabase.auth.signInWithPassword({
  email: 'tu-email@example.com',
  password: 'tu-contraseña'
}).then(result => {
  console.log('Login forzado:', result);
});
```
