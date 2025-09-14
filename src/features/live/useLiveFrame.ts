// src/features/live/useLiveFrame.ts
import { useEffect, useState } from "react";
import { getLiveFrameUrl } from "./api";

export function useLiveFrame(deviceId: string, intervalMs = 1000) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true,
      timer: any;
    const tick = async () => {
      try {
        console.log("useLiveFrame fetching", deviceId);
        const newUrl = await getLiveFrameUrl(deviceId, 10);
        console.log("useLiveFrame url", newUrl);
        setUrl(newUrl);
        setErr(null);
      } catch (e: any) {
        console.error("useLiveFrame error", e);
        setErr(String(e?.message ?? e));
      } finally {
        if (alive) timer = setTimeout(tick, intervalMs);
      }
    };
    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [deviceId, intervalMs]);

  return { url, err };
}
