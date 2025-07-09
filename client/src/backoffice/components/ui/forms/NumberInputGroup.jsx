// APPLICATION DEPENDENCIES
import { useRef } from "react"


// COMPONENT: NUMBER INPUT GROUP
export default function NumberInputGroup({
    label, 
    labelColor,
    name,
    value,
    step,
    min,
    onChange,
    error, 
    required,
    disabled
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
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `
    const inputWrapper = `
        relative w-full h-[40px]
    `
    const input = `
        w-full h-[40px] rounded-lg text-[1rem] p-[10px]
        border border-[#ccc] bg-[#fff] mt-[5px] text-[#5a5a5a]
        focus:outline-none outline-none focus:border-[#60A5FA]
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `


    // REFERENCE FOR INPUT FIELD
    const inputRef = useRef(null)


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
            <div className={inputWrapper}>
                <input 
                    ref={inputRef}
                    type="number" 
                    className={input}
                    step={step}
                    min={min} 
                    name={name} 
                    onChange={onChange} 
                    value={value}
                />
            </div>
        </div>
    )
}