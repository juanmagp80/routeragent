import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../config/database';

export async function GET(request: NextRequest) {
    try {
        const userId = '761ce82d-0f07-4f70-9b63-987a668b0907';
        
        console.log('🧪 Testing RLS with normal client...');
        
        // Test 1: Query users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        // Test 2: Query api_keys table
        const { data: apiKeysData, error: apiKeysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId);
        
        // Test 3: Query usage_logs table
        const { data: usageData, error: usageError } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .limit(5);

        return NextResponse.json({
            rls_test_results: {
                users_query: {
                    success: !userError,
                    error: userError,
                    data: userData,
                    row_count: userData ? 1 : 0
                },
                api_keys_query: {
                    success: !apiKeysError,
                    error: apiKeysError,
                    data: apiKeysData,
                    row_count: apiKeysData?.length || 0
                },
                usage_logs_query: {
                    success: !usageError,
                    error: usageError,
                    data: usageData,
                    row_count: usageData?.length || 0
                }
            },
            overall_status: {
                all_queries_successful: !userError && !apiKeysError && !usageError,
                rls_working: !userError && !apiKeysError && !usageError ? 'YES' : 'NO',
                next_step: !userError && !apiKeysError && !usageError 
                    ? 'Dashboard should work now - refresh the page' 
                    : 'RLS policies need adjustment'
            }
        });

    } catch (error) {
        console.error('❌ Error en test-rls:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            details: error 
        });
    }
}