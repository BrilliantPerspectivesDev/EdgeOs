'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { doc, getDoc, Firestore } from 'firebase/firestore'
import { auth as firebaseAuth, db } from './firebase'
import { syncUserRoles, LMSRole } from './auth/role-mapping'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  userRole: LMSRole | null
  companyId: string | null
  companyName: string | null
  permissions: string[]
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  companyId: null,
  companyName: null,
  permissions: []
})

// Helper to check if a path is a public page that doesn't require auth
const isPublicPath = (path: string | null): boolean => {
  if (!path) return false
  const publicPaths = ['/signin', '/company-setup', '/join/team', '/join/supervisor', '/forgot-password', '/landing', '/register']
  return publicPaths.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<LMSRole | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // Check if public page
  const isCurrentPathPublic = isPublicPath(pathname)
  
  console.log('[AuthProvider] pathname:', pathname, 'isPublic:', isCurrentPathPublic)

  useEffect(() => {
    // For public pages, just set loading to false and skip all auth
    if (isCurrentPathPublic) {
      console.log('[AuthProvider] Public page detected, skipping auth')
      setLoading(false)
      return
    }

    let unsubscribe: () => void = () => {}

    const initializeAuth = async () => {
      if (!firebaseAuth) {
        console.error('Firebase auth not initialized')
        setLoading(false)
        return
      }

      try {
        // Set persistence to LOCAL
        await setPersistence(firebaseAuth as Auth, browserLocalPersistence)
        setInitialized(true)
      } catch (error) {
        console.error('Error setting auth persistence:', error)
        setLoading(false)
        return
      }

      unsubscribe = onAuthStateChanged(firebaseAuth as Auth, async (user) => {
        console.log('Auth state changed:', { 
          userId: user?.uid, 
          pathname, 
          initialized: true,
          retryCount
        })
        
        setUser(user)
        
        // Updated auth pages check - includes public pages that don't require auth
        const isAuthPage = isPublicPath(pathname)

        if (!user) {
          setUserRole(null)
          setCompanyId(null)
          setCompanyName(null)
          setPermissions([])
          
          // Only redirect to signin if not already on an auth page and if initialized
          if (!isAuthPage && initialized) {
            console.log('No user, redirecting to signin')
            router.push('/signin')
          }
        } else {
          try {
            // Add a small delay to ensure Firestore is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const userDoc = await getDoc(doc(db as Firestore, 'users', user.uid))
            
            if (userDoc.exists()) {
              const userData = userDoc.data()
              const role = userData.role as LMSRole
              
              console.log('User data loaded:', { 
                role, 
                companyName: userData.companyName,
                userId: user.uid,
                permissions: userData.permissions || []
              })
              
              setUserRole(role)
              setCompanyId(userData.companyId || null)
              setCompanyName(userData.companyName || null)

              // Sync roles and get permissions
              console.log('Syncing user roles...')
              const syncedRoles = await syncUserRoles(user, role, {
                companyId: userData.companyId,
                companyName: userData.companyName
              })
              console.log('Roles synced:', syncedRoles)

              setPermissions(syncedRoles.permissions)

              // If on an auth page and authenticated, redirect to home
              if (isAuthPage && initialized) {
                console.log('User authenticated, redirecting from auth page')
                router.push('/')
              }
            } else {
              console.error('No user document found for:', user.uid)
              
              // If we haven't tried too many times and we're not on an auth page
              if (retryCount < 3 && !isAuthPage) {
                console.log('Retrying user document fetch...')
                setRetryCount(prev => prev + 1)
                // Wait a bit longer before retrying
                await new Promise(resolve => setTimeout(resolve, 1000))
                // The effect will re-run due to retryCount change
              } else if (!isAuthPage) {
                router.push('/signin')
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
            if (!isAuthPage) {
              router.push('/signin')
            }
          }
        }
        
        setLoading(false)
      })
    }

    initializeAuth()

    return () => unsubscribe()
  }, [router, pathname, initialized, retryCount, isCurrentPathPublic])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userRole, 
      companyId,
      companyName, 
      permissions
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

