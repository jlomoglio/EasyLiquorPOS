import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import { TrendingUp, TrendingDown } from "lucide-react"
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart'

export default function InventoryValueCard() {
  const [inventoryValue, setInventoryValue] = useState(0)
  const [largestCategory, setLargestCategory] = useState({ name: '', value: 0 })
  const [categoryDistribution, setCategoryDistribution] = useState([])
  const [trend, setTrend] = useState(0)

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [valueRes, largestRes, trendRes, pieRes] = await Promise.all([
        apiFetch("/api/get_inventory_value", {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
        apiFetch("/api/get_largest_category_value", {
          headers: {
              'x-tenant-id': tenantId
          }
      }),
        apiFetch("/api/get_inventory_trend", {
          headers: {
              'x-tenant-id': tenantId
          }
      }),
        apiFetch("/api/get_category_distribution", {
          headers: {
              'x-tenant-id': tenantId
          }
      })
      ])

      setInventoryValue(valueRes.total_value || 0)
      setLargestCategory({
        name: largestRes.category || 'N/A',
        value: largestRes.total_value || 0
      })
      setTrend(trendRes.percentage_change || 0)
      setCategoryDistribution(pieRes.distribution || [])
    } catch (err) {
      console.error("❌ Failed to fetch inventory value data:", err.message)
    }
  }

  const kpiBox = "bg-[#f5f5f5] p-5 rounded-xl border border-gray-300 shadow-md h-full"
  const labelStyle = "text-xs text-gray-500"
  const valueStyle = "text-2xl font-bold text-gray-800"
  const subLabelStyle = "text-[0.7rem] text-gray-500 mt-1"
  const subValueStyle = "text-sm font-semibold text-gray-700"

  return (
    <div className={kpiBox}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className={labelStyle}>INVENTORY VALUE</div>
          <div className={valueStyle}>${parseFloat(inventoryValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="text-green-600" size={16} />
          ) : (
            <TrendingDown className="text-red-500" size={16} />
          )}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-2 items-center">
        <div>
          <div className={subLabelStyle}>LARGEST VALUE</div>
          <div className={subValueStyle}>{largestCategory.name} (${parseFloat(largestCategory.value).toLocaleString(undefined, { minimumFractionDigits: 2 })})</div>
        </div>
        <div className="flex justify-center">
          <PieChart
            series={[{
              data: categoryDistribution,
              arcLabel: d => `${d.label}`,
              innerRadius: 20,
              outerRadius: 40,
              paddingAngle: 2,
            }]}
            width={120}
            height={80}
            sx={{ [`.${pieArcLabelClasses.root}`]: { fontSize: 8 } }}
          />
        </div>
      </div>
    </div>
  )
}
