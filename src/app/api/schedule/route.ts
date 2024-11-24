import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { schedulePost, cancelScheduledPost, getScheduledPosts } from '@/lib/bull-queue';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, mediaUrls, platform, accountId, scheduledTime } = await req.json();

    // Validate input
    if (!content || !platform || !accountId || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the social account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select()
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      );
    }

    // Create schedule record in database
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        content,
        media_urls: mediaUrls,
        platform,
        account_id: accountId,
        user_id: userId,
        scheduled_time: new Date(scheduledTime).toISOString(),
        status: 'scheduled'
      })
      .select()
      .single();

    if (scheduleError) throw scheduleError;

    // Add to queue
    const job = await schedulePost(
      platform,
      content,
      mediaUrls,
      account,
      new Date(scheduledTime)
    );

    // Update schedule with job ID
    const { error: updateError } = await supabase
      .from('schedules')
      .update({ job_id: job.id.toString() })
      .eq('id', schedule.id);

    if (updateError) throw updateError;

    return NextResponse.json({ schedule, jobId: job.id });
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Get schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select()
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Cancel the scheduled job
    if (schedule.job_id) {
      await cancelScheduledPost(schedule.job_id);
    }

    // Delete the schedule
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    let query = supabase
      .from('schedules')
      .select(`
        *,
        social_accounts (
          id,
          platform,
          platform_username
        )
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: schedules, error } = await query
      .order('scheduled_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
