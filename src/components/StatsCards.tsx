import React, { useEffect, useState } from 'react';
import { Cuboid as Cube, ArrowUpDown, DollarSign, Server, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlgorandStore } from '../store/algorandStore';
import { PriceService } from '../services/priceService';

interface AlgoPrice {
  price: number;
  change24h: number;
}

export const StatsCards: React.FC = () => {
  const { nodeStatus, ledgerSupply } = useAlgorandStore();
  const [algoPrice, setAlgoPrice] = useState<AlgoPrice | null>(null);

  const pollInterval = parseInt(import.meta.env.VITE_POLL_INTERVAL_MS || '30000');

  useEffect(() => {
    const load = async () => {
      try {
        const price = await PriceService.getAlgorandPrice();
        if (price) {
          setAlgoPrice({ price: price.price, change24h: price.change24h });
        } else {
          setAlgoPrice(null);
        }
      } catch (err) {
        console.warn('Failed to fetch ALGO price:', err);
      }
    };

    load();
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  const stats = [
    {
      title: 'BLOCK HEIGHT',
      value: nodeStatus?.['last-round'] ? nodeStatus['last-round'].toLocaleString() : '---',
      change: '',
      trend: 'up',
      icon: Cube,
      color: 'cyan',
    },
    {
      title: 'TOTAL SUPPLY',
      value: ledgerSupply?.total_money ? `${(ledgerSupply.total_money / 1_000_000).toFixed(0)}M` : '---',
      change: '',
      trend: 'up',
      icon: ArrowUpDown,
      color: 'pink',
    },
    {
      title: 'ALGO PRICE',
      value: algoPrice ? `$${algoPrice.price.toFixed(algoPrice.price < 1 ? 4 : 2)}` : 'N/A',
      change: algoPrice ? `${algoPrice.change24h >= 0 ? '+' : ''}${algoPrice.change24h.toFixed(2)}%` : 'N/A',
      trend: algoPrice && algoPrice.change24h >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'ONLINE STAKE',
      value: ledgerSupply?.online_money ? `${(ledgerSupply.online_money / 1_000_000).toFixed(0)}M` : '---',
      change: '',
      trend: 'up',
      icon: Server,
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: 'border-cyan-900 hover:border-cyan-400 text-cyan-400',
      pink: 'border-pink-900 hover:border-pink-400 text-pink-400',
      purple: 'border-purple-900 hover:border-purple-400 text-purple-400',
      yellow: 'border-yellow-900 hover:border-yellow-400 text-yellow-400',
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <div 
            key={index}
            className={`bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border transition-all hover:scale-105 ${colorClasses}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-mono">{stat.title}</h3>
              <Icon className={`w-6 h-6 ${stat.color === 'cyan' ? 'text-cyan-400' : 
                stat.color === 'pink' ? 'text-pink-400' : 
                stat.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
            </div>
            <div className={`text-3xl font-bold mb-2 ${stat.color === 'cyan' ? 'text-cyan-400' : 
              stat.color === 'pink' ? 'text-pink-400' : 
              stat.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`}>
              {stat.value}
            </div>
            <div className={`text-sm flex items-center ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {stat.change} (24h)
            </div>
          </div>
        );
      })}
    </div>
  );
};