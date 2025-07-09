// APPLICATION DEPENDENCIES
import { useState, useEffect } from 'react'

// LUCIDE ICONS DEPENDENCIES
import { ChevronDown } from "lucide-react"


export function StoreHours({ value = [], onChange }) {
	// STYLE
	const checkbox = `
		w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm 
		focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
		focus:ring-2 dark:bg-gray-700 dark:border-gray-600
	`
	const select = `
        w-full !h-[40px] rounded-lg text-[1rem] p-[0px] pl-[10px]
        border border-[#ccc] bg-[#fff] mt-[5px] text-[#5a5a5a]
        pr-[15px] focus:outline-none outline-none bg-white
        focus:border-[#60A5FA] appearance-none 
    `

	// STATE
	const [openHour, setOpenHour] = useState([
		"6:00 AM",
		"7:00 AM",
		"8:00 AM",
		"9:00 AM",
		"10:00 AM",
		"11:00 AM",
		"12:00 PM",
		"1:00 PM",
		"2:00 PM",
		"3:00 PM",
		"4:00 PM",
		"5:00 PM",
		"6:00 PM",
		"7:00 PM",
		"8:00 PM",
		"9:00 PM",
		"10:00 PM",
		"11:00 PM",
		"12:00 AM",
		"1:00 AM",
		"2:00 AM",
		"3:00 AM",
		"4:00 AM",
		"5:00 AM",
	])
	const [closeHour, setCloseHour] = useState([
		"6:00 AM",
		"7:00 AM",
		"8:00 AM",
		"9:00 AM",
		"10:00 AM",
		"11:00 AM",
		"12:00 PM",
		"1:00 PM",
		"2:00 PM",
		"3:00 PM",
		"4:00 PM",
		"5:00 PM",
		"6:00 PM",
		"7:00 PM",
		"8:00 PM",
		"9:00 PM",
		"10:00 PM",
		"11:00 PM",
		"12:00 AM",
		"1:00 AM",
		"2:00 AM",
		"3:00 AM",
		"4:00 AM",
		"5:00 AM",
	])
	const [isChecked, setIsChecked] = useState(false)

	function handleToggle(day) {
		const updated = value.includes(day)
			? value.filter(d => d !== day)
			: [...value, day]
		onChange(updated)
	}

	return (
		<div className="flex flex-col gap-2 mb-4 mt-[25px] w-[350px] ml-[30px]">
			<div className='flex flex-row gap-4'>
				<div className='text-[1.1rem] font-[600] w-[100px]'>Days Open</div>
				<div className='text-[1.1rem] font-[600] w-[120px]'>Open</div>
				<div className='text-[1.1rem] font-[600] w-[120px]'>Close</div>
			</div>

			<div className='flex flex-row w-full gap-6'>
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={isChecked}
						onChange={() => handleToggle('Monday')}
						className={checkbox}
					/>
					<div className='mt-[5px]'>Monday</div>
				</label>

				<div className="relative w-[140px]">
					<select className={select}>
						{openHour.map((hour) => (
							<option key={hour} value={hour}>{hour}</option>
						))}
					</select>
					<ChevronDown 
						size={15} 
						strokeWidth={3} 
						style={{
							position: "absolute",
							right: "15px",
							top: "24px",
							transform: "translateY(-50%)",
							pointerEvents: "none",
							color: "#4b5563", // Tailwind `text-gray-600`
							fontSize: "0.8rem"
						}}
					/>
				</div>

				<div className="relative w-[140px]">
					<select className={select}>
						{closeHour.map((hour) => (
							<option key={hour} value={hour}>{hour}</option>
						))}
					</select>
					<ChevronDown 
						size={15} 
						strokeWidth={3} 
						style={{
							position: "absolute",
							right: "15px",
							top: "24px",
							transform: "translateY(-50%)",
							pointerEvents: "none",
							color: "#4b5563", // Tailwind `text-gray-600`
							fontSize: "0.8rem"
						}}
					/>
				</div>
			</div>

			<div className='flex flex-row w-full gap-6'>
				<label className="flex items-center space-x-2">
					<input
						type="checkbox"
						checked={isChecked}
						onChange={() => handleToggle('Monday')}
						className={checkbox}
					/>
					<div className='mt-[5px]'>Tuesday</div>
				</label>

				<div className="relative w-[140px]">
					<select className={select}>
						{openHour.map((hour) => (
							<option key={hour} value={hour}>{hour}</option>
						))}
					</select>
					<ChevronDown 
						size={15} 
						strokeWidth={3} 
						style={{
							position: "absolute",
							right: "15px",
							top: "24px",
							transform: "translateY(-50%)",
							pointerEvents: "none",
							color: "#4b5563", // Tailwind `text-gray-600`
							fontSize: "0.8rem"
						}}
					/>
				</div>

				<div className="relative w-[140px]">
					<select className={select}>
						{closeHour.map((hour) => (
							<option key={hour} value={hour}>{hour}</option>
						))}
					</select>
					<ChevronDown 
						size={15} 
						strokeWidth={3} 
						style={{
							position: "absolute",
							right: "15px",
							top: "24px",
							transform: "translateY(-50%)",
							pointerEvents: "none",
							color: "#4b5563", // Tailwind `text-gray-600`
							fontSize: "0.8rem"
						}}
					/>
				</div>
			</div>

		</div>
	)
}