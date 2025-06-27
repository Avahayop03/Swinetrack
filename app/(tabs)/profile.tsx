import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



export default function ProfileScreen() {

  const router = useRouter();

  const handleLogout = () => {
    router.push("/(auth)/login")
  }
  return (
    <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
       
        {/* Profile Section */}
        <View style={styles.profileCard}>
            
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }} // replace with real image
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Feather name="edit" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>jenniekim</Text>
          <Text style={styles.email}>jenniekim@gmail.com</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.options}>
          <TouchableOpacity style={styles.option}>
            <Feather name="user" size={20} color="#333" />
            <Text style={styles.optionText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Feather name="bell" size={20} color="#333" />
            <Text style={styles.optionText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.option, { marginTop: 10 }]}
          onPress={handleLogout}>
            <Feather name="log-out" size={20} color="red" />
            <Text style={[styles.optionText, { color: 'red' }]}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#3D6D11',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
 
  profileCard: {
    backgroundColor: '#487307',
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    paddingTop:50
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#487307',
    borderRadius: 15,
    padding: 6,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
  email: {
    color: 'white',
    fontSize: 14,
  },
  options: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  
});
