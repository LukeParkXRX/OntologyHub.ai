'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="text-white">Loading Graph...</div>
});

interface GraphData {
    nodes: any[];
    links: any[];
}

interface Graph3DProps {
    data: GraphData;
    onNodeClick?: (node: any) => void;
    arrangeTrigger?: number;
    highlightNodes?: Set<string>;
    selectedNodeId?: string | null;
}

// --- Shared Static Resources (Memory Efficiency) ---
const SHARED_SPHERE_GEO = new THREE.SphereGeometry(1, 24, 24);
const SHARED_SHELL_GEO = new THREE.IcosahedronGeometry(1, 0);

const Graph3D = forwardRef((props: Graph3DProps, ref) => {
    const { data, onNodeClick, arrangeTrigger, highlightNodes, selectedNodeId } = props;
    const fgRef = useRef<any>(null);

    // Expose APIs correctly
    useImperativeHandle(ref, () => ({
        fgRef: fgRef,
        graph2ScreenCoords: (x: number, y: number, z: number) => {
            if (!fgRef.current) return null;
            return fgRef.current.graph2ScreenCoords(x, y, z);
        }
    }));

    // Stable Data Processing
    const cleanData = useMemo(() => {
        if (!data.nodes) return { nodes: [], links: [] };
        const newNodes = data.nodes.map(n => ({ ...n, connections: 0 }));
        const nodeMap = new Map(newNodes.map(n => [n.id, n]));

        const newLinks = data.links
            .filter(l => {
                const s = typeof l.source === 'object' ? l.source.id : l.source;
                const t = typeof l.target === 'object' ? l.target.id : l.target;
                return nodeMap.has(s) && nodeMap.has(t);
            })
            .map(l => {
                const s = typeof l.source === 'object' ? l.source.id : l.source;
                const t = typeof l.target === 'object' ? l.target.id : l.target;
                const sourceNode = nodeMap.get(s);
                const targetNode = nodeMap.get(t);
                if (sourceNode) sourceNode.connections++;
                if (targetNode) targetNode.connections++;
                return { ...l, source: s, target: t };
            });

        return { nodes: Array.from(nodeMap.values()), links: newLinks };
    }, [data]);

    // Initial / New Data Recenter (Stable)
    useEffect(() => {
        if (!fgRef.current || !cleanData.nodes.length || selectedNodeId) return;
        const timer = setTimeout(() => {
            if (fgRef.current) {
                fgRef.current.cameraPosition({ x: 400, y: 400, z: 800 }, { x: 0, y: 0, z: 0 }, 1000);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [cleanData.nodes.length, selectedNodeId]);

    // Physics Engine Setup
    useEffect(() => {
        const fg = fgRef.current;
        if (!fg) return;
        const timer = setTimeout(() => {
            if (!fgRef.current) return;
            fgRef.current.d3Force('charge')?.strength(-1000);
            fgRef.current.d3Force('link')?.distance(130);
            fgRef.current.d3VelocityDecay(0.7);
            fgRef.current.d3AlphaDecay(0.04);
            fgRef.current.d3ReheatSimulation();
        }, 600);
        return () => clearTimeout(timer);
    }, [cleanData]);

    // --- ACCESSORS ---

    const handleNodeClick = useCallback((node: any) => {
        const distance = 460;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        if (fgRef.current) {
            // FIX: Decouple from node object to release OrbitControls lock
            const target = new THREE.Vector3(node.x, node.y, node.z);
            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                target,
                800 // Faster transition for better responsiveness
            );
        }
        if (onNodeClick) onNodeClick(node);
    }, [onNodeClick]);

    const nodeObject = useCallback((node: any) => {
        const group = new THREE.Group();
        const isRoot = node.isRoot || node.properties?.isRoot || node.id === (node.keyword || '');
        const isSelected = node.id === selectedNodeId;
        const hasHeritage = node.generationSource === selectedNodeId && selectedNodeId;

        let color = isRoot ? '#ffffff' : (node.group === 1 ? '#00f0ff' : '#a855f7');
        if (isSelected) color = '#f97316';

        const baseSize = 4.5;
        const scaleFactor = Math.min(2.5, 1 + (node.connections || 0) * 0.15);
        const size = isRoot ? baseSize * 2.2 : baseSize * scaleFactor;

        // Core Sphere
        const coreMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: isSelected ? 3.0 : 1.2,
            roughness: 0.1,
            metalness: 0.5
        });
        const core = new THREE.Mesh(SHARED_SPHERE_GEO, coreMat);
        core.scale.setScalar(size);

        if (isSelected) {
            core.onBeforeRender = () => {
                const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.06;
                core.scale.setScalar(size * pulse);
            };
        }
        group.add(core);

        // Shell
        const shellMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: isSelected ? 0.6 : 0.15
        });
        const shell = new THREE.Mesh(SHARED_SHELL_GEO, shellMat);
        const shellRadius = size * (isSelected ? 1.6 : 1.3);
        shell.scale.setScalar(shellRadius);

        const rotSpeed = 0.01 + Math.random() * 0.015;
        shell.onBeforeRender = () => {
            shell.rotation.x += rotSpeed * 0.4;
            shell.rotation.y += rotSpeed * 0.2;
        };
        group.add(shell);

        // Label LOD
        const labelText = node.properties?.name || node.name || node.id || 'Unknown';
        const sprite = new SpriteText(labelText);
        sprite.color = isSelected ? '#ffffff' : '#e2e8f0';
        sprite.textHeight = Math.max(isSelected ? 6.5 : 4.5, size * 0.65);
        sprite.position.y = size * 3.0;
        sprite.fontFace = 'Inter, sans-serif';
        sprite.backgroundColor = isSelected ? 'rgba(249,115,22,0.45)' : 'rgba(2, 4, 10, 0.55)';
        sprite.padding = 1.4;

        const isHero = isSelected || isRoot || (node.connections || 0) > 8;
        sprite.onBeforeRender = (renderer, scene, camera) => {
            const dist = camera.position.distanceTo(group.position);
            if (isHero) {
                sprite.material.opacity = Math.max(0.4, 1.0 - (dist / 5000));
            } else {
                sprite.material.opacity = dist > 2500 ? 0 : (dist > 1300 ? 1 - ((dist - 1300) / 1200) : 0.9);
            }
        };
        group.add(sprite);

        return group;
    }, [selectedNodeId]);

    const getLinkWidth = useCallback((link: any) => {
        const isActive = (link.source.id || link.source) === selectedNodeId || (link.target.id || link.target) === selectedNodeId;
        return isActive ? 1.8 : 0.6;
    }, [selectedNodeId]);

    const getLinkColor = useCallback((link: any) => {
        const isActive = (link.source.id || link.source) === selectedNodeId || (link.target.id || link.target) === selectedNodeId;
        return isActive ? 'rgba(249, 115, 22, 0.7)' : 'rgba(0, 240, 255, 0.25)';
    }, [selectedNodeId]);

    const getLinkParticles = useCallback((link: any) => {
        const isActive = (link.source.id || link.source) === selectedNodeId || (link.target.id || link.target) === selectedNodeId;
        return isActive ? 10 : 1;
    }, [selectedNodeId]);

    const getLinkParticleSpeed = useCallback((link: any) => {
        const isActive = (link.source.id || link.source) === selectedNodeId || (link.target.id || link.target) === selectedNodeId;
        return isActive ? 0.003 : 0.0006;
    }, [selectedNodeId]);

    return (
        <div className="w-full h-full bg-[#02040a]" style={{ pointerEvents: 'auto' }}>
            <ForceGraph3D
                ref={fgRef}
                rendererConfig={{ antialias: true, alpha: true }}
                graphData={cleanData}
                nodeLabel="name"
                showNavInfo={false}
                cooldownTicks={100}

                // Node Props
                nodeThreeObject={nodeObject}
                nodeThreeObjectExtend={false}
                onNodeClick={handleNodeClick}

                // Link Props
                linkWidth={getLinkWidth}
                linkColor={getLinkColor}
                linkDirectionalParticles={getLinkParticles}
                linkDirectionalParticleWidth={2.2}
                linkDirectionalParticleSpeed={getLinkParticleSpeed}
                linkDirectionalParticleColor={() => '#ffffff'}
                linkDirectionalArrowLength={2.5}
                linkDirectionalArrowRelPos={1}

                // Predicate Labels
                linkThreeObjectExtend={true}
                linkThreeObject={(link: any) => {
                    const name = link.name;
                    if (!name || name === 'RELATED' || name === '') return new THREE.Object3D();
                    const sprite = new SpriteText(name);
                    sprite.color = 'rgba(0, 240, 255, 0.85)';
                    sprite.textHeight = 3.2;
                    sprite.fontFace = 'Inter, sans-serif';
                    sprite.backgroundColor = 'rgba(2, 4, 10, 0.75)';
                    sprite.padding = 1.0;
                    return sprite;
                }}
                linkPositionUpdate={(sprite: any, { start, end }: any) => {
                    if (!start || !end) return;
                    sprite.position.set(
                        start.x + (end.x - start.x) / 2,
                        start.y + (end.y - start.y) / 2,
                        start.z + (end.z - start.z) / 2
                    );
                }}

                backgroundColor="#010308"
                enableNodeDrag={true}
                onNodeDragEnd={(node: any) => {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }}
            />

            {/* HUD Controls */}
            <div className="absolute bottom-10 left-10 flex flex-col gap-3 z-50">
                <button
                    onClick={() => {
                        if (fgRef.current) {
                            fgRef.current.cameraPosition({ x: 400, y: 400, z: 800 }, { x: 0, y: 0, z: 0 }, 1000);
                        }
                    }}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl text-xs uppercase tracking-widest font-bold shadow-lg"
                >
                    Reset View
                </button>
                <button
                    onClick={() => {
                        if (fgRef.current && cleanData.nodes.length) {
                            const root = cleanData.nodes.find(n => n.isRoot || n.properties?.isRoot) || cleanData.nodes[0];
                            if (root) {
                                fgRef.current.cameraPosition(
                                    { x: root.x + 350, y: root.y + 350, z: root.z + 500 },
                                    { x: root.x, y: root.y, z: root.z },
                                    800
                                );
                            }
                        }
                    }}
                    className="px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all backdrop-blur-xl text-xs uppercase tracking-widest font-bold shadow-lg"
                >
                    Focus Center
                </button>
            </div>
        </div>
    );
});

Graph3D.displayName = 'Graph3D';
export default Graph3D;
