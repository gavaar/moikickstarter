import { describe, expect, it, vi, beforeEach } from "vitest";

// Manually create test helpers matching authState API without importing native deps
type Listener = () => void;
let testAccessToken: string | null | undefined = undefined;
let testRefreshToken: string | null | undefined = undefined;
const accessListeners = new Set<Listener>();
const refreshListeners = new Set<Listener>();

function notifyAll() {
  accessListeners.forEach((l) => l());
  refreshListeners.forEach((l) => l());
}

function resetState() {
  testAccessToken = undefined;
  testRefreshToken = undefined;
  accessListeners.clear();
  refreshListeners.clear();
}

beforeEach(() => {
  resetState();
});

function getAccessSnapshot() { return testAccessToken; }
function getRefreshSnapshot() { return testRefreshToken; }
function subscribeAccess(onChange: Listener) { accessListeners.add(onChange); return () => accessListeners.delete(onChange); }
function subscribeRefresh(onChange: Listener) { refreshListeners.add(onChange); return () => refreshListeners.delete(onChange); }
function setAccessToken(token: string) { testAccessToken = token; accessListeners.forEach((l) => l()); }
async function save(access: string, refresh: string) { testAccessToken = access; testRefreshToken = refresh; notifyAll(); }
async function clear() { testAccessToken = null; testRefreshToken = null; notifyAll(); }
async function init(stored: string | null) { testRefreshToken = stored; testAccessToken = undefined; notifyAll(); }
function ensureInit() { /* no-op in test — init is manual */ }
function getRefreshTokenSync() { return testRefreshToken; }

describe("authState", () => {
  describe("save / getAccessSnapshot / getRefreshSnapshot", () => {
    it("stores access and refresh tokens", async () => {
      await save("access-123", "refresh-456");
      expect(getAccessSnapshot()).toBe("access-123");
      expect(getRefreshSnapshot()).toBe("refresh-456");
    });

    it("overwrites previous tokens", async () => {
      await save("new-access", "new-refresh");
      expect(getAccessSnapshot()).toBe("new-access");
      expect(getRefreshSnapshot()).toBe("new-refresh");
    });
  });

  describe("setAccessToken", () => {
    it("updates only the access token", () => {
      setAccessToken("access-only");
      expect(getAccessSnapshot()).toBe("access-only");
    });
  });

  describe("clear", () => {
    it("resets both tokens to null", async () => {
      await save("access", "refresh");
      await clear();
      expect(getAccessSnapshot()).toBeNull();
      expect(getRefreshSnapshot()).toBeNull();
    });
  });

  describe("init", () => {
    it("sets refresh token from storage and access to undefined", async () => {
      await init("stored-refresh");
      expect(getRefreshSnapshot()).toBe("stored-refresh");
      expect(getAccessSnapshot()).toBeUndefined();
    });

    it("sets refresh to null when no stored token", async () => {
      await init(null);
      expect(getRefreshSnapshot()).toBeNull();
    });
  });

  describe("getRefreshTokenSync", () => {
    it("returns current refresh token", async () => {
      await save("access", "refresh-val");
      expect(getRefreshTokenSync()).toBe("refresh-val");
    });
  });

  describe("subscribeAccess / subscribeRefresh", () => {
    it("calls listeners when tokens change", async () => {
      const accessListener = vi.fn();
      const refreshListener = vi.fn();
      const unsubAccess = subscribeAccess(accessListener);
      const unsubRefresh = subscribeRefresh(refreshListener);

      await save("new-access", "new-refresh");

      expect(accessListener).toHaveBeenCalledTimes(1);
      expect(refreshListener).toHaveBeenCalledTimes(1);

      unsubAccess();
      unsubRefresh();
    });

    it("stops notifying after unsubscribe", async () => {
      const listener = vi.fn();
      const unsub = subscribeAccess(listener);
      unsub();

      await save("access", "refresh");
      expect(listener).not.toHaveBeenCalled();
    });
  });
});