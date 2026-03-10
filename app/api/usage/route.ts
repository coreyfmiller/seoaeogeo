import { NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/usage';

export async function GET() {
    try {
        const stats = getUsageStats();
        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
