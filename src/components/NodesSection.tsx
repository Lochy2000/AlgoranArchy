import React, { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';

export const NodesSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<NodePoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const rotationRef = useRef({ x: 0, y: 0, autoRotateY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  interface NodePoint {
    x: number;
    y: number;
    z: number;
    lat: number;
    lng: number;
    pulse: number;
    region: string;
    originalX: number;
    originalY: number;
    originalZ: number;
  }

  const nodeDistribution = [
    { region: 'North America', count: 642, color: '#00ffc3' },
    { region: 'Europe', count: 573, color: '#ff00c3' },
    { region: 'Asia', count: 387, color: '#00fff9' },
    { region: 'South America', count: 132, color: '#fbff00' },
    { region: 'Africa', count: 64, color: '#9d00ff' },
    { region: 'Oceania', count: 44, color: '#ff6b35' },
  ];

  const totalNodes = nodeDistribution.reduce((sum, region) => sum + region.count, 0);
  const participationRate = 80;

  // Generate node points based on real geographic distribution
  const generateNodes = () => {
    const nodes: NodePoint[] = [];
    
    nodeDistribution.forEach(region => {
      const nodeCount = Math.floor(region.count / 8); // Scale down for performance
      
      for (let i = 0; i < nodeCount; i++) {
        let lat, lng;
        
        // More accurate geographic regions
        switch (region.region) {
          case 'North America':
            lat = 25 + Math.random() * 45; // 25°N to 70°N
            lng = -140 + Math.random() * 80; // 140°W to 60°W
            break;
          case 'Europe':
            lat = 35 + Math.random() * 35; // 35°N to 70°N
            lng = -10 + Math.random() * 50; // 10°W to 40°E
            break;
          case 'Asia':
            lat = 10 + Math.random() * 50; // 10°N to 60°N
            lng = 60 + Math.random() * 120; // 60°E to 180°E
            break;
          case 'South America':
            lat = -35 + Math.random() * 45; // 35°S to 10°N
            lng = -80 + Math.random() * 40; // 80°W to 40°W
            break;
          case 'Africa':
            lat = -35 + Math.random() * 70; // 35°S to 35°N
            lng = -20 + Math.random() * 60; // 20°W to 40°E
            break;
          case 'Oceania':
            lat = -45 + Math.random() * 55; // 45°S to 10°N
            lng = 110 + Math.random() * 70; // 110°E to 180°E
            break;
          default:
            lat = Math.random() * 180 - 90;
            lng = Math.random() * 360 - 180;
        }
        
        // Convert to 3D coordinates (sphere projection)
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const radius = 140;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        nodes.push({
          x, y, z, lat, lng,
          originalX: x, originalY: y, originalZ: z,
          pulse: Math.random() * Math.PI * 2,
          region: region.region
        });
      }
    });
    
    return nodes;
  };

  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = event.clientX - rect.left;
    mouseRef.current.lastY = event.clientY - rect.top;
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !mouseRef.current.isDown) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    const deltaX = currentX - mouseRef.current.lastX;
    const deltaY = currentY - mouseRef.current.lastY;
    
    // Update rotation based on mouse movement
    rotationRef.current.y += deltaX * 0.01;
    rotationRef.current.x += deltaY * 0.01;
    
    // Clamp X rotation to prevent flipping
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
    
    mouseRef.current.lastX = currentX;
    mouseRef.current.lastY = currentY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    mouseRef.current.isDown = false;
    setIsDragging(false);
  };

  // Click handler for node interaction
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Check if click is near any visible node
    let clickedRegion: string | null = null;
    let minDistance = Infinity;
    
    nodesRef.current.forEach(node => {
      // Apply current rotation to node
      const rotatedNode = rotatePoint(node, rotationRef.current.x, rotationRef.current.y + rotationRef.current.autoRotateY);
      
      if (rotatedNode.z > 0) { // Only check visible nodes
        const screenX = centerX + rotatedNode.x;
        const screenY = centerY - rotatedNode.y;
        const distance = Math.sqrt(Math.pow(clickX - screenX, 2) + Math.pow(clickY - screenY, 2));
        
        if (distance < 15 && distance < minDistance) { // 15px click radius
          minDistance = distance;
          clickedRegion = node.region;
        }
      }
    });
    
    setSelectedRegion(clickedRegion);
    if (clickedRegion) {
      console.log(`Clicked on ${clickedRegion} region`);
    }
  };

  // Rotate a point around X and Y axes
  const rotatePoint = (point: NodePoint, rotX: number, rotY: number) => {
    // Rotate around Y axis (horizontal)
    let x = point.originalX * Math.cos(rotY) - point.originalZ * Math.sin(rotY);
    let z = point.originalX * Math.sin(rotY) + point.originalZ * Math.cos(rotY);
    let y = point.originalY;
    
    // Rotate around X axis (vertical)
    const newY = y * Math.cos(rotX) - z * Math.sin(rotX);
    const newZ = y * Math.sin(rotX) + z * Math.cos(rotX);
    
    return { x, y: newY, z: newZ };
  };

  const drawGlobe = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const radius = 140;
    
    // Auto-rotate when not being dragged
    if (!mouseRef.current.isDown) {
      rotationRef.current.autoRotateY += 0.002; // Much slower auto-rotation
    }
    
    // Draw globe outline
    ctx.strokeStyle = '#00ffc3';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw latitude lines
    ctx.strokeStyle = '#00ffc3';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    
    for (let i = -60; i <= 60; i += 30) {
      const y = centerY - (i / 90) * radius;
      const width = Math.cos((i * Math.PI) / 180) * radius;
      
      ctx.beginPath();
      ctx.ellipse(centerX, y, width, 0, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw longitude lines
    for (let i = 0; i < 360; i += 30) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.3, (i * Math.PI) / 180, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    // Sort nodes by Z-depth for proper rendering
    const sortedNodes = [...nodesRef.current].map(node => {
      const rotated = rotatePoint(node, rotationRef.current.x, rotationRef.current.y + rotationRef.current.autoRotateY);
      return { ...node, ...rotated };
    }).sort((a, b) => a.z - b.z);
    
    // Draw connections first (behind nodes)
    ctx.globalAlpha = 0.3;
    sortedNodes.forEach((node, index) => {
      if (node.z > 0 && index % 15 === 0) { // Fewer connections for performance
        const screenX = centerX + node.x;
        const screenY = centerY - node.y;
        
        // Find nearby nodes for connections
        const nearbyNodes = sortedNodes.filter((otherNode, otherIndex) => {
          if (otherIndex === index || otherNode.z <= 0) return false;
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) +
            Math.pow(node.y - otherNode.y, 2) +
            Math.pow(node.z - otherNode.z, 2)
          );
          return distance < 80;
        });
        
        nearbyNodes.slice(0, 2).forEach(nearbyNode => {
          const nearbyScreenX = centerX + nearbyNode.x;
          const nearbyScreenY = centerY - nearbyNode.y;
          
          const regionData = nodeDistribution.find(r => r.region === node.region);
          ctx.strokeStyle = regionData?.color || '#00ffc3';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(nearbyScreenX, nearbyScreenY);
          ctx.stroke();
        });
      }
    });
    
    // Draw nodes
    sortedNodes.forEach(node => {
      if (node.z > 0) { // Only draw visible nodes
        const screenX = centerX + node.x;
        const screenY = centerY - node.y;
        
        // Animate pulse
        node.pulse += 0.05; // Slower pulse
        const pulseSize = 2 + Math.sin(node.pulse) * 0.8;
        
        // Get region color
        const regionData = nodeDistribution.find(r => r.region === node.region);
        const color = regionData?.color || '#00ffc3';
        
        // Highlight selected region
        const isSelected = selectedRegion === node.region;
        const alpha = isSelected ? 1 : (0.7 + Math.sin(node.pulse) * 0.3);
        const size = isSelected ? pulseSize * 1.5 : pulseSize;
        
        // Draw node glow
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw node core
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    ctx.globalAlpha = 1;
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    drawGlobe(ctx, centerX, centerY, time);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Generate nodes
    nodesRef.current = generateNodes();
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section id="nodes" className="mb-16">
      <h2 className="font-bold text-3xl text-white mb-8 flex items-center">
        <span className="bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text">
          NODE NETWORK
        </span>
        <span className="ml-4 text-xs bg-cyan-600 text-black px-3 py-1 rounded-full">
          {totalNodes.toLocaleString()} ACTIVE NODES
        </span>
      </h2>
      
      <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6">
        <div className="h-96 w-full relative mb-8">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full rounded-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ background: 'radial-gradient(circle, rgba(0,255,195,0.1) 0%, rgba(0,0,0,0.8) 100%)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
          />
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 text-sm">
            <div className="text-cyan-400 font-bold mb-2">GLOBAL NODE DISTRIBUTION</div>
            <div className="text-gray-300 text-xs">
              🖱️ Click and drag to rotate • Click nodes to highlight regions
            </div>
            {selectedRegion && (
              <div className="text-yellow-400 text-xs mt-1">
                Selected: {selectedRegion}
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg p-3 text-xs text-gray-400">
            Real-time visualization of Algorand's decentralized network
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node Health */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-cyan-400 mb-4 text-lg">NODE HEALTH</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Uptime</span>
                  <span>99.98%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Synchronization</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Latency</span>
                  <span>2.7ms</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Participation */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-pink-400 mb-4 text-lg">PARTICIPATION</h3>
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#2d3748" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#ec4899" 
                    strokeWidth="8" 
                    strokeDasharray={`${participationRate * 2.827} 282.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold">{participationRate}%</span>
                  <span className="text-xs text-gray-400">Nodes</span>
                </div>
              </div>
            </div>
            <div className="text-center text-gray-300">
              <p>{participationRate}% of nodes actively participate in consensus ({Math.floor(totalNodes * participationRate / 100)} nodes)</p>
            </div>
          </div>
          
          {/* Geographic Distribution */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-yellow-400 mb-4 text-lg">GEO DISTRIBUTION</h3>
            <div className="space-y-3">
              {nodeDistribution.map((region, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                    selectedRegion === region.region ? 'bg-gray-800 border border-yellow-400' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <span className="text-gray-300">{region.region}</span>
                  </div>
                  <span className="font-mono">{region.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};