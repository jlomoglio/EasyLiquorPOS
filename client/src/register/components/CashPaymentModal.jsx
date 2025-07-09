import { useRef, useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { openCashDrawer } from '../../utils/hardware'


export default function CashPaymentModal({ open, close, onComplete, totalDue = 0, setSalesType }) {
	const [amount, setAmount] = useState('')
	const inputRef = useRef(null)

	// Focus input on modal open
	useEffect(() => {
		if (open) {
			setAmount('')
		}
	}, [open])


	// Parse cash amount safely
	const parsedAmount = parseFloat(amount)
	const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= totalDue
	const changeDue = isValidAmount ? (parsedAmount - totalDue).toFixed(2) : null

	
	// Submit handler
	function handleSubmit() {
		if (!isValidAmount) return
	
		if (setSalesType) setSalesType("cash") // optional, still updates state
		if (onComplete) {
			onComplete(parsedAmount, "cash", {
				amountPaid: parsedAmount.toFixed(2),
				changeDue: changeDue
			})
		}
		inputRef.current.value = ""
		openCashDrawer()
		close()
	}

    function handlePresetClick(value) {
		setAmount(value.toFixed(2))
		if (inputRef.current) inputRef.current.focus()
	}

	return (
		<Dialog open={open} onClose={close} className="fixed inset-0 z-500 flex items-center justify-center bg-black/50">
			<DialogPanel className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
				<DialogTitle className="text-xl font-bold text-center mb-2">Cash Payment</DialogTitle>

				{/* Total Due */}
				<div className="text-center text-lg font-semibold text-gray-600 mb-3">
					Total Due: <span className="text-black text-2xl font-bold">${totalDue.toFixed(2)}</span>
				</div>

				{/* Input */}
				<input
					ref={inputRef}
					value={amount}
					autoFocus
				 	onChange={(e) => setAmount(e.target.value)}
					placeholder="Enter cash received"
					className="w-full border border-gray-300 rounded-lg px-4 py-3 text-2xl text-center mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>

				{/* Conditionally show change due */}
				{changeDue !== null && (
					<div className="text-center text-green-600 text-lg font-semibold mb-4">
						Change Due: <span className="text-black text-2xl font-bold">${changeDue}</span>
					</div>
				)}

				{/* Presets */}
				<div className="grid grid-cols-3 gap-2 mb-4">
					{[5, 10, 20, 50, 100].map(val => (
						<button
							key={val}
							onClick={() => handlePresetClick(val)}
							className="bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-lg font-medium"
						>
							${val}
						</button>
					))}
					<button
						onClick={() => handlePresetClick(totalDue)}
						className="col-span-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold"
					>
						Exact (${totalDue.toFixed(2)})
					</button>
				</div>

				{/* Action buttons */}
				<div className="flex justify-end gap-2">
					<button onClick={close} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
						Cancel
					</button>
					<button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
						Submit
					</button>
				</div>
			</DialogPanel>
		</Dialog>
	)
}
