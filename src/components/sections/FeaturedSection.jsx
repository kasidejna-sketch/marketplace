import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useData'
import ProductCard, { ProductSkeleton } from '../ui/ProductCard'

export default function FeaturedSection() {
  const { data: products, loading } = useProducts({ limit: 8 })

  return (
    <section className="py-16 bg-surface-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">สินค้าแนะนำ</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
              สินค้ายอดนิยม
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              สินค้าคุณภาพดี คัดสรรมาเพื่อคุณ
            </p>
          </div>
          <Link to="/search" className="btn-secondary hidden sm:flex text-sm">
            ดูสินค้าทั้งหมด
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : products.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400">ยังไม่มีสินค้า</p>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden mt-6 text-center">
          <Link to="/search" className="btn-secondary">ดูสินค้าทั้งหมด</Link>
        </div>
      </div>
    </section>
  )
}
