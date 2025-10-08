import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Usar el service role key para bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
        console.log('� [CHECK-TABLES] Verificando tablas existentes...');

        // Verificar qué tablas existen
        const { data: tables, error: tablesError } = await supabaseAdmin
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['usage_logs', 'usage_records']);

        if (tablesError) {
            console.error('❌ Error consultando tablas:', tablesError);
        }

        console.log('📋 Tablas encontradas:', tables);

        // Probar consulta directa a usage_records
        const { data: usageRecordsTest, error: recordsError } = await supabaseAdmin
            .from('usage_records')
            .select('*')
            .limit(1);

        // Probar consulta directa a usage_logs
        const { data: usageLogsTest, error: logsError } = await supabaseAdmin
            .from('usage_logs')
            .select('*')
            .limit(1);

        return NextResponse.json({
            success: true,
            tables: tables || [],
            usage_records: {
                exists: !recordsError,
                error: recordsError?.message || null,
                sample_count: usageRecordsTest?.length || 0
            },
            usage_logs: {
                exists: !logsError,
                error: logsError?.message || null,
                sample_count: usageLogsTest?.length || 0
            }
        });

    } catch (error) {
        console.error('❌ [CHECK-TABLES] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check tables',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}