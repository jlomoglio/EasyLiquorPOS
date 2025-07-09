import { ArrowDown, ArrowUp } from 'lucide-react'

export default function InventoryTrendIndicator({ percentage }) {
  const isPositive = parseFloat(percentage) >= 0
  const iconClass = isPositive ? "text-green-600" : "text-red-600"
  const Icon = isPositive ? ArrowUp : ArrowDown

  return (
    <div className={`flex items-center text-xl font-semibold ${iconClass}`}>
      <Icon size={20} className="mr-1" />
      {Math.abs(percentage)}%
    </div>
  )
}
