import * as ImagePicker from "expo-image-picker";
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
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
    if (url) {
      downloadImage(url);
    } else {
      setAvatarUrl(null);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) throw error;

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: false,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      if (image.fileSize && image.fileSize > 2 * 1024 * 1024) {
        Alert.alert("File too large", "Please choose an image smaller than 2MB.");
        return;
      }

      console.log("Image size:", image.fileSize, "bytes"); 

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      const arraybuffer = await fetch(image.uri).then((res) =>
        res.arrayBuffer()
      );

      const fileExt = "jpeg"; 
      const path = `${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arraybuffer, {
          contentType: "image/jpeg",
          upsert: true,
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
              borderRadius: size / 2,
              resizeMode: "cover",
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
          <Feather name="user" size={size / 2} color="#fff" />
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
});

export default Avatar;