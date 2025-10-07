import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Usar el service role key para bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function DELETE(request: NextRequest, { params }: { params: { keyId: string } }) {
    try {
        const keyId = params.keyId;

        if (!keyId || keyId === 'TU_API_KEY_ID_AQUI') {
            return NextResponse.json({
                error: 'Missing or invalid API key ID',
                success: false
            }, { status: 400 });
        }

        console.log('🗑️ [DELETE-API-KEY] Eliminando API key:', keyId);

        // Eliminar la API key usando admin privileges
        const { error: deleteError } = await supabaseAdmin
            .from('api_keys')
            .delete()
            .eq('id', keyId);

        if (deleteError) {
            console.error('❌ [DELETE-API-KEY] Error:', deleteError);
            return NextResponse.json({
                error: 'Failed to delete API key',
                details: deleteError,
                success: false
            }, { status: 500 });
        }

        console.log('✅ [DELETE-API-KEY] API key eliminada exitosamente:', keyId);

        return NextResponse.json({
            success: true,
            message: 'API key deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error en delete-api-key:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error
        }, { status: 500 });
    }
}