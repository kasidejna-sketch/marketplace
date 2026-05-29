import { createContext, useContext, useState, useEffect } from 'react'
import { initLiff, loginWithLine, getLineProfile, getStoredLineUser, logoutLine, isLoggedIn } from '../lib/liff'

const LineAuthContext = createContext(null)

export function LineAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // First check localStorage for stored user
      const storedUser = getStoredLineUser()
      if (storedUser) {
        setUser(storedUser)
      }

      // Initialize LIFF and check for fresh login
      const initialized = await initLiff()
      if (initialized) {
        const profile = await getLineProfile()
        if (profile) {
          setUser({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl || '',
          })
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async () => {
    setLoading(true)
    const profile = await loginWithLine()

    if (profile) {
      setUser({
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || '',
      })
    }
    setLoading(false)
    return profile
  }

  const logout = () => {
    logoutLine()
    setUser(null)
  }

  return (
    <LineAuthContext.Provider value={{ user, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </LineAuthContext.Provider>
  )
}

export function useLineAuth() {
  const context = useContext(LineAuthContext)
  if (!context) {
    throw new Error('useLineAuth must be used within a LineAuthProvider')
  }
  return context
}
