import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useAlgorandStore } from '../store/algorandStore';
import { PriceService } from '../services/priceService';

export const Ticker: React.FC = () => {
  const { nodeStatus, ledgerSupply } = useAlgorandStore();
  const [algoPrice, setAlgoPrice] = useState<number>(0.18);
  const [priceChange, setPriceChange] = useState<number>(-1.3);

  useEffect(() => {
    const fetchAlgoPrice = async () => {
      try {
        const priceData = await PriceService.getAlgorandPrice();
        if (priceData) {
          setAlgoPrice(priceData.price);
          setPriceChange(priceData.change24h);
        }
      } catch (error) {
        console.error('Failed to fetch ALGO price:', error);
        // Keep using mock data
      }
    };

    fetchAlgoPrice();
    
    // Update price every 5 minutes
    const interval = setInterval(fetchAlgoPrice, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) return '---';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const tickerItems = [
    `ALGO PRICE: $${algoPrice.toFixed(3)} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}%)`,
    `BLOCK HEIGHT: ${formatNumber(nodeStatus?.['last-round'])}`,
    `TOTAL SUPPLY: ${formatNumber(ledgerSupply?.total_money ? ledgerSupply.total_money / 1000000 : undefined)} ALGO`,
    `ONLINE STAKE: ${formatNumber(ledgerSupply?.online_money ? ledgerSupply.online_money / 1000000 : undefined)} ALGO`,
  ];

  return (
    <div className="bg-black py-2 border-b border-purple-900 overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="text-pink-400 flex items-center mx-4">
            <Zap className="w-4 h-4 mr-2" />
            {tickerItems.join(' | ')}
            <span className="text-cyan-300 ml-4">⚡</span> ROCK THE BLOCKCHAIN 
            <span className="text-pink-500 ml-4">⚡</span> PURE PROOF OF STAKE 
            <span className="text-cyan-300 ml-4">⚡</span> CARBON NEGATIVE 
            <span className="text-pink-500 ml-4">⚡</span> FAST AND SCALABLE
          </span>
          <span className="text-pink-400 flex items-center mx-4">
            <Zap className="w-4 h-4 mr-2" />
            {tickerItems.join(' | ')}
            <span className="text-cyan-300 ml-4">⚡</span> ROCK THE BLOCKCHAIN 
            <span className="text-pink-500 ml-4">⚡</span> PURE PROOF OF STAKE 
            <span className="text-cyan-300 ml-4">⚡</span> CARBON NEGATIVE 
            <span className="text-pink-500 ml-4">⚡</span> FAST AND SCALABLE
          </span>
        </div>
      </div>
    </div>
  );
};