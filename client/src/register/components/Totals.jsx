export default function Totals({ subtotal = 0, tax = 0, total = 0}) {
    const totals = `
        flex flex-col absolute left-[0] top-[110px] 
        right-[0px] !bottom-[365px] bg-[#fff] min-w-[100%]
    `
    const totalsInnerWrapper = `
        flex flex-col absolute left-[0] top-[0px] 
        right-[10px] !bottom-[0px] bg-[#fff]
        pb-[10px] mr-[10px]
    `
    const label = `
        text-[1.3rem] font-[500] text-black
    `
    const inputMask = `
        bg-[transparent] min-w-[100%] h-[50px] absolute !z-[500] mt-[25px]
    `
    const input = `
        bg-[transparent] min-w-[100%] font-[700]
        text-[2.1rem] text-center text-[black] select-none
    `
    const taxClass = `
        flex flex-col w-full h-[33.3%] relative 
        bg-[#C7CBCF] ml-[10px] mr-[10px] mt-[10px]
        justify-center pt-[1%] select-none rounded-xl text-center
    `
    const subTotalClass = `
        flex flex-col w-full h-[33.3%] relative 
        bg-[#C7CBCF] ml-[10px]
        justify-center select-none rounded-xl text-center
    `
    const totalClass = `
        flex flex-col w-full h-[33.3%] relative
         bg-[#C7CBCF] ml-[10px] mr-[10px] mt-[10px]
        justify-center select-none rounded-xl text-center
    `


    return (
        <div className={totals}>
            <div className={totalsInnerWrapper}>
                <div className={subTotalClass}>
                    <div className={label}>Subtotal</div>
                    <div className={inputMask}></div>
                    <input className={input} value={`$${subtotal.toFixed(2)}`} disabled />
                </div>

                <div className={taxClass}>
                    <div className={label}>Tax (6%)</div>
                    <div className={inputMask}></div>
                    <input className={input} value={`$${tax.toFixed(2)}`} disabled />
                </div>

                <div className={totalClass}>
                    <div className={label}>Total</div>
                    <div className={inputMask}></div>
                    <input className={input} value={`$${total.toFixed(2)}`} disabled />
                </div>
            </div>
        </div>
    )
}
