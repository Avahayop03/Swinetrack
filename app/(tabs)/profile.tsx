import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import Avatar from "../Avatar"; // Adjust the path if needed

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarRef = useRef<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setName(data.user.user_metadata?.full_name || "");
        setEmail(data.user.email || "");
        setAvatarUrl(data.user.user_metadata?.avatar_url || null); // Adjust based on your user metadata
      }
    };
    fetchUser();
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (filePath: string) => {
    setAvatarUrl(filePath);
    // Optionally, update the user's avatar_url in your backend here
    // await supabase.auth.updateUser({ data: { avatar_url: filePath } });
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => router.push("/(auth)/login"),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Section */}
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
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Settings Options */}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    paddingTop: 50,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 18,
    color: "white",
  },
  email: {
    color: "white",
    fontSize: 14,
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
