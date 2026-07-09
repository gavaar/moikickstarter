import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getConvexClient } from "@/lib/convexClient";
import { api } from "@convex/_generated/api";
import {
  getAccessSnapshot,
  subscribeAccess,
  getRefreshSnapshot,
  subscribeRefresh,
  ensureInit,
  setAccessToken,
  clear,
} from "@/lib/authState";

export function useCustomAuth() {
  const accessToken = useSyncExternalStore(subscribeAccess, getAccessSnapshot);
  const refreshToken = useSyncExternalStore(subscribeRefresh, getRefreshSnapshot);

  useEffect(() => {
    ensureInit();
  }, []);

  const fetchAccessToken = useCallback(async (args?: { forceRefreshToken?: boolean }) => {
    await ensureInit();

    const currentAccess = getAccessSnapshot();
    const currentRefresh = getRefreshSnapshot();

    if (currentAccess && !args?.forceRefreshToken) return currentAccess;
    if (!currentRefresh) return null;

    try {
      const result = await getConvexClient().action(api.auth.refreshAccess, {
        refreshToken: currentRefresh,
      });
      setAccessToken(result.accessToken);
      return result.accessToken;
    } catch {
      await clear();
      return null;
    }
  }, []);

  return {
    isLoading: refreshToken === undefined,
    isAuthenticated: refreshToken !== null && refreshToken !== undefined,
    fetchAccessToken,
  };
}