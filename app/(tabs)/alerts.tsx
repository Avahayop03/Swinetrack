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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { listAlerts } from '@/features/alerts/api';

// Define AlertRow type here if not exported from api
type AlertRow = {
  id: string;
  alert_type: string;
  severity: string;
  ts: string;
  message: string;
};

export default function AlertsScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Replace with actual device ID or make it configurable
  const deviceId = 'your-device-id';

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAlerts = async () => {
    try {
      setError(null);
      const data = await listAlerts(deviceId, 0, 50);
      setAlerts(data);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const toggleExpanded = (alertId: string) => {
    setExpandedAlert(prev => prev === alertId ? null : alertId);
  };

  const getAlertConfig = (alertType: string, severity: string) => {
    const configs: Record<string, any> = {
      ammonia: {
        icon: 'warning',
        title: 'Ammonia Level Detected!',
        color: '#B91C1C',
        bgColor: '#FDE7E9',
        iconColor: '#fff',
        iconBg: 'red',
      },
      temperature: {
        icon: 'thermometer',
        title: 'Temperature Alert!',
        color: '#B45309',
        bgColor: '#FEF3C7',
        iconColor: '#4A4A4A',
        iconBg: '#FBBF24',
      },
      humidity: {
        icon: 'water',
        title: 'Humidity Alert!',
        color: '#0369A1',
        bgColor: '#E0F2FE',
        iconColor: '#fff',
        iconBg: '#0EA5E9',
      },
      feed: {
        icon: 'nutrition',
        title: 'Feed Reminder!',
        color: '#4A4A4A',
        bgColor: '#FDF3D3',
        iconColor: '#4A4A4A',
        iconBg: '#FBBF24',
      },
      default: {
        icon: 'notifications',
        title: 'Alert!',
        color: '#4A4A4A',
        bgColor: '#F3F4F6',
        iconColor: '#4A4A4A',
        iconBg: '#D1D5DB',
      }
    };

    return configs[alertType] || configs.default;
  };

  const getInstructions = (alertType: string) => {
    const instructions: Record<string, string[]> = {
      ammonia: [
        'Inspect the pigpen for waste buildup and clean the area.',
        'Increase ventilation in the pen (fans/windows).',
        'Check for leaks or excess moisture causing ammonia.',
      ],
      temperature: [
        'Check heating/cooling systems in the pigpen.',
        'Ensure proper insulation and ventilation.',
        'Monitor pigs for signs of heat/cold stress.',
      ],
      humidity: [
        'Adjust ventilation to control humidity levels.',
        'Check for water leaks or condensation issues.',
        'Ensure proper drainage in the pigpen.',
      ],
      default: [
        'Please check the situation and take appropriate action.',
        'Monitor the pigs for any signs of distress.',
        'Contact support if the issue persists.',
      ]
    };

    return instructions[alertType] || instructions.default;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}hr ago`;
    return `${diffDays}d ago`;
  };

  const renderAlertCard = (alert: AlertRow) => {
    const config = getAlertConfig(alert.alert_type, alert.severity);
    const isExpanded = expandedAlert === alert.id;
    const instructions = getInstructions(alert.alert_type);

    return (
      <TouchableOpacity
        key={alert.id}
        style={[styles.card, { backgroundColor: config.bgColor }]}
        activeOpacity={0.9}
        onPress={() => toggleExpanded(alert.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <View style={[styles.iconBase, { backgroundColor: config.iconBg }]}>
                <Ionicons name={config.icon as any} size={18} color={config.iconColor} />
              </View>
              {alert.severity === 'critical' && (
                <Animated.View
                  style={[
                    styles.badgeOverlay,
                    { transform: [{ scale: scaleAnim }], backgroundColor: '#B91C1C' },
                  ]}
                >
                  <Text style={styles.badgeText}>!</Text>
                </Animated.View>
              )}
            </View>
            <Text style={[styles.cardTitle, { color: config.color }]}>
              {config.title}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: config.color }]}>
            {formatTime(alert.ts)}
          </Text>
        </View>

        <Text style={[styles.message, { color: config.color }]}>
          {alert.message}
        </Text>

        {isExpanded && (
          <View style={styles.instructions}>
            <Text style={[styles.instructionTitle, { color: config.color }]}>
              Please take the following actions immediately:
            </Text>
            {instructions.map((instruction, index) => (
              <Text key={index} style={[styles.bullet, { color: config.color }]}>
                • {instruction}
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.seeMoreText, { color: config.color }]}>
          {isExpanded ? 'See less ▲' : 'See more ▼'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#487307" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error loading alerts</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadAlerts}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (alerts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No alerts</Text>
          <Text style={styles.emptySubText}>All systems are normal</Text>
        </View>
      );
    }

    return alerts.map(renderAlertCard);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Text style={styles.tabTextActive}>General</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#487307']}
          />
        }
      >
        {renderContent()}
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
    paddingTop: 100,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    minHeight: '100%',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    marginTop: 4,
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
    marginBottom: 4,
  },
  seeMoreText: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginTop: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#487307',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});