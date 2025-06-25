import React, { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { AlgorandService } from '../services/algorandService';
import { PriceService } from '../services/priceService';
import { EnhancedDexService } from '../services/enhancedDexService';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [priceApiStatus, setPriceApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [dexApiStatus, setDexApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [logs, setLogs] = useState<string[]>([]);
  const [envStatus, setEnvStatus] = useState<any>(null);

  const testAlgorandAPI = async () => {
    setApiStatus('testing');
    try {
      const result = await AlgorandService.testConnectivity();
      setApiResponse(result);
      setApiStatus(result.success ? 'success' : 'failed');
      
      const logMessage = `Algorand API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`;
      setLogs(prev => [...prev.slice(-9), logMessage]);
    } catch (error) {
      setApiStatus('failed');
      setApiResponse({ error: error.message });
      setLogs(prev => [...prev.slice(-9), `Algorand API Test ERROR: ${error.message}`]);
    }
  };

  const testPriceAPI = async () => {
    setPriceApiStatus('testing');
    try {
      const result = await PriceService.testConnectivity();
      setPriceApiStatus(result.success ? 'success' : 'failed');
      
      const logMessage = `Price API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`;
      setLogs(prev => [...prev.slice(-9), logMessage]);
    } catch (error) {
      setPriceApiStatus('failed');
      setLogs(prev => [...prev.slice(-9), `Price API Test ERROR: ${error.message}`]);
    }
  };

  const testDexAPI = async () => {
    setDexApiStatus('testing');
    try {
      const result = await EnhancedDexService.testConnectivity();
      setDexApiStatus(result.success ? 'success' : 'failed');
      
      const logMessage = `DEX API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`;
      setLogs(prev => [...prev.slice(-9), logMessage]);
    } catch (error) {
      setDexApiStatus('failed');
      setLogs(prev => [...prev.slice(-9), `DEX API Test ERROR: ${error.message}`]);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const checkEnvironmentVariables = () => {
    const envVars = {
      'VITE_ALGO_API_TOKEN': import.meta.env.VITE_ALGO_API_TOKEN ? 'SET ✅' : 'NOT SET ❌',
      'VITE_ALGO_NODE_MAINNET': import.meta.env.VITE_ALGO_NODE_MAINNET || 'NOT SET ❌',
      'VITE_ALGO_INDEXER_MAINNET': import.meta.env.VITE_ALGO_INDEXER_MAINNET || 'NOT SET ❌',
      'VITE_MORALIS_API_KEY': import.meta.env.VITE_MORALIS_API_KEY ? 'SET ✅' : 'NOT SET ❌',
      'VITE_COINGECKO_API_KEY': import.meta.env.VITE_COINGECKO_API_KEY ? 'SET ✅' : 'NOT SET ❌',
      'VITE_PERA_WALLET_BRIDGE_URL': import.meta.env.VITE_PERA_WALLET_BRIDGE_URL || 'NOT SET ❌',
      'VITE_DEBUG_MODE': import.meta.env.VITE_DEBUG_MODE || 'NOT SET ❌',
    };
    
    setEnvStatus(envVars);
    setLogs(prev => [...prev.slice(-9), `ENV CHECK: ${JSON.stringify(envVars)}`]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Connected';
      case 'failed':
        return 'Failed';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not Tested';
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      testAlgorandAPI(),
      testPriceAPI(),
      testDexAPI()
    ]);
    checkEnvironmentVariables();
  };

  useEffect(() => {
    if (isOpen) {
      checkEnvironmentVariables();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Open Debug Panel"
        >
          <Bug size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-40 bg-gray-900 border border-red-500 rounded-lg p-4 w-96 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-red-400 font-bold flex items-center">
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={runAllTests}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          >
            Test All
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Algorand API Test Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Algorand API</span>
            <button
              onClick={testAlgorandAPI}
              disabled={apiStatus === 'testing'}
              className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${apiStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
          <div className="flex items-center">
            {getStatusIcon(apiStatus)}
            <span className={`text-xs ml-2 ${
              apiStatus === 'success' ? 'text-green-400' : 
              apiStatus === 'failed' ? 'text-red-400' : 
              apiStatus === 'testing' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {getStatusText(apiStatus)}
            </span>
          </div>
          {apiResponse && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-h-20 overflow-y-auto">
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Price API Test Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Price APIs</span>
            <button
              onClick={testPriceAPI}
              disabled={priceApiStatus === 'testing'}
              className="flex items-center text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-2 py-1 rounded"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${priceApiStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
          <div className="flex items-center">
            {getStatusIcon(priceApiStatus)}
            <span className={`text-xs ml-2 ${
              priceApiStatus === 'success' ? 'text-green-400' : 
              priceApiStatus === 'failed' ? 'text-red-400' : 
              priceApiStatus === 'testing' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {getStatusText(priceApiStatus)}
            </span>
          </div>
        </div>

        {/* DEX API Test Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">DEX APIs</span>
            <button
              onClick={testDexAPI}
              disabled={dexApiStatus === 'testing'}
              className="flex items-center text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-2 py-1 rounded"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${dexApiStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
          <div className="flex items-center">
            {getStatusIcon(dexApiStatus)}
            <span className={`text-xs ml-2 ${
              dexApiStatus === 'success' ? 'text-green-400' : 
              dexApiStatus === 'failed' ? 'text-red-400' : 
              dexApiStatus === 'testing' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {getStatusText(dexApiStatus)}
            </span>
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Environment</span>
            <button
              onClick={checkEnvironmentVariables}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
            >
              Check
            </button>
          </div>
          {envStatus && (
            <div className="text-xs space-y-1">
              {Object.entries(envStatus).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400 truncate">{key.replace('VITE_', '')}:</span>
                  <span className={value.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                    {value.includes('✅') ? 'SET' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Debug Logs</span>
            <button
              onClick={clearLogs}
              className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-800 rounded p-2 max-h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500">No logs yet</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-300 mb-1 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-gray-800 rounded p-2">
          <div className="text-xs text-gray-400 mb-2">Status Summary:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              {import.meta.env.VITE_ALGO_API_TOKEN ? <Wifi className="w-3 h-3 text-green-400 mr-1" /> : <WifiOff className="w-3 h-3 text-red-400 mr-1" />}
              <span>API Token</span>
            </div>
            <div className="flex items-center">
              {apiStatus === 'success' ? <Wifi className="w-3 h-3 text-green-400 mr-1" /> : <WifiOff className="w-3 h-3 text-red-400 mr-1" />}
              <span>Algorand</span>
            </div>
            <div className="flex items-center">
              {priceApiStatus === 'success' ? <Wifi className="w-3 h-3 text-green-400 mr-1" /> : <WifiOff className="w-3 h-3 text-red-400 mr-1" />}
              <span>Prices</span>
            </div>
            <div className="flex items-center">
              {dexApiStatus === 'success' ? <Wifi className="w-3 h-3 text-green-400 mr-1" /> : <WifiOff className="w-3 h-3 text-red-400 mr-1" />}
              <span>DEX</span>
            </div>
          </div>
        </div>

        {/* Critical Issues Warning */}
        {!import.meta.env.VITE_ALGO_API_TOKEN && (
          <div className="bg-red-900/30 border border-red-500 rounded p-2">
            <div className="text-red-400 text-xs">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              <strong>Critical:</strong> VITE_ALGO_API_TOKEN is missing!
              <div className="mt-1 text-red-300">
                • Get token from <a href="https://nodely.io" target="_blank" rel="noopener noreferrer" className="underline">Nodely.io</a>
                <br />
                • Add to .env file
                <br />
                • Restart dev server
              </div>
            </div>
          </div>
        )}

        {/* CORS Notice */}
        <div className="bg-yellow-900/30 border border-yellow-500 rounded p-2">
          <div className="text-yellow-400 text-xs">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            <strong>Note:</strong> DEX API CORS restrictions are expected.
            <div className="mt-1 text-yellow-300">
              • Tinyman/Pact APIs block browser requests
              <br />
              • App falls back to mock data
              <br />
              • External trading links work normally
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};