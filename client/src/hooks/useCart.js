import { useState } from 'react'

export default function useCart() {
	const [cartItems, setCartItems] = useState([])
	const [total, setTotal] = useState([])

	const addItem = (item) => setCartItems(prev => [...prev, item])

	const removeItem = (index) => setCartItems(prev =>
		prev.filter((_, i) => i !== index)
	)

	const clearCart = () => setCartItems([])

	const updateQuantity = (index, newQty) => {
		setCartItems(prev =>
			prev.map((item, i) =>
				i === index ? { ...item, quantity: newQty } : item
			)
		)
	}

	const calculateTotals = () => {
		const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
		const tax = parseFloat((subtotal * 0.06).toFixed(2))
		const total = parseFloat((subtotal + tax).toFixed(2))
		return { subtotal, tax, total }
	}

	return {
		cartItems,
		total,
		addItem,
		removeItem,
		clearCart,
		updateQuantity,
		calculateTotals
	}
}
