/*import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../assets/supabase';

const router = useRouter();

// Auth refresh control — only for native

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.appName}>
          <Text style={styles.orangeText}>Swine</Text>
          <Text style={styles.greenText}>Track</Text>
        </Text>
        <Text style={styles.tagline}>Right On Time, Healthy Swine</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={styles.signInText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={styles.createAccountText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  topContent: { alignItems: 'center', marginBottom: 30 },
  appName: { fontSize: 40, fontWeight: 'bold' },
  orangeText: { color: '#F5A623' },
  greenText: { color: '#467C1D' },
  tagline: { fontSize: 17, fontStyle: 'italic', color: '#333' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  input: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  signInButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#487307',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  signInText: { color: '#487307', fontSize: 16, fontWeight: '500' },
  createAccountButton: {
    width: '100%',
    backgroundColor: '#487307',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  createAccountText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
*/