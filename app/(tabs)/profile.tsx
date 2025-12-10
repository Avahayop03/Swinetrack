import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import Avatar from "../Avatar";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarRef = useRef<any>(null);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Error fetching profile:", error.message);
      }

      if (data) {
        setName(data.full_name || data.username || "User");
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.log("Error in getProfile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); 
    }
  };

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProfile();
  }, []);

  const handleAvatarUpload = async (filePath: string) => {
    setAvatarUrl(filePath);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ avatar_url: filePath }).eq("id", user.id);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Avatar
              ref={avatarRef}
              url={avatarUrl}
              size={100}
              onUpload={handleAvatarUpload}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => avatarRef.current?.uploadAvatar()}
            >
              <Feather name="edit" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{loading ? "Loading..." : name}</Text>
          
          <Text style={styles.email}>{email}</Text>
          
          {username && username !== name && (
            <Text style={styles.username}>@{username}</Text>
          )}
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push("/(modals)/account-settings")}
          >
            <Feather name="user" size={20} color="#333" />
            <Text style={styles.optionText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push("/(modals)/notification-settings")}
          >
            <Feather name="bell" size={20} color="#333" />
            <Text style={styles.optionText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { marginTop: 10 }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="red" />
            <Text style={[styles.optionText, { color: "red" }]}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#3D6D11",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  profileCard: {
    backgroundColor: "#487307",
    padding: 50,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    paddingTop: 80,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#487307",
    borderRadius: 15,
    padding: 6,
  },
  name: {
    fontWeight: "bold",
    fontSize: 22,
    color: "white",
    marginTop: 10,
  },
  username: {
    fontSize: 14,
    color: "#e1e1e1",
    marginBottom: 2,
  },
  email: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  options: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});