import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 [TEST-SAVE] Iniciando prueba de guardado...');
        
        const body = await request.json();
        const { user_id, test_message } = body;
        
        if (!user_id) {
            return NextResponse.json({ error: 'user_id requerido' }, { status: 400 });
        }

        // Insertar un registro de prueba en usage_logs (usando columnas básicas)
        const testRecord = {
            user_id,
            cost: '0.001',
            created_at: new Date().toISOString()
        };

        console.log('💾 [TEST-SAVE] Insertando registro:', testRecord);

        const { data, error } = await supabase
            .from('usage_logs')
            .insert([testRecord])
            .select();

        if (error) {
            console.error('❌ [TEST-SAVE] Error insertando:', error);
            return NextResponse.json({ 
                error: 'Error insertando datos', 
                details: error.message 
            }, { status: 500 });
        }

        console.log('✅ [TEST-SAVE] Registro insertado exitosamente:', data);

        // Verificar que se insertó correctamente
        const { data: verifyData, error: verifyError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (verifyError) {
            console.error('⚠️ [TEST-SAVE] Error verificando:', verifyError);
        }

        return NextResponse.json({
            success: true,
            inserted: data,
            recent_logs: verifyData,
            message: 'Registro de prueba insertado correctamente'
        });

    } catch (error) {
        console.error('💥 [TEST-SAVE] Error general:', error);
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

// Método GET para probar fácilmente desde el navegador
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Test Save API funcionando',
        usage: 'POST con { user_id: "tu-user-id", test_message: "mensaje" }'
    });
}