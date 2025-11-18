import { useRouter } from "expo-router";
import { LineChart } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import React, { useState, useEffect, memo } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from "react-native";
import { supabase } from "@/lib/supabase";
// import { useLiveFrame } from "@/features/live/useLiveFrame"; // REMOVED
import { useThermalSSE } from "@/features/live/useThermalSSE"; // NEW IMPORT
import { useSnapshots } from "@/features/snapshots/useSnapshots";
import { ThermalImage } from "@/components/ThermalImage";
import { DEVICE_ID } from "@/constants";
import { fetchReadings, ReadingRow } from "@/features/readings/api";

// --- CONSTANTS FOR LOCAL STREAMING ---
const STREAM_URL = "http://192.168.1.102:8787/thermal-stream";
const OPTICAL_URL = "http://192.168.1.102:8787/thermal-stream"; 

const StatusCard = memo(({ title, icon, value, unit, history }: any) => {
  // Card text color
  const getColor = () => {
    if (title === "Ammonia") {
      if (value < 5) return "#1FCB4F";
      if (value < 10) return "#FFC107";
      return "#D32F2F";
    }
    return "#1FCB4F";
  };

  // Chart line color
  const getLineColor = () => {
    if (title === "Ammonia") {
      return value >= 10 ? "#D32F2F" : "#4C505D";
    }
    return "#4C505D";
  };

  // Normalize data for chart display
  const normalize = (arr: number[]) => {
    if (!arr || arr.length === 0) return [];
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    if (max === min) return arr.map(() => 0.5);
    return arr.map(v => (v - min) / (max - min));
  };

  const chartData = normalize(history);

  return (
    <View style={styles.statusCard}>
      <View style={styles.cardHeader}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 100,
          backgroundColor: "#487307",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}>
          {icon}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardValue, { color: getColor() }]}>
          {value}
          <Text style={{ fontSize: styles.cardValue.fontSize * 0.6, transform: [{ translateY: -6 }] }}>{unit}</Text>
        </Text>
        {history.length > 2 && (
          <View style={{ width: 150, height: 40, justifyContent: "center" }}>
            <LineChart
              style={{ flex: 1 }}
              data={chartData}
              svg={{ stroke: getLineColor(), strokeWidth: 3 }}
              contentInset={{ top: 10, bottom: 10 }}
              curve={shape.curveNatural}
            />
          </View>
        )}
      </View>
    </View>
  );
});

StatusCard.displayName = "StatusCard";

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"live" | "diary">("live");
  const [userName, setUserName] = useState<string | null>(null);
  const deviceId = DEVICE_ID;

  // --- NEW: REAL-TIME SSE HOOK ---
  const { 
    data: liveThermalData, 
    status: streamStatus, 
    error: streamError 
  } = useThermalSSE(STREAM_URL);

  // Helper to refresh optical background occasionally if needed
  // (Simple approach: appends timestamp to break cache)
  const [opticalFrameUrl, setOpticalFrameUrl] = useState(OPTICAL_URL);
  
  useEffect(() => {
    // Optional: Refresh background image every 5s if stream is connected
    // to keep optical view somewhat synced
    if (streamStatus === 'connected') {
      const interval = setInterval(() => {
        setOpticalFrameUrl(`${OPTICAL_URL}?t=${Date.now()}`);
      }, 2000); // Refresh optical every 2 seconds
      return () => clearInterval(interval);
    }
  }, [streamStatus]);


  // --- EXISTING LOGIC ---
  const {
    snapshots,
    loading: snapshotsLoading,
    error: snapshotsError,
    hasMore,
    loadMore,
    refresh,
  } = useSnapshots(deviceId);

  const [readings, setReadings] = useState<ReadingRow | null>(null);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [tempHistory, setTempHistory] = useState<number[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<number[]>([]);
  const [ammoniaHistory, setAmmoniaHistory] = useState<number[]>([]);

  // Fetch user display name
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;

        if (data?.user) {
          setUserName(
            (data.user.user_metadata?.full_name
              ? data.user.user_metadata.full_name.split(" ")[0]
              : null) ||
            data.user.email ||
            "User"
          );
        }
      } catch (err) {
        console.error("Error in fetchUser:", err);
      }
    };

    fetchUser();
  }, []);

  // Fetch readings every 5 seconds (Database/History)
  useEffect(() => {
    let interval: number;

    const loadReadings = async () => {
      setLoadingReadings(true);
      try {
        const now = new Date();
        const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const data = await fetchReadings(
          deviceId,
          from.toISOString(),
          now.toISOString(),
          20
        );

        if (data.length > 0) {
          setReadings(data[data.length - 1]);
          setTempHistory(data.map((r) => r.t_avg_c ?? 0));
          setHumidityHistory(data.map((r) => r.humidity_rh ?? 0));
          setAmmoniaHistory(data.map((r) => (r.gas_res_ohm ?? 0) / 1000)); // convert to kΩ
        }
      } catch (err) {
        console.error("Error fetching readings:", err);
      } finally {
        setLoadingReadings(false);
      }
    };

    loadReadings();
    interval = setInterval(loadReadings, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Image
            source={require("./swinetrack-logo.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.welcomeText}>
          Welcome back, {userName ? userName : "User"}!
        </Text>
        <Text style={styles.subText}>Today's pig status</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("live")}>
          <Text style={[styles.tabText, activeTab === "live" && styles.activeTab]}>
            Live Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("diary")}>
          <Text style={[styles.tabText, activeTab === "diary" && styles.activeTab]}>
            Snapshots Diary
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          activeTab === "diary" ? (
            <RefreshControl
              refreshing={snapshotsLoading}
              onRefresh={refresh}
              colors={["#487307"]}
            />
          ) : undefined
        }
      >
        {activeTab === "live" ? (
          <>
            <View style={styles.feedBox}>
              {streamStatus === 'connected' && liveThermalData ? (
                // Connected: Show Stream
                <ThermalImage
                  frameUrl={opticalFrameUrl}
                  thermalData={liveThermalData}
                  style={styles.liveImage}
                  interpolationFactor={1.4} // change to change the live
                  refreshInterval={0}
                />
              ) : streamStatus === 'error' ? (
                // Error State
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="video-off-outline" size={40} color="#d32f2f" style={{ marginBottom: 10 }} />
                  <Text style={styles.errorText}>Stream Offline</Text>
                  <Text style={{fontSize: 12, color:'#999', marginTop: 5}}>{streamError}</Text>
                </View>
              ) : (
                // Connecting State
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#487307" />
                  <Text style={{ marginTop: 10, color: '#666', fontWeight: '500' }}>
                    Reconnecting to live stream...
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.penStatusTitle}>Pen Status</Text>

            <StatusCard
              title="Temperature"
              icon={<MaterialCommunityIcons name="thermometer-low" size={25} color="#fff" />}
              value={readings?.t_avg_c?.toFixed(1) ?? "N/A"}
              unit="°C"
              history={tempHistory}
            />

            <StatusCard
              title="Humidity"
              icon={<MaterialCommunityIcons name="water-outline" size={24} color="#fff" />}
              value={readings?.humidity_rh?.toFixed(1) ?? "N/A"}
              unit="%"
              history={humidityHistory}
            />

            <StatusCard
              title="Ammonia"
              icon={<MaterialCommunityIcons name="weather-fog" size={16} color="#fff" />}
              value={readings?.gas_res_ohm ? (readings.gas_res_ohm / 1000).toFixed(1) : "N/A"}
              unit="kΩ"
              history={ammoniaHistory}
            />
          </>
        ) : (
          // --- DIARY TAB (UNCHANGED) ---
          <View style={styles.diaryContainer}>
            {snapshotsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading snapshots</Text>
                <Text style={styles.errorSubText}>{snapshotsError}</Text>
                <TouchableOpacity
                  onPress={refresh}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : snapshots.length === 0 && !snapshotsLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📸</Text>
                <Text style={styles.emptyStateText}>No snapshots yet</Text>
                <Text style={styles.emptyStateSubText}>
                  Snapshots will appear here when available
                </Text>
              </View>
            ) : (
              <>
                {snapshots.map((snapshot) => (
                  <View key={snapshot.id} style={styles.snapshotCard}>
                    {snapshot.imageUrl && snapshot.thermalUrl ? (
                      <ThermalImage
                        frameUrl={snapshot.imageUrl}
                        thermalUrl={snapshot.thermalUrl}
                        style={styles.snapshotImage}
                        refreshInterval={0} // Static images, no polling needed
                      />
                    ) : (
                      <View style={styles.snapshotPlaceholder}>
                        <Text style={styles.placeholderText}>No image available</Text>
                      </View>
                    )}
                    <View style={styles.snapshotInfo}>
                      <Text style={styles.snapshotDate}>{formatDate(snapshot.ts)}</Text>
                      {snapshot.reading && (
                        <View style={styles.readingInfo}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialCommunityIcons name="thermometer" size={20} color="#333" />
                            <Text style={styles.readingText}>
                              {snapshot.reading.t_avg_c?.toFixed(1) || "N/A"} °C
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialCommunityIcons name="water" size={20} color="#333" />
                            <Text style={styles.readingText}>
                              {snapshot.reading.humidity_rh?.toFixed(1) || "N/A"} %
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                {snapshotsLoading && (
                  <ActivityIndicator
                    style={styles.loader}
                    size="small"
                    color="#487307"
                  />
                )}

                {hasMore && !snapshotsLoading && (
                  <TouchableOpacity
                    onPress={loadMore}
                    style={styles.loadMoreButton}
                  >
                    <Text style={styles.loadMoreText}>Load More</Text>
                  </TouchableOpacity>
                )}

                {!hasMore && snapshots.length > 0 && (
                  <Text style={styles.noMoreText}>
                    No more snapshots to load
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#487307",
    paddingTop: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  logo: { width: 60, height: 55, resizeMode: "contain", marginLeft: -20 },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
    marginLeft: 15,
  },
  subText: { fontSize: 14, color: "#d8f2c1", marginTop: 4, marginLeft: 15 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  tabText: { fontSize: 14, color: "#555", fontWeight: "500" },
  activeTab: {
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#487307",
    color: "#487307",
  },
  scrollArea: { flex: 1, padding: 16 },
  feedBox: {
    height: 250, // Slightly taller for better view
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  liveImage: { width: "100%", height: "100%", borderRadius: 10 },
  noFeedText: { fontSize: 16, color: "#888" },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  penStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#737375" },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardValue: {
    fontSize: 30, color: "#1FCB4F", fontWeight: "500",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.7,
    borderRadius: 8,
    borderColor: "#E8E8E8",
    padding: 5,
  },
  diaryContainer: { padding: 4 },
  snapshotCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  snapshotImage: { width: "100%", height: 200 },
  snapshotPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#888", fontSize: 14 },
  snapshotInfo: { padding: 12 },
  snapshotDate: {
    fontSize: 14,
    fontWeight: "400",
    color: "#333",
    marginBottom: 8,
  },
  readingInfo: { flexDirection: "row", justifyContent: "space-between" },
  readingText: { fontSize: 12, color: "#666" },
  loader: { marginVertical: 16 },
  loadMoreButton: {
    backgroundColor: "#487307",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  loadMoreText: { color: "#fff", fontWeight: "600" },
  noMoreText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 16,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginVertical: 20,
  },
  emptyStateIcon: { fontSize: 40, marginBottom: 12 },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  emptyStateSubText: { fontSize: 14, color: "#666", textAlign: "center" },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "600",
    marginBottom: 4,
  },
  errorSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#487307",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: { color: "#fff", fontWeight: "500" },
});