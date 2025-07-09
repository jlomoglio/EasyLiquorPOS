import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function CreditPaymentModal({ open, close, onComplete, totalDue = 0, setSalesType }) {
	const [status, setStatus] = useState('idle') // idle | manual | processing | success | failed
	const [error, setError] = useState('')
	const [formData, setFormData] = useState({
		cardName: '',
		cardNumber: '',
		exp: '',
		cvv: ''
	})

	async function handleProcessCard() {
		setStatus('processing')
		setError('')
	
		setTimeout(() => {
			const isSuccess = Math.random() > 0.25 // simulate outcome
	
			if (isSuccess) {
				if (setSalesType) setSalesType("credit")
				if (onComplete) onComplete(totalDue, "credit")
				setStatus('success')
	
				setTimeout(() => {
					close()
					setStatus('idle')
				}, 1000)
			} else {
				setStatus('failed')
				setError('Transaction declined. Please try again or use another payment method.')
			}
		}, 1500)
	}

	function handleManualApproval() {
		setStatus('manual')
	}

	function handleManualSubmit(e) {
		e.preventDefault()
		setError('')
	
		const { cardName, cardNumber, exp, cvv } = formData
	
		// Basic validation
		if (!cardName || !cardNumber || !exp || !cvv) {
			setError('All fields are required.')
			return
		}
	
		if (!/^\d{13,16}$/.test(cardNumber)) {
			setError('Card number must be 13–16 digits.')
			return
		}
	
		if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
			setError('Expiration must be in MM/YY format.')
			return
		}
	
		if (!/^\d{3,4}$/.test(cvv)) {
			setError('CVV must be 3 or 4 digits.')
			return
		}
	
		// All good – simulate processing
		setStatus('processing')
	
		setTimeout(() => {
			const isSuccess = Math.random() > 0.1
			if (isSuccess) {
				setSalesType && setSalesType('credit')
				onComplete && onComplete(totalDue, 'credit')
				setStatus('success')
				setTimeout(() => {
					close()
					setStatus('idle')
				}, 1000)
			} else {
				setStatus('failed')
				setError('Card declined. Please try again.')
			}
		}, 1500)
	}

	function handleCancelManualPayment() {
		setStatus('idle')
		setFormData({
			cardName: '',
			cardNumber: '',
			exp: '',
			cvv: ''
		})
		setError('')
	}
	
	function handleRetry() {
		setStatus('idle')
		setError('')
		setFormData({ cardName: '', cardNumber: '', exp: '', cvv: '' })
	}

	function handleCancel() {
		setStatus('idle')
		setError('')
		setFormData({ cardName: '', cardNumber: '', exp: '', cvv: '' })
		close()
	}

	return (
		<Dialog open={open} onClose={close} className="fixed inset-0 z-500 flex items-center justify-center bg-black/50">
			<DialogPanel className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
				<DialogTitle className="text-xl font-bold text-center mb-4">Credit Card Payment</DialogTitle>

				<div className="text-center text-lg font-semibold text-gray-600 mb-6">
					Total Due: <span className="text-black text-2xl font-bold">${totalDue.toFixed(2)}</span>
				</div>

				{status === 'idle' && (
					<div className="flex flex-col gap-4">
						<button
							onClick={handleProcessCard}
							className="bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700"
						>
							Swipe Card
						</button>
						<button
							onClick={handleManualApproval}
							className="bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-lg"
						>
							Enter Manually
						</button>
						<button
							onClick={close}
							className="bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-lg"
						>
							Cancel
						</button>
					</div>
				)}

				{status === 'manual' && (
					<form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
						<input
							type="text"
							placeholder="Cardholder Name"
							value={formData.cardName}
							onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
							required
							className="border rounded px-3 py-2 text-lg"
						/>
						<input
							type="text"
							placeholder="Card Number"
							value={formData.cardNumber}
							onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
							required
							maxLength={16}
							className="border rounded px-3 py-2 text-lg"
						/>
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="MM/YY"
								value={formData.exp}
								onChange={(e) => setFormData({ ...formData, exp: e.target.value })}
								required
								className="border rounded px-3 py-2 text-lg w-1/2"
							/>
							<input
								type="text"
								placeholder="CVV"
								value={formData.cvv}
								onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
								required
								maxLength={4}
								className="border rounded px-3 py-2 text-lg w-1/2"
							/>
						</div>
						{error && (
							<div className="text-red-600 text-sm font-medium mb-2 text-center">
								{error}
							</div>
						)}
						<div className="flex justify-end gap-2 mt-2">
							
							<button
								type="button"
								onClick={handleCancelManualPayment}
								className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
							>
								Submit
							</button>
						</div>
					</form>
				)}

				{status === 'processing' && (
					<div className="text-center text-lg font-medium text-gray-700">
						Processing payment...
					</div>
				)}

				{status === 'success' && (
					<div className="text-center text-green-600 text-lg font-semibold">
						Payment approved!
					</div>
				)}

				{status === 'failed' && (
					<div className="text-center">
						<div className="text-red-600 font-semibold mb-4">{error}</div>
						<div className="flex justify-end gap-2">
							<button onClick={handleRetry} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
								Try Again
							</button>
							<button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
								Cancel
							</button>
						</div>
					</div>
				)}
			</DialogPanel>
		</Dialog>
	)
}
