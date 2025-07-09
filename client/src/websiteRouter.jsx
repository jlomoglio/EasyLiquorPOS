import { createBrowserRouter } from 'react-router-dom'
import WebLayout from './website/WebLayout'
import Home from './website/Home'
import Signup from './website/Signup'
import Account from './website/Account'
import LoginPage from './website/LoginPage'
import RestrictedRoute from './components/RestrictedRoute.jsx'


const websiteRouter = createBrowserRouter([
	{
		path: '/',
		element: <WebLayout />,
		children: [
			// REGISTER
			{ path: '', element: <Home /> },
			{ path: 'signup', element: <Signup /> },
			{
				path: 'account',
				element: (
					// <RestrictedRoute checkTenantOnly={true}>
						<Account />
					// </RestrictedRoute>
				)
			},
			{ path: 'login', element: <LoginPage /> },
		]
	},
])

export default websiteRouter