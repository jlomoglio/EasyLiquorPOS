// APPLICATION DEPENDENCIES
import { useState, useRef, useEffect } from "react"
import { apiFetch } from "../utils/api.js"
import useCart from '../hooks/useCart.js'
import useSession from '../hooks/useSession'
import { useSelector, useDispatch } from "react-redux"
import { setTransactionId, setSalesType, setVoidTransaction } from "../features/transactionSlice.js"
import { openRegister, closeRegister } from "../features/registerSlice"


// COMPONENT DEPENDENCIES
import Header from "./components/Header.jsx"
import RegisterInfo from "./components/RegisterInfo.jsx"
import Cart from "./components/Cart.jsx"
import ActionButtons from "./components/ActionButtons.jsx"
import Totals from "./components/Totals.jsx"
import CashPaymentModal from "./components/CashPaymentModal.jsx"
import OpenRegisterModal from './components/OpenRegisterModal.jsx'
import CreditPaymentModal from "./components/CreditPaymentModal.jsx"
import CloseRegisterModal from "./components/CloseRegisterModal.jsx"


// COMPONENT: REGISTER
export default function Register() {
	// STYLES
	const wrapper = `
        absolute left-0 top-0 right-0 bottom-0 !z-[1]
    `
	const leftCol = `
        bg-white flex flex-col !w-[calc(100% - 464px)]
    `
	const rightCol = `
        fixed right-0 top-[70px] bottom-0 w-[464px] bg-white flex flex-col
		border-l border-l-gray-300
    `


	// USEREF
	const barcodeInputRef = useRef(null)

	const { cartItems, calculateTotals, updateQuantity, addItem, removeItem, clearCart } = useCart()
	const totals = calculateTotals() // 👈 only compute once during render

	// REDUX
	const dispatch = useDispatch()
	const { transactionId, salesType } = useSelector((state) => state.transaction)
	const isRegisterOpen = useSelector(state => state.register.isRegisterOpen)
	const { userName } = useSelector((state) => state.login)

	// STATE
	const [showCashPaymentModal, setShowCashPaymentModal] = useState(false)
	const [showCreditPaymentModal, setShowCreditPaymentModal] = useState(false)
	const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(true)
	const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false)
	

	// LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

	// SESSIONS
	const { logout } = useSession()

	// Always try to keep the scanner input focused after render/updates
	useEffect(() => {
		const input = barcodeInputRef.current
	
		if (!showOpenRegisterModal && !showCashPaymentModal && !showCreditPaymentModal && !showCloseRegisterModal && input) {
			// Short delay gives React and DOM time to finish any modal updates or re-renders
			const timeout = setTimeout(() => {
				input.focus()
				input.select()
			}, 100)
	
			return () => clearTimeout(timeout)
		}
	}, [
		transactionId,       // when it's cleared or reloaded
		showOpenRegisterModal,
		showCashPaymentModal,
		showCreditPaymentModal,
		showCloseRegisterModal
	])

	

	// COMPLETE THE TRANSACTION
	async function handleCompleteTransaction(amountPaid, type, paymentDetails = {}) {
		// VERIFY DATA
		if (localStorage.getItem("transaction_id") === "" || !totals.total || cartItems.length === 0) {
			console.warn("Cannot complete transaction, missing data.")
			return
		}

		// ENSURE EVERY ITEM GETS THE CORRECT TRANSACTION ID
		let finalCartItems = cartItems.map(item => ({
			...item,
			total: parseFloat((item.price * item.quantity).toFixed(2)), 
		}))

		// ADD THE TRANSACTION
		try {
			const transactionResponse = await apiFetch("/api/complete_transaction", {
				method: "POST",
				headers: {
				  "Content-Type": "application/json",
				  "x-tenant-id": tenantId
				},
				body: JSON.stringify({
				  transaction: {
					transaction_id: transactionId,
					total_amount: parseFloat(totals.total).toFixed(2),
					sales_type: type,
					user_id: localStorage.getItem("userId"),
					register_id: localStorage.getItem("register_id")
				  },
				  items: finalCartItems
				}),
			})

			if (!transactionResponse.success) {
				console.error("Failed to create transaction.")
				return
			}

			// PRINT THE RECEIPT
			handlePrintReceipt(transactionId, type, paymentDetails)

			// RESET TRANSACTION
			setShowCashPaymentModal(false)
			clearCart()
			
			dispatch(setTransactionId(null))
			dispatch(setSalesType(null))

			setTimeout(() => {
				if (barcodeInputRef.current) {
					barcodeInputRef.current.focus()
				} else {
					console.warn("⚠️ barcodeInputRef is null, cannot refocus")
				}
			}, 200)

		} catch (error) {
			console.error("Error completing transaction:", error)
		}
	}

	// HANDLE CREDIT/DEBI CARD PAYMENT
	function handleCreditPayment() {
		setShowCreditPaymentModal(true)
		setShowCashPaymentModal(false)
	}

	// HANDLE CASH PAYMENT
	function handleCashPayment() {
		setShowCashPaymentModal(true)
		setShowCreditPaymentModal(false)
	}
	
	// HANDLE VOID THE TRANSACTION
	function handleVoidTransaction() {
		clearCart()
	
		dispatch(setTransactionId(null))
		dispatch(setSalesType(null))
		dispatch(setVoidTransaction(false))
	
		if (barcodeInputRef.current) {
			barcodeInputRef.current.value = ""
			// No need to manually refocus here — the useEffect above will do it
		}
	}

	// HANDLE SCANNED UPC
	async function handleScannedUPC(upc) {
		const sanitizedUPC = upc.trim()
		if (!sanitizedUPC) return

		if (!transactionId) {
			const res = await apiFetch('/api/get_transaction_id', {
				method: 'GET',
				headers: {
					'x-tenant-id': tenantId
				}
			})

			dispatch(setTransactionId(res.transaction_id))
		}

		const resData = await apiFetch(`/api/get_product/${sanitizedUPC}`, {
			method: 'GET',
			headers: {
				'x-tenant-id': tenantId
			}
		})

		const product = resData.product

		const newItem = {
			item_id: product.id,
			transaction_id: transactionId,
			product_name: `${product.name} ${product.volume}`,
			quantity: 1,
			price: parseFloat(product.price_per_unit),
			unit: product.unit,
			upc: sanitizedUPC,
			tenant_id: tenantId
		}

		addItem(newItem)

		if (barcodeInputRef.current) {
			barcodeInputRef.current.value = ''
			barcodeInputRef.current.focus()
		}
	}
	
	// HANDLE PRINT REGISTER
	async function handlePrintReceipt(transactionId, salesType, paymentDetails = {}) {
		try {
		  const resData = await apiFetch(`/api/get_transaction/${transactionId}`, {
			headers: {
			  'x-tenant-id': tenantId
			}
		  })
	  
		  const {
			transaction_id,
			date,
			time,
			subtotal,
			tax,
			total_amount,
			sales_type,
			store_name,
			store_address,
			store_email,
			store_phone,
			items = [],
		  } = resData
	  
		  const { amountPaid, changeDue, maskedCardNumber } = paymentDetails
	  
		  const receiptHTML = `
			<!DOCTYPE html>
			<html>
			<head>
			  <style>
				body {
				  font-family: monospace;
				  width: 100%;
				  max-width: 384px;
				  margin: 0 auto;
				  padding: 10px;
				}
				h2 { text-align: center; font-size: 12px; margin-bottom: 4px; }
				.center { text-align: center; }
				.right { text-align: right; }
				hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
				table { width: 100%; font-size: 10px; border-collapse: collapse; }
				td { padding: 2px 0; vertical-align: top; }
			  </style>
			</head>
			<body>
			  <h2>${store_name}</h2>
			  <div class="center">${store_address}</div>
			  <div class="center">Email: ${store_email}</div>
			  <div class="center">Phone: ${store_phone}</div>
			  <hr />
			  <div>Transaction: ${transaction_id}</div>
			  <div>Date: ${date} ${time}</div>
			  <div>Payment Type: ${sales_type.toUpperCase()}</div>
			  <hr />
			  <table>
				${items.map(item => `
				  <tr>
					<td>${item.quantity}x</td>
					<td>
					  ${item.product_name} ${item.volume}<br />
					  UPC: ${item.upc || 'N/A'}
					</td>
					<td class="right">${item.total}</td>
				  </tr>
				`).join('')}
			  </table>
			  <hr />
			  <div class="right">Subtotal: ${subtotal}</div>
			  <div class="right">Tax: ${tax}</div>
			  <div class="right"><strong>Total: ${total_amount}</strong></div>
			  ${salesType === 'cash' && amountPaid ? `
				<hr />
				<div class="right">Amount Paid: $${amountPaid}</div>
				<div class="right">Change Due: $${changeDue}</div>
			` : ''}
			  <hr />
			  <div class="center">Your cashier: ${userName}</div>
			  <div class="center">Thank you for your purchase!</div>
			</body>
			</html>
		  `
	  
		  window.electron.send('print-receipt', receiptHTML)
		} 
		catch (err) {
		  console.error("❌ Error fetching transaction:", err.message)
		}
	}
	  

	// HANDLE CLOSE THE OPEN REGISTER MODAL
	function handleCloseOpenRegisterModal() {
		setShowOpenRegisterModal(false)
		dispatch(openRegister())
	}

	// HANDLE CLOSE THE CLOSE REGISTER MODAL
	function handleCloseCloseRegisterModal() {
		setShowCloseRegisterModal(false)
		dispatch(closeRegister()) 
		logout()
	}

	// RENDER JSX
	return (
		<>
			{!isRegisterOpen && (
				<OpenRegisterModal
					open={showOpenRegisterModal}
					onClose={handleCloseOpenRegisterModal}
				/>
			)}
			
			<CashPaymentModal 
				open={showCashPaymentModal}
				close={() => setShowCashPaymentModal(false)}
				onComplete={handleCompleteTransaction}
				totalDue={totals.total}
				setSalesType={(type) => dispatch(setSalesType(type))}
			/>

			<CreditPaymentModal 
				open={showCreditPaymentModal}
				close={() => setShowCreditPaymentModal(false)}
				onComplete={handleCompleteTransaction}
				totalDue={totals.total}
				setSalesType={(type) => dispatch(setSalesType(type))}
			/>

			<CloseRegisterModal
				open={showCloseRegisterModal}
				onCancel={() => setShowCloseRegisterModal(false)}
				onCloseRegister={handleCloseCloseRegisterModal}
			/>
			
			
			<div className={wrapper}>
				<Header closeRegister={() => setShowCloseRegisterModal(true)} />
				<div className={leftCol}>
					<Cart
						cartItems={cartItems}
						addItem={addItem}
						removeItem={removeItem}
						updateQuantity={updateQuantity}
						onScan={handleScannedUPC}
						barcodeInputRef={barcodeInputRef}
						isOpenRegisterModal={showOpenRegisterModal}
					/>
				</div>
				<div className={rightCol}>
					<RegisterInfo transactionId={transactionId} />
					<Totals {...totals} />
					<ActionButtons
						transactionId={transactionId}
						onShowCashPayment={handleCashPayment}
						onVoidTransaction={handleVoidTransaction}
						onProcessCredit={handleCreditPayment}
						onPrint={() => handlePrintReceipt(transactionId)}
					/>
				</div>
			</div>
		</>
	)
}
