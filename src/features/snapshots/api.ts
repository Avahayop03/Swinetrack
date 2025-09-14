import { supabase } from "../../lib/supabase";

export type SnapshotRow = {
  id: number;
  device_id: string;
  ts: string;
  overlay_path: string;
  reading_id: number | null;
  imageUrl: string | null;
  reading?: {
    ts: string;
    temp_c: number | null;
    humidity_rh: number | null;
    pressure_hpa: number | null;
    gas_res_ohm: number | null;
    iaq: number | null;
    t_min_c: number | null;
    t_max_c: number | null;
    t_avg_c: number | null;
  } | null;
};

// Make sure this function is exported
export async function listSnapshots(deviceId: string, page = 0, pageSize = 20) {
  try {
    console.log("Fetching snapshots for device:", deviceId);

    const { data, error } = await supabase
      .from("snapshots")
      .select(
        `
        id, device_id, ts, overlay_path, reading_id,
        reading:readings ( ts, temp_c, humidity_rh, pressure_hpa, gas_res_ohm, iaq, t_min_c, t_max_c, t_avg_c )
      `
      )
      .eq("device_id", deviceId)
      .order("ts", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Found", data?.length, "snapshots");

    // Get signed URLs for each snapshot
    const snapshotsWithUrls = await Promise.all(
      (data ?? []).map(async (row: any) => {
        try {
          if (!row.overlay_path) {
            console.log("No overlay path for snapshot", row.id);
            return { ...row, imageUrl: null };
          }

          const { data: urlData, error: urlError } = await supabase.storage
            .from("snapshots")
            .createSignedUrl(row.overlay_path, 60 * 30); // 30 minute expiry

          if (urlError) {
            console.error("Storage error for", row.overlay_path, urlError);
            return { ...row, imageUrl: null };
          }

          return { ...row, imageUrl: urlData?.signedUrl ?? null };
        } catch (urlErr) {
          console.error("Error creating signed URL:", urlErr);
          return { ...row, imageUrl: null };
        }
      })
    );

    return snapshotsWithUrls;
  } catch (err) {
    console.error("Error in listSnapshots:", err);
    throw err;
  }
}

// Add a simple test function to verify the API is working
export async function testSnapshotsConnection(deviceId: string) {
  try {
    const { error } = await supabase
      .from("snapshots")
      .select("count")
      .eq("device_id", deviceId);

    if (error) {
      console.error("Test connection error:", error);
      return false;
    }

    console.log("Test connection successful");
    return true;
  } catch (err) {
    console.error("Test connection failed:", err);
    return false;
  }
}
