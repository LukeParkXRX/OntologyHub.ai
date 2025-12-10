"use client";

import { Brain, Target, Lightbulb, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
                <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Brain className="h-5 w-5 text-primary" />
                            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                            OntologyHub<span className="text-primary">.AI</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="text-foreground/60 hover:text-primary transition-colors">Graph Engine</Link>
                        <Link href="/version" className="text-foreground/60 hover:text-primary transition-colors">버전</Link>
                        <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-foreground/70">
                            v0.4.0 Beta
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 opacity-40 pointer-events-none" />

                    <div className="container max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                            <Target className="h-3.5 w-3.5" />
                            <span>About Us</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 mb-6">
                            Building the Knowledge Layer <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-indigo-500">
                                for the AI Era
                            </span>
                        </h1>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 border-t border-white/5">
                    <div className="container max-w-5xl mx-auto px-6">
                        <div className="grid md:grid-cols-12 gap-12 items-start">
                            <div className="md:col-span-4">
                                <div className="sticky top-24">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Lightbulb className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Our Mission</h2>
                                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-violet-500 rounded-full" />
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-6 text-lg text-foreground/80 leading-relaxed">
                                <p>
                                    OntologyHub.AI was created to solve one of the biggest challenges in the AI era:
                                    <span className="text-foreground font-semibold"> the lack of structured, trusted knowledge that AI can truly understand.</span>
                                </p>
                                <p>
                                    LLMs are powerful, but they hallucinate because they rely on patterns—not meaning.
                                    We believe the future of AI requires a foundation built on <span className="text-primary font-semibold">concepts, relationships, and context</span>, not just probabilities.
                                </p>
                                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                                    <p className="text-xl font-semibold text-foreground">
                                        Our mission is simple: Turn unstructured text into intelligent, ontology-based knowledge systems that power accurate, scalable AI.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Section */}
                <section className="py-16 border-t border-white/5 bg-white/[0.02]">
                    <div className="container max-w-5xl mx-auto px-6">
                        <div className="grid md:grid-cols-12 gap-12 items-start">
                            <div className="md:col-span-4">
                                <div className="sticky top-24">
                                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                                        <Zap className="h-6 w-6 text-violet-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Why OntologyHub.AI</h2>
                                    <div className="h-1 w-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-6 text-lg text-foreground/80 leading-relaxed">
                                <p>
                                    Today, over <span className="text-foreground font-semibold">80% of valuable information</span> lives inside documents, reports, PDFs, and conversations.
                                    But this knowledge remains locked—unstructured, unconnected, and invisible to AI.
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    OntologyHub.AI unlocks it.
                                </p>
                                <p>
                                    We transform raw text into dynamic knowledge graphs, revealing hidden meaning, semantic structure, and domain-specific intelligence.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                    {[
                                        "Build AI with dramatically reduced hallucination",
                                        "Create reusable domain knowledge models",
                                        "Understand complex systems at a glance",
                                        "Transform documents into actionable intelligence"
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm text-foreground/90">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What We Offer */}
                <section className="py-16 border-t border-white/5">
                    <div className="container max-w-5xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to build and scale ontology-powered intelligence
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "AI-driven concept & relationship extraction", icon: Brain },
                                { title: "Interactive knowledge graph visualization", icon: Target },
                                { title: "Recursive graph expansion & exploration", icon: ArrowRight },
                                { title: "Domain ontology templates", badge: "Coming Soon", icon: Lightbulb },
                                { title: "Hybrid LLM + Ontology reasoning engine", icon: Zap },
                                { title: "Enterprise-grade integrations & APIs", icon: CheckCircle2 }
                            ].map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={i} className="p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm hover:border-primary/30 transition-all group">
                                        <Icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                                        {feature.badge && (
                                            <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                {feature.badge}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-20 border-t border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="container max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-8">Our Vision</h2>
                        <div className="space-y-6 text-xl text-foreground/80 leading-relaxed">
                            <p>
                                We envision a world where every organization has <br className="hidden sm:block" />
                                <span className="text-foreground font-semibold">its own living, evolving knowledge system</span>—
                            </p>
                            <p>
                                a foundation that makes AI safer, smarter, and truly aligned with human understanding.
                            </p>
                            <div className="pt-8">
                                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-indigo-500">
                                    OntologyHub.AI is not just a tool.
                                </p>
                                <p className="text-2xl font-bold text-foreground mt-2">
                                    It's the knowledge layer the AI era has been waiting for.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
                            >
                                Start Building
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="container max-w-screen-2xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>© 2025 OntologyHub.AI • Building the future of knowledge-powered AI</p>
                </div>
            </footer>
        </div>
    );
}
