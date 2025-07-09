// COMPONENT SUCCESS ALERT
export default function SuccessAlert({ message }) {
    if (!message) return null  // Prevent rendering if no message exists

    // STYLES
    const alert = `
        min-w-[400px] w-[auto] h-[60px] rounded-lg 
        bg-emerald-600 z-[500] text-white flex flex-row !text-center justify-center
        p-[10px] pt-[15px] shadow-xl text-[1.2rem] absolute left-1/3
        top-[50px]
    `

    // RENDER JSX
    return (
        <div className={alert}>
            {message}
        </div>
    )
}
