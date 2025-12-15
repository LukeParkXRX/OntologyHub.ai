"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import useMeasure from "react-use-measure";
import * as d3 from "d3-force";

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
    expandedNodes?: Set<string>; // Track which nodes have been expanded
}

export const GraphView = ({ data, onNodeClick, expandedNodes = new Set() }: GraphViewProps) => {
    const [ref, bounds] = useMeasure();
    const fgRef = useRef<any>(null);
    const [hoverNode, setHoverNode] = useState<any>(null);
    const [animationTime, setAnimationTime] = useState(0);

    // Animation loop for pulsing effect on expanded nodes
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationTime(prev => prev + 0.1);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Validate graph data: filter out links that reference non-existent nodes
    const validatedData = useMemo(() => {
        const nodeIds = new Set(data.nodes.map(node => String(node.id)));
        const validLinks = data.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? (link.source as any).id : String(link.source);
            const targetId = typeof link.target === 'object' ? (link.target as any).id : String(link.target);
            return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });

        if (validLinks.length !== data.links.length) {
            console.warn(`GraphView: Filtered out ${data.links.length - validLinks.length} invalid links`);
        }

        return {
            nodes: data.nodes,
            links: validLinks
        };
    }, [data]);

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

    // Apply collision force to prevent node overlap
    useEffect(() => {
        if (fgRef.current) {
            const fg = fgRef.current;
            // Add collision detection force
            fg.d3Force('collision', d3.forceCollide().radius(25).strength(1));
            // Increase charge to spread nodes apart more
            fg.d3Force('charge')?.strength(-200);
            // Increase link distance
            fg.d3Force('link')?.distance(80);
            // Re-heat the simulation to apply changes
            fg.d3ReheatSimulation();
        }
    }, [validatedData]);

    // Custom Node Rendering for "Obsidian-like" effect
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const isHovered = hoverNode === node;
        const neighbors = hoverNode ? getNeighbors(hoverNode.id) : null;
        const isNeighbor = neighbors ? neighbors.has(node.id) : false;
        const isDimmed = hoverNode && !isHovered && !isNeighbor;
        const isExpanded = expandedNodes.has(node.id);

        // Node Color based on Type
        let baseColor = "#94a3b8"; // Default slate
        if (node.type === "Person") baseColor = "#c084fc"; // Purple
        if (node.type === "Organization" || node.type === "Company") baseColor = "#22d3ee"; // Cyan
        if (node.type === "Concept") baseColor = "#facc15"; // Yellow
        if (node.type === "Technology") baseColor = "#4ade80"; // Green
        if (node.type === "Event") baseColor = "#f97316"; // Orange
        if (node.type === "Location") baseColor = "#06b6d4"; // Teal

        // Dimming
        const color = isDimmed ? "#1e293b" : baseColor;

        // --- OBSIDIAN STYLE SIZING (World Space) ---
        const baseRadius = isExpanded ? 6 : 4; // Expanded nodes are bigger
        const labelSize = 5;

        const screenLabelSize = labelSize * globalScale;
        const showLabel = screenLabelSize > 6 || isHovered || isNeighbor || isExpanded;

        // Draw expanded node glow/pulse effect
        if (isExpanded && !isDimmed) {
            const pulseRadius = baseRadius + 4 + Math.sin(animationTime * 2) * 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = `rgba(34, 211, 238, ${0.15 + Math.sin(animationTime * 2) * 0.1})`;
            ctx.fill();

            // Outer ring for expanded nodes
            ctx.beginPath();
            ctx.arc(node.x, node.y, baseRadius + 2, 0, 2 * Math.PI, false);
            ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Draw Node
        ctx.beginPath();
        const r = isHovered ? baseRadius * 1.3 : baseRadius;
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        // Highlight Ring for Hovered
        if (isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 1.5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
        }

        // Draw Label
        if (showLabel) {
            ctx.font = `${isHovered || isExpanded ? 'bold ' : ''}${labelSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isDimmed ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)";

            const yOffset = r + (labelSize / 2) + 3;
            ctx.fillText(node.id, node.x, node.y + yOffset);
        }
    }, [hoverNode, getNeighbors, expandedNodes, animationTime]);

    useEffect(() => {
        if (data.nodes.length > 0 && fgRef.current && bounds.width > 0) {
            setTimeout(() => {
                fgRef.current.zoomToFit(400, 80);
            }, 500);
        }
    }, [data.nodes.length, bounds.width]);

    return (
        <div ref={ref} className="w-full h-full relative overflow-hidden bg-slate-950/0">
            <ForceGraph2D
                ref={fgRef}
                width={bounds.width}
                height={bounds.height}
                graphData={validatedData}
                nodeLabel="id"
                nodeCanvasObject={paintNode}
                onNodeHover={setHoverNode}
                onNodeClick={onNodeClick}
                linkColor={(link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                    const isRelated = hoverNode && (
                        sourceId === hoverNode.id ||
                        targetId === hoverNode.id
                    );

                    if (hoverNode && !isRelated) return "rgba(100, 116, 139, 0.05)";
                    if (isRelated) return "rgba(255, 255, 255, 0.6)";
                    return "rgba(148, 163, 184, 0.15)";
                }}
                linkWidth={(link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const isRelated = hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id);
                    return isRelated ? 2 : 0.8;
                }}
                backgroundColor="rgba(0,0,0,0)"
                d3VelocityDecay={0.3}
                d3AlphaDecay={0.02}
                cooldownTicks={100}
                warmupTicks={50}
            />
            <div className="absolute top-4 right-4 text-[10px] text-slate-600 font-mono tracking-widest opacity-30 pointer-events-none">
                OBSIDIAN_MODE • {data.nodes.length} nodes
            </div>
        </div>
    );
};
