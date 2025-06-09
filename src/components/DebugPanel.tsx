import React, { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { testAPIConnectivity, debugLog } from '../utils/algorand';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const testAPI = async () => {
    setApiStatus('testing');
    try {
      const result = await testAPIConnectivity();
      setApiResponse(result);
      setApiStatus(result.success ? 'success' : 'failed');
      
      const logMessage = `API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(result)}`;
      setLogs(prev => [...prev.slice(-9), logMessage]);
    } catch (error) {
      setApiStatus('failed');
      setApiResponse({ error: error.message });
      setLogs(prev => [...prev.slice(-9), `API Test ERROR: ${error.message}`]);
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
      'VITE_DEBUG_MODE': import.meta.env.VITE_DEBUG_MODE || 'NOT SET',
    };
    
    debugLog('Environment Variables Check:', envVars);
    setLogs(prev => [...prev.slice(-9), `ENV CHECK: ${JSON.stringify(envVars)}`]);
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
        {/* API Test Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">API Connectivity</span>
            <button
              onClick={testAPI}
              disabled={apiStatus === 'testing'}
              className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${apiStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>
          <div className="flex items-center">
            {apiStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-400 mr-2" />}
            {apiStatus === 'failed' && <XCircle className="w-4 h-4 text-red-400 mr-2" />}
            {apiStatus === 'testing' && <RefreshCw className="w-4 h-4 text-yellow-400 mr-2 animate-spin" />}
            <span className={`text-xs ${
              apiStatus === 'success' ? 'text-green-400' : 
              apiStatus === 'failed' ? 'text-red-400' : 
              apiStatus === 'testing' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {apiStatus === 'success' ? 'API Connected' :
               apiStatus === 'failed' ? 'API Failed' :
               apiStatus === 'testing' ? 'Testing...' : 'Not Tested'}
            </span>
          </div>
          {apiResponse && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-h-20 overflow-y-auto">
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Environment Variables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Environment</span>
            <button
              onClick={checkEnvironmentVariables}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              Check
            </button>
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
      </div>
    </div>
  );
};