import { ConvexReactClient } from "convex/react";

// Singleton Convex client — create once, reuse everywhere
let _client: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (!_client) {
    _client = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
  }
  return _client;
}