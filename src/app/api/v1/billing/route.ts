import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('🔄 Fetching billing data from backend...');

        const response = await fetch('http://localhost:3003/v1/billing-dev', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('❌ Backend response not ok:', response.status);
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Billing data received from backend');

        return NextResponse.json(data);

    } catch (error) {
        console.error('❌ Error fetching billing data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch billing data', success: false },
            { status: 500 }
        );
    }
}