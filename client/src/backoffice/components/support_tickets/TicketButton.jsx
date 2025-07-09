export default function TicketButton({ onClick, label, color = "#3B82F6", width = null}) {
    // STYLES
    const button = `
        inline-flex items-center justify-center
        mt-2 mb-5 px-4 py-2
        text-md font-semibold text-white
        rounded-lg
        cursor-pointer select-none
        hover:bg-[#004fd1] transition
    `

    return (
        <div className={button} onClick={onClick} style={{ backgroundColor: color, width: width}} >
            {label}
        </div>
    );
}