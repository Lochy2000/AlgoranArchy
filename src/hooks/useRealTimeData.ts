import { useEffect, useRef } from 'react';
import { useAlgorandStore } from '../store/algorandStore';

export const useRealTimeData = () => {
  const { fetchNodeStatus, fetchLatestBlocks, fetchLedgerSupply } = useAlgorandStore();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchNodeStatus(),
          fetchLatestBlocks(),
          fetchLedgerSupply()
        ]);
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };

    // Fetch immediately
    fetchData();

    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNodeStatus, fetchLatestBlocks, fetchLedgerSupply]);

  const forceRefresh = () => {
    fetchNodeStatus();
    fetchLatestBlocks();
    fetchLedgerSupply();
  };

  return { forceRefresh };
};