"use client";

import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";

interface GraphViewProps {
    elements: {
        nodes: any[];
        edges: any[];
    };
    onNodeClick?: (nodeData: any) => void;
    onEdgeClick?: (edgeData: any) => void;
    isFullscreen?: boolean;
}

export default function GraphView({ elements, onNodeClick, onEdgeClick, isFullscreen = false }: GraphViewProps) {
    const cyRef = React.useRef<cytoscape.Core | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleCy = (cy: cytoscape.Core) => {
        cyRef.current = cy;

        // Remove previous listeners to avoid duplicates on re-render
        cy.removeAllListeners();

        // Add drag event listeners to move children with parent
        cy.on('grab', 'node', (e) => {
            const node = e.target;
            const startPos = { ...node.position() };
            node.scratch('startPos', startPos);

            // Store start position for all successors (children/descendants)
            node.successors().nodes().each((child: any) => {
                child.scratch('startPos', { ...child.position() });
            });
        });

        cy.on('drag', 'node', (e) => {
            const node = e.target;
            const currentPos = node.position();
            const startPos = node.scratch('startPos');

            if (startPos) {
                const dx = currentPos.x - startPos.x;
                const dy = currentPos.y - startPos.y;

                // Move all successors by the same delta
                node.successors().nodes().each((child: any) => {
                    const childStart = child.scratch('startPos');
                    if (childStart) {
                        child.position({
                            x: childStart.x + dx,
                            y: childStart.y + dy
                        });
                    }
                });
            }
        });

        cy.on("tap", "node", (event) => {
            const node = event.target;
            if (onNodeClick) {
                onNodeClick(node.data());
            }
        });

        cy.on("tap", "edge", (event) => {
            const edge = event.target;
            if (onEdgeClick) {
                onEdgeClick(edge.data());
            }
        });
    };

    const layout = {
        name: "cose",
        animate: true,
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        refresh: 20,
        fit: true,
        padding: 50,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 0.25,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
    };

    // Obsidian-like Design with Visual Effects
    const stylesheet: any = [
        {
            selector: "node",
            style: {
                "background-color": (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");

                    if (role === "root") return "#ef4444"; // Red-500 for Root (Distinct start)
                    if (expanded) return "#f59e0b"; // Amber-500 for Expanded nodes (Point color)

                    const depth = ele.data("depth") || 0;
                    // Subtle gradient colors for different depths
                    const colors = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4"];
                    return colors[depth % colors.length];
                },
                width: (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");
                    if (role === "root") return 32; // Larger root
                    if (expanded) return 22; // Slightly larger for expanded
                    return 18;
                },
                height: (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");
                    if (role === "root") return 32;
                    if (expanded) return 22;
                    return 18;
                },
                label: "data(label)",
                color: "#cbd5e1", // Slate-300 (Subtle text)
                "font-size": (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");
                    if (role === "root") return "16px";
                    if (expanded) return "14px";
                    return "13px";
                },
                "font-weight": (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");
                    return (role === "root" || expanded) ? "600" : "500";
                },
                "text-valign": "bottom",
                "text-halign": "center",
                "text-margin-y": 8,
                "text-background-opacity": 0,
                "text-outline-color": "#020617",
                "text-outline-width": 3,
                "border-width": (ele: any) => {
                    const expanded = ele.data("expanded");
                    const role = ele.data("role");
                    if (role === "root") return 3; // Thicker border for root
                    return expanded ? 2.5 : 0;
                },
                "border-color": (ele: any) => {
                    const role = ele.data("role");
                    const expanded = ele.data("expanded");
                    if (role === "root") return "#ef4444";
                    if (expanded) return "#fbbf24";
                    return "#ffffff";
                },
                "transition-property": "background-color, width, height, border-width",
                "transition-duration": "0.4s",
                "transition-timing-function": "ease-in-out"
            },
        },
        {
            selector: "node:selected",
            style: {
                "border-width": 3,
                "border-color": "#ffffff",
                "background-color": "#ffffff",
            },
        },
        {
            selector: "edge",
            style: {
                width: (ele: any) => {
                    const depth = ele.data("depth") || 0;
                    return depth === 0 ? 2.5 : 1.8; // Thicker edges for root connections
                },
                "line-color": (ele: any) => {
                    const depth = ele.data("depth") || 0;
                    // Edges from root are more visible
                    if (depth === 0) return "#64748b"; // Slate-500
                    return "#475569"; // Slate-600
                },
                "line-opacity": (ele: any) => {
                    const depth = ele.data("depth") || 0;
                    return depth === 0 ? 0.8 : 0.6;
                },
                "target-arrow-shape": "triangle",
                "target-arrow-color": (ele: any) => {
                    const depth = ele.data("depth") || 0;
                    if (depth === 0) return "#64748b";
                    return "#475569";
                },
                "arrow-scale": 0.8,
                "curve-style": "unbundled-bezier",
                "control-point-distances": [40],
                "control-point-weights": [0.5],
                label: "",
            },
        },
        {
            selector: "edge:selected",
            style: {
                width: 3,
                "line-color": "#ffffff",
                "line-opacity": 1,
                "z-index": 999,
            },
        },
    ];

    // Transform elements to flat array for CytoscapeComponent
    const cyElements = React.useMemo(() => {
        console.log('[GraphView] Received elements:', elements);
        const flatElements = [
            ...(elements.nodes || []),
            ...(elements.edges || []),
        ];
        console.log('[GraphView] Transformed cyElements:', flatElements);
        console.log('[GraphView] Node count:', elements.nodes?.length || 0);
        console.log('[GraphView] Edge count:', elements.edges?.length || 0);
        return flatElements;
    }, [elements]);

    // Force layout run when elements change
    React.useEffect(() => {
        const cy = cyRef.current;
        if (!cy || !elements || cyElements.length === 0) return;

        console.log('[GraphView] Layout effect triggered. Element count:', cyElements.length);

        let isMounted = true;

        // Run layout
        const layoutInstance = cy.layout(layout);
        layoutInstance.run();

        // Fit after layout
        layoutInstance.promiseOn('layoutstop').then(() => {
            if (isMounted && cy && !cy.destroyed()) {
                cy.fit();
            }
        }).catch((err) => {
            console.warn('[GraphView] Layout stop error:', err);
        });

        return () => {
            isMounted = false;
            if (layoutInstance && layoutInstance.stop) {
                layoutInstance.stop();
            }
        };
    }, [cyElements]);

    // ResizeObserver logic
    React.useEffect(() => {
        if (!containerRef.current || !cyRef.current) return;
        const cy = cyRef.current;
        const container = containerRef.current;

        const resizeObserver = new ResizeObserver((entries) => {
            if (cy && !cy.destroyed()) {
                console.log('[GraphView] Container resized:', entries[0].contentRect.width, 'x', entries[0].contentRect.height);
                cy.resize();
                cy.fit();
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Add pulsing animation to root node
    React.useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        let animationFrame: number;
        let startTime = Date.now();
        let isMounted = true;

        const animate = () => {
            if (!isMounted || !cy || cy.destroyed()) {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                return;
            }

            const elapsed = Date.now() - startTime;
            const pulse = Math.sin(elapsed / 800) * 0.5 + 0.5; // Smooth sine wave

            try {
                const rootNodes = cy.nodes('[role="root"]');
                if (rootNodes && rootNodes.length > 0) {
                    rootNodes.forEach((node: any) => {
                        if (node && !node.removed()) {
                            const baseBorderWidth = 3;
                            node.style({
                                'border-width': baseBorderWidth + pulse * 2
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('[GraphView] Animation error:', err);
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            isMounted = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [cyElements]); // Re-run when elements change

    console.log('[GraphView] Rendering with', cyElements.length, 'total elements');

    return (
        <div ref={containerRef} className="w-full h-full">
            <CytoscapeComponent
                cy={handleCy}
                elements={cyElements}
                style={{ width: "100%", height: "100%", backgroundColor: "transparent" }} // Transparent to show container bg
                stylesheet={stylesheet}
                layout={layout}
                minZoom={0.2}
                maxZoom={3}
            />
            {!isFullscreen && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                        onClick={() => {
                            if (cyRef.current) {
                                cyRef.current.layout(layout).run();
                                cyRef.current.fit();
                            }
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-muted-foreground px-2 py-1 rounded border border-white/10 backdrop-blur-sm transition-colors"
                    >
                        Reset View
                    </button>
                </div>
            )}
        </div>
    );
}
