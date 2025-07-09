// APPLICATION DEPENDICES
import { useEffect } from "react"

// COMPONENT: BUTTON SMALL
export default function ButtonAuto({ label, type, color, onClick, disabled = false }) {
    // STYLES
    const button = `
        h-[40px] text-small px-4 py-3 rounded 
        flex items-center justify-center
        select-none cursor-pointer shadow-md
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `

    // RENDER JSX
    return (
        <div 
            className={
                type === 'solid' ? 
                    `${button} bg-blue-500 text-white` :
                    `${button} bg-[#fff] text-[#5a5a5a] border border-[#ccc]`
            }
            style={{
                backgroundColor: type === "solid" 
                    ? (disabled ? "#ccc" : color || "bg-blue-500") 
                    : "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                pointerEvents: disabled ? "none" : "auto"
            }}
            type={type} 
            onClick={!disabled ? onClick : undefined}
        >
            {label}
        </div>
    )
}


