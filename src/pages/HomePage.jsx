import HeroSection from '../components/sections/HeroSection'
import FeaturesSection from '../components/sections/FeaturesSection'
import CategoriesSection from '../components/sections/CategoriesSection'
import FeaturedSection from '../components/sections/FeaturedSection'
import VendorsSection from '../components/sections/VendorsSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedSection />
      <VendorsSection />

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            พร้อมเริ่มช้อปแล้วหรือยัง?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            ค้นพบสินค้าหลายร้อยรายการจากผู้ขายที่น่าเชื่อถือ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/search" className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-colors shadow-lg">
              เลือกดูสินค้า
            </a>
            <a href="/vendors" className="inline-flex items-center justify-center px-8 py-4 bg-brand-700/50 text-white font-semibold rounded-2xl hover:bg-brand-700 transition-colors border border-white/20">
              ดูผู้ขาย
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
