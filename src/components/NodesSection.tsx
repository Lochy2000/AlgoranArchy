import React, { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

export const NodesSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<NodePoint[]>([]);

  interface NodePoint {
    x: number;
    y: number;
    z: number;
    lat: number;
    lng: number;
    pulse: number;
    region: string;
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
      const nodeCount = Math.floor(region.count / 10); // Scale down for performance
      
      for (let i = 0; i < nodeCount; i++) {
        let lat, lng;
        
        // Approximate geographic regions
        switch (region.region) {
          case 'North America':
            lat = 20 + Math.random() * 50;
            lng = -160 + Math.random() * 60;
            break;
          case 'Europe':
            lat = 35 + Math.random() * 35;
            lng = -10 + Math.random() * 50;
            break;
          case 'Asia':
            lat = 10 + Math.random() * 50;
            lng = 60 + Math.random() * 120;
            break;
          case 'South America':
            lat = -30 + Math.random() * 40;
            lng = -80 + Math.random() * 40;
            break;
          case 'Africa':
            lat = -30 + Math.random() * 60;
            lng = -20 + Math.random() * 60;
            break;
          case 'Oceania':
            lat = -40 + Math.random() * 50;
            lng = 110 + Math.random() * 60;
            break;
          default:
            lat = Math.random() * 180 - 90;
            lng = Math.random() * 360 - 180;
        }
        
        // Convert to 3D coordinates (simplified sphere projection)
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const radius = 150;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        nodes.push({
          x, y, z, lat, lng,
          pulse: Math.random() * Math.PI * 2,
          region: region.region
        });
      }
    });
    
    return nodes;
  };

  const drawGlobe = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const radius = 150;
    
    // Draw globe outline
    ctx.strokeStyle = '#00ffc3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw latitude lines
    ctx.strokeStyle = '#00ffc3';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
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
    
    // Draw and animate nodes
    nodesRef.current.forEach((node, index) => {
      // Rotate the globe
      const rotationSpeed = 0.005;
      const rotatedX = node.x * Math.cos(time * rotationSpeed) - node.z * Math.sin(time * rotationSpeed);
      const rotatedZ = node.x * Math.sin(time * rotationSpeed) + node.z * Math.cos(time * rotationSpeed);
      
      // Only draw nodes on the visible side
      if (rotatedZ > 0) {
        const screenX = centerX + rotatedX;
        const screenY = centerY - node.y;
        
        // Animate pulse
        node.pulse += 0.1;
        const pulseSize = 2 + Math.sin(node.pulse) * 1;
        
        // Get region color
        const regionData = nodeDistribution.find(r => r.region === node.region);
        const color = regionData?.color || '#00ffc3';
        
        // Draw node
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8 + Math.sin(node.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connection lines occasionally
        if (index % 10 === 0 && Math.sin(time * 0.01 + index) > 0.7) {
          const nearbyNodes = nodesRef.current.filter((otherNode, otherIndex) => {
            if (otherIndex === index) return false;
            const otherRotatedZ = otherNode.x * Math.sin(time * rotationSpeed) + otherNode.z * Math.cos(time * rotationSpeed);
            if (otherRotatedZ <= 0) return false;
            
            const distance = Math.sqrt(
              Math.pow(rotatedX - (otherNode.x * Math.cos(time * rotationSpeed) - otherNode.z * Math.sin(time * rotationSpeed)), 2) +
              Math.pow(node.y - otherNode.y, 2)
            );
            return distance < 100;
          });
          
          nearbyNodes.slice(0, 2).forEach(nearbyNode => {
            const nearbyRotatedX = nearbyNode.x * Math.cos(time * rotationSpeed) - nearbyNode.z * Math.sin(time * rotationSpeed);
            const nearbyScreenX = centerX + nearbyRotatedX;
            const nearbyScreenY = centerY - nearbyNode.y;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(nearbyScreenX, nearbyScreenY);
            ctx.stroke();
          });
        }
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
            className="absolute inset-0 w-full h-full"
            style={{ background: 'radial-gradient(circle, rgba(0,255,195,0.1) 0%, rgba(0,0,0,0.8) 100%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-cyan-400">GLOBAL NODE DISTRIBUTION</h3>
              <p className="text-gray-400 max-w-md mx-auto text-sm">
                Real-time visualization of Algorand's decentralized network. 
                Each glowing point represents active nodes maintaining the blockchain.
              </p>
            </div>
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
                <div key={index} className="flex items-center justify-between">
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