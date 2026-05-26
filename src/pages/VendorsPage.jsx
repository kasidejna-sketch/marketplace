import { useState } from 'react'
import { useVendors } from '../hooks/useData'
import VendorCard, { VendorSkeleton } from '../components/ui/VendorCard'

export default function VendorsPage() {
  const { data: vendors, loading } = useVendors({ limit: 50 })
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')

  const industries = [...new Set(vendors.map(v => v.industry).filter(Boolean))]

  const filtered = vendors.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = !industry || v.industry === industry
    return matchSearch && matchIndustry
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">พาร์ทเนอร์</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
          ผู้ขายทั้งหมด
        </h1>
        <p className="text-gray-500">บริษัทและผู้ค้าที่เข้าร่วมกับ SmartSale Marketplace</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อบริษัท..."
            className="input pl-10"
          />
        </div>
        {industries.length > 0 && (
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="input max-w-xs">
            <option value="">ทุกอุตสาหกรรม</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-6">
          พบ <span className="text-ink font-semibold">{filtered.length}</span> ผู้ขาย
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array(8).fill(0).map((_, i) => <VendorSkeleton key={i} />)
          : filtered.map(v => <VendorCard key={v.id} vendor={v} />)
        }
      </div>

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="font-display font-bold text-xl text-ink mb-2">ไม่พบผู้ขาย</h3>
          <p className="text-gray-400">ลองค้นหาด้วยคำอื่น</p>
          <button onClick={() => { setSearch(''); setIndustry('') }} className="btn-secondary mt-4">
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  )
}
