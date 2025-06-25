import React, { useState } from 'react';
import { Menu, X, Zap, ChevronDown, Wallet, LogOut } from 'lucide-react';
import { AlgorandService } from '../services/algorandService';

interface HeaderProps {
  onConnectWallet: () => void;
  connectedAddress?: string;
  onAccountClick?: () => void;
  onDisconnectWallet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onConnectWallet, 
  connectedAddress, 
  onAccountClick,
  onDisconnectWallet 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick();
    }
    setIsAccountDropdownOpen(false);
  };

  const handleDisconnect = () => {
    if (onDisconnectWallet) {
      onDisconnectWallet();
    }
    setIsAccountDropdownOpen(false);
  };

  const openInExplorer = () => {
    if (connectedAddress) {
      const url = AlgorandService.getAccountExplorerUrl(connectedAddress);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setIsAccountDropdownOpen(false);
  };

  return (
    <header className="border-b border-purple-900 py-4 relative bg-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
            A
          </div>
          <h1 className="glitch font-bold text-2xl text-cyan-400" data-text="ALGORANARCHY">
            ALGORANARCHY
          </h1>
        </div>
        
        <nav className="hidden md:flex space-x-8 items-center">
          <button 
            onClick={() => scrollToSection('dashboard')}
            className="text-cyan-300 hover:text-pink-500 transition-all"
          >
            DASHBOARD
          </button>
          <button 
            onClick={() => scrollToSection('blocks')}
            className="text-cyan-300 hover:text-pink-500 transition-all"
          >
            BLOCKS
          </button>
          <button 
            onClick={() => scrollToSection('tokens')}
            className="text-cyan-300 hover:text-pink-500 transition-all"
          >
            TOKENS
          </button>
          <button 
            onClick={() => scrollToSection('nodes')}
            className="text-cyan-300 hover:text-pink-500 transition-all"
          >
            NODES
          </button>
          
          {connectedAddress ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 rounded-lg text-black font-mono text-sm flex items-center hover:opacity-90 transition-all"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-6)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-400 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleAccountClick}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 flex items-center"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      View Account
                    </button>
                    <button
                      onClick={openInExplorer}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      View in Explorer
                    </button>
                    <hr className="border-gray-700 my-1" />
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onConnectWallet}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-lg hover:opacity-90 transition-all text-black font-bold"
            >
              <Zap className="inline w-4 h-4 mr-2" />
              CONNECT WALLET
            </button>
          )}
        </nav>
        
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-cyan-300"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black z-50 py-4 border-b border-purple-900 md:hidden">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <button 
              onClick={() => scrollToSection('dashboard')}
              className="text-cyan-300 hover:text-pink-500 transition-all text-left"
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => scrollToSection('blocks')}
              className="text-cyan-300 hover:text-pink-500 transition-all text-left"
            >
              BLOCKS
            </button>
            <button 
              onClick={() => scrollToSection('tokens')}
              className="text-cyan-300 hover:text-pink-500 transition-all text-left"
            >
              TOKENS
            </button>
            <button 
              onClick={() => scrollToSection('nodes')}
              className="text-cyan-300 hover:text-pink-500 transition-all text-left"
            >
              NODES
            </button>
            
            {connectedAddress ? (
              <div className="space-y-2">
                <div className="text-cyan-400 text-sm">
                  Connected: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-6)}
                </div>
                <button 
                  onClick={handleAccountClick}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-lg hover:opacity-90 transition-all text-black font-bold w-fit flex items-center"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  VIEW ACCOUNT
                </button>
              </div>
            ) : (
              <button 
                onClick={onConnectWallet}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-lg hover:opacity-90 transition-all text-black font-bold w-fit"
              >
                <Zap className="inline w-4 h-4 mr-2" />
                CONNECT WALLET
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {isAccountDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsAccountDropdownOpen(false)}
        />
      )}
    </header>
  );
};