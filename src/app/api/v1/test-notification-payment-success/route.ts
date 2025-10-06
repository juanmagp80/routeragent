import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3002'}/v1/test-notification-payment-success`, {
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
        console.error('Error testing payment notification:', error);
        return NextResponse.json(
            { error: 'Error al probar notificación de pago', success: false },
            { status: 500 }
        );
    }
}