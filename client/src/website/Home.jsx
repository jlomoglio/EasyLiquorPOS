// src/views/Home.jsx
import { useNavigate } from 'react-router-dom'
import cashRegister from '/images/cash_register.png'

export default function Home() {
	const signupButton = `
		bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer
	`
	const loginButton = `
		border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 cursor-pointer
	`

	const navigate = useNavigate()

	return (
		<div className="w-full min-h-screen bg-white text-gray-800 overflow-y-auto">
			{/* Hero Section */}
			<section className="h-screen flex flex-col justify-center items-center text-center px-4 bg-[#dedee6]">
				<img src={cashRegister} alt="EasyLiquor POS Logo" className="w-100 mb-6 mt-[-250px]" />
				<h1 className="text-4xl font-bold mb-4">EasyLiquor POS</h1>
				<p className="text-lg text-gray-600 mb-6">Built for Liquor Stores. Simple. Powerful. Cloud based.</p>
				<div className="flex gap-4">
					<button onClick={() => navigate('/signup')} className={signupButton}>Sign Up</button>
					<button onClick={() => navigate('/login')} className={loginButton}>Log In</button>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-6 bg-white text-center">
				<h2 className="text-3xl font-semibold mb-12">Why EasyLiquor POS?</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
					{[
						{ icon: '💵', title: 'Sales-Ready Register', desc: 'Fast, easy to use register with receipt printing.' },
						{ icon: '📦', title: 'Inventory Tracking', desc: 'Real-time inventory by category, subcategory, and vendor.' },
						{ icon: '📈', title: 'Sales Reports', desc: 'Daily, monthly, and yearly breakdowns with insights.' },
						{ icon: '🚚', title: 'Delivery Tools', desc: 'Purchase orders, vendor scheduling, and reminders.' },
						{ icon: '🔐', title: 'Multi-User Access', desc: 'Owner and staff logins with role control.' },
					].map(({ icon, title, desc }) => (
						<div key={title} className="p-6 border rounded-lg shadow-sm hover:shadow-md">
							<div className="text-4xl mb-4">{icon}</div>
							<h3 className="text-xl font-semibold mb-2">{title}</h3>
							<p className="text-gray-600 text-sm">{desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 px-6 bg-gray-50 text-center">
				<h2 className="text-3xl font-semibold mb-12">How It Works</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
					{[
						{ step: '1', title: 'Create Your Account', desc: 'Fill out store info, email, hours, and license.' },
						{ step: '2', title: 'Setup Your Store', desc: 'Add inventory manually or import from a file.' },
						{ step: '3', title: 'Start Selling', desc: 'Open your register and start processing sales.' },
					].map(({ step, title, desc }) => (
						<div key={step} className="p-6 bg-white border rounded-lg">
							<div className="text-2xl font-bold text-blue-600 mb-2">Step {step}</div>
							<h3 className="text-xl font-semibold mb-2">{title}</h3>
							<p className="text-gray-600 text-sm">{desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="py-6 bg-gray-100 text-center text-sm text-gray-500">
				<p>&copy; {new Date().getFullYear()} EasyLiquor POS. All rights reserved.</p>
				<div className="mt-2">
					<button onClick={() => navigate('/signup')} className="underline text-blue-600">Sign Up</button> ·
					<button onClick={() => navigate('/login')} className="underline text-blue-600">Login</button>
				</div>
			</footer>
		</div>
	)
}