import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    // 1. Get the default user (self-healing pattern)
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, daily_loss_limit, starting_balance")
      .limit(1);

    if (userError) {
      console.error("Supabase user fetch error in circuit-breaker:", userError);
      return NextResponse.json({ error: "Database error querying users" }, { status: 500 });
    }

    let user;
    if (users && users.length > 0) {
      user = users[0];
    } else {
      // Seed a default user if empty
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
        console.error("Supabase user seeding error in circuit-breaker:", insertError);
        return NextResponse.json({ error: "Failed to seed default user" }, { status: 500 });
      }
      user = newUser;
    }

    const userId = user.id;
    const dailyLossLimit = Number(user.daily_loss_limit); // e.g. -50.00

    // 2. Query today's trades (UTC day start)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();

    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("profit_loss")
      .eq("user_id", userId)
      .gte("timestamp", startOfDayISO);

    if (tradesError) {
      console.error("Supabase trades fetch error in circuit-breaker:", tradesError);
      return NextResponse.json({ error: "Database error querying trades" }, { status: 500 });
    }

    // 3. Sum up daily profit/loss
    const dailyProfitLoss = (trades || []).reduce(
      (sum, t) => sum + Number(t.profit_loss || 0),
      0
    );

    // 4. Circuit Breaker trigger logic: if losses exceed limit (are more negative than -50, i.e., <= -50)
    const isTriggered = dailyProfitLoss <= dailyLossLimit;

    if (isTriggered) {
      // Check if we have already logged a circuit breaker trigger today to avoid spamming the log table
      const { data: existingLogs } = await supabase
        .from("system_logs")
        .select("id")
        .eq("event_type", "CIRCUIT_BREAKER")
        .gte("timestamp", startOfDayISO);

      if (!existingLogs || existingLogs.length === 0) {
        const { error: logError } = await supabase.from("system_logs").insert({
          event_type: "CIRCUIT_BREAKER",
          details: `Circuit Breaker automatically triggered. Daily net performance: ${dailyProfitLoss.toFixed(
            2
          )} EUR. Daily risk ceiling threshold: ${dailyLossLimit.toFixed(
            2
          )} EUR. SafeTrade Terminal locked down for 24h.`,
        });

        if (logError) {
          console.error("Failed to insert circuit-breaker log:", logError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      daily_profit_loss: dailyProfitLoss,
      daily_loss_limit: dailyLossLimit,
      circuit_breaker_active: isTriggered,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error in circuit-breaker API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
