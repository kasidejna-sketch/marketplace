import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const CATEGORY_ICONS = {
  default: '📦',
  electronics: '💻',
  food: '🍎',
  clothing: '👗',
  tools: '🔧',
  home: '🏠',
  sports: '⚽',
  beauty: '💄',
}

function getCategoryIcon(catName = '') {
  const n = catName.toLowerCase()
  if (n.includes('อิเล็ก') || n.includes('computer') || n.includes('tech')) return CATEGORY_ICONS.electronics
  if (n.includes('อาหาร') || n.includes('food')) return CATEGORY_ICONS.food
  if (n.includes('เสื้อ') || n.includes('fashion') || n.includes('cloth')) return CATEGORY_ICONS.clothing
  if (n.includes('เครื่องมือ') || n.includes('tool')) return CATEGORY_ICONS.tools
  if (n.includes('บ้าน') || n.includes('home')) return CATEGORY_ICONS.home
  if (n.includes('กีฬา') || n.includes('sport')) return CATEGORY_ICONS.sports
  if (n.includes('ความงาม') || n.includes('beauty')) return CATEGORY_ICONS.beauty
  return CATEGORY_ICONS.default
}

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none rounded-t-3xl" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export { ProductSkeleton }

export default function ProductCard({ product }) {
  const { id, name, price, stock, image_url, categories: cat } = product
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const inStock = stock > 0
  const formattedPrice = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price)

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/product/${id}`} className="card group flex flex-col overflow-hidden block">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-surface-muted to-gray-100 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">{getCategoryIcon(cat?.name)}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {!inStock && (
            <span className="badge bg-gray-900/80 text-white text-[10px] backdrop-blur-sm">หมด</span>
          )}
          {inStock && stock <= 5 && (
            <span className="badge bg-accent-amber/90 text-white text-[10px] backdrop-blur-sm">เหลือ {stock}</span>
          )}
        </div>

        {/* Category */}
        {cat && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-white/90 text-ink text-[10px] backdrop-blur-sm shadow-sm">{cat.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-ink text-sm line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors leading-snug">
          {name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <p className="font-display font-bold text-brand-600 text-base">{formattedPrice}</p>
            <p className="text-xs text-gray-400">
              {inStock ? `คงเหลือ ${stock} ชิ้น` : 'สินค้าหมด'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              added
                ? 'bg-green-500 text-white'
                : inStock
                ? 'bg-brand-50 text-brand-700 group-hover:bg-brand-500 group-hover:text-white hover:scale-105'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? 'เพิ่มแล้ว' : inStock ? 'เพิ่มลงตะกร้า' : 'หมด'}
          </button>
        </div>
      </div>
    </Link>
  )
}
