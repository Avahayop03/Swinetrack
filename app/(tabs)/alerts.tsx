import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AlertsScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const expandedAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
    Animated.timing(expandedAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const expandedHeight = expandedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120], // adjust height based on your content
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
            <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Text style={styles.tabTextActive}>General</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Red Card */}
        <TouchableOpacity style={styles.redCard} activeOpacity={0.9} onPress={toggleExpanded}>
          <View style={styles.cardHeader}>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconBase}>
                  <Ionicons name="warning" size={18} color="#fff" />
                </View>
                <Animated.View
                  style={[
                    styles.badgeOverlay,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  <Text style={styles.badgeText}>2</Text>
                </Animated.View>
              </View>
              <Text style={styles.cardTitle}>Ammonia Level Detected!</Text>
            </View>
            <Text style={styles.timeText}>1m ago.</Text>
          </View>

          <Text style={styles.message}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>

          <Animated.View style={{ overflow: 'hidden', height: expandedHeight }}>
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>
                Please take the following actions immediately:
              </Text>
              <Text style={styles.bullet}>
                • Inspect the pigpen for waste buildup and clean the area.
              </Text>
              <Text style={styles.bullet}>
                • Increase ventilation in the pen (fans/windows).
              </Text>
              <Text style={styles.bullet}>
                • Check for leaks or excess moisture causing ammonia.
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.seeMoreText}>{expanded ? 'See less ▲' : 'See more ▼'}</Text>
        </TouchableOpacity>

        {/* Yellow Card */}
        <View style={styles.yellowCard}>
          <View style={styles.cardHeader}>
            <View style={styles.row}>
              <Ionicons name="notifications" size={18} color="#4A4A4A" />
              <Text style={styles.cardTitleYellow}>Feed your pig now!</Text>
            </View>
            <Text style={styles.timeTextYellow}>12hr ago.</Text>
          </View>
          <Text style={styles.messageYellow}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#487307',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tabBar: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 16,
  },
  redCard: {
    backgroundColor: '#FDE7E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  yellowCard: {
    backgroundColor: '#FDF3D3',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  iconBase: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#B91C1C',
  },
  cardTitleYellow: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  timeTextYellow: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  messageYellow: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 6,
  },
  instructions: {
    marginTop: 12,
  },
  instructionTitle: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  seeMoreText: {
    marginTop: 10,
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 13,
  },
});
