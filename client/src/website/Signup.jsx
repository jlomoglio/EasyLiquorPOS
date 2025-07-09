import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import TermsModal from './components/TermsModal'
import SignupSuccessModal from './components/SignupSuccessModal'
import { apiFetch } from '../utils/api'

const states = [
	{ label: 'Alabama', value: 'AL' }, { label: 'Alaska', value: 'AK' }, { label: 'Arizona', value: 'AZ' },
	{ label: 'Arkansas', value: 'AR' }, { label: 'California', value: 'CA' }, { label: 'Colorado', value: 'CO' },
	{ label: 'Connecticut', value: 'CT' }, { label: 'Delaware', value: 'DE' }, { label: 'Florida', value: 'FL' },
	{ label: 'Georgia', value: 'GA' }, { label: 'Hawaii', value: 'HI' }, { label: 'Idaho', value: 'ID' },
	{ label: 'Illinois', value: 'IL' }, { label: 'Indiana', value: 'IN' }, { label: 'Iowa', value: 'IA' },
	{ label: 'Kansas', value: 'KS' }, { label: 'Kentucky', value: 'KY' }, { label: 'Louisiana', value: 'LA' },
	{ label: 'Maine', value: 'ME' }, { label: 'Maryland', value: 'MD' }, { label: 'Massachusetts', value: 'MA' },
	{ label: 'Michigan', value: 'MI' }, { label: 'Minnesota', value: 'MN' }, { label: 'Mississippi', value: 'MS' },
	{ label: 'Missouri', value: 'MO' }, { label: 'Montana', value: 'MT' }, { label: 'Nebraska', value: 'NE' },
	{ label: 'Nevada', value: 'NV' }, { label: 'New Hampshire', value: 'NH' }, { label: 'New Jersey', value: 'NJ' },
	{ label: 'New Mexico', value: 'NM' }, { label: 'New York', value: 'NY' }, { label: 'North Carolina', value: 'NC' },
	{ label: 'North Dakota', value: 'ND' }, { label: 'Ohio', value: 'OH' }, { label: 'Oklahoma', value: 'OK' },
	{ label: 'Oregon', value: 'OR' }, { label: 'Pennsylvania', value: 'PA' }, { label: 'Rhode Island', value: 'RI' },
	{ label: 'South Carolina', value: 'SC' }, { label: 'South Dakota', value: 'SD' }, { label: 'Tennessee', value: 'TN' },
	{ label: 'Texas', value: 'TX' }, { label: 'Utah', value: 'UT' }, { label: 'Vermont', value: 'VT' },
	{ label: 'Virginia', value: 'VA' }, { label: 'Washington', value: 'WA' }, { label: 'West Virginia', value: 'WV' },
	{ label: 'Wisconsin', value: 'WI' }, { label: 'Wyoming', value: 'WY' }
]

const formatPhone = (value) => {
	const digits = value.replace(/\D/g, '').slice(0, 10)
	const match = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
	if (!match) return value

	let formatted = ''
	if (match[1]) {
		formatted += `(${match[1]}`
		if (match[1].length === 3) formatted += ')'
	}
	if (match[2]) {
		formatted += ` ${match[2]}`
	}
	if (match[3]) {
		formatted += `-${match[3]}`
	}
	return formatted
}

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

export default function Signup() {
	const navigate = useNavigate()
	const [formData, setFormData] = useState(() => {
		const saved = sessionStorage.getItem('signupData')
		return saved ? JSON.parse(saved) : {
			store_name: '',
			store_number: '',
			fname: '',
			lname: '',
			address: '',
			city: '',
			state: '',
			zip: '',
			phone: '',
			email: '',
			username: '',
			password: '',
			confirm_password: '',
			agree: false
		}
	})

	const [errors, setErrors] = useState({})
	const [showTerms, setShowTerms] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	const input = (name) => `w-full bg-gray-100 px-4 py-2 rounded-md border ${errors[name] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`

	function handleChange(e) {
		const { name, value, type, checked } = e.target
		let formattedValue = value

		if (name === 'phone') formattedValue = formatPhone(value)
		if (name === 'zip') formattedValue = value.replace(/[^\d]/g, '').slice(0, 10)
		
		setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : formattedValue }))
		setErrors(prev => ({ ...prev, [name]: false }))
		setPaymentError('')
	}

	async function handleSubmit(e) {
		e.preventDefault()
		const newErrors = {}

		if (!formData.agree) newErrors.agree = true
		if (formData.password !== formData.confirm_password) newErrors.confirm_password = true
		if (!isValidEmail(formData.email)) newErrors.email = 'invalid'
		

		const required = ['store_name', 'fname', 'lname', 'address', 'city', 'state', 'zip', 'phone', 'email', 'username', 'password', 'confirm_password']
		required.forEach(field => {
			if (!formData[field]) newErrors[field] = true
		})

		try {
			const result = await apiFetch(`/api/check_username_email`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: formData.username, email: formData.email })
			})
			
			if (!result.available) {
				if (result.usernameTaken) newErrors.username = 'taken'
				if (result.emailTaken) newErrors.email = 'taken'
			}
		} catch (err) {
			console.error('Username/email check failed')
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		try {
			const result = await apiFetch(`/api/create_store`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			})
			
			if (!result.available) {
				if (result.usernameTaken) newErrors.username = 'taken'
				if (result.emailTaken) newErrors.email = 'taken'
			}

			setFormData([])
			//navigate(`/login`,)
		} catch (err) {
			console.error(err + 'failed to create store')
		}
	}

	function handleSuccessLogin() {
		setShowSuccess(false)
		navigate('/login')
	}

	return (
		<>
			{showTerms && <TermsModal onClose={() => setShowTerms(false)} /> }

			{showSuccess && <SignupSuccessModal onClose={handleSuccessLogin} /> }

			<div className="min-h-screen bg-gray-50 py-10 px-4 overflow-y-scroll">
				<div className="max-w-4xl mx-auto bg-white p-10 rounded shadow">
					<h1 className="text-2xl font-semibold mb-6 text-center">Create Your Store Account</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<h2 className="text-lg font-semibold">Store Information</h2>
							<p className="text-sm text-gray-600">Please fill out the form below to create an account</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<input name="store_name" placeholder="Store Name" value={formData.store_name} onChange={handleChange} className={input('store_name')} />
							<input name="store_number" placeholder="Store Number (optional)" value={formData.store_number} onChange={handleChange} className={input()} />
							<input name="fname" placeholder="First Name" value={formData.fname} onChange={handleChange} className={input('fname')} />
							<input name="lname" placeholder="Last Name" value={formData.lname} onChange={handleChange} className={input('lname')} />
						</div>

						<input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={input('address')} />

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={input('city')} />
							<Listbox value={formData.state} onChange={val => handleChange({ target: { name: 'state', value: val } })}>
								<div className="relative">
									<ListboxButton className={`${input('state')} pr-10 text-left`}>{formData.state ? states.find(s => s.value === formData.state)?.label : 'Select State'}</ListboxButton>
									<ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
									<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
										<ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											{states.map(state => (
												<ListboxOption key={state.value} value={state.value} className={({ active }) => `${active ? 'bg-blue-100' : ''} px-4 py-2 text-sm text-gray-900 cursor-pointer`}>
													{state.label}
												</ListboxOption>
											))}
										</ListboxOptions>
									</Transition>
								</div>
							</Listbox>
							<input name="zip" placeholder="ZIP" value={formData.zip} onChange={handleChange} className={input('zip')} />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<span><input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={input('phone')} /></span>
							<span>
								<input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={input('email')} />
								{errors.email === 'invalid' && (
									<p className="text-sm text-red-500 mt-[5px]">Please enter a valid email address.</p>
								)}
								{errors.email === 'taken' && (
									<p className="text-sm text-red-500 mt-[5px]">That email is already in use.</p>
								)}
							</span>
						</div>

						<div className='mt-[10px]'>
							<input
								name="username"
								placeholder="Username"
								value={formData.username}
								onChange={handleChange}
								className={input('username')}
							/>
							{errors.username === 'taken' && (
								<p className="text-sm text-red-500 mt-[5px]">That username is already taken.</p>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} className={input('password')} />
							<input name="confirm_password" placeholder="Confirm Password" type="password" value={formData.confirm_password} onChange={handleChange} className={input('confirm_password')} />
						</div>
						{errors.confirm_password && <p className="text-sm text-red-500 mt-[-15px]">Passwords do not match.</p>}


						<div className="mt-4 flex items-center gap-3">
							<label className="flex items-center gap-3 cursor-pointer select-none">
								<input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} className="sr-only" />
								<div className={`w-[24px] h-[24px] rounded border-2 flex items-center justify-center transition-all duration-150 ${formData.agree ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}>{formData.agree && (<div className="w-[10px] h-[10px] bg-white rounded-sm" />)}</div>
								<span 
									className="text-sm text-gray-700"
								>
									I agree to the 
									<button 
										type="button" 
										onClick={() => setShowTerms(true)} 
										className="underline text-blue-600 cursor-pointer ml-[5px]"
									>
										terms and conditions
									</button>
								</span>
							</label>
						</div>

						<div className="text-center mt-6">
							<button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded">Continue</button>
							<p className="text-sm text-gray-500 mt-4">Already registered? <button onClick={() => navigate('/login')} className="underline text-blue-600 cursor-pointer">Log in here</button></p>
						</div>
					</form>
				</div>
			</div>

			{/* Footer */}
			<footer className="py-4 bg-gray-100 text-center text-sm text-gray-500">
				<p>&copy; {new Date().getFullYear()} EasyLiquor POS. All rights reserved.</p>
			</footer>
		</>
	)
}