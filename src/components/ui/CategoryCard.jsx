import { Link } from 'react-router-dom'

const CATEGORY_THEMES = [
  { bg: 'from-emerald-400 to-teal-500', text: 'text-white', emoji: '📦' },
  { bg: 'from-blue-400 to-indigo-500', text: 'text-white', emoji: '💎' },
  { bg: 'from-amber-400 to-orange-500', text: 'text-white', emoji: '⚡' },
  { bg: 'from-rose-400 to-pink-500', text: 'text-white', emoji: '✨' },
  { bg: 'from-violet-400 to-purple-500', text: 'text-white', emoji: '🌟' },
  { bg: 'from-cyan-400 to-sky-500', text: 'text-white', emoji: '🔮' },
]

export default function CategoryCard({ category, index = 0 }) {
  const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length]

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 block"
    >
      <div className={`bg-gradient-to-br ${theme.bg} p-5 h-28 flex flex-col justify-between`}>
        {/* Decorative circle */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
        <div className="absolute -right-2 top-8 w-10 h-10 bg-white/10 rounded-full" />

        <span className="text-2xl z-10 relative">{theme.emoji}</span>

        <div className="z-10 relative">
          <h3 className={`font-display font-bold text-sm ${theme.text} line-clamp-1`}>
            {category.name}
          </h3>
          {category.product_count > 0 && (
            <p className={`text-xs ${theme.text} opacity-80 mt-0.5`}>
              {category.product_count} สินค้า
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export function CategorySkeleton() {
  return <div className="skeleton h-28 rounded-2xl" />
}
