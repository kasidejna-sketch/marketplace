import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="font-display text-4xl font-bold text-ink mb-3">404</h1>
      <p className="text-xl text-gray-500 mb-2">ไม่พบหน้าที่คุณต้องการ</p>
      <p className="text-gray-400 text-sm mb-8">หน้านี้อาจถูกย้ายหรือไม่มีอยู่แล้ว</p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">กลับหน้าหลัก</Link>
        <Link to="/search" className="btn-secondary">ดูสินค้า</Link>
      </div>
    </div>
  )
}
