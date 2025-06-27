import { Tabs } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { View } from 'react-native';


export default function TabsLayout() {
  return (
    <Tabs
    
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#487307',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#dfe6d5',
      }}
    >
      <Tabs.Screen
      
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ borderTopWidth: focused ? 3 : 0, borderTopColor: '#fff', paddingTop: 7  }}>
              <Feather name="home" size={24} color={color} />
            </View>

          ),
        }}
      />
      
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ borderTopWidth: focused ? 3 : 0, borderTopColor: '#fff', paddingTop: 7 }}>
              <Ionicons name="notifications-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ borderTopWidth: focused ? 3 : 0, borderTopColor: '#fff', paddingTop: 7 }}>
              <Ionicons name="time-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ borderTopWidth: focused ? 3 : 0, borderTopColor: '#fff', paddingTop: 7 }}>
              <Feather name="user" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
