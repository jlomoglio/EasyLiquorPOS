import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from "lucide-react"

export function StoreHours({ value = {}, onChange }) {
	const checkbox = `
		appearance-none w-6 h-6 border border-gray-400 rounded-sm
		bg-white checked:bg-blue-600 checked:border-blue-600 
		focus:outline-none focus:ring-2 focus:ring-blue-500
		cursor-pointer
	`
	const select = `
		w-full !h-[40px] rounded-lg text-[1rem] p-[0px] pl-[10px]
		border border-[#ccc] bg-[#fff] mt-[5px] text-[#5a5a5a]
		pr-[35px] focus:outline-none bg-white focus:border-[#60A5FA] appearance-none
	`

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
	const hours = [
		"6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
		"1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
		"8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM",
		"3:00 AM", "4:00 AM", "5:00 AM"
	]

	const isFirstRender = useRef(true)

	// Init schedule state once from props
	const [schedule, setSchedule] = useState({})

	// 🔁 Sync value changes from parent (EXACTLY once per valid update)
	useEffect(() => {
		if (!value || typeof value !== 'object') return
	
		// If already initialized, skip
		if (Object.keys(schedule).length > 0) return
	
		console.log("🔁 Initializing schedule from value:", value)
		const initial = {}
		daysOfWeek.forEach(day => {
			const dayData = value[day] || {}
			initial[day] = {
				open: dayData.open || "9:00 AM",
				close: dayData.close || "11:00 PM",
				enabled: !!dayData.enabled
			}
		})
		setSchedule(initial)
	}, [value])

	// 🔁 Notify parent only when user makes a change (skip initial mount)
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		onChange({
			open_days: Object.entries(schedule)
				.filter(([_, d]) => d.enabled)
				.map(([day]) => day),
			store_hours: schedule
		})
	}, [schedule])

	function toggleDay(day) {
		setSchedule(prev => ({
			...prev,
			[day]: {
				...prev[day],
				enabled: !prev[day].enabled
			}
		}))
	}

	function updateTime(day, type, time) {
		setSchedule(prev => ({
			...prev,
			[day]: {
				...prev[day],
				[type]: time
			}
		}))
	}

	return (
		<div className="flex flex-col gap-2 mb-4 mt-[25px] ml-[30px] w-[450px]">
			<div className='flex flex-row gap-4 mb-2'>
				<div className='text-[1.1rem] font-[600] w-[120px]'>Store Hours</div>
				<div className='text-[1.1rem] font-[600] w-[120px]'>Open</div>
				<div className='text-[1.1rem] font-[600] w-[120px]'>Close</div>
			</div>

			{daysOfWeek.map((day) => {
				const dayData = schedule[day]
				if (!dayData) return null
                console.log("🔍 ENABLED STATE CHECK:", day, schedule[day])
				return (
					<div key={day} className='flex flex-row gap-4 items-center'>
						<label className="flex items-center space-x-2 w-[120px]">
                        <input
                            type="checkbox"
                            checked={!!(schedule[day] && schedule[day].enabled)}
                            onChange={() => toggleDay(day)}
                            className={checkbox}
                        />
							<span className='text-[0.95rem] mt-[2px]'>{day}</span>
						</label>

						<div className="relative w-[120px]">
							<select
								className={select}
								value={dayData.open}
								onChange={(e) => updateTime(day, "open", e.target.value)}
							>
								{hours.map(hour => (
									<option key={hour} value={hour}>{hour}</option>
								))}
							</select>
							<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600" size={16} />
						</div>

						<div className="relative w-[120px]">
							<select
								className={select}
								value={dayData.close}
								onChange={(e) => updateTime(day, "close", e.target.value)}
							>
								{hours.map(hour => (
									<option key={hour} value={hour}>{hour}</option>
								))}
							</select>
							<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600" size={16} />
						</div>
					</div>
				)
			})}
		</div>
	)
}
