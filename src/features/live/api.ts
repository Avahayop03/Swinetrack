// src/features/live/api.ts
import { supabase } from "@/lib/supabase";

export async function getLiveFrameUrl(deviceId: string, ttlSec = 10) {
  const jpg = await supabase.storage
    .from("frames-live")
    .createSignedUrl(`${deviceId}/current.jpg`, ttlSec);
  if (jpg.data?.signedUrl) return `${jpg.data.signedUrl}&cb=${Date.now()}`;
  const png = await supabase.storage
    .from("frames-live")
    .createSignedUrl(`${deviceId}/current.png`, ttlSec);
  if (png.data?.signedUrl) return `${png.data.signedUrl}&cb=${Date.now()}`;
  throw new Error("no_live_frame");
}
