import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from './CartContext'

const AddressContext = createContext(null)

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { customerId } = useCart()

  // Load addresses when customer is available
  useEffect(() => {
    if (customerId) {
      loadAddresses()
    } else {
      setAddresses([])
      setSelectedAddressId(null)
    }
  }, [customerId])

  const loadAddresses = useCallback(async () => {
    if (!customerId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setAddresses(data || [])
      
      // Auto-select default address or first address
      const defaultAddr = data?.find(a => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (data?.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (e) {
      console.error('[Address] Failed to load addresses:', e)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  const addAddress = useCallback(async (addressData) => {
    if (!customerId) return { success: false, error: 'ไม่พบข้อมูลลูกค้า' }

    try {
      setLoading(true)
      
      // If this is set as default, unset other defaults first
      if (addressData.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', customerId)
      }

      const { data, error } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: customerId,
          ...addressData,
        })
        .select()
        .single()

      if (error) throw error

      await loadAddresses()
      
      // Auto-select newly added address
      if (data) {
        setSelectedAddressId(data.id)
      }

      return { success: true, data }
    } catch (e) {
      console.error('[Address] Failed to add address:', e)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [customerId, loadAddresses])

  const updateAddress = useCallback(async (addressId, addressData) => {
    if (!customerId) return { success: false, error: 'ไม่พบข้อมูลลูกค้า' }

    try {
      setLoading(true)

      // If this is set as default, unset other defaults first
      if (addressData.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', customerId)
          .neq('id', addressId)
      }

      const { data, error } = await supabase
        .from('customer_addresses')
        .update({
          ...addressData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', addressId)
        .eq('customer_id', customerId)
        .select()
        .single()

      if (error) throw error

      await loadAddresses()
      return { success: true, data }
    } catch (e) {
      console.error('[Address] Failed to update address:', e)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [customerId, loadAddresses])

  const deleteAddress = useCallback(async (addressId) => {
    if (!customerId) return { success: false, error: 'ไม่พบข้อมูลลูกค้า' }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('customer_id', customerId)

      if (error) throw error

      await loadAddresses()
      
      // If deleted address was selected, select another
      if (selectedAddressId === addressId) {
        const remaining = addresses.filter(a => a.id !== addressId)
        setSelectedAddressId(remaining[0]?.id || null)
      }

      return { success: true }
    } catch (e) {
      console.error('[Address] Failed to delete address:', e)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [customerId, loadAddresses, selectedAddressId, addresses])

  const setDefaultAddress = useCallback(async (addressId) => {
    return updateAddress(addressId, { is_default: true })
  }, [updateAddress])

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        selectedAddress,
        setSelectedAddressId,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        loadAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export function useAddress() {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider')
  }
  return context
}
