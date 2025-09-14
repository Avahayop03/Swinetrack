import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Text, TextInput } from "react-native";
import { useFonts } from "expo-font";

// Font loader to apply Poppins globally
function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const TextAny = Text as any;
    const TextInputAny = TextInput as any;

    if (!TextAny.defaultProps) {
      TextAny.defaultProps = {};
    }
    if (!TextAny.defaultProps) {
      TextAny.defaultProps = {};
    }
    TextAny.defaultProps.style = [
      { fontFamily: "Poppins-Regular" },
      ...(TextAny.defaultProps.style
        ? Array.isArray(TextAny.defaultProps.style)
          ? TextAny.defaultProps.style
          : [TextAny.defaultProps.style]
        : []),
    ];

    if (!TextInputAny.defaultProps) {
      TextInputAny.defaultProps = {};
    }
    TextInputAny.defaultProps.style = [
      { fontFamily: "Poppins-Regular" },
      ...(TextInputAny.defaultProps.style
        ? Array.isArray(TextInputAny.defaultProps.style)
          ? TextInputAny.defaultProps.style
          : [TextInputAny.defaultProps.style]
        : []),
    ];
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Or return a loading screen component
  }

  return <>{children}</>;
}

//BASTA MAO NING MAG LOGIN KA NGA SCREEN PARA DI SYA MA DIRECT AGAD SA UBAN MGA NAV PAGES
function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = true; // Set to true when user is logged in

  useEffect(() => {
    if (!isAuth) {
      router.replace("/auth");
    }
  }, [isAuth, router]);

  useFocusEffect(() => {
    if (isAuth) {
      const onBackPress = () => {
        // Prevent back navigation when on dashboard
        // You can add more checks if needed for specific routes
        return true; // Block back action
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }
  });

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <FontLoader>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(modals)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </FontLoader>
  );
}
