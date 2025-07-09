// APPLICATION DEPENDENCIES
import { useRef } from "react"

// COMPONENT: INPUT GROUP
export default function InputGroup({ 
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
        w-full bg-gray-100 px-4 py-2 rounded-md border ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        border-gray-300 focus:outline-none focus:ring focus:ring-blue-500
    `
    
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `


    // HANDLE INPUT CHANGE
    const handleChange = (name, value) => {
        let formattedValue = value;
      
        if (type === "numbers" && length) {
          formattedValue = value.replace(/\D/g, "").slice(0, Number(length));
        }
      
        if (type === "currency") {
          formattedValue = value
            .replace(/[^0-9.]/g, "")
            .replace(/^(\d*\.?\d{0,2}).*$/, "$1");
        }
      
        if (type === "phone") {
          let numbers = value.replace(/\D/g, "").slice(0, 10);
          formattedValue =
            numbers.length > 6
              ? `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
              : numbers.length > 3
              ? `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
              : numbers.length > 0
              ? `(${numbers}`
              : "";
        }
      
        if (type === "zip") {
          formattedValue = value.replace(/\D/g, "").slice(0, 5);
        }
      
        // ✅ Call parent onChange correctly
        onChange(name, formattedValue);
      };
      
    
    

    // RENDER JSX
    return (
        <div className={wrapper} style={{ marginBottom: space}}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <input 
                ref={ref}
                className={input}
                type={type} 
                name={name}
                value={value}
                onChange={(e) => handleChange(name, e.target.value)}
                onKeyDown={(e) => {
                    if (type === 'letters') {
                        if (!/[a-zA-Z ]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                            e.preventDefault();
                        }
                    } 
                    else if (type === 'numbers') {
                        if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                            e.preventDefault();
                        }
                    } 
                    else if ((type === 'numbers' || type === 'phone' || type === 'zip') && !/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                        e.preventDefault();
                    } 
                    else if (type === 'email') {
                        const allowedEmailChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._";
                        if (!allowedEmailChars.includes(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                            e.preventDefault();
                        }
                    }
                }}
                onClick={onClick}
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    )
}