'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function PatternNetwork() {
  const canvasRef = useRef(null);
  const [networkData, setNetworkData] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const loadNetwork = async () => {
      try {
        const response = await fetch('/api/network');
        const data = await response.json();
        console.log('Network data loaded:', data);
        setNetworkData(data);
      } catch (error) {
        console.error('Failed to load network:', error);
      }
    };

    loadNetwork();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (networkData && canvasRef.current) {
      console.log('Initializing physics with data:', networkData);
      initializePhysics(networkData);
    }
  }, [networkData]);

  const initializePhysics = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize node positions with physics
    const nodes = data.nodes.map((node, i) => ({
      ...node,
      size: Math.max(node.size * 2, 25), // Make nodes much bigger and easier to click
      x: width / 2 + (Math.random() - 0.5) * 300,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0
    }));

    nodesRef.current = nodes;

    // Start physics simulation
    const animate = () => {
      applyForces(nodes, data.edges, width, height);
      draw(nodes, data.edges);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const applyForces = (nodes, edges, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const damping = 0.9;

    // Reset forces
    nodes.forEach(node => {
      node.fx = 0;
      node.fy = 0;
    });

    // Repulsion between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 500 / (dist * dist);

        nodes[i].fx -= (dx / dist) * force;
        nodes[i].fy -= (dy / dist) * force;
        nodes[j].fx += (dx / dist) * force;
        nodes[j].fy += (dy / dist) * force;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.from);
      const target = nodes.find(n => n.id === edge.to);

      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * 0.01 * (edge.strength || 1);

        source.fx += (dx / dist) * force;
        source.fy += (dy / dist) * force;
        target.fx -= (dx / dist) * force;
        target.fy -= (dy / dist) * force;
      }
    });

    // Center gravity
    nodes.forEach(node => {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.fx += dx * 0.01;
      node.fy += dy * 0.01;
    });

    // Apply forces and update positions
    nodes.forEach(node => {
      node.vx = (node.vx + node.fx) * damping;
      node.vy = (node.vy + node.fy) * damping;
      node.x += node.vx;
      node.y += node.vy;

      // Keep in bounds
      node.x = Math.max(50, Math.min(width - 50, node.x));
      node.y = Math.max(50, Math.min(height - 50, node.y));
    });
  };

  const draw = (nodes, edges) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges - showing how patterns propagate through resonance
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.from);
      const target = nodes.find(n => n.id === edge.to);

      if (source && target) {
        // Draw line
        ctx.strokeStyle = edge.type === 'resonance' ? '#9333EA' : '#D1D5DB';
        ctx.lineWidth = edge.type === 'resonance' ? 2 : 1;
        ctx.globalAlpha = edge.type === 'resonance' ? 0.4 : 0.2;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Draw arrow to show direction of resonance/propagation
        if (edge.type === 'resonance') {
          const angle = Math.atan2(target.y - source.y, target.x - source.x);
          const arrowSize = 8;
          const endX = target.x - Math.cos(angle) * (target.size / 2 + 5);
          const endY = target.y - Math.sin(angle) * (target.size / 2 + 5);

          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#9333EA' : '#D1D5DB';
      ctx.fill();

      // Label
      if (isHovered || node.hearts > 5) {
        ctx.fillStyle = '#1F2937';
        ctx.font = '12px "Literata", serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.size / 2 - 8);
      }
    });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodes = nodesRef.current;
    const hoveredNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < (node.size + 10);
    });

    setHoveredNode(hoveredNode?.id || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas ref');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Click at:', x, y);
    console.log('Nodes:', nodesRef.current);

    const nodes = nodesRef.current;
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const clickRadius = node.size + 15; // Add 15px buffer around node
      console.log(`Node ${node.id} at (${node.x}, ${node.y}), distance: ${distance}, clickRadius: ${clickRadius}`);
      return distance < clickRadius;
    });

    console.log('Clicked node:', clickedNode);

    if (clickedNode) {
      const urlPath = clickedNode.id.replace(/\./g, '-');
      console.log('Navigating to:', `/patterns/${urlPath}`);
      window.location.href = `/patterns/${urlPath}`;
    }
  };

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 font-light">Loading pattern space...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={1000}
        height={350}
        className="w-full rounded-lg bg-white border border-gray-200"
        style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      {hoveredNode && (
        <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-sm font-light text-gray-900">{hoveredNode}</div>
          <div className="text-xs text-gray-500 mt-1">
            {nodesRef.current.find(n => n.id === hoveredNode)?.hearts} hearts •{' '}
            {nodesRef.current.find(n => n.id === hoveredNode)?.voicings} voicings
          </div>
        </div>
      )}
    </div>
  );
}
