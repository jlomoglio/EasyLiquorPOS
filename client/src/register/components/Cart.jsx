// APPLICATION DEPENDENCIES
import { useEffect, useRef, useState } from "react"

// COMPONENT DEPENDENCIES
import CartItem from "./CartItem"
import EmptyCartDisplay from "./EmptyCartDisplay.jsx"

// COMPONENT: CART
export default function Cart({ cartItems, removeItem, onScan, barcodeInputRef, isOpenRegisterModal }) {
    // STYLES
    const cart = `absolute top-[70px] left-0 bottom-0 right-0 mr-[464px] bg-white`
    const cartHeader = `relativew-[calc(100% - 464px)] h-[50px] bg-[#e5e7eb] pt-[5px] text-[1.3rem] shadow-lg z-200`
    const barcodeInput = `fixed top-[0px] w-[200px] h-[60px] focus:outline-none border border-[transparent] bg-[transparent] text-[transparent]`
    const itemDiv = `absolute left-[20px] mt-[3px] font-[700] text-[#5a5a5a]`
    const priceDiv = `absolute right-[80px] mt-[3px] font-[700] text-[#5a5a5a]`
    const cartBody = `absolute top-[50px] left-0 bottom-0 right-0 bg-white overflow-y-auto p-0 pt-[10px] bg-[#fff]`


    // ✅ Forces a re-render when needed
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
		if (barcodeInputRef.current) barcodeInputRef.current.focus()
	}, [refreshKey])

	useEffect(() => {
		if (cartItems.length === 0) {
			setTimeout(() => {
				if (barcodeInputRef.current) barcodeInputRef.current.focus()
			}, 150)
		}
	}, [cartItems])

	useEffect(() => {
		function handlePageClick(e) {
			if (barcodeInputRef.current &&
				e.target.tagName !== "BUTTON" &&
				e.target.tagName !== "INPUT") {
				barcodeInputRef.current.focus()
			}
		}
		document.addEventListener("click", handlePageClick)
		return () => document.removeEventListener("click", handlePageClick)
	}, [])

	useEffect(() => {
		function handleBlur() {
			setRefreshKey(prev => prev + 1)
		}
		if (barcodeInputRef.current) {
			barcodeInputRef.current.addEventListener("blur", handleBlur)
		}
		return () => {
			if (barcodeInputRef.current) {
				barcodeInputRef.current.removeEventListener("blur", handleBlur)
			}
		}
	}, [])

    // RENDER JSX
    return (
        <div className={cart}>
            <div className={cartHeader}>
                <div className={itemDiv}>Item</div>
                <div className={priceDiv}>Price</div>
            </div>
            <div className={cartBody} style={{ scrollbarColor: "#5a5a5a #ccc" }}>
                {cartItems.length > 0 ? (
                    cartItems.map((cartItem, index) => (
                        <CartItem
                            key={index}
                            productName={cartItem.product_name}
                            price={cartItem.price}
                            upc={cartItem.upc}
                            index={index}
                            removeItem={removeItem}
                        />
                    ))
                ) : (
                    <EmptyCartDisplay />
                )}
            </div>
            {!isOpenRegisterModal && (
                <input
                    type="text"
                    className={barcodeInput}
                    id="barcodeInput"
                    name="barcodeInput"
                    ref={barcodeInputRef}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onScan(e.target.value)
                            e.target.value = ""
                        }
                    }}
                    autoFocus
                    autoComplete="off"
                />
            )}
        </div>
    )
}

