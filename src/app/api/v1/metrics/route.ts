import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '../../../../controllers/routeController';

export async function GET(req: NextRequest) {
    try {
        // Crear objetos mock para req y res
        const mockReq = {
            body: {},
            headers: req.headers,
            query: {},
            params: {}
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

        // Llamar al controlador
        await getMetrics(mockReq, mockRes);

        // Devolver la respuesta
        return NextResponse.json(mockRes.jsonData, { status: mockRes.statusCode });

    } catch (error) {
        console.error('API metrics error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}