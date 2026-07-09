import { ConvexReactClient } from "convex/react";

let _client: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (!_client) {
    _client = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
  }
  return _client;
}