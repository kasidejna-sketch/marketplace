import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import AddressSelector from '../components/sections/AddressSelector'
import { createOrderWithItems, getProductsByIds } from '../hooks/useData'

function formatPrice(price) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CartPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { items, addItem, removeItem, updateQuantity, clearCart, totalPrice, syncing, customerId } = useCart()
  const { selectedAddress } = useAddress()
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [addedFromUrl, setAddedFromUrl] = useState(false)

  // Handle URL query params: ?id=1;2 or ?id=1,2 or ?id=1&id=2
  // Format: id=productId;quantity or id=productId (quantity defaults to 1)
  useEffect(() => {
    if (addedFromUrl) return

    const idParams = searchParams.getAll('id')
    if (idParams.length === 0) return

    async function addProductsFromUrl() {
      setLoading(true)
      const productsToAdd = []

      for (const param of idParams) {
        // Support formats: "1;2" (id;quantity), "1,2" (id,quantity), or just "1" (id only)
        const parts = param.split(/[;,]/)
        const productId = parseInt(parts[0], 10)
        const quantity = parts[1] ? parseInt(parts[1], 10) : 1

        if (!isNaN(productId) && productId > 0 && quantity > 0) {
          productsToAdd.push({ productId, quantity })
        }
      }

      if (productsToAdd.length === 0) {
        setLoading(false)
        return
      }

      // Fetch all products at once
      const productIds = productsToAdd.map(p => p.productId)
      const { data: products, error } = await getProductsByIds(productIds)

      if (error) {
        console.error('[Cart] Failed to fetch products:', error)
        setLoading(false)
        return
      }

      // Add each product to cart
      for (const { productId, quantity } of productsToAdd) {
        const product = products?.find(p => p.id === productId)
        if (product && product.stock > 0) {
          addItem(product, Math.min(quantity, product.stock))
        }
      }

      setAddedFromUrl(true)
      setLoading(false)
    }

    addProductsFromUrl()
  }, [searchParams, addItem, addedFromUrl])

  const formatShippingAddress = (address) => {
    if (!address) return ''
    const addressLine = [address.address_line_1, address.address_line_2].filter(Boolean).join(' ')
    const regionLine = [address.subdistrict, address.district, address.province].filter(Boolean).join(' ')
    return [
      address.recipient_name,
      address.phone,
      addressLine,
      regionLine,
      address.postal_code,
    ].filter(Boolean).join(', ')
  }

  const handleCheckout = async () => {
    if (!customerId) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ')
      return
    }

    if (items.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า')
      return
    }

    if (!selectedAddress) {
      alert('กรุณาเลือกที่อยู่จัดส่งก่อนทำการสั่งซื้อ')
      return
    }

    setCheckoutLoading(true)
    try {
      const shippingAddress = formatShippingAddress(selectedAddress)
      const { data, error } = await createOrderWithItems(customerId, items, shippingAddress, {
        shippingFee: 0,
        paymentMethod: 'checkout',
      })

      if (error) {
        throw error
      }

      await clearCart()
      alert('สร้างคำสั่งซื้อสำเร็จ')
      navigate('/orders')
    } catch (e) {
      console.error('[Cart] Checkout failed:', e)
      alert('ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังเพิ่มสินค้าลงตะกร้า...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-2xl font-bold text-ink mb-8">ตะกร้าสินค้า</h1>
        <div className="text-center py-20 bg-surface-muted rounded-3xl">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-xl font-bold text-ink mb-2">ตะกร้าว่างเปล่า</h2>
          <p className="text-gray-500 mb-6">ยังไม่มีสินค้าในตะกร้า</p>
          <Link to="/search" className="btn-primary">
            เลือกซื้อสินค้า
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">ตะกร้าสินค้า</h1>
          {syncing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>กำลังซิงค์...</span>
            </div>
          )}
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          ล้างตะกร้า
        </button>
      </div>

      {/* Address Selection Section */}
      <div className="card p-6 mb-8">
        <AddressSelector />
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="card p-4 flex gap-4"
          >
            {/* Product Image */}
            <Link to={`/product/${product.id}`} className="shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-surface-muted to-gray-100 rounded-2xl overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl opacity-30">📦</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-ink text-sm sm:text-base line-clamp-2 hover:text-brand-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              {product.categories && (
                <p className="text-xs text-gray-400 mt-1">{product.categories.name}</p>
              )}
              <p className="font-display font-bold text-brand-600 mt-2">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(product.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="ลบสินค้า"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-8 text-center font-medium text-ink">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, Math.min(quantity + 1, product.stock))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">รวมทั้งหมด</span>
          <span className="font-display text-2xl font-bold text-brand-600">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          * ราคายังไม่รวมค่าจัดส่ง
        </p>
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? 'กำลังสร้างคำสั่งซื้อ...' : 'ดำเนินการสั่งซื้อ'}
        </button>
      </div>
    </div>
  )
}
