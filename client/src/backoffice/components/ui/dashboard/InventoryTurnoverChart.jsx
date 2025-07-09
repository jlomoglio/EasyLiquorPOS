import { BarChart } from "@mui/x-charts/BarChart"

export default function InventoryTurnoverChart({ history }) {
  return (
    <BarChart
        key={history.map(h => h.ratio).join('-')} // 👈 force remount on data change
        xAxis={[{ scaleType: 'band', data: history.map(h => h.month) }]}
        series={[{ data: history.map(h => h.ratio), color: "#2563eb" }]}
        height={150}
        margin={{ top: 20, bottom: 30, left: 30, right: 10 }}
    />
    
  )
}
