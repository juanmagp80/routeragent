import { createClient } from '@supabase/supabase-js';

// Configuración de conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'your-supabase-key';

console.log('🔗 Backend Supabase config:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    keySource: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : process.env.SUPABASE_KEY ? 'SUPABASE_KEY' : 'default'
});

export const supabase = createClient(supabaseUrl, supabaseKey);