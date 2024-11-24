import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
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
    const { data: media, error } = await supabase
      .from('media')
      .insert({
        user_id: userId,
        name: file.name,
        mime_type: file.type,
        path,
        size: file.size,
        size_total: file.size, // Will be updated after conversions
      })
      .select()
      .single();

    if (error) throw error;

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

    let query = supabase
      .from('media')
      .select(`
        *,
        posts!media_posts (
          id
        )
      `)
      .eq('user_id', userId);

    if (postId) {
      query = query.eq('posts.id', postId);
    }

    const { data: media, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Check if media exists and belongs to user
    const { data: media, error: findError } = await supabase
      .from('media')
      .select()
      .eq('id', mediaId)
      .eq('user_id', userId)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Media not found' },
          { status: 404 }
        );
      }
      throw findError;
    }

    // Delete file from disk
    try {
      const filePath = join(UPLOAD_DIR, media.path.split('/').pop()!);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
