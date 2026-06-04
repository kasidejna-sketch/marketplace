const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''
import { supabase, supabaseUrl } from '../lib/supabase'

let liff = null
let isInitialized = false
let initPromise = null

async function getLiff() {
  if (liff) return liff
  const module = await import('@line/liff')
  liff = module.default
  return liff
}

export async function initLiff() {
  if (isInitialized) return true
  if (initPromise) return initPromise

  if (!LIFF_ID) {
    console.warn('[LIFF] VITE_LIFF_ID is not set. LINE Login will not work.')
    return false
  }

  initPromise = (async () => {
    try {
      const liffClient = await getLiff()
      await liffClient.init({ liffId: LIFF_ID })
      isInitialized = true
      console.log('[LIFF] Initialized successfully')
      return true
    } catch (error) {
      console.error('[LIFF] Initialization failed:', error)
      initPromise = null
      return false
    }
  })()

  return initPromise
}

export async function loginWithLine() {
  const initialized = await initLiff()
  if (!initialized) return null

  const liffClient = await getLiff()
  if (!liffClient.isLoggedIn()) {
    liffClient.login({ redirectUri: window.location.href })
    return null
  }

  return getLineProfile()
}

export async function getLineProfile() {
  const initialized = await initLiff()
  if (!initialized) return null

  const liffClient = await getLiff()
  if (!liffClient.isLoggedIn()) return null

  try {
    const profile = await liffClient.getProfile()
    // ดึงข้อมูลจาก ID Token
    const idToken = liffClient.getIDToken()
    const res = await fetch(
      `${supabaseUrl}/functions/v1/line-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    )

    const data = await res.json()
    // LOGIN SUPABASE
    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

    console.log(authData.session)

    // Store userId in localStorage
    console.log('[LIFF] Retrieved profile:', profile)
    localStorage.setItem('line_user_id', profile.userId)
    localStorage.setItem('line_display_name', profile.displayName)
    localStorage.setItem('line_picture_url', profile.pictureUrl || '')
    localStorage.setItem('line_email', idToken.email || '')
    return profile
  } catch (error) {
    console.error('[LIFF] Failed to get profile:', error)
    return null
  }
}

export function getStoredLineUser() {
  const userId = localStorage.getItem('line_user_id')
  if (!userId) return null

  return {
    userId,
    displayName: localStorage.getItem('line_display_name') || '',
    pictureUrl: localStorage.getItem('line_picture_url') || '',
    email: localStorage.getItem('line_email') || '',
  }
}

export async function logoutLine() {
  localStorage.removeItem('line_user_id')
  localStorage.removeItem('line_display_name')
  localStorage.removeItem('line_picture_url')
  localStorage.removeItem('line_email')

  try {
    const liffClient = await getLiff()
    if (liffClient.isLoggedIn()) {
      liffClient.logout()
    }
  } catch (error) {
    // Ignore errors during logout
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem('line_user_id')
}

export { getLiff as liff }
