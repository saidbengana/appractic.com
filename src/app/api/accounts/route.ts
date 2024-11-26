import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("[ACCOUNTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        id: uuidv4(),
        user_id: userId,
        name,
        type
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(account);
  } catch (error) {
    console.error("[ACCOUNTS_POST]", error);
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
    const accountId = searchParams.get('id');

    if (!accountId) {
      return new NextResponse("Missing account ID", { status: 400 });
    }

    // First verify the account belongs to the user
    const { data: account, error: findError } = await supabase
      .from('accounts')
      .select()
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (findError || !account) {
      return new NextResponse("Account not found", { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ACCOUNTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
