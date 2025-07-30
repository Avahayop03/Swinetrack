import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../android/src/utils/supabase'; // Adjust path if needed

export default function GoogleAuth() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // ✅ Get ID token
      const { idToken } = await GoogleSignin.getTokens();

      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        console.log('Supabase login result:', data, error);

        if (error) {
          console.error('Supabase login error:', error.message);
          Alert.alert('Login Failed', error.message);
        } else if (data.session) {
          Alert.alert('Login Successful', 'Welcome!');
          router.push('/(tabs)');
        } else {
          Alert.alert('Login Error', 'No session returned.');
        }
      } else {
        throw new Error('No ID token received from Google Sign-In');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Sign-in cancelled by user.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign-in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available.');
      } else {
        console.error('Google Sign-In error:', error);
        Alert.alert('Error', 'Something went wrong during sign-in.');
      }
    }
  };

  return (
    <GoogleSigninButton
      style={{
        width: 280,
        height: 54,
        alignSelf: 'center',
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Light}
      onPress={handleGoogleSignIn}
    />
  );
}
