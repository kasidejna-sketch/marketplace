import { useParams, Link } from 'react-router-dom'
import { useCategory, useProducts, useCategories } from '../hooks/useData'
import ProductCard, { ProductSkeleton } from '../components/ui/ProductCard'
import CategoryCard from '../components/ui/CategoryCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const { data: category, loading: catLoading } = useCategory(slug)
  const { data: products, loading: prodLoading } = useProducts({
    categoryId: category?.id,
    limit: 40,
  })
  const { data: categories } = useCategories()

  if (catLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="skeleton h-10 w-64 mb-4 rounded-xl" />
        <div className="skeleton h-5 w-48 mb-10 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!catLoading && !category) {
    return (
      <div className="text-center py-32">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">ไม่พบหมวดหมู่</h2>
        <Link to="/" className="btn-primary mt-4">กลับหน้าหลัก</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">หน้าหลัก</Link>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-ink">{category?.name}</span>
      </nav>

      {/* Category header */}
      <div className="bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl p-8 mb-10 text-white">
        <h1 className="font-display text-3xl font-bold mb-2">{category?.name}</h1>
        {category?.description && (
          <p className="text-brand-100 text-sm">{category.description}</p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <span className="badge bg-white/20 text-white text-xs backdrop-blur-sm">
            {prodLoading ? '...' : products.length} สินค้า
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: other categories */}
        <aside className="lg:w-56 shrink-0">
          <h3 className="font-semibold text-ink text-sm mb-3">หมวดหมู่อื่น</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {categories.filter(c => c.slug !== slug).slice(0, 6).map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {prodLoading
              ? Array(9).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : products.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>

          {!prodLoading && products.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-400">ยังไม่มีสินค้าในหมวดหมู่นี้</p>
              <Link to="/search" className="btn-primary mt-4">ดูสินค้าทั้งหมด</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
