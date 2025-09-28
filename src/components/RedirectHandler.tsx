"use client";

import { useEffect } from 'react';
import { checkPendingRedirect } from '../utils/redirect';

export default function RedirectHandler() {
  useEffect(() => {
    // Verificar redirecciones pendientes al montar - TEMPORALMENTE DESACTIVADO
    // checkPendingRedirect();
  }, []);

  return null; // No renderiza nada
}
