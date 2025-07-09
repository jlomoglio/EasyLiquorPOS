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
  { label: "December", value: "12" }
]

export default function TopSellingProductsCard() {
  const [topProducts, setTopProducts] = useState([])
  const [month, setMonth] = useState("04")
  const [year] = useState("2025")

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchData()
  }, [month])

  async function fetchData() {
    try {
      const res = await apiFetch(`/api/get_top_selling_products/${year}/${month}`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setTopProducts(res.products || [])
    } catch (err) {
      console.error("Failed to fetch top selling products:", err.message)
    }
  }

  return (
    <div className="bg-[#F9FAFB] shadow-xl rounded-lg p-4 border border-gray-300 w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-md font-semibold text-gray-700">
          Top Selling Products ({months.find(m => m.value === month)?.label})
        </h2>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-0"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {topProducts.length === 0 ? (
        <div className="text-sm text-gray-500">No products found.</div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-4 mr-[15px]">
            {topProducts.map((p, i) => (
              <li key={i} className="py-2">
                <div className="flex justify-between text-sm">
                  <div>
                    {i + 1}. {p.product_name} {p.volume ? `(${p.volume})` : ''}
                  </div>
                  <div className="font-mono text-right">
                    {p.total_quantity_sold} sold / ${parseFloat(p.total_revenue).toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <BarChart
            xAxis={[{ scaleType: "band", data: topProducts.map(p => p.product_name) }]}
            series={[{ data: topProducts.map(p => p.total_quantity_sold), label: "Qty Sold" }]}
            height={200}
          />
        </>
      )}
    </div>
  )
}

