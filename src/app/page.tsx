"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import NetworkBackground
const NetworkBackground = dynamic(() => import("@/components/NetworkBackground"), {
  ssr: false,
});

const FloatingLines = dynamic(() => import("@/components/FloatingLines"), {
  ssr: false,
});

export default function LandingPage() {
  const [accessCode, setAccessCode] = useState("");
  const [showAccess, setShowAccess] = useState(false);
  const [error, setError] = useState("");

  const handleAccess = () => {
    // Simple access code for development
    if (accessCode === "xrx2024" || accessCode === "ontology") {
      window.location.href = "/workspace";
    } else {
      setError("잘못된 접근 코드입니다.");
      setTimeout(() => setError(""), 3000);
    }
  };

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
            개발 중 (Coming Soon)
          </span>
        </div>

        {/* Description */}
        <div className="max-w-2xl mb-12 animate-fade-in-delay-2">
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            자연어를 입력하면 AI가 자동으로 지식 그래프를 생성합니다.
            <br />
            복잡한 개념과 관계를 시각적으로 탐색하고 확장하세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">지식 그래프 자동 생성</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">온톨로지 기반 구조화</span>
            <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">AI 확장 탐색</span>
          </div>
        </div>

        {/* Access Section */}
        {!showAccess ? (
          <button
            onClick={() => setShowAccess(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">얼리 액세스 신청</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </button>
        ) : (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-slate-400 text-sm mb-4">개발자 접근 코드를 입력하세요</p>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                placeholder="Access Code"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAccess(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAccess}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  접속
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-sm text-slate-500">
          <Link href="/about" className="hover:text-slate-300 transition-colors">
            About
          </Link>
          <Link href="/version" className="hover:text-slate-300 transition-colors">
            Version
          </Link>
          <a href="mailto:info@xrx.studio" className="hover:text-slate-300 transition-colors">
            Contact
          </a>
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
