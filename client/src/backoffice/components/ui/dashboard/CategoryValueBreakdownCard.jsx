// COMPONENT: CategoryValueBreakdownCard.jsx
import { useEffect, useState } from "react"
import { PieChart } from "@mui/x-charts/PieChart"
import { apiFetch } from "../../../../utils/api"

export default function CategoryValueBreakdownCard() {
  const [data, setData] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await apiFetch("/api/inventory_category_breakdown", {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      const transformed = res.items.map((item, index) => ({
        id: index,
        value: item.total_value,
        label: item.category
      }))
      setData(transformed)
    } catch (err) {
      console.error("❌ Failed to fetch category breakdown:", err.message)
    }
  }

  return (
    <div className="bg-[#F9FAFB] shadow-lg rounded-md p-4 border border-gray-300 w-full">
      <h2 className="text-md font-semibold text-gray-700 mb-3">
        Category Value Breakdown
      </h2>

      {data.length === 0 ? (
        <div className="text-sm text-gray-500">No data available.</div>
      ) : (
        <div className="flex justify-center">
          <PieChart
            series={[{
              data,
              innerRadius: 20,
              outerRadius: 100,
              paddingAngle: 5,
              cornerRadius: 3,
              startAngle: 0,
              endAngle: 360,
            }]}
            height={250}
          />
        </div>
      )}
    </div>
  )
}