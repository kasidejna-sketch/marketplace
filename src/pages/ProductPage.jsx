import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useProduct, useProducts, getProductsByIds } from '../hooks/useData'
import { useCart } from '../context/CartContext'
import ProductCard, { ProductSkeleton } from '../components/ui/ProductCard'

function formatPrice(price) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductPage() {
  const { id } = useParams()
  const { data: product, loading } = useProduct(id)
  const { data: related } = useProducts({
    categoryId: product?.category_id,
    limit: 4,
  })
  const { addItem } = useCart()
  const location = useLocation()
  const processedQueryRef = useRef(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (processedQueryRef.current) return

    const params = new URLSearchParams(location.search)
    const multiParams = params.getAll('product_id')
    const shouldAdd = params.get('addToCart') || params.get('add') || (multiParams && multiParams.length > 0)
    if (!shouldAdd) return

      ; (async () => {
        try {
          // If multiple product_id entries provided (format: id;qty)
          if (multiParams && multiParams.length > 0) {
            const pairs = multiParams
              .map(v => {
                const [idPart, qtyPart] = String(v).split(';')
                const id = idPart ? idPart.trim() : null
                const qty = parseInt(qtyPart || '1', 10) || 1
                return { id, qty }
              })
              .filter(p => p.id)

            // Separate ids that need fetching (exclude current page product if present)
            const idsToFetch = pairs
              .map(p => p.id)
              .filter(id => String(product?.id) !== String(id))

            let fetched = []
            if (idsToFetch.length > 0) {
              const { data: rows, error } = await getProductsByIds(idsToFetch)
              if (!error && rows) fetched = rows
            }

            for (const p of pairs) {
              const prodObj = (product && String(product.id) === String(p.id))
                ? product
                : fetched.find(r => String(r.id) === String(p.id))

              if (!prodObj) continue
              if ((prodObj.stock ?? 0) <= 0) continue

              const addQty = Math.max(1, Math.min(p.qty, prodObj.stock ?? p.qty))
              await addItem(prodObj, addQty)
            }

            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
            return
          }

          // Fallback: single product page add (supports ?addToCart or ?add with qty)
          if (!product) return
          const qty = parseInt(params.get('qty') || params.get('quantity') || '1', 10) || 1
          const addQuantity = Math.max(1, Math.min(qty, product.stock || 1))
          if ((product.stock ?? 0) > 0) {
            await addItem(product, addQuantity)
            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
          }
        } finally {
          processedQueryRef.current = true
        }
      })()
  }, [product, location.search, addItem])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="skeleton h-96 rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-10 w-32" />
            <div className="skeleton h-20" />
            <div className="skeleton h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!loading && !product) {
    return (
      <div className="text-center py-32">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">ไม่พบสินค้า</h2>
        <Link to="/search" className="btn-primary mt-4">ดูสินค้าทั้งหมด</Link>
      </div>
    )
  }

  const { name, price, stock, image_url, description, sku, categories: cat, created_at } = product
  const inStock = stock > 0

  function handleAddToCart() {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-brand-600 transition-colors">หน้าหลัก</Link>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {cat && (
          <>
            <Link to={`/category/${cat.slug}`} className="hover:text-brand-600 transition-colors">{cat.name}</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
        <span className="text-ink line-clamp-1">{name}</span>
      </nav>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">

        {/* Image */}
        <div className="card overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-surface-muted to-gray-100 flex items-center justify-center">
            {image_url ? (
              <img src={image_url} alt={name} className="w-full h-full object-contain p-4" />
            ) : (
              <span className="text-8xl opacity-20">📦</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category + SKU */}
          <div className="flex items-center gap-3 mb-4">
            {cat && (
              <Link to={`/category/${cat.slug}`} className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                {cat.name}
              </Link>
            )}
            {sku && <span className="text-xs text-gray-400 font-mono">SKU: {sku}</span>}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 leading-tight">
            {name}
          </h1>

          {/* Price */}
          <div className="bg-surface-muted rounded-2xl p-4 mb-6">
            <p className="font-display text-4xl font-bold text-brand-600">{formatPrice(price)}</p>
            <div className="flex items-center gap-2 mt-2">
              {inStock ? (
                <>
                  <span className="w-2 h-2 bg-brand-400 rounded-full" />
                  <span className="text-sm text-brand-600 font-medium">มีสินค้า</span>
                  <span className="text-sm text-gray-400">({stock} ชิ้น)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-gray-400">สินค้าหมด</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="mb-6">
              <h3 className="font-semibold text-ink text-sm mb-2">รายละเอียดสินค้า</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          )}

          {/* Specs */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
              {[
                ['ราคา', formatPrice(price)],
                ['สถานะ', inStock ? 'มีสินค้า' : 'หมด'],
                ['คงเหลือ', `${stock} ชิ้น`],
                ['หมวดหมู่', cat?.name || '-'],
              ].map(([label, val]) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 mt-auto">
            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">จำนวน:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-semibold text-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${added
                    ? 'bg-green-500 text-white'
                    : inStock
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-md active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    เพิ่มแล้ว!
                  </>
                ) : inStock ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    เพิ่มลงตะกร้า
                  </>
                ) : (
                  'สินค้าหมด'
                )}
              </button>
              <button className="px-5 py-4 rounded-2xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all">
                <svg className="w-5 h-5 text-gray-400 hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {
        related.filter(p => String(p.id) !== id).length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-6">สินค้าที่เกี่ยวข้อง</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.filter(p => String(p.id) !== id).slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )
      }
    </div >
  )
}
