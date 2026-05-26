import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useData'

export default function Footer() {
  const { data: categories } = useCategories()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-gray-400 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white">SmartSale</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              มาร์เก็ตเพลสคุณภาพ เชื่อมผู้ซื้อกับผู้ขาย<br/>ที่ผ่านการคัดสรรแล้ว
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'line'].map(s => (
                <a key={s} href="#" className="w-9 h-9 bg-ink-muted hover:bg-brand-600 rounded-xl flex items-center justify-center transition-colors" aria-label={s}>
                  <div className="w-4 h-4 bg-gray-400 rounded-sm opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">หมวดหมู่</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm hover:text-brand-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">บริการ</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['/', 'หน้าหลัก'],
                ['/search', 'ค้นหาสินค้า'],
                ['/vendors', 'ผู้ขาย'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-brand-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@smartsale.th</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>02-XXX-XXXX</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>กรุงเทพมหานคร, ประเทศไทย</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-ink-muted pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {year} SmartSale Marketplace. สงวนลิขสิทธิ์ทุกประการ.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-400 transition-colors">นโยบายความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-gray-400 transition-colors">เงื่อนไขการใช้งาน</a>
            <a href="#" className="hover:text-gray-400 transition-colors">คุกกี้</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
