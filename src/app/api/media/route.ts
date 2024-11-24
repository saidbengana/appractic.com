import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure media storage
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `${uuidv4()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to disk
    const path = join('uploads', filename);
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    // Create media record in database
    const media = await db.media.create({
      data: {
        name: file.name,
        mimeType: file.type,
        path,
        size: file.size,
        sizeTotal: file.size, // Will be updated after conversions
      },
    });

    // TODO: Process media conversions asynchronously
    // This will be implemented with a media processing service

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    const media = await db.media.findMany({
      where: postId ? {
        posts: {
          some: {
            id: postId,
            userId,
          },
        },
      } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
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
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Get media details first
    const media = await db.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete file from disk
    try {
      const filePath = join(UPLOAD_DIR, media.path.split('/').pop()!);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await db.media.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
