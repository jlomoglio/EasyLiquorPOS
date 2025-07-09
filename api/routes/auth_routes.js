const express = require('express')
const DB = require('../db/connect')
const router = express.Router()
const { getDateTime } = require('../utils.js')
const path = require("path")
const fs = require("fs")


// POS COMBINE LOGIN
router.post('/pos_login', (req, res) => {
	const { username, password, mode } = req.body

	if (!username || !password || !mode) {
		return res.status(400).json({ success: false, error: 'Missing credentials or login mode' })
	}

	// 🔐 BACKOFFICE LOGIN
	if (mode === 'backoffice') {
		const sql = `
			SELECT users.*, store.first_time_login 
			FROM users 
			JOIN store ON users.tenant_id = store.tenant_id 
			WHERE users.username = ? AND users.password = ?
		`
		DB.get(sql, [username, password], (err, row) => {
			if (err || !row) {
				return res.status(401).json({
					success: false,
					label: "Try Again",
					message: "Invalid backoffice login"
				})
			}
	
			return res.json({
				success: true,
				user: {
					id: row.id,
					username: row.username,
					fname: row.fname,
					role: row.role || 'Owner',
					first_time_login: row.first_time_login === 1
				},
				store: {
					tenant_id: row.tenant_id,
				}
			})
		})
	}

	// 🧑‍💻 REGISTER LOGIN
	else if (mode === 'register') {
		const sql = `SELECT * FROM users WHERE username = ? AND password = ?`
		DB.get(sql, [username, password], (err, row) => {
			if (err || !row) {
				return res.json({
					success: false,
					label: 'Try Again',
					message: 'Invalid register login. Check username and password.'
				})
			}

			const tenantId = row.tenant_id
			if (!tenantId) {
				return res.status(400).json({ error: 'Missing tenant ID' })
			}

			const date = getDateTime('date')
			const time = getDateTime('time')
			const user_name = `${row.fname} ${row.lname}`

			// ✅ Auto-close any stale user_logs
			const closeOld = `
				UPDATE user_logs
				SET logout_date = ?, logout_time = ?
				WHERE user_id = ? AND tenant_id = ? AND logout_date IS NULL
			`
			DB.run(closeOld, [date, time, row.id, tenantId], (err) => {
				if (err) console.warn('⚠️ Failed to close old sessions:', err)
			})

			const sql_insert = `
				INSERT INTO user_logs (user_id, login_date, login_time, user_name, tenant_id)
				VALUES (?, ?, ?, ?, ?)
			`

			DB.run(sql_insert, [row.id, date, time, user_name, tenantId], (err) => {
				if (err) {
					return res.json({
						success: false,
						label: 'Close',
						message: 'Error logging login session'
					})
				}

				return res.json({
					success: true,
					user: {
						id: row.id,
						username: row.username,
						fname: row.fname,
						role: row.role || 'cashier',
					},
					store: {
						tenant_id: tenantId,
					}
				})
			})
		})
	}
 	else {
		return res.status(400).json({ success: false, error: 'Invalid login mode' })
	}
})


// 🧑‍💻 POS LOGOUT
router.get('/logout/:user_id', (req, res) => {
	const tenantId = req.tenant_id // from middleware
	const user_id = req.params.user_id

	if (!tenantId) {
		return res.status(400).json({ error: 'Missing tenant ID' })
	}

	const sql_user = `SELECT fname, lname FROM users WHERE id = ? AND tenant_id = ?`
	DB.get(sql_user, [user_id, tenantId], (err, user_row) => {
		if (err || !user_row) return res.status(404).json({ error: 'User not found' })

		const sql_log = `SELECT * FROM user_logs WHERE tenant_id = ? AND user_id = ? AND logout_date IS NULL`
		DB.get(sql_log, [tenantId, user_id], (err, row) => {
			if (err || !row) return res.status(404).json({ error: 'Log not found' })

			const logout_date = getDateTime('date')
			const logout_time = getDateTime('time')

			DB.run(
				`UPDATE user_logs SET logout_date = ?, logout_time = ? WHERE user_id = ? AND login_date = ? AND tenant_id = ?`,
				[logout_date, logout_time, user_id, row.login_date, tenantId],
				(err) => {
					if (err) return res.status(500).json({ error: 'Failed to log out' })
					res.send({ success: true })
				}
			)
		})
	})
})


// Website Login
router.post('/website_login', (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(400).json({ success: false, message: 'Username and password are required' })
	}

	const sql = `SELECT tenant_id, fname, lname FROM users WHERE username = ? AND password = ? LIMIT 1`

	DB.get(sql, [username, password], (err, row) => {
		if (err) {
			console.error('❌ Website login error:', err.message)
			return res.status(500).json({ success: false, message: 'Server error during login' })
		}

		if (!row) {
			return res.status(401).json({ success: false, message: 'Invalid username or password' })
		}

		return res.json({
			success: true,
			tenant_id: row.tenant_id,
			fname: row.fname,
			lname: row.lname
		})
	})
})




module.exports = router
