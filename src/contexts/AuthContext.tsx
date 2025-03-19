import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    console.log('Fetching profile for user:', userId)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If the profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email: user?.email,
                role: 'user',
                tokens: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])

          if (insertError) {
            console.error('Error creating profile:', insertError)
            return
          }

          // Fetch the newly created profile
          const { data: newData, error: newError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (newError) {
            console.error('Error fetching new profile:', newError)
            return
          }

          console.log('New profile created and fetched:', newData)
          setProfile(newData)
          return
        }
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err)
    }
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    // Create user profile with 'user' role
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: 'user',
            tokens: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        throw profileError
      }

      // Fetch the profile immediately
      await fetchProfile(data.user.id)
    }
  }

  async function signIn(email: string, password: string) {
    console.log('Attempting to sign in...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('Sign in error:', error)
      throw error
    }
    console.log('Sign in successful:', data.user)
    if (data.user) {
      console.log('Fetching profile...')
      await fetchProfile(data.user.id)
      console.log('Profile fetched')
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async function updateProfile(data: Partial<UserProfile>) {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)

    if (error) throw error

    await fetchProfile(user.id)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth } 