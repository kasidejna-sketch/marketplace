const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'ซื้อปลอดภัย',
    desc: 'ระบบชำระเงินที่ปลอดภัยและน่าเชื่อถือ',
    color: 'text-brand-500 bg-brand-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'จัดส่งเร็ว',
    desc: 'ส่งสินค้าถึงบ้านคุณทั่วประเทศไทย',
    color: 'text-sky-500 bg-sky-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'คืนสินค้าง่าย',
    desc: 'นโยบายคืนสินค้าที่ยุติธรรม ภายใน 30 วัน',
    color: 'text-amber-500 bg-amber-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'บริการ 24/7',
    desc: 'ทีมซัพพอร์ตพร้อมช่วยเหลือตลอดเวลา',
    color: 'text-rose-500 bg-rose-50',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-12 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${f.color} shrink-0`}>
                {f.icon}
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">{f.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed hidden sm:block">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
