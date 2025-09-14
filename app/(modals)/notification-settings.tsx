import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert, // ✅ import Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function NotificationSettingsScreen() {
  const [notificationMode, setNotificationMode] = useState<
    "default" | "silent"
  >("default");
  const [popOnScreen, setPopOnScreen] = useState(false);
  const [vibration, setVibration] = useState(true);
  const [notificationDot, setNotificationDot] = useState(false);
  const [overrideDND, setOverrideDND] = useState(false);

  const router = useRouter();

  const handleSave = () => {
    const settings = {
      notificationMode,
      popOnScreen,
      vibration,
      notificationDot,
      overrideDND,
    };

    console.log("Saved settings:", settings);

    Alert.alert(
      "Changes Saved",
      "Your notification preferences have been updated.",
      [
        {
          text: "OK",
          onPress: () => router.back(), // ✅ close modal after confirmation
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Notification Modes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Mode</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeBox,
                notificationMode === "default" && styles.selectedMode,
              ]}
              onPress={() => setNotificationMode("default")}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#3D6D11"
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.modeText}>Default</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeBox,
                notificationMode === "silent" && styles.selectedMode,
              ]}
              onPress={() => setNotificationMode("silent")}
            >
              <Ionicons
                name="notifications-off-outline"
                size={20}
                color="#777"
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.modeText}>Silent</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Pop on screen</Text>
            <Switch value={popOnScreen} onValueChange={setPopOnScreen} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Sound</Text>
            <Text style={styles.toggleNote}>Default notification sound</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vibration</Text>
            <Switch value={vibration} onValueChange={setVibration} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Lock screen</Text>
            <Text style={styles.toggleNote}>Show all notification content</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show notification dot</Text>
            <Switch
              value={notificationDot}
              onValueChange={setNotificationDot}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Override Do Not Disturb</Text>
              <Text style={styles.toggleNote}>
                Let these notifications continue to interrupt when Do Not
                Disturb is on
              </Text>
            </View>
            <Switch value={overrideDND} onValueChange={setOverrideDND} />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA", // match other screens
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    backgroundColor: "#fafbfc",
  },
  selectedMode: {
    borderColor: "#3D6D11",
    backgroundColor: "#eef8e8",
  },
  modeText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  modeSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    flex: 1,
  },
  toggleNote: {
    fontSize: 12,
    color: "#888",
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#3D6D11",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    shadowColor: "#3D6D11",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
