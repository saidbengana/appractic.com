import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
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

    const data = await request.json();

    // Check if account already exists
    const { data: existingAccount, error: findError } = await supabase
      .from('social_accounts')
      .select()
      .eq('user_id', userId)
      .eq('platform', data.platform)
      .eq('platform_user_id', data.platformUserId)
      .single();

    if (findError && findError.code !== 'PGRST116') throw findError;

    if (existingAccount) {
      // Update existing account
      const { data: updatedAccount, error: updateError } = await supabase
        .from('social_accounts')
        .update({
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
          platform_username: data.platformUsername,
          token_expires_at: data.tokenExpiresAt
        })
        .eq('id', existingAccount.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json(updatedAccount);
    }

    // Create new account
    const { data: newAccount, error: createError } = await supabase
      .from('social_accounts')
      .insert({
        user_id: userId,
        platform: data.platform,
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        platform_username: data.platformUsername,
        platform_user_id: data.platformUserId,
        token_expires_at: data.tokenExpiresAt
      })
      .select()
      .single();

    if (createError) throw createError;
    return NextResponse.json(newAccount);
  } catch (error) {
    console.error('Error creating social account:', error);
    return NextResponse.json(
      { error: 'Failed to create social account' },
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
    const accountId = searchParams.get('id');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Check if account exists and belongs to user
    const { data: account, error: findError } = await supabase
      .from('social_accounts')
      .select()
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Social account not found' },
          { status: 404 }
        );
      }
      throw findError;
    }

    // Delete the account
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social account:', error);
    return NextResponse.json(
      { error: 'Failed to delete social account' },
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

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('id');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const account = await supabase
      .from('social_accounts')
      .select()
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      );
    }

    const data = await request.json();
    const updatedAccount = await supabase
      .from('social_accounts')
      .update({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        platform_username: data.platformUsername,
        token_expires_at: data.tokenExpiresAt
      })
      .eq('id', accountId)
      .select()
      .single();

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating social account:', error);
    return NextResponse.json(
      { error: 'Failed to update social account' },
      { status: 500 }
    );
  }
}
