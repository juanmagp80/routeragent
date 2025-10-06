import { NextRequest, NextResponse } from 'next/server';
import { getMetricsReal } from '../../../../controllers/realMetrics';

export async function GET(req: NextRequest) {
    try {
        console.log('🔍 === API METRICS ENDPOINT ===');
        
        // Intentar obtener el usuario del header de autorización o cookie
        const authHeader = req.headers.get('authorization');
        const userIdFromHeader = req.headers.get('x-user-id');
        
        console.log('📥 Headers recibidos:', { authHeader: !!authHeader, userId: userIdFromHeader });
        
        // Crear objetos mock para req y res
        const mockReq = {
            body: {},
            headers: req.headers,
            query: Object.fromEntries(req.nextUrl.searchParams),
            params: {},
            userId: userIdFromHeader, // Pasar user ID si está disponible
            user: authHeader ? { id: userIdFromHeader } : null
        };

        let mockRes: any = {
            statusCode: 200,
            jsonData: null,
            status: function (code: number) {
                this.statusCode = code;
                return this;
            },
            json: function (data: any) {
                this.jsonData = data;
                return this;
            }
        };

        console.log('🔄 Llamando controlador de métricas reales...');
        
        // Llamar al controlador de métricas reales
        await getMetricsReal(mockReq, mockRes);

        console.log('✅ Controlador ejecutado, devolviendo respuesta');
        
        // Devolver la respuesta
        return NextResponse.json(mockRes.jsonData, { status: mockRes.statusCode });

    } catch (error) {
        console.error('💥 API metrics error:', error);
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { 
                error: 'Internal server error', 
                success: false, 
                details: error instanceof Error ? error.message : 'Error desconocido' 
            },
            { status: 500 }
        );
    }
}