"use client";

import { AliveButton } from "@/components/ui/AliveButton";
import { GraphView } from "@/components/ui/GraphView";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Cpu,
  BookOpen,
  Activity,
  Settings,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Trash2,
  Upload,
  FileText,
  X,
  Send
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error";
  message: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  // Start with empty input
  const [inputText, setInputText] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  // New Features State
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry["type"], message: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Memory Recall: Fetch existing knowledge graph from backend
  const handleRecallMemory = async () => {
    setLoading(true);
    try {
      addLog("info", "Recalling stored memories from Neural Core...");
      const response = await fetch("/api/v1/recall?limit=200");

      if (!response.ok) {
        addLog("error", "Memory recall failed. Backend may be offline.");
        return;
      }

      const data = await response.json();

      if (data.node_count > 0) {
        const formattedData = {
          nodes: data.nodes.map((n: any) => ({ id: n.id, type: n.type, ...n.properties })),
          links: data.relationships.filter((r: any) => r.source && r.target).map((r: any) => ({
            source: r.source,
            target: r.target,
            type: r.type
          }))
        };
        setGraphData(formattedData);
        addLog("success", `Recalled ${data.node_count} concepts and ${data.relationship_count} connections.`);
      } else {
        addLog("info", "No memories found. Start by ingesting some knowledge!");
      }
    } catch (e) {
      console.error("Memory recall error:", e);
      addLog("info", "Backend offline. Start backend to enable memory.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleConnectBrain();
    }
  };

  const handleConnectBrain = async () => {
    if (activeTab === 'text') {
      if (!inputText.trim()) {
        addLog("error", "Input is empty. Please provide text to ingest.");
        return;
      }

      setLoading(true);
      addLog("info", "Transmitting data to Neural Core...");

      try {
        const response = await fetch("/api/v1/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: inputText,
            metadata: { source: "user_input" },
          }),
        });

        if (!response.ok) throw new Error("Connection failed");

        const data = await response.json();
        addLog("success", `Processed! Extracted ${data.nodes_created} concepts.`);

        const rawGraph = data.graph_data[0];
        if (rawGraph) {
          updateGraphData(rawGraph);
        }
      } catch (e) {
        console.error(e);
        addLog("error", "Ingestion Failed. Is the Brain (Backend) online?");
      } finally {
        setLoading(false);
      }
    } else {
      // FILE UPLOAD
      if (!selectedFile) {
        addLog("error", "No file selected.");
        return;
      }
      setLoading(true);
      addLog("info", `Uploading & Analyzing ${selectedFile.name}...`);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        addLog("success", `Analyzed ${data.filename}. Extracted ${data.nodes_created} concepts.`);
        // Refresh memory to see new nodes
        handleRecallMemory();

      } catch (e) {
        console.error(e);
        addLog("error", "File Analysis Failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  const updateGraphData = (rawGraph: any) => {
    const formattedData = {
      nodes: rawGraph.nodes.map((n: any) => ({ ...n, id: n.id })),
      links: rawGraph.relationships.map((r: any) => ({
        source: r.source.id,
        target: r.target.id,
        type: r.type
      }))
    };
    setGraphData(formattedData);
    addLog("info", "Updating Visual Cortex...");
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatHistory })
      });

      if (!response.ok) throw new Error("Chat failed");

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: "ai", content: data.reply }]);

    } catch (e) {
      setChatHistory(prev => [...prev, { role: "ai", content: "[Communication Error: Check Backend]" }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleInitializeSystem = () => {
    setLoading(true);
    addLog("info", "Generating Neural Pathways (Simulation Mode)...");

    setTimeout(() => {
      const nodeCount = 500; // Reduced for smoother demo
      const linkCount = 800;
      const types = ["Entity", "Concept", "Person", "Organization", "Technology"];

      const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
        id: `Node_${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        val: Math.random() // size weight
      }));

      const links = Array.from({ length: linkCount }).map(() => {
        const source = `Node_${Math.floor(Math.random() * nodeCount)}`;
        const target = `Node_${Math.floor(Math.random() * nodeCount)}`;
        return { source, target, type: "RELATED_TO" };
      });

      setGraphData({ nodes, links });
      addLog("success", `Simulation Ready. ${nodeCount} active nodes.`);
      setLoading(false);
    }, 1000);
  };

  const handleNodeClick = async (node: any) => {
    addLog("info", `Expanding knowledge for: "${node.id}"...`);
    setLoading(true);

    // Mark this node as expanded
    setExpandedNodes(prev => new Set([...prev, node.id]));

    try {
      const response = await fetch("/api/v1/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: node.id, // Use node ID as seed for expansion
          metadata: { source: "expansion_click", source_node: node.id },
        }),
      });

      if (!response.ok) throw new Error("Expansion failed");

      const data = await response.json();
      addLog("success", `Expanded! Found ${data.nodes_created} related concepts.`);

      const rawGraph = data.graph_data[0];
      if (rawGraph) {
        const newNodes = rawGraph.nodes.map((n: any) => ({ ...n, id: n.id }));
        const newLinks = rawGraph.relationships.map((r: any) => ({
          source: r.source.id,
          target: r.target.id,
          type: r.type
        }));

        setGraphData(prev => {
          // Merge Nodes (prevent duplicates)
          const existingNodeIds = new Set(prev.nodes.map(n => n.id));
          const uniqueNewNodes = newNodes.filter((n: any) => !existingNodeIds.has(n.id));

          // Merge Links (prevent duplicates)
          const existingLinkKeys = new Set(prev.links.map(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return `${s}-${t}-${l.type}`;
          }));

          const uniqueNewLinks = newLinks.filter((l: any) => !existingLinkKeys.has(`${l.source}-${l.target}-${l.type}`));

          return {
            nodes: [...prev.nodes, ...uniqueNewNodes],
            links: [...prev.links, ...uniqueNewLinks]
          };
        });

        addLog("info", "Graph Merged. Visualizing new connections...");
      }

    } catch (e) {
      console.error(e);
      addLog("error", "Failed to expand node.");
    } finally {
      setLoading(false);
    }
  };

  // Clear all graph data and memory
  const handleClearMemory = async () => {
    addLog("info", "Clearing local memory...");
    setGraphData({ nodes: [], links: [] });
    setExpandedNodes(new Set());
    setLogs([]);
    addLog("success", "Memory cleared. Ready for new knowledge.");
  };

  // Open documentation
  const handleOpenDocs = () => {
    window.open("https://github.com/LukeParkXRX/OntologyHub.ai", "_blank");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* SIDEBAR */}
      <aside className="w-96 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 flex flex-col p-6 z-20 shadow-2xl relative">
        {/* Glow behind sidebar */}
        <div className="absolute -left-20 top-0 w-40 h-40 bg-purple-500/20 blur-[100px] pointer-events-none" />

        {/* Banner / Branding */}
        <div className="mb-8 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center border border-white/10">
            <Network className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OntologyHub.ai</h1>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 tracking-wider">XRX</span>
            </div>
            <p className="text-[10px] text-cyan-400 tracking-widest font-mono uppercase">Neural Interface V1.0</p>
          </div>
        </div>

        {/* Navigation / Actions */}
        <nav className="flex-1 space-y-8 relative z-10 overflow-y-auto pr-2 scrollbar-none">

          {/* INPUT SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <MessageSquare className="w-3 h-3" />
              <span>Knowledge Input</span>
            </div>

            {/* TABS */}
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 mb-2">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-400'}`}
              >
                <MessageSquare className="w-3 h-3" /> Text
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'file' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-400'}`}
              >
                <Upload className="w-3 h-3" /> File
              </button>
            </div>

            <div className="relative group">
              {activeTab === 'text' ? (
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="Enter a concept and press Enter..."
                />
              ) : (
                <div className="w-full">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-900/30 cursor-pointer transition-all hover:bg-slate-900/50 group"
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-2 text-cyan-400">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-cyan-400/80">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-xs">Click to upload (PDF, Excel, Img)</span>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            <AliveButton
              className="w-full justify-center" variant="primary" glowColor="cyan"
              onClick={handleConnectBrain} disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Processing..." : (activeTab === 'text' ? "Generate Graph" : "Upload & Analyze")}
            </AliveButton>
          </div>

          <div className="w-full h-px bg-slate-800/50" />

          {/* CONTROLS */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">System Controls</p>

            <AliveButton
              className="w-full justify-start pl-4" variant="secondary"
              onClick={handleInitializeSystem} disabled={loading}
            >
              <Cpu className="w-4 h-4 mr-2" />
              Run Simulation
            </AliveButton>
            <AliveButton
              className="w-full justify-start pl-4" variant="ghost"
              onClick={handleClearMemory}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Memory
            </AliveButton>

            <AliveButton
              className={`w-full justify-start pl-4 ${chatOpen ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400' : ''}`} variant="ghost"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat / Verify
            </AliveButton>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Resources</p>
            <AliveButton
              className="w-full justify-start pl-4" variant="ghost"
              onClick={handleOpenDocs}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </AliveButton>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-800 pt-4 relative z-10">
          <button className="flex items-center gap-3 w-full text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50 group">
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-sm">Settings</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col bg-slate-950">
        {/* Header Bar */}
        <header className="absolute top-0 left-0 right-0 h-16 z-10 flex items-center justify-between px-8 bg-gradient-to-b from-slate-950 to-transparent">
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-[pulse_2s_infinite]"></div>
            <span className="text-[10px] font-mono text-cyan-500/70 tracking-[0.2em]">VISUAL_CORTEX_ACTIVE</span>
          </div>

          {/* XRX Branding */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-3xl font-black tracking-[0.5em] text-cyan-500/10 hover:text-cyan-500/20 transition-colors">XRX</span>
          </div>
          <button
            onClick={handleRecallMemory}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all disabled:opacity-50 pointer-events-auto"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </header>

        {/* Visualization Area (Full Screen) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <AnimatePresence>
            {graphData.nodes.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0"
              >
                <GraphView data={graphData} onNodeClick={handleNodeClick} expandedNodes={expandedNodes} />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                    <Network className="w-32 h-32 mx-auto text-slate-800 relative z-10" />
                  </div>
                  <p className="font-mono text-xs tracking-widest text-slate-600">WAITING FOR KNOWLEDGE INPUT...</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Memory Terminal */}
        <div className="absolute bottom-6 right-6 w-[400px] z-20">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-cyan-500" />
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">SYSTEM_LOGS</span>
              </div>
              <div className="flex gap-1.5 opacity-50">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
            </div>
            <div className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <AnimatePresence>
                {logs.length === 0 && (
                  <motion.p
                    key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-slate-600 italic pl-1"
                  >
                    System initialized. Standing by.
                  </motion.p>
                )}
                {logs.map((log) => (
                  <motion.div
                    key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 border-l-2 border-slate-800 pl-3 py-0.5"
                  >
                    <span className="text-slate-600 min-w-[60px]">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-rose-400' :
                          'text-cyan-200'
                    }>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
                <div ref={logsEndRef} />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CHAT OVERLAY */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-16 bottom-0 w-[400px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-white">Neural Chat</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="text-center mt-10 text-slate-500 text-sm">
                    <p>Ask about the knowledge graph.</p>
                    <p className="text-xs opacity-50 mt-1">"What is Samsung?"</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-sm'
                      : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
