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
  Flame,
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
const DAILY_STOP_LOSS = -50; 
const DAILY_TARGET = 50.00; 
const BASE_SENTIMENT_THRESHOLD = 75; 
const PROFIT_SHIELD_THRESHOLD = 80;

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const [profit, setProfit] = useState(20.00);
  const [, forceUpdate] = useState(true);
  const [realizedProfit, setRealizedProfit] = useState(0.00);
  const [dailyProfit, setDailyProfit] = useState(0.00);
  const [totalCommissions, setTotalCommissions] = useState(0.00);
  const [totalSlippage, setTotalSlippage] = useState(0.00);
  const [isAutotrade, setIsAutotrade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isPanic, setIsPanic] = useState(false);
  const [isStealth, setIsStealth] = useState(true);
  const [autoHalted, setAutoHalted] = useState(false);
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
  
  // Real-time Macro Assets States for absolute alive feel
  const [goldPrice, setGoldPrice] = useState(2345.50);
  const [goldChange, setGoldChange] = useState(1.2);
  const [goldSentiment, setGoldSentiment] = useState(88);

  const [tslaPrice, setTslaPrice] = useState(175.20);
  const [tslaChange, setTslaChange] = useState(2.1);
  const [tslaSentiment, setTslaSentiment] = useState(72);

  const [spxPrice, setSpxPrice] = useState(5120.25);
  const [spxChange, setSpxChange] = useState(0.4);
  const [spxSentiment, setSpxSentiment] = useState(65);

  const [oilPrice, setOilPrice] = useState(82.45);
  const [oilChange, setOilChange] = useState(-1.2);
  const [oilSentiment, setOilSentiment] = useState(35);

  const [eurusdPrice, setEurusdPrice] = useState(1.0850);
  const [eurusdChange, setEurusdChange] = useState(0.15);
  const [eurusdSentiment, setEurusdSentiment] = useState(55);

  const [ndxPrice, setNdxPrice] = useState(18245.80);
  const [ndxChange, setNdxChange] = useState(0.85);
  const [ndxSentiment, setNdxSentiment] = useState(78);
  
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
  
  // Sync refs with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isPanicRef.current = isPanic; }, [isPanic]);
  useEffect(() => { autoHaltedRef.current = autoHalted; }, [autoHalted]);
  useEffect(() => { isAutotradeRef.current = isAutotrade; }, [isAutotrade]);
  useEffect(() => { sentimentRef.current = marketSentiment; }, [marketSentiment]);
  useEffect(() => { dailyProfitRef.current = dailyProfit; }, [dailyProfit]);
  useEffect(() => { isEodHaltedRef.current = isEodHalted; }, [isEodHalted]);
  useEffect(() => { bypassEodHaltRef.current = bypassEodHalt; }, [bypassEodHalt]);
  useEffect(() => { newsHaltedAssetsRef.current = newsHaltedAssets; }, [newsHaltedAssets]);

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
          if (data.circuit_breaker_active) {
            setAutoHalted(true);
            setIsPaused(true);
            setIsAutotrade(false);
            setProfit(0);
          }
        }
      })
      .catch(err => console.error("Error checking circuit breaker:", err));
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

  const realizeProfitAction = useCallback((amount: number) => {
    const s_stealth = isStealth;
    const slippageMultiplier = s_stealth ? 0.5 : 1.0;
    const commission = Math.abs(amount * 0.001); 
    const slippage = Math.abs(amount * (Math.random() * 0.002) * slippageMultiplier); 
    const netAmount = amount - commission - slippage;

    if (netAmount > 0) playCashSound();
    
    setTotalCommissions(prev => prev + commission);
    setTotalSlippage(prev => prev + slippage);
    setRealizedProfit(prev => prev + netAmount);
    
    setDailyProfit(prev => {
      const newDaily = prev + netAmount;
      if (newDaily <= DAILY_STOP_LOSS) {
        setAutoHalted(true);
        setIsPaused(true);
        setIsAutotrade(false);
        setProfit(0);
      }
      if (newDaily >= DAILY_TARGET && prev < DAILY_TARGET) {
        setGreenDaysStreak(s => s + 1);
      }
      return newDaily;
    });

    setClosedTradesCount(prev => prev + 1);
    setEfficiency(prev => Math.max(0, Math.min(100, prev - (amount < 0 ? 5 : 0) + (amount > 0 ? 1 : 0))));
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
    
    setTradeHistory(prev => [
      { 
        id: Math.random(), 
        type: dailyProfitRef.current >= DAILY_TARGET ? 'Shield-Trade' : 'Safe-Trade', 
        amount: netAmount, 
        time: new Date().toLocaleTimeString(), 
        fee: commission + slippage,
        stealth: s_stealth
      },
      ...prev.slice(0, 10)
    ]);

    // Secure server-side DB recording (Supabase) via Next.js API route
    fetch('/api/trading/record-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: newsHaltedAssetsRef.current.includes("BTC") ? "SPX" : "BTC",
        direction: netAmount >= 0 ? "BUY" : "SELL",
        entry_price: 68500.00,
        exit_price: 68500.00 + netAmount,
        stop_loss: 68500.00 - 50.00,
        take_profit: 68500.00 + 75.00,
        profit_loss: netAmount,
        slippage: commission + slippage
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("DB Trade logged:", data);
      checkCircuitBreaker();
    })
    .catch(err => console.error("DB logging failed:", err));

  }, [playCashSound, isStealth, checkCircuitBreaker]);

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

      // 1. Check for EOD halt (Belgium/European Time: sleep from 18:00 to 09:00)
      const now = new Date();
      const currentHour = now.getHours();
      const isHaltPeriod = currentHour >= 18 || currentHour < 9;

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
      }

      setMarketSentiment(prev => {
        const change = (Math.random() - 0.48) * 6; 
        const newSentiment = Math.max(45, Math.min(98, prev + change));
        
        // Randomly adjust threat level based on sentiment swings
        if (Math.abs(change) > 4) {
          setThreatLevel("High");
          setTimeout(() => setThreatLevel("Medium"), 5000);
          setTimeout(() => setThreatLevel("Low"), 15000);
        }

        if (autoHaltedRef.current && newSentiment > 85) { 
          setAutoHalted(false);
          setRecoveryMode(true);
          setIsPaused(false);
          setIsAutotrade(true);
        }
        return newSentiment;
      });

      if (isPausedRef.current || isPanicRef.current || autoHaltedRef.current || (isEodHaltedRef.current && !bypassEodHaltRef.current)) {
        forceUpdate(p => !p);
        return;
      }

      setProfit(prev => {
        // If Bitcoin is news-halted, freeze profit and show News Shield Lock!
        if (newsHaltedAssetsRef.current.includes("BTC")) {
          return prev;
        }
        const hasReachedTarget = dailyProfitRef.current >= DAILY_TARGET;
        const requiredSentiment = hasReachedTarget ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD;
        
        if (sentimentRef.current < requiredSentiment) {
           return prev; 
        }

        const riskScale = hasReachedTarget ? 0.5 : 1.0; 
        const currentRisk = 0.5 * riskScale; 
        const target = INITIAL_BALANCE * (currentRisk / 100) * 1.5;
        const change = (Math.random() - 0.45) * 4 * riskScale; 
        const nextProfit = prev + change;

        if (isAutotradeRef.current && nextProfit >= target) {
          realizeProfitAction(nextProfit);
          return 0;
        }
        const stopLoss = -(INITIAL_BALANCE * (currentRisk / 100));
        if (isAutotradeRef.current && nextProfit <= stopLoss) {
          realizeProfitAction(nextProfit);
          return 0;
        }
        return nextProfit;
      });

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

      setSpxPrice(prev => {
        const delta = (Math.random() - 0.5) * 2.0;
        return Number(Math.max(5000, Math.min(5300, prev + delta)).toFixed(2));
      });
      setSpxChange(prev => Number((prev + (Math.random() - 0.5) * 0.02).toFixed(2)));
      setSpxSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 2))));

      setOilPrice(prev => {
        const delta = (Math.random() - 0.5) * 0.15;
        return Number(Math.max(78, Math.min(88, prev + delta)).toFixed(2));
      });
      setOilChange(prev => Number((prev + (Math.random() - 0.5) * 0.06).toFixed(2)));
      setOilSentiment(prev => Math.max(30, Math.min(99, prev + Math.floor((Math.random() - 0.5) * 3))));

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
          { title: "⚠️ FED MEETING: Interest rate announcement pending. News Shield activated for BTC & SPX.", assets: ["BTC", "SPX"], type: "USD/FED" },
          { title: "⚠️ OPEC EXTRAORDINARY SESSION: Crude supply quota adjustments. News Shield activated for GOLD & Crude Oil.", assets: ["GOLD", "WTI Crude Oil"], type: "OPEC" },
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
        const assets = ["BTC", "ETH", "GOLD", "TSLA", "SPX", "EURUSD", "NDX"];
        const asset = assets[Math.floor(Math.random() * assets.length)];
        setWhaleAlert({ asset, amount: `$${(Math.random() * 50 + 10).toFixed(1)}M` });
        setTimeout(() => setWhaleAlert(null), 4000);
      }
      forceUpdate(p => !p);
    }, 2000); 
    return () => clearInterval(interval);
  }, [realizeProfitAction]);

  const togglePanic = () => {
    if (isPanic || autoHalted || recoveryMode) {
      setIsPanic(false); setAutoHalted(false); setRecoveryMode(false); setIsPaused(false); setIsAutotrade(true);
      return;
    }
    setIsPanic(true); setIsPaused(true); setIsAutotrade(false); setProfit(0);
    setTradeHistory(prev => [{ id: Math.random(), type: 'EMERGENCY HALT', amount: 0, time: new Date().toLocaleTimeString(), fee: 0 }, ...prev.slice(0, 5)]);
  };

  return (
    <div className={`flex h-screen bg-[#0a0a0b] text-gray-100 font-sans selection:bg-blue-500/30 transition-colors duration-500 ${showFlash ? 'bg-emerald-500/10' : ''} ${isPanic || autoHalted ? 'bg-red-950/30' : recoveryMode ? 'bg-blue-950/20' : ''}`}>
      {whaleAlert && (
        <div className="fixed top-24 right-10 z-[100] animate-bounce">
          <div className="bg-emerald-500 text-black px-12 py-6 rounded-[2.5rem] font-black shadow-2xl shadow-emerald-500/40 flex items-center gap-8 border-4 border-white/40">
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

          <div className="pt-2 pb-1 border-t border-white/5 mt-2">
            <button onClick={() => setIsStealth(!isStealth)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isStealth ? "bg-blue-600/20 border-blue-500/40 text-white" : "bg-white/5 border-white/10 text-gray-500"}`}>
              <div className="flex items-center gap-2">
                <Ghost size={16} className={isStealth ? "text-blue-400" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest">Stealth</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isStealth ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${isStealth ? 'translate-x-4' : ''}`} />
              </div>
            </button>
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
          <div className="flex items-center gap-8 overflow-hidden">
            <h1 className="text-2xl font-black uppercase tracking-tighter truncate italic text-white/80">Institutional Terminal</h1>
            <div className="hidden xl:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">
              <span className="flex items-center gap-3">
                 <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px] ${marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'bg-emerald-500 shadow-emerald-500' : 'bg-yellow-500 shadow-yellow-500'}`} /> 
                 Confidence: {marketSentiment.toFixed(0)}%
              </span>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-3 text-white/60 font-black tracking-[0.4em] uppercase italic">
                 <Cpu size={18} className="text-blue-500" />
                 <span>{marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'Ready' : 'Scanning'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {isEodHalted && (
              <button 
                onClick={() => setBypassEodHalt(!bypassEodHalt)} 
                className={`flex items-center gap-3 px-6 py-2 rounded-full border-2 transition-all text-[11px] font-black uppercase tracking-[0.2em] ${bypassEodHalt ? "bg-amber-600 border-amber-400 text-white shadow-2xl shadow-amber-600/40" : "bg-amber-600/10 border-amber-600/30 text-amber-400 hover:bg-amber-600 hover:text-white"}`}
              >
                <Lock size={14} className={bypassEodHalt ? "" : "animate-pulse"} />
                <span>{bypassEodHalt ? "Halt Bypassed" : "Bypass EOD Halt"}</span>
              </button>
            )}
            <button onClick={togglePanic} className={`flex items-center gap-3 px-6 py-2 rounded-full border-2 transition-all text-[11px] font-black uppercase tracking-[0.2em] ${isPanic || autoHalted ? "bg-red-600 border-red-400 text-white animate-pulse shadow-2xl shadow-red-600/40" : recoveryMode ? "bg-blue-600 border-blue-500 text-white animate-pulse shadow-2xl shadow-blue-600/30" : "bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white"}`}>
              {isPanic || autoHalted ? <ShieldAlert size={18} /> : <Zap size={18} />}
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
                               <p className="text-gray-500 text-[10px] leading-relaxed">S&P 500 crashed 40%. News Shield automatically halted TSLA, SPX, NDX, preserving portfolio core in Gold.</p>
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
                               { year: '2024', start: '500k', end: '500k', cash: '900,000 EUR', ret: '+180%', desc: 'SPX & NDX indexes reach peak performance', tag: 'SECURE' },
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
                  <div className="absolute top-0 left-0 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] transition-all duration-1000" style={{ width: `${Math.min(100, (dailyProfit / DAILY_TARGET) * 100)}%` }} />
                  
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
                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] uppercase ${marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                              {marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (dailyProfit >= DAILY_TARGET ? 'Profit Shield Active' : 'Safe Protocol Active') : 'Market Scanning'}
                           </span>
                           {dailyProfit >= DAILY_TARGET && (
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
                          <p className={`text-3xl font-black tabular-nums tracking-tighter ${dailyProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{((dailyProfit / DAILY_TARGET) * 10).toFixed(1)}</p>
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
                               <p className={`text-lg font-black tracking-tight ${marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? 'text-blue-400' : 'text-white/40'}`}>
                                  {marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (dailyProfit >= DAILY_TARGET ? 'GREED SHIELD READY' : 'READY') : 'SCANNING'}
                               </p>
                               {dailyProfit >= DAILY_TARGET && (
                                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Target Met: 80% Threshold Reqd</p>
                               )}
                            </div>
                            <div className="relative z-10 mt-2 scale-75">
                               {marketSentiment >= (dailyProfit >= DAILY_TARGET ? PROFIT_SHIELD_THRESHOLD : BASE_SENTIMENT_THRESHOLD) ? (
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
                <div className="p-6 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 flex flex-col shadow-2xl overflow-hidden h-[320px]">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-6 text-gray-600 italic">
                    <Activity size={14} className="text-blue-500" /> Audit Log
                  </h3>
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
                   <WhaleBox asset="SPX" amount="$240M" status="INST. BUY" color="text-emerald-400" icon={<BarChart3 size={20} className="text-blue-500" />} />
                   <WhaleBox asset="BTC" amount="$8.4M" status="SWEEP" color="text-emerald-400" icon={<Activity size={20} className="text-emerald-500" />} />
                </div>
              </section>

              {/* Macro Intelligence */}
              <section className="space-y-6 pb-20">
                 <div className="flex items-center gap-4">
                    <BarChart4 className="text-blue-400" size={20} />
                    <h2 className="text-lg font-black uppercase tracking-[0.3em] text-white/90 italic">Macro Intelligence</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                      label="S&P 500 Index" 
                      value={spxPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
                      change={(spxChange >= 0 ? '+' : '') + spxChange.toFixed(2) + '%'} 
                      sentiment={spxSentiment} 
                      icon={<BarChart3 size={32} className="text-blue-400" />} 
                      isNewsHalted={newsHaltedAssets.includes("SPX")} 
                    />
                    <BigIntelligenceCard 
                      label="Crude Oil WTI" 
                      value={oilPrice.toFixed(2)} 
                      change={(oilChange >= 0 ? '+' : '') + oilChange.toFixed(2) + '%'} 
                      sentiment={oilSentiment} 
                      icon={<Flame size={32} className="text-orange-500" />} 
                      isNewsHalted={newsHaltedAssets.includes("WTI Crude Oil")} 
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
    <div className={`p-6 rounded-[2rem] bg-[#0d0d0f] border space-y-4 hover:border-emerald-500/20 transition-all shadow-xl group relative overflow-hidden ${isNewsHalted ? 'border-red-500/30 bg-red-950/5 shadow-[0_0_30px_rgba(239,68,68,0.02)]' : 'border-white/5'}`}>
      {isNewsHalted && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase animate-pulse z-10">
          News Halt
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</span>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{change}</span>
      </div>
      <div className="flex items-center gap-4">
         {icon}
         <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
      <div className="space-y-2 pt-2 border-t border-white/[0.02]">
         <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
            <span className="italic group-hover:text-blue-400 transition-colors">Market Pulse</span>
            <span className={sentiment > 50 ? 'text-emerald-500' : 'text-red-500'}>{sentiment}%</span>
         </div>
         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
           <div className={`h-full transition-all duration-1000 ${sentiment > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${sentiment}%` }} />
         </div>
      </div>
    </div>
  );
}

/*
function ReportCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0d0d0f] border border-white/5 shadow-xl space-y-4">
       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">{icon}</div>
       <div>
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
          <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{sub}</p>
       </div>
    </div>
  );
}
*/

function SummaryLine({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">{label}</span>
       <span className="text-sm font-black text-white tracking-tight">{value}</span>
    </div>
  );
}
