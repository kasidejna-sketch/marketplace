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
