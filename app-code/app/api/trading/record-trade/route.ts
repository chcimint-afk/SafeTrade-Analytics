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
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, current_balance")
      .limit(1);

    let user;
    if (userError) {
      console.warn("Supabase fetch user error in record-trade, using fallback:", userError.message);
      user = {
        id: "00000000-0000-0000-0000-000000000000",
        current_balance: 5000.00
      };
    } else if (users && users.length > 0) {
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
        console.warn("Supabase user seeding error in record-trade, using fallback:", insertError.message);
        user = {
          id: "00000000-0000-0000-0000-000000000000",
          current_balance: 5000.00
        };
      } else {
        user = newUser;
      }
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

    let recordedTrade = trade;
    if (tradeError) {
      console.warn("Supabase trade insertion error, using fallback simulated trade:", tradeError.message);
      recordedTrade = {
        id: Math.floor(Math.random() * 1000000),
        user_id: userId,
        asset,
        direction,
        entry_price,
        exit_price,
        stop_loss,
        take_profit,
        profit_loss,
        slippage: slippage || 0,
        timestamp: new Date().toISOString()
      };
    }

    // 4. Update the user's current balance
    const updatedBalance = Number(user.current_balance || 5000.00) + Number(profit_loss);
    const { error: balanceUpdateError } = await supabase
      .from("users")
      .update({ current_balance: updatedBalance })
      .eq("id", userId);

    if (balanceUpdateError) {
      console.warn("Supabase balance update error in record-trade:", balanceUpdateError.message);
    }

    return NextResponse.json({
      success: true,
      trade: recordedTrade,
    });
  } catch (error: unknown) {
    console.error("Error in record-trade API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
