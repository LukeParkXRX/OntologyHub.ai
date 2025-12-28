
'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import {
    Network,
    User,
    Settings,
    RotateCcw,
    Globe,
    Linkedin,
    Facebook,
    Instagram,
    Mail,
    Chrome,
    PlusCircle,
    Database
} from 'lucide-react';

interface AppSidebarProps {
    currentMode: 'general' | 'personal';
    onModeChange: (mode: 'general' | 'personal') => void;
    onReset: () => void;
    isGraphActive: boolean;
}

export function AppSidebar({ currentMode, onModeChange, onReset, isGraphActive }: AppSidebarProps) {

    const handleLogin = (provider: string) => {
        signIn(provider);
    };

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-64 rounded-2xl flex flex-col z-50 overflow-hidden transition-all duration-500 bg-[#030712]/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                    OntologyHub<span className="text-blue-400">.ai</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 pl-4">Interactive Knowledge Verse</p>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-4 px-2 tracking-widest">MODES</p>

                {/* General Mode */}
                <button
                    onClick={() => onModeChange('general')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${currentMode === 'general'
                        ? 'bg-blue-600/20 border border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Explore Concept</span>
                </button>

                {/* Personal Mode */}
                <button
                    onClick={() => onModeChange('personal')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${currentMode === 'personal'
                        ? 'bg-purple-600/20 border border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Ontology</span>
                </button>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

                {/* Tools Section (Visible in Personal Mode) */}
                {currentMode === 'personal' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-xs font-semibold text-gray-500 px-2 tracking-widest">CONNECT IDENTITY</p>

                        <div className="grid grid-cols-4 gap-3 px-1">
                            <SourceIcon
                                icon={<Chrome className="w-4 h-4" />}
                                color="text-red-400 hover:text-red-300"
                                label="Google"
                                onClick={() => handleLogin('google')}
                            />
                            <SourceIcon
                                icon={<Linkedin className="w-4 h-4" />}
                                color="text-blue-400 hover:text-blue-300"
                                label="LinkedIn"
                                onClick={() => handleLogin('linkedin')}
                            />
                            <SourceIcon
                                icon={<Facebook className="w-4 h-4" />}
                                color="text-blue-600 hover:text-blue-500"
                                label="Facebook"
                                onClick={() => handleLogin('facebook')}
                            />
                            <SourceIcon
                                icon={<Instagram className="w-4 h-4" />}
                                color="text-pink-500 hover:text-pink-400"
                                label="Instagram"
                                onClick={() => handleLogin('instagram')}
                            />
                        </div>

                        <p className="text-[10px] text-gray-500 text-center pt-2 leading-relaxed">
                            Connect social accounts to<br />construct your Digital Soul.
                        </p>
                    </div>
                )}
            </nav>

            {/* Footer / Reset */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                {isGraphActive && (
                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 p-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Universe</span>
                    </button>
                )}

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">Settings</span>
                </div>
            </div>
        </aside>
    );
}

function SourceIcon({ icon, color, label, onClick }: { icon: React.ReactNode, color: string, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`group relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:scale-110 hover:border-white/20 hover:bg-white/10 ${color}`}
            title={`Connect ${label}`}
        >
            {icon}
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
            </span>
        </button>
    );
}
