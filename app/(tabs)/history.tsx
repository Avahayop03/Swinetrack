import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { fetchReadings, ReadingRow } from "@/features/readings/api";
import { DEVICE_ID } from "@/constants";

const screenWidth = Dimensions.get("window").width;
const PAGE_SIZE = 10;

export default function HistoryScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); 
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const deviceId = DEVICE_ID;

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserName(
          (data.user.user_metadata?.full_name
            ? data.user.user_metadata.full_name.split(" ")[0]
            : null) || data.user.email || "User"
        );
      }
    };
    fetchUser();
  }, []);

  const loadReadings = async (pageNumber: number, shouldRefresh = false) => {
    try {
      if (shouldRefresh) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7); 

      const offset = pageNumber * PAGE_SIZE;


      const data = await fetchReadings(
        deviceId, 
        fromDate.toISOString(), 
        toDate.toISOString(), 
        PAGE_SIZE, 
        offset
      );

      if (shouldRefresh) {
        setReadings(data || []);
      } else {
        setReadings((prev) => [...prev, ...(data || [])]);
      }

      if (!data || data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error("Error fetching readings:", err);
      setError(err instanceof Error ? err.message : "Failed to load readings");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadReadings(0, true);
  }, [deviceId]);

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadReadings(nextPage, false);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    loadReadings(0, true);
  };

  // --- RENDER HELPERS ---
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const handleExport = () => {
    console.log("export button pressed");
  };

  const renderItem = ({ item }: { item: ReadingRow }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{formatDate(item.ts)}</Text>
      <Text style={styles.cell}>{formatTime(item.ts)}</Text>
      <Text style={styles.cell}>{item.temp_c?.toFixed(2) || "N/A"}</Text>
      <Text style={styles.cell}>{item.humidity_rh?.toFixed(1) || "N/A"}</Text>
      <Text style={styles.cell}>
        {item.gas_res_ohm ? (item.gas_res_ohm / 1000).toFixed(1) + " kΩ" : "N/A"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />; // Spacer
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#487307" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Image source={require("./swinetrack-logo.png")} style={styles.logo} />
        </View>
        <Text style={styles.welcomeText}>Welcome back, {userName ? userName : "User"}!</Text>
        <Text style={styles.subText}>View your pig&apos;s status history here.</Text>
        <View style={styles.divider} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title Row */}
        {/*<View style={styles.titleRow}>
           {/*<TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={loading || readings.length === 0}
          >
            <Ionicons name="document-outline" size={16} color="#4A7C2F" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>

          <View style={styles.centerTitleContainer}>
            <Text style={styles.historyTitle}>History</Text>
          </View>
        </View>*/}

        {/* Table Headers */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Time</Text>
          <Text style={styles.tableHeaderText}>Temp.</Text>
          <Text style={styles.tableHeaderText}>Humidity</Text>
          <Text style={styles.tableHeaderText}>Ammonia</Text>
        </View>

        {/* LIST */}
        {loading && page === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#487307" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>Error loading data</Text>
            <Text style={styles.errorSubText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadReadings(0, true)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : readings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubText}>No readings found for the selected period</Text>
          </View>
        ) : (
          <FlatList
            data={readings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#487307",
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start" },
  logo: { width: 60, height: 55, resizeMode: "contain", marginLeft: -20, marginTop: 10 },
  welcomeText: { fontSize: 25, fontWeight: "bold", color: "#fff", marginTop: 2, marginLeft: 15 },
  subText: { fontSize: 14, color: "#d8f2c1", marginTop: 4, marginLeft: 15 },
  content: { padding: 16, flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, position: "relative", height: 40 },
  exportButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#eaf3e3", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, zIndex: 1 },
  exportText: { marginLeft: 4, color: "#487307", fontWeight: "600", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#fff", marginTop: 12, opacity: 0.5 },
  centerTitleContainer: { position: "absolute", left: screenWidth / 2 - 70 },
  historyTitle: { fontSize: 30, fontWeight: "bold", textAlign: "center" },
  
  tableHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 4, borderRadius: 4, borderBottomWidth: 2, borderColor: "#eee", marginBottom: 5 },
  tableHeaderText: { fontWeight: "bold", fontSize: 12, width: "20%", textAlign: "center" },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: "#f5f5f5" },
  cell: { width: "20%", fontSize: 12, textAlign: "center", color: "#333" },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, color: "#666" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 18, color: "#ff6b6b", marginTop: 10 },
  errorSubText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 5 },
  retryButton: { marginTop: 15, backgroundColor: "#487307", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  retryText: { color: "white", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 18, color: "#ccc", marginTop: 10 },
  emptySubText: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 5 },

  footerContainer: { paddingVertical: 20, alignItems: "center", justifyContent: "center" },
});