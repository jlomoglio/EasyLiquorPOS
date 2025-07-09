import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/registerApi'

import {
  setUserId as setRegisterUserId,
  setUserName as setRegisterUserName,
} from '../features/loginSlice'

import {
  setUserId as setBackUserId,
  setUserName as setBackUserName,
  setFirstName,
} from '../features/backofficeLoginSlice'

import { setTenantId } from '../features/tenantSlice'
import { setRegisterId } from '../features/registerSlice'

export default function useLogout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginUserId = useSelector((state) => state.login.userId)
  const backofficeUserId = useSelector((state) => state.backofficeLogin.userId)
  const tenantId = useSelector((state) => state.tenant.tenantId)

  async function logout() {
    const userId = loginUserId || backofficeUserId || localStorage.getItem('userId')
    const currentTenantId = tenantId || localStorage.getItem('tenantId')

    if (!userId || !currentTenantId) {
      console.warn('❌ Cannot logout, missing userId or tenantId')
      navigate('/pos/pos_login')
      return
    }

    try {
      await apiFetch(`/api/logout/${userId}`, {
        method: 'GET',
        headers: {
          'x-tenant-id': currentTenantId,
        },
      })
    } catch (err) {
      console.error('⚠️ Logout API failed:', err)
    }

    // Clear REGISTER state
    dispatch(setRegisterUserId(null))
    dispatch(setRegisterUserName(null))
    dispatch(setRegisterId(null))

    // Clear BACKOFFICE state
    dispatch(setBackUserId(null))
    dispatch(setBackUserName(null))
    dispatch(setFirstName(null))

    // Clear shared state
    dispatch(setTenantId(null))

    // Clear storage
    localStorage.removeItem('userId')
    localStorage.removeItem('tenantId')

    // Done
    navigate('/pos/pos_login', { replace: true })
  }

  return logout
}
