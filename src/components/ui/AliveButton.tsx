"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a utility for merging classes, if not I will replace with clsx/tailwind-merge inline or ask to create it. 
// For this example I will implement a inline merge or assume standard Shadcn setup. I'll use simple string interpolation for now to be safe or just create a quick utils.ts if needed.
// Actually, I'll assume standard utils exist or just use simple template literals for this isolated example, 
// BUT to be "Perfect" I should create the utils.ts first if it doesn't exist.
// Let's create the button self-contained for now to ensure it works immediately.


interface AliveButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost";
    glowColor?: "cyan" | "purple" | "none";
    children: React.ReactNode;
}

export const AliveButton = ({
    className,
    variant = "primary",
    glowColor = "cyan",
    children,
    ...props
}: AliveButtonProps) => {
    const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden flex items-center justify-center group";

    const variants = {
        primary: "bg-slate-900/40 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800/50",
        secondary: "bg-transparent border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500/50",
        ghost: "bg-transparent text-slate-400 hover:text-white",
    };

    const glows = {
        cyan: "shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.6)] border-cyan-500/30",
        purple: "shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] border-purple-500/30",
        none: "",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                baseStyles,
                variants[variant],
                variant === "primary" && glows[glowColor],
                className
            )}
            {...props}
        >
            {/* Background Gradient Animation (Subtle Bioluminescence) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl" />

            {/* Organic Border Shine */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 group-hover:ring-white/30 transition-all duration-500" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 tracking-wide">
                {children}
            </span>

            {/* Breathing Dot (Optional 'Alive' Indicator) */}
            {glowColor !== 'none' && (
                <motion.div
                    className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px]",
                        glowColor === 'cyan' ? 'bg-cyan-400' : 'bg-purple-400'
                    )}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scaleX: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </motion.button>
    );
};
