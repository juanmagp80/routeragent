const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotificationsTable() {
    try {
        console.log('🗄️ Creando tabla notifications...');
        
        // Intentar crear una notificación de prueba para ver si la tabla existe
        const { data: testData, error: testError } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);
            
        if (testError && testError.code === 'PGRST205') {
            console.log('❌ La tabla notifications no existe. Necesita ser creada manualmente en Supabase.');
            console.log('📋 SQL para crear la tabla:');
            console.log(`
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
            `);
            
            return;
        }
        
        if (testError) {
            console.error('❌ Error inesperado:', testError);
            return;
        }
        
        console.log('✅ La tabla notifications ya existe');
        console.log('📊 Datos de prueba:', testData);
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

createNotificationsTable();