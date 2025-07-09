// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import SalesTaxInputGroup from "../../components/ui/forms/SalesTaxInputGroup"
import Button from "../../components/ui/forms/Button"
import { toast } from 'react-hot-toast'
import { ChevronDown } from "lucide-react"

// COMPONENT: STORE
export default function EditStore() {
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

	// LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

	const customValidations = {
		pin: (value) => /^\d{6}$/.test(value) ? null : "PIN must be exactly 6 digits",
		zip: (value) => /^\d{5}$/.test(value) ? null : "Zip Code must be exactly 5 digits",
		sales_tax: (value) => /^0\.\d{2}$/.test(value) ? null : "Must be decimal format (e.g., 0.07)"
	}

	const dispatch = useDispatch()

	const [formData, setFormData] = useState({
		sales_tax: "",
		store_hours: []
	})

	const defaultHours = {
		open: "9:00 AM",
		close: "11:00 PM",
		enabled: false
	}

	const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

	const hours = [
		"6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
		"1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
		"8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM",
		"3:00 AM", "4:00 AM", "5:00 AM"
	]

	const [schedule, setSchedule] = useState({})


	useEffect(() => {
		dispatch(setView("Store"))
		dispatch(setMenuDisabled(false))
	}, [])

	const [errors, setErrors] = useState({})

	function handleChange(name, value) {
		if (name === "store_hours") {
			setFormData((prev) => ({
				...prev,
				open_days: value.open_days,
				store_hours: value.store_hours
			}))
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }))
		}
	}

	useEffect(() => {
		async function fetchStoreData() {
			try {
				const resData = await apiFetch(`/api/store`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                })

				const rawHours = typeof resData.store.store_hours === "string"
					? JSON.parse(resData.store.store_hours)
					: resData.store.store_hours || {}

				const openDays = typeof resData.store.open_days === "string"
					? resData.store.open_days.split(',')
					: resData.store.open_days || []

				const updatedSchedule = {}
				daysOfWeek.forEach(day => {
					updatedSchedule[day] = {
						open: rawHours[day]?.open || defaultHours.open,
						close: rawHours[day]?.close || defaultHours.close,
						enabled: openDays.includes(day)
					}
				})

				setSchedule(updatedSchedule)

				setFormData({
					...resData.store,
					id: String(resData.store.id || "1"),
					sales_tax: String(resData.store.sales_tax || ""),
					open_days: openDays,
					store_hours: updatedSchedule
				})
			} catch (error) {
				console.error("❌ Error fetching store data:", error)
			}
		}

		fetchStoreData()
	}, [])

	function toggleDay(day) {
		const updated = { ...schedule }
		updated[day].enabled = !updated[day].enabled
		setSchedule(updated)
		handleChange("store_hours", {
			open_days: Object.keys(updated).filter(d => updated[d].enabled),
			store_hours: updated
		})
	}

	function updateTime(day, field, value) {
		const updated = { ...schedule }
		if (updated[day]) {
			updated[day][field] = value
		}
		setSchedule(updated)
		handleChange("store_hours", {
			open_days: Object.keys(updated).filter(d => updated[d].enabled),
			store_hours: updated
		})
	}

	async function handleFormSubmit(formData) {
		const storeHoursRaw = formData.store_hours || {}

		const openDays = Object.entries(storeHoursRaw)
			.filter(([day, data]) => data.enabled)
			.map(([day]) => day)

		const storeHours = {}
		openDays.forEach(day => {
			storeHours[day] = {
				open: storeHoursRaw[day].open,
				close: storeHoursRaw[day].close
			}
		})

		const payload = {
			...formData,
			open_days: openDays.join(','),
			store_hours: JSON.stringify(storeHours),
			tenant_id: localStorage.getItem("tenant_id")
		}

		try {
			const response = await apiFetch("/api/update_store", {
				method: "PUT",
				headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
				body: JSON.stringify(payload)
			})
			toast.success("Store Info was successfully updated")
		} catch (err) {
			console.error("❌ Update Error:", err)
			setErrors({ general: "An error occurred while updating the store" })
		}
	}

	return (
		<>
			<div className="ml-[-20px] mt-[-20px] flex flex-col w-[450px]">
				<div className="w-full">
					<SalesTaxInputGroup
						name="sales_tax"
						label="SALES TAX"
						type="text"
						value={formData.sales_tax}
						onChange={handleChange}
					/>
				</div>

				<div className="flex flex-col gap-2 mb-4 mt-[25px] ml-[30px] w-[450px]">
					<div className='flex flex-row gap-4 mb-2'>
						<div className='text-[1.1rem] font-[600] w-[120px]'>Store Hours</div>
						<div className='text-[1.1rem] font-[600] w-[120px]'>Open</div>
						<div className='text-[1.1rem] font-[600] w-[120px]'>Close</div>
					</div>

					{daysOfWeek.map((day) => {
						const dayData = schedule[day]
						if (!formData || Object.keys(schedule).length === 0) return null
						return (
							<div key={day} className='flex flex-row gap-4 items-center'>
								<label className="flex items-center space-x-2 w-[120px]">
									<input
										type="checkbox"
										checked={!!dayData.enabled}
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

				<div className="mt-[40px] ml-[20px] flex flex-row">
					<Button 
						label="Update"
						type="solid"
						onClick={() => handleFormSubmit(formData)}  
					/>
					
					<span className="mr-[15px]"></span>
					
					<Button 
						label="Reset" 
						type="outline"
						onClick={() => {
							setFormData()
							handleClearErrors()
						}}
					/>
				</div>
			</div>
		</>
	)
}
