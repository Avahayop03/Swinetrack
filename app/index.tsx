import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function WelcomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  //WELCOME PAGE NI SYA GUYS
  
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fade in logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // 2. Fade in title/tagline
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // 3. Fade in bottom section slowly
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Animated.Image
          source={require("../assets/images/swinetrack-logo.png")}
          style={[styles.logo, { opacity: logoOpacity }]}
        />

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={styles.appName}>
            <Text style={styles.orangeText}>Swine</Text>
            <Text style={styles.greenText}>Track</Text>
          </Text>
          <Text style={styles.tagline}>Right On Time, Healthy Swine</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.createAccountText}>Create account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  topContent: {
    alignItems: "center",
    marginTop: 100,
  },
  logo: {
    width: 300,
    height: 190,
    resizeMode: "contain",
    tintColor: "#487307",
  },
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  orangeText: {
    color: "#F5A623",
  },
  greenText: {
    color: "#467C1D",
  },
  tagline: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#333",
    textAlign: "center",
  },
  bottomSection: {
    backgroundColor: "#487307",
    padding: 30,
    paddingBottom: 50,
    paddingTop: 70,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    alignItems: "center",
  },
  signInButton: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  createAccountButton: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  createAccountText: {
    color: "#467C1D",
    fontSize: 16,
    fontWeight: "500",
  },
});
