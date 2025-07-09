import { Trash2 } from 'lucide-react'

// COMPONENT: CART ITEM
export default function CartItem({ index, removeItem, price, productName }) {
    // STYLES
    const itemWrapper = `
        w-full h-[65px] bg-[#F3F3F3] flex flex-row mb-[10px]
    `
    const itemText = `
        text-[1.3rem] text-[#5a5a5a] pl-[20px] font-[500] mt-[16px]
    `
    const itemPrice = `
        text-[1.3rem] text-[#5a5a5a] w-[100px] absolute 
        right-[70px] font-[500] mt-[16px]
    `
    const itemDelete = `
        w-[40px] h-[40px] absolute right-[20px] !bg-[red] 
        rounded-sm !text-[1.3rem] text-white font-[900] pt-[4px] select-none
        cursor-pointer mt-[12px] text-center
    `

    // RENDER JSX
    return (
        // <div className={itemWrapper} key={index}>
        //     <div className={itemText}>{productName}</div>
        //     <div className={itemPrice}>${price}</div>
        //     <div className={itemDelete} onClick={() => removeItem(index)}>X</div>
        // </div>
        <div
            key={index}
            className="flex justify-between items-center bg-white shadow rounded-lg px-4 py-3"
        >
            <span className="text-gray-800 font-medium">{productName}</span>
            <div className="flex items-center gap-4">
            <span className="text-gray-800 font-semibold">${price.toFixed(2)}</span>
            <button 
                className="text-red-600 hover:text-red-800 ml-[10px] mr-[15px] cursor-pointer" 
                onClick={() => removeItem(index)}
            >
                <Trash2 size={20} />
            </button>
            </div>
        </div>
    )
}