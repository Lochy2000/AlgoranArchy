import React from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

interface ErrorBannerProps {
  type: 'api-token' | 'cors' | 'fallback' | 'general';
  message: string;
  onDismiss?: () => void;
  showHelp?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  type, 
  message, 
  onDismiss, 
  showHelp = true 
}) => {
  const getBannerStyles = () => {
    switch (type) {
      case 'api-token':
        return 'bg-red-900/50 border-red-500 text-red-200';
      case 'cors':
        return 'bg-yellow-900/50 border-yellow-500 text-yellow-200';
      case 'fallback':
        return 'bg-blue-900/50 border-blue-500 text-blue-200';
      default:
        return 'bg-gray-900/50 border-gray-500 text-gray-200';
    }
  };

  const getHelpContent = () => {
    switch (type) {
      case 'api-token':
        return (
          <div className="mt-2 text-sm">
            <div className="font-semibold mb-1">How to fix:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Get API token from <a href="https://nodely.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Nodely.io</a></li>
              <li>Add VITE_ALGO_API_TOKEN to your .env file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        );
      case 'cors':
        return (
          <div className="mt-2 text-sm">
            <div className="font-semibold mb-1">This is expected:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>DEX APIs block browser requests for security</li>
              <li>External trading links work normally</li>
              <li>Consider using a backend proxy for production</li>
            </ul>
          </div>
        );
      case 'fallback':
        return (
          <div className="mt-2 text-sm">
            <div className="font-semibold mb-1">Using mock data:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>API temporarily unavailable</li>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-lg p-4 mx-4 mt-4 ${getBannerStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">{message}</div>
            {showHelp && getHelpContent()}
          </div>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-current hover:text-white transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};