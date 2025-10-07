import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';

export async function GET() {
    try {
        console.log('🔍 [SCHEMA-CHECK] Verificando esquema de usage_logs...');
        
        // Intentar obtener un registro de la tabla para ver las columnas
        const { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ [SCHEMA-CHECK] Error:', error);
            return NextResponse.json({
                error: 'Error consultando tabla',
                details: error.message,
                suggestion: 'La tabla usage_logs podría no existir'
            });
        }

        // Si hay datos, mostrar las columnas
        if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            return NextResponse.json({
                success: true,
                table: 'usage_logs',
                columns_found: columns,
                sample_record: data[0],
                message: 'Tabla existe y tiene datos'
            });
        } else {
            // Si no hay datos, intentar insertar un registro mínimo para ver qué columnas acepta
            return NextResponse.json({
                success: true,
                table: 'usage_logs',
                message: 'Tabla existe pero está vacía',
                suggestion: 'Necesitamos ver qué columnas acepta'
            });
        }

    } catch (error) {
        console.error('💥 [SCHEMA-CHECK] Error general:', error);
        return NextResponse.json({
            error: 'Error verificando esquema',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}