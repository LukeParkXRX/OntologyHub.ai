'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
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

    // Animation Loop
    useEffect(() => {
        const tick = () => {
            if (fgRef.current) {
                const camera = fgRef.current.camera();
                const scene = fgRef.current.scene();
                const time = Date.now() * 0.001;

                // Smart LOD for Text
                const dist = camera.position.length();
                const textOpacity = dist > 500 ? 0 : (dist > 250 ? 1 - ((dist - 250) / 250) : 0.9);

                scene.traverse((obj: any) => {
                    // Update Text Opacity
                    if (obj.isSprite && obj.textHeight) {
                        obj.material.opacity = textOpacity;
                    }

                    // Rotating Rings
                    if (obj.userData?.isRing) {
                        obj.rotation.z += 0.01;
                        obj.rotation.x += 0.005;
                    }
                    if (obj.userData?.isInnerRing) {
                        obj.rotation.z -= 0.02;
                        obj.rotation.y += 0.01;
                    }

                    // Pulse Animation (Root/Special nodes)
                    if (obj.userData?.isPulse) {
                        const baseScale = obj.userData.baseScale || 1;
                        const scale = baseScale + Math.sin(time * 2) * 0.2;
                        obj.scale.set(scale, scale, scale);
                    }
                });
            }
            frameRef.current = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(frameRef.current);
    }, []);

    // Physics Tuning: Collision & Charge
    useEffect(() => {
        if (fgRef.current) {
            // Increase repulsion
            fgRef.current.d3Force('charge').strength(-100);
            // Add collision
            fgRef.current.d3Force('collide', d3.forceCollide((node: any) => {
                const size = (node.val || 2) * (node.id === node.keyword ? 1.5 : 1);
                return size * 4; // Keep nodes separated
            }));
        }
    }, [data]);

    // Re-heat simulation on trigger
    useEffect(() => {
        if (fgRef.current && arrangeTrigger) {
            console.log("Re-heating simulation for arrangement...");
            fgRef.current.d3ReheatSimulation();
        }
    }, [arrangeTrigger]);

    return (
        <div className="w-full h-full bg-[#050505]">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel="name"

                // Physics & Layout
                d3VelocityDecay={0.2}
                d3AlphaDecay={0.01}
                cooldownTicks={1000}
                onEngineStop={() => console.log('Sim stopped')}

                // --- Node Rendering ---
                nodeThreeObject={(node: any) => {
                    const group = new THREE.Group();

                    // Determine Node Type & Style
                    const isRoot = node.id.toLowerCase() === (node.keyword || '').toLowerCase() || node.label === 'Concept';
                    const isNew = highlightNodes?.has(node.id);
                    const isEvent = node.label === 'Event';

                    // Group Color Palette (Neon/Cyberpunk)
                    const palette = ['#00FFFF', '#BD00FF', '#FF0055', '#FFFF00', '#00FF99', '#FF9900'];
                    // Use group ID from backend analysis (default to 1 if missing)
                    const groupColor = node.group ? palette[(node.group - 1) % palette.length] : null;

                    let color = '#4285F4'; // Default Blue
                    if (isNew) color = '#FFFFFF';
                    else if (isEvent) color = '#FF5252'; // Distinct Red for Memories
                    else if (node.color) color = node.color;
                    else if (groupColor) color = groupColor;

                    // 1. Core Sphere
                    // Use backend 'val' for size (default 2 if missing). Root gets boost.
                    const baseSize = (node.val || 2);
                    const size = (isRoot || isNew) ? baseSize * 1.5 : baseSize;

                    const coreGeo = new THREE.SphereGeometry(size, 32, 32);
                    const coreMat = new THREE.MeshPhysicalMaterial({
                        color: isNew ? '#FFFFA0' : (isRoot ? '#FFFFFF' : color),
                        emissive: isNew ? '#FFFF00' : color,
                        emissiveIntensity: isNew ? 3.0 : (isRoot ? 2 : 0.6), // Super bright for new nodes
                        roughness: 0,
                        metalness: 0.5,
                        clearcoat: 1,
                        transparent: true,
                        opacity: 0.9
                    });
                    const core = new THREE.Mesh(coreGeo, coreMat);
                    core.userData = { isPulse: (isRoot || isNew), baseScale: 1 }; // Pulse if new
                    group.add(core);

                    // 2. Glow Sprite (Halo)
                    const getGlowSprite = (c: string, s: number) => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 64; canvas.height = 64;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                            gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
                            gradient.addColorStop(0.2, c);
                            gradient.addColorStop(1, 'rgba(0,0,0,0)');
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, 64, 64);
                        }
                        const tex = new THREE.CanvasTexture(canvas);
                        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
                        const sprite = new THREE.Sprite(mat);
                        sprite.scale.set(s, s, s);
                        return sprite;
                    };
                    // Glow size proportional to node size
                    group.add(getGlowSprite(color, isRoot ? size * 10 : size * 6));

                    // 3. Rings (For Distinction & Aesthetics)
                    // Add rings for Root or Important nodes (val > 4)
                    if (isRoot || node.val > 4) {
                        const ringGeo = new THREE.TorusGeometry(size * 1.5, 0.1, 8, 50);
                        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
                        const ring = new THREE.Mesh(ringGeo, ringMat);
                        ring.userData = { isRing: true };
                        group.add(ring);
                    }

                    if (isRoot) {
                        const innerRingGeo = new THREE.TorusGeometry(size * 2.2, 0.05, 8, 50);
                        const innerRingMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
                        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
                        innerRing.userData = { isInnerRing: true };
                        group.add(innerRing);
                    }

                    // 4. Text Label
                    const label = node.name || node.label || node.id;
                    const text = new SpriteText(label);
                    text.color = '#E3E3E3'; // Light Gray text
                    text.textHeight = isRoot ? size + 2 : size + 1;
                    text.position.y = size * 3;
                    text.fontFace = 'Geist Mono, Inter, sans-serif';
                    group.add(text);

                    return group;
                }}
                nodeThreeObjectExtend={false}

                // --- Link Rendering ---
                linkWidth={1} // VISIBLE LINES
                linkColor={(link: any) => {
                    return 'rgba(100, 149, 237, 0.4)';
                }}

                // Particles (Data Flow)
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={() => '#FFFFFF'}

                backgroundColor="#050505"

                onNodeClick={(node: any) => {
                    const distance = 80;
                    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                    fgRef.current.cameraPosition(
                        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                        node,
                        2000
                    );
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

export default Graph3D;
