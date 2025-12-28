'use client';

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Network, Database, Trash2, HelpCircle, RefreshCw, Maximize2, X, Upload, Save } from 'lucide-react';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { AppSidebar } from '@/components/layout/AppSidebar';
import MagicInput from '@/components/MagicInput';

// Dynamically import Graph3D to avoid SSR issues with Three.js
const Graph3D = dynamic(() => import('@/components/Graph3D'), { ssr: false });

// --- Type Definitions ---
type ViewMode = 'hero' | 'general' | 'personal';

// --- Sub-Components ---

const HeroView = ({ onSearch }: { onSearch: (term: string) => void }) => {
    const [input, setInput] = useState('');
    const [idleGraphData, setIdleGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
    const [isTyping, setIsTyping] = useState(false);

    // Generate "Constellation" Background Data
    useEffect(() => {
        const nodes = [];
        const links = [];
        const N = 40; // Number of stars
        for (let i = 0; i < N; i++) {
            nodes.push({ id: `star-${i}`, val: Math.random() * 1.5, label: 'Star', group: 9 });
        }
        for (let i = 0; i < N; i++) {
            if (Math.random() > 0.7) {
                const target = Math.floor(Math.random() * N);
                if (target !== i) links.push({ source: `star-${i}`, target: `star-${target}` });
            }
        }
        setIdleGraphData({ nodes, links });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) onSearch(input);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background: Latent Neural Universe */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none grayscale transition-all duration-1000" style={{ filter: isTyping ? 'grayscale(0%) contrast(1.2)' : 'grayscale(80%)' }}>
                <Graph3D data={idleGraphData} arrangeTrigger={0} /> {/* Static Constellation */}
            </div>

            {/* Visual overlay for depth */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 animate-in fade-in zoom-in duration-1000">
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-glow select-none">
                        OntologyHub.ai
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-200/60 font-light tracking-[0.2em] uppercase">
                        Breathing Life Into Data
                    </p>
                </div>

                {/* The Core: Search Interface */}
                <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
                    {/* Living Ambient Glow (Pulse) */}
                    <div className={`absolute -inset-1 rounded-full blur-2xl transition-all duration-1000 ${isTyping ? 'bg-cyan-500/40 opacity-100 scale-105' : 'bg-amber-500/20 opacity-60 animate-pulse-slow'}`} />

                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setIsTyping(!!e.target.value);
                            }}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(!!input)}
                            placeholder="Enter a concept to ignite..."
                            className={`w-full bg-[#030712]/80 backdrop-blur-2xl border-2 rounded-full px-10 py-8 text-2xl text-white placeholder:text-gray-600 focus:outline-none transition-all duration-500 shadow-2xl
                                ${isTyping
                                    ? 'border-cyan-500/50 shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)]'
                                    : 'border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] hover:border-amber-500/50'
                                }
                            `}
                        />

                        <button
                            type="submit"
                            className={`absolute right-4 p-4 rounded-full transition-all duration-300 ${input ? 'bg-cyan-500 text-black hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-white/5 text-gray-500'}`}
                        >
                            <Network className={`w-6 h-6 ${isTyping ? 'animate-spin-slow' : ''}`} />
                        </button>
                    </div>
                </form>

                {/* Footer / Status */}
                <div className="mt-12 flex gap-6 text-xs text-slate-500 font-mono tracking-widest uppercase">
                    <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-cyan-400 animate-ping' : 'bg-amber-500/50'}`} />
                        System Ready
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        Neural Link Stable
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function Home() {
    // --- State ---
    const [viewMode, setViewMode] = useState<ViewMode>('hero');
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
    const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string, context?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sidebar usually open, can be toggled if needed
    const [showSidebar, setShowSidebar] = useState(true);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [arrangeTrigger, setArrangeTrigger] = useState(0);
    const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());

    const { data: session } = useSession();
    const API_URL = '/api';

    // --- Graph Logic Helper ---
    const mergeGraphData = (existing: any, incoming: any) => {
        const existingNodeIds = new Set(existing.nodes.map((n: any) => n.id));
        const newNodes = incoming.nodes.filter((n: any) => !existingNodeIds.has(n.id));

        const uniqueLinks = new Map();
        [...existing.links, ...incoming.links].forEach(l => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            const key = `${sourceId}-${targetId}-${l.name}`;
            if (!uniqueLinks.has(key)) uniqueLinks.set(key, l);
        });

        return {
            nodes: [...existing.nodes, ...newNodes],
            links: Array.from(uniqueLinks.values())
        };
    };

    // --- Handlers ---

    const handleSearch = async (term: string) => {
        setViewMode('general');
        setIsLoading(true);
        setMessages([{ role: 'agent', text: `Exploring concept: "${term}"...` }]);

        // [ALIVE FIX] Ensure Clean Slate
        setGraphData({ nodes: [], links: [] });

        try {
            const res = await axios.post(`${API_URL}/ingest/search`, { text: term });
            if (res.data.status === 'success') {
                // The backend now filters for LCC and normalizes IDs.
                // We just need to load it.
                setGraphData({ nodes: res.data.nodes, links: res.data.links });
                setArrangeTrigger(prev => prev + 1);
                setMessages([{ role: 'agent', text: `Graph generated for "${term}".` }]);
            }
        } catch (err) {
            console.error(err);
            setMessages([{ role: 'agent', text: "Failed to generate graph." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeChange = (mode: 'general' | 'personal') => {
        if (mode === 'personal') {
            setViewMode('personal');
            // If logged in, trigger ingest
            if (session?.user) {
                handleAuthIngest();
            } else {
                setMessages([{ role: 'agent', text: "Please connect a social account from the sidebar to begin." }]);
                setGraphData({ nodes: [], links: [] });
            }
        } else {
            setViewMode('hero'); // Reset to Hero for generic Concept search start
        }
    };

    const handleAuthIngest = async () => {
        if (!session?.user) return;
        setIsLoading(true);
        setMessages([{ role: 'agent', text: `Authenticating ${session.user.name}...` }]);

        try {
            await axios.post(`${API_URL}/auth/ingest`, { provider: 'oauth', user_data: session.user });
            const res = await axios.get(`${API_URL}/graph`);
            setGraphData(res.data);
            setArrangeTrigger(prev => prev + 1);
            setMessages(prev => [...prev, { role: 'agent', text: "Identity Graph Loaded." }]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to RESET the universe?")) return;
        try {
            await axios.delete(`${API_URL}/graph`);
            setGraphData({ nodes: [], links: [] });
            setViewMode('hero');
            setMessages([]);
        } catch (e) { console.error(e); }
    };

    const refreshGraph = async () => {
        try {
            const res = await axios.get(`${API_URL}/graph`);
            setGraphData(res.data);
            setArrangeTrigger(prev => prev + 1);
        } catch (e) { console.error(e); }
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // Optimistic UI
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsLoading(true);

        try {
            if (viewMode === 'general') {
                // Concept Expansion
                const res = await axios.post(`${API_URL}/ingest/search`, { text });
                if (res.data.status === 'success') {
                    setGraphData(prev => mergeGraphData(prev, res.data));
                    setArrangeTrigger(prev => prev + 1);
                    setMessages(prev => [...prev, { role: 'agent', text: `Expanded graph with "${text}".` }]);
                }
            } else {
                // Chat / Interaction
                const res = await axios.post(`${API_URL}/chat`, { message: text });
                setMessages(prev => [...prev, { role: 'agent', text: res.data.answer }]);
                if (res.data.nodes_created > 0) refreshGraph();
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Error processing request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'agent', text: `Absorbing ${file.name}...` }]);

        try {
            const res = await axios.post(`${API_URL}/ingest/file`, formData);
            setMessages(prev => [...prev, { role: 'agent', text: `Digested ${file.name}. (+${res.data.nodes_added} nodes)` }]);
            refreshGraph();
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Ingestion failed." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        const dataStr = JSON.stringify(graphData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ontology_backup.json`;
        a.click();
    };

    const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                setGraphData(json);
                setMessages(prev => [...prev, { role: 'agent', text: "Graph visualized from file." }]);
            } catch (err) { console.error(err); }
        };
        reader.readAsText(file);
    };

    const handleExpandLive = async () => {
        if (!selectedNode) return;
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: `Expand knowledge on: ${selectedNode.name}` }]);

        try {
            const res = await axios.post('/api/ingest/search', { text: selectedNode.name });
            if (res.data.status === 'success') {
                setGraphData(prev => mergeGraphData(prev, { nodes: res.data.nodes, links: res.data.links }));
                setArrangeTrigger(prev => prev + 1);
                setMessages(prev => [...prev, { role: 'agent', text: `Knowledge expanded for "${selectedNode.name}".` }]);
            } else {
                setMessages(prev => [...prev, { role: 'agent', text: `No new info found for "${selectedNode.name}".` }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Expansion failed." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---

    return (
        <main className="relative w-full h-screen overflow-hidden text-gray-100 font-sans selection:bg-purple-500/30">
            <AmbientBackground />

            <AppSidebar
                currentMode={viewMode === 'personal' ? 'personal' : 'general'}
                onModeChange={handleModeChange}
                onReset={handleReset}
                isGraphActive={viewMode !== 'hero'}
            />

            <div className={`relative h-full transition-all duration-700 ease-in-out ${showSidebar ? 'ml-64' : 'ml-0'}`}>

                {/* Mode: Hero */}
                {viewMode === 'hero' && (
                    <HeroView onSearch={handleSearch} />
                )}

                {/* Mode: Graph (Active) */}
                {viewMode !== 'hero' && (
                    <div className="h-full relative animate-in fade-in duration-1000">
                        {/* 3D Visualizer */}
                        <div className="absolute inset-0 z-0">
                            <Graph3D
                                data={graphData}
                                onNodeClick={setSelectedNode}
                                arrangeTrigger={arrangeTrigger}
                                highlightNodes={highlightNodes}
                            />
                        </div>

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
                                <div className="p-8 rounded-full border border-blue-500/30 bg-black/50 animate-pulse">
                                    <div className="text-blue-400 font-mono tracking-widest text-xs">PROCESSING DATA STREAM...</div>
                                </div>
                            </div>
                        )}

                        {/* Top Right Controls */}
                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 text-xs text-gray-400">
                                <Database className="w-3 h-3 text-blue-400" />
                                <span>{graphData.nodes.length} Nodes</span>
                                <div className="w-px h-3 bg-white/10" />
                                <button onClick={handleSave} className="hover:text-white"><Save className="w-3 h-3" /></button>
                                <label className="cursor-pointer hover:text-white">
                                    <Upload className="w-3 h-3" />
                                    <input type="file" onChange={handleLoad} className="hidden" accept=".json" />
                                </label>
                            </div>
                        </div>

                        {/* Bottom Chat/Input Area */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-4">
                            {/* Chat Bubbles Container */}
                            <div className="mb-4 max-h-[30vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar flex flex-col-reverse">
                                {[...messages].reverse().map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm backdrop-blur-md ${msg.role === 'user'
                                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                                            : 'bg-gray-800/40 border border-gray-700/30 text-gray-200'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <MagicInput
                                onSendMessage={handleSend}
                                onFileUpload={handleFileUpload}
                                isProcessing={isLoading}
                            />
                        </div>

                        {/* Side Panel (Context) */}
                        {selectedNode && (
                            <div className="absolute top-4 right-4 bottom-24 w-80 glass-panel p-6 shadow-2xl animate-in slide-in-from-right duration-300 z-20 overflow-hidden flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{selectedNode.label}</div>
                                        <h2 className="text-xl font-bold text-white leading-tight">{selectedNode.name || selectedNode.id}</h2>
                                    </div>
                                    <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {selectedNode.description || selectedNode.properties?.description || "No detailed description available in the knowledge base."}
                                    </p>

                                    <div className="space-y-2">
                                        {Object.entries(selectedNode).map(([key, value]) => {
                                            if (['id', 'name', 'label', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'index', 'color', 'val'].includes(key)) return null;
                                            if (typeof value === 'object') return null;
                                            return (
                                                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                                    <span className="text-xs text-gray-500 capitalize">{key}</span>
                                                    <span className="text-xs text-gray-300 text-right">{String(value)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={handleExpandLive}
                                    className="mt-4 w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Expand Knowledge
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
