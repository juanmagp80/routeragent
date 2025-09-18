// Script para debug de sesión en consola del navegador
// Copia y pega esto en la consola del navegador después del login

console.log('🔍 DEBUGGING SESIÓN SUPABASE');

// Verificar sesión actual
const { supabase } = window;
if (!supabase) {
    console.log('❌ Supabase no está disponible en window');
} else {
    console.log('✅ Supabase disponible');
    
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error('❌ Error obteniendo sesión:', error);
        } else if (session) {
            console.log('✅ Sesión activa encontrada:');
            console.log('- Usuario:', session.user.email);
            console.log('- Token expira:', new Date(session.expires_at * 1000));
            console.log('- Sesión completa:', session);
        } else {
            console.log('❌ No hay sesión activa');
        }
    });
    
    // Verificar usuario actual
    supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error) {
            console.error('❌ Error obteniendo usuario:', error);
        } else if (user) {
            console.log('✅ Usuario autenticado:');
            console.log('- Email:', user.email);
            console.log('- ID:', user.id);
            console.log('- Email confirmado:', user.email_confirmed_at);
            console.log('- Usuario completo:', user);
        } else {
            console.log('❌ No hay usuario autenticado');
        }
    });
}

// Verificar localStorage
console.log('🔍 LocalStorage Supabase:');
Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase')) {
        console.log(`- ${key}:`, localStorage.getItem(key));
    }
});

// Verificar cookies
console.log('🔍 Cookies:');
console.log(document.cookie);
