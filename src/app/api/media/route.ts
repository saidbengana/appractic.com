import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { unlink, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { supabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Configure media storage
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: mediaItems, error } = await supabase
      .from('media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error("[MEDIA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;
    const filepath = join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    const { data: media, error } = await supabase
      .from('media')
      .insert({
        id: uuidv4(),
        user_id: userId,
        url: `/uploads/${filename}`,
        type: file.type,
        title: file.name,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(media);
  } catch (error) {
    console.error("[MEDIA_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return new NextResponse("Missing media ID", { status: 400 });
    }

    // First verify the media belongs to the user
    const { data: media, error: findError } = await supabase
      .from('media')
      .select()
      .eq('id', mediaId)
      .eq('user_id', userId)
      .single();

    if (findError || !media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    const filepath = join(UPLOAD_DIR, media.url.split('/').pop());
    await unlink(filepath);

    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
