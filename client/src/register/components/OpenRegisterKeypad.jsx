// APPLICATION DEPENDENCIES
import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { openCashDrawer } from '../../../http.js'
import { useSelector, useDispatch } from "react-redux"
import { setRegisterId, setOpeningAmount } from '../../features/registerSlice.js'

// COMPONENT DEPENDENCIES
import ClearButton from './keypad/ClearButton.jsx'


// COMPONENT: OPEN REGISTER KEYPAD
export default function OpenRegisterKeypad() {
    // STYLES
    const container = `
        flex flex-col w-[300px] h-[auto] bg-[transparent] mt-[60px]
        items-center justify-center border border-black
    `
    const row = `flex flex-row items-center w-full h-[100px] mb-[10px]`
    const button = `
        flex flex-row items-center w-[80px] h-[80px]
        rounded-lg !bg-white text-[#5a5a5a] !text-[2rem] 
        font-[600] justify-center cursor-pointer m-[10px]
        shadow-lg
    `
    const OpenButton = `
        flex flex-row !w-[380px] h-[64px] !bg-white rounded-lg text-[#2b2a2a] 
        !text-[1.3rem] items-center justify-center ml-[10px] mt-[20px] font-[600] 
        select-none cursor-pointer !bg-[#add7e5]
    `
    const button0 = `
        flex flex-row items-center w-[180px] h-[80px]
        rounded-lg !bg-white text-[#5a5a5a] !text-[2rem] font-[600] 
        justify-center cursor-pointer m-[10px]
    `
    const openCashDrawerButton = `
        w-[370px] h-[60px] rounded-md text-white bg-[green] mt-[20px] 
        flex flex-row justify-center text-[1.5rem] pt-[12px] select-none cursor-pointer
    `
    
    // NAVIGATION: Used to change route
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // REDUx Login Values
    const { userId } = useSelector((state) => state.login)
    const { userName } = useSelector((state) => state.login)

    // STATE
    const [amount, setAmount] = useState("$0")

    // Open Cash Drawer
    function openDrawer() {
        openCashDrawer()
    }

    // Keypad Functions
    function updateAmount(digit) {
        setAmount((prevAmount) => {
            // Remove the dollar sign
            let priceValue = prevAmount.replace("$", "").replace(".", "")

            // Add the new digit at the end
            priceValue += digit

            // Ensure at least 3 digits (to properly format dollars and cents)
            if (priceValue.length < 3) {
                priceValue = priceValue.padStart(3, "0")
            }

            // Format the amount as $X.XX
            let dollars = priceValue.slice(0, -2)
            let cents = priceValue.slice(-2)
            let formattedPrice = `$${parseInt(dollars, 10)}.${cents}`

            return formattedPrice
        })
    }

    // Clear amount
    function handleClear() {
        setAmount("$0")
    }

    // POST data to the api
    async function handleOpenRegister() {
        try {
            let rawAmount = Number(amount.replace('$', ''))

            const response = await fetch("http://localhost:5000/api/open_register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    user_id: userId,
                    opening_amount: rawAmount,
                    user_name: userName
                }),
                mode: "cors"
            })
    
            if (!response.ok) {
                console.error("HTTP Error:", response.status)
                throw new Error("Failed to open register")
            }
    
            const resData = await response.json()
    
            if ( resData.success) {
                dispatch(setRegisterId(resData.register_id))
                dispatch(setOpeningAmount(rawAmount))
                navigate("/register")
            } 
            else {
                console.log("Open Register failed:", openRegisterResponse.message)
            }
        } 
        catch (error) {
            console.error("Error logging in:", error)
            return { success: false, message: "Error opening register" }
        }
    }

    // RENDER JSX
    return (
        <>
        <div className='flex flex-col justify-center items-center w-[400px] border-[red] border-[2px] relative'>
            <div className={openCashDrawerButton} onClick={openDrawer}>
                Open Cash Drawer
            </div>

            <div className='flex flex-col relative mb-[0px] mt-[20px]'>
                <div className="w-[380px] mb-[0px]">
                    <div className="w-[380px] h-[60px] mb-[0px] absolute top-[3px] left-[25px] z-[10] flex flex-row justify-start">
                        <label htmlFor="amount-input" className="text-[1.2rem] text-[#5a5a5a] font-[900] mt-[13px]">Opening amount:</label>
                    </div>
                    <div className="flex flex-row content-center justify-center w-[370px] h-[40px] ml-[10px] mb-[10px]">
                        <input 
                            type="text" 
                            id="amount-input" 
                            name="opening_amount"
                            className="w-[380px] h-[60px] text-[1.5rem] p-[10px] text-[#5a5a5a] text-right bg-white rounded-lg font-[600]" 
                            value={amount}                    
                            readOnly
                        />
                    </div>
                </div>

                <div className={container}>
                    <div className={row}>
                        <div className={button} onClick={() => updateAmount("1")}>1</div>
                        <div className={button} onClick={() => updateAmount("2")}>2</div>
                        <div className={button} onClick={() => updateAmount("3")}>3</div>
                    </div>
                    <div className={row}>
                        <div className={button} onClick={() => updateAmount("4")}>4</div>
                        <div className={button} onClick={() => updateAmount("5")}>5</div>
                        <div className={button} onClick={() => updateAmount("6")}>6</div>
                    </div>
                    <div className={row}>
                        <div className={button} onClick={() => updateAmount("7")}>7</div>
                        <div className={button} onClick={() => updateAmount("8")}>8</div>
                        <div className={button} onClick={() => updateAmount("9")}>9</div>
                    </div>
                    <div className={row}>
                        <ClearButton onClick={handleClear} />
                        <div className={button0} onClick={() => updateAmount("0")}>0</div>
                    </div>
                    <div className={row}>
                        <div className={OpenButton} onClick={handleOpenRegister}>Open Register</div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}