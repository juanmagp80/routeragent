// Utility para redirecciones robustas
"use client";

export const robustRedirect = (url: string, delay: number = 500) => {
  console.log(`🔄 Iniciando redirección robusta a ${url}`);
  
  // Solo usar localStorage en el cliente
  if (typeof window !== 'undefined') {
    // Guardar en localStorage para persistir a través de HMR
    localStorage.setItem('pendingRedirect', url);
    localStorage.setItem('redirectTimestamp', Date.now().toString());
  }
  
  // Múltiples métodos de redirección
  setTimeout(() => {
    console.log(`🚀 Ejecutando redirección inmediata a ${url}`);
    if (typeof window !== 'undefined') {
      window.location.replace(url);
    }
  }, delay);
  
  // Backup con href
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== url) {
      console.log(`🔄 Backup: redirigiendo con href a ${url}`);
      window.location.href = url;
    }
  }, delay + 200);
  
  // Último recurso
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== url) {
      console.log(`⚡ Último recurso: forzando redirección a ${url}`);
      window.location.assign(url);
    }
  }, delay + 500);
};

// Verificar si hay redirecciones pendientes al cargar
export const checkPendingRedirect = () => {
  if (typeof window === 'undefined') return;
  
  const pendingRedirect = localStorage.getItem('pendingRedirect');
  const timestamp = localStorage.getItem('redirectTimestamp');
  
  if (pendingRedirect && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    // Si la redirección es reciente (menos de 5 segundos)
    if (age < 5000 && window.location.pathname !== pendingRedirect) {
      console.log(`🔍 Encontrada redirección pendiente a ${pendingRedirect}`);
      localStorage.removeItem('pendingRedirect');
      localStorage.removeItem('redirectTimestamp');
      robustRedirect(pendingRedirect, 100);
    } else {
      // Limpiar si es muy antigua
      localStorage.removeItem('pendingRedirect');
      localStorage.removeItem('redirectTimestamp');
    }
  }
};

// Limpiar redirección cuando se complete
export const clearPendingRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pendingRedirect');
    localStorage.removeItem('redirectTimestamp');
  }
};
