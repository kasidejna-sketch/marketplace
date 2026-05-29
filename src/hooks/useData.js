import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts({ categoryId, search, limit = 20, featured } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('products')
          .select('*, categories(id, name, slug)')
          .eq('status', 'active')
          .limit(limit)
          .order('created_at', { ascending: false })

        if (categoryId) query = query.eq('category_id', categoryId)
        if (search) query = query.ilike('name', `%${search}%`)

        const { data: rows, error: err } = await query
        if (err) throw err
        if (!cancelled) setData(rows || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [categoryId, search, limit])

  return { data, loading, error }
}

export function useProduct(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetch() {
      setLoading(true)
      const { data: row, error: err } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('id', id)
        .single()
      if (!cancelled) {
        setData(row)
        setError(err?.message || null)
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [id])

  return { data, loading, error }
}

export async function getProductsByIds(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { data: [], error: null }
  }

  return supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .in('id', productIds)
    .eq('status', 'active')
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name')
      if (!cancelled) {
        setData(rows || [])
        setError(err?.message || null)
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}

export function useCategory(slug) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    async function fetch() {
      const { data: row } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!cancelled) { setData(row); setLoading(false) }
    }
    fetch()
    return () => { cancelled = true }
  }, [slug])

  return { data, loading }
}

// ─── Vendors (customer_companies) ─────────────────────────────────────────────

export function useVendors({ limit = 12 } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      const { data: rows, error: err } = await supabase
        .from('customer_companies')
        .select('id, name, industry, city, website, customer_count, status')
        .eq('status', 'active')
        .order('customer_count', { ascending: false })
        .limit(limit)
      if (!cancelled) {
        setData(rows || [])
        setError(err?.message || null)
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [limit])

  return { data, loading, error }
}

// ─── Orders by LINE User ────────────────────────────────────────────────────────

export function useOrders(lineUserId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey(prev => prev + 1)

  useEffect(() => {
    if (!lineUserId) {
      setLoading(false)
      return
    }

    let cancelled = false
    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        // Step 1: Find customer by line_user_id
        const { data: customer, error: customerErr } = await supabase
          .from('customers')
          .select('id')
          .eq('line_user_id', lineUserId)
          .single()

        if (customerErr) {
          // No customer found - return empty orders
          if (customerErr.code === 'PGRST116') {
            if (!cancelled) setData([])
            return
          }
          throw customerErr
        }

        // Step 2: Get orders by customer_id with order_items
        const { data: rows, error: ordersErr } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items_order_id_fkey (
              id,
              product_id,
              quantity,
              price,
              products (id, name, image_url)
            )
          `)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })

        if (ordersErr) throw ordersErr
        if (!cancelled) setData(rows || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [lineUserId, refreshKey])

  return { data, loading, error, refetch }
}

// ─── Stats (order previews) ────────────────────────────────────────────────────

export function useMarketStats() {
  const [stats, setStats] = useState({ orders: 0, products: 0, vendors: 0, customers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      const [orders, products, vendors, customers] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('customer_companies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ])
      if (!cancelled) {
        setStats({
          orders: orders.count || 0,
          products: products.count || 0,
          vendors: vendors.count || 0,
          customers: customers.count || 0,
        })
        setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { stats, loading }
}

// ─── Shared CRUD helpers (customers, customer_addresses) ─────────────────────

export async function getCustomerById(customerId) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  return supabase.from('customers').select('*').eq('id', customerId).single()
}

export async function updateCustomerById(customerId, payload) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  return supabase
    .from('customers')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', customerId)
    .select()
    .single()
}

export async function getAddresses(customerId) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  return supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
}

export async function createAddressForCustomer(customerId, addressData) {
  if (!customerId) return { data: null, error: new Error('No customerId') }

  // If setting default, unset others first
  if (addressData.is_default) {
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId)
  }

  return supabase
    .from('customer_addresses')
    .insert({ customer_id: customerId, ...addressData })
    .select()
    .single()
}

export async function updateAddressById(addressId, customerId, addressData) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  if (!addressId) return { data: null, error: new Error('No addressId') }

  // If setting default, unset others first
  if (addressData.is_default) {
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId)
      .neq('id', addressId)
  }

  return supabase
    .from('customer_addresses')
    .update({ ...addressData, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('customer_id', customerId)
    .select()
    .single()
}

export async function deleteAddressById(addressId, customerId) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  if (!addressId) return { data: null, error: new Error('No addressId') }

  return supabase
    .from('customer_addresses')
    .delete()
    .eq('id', addressId)
    .eq('customer_id', customerId)
}

export async function setDefaultAddressForCustomer(addressId, customerId) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  if (!addressId) return { data: null, error: new Error('No addressId') }

  // Unset other defaults then set this one
  await supabase
    .from('customer_addresses')
    .update({ is_default: false })
    .eq('customer_id', customerId)

  return supabase
    .from('customer_addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('customer_id', customerId)
    .select()
    .single()
}

export async function createOrderWithItems(customerId, items, address, options = {}) {
  if (!customerId) return { data: null, error: new Error('No customerId') }
  if (!items || items.length === 0) return { data: null, error: new Error('No items to order') }

  const shippingAddress = address || ''
  const shippingFee = options.shippingFee ?? 0
  const paymentMethod = options.paymentMethod || 'checkout'
  const notes = options.notes || null

  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
  const total = subtotal + shippingFee

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      subtotal,
      shipping_fee: shippingFee,
      total,
      status: 'pending',
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: 'unpaid',
      notes,
    })
    .select()
    .single()

  if (orderError) {
    return { data: null, error: orderError }
  }

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    total: (item.product.price || 0) * item.quantity,
  }))

  const { data: createdItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return { data: null, error: itemsError }
  }

  return { data: { order, items: createdItems }, error: null }
}
