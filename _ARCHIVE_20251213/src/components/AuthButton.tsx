"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { User, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AuthButton() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (status === "loading") {
        return (
            <button
                disabled
                className="h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-sm font-medium transition-all flex items-center gap-2"
            >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
            </button>
        );
    }

    if (session?.user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium transition-all flex items-center gap-2"
                >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                        {session.user.name || session.user.email}
                    </span>
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-card border border-white/10 shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b border-white/10">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {session.user.email}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    signOut();
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn()}
            className="h-10 px-6 rounded-lg bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95 text-sm font-semibold text-white transition-all flex items-center gap-2"
        >
            <User className="h-4 w-4" />
            <span>Sign In</span>
        </button>
    );
}
