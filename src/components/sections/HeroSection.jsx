import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarketStats } from '../../hooks/useData'

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { stats } = useMarketStats()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const statItems = [
    { label: 'สินค้า', value: stats.products.toLocaleString(), suffix: '+' },
    { label: 'ผู้ขาย', value: stats.vendors.toLocaleString(), suffix: '+' },
    { label: 'ลูกค้า', value: stats.customers.toLocaleString(), suffix: '+' },
    { label: 'คำสั่งซื้อ', value: stats.orders.toLocaleString(), suffix: '+' },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-ink-muted text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            สินค้าคุณภาพ จัดส่งเร็ว ราคาดี
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-balance animate-fade-up">
            ช้อปสมาร์ท<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
              เลือกสินค้าดีที่สุด
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-10 leading-relaxed animate-fade-up animate-delay-100">
            มาร์เก็ตเพลสที่รวมสินค้าจากผู้ขายที่เชื่อถือได้<br className="hidden sm:block"/>
            ค้นหาง่าย สั่งซื้อสะดวก จัดส่งถึงบ้าน
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12 animate-fade-up animate-delay-200">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้า, หมวดหมู่..."
                className="w-full pl-11 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
              />
            </div>
            <button type="submit" className="btn-primary py-4 px-8 text-base whitespace-nowrap">
              ค้นหา
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-14 animate-fade-up animate-delay-300">
            {['สินค้าทั้งหมด', 'โปรโมชั่น', 'สินค้าใหม่', 'ขายดี'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${tag}`)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-brand-500/30 border border-white/15 rounded-full text-sm text-gray-300 hover:text-white transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up animate-delay-400">
            {statItems.map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="font-display font-bold text-2xl text-brand-300">
                  {s.value}{s.suffix}
                </p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
