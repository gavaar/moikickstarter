import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useConvexAuth } from "convex/react";

export function useRedirectOnAuth() {
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && loginAttempted) {
      router.replace("/");
    }
  }, [isAuthenticated, loginAttempted]);

  return { markLoginAttempted: () => setLoginAttempted(true) };
}