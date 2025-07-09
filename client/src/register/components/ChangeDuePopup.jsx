import { useEffect, useState } from "react";
import { useSelector } from "react-redux";


// COMPONENT: CHANGE DUE POPUP
export default function ChangeDuePopup({ completeTransaction }) {
    // STYLES
    const wrapper = `
        h-[520px] w-[600px] p-[10px] pr-0 mt-[0px] z-[100] flex flex-column 
        absolute top-[100px] left-0 right-0 ml-[auto] mr-[auto] rounded-lg 
        shadow-lg bg-[#ccc] z-[150]
    `

    const header = `w-full flex flex-column justify-center mt-[15px]`;
    const cashPaymentLabel = `text-[1.3rem] text-center text-[#5a5a5a] font-[500] 
        h-[20px] font-[400] absolute left-0 right-0 top-[20px]`;
    const changeDueLabel = `text-[1.6rem] text-center text-[#5a5a5a] font-[900] mt-[20px] 
        w-full absolute left-0 right-0 top-[25px]`;
    const valuesWrapper = `text-[100px] absolute left-0 right-0 text-center mt-[75px] 
        h-[34px] p-[10px]`;
    const changeDueInput = `border border-[0px] bg-[transparent] h-[100px] absolute left-0 
        right-0 text-center text-[#5a5a5a]`;
    const paidAmountInput = `border border-[0px] bg-[transparent] h-[30px] text-[1.6rem] font-[400] 
        text-[#5a5a5a] text-center absolute left-0 right-0 top-[130px] text-center`;
    const completeTransactionWrapper = `absolute left-0 right-0 text-center mt-[240px] h-[34px] 
        p-[10px] flex justify-center text-[1.7rem]`;
    const button = `w-[400px] h-[150px] rounded-lg shadow-lg !bg-[green] mt-[45px] 
        text-white font-[600] absolute top-[50px] left-1/6`;

    // STATE
    const [changeDue, setChangeDue] = useState();
    const [rawAmountPaid, setRawAmountPaid] = useState();

    // REDUX
    const { amountPaid, total } = useSelector((state) => state.cart)


    // CALCULATE CHANGE DUE
    useEffect(() => {
        let rawAmount = parseFloat(String(amountPaid || "0").replace("$", ""));
        setRawAmountPaid(rawAmount);
        setChangeDue(Number((rawAmount - total).toFixed(2)));
    }, [amountPaid, total])

    return (
        <>
            <div id="change-due-popup" className={wrapper}>
                <div className={header}>
                    <div className={cashPaymentLabel}>Cash Payment</div>
                    <div className={changeDueLabel}>Change Due</div>
                </div>
                <div className={valuesWrapper}>
                    <input 
                        id="change-due-value" 
                        className={changeDueInput}
                        value={`$${changeDue !== undefined ? changeDue.toFixed(2) : "0.00"}`}  
                        disabled 
                    />
                    <input 
                        id="change-due-amount-paid" 
                        className={paidAmountInput}
                        value={`(Paid $${rawAmountPaid !== undefined ? rawAmountPaid.toFixed(2) : "0.00"})`}  
                        disabled
                    />
                </div>
                <div className={completeTransactionWrapper}>
                    <button
                        onClick={() => completeTransaction("cash")}
                        className={button}
                    >
                        Complete Transaction
                    </button>
                </div>
            </div>
        </>
    );
}





