import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import { AlertTriangle } from "lucide-react"

export default function LowStockAlertsCard() {
  const [lowStockItems, setLowStockItems] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchLowStock()
  }, [])

  async function fetchLowStock() {
    try {
      const res = await apiFetch("/api/low_stock_alerts", {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setLowStockItems(res.items || [])
    } catch (err) {
      console.error("❌ Failed to fetch low stock alerts:", err.message)
    }
  }

  return (
    <div className="bg-[#F9FAFB] shadow-lg rounded-xl p-4 border border-gray-300 w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-md font-semibold text-gray-700">Low Stock Alerts</h2>
        <AlertTriangle className="text-yellow-500" size={22} />
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-sm text-gray-500">All products are sufficiently stocked.</div>
      ) : (
        <div className="h-[180px] overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200 text-sm">
            {lowStockItems.map((item, index) => (
                <li key={index} className="py-2 flex justify-between">
                <div>{item.name}</div>
                <div className="font-semibold text-red-600">{item.quantity} left</div>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  )
}
