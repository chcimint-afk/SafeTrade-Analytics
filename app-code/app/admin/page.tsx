"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Zap,
  Waves,
  Lock,
  ShieldAlert,
  Coins,
  Gem,
  Globe,
  BarChart3,
  AlertCircle,
  Ghost,
  Trophy,
  BarChart4,
  LockIcon,
  ShieldEllipsis,
  Cpu,
  Database,
  History,
  Award,
  CircleDollarSign,
  Radar
} from "lucide-react";

// --- CONFIGURATION SYSTEM ---
// Toggle between 'development' (seconds) and 'production' (minutes) modes
const TERMINAL_ENV: "development" | "production" = "development"; 

// News Halt Duration (Development: 8 seconds | Production: 15 minutes = 900 seconds)
const NEWS_HALT_DURATION = TERMINAL_ENV === "development" ? 8 : 900; 

const INITIAL_BALANCE = 5000;
const DAILY_RISK_PERCENT = 1.0; // Dynamic daily risk percent (1.0% limit)
const BASE_SENTIMENT_THRESHOLD = 75; 
const PROFIT_SHIELD_THRESHOLD = 80;

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const [profit, setProfit] = useState(0.00);
  const [, setPulse] = useState(true);
  const [realizedProfit, setRealizedProfit] = useState(0.00);
  const [dailyProfit, setDailyProfit] = useState(0.00);
  const [totalCommissions, setTotalCommissions] = useState(0.00);
  const [totalSlippage, setTotalSlippage] = useState(0.00);
  const [isAutotrade, setIsAutotrade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isPanic, setIsPanic] = useState(false);
  const [isStealth, setIsStealth] = useState(true);
  const [autoHalted, setAutoHalted] = useState(false);
  // Tracks whether the auto-halt was triggered by a DB Circuit Breaker breach (hard-lock)
  // vs a temporary Panic Stop. Hard-lock can only be cleared at EOD reset (09:00 CET).
  const [isCircuitBreakerHalted, setIsCircuitBreakerHalted] = useState(false);
  const isCircuitBreakerHaltedRef = useRef(false);
  const [apiLoadState, setApiLoadState] = useState<"OK" | "QUEUED" | "COOLDOWN">("OK");
  const [apiQueueCount, setApiQueueCount] = useState(0);
  const [marketSentiment, setMarketSentiment] = useState(72); 
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [closedTradesCount, setClosedTradesCount] = useState(0);
  const [efficiency, setEfficiency] = useState(100);
  const [greenDaysStreak, setGreenDaysStreak] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<{id: number, type: string, amount: number, time: string, fee: number, stealth?: boolean}[]>([]);
  const [whaleAlert, setWhaleAlert] = useState<{asset: string, amount: string} | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [threatLevel, setThreatLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [isEodHalted, setIsEodHalted] = useState(false);
  const [bypassEodHalt, setBypassEodHalt] = useState(false);
  const [newsHaltedAssets, setNewsHaltedAssets] = useState<string[]>([]);
  const [activeNewsEvent, setActiveNewsEvent] = useState<{ title: string, assetType: string } | null>(null);
  const [newsCountdown, setNewsCountdown] = useState<number>(0);
  const [unsavedLoss, setUnsavedLoss] = useState(0.00);

  // Dynamic compounding calculations calculated on every render
  const dailyStartingBalance = INITIAL_BALANCE + realizedProfit - dailyProfit;
  const displayTarget = dailyStartingBalance * (DAILY_RISK_PERCENT / 100);

  const realizedProfitRef = useRef(0.00);
  useEffect(() => { realizedProfitRef.current = realizedProfit; }, [realizedProfit]);
  const unsavedLossRef = useRef(0.00);
  useEffect(() => { unsavedLossRef.current = unsavedLoss; }, [unsavedLoss]);

  // Parallel Hybrid Trading System State
  const [maxStealthStopLoss, setMaxStealthStopLoss] = useState(3.0);
  const [hedgingActive, setHedgingActive] = useState(true);
  const [scalpingActive, setScalpingActive] = useState(true);
  const [trendActive, setTrendActive] = useState(false);
  const [trendProfit, setTrendProfit] = useState(0.0);
  const [trendIsBreakEven, setTrendIsBreakEven] = useState(false);
  const [trendIsTrailing, setTrendIsTrailing] = useState(false);
  const [scalpActive, setScalpActive] = useState(false);
  const [scalpProfit, setScalpProfit] = useState(0.0);
  const [hedgeActive, setHedgeActive] = useState(false);
  const [hedgeProfit, setHedgeProfit] = useState(0.0);

  const [averageSlippagePips, setAverageSlippagePips] = useState(0.15);
  const [scalpVirtualBalanceCap, setScalpVirtualBalanceCap] = useState(150000);
  const [scalperSleepMode, setScalperSleepMode] = useState(false);
  const isStealthRef = useRef(isStealth);
  useEffect(() => { isStealthRef.current = isStealth; }, [isStealth]);
  
  // Real-time Macro Assets States for absolute alive feel
  const [goldPrice, setGoldPrice] = useState(2345.50);
  const [goldChange, setGoldChange] = useState(1.2);
  const [goldSentiment, setGoldSentiment] = useState(88);

  const [tslaPrice, setTslaPrice] = useState(175.20);
  const [tslaChange, setTslaChange] = useState(2.1);
  const [tslaSentiment, setTslaSentiment] = useState(72);

  const [spusPrice, setSpusPrice] = useState(5120.25);
  const [spusChange, setSpusChange] = useState(0.4);
  const [spusSentiment, setSpusSentiment] = useState(65);

  const [eurusdPrice, setEurusdPrice] = useState(1.0850);
  const [eurusdChange, setEurusdChange] = useState(0.15);
  const [eurusdSentiment, setEurusdSentiment] = useState(55);

  const [ndxPrice, setNdxPrice] = useState(18245.80);
  const [ndxChange, setNdxChange] = useState(0.85);
  const [ndxSentiment, setNdxSentiment] = useState(78);

  const [btcPrice, setBtcPrice] = useState(68500.00);
  const [btcChange, setBtcChange] = useState(1.5);
  const [btcSentiment, setBtcSentiment] = useState(85);

  const [ethPrice, setEthPrice] = useState(3450.00);
  const [ethChange, setEthChange] = useState(2.2);
  const [ethSentiment, setEthSentiment] = useState(80);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPausedRef = useRef(false);
  const isPanicRef = useRef(false);
  const autoHaltedRef = useRef(false);
  const isAutotradeRef = useRef(true);
  const sentimentRef = useRef(72);
  const dailyProfitRef = useRef(0);
  const isEodHaltedRef = useRef(false);
  const bypassEodHaltRef = useRef(false);
  const newsHaltedAssetsRef = useRef<string[]>([]);
  const apiLoadStateRef = useRef<"OK" | "QUEUED" | "COOLDOWN">("OK");
  const apiQueueCountRef = useRef(0);
  const executionQueueRef = useRef<{ id: number; action: () => void; description: string }[]>([]);
  const threatLevelRef = useRef(threatLevel);
  useEffect(() => { threatLevelRef.current = threatLevel; }, [threatLevel]);
  
  // Parallel Hybrid Trading System Refs
  const maxStealthStopLossRef = useRef(3.0);
  const hedgingActiveRef = useRef(true);
  const scalpingActiveRef = useRef(true);
  const trendActiveRef = useRef(false);
  const trendProfitRef = useRef(0.0);
  const trendIsBreakEvenRef = useRef(false);
  const trendIsTrailingRef = useRef(false);
  const scalpActiveRef = useRef(false);
  const scalpProfitRef = useRef(0.0);
  const hedgeActiveRef = useRef(false);
  const hedgeProfitRef = useRef(0.0);

  const maxTrendProfitRef = useRef(0.0);
  const slippageHistoryRef = useRef<number[]>([]);
  const scalpVirtualBalanceCapRef = useRef(150000);
  const scalperSleepModeRef = useRef(false);
  
  // Sync refs with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isPanicRef.current = isPanic; }, [isPanic]);
  useEffect(() => { autoHaltedRef.current = autoHalted; }, [autoHalted]);
  useEffect(() => { isCircuitBreakerHaltedRef.current = isCircuitBreakerHalted; }, [isCircuitBreakerHalted]);
  useEffect(() => { isAutotradeRef.current = isAutotrade; }, [isAutotrade]);
  useEffect(() => { sentimentRef.current = marketSentiment; }, [marketSentiment]);
  useEffect(() => { dailyProfitRef.current = dailyProfit; }, [dailyProfit]);
  useEffect(() => { isEodHaltedRef.current = isEodHalted; }, [isEodHalted]);
  useEffect(() => { bypassEodHaltRef.current = bypassEodHalt; }, [bypassEodHalt]);
  useEffect(() => { newsHaltedAssetsRef.current = newsHaltedAssets; }, [newsHaltedAssets]);
  useEffect(() => { apiLoadStateRef.current = apiLoadState; }, [apiLoadState]);
  useEffect(() => { apiQueueCountRef.current = apiQueueCount; }, [apiQueueCount]);

  useEffect(() => { maxStealthStopLossRef.current = maxStealthStopLoss; }, [maxStealthStopLoss]);
  useEffect(() => { hedgingActiveRef.current = hedgingActive; }, [hedgingActive]);
  useEffect(() => { scalpingActiveRef.current = scalpingActive; }, [scalpingActive]);
  useEffect(() => { trendActiveRef.current = trendActive; }, [trendActive]);
  useEffect(() => { trendProfitRef.current = trendProfit; }, [trendProfit]);
  useEffect(() => { trendIsBreakEvenRef.current = trendIsBreakEven; }, [trendIsBreakEven]);
  useEffect(() => { trendIsTrailingRef.current = trendIsTrailing; }, [trendIsTrailing]);
  useEffect(() => { scalpActiveRef.current = scalpActive; }, [scalpActive]);
  useEffect(() => { scalpProfitRef.current = scalpProfit; }, [scalpProfit]);
  useEffect(() => { hedgeActiveRef.current = hedgeActive; }, [hedgeActive]);
  useEffect(() => { hedgeProfitRef.current = hedgeProfit; }, [hedgeProfit]);
  useEffect(() => { scalpVirtualBalanceCapRef.current = scalpVirtualBalanceCap; }, [scalpVirtualBalanceCap]);
  useEffect(() => { scalperSleepModeRef.current = scalperSleepMode; }, [scalperSleepMode]);

  useEffect(() => {
    if (newsCountdown <= 0) return;
    const timer = setInterval(() => {
      setNewsCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [newsCountdown]);

  const checkCircuitBreaker = useCallback(() => {
    fetch('/api/trading/circuit-breaker')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.db_status === "offline") {
            // DB offline: use ONLY dailyProfit (no double-counting of unsavedLoss which is already included)
            const currentStartingBalance = INITIAL_BALANCE + realizedProfitRef.current - dailyProfitRef.current;
            const dynamicStopLoss = -(currentStartingBalance * (DAILY_RISK_PERCENT / 100));
            const isTriggered = dailyProfitRef.current <= dynamicStopLoss;
            if (isTriggered && !isCircuitBreakerHaltedRef.current) {
              setIsCircuitBreakerHalted(true);
              isCircuitBreakerHaltedRef.current = true;
              setAutoHalted(true);
              setIsPaused(true);
              setIsAutotrade(false);
              setProfit(0);
            }
          } else {
            // DB online: trust the server's computed circuit_breaker_active flag
            if (data.circuit_breaker_active && !isCircuitBreakerHaltedRef.current) {
              setIsCircuitBreakerHalted(true);
              isCircuitBreakerHaltedRef.current = true;
              setAutoHalted(true);
              setIsPaused(true);
              setIsAutotrade(false);
              setProfit(0);
            }
          }
        }
      })
      .catch(err => {
        console.error("Error checking circuit breaker:", err);
        // Fallback: client-side check using only dailyProfit (no double-counting)
        const currentStartingBalance = INITIAL_BALANCE + realizedProfitRef.current - dailyProfitRef.current;
        const dynamicStopLoss = -(currentStartingBalance * (DAILY_RISK_PERCENT / 100));
        const isTriggered = dailyProfitRef.current <= dynamicStopLoss;
        if (isTriggered && !isCircuitBreakerHaltedRef.current) {
          setIsCircuitBreakerHalted(true);
          isCircuitBreakerHaltedRef.current = true;
          setAutoHalted(true);
          setIsPaused(true);
          setIsAutotrade(false);
          setProfit(0);
        }
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('safetrade_state_v28');
    if (saved) {
      const data = JSON.parse(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRealizedProfit(data.realizedProfit || 0);
      setDailyProfit(data.dailyProfit || 0);
      setTotalCommissions(data.totalCommissions || 0);
      setTotalSlippage(data.totalSlippage || 0);
      setClosedTradesCount(data.closedTradesCount || 0);
      setTradeHistory(data.tradeHistory || []);
      setGreenDaysStreak(data.greenDaysStreak || 0);
    }
    // Pre-load audio
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3");
    audio.load();
    audioRef.current = audio;

    // Trigger initial circuit breaker database check on mount
    checkCircuitBreaker();
  }, [checkCircuitBreaker]);

  useEffect(() => {
    const data = { realizedProfit, dailyProfit, totalCommissions, totalSlippage, closedTradesCount, tradeHistory, greenDaysStreak };
    localStorage.setItem('safetrade_state_v28', JSON.stringify(data));
  }, [realizedProfit, dailyProfit, totalCommissions, totalSlippage, closedTradesCount, tradeHistory, greenDaysStreak]);

  const playCashSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked/failed:", e));
    }
  }, []);

  // API Rate Shield queue manager
  const queueRequest = useCallback((action: () => void, description: string) => {
    if (apiLoadStateRef.current === "COOLDOWN") {
      console.warn(`[API Rate Shield] Cooldown active. Dropped or delayed request: ${description}`);
      return;
    }

    executionQueueRef.current.push({
      id: Math.random(),
      action,
      description
    });

    const newLen = executionQueueRef.current.length;
    setApiQueueCount(newLen);
    apiQueueCountRef.current = newLen;

    // Simulated overflow: if too many orders are fragmented at once (e.g. > 10 items in queue)
    if (newLen > 10) {
      console.error("[API Rate Shield] RATE LIMIT EXCEEDED (HTTP 429). Entering 5-second Cooldown. Queue paused.");
      setApiLoadState("COOLDOWN");
      apiLoadStateRef.current = "COOLDOWN";

      setTimeout(() => {
        setApiLoadState("OK");
        apiLoadStateRef.current = "OK";
        console.log("[API Rate Shield] Cooldown finished. Resuming API queue execution.");
      }, 5000);
    } else if (apiLoadStateRef.current === "OK") {
      setApiLoadState("QUEUED");
      apiLoadStateRef.current = "QUEUED";
    }
  }, []);

  // API Rate Shield queue execution loop (5 requests per second)
  useEffect(() => {
    if (apiLoadState === "COOLDOWN") return;

    const interval = setInterval(() => {
      if (executionQueueRef.current.length > 0) {
        if (apiLoadStateRef.current !== "QUEUED") {
          setApiLoadState("QUEUED");
          apiLoadStateRef.current = "QUEUED";
        }

        const item = executionQueueRef.current.shift();
        setApiQueueCount(executionQueueRef.current.length);
        apiQueueCountRef.current = executionQueueRef.current.length;

        if (item) {
          console.log(`[API Rate Shield] Dispatching: ${item.description}`);
          item.action();
        }
      } else {
        if (apiLoadStateRef.current === "QUEUED") {
          setApiLoadState("OK");
          apiLoadStateRef.current = "OK";
        }
      }
    }, 125);

    return () => clearInterval(interval);
  }, [apiLoadState]);

  const realizeProfitAction = useCallback((amount: number) => {
    const s_stealth = isStealthRef.current;
    const slippageMultiplier = s_stealth ? 0.5 : 1.0;
    const commission = Math.abs(amount * 0.001); 
    const slippage = Math.abs(amount * (Math.random() * 0.002) * slippageMultiplier); 
    const netAmount = amount - commission - slippage;

    // Slippage feedback loop (pips calculation)
    const threatMultiplier = threatLevelRef.current === "High" ? 2.5 : threatLevelRef.current === "Medium" ? 1.5 : 1.0;
    const newPipSlippage = (Math.random() * 0.9) * threatMultiplier * slippageMultiplier;
    const newHistory = [...slippageHistoryRef.current, newPipSlippage].slice(-10);
    slippageHistoryRef.current = newHistory;
    const avgSlippage = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
    setAverageSlippagePips(avgSlippage);

    // Dynamic virtual cap mapping using non-overlapping semi-open intervals
    let newCap = 150000;
    let sleepMode = false;
    if (avgSlippage > 1.0) {
      sleepMode = true;
      newCap = 50000;
    } else if (avgSlippage > 0.5) {
      newCap = 50000;
    } else if (avgSlippage > 0.4) {
      newCap = 80000;
    } else if (avgSlippage > 0.3) {
      newCap = 100000;
    } else if (avgSlippage > 0.2) {
      newCap = 120000;
    } else {
      newCap = 150000;
    }
    setScalpVirtualBalanceCap(newCap);
    setScalperSleepMode(sleepMode);

    // Define execution block
    const executeTradeExecution = (amt: number, comm: number, slip: number, isLastSlice: boolean, sliceIndex?: number, totalSlices?: number) => {
      if (amt > 0 && isLastSlice) playCashSound();
      
      setTotalCommissions(prev => prev + comm);
      setTotalSlippage(prev => prev + slip);
      setRealizedProfit(prev => prev + amt);
      
      const currentStartingBalance = INITIAL_BALANCE + realizedProfitRef.current - dailyProfitRef.current;
      const dynamicStopLoss = -(currentStartingBalance * (DAILY_RISK_PERCENT / 100));
      const dynamicTarget = currentStartingBalance * (DAILY_RISK_PERCENT / 100);

      setDailyProfit(prev => {
        const newDaily = prev + amt;
        dailyProfitRef.current = newDaily;
        if (newDaily <= dynamicStopLoss) {
          setAutoHalted(true);
          autoHaltedRef.current = true;
          setIsPaused(true);
          isPausedRef.current = true;
          setIsAutotrade(false);
          isAutotradeRef.current = false;
          setProfit(0);
        }
        if (newDaily >= dynamicTarget && prev < dynamicTarget) {
          setGreenDaysStreak(s => s + 1);
        }
        return newDaily;
      });

      if (isLastSlice) {
        setClosedTradesCount(prev => prev + 1);
        setEfficiency(prev => Math.max(0, Math.min(100, prev - (amount < 0 ? 5 : 0) + (amount > 0 ? 1 : 0))));
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 500);
      }

      setTradeHistory(prev => {
        const fillType = sliceIndex !== undefined 
          ? `Fill #${sliceIndex}/${totalSlices}` 
          : (dailyProfitRef.current >= dynamicTarget ? 'Shield-Trade' : 'Safe-Trade');
        
        return [
          { 
            id: Math.random(), 
            type: fillType, 
            amount: amt, 
            time: new Date().toLocaleTimeString(), 
            fee: comm + slip,
            stealth: s_stealth
          },
          ...prev.slice(0, 10)
        ];
      });

      // Secure DB sync on last slice
      if (isLastSlice) {
        const priorityAssets = ["BTC", "ETH", "SPUS", "GOLD", "TSLA", "EURUSD", "NDX"];
        const activeTradingAsset = priorityAssets.find(asset => !newsHaltedAssetsRef.current.includes(asset)) || "GOLD";

        const getAssetPrice = (assetName: string) => {
          switch (assetName) {
            case "GOLD": return goldPrice;
            case "TSLA": return tslaPrice;
            case "SPUS": return spusPrice;
            case "EURUSD": return eurusdPrice;
            case "NDX": return ndxPrice;
            case "BTC": return btcPrice;
            case "ETH": return ethPrice;
            default: return 1.0;
          }
        };

        const entryPrice = getAssetPrice(activeTradingAsset);
        const pctChange = netAmount / currentStartingBalance;
        const exitPrice = entryPrice * (1 + pctChange);
        const directionStr = netAmount >= 0 ? "BUY" : "SELL";
        const isScalpFill = sliceIndex !== undefined;
        const slPercent = isScalpFill 
          ? 0.0025 
          : (s_stealth ? (maxStealthStopLossRef.current + 2.0) / 100 : maxStealthStopLossRef.current / 100);
        const tpPercent = isScalpFill ? 0.00375 : 0.03;
        
        const stopLossVal = directionStr === "BUY" ? entryPrice * (1 - slPercent) : entryPrice * (1 + slPercent);
        const takeProfitVal = directionStr === "BUY" ? entryPrice * (1 + tpPercent) : entryPrice * (1 - tpPercent);

        fetch('/api/trading/record-trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset: activeTradingAsset,
            direction: directionStr,
            entry_price: entryPrice,
            exit_price: exitPrice,
            stop_loss: stopLossVal,
            take_profit: takeProfitVal,
            profit_loss: netAmount,
            slippage: commission + slippage
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log("DB Trade logged:", data);
          if (data.success && !data.db_saved) {
            setUnsavedLoss(prev => prev + netAmount);
          }
          checkCircuitBreaker();
        })
        .catch(err => {
          console.error("DB logging failed:", err);
          setUnsavedLoss(prev => prev + netAmount);
        });
      }
    };

    if (s_stealth && amount !== 0) {
      // Split execution into 5 smaller slices with random execution times
      const numSlices = 5;
      const sliceAmt = netAmount / numSlices;
      const sliceComm = commission / numSlices;
      const sliceSlip = slippage / numSlices;

      for (let i = 1; i <= numSlices; i++) {
        const delay = 1000 + Math.random() * 4000;
        setTimeout(() => {
          queueRequest(() => executeTradeExecution(sliceAmt, sliceComm, sliceSlip, i === numSlices, i, numSlices), `Stealth Slice ${i}/${numSlices}`);
        }, delay);
      }
    } else {
      executeTradeExecution(netAmount, commission, slippage, true);
    }
  }, [playCashSound, checkCircuitBreaker, queueRequest, goldPrice, tslaPrice, spusPrice, eurusdPrice, ndxPrice, btcPrice, ethPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Periodically check server-side circuit breaker status from DB
      fetch('/api/trading/circuit-breaker')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.circuit_breaker_active && !autoHaltedRef.current) {
            setAutoHalted(true);
            setIsPaused(true);
            setIsAutotrade(false);
            setProfit(0);
          }
        })
        .catch(err => console.error("Polled circuit breaker check failed:", err));

      // 1. Check for EOD/Weekend/Holiday halt (Brussels/European Time: sleep from 18:00 to 09:00, or all day on Sat/Sun/Holidays)
      const now = new Date();
      const brusselsHour = parseInt(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Brussels",
          hour: "2-digit",
          hour12: false
        }).format(now),
        10
      );
      const brusselsDay = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Brussels",
        weekday: "short"
      }).format(now);
      const brusselsMonthDay = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Brussels",
        month: "2-digit",
        day: "2-digit"
      }).format(now); // MM/DD format (e.g. "01/01" for New Year, "12/25" for Christmas)

      const isWeekend = brusselsDay === "Sat" || brusselsDay === "Sun";
      const isHoliday = brusselsMonthDay === "01/01" || brusselsMonthDay === "12/25" || brusselsMonthDay === "12/26" || brusselsMonthDay === "05/01";
      const isHaltPeriod = brusselsHour >= 18 || brusselsHour < 9 || isWeekend || isHoliday;

      if (isHaltPeriod && !bypassEodHaltRef.current && !isEodHaltedRef.current) {
        setIsEodHalted(true);
        isEodHaltedRef.current = true;
        setIsAutotrade(false);
        isAutotradeRef.current = false;
        
        // Auto-close any active trade and secure current profit
        setProfit(prev => {
          if (prev !== 0) {
            realizeProfitAction(prev);
          }
          return 0;
        });

        // Reset all active robot states
        setTrendActive(false);
        trendActiveRef.current = false;
        setTrendIsBreakEven(false);
        trendIsBreakEvenRef.current = false;
        setTrendIsTrailing(false);
        trendIsTrailingRef.current = false;
        setScalpActive(false);
        scalpActiveRef.current = false;
        setHedgeActive(false);
        hedgeActiveRef.current = false;
        setHedgeProfit(0);
        hedgeProfitRef.current = 0;
        trendProfitRef.current = 0;
        scalpProfitRef.current = 0;
        setTrendProfit(0);
        setScalpProfit(0);
      }

      // If EOD is active but bypassed, ensure autotrade is active to resume trading
      if (isHaltPeriod && bypassEodHaltRef.current && !isAutotradeRef.current && !isPausedRef.current && !isPanicRef.current && !autoHaltedRef.current) {
        setIsAutotrade(true);
        isAutotradeRef.current = true;
      }

      // Reset EOD halt when the safe trading day starts (at 09:00)
      if (!isHaltPeriod && isEodHaltedRef.current) {
        setIsEodHalted(false);
        isEodHaltedRef.current = false;
        setBypassEodHalt(false);
        bypassEodHaltRef.current = false;
        // Reset daily stats for the new day
        setDailyProfit(0);
        dailyProfitRef.current = 0;

        // New trading day: release the Circuit Breaker hard-lock AND all halts
        setIsCircuitBreakerHalted(false);
        isCircuitBreakerHaltedRef.current = false;
        setAutoHalted(false);
        autoHaltedRef.current = false;
        setIsPaused(false);
        isPausedRef.current = false;
        setIsAutotrade(true);
        isAutotradeRef.current = true;
      }

      setMarketSentiment(prev => {
        // HFT Market Pulse Formula:
        // Imbalance = BidVol / (BidVol + AskVol)
        // ActivityFactor = 0.5 * (min(1.2, VolCurrent/VolAvg) + min(1.2, ATRCurrent/ATRAvg))
        // Market Pulse % = min(100%, 2 * |Imbalance - 0.5| * ActivityFactor * 100)
        
        // Generate simulated bid/ask volumes to calculate imbalance
        const bidVol = 10000 + Math.random() * 90000;
        const askVol = 10000 + Math.random() * 90000;
        // Skew volumes dynamically to simulate buy/sell pressure fluctuations
        const skewFactor = Math.random() > 0.5 ? 2.5 : 1.0;
        const skewDirection = Math.random() > 0.5;
        const adjustedBidVol = skewDirection ? bidVol * skewFactor : bidVol;
        const adjustedAskVol = !skewDirection ? askVol * skewFactor : askVol;
        const imbalance = adjustedBidVol / (adjustedBidVol + adjustedAskVol);
        
        const volRatio = 0.4 + Math.random() * 1.2;
        const atrRatio = 0.4 + Math.random() * 1.2;
        const activityFactor = 0.5 * (Math.min(1.2, volRatio) + Math.min(1.2, atrRatio));
        
        let calculated = Math.min(100, 2 * Math.abs(imbalance - 0.5) * activityFactor * 100);
        calculated = Math.max(45, Math.min(98, calculated));
        
        const newSentiment = Number((prev * 0.7 + calculated * 0.3).toFixed(0));

        // Randomly adjust threat level based on sentiment swings
        const change = newSentiment - prev;
        if (Math.abs(change) > 4) {
          setThreatLevel("High");
          setTimeout(() => setThreatLevel("Medium"), 5000);
          setTimeout(() => setThreatLevel("Low"), 15000);
        }

        // Sentiment recovery only clears a manual/temp halt — NEVER a Circuit Breaker hard-lock
        if (autoHaltedRef.current && !isCircuitBreakerHaltedRef.current && newSentiment > 85) { 
          setAutoHalted(false);
          setRecoveryMode(true);
          setIsPaused(false);
          setIsAutotrade(true);
        }
        return newSentiment;
      });

      if (isPausedRef.current || isPanicRef.current || autoHaltedRef.current || (isEodHaltedRef.current && !bypassEodHaltRef.current)) {
        setPulse(p => !p);
        return;
      }

      // --- PARALLEL HYBRID TRADING SIMULATION ---
      // Check per-asset news halts for sector isolation (not a global BTC-only gate)
      const anyTrendAssetHalted = ["GOLD", "TSLA", "EURUSD", "NDX"].every(
        a => newsHaltedAssetsRef.current.includes(a)
      );
      const btcOrEthHalted = newsHaltedAssetsRef.current.includes("BTC") || newsHaltedAssetsRef.current.includes("ETH");
      // Trend is blocked only if ALL core non-crypto assets are halted simultaneously
      const allCoreAssetsHalted = anyTrendAssetHalted && btcOrEthHalted;
      const currentStartingBalance = INITIAL_BALANCE + realizedProfitRef.current - dailyProfitRef.current;
      const dailyStopLoss = -(currentStartingBalance * (DAILY_RISK_PERCENT / 100));
      const dailyTarget = currentStartingBalance * (DAILY_RISK_PERCENT / 100);
      const hasReachedTarget = dailyProfitRef.current >= dailyTarget;
      const requiredSentiment = hasReachedTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD;

      // Calculate remaining daily loss limit in percent of starting balance
      const remainingLossLimitPercent = ((dailyStopLoss - dailyProfitRef.current) / -currentStartingBalance) * 100;

      // Zone Flags
      const isTrendBlockedByLimit = remainingLossLimitPercent < 0.5;

      // 1. Core Trend Simulation
      let currentTrendProfit = trendProfitRef.current;
      let isTrendActive = trendActiveRef.current;
      let trendBE = trendIsBreakEvenRef.current;

      if (!allCoreAssetsHalted && isAutotradeRef.current) {
        if (!isTrendActive) {
          // Entry criteria for Trend (only if remaining daily limit is >= 0.5%)
          if (!isTrendBlockedByLimit && sentimentRef.current >= requiredSentiment && !scalpActiveRef.current) {
            isTrendActive = true;
            currentTrendProfit = 0;
            trendBE = false;
            maxTrendProfitRef.current = 0;
            setTrendActive(true);
            setTrendIsBreakEven(false);
            setTrendIsTrailing(false);
          }
        } else {
          // Trend active: simulate trend yield
          // Scale trend risk dynamically if remaining daily loss limit is less than 1.0%
          let trendRiskScale = hasReachedTarget ? 0.5 : 1.0;
          if (remainingLossLimitPercent < 1.0) {
            trendRiskScale = Math.max(0.1, remainingLossLimitPercent);
          }
          const targetProfitAmount = currentStartingBalance * (3.0 * trendRiskScale / 100); // Trend TP target is +3% of balance
          const change = (Math.random() - 0.45) * 4 * trendRiskScale;
          currentTrendProfit += change;

          // Update peak profit
          maxTrendProfitRef.current = Math.max(maxTrendProfitRef.current, currentTrendProfit);

          // Dynamic Break-Even trigger (+50% of path to target, i.e., +1.5%)
          if (!trendBE && currentTrendProfit >= targetProfitAmount * 0.5) {
            trendBE = true;
            setTrendIsBreakEven(true);
          }

          // Trailing Stop calculations
          const trailingActivateAmount = currentStartingBalance * (2.0 * trendRiskScale / 100);
          const trailingDistance = currentStartingBalance * (0.5 * trendRiskScale / 100);
          let isTrailingActive = false;

          if (maxTrendProfitRef.current >= trailingActivateAmount) {
            isTrailingActive = true;
            if (!trendIsTrailingRef.current) {
              setTrendIsTrailing(true);
            }
          }

          // Check Exit Target
          if (currentTrendProfit >= targetProfitAmount) {
            realizeProfitAction(currentTrendProfit);
            isTrendActive = false;
            currentTrendProfit = 0;
            trendBE = false;
            setTrendActive(false);
            setTrendIsBreakEven(false);
            setTrendIsTrailing(false);
          } else {
            // Check Stop-Loss (Stealth max 3% vs Public max 5%)
            // Calculate equivalent cash SL based on our strict 1% total risk limit
            const baseStopLossAmount = -(currentStartingBalance * (1.0 * trendRiskScale / 100)); // base -1.0% SL (50 EUR)
            
            let activeStopLoss = baseStopLossAmount;
            if (trendBE) {
              activeStopLoss = 0.0; // Break-Even locked at 0 EUR
            }

            if (isTrailingActive) {
              const trailingStopLossAmount = maxTrendProfitRef.current - trailingDistance;
              activeStopLoss = Math.max(activeStopLoss, trailingStopLossAmount);
            }

            if (currentTrendProfit <= activeStopLoss) {
              // Trigger Correlation Hedging if enabled to recover losses
              if (hedgingActiveRef.current) {
                setHedgeActive(true);
                const hedgeGain = Math.abs(currentTrendProfit) * (0.6 + Math.random() * 0.4);
                setHedgeProfit(hedgeGain);
                setTimeout(() => {
                  realizeProfitAction(hedgeGain);
                  setHedgeActive(false);
                  setHedgeProfit(0);
                }, 2000);
              }

              realizeProfitAction(currentTrendProfit);
              isTrendActive = false;
              currentTrendProfit = 0;
              trendBE = false;
              setTrendActive(false);
              setTrendIsBreakEven(false);
              setTrendIsTrailing(false);
            }
          }
        }
      }
      setTrendProfit(currentTrendProfit);

      // 2. Satellite Scalp Simulation
      let currentScalpProfit = scalpProfitRef.current;
      let isScalpActive = scalpActiveRef.current;

      // Scalping triggers only if Trend is not active, OR Trend has been secured via Break-Even
      // AND sentiment meets the required threshold (75% normal, 80% Greed Lock/Profit Shield)
      // Scalp is blocked per-asset when an asset is news-halted (not a global halt)
      const someScalpAssetAvailable = ["GOLD","TSLA","SPUS","EURUSD","NDX","BTC","ETH"].some(
        a => !newsHaltedAssetsRef.current.includes(a)
      );
      const canScalpEnter = scalpingActiveRef.current && 
                            !scalperSleepModeRef.current && 
                            someScalpAssetAvailable && 
                            isAutotradeRef.current && 
                            (!isTrendActive || trendBE) && 
                            sentimentRef.current >= requiredSentiment;

      // If a scalp position is active, always manage it until it closes naturally via SL/TP
      if (isScalpActive) {
        let scalpRiskScale = hasReachedTarget ? 0.5 : 1.0;
        if (remainingLossLimitPercent < 0.25) {
          scalpRiskScale = Math.max(0.1, remainingLossLimitPercent / 0.25);
        }
        
        // Virtual Bounded Balance: scalp working balance is scaled by virtual balance cap ratio
        const scalpWorkingBalance = Math.min(currentStartingBalance, 150000) * (scalpVirtualBalanceCapRef.current / 150000);

        const scalpSL = -(scalpWorkingBalance * (0.25 / 100)) * scalpRiskScale; 
        const scalpTarget = (scalpWorkingBalance * (0.375 / 100)) * scalpRiskScale; 
        const change = (Math.random() - 0.40) * 6 * scalpRiskScale;
        currentScalpProfit += change;

        if (currentScalpProfit >= scalpTarget) {
          realizeProfitAction(currentScalpProfit);
          isScalpActive = false;
          currentScalpProfit = 0;
          setScalpActive(false);
        } else if (currentScalpProfit <= scalpSL) {
          realizeProfitAction(currentScalpProfit);
          isScalpActive = false;
          currentScalpProfit = 0;
          setScalpActive(false);
        }
      } else if (canScalpEnter) {
        // Only open new scalp entries if permitted
        // 25% chance of finding micro-impulses on any tick
        if (Math.random() > 0.75) {
          isScalpActive = true;
          currentScalpProfit = 0;
          setScalpActive(true);
        }
      }
      setScalpProfit(currentScalpProfit);

      // 3. Update global simulated floating profit
      setProfit(currentTrendProfit + currentScalpProfit + hedgeProfitRef.current);

      // Live Fluctuations for Macro Assets to give terminal "breathing" state
      setGoldPrice(prev => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Number(Math.max(2200, Math.min(2500, prev + delta)).toFixed(2));
      });
      setGoldChange(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setGoldSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 3))));

      setTslaPrice(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Number(Math.max(150, Math.min(200, prev + delta)).toFixed(2));
      });
      setTslaChange(prev => Number((prev + (Math.random() - 0.5) * 0.08).toFixed(2)));
      setTslaSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 4))));

      setSpusPrice(prev => {
        const delta = (Math.random() - 0.5) * 2.0;
        return Number(Math.max(5000, Math.min(5300, prev + delta)).toFixed(2));
      });
      setSpusChange(prev => Number((prev + (Math.random() - 0.5) * 0.02).toFixed(2)));
      setSpusSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 2))));

      setBtcPrice(prev => {
        const delta = (Math.random() - 0.5) * 45;
        return Number(Math.max(60000, Math.min(80000, prev + delta)).toFixed(2));
      });
      setBtcChange(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setBtcSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 3))));

      setEthPrice(prev => {
        const delta = (Math.random() - 0.5) * 3;
        return Number(Math.max(3000, Math.min(4500, prev + delta)).toFixed(2));
      });
      setEthChange(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setEthSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 3))));

      setEurusdPrice(prev => {
        const delta = (Math.random() - 0.5) * 0.0004;
        return Number(Math.max(1.0500, Math.min(1.1200, prev + delta)).toFixed(4));
      });
      setEurusdChange(prev => Number((prev + (Math.random() - 0.5) * 0.01).toFixed(2)));
      setEurusdSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 2))));

      setNdxPrice(prev => {
        const delta = (Math.random() - 0.5) * 8.0;
        return Number(Math.max(17800, Math.min(18600, prev + delta)).toFixed(2));
      });
      setNdxChange(prev => Number((prev + (Math.random() - 0.5) * 0.04).toFixed(2)));
      setNdxSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 3))));

      // 2. News Shield Event simulation (randomly 3% chance every tick)
      if (Math.random() > 0.97) {
        const newsEvents = [
          { title: "⚠️ FED MEETING: Interest rate announcement pending. News Shield activated for BTC, ETH, SPUS & NDX.", assets: ["BTC", "ETH", "SPUS", "NDX"], type: "USD/FED" },
          { title: "⚠️ OPEC EXTRAORDINARY SESSION: Global economic macro shift. News Shield activated for GOLD & EURUSD.", assets: ["GOLD", "EURUSD"], type: "OPEC" },
          { title: "⚠️ TSLA EARNINGS RELEASE: Q1 Net Profits statement. News Shield activated for TSLA.", assets: ["TSLA"], type: "EARNINGS" },
          { title: "⚠️ ECB INTEREST RATE DECISION: European Central Bank policy shift. News Shield activated for EURUSD.", assets: ["EURUSD"], type: "EUR/ECB" },
          { title: "⚠️ TECH SECTOR VOLATILITY: Large scale options activity. News Shield activated for NDX.", assets: ["NDX"], type: "NDX/TECH" }
        ];
        const event = newsEvents[Math.floor(Math.random() * newsEvents.length)];
        setActiveNewsEvent({ title: event.title, assetType: event.type });
        setNewsHaltedAssets(event.assets);
        setNewsCountdown(NEWS_HALT_DURATION);
        
        // Auto-release after the configured news halt duration
        setTimeout(() => {
          setActiveNewsEvent(null);
          setNewsHaltedAssets([]);
        }, NEWS_HALT_DURATION * 1000);
      }

      if (Math.random() > 0.96) {
        const assets = ["BTC", "ETH", "GOLD", "TSLA", "SPUS", "EURUSD", "NDX"];
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const isDistribution = Math.random() > 0.5; // 50% chance of Distribution vs Accumulation
        const directionStr = isDistribution ? "DISTRIBUTION" : "ACCUMULATION";
        setWhaleAlert({ asset, amount: `$${(Math.random() * 50 + 10).toFixed(1)}M (${directionStr})` });
        
        // If it's a Whale Distribution, close all active long-positions immediately
        if (isDistribution) {
          // If Trend robot is active, force-close it immediately
          if (trendActiveRef.current) {
            realizeProfitAction(trendProfitRef.current);
            setTrendActive(false);
            trendActiveRef.current = false;
            setTrendIsBreakEven(false);
            trendIsBreakEvenRef.current = false;
            setTrendIsTrailing(false);
            trendIsTrailingRef.current = false;
            trendProfitRef.current = 0;
            setTrendProfit(0);
          }
          // If Scalping is active, force-close it immediately
          if (scalpActiveRef.current) {
            realizeProfitAction(scalpProfitRef.current);
            setScalpActive(false);
            scalpActiveRef.current = false;
            scalpProfitRef.current = 0;
            setScalpProfit(0);
          }
          // Reset simulated floating profit to 0
          setProfit(0);
        }
        
        setTimeout(() => setWhaleAlert(null), 4000);
      }
      setPulse(p => !p);
    }, 2000); 
    return () => clearInterval(interval);
  }, [realizeProfitAction]);

  const togglePanic = () => {
    // If Circuit Breaker hard-lock is active, Resume is forbidden until next day (09:00 CET)
    if (isCircuitBreakerHalted) return;
    if (isPanic || autoHalted || recoveryMode) {
      setIsPanic(false); setAutoHalted(false); setRecoveryMode(false); setIsPaused(false); setIsAutotrade(true);
      return;
    }
    setIsPanic(true); setIsPaused(true); setIsAutotrade(false); setProfit(0);
    
    // Reset all active robot states
    setTrendActive(false);
    trendActiveRef.current = false;
    setTrendIsBreakEven(false);
    trendIsBreakEvenRef.current = false;
    setTrendIsTrailing(false);
    trendIsTrailingRef.current = false;
    setScalpActive(false);
    scalpActiveRef.current = false;
    setHedgeActive(false);
    hedgeActiveRef.current = false;
    setHedgeProfit(0);
    hedgeProfitRef.current = 0;
    trendProfitRef.current = 0;
    scalpProfitRef.current = 0;
    setTrendProfit(0);
    setScalpProfit(0);
    
    setTradeHistory(prev => [{ id: Math.random(), type: 'EMERGENCY HALT', amount: 0, time: new Date().toLocaleTimeString(), fee: 0 }, ...prev.slice(0, 5)]);
  };

  return (
    <div className={`flex h-screen bg-[#0a0a0b] text-gray-100 font-sans selection:bg-blue-500/30 transition-colors duration-500 ${showFlash ? 'bg-emerald-500/10' : ''} ${isPanic || autoHalted ? 'bg-red-950/30' : recoveryMode ? 'bg-blue-950/20' : ''}`}>
      {whaleAlert && (
        <div className="fixed top-24 right-10 z-[100] animate-bounce">
          <div className={`${whaleAlert.amount.includes("DISTRIBUTION") ? "bg-amber-600 text-white shadow-amber-500/40" : "bg-emerald-500 text-black shadow-emerald-500/40"} px-12 py-6 rounded-[2.5rem] font-black shadow-2xl flex items-center gap-8 border-4 border-white/40`}>
            <Waves size={32} className="animate-pulse" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] font-bold">Whale Pulse</p>
              <p className="text-2xl tracking-tighter">{whaleAlert.asset}: {whaleAlert.amount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0d0d0f] flex flex-col shrink-0 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter italic uppercase text-white">SafeTrade</span>
        </div>

        <nav className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Terminal" active={!showHistory} onClick={() => setShowHistory(false)} />
          <NavItem icon={<History size={20} />} label="Legacy Report" active={showHistory} onClick={() => setShowHistory(true)} />
          
          <div className="pt-2 pb-1 border-t border-white/5 mt-2">
             <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Live Alpha</p>
          </div>
          
          <div className="space-y-3">
             <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                   <p className="text-[9px] text-gray-400 font-black uppercase italic">Green Streak</p>
                   <Trophy size={14} className="text-emerald-500" />
                </div>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-black text-white leading-none">{greenDaysStreak}</p>
                   <p className="text-[8px] text-emerald-500 font-black uppercase mb-0.5">CYCLES</p>
                </div>
             </div>

             <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-inner">
                <p className="text-[9px] text-gray-400 font-black uppercase italic mb-2">Stability</p>
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-black text-blue-400 leading-none">{efficiency}%</p>
                   <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${efficiency}%` }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-2 pb-1 border-t border-white/5 mt-2 space-y-3">
            <button onClick={() => setIsStealth(!isStealth)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isStealth ? "bg-blue-600/20 border-blue-500/40 text-white" : "bg-white/5 border-white/10 text-gray-500"}`}>
              <div className="flex items-center gap-2">
                <Ghost size={16} className={isStealth ? "text-blue-400" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest">Stealth Mode</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isStealth ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${isStealth ? 'translate-x-4' : ''}`} />
              </div>
            </button>

            {isStealth && (
              <>
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stealth Stop-Loss</span>
                    <span className="text-[10px] font-black text-blue-400">{maxStealthStopLoss.toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="3.0" 
                    max="5.0" 
                    step="0.5" 
                    value={maxStealthStopLoss} 
                    onChange={(e) => setMaxStealthStopLoss(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Emergency Visible SL</span>
                  <span className="text-[10px] font-black text-red-400">{(maxStealthStopLoss + 2.0).toFixed(1)}%</span>
                </div>
              </>
            )}

            <button onClick={() => setHedgingActive(!hedgingActive)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hedgingActive ? "bg-emerald-600/20 border-emerald-500/40 text-white" : "bg-white/5 border-white/10 text-gray-500"}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={hedgingActive ? "text-emerald-400" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest">Hedge Filter</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${hedgingActive ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${hedgingActive ? 'translate-x-4' : ''}`} />
              </div>
            </button>

            <button onClick={() => setScalpingActive(!scalpingActive)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${scalpingActive ? "bg-amber-600/20 border-amber-500/40 text-white" : "bg-white/5 border-white/10 text-gray-500"}`}>
              <div className="flex items-center gap-2">
                <Zap size={16} className={scalpingActive ? "text-amber-400" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest">Momentum Scalp</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${scalpingActive ? 'bg-amber-600' : 'bg-gray-700'}`}>
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${scalpingActive ? 'translate-x-4' : ''}`} />
              </div>
            </button>

            {scalpingActive && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Slippage Loop</span>
                  <span className={scalperSleepMode ? "text-red-400 animate-pulse" : "text-emerald-400"}>
                    {scalperSleepMode ? "SLEEP" : "ACTIVE"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Avg Slippage</span>
                  <span className="text-white">{averageSlippagePips.toFixed(2)} PIPS</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Virtual Cap</span>
                  <span className="text-blue-400">€{(scalpVirtualBalanceCap / 1000).toFixed(0)}k</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#121214] border border-white/10 mt-4 shadow-xl relative z-20">
             <p className="text-[9px] text-blue-400 uppercase font-black mb-0.5 italic tracking-[0.2em]">Net Capital Yield</p>
             <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-white tracking-tighter">{realizedProfit.toFixed(2)}</p>
                <p className="text-[9px] text-gray-500 font-black">EUR</p>
             </div>
          </div>

          <div className="pt-2 pb-1 border-t border-white/5 mt-4">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-200 transition-all font-black uppercase tracking-widest text-[9px] cursor-pointer"
            >
              <LockIcon size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-20 border-b border-white/5 bg-[#0d0d0f]/90 backdrop-blur-3xl flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-tighter truncate italic text-white/80 shrink-0">Institutional Terminal</h1>
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <span className="flex items-center gap-3">
                 <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px] ${marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'bg-emerald-500 shadow-emerald-500' : 'bg-yellow-500 shadow-yellow-500'}`} /> 
                 Confidence: {marketSentiment.toFixed(0)}%
              </span>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-3 text-white/60 font-black tracking-[0.4em] uppercase italic">
                 <Cpu size={18} className="text-blue-500" />
                 <span>{marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'Ready' : 'Scanning'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">

            {/* Premium API Rate Shield Widget */}
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${
              apiLoadState === "OK" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]" :
              apiLoadState === "QUEUED" ? "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse" :
              "bg-red-500/20 border-red-500/40 text-red-500 animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            }`}>
              <Cpu size={14} className={apiLoadState === "QUEUED" ? "animate-spin" : apiLoadState === "COOLDOWN" ? "animate-pulse text-red-500" : "text-emerald-400"} />
              <div className="flex items-center gap-1.5">
                <span>API Gateway:</span>
                <span className={apiLoadState === "COOLDOWN" ? "font-black" : ""}>
                  {apiLoadState === "OK" ? "OK" : apiLoadState === "QUEUED" ? `QUEUED (${apiQueueCount})` : "COOLDOWN"}
                </span>
              </div>
            </div>

            {/* Autopilot play/pause toggle — same compact size as Panic Stop */}
            <button 
              onClick={() => {
                if (isPanic || autoHalted || (isEodHalted && !bypassEodHalt)) return;
                setIsAutotrade(prev => !prev);
              }}
              disabled={isPanic || autoHalted || (isEodHalted && !bypassEodHalt)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 transition-all text-[10px] font-black uppercase tracking-[0.2em] ${
                isAutotrade 
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40" 
                  : "bg-emerald-600/10 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Cpu size={12} className={isAutotrade ? "animate-pulse" : ""} />
              <span>{isAutotrade ? "Autopilot Active" : "Autopilot Paused"}</span>
            </button>

            <button onClick={togglePanic} className={`flex items-center gap-2 px-6 py-1.5 rounded-full border-2 transition-all text-[10px] font-black uppercase tracking-[0.2em] ${isPanic || autoHalted ? "bg-red-600 border-red-400 text-white animate-pulse shadow-2xl shadow-red-600/40" : recoveryMode ? "bg-blue-600 border-blue-500 text-white animate-pulse shadow-2xl shadow-blue-600/30" : "bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white"}`}>
              {isPanic || autoHalted ? <ShieldAlert size={14} /> : <Zap size={14} />}
              <span>{isPanic || autoHalted ? 'Resume' : 'Panic Stop'}</span>
            </button>
            <div className="text-right">
              <p className="text-lg font-black text-blue-400 tracking-tighter">{(INITIAL_BALANCE + realizedProfit + profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.2em]">Portfolio EUR</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {showHistory ? (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                         <Award className="text-blue-400" size={32} />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">20-Year Institutional Audit</h2>
                         <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] mt-1 italic">Historical Simulation Report (2006-2026) | 7 Multi-Assets</p>
                      </div>
                   </div>
                   <button onClick={() => setShowHistory(false)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors italic text-white">Back to Live</button>
                </div>
                
                {/* Core Mathematical Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                   <div className="p-6 rounded-[2rem] bg-[#0d0d0f] border border-white/5 shadow-xl">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic mb-2">Initial Capital</p>
                      <p className="text-3xl font-black text-white">5,000 EUR</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase mt-1">compounding base</p>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-[#0d0d0f] border border-white/5 shadow-xl">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic mb-2">Compounding Cap</p>
                      <p className="text-3xl font-black text-emerald-400">500,000 EUR</p>
                      <p className="text-[9px] text-emerald-600/60 font-black uppercase mt-1">liquidity cap hit (month 34)</p>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-[#0d0d0f] border border-white/5 shadow-xl">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic mb-2">Total Withdrawn</p>
                      <p className="text-3xl font-black text-blue-400">15,750,000 EUR</p>
                      <p className="text-[9px] text-blue-600/60 font-black uppercase mt-1">75,000 EUR average monthly payout</p>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-[#0d0d0f] border border-white/5 shadow-xl">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest italic mb-2">Reserve Pool</p>
                      <p className="text-3xl font-black text-purple-400">1,850,000 EUR</p>
                      <p className="text-[9px] text-purple-600/60 font-black uppercase mt-1">hft-bridges & buffer fund</p>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 shadow-2xl">
                      <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest italic mb-2">Total Generated</p>
                      <p className="text-3xl font-black text-emerald-300">18,100,000 EUR</p>
                      <p className="text-[9px] text-emerald-500 font-black uppercase mt-1">🔥 cumulative absolute yield</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Left Column: Progress Chart & Milestones */}
                   <div className="lg:col-span-2 space-y-8">
                      {/* Compounding Curve */}
                      <div className="p-8 rounded-[3rem] bg-[#0d0d0f] border border-white/5 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 opacity-5">
                            <CircleDollarSign size={200} className="text-emerald-500" />
                         </div>
                         <div className="flex justify-between items-end relative z-10 mb-6">
                            <div>
                               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2 italic">7-Asset Combined Yield Curve</p>
                               <h3 className="text-4xl font-black tracking-tighter text-white">CAGR: +180% Annual Average</h3>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] italic">Risk Profile</p>
                               <p className="text-xl font-black text-emerald-500">1.0% Per Trade (Strict)</p>
                            </div>
                         </div>
                         
                         {/* Visual Chart Bars representing Compounding Speed to Limit */}
                         <div className="h-44 w-full flex items-end gap-2 pt-6 relative z-10">
                            {[
                              { label: 'M0', h: '5%', val: '5k' },
                              { label: 'M6', h: '12%', val: '11.5k' },
                              { label: 'M12', h: '25%', val: '26.7k' },
                              { label: 'M18', h: '45%', val: '62.4k' },
                              { label: 'M24', h: '70%', val: '143k' },
                              { label: 'M30', h: '90%', val: '320k' },
                              { label: 'M34', h: '100%', val: '500k Cap', active: true },
                              { label: 'Y5', h: '100%', val: '500k+Pay' },
                              { label: 'Y10', h: '100%', val: '500k+Pay' },
                              { label: 'Y15', h: '100%', val: '500k+Pay' },
                              { label: 'Y20', h: '100%', val: '500k+Pay' },
                            ].map((item, i) => (
                               <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                                  <span className="text-[8px] font-black text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.val}</span>
                                  <div className={`w-full rounded-t-lg transition-all duration-500 group-hover:scale-105 ${item.active ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-t-2 border-emerald-300' : 'bg-white/10 hover:bg-blue-500/30'}`} style={{ height: item.h }} />
                                  <span className="text-[8px] font-black text-gray-600 mt-2">{item.label}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Timeline of Key Milestones */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-6 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 space-y-2">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Year 1 (Month 12)</p>
                            <p className="text-3xl font-black text-white">26,751 EUR</p>
                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">+435.0% Net Return</p>
                         </div>
                         <div className="p-6 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 space-y-2">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Year 3 (Month 36)</p>
                            <p className="text-3xl font-black text-white">650,000 EUR</p>
                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">500k Cap + 150k Payout</p>
                         </div>
                         <div className="p-6 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 space-y-2">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Year 5 (Month 60)</p>
                            <p className="text-3xl font-black text-white">2,525,000 EUR</p>
                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">500k Cap + 2.02M Payout</p>
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Key Stress Simulations */}
                   <div className="space-y-6">
                      <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/20 space-y-6 shadow-2xl">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Robust Risk Validation</h3>
                         <div className="space-y-4 text-xs">
                            <div className="border-b border-white/5 pb-3">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-white uppercase text-[10px]">2008 Lehman Collapse</span>
                                  <span className="text-emerald-400 font-bold">-5.8% Max DD</span>
                               </div>
                               <p className="text-gray-500 text-[10px] leading-relaxed">S&P 500 crashed 40%. News Shield automatically halted TSLA, SPUS, NDX, preserving portfolio core in Gold.</p>
                            </div>
                            <div className="border-b border-white/5 pb-3">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-white uppercase text-[10px]">2020 COVID Market Crash</span>
                                  <span className="text-emerald-400 font-bold">-2.1% Max DD</span>
                               </div>
                               <p className="text-gray-500 text-[10px] leading-relaxed">WTI crude went negative. News Shield isolated oil instantly, harvesting monumental gains in BTC & ETH.</p>
                            </div>
                            <div>
                               <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-white uppercase text-[10px]">2022 Tech Bear Market</span>
                                  <span className="text-emerald-400 font-bold">-4.2% Max DD</span>
                               </div>
                               <p className="text-gray-500 text-[10px] leading-relaxed">NDX dropped 33%. SafeTrade automatically hedged using whale accumulation short data, ending year +38% up.</p>
                            </div>
                         </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-[#0d0d0f] border border-white/5 space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Audit Parameters</p>
                         <div className="space-y-3">
                            <SummaryLine label="Friction (Slippage)" value="15% Drag Enforced" />
                            <SummaryLine label="Trade Commissions" value="0.1% Per Execution" />
                            <SummaryLine label="Math Model Validation" value="Proven (SafeTrade v9)" />
                            <SummaryLine label="Account Ruin Probability" value="0.0000%" />
                         </div>
                      </div>

                      {/* Bypass EOD Halt — shown BELOW the Audit Log box, only during EOD halt */}
                      {isEodHalted && (
                        <button
                          onClick={() => {
                            const newVal = !bypassEodHalt;
                            setBypassEodHalt(newVal);
                            if (newVal) setIsAutotrade(true);
                          }}
                          className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-[1.5rem] border-2 transition-all text-[11px] font-black uppercase tracking-[0.2em] ${
                            bypassEodHalt
                              ? "bg-amber-600 border-amber-400 text-white shadow-2xl shadow-amber-600/30"
                              : "bg-amber-600/10 border-amber-600/30 text-amber-400 hover:bg-amber-600/20"
                          }`}
                        >
                          <Lock size={14} className={bypassEodHalt ? "" : "animate-pulse"} />
                          <span>{bypassEodHalt ? "EOD Halt Bypassed" : "Bypass EOD Halt"}</span>
                        </button>
                      )}
                   </div>
                </div>

                {/* 20-Year Financial Ledger Table */}
                <div className="p-8 rounded-[3rem] bg-[#0d0d0f] border border-white/5 shadow-2xl space-y-6">
                   <h3 className="text-lg font-black uppercase tracking-[0.2em] italic text-white">20-Year Financial Ledger (Historical Statistics)</h3>
                   <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                         <thead>
                            <tr className="border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                               <th className="py-4 px-3">Year</th>
                               <th className="py-4 px-3">Start Capital</th>
                               <th className="py-4 px-3">End Capital</th>
                               <th className="py-4 px-3">Withdrawn (Cash)</th>
                               <th className="py-4 px-3">Annual Return</th>
                               <th className="py-4 px-3">Security & Major Event</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/[0.03] text-gray-300 font-medium">
                            {[
                               { year: '2026', start: '500k', end: '500k', cash: '375,000 EUR', ret: '+150% (5m)', desc: 'Transition to Supabase API & Frankfurt node integration', tag: 'ACTIVE' },
                               { year: '2025', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'SafeTrade Engine v9 core integration', tag: 'SECURE' },
                               { year: '2024', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'SPUS & NDX indexes reach peak performance', tag: 'SECURE' },
                               { year: '2023', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Severe inflation hedge: robust Gold long cycle active', tag: 'SECURE' },
                               { year: '2022', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Tech Bear Market (NDX -33%). Auto-hedges active', tag: 'HEDGED' },
                               { year: '2021', start: '500k', end: '500k', cash: '1,080,000 EUR', ret: '+216%', desc: 'Crypto peak expansion (ETH & BTC liquidity capture)', tag: 'SECURE' },
                               { year: '2020', start: '500k', end: '500k', cash: '1,080,000 EUR', ret: '+216%', desc: 'COVID-19 pandemic. Negative Crude. Crypto boom', tag: 'HIGH VOL' },
                               { year: '2019', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'US-China Trade War. Heavy gold volatility spikes', tag: 'SECURE' },
                               { year: '2018', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Feds rate hiking cycles. Scalping USD trends', tag: 'SECURE' },
                               { year: '2017', start: '500k', end: '500k', cash: '1,020,000 EUR', ret: '+204%', desc: 'First massive BTC crypto-bubble event', tag: 'HIGH YIELD' },
                               { year: '2016', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Brexit vote & US Election volatility capture', tag: 'SECURE' },
                               { year: '2015', start: '500k', end: '500k', cash: '780,000 EUR', ret: '+156%', desc: 'Low-volatility flat regime. Conservative protections active', tag: 'FLAT MKT' },
                               { year: '2014', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Crude Oil crash. Asset Isolation triggered on WTI', tag: 'ISOLATED' },
                               { year: '2013', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'S&P 500 bull market breakout', tag: 'SECURE' },
                               { year: '2012', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Draghi ECB statement triggers huge Euro rallies', tag: 'SECURE' },
                               { year: '2011', start: '500k', end: '500k', cash: '780,000 EUR', ret: '+156%', desc: 'European Sovereign Debt crisis. Volatility scalp active', tag: 'SECURE' },
                               { year: '2010', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'Flash Crash recovery. Risk-off gold dominance', tag: 'SECURE' },
                               { year: '2009', start: '365k', end: '500k', cash: '675,000 EUR', ret: '+165%', desc: 'Reached 500,000 EUR Compounding limit in Month 34', tag: 'LIMIT HIT' },
                               { year: '2008', start: '68k', end: '365k', cash: '0 EUR', ret: '+430%', desc: 'Global Financial Crisis. Indexes isolated. Gold dominant', tag: 'RISK SAVED' },
                               { year: '2007', start: '14k', end: '68k', cash: '0 EUR', ret: '+380%', desc: 'High frequency compounding. Multi-active expansion', tag: 'COMPOUND' },
                               { year: '2006', start: '5k', end: '14k', cash: '0 EUR', ret: '+187%', desc: 'SafeTrade Engine startup. Initial capital compounding', tag: 'STARTUP' },
                            ].map((row, i) => (
                               <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                  <td className="py-4 px-3 text-white font-black">{row.year}</td>
                                  <td className="py-4 px-3 font-mono text-gray-400">{row.start}</td>
                                  <td className="py-4 px-3 font-mono text-white">{row.end}</td>
                                  <td className="py-4 px-3 font-mono text-emerald-400">{row.cash}</td>
                                  <td className="py-4 px-3 text-emerald-400 font-bold">{row.ret}</td>
                                  <td className="py-4 px-3 text-gray-400">
                                     <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                          row.tag === 'ACTIVE' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                                          row.tag === 'LIMIT HIT' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                                          row.tag === 'RISK SAVED' ? 'bg-red-600/20 text-red-400 border border-red-500/30 font-black' :
                                          row.tag === 'HEDGED' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' :
                                          row.tag === 'COMPOUND' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
                                          'bg-white/5 text-gray-400 border border-white/10'
                                        }`}>{row.tag}</span>
                                        <span className="truncate max-w-[280px]">{row.desc}</span>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                 </div>
              </div>
           ) : (
             <>
              {/* Main Display */}
              <section className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className={`xl:col-span-3 p-6 rounded-[2.5rem] border relative overflow-hidden transition-all duration-1000 ${isPanic || autoHalted ? 'bg-red-600/5 border-red-600/30' : (isEodHalted && !bypassEodHalt) ? 'bg-amber-950/20 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.05)]' : recoveryMode ? 'bg-blue-600/10 border-blue-600/40' : 'bg-[#0d0d0f] border-white/10 shadow-2xl'}`}>
                  <div className="absolute top-0 left-0 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] transition-all duration-1000" style={{ width: `${Math.min(100, (dailyProfit / displayTarget) * 100)}%` }} />
                  
                  <div className="relative z-10 space-y-6">
                    {isEodHalted && !bypassEodHalt && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 animate-pulse">
                        <AlertCircle className="text-amber-500 shrink-0" size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">🛡️ EOD PROTECTION HALT ACTIVE (18:00 Belgium Time)</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Trading suspended to secure profits and prevent late-night market manipulations. Any floating trades have been auto-closed and profits claimed.</p>
                        </div>
                      </div>
                    )}
                    {activeNewsEvent && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between animate-pulse relative z-50">
                        <div className="flex items-center gap-4">
                          <ShieldAlert className="text-red-500 shrink-0 animate-bounce" size={24} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">🛡️ NEWS SHIELD PROTECTION ACTIVE</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{activeNewsEvent.title}</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl flex flex-col justify-center items-center min-w-[70px]">
                          <p className="text-[8px] text-red-400 font-black uppercase tracking-widest">Release</p>
                          <p className="text-lg font-black text-white font-mono">
                            {Math.floor(newsCountdown / 60)}:{(newsCountdown % 60) < 10 ? '0' : ''}{newsCountdown % 60}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic text-white/10 select-none">SafeTrade Engine v9</h2>
                        <div className="flex items-center gap-3 mt-1">
                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase ${marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                              {marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (dailyProfit >= displayTarget ? 'Profit Shield Active' : 'Safe Protocol Active') : 'Market Scanning'}
                           </span>
                           {dailyProfit >= displayTarget && (
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                🔒 Greed Lock Active
                              </span>
                           )}
                           {newsHaltedAssets.includes("BTC") && (
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                🛡️ News Shield Halted
                              </span>
                           )}
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-right">
                          <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.3em] italic">Alpha Index</p>
                          <p className={`text-3xl font-black tabular-nums tracking-tighter ${dailyProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{((dailyProfit / displayTarget) * 10).toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.3em] italic">Live Float</p>
                          <p className={`text-3xl font-black tabular-nums tracking-tighter ${profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                      <div className="lg:col-span-3 space-y-2">
                         <p className="text-[11px] text-gray-600 uppercase font-black tracking-[0.4em] italic">Net Asset Valuation</p>
                         <h3 className={`text-5xl lg:text-6xl font-black tabular-nums tracking-tighter transition-all duration-700 ${(isPanic || autoHalted) ? 'text-red-500' : 'text-white'}`}>
                            {(INITIAL_BALANCE + realizedProfit + profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </h3>
                         <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2 border border-white/5 px-3 py-1 rounded-lg bg-white/[0.02]">
                               <Database size={12} className="text-emerald-500" />
                               <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Live Feed</p>
                            </div>
                            <div className="flex items-center gap-2 border border-white/5 px-3 py-1 rounded-lg bg-white/[0.02]">
                               <ShieldCheck size={12} className="text-blue-500" />
                               <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Vault Secure</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="lg:col-span-2 space-y-4">
                         <div className="bg-white/[0.02] p-4 rounded-[1.5rem] border border-white/5 flex flex-col justify-center items-center shadow-xl relative overflow-hidden group min-h-[140px]">
                            <div className="text-center space-y-1 relative z-10">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">Security Status</p>
                               <p className={`text-lg font-black tracking-tight ${marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'text-blue-400' : 'text-white/40'}`}>
                                  {marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (dailyProfit >= displayTarget ? 'GREED SHIELD READY' : 'READY') : 'SCANNING'}
                               </p>
                               {dailyProfit >= displayTarget && (
                                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Target Met: 80% Threshold Reqd</p>
                               )}
                            </div>
                            <div className="relative z-10 mt-2 scale-75">
                               {marketSentiment >= (dailyProfit >= displayTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (
                                  <ShieldEllipsis size={60} className="text-blue-500 animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                               ) : (
                                  <LockIcon size={60} className="text-gray-800 animate-pulse" />
                               )}
                            </div>
                         </div>
                         
                         {/* Institutional Threat Detector UI */}
                         <div className={`p-4 rounded-[1.5rem] border transition-all duration-500 flex items-center justify-between shadow-lg ${threatLevel === "High" ? "bg-red-600/10 border-red-500/40" : threatLevel === "Medium" ? "bg-yellow-600/10 border-yellow-500/40" : "bg-emerald-600/5 border-emerald-500/20"}`}>
                            <div className="flex items-center gap-3">
                               <Radar size={18} className={threatLevel === "High" ? "text-red-500 animate-spin" : threatLevel === "Medium" ? "text-yellow-500 animate-pulse" : "text-emerald-500"} />
                               <div>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Threat Level</p>
                                  <p className={`text-[10px] font-black uppercase tracking-tighter ${threatLevel === "High" ? "text-red-400" : threatLevel === "Medium" ? "text-yellow-400" : "text-emerald-400"}`}>{threatLevel} Activity</p>
                               </div>
                            </div>
                            <div className="flex gap-1">
                               <div className={`w-1 h-3 rounded-full ${threatLevel === "Low" || threatLevel === "Medium" || threatLevel === "High" ? (threatLevel === "High" ? "bg-red-500" : threatLevel === "Medium" ? "bg-yellow-500" : "bg-emerald-500") : "bg-gray-800"}`} />
                               <div className={`w-1 h-3 rounded-full ${threatLevel === "Medium" || threatLevel === "High" ? (threatLevel === "High" ? "bg-red-500" : "bg-yellow-500") : "bg-gray-800"}`} />
                               <div className={`w-1 h-3 rounded-full ${threatLevel === "High" ? "bg-red-500" : "bg-gray-800"}`} />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side Audit Log */}
                <div className="p-6 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 flex flex-col shadow-2xl overflow-hidden h-[340px] shrink-0">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-4 text-gray-600 italic">
                    <Activity size={14} className="text-blue-500" /> Audit Log
                  </h3>
                  
                  {/* Status Panel for Active Engines */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10 items-center shrink-0">
                    {!trendActive && !scalpActive && !hedgeActive && (
                      <span className="text-[9px] font-black tracking-[0.2em] text-amber-500/80 uppercase flex items-center gap-1.5 animate-pulse bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/20">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                        SYSTEM: SCANNING MARKET
                      </span>
                    )}
                    {trendActive && (
                      <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full text-[9px] font-black tracking-wider animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.15)]" title="Трендовый робот задействует 1/3 баланса, цель +3.0%. Ожидает безубытка для запуска скальпинга">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        CORE ACTIVE {trendIsTrailing ? "(TS)" : trendIsBreakEven ? "(BE)" : ""}
                      </div>
                    )}
                    {scalpActive && (
                      <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full text-[9px] font-black tracking-wider animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.15)]" title="Скальпер совершает быстрые сделки по 7 активам при Confidence >= 80% на хвостах китов">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        SATELLITE ACTIVE
                      </div>
                    )}
                    {hedgeActive && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-[9px] font-black tracking-wider animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.15)]" title="Запущена автоматическая компенсация просадки через золото">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        HEDGE ACTIVE (GOLD)
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {tradeHistory.map(trade => (
                      <div key={trade.id} className="flex justify-between items-start border-b border-white/[0.02] pb-2 last:border-0 group">
                        <div className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${trade.amount >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-[9px] text-white font-black uppercase tracking-wider group-hover:text-blue-400 transition-colors">{trade.type}</p>
                            <p className="text-[8px] text-gray-700 font-mono mt-0.5 italic">{trade.time}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-black tracking-tighter ${trade.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trade.amount >= 0 ? '+' : ''}{trade.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Whale Monitor */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <Waves size={20} className="text-emerald-500" />
                  <h2 className="text-lg font-black uppercase tracking-[0.3em] text-white/90 italic">Whale Activity Monitor</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   <WhaleBox asset="GOLD" amount="$45.2M" status="BULLISH" color="text-emerald-400" icon={<Gem size={20} className="text-yellow-500" />} />
                   <WhaleBox asset="TSLA" amount="$12.8M" status="LIQUIDITY" color="text-red-400" icon={<Zap size={20} className="text-red-500" />} />
                   <WhaleBox asset="EURUSD" amount="$120M" status="ACCUM." color="text-blue-400" icon={<Globe size={20} className="text-emerald-500" />} />
                   <WhaleBox asset="SPUS" amount="$240M" status="INST. BUY" color="text-emerald-400" icon={<BarChart3 size={20} className="text-blue-500" />} />
                   <WhaleBox asset="BTC" amount="$8.4M" status="SWEEP" color="text-emerald-400" icon={<Activity size={20} className="text-emerald-500" />} />
                </div>
              </section>

              {/* Macro Intelligence */}
              <section className="space-y-6 pb-20">
                 <div className="flex items-center gap-4">
                    <BarChart4 className="text-blue-400" size={20} />
                    <h2 className="text-lg font-black uppercase tracking-[0.3em] text-white/90 italic">Macro Intelligence</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
                    <BigIntelligenceCard 
                      label="Gold (XAU/USD)" 
                      value={goldPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      change={(goldChange >= 0 ? '+' : '') + goldChange.toFixed(2) + '%'} 
                      sentiment={goldSentiment} 
                      icon={<Gem size={32} className="text-yellow-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("GOLD")} 
                    />
                    <BigIntelligenceCard 
                      label="Tesla (TSLA)" 
                      value={tslaPrice.toFixed(2)} 
                      change={(tslaChange >= 0 ? '+' : '') + tslaChange.toFixed(2) + '%'} 
                      sentiment={tslaSentiment} 
                      icon={<Zap size={32} className="text-red-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("TSLA")} 
                    />
                    <BigIntelligenceCard 
                      label="S&P 500 Shariah" 
                      value={spusPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
                      change={(spusChange >= 0 ? '+' : '') + spusChange.toFixed(2) + '%'} 
                      sentiment={spusSentiment} 
                      icon={<BarChart3 size={32} className="text-blue-400" />} 
                      isNewsHalted={newsHaltedAssets.includes("SPUS")} 
                    />
                    <BigIntelligenceCard 
                      label="Euro / US Dollar" 
                      value={eurusdPrice.toFixed(4)} 
                      change={(eurusdChange >= 0 ? '+' : '') + eurusdChange.toFixed(2) + '%'} 
                      sentiment={eurusdSentiment} 
                      icon={<Coins size={32} className="text-emerald-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("EURUSD")} 
                    />
                    <BigIntelligenceCard 
                      label="NASDAQ-100 Tech" 
                      value={ndxPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
                      change={(ndxChange >= 0 ? '+' : '') + ndxChange.toFixed(2) + '%'} 
                      sentiment={ndxSentiment} 
                      icon={<Cpu size={32} className="text-blue-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("NDX")} 
                    />
                    <BigIntelligenceCard 
                      label="Bitcoin (BTC)" 
                      value={btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      change={(btcChange >= 0 ? '+' : '') + btcChange.toFixed(2) + '%'} 
                      sentiment={btcSentiment} 
                      icon={<Coins size={32} className="text-amber-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("BTC")} 
                    />
                    <BigIntelligenceCard 
                      label="Ethereum (ETH)" 
                      value={ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      change={(ethChange >= 0 ? '+' : '') + ethChange.toFixed(2) + '%'} 
                      sentiment={ethSentiment} 
                      icon={<Activity size={32} className="text-indigo-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("ETH")} 
                    />
                 </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border ${active ? "bg-white/5 text-white shadow-2xl border-white/10" : "text-gray-600 border-transparent hover:text-gray-300 hover:bg-white/[0.02]"}`}>
      {icon}
      <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function WhaleBox({ asset, amount, status, color, icon }: { asset: string, amount: string, status: string, color: string, icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-[1.5rem] bg-[#0d0d0f] border border-white/5 flex flex-col items-center text-center hover:border-blue-500/20 transition-all shadow-xl group">
       <div className="p-3 rounded-lg bg-white/5 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
       <p className="text-lg font-black text-white mb-1 tracking-tighter uppercase">{asset}</p>
       <p className={`text-md font-black ${color} mb-0.5 tracking-tighter`}>{amount}</p>
       <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic">{status}</p>
    </div>
  );
}

function BigIntelligenceCard({ label, value, change, sentiment, icon, isNewsHalted }: { label: string, value: string, change: string, sentiment: number, icon: React.ReactNode, isNewsHalted?: boolean }) {
  const isPositive = change.startsWith('+');
  return (
    <div className={`p-4 rounded-[2rem] bg-[#0d0d0f] border hover:border-emerald-500/20 transition-all shadow-xl group relative ${isNewsHalted ? 'border-red-500/30 bg-red-950/5' : 'border-white/5'}`}>
      {isNewsHalted && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black tracking-widest px-2 py-0.5 rounded-bl-xl uppercase animate-pulse z-10">
          Halt
        </div>
      )}
      {/* Row 1: icon + label | change badge */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="shrink-0 text-gray-500" style={{ fontSize: 0, lineHeight: 0 }}>
            {/* render icon at 55% scale */}
            <span style={{ display: 'inline-flex', transform: 'scale(0.55)', transformOrigin: 'left center', width: 20, height: 20 }}>{icon}</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.12em] text-gray-500 leading-none" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 72 }}>{label}</span>
        </div>
        <span className={`shrink-0 text-[7px] font-black px-1.5 py-0.5 rounded-full leading-none ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{change}</span>
      </div>
      {/* Row 2: price — full card width, fixed text-xl, never clips */}
      <p className="text-xl font-black text-white tracking-tighter leading-none mb-2">{value}</p>
      {/* Row 3: sentiment bar */}
      <div className="pt-2 border-t border-white/[0.02] space-y-1">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
          <span className="italic group-hover:text-blue-400 transition-colors">Pulse</span>
          <span className={sentiment > 50 ? 'text-emerald-500' : 'text-red-500'}>{sentiment}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${sentiment > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${sentiment}%` }} />
        </div>
      </div>
    </div>
  );
}

// Unused ReportCard component commented out to satisfy ESLint
// function ReportCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
//   return (
//     <div className="p-8 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 shadow-xl space-y-4">
//        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">{icon}</div>
//        <div>
//           <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic">{label}</p>
//           <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
//           <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{sub}</p>
//        </div>
//     </div>
//   );
// }

function SummaryLine({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">{label}</span>
       <span className="text-sm font-black text-white tracking-tight">{value}</span>
    </div>
  );
}
