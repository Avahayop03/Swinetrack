// src/features/live/api.ts
import { supabase } from "@/lib/supabase";

export async function getLiveFrameUrl(deviceId: string, _ttlSec = 10) {
  console.log("getLiveFrameUrl params", { deviceId });
  const jpg = supabase.storage
    .from("frames-live")
    .getPublicUrl(`${deviceId}/current.jpg`);
  console.log("getLiveFrameUrl jpg", jpg.data?.publicUrl);
  if (jpg.data?.publicUrl) {
    const url = jpg.data.publicUrl;
    return `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  }
  const png = supabase.storage
    .from("frames-live")
    .getPublicUrl(`${deviceId}/current.png`);
  console.log("getLiveFrameUrl png", png.data?.publicUrl);
  if (png.data?.publicUrl) {
    const url = png.data.publicUrl;
    return `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  }
  console.error("getLiveFrameUrl no_live_frame for", deviceId);
  throw new Error("no_live_frame");
}
