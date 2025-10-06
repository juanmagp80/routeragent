import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const notificationId = params.id;

        const response = await fetch(`http://localhost:3002/v1/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read', success: false },
            { status: 500 }
        );
    }
}