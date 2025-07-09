import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	async function handleLogin(e) {
		e.preventDefault()
		setError('')

		try {
			const res = await apiFetch('/api/website_login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			})

			if (!res.success) return setError(res.message || 'Login failed')

			localStorage.setItem('tenantId', res.tenant_id)
			localStorage.setItem('tenantId', res.tenant_id)
			navigate('/account')
		} 
		catch (err) {
			console.error('Login error:', err)
			setError('An unexpected error occurred')
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white p-8 rounded shadow">
				<h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>

				<form className="space-y-4" onSubmit={handleLogin}>
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-gray-700">
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
						/>
					</div>

					{error && <div className="text-sm text-red-600">{error}</div>}

					<button
						type="submit"
						className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition"
					>
						Login
					</button>
				</form>

				<p className="mt-4 text-sm text-center text-gray-500">
					Don’t have an account?{' '}
					<a href="/signup" className="text-blue-600 hover:underline">
						Sign up here
					</a>
				</p>
			</div>
		</div>
	)
}
