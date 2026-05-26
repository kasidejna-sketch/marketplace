import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useCategories } from '../hooks/useData'
import ProductCard, { ProductSkeleton } from '../components/ui/ProductCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  const { data: categories } = useCategories()
  const { data: products, loading } = useProducts({
    search: debouncedQuery,
    categoryId: selectedCategory || undefined,
    limit: 40,
  })

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  // Sync URL
  useEffect(() => {
    const params = {}
    if (debouncedQuery) params.q = debouncedQuery
    if (selectedCategory) params.cat = selectedCategory
    setSearchParams(params, { replace: true })
  }, [debouncedQuery, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Search header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6">
          {debouncedQuery ? `ผลการค้นหา: "${debouncedQuery}"` : 'สินค้าทั้งหมด'}
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า..."
              className="input pl-10"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">หมวดหมู่ทั้งหมด</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              !selectedCategory ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === String(cat.id)
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-6">
          พบ <span className="text-ink font-semibold">{products.length}</span> รายการ
        </p>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          : products.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-xl text-ink mb-2">ไม่พบสินค้า</h3>
          <p className="text-gray-400">
            {debouncedQuery
              ? `ไม่พบสินค้าที่ตรงกับ "${debouncedQuery}"`
              : 'ยังไม่มีสินค้าในหมวดหมู่นี้'
            }
          </p>
          <button
            onClick={() => { setQuery(''); setSelectedCategory('') }}
            className="btn-secondary mt-6"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  )
}
