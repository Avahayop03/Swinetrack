import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../android/src/utils/supabase';

export default function Index() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'live' | 'diary'>('live');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Image
            source={require('./swinetrack-logo.png')}
            style={styles.logo}
          />
        </View>
        <Text style={styles.welcomeText}>Welcome back, User!</Text>
        <Text style={styles.subText}>Today's pig status</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('live')}>
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTab]}>
            Live Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('diary')}>
          <Text style={[styles.tabText, activeTab === 'diary' && styles.activeTab]}>
            Snapshots Diary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'live' ? (
          <>
            {/* Camera Feed Placeholder */}
            <View style={styles.feedBox}>
              <Text style={styles.noFeedText}>📷 No camera feed today</Text>
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
            <View style={styles.diaryBox}>
              <Text style={styles.diaryText}>📸 Snapshots will appear here.</Text>
              <Text style={styles.diaryText}>No entries yet.</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#487307',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
 menuIcon: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
 headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 55,
    resizeMode: 'contain',
    marginLeft: -20,
     marginTop: 10,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
    marginLeft: 15,
  },
  subText: {
    fontSize: 14,
    color: '#d8f2c1',
    marginTop: 4,
    marginLeft: 15,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTab: {
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#487307',
    color: '#487307',
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  feedBox: {
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noFeedText: {
    fontSize: 16,
    color: '#888',
  },
  diaryBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  diaryText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  penStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  graphPlaceholder: {
    height: 40,
    width: 100,
    backgroundColor: '#dcdcdc',
    borderRadius: 8,
  },
});
