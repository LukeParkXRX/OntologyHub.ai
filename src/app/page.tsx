"use client";

import dynamic from "next/dynamic";

// Dynamically import NetworkBackground
const NetworkBackground = dynamic(() => import("@/components/NetworkBackground"), {
  ssr: false,
});

const FloatingLines = dynamic(() => import("@/components/FloatingLines"), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <NetworkBackground />
      <FloatingLines />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* Logo & Title */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 backdrop-blur-sm">
            <svg className="w-12 h-12 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="4" r="2" />
              <circle cx="20" cy="12" r="2" />
              <circle cx="12" cy="20" r="2" />
              <circle cx="4" cy="12" r="2" />
              <line x1="12" y1="7" x2="12" y2="9" />
              <line x1="15" y1="12" x2="18" y2="12" />
              <line x1="12" y1="15" x2="12" y2="18" />
              <line x1="6" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-4">
            OntologyHub.AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light">
            AI-Powered Knowledge Graph Platform
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-12 animate-fade-in-delay">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Coming Soon
          </span>
        </div>

        {/* Description */}
        <div className="max-w-2xl mb-12 animate-fade-in-delay-2">
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Transform natural language into intelligent knowledge graphs.
            <br />
            Explore and expand complex concepts and relationships visually.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">Automatic Graph Generation</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">Ontology-Based Structure</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">AI-Powered Exploration</span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          opacity: 0;
          animation: fade-in 0.8s ease-out 0.2s forwards;
        }
        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fade-in 0.8s ease-out 0.4s forwards;
        }
      `}</style>
    </div>
  );
}
