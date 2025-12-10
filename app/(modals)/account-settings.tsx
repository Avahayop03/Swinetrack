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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      setEmail(user.email || "");

      // FIX 1: Fetch from 'profiles' table to ensure we edit the correct data source
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.full_name || "");
      } else {
        // Fallback if profile is empty, try metadata
        setName(user.user_metadata?.full_name || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // FIX 2: Update the 'profiles' table (This is what your Profile Screen reads)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: name,
          updated_at: new Date(),
        });

      if (profileError) throw profileError;

      // FIX 3: Also update Supabase Auth Metadata (keeps everything in sync)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (authError) throw authError;

      // FIX 4: Update Password only if the user typed something
      if (password && password.length > 0) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password,
        });
        if (passError) throw passError;
      }

      Alert.alert("Success", "Account settings updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Update Failed", error.message);
      }
    } finally {
      setLoading(false);
      setPassword(""); // Clear password field for security
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Account</Text>

        {/* Display current user info */}
        <Text style={styles.name}>{name || "No Name"}</Text>
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
            style={[styles.input, { backgroundColor: "#eee", color: "#888" }]} 
            editable={false}
            selectTextOnFocus={false}
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
          <Text style={styles.hint}>Leave blank if you don't want to change it.</Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
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
  hint: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
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