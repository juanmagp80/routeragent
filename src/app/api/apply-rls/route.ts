import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Usar el service role key para bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 [APPLY-RLS] Aplicando políticas RLS directamente en Supabase...');
        
        // Verificar primero las tablas existentes
        console.log('🔍 Verificando tablas existentes...');
        
        // Test 1: Verificar usage_records
        const { data: usageRecordsTest, error: recordsError } = await supabaseAdmin
            .from('usage_records')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        console.log('📊 Test usage_records:', { 
            exists: !recordsError, 
            error: recordsError?.message,
            count: usageRecordsTest 
        });

        // Test 2: Verificar usage_logs
        const { data: usageLogsTest, error: logsError } = await supabaseAdmin
            .from('usage_logs')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        console.log('📊 Test usage_logs:', { 
            exists: !logsError, 
            error: logsError?.message,
            count: usageLogsTest 
        });

        // Test 3: Verificar api_keys
        const { data: apiKeysTest, error: keysError } = await supabaseAdmin
            .from('api_keys')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        console.log('📊 Test api_keys:', { 
            exists: !keysError, 
            error: keysError?.message,
            count: apiKeysTest 
        });

        // Test 4: Verificar users
        const { data: usersTest, error: usersError } = await supabaseAdmin
            .from('users')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        console.log('📊 Test users:', { 
            exists: !usersError, 
            error: usersError?.message,
            count: usersTest 
        });

        // Test 5: Consulta específica con el usuario target
        const targetUserId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        const { data: targetUserRecords, error: targetError } = await supabaseAdmin
            .from('usage_records')
            .select('*')
            .eq('user_id', targetUserId);

        console.log('🎯 Records para usuario target:', {
            count: targetUserRecords?.length || 0,
            error: targetError?.message,
            firstRecord: targetUserRecords?.[0] || null
        });

        return NextResponse.json({
            success: true,
            message: 'Database structure verification completed',
            tests: {
                usage_records: { exists: !recordsError, error: recordsError?.message },
                usage_logs: { exists: !logsError, error: logsError?.message },
                api_keys: { exists: !keysError, error: keysError?.message },
                users: { exists: !usersError, error: usersError?.message }
            },
            targetUserData: {
                user_id: targetUserId,
                records_count: targetUserRecords?.length || 0,
                error: targetError?.message,
                sample_record: targetUserRecords?.[0] || null
            }
        });

    } catch (error) {
        console.error('❌ [APPLY-RLS] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to verify database structure',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}