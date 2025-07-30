import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
        screenOptions={{
            headerShown: true,
            headerStyle: {
            backgroundColor: '#487307',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
            fontWeight: 'bold',
            },
        }}
    >
        <Stack.Screen
        name="account-settings"
        options={{
          title: 'Account Settings',
        }}
      />
      <Stack.Screen
        name="notification-settings"
        options={{
          title: 'Notification Settings', // ✅ sets clean title
        }}
      />
      
    </Stack>
  );
}
