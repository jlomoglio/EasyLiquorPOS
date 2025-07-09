import { useSelector } from "react-redux"
import { useEffect, useState } from 'react'

export default function RegisterInfo({ transactionId }) {
    // Styles
    const info = `
        flex flex row bg-[#DCE3E8] h-[100px] w-full select-none  pt-[10px]
    `
    const transactionIdCell = `
        flex flex-row h-[30px] pl-[15px] text-[1.2rem] text-[#5a5a5a] font-[600] justify-start col-span-2
    `
    const transactionIdSpan = `
        border-0 bg-[transparent] w-[135px] text-[#5a5a5a] ml-[-8px]
    `
    const employeeCell = `
        flex flex-row w-[50%] h-[30px] pl-[15px] text-[12px] text-[#5a5a5a] justify-start col-span-2
    `
    const inputMask = `
        bg-[transparent] min-w-[100%] h-[50px] absolute !z-[500] mt-[25px]
    `
    const employeeText = `
        text-[1rem] font-[500]
    `
    const employeeNameInput = `
        border-0 bg-[transparent] w-[100px] h-[40px] text-[#5a5a5a] ml-[5px] mt-[-9px] mb-[10px] text-[1rem]
    `
    const dateText = `
        h-[30px] text-left pr-[15px] text-[1rem] text-[#5a5a5a] font-[500] pl-[17px]
    `
    const timeText = `
        h-[30px] text-right pr-[15px] text-[1rem] text-[#5a5a5a] font-[500]
    `

    // Register Info State
    const [date, setDate] = useState()
    const [time, setTime] = useState()

    // REDUX
    const { userName } = useSelector((state) => state.login)

    // Get the date
    function getDate() {
        // Get the current date	
        const date = new Date()
    
        // Format the date
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    
        return formattedDate
    }

    // Updates the clock
    function updateClock() {
        // Get current time and format it
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", { 
            hour12: true, 
            hour: "numeric", 
            minute: "2-digit"
        });

        setTime(timeString)
    }
    
    // Sets the date and clock on first render
    useEffect(() => {
        setDate(getDate)
        const intervalId = setInterval(updateClock, 1000)

        return () => clearInterval(intervalId) // Cleanup interval on component unmount
    }, [])

    // RENDER JSX
    return (
        <div className={info}>
            <table className="w-full">
                <tbody>
                    <tr>
                        <td id="date" className={dateText}>{date}</td>
                        <td id="clock" className={timeText}>{time}</td>
                    </tr>
                    <tr>
                        <td className={transactionIdCell}>
                            <span>Transaction #</span> 
                            <span className={transactionIdSpan}>{transactionId}</span>
                        </td>
                    </tr>
                    <tr>
                    <td className={employeeCell}>
                            <span className={employeeText}>Employee:</span>
                            <div className={inputMask}></div>
                            <input 
                                className={employeeNameInput} 
                                defaultValue={userName} 
                                disabled 
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}