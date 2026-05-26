import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useData'
import CategoryCard, { CategorySkeleton } from '../ui/CategoryCard'

export default function CategoriesSection() {
  const { data: categories, loading } = useCategories()

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">หมวดหมู่สินค้า</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
              เลือกตามหมวดหมู่
            </h2>
          </div>
          <Link to="/search" className="btn-ghost hidden sm:flex">
            ดูทั้งหมด →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading
            ? Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))
          }
        </div>

        {!loading && categories.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            ยังไม่มีหมวดหมู่ในขณะนี้
          </div>
        )}
      </div>
    </section>
  )
}
