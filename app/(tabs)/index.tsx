
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../assets/supabase';

export default function Index() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    router.replace('/(auth)/login');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SwineTrack!</Text>
      <Text style={styles.subtitle}>You're logged in 🎉</Text>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#487307',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#333',
  },
});