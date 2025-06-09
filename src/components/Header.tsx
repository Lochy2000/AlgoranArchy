import React, { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

interface HeaderProps {
  onConnectWallet: () => void;
  connectedAddress?: string;
}

export const Header: React.FC<HeaderProps> = ({ onConnectWallet, connectedAddress }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 rounded-lg text-black font-mono text-sm">
              {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-6)}
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
            {!connectedAddress && (
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
    </header>
  );
};