/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Tablet, Battery, Wifi, Signal, RefreshCw } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  activePlatform: 'ios' | 'android' | 'web';
  onChangePlatform: (platform: 'ios' | 'android' | 'web') => void;
}

export default function DeviceFrame({ children, activePlatform, onChangePlatform }: DeviceFrameProps) {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 instead of 0
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="device_frame_container" className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* Platform Switcher Bar */}
      <header id="platform_switcher_header" className="sticky top-0 z-50 flex flex-wrap items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-amber-500 shadow-md">
            <span className="text-sm font-bold tracking-tight text-white">A</span>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
              <span>Aura Dating</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-mono">v1.2 Premium</span>
            </h1>
            <p className="text-xs text-zinc-500 hidden sm:block">Full-Stack Cross-Platform Sandbox with AI Core & Stripe</p>
          </div>
        </div>

        {/* Switcher Buttons */}
        <div className="flex items-center space-x-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
          <button
            id="switch_ios_btn"
            onClick={() => onChangePlatform('ios')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === 'ios'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">iOS Frame</span>
          </button>
          
          <button
            id="switch_android_btn"
            onClick={() => onChangePlatform('android')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === 'android'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Android Frame</span>
          </button>

          <button
            id="switch_web_btn"
            onClick={() => onChangePlatform('web')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === 'web'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop Web</span>
          </button>
        </div>
      </header>

      {/* Main Sandbox Viewport wrapper */}
      <main id="platform_viewport_main" className="flex-1 flex items-center justify-center p-2 sm:p-6 lg:p-8 overflow-x-hidden">
        {activePlatform === 'ios' && (
          <div id="ios_chassis" className="relative w-full max-w-[400px] h-[820px] rounded-[50px] border-8 border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden ring-4 ring-zinc-900/50">
            {/* iOS Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black z-50 flex items-center justify-center space-x-1.5 px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
            </div>

            {/* iOS Status Bar */}
            <div className="h-10 pt-2 px-6 flex items-center justify-between text-zinc-300 bg-zinc-950 text-[11px] font-medium z-40 select-none">
              <span>{timeStr.split(' ')[0]}</span>
              <div className="flex items-center space-x-1.5">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500/30" />
              </div>
            </div>

            {/* App Viewport inside Phone */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
              {children}
            </div>

            {/* iOS Home Indicator */}
            <div className="h-5 bg-zinc-950 flex items-end justify-center pb-1.5 z-40 select-none">
              <div className="w-32 h-1 rounded-full bg-zinc-800"></div>
            </div>
          </div>
        )}

        {activePlatform === 'android' && (
          <div id="android_chassis" className="relative w-full max-w-[400px] h-[820px] rounded-[36px] border-8 border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden ring-4 ring-zinc-900/50">
            {/* Android Camera Pinhole */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-zinc-950 z-50 flex items-center justify-center border border-zinc-900">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80"></div>
            </div>

            {/* Android Status Bar */}
            <div className="h-9 pt-1.5 px-6 flex items-center justify-between text-zinc-400 bg-zinc-950 text-[11px] font-medium z-40 select-none">
              <span className="font-semibold">{timeStr}</span>
              <div className="flex items-center space-x-1">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>

            {/* App Viewport inside Phone */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
              {children}
            </div>

            {/* Android Soft Keys */}
            <div className="h-10 bg-zinc-950 flex items-center justify-around px-8 z-40 border-t border-zinc-900/30 select-none">
              <div className="w-3.5 h-3.5 border-2 border-zinc-700 rounded-sm transform rotate-45"></div>
              <div className="w-4 h-4 border-2 border-zinc-700 rounded-full"></div>
              <div className="w-3.5 h-3.5 border-2 border-zinc-700 rounded-lg"></div>
            </div>
          </div>
        )}

        {activePlatform === 'web' && (
          <div id="desktop_chassis" className="w-full max-w-7xl h-[820px] rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-zinc-800/60">
            {/* Desktop window controls bar */}
            <div className="h-11 px-4 border-b border-zinc-900/80 bg-zinc-950/95 flex items-center justify-between select-none z-40">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/90"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/90"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/90"></div>
              </div>
              <div className="px-10 py-1 bg-zinc-900/60 border border-zinc-800/40 rounded-lg text-xs text-zinc-400 w-96 text-center truncate font-mono select-none">
                https://aura-dating.app/premium-home
              </div>
              <div className="flex items-center text-zinc-500 space-x-3 text-xs">
                <RefreshCw className="w-3.5 h-3.5 hover:text-zinc-300 transition-colors cursor-pointer" />
                <span className="font-mono text-[10px] text-zinc-500">HTTPS TLS 1.3</span>
              </div>
            </div>

            {/* Full Web Layout Area */}
            <div className="flex-1 flex overflow-hidden relative bg-zinc-950">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
