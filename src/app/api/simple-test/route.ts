import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 [SIMPLE-TEST] Endpoint de prueba simple...');

        const body = await request.json();
        console.log('📝 [SIMPLE-TEST] Body recibido:', body);

        return NextResponse.json({
            success: true,
            message: 'Endpoint funcionando correctamente',
            received: body,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [SIMPLE-TEST] Error:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Simple Test API funcionando',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
}