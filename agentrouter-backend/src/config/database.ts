import { createClient } from '@supabase/supabase-js';

// Configuración de conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-key';

export const supabase = createClient(supabaseUrl, supabaseKey);