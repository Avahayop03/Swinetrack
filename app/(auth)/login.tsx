import React, { useState } from "react";
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
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../assets/supabase";

const { height } = Dimensions.get("window");

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Start of Changes for Local Login ---
  // Define local credentials
  const LOCAL_USERNAME = "admin";
  const LOCAL_PASSWORD = "admin";

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Missing Input", "Email and password are required.");
      return;
    }

    setLoading(true);

    // 1. Check for Local Credentials
    if (email === LOCAL_USERNAME && password === LOCAL_PASSWORD) {
      // Local login successful!
      // NOTE: Since this is a local user, no Supabase session is created.
      // You must handle the app state/navigation appropriately.
      // We will skip session verification and navigate directly.
      console.log("Local Login verified for:", LOCAL_USERNAME);
      Alert.alert("Login Successful", `Welcome back, ${LOCAL_USERNAME}!`);
      setLoading(false);
      router.push("/(tabs)");
      return; // Stop execution after local login success
    }

    // 2. Fallback to Supabase authentication for all other users

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    setLoading(false);

    if (sessionError || !sessionData.session) {
      Alert.alert("Login Error", "Session could not be verified.");
      return;
    }

    console.log("Supabase Login verified for:", sessionData.session.user.email);
    Alert.alert("Login Successful", "Welcome back!");
    router.push("/(tabs)");
  }
  // --- End of Changes for Local Login ---

  return (
    <View style={styles.fullScreen}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBackground}>
          <Image
            source={require("./swinetrack-logo.png")}
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/*<TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>*/}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={signInWithEmail}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footer}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
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
    backgroundColor: "#487307",
  },
  scrollView: {
    flexGrow: 1,
  },
  topBackground: {
    backgroundColor: "#487307",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingTop: 50,
    alignItems: "center",
    minHeight: height * 0.65,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: "#555",
    alignSelf: "flex-start",
    width: "100%",
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#999",
  },
  submitBtn: {
    backgroundColor: "#487307",
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    width: "100%",
    opacity: 1,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footer: {
    color: "#555",
    fontSize: 13,
  },
  link: {
    color: "#487307",
    fontWeight: "bold",
    fontSize: 13,
  },
});