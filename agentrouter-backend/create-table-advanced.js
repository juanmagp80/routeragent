const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

async function createTableWithRest() {
    try {
        console.log('🌐 Intentando crear tabla usando REST API...');
        
        const response = await fetch('https://jmfegokyvaflwegtyaun.supabase.co/rest/v1/rpc/exec_sql', {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                sql: `
                CREATE TABLE IF NOT EXISTS public.notifications (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    data JSONB DEFAULT '{}',
                    is_read BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                `
            })
        });
        
        if (response.ok) {
            console.log('✅ Tabla creada exitosamente');
        } else {
            const error = await response.text();
            console.log('❌ Error con REST:', error);
            
            // Alternativa: crear registros directamente para "forzar" la tabla
            console.log('🔄 Intentando método alternativo...');
            await createTableAlternative();
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        await createTableAlternative();
    }
}

async function createTableAlternative() {
    console.log('📊 Creando tabla mediante inserción directa...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Intentar insertar un registro de prueba para crear la tabla automáticamente
        const { data, error } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: '00000000-0000-0000-0000-000000000000',
                    type: 'system',
                    title: 'Tabla creada',
                    message: 'La tabla de notificaciones ha sido creada exitosamente',
                    data: { test: true }
                }
            ])
            .select();
            
        if (error) {
            console.log('❌ Error al insertar:', error.message);
            console.log('💡 Por favor, ejecuta manualmente este SQL en el Dashboard de Supabase:');
            console.log(`
🔗 Ve a: https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun/editor

📋 SQL a ejecutar:
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

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
            `);
        } else {
            console.log('✅ Tabla creada e inicializada:', data);
        }
        
    } catch (err) {
        console.error('❌ Error en método alternativo:', err.message);
    }
}

createTableWithRest();