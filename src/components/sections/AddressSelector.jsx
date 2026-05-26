import { useState, useEffect } from 'react'
import { useAddress } from '../../context/AddressContext'
import AddressCard from '../ui/AddressCard'
import AddressForm from '../ui/AddressForm'

export default function AddressSelector() {
    const {
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    } = useAddress()

    const [formOpen, setFormOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const handleAddClick = () => {
        setEditingAddress(null)
        setFormOpen(true)
    }

    const handleEditClick = (address) => {
        setEditingAddress(address)
        setFormOpen(true)
    }

    const handleFormSubmit = async (formData) => {
        setSubmitting(true)
        try {
            if (editingAddress) {
                // Update existing address
                const result = await updateAddress(editingAddress.id, formData)
                if (!result.success) {
                    alert('เกิดข้อผิดพลาด: ' + result.error)
                }
            } else {
                // Add new address
                const result = await addAddress(formData)
                if (!result.success) {
                    alert('เกิดข้อผิดพลาด: ' + result.error)
                }
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteClick = async (addressId) => {
        if (window.confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) {
            const result = await deleteAddress(addressId)
            if (!result.success) {
                alert('เกิดข้อผิดพลาด: ' + result.error)
            }
        }
    }

    const handleSetDefault = async (addressId) => {
        const result = await setDefaultAddress(addressId)
        if (!result.success) {
            alert('เกิดข้อผิดพลาด: ' + result.error)
        }
    }

    return (
        <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-lg font-bold text-ink">📍 ที่อยู่จัดส่ง</h2>
                    <p className="text-xs text-gray-500 mt-1">เลือกที่อยู่สำหรับการจัดส่ง</p>
                </div>
                <button
                    onClick={handleAddClick}
                    disabled={loading}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                    + เพิ่มที่อยู่
                </button>
            </div>

            {/* Addresses List */}
            <div className="space-y-3">
                {loading && addresses.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">กำลังโหลดที่อยู่...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-8 bg-surface-muted rounded-lg">
                        <div className="text-3xl mb-2">📪</div>
                        <p className="text-gray-600 font-semibold mb-2">ยังไม่มีที่อยู่</p>
                        <p className="text-sm text-gray-500 mb-4">เพิ่มที่อยู่สำหรับการจัดส่งครั้งแรก</p>
                        <button
                            onClick={handleAddClick}
                            className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            + เพิ่มที่อยู่
                        </button>
                    </div>
                ) : (
                    addresses.map(address => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedAddressId === address.id}
                            onSelect={() => setSelectedAddressId(address.id)}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onSetDefault={handleSetDefault}
                        />
                    ))
                )}
            </div>

            {/* Address Form Modal */}
            <AddressForm
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false)
                    setEditingAddress(null)
                }}
                onSubmit={handleFormSubmit}
                initialData={editingAddress}
                loading={submitting}
            />
        </>
    )
}
