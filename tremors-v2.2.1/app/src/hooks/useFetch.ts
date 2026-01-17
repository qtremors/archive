/**
 * useFetch - Custom hook for API data fetching with loading and error states
 * B-002: Repeated fetch patterns abstraction
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";

interface UseFetchOptions<T> {
    /** Initial data value */
    initialData?: T;
    /** Whether to fetch immediately on mount */
    immediate?: boolean;
    /** Whether to show error toast on failure */
    showError?: boolean;
    /** Custom error message */
    errorMessage?: string;
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useFetch<T>(
    url: string,
    options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
    const {
        initialData = null,
        immediate = true,
        showError = true,
        errorMessage = "Failed to load data",
    } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<Error | null>(null);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Unknown error");
            setError(error);
            if (showError) {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [url, showError, errorMessage, toast]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData]);

    return { data, loading, error, refetch: fetchData };
}

/**
 * useApiMutation - Custom hook for API mutations (POST, PATCH, DELETE)
 */
interface UseMutationOptions {
    /** Success message to show */
    successMessage?: string;
    /** Error message to show */
    errorMessage?: string;
    /** Callback after successful mutation */
    onSuccess?: () => void;
}

interface UseMutationReturn<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData | null>;
    loading: boolean;
    error: Error | null;
}

export function useApiMutation<TData, TVariables>(
    url: string,
    method: "POST" | "PATCH" | "DELETE" = "POST",
    options: UseMutationOptions = {}
): UseMutationReturn<TData, TVariables> {
    const {
        successMessage,
        errorMessage = "Operation failed",
        onSuccess,
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const toast = useToast();

    const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(variables),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (successMessage) {
                toast.success(successMessage);
            }

            onSuccess?.();
            return data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Unknown error");
            setError(error);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [url, method, successMessage, errorMessage, onSuccess, toast]);

    return { mutate, loading, error };
}
