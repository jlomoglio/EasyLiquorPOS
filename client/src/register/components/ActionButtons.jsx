// COMPONENT DEPENDENCIES
import ActionButton from "./ActionButton"

// COMPONENT: ACTION BUTTONS
export default function ActionButtons({ transactionId, onShowCashPayment, onProcessCredit, onVoidTransaction, onPrint }) {
    // STYLES
    const container = `
        bg-[#EEEEEE] absolute left-0 right-0 bottom-0 h-[365px]
    `
    const mask = `
        bg-[transparent] absolute left-0 right-0 bottom-0 h-[365px]
        select-none !z-[500]
    `
    const actionButton = `
        h-[165px] w-[50%] p-[0px] pt-[60px] text-center text-[#A1A1A1] 
        font-[600] mt-[5px] mb-[10px] ml-[5px] mr-[5px] justify-center 
        text-[2.3rem] select-none cursor-pointer rounded-xl flex
    `
    const topRow = `
        flex flex-row absolute top-[6px] bottom-[135px] left-[6px] right-[6px]
    `
    const bottomRow = `
        flex flex-row absolute bottom-0 left-[6px] right-[6px]
    `
    
    

    // SIMULATE CREDIT CARD PROCESSING
    function processCreditCard() {
        // You might still want to call a prop like onSetSalesType('credit')
		console.log("💳 Simulating credit payment...")
    }

    // RENDER JSX
    return (
        <div className={container}>
            { !transactionId && <div className={mask}></div> }
            <div className={topRow}>
                <ActionButton 
                    label="Credit" 
                    isDisabled={!transactionId} 
                    className={actionButton}
                    onClick={onProcessCredit}
                />
                <ActionButton 
                    label="Cash" 
                    isDisabled={!transactionId} 
                    className={actionButton}
                    onClick={onShowCashPayment}
                />
            </div>
            <div className={bottomRow}>
                <ActionButton 
                    label="Print" 
                    isDisabled={!transactionId} 
                    className={actionButton} 
                    onClick={onPrint}
                />
                <ActionButton 
                    label="Void" 
                    isDisabled={!transactionId} 
                    className={actionButton}
                    onClick={onVoidTransaction}
                />
            </div>
        </div>
    )
}