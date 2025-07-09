// APPLICATION DEPENDENCIES
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { 
	setUserId as setRegisterUserId, 
	setUserName as setRegisterUserName,
	setRole as setRegisterRole 
} from '../features/loginSlice'
import { 
	setUserId as setBackUserId, 
	setUserName as setBackUserName, 
	setFirstName,
	setRole as setBackRole,
	setFirstTimeLogin,
} from '../features/backofficeLoginSlice'
import { setTenantId } from '../features/tenantSlice'
import { apiFetch } from '../utils/api.js'

// COMPONENT DEPENDENCIES
import logo from '../assets/EasyLiquor_POS_big_logo.png'
import InputGroup from '../backoffice/components/ui/forms/InputGroup.jsx'
import SelectGroup from '../backoffice/components/ui/forms/SelectGroup'

export default function LoginPortal() {
	// STYLES
	const wrapper = `
        fixed top-0 left-0 right-0 bottom-0 bg-[#3994DF] flex flex-col 
        items-center overflow-hidden jstify-center-center
    `
	const logoImg = `
        w-[600px] mt-[150px]
    `
	const formWrapper = `
        w-[600px] h-[600px]
    `
	const loginButton = `
        w-[560px] h-[60px] bg-white text-center text-[1.6rem] text-[#5a5a5a] font-[600]
        cursor-pointer mt-[70px] rounded-lg shadow-lg pt-[12px] ml-[20px]
    `
	const copyright = `
        absolute left-0 right-0 bottom-[25px] h-[20px] text-center
        text-[.9rem] ml-[-20px] text-white
    `




	// DATE FOR COPYRIGHT
	const year = new Date().getFullYear()

	// NAVIGATION: Used to change route
	const navigate = useNavigate()

	// REDUX
	const dispatch = useDispatch()

	// STATE
	const [formData, setFormData] = useState({ username: "", password: "", application: "" })
	const [error, setError] = useState(null)
	
	// HANDLE INPUT CHANGE
	function handleInputChange(name, value) {
		setFormData((prevData) => ({
			...prevData,
			[name]: value
		}))
	}

	useEffect(() => {
		localStorage.clear()
		dispatch(setRegisterUserId(null))
		dispatch(setRegisterUserName(null))
		dispatch(setTenantId(null))
	}, [])

	const handleLogin = async () => {
		try {
			const data = await apiFetch('/api/pos_login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: formData.username,
					password: formData.password,
					mode: formData.application // ✅ use this
				}),
			})
	
			if (!data.success) throw new Error('Login failed')
	
			const { user, store } = data
	
			localStorage.setItem('userId', user.id)
			localStorage.setItem('tenantId', store.tenant_id)
			localStorage.setItem('role', user.role)
	
			dispatch(setTenantId(store.tenant_id))
	
			if (formData.application === 'register') {
				dispatch(setRegisterUserId(user.id))
				dispatch(setRegisterUserName(user.username))
				dispatch(setRegisterRole(user.role))
				navigate('/pos/register')
			} 
			else {
				dispatch(setBackUserId(user.id))
				dispatch(setBackUserName(user.username))
				dispatch(setFirstName(user.fname))
				dispatch(setBackRole(user.role))
				dispatch(setFirstTimeLogin(user.first_time_login))
				navigate(user.first_time_login ? '/pos/backoffice/welcome' : '/pos/backoffice/dashboard')
			}
		} catch (err) {
			console.log('❌ Login failed: ' + err.message)
		}
	}
	

	return (
		<>
			<div className={wrapper}>
				<img src={logo} alt="" className={logoImg} />
				<div className={formWrapper}>
					<InputGroup
						label="Username"
						labelColor="white"
						name="username"
						type="text"
						value={formData.username}
						onChange={handleInputChange}
						required
					/>
					<InputGroup
						label="Password"
						name="password"
						labelColor="white"
						type="password"
						value={formData.password}
						onChange={handleInputChange}
						required
					/>

					<SelectGroup
						label="Application"
						labelColor="white"
						selectText="Select a section"
						value={formData.application}
						onChange={(name, value) => {
							handleInputChange("application", value)
						}}
						error={error}
						options={[
							{ value: "register", label: "Cash Register" },
							{ value: "backoffice", label: "Backoffice" },
						]}
						required
					/>
					<div className={loginButton} onClick={handleLogin}>LOGIN</div>

					{error && <p className="text-red-600 mt-2">{error}</p>}
				</div>

				<div className={copyright}>
					Copyright © {year} EasyLiquor POS. All rigths reserved.
				</div>
			</div>
		</>
	)
}

