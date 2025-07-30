import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import { supabase } from '../android/src/utils/supabase'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name, phone`)
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setUsername(data.username || '')
        setWebsite(data.website || '')
        setAvatarUrl(data.avatar_url || '')
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
    full_name,
    phone,
  }: {
    username: string
    website: string
    avatar_url: string
    full_name: string
    phone: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        full_name,
        phone,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      Alert.alert('Profile updated successfully!')
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={session?.user?.email || ''}
        disabled
        style={styles.input}
      />
      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Website"
        value={website}
        onChangeText={setWebsite}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={() =>
          updateProfile({
            username,
            website,
            avatar_url: avatarUrl,
            full_name: fullName,
            phone,
          })
        }
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Loading...' : 'Update'}
      </Button>
      <Button onPress={() => supabase.auth.signOut()} style={styles.button}>
        Sign Out
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 20,
  },
})
