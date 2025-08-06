import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/assets/supabase';

const screenWidth = Dimensions.get('window').width;

const mockData = [
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },
  { date: '04-11-25', time: '8:00', temp: '29.12', humidity: '65', ammonia: '18' },


];

export default function HistoryScreen() {

    const [userName, setUserName] = useState<string | null>(null);

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


  const handleExport = () => {
    console.log("export button pressed")
  }
  return ( 
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
                  <Image
                    source={require('./swinetrack-logo.png')}
                    style={styles.logo}
                  />
          </View>
        <Text style={styles.welcomeText}>Welcome back, {userName ? userName : 'User'}!</Text>
        <Text style={styles.subText}>View your pig's status history here.</Text>
        <View style={styles.divider} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Row: Export + History */}
        <View style={styles.titleRow}>
          {/* Export Button */}

          <TouchableOpacity style={styles.exportButton}
          onPress={handleExport}>
            <Ionicons name="document-outline" size={16} color="#4A7C2F" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>

          {/* Centered History Title (absolutely centered via position) */}
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
          <Text style={styles.tableHeaderText}>Ammonia</Text>
        </View>

        {/* Table Rows */}
        <ScrollView>
          {mockData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{item.date}</Text>
              <Text style={styles.cell}>{item.time}</Text>
              <Text style={styles.cell}>{item.temp}</Text>
              <Text style={styles.cell}>{item.humidity}</Text>
              <Text style={styles.cell}>{item.ammonia}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#487307',
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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
  content: {
    padding: 16,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    height: 40,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf3e3',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 1,
  },
  exportText: {
    marginLeft: 4,
    color: '#487307',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
  height: 1,
  backgroundColor: '#fff',
  marginTop: 12,
  
  opacity: 0.5, // optional: for a subtle look
},

  centerTitleContainer: {
    position: 'absolute',
    left: screenWidth / 2 - 70, // 50 = half the width of title (roughly)
  },
  historyTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 12,
    width: '20%',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: {
    width: '20%',
    fontSize: 12,
    textAlign: 'center',
  },
});
