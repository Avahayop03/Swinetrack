  import React, { useState } from 'react';
import {
  Alert,
  AppState,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


  import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { supabase } from '../../android/src/utils/supabase';
import GoogleAuth from '../components/GoogleAuth';
  const { height } = Dimensions.get('window');

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })

  export default function LoginScreen() {

    React.useEffect(() => {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId: "737013590495-p2gb2hg6i853l9h0n3080tecsa7o5304.apps.googleusercontent.com", // Replace with your web client ID
    offlineAccess: true, // If you want to access Google Drive offline

  });
}, []);

    const router = useRouter();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false)

  /* async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false); // ensure loading is turned off on error
    } else {
      router.push('/(tabs)');
      Alert.alert('Login Successful', 'Welcome back!');
      setLoading(false); // also after successful login
    }
  }

  */




    /*const handleLogin = () => {
      console.log("login button pressed");
      router.push('/(tabs)');
    };*/

    const handleLogin = () => {
      console.log("login button pressed");
      router.push('/(tabs)');
    }
  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Missing Input", "Email and password are required.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login error:", error.message);
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }

    // Confirm session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    setLoading(false);

    if (sessionError || !sessionData.session) {
      Alert.alert("Login Error", "Session could not be verified.");
      return;
    }

    console.log("Login verified for:", sessionData.session.user.email);
    Alert.alert("Login Successful", "Welcome back!");
    router.push("/(tabs)");
  }




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
              value={email} // bind to state
              onChangeText={setEmail} // update state on change
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                value={password} // bind to state
                onChangeText={setPassword} // update state on change
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
              <Text style={{ color: '#999' }}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={signInWithEmail}>
              <Text style={styles.submitText}>{loading ? 'Logging in...' : 'Log in'}</Text>
            </TouchableOpacity>
        

        
            <Text style={styles.orText}>Or Sign in with</Text>
             <View style={styles.googleBtn}>
               
               <GoogleAuth />
             </View>

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
