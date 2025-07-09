import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"

export default function OverstockWarningsCard() {
  const [overstockedItems, setOverstockedItems] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchOverstocked()
  }, [])

  async function fetchOverstocked() {
    try {
      const res = await apiFetch("/api/inventory_overstock", {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setOverstockedItems(res.items || [])
    } catch (err) {
      console.error("Failed to fetch overstock warnings:", err.message)
    }
  }

  return (
    <div className="bg-[#FEFCE8] border border-yellow-300 rounded-lg p-4 shadow w-full">
      <h2 className="text-md font-semibold text-yellow-800 mb-2">
        Overstock Warnings
      </h2>

      {overstockedItems.length === 0 ? (
        <div className="text-sm text-yellow-600">No overstock issues detected.</div>
      ) : (
        <div className="h-[180px] overflow-y-auto pr-2">
            <ul className="divide-y divide-yellow-200 text-sm text-yellow-900">
            {overstockedItems.slice(0, 6).map((item, index) => (
                <li key={index} className="py-1 flex justify-between">
                <span className="truncate w-[180px]">{item.name}</span>
                <span className="font-mono">{item.current_stock} in stock</span>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  )
}
