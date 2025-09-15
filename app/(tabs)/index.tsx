import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useLiveFrame } from "@/features/live/useLiveFrame";
import { useSnapshots } from "@/features/snapshots/useSnapshots";
import { ThermalImage } from "@/components/ThermalImage";
import { DEVICE_ID } from "@/constants";

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"live" | "diary">("live");
  const [userName, setUserName] = useState<string | null>(null);

  const deviceId = DEVICE_ID;
  const {
    frameUrl: liveFrameUrl,
    thermalUrl: liveThermalUrl,
    err: liveFrameError,
  } = useLiveFrame(deviceId, 5000);
  console.log({ liveThermalUrl });
  const {
    snapshots,
    loading: snapshotsLoading,
    error: snapshotsError,
    hasMore,
    loadMore,
    refresh,
  } = useSnapshots(deviceId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed:", error.message);
        return;
      }
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <Text style={styles.subText}>Today&apos;s pig status</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("live")}>
          <Text
            style={[styles.tabText, activeTab === "live" && styles.activeTab]}
          >
            Live Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("diary")}>
          <Text
            style={[styles.tabText, activeTab === "diary" && styles.activeTab]}
          >
            Snapshots Diary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
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
            {/* Camera Feed */}
            <View style={styles.feedBox}>
              {liveFrameUrl === null && !liveFrameError ? (
                <ActivityIndicator size="large" color="#487307" />
              ) : liveFrameUrl && liveThermalUrl ? (
                <ThermalImage
                  frameUrl={liveFrameUrl}
                  thermalUrl={liveThermalUrl}
                  style={styles.liveImage}
                />
              ) : liveFrameError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error loading feed</Text>
                  <Text style={styles.errorSubText}>{liveFrameError}</Text>
                </View>
              ) : (
                <Text style={styles.noFeedText}>No feed available</Text>
              )}
            </View>

            {/* Pen Status Section */}
            <Text style={styles.penStatusTitle}>Pen Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💧</Text>
                <Text style={styles.cardTitle}>Humidity</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardValue}>%12 ⬆️</Text>
                <View style={styles.graphPlaceholder} />
              </View>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🌫️</Text>
                <Text style={styles.cardTitle}>Ammonia Level</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardValue}>%12 ⬆️</Text>
                <View style={styles.graphPlaceholder} />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Snapshots Diary Content */}
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
                        />
                      ) : (
                        <View style={styles.snapshotPlaceholder}>
                          <Text style={styles.placeholderText}>
                            No image available
                          </Text>
                        </View>
                      )}
                      <View style={styles.snapshotInfo}>
                        <Text style={styles.snapshotDate}>
                          {formatDate(snapshot.ts)}
                        </Text>
                        {snapshot.reading && (
                          <View style={styles.readingInfo}>
                            <Text style={styles.readingText}>
                              🌡️ {snapshot.reading.t_avg_c?.toFixed(1) || "N/A"}
                              °C
                            </Text>
                            <Text style={styles.readingText}>
                              💧{" "}
                              {snapshot.reading.humidity_rh?.toFixed(1) ||
                                "N/A"}
                              %
                            </Text>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  logo: {
    width: 60,
    height: 55,
    resizeMode: "contain",
    marginLeft: -20,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
    marginLeft: 15,
  },
  subText: {
    fontSize: 14,
    color: "#d8f2c1",
    marginTop: 4,
    marginLeft: 15,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  tabText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  activeTab: {
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#487307",
    color: "#487307",
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  feedBox: {
    height: 200,
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  liveImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  noFeedText: {
    fontSize: 16,
    color: "#888",
  },
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
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardValue: {
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "600",
  },
  graphPlaceholder: {
    height: 40,
    width: 100,
    backgroundColor: "#dcdcdc",
    borderRadius: 8,
  },
  diaryContainer: {
    padding: 4,
  },
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
  snapshotImage: {
    width: "100%",
    height: 200,
  },
  snapshotPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,
  },
  snapshotInfo: {
    padding: 12,
  },
  snapshotDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  readingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readingText: {
    fontSize: 12,
    color: "#666",
  },
  loader: {
    marginVertical: 16,
  },
  loadMoreButton: {
    backgroundColor: "#487307",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
  },
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
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
