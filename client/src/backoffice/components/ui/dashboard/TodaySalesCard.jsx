// APPLICATION DEPENDENCIES
import { useState, useEffect, useRef } from "react"
import { apiFetch } from "../../../../utils/api"

// LUCIDE ICONS
import { EllipsisVertical, X } from "lucide-react"

// COMPONENTS
import DateGroup from "../forms/DateGroup"
import SalesComparisonIcon from "./SalesComparisonIcon"

export default function TodaySalesCard() {
    const [salesTodayPopup, setSalesTodayPopup] = useState(false)
    const [salesSelectedDay, setSalesSelectedDay] = useState("")
    const [todaySalesAmount, setTodaySalesAmount] = useState(null)
    const [todayCashSalesAmount, setTodayCashSalesAmount] = useState(null)
    const [todayCreditSalesAmount, setTodayCreditSalesAmount] = useState(null)
    const [todaySalesProfitAmount, setTodaySalesProfitAmount] = useState(null)
    const [todaySalesComparison, setTodaySalesComparison] = useState(null)
    const [todayCashTransactions, setTodayCashTransactions] = useState(null)
    const [todayCreditTransactions, setTodayCreditTransactions] = useState(null)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    const menuRef = useRef(null)

    useEffect(() => {
        const today = new Date()
        const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        setSalesSelectedDay(formatted)
        getTodayData(formatted)
    }, [])

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setSalesTodayPopup(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [salesTodayPopup])

    function handleSelectedDay(dateStr) {
        const date = new Date(dateStr + "T00:00:00")
        if (isNaN(date)) return

        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        setSalesSelectedDay(formatted)
        setSalesTodayPopup(false)
        getTodayData(formatted)
    }

    async function getTodayData(date) {
        try {
            const [sales, profit, compare, tx] = await Promise.all([
                apiFetch(`/api/get_sales_summary_by_today/${date}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_sales_profit_by_today/${date}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_sales_comparison_by_today/${date}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_transaction_counts_by_today/${date}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                })
            ])

            setTodaySalesAmount(formatCurrency(sales.total_sales))
            setTodayCashSalesAmount(formatCurrency(sales.total_cash_sales))
            setTodayCreditSalesAmount(formatCurrency(sales.total_credit_sales))
            setTodaySalesProfitAmount(formatCurrency(profit.profit_amount ?? 0))
            setTodaySalesComparison(compare.percentage_change ?? 0)
            setTodayCashTransactions(tx.today_cash_transactions ?? 0)
            setTodayCreditTransactions(tx.today_credit_transactions ?? 0)

        } catch (err) {
            console.error("❌ Error loading today’s data:", err.message)
        }
    }

    function formatCurrency(value) {
        return parseFloat(value ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <div className="w-full p-4.5 bg-[#f5f5f5] border border-gray-300 rounded-xl shadow-md relative">
            {/* Title + Comparison */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-600">
                    {(() => {
                        const [y, m, d] = salesSelectedDay.split("-")
                        const display = `${m}-${d}-${y}`
                        const today = new Date()
                        const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                        return salesSelectedDay === formattedToday ? `TODAY: ${display}` : `SALES FOR: ${display}`
                    })()}
                </h2>
                <div className="pr-[25px]">
                    <SalesComparisonIcon percentage={todaySalesComparison} />
                </div>
            </div>

            {/* Ellipsis Button + Date Picker */}
            <div className="absolute top-3 right-3">
                <EllipsisVertical
                    size={20}
                    strokeWidth={3}
                    className="cursor-pointer text-gray-600"
                    onClick={() => setSalesTodayPopup(true)}
                />
                {salesTodayPopup && (
                    <div ref={menuRef} className="absolute top-[15px] right-0 w-[380px] border border-gray-300 rounded-xl shadow-md z-[100] bg-white flex flex-col text-left p-3">
                        <X 
                            size={20}
                            strokeWidth={3}
                            className="cursor-pointer text-gray-600 absolute top-[15px] right-[15px]"
                            onClick={() => setSalesTodayPopup(false)}
                        />
                        <div className="font-medium mb-2">Select a day</div>
                        <DateGroup onChange={handleSelectedDay} />
                    </div>
                )}
            </div>

            {/* Total Amount */}
            <div className="text-[2rem] text-[#5a5a5a] font-bold">${todaySalesAmount}</div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-4 text-center text-[#1F2937] mt-3">
                <div>
                    <div className="text-xs text-gray-500">CASH</div>
                    <div className="text-lg font-semibold text-gray-700">${todayCashSalesAmount}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{todayCashTransactions}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">CARD</div>
                    <div className="text-lg font-semibold text-gray-700">${todayCreditSalesAmount}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{todayCreditTransactions}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">PROFIT</div>
                    <div className="text-lg font-semibold text-gray-700">${todaySalesProfitAmount}</div>
                </div>
            </div>
        </div>
    )
}
