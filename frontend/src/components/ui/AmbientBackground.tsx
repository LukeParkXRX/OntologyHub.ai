
import React from 'react';

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
            {/* Deep Space Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black opacity-90" />

            {/* Luminous Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] animate-float-delayed" />

            {/* Central Glow (Breathing) */}
            <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/10 blur-[100px] animate-pulse-slow mix-blend-screen" />

            {/* Grid Overlay (Semantic Structure) */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #4f4f4f 1px, transparent 1px), linear-gradient(to bottom, #4f4f4f 1px, transparent 1px)',
                    backgroundSize: '4rem 4rem'
                }}
            />

            {/* Noise Texture for Realism */}
            <div className="absolute inset-0 opacity-[0.02] bg-repeat" style={{ backgroundImage: 'url("/noise.png")' }}></div>
        </div>
    );
}
