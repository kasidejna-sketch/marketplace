import { useState } from 'react'
import { useLineAuth } from '../context/LineAuthContext'
import { useOrders } from '../hooks/useData'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}

function getStatusBadge(status) {
  const statusMap = {
    pending: { label: 'รอดำเนินการ', class: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'ยืนยันแล้ว', class: 'bg-blue-100 text-blue-800' },
    processing: { label: 'กำลังจัดเตรียม', class: 'bg-indigo-100 text-indigo-800' },
    shipped: { label: 'จัดส่งแล้ว', class: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'ส่งถึงแล้ว', class: 'bg-green-100 text-green-800' },
    cancelled: { label: 'ยกเลิก', class: 'bg-red-100 text-red-800' },
  }
  const s = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' }
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${s.class}`}>{s.label}</span>
}

export default function OrdersPage() {
  const { user, loading: authLoading, login, isLoggedIn } = useLineAuth()
  const { data: orders, loading: ordersLoading, error, refetch } = useOrders(user?.userId)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)

  const handleCancelOrder = async (orderId) => {
    if (!confirm('คุณต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?')) return

    setCancellingOrderId(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)

      if (error) throw error
      
      // Refetch orders to update the list
      if (refetch) refetch()
    } catch (e) {
      console.error('[Orders] Failed to cancel order:', e)
      alert('ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-ink mb-3">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</h1>
          <p className="text-gray-500 mb-8">กรุณาเข้าสู่ระบบด้วย LINE เพื่อดูประวัติการสั่งซื้อของคุณ</p>
          <button
            onClick={login}
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#00B900] text-white font-medium rounded-2xl hover:bg-[#00A000] transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            เข้าสู่ระบบด้วย LINE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* User Header */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-brand-50 rounded-2xl">
        {user.pictureUrl ? (
          <img src={user.pictureUrl} alt={user.displayName} className="w-14 h-14 rounded-full" />
        ) : (
          <div className="w-14 h-14 bg-brand-200 rounded-full flex items-center justify-center">
            <span className="text-brand-600 text-xl font-bold">{user.displayName?.[0] || 'U'}</span>
          </div>
        )}
        <div>
          <p className="font-medium text-ink">{user.displayName}</p>
          <p className="text-sm text-gray-500">LINE User</p>
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-ink mb-6">ประวัติคำสั่งซื้อ</h1>

      {ordersLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">กำลังโหลดคำสั่งซื้อ...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">ยังไม่มีคำสั่งซื้อ</p>
          <p className="text-gray-400 text-sm mb-6">เริ่มช้อปปิ้งเลย!</p>
          <Link to="/" className="btn-primary">
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">คำสั่งซื้อ #{order.order_number?.slice(0, 8) || '-'}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="p-4">
                {order.order_items?.length > 0 ? (
                  <div className="space-y-3">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-14 h-14 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink truncate">{item.products?.name || 'สินค้า'}</p>
                          <p className="text-sm text-gray-500">
                            จำนวน: {item.quantity} ชิ้น
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">ไม่มีรายการสินค้า</p>
                )}
              </div>

              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <span className="text-gray-600">ยอดรวม</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-brand-600">{formatCurrency(order.total || 0)}</span>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingOrderId === order.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำสั่งซื้อ'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
