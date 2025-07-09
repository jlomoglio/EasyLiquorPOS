import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
//import { loadStripe } from '@stripe/stripe-js'
import {
	//Elements,
	CardNumberElement,
	CardExpiryElement,
	CardCvcElement,
	useElements,
	//useStripe
} from '@stripe/react-stripe-js'
import { apiFetch } from '../utils/api'

//const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)


function ConfirmSignup({ formData }) {
	const navigate = useNavigate()
	//const stripe = useStripe()
	const elements = useElements()
	// const [paymentError, setPaymentError] = useState('')
	// const [isLoading, setIsLoading] = useState(false)


	function handleSubmit() {

	}

	async function handleSubmit() {
		try {
			const data = await apiFetch('/api/create_store', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formData })
			})


			if (data.success) {
				localStorage.setItem('tenantId', data.tenant_id)
				navigate('/account')
			}
			else {
				setPaymentError(data.message || 'An error occurred while creating your store.')
			}
		} catch (err) {
			console.error('Payment submission error:', err)
			setPaymentError(err.message || 'Submission failed.')
		} 
	}

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="w-[1000px] mx-auto bg-white p-8 rounded shadow">
				<h1 className="text-2xl font-semibold mb-6 text-center">Confirm Your Store Details</h1>

				<div className="max-w-4xl mx-auto bg-white p-10 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
					{/* LEFT COLUMN: Details */}
					<div className="space-y-3 text-sm">
						<h1 className="text-2xl font-semibold mb-4 text-center md:text-left">Confirm Your Store Details</h1>
						<p><strong>Store:</strong> {formData.store_name} {formData.store_number && `(#${formData.store_number})`}</p>
						<p><strong>Owner:</strong> {formData.fname} {formData.lname}</p>
						<p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
						<p><strong>Phone:</strong> {formData.phone}</p>
						<p><strong>Email:</strong> {formData.email}</p>
						<p><strong>Username:</strong> {formData.username}</p>

						<div className="text-sm flex flex-col gap-4 mt-[25px]">
						<button
								onClick={null}
								className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded cursor-pointer"
							>
								Print
							</button>
							<button
								onClick={handleSubmit}
								//disabled={!stripe}
								className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded cursor-pointer"
							>
								Confirm & Submit
							</button>
						</div>
					</div>



					{/* RIGHT COLUMN: Payment */}
					<div>
						{/* <div className="space-y-4">
							<h3 className='font-[700]'>Payment Details</h3>
							<label className="block text-sm font-medium">Card Number</label>
							<CardNumberElement className="border bg-gray-100 border-gray-300 px-4 py-2 rounded-md w-full" />

							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-sm font-medium">Expiration</label>
									<CardExpiryElement className="border bg-gray-100 border-gray-300 px-4 py-2 rounded-md w-full" />
								</div>
								<div className="flex-1">
									<label className="block text-sm font-medium">CVC</label>
									<CardCvcElement className="border bg-gray-100 border-gray-300 px-4 py-2 rounded-md w-full" />
								</div>
							</div>
						</div>

						{paymentError && (
							<div className="mt-4 bg-red-100 text-red-700 px-4 py-2 border border-red-400 rounded text-sm">
								{paymentError}
							</div>
						)}

						<div className="flex justify-between mt-8">
							<button
								onClick={() => navigate('/signup', { state: formData })}
								className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded"
							>
								Go Back
							</button>
							{isLoading ? (
								<button disabled className="bg-gray-400 text-white px-6 py-2 rounded">
									Processing...
								</button>
							) : (
								<button
									onClick={handleConfirm}
									disabled={!stripe}
									className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
								>
									Confirm & Submit
								</button>
							)}
						</div> */}
					</div>
				</div>
			</div>
		</div>
	)
}

// export default function ConfirmSignupWrapper() {
// 	const [formData, setFormData] = useState(null)
// 	const navigate = useNavigate()

// 	useEffect(() => {
// 		const data = sessionStorage.getItem('signupData')
// 		if (!data) return navigate('/signup')
// 		setFormData(JSON.parse(data))
// 	}, [navigate])

// 	if (!formData) return null

// 	return (
// 		<Elements stripe={stripePromise}>
// 			<ConfirmForm formData={formData} />
// 		</Elements>
// 	)
// }