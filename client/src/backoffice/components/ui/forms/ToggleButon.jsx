// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react";

// COMPONENT: BUTTON SMALL
export default function ToggleButton({ label, onClick, disabled = false }) {
    // STYLES
    const button = `
        w-[auto] h-[40px] px-7 mt-2 mb-5 
        text-[1.1rem] font-[400] rounded-lg 
        flex items-center justify-center
        select-none cursor-pointer font-[600] shadow-md
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `


    // STATE
    const [isOn, setIsOn] = useState(false)

    const toggle = () => {
        setIsOn(!isOn);
      }

    // RENDER JSX
    return (
        <div className="flex items-center space-x-2">
            <div 
                onClick={toggle} 
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                isOn ? 'bg-blue-500' : 'bg-gray-300'
                }`}
            >
                <div 
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition duration-300 ${
                    isOn ? 'translate-x-6' : ''
                }`}
                />
            </div>
            <span className="text-gray-700">{label}</span>
        </div>
    )
}