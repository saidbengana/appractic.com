import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/supabase';

interface PostData {
  title: string
  content: string
  media?: { url: string; type: string; thumbnail: string; aspectRatio: string }[]
  schedule?: { startDate: string }
  platforms?: string[]
  tags?: string[]
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        social_accounts (
          id,
          platform,
          platform_username
        ),
        post_tags (
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: PostData = await request.json();
    const post: Partial<Post> = {
      user_id: userId,
      content: data.content,
      media_url: data.media?.[0]?.url,
      scheduled_for: data.schedule?.startDate,
      status: data.schedule ? 'scheduled' : 'draft',
      platforms: data.platforms || [],
    };

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;

    // If there are tags, add them
    if (data.tags?.length > 0) {
      const postTags = data.tags.map((tagId: string) => ({
        post_id: newPost.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(postTags);

      if (tagError) throw tagError;
    }

    return NextResponse.json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: PostData & { id: string } = await request.json();
    const postId = data.id;

    // Verify post ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select()
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    const post: Partial<Post> = {
      content: data.content,
      media_url: data.media?.[0]?.url,
      scheduled_for: data.schedule?.startDate,
      status: data.schedule ? 'scheduled' : 'draft',
      platforms: data.platforms || [],
    };

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update(post)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;

    // Update tags if provided
    if (data.tags) {
      // Remove existing tags
      await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', postId);

      // Add new tags
      if (data.tags.length > 0) {
        const postTags = data.tags.map((tagId: string) => ({
          post_id: postId,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(postTags);

        if (tagError) throw tagError;
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Verify post ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select()
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
