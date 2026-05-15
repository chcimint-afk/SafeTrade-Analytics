"use client";

import React from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  PieChart, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Bell
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#0a0a0b] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0d0d0f] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SafeTrade
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Activity size={20} />} label="Live Signals" />
          <NavItem icon={<PieChart size={20} />} label="Portfolio" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Adam Magomed</p>
              <p className="text-xs text-gray-500 truncate italic">Senior Trader</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Market Overview</h1>
            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Forex: Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Crypto: 24/7
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0d0d0f]" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="text-right">
              <p className="text-sm font-bold text-blue-400">5,000.00 EUR</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Total Equity</p>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<Wallet className="text-blue-400" />} 
              label="Account Balance" 
              value="5,000.00 EUR" 
              subValue="+12.5% this month"
              positive
            />
            <StatCard 
              icon={<Activity className="text-emerald-400" />} 
              label="Daily Profit / Loss" 
              value="+200.00 EUR" 
              subValue="Target: 4% (+200)"
              progress={100}
              positive
            />
            <StatCard 
              icon={<ShieldCheck className="text-orange-400" />} 
              label="Risk Exposure" 
              value="1.0% Per Trade" 
              subValue="Max Drawdown: 5%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Signals List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Signals</h2>
                <span className="text-xs text-blue-400 hover:underline cursor-pointer">View all</span>
              </div>
              <div className="space-y-3">
                <SignalItem 
                  pair="EUR / USD" 
                  type="BUY" 
                  price="1.0845" 
                  target="1.0920" 
                  strategy="ICT Smart Money" 
                />
                <SignalItem 
                  pair="BTC / USDT" 
                  type="SELL" 
                  price="64,250" 
                  target="62,100" 
                  strategy="Order Block Sweep" 
                />
                <SignalItem 
                  pair="GBP / JPY" 
                  type="BUY" 
                  price="192.40" 
                  target="194.50" 
                  strategy="4% Target" 
                />
              </div>
            </div>

            {/* Placeholder Chart Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Historical Performance</h2>
              </div>
              <div className="h-[400px] rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-12 text-center group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PieChart className="text-gray-600" size={32} />
                </div>
                <h3 className="text-gray-400 font-medium">Chart Module Pending</h3>
                <p className="text-gray-600 text-sm mt-2 max-w-xs">
                  We will integrate TradingView or Recharts in Phase 3 after setting up the API.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5" 
        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
    }`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, subValue, positive = false, progress }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  subValueText?: string,
  subValue: string, 
  positive?: boolean,
  progress?: number
}) {
  return (
    <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          {icon}
        </div>
        {positive ? (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
            <ArrowUpRight size={14} />
            +4.2%
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-400 text-xs font-bold bg-orange-400/10 px-2 py-1 rounded-full">
            <ShieldCheck size={14} />
            Active
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className={`text-xs mt-1 font-medium ${positive ? "text-emerald-500/60" : "text-gray-600"}`}>
          {subValue}
        </p>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}

function SignalItem({ pair, type, price, target, strategy }: { 
  pair: string, 
  type: "BUY" | "SELL", 
  price: string, 
  target: string,
  strategy: string 
}) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
            type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}>
            {type}
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">{pair}</p>
            <p className="text-[10px] text-gray-600 uppercase font-bold">{strategy}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-gray-300">{price}</p>
          <p className="text-[10px] text-gray-600">Entry Price</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
        <div className="text-xs">
          <p className="text-gray-600 mb-0.5">Take Profit</p>
          <p className="font-mono text-emerald-500/80">{target}</p>
        </div>
        <div className="text-xs text-right">
          <p className="text-gray-600 mb-0.5">Est. Profit</p>
          <p className="font-mono text-blue-400">4.0%</p>
        </div>
      </div>
    </div>
  );
}
