"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import useMeasure from "react-use-measure";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
});

interface GraphData {
    nodes: { id: string; type: string;[key: string]: any }[];
    links: { source: string; target: string; type: string;[key: string]: any }[];
}

interface GraphViewProps {
    data: GraphData;
    onNodeClick?: (node: any) => void;
}

export const GraphView = ({ data, onNodeClick }: GraphViewProps) => {
    const [ref, bounds] = useMeasure();
    const fgRef = useRef<any>();
    const [hoverNode, setHoverNode] = useState<any>(null);

    // Optimize: Pre-calculate neighbors for faster lookup on hover
    const linksMap = useMemo(() => {
        const map = new Map<string, Set<string>>();
        data.links.forEach((link: any) => {
            const source = typeof link.source === 'object' ? link.source.id : link.source;
            const target = typeof link.target === 'object' ? link.target.id : link.target;
            if (!map.has(source)) map.set(source, new Set());
            if (!map.has(target)) map.set(target, new Set());
            map.get(source)?.add(target);
            map.get(target)?.add(source);
        });
        return map;
    }, [data.links]);

    const getNeighbors = useCallback((nodeId: string) => {
        return linksMap.get(nodeId) || new Set();
    }, [linksMap]);


    // Custom Node Rendering for "Obsidian-like" effect
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const isHovered = hoverNode === node;
        const neighbors = hoverNode ? getNeighbors(hoverNode.id) : null;
        const isNeighbor = neighbors ? neighbors.has(node.id) : false;
        const isDimmed = hoverNode && !isHovered && !isNeighbor;

        // Node Color based on Type
        let baseColor = "#94a3b8"; // Default slate
        if (node.type === "Person") baseColor = "#c084fc"; // Purple
        if (node.type === "Organization" || node.type === "Company") baseColor = "#22d3ee"; // Cyan
        if (node.type === "Concept") baseColor = "#facc15"; // Yellow
        if (node.type === "Technology") baseColor = "#4ade80"; // Green

        // Dimming
        const color = isDimmed ? "#1e293b" : baseColor;
        const opacity = isDimmed ? 0.2 : 1;

        // --- OBSIDIAN STYLE SIZING (World Space) ---
        // We do NOT divide by globalScale. Sizes are "physical" in the graph world.
        // This means they grow larger as you zoom in.

        const baseRadius = 4;
        const labelSize = 5; // Fixed "world" size for text

        // Calculate visual size on screen to determine LOD (Level of Detail)
        const screenRadius = baseRadius * globalScale;
        const screenLabelSize = labelSize * globalScale;

        // LOD: Show label if it's large enough to read, or if interacted with
        const showLabel = screenLabelSize > 6 || isHovered || isNeighbor;

        // Draw Node (Solid Circle, no glow unless connected)
        ctx.beginPath();
        const r = isHovered ? baseRadius * 1.3 : baseRadius;
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        // Highlight Ring for Hovered
        if (isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 1.5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 1 / globalScale; // Keep line width constant on screen
            ctx.stroke();
        }

        // Draw Label
        if (showLabel) {
            ctx.font = `${isHovered ? 'bold ' : ''}${labelSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Check contrast or just use standard light text
            ctx.fillStyle = isDimmed ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.85)";

            // Push label down slightly
            const yOffset = r + (labelSize / 2) + 2;
            ctx.fillText(node.id, node.x, node.y + yOffset);
        }
    }, [hoverNode, getNeighbors]);

    useEffect(() => {
        // initial zoom to fit if data exists and bounds are ready
        if (data.nodes.length > 0 && fgRef.current && bounds.width > 0) {
            setTimeout(() => {
                fgRef.current.zoomToFit(400, 50);
            }, 500);
        }
    }, [data.nodes.length, bounds.width]);

    return (
        <div ref={ref} className="w-full h-full relative overflow-hidden bg-slate-950/0">
            {/* Using transparent bg so parent can control it */}
            <ForceGraph2D
                ref={fgRef}
                width={bounds.width}
                height={bounds.height}
                graphData={data}
                nodeLabel="id"
                nodeCanvasObject={paintNode}
                // Hover Interactions
                onNodeHover={setHoverNode}
                onNodeClick={onNodeClick}
                // Link styling (Dims when node hovered)
                linkColor={(link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                    const isRelated = hoverNode && (
                        sourceId === hoverNode.id ||
                        targetId === hoverNode.id
                    );

                    if (hoverNode && !isRelated) return "rgba(100, 116, 139, 0.05)"; // Deep dim
                    if (isRelated) return "rgba(255, 255, 255, 0.6)"; // Highlight

                    return "rgba(148, 163, 184, 0.1)"; // Default thin grey
                }}
                linkWidth={(link: any) => {
                    // Keep lines thin and elegant
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const isRelated = hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id);
                    return isRelated ? 2 : 0.5;
                }}
                backgroundColor="rgba(0,0,0,0)"
                d3VelocityDecay={0.4}
                d3AlphaDecay={0.01}
            />
            <div className="absolute top-4 right-4 text-[10px] text-slate-600 font-mono tracking-widest opacity-30 pointer-events-none">
                OBSIDIAN_MODE_ACTIVE
            </div>
        </div>
    );
};
