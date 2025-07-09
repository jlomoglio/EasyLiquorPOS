// APPLICATION DEPENDENCIES
import { useRef } from "react"

// COMPONENT: INPUT GROUP
export default function DisplayInputGroup({ 
    ref,
    label, 
    labelColor, 
    type,
    length,
    space = "35px",
    name,
    value,
    onChange = () => {},
    onClick, 
    error, 
    required,
    disabled = false,
    placeholder,
}) {
    // STYLES
    const wrapper = `
        w-full h-[60px] flex flex-col justify-start p-[20px]
        mt-[10px] mb-[35px] relative
    `
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600]
        flex flex-row justify-start font-[Roboto]
    `
    const labelTextWhite = `
        text-white text-[1rem] font-[600]
        flex flex-row justify-start font-[Roboto]
    `
    const input = `
        w-full bg-gray-100 px-4 py-2 rounded-md border cursor-not-allowed
        border-gray-300 focus:outline-none focus:none select-none
    `
    
    

    // RENDER JSX
    return (
        <div className={wrapper} style={{ marginBottom: space}}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
            </div>
            <input 
                ref={ref}
                className={input}
                type={type} 
                name={name}
                value={value}
                disabled={disabled}
            />
        </div>
    )
}