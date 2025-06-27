import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("login button pressed");
    router.push('/(tabs)');
  };

  return (
    <View style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.topBackground}>
          <Image
            source={require('./swinetrack-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Sign In</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#aaa"
            style={styles.input}
            defaultValue="helloworld@gmail.com"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              defaultValue="********"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={{ color: '#999' }}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin}>
            <Text style={styles.submitText}>Log in</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or Login with</Text>

          <TouchableOpacity style={styles.googleBtn} onPress={handleLogin}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footer}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#487307',
  },
  scrollView: {
    flexGrow: 1,
  },
  topBackground: {
    backgroundColor: '#487307',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
    minHeight: height * 0.65, // ensures full screen bottom white
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: '#555',
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeButton: {
    marginLeft: 10,
    padding: 10,
  },
  submitBtn: {
    backgroundColor: '#487307',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#444',
    fontSize: 13,
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footer: {
    color: '#555',
    fontSize: 13,
  },
  link: {
    color: '#487307',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
