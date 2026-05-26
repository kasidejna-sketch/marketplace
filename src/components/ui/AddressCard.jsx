import PropTypes from 'prop-types'

export default function AddressCard({
    address,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
}) {
    const addressTypeLabel = {
        shipping: '📍 จัดส่ง',
        billing: '💳 วางบิล',
        office: '🏢 สำนักงาน',
        other: '📌 อื่น ๆ',
    }

    return (
        <div
            onClick={onSelect}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Radio button */}
                <div className="mt-1">
                    <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                                ? 'border-brand-500 bg-brand-500'
                                : 'border-gray-300 bg-white'
                            }`}
                    >
                        {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Address details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-700">
                            {addressTypeLabel[address.address_type] || address.address_type}
                        </span>
                        {address.label && (
                            <span className="text-xs text-gray-600">{address.label}</span>
                        )}
                        {address.is_default && (
                            <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                ❤️ เริ่มต้น
                            </span>
                        )}
                    </div>

                    <div className="text-sm text-gray-900 font-semibold">
                        {address.recipient_name}
                    </div>

                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {address.address_line_1}
                        {address.address_line_2 && ` ${address.address_line_2}`}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                        {address.subdistrict && <span>{address.subdistrict}</span>}
                        {address.district && <span> {address.district}</span>}
                        {address.province && <span> {address.province}</span>}
                        {address.postal_code && <span> {address.postal_code}</span>}
                    </div>

                    {address.phone && (
                        <div className="text-xs text-gray-600 mt-1">{address.phone}</div>
                    )}

                    {address.tax_id && (
                        <div className="text-xs text-gray-500 mt-1">เลขประจำตัวผู้เสียภาษี: {address.tax_id}</div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(address)
                        }}
                        className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        aria-label="แก้ไข"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>

                    {!address.is_default && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onSetDefault(address.id)
                            }}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            aria-label="ตั้งเป็นค่าเริ่มต้น"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(address.id)
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="ลบ"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

AddressCard.propTypes = {
    address: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSetDefault: PropTypes.func.isRequired,
}
