import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        console.log('🔍 Investigando API keys directamente...');

        // 1. Ver todas las tablas disponibles para confirmar nombres
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_table_names');

        // 2. Consulta directa a api_keys
        const { data: apiKeys, error: apiKeysError } = await supabase
            .from('api_keys')
            .select('*')
            .limit(10);

        console.log('📋 Resultado api_keys:', { apiKeys, apiKeysError });

        // 3. Consulta alternativa por si el nombre de tabla es diferente
        const { data: keys, error: keysError } = await supabase
            .from('keys')
            .select('*')
            .limit(5);

        // 4. Verificar si existe una tabla llamada apikeys (sin guión)
        const { data: apikeys, error: apikeysError } = await supabase
            .from('apikeys')
            .select('*')
            .limit(5);

        // 5. Ver la estructura de la base de datos
        const { data: structure, error: structureError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .limit(20);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            api_keys_query: {
                data: apiKeys,
                error: apiKeysError?.message,
                count: apiKeys?.length || 0
            },
            alternative_keys: {
                data: keys,
                error: keysError?.message
            },
            alternative_apikeys: {
                data: apikeys,
                error: apikeysError?.message
            },
            database_tables: {
                data: structure,
                error: structureError?.message
            },
            debug_info: {
                supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
                service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
            }
        });

    } catch (error) {
        console.error('💥 Error en direct-apikeys:', error);
        return NextResponse.json({ 
            error: 'Error en consulta directa',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}