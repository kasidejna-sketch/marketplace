import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAddresses, createAddressForCustomer, updateAddressById, deleteAddressById, setDefaultAddressForCustomer } from '../hooks/useData'
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
      const { data, error } = await getAddresses(customerId)

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
      const { data, error } = await createAddressForCustomer(customerId, addressData)

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
      const { data, error } = await updateAddressById(addressId, customerId, addressData)

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

      const { error } = await deleteAddressById(addressId, customerId)

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
    const res = await setDefaultAddressForCustomer(addressId, customerId)
    if (res.error) return { success: false, error: res.error.message || res.error }
    await loadAddresses()
    return { success: true, data: res.data }
  }, [customerId, loadAddresses])

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
