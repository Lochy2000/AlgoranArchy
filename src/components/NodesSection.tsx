import React from 'react';
import { Globe } from 'lucide-react';

export const NodesSection: React.FC = () => {
  const nodeDistribution = [
    { region: 'North America', count: 642 },
    { region: 'Europe', count: 573 },
    { region: 'Asia', count: 387 },
    { region: 'South America', count: 132 },
    { region: 'Africa', count: 64 },
    { region: 'Oceania', count: 44 },
  ];

  const totalNodes = nodeDistribution.reduce((sum, region) => sum + region.count, 0);
  const participationRate = 80;

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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-24 h-24 text-cyan-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">GLOBAL NODE DISTRIBUTION</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Visualizing the decentralized network of Algorand nodes across the world.
                Each point represents an active node maintaining the blockchain.
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
                  <span className="text-gray-300">{region.region}</span>
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