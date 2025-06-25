import React, { useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useAlgorandStore } from '../store/algorandStore';
import { AlgorandService } from '../services/algorandService';

export const BlocksTable: React.FC = () => {
  const { latestBlocks, isLoadingBlocks, fetchLatestBlocks, nodeStatus } = useAlgorandStore();

  useEffect(() => {
    fetchLatestBlocks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLatestBlocks, 30000);
    return () => clearInterval(interval);
  }, [fetchLatestBlocks]);

  const handleRefresh = () => {
    fetchLatestBlocks();
  };

  // Fix popup blocking by using direct click handler
  const handleBlockClick = (event: React.MouseEvent, round: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (round) {
      const url = AlgorandService.getBlockExplorerUrl(round);
      
      // Open immediately in the click handler
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Fallback: create a temporary link and click it
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const displayBlocks = latestBlocks;

  return (
    <section id="blocks" className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-3xl text-white flex items-center">
          <span className="bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text">
            LATEST BLOCKS
          </span>
          <span className="ml-4 text-cyan-300 text-xl animate-pulse">LIVE</span>
        </h2>
        <button 
          onClick={handleRefresh}
          disabled={isLoadingBlocks}
          className="border border-cyan-400 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-900 hover:bg-opacity-30 transition-all flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingBlocks ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr className="text-left text-gray-400">
              <th className="px-6 py-4">HEIGHT</th>
              <th className="px-6 py-4">TIMESTAMP</th>
              <th className="px-6 py-4">TRANSACTIONS</th>
              <th className="px-6 py-4">BLOCK HASH</th>
              <th className="px-6 py-4">REWARD</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoadingBlocks ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading latest blocks...
                </td>
              </tr>
            ) : displayBlocks.length > 0 ? (
              displayBlocks.map((block, index) => (
                <tr 
                  key={block.round || `block-${index}`} 
                  className="hover:bg-gray-900 transition-all cursor-pointer"
                  onClick={(e) => handleBlockClick(e, block.round)}
                >
                  <td className="px-6 py-4 text-cyan-400 font-mono">
                    {block.round ? block.round.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {block.timestamp ? AlgorandService.formatTimestamp(block.timestamp) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {block['txn-counter'] || 0}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    {block['previous-block-hash'] ? AlgorandService.shortenAddress(block['previous-block-hash'], 5) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {block.rewards ? `${AlgorandService.formatAlgoAmount(block.rewards['rewards-rate'] || 0)} ALGO` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-pink-400 hover:text-pink-300 transition-all"
                      onClick={(e) => handleBlockClick(e, block.round)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No blocks available. Check console for debugging information.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};