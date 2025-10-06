import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3002'}/v1/test-notification-api-key-created`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error testing API key notification:', error);
        return NextResponse.json(
            { error: 'Error al probar notificación', success: false },
            { status: 500 }
        );
    }
}