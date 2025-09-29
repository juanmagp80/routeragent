const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jmfegokyvaflwegtyaun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationsTable() {
    try {
        console.log('🔍 Verificando tabla notifications...');

        // 1. Verificar si la tabla existe
        const { data: existing, error: selectError } = await supabase
            .from('notifications')
            .select('*')
            .limit(1);

        if (selectError) {
            console.log('❌ La tabla aún no existe:', selectError.message);
            return;
        }

        console.log('✅ Tabla existe. Datos actuales:', existing?.length || 0, 'registros');

        // 2. Insertar notificación de prueba
        const { data: inserted, error: insertError } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: '12345678-1234-1234-1234-123456789000',
                    type: 'test',
                    title: 'Notificación de Prueba',
                    message: 'Esta es una notificación de prueba para verificar el sistema',
                    data: { source: 'test_script', timestamp: new Date().toISOString() }
                }
            ])
            .select();

        if (insertError) {
            console.log('❌ Error al insertar:', insertError.message);
            return;
        }

        console.log('✅ Notificación de prueba creada:', inserted);

        // 3. Verificar que se puede leer
        const { data: testRead, error: readError } = await supabase
            .from('notifications')
            .select('*')
            .eq('type', 'test')
            .order('created_at', { ascending: false })
            .limit(1);

        if (readError) {
            console.log('❌ Error al leer:', readError.message);
            return;
        }

        console.log('✅ Notificación leída correctamente:', testRead[0]);

        // 4. Probar marcar como leída
        if (testRead[0]) {
            const { data: updated, error: updateError } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', testRead[0].id)
                .select();

            if (updateError) {
                console.log('❌ Error al actualizar:', updateError.message);
                return;
            }

            console.log('✅ Notificación marcada como leída:', updated[0]);
        }

        console.log('\n🎉 ¡ÉXITO! La tabla notifications funciona correctamente');
        console.log('🚀 Ahora puedes probar el sistema completo de notificaciones');

    } catch (err) {
        console.error('❌ Error general:', err.message);
    }
}

testNotificationsTable();