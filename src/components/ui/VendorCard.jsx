import { Link } from 'react-router-dom'

const INDUSTRY_COLORS = {
  default: 'from-gray-100 to-gray-200',
  tech: 'from-sky-50 to-blue-100',
  retail: 'from-brand-50 to-emerald-100',
  food: 'from-amber-50 to-orange-100',
  fashion: 'from-pink-50 to-rose-100',
  health: 'from-teal-50 to-cyan-100',
}

function getGradient(industry = '') {
  const i = industry.toLowerCase()
  if (i.includes('tech') || i.includes('it') || i.includes('software')) return INDUSTRY_COLORS.tech
  if (i.includes('retail') || i.includes('ค้าปลีก')) return INDUSTRY_COLORS.retail
  if (i.includes('food') || i.includes('อาหาร')) return INDUSTRY_COLORS.food
  if (i.includes('fashion') || i.includes('แฟชั่น')) return INDUSTRY_COLORS.fashion
  if (i.includes('health') || i.includes('สุขภาพ')) return INDUSTRY_COLORS.health
  return INDUSTRY_COLORS.default
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??'
}

function VendorSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-12 h-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-3/4" />
      <div className="flex gap-2">
        <div className="skeleton h-7 w-20 rounded-lg" />
        <div className="skeleton h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export { VendorSkeleton }

export default function VendorCard({ vendor }) {
  const { name, industry, city, website, customer_count } = vendor
  const grad = getGradient(industry)

  return (
    <div className="card group p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 border border-white shadow-sm`}>
          <span className="font-display font-bold text-ink text-sm">{getInitials(name)}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-1">{industry || 'ธุรกิจทั่วไป'}</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-gray-500">
        {city && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{city}</span>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate" onClick={e => e.stopPropagation()}>
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-brand-400 rounded-full" />
          <span className="text-xs text-gray-500">{customer_count || 0} ลูกค้า</span>
        </div>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl hover:bg-brand-500 hover:text-white transition-all font-medium"
          >
            เว็บไซต์ →
          </a>
        )}
      </div>
    </div>
  )
}
