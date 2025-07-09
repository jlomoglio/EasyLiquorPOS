import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { apiFetch } from '../../utils/api'
import useSession from '../../hooks/useSession'
import { setOpenedAmount, setOpenedDate } from "../../features/registerSlice"
import { openCashDrawer } from '../../utils/hardware'

export default function OpenRegisterModal({ open, onClose }) {
	// HOOK
	const { logout } = useSession()

	// USEREF
	const inputRef = useRef(null)

	// REDUX
	const dispatch = useDispatch()
	const { tenantId } = useSelector((state) => state.tenant)
	const { userId, userName } = useSelector((state) => state.login)

	// STATE
	const [amount, setAmount] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (open && inputRef.current) {
		  setTimeout(() => inputRef.current.focus(), 150) // delay ensures it wins focus race
		}
	}, [open])
	

	// HANDLE OPEN REGISTER
	async function handleOpenRegister() {
		if (!amount) {
			setError('Please enter a valid opening amount.')
			return
		}

		try {
            const resData = await apiFetch("/api/open_register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-tenant-id': tenantId
                },
                body: JSON.stringify({ 
                    user_id: userId,
                    opening_amount: amount,
					user_name: userName,
                    tenant_id: tenantId
                }),
                mode: "cors"
            })
    
            if (!resData.success) {
                console.error("HTTP Error:", resData.status)
            }
    
            if (resData.success) {
				const date = new Date().toISOString().split('T')[0]
				dispatch(setOpenedAmount(amount))
				dispatch(setOpenedDate(date))
				localStorage.setItem("register_id", resData.registerID)
				setError('')
                setTimeout(() => {
					onClose() // ✅ this should flip the parent’s showOpenRegisterModal to false
				  }, 100)

				openCashDrawer()
			} 
        } 
        catch (error) {
            console.error("Open Register failed:", error)
        }
	}

	function handleClear() {
		setAmount('')
		setError('')
	}

	function handleLogout() {
		window.location.href = '/pos/pos_login'
	}

	return (
		<Dialog open={open} static onClose={() => {}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<DialogPanel className="bg-white w-[400px] rounded-2xl p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-6">
					<DialogTitle className="text-xl font-bold">Open Register</DialogTitle>
					<button onClick={logout} className="text-sm text-red-600 hover:underline cursor-pointer">
						Logout
					</button>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">Opening amount:</label>
					<input
						ref={inputRef}
						type="text"
						value={amount}
						onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
						placeholder="$0.00"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{error && <div className="text-red-600 mt-1 text-sm">{error}</div>}
				</div>

				<div className="flex justify-between">
					<button
						onClick={handleClear}
						className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
					>
						Clear
					</button>

					<button
						onClick={handleOpenRegister}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
					>
						Open Register
					</button>
				</div>
			</DialogPanel>
		</Dialog>
	)
}
