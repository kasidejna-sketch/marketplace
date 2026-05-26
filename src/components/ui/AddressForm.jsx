import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function AddressForm({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    loading = false,
}) {
    const [formData, setFormData] = useState({
        label: '',
        address_type: 'shipping',
        recipient_name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        tax_id: '',
        is_default: false,
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            setFormData({
                label: '',
                address_type: 'shipping',
                recipient_name: '',
                phone: '',
                address_line_1: '',
                address_line_2: '',
                subdistrict: '',
                district: '',
                province: '',
                postal_code: '',
                tax_id: '',
                is_default: false,
            })
        }
    }, [initialData, isOpen])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.recipient_name.trim()) {
            alert('กรุณากรอกชื่อผู้รับ')
            return
        }
        if (!formData.phone.trim()) {
            alert('กรุณากรอกเบอร์โทรศัพท์')
            return
        }
        if (!formData.address_line_1.trim()) {
            alert('กรุณากรอกที่อยู่')
            return
        }
        if (!formData.province.trim()) {
            alert('กรุณากรอกจังหวัด')
            return
        }

        await onSubmit(formData)
        handleClose()
    }

    const handleClose = () => {
        setFormData({
            label: '',
            address_type: 'shipping',
            recipient_name: '',
            phone: '',
            address_line_1: '',
            address_line_2: '',
            subdistrict: '',
            district: '',
            province: '',
            postal_code: '',
            tax_id: '',
            is_default: false,
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-ink">
                        {initialData ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type and Label Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                ประเภทที่อยู่ *
                            </label>
                            <select
                                name="address_type"
                                value={formData.address_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="shipping">📍 ที่อยู่จัดส่ง</option>
                                <option value="billing">💳 ที่อยู่วางบิล</option>
                                <option value="office">🏢 สำนักงาน</option>
                                <option value="other">📌 อื่น ๆ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                ป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)
                            </label>
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleChange}
                                placeholder="เช่น บ้านหลัก"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Recipient Name and Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                ชื่อผู้รับ *
                            </label>
                            <input
                                type="text"
                                name="recipient_name"
                                value={formData.recipient_name}
                                onChange={handleChange}
                                placeholder="ชื่อและนามสกุล"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                เบอร์โทรศัพท์ *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="089-1234-5678"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                            ที่อยู่ *
                        </label>
                        <input
                            type="text"
                            name="address_line_1"
                            value={formData.address_line_1}
                            onChange={handleChange}
                            placeholder="เลขที่, ถนน"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                            ที่อยู่ (ต่อ)
                        </label>
                        <input
                            type="text"
                            name="address_line_2"
                            value={formData.address_line_2}
                            onChange={handleChange}
                            placeholder="หมู่บ้าน, อาคาร, ห้อง (ไม่บังคับ)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Subdistrict, District, Province */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                แขวง/ตำบล
                            </label>
                            <input
                                type="text"
                                name="subdistrict"
                                value={formData.subdistrict}
                                onChange={handleChange}
                                placeholder="แขวง/ตำบล"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                เขต/อำเภอ
                            </label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="เขต/อำเภอ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                จังหวัด *
                            </label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                placeholder="จังหวัด"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Postal Code and Tax ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                รหัสไปรษณีย์
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="10100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-2">
                                เลขประจำตัวผู้เสียภาษี (สำหรับบิล)
                            </label>
                            <input
                                type="text"
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleChange}
                                placeholder="1234567890123"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="w-4 h-4 text-brand-500 rounded"
                        />
                        <label htmlFor="is_default" className="text-sm font-medium text-ink cursor-pointer">
                            ❤️ ตั้งเป็นที่อยู่เริ่มต้น
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มที่อยู่'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

AddressForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    loading: PropTypes.bool,
}
