import React from 'react';
import { Mail, Github, Twitter, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-white text-lg mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-black font-bold mr-2">
                A
              </div>
              ALGORANARCHY
            </h3>
            <p className="text-gray-400">
              The most punk rock Algorand explorer on the blockchain. 
              Keeping it decentralized, secure, and fast since day one.
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-lg mb-4">EXPLORE</h3>
            <ul className="space-y-2">
              <li><a href="#dashboard" className="text-gray-400 hover:text-cyan-300 transition-all">Dashboard</a></li>
              <li><a href="#blocks" className="text-gray-400 hover:text-cyan-300 transition-all">Blocks</a></li>
              <li><a href="#tokens" className="text-gray-400 hover:text-cyan-300 transition-all">Tokens</a></li>
              <li><a href="#nodes" className="text-gray-400 hover:text-cyan-300 transition-all">Nodes</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg mb-4">DEVELOPERS</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-pink-300 transition-all">API Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-300 transition-all">SDKs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-300 transition-all">Smart Contracts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-300 transition-all">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-300 transition-all">Github</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg mb-4">COMMUNITY</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-30 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-pink-400 hover:bg-pink-900 hover:bg-opacity-30 transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-purple-400 hover:bg-purple-900 hover:bg-opacity-30 transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
            <div className="text-gray-400 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              lochlann_oht@hotmail.com
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2024 ALGORANARCHY. All rights reserved. Not affiliated with Algorand Foundation.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white transition-all text-sm">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white transition-all text-sm">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-all text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};