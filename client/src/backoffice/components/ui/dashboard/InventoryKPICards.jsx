// FILE: InventoryKPICards.jsx

import { useEffect, useState } from "react"
import { apiFetch } from "../../../../utils/api"
import ViewProductsModal from "./ViewProductsModal"
import InventoryTrendIndicator from './InventoryTrendIndicator'
import { DollarSign, Tag, Beer } from "lucide-react"

export default function InventoryKPICards() {
    const [totalInventory, setTotalInventory] = useState(0)
    const [inventoryValue, setInventoryValue] = useState(0)
    const [inventoryUnits, setInventoryUnits] = useState(0)
    const [topCategory, setTopCategory] = useState({ name: "", count: 0 })
    const [largestCategory, setLargestCategory] = useState({ name: "", value: 0 })
    const [showModal, setShowModal] = useState(false)
    const [categoryProducts, setCategoryProducts] = useState([])
    const [trendData, setTrendData] = useState([])
    const [categoryDist, setCategoryDist] = useState([])
    const [inventoryChange, setInventoryChange] = useState(0)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        fetchInventoryStats()
    }, [])

    async function fetchInventoryStats() {
        try {
            const [inv, value, topCat, units, largest, trend, dist] = await Promise.all([
                apiFetch("/api/get_total_inventory", {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch("/api/get_inventory_value", {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch("/api/get_top_category", {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch("/api/get_total_units", {
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

            setTrendData(trend.trend || [])
            setCategoryDist(dist.categories || [])
            setTotalInventory(inv.total_inventory || 0)
            setInventoryValue(value.inventory_value || 0)
            setInventoryUnits(units.total_units || 0)
            setTopCategory({
                name: topCat.top_category || "",
                count: topCat.product_count || 0
            })
            setLargestCategory({
                name: largest.category || "",
                value: largest.total_value || 0
            })

            if (trend.trend?.length >= 2) {
                const start = trend.trend[0].value
                const end = trend.trend[trend.trend.length - 1].value
                const change = ((end - start) / start) * 100
                setInventoryChange(change.toFixed(2))
              }
        } catch (err) {
            console.error("❌ Error loading inventory KPI data:", err.message)
        }
    }

    const kpiBox = "bg-[#f5f5f5] p-5 rounded-xl border border-gray-300 shadow-md"
    const labelStyle = "text-xs text-gray-500"
    const valueStyle = "text-2xl font-bold text-gray-800"
    const subLabelStyle = "text-[0.7rem] text-gray-500 mt-1"
    const subValueStyle = "text-sm font-semibold text-gray-700"

    async function handleViewProducts() {
        try {
            const res = await apiFetch(`/api/get_products_by_category/${topCategory.name}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setCategoryProducts(res.products || [])
            setShowModal(true)
        } catch (err) {
            console.error("Failed to load category products:", err.message)
        }
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                {/* Total Inventory */}
                <div className={kpiBox + " relative"}>
                    <div className="grid grid-cols-2 gap-1 items-center">
                        <div>
                            <div className={labelStyle}>TOTAL INVENTORY</div>
                            <div className={valueStyle}>{totalInventory.toLocaleString()}</div>
                            <div className={subLabelStyle} style={{ marginTop: "10px" }}>TOTAL UNITS</div>
                            <div className={subValueStyle}>{inventoryUnits.toLocaleString()}</div>
                        </div>
                        <div>
                            <Beer size={102} className=" text-green-300" />
                        </div>
                    </div>
                </div>

                {/* Inventory Value */}
                <div className={kpiBox + " relative"}>
                    {/* Trend indicator */}
                    <div className="absolute top-3 right-3">
                        <InventoryTrendIndicator percentage={inventoryChange} />
                    </div>

                    {/* Side-by-side layout */}
                    <div className="grid grid-cols-2 gap-1 items-center">
                        <div>
                            <div className={labelStyle}>INVENTORY VALUE</div>
                            <div className={valueStyle}>${parseFloat(inventoryValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className={subLabelStyle} style={{ marginTop: "10px" }}>LARGEST VALUE</div>
                            <div className={subValueStyle}>
                                {largestCategory.name} (${parseFloat(largestCategory.value).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                            </div>
                        </div>
                        <div>
                            <DollarSign size={102} className=" text-orange-300" />
                        </div>
                    </div>
                </div>

                {/* Top Category */}
                <div className={kpiBox + " relative"}>
                    <div className="grid grid-cols-2 gap-1 items-center">
                        <div>
                            <div>
                                <div className={labelStyle}>TOP CATEGORY</div>
                                <div className={valueStyle}>{topCategory.name || "N/A"}</div>
                                <div className={subLabelStyle} style={{ marginTop: "10px" }}>PRODUCTS</div>
                                <div className={subValueStyle}>{topCategory.count}</div>
                            </div>
                            <div className="mt-3 text-xs text-blue-600 cursor-pointer hover:underline" onClick={handleViewProducts}>
                                View Products
                            </div>
                        </div>
                        <div>
                            <Tag size={102} className=" text-blue-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <ViewProductsModal category={topCategory.name} products={categoryProducts} onClose={() => setShowModal(false)} />
            )}
        </>
    )
}