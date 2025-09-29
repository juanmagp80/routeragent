import { NextRequest, NextResponse } from 'next/server';

export async function PUT() {
    try {
        const response = await fetch('http://localhost:3003/v1/notifications/read-all', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all notifications as read', success: false },
            { status: 500 }
        );
    }
}