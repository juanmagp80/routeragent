import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        console.log('🔍 Investigando estructura de api_keys...');

        // 1. Ver estructura de la tabla api_keys
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'api_keys')
            .eq('table_schema', 'public');

        // 2. Ver un registro de ejemplo para conocer los campos
        const { data: sampleRecord, error: sampleError } = await supabase
            .from('api_keys')
            .select('*')
            .limit(1)
            .single();

        // 3. Ver todos los registros para entender la estructura 
        const { data: allRecords, error: allError } = await supabase
            .from('api_keys')
            .select('*')
            .limit(5);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            table_structure: {
                columns: columns,
                error: columnsError?.message
            },
            sample_record: {
                data: sampleRecord,
                error: sampleError?.message,
                available_fields: sampleRecord ? Object.keys(sampleRecord) : []
            },
            all_records: {
                data: allRecords,
                error: allError?.message,
                count: allRecords?.length || 0
            }
        });

    } catch (error) {
        console.error('💥 Error en inspect-apikeys:', error);
        return NextResponse.json({
            error: 'Error inspeccionando tabla',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}