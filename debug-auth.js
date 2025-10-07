// Script para debug rápido del estado de autenticación
console.log('🔍 Debug del estado de autenticación');

// Verificar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Verificar localStorage
    const userInStorage = localStorage.getItem('agentrouter_user');
    console.log('📦 Usuario en localStorage:', userInStorage ? JSON.parse(userInStorage) : 'No encontrado');

    // Verificar sesión de Supabase (esto requiere que Supabase esté disponible)
    if (typeof supabase !== 'undefined') {
        supabase.auth.getSession().then(({ data, error }) => {
            console.log('🔐 Sesión de Supabase:', data?.session ? 'Activa' : 'Inactiva');
            if (data?.session) {
                console.log('👤 Usuario Supabase:', data.session.user.email);
            }
            if (error) {
                console.error('❌ Error obteniendo sesión:', error);
            }
        });
    }
} else {
    console.log('⚠️ Script ejecutándose en servidor, no en navegador');
}
