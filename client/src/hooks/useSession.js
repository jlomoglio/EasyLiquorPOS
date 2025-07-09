import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUserId as setBackUserId, setUserName as setBackUserName, setFirstName, setRole, setFirstTimeLogin } from '../features/backofficeLoginSlice'
import { setTenantId } from '../features/tenantSlice'

export default function useSession() {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Redux state
	const userId = useSelector((state) => state.backofficeLogin.userId)
	const userName = useSelector((state) => state.backofficeLogin.userName)
	const firstName = useSelector((state) => state.backofficeLogin.firstName)
	const role = useSelector((state) => state.backofficeLogin.role)
	const firstTimeLogin = useSelector((state) => state.backofficeLogin.firstTimeLogin)
	const tenantId = useSelector((state) => state.tenant.tenantId)

	const isLoggedIn = userId && tenantId ? true : null

	async function logout() {
		if (!userId || !tenantId) {
			console.warn('❌ Cannot logout, missing userId or tenantId')
			navigate('/pos/pos_login')
			return
		}

		try {
			await fetch(`/api/logout/${userId}`, {
				method: 'GET',
				headers: {
					'x-tenant-id': tenantId,
				},
			})
		} catch (err) {
			console.error('⚠️ Logout API failed:', err)
		}

		// Clear Redux state
		dispatch(setBackUserId(null))
		dispatch(setBackUserName(null))
		dispatch(setFirstName(null))
		dispatch(setRole(null))
		dispatch(setFirstTimeLogin(false))
		dispatch(setTenantId(null))

		// Clear localStorage
		localStorage.removeItem('userId')
		localStorage.removeItem('tenantId')
		localStorage.removeItem('role')

		navigate('/pos/pos_login', { replace: true })
	}

	return {
		userId,
		userName,
		firstName,
		tenantId,
		role,
		firstTimeLogin,
		isLoggedIn,
		logout,
	}
}
