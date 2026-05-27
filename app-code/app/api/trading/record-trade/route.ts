import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      asset,
      direction,
      entry_price,
      exit_price,
      stop_loss,
      take_profit,
      profit_loss,
      slippage,
    } = body;

    // 1. Validate required fields
    if (!asset || !direction || entry_price === undefined || profit_loss === undefined) {
      return NextResponse.json(
        { error: "Missing required trade fields: asset, direction, entry_price, profit_loss" },
        { status: 400 }
      );
    }

    // 2. Self-healing database pattern: Ensure a default user exists to prevent foreign key issues
    let { data: users, error: userError } = await supabase
      .from("users")
      .select("id, current_balance")
      .limit(1);

    if (userError) {
      console.error("Supabase fetch user error:", userError);
      return NextResponse.json({ error: "Database error querying users" }, { status: 500 });
    }

    let user;
    if (users && users.length > 0) {
      user = users[0];
    } else {
      // Seed a default user if the DB is completely empty
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email: "adaml@safetrade.com",
          starting_balance: 5000.00,
          current_balance: 5000.00,
          compounding_status: true,
          daily_loss_limit: -50.00,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase user seeding error:", insertError);
        return NextResponse.json({ error: "Failed to seed default user" }, { status: 500 });
      }
      user = newUser;
    }

    const userId = user.id;

    // 3. Record the trade in the database
    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .insert({
        user_id: userId,
        asset,
        direction,
        entry_price,
        exit_price,
        stop_loss,
        take_profit,
        profit_loss,
        slippage: slippage || 0,
      })
      .select()
      .single();

    if (tradeError) {
      console.error("Supabase trade insertion error:", tradeError);
      return NextResponse.json({ error: "Failed to record trade in database" }, { status: 500 });
    }

    // 4. Update the user's current balance
    const updatedBalance = Number(user.current_balance) + Number(profit_loss);
    const { error: balanceUpdateError } = await supabase
      .from("users")
      .update({ current_balance: updatedBalance })
      .eq("id", userId);

    if (balanceUpdateError) {
      console.error("Supabase balance update error:", balanceUpdateError);
      // We don't rollback, but we log it
    }

    return NextResponse.json({
      success: true,
      trade,
      updated_balance: updatedBalance,
    });
  } catch (error: any) {
    console.error("Error in record-trade API route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
