import { Link } from 'react-router-dom'
import { useVendors } from '../../hooks/useData'
import VendorCard, { VendorSkeleton } from '../ui/VendorCard'

export default function VendorsSection() {
  const { data: vendors, loading } = useVendors({ limit: 4 })

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">ผู้ขาย</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
              ผู้ขายที่น่าเชื่อถือ
            </h2>
            <p className="text-gray-500 text-sm mt-1">บริษัทและผู้ค้าที่ผ่านการคัดสรร</p>
          </div>
          <Link to="/vendors" className="btn-ghost hidden sm:flex">ดูผู้ขายทั้งหมด →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <VendorSkeleton key={i} />)
            : vendors.map(v => <VendorCard key={v.id} vendor={v} />)
          }
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link to="/vendors" className="btn-ghost">ดูผู้ขายทั้งหมด →</Link>
        </div>
      </div>
    </section>
  )
}
