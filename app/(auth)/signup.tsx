import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <View style={styles.fullScreen}>
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.topBackground}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./swinetrack-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Sign Up</Text>
          </View>

          <View style={styles.container}>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="helloworld@gmail.com"
                placeholderTextColor="#aaa"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.field, { width: '100%' }]}>
              <Text style={styles.label}>Full Name and Phone Number</Text>
              <View style={styles.row}>
                <TextInput
                  placeholder="ex: Jennie Kim"
                  placeholderTextColor="#aaa"
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                />
                <TextInput
                  placeholder="+639"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  style={[styles.input, { width: 90, marginLeft: 5 }]}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Must be 8 characters"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#555"
                    style={styles.eye}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Repeat password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showRepeatPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setShowRepeatPassword(!showRepeatPassword)}>
                  <Ionicons
                    name={showRepeatPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#555"
                    style={styles.eye}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryText}>Create Account</Text>
            </TouchableOpacity>

            <Text style={styles.or}>Or Register with</Text>

            <TouchableOpacity style={styles.googleButton}>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.link}>Log in</Text>
              </TouchableOpacity>
            </View>
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
      justifyContent: 'flex-start',

    
  },
  topBackground: {
    flex: 1,
    backgroundColor: '#487307',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
  flexGrow: 1,
  width: '100%',
  backgroundColor: '#fff',
  borderTopLeftRadius: 40,
  borderTopRightRadius: 40,
  padding: 24,
  paddingTop: 50,
  alignItems: 'center',
  minHeight: height * 0.75,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: '#555',
  },
  field: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eye: {
    marginLeft: 10,
    padding: 5,
  },
  primaryButton: {
    backgroundColor: '#487307',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
  },
  primaryText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  or: {
    marginVertical: 12,
    fontSize: 13,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 40,
  },
  link: {
    color: '#487307',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 40,
  },
});
