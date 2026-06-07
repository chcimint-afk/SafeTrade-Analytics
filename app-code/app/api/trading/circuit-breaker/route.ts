import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    // 1. Get the default user (self-healing pattern)
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, daily_loss_limit, starting_balance, current_balance")
      .limit(1);

    let user;
    let isOffline = false;

    if (userError) {
      console.warn("Supabase user fetch error in circuit-breaker, using fallback user:", userError.message);
      isOffline = true;
      user = {
        id: "00000000-0000-0000-0000-000000000000",
        daily_loss_limit: -1.00,
        starting_balance: 5000.00,
        current_balance: 5000.00
      };
    } else if (users && users.length > 0) {
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
          daily_loss_limit: -1.00, // Storing as -1.00 (representing 1% dynamically)
        })
        .select()
        .single();

      if (insertError) {
        console.warn("Supabase user seeding error in circuit-breaker, using fallback user:", insertError.message);
        isOffline = true;
        user = {
          id: "00000000-0000-0000-0000-000000000000",
          daily_loss_limit: -1.00,
          starting_balance: 5000.00,
          current_balance: 5000.00
        };
      } else {
        user = newUser;
      }
    }

    const userId = user.id;

    // 2. Query today's trades (Europe/Brussels day start — uses Intl.DateTimeFormat for host-OS-independent offset)
    const now = new Date();
    const brusselsParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Brussels",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const getPart = (type: string) => brusselsParts.find(p => p.type === type)?.value ?? "00";
    const y = getPart("year");
    const m = getPart("month");
    const d = getPart("day");

    // Build midnight Brussels time by subtracting the Intl-derived local time from "now" UTC
    const brusselsLocalMs = Date.parse(`${y}-${m}-${d}T${getPart("hour")}:${getPart("minute")}:${getPart("second")}`);
    const utcMs = now.getTime();
    const offsetMs = brusselsLocalMs - utcMs; // real UTC offset in milliseconds
    const midnightBrusselsMs = Date.parse(`${y}-${m}-${d}T00:00:00`) - offsetMs;
    const startOfDayISO = new Date(midnightBrusselsMs).toISOString();

    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("profit_loss")
      .eq("user_id", userId)
      .gte("timestamp", startOfDayISO);

    let tradesList = trades;
    if (tradesError) {
      console.warn("Supabase trades fetch error in circuit-breaker, using empty trades list:", tradesError.message);
      isOffline = true;
      tradesList = [];
    }

    // 3. Sum up daily profit/loss
    const dailyProfitLoss = (tradesList || []).reduce(
      (sum, t) => sum + Number(t.profit_loss || 0),
      0
    );

    // Calculate dynamic starting balance: current balance minus today's changes
    const currentBalance = Number(user.current_balance || 5000.00);
    const startingBalance = currentBalance - dailyProfitLoss;
    const rawLimit = Number(user.daily_loss_limit || -1.00);

    // Dynamic Percentage Check: if absolute value is <= 5.0 (e.g. 1.0 or 2.0 or -1.0), it's a percentage
    let dailyLossLimit = rawLimit;
    if (Math.abs(rawLimit) > 0 && Math.abs(rawLimit) <= 5.0) {
      dailyLossLimit = -(startingBalance * (Math.abs(rawLimit) / 100));
    }

    // 4. Circuit Breaker trigger logic: if losses exceed limit
    const isTriggered = dailyProfitLoss <= dailyLossLimit;

    if (isTriggered && !isOffline) {
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
      db_status: isOffline ? "offline" : "online",
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
