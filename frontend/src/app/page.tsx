'use client';

import React from 'react';
import { Network, Sparkles, Map, Database, ArrowRight } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function ComingSoon() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
            {/* Dynamic Background Layer */}
            <AmbientBackground />

            {/* Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center">

                {/* Floating Icon / Brand Mark */}
                <div className="relative mb-12 group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
                    <div className="relative p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
                        <Network className="w-16 h-16 text-cyan-400 animate-spin-slow" />
                    </div>
                </div>

                {/* Main Headlines */}
                <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-cyan-400/80 mb-4 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        Phase 1: Genesis Evolution
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 select-none">
                        Something <br />
                        <span className="text-glow-cyan text-cyan-400">Extraordinary</span> <br />
                        Is Breathing.
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100/40 font-light leading-relaxed tracking-wide">
                        OntologyHub.ai는 분산된 지식을 살아있는 거미줄로 연결하는 <br className="hidden sm:block" />
                        지능형 그래프 엔진의 새로운 패러다임을 준비하고 있습니다.
                    </p>
                </div>

                {/* Action / Progress Area */}
                <div className="mt-16 sm:mt-24 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
                    {/* Progress Indicator */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 w-[65%] rounded-full animate-shimmer" />
                        </div>
                        <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                            Current Stability: 65% Optimized
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 pt-12 border-t border-white/5">
                        {[
                            { icon: Map, title: "Spatial Knowledge", desc: "고차원 데이터 시각화" },
                            { icon: Database, title: "Neural Graph", desc: "의미론적 지식 추출" },
                            { icon: Sparkles, title: "AI Ingestion", desc: "실시간 정보 지능화" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group">
                                <item.icon className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors duration-500" />
                                <div>
                                    <div className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest mb-1">{item.title}</div>
                                    <div className="text-[10px] text-gray-600">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hidden Access for Devs (Subtle cue) */}
                <div className="absolute bottom-8 text-[9px] text-white/[0.03] tracking-[0.5em] select-none uppercase transition-opacity hover:opacity-100 opacity-20">
                    Neural Nodes Initialized // System Version 0.4.0
                </div>
            </div>

            {/* Global CSS for custom animations/effects */}
            <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        .text-glow-cyan {
          text-shadow: 0 0 30px rgba(34, 211, 238, 0.4);
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
          background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </main>
    );
}
