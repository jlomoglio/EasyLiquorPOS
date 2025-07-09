// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"

// COMPONENT: INPUT GROUP
export default function PinInputGroup({ 
    label, 
    labelColor,
    name,
    value,
    onChange,
    onClick, 
    error, 
    required
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
        w-full h-[40px] rounded-lg text-[1rem] p-[10px]
        border border-[#ccc] bg-[#fff] mt-[5px] text-[#5a5a5a]
        focus:outline-none outline-none focus:border-[#60A5FA]
    `
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `
    const tooltip = `
        absolute right-[20px] top-[0] mt-1 bg-gray-900 text-white 
        text-xs p-2 rounded shadow-lg z-[100]
    `

    // STATE
    const [localValue, setLocalValue] = useState(value || "")


    useEffect(() => {
        setLocalValue(/^\d{0,6}$/.test(value) ? value : "")
    }, [value])


    // HANDLE INPUT CHANGE
    const handleChange = (event) => {
        let inputValue = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    
        if (inputValue.length > 6) {
            inputValue = inputValue.slice(0, 6); // Limit to 6 digits
        }
    
        setLocalValue(inputValue); // Update local state
    
        // ✅ Call onChange with name, value (not wrapped in `target`)
        if (onChange) {
            // Try both formats
            if (typeof onChange === 'function') {
              onChange(name, inputValue); // preferred
            } else {
              onChange(inputValue); // fallback
            }
          }
    }

    // PREVENT NON-NUMERIC INPUT
    const handleKeyDown = (event) => {
        if (!/^\d$/.test(event.key) && event.key === "Backspace" && event.key === "Delete" && event.key === "ArrowLeft" && event.key === "ArrowRight") {
            //event.preventDefault() // Block invalid input
            return
        }
    }
    

    // RENDER JSX
    return (
        <div className={wrapper}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <input 
                className={input} 
                name={name}
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onClick={onClick}
            />
        </div>
    )
}