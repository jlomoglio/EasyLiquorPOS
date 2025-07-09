export default function Button({ label, Icon, type, color, onClick, disabled = false }) {
    // STYLES
    const button = `
        h-[40px] px-7 mt-2 mb-5 
        text-small px-4 py-3 rounded
        flex items-center justify-center
        select-none cursor-pointer shadow-md
    `

    return (
        <div 
            className={
                type === 'solid' ? 
                    `${button} bg-blue-500 text-[#fff]` :
                    `${button} bg-[#fff] text-[#5a5a5a] border border-[#ccc]`
            }
            style={{
                backgroundColor: type === "solid" 
                    ? (disabled ? "#ccc" : "#3B82F6") 
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
                />
            } {label}
        </div>
    );
}


