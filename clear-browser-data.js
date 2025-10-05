// Ejecuta este código en la consola del navegador para limpiar todo
// y hacer una prueba limpia del OAuth

// 1. Limpiar localStorage
localStorage.clear();

// 2. Limpiar sessionStorage
sessionStorage.clear();

// 3. Limpiar cookies (opcional)
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log("✅ Todos los datos locales limpiados");
console.log("🔄 Ahora puedes cerrar sesión en Supabase y volver a registrarte");

// Para cerrar sesión en Supabase, también puedes ejecutar:
// (async () => {
//   const { supabase } = await import('./src/config/database');
//   await supabase.auth.signOut();
//   console.log("✅ Sesión de Supabase cerrada");
// })();