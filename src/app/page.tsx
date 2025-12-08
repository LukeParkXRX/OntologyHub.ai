"use client";

import { useState } from "react";
import { Brain, Sparkles, Loader2, Maximize2, Minimize2, X, Save, FolderOpen, Trash2, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AuthButton from "@/components/AuthButton";
import SaveGraphDialog from "@/components/SaveGraphDialog";
import GraphLibrary from "@/components/GraphLibrary";

// Dynamically import GraphView to avoid SSR issues with Cytoscape
const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] border border-border rounded-lg bg-card flex items-center justify-center text-muted-foreground">
      그래프 엔진 초기화 중...
    </div>
  ),
});

// Dynamically import NetworkBackground to avoid SSR issues with Canvas
const NetworkBackground = dynamic(() => import("@/components/NetworkBackground"), {
  ssr: false,
});

// Dynamically import GraphLoadingAnimation
const GraphLoadingAnimation = dynamic(() => import("@/components/GraphLoadingAnimation"), {
  ssr: false,
});

const FloatingLines = dynamic(() => import("@/components/FloatingLines"), {
  ssr: false,
});

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnimationFading, setIsAnimationFading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate graph");
      }

      console.log('[handleGenerate] Received data from API:', data);
      console.log('[handleGenerate] Data structure valid:', !!(data?.elements?.nodes && data?.elements?.edges));

      // Wait for animation to complete (1.2s)
      setTimeout(() => {
        setGraphData((prev: any) => {
          // If no previous graph, initialize with depth 0
          if (!prev) {
            console.log('[handleGenerate] Initializing new graph');
            const nodesWithDepth = data.elements.nodes.map((n: any) => ({
              ...n,
              data: { ...n.data, depth: 0, role: n.data.label === inputText ? 'root' : undefined }
            }));

            const edgesWithDepth = data.elements.edges.map((e: any) => ({
              ...e,
              data: { ...e.data, depth: 0 }
            }));

            setCurrentDepth(0);
            const newGraphData = {
              elements: {
                nodes: nodesWithDepth,
                edges: edgesWithDepth
              }
            };
            console.log('[handleGenerate] New graph data:', newGraphData);
            return newGraphData;
          }

          // Expansion - increment depth
          console.log('[handleGenerate] Expanding existing graph');
          const nextDepth = currentDepth + 1;
          setCurrentDepth(nextDepth);

          // Identify the source of expansion from the input text
          const idMatch = inputText.match(/ID:\s*([a-zA-Z0-9_]+)/);
          const sourceId = idMatch ? idMatch[1] : null;
          console.log('[handleGenerate] Source ID for expansion:', sourceId);

          // Simple merge strategy: concatenate nodes and edges, avoiding duplicates by ID
          const existingNodeIds = new Set(prev.elements.nodes.map((n: any) => n.data.id));
          const existingEdgeIds = new Set(prev.elements.edges.map((e: any) => e.data.source + "-" + e.data.target + "-" + e.data.label));

          // Update existing nodes: Mark the source node as "expanded"
          const existingNodes = prev.elements.nodes.map((n: any) => {
            if (n.data.id === sourceId) {
              return { ...n, data: { ...n.data, expanded: true } };
            }
            return n;
          });

          const newNodes = data.elements.nodes
            .filter((n: any) => !existingNodeIds.has(n.data.id))
            .map((n: any) => ({
              ...n,
              data: { ...n.data, depth: nextDepth }
            }));

          // Create a set of ALL valid node IDs (existing + new)
          const allValidNodeIds = new Set([...existingNodeIds, ...newNodes.map((n: any) => n.data.id)]);

          // Filter new edges: must be unique AND have valid source/target
          const newEdges = data.elements.edges
            .filter((e: any) => {
              const edgeKey = e.data.source + "-" + e.data.target + "-" + e.data.label;
              return !existingEdgeIds.has(edgeKey) &&
                allValidNodeIds.has(e.data.source) &&
                allValidNodeIds.has(e.data.target);
            })
            .map((e: any) => ({
              ...e,
              data: { ...e.data, depth: nextDepth }
            }));

          console.log('[handleGenerate] Added', newNodes.length, 'new nodes and', newEdges.length, 'new edges');

          return {
            elements: {
              nodes: [...existingNodes, ...newNodes],
              edges: [...prev.elements.edges, ...newEdges],
            }
          };
        });
      }, 1200);
    } catch (err: any) {
      console.error("Generation Error:", err);
      const errorMessage = err instanceof Event ? "A network or resource error occurred." : (err.message || "An unexpected error occurred");
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Start fade out
      setIsAnimationFading(true);
      // Wait for fade out animation (700ms) then remove component
      setTimeout(() => {
        setIsGenerating(false);
        setIsAnimationFading(false);
      }, 700);
    }
  };

  const handleNodeClick = (nodeData: any) => {
    // Set selected item to show details
    setSelectedItem({ type: 'node', data: nodeData });

    // Populate input text with expansion prompt
    const expansionText = "Expand on the concept '" + nodeData.label + "' (ID: " + nodeData.id + "). Find related sub-concepts, examples, or detailed relationships to enrich the ontology.";
    setInputText(expansionText);
  };

  const handleEdgeClick = (edgeData: any) => {
    // Set selected item to show relationship details
    setSelectedItem({ type: 'edge', data: edgeData });
  };

  const handleClear = () => {
    setGraphData(null);
    setInputText("");
    setError(null);
    setSelectedItem(null);
  };

  return (
    <>
      {/* Fullscreen Graph Overlay */}
      {isFullscreen && graphData ? (
        <div className="fixed inset-0 z-[100] bg-[#020617]">
          <GraphView
            key="graph-fullscreen"
            elements={graphData.elements}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            isFullscreen={true}
          />
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-[101] h-10 px-4 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-sm text-sm font-medium transition-all flex items-center gap-2 text-white"
          >
            <X className="h-4 w-4" />
            Close Fullscreen
          </button>
        </div>
      ) : null}

      {/* Main Page */}
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
        {/* Background Effect */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines />
        </div>
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
              <a href="#" className="text-foreground/80 hover:text-primary transition-colors">Graph Engine</a>
              <Link href="/domains" className="text-foreground/60 hover:text-primary transition-colors">My Domains</Link>
              <Link href="/version" className="text-foreground/60 hover:text-primary transition-colors">버전</Link>
              <Link href="/about" className="text-foreground/60 hover:text-primary transition-colors">About</Link>
            </nav>
            <div className="flex items-center gap-4">
              <AuthButton />
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
              <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-foreground/70">
                v0.1.0 Beta
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full gap-12">

          {/* Hero Section */}
          <section className="flex flex-col items-center text-center gap-6 py-12 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Structure. Understand. Connect.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 animate-fade-in-slow max-w-4xl">
              Transform Text into <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-indigo-500">
                Knowledge Graphs
              </span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in-slow delay-100">
              A service that transforms text into ontology-based knowledge graphs, enabling accurate AI and structured domain intelligence.
            </p>
          </section>

          {/* Main Content */}
          <div className="flex-1 flex flex-col w-full h-full max-w-screen-2xl mx-auto z-10 relative">

            {/* Centered Input Section */}
            <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out ${graphData ? "mt-0 mb-6" : "mt-[15vh]"}`}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 focus-within:bg-card/60 focus-within:border-primary/30 focus-within:shadow-primary/10">
                  <div className="flex items-start p-2">
                    <textarea
                      className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none resize-none focus:ring-0 text-foreground/90 placeholder:text-muted-foreground/50 text-lg leading-relaxed p-4"
                      placeholder="Describe your knowledge... (e.g. 'Apple Inc. was founded by Steve Jobs...')"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!loading && inputText.trim()) {
                            handleGenerate();
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="px-6 pb-3 flex justify-between items-center text-xs text-muted-foreground/50 border-t border-white/5 pt-3">
                    <span>Enter to generate, Shift+Enter for new line</span>
                    <span>{inputText.length} chars</span>
                  </div>
                </div>

                {/* Generate Button - Centered below input */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !inputText.trim()}
                    className={cn(
                      "h-12 px-8 rounded-full font-semibold text-white shadow-lg transition-all duration-300 flex items-center gap-2 group relative overflow-hidden",
                      loading || !inputText.trim()
                        ? "bg-muted cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/25 hover:scale-105 active:scale-95"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Graph</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Graph Section */}
            <div className={cn(
              "w-full h-[600px] rounded-2xl border border-white/10 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden relative transition-all duration-500 z-10",
              !graphData && !isGenerating ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"
            )}>

              {/* Graph Toolbar */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {graphData && (
                  <>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="h-9 px-4 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-xs font-medium transition-all flex items-center gap-2"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Graph
                    </button>
                    <button
                      onClick={() => setShowLibrary(true)}
                      className="h-9 px-4 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-xs font-medium transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      My Graphs
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-9 px-4 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-xs font-medium transition-all flex items-center gap-2"
                    >
                      {isFullscreen ? (
                        <>
                          <X className="h-3.5 w-3.5" />
                          Close
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3.5 w-3.5" />
                          Fullscreen
                        </>
                      )}
                    </button>
                    {!isFullscreen && (
                      <>
                        <button
                          onClick={handleClear}
                          className="h-9 px-4 rounded-lg bg-black/40 hover:bg-red-500/20 hover:text-red-400 border border-white/10 backdrop-blur-sm text-xs font-medium transition-all flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Clear
                        </button>
                        <button
                          onClick={() => {
                            if (!graphData) return;
                            const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "ontology-graph.json";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="h-9 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 backdrop-blur-sm text-xs font-medium transition-all flex items-center gap-2"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Export JSON
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Graph Area */}
              <div className="absolute inset-0 w-full h-full bg-[#020617] border-t border-white/10">
                {/* Loading Animation Overlay */}
                {isGenerating && (
                  <div className={`absolute inset-0 z-20 transition-opacity duration-700 ${isAnimationFading ? 'opacity-0' : 'opacity-100'} `}>
                    <GraphLoadingAnimation />
                  </div>
                )}


                {graphData ? (
                  <GraphView
                    key={`graph-${isFullscreen ? 'fullscreen' : 'normal'} `}
                    elements={graphData.elements}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    isFullscreen={isFullscreen}
                  />
                ) : null}
              </div>

              {/* Node Details Panel */}
              {selectedItem && !isFullscreen && (
                <div className="absolute bottom-4 left-4 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-4 shadow-xl animate-fade-in z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-primary">
                      {selectedItem.label || selectedItem.id}
                    </h4>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-muted-foreground hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {Object.entries(selectedItem).map(([key, value]) => {
                      if (key === 'id' || key === 'label' || key === 'expanded' || key === 'role') return null;
                      return (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs uppercase tracking-wider opacity-50">{key}</span>
                          <span className="text-foreground/90">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {showSaveDialog && graphData && (
        <SaveGraphDialog
          graphData={graphData.elements}
          onClose={() => setShowSaveDialog(false)}
          onSave={() => {
            setShowSaveDialog(false);
            // Optionally show success message
          }}
        />
      )}

      {showLibrary && (
        <GraphLibrary
          onLoad={(loadedGraphData) => {
            setGraphData({ elements: loadedGraphData });
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
}
