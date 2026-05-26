import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useLineAuth } from './LineAuthContext'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'shopping_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [customerId, setCustomerId] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const { user, isLoggedIn } = useLineAuth()
  const initialSyncDone = useRef(false)

  // Find customer_id from LINE user
  useEffect(() => {
    async function findCustomer() {
      if (!user?.userId) {
        setCustomerId(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id')
          .eq('line_user_id', user.userId)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('[Cart] Error finding customer:', error)
          }
          setCustomerId(null)
          return
        }

        setCustomerId(data.id)
      } catch (e) {
        console.error('[Cart] Failed to find customer:', e)
        setCustomerId(null)
      }
    }

    findCustomer()
  }, [user?.userId])

  // Load cart - from Supabase if logged in, otherwise from localStorage
  useEffect(() => {
    async function loadCart() {
      if (customerId) {
        // Load from Supabase
        await loadCartFromSupabase()
      } else if (!isLoggedIn) {
        // Load from localStorage for non-logged-in users
        loadCartFromLocalStorage()
      }
      initialSyncDone.current = true
    }

    loadCart()
  }, [customerId, isLoggedIn])

  function loadCartFromLocalStorage() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('[Cart] Failed to load cart from localStorage:', e)
    }
  }

  async function loadCartFromSupabase() {
    if (!customerId) return

    try {
      setSyncing(true)
      
      // Ensure cart exists
      await supabase
        .from('carts')
        .upsert({ customer_id: customerId, status: 'active' }, { onConflict: 'customer_id' })

      // Load cart items with product info
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (id, name, price, stock, image_url)
        `)
        .eq('customer_id', customerId)

      if (error) throw error

      const cartItems = (data || []).map(item => ({
        product: item.products,
        quantity: item.quantity,
      }))

      setItems(cartItems)

      // Merge localStorage cart if exists (for items added before login)
      const localCart = localStorage.getItem(CART_STORAGE_KEY)
      if (localCart) {
        const localItems = JSON.parse(localCart)
        if (localItems.length > 0) {
          for (const localItem of localItems) {
            const exists = cartItems.find(ci => ci.product.id === localItem.product.id)
            if (!exists) {
              await addItemToSupabase(localItem.product.id, localItem.quantity)
            }
          }
          localStorage.removeItem(CART_STORAGE_KEY)
          // Reload to get merged items
          await loadCartFromSupabase()
          return
        }
      }
    } catch (e) {
      console.error('[Cart] Failed to load cart from Supabase:', e)
    } finally {
      setSyncing(false)
    }
  }

  async function addItemToSupabase(productId, quantity) {
    if (!customerId) return false

    try {
      // Use upsert with ON CONFLICT to handle duplicates
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { customer_id: customerId, product_id: productId, quantity },
          { onConflict: 'customer_id,product_id' }
        )

      if (error) throw error
      return true
    } catch (e) {
      console.error('[Cart] Failed to add item to Supabase:', e)
      return false
    }
  }

  async function updateItemInSupabase(productId, quantity) {
    if (!customerId) return false

    try {
      if (quantity <= 0) {
        // Delete item
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('customer_id', customerId)
          .eq('product_id', productId)

        if (error) throw error
      } else {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('customer_id', customerId)
          .eq('product_id', productId)

        if (error) throw error
      }
      return true
    } catch (e) {
      console.error('[Cart] Failed to update item in Supabase:', e)
      return false
    }
  }

  async function removeItemFromSupabase(productId) {
    if (!customerId) return false

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId)

      if (error) throw error
      return true
    } catch (e) {
      console.error('[Cart] Failed to remove item from Supabase:', e)
      return false
    }
  }

  async function clearCartInSupabase() {
    if (!customerId) return false

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId)

      if (error) throw error
      return true
    } catch (e) {
      console.error('[Cart] Failed to clear cart in Supabase:', e)
      return false
    }
  }

  // Save to localStorage for non-logged-in users
  useEffect(() => {
    if (!customerId && !isLoggedIn && initialSyncDone.current) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (e) {
        console.error('[Cart] Failed to save cart to localStorage:', e)
      }
    }
  }, [items, customerId, isLoggedIn])

  const addItem = useCallback(async (product, quantity = 1) => {
    if (!product || !product.id) return

    // Optimistic update
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
    })

    // Sync to Supabase if logged in
    if (customerId) {
      const existing = items.find(item => item.product.id === product.id)
      const newQty = existing ? existing.quantity + quantity : quantity
      
      const success = await addItemToSupabase(product.id, newQty)
      if (!success) {
        // Reload from Supabase on failure
        await loadCartFromSupabase()
      }
    }
  }, [customerId, items])

  const removeItem = useCallback(async (productId) => {
    // Optimistic update
    setItems(prev => prev.filter(item => item.product.id !== productId))

    // Sync to Supabase if logged in
    if (customerId) {
      const success = await removeItemFromSupabase(productId)
      if (!success) {
        await loadCartFromSupabase()
      }
    }
  }, [customerId])

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    // Optimistic update
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )

    // Sync to Supabase if logged in
    if (customerId) {
      const success = await updateItemInSupabase(productId, quantity)
      if (!success) {
        await loadCartFromSupabase()
      }
    }
  }, [customerId, removeItem])

  const clearCart = useCallback(async () => {
    // Optimistic update
    setItems([])

    // Sync to Supabase if logged in
    if (customerId) {
      await clearCartInSupabase()
    } else {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }, [customerId])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  )

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        syncing,
        customerId,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
