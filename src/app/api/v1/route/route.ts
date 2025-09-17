import { NextRequest, NextResponse } from 'next/server';
import { routeTask } from '../../../../controllers/routeController';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Crear objetos mock para req y res
        const mockReq = {
            body: body,
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
        await routeTask(mockReq, mockRes);

        // Devolver la respuesta
        return NextResponse.json(mockRes.jsonData, { status: mockRes.statusCode });

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}