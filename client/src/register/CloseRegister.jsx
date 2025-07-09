// APPLICATION DEPENDENCIES
import { useSelector, useDispatch } from 'react-redux'
import { getDateTime } from '../../utils'
import { 
    setRegisterId, 
    setOpenedDate, 
    setOpenedAmount, 
    setDrawerAmount, 
    setIsDisabled } from './../features/registerSlice'
import { useEffect, useState } from 'react'

// COMPONENT DEPENDENCIES
import CloseRegisterKeypad from './components/CloseRegisterKeypad'
import Header from './components/Header'
import { useNavigate } from 'react-router-dom'



// COMPONENT: CLOSE REGISTER
export default function CloseRegister() {
    // Styles
    const wrapper = `
        w-[100vh] w-[100vw]
    `
    const subHeader = `
        h-[40px] absolute top-[70px] left-0 right-0 bottom-0 bg-[#fff] 
        text-center text-[#5a5a5a] text-[1.3rem] font-[700] pt-[5px]
    `
    const body = `
        absolute top-[110px] left-0 right-0 bottom-0 bg-[#ebebeb] 
        items-center justify-center pt-[0px] flex flex-row
    `
    const leftCol = `
        w-[400px] relative
    `
    const rightCol = `
        w-[500px] h-[700px] flex flex-col bg-white
        rounded-xl ml-[30px] shadow-lg p-[20px] !z-[10]
    `
    const rightColMask = `
        w-[470px] h-[400px] bg-[transparent]
        rounded-xl !z-[1500] select-none absolute left-1/2 ml-[-20px] top-[100px]
    `
    const closeButton = `
        flex flex-row !w-[440px] h-[104px] rounded-lg text-[#2b2a2a] 
        !text-[1.3rem] items-center justify-center ml-[10px] mt-[0px] font-[600] 
        select-none cursor-pointer !bg-[#add7e5] shadow-lg absolute top-[660px]
        border border-[#ccc] absolute top-[560px]
    `
    const closeButtonDisabled = `
        flex flex-row !w-[440px] h-[104px] rounded-lg text-[#ccc]  
        !text-[1.3rem] items-center justify-center ml-[10px] mt-[0px] font-[600] 
        select-none !bg-[#e0e0e0] shadow-lg absolute top-[660px]
        border border-[#ccc] absolute top-[560px] pointer-events: none
    `
    const label = `
        text-[1.3rem] text-[#5a5a5a] font-[900]
    `
    const colWrapper = `
        relative w-full h-full flex items-center justify-center mt-[-120px]
    `
    const input = `
        text-[1.3rem] text-[#5a5a5a] w-[200px] bg-[transparent]
        outline-none text-left
    `
    const tableInput = `
        text-[1.3rem] text-[#5a5a5a] w-[full] bg-[transparent]
        outline-none text-right
    `
    const tableInputGreen = `
        text-[1.3rem] text-[green] w-[full] bg-[transparent]
        outline-none text-right
    `
    const tableInputRed = `
        text-[1.3rem] text-[red] w-[full] bg-[transparent]
        outline-none text-right
    `
    const hr = `
        border-[#ccc] mt-[15px] w-[fullpx]
    `
    const table = `
        w-[500px] mt-[20px]
    `
    const closedInputGroup = `
        ml-[0px] pt-[10px] flex flex-col
        text-left
    `
    const employeeInputGroup = `
        ml-[0px] pt-[10px] flex flex-col
        text-left
    `
    const tdOpeningAmountLeft = `
        text-[1.3rem] text-[#5a5a5a] w-[300px] font-[600] text-left
    `
    const tdOpeningAmountRight = `
        text-[1.3remx] text-[#5a5a5a] text-right w-[200px] pr-[40px]
    `
    const tdCashSalesLeft = `
        text-[1.3rem] text-[#5a5a5a] w-[300px] font-[600] text-left
    `
    const tdCashSalesRight = `
        text-[1.3remx] text-[#5a5a5a] text-right
        w-[200px] pr-[40px]
    `
    const tdExpectedAmountLeft = `
        text-[1.3rem] text-[#5a5a5a] w-[300px] font-[600] text-left
    `
    const tdExpectedAmountRight = `
        text-[1.3remx] text-[#5a5a5a] text-right font-[900]
        w-[200px] pr-[40px]
    `
    const tdDrawerAmountLeft = `
        text-[1.3rem] text-[#5a5a5a] w-[300px] font-[600] text-left          
    `
    const tdDrawerAmountRight = `
        text-[1.3remx] text-[#5a5a5a] text-right
        w-[200px] pr-[40px]       
    `
    const tdVarianceLeft = `
        text-[1.3rem] text-[#5a5a5a] w-[300px] font-[600] text-left          
    `
    const tdVarianceRight = `
       text-[1.3remx] text-[#5a5a5a] text-right w-[200px] pr-[40px] font-[900]
    `
    const tdVarianceRightGreen = `
       text-[1.3remx] text-[green] text-right w-[200px] pr-[40px] font-[900]
    `
    const tdVarianceRightRed = `
       text-[1.3remx] text-[red] text-right w-[200px] pr-[40px] font-[900]
    `



    // DATE AND TIME
    const closedDateTime = `${getDateTime('date')} ${getDateTime('time')}`


    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // REDUX: Login Values
    const { userId } = useSelector((state) => state.login)
    const { userName } = useSelector((state) => state.login)

    // REDUX: Register Values
    const { openedAmount } = useSelector((state) => state.register)
    const { isDisabled } = useSelector((state) => state.register)
    const { drawerAmount } = useSelector((state) => state.register)

    // STATE
    const [expextedAmount, setExpectedAmount] = useState()
    const [drawerVariance, setDrawerVariance] = useState()
    const [cashSales, setCashSales] = useState()

    // Keep local state (`cashDrawerAmount`) in sync with Redux state (`drawerAmount`)
    const [cashDrawerAmount, setCashDrawerAmount] = useState(drawerAmount || "$0.00");

    // Sync local state with Redux whenever Redux state updates
    useEffect(() => {
        setCashDrawerAmount(drawerAmount);
    }, [drawerAmount])

    // CALL GET CASH SALES IF USERID
    useEffect(() => {
        if (userId) {
            getCashSales();
        }
    }, [userId]);

    // CALCULATE THE EXPECTED AMOUNT
    useEffect(() => {
        if (openedAmount && cashSales) {
            const expected_amount = (Number(openedAmount) + Number(cashSales)).toFixed(2);
            setExpectedAmount(expected_amount);
        }
    }, [openedAmount, cashSales]);
    


    // GET CASH SALES
    async function getCashSales() {
        try {
            const response = await fetch(`http://localhost:5000/api/get_cash_sales/${userId}`);
    
            if (!response.ok) {
                throw new Error("Failed to fetch cash sales");
            }
    
            const data = await response.json();
            console.log("Total Cash Sales:", data.cashSales); // Debugging
    
            setCashSales(data.cashSales)

            const expected_amount = openedAmount + data.cashSales
            setExpectedAmount(expected_amount)
        } 
        catch (error) {
            console.error("Error fetching cash sales:", error);
        }
    }


    // LOGOUT USER
    async function logout() {
        dispatch(setRegisterId(null))
        dispatch(setOpenedDate(null))
        dispatch(setOpenedAmount(0.00))
        dispatch(setDrawerAmount(0.00))
        dispatch(setIsDisabled(true))
        
        try {
            const response = await fetch(`http://localhost:5000/api/logout/2`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const resData = await response.json()

            if (resData.success) {
                navigate('/', { replace: true })
            }
        } 
        catch (error) {
            console.error("Error logging out:", error)
        }
    }

    // GET REGISTER DATA
    async function handleCloseRegister() {
        try {
            const response = await fetch("http://localhost:5000/api/close_register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    opened_date: getDateTime('date'), // Assuming opened_date is the current date
                    closed_date: getDateTime('date'),
                    closed_time: getDateTime('time'),
                    cash_sales: cashSales,
                    drawer_amount: parseFloat(cashDrawerAmount.replace("$", "")),
                }),
                mode: "cors",
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const resData = await response.json()

            if (resData.success) {
                logout()
            }


        } catch (error) {
            console.error("Error closing register:", error);
        }
    }


    // CALCULATE EXPECTED AMOUNT
    function calculateVariance(amount) {
        if (amount === "") {
            setDrawerVariance(undefined); // Clear variance
            setCashDrawerAmount("$0.00"); // Reset drawer amount
            dispatch(setDrawerAmount("$0.00"));
            return;
        }

        dispatch(setIsDisabled(false));
    
        // Convert amount to a number
        const drawerAmountValue = parseFloat(amount.replace("$", "")) || 0;
    
        // ✅ Update local state
        setCashDrawerAmount(`$${drawerAmountValue.toFixed(2)}`);
    
        // ✅ Update Redux state
        dispatch(setDrawerAmount(`$${drawerAmountValue.toFixed(2)}`));
    
        // Ensure expectedAmount is a valid number
        const expectedAmountValue = parseFloat(expextedAmount) || 0;
    
        // Calculate variance
        const variance = Number((drawerAmountValue - expectedAmountValue).toFixed(2))

        setDrawerVariance(Number(variance));
    }

    // RENDER JSX
    return (
        <div className={wrapper}>
            <Header showMenuIcon={false} />
            <div className={subHeader}>
                CLOSE REGISTER
            </div>
            <div className={body}>
                <div className={colWrapper}>
                    <div className={leftCol}>
                        <CloseRegisterKeypad calculate={calculateVariance} />
                    </div>
                    
                    <div className={rightColMask}></div>
                    <div className={rightCol}>
                        <div className={closedInputGroup}>
                            <label for="closed" className={label}>Closed:</label>
                            <input 
                                type="text" 
                                id="closed" 
                                name="closed" 
                                className={input}
                                disabled 
                                value={closedDateTime}
                            />
                        </div>

                        <div className={employeeInputGroup}>
                            <label for="opened" className={label}>By employee:</label>
                            <input 
                                type="text" 
                                id="user" 
                                name="user" 
                                className={input}
                                value={userName} 
                                disabled 
                            />
                        </div>

                        <hr className={hr} />
                    
                        <table className={table}>
                            <tr>
                                <td className={tdOpeningAmountLeft}>Opening Amount</td>
                                <td id="opening_amount" className={tdOpeningAmountRight}>
                                    <input 
                                        type="text" 
                                        id="opening_amount_input" 
                                        name="opening_amount" 
                                        className={tableInput} 
                                        value={`$${openedAmount.toFixed(2)}`}
                                        readonly
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={tdCashSalesLeft}>Cash Sales</td>
                                <td className={tdCashSalesRight}>
                                    <input 
                                        type="text" 
                                        id="cash_sales_input" 
                                        name="cash_sales" 
                                        className={tableInput}  
                                        value={`$${cashSales || '0.00'}`} 
                                        readonly 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={tdExpectedAmountLeft}>Expected Amount</td>
                                <td id="expected_amount" className={tdExpectedAmountRight}>
                                    <input 
                                        type="text" 
                                        id="expected_amount_input" 
                                        name="expected_amount" 
                                        className={tableInput}
                                        value={`$${expextedAmount || '0.00'}`}
                                        readonly
                                    />
                                </td> 
                            </tr>
                        </table>

                        <hr className={hr} />

                        <table className={table}>
                            <tr>
                                <td className={tdDrawerAmountLeft}>Drawer Amount</td>
                                <td className={tdDrawerAmountRight}>
                                    <input 
                                        type="text" 
                                        id="drawer_amount" 
                                        name="drawer_amount" 
                                        className={tableInput} 
                                        value={cashDrawerAmount || "$0.00"} 
                                        readonly 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={tdVarianceLeft}>Variance</td>
                                <td id="variance_amount" className={tdVarianceRight}>
                                    <input 
                                        type="text" 
                                        id="variance_amount_input" 
                                        name="variance_amount" 
                                        className={`${tableInput}} ${ 
                                            drawerVariance === 0.00 ? tableInputGreen : 
                                            drawerVariance < 0 ? tableInputRed : ""
                                        }`} 
                                        value={`$${drawerVariance !== undefined ? drawerVariance : '0.00'}`} 
                                        readonly
                                        disabled
                                    />
                                </td>
                            </tr>
                        </table>
                        <div 
                            className={ isDisabled ? closeButtonDisabled : closeButton }
                            // onClick={!isDisabled ? handleCloseRegister : () => {}}
                        >
                            Close Register
                        </div>
                    </div> 
                </div>
            </div>
        </div>

    )
}