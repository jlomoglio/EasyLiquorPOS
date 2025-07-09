import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import { BarChart } from "@mui/x-charts/BarChart"

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
]

export default function SalesBreakdownChart() {
  const [month, setMonth] = useState("04")
  const [year] = useState("2025")
  const [salesData, setSalesData] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchData()
  }, [month, year])

  async function fetchData() {
    try {
      const res = await apiFetch(`/api/get_sales_by_category/${year}/${month}`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setSalesData(res.data || [])
    } catch (err) {
      console.error("❌ Failed to fetch sales by category:", err.message)
    }
  }

  return (
    <div className="p-5 bg-[#F9FAFB] border border-gray-300 rounded-xl shadow-md relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Category Sales ({months.find((m) => m.value === month)?.label})
        </h2>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-0"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {salesData.length === 0 ? (
        <div className="text-sm text-gray-500 h-[362px]">No sales data available.</div>
      ) : (
        <div className="ml-3">
          <BarChart
            xAxis={[{ scaleType: "band", data: salesData.map((c) => c.category) }]}
            series={[{ data: salesData.map((c) => c.total), label: "Sales ($)" }]}
            margin={{ left: 70, right: 20, top: 20, bottom: 40 }}
            height={354}
          />
        </div>
      )}
    </div>
  )
}
