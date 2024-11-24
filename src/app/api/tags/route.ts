import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await db.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, hexColor } = body;

    if (!name || !hexColor) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const tag = await db.tag.create({
      data: {
        userId,
        name,
        hexColor,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, hexColor } = body;

    if (!id || !name || !hexColor) {
      return NextResponse.json(
        { error: 'ID, name, and color are required' },
        { status: 400 }
      );
    }

    const tag = await db.tag.update({
      where: {
        id,
        userId,
      },
      data: {
        name,
        hexColor,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    await db.tag.delete({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
