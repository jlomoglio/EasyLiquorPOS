import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import { CircularProgress, Box, Typography } from "@mui/material"

function RatioGauge({ ratio }) {
  const MAX_RATIO = 200
  const clamped = Math.min(MAX_RATIO, parseFloat(ratio))
  const percent = (clamped / MAX_RATIO) * 100

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  // Color logic (optional polish)
  let ringColor = "#3B82F6" // default blue
  if (clamped < 50) ringColor = "#f97316" // orange
  else if (clamped >= 50 && clamped < 100) ringColor = "#facc15" // yellow
  else if (clamped >= 100 && clamped <= MAX_RATIO) ringColor = "#22c55e" // green

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={percent}
        size={200}
        thickness={5}
        style={{ color: ringColor }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h5" color="textPrimary">
          {ratio}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          times / month
        </Typography>
      </Box>
    </Box>
  )
}

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

export default function InventoryTurnoverRatioCard() {
  const [month, setMonth] = useState("03")
  const [year] = useState("2025")
  const [ratio, setRatio] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    async function fetchAll() {
      try {
        const [ratioRes, historyRes] = await Promise.all([
          apiFetch(`/api/inventory_turnover_ratio/${year}/${month}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        }),
          apiFetch(`/api/inventory_turnover_history/${year}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
        ])
  
        setRatio(parseFloat(ratioRes.ratio).toFixed(2))
  
        const filled = months.map((m) => {
          const found = historyRes.history.find(h => h.month === m.value)
          return {
            month: m.label.slice(0, 3),
            ratio: found ? Number(found.ratio) : 0
          }
        })
  
        console.log("✅ Setting new history:", filled)
        setHistory(filled)
      } catch (err) {
        console.error("❌ Fetch error:", err.message)
      }
    }
  
    fetchAll()
  }, [month, year])

  async function fetchCurrentRatio() {
    try {
      const res = await apiFetch(`/api/inventory_turnover_ratio/${year}/${month}`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setRatio(parseFloat(res.ratio).toFixed(2))
    } catch (err) {
      console.error("Failed to fetch inventory turnover ratio:", err.message)
    }
  }

  async function fetchHistory() {
    try {
      const res = await apiFetch(`/api/inventory_turnover_history/${year}`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
  
      const filled = months.map((m) => {
        const found = res.history.find(h => h.month === m.value)
        return {
          month: m.label.slice(0, 3),
          ratio: found ? Number(found.ratio) : 0
        }
      })
      
      setHistory(filled) // this will trigger re-render
    } 
    catch (err) {
      console.error("Failed to fetch turnover history:", err.message)
    }
  }

  return (
    <div className="bg-[#F9FAFB] shadow-lg rounded-md p-4 border border-gray-300 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-md font-semibold text-gray-700">
          Inventory Turnover Ratio
        </h2>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-0 focus:outline-none"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {ratio === null || history.length === 0 ? (
        <div className="text-sm text-gray-500">Loading ratio...</div>
      ) : (
        <>
          <div className="text-[2rem] text-blue-600 font-bold flex justify-center">
            <RatioGauge ratio={ratio} />
          </div>
          
        </>
      )}
    </div>
  )
}
