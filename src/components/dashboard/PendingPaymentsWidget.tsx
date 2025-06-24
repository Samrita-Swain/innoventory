'use client'

import { motion } from 'framer-motion'
import { IndianRupee, AlertTriangle, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PendingPaymentItem {
  id: string
  invoiceNumber: string
  orderReferenceNumber: string
  imageUrl?: string
  daysLeft: number
  amount: number
  currency: string
  customerName: string
}

interface PendingPaymentsWidgetProps {
  data: PendingPaymentItem[]
  onItemClick?: (orderReferenceNumber: string) => void
  onViewAll?: () => void
  title?: string
}

const PendingPaymentsWidget = ({
  data,
  onItemClick,
  onViewAll,
  title = "Pending Payments Overview"
}: PendingPaymentsWidgetProps) => {

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-600 font-bold'
    if (daysLeft <= 7) return 'text-orange-600 font-semibold'
    if (daysLeft <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDaysLeftIcon = (daysLeft: number) => {
    if (daysLeft <= 3) return <AlertTriangle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <IndianRupee className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <IndianRupee className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No pending payments</p>
          </div>
        ) : (
          data.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onItemClick?.(item.orderReferenceNumber)}
            >
              <div className="flex items-center space-x-4">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0">
                  {item.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt="Invoice"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">Invoice:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.invoiceNumber}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">Order:</span>
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {item.orderReferenceNumber}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </div>

                  <p className="text-xs text-gray-600 truncate">
                    Customer: {item.customerName}
                  </p>
                </div>

                {/* Amount and Days */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDaysLeftIcon(item.daysLeft)}
                      <span className={`text-sm ${getDaysLeftColor(item.daysLeft)}`}>
                        {item.daysLeft} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {onViewAll && data.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewAll}
          className="w-full mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
        >
          View All Pending Payments
        </motion.button>
      )}

      {/* Summary */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Pending:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.amount, 0),
                data[0]?.currency || 'INR'
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default PendingPaymentsWidget
