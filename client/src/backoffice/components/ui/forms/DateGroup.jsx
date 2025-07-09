// APPLICATION DEPENDENCIES
import { useRef } from "react"

// LUCIDE ICONS DEPENDENCIES
import { Calendar } from "lucide-react"


// COMPONENT: DATE GROUP
export default function DateGroup({
    label, 
    labelColor,
    name,
    value,
    type = "date",
    onChange,
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
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `
    const inputWrapper = `
        relative w-full h-[40px]
    `
    const input = `
        w-full h-[40px] rounded-lg text-[1rem] p-[10px]
        border border-gray-300 bg-[#fff] mt-[5px] text-[#5a5a5a]
        focus:outline-none focus:ring focus:ring-blue-500
        bg-gray-100
    `
    const calendarIcon = `
        fa-regular fa-calendar text-[1.1rem] text-[#5a5a5a] cursor-pointer 
        absolute top-[45%] right-[15px] transform -translate-y-1/2 pt-[17px]
    `


    // REFERENCE FOR INPUT FIELD
    const inputRef = useRef(null)


    // FUNCTION TO TRIGGER DATE PICKER WHEN CLICKING ICON
    function handleIconClick() {
        if (inputRef.current) {
            inputRef.current.showPicker() // Opens the date picker
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
            <div className={inputWrapper}>
                <input 
                    ref={inputRef}
                    type={type}
                    className={input} 
                    name={name} 
                    onChange={(e) => onChange(e.target.value)} 
                    value={value}
                />
                <Calendar 
                    size={20} 
                    strokeWidth={2}
                    onClick={handleIconClick}
                    style={{
                        position: "absolute",
                        right: "15px",
                        top: "25px",
                        transform: "translateY(-50%)",
                        pointerEvents: "auto",
                        color: "#5a5a5a",
                        fontSize: "1rem"
                    }}
                />
            </div>
        </div>
    )
}