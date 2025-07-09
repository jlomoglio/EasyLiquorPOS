// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"

// COMPONENT: SALES TAX INPUT GROUP
export default function SalesTaxInputGroup({ 
    labelColor, 
    type, 
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
        setLocalValue(value || ""); // Ensure it resets when parent updates
    }, [value])

    // HANDLE INPUT CHANGE
    const handleSalesTaxChange = (event) => {
        const { name, value } = event.target;
        let inputValue = value.replace(/\D/g, ""); // Strip non-digits
    
        if (inputValue === "") {
            setLocalValue("");
            onChange(name, "");
            return;
        }
    
        if (inputValue.length > 2) {
            inputValue = inputValue.slice(0, 2); // Max 2 digits
        }
    
        let formattedValue = inputValue;
        if (inputValue.length === 1) {
            formattedValue = `0.0${inputValue}`;
        } else if (inputValue.length === 2) {
            formattedValue = `0.${inputValue}`;
        }
    
        setLocalValue(formattedValue);
        onChange(name, formattedValue); // ✅ Corrected this
    }

    // HANDLE KEYDOWN FOR BACKSPACE
    const handleKeyDown = (event) => {
        if (event.key === "Backspace") {
            setLocalValue(""); // Completely clear input on backspace
            onChange({ target: { name, value: "" } });
        }
    }
    

    // RENDER JSX
    return (
        <div className={wrapper}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                SALES TAX
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <input 
                className={input} 
                type={type} 
                name={name}
                value={localValue}
                onChange={(name, value) => handleSalesTaxChange(name, value)}
                onKeyDown={handleKeyDown}
                onClick={onClick}
            />
        </div>
    )
}