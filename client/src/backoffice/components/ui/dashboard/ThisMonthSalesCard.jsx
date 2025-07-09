import { useState, useEffect, useRef } from "react"
import { apiFetch } from "../../../../utils/api"
import { EllipsisVertical, X } from "lucide-react"
import DateGroup from "../forms/DateGroup"
import SalesComparisonIcon from "./SalesComparisonIcon"

export default function ThisMonthSalesCard() {
    const [popup, setPopup] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState("")
    const [sales, setSales] = useState(null)
    const [cash, setCash] = useState(null)
    const [card, setCard] = useState(null)
    const [profit, setProfit] = useState(null)
    const [comparison, setComparison] = useState(null)
    const [cashTx, setCashTx] = useState(null)
    const [cardTx, setCardTx] = useState(null)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    const menuRef = useRef(null)

    useEffect(() => {
        const now = new Date()
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        setSelectedMonth(monthStr)
        fetchData(monthStr)
    }, [])

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setPopup(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [popup])

    function handleSelectedMonth(dateStr) {
        const date = new Date(dateStr + "T00:00:00")
        if (isNaN(date)) return

        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(formatted)
        setPopup(false)
        fetchData(formatted)
    }

    async function fetchData(month) {
        const [year, m] = month.split("-")
        try {
            const [summary, profitRes, compareRes, txRes] = await Promise.all([
                apiFetch(`/api/get_sales_summary_by_month/${year}/${m}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_sales_profit_by_month/${year}/${m}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_sales_comparison_by_month/${year}/${m}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                }),
                apiFetch(`/api/get_transaction_counts_by_month/${year}/${m}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                })
            ])

            setSales(formatCurrency(summary.total_sales))
            setCash(formatCurrency(summary.total_cash_sales))
            setCard(formatCurrency(summary.total_credit_sales))
            setProfit(formatCurrency(profitRes.profit_amount ?? 0))
            setComparison(compareRes.percentage_change ?? 0)
            setCashTx(txRes.total_cash_transactions ?? 0)
            setCardTx(txRes.total_credit_transactions ?? 0)
        } catch (err) {
            console.error("❌ Error loading month data:", err.message)
        }
    }

    function formatCurrency(value) {
        return parseFloat(value ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    function formatMonthDisplay(monthStr) {
        const [year, month] = monthStr.split("-")
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        return `${monthNames[parseInt(month, 10) - 1]} ${year}`
    }

    return (
        <div className="w-full p-4.5 bg-[#f5f5f5] border border-gray-300 rounded-xl shadow-md relative">
            {/* Title + Comparison */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-600">MONTH: {formatMonthDisplay(selectedMonth)}</h2>
                <div className="pr-[25px]">
                    <SalesComparisonIcon percentage={comparison} />
                </div>
            </div>

            {/* Ellipsis Button + Picker */}
            <div className="absolute top-3 right-3">
                <EllipsisVertical
                    size={20}
                    strokeWidth={3}
                    className="cursor-pointer text-gray-600"
                    onClick={() => setPopup(true)}
                />
                {popup && (
                    <div ref={menuRef} className="absolute top-[15px] right-0 w-[380px] border border-gray-300 rounded-xl shadow-md z-[100] bg-white flex flex-col text-left p-3">
                        <X 
                            size={20}
                            strokeWidth={3}
                            className="cursor-pointer text-gray-600 absolute top-[15px] right-[15px]"
                            onClick={() => setPopup(false)}
                        />
                        <div className="font-medium mb-2">Select a month</div>
                        <DateGroup type="month" onChange={handleSelectedMonth} />
                    </div>
                )}
            </div>

            {/* Total Sales */}
            <div className="text-[2rem] text-[#5a5a5a] font-bold">${sales}</div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-4 text-center text-[#1F2937] mt-3">
                <div>
                    <div className="text-xs text-gray-500">CASH</div>
                    <div className="text-lg font-semibold text-gray-700">${cash}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{cashTx}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">CARD</div>
                    <div className="text-lg font-semibold text-gray-700">${card}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{cardTx}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">PROFIT</div>
                    <div className="text-lg font-semibold text-gray-700">${profit}</div>
                </div>
            </div>
        </div>
    )
}
