import { Navigate } from 'react-router-dom'
import useSession from '../hooks/useSession'

export default function RestrictedRoute({ checkTenantOnly = false, children }) {
	const { isLoggedIn } = useSession()
	const tenantId = localStorage.getItem('tenantId')

	// 🚧 Wait until session is hydrated
	if (isLoggedIn === null || tenantId === null) {
		return null // or <LoadingSpinner />
	}

	// 🚪 Not logged in? Bounce
	if (!isLoggedIn) {
		return <Navigate to="/login" replace />
	}

	// 🧾 Require tenantId for protected views like /account
	if (checkTenantOnly && !tenantId) {
		return <Navigate to="/login" replace />
	}

	// ✅ All good
	return children
}