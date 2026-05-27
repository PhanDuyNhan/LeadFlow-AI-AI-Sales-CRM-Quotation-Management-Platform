import { useCallback, useEffect, useState } from 'react';
import leadService from '../services/lead.service';

export default function useLeads(initialParams = {}) {
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState({ leads: [], pagination: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async (override) => {
    setLoading(true);
    setError(null);
    try {
      const merged = { ...params, ...(override || {}) };
      const result = await leadService.listLeads(merged);
      setData(result);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load leads';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateParams = useCallback((partial) => {
    setParams((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    leads: data.leads || [],
    pagination: data.pagination,
    loading,
    error,
    params,
    setParams,
    updateParams,
    refresh: fetchLeads,
  };
}
