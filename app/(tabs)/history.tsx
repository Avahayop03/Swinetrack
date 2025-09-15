import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { fetchReadings, ReadingRow } from "@/features/readings/api"; // Import your API functions
import { DEVICE_ID } from "@/constants";

const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deviceId = DEVICE_ID;

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserName(
          (data.user.user_metadata?.full_name
            ? data.user.user_metadata.full_name.split(" ")[0]
            : null) ||
            data.user.email ||
            "User"
        );
      }
    };
    fetchUser();
  }, []);

  const loadReadings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date and date from 7 days ago
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7); // Last 7 days

      const toISO = toDate.toISOString();
      const fromISO = fromDate.toISOString();
      console.log("Fetching readings for", deviceId, fromISO, toISO);
      const data = await fetchReadings(deviceId, fromISO, toISO, 1000);
      console.log("Loaded readings", data?.length ?? 0);
      setReadings(data);
    } catch (err) {
      console.error("Error fetching readings:", err);
      setError(err instanceof Error ? err.message : "Failed to load readings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [deviceId]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleExport = () => {
    console.log("export button pressed");
    // You can implement CSV export functionality here using the readings data
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#487307" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error loading data</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReadings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (readings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubText}>
            No readings found for the selected period
          </Text>
        </View>
      );
    }

    return (
      <ScrollView>
        {readings.map((reading) => (
          <View key={reading.id} style={styles.tableRow}>
            <Text style={styles.cell}>{formatDate(reading.ts)}</Text>
            <Text style={styles.cell}>{formatTime(reading.ts)}</Text>
            <Text style={styles.cell}>
              {reading.temp_c?.toFixed(2) || "N/A"}
            </Text>
            <Text style={styles.cell}>
              {reading.humidity_rh?.toFixed(1) || "N/A"}
            </Text>
            <Text style={styles.cell}>
              {reading.iaq ? Math.round(reading.iaq).toString() : "N/A"}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Green Header */}
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
        <Text style={styles.subText}>
          View your pig&apos;s status history here.
        </Text>
        <View style={styles.divider} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Row: Export + History */}
        <View style={styles.titleRow}>
          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={loading || readings.length === 0}
          >
            <Ionicons name="document-outline" size={16} color="#4A7C2F" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>

          {/* Centered History Title */}
          <View style={styles.centerTitleContainer}>
            <Text style={styles.historyTitle}>History</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Time</Text>
          <Text style={styles.tableHeaderText}>Temp.</Text>
          <Text style={styles.tableHeaderText}>Humidity</Text>
          <Text style={styles.tableHeaderText}>Amonia</Text>
        </View>

        {/* Table Rows */}
        {renderContent()}
      </View>
    </SafeAreaView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  logo: {
    width: 60,
    height: 55,
    resizeMode: "contain",
    marginLeft: -20,
    marginTop: 10,
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
  content: {
    padding: 16,
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
    height: 40,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3e3",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 1,
  },
  exportText: {
    marginLeft: 4,
    color: "#487307",
    fontWeight: "600",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#fff",
    marginTop: 12,
    opacity: 0.5,
  },
  centerTitleContainer: {
    position: "absolute",
    left: screenWidth / 2 - 70,
  },
  historyTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 12,
    width: "20%",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cell: {
    width: "20%",
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ff6b6b",
    marginTop: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#487307",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#ccc",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
});
