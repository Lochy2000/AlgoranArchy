import React, { useEffect, useState } from 'react';
import { useAlgorandStore } from '../store/algorandStore';

export const Terminal: React.FC = () => {
  const { nodeStatus, latestBlocks } = useAlgorandStore();
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const lines = [
    "> Initializing Algorand Node Interface...",
    "√ Connection established to MainNet ✓",
    "> Fetching latest block data...",
    `√ Block #${nodeStatus?.['last-round'] || '---'} loaded ✓`,
    "> Analyzing chain performance...",
    "√ TPS: 1,200 ✓ Latency: 3.8s ✓",
    "> Checking smart contracts...",
    "√ 142 new contracts deployed in last hour ✓",
    "> Calculating APY...",
    "√ Current estimate: 6.8% ✓",
    "> Gathering token data...",
    "√ Top token: USDC (24h vol: $12.4M) ✓",
    "> Ready for your commands",
  ];

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, lines[currentLineIndex]]);
        setCurrentLineIndex(prev => prev + 1);
      }, 800 + Math.random() * 400);

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, lines]);

  return (
    <div className="terminal-box w-full max-w-lg relative overflow-hidden bg-black/70 border border-cyan-400 shadow-lg shadow-cyan-400/30">
      <div className="terminal-header flex items-center px-4 py-2 bg-gradient-to-r from-cyan-400 to-pink-500">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <div className="flex-1"></div>
        <div className="text-xs text-black font-mono">~/algorand/terminal</div>
      </div>
      <div className="p-4 text-cyan-400 text-sm font-mono h-64 overflow-y-auto">
        {terminalLines.map((line, index) => (
          <div 
            key={index} 
            className={line.startsWith('√') ? 'text-green-400' : 'text-cyan-400'}
          >
            {line}
          </div>
        ))}
        {currentLineIndex < lines.length && (
          <div className="flex">
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
};