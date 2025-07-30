import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

//BASTA MAO NING MAG LOGIN KA NGA SCREEN PARA DI SYA MA DIRECT AGAD SA UBAN MGA NAV PAGES
function RouteGuard({children}: { children: React.ReactNode}) {
  const router = useRouter()
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
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }
  });

  return <>{children}</>;
}git

export default function RootLayout() {
  return (
    <RouteGuard>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false }} />

      </Stack>
    </RouteGuard>
  );
}
