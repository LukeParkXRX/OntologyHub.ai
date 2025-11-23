"use client";

export default function GraphLoadingAnimation() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="relative z-10 text-center space-y-4 animate-pulse">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-primary/60 animate-ping" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Processing...</p>
            </div>
        </div>
    );
}
