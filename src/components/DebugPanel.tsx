import React, { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { testAPIConnectivity, debugLog } from '../utils/algorand';
import { PriceService } from '../services/priceService';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [priceApiStatus, setPriceApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [logs, setLogs] = useState<string[]>([]);

  const testAlgorandAPI = async () => {
    setApiStatus('testing');
    try {
      const result = await testAPIConnectivity();
      setApiResponse(result);
      setApiStatus(result.success ? 'success' : 'failed');
      
      const logMessage = `Algorand API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(result)}`;
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

  const clearLogs = () => {
    setLogs([]);
  };

  const checkEnvironmentVariables = () => {
    const envVars = {
      'VITE_ALGO_API_TOKEN': import.meta.env.VITE_ALGO_API_TOKEN ? 'SET' : 'NOT SET',
      'VITE_ALGO_NODE_MAINNET': import.meta.env.VITE_ALGO_NODE_MAINNET || 'NOT SET',
      'VITE_ALGO_INDEXER_MAINNET': import.meta.env.VITE_ALGO_INDEXER_MAINNET || 'NOT SET',
      'VITE_COINGECKO_API_KEY': import.meta.env.VITE_COINGECKO_API_KEY ? 'SET' : 'NOT SET',
      'VITE_DEBUG_MODE': import.meta.env.VITE_DEBUG_MODE || 'NOT SET',
    };
    
    debugLog('Environment Variables Check:', envVars);
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
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <ChevronDown size={20} />
        </button>
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
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">API Token:</span>
              <span className={import.meta.env.VITE_ALGO_API_TOKEN ? 'text-green-400' : 'text-red-400'}>
                {import.meta.env.VITE_ALGO_API_TOKEN ? 'SET' : 'MISSING'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price APIs:</span>
              <span className="text-yellow-400">CORS Limited</span>
            </div>
          </div>
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

        {/* API Issues Warning */}
        <div className="bg-yellow-900/30 border border-yellow-500 rounded p-2">
          <div className="text-yellow-400 text-xs">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            <strong>Known Issues:</strong>
            <ul className="mt-1 ml-3 space-y-1">
              <li>• 403 errors indicate missing/invalid API token</li>
              <li>• CORS errors are expected for some APIs</li>
              <li>• App falls back to mock data when APIs fail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};