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
    console.log('4. Entering fetchProfile for user:', userId)
    const startTime = performance.now()
    try {
      console.log('4.1. Starting Supabase query...')
      const queryStartTime = performance.now()
      
      // Add timeout to the query
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      })

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result
      const queryEndTime = performance.now()
      console.log(`4.2. Supabase query completed in ${(queryEndTime - queryStartTime).toFixed(2)}ms`)

      if (error) {
        console.error('Error fetching profile:', error)
        // If the profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          const insertStartTime = performance.now()
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
          const insertEndTime = performance.now()
          console.log(`Profile creation completed in ${(insertEndTime - insertStartTime).toFixed(2)}ms`)

          if (insertError) {
            console.error('Error creating profile:', insertError)
            return
          }

          // Fetch the newly created profile
          console.log('Fetching newly created profile...')
          const newQueryStartTime = performance.now()
          const { data: newData, error: newError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
          const newQueryEndTime = performance.now()
          console.log(`New profile fetch completed in ${(newQueryEndTime - newQueryStartTime).toFixed(2)}ms`)

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
      // Log the full error details
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
      }
      throw err // Re-throw to be caught by signIn
    } finally {
      const endTime = performance.now()
      console.log(`4.3. Total fetchProfile execution time: ${(endTime - startTime).toFixed(2)}ms`)
    }
  }

  async function signUp(email: string, password: string) {
    console.log('1. Starting signup process...')
    const startTime = performance.now()
    try {
      console.log('2. Creating auth user...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        console.error('Auth signup error:', error)
        throw error
      }
      console.log('3. Auth user created successfully:', data.user?.id)

      // Create user profile with 'user' role
      if (data.user) {
        console.log('4. Creating user profile...')
        const profileStartTime = performance.now()
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
          console.error('Profile creation error:', profileError)
          throw profileError
        }
        console.log(`5. Profile created in ${(performance.now() - profileStartTime).toFixed(2)}ms`)

        // Fetch the profile immediately
        console.log('6. Fetching created profile...')
        await fetchProfile(data.user.id)
        console.log('7. Profile fetch completed')
      }
    } catch (err) {
      console.error('Unexpected error in signUp:', err)
      throw err
    } finally {
      const endTime = performance.now()
      console.log(`Total signup execution time: ${(endTime - startTime).toFixed(2)}ms`)
    }
  }

  async function signIn(email: string, password: string) {
    console.log('1. Starting sign in process...')
    const startTime = performance.now()
    try {
      console.log('2. Creating auth user...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('Auth sign in error:', error)
        throw error
      }
      console.log('3. Auth user created successfully:', data.user?.id)

      if (data.user) {
        console.log('4. Starting profile fetch...')
        try {
          await fetchProfile(data.user.id)
          console.log('5. Profile fetch completed in signIn')
        } catch (err) {
          console.error('Error in signIn profile fetch:', err)
          // Don't throw here, just log the error
        }
      }
    } catch (err) {
      console.error('Unexpected error in signIn:', err)
      throw err
    } finally {
      const endTime = performance.now()
      console.log(`Total signIn execution time: ${(endTime - startTime).toFixed(2)}ms`)
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