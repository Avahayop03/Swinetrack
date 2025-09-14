import * as ImagePicker from "expo-image-picker";
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../android/src/utils/supabase";
import { Feather } from "@expo/vector-icons";

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

const Avatar = forwardRef(function Avatar(
  { url, size = 150, onUpload }: Props,
  ref
) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
        allowsMultipleSelection: false, // Can only select one image
        allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
        quality: 1,
        exif: false, // We don't want nor need that data.
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      console.log("Got image", image);

      if (!image.uri) {
        throw new Error("No image uri!"); // Realistically, this should never happen, but just in case...
      }

      const arraybuffer = await fetch(image.uri).then((res) =>
        res.arrayBuffer()
      );

      const fileExt = image.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(data.path);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  useImperativeHandle(ref, () => ({
    uploadAvatar,
  }));

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[
            avatarSize,
            styles.avatar,
            {
              borderRadius: size / 2, // Ensures the image is always a circle
              resizeMode: "cover", // Ensures the image covers the area
            },
          ]}
        />
      ) : (
        <View
          style={[
            avatarSize,
            styles.avatar,
            {
              backgroundColor: "#bbb",
              borderRadius: size / 2,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{ color: "#fff", fontSize: size / 2, fontWeight: "bold" }}
          >
            <Feather name="user" size={size / 2} color="#fff" />
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden",
    maxWidth: "100%",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: "#bbb",
    borderWidth: 1,
    borderColor: "rgb(200, 200, 200)",
    // borderRadius is set inline for circle
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Avatar;
