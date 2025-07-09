// DEPENDENCIES
import { useEffect, useState, useRef } from "react"
import SalesComparisonIcon from "./SalesComparisonIcon"
import { apiFetch } from "../../../../utils/api"
import { EllipsisVertical, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function TotalSalesCard() {
    const [salesTotolPopup, setSalesTotolPopup] = useState(false)
    const [salesSelectedYear, setSalesSelectedYear] = useState("")
    const [totalSalesAmount, setTotalSalesAmount] = useState(null)
    const [totalCashSalesAmount, setTotalCashSalesAmount] = useState(null)
    const [totalCreditSalesAmount, setTotalCreditSalesAmount] = useState(null)
    const [totalSalesProfitAmount , setTotalSalesProfitAmount] = useState(null)
    const [totalSalesComparison , setTotalSalesComparison] = useState(null)
    const [totalCashTransactions , setTotalCashTransactions] = useState(null)
    const [totalCreditTransactions , setTotalCreditTransactions] = useState(null)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // Handler for decrement/increment
    const decrementYear = () => {setSalesSelectedYear(salesSelectedYear - 1), handleSelectedYear(salesSelectedYear - 1)}
    const incrementYear = () => {setSalesSelectedYear(salesSelectedYear + 1), handleSelectedYear(salesSelectedYear + 1)}

    const menuRef = useRef(null)

    useEffect(() => {
        const currentYear = new Date().getFullYear()
        setSalesSelectedYear(currentYear)
        getTotalSalesDataByYear(currentYear)
        getTotalProfitByYear(currentYear)
        getTotalSalesComparisonByYear(currentYear)
        getTransactionsCountByYear(currentYear)
    }, [])

    async function getTotalSalesDataByYear(year) {
        try {
            const resData = await apiFetch(`/api/get_sales_summary_by_year/${year}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setTotalSalesAmount(formatCurrency(resData.total_sales))
            setTotalCashSalesAmount(formatCurrency(resData.total_cash_sales))
            setTotalCreditSalesAmount(formatCurrency(resData.total_credit_sales))
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    async function getTotalProfitByYear(year) {
        try {
            const resData = await apiFetch(`/api/get_sales_profit_by_year/${year}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setTotalSalesProfitAmount(formatCurrency(resData.profit_amount))
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    async function getTotalSalesComparisonByYear(year) {
        try {
            const resData = await apiFetch(`/api/get_sales_comparison_by_year/${year}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            if (!resData || resData.error || typeof resData.percentage_change !== 'number') {
                throw new Error(resData?.error || "Invalid data from server")
            }
            setTotalSalesComparison(resData.percentage_change)
        } catch (err) {
            console.error("❌ Sales comparison fetch failed:", err.message)
        }
    }

    async function getTransactionsCountByYear(year) {
        try {
            const resData = await apiFetch(`/api/get_transaction_counts_by_year/${year}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setTotalCashTransactions(resData.total_cash_transactions)
            setTotalCreditTransactions(resData.total_credit_transactions)
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    function handleSalesCardPopup(type) {
        if (type === 'total') setSalesTotolPopup(true)
    }

    function handleSelectedYear(year) {
        setSalesSelectedYear(year)
        setSalesTotolPopup(false)
        getTotalSalesDataByYear(year)
        getTotalProfitByYear(year)
        getTotalSalesComparisonByYear(year)
        getTransactionsCountByYear(year)
    }

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <div className="w-full p-4 bg-[#f5f5f5] border border-gray-300 rounded-xl shadow-md relative">
            {/* Title + Comparison */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-600">TOTAL SALES: {salesSelectedYear}</h2>

                {/* Wrap these in a flex box */}
                <div className="flex items-center space-x-2 pr-[25px]">
                    <SalesComparisonIcon percentage={totalSalesComparison} />
                </div>
            </div>

            {/* Ellipsis Button + Year Picker */}
            <div className="absolute top-3 right-3">
                <EllipsisVertical 
                    color="#5a5a5a" 
                    size={20} 
                    strokeWidth={3}
                    className="cursor-pointer"
                    onClick={() => handleSalesCardPopup('total')} 
                />
                {salesTotolPopup &&
                    <div ref={menuRef} className="absolute top-[15px] right-0 w-[380px] border border-gray-300 rounded-xl shadow-md z-[100] bg-white flex flex-col text-left p-3">
                    <X 
                        size={20}
                        strokeWidth={3}
                        className="cursor-pointer text-gray-600 absolute top-[15px] right-[15px]"
                        onClick={() => setSalesTotolPopup(false)}
                    />
                    <div className="font-medium mb-2">Select a Year</div>
                    
                    <div className="flex items-center justify-center space-x-4 p-2 py-6 bg-white border border-gray-300 rounded-md shadow-sm">
                        <button 
                            onClick={decrementYear} 
                            aria-label="Previous Year"
                            className="p-2 hover:text-blue-500 cursor-pointer"
                        >
                            <ChevronLeft size={25} />
                        </button>
                        <div className="text-2xl font-bold text-gray-700">
                            {salesSelectedYear}
                        </div>
                        <button 
                            onClick={incrementYear} 
                            aria-label="Next Year"
                            className="p-2 hover:text-blue-500 cursor-pointer"
                        >
                            <ChevronRight size={25} />
                        </button>
                        </div>
                </div>
                }
            </div>

            {/* Total Amount */}
            <div className="text-[2rem] text-[#5a5a5a] font-[700] font-[Roboto] mb-4">${totalSalesAmount}</div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-4 text-center text-[#1F2937]">
                <div>
                    <div className="text-xs text-gray-500">CASH</div>
                    <div className="text-lg font-semibold text-gray-700">${totalCashSalesAmount}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{totalCashTransactions}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">CARD</div>
                    <div className="text-lg font-semibold text-gray-700">${totalCreditSalesAmount}</div>
                    <div className="text-[0.7rem] text-gray-500 mt-1">TRANSACTIONS</div>
                    <div className="text-sm font-bold text-gray-700">{totalCreditTransactions}</div>
                </div>

                <div>
                    <div className="text-xs text-gray-500">PROFIT</div>
                    <div className="text-lg font-semibold text-gray-700">${totalSalesProfitAmount}</div>
                </div>
            </div>
        </div>
    )
}
