// COMPONENT: BUTTON SMALL
export default function ButtonSmall({ label, Icon, type, color, onClick, disabled = false }) {
    // STYLES
    const button = `
        h-[34px] px-7 mt-2 mb-5 
        text-small px-3 py-2 rounded
        flex items-center justify-center
        select-none shadow-md
        ${type === 'solid' ? 'bg-blue-500 text-white' : 'bg-white text-[#5a5a5a] border border-[#ccc]'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
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
                    ? (disabled ? "#ccc" : color || "#3B82F6") // actual blue-500 hex
                    : "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
                pointerEvents: disabled ? "none" : "auto"
            }}
            type={type} 
            onClick={!disabled ? onClick : undefined}
            onKeyDown={(e) => e.key === "Enter" && handleClick()} 
        >
            {Icon && 
                <Icon 
                    size={20} 
                    strokeWidth={3.5} 
                    color={type === 'solid' ? "#fff" : "#5a5a5a"} 
                    style={{ marginRight: '8px'}}
                />
            } {label}
        </div>
    )
}


