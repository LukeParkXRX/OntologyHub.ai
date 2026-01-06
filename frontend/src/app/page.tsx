'use client';

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Network, Database, Trash2, Plus, HelpCircle, RefreshCw, Maximize2, X, Upload, Save, MessageCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';
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
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [isImmersive, setIsImmersive] = useState(false);

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
            const relType = l.name || l.type || 'RELATED';
            const key = `${sourceId}-${targetId}-${relType}`;
            if (!uniqueLinks.has(key)) uniqueLinks.set(key, { ...l, name: relType });
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

    const [bubblePos, setBubblePos] = useState<{ x: number, y: number } | null>(null);
    const graphRef = useRef<any>(null);

    // [ALIVE] Track selected node position for Speech Bubble
    useEffect(() => {
        let animationFrame: number;
        const updateBubble = () => {
            if (selectedNode && graphRef.current) {
                const coords = graphRef.current.graph2ScreenCoords(selectedNode.x, selectedNode.y, selectedNode.z);
                if (coords) setBubblePos(coords);
            } else {
                setBubblePos(null);
            }
            animationFrame = requestAnimationFrame(updateBubble);
        };
        updateBubble();
        return () => cancelAnimationFrame(animationFrame);
    }, [selectedNode]);

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

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const handleNodeUpdate = async () => {
        if (!selectedNode || !editData) return;
        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/node/update`, {
                id: selectedNode.id,
                properties: editData
            });
            // Update local state
            setGraphData(prev => ({
                ...prev,
                nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, ...editData, properties: { ...n.properties, ...editData } } : n)
            }));
            setSelectedNode({ ...selectedNode, ...editData });
            setIsEditing(false);
            setMessages(prev => [...prev, { role: 'agent', text: "Knowledge entry updated successfully." }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Failed to update node." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpandLive = async () => {
        if (!selectedNode) return;
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: `Expand knowledge on: ${selectedNode.name}` }]);

        try {
            const res = await axios.post('/api/ingest/search', { text: selectedNode.name });
            if (res.data.status === 'success') {
                // [ALIVE] Tag new nodes with heritage
                const heritageNodes = res.data.nodes.map((n: any) => ({
                    ...n,
                    generationSource: selectedNode.id
                }));
                setGraphData(prev => mergeGraphData(prev, { nodes: heritageNodes, links: res.data.links }));
                setArrangeTrigger(prev => prev + 1);
                setMessages(prev => [...prev, { role: 'agent', text: `Knowledge expanded for "${selectedNode.name}". Inherited theme applied.` }]);
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

    const handleNodeAdd = async () => {
        if (!selectedNode) return;
        const name = window.prompt("새로운 지식(노드)의 이름을 입력하세요:");
        if (!name) return;

        setIsLoading(true);
        try {
            const res = await axios.post('/api/node/add', {
                parent_id: selectedNode.id,
                name: name
            });
            if (res.data.status === 'success') {
                // Optimistic Local Update to avoid view pollution
                const newNode = {
                    id: res.data.node_id,
                    name: name,
                    label: 'Concept',
                    layer: 'Semantic',
                    val: 10,
                    source: 'user',
                    properties: { name, summary: "수동으로 추가된 지식입니다." }
                };
                const newLink = {
                    source: selectedNode.id,
                    target: res.data.node_id,
                    name: 'RELATED',
                    val: 1
                };

                setGraphData(prev => ({
                    nodes: [...prev.nodes, newNode],
                    links: [...prev.links, newLink]
                }));
                setArrangeTrigger(prev => prev + 1);
                setMessages(prev => [...prev, { role: 'agent', text: `"${name}" 지식이 수동으로 추가되었습니다.` }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "노드 추가에 실패했습니다." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNodeDelete = async () => {
        if (!selectedNode) return;
        if (!window.confirm(`"${selectedNode.name || selectedNode.id}" 지식을 삭제하시겠습니까?`)) return;

        setIsLoading(true);
        try {
            const res = await axios.post('/api/node/delete', { id: selectedNode.id });
            if (res.data.status === 'success') {
                // Remove locally to avoid view pollution
                setGraphData(prev => ({
                    nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
                    links: prev.links.filter(l =>
                        (l.source.id || l.source) !== selectedNode.id &&
                        (l.target.id || l.target) !== selectedNode.id
                    )
                }));
                setSelectedNode(null);
                setArrangeTrigger(prev => prev + 1);
                setMessages(prev => [...prev, { role: 'agent', text: "지식이 삭제되었습니다." }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "삭제에 실패했습니다." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---

    return (
        <main className="relative w-full h-screen overflow-hidden text-gray-100 font-sans selection:bg-purple-500/30">
            <AmbientBackground />

            {!isImmersive && (
                <AppSidebar
                    currentMode={viewMode === 'personal' ? 'personal' : 'general'}
                    onModeChange={handleModeChange}
                    onReset={handleReset}
                    isGraphActive={viewMode !== 'hero'}
                />
            )}

            <div className={`relative h-full overflow-hidden transition-all duration-700 ${!isImmersive && showSidebar ? 'ml-64' : 'ml-0'}`}>
                {/* Mode: Hero */}
                {viewMode === 'hero' && (
                    <HeroView onSearch={handleSearch} />
                )}

                {/* Mode: Graph (Active) */}
                {viewMode !== 'hero' && (
                    <div className="h-full relative animate-in fade-in duration-1000">
                        {/* 3D Visualizer */}
                        <div className="absolute inset-0 z-10" style={{ pointerEvents: 'auto' }}>
                            <Graph3D
                                ref={graphRef}
                                data={graphData}
                                onNodeClick={(node) => {
                                    setSelectedNode(node);
                                    setEditData({
                                        name: node.name || node.id,
                                        description: node.description || node.properties?.summary || ""
                                    });
                                    setIsEditing(false);
                                }}
                                arrangeTrigger={arrangeTrigger}
                                highlightNodes={highlightNodes}
                                selectedNodeId={selectedNode?.id}
                            />
                        </div>

                        {/* Floating Speech Bubble */}
                        {selectedNode && bubblePos && (
                            <div
                                className="absolute z-[100] pointer-events-none animate-in fade-in zoom-in duration-200 select-none hidden md:block"
                                style={{
                                    left: bubblePos.x,
                                    top: bubblePos.y,
                                    transform: 'translate(40px, -50%)'
                                }}
                            >
                                <div className="relative bg-[#030712]/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl max-w-[240px] shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                                    {/* Speech Bubble Tail */}
                                    <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-4 h-4 overflow-hidden">
                                        <div className="w-full h-full bg-[#030712]/40 border-l border-b border-white/20 rotate-45 origin-top-right" />
                                    </div>

                                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Ontology Insight</div>
                                    <p className="text-[11px] leading-relaxed text-gray-300 line-clamp-4 font-light">
                                        {selectedNode.rationale || selectedNode.properties?.rationale || selectedNode.summary || selectedNode.properties?.summary || selectedNode.description || "The neural nexus indicates a high probability connection at this nexus point."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 pointer-events-none">
                                <div className="p-8 rounded-full border border-blue-500/30 bg-black/60 shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-pulse">
                                    <div className="text-blue-400 font-mono tracking-widest text-xs">PROCESSING DATA STREAM...</div>
                                </div>
                            </div>
                        )}

                        {/* HUD Controls (Top Left) */}
                        <div className="absolute top-6 left-6 z-[110] flex gap-2">
                            <button
                                onClick={() => setIsImmersive(!isImmersive)}
                                className={`p-3 rounded-xl backdrop-blur-xl border transition-all duration-300
                                    ${isImmersive
                                        ? 'bg-blue-600/40 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                title={isImmersive ? "Exit Immersive Mode" : "Immersive Mode"}
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top Right Controls */}
                        {!isImmersive && (
                            <div className="absolute top-6 right-6 z-20 flex gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-[#030712]/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 text-[11px] text-gray-400 tracking-wider">
                                    <Database className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="font-bold">{graphData.nodes.length} <span className="opacity-50 font-light">NODES</span></span>
                                    <div className="w-px h-3 bg-white/10" />
                                    <button onClick={handleSave} className="hover:text-white transition-colors" title="Export JSON"><Save className="w-3.5 h-3.5" /></button>
                                    <label className="cursor-pointer hover:text-white transition-colors" title="Import JSON">
                                        <Upload className="w-3.5 h-3.5" />
                                        <input type="file" onChange={handleLoad} className="hidden" accept=".json" />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Bottom Chat Area (HUD Interface) */}
                        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[100] px-4 transition-all duration-700
                            ${isImmersive ? 'opacity-20 hover:opacity-100 translate-y-12 hover:translate-y-0' : 'opacity-100'}`}>
                            {/* Toggle Area for Message History */}
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => setShowChatHistory(!showChatHistory)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] tracking-widest uppercase font-bold text-gray-400 hover:text-white"
                                >
                                    {showChatHistory ? <ChevronDown className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                                    {showChatHistory ? "Hide Logs" : `${messages.length} Data Points`}
                                </button>
                            </div>

                            {/* Collapsible Message History */}
                            {showChatHistory && messages.length > 0 && (
                                <div className="mb-4 max-h-[25vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar flex flex-col-reverse animate-in slide-in-from-bottom-4 duration-300">
                                    {[...messages].reverse().map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] backdrop-blur-xl shadow-xl transition-all duration-500
                                                ${msg.role === 'user'
                                                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-200'
                                                    : 'bg-white/[0.03] border border-white/5 text-gray-300'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Always-on Magic Input */}
                            <div className="group relative">
                                <MagicInput
                                    onSendMessage={handleSend}
                                    onFileUpload={handleFileUpload}
                                    isProcessing={isLoading}
                                />
                            </div>
                        </div>

                        {/* Side Panel (Context & Edit) */}
                        {selectedNode && !isImmersive && (
                            <div className="absolute top-20 right-6 bottom-32 w-80 bg-[#030712]/40 backdrop-blur-xl border border-white/10 p-6 shadow-2xl animate-in slide-in-from-right duration-500 z-50 overflow-hidden flex flex-col rounded-3xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1 mr-2">
                                        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-500 font-black mb-1 opacity-80">{selectedNode.label || 'Concept'}</div>
                                        {isEditing ? (
                                            <input
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xl font-bold text-white w-full outline-none focus:border-cyan-500/50"
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-lg">{selectedNode.name || selectedNode.id}</h2>
                                        )}
                                    </div>
                                    <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                                </div>

                                {/* Manual Actions Bar */}
                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={handleNodeAdd}
                                        className="flex-1 py-2 bg-green-500/5 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-bold hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 tracking-widest"
                                        title="Add connected node"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> ADD
                                    </button>
                                    <button
                                        onClick={handleNodeDelete}
                                        className="px-4 py-2 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                        title="Delete this node"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                                    <div className="space-y-2">
                                        <div className="text-[10px] uppercase text-gray-500 tracking-[0.2em] font-medium">Fact-Check & Essence</div>
                                        {isEditing ? (
                                            <textarea
                                                value={editData.description}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 leading-relaxed outline-none focus:border-cyan-500/50 resize-none"
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-300 leading-relaxed font-light">
                                                    {selectedNode.summary || selectedNode.properties?.summary || selectedNode.description || "No summary available."}
                                                </p>
                                                {(selectedNode.rationale || selectedNode.properties?.rationale) && (
                                                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-3 rounded-lg">
                                                        <div className="text-[9px] uppercase text-cyan-500/80 font-bold mb-1 tracking-widest">Relevance Rationale</div>
                                                        <p className="text-[11px] text-cyan-100/70 italic leading-snug">
                                                            {selectedNode.rationale || selectedNode.properties.rationale}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <div className="text-[10px] uppercase text-gray-400 tracking-widest mb-3">Connectivity Data</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/5 p-2 rounded-lg">
                                                <div className="text-[9px] text-gray-500 uppercase">Connections</div>
                                                <div className="text-sm font-mono text-cyan-400">{selectedNode.connections || 0}</div>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded-lg">
                                                <div className="text-[9px] text-gray-500 uppercase">Layer</div>
                                                <div className="text-sm font-mono text-purple-400">{selectedNode.layer || 'Semantic'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleNodeUpdate}
                                                className="flex-1 py-3 bg-cyan-500 text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                            >
                                                <Save className="w-4 h-4" /> Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Database className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={handleExpandLive}
                                                className="flex-1 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Maximize2 className="w-4 h-4" /> Expand
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reflection Test Overlay */}
            <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
                <h1 className="text-[12vw] font-black text-white/10 uppercase tracking-tighter select-none rotate-[-10deg]">
                    test
                </h1>
            </div>
        </main>
    );
}
