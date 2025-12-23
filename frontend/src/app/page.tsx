'use client';

import { signIn, useSession, signOut } from "next-auth/react";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Send, Terminal, Loader2, Database, Network, Trash2, HelpCircle, RefreshCw, Trash } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Graph3D = dynamic(() => import('../components/Graph3D'), { ssr: false });

// Helper to merge graph data
const mergeGraphData = (existing: any, incoming: any) => {
    const existingNodeIds = new Set(existing.nodes.map((n: any) => n.id));
    const newNodes = incoming.nodes.filter((n: any) => !existingNodeIds.has(n.id));

    // Filter unique links by source+target+type
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

// --- Sub-Components ---

const LoginModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) => {
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1E1F20] border border-[#3C4043] rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#8E918F] hover:text-white">✕</button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Identify Yourself</h2>
                    <p className="text-sm text-[#8E918F]">Connect your digital footprint to begin.</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => signIn("google")}
                        className="w-full bg-[#E3E3E3] hover:bg-white text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                        <span className="text-xl">G</span>
                        <span>Continue with Google</span>
                    </button>

                    <button
                        onClick={() => signIn("linkedin")}
                        className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                        <span className="text-xl">in</span>
                        <span>Continue with LinkedIn</span>
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#3C4043]"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1E1F20] px-2 text-[#8E918F]">Or</span></div>
                    </div>

                    <button
                        onClick={onLogin} // Guest access
                        className="w-full border border-[#3C4043] hover:bg-[#3C4043] text-[#E3E3E3] font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                        Continue as Guest (Dev)
                    </button>
                </div>
            </div>
        </div>
    );
};

const EntryScreen = ({ onSelectMode }: { onSelectMode: (mode: 'identity' | 'concept', keyword?: string) => void }) => {
    const [showLogin, setShowLogin] = useState(false);
    const { status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            onSelectMode('identity');
        }
    }, [status, onSelectMode]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#131314] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E1F20] via-[#131314] to-black opacity-80" />

            {/* Login Modal */}
            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onLogin={() => onSelectMode('identity')}
                />
            )}

            {/* Main Content */}
            <div className="relative z-10 text-center space-y-8 animate-fade-in-up">
                {/* Visual Soul */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
                    <div className="absolute inset-4 rounded-full border-2 border-dashed border-blue-500/30 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-8 rounded-full border border-blue-400/50 animate-[spin_5s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-md opacity-80 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-blue-300 to-purple-200 tracking-tighter">
                        PROJECT ALIVE
                    </h1>
                    <p className="text-xl text-[#8E918F] font-light tracking-wide max-w-lg mx-auto">
                        Awaken Your Digital Soul.<br />
                        Begin the journey to reconstruct yourself.
                    </p>
                </div>

                <div className="pt-8">
                    <button
                        onClick={() => setShowLogin(true)}
                        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
                    >
                        <div className="absolute inset-0 border border-blue-500/30 rounded-full group-hover:border-blue-400/80 transition-colors" />
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                        <span className="relative text-blue-300 font-medium tracking-widest uppercase text-sm group-hover:text-blue-100 transition-colors flex items-center gap-2">
                            Initiate Sequence <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>

                    {/* Hidden Concept Access (Optional) 
                    <button 
                        onClick={() => onSelectMode('concept', 'Metaverse')}
                        className="block mt-4 text-[10px] text-[#3C4043] hover:text-[#5E5E5E] mx-auto uppercase tracking-widest"
                    >
                        Access Archives
                    </button>
                    */}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 text-[10px] text-[#3C4043] font-mono tracking-[0.2em] uppercase">
                OntologyHub.AI // System Version 2.0.4
            </div>
        </div>
    );
};

// Cyberpunk-style Scanning Overlay
const ScanningOverlay = () => (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
        <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#4285F4]/30 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-[#4285F4] animate-[spin_1s_linear_infinite]" />
            <div className="absolute inset-4 w-16 h-16 rounded-full bg-[#4285F4]/20 animate-pulse" />
        </div>
        <div className="mt-8 text-center space-y-2">
            <h3 className="text-xl font-bold text-[#4285F4] tracking-[0.2em] animate-pulse">SYSTEM SCANNING</h3>
            <p className="text-xs text-[#8AB4F8] font-mono">
                ANALYZING DATA STRUCTURE...<br />
                BUILDING ONTOLOGY NODES...
            </p>
        </div>
    </div>
);

// --- Help & Guide Component (Vibe Coding) ---
const HelpGuide = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-10 animate-fade-in" onClick={onClose}>
        <div className="bg-[#1E1F20] border border-[#3C4043] rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#8E918F] hover:text-white">✕</button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                OntologyHub Interface Guide
            </h2>

            <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                    <h3 className="font-bold text-[#E3E3E3] border-b border-[#3C4043] pb-2">🕹️ Controls</h3>
                    <ul className="space-y-2 text-[#C4C7C5]">
                        <li><strong className="text-blue-400">Left Click</strong>: Rotate Camera</li>
                        <li><strong className="text-blue-400">Right Click</strong>: Pan (Move) Camera</li>
                        <li><strong className="text-blue-400">Scroll</strong>: Zoom In/Out</li>
                        <li><strong className="text-blue-400">Click Node</strong>: Focus & View Details</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-[#E3E3E3] border-b border-[#3C4043] pb-2">🎨 Visualization</h3>
                    <ul className="space-y-2 text-[#C4C7C5]">
                        <li><strong className="text-purple-400">Node Size</strong>: Importance (Centrality)</li>
                        <li><strong className="text-purple-400">Node Color</strong>: Topic Cluster Group</li>
                        <li><strong className="text-purple-400">Rings</strong>: Highlight Root Concepts</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-[#E3E3E3] border-b border-[#3C4043] pb-2">🎛️ Filters (Left Panel)</h3>
                    <ul className="space-y-2 text-[#C4C7C5]">
                        <li><strong className="text-green-400">Categories</strong>: Toggle specific types (Person, Job, etc.)</li>
                        <li><strong className="text-green-400">Peeling Layers</strong>: Filter nodes by importance. Drag slider right to focus on core concepts.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-[#E3E3E3] border-b border-[#3C4043] pb-2">⚡ Actions</h3>
                    <ul className="space-y-2 text-[#C4C7C5]">
                        <li><strong className="text-yellow-400">Arrange</strong>: Re-organize graph layout if intertwined.</li>
                        <li><strong className="text-yellow-400">Clear</strong>: Reset the entire graph database.</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-[#8E918F]">
                Click anywhere outside to close
            </div>
        </div>
    </div>
);

// --- Main Page Component ---

export default function Home() {
    // --- State ---
    const [entryMode, setEntryMode] = useState<'intro' | 'identity' | 'concept'>('intro');
    const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string, context?: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });

    // Keep 'mode' for internal chat vs ingest switch within Identity mode
    const [interactionMode, setInteractionMode] = useState<'chat' | 'ingest'>('chat');
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showHelp, setShowHelp] = useState(false); // Help Modal State

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(450); // Initial 450px
    const sidebarWidthRef = useRef(450); // Sync for event handlers
    const isResizingRef = useRef(false); // Ref for immediate access in events
    const [isResizing, setIsResizing] = useState(false); // State for UI updates (cursor, etc)

    // Filter State
    const [yearRange, setYearRange] = useState<[number, number]>([2000, 2030]);
    const [selectedYear, setSelectedYear] = useState<number[]>([2030]); // Current Slider Value
    const [minImportance, setMinImportance] = useState<number[]>([0]); // Peeling Layers (0 ~ 1)
    const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
        'Person': true,
        'Job': true,      // "경력"
        'Emotion': true,
        'Interest': true, // "취미"
        'Event': true     // Timeline targets
    });
    const [arrangeTrigger, setArrangeTrigger] = useState(0);
    const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());

    // Use Proxy Path
    const API_URL = '/api';

    // [Module A] Auth-to-Graph Ingestion
    const { data: session } = useSession();
    const [authIngested, setAuthIngested] = useState(false);

    useEffect(() => {
        if (session?.user && !authIngested && entryMode === 'identity') {
            const userData = session.user;
            console.log("Ingesting Auth Profile:", userData);

            setMessages(prev => [...prev, { role: 'agent', text: `Authenticating as ${userData.name}... Building identity nodes.` }]);

            axios.post(API_URL + '/auth/ingest', {
                provider: 'oauth', // Generic for now
                user_data: userData
            }).then(() => {
                setAuthIngested(true);
                setIsLoggedIn(true);
                setMessages(prev => [...prev, { role: 'agent', text: `Identity Verified. Welcome, ${userData.name}.` }]);
                fetchGraph();
            }).catch(err => {
                console.error("Auth Ingest Failed", err);
                setMessages(prev => [...prev, { role: 'agent', text: "Warning: Failed to sync profile data." }]);
            });
        }
    }, [session, authIngested, entryMode]);

    // --- Effects & Logic ---

    // 1. Analyze Date Range on Data Load
    useEffect(() => {
        if (graphData.nodes.length > 0) {
            const years = graphData.nodes
                .filter((n: any) => n.label === 'Event')
                .map((n: any) => {
                    const d = n.timestamp || n.date || n.properties?.timestamp || n.properties?.date;
                    return d ? new Date(d).getFullYear() : NaN;
                })
                .filter(y => !isNaN(y));

            if (years.length > 0) {
                const min = Math.min(...years);
                const max = Math.max(...years);
                setYearRange([min, max]);
                setSelectedYear([max]); // Set to max initially
            }
        }
    }, [graphData]);

    // 2. Compute Filtered Data
    const filteredData = {
        nodes: graphData.nodes.filter((node: any) => {
            // Category Filter
            if (categoryFilters[node.label] === false) return false;

            // Timeline Filter (Only for Events)
            // [ALIVE] Support both 'date' and 'timestamp' properties for Memory Visualization
            const eventDate = node.timestamp || node.date || node.properties?.timestamp || node.properties?.date;
            if (node.label === 'Event' && eventDate) {
                const nodeYear = new Date(eventDate).getFullYear();
                if (!isNaN(nodeYear) && nodeYear > selectedYear[0]) {
                    return false; // Hide future events
                }
            }

            // Importance Filter (Peeling Layers)
            // Assuming centrality is normalized 0-1 or raw score. 
            // If raw, we might need to normalize in backend or here. 
            // In backend we stored raw 'centrality'. Let's assume it is somewhat small float.
            // If minImportance > 0, we filter.
            if (node.centrality !== undefined && node.centrality < minImportance[0]) {
                return false;
            }

            return true;
        }),
        links: graphData.links.filter((link: any) => {
            // Filter links? Graph lib handles missing nodes mostly, but cleaning up is safer
            return true;
        })
    };

    // Explicit Link Filtering based on Node IDs
    const activeNodeIds = new Set(filteredData.nodes.map((n: any) => n.id));
    filteredData.links = filteredData.links.filter((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId);
    });

    // Resizing Logic Refactored:
    // Attach listeners dynamically on MouseDown to ensure they capture events globally
    // independently of where the mouse goes.

    const resize = (mouseMoveEvent: MouseEvent) => {
        const newWidth = mouseMoveEvent.clientX;
        const minWidth = 300;
        const maxWidth = 600; // Increased max width slightly

        if (newWidth > minWidth && newWidth < maxWidth) {
            setSidebarWidth(newWidth);
            sidebarWidthRef.current = newWidth;
        }
    };

    const stopResizing = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResizing);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto'; // Restore text selection
    };

    const startResizing = (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResizing);
        document.body.style.cursor = 'col-resize'; // Force cursor
        document.body.style.userSelect = 'none'; // Disable text selection globally
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stopResizing);
        };
    }, []);

    // [ALIVE] Reset Universe Logic
    const handleReset = async () => {
        if (!confirm("Are you sure you want to RESET your Digital Universe? This cannot be undone.")) return;

        try {
            setIsLoading(true);
            await axios.delete(API_URL + '/graph');
            setGraphData({ nodes: [], links: [] });
            setMessages([]);
            alert("Universe Reset Successful. Starting fresh.");
        } catch (error) {
            console.error(error);
            alert("Failed to reset.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'agent', text: `파일 업로드 중: ${file.name}...\n분석 및 온톨로지 변환을 시작합니다.` }]);

        try {
            const res = await axios.post(`${API_URL}/ingest/file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => [...prev, {
                role: 'agent',
                text: `✅ 분석 완료!\n추가된 노드: ${res.data.nodes_added}\n추가된 연결: ${res.data.edges_added}`
            }]);
            fetchGraph();
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'agent', text: '파일 처리 중 오류가 발생했습니다.' }]);
        } finally {
            setIsLoading(false);
            // Reset input ?
        }
    };

    const handleClear = async () => {
        if (!confirm("Are you sure you want to clear the entire knowledge graph?")) return;
        try {
            await axios.delete(`${API_URL}/graph`);
            setGraphData({ nodes: [], links: [] });
            setMessages(prev => [...prev, { role: 'agent', text: '♻️ Knowledge Graph has been reset.' }]);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchGraph = async () => {
        try {
            // Only fetch full graph if explicitly needed or in Identity mode
            if (entryMode === 'concept') return;

            console.log("Fetching graph data...");
            const res = await axios.get(`${API_URL}/graph`);
            console.log("Graph data received:", res.data);
            setGraphData(res.data);
        } catch (err) {
            console.error("Failed to fetch graph:", err);
        }
    };

    const handleModeSelect = async (mode: 'identity' | 'concept', keyword?: string) => {
        setEntryMode(mode);

        if (mode === 'identity') {
            setMessages([{ role: 'agent', text: '환영합니다. 당신의 디지털 자아를 구축할 준비가 되었습니다.\n파일을 업로드하거나 대화를 시작하세요.' }]);
            // Explicitly fetch graph for Identity
            try {
                const res = await axios.get(`${API_URL}/graph`);
                const identityNodes = res.data.nodes.filter((n: any) => n.source !== 'concept');
                setGraphData(res.data);
            } catch (e) { };
        } else if (mode === 'concept' && keyword) {
            setMessages([{ role: 'agent', text: `'${keyword}'에 대한 지식 그래프를 생성 중입니다...\nWeb Knowledge를 탐색하고 있습니다.` }]);
            setGraphData({ nodes: [], links: [] }); // Reset view for new concept
            setIsLoading(true);
            try {
                // Initial Concept Ingestion
                console.log(`Ingesting concept: ${keyword}`);
                const res = await axios.post(`${API_URL}/ingest/search`, { text: keyword });

                // Directly use returned subgraph
                if (res.data.status === 'success') {
                    setGraphData({ nodes: res.data.nodes, links: res.data.links });
                    setMessages(prev => [...prev, { role: 'agent', text: `✅ '${keyword}'에 대한 온톨로지가 생성되었습니다.` }]);
                }
            } catch (e) {
                console.error(e);
                setMessages(prev => [...prev, { role: 'agent', text: '오류가 발생했습니다.' }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userInput = input;
        setMessages(prev => [...prev, { role: 'user', text: userInput }]);
        setInput('');
        setIsLoading(true);

        try {
            if (interactionMode === 'chat') {
                const res = await axios.post(`${API_URL}/chat`, { message: userInput });
                setMessages(prev => [...prev, { role: 'agent', text: res.data.answer, context: res.data.context }]);
            } else {
                // Ingest Logic based on Entry Mode
                const endpoint = entryMode === 'concept' ? '/ingest/search' : '/ingest';
                console.log(`Ingesting input to ${endpoint}: ${userInput}`);
                const res = await axios.post(`${API_URL}${endpoint}`, { text: userInput });
                console.log("Ingest result:", res.data);

                if (entryMode === 'concept') {
                    if (res.data.status === 'success') {
                        setGraphData(prev => mergeGraphData(prev, { nodes: res.data.nodes, links: res.data.links }));
                        setMessages(prev => [...prev, { role: 'agent', text: `지식이 확장되었습니다. (+${res.data.nodes.length} Nodes)` }]);
                    }
                } else {
                    setMessages(prev => [...prev, { role: 'agent', text: `지식이 확장되었습니다. (${res.data.nodes_added} Nodes added)` }]);
                    fetchGraph();
                }
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'agent', text: 'Error.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpand = async () => {
        if (!selectedNode) return;
        setIsLoading(true);
        // Optimistic UI update
        setMessages(prev => [...prev, { role: 'user', text: `Expand knowledge on: ${selectedNode.name}` }]);

        try {
            const res = await axios.post('/api/ingest/search', { text: selectedNode.name });
            if (res.data.status === 'success') {
                // Merge subgraph
                setGraphData(prev => mergeGraphData(prev, { nodes: res.data.nodes, links: res.data.links }));
                setMessages(prev => [...prev, { role: 'agent', text: `Knowledge expanded. Added ${res.data.nodes.length} nodes based on "${selectedNode.name}".` }]);
            } else {
                setMessages(prev => [...prev, { role: 'agent', text: `Could not find new information for "${selectedNode.name}".` }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Expansion failed. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLiveUpdate = async () => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'agent', text: "📡 Searching for real-time updates..." }]);

        try {
            const res = await axios.post('/api/graph/update');
            if (res.data.status === 'success') {
                const diff = res.data.diff;
                const newIds = diff.nodes.map((n: any) => n.id);

                // Merge & Highlight
                setGraphData(prev => mergeGraphData(prev, diff));
                setHighlightNodes(new Set(newIds));

                setMessages(prev => [...prev, {
                    role: 'agent',
                    text: `✨ Graph evolved! Found insights on "${res.data.query}".\n(+${diff.nodes.length} Nodes)`
                }]);

                // Clear highlight after 5 seconds
                setTimeout(() => setHighlightNodes(new Set()), 5000);
            } else {
                setMessages(prev => [...prev, { role: 'agent', text: "No new relevant information found at the moment." }]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'agent', text: "Update failed." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debug Log
    console.log("Rendering Home. Filtered Data Nodes:", filteredData.nodes.length, "Links:", filteredData.links.length);

    return (
        <main className="flex h-screen bg-[#131314] text-[#E3E3E3] overflow-hidden font-sans relative selection:bg-blue-500/30">
            {entryMode === 'intro' && (
                <EntryScreen onSelectMode={handleModeSelect} />
            )}

            {/* Help Overlay */}
            {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}

            {/* Sidebar (Resizable) */}
            <div
                className={`flex-shrink-0 flex-grow-0 relative bg-[#1E1F20] border-r border-[#3C4043] flex flex-col z-20 shadow-xl overflow-visible ${isResizing ? '' : 'transition-all duration-300 ease-out'}`}
                style={{ width: `${sidebarWidth}px`, minWidth: '300px', maxWidth: '600px', flexBasis: `${sidebarWidth}px` }}
            >
                {/* Global Resize Overlay to capture events over iframe/canvas */}
                {isResizing && (
                    <div className="fixed inset-0 z-[100] cursor-col-resize user-select-none" />
                )}

                {/* Drag Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-4 translate-x-1/2 bg-transparent hover:bg-[#4285F4] cursor-col-resize z-[9999] transition-colors delay-75"
                    onMouseDown={startResizing}
                />

                {/* Header */}
                <div className="p-6 border-b border-[#3C4043] flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-[#8AB4F8] to-[#F28B82] bg-clip-text text-transparent">
                            OntologyHub.ai
                        </h1>
                        <span className="text-[10px] text-[#8E918F] uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#3C4043] ml-1">
                            {entryMode ? entryMode.toUpperCase() : 'BETA'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            title="Reset Knowledge Graph"
                            className="p-2 text-[#8E918F] hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#28292A] rounded-full border border-[#3C4043]">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-mono text-[#8E918F]">ONLINE</span>
                        </div>
                        <button
                            onClick={handleLiveUpdate}
                            disabled={isLoading}
                            className={`p-2 rounded-full transition-all ${isLoading ? 'animate-spin text-[#4285F4]' : 'text-[#8E918F] hover:text-[#4285F4] hover:bg-[#4285F4]/10'}`}
                            title="Live Update (Dynamic Evolution)"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {/* Help Button */}
                        <button
                            onClick={() => setShowHelp(true)}
                            className="w-8 h-8 rounded-full bg-[#3C4043] hover:bg-[#4285F4] text-white flex items-center justify-center transition-colors shadow-lg"
                            title="Help Guide"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-[#8E918F] space-y-4 opacity-50">
                            <Network className="w-12 h-12" />
                            <p className="text-sm">Ready to connect.</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                                ? 'bg-[#28292A] text-[#E3E3E3] rounded-br-none border border-[#3C4043]'
                                : 'bg-transparent text-[#C4C7C5] border border-[#3C4043]/50' // Gemini-style minimal agent bubble
                                }`}>
                                {msg.role === 'agent' && <span className="block text-[#4285F4] text-xs font-bold mb-1">AI</span>}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-transparent p-4 flex items-center gap-2 text-[#8E918F]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">Processing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area (Dynamic Height) */}
                <div className="p-6 bg-[#1E1F20] border-t border-[#3C4043]">
                    {/* Interaction Mode Switch (Identity Only) */}
                    {entryMode === 'identity' && (
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setInteractionMode('chat')}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${interactionMode === 'chat' ? 'bg-[#E3E3E3] text-black' : 'text-[#8E918F] hover:text-[#E3E3E3]'}`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setInteractionMode('ingest')}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${interactionMode === 'ingest' ? 'bg-[#E3E3E3] text-black' : 'text-[#8E918F] hover:text-[#E3E3E3]'}`}
                            >
                                Ingest
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-center bg-[#28292A] rounded-full border border-[#3C4043] focus-within:border-[#8AB4F8] transition-colors shadow-inner">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend();
                            }}
                            placeholder={interactionMode === 'chat' ? "Ask anything..." : (entryMode === 'identity' ? "Type a memory or upload file..." : "Expand this concept...")}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[#E3E3E3] px-4 py-3 text-sm"
                        />
                        <button onClick={handleSend} className="p-3 text-[#C4C7C5] hover:text-white">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    {/* File Upload for Identity Mode */}
                    {entryMode === 'identity' && interactionMode === 'ingest' && (
                        <div className="mt-3">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#3C4043] rounded-xl cursor-pointer hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📄</span>
                                    <p className="text-[10px] text-[#8E918F] group-hover:text-[#4285F4] font-medium">Upload Resume / Diary (PDF, TXT)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.txt,.md"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* 3D Graph */}
            <div className="flex-1 relative bg-[#131314]">
                {isLoading && <ScanningOverlay />}

                <div className="absolute top-6 left-6 z-10 bg-[#1E1F20]/90 backdrop-blur px-4 py-2 rounded-full border border-[#3C4043] shadow-lg text-xs font-medium text-[#8E918F] flex items-center gap-3">
                    <Database className="w-3.5 h-3.5 text-[#8AB4F8]" />
                    <span><strong className="text-[#E3E3E3]">{filteredData.nodes?.length || 0}</strong> Nodes</span>
                    <div className="w-px h-3 bg-[#3C4043] mx-1"></div>
                    <button
                        onClick={() => setArrangeTrigger(Date.now())}
                        className="hover:text-white flex items-center gap-1 transition-colors"
                        title="Re-arrange Nodes"
                    >
                        <Network className="w-3.5 h-3.5" />
                        <span>Arrange</span>
                    </button>
                    <div className="w-px h-3 bg-[#3C4043] mx-1"></div>
                    <button
                        onClick={handleReset}
                        className="hover:text-[#FF5252] flex items-center gap-1 transition-colors"
                        title="Reset Universe"
                    >
                        <Trash className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                </div>

                {/* --- UI Controls Overlay --- */}
                {/* Category Filter (Top Left, below Node count) */}
                <div className="absolute top-20 left-6 z-10 bg-[#1E1F20]/90 backdrop-blur p-4 rounded-xl border border-[#3C4043] shadow-lg space-y-3 w-48">
                    <h3 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest mb-2">Filters</h3>
                    {['Person', 'Job', 'Emotion', 'Interest'].map(cat => (
                        <div key={cat} className="flex items-center justify-between">
                            <Label htmlFor={`filter-${cat}`} className="text-sm text-[#E3E3E3]">{cat}</Label>
                            <Switch
                                id={`filter-${cat}`}
                                checked={categoryFilters[cat]}
                                onCheckedChange={(checked) => setCategoryFilters(prev => ({ ...prev, [cat]: checked }))}
                            />
                        </div>
                    ))}
                </div>

                {/* Importance Slider (Peeling Layers) */}
                <div className="absolute top-[22rem] left-6 z-10 bg-[#1E1F20]/90 backdrop-blur p-4 rounded-xl border border-[#3C4043] shadow-lg space-y-3 w-48">
                    <h3 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest mb-2">Peeling Layers</h3>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#E3E3E3]">
                            <span>All</span>
                            <span>Core</span>
                        </div>
                        <Slider
                            min={0}
                            max={0.1} // PageRank scores are usually small
                            step={0.001}
                            value={minImportance}
                            onValueChange={(val) => setMinImportance(val)}
                            className="w-full"
                        />
                        <div className="text-[10px] text-[#8E918F] text-center mt-1">
                            Min Importance: {minImportance[0].toFixed(3)}
                        </div>
                    </div>
                </div>

                {/* Timeline Slider (Bottom Center) */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-96 bg-[#1E1F20]/90 backdrop-blur p-4 rounded-full border border-[#3C4043] shadow-lg flex items-center gap-4">
                    <span className="text-xs text-[#8E918F] font-mono min-w-[3rem] text-right">{yearRange[0]}</span>
                    <Slider
                        min={yearRange[0]}
                        max={yearRange[1]}
                        step={1}
                        value={selectedYear}
                        onValueChange={(val) => setSelectedYear(val)}
                        className="flex-1"
                    />
                    <span className="text-sm text-[#4285F4] font-bold font-mono min-w-[3rem]">{selectedYear[0]}</span>
                </div>

                {/* Key forces re-mount on mode switch to ensure empty start */}
                <Graph3D key={entryMode} data={filteredData} onNodeClick={setSelectedNode} arrangeTrigger={arrangeTrigger} highlightNodes={highlightNodes} />
            </div>

            {/* Side Panel (Context) */}
            <div className={`absolute top-4 right-4 bottom-4 w-80 bg-[#1E1F20]/95 backdrop-blur shadow-2xl rounded-2xl border border-[#3C4043] transform transition-transform duration-300 ease-in-out flex flex-col z-20 ${selectedNode ? 'translate-x-0' : 'translate-x-[120%]'}`}>
                {selectedNode && (
                    <>
                        <div className="p-5 border-b border-[#3C4043] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color || '#8AB4F8' }}></span>
                                <h2 className="text-lg font-bold text-[#E3E3E3]">{selectedNode.label}</h2>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-[#8E918F] hover:text-white">✕</button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-5">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">{selectedNode.name}</h3>
                                <p className="text-sm text-[#C4C7C5] leading-relaxed">
                                    {selectedNode.description || "No specific description available."}
                                </p>
                            </div>

                            <div className="bg-[#28292A] p-4 rounded-xl border border-[#3C4043]">
                                <label className="text-xs font-bold text-[#8E918F] uppercase tracking-widest mb-3 block border-b border-[#3C4043] pb-2">Properties</label>
                                <div className="space-y-2">
                                    {Object.entries(selectedNode).map(([key, value]) => {
                                        if (['id', 'label', 'name', 'color', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'fx', 'fy', 'fz', 'index', '__threeObj', 'description', 'centrality'].includes(key)) return null;
                                        return (
                                            <div key={key} className="flex justify-between text-xs">
                                                <span className="text-[#8E918F]">{key}</span>
                                                <span className="text-[#E3E3E3] font-medium text-right max-w-[60%] break-words">{String(value)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Schema Explanation based on Layer */}
                            <div className="p-4 bg-[#4285F4]/10 rounded-xl border border-[#4285F4]/20">
                                <label className="text-xs font-bold text-[#4285F4] uppercase tracking-widest mb-1 block">Context Layer</label>
                                <div className="text-sm text-[#8AB4F8]">
                                    {selectedNode.layer === 'Semantic' && "Fact: 불변하는 객관적 사실입니다."}
                                    {selectedNode.layer === 'Episodic' && "Memory: 시간과 함께 기록된 경험입니다."}
                                    {selectedNode.layer === 'Psychometric' && "Inner: 내면의 감정이나 가치관입니다."}
                                    {selectedNode.layer === 'Kinetic' && "Action: 실행 가능한 행동입니다."}
                                    {!selectedNode.layer && "General Entity"}
                                </div>
                            </div>

                            {/* Expansion Action */}
                            <button
                                onClick={handleExpand}
                                disabled={isLoading}
                                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
                                Expand Knowledge
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
