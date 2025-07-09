import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setDrawerAmount, closeRegister, setRegisterId, setOpenedAmount, setOpenedDate, setIsDisabled } from '../../features/registerSlice'
import { apiFetch } from '../../utils/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { openCashDrawer } from '../../utils/hardware'

export default function CloseRegisterModal({  open, onCancel, onCloseRegister }) {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Redux state
	const { openedAmount, opendDate } = useSelector(state => state.register)
	const { userId, userName } = useSelector(state => state.login)
    const { tenantId } = useSelector((state) => state.tenant)

	const [cashSales, setCashSales] = useState(0)
	const [expectedAmount, setExpectedAmount] = useState(0)
	const [enteredDrawerAmount, setEnteredDrawerAmount] = useState('')
	const [variance, setVariance] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

    const registerId = localStorage.getItem("register_id")

	useEffect(() => {
		if (userId && open) {
            getCashSales()
            openCashDrawer()
        }
	}, [userId, open])

	useEffect(() => {
		setExpectedAmount((Number(openedAmount) + Number(cashSales)).toFixed(2))
	}, [openedAmount, cashSales])

	useEffect(() => {
		const val = parseFloat(enteredDrawerAmount)
		if (!isNaN(val)) {
			dispatch(setDrawerAmount(val))
			setVariance((val - expectedAmount).toFixed(2))
		} else {
			setVariance(null)
		}
	}, [enteredDrawerAmount])

	async function getCashSales() {
		try {
			const data = await apiFetch(`/api/get_cash_sales/${userId}/${registerId}`, {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                },
                mode: "cors"
            })

            console.log("CASH SALES = " + data.cashSales)
			
			setCashSales(data.cashSales || 0)
		} 
        catch (err) {
			console.error('Error getting cash sales:', err)
		}
	}

    

	async function handleCloseRegister() {
		if (!enteredDrawerAmount) return
		setIsSubmitting(true)

		try {
			const data = await apiFetch('/api/close_register', {
				method: 'POST',
				headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId
                },
				body: JSON.stringify({
                    register_id: localStorage.getItem("register_id"),
					user_id: userId,
					cash_sales: cashSales,
					closing_amount: parseFloat(enteredDrawerAmount)
				})
			})

			if (data.success) {
				onCloseRegister()
			}
		} catch (err) {
			console.error('Error closing register:', err)
		} finally {
			setIsSubmitting(false)
		}
	}

	function handleCancel() {
        setEnteredDrawerAmount('')
        setVariance(null)
        onCancel() // 👈 pass a flag or state to prevent triggering logout/register reset
    }

    const now = dayjs()
    const closed_date = now.format('MM-DD-YYYY')
    const closed_time = now.format('hh:mm A')

	return (
		<Dialog open={open} onClose={() => {}} className="fixed inset-0 z-500 flex items-center justify-center bg-black/50">
			<DialogPanel className="bg-white rounded-2xl p-6 w-[460px] shadow-xl">
				<DialogTitle className="text-xl font-bold text-center mb-2">Close Register</DialogTitle>

				{/* Summary */}
				<div className="mb-4 text-sm text-gray-600">
					<div className=' text-[1.1rem]'><strong>Closed:</strong> {closed_date} {closed_time}</div>
					<div className=' text-[1.1rem]'><strong>Employee:</strong> {userName}</div>
				</div>

				<div className="text-sm mb-4">
					<div className="flex justify-between text-[1.1rem]"><span>Opening Amount:</span> <span>${Number(openedAmount).toFixed(2)}</span></div>
					<div className="flex justify-between text-[1.1rem]"><span>Cash Sales:</span> <span>${Number(cashSales).toFixed(2)}</span></div>
					<div className="flex justify-between text-[1.1rem] font-bold"><span>Expected Amount:</span> <span>${expectedAmount}</span></div>
				</div>

				{/* Input */}
				<div className="mb-4">
					<label className="block text-gray-700  text-[1rem] font-bold mb-1">Drawer Amount</label>
					<input
						type="text"
						value={enteredDrawerAmount}
						onChange={(e) => setEnteredDrawerAmount(e.target.value)}
						placeholder="$0.00"
						className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Variance */}
				{variance !== null && (
					<div className={`text-right text-sm font-semibold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
						Variance: ${variance}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex justify-end gap-2 mt-6">
					<button onClick={handleCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
						Cancel
					</button>
					<button
						disabled={!enteredDrawerAmount || isSubmitting}
						onClick={handleCloseRegister}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{isSubmitting ? 'Closing...' : 'Close Register'}
					</button>
				</div>
			</DialogPanel>
		</Dialog>
	)
}
