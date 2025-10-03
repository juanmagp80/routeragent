import { NextRequest, NextResponse } from 'next/server';
import { routeTask } from '../../../../controllers/routeController';

export async function POST(req: NextRequest) {
    try {
        // Validar que el content-type sea JSON
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json', success: false },
                { status: 400 }
            );
        }

        let body;
        try {
            const rawBody = await req.text();
            console.log('Raw body received:', rawBody);
            console.log('Raw body length:', rawBody.length);
            console.log('Raw body type:', typeof rawBody);

            if (!rawBody.trim()) {
                return NextResponse.json(
                    { error: 'Empty request body', success: false },
                    { status: 400 }
                );
            }

            body = JSON.parse(rawBody);
            console.log('Parsed body:', body);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
            console.error('Error message:', errorMessage);
            return NextResponse.json(
                { error: `Invalid JSON in request body: ${errorMessage}`, success: false },
                { status: 400 }
            );
        }

        // Validar que el body tenga los campos requeridos
        if (!body || typeof body.input !== 'string') {
            return NextResponse.json(
                { error: 'Missing required field: input', success: false },
                { status: 400 }
            );
        }

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