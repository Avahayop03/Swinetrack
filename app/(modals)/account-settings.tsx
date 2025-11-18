import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AccountSettingsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setName(data.user.user_metadata?.full_name || "");
        setEmail(data.user.email || "");
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    let errorMsg = "";
    // Update name in Supabase
    const { error: nameError } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (nameError) errorMsg += nameError.message + "\n";

    // Update password in Supabase if provided
    if (password) {
      const { error: passError } = await supabase.auth.updateUser({
        password,
      });
      if (passError) errorMsg += passError.message + "\n";
    }

    if (errorMsg) {
      Alert.alert("Update Failed", errorMsg.trim());
      return;
    }

    // Refetch user data from Supabase to update local state/UI
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setName(data.user.user_metadata?.full_name || "");
      setEmail(data.user.email || "");
    }
    setPassword(""); // Clear password field

    Alert.alert("Changes Saved", "Your account settings have been updated.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Account</Text>

        {/* Display current user info */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            style={[styles.input, { backgroundColor: "#eee", color: "#888" }]} // visually disabled            editable={false}
            selectTextOnFocus={false}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3D6D11",
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#3D6D11",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
