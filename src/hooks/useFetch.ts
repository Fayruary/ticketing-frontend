"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { apiFetch } from "../lib/api";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export default function useFetch<T>(
  endpoint: string | null
): UseFetchResult<T> {
  const [data, setData] =
    useState<T | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchData = useCallback(
    async () => {
      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result =
          await apiFetch<T>(endpoint);

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan"
        );
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}