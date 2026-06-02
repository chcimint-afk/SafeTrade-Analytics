"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  ArrowRight,
  Zap
} from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070708] text-gray-100 font-sans relative overflow-hidden select-none">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Glassmorphic Container */}
      <div className="w-full max-w-md p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-2xl shadow-2xl relative z-10 transition-all duration-500 hover:border-white/10 hover:shadow-blue-500/5">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center mb-8 space-y-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 animate-bounce">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center justify-center gap-2">
              SafeTrade <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black uppercase not-italic tracking-[0.2em] border border-blue-500/30">Analytics</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5 flex items-center justify-center gap-1.5">
              <Cpu size={12} className="text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Secure Gateway Login</span>
            </p>
          </div>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Authentication Failure</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block ml-2">Secure Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@safetrade.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0d0d0f] border border-white/5 outline-none text-xs text-white placeholder-gray-600 focus:border-blue-500/40 focus:bg-[#0d0d0f]/90 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block ml-2">Access Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0d0d0f] border border-white/5 outline-none text-xs text-white placeholder-gray-600 focus:border-blue-500/40 focus:bg-[#0d0d0f]/90 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-8"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 text-white animate-pulse" />
                <span>Validating Session...</span>
              </>
            ) : (
              <>
                <span>Establish Connection</span>
                <ArrowRight className="w-4 h-4 text-white animate-bounce" style={{ animationDirection: '1s' }} />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-gray-600">
          <span className="flex items-center gap-1.5"><Zap size={10} className="text-blue-500" /> AES-256 Enabled</span>
          <span>SafeTrade Analytics v9</span>
        </div>

      </div>
    </div>
  );
}
