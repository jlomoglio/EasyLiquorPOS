import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import dayjs from "dayjs"

export default function StaleInventoryCard() {
  const [items, setItems] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await apiFetch(`/api/inventory_stale`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setItems(res.items || [])
    } catch (err) {
      console.error("❌ Failed to fetch stale inventory:", err.message)
    }
  }

  return (
    <div className="bg-[#F9FAFB] shadow-lg rounded-md p-4 border border-gray-300 w-full">
      <h2 className="text-md font-semibold text-gray-700 mb-3">
        Stale Inventory (No Sales in Last 60 Days)
      </h2>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No stale inventory.</div>
      ) : (
        <div className="h-[250px] overflow-y-auto pr-2">
          <ul className="divide-y divide-gray-200 text-sm pr-2">
            {items.map((item, i) => (
              <li key={item.id} className="py-2">
                <div className="flex justify-between">
                  <div className="text-gray-800">
                    {item.name} {item.volume ? `(${item.volume})` : ""}
                  </div>
                  <div className="text-gray-500 font-mono">
                    Last sold: {item.last_sold ? dayjs(item.last_sold).format("MMM D") : "Never"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
