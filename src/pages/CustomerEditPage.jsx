import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import AddressSelector from '../components/sections/AddressSelector'
import { getCustomerById, updateCustomerById } from '../hooks/useData'

export default function CustomerEditPage() {
    const { customerId } = useCart()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [data, setData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
    })

    useEffect(() => {
        if (!customerId) return
        setLoading(true)
            ; (async () => {
                try {
                    const { data: customer, error } = await getCustomerById(customerId)

                    if (error) throw error

                    setData({
                        email: customer.email || '',
                        first_name: customer.first_name || '',
                        last_name: customer.last_name || '',
                        phone: customer.phone || '',
                    })
                } catch (e) {
                    console.error('[Customer] Failed to load:', e)
                } finally {
                    setLoading(false)
                }
            })()
    }, [customerId])

    const handleChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!customerId) return

        // basic validation
        if (!data.first_name.trim() || !data.last_name.trim() || !data.email.trim()) {
            alert('กรุณากรอกชื่อหรืออีเมลให้ครบถ้วน')
            return
        }

        setSaving(true)
        try {
            const { data: updated, error } = await updateCustomerById(customerId, {
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
            })

            if (error) throw error

            alert('บันทึกข้อมูลลูกค้าสำเร็จ')
            setData(prev => ({ ...prev }))
        } catch (e) {
            console.error('[Customer] Failed to save:', e)
            alert('เกิดข้อผิดพลาดขณะบันทึก: ' + (e.message || e))
        } finally {
            setSaving(false)
        }
    }

    if (!customerId) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="font-display text-2xl font-bold text-ink mb-4">แก้ไขข้อมูลผู้ใช้</h1>
                <div className="card p-6">
                    <p className="text-sm text-gray-600">กรุณาล็อกอินก่อนเพื่อแก้ไขข้อมูลลูกค้า</p>
                    <Link to="/" className="mt-4 inline-block text-brand-600">กลับหน้าแรก</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="font-display text-2xl font-bold text-ink mb-6">แก้ไขข้อมูลผู้ใช้</h1>

            <div className="card p-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-2">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-ink mb-2">ชื่อ</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={data.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-ink mb-2">นามสกุล</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={data.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-ink mb-2">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700"
                                    disabled={saving}
                                >
                                    ย้อนกลับ
                                </button>
                                <button
                                    type="submit"
                                    className="ml-auto px-4 py-3 bg-brand-500 text-white rounded-lg font-semibold"
                                    disabled={saving}
                                >
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </form>

                        {/* Address management (same as cart) */}
                        <div className="mt-6">
                            <AddressSelector />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
