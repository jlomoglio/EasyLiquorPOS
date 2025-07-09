/** 
 *  BACK OFFICE: ERROR ROUTES
*/

/* Dependencies */
const express = require('express')
const DB = require('../db/connect')
const router = express.Router()

router.post("/log_error", (req, res) => {
	const { code, path, message, stack, timestamp, userId } = req.body

	DB.run(
		`INSERT INTO error_logs (code, path, message, stack, timestamp, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
		[code, path, message, stack, timestamp, userId || null],
		(err) => {
			if (err) {
				console.error("Error logging to DB:", err)
				return res.status(500).json({ error: "Failed to log error" })
			}
			res.status(200).json({ success: true })
		}
	)
})

// ✅ NEW: GET route to fetch error logs
router.get('/devops_error_logs', (req, res) => {
	const sql = `SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT 100`
	DB.all(sql, [], (err, rows) => {
		if (err) {
			console.error('Failed to fetch logs:', err.message)
			return res.status(500).json({ error: 'Error fetching logs' })
		}
		res.json(rows)
	})
})

module.exports = router
