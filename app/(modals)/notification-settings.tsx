import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationSettingsScreen() {
  const [notificationMode, setNotificationMode] = useState<'default' | 'silent'>('default');
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

    console.log('Saved settings:', settings);

    Alert.alert("Changes Saved", "Your notification preferences have been updated.", [
      {
        text: "OK",
        onPress: () => router.back(), // ✅ close modal after confirmation
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Notification Modes */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeBox,
              notificationMode === 'default' && styles.selectedMode,
            ]}
            onPress={() => setNotificationMode('default')}
          >
            <Ionicons name="notifications-outline" size={18} color="#3D6D11" />
            <Text style={styles.modeText}>Default</Text>
            <Text style={styles.modeSubtext}>
              May ring or vibrate based on phone settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBox,
              notificationMode === 'silent' && styles.selectedMode,
            ]}
            onPress={() => setNotificationMode('silent')}
          >
            <Ionicons name="notifications-off-outline" size={18} color="#777" />
            <Text style={styles.modeText}>Silent</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Items */}
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
          <Switch value={notificationDot} onValueChange={setNotificationDot} />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Override Do Not Disturb</Text>
          <Text style={styles.toggleNote}>
            Let these notifications continue to interrupt when Do Not Disturb is on
          </Text>
          <Switch value={overrideDND} onValueChange={setOverrideDND} />
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
    backgroundColor: '#f9f9f9',
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  modeContainer: {
    marginBottom: 30,
  },
  modeBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedMode: {
    borderColor: '#3D6D11',
    backgroundColor: '#eef8e8',
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  modeSubtext: {
    fontSize: 12,
    color: '#666',
  },
  toggleRow: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  toggleNote: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#3D6D11',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
