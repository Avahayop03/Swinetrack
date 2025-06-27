import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

//BASTA MAO NING MAG LOGIN KA NGA SCREEN PARA DI SYA MA DIRECT AGAD SA UBAN MGA NAV PAGES
function RouteGuard({children}: { children: React.ReactNode}) {
  const router = useRouter()
  const isAuth = false;
  useEffect(() => {
    if (!isAuth) {
      router.replace("/auth");
    }
  });
  return <>{children}</>;
}


export default function RootLayout() {
  return (

      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

  );
}
