import { API_URL } from "../config"
import { toast } from 'react-hot-toast'

function generateErrorCode() {
	const now = new Date()
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
	const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
	return `ERR-${datePart}-${randomPart}`
}

function getCurrentUserId() {
	return null // Replace with actual userId logic if needed
}

export async function apiFetch(path, options = {}) {
	const fullPath = `${API_URL}${path}`
	const errorCode = generateErrorCode()

	const isMultipart = options.isMultipart || false
	const parseJson = options.parseJson !== false

	const skipTenantCheckRoutes = ["/api/backoffice", "/api/create_store", "/api/log_error", "/api/website_login", "/api/pos_login"]
	const requiresTenant = !skipTenantCheckRoutes.some((skip) => path.startsWith(skip))
	const tenantId = requiresTenant ? localStorage.getItem("tenant_id") : null

	const headers = {
		...(options.headers || {}),
		...(isMultipart ? {} : { "Content-Type": "application/json" }),
		...(tenantId ? { "x-tenant-id": tenantId } : {})
	}

	try {
		const response = await fetch(fullPath, {
			...options,
			headers
		})

		if (!response.ok) {
			let message = "Something went wrong."

			if (parseJson) {
				try {
					const data = await response.json()
					message = data?.message || data?.error || message
				} catch {}

			}

			toast.error(`${message} (Code: ${errorCode})`)

			await fetch(`${API_URL}/api/log_error`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code: errorCode,
					path,
					message,
					stack: null,
					timestamp: new Date().toISOString(),
					userId: getCurrentUserId()
				})
			})

			throw new Error(`[${errorCode}] ${message}`)
		}

		return parseJson ? await response.json() : response
	} catch (err) {
		toast.error(`Network error. (Code: ${errorCode})`)

		await fetch(`${API_URL}/api/log_error`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: errorCode,
				path,
				message: err.message,
				stack: err.stack,
				timestamp: new Date().toISOString(),
				userId: getCurrentUserId()
			})
		})

		throw err
	}
}


