import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.account.findMany({
      where: { userId },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        audience: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle social media account connection
    // This will be implemented with specific provider logic

    return NextResponse.json({ message: 'Account connected successfully' });
  } catch (error) {
    console.error('Error connecting account:', error);
    return NextResponse.json(
      { error: 'Failed to connect account' },
      { status: 500 }
    );
  }
}
