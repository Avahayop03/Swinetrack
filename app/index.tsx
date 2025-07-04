import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
          <Image
            source={require("../assets/images/swinetrack-logo.png")}
            style={styles.logo}
          />


        <Text style={styles.appName}>
          <Text style={styles.orangeText}>Swine</Text>
          <Text style={styles.greenText}>Track</Text>
        </Text>
        <Text style={styles.tagline}>Right On Time, Healthy Swine</Text>
      </View>

      <View style={styles.bottomSection}>
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
      </View>
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
