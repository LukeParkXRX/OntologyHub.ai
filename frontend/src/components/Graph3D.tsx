'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import * as d3 from 'd3';

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
    arrangeTrigger?: number; // Trigger to reheating simulation
    highlightNodes?: Set<string>; // New: Nodes to highlight (e.g., recently added)
}

const Graph3D = ({ data, onNodeClick, arrangeTrigger, highlightNodes }: Graph3DProps) => {
    // console.log("Graph3D Received Data - Nodes:", data.nodes.length, "Links:", data.links.length);
    const fgRef = useRef<any>(null);
    const frameRef = useRef<number>(0);

    // [ALIVE FIX] Deep Clone & Sanitize Data
    // 1. Prevent D3 mutation side-effects.
    // 2. Filter dangling links.
    // 3. Calculate node importance (degree)
    const cleanData = useMemo(() => {
        if (!data.nodes) return { nodes: [], links: [] };

        const newNodes = data.nodes.map(n => ({
            ...n,
            connections: 0
        }));
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

                // Track connections
                const sourceNode = nodeMap.get(s);
                const targetNode = nodeMap.get(t);
                if (sourceNode) sourceNode.connections++;
                if (targetNode) targetNode.connections++;

                return {
                    ...l,
                    source: s,
                    target: t
                };
            });

        return { nodes: Array.from(nodeMap.values()), links: newLinks };
    }, [data]);

    // Animation Loop
    useEffect(() => {
        const tick = () => {
            if (!fgRef.current) return;
            try {
                const camera = fgRef.current.camera();
                const scene = fgRef.current.scene();
                const time = Date.now() * 0.001;

                const dist = camera.position.length();

                scene.traverse((obj: any) => {
                    // Update Text Opacity (Hero-Centric LOD)
                    if (obj.isSprite && obj.textHeight) {
                        const isHero = obj.userData?.isHero;
                        if (isHero) {
                            // Heroes always visible, slightly fade with dist
                            obj.material.opacity = Math.max(0.6, 1.0 - (dist / 1500));
                        } else {
                            // Regular nodes fade faster
                            obj.material.opacity = dist > 600 ? 0 : (dist > 300 ? 1 - ((dist - 300) / 300) : 0.9);
                        }
                    }

                    // Shell Rotation
                    if (obj.userData?.isShell) {
                        obj.rotation.x += obj.userData.speed;
                        obj.rotation.y += obj.userData.speed * 0.5;
                    }

                    // Pulse Glow
                    if (obj.userData?.isPulse) {
                        const baseScale = obj.userData.baseScale || 1;
                        const pulse = 1 + Math.sin(time * 3) * 0.1;
                        obj.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);
                    }
                });
            } catch (e) { }
            frameRef.current = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(frameRef.current);
    }, []);

    // Physics Tuning: Anti-Gravity (Strong Repulsion but High Friction)
    useEffect(() => {
        const fg = fgRef.current;
        if (!fg) return;

        const timer = setTimeout(() => {
            if (!fgRef.current) return;
            try {
                // High repulsion force
                fgRef.current.d3Force('charge')?.strength(-1000);
                fgRef.current.d3Force('link')?.distance(120);
                fgRef.current.d3Force('center')?.strength(0.05);

                // [Tuning] Calam down expansion
                fgRef.current.d3VelocityDecay(0.6); // More friction, slower movement

                fgRef.current.d3ReheatSimulation();
            } catch (err) { }
        }, 500);

        return () => clearTimeout(timer);
    }, [cleanData]);

    return (
        <div className="w-full h-full bg-[#02040a]">
            <ForceGraph3D
                ref={fgRef}
                graphData={cleanData}
                nodeLabel="name"
                showNavInfo={false}

                // Physics
                cooldownTicks={120}

                // --- Node Rendering (Sci-Fi Glowing Spheres) ---
                nodeThreeObject={(node: any) => {
                    const group = new THREE.Group();

                    // Style by Category/Group
                    const isRoot = node.isRoot || node.properties?.isRoot || node.id === (node.keyword || '');
                    const color = isRoot ? '#ffffff' : (node.group === 1 ? '#00f0ff' : '#a855f7');

                    // Scaled by connection importance
                    const baseSize = 4;
                    const scaleFactor = Math.min(2.5, 1 + (node.connections || 0) * 0.15);
                    const size = isRoot ? baseSize * 2.5 : baseSize * scaleFactor;

                    // 1. Core Luminous Sphere
                    const coreGeo = new THREE.SphereGeometry(size, 32, 32);
                    const coreMat = new THREE.MeshStandardMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 1.5,
                        roughness: 0,
                    });
                    const core = new THREE.Mesh(coreGeo, coreMat);
                    group.add(core);

                    // 2. Neon Halo Ghost
                    const haloGeo = new THREE.SphereGeometry(size * 1.2, 32, 32);
                    const haloMat = new THREE.MeshBasicMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.15,
                        side: THREE.BackSide
                    });
                    const halo = new THREE.Mesh(haloGeo, haloMat);
                    group.add(halo);

                    // 3. Cyber Shell (Icosahedron Wireframe)
                    const shellGeo = new THREE.IcosahedronGeometry(size * 1.5, 0);
                    const shellMat = new THREE.MeshBasicMaterial({
                        color: color,
                        wireframe: true,
                        transparent: true,
                        opacity: 0.2
                    });
                    const shell = new THREE.Mesh(shellGeo, shellMat);
                    shell.userData = { isShell: true, speed: 0.01 + Math.random() * 0.01 };
                    group.add(shell);

                    // 4. Label Text
                    const labelText = node.name || node.id;
                    const sprite = new SpriteText(labelText);
                    sprite.color = '#ffffff';
                    sprite.textHeight = Math.max(4, size * 0.6);
                    sprite.position.y = size * 2;
                    sprite.fontFace = 'Inter, sans-serif';
                    sprite.backgroundColor = 'rgba(0,0,0,0.4)';
                    sprite.padding = 1;

                    // [Optimization] Tag for smart LOD
                    sprite.userData = { isHero: isRoot || (node.connections || 0) > 10 };

                    group.add(sprite);

                    return group;
                }}
                nodeThreeObjectExtend={false}

                // --- Link Rendering (Subtle Glowing Beams) ---
                linkWidth={0.8}
                linkColor={() => 'rgba(0, 240, 255, 0.3)'}
                linkDirectionalParticles={3}
                linkDirectionalParticleWidth={1.8}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={() => '#ffffff'}

                // Directional Arrows
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}

                // Relation Predicate Labels
                linkThreeObjectExtend={true}
                linkThreeObject={(link: any) => {
                    // Avoid 'RELATED' or empty clutter
                    const name = link.name;
                    if (!name || name === 'RELATED' || name === '') {
                        return new THREE.Object3D(); // Hidden/Empty object for D3 compatibility
                    }

                    const sprite = new SpriteText(name);
                    sprite.color = 'rgba(0, 240, 255, 0.9)';
                    sprite.textHeight = 3.0;
                    sprite.fontFace = 'Inter, sans-serif';
                    sprite.backgroundColor = 'rgba(0,0,0,0.7)';
                    sprite.padding = 0.8;
                    return sprite;
                }}
                linkPositionUpdate={(sprite: any, { start, end }: any) => {
                    const middlePos = Object.assign({}, ...['x', 'y', 'z'].map(c => ({
                        [c]: start[c] + (end[c] - start[c]) / 2
                    })));
                    Object.assign(sprite.position, middlePos);
                }}

                backgroundColor="#010308"

                onNodeClick={(node: any) => {
                    const distance = 100;
                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                    if (fgRef.current) {
                        fgRef.current.cameraPosition(
                            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                            node,
                            1500
                        );
                    }
                    if (onNodeClick) onNodeClick(node);
                }}
                enableNodeDrag={true}
                onNodeDragEnd={(node: any) => {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }}
            />
        </div>
    );
};

// Helper
function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default Graph3D;
