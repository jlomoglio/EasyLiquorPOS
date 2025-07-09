/** 
 *  DEVOPS ROUTES
*/

/* Dependencies */
const express = require('express')
const cron = require('node-cron')
const DB = require('../db/connect')
const router = express.Router()
const sendTicketExpiredEmail = require('../utils/ticketExpiredEmail')
const WEB_URL = "http://localhost:5173/support"


// GET: A single store by tenant id (devops)
router.get('/devops_get_store/:id', (req, res) => {
	const {id} = req.params
	const sql = `SELECT * FROM store WHERE tenant_id = ?`

	DB.get(sql, [id], function (err, row) {
		if (err) return res.status(500).json({ error: "Database error", details: err.message })
		if (!row) return res.status(404).json({ error: "Store not found" })

		// 💡 Convert stored strings back to JS
		row.open_days = row.open_days ? row.open_days.split(',') : []
		row.store_hours = row.store_hours ? JSON.parse(row.store_hours) : {}

		res.send({ success: true, store: row })
	})
})

// GET: All stores (devops)
router.get('/devops_get_stores', (req, res) => {
    const sql = `SELECT id, tenant_id, store_name, fname, lname, email, phone, status FROM store ORDER BY id ASC`
  
    DB.all(sql, [], (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch stores:", err.message)
        return res.status(500).json({ error: 'Failed to fetch stores' })
      }
      res.json(rows)
    })
})

// POST: Open a new ticket (POS) 
router.post('/devops_submit_ticket', (req, res) => {
	const { user_id, tenantId, subject, message, timestamp } = req.body
  
	if (!user_id || !subject || !message || !timestamp) {
	  return res.status(400).json({ success: false, error: 'Missing required fields' })
	}
  
	const insertTicketSQL = `
	  INSERT INTO support_tickets (user_id, tenant_id, subject, status, created_at)
	  VALUES (?, ?, ?, 'open', ?)
	`
  
	DB.run(insertTicketSQL, [user_id, tenantId, subject, timestamp], function (err) {
	  if (err) {
		console.error('❌ Failed to insert ticket:', err.message)
		return res.status(500).json({ success: false, error: 'Failed to create ticket' })
	  }
  
	  const ticketId = this.lastID
  
	  const insertMessageSQL = `
		INSERT INTO support_ticket_messages (ticket_id, sender, message, timestamp)
		VALUES (?, 'store', ?, ?)
	  `
  
	  DB.run(insertMessageSQL, [ticketId, message, timestamp], function (err2) {
		if (err2) {
		  console.error('❌ Failed to insert message:', err2.message)
		  return res.status(500).json({ success: false, error: 'Failed to log initial message' })
		}
  
		return res.json({ success: true, ticket_id: ticketId })
	  })
	})
})

// GET: Support tickets based on status (devops)
router.get('/devops_get_tickets', (req, res) => {
	const status = req.query.status
	
	let sql = `
	  SELECT t.id, t.subject, t.status, t.created_at, s.store_name
	  FROM support_tickets t
	  LEFT JOIN store s ON t.user_id = (
		SELECT id FROM users WHERE users.tenant_id = s.tenant_id LIMIT 1
	  )
	`

	const params = []

	if (status) {
		sql += ` WHERE t.status = ?`
		params.push(status)
	}

	sql += ` ORDER BY t.created_at DESC`

	DB.all(sql, params, (err, rows) => {
		if (err) {
			console.error('❌ Failed to fetch tickets:', err.message)
			return res.status(500).json({ error: 'Failed to load tickets' })
		}

		res.json(rows)
	})
})

// GET: Ticket Thread (devops / pos) - ViewTicket.jsx / ViewTicketThread.jsx
router.get('/devops_get_ticket_thread/:id', (req, res) => {
	const ticketId = req.params.id

	const ticketSql = `
		SELECT t.id, t.subject, t.status, t.created_at, s.store_name
		FROM support_tickets t
		LEFT JOIN users u ON t.user_id = u.id
		LEFT JOIN store s ON u.tenant_id = s.tenant_id
		WHERE t.id = ?
	`

	const messagesSql = `
		SELECT id, sender, message, timestamp
		FROM support_ticket_messages
		WHERE ticket_id = ?
		ORDER BY timestamp ASC
	`

	DB.get(ticketSql, [ticketId], (err, ticketRow) => {
		if (err || !ticketRow) {
			console.error('❌ Failed to load ticket:', err?.message)
			return res.status(500).json({ error: 'Failed to load ticket details' })
		}

		DB.all(messagesSql, [ticketId], (err2, messageRows) => {
			if (err2) {
				console.error('❌ Failed to load ticket messages:', err2.message)
				return res.status(500).json({ error: 'Failed to load ticket messages' })
			}

			res.json({
				...ticketRow,
				messages: messageRows
			})
		})
	})
})

// POST: Send the reply (devops / pos ) ViewTicket.jsx / ViewTicketThread.jsx
router.post('/devops_reply_ticket', (req, res) => {
	const { ticket_id, message, timestamp } = req.body;
  
	if (!ticket_id || !message || !timestamp) {
	  return res.status(400).json({ success: false, error: 'Missing required fields' });
	}
  
	const insertSQL = `
	  INSERT INTO support_ticket_messages (ticket_id, sender, message, timestamp)
	  VALUES (?, 'admin', ?, ?)
	`;
  
	DB.run(insertSQL, [ticket_id, message, timestamp], function (err) {
	  if (err) {
		console.error('❌ Failed to insert admin reply:', err.message);
		return res.status(500).json({ success: false, error: 'Failed to save reply' });
	  }
  
	  return res.json({ success: true });
	});
});

// GET: User tickets (pos)
router.get('/devops_get_user_tickets/:userId', (req, res) => {
	const { userId } = req.params

	if (!userId) {
		return res.status(400).json({ error: 'Missing user ID' })
	}

	const sql = `
		SELECT id, subject, status, created_at AS created
		FROM support_tickets
		WHERE user_id = ?
		ORDER BY created_at DESC
	`

	DB.all(sql, [userId], (err, rows) => {
		if (err) {
			console.error('❌ Failed to fetch user tickets:', err.message)
			return res.status(500).json({ error: 'Failed to fetch tickets' })
		}

		res.json(rows)
	})
})

// PUT: Update ticket status 
router.put('/devops_update_ticket_status/:id', (req, res) => { 
	const ticketId = req.params.id 
	const { status } = req.body

	if (!status) { return res.status(400).json({ error: 'Missing status value' }) }

	const sql = 'UPDATE support_tickets SET status = ? WHERE id = ?'

	DB.run(sql, [status, ticketId], function (err) { 
		if (err) { 
			console.error('❌ Failed to update ticket status:', err.message) 
			return res.status(500).json({ error: 'Failed to update ticket status' }) 
		}

		return res.json({ success: true, updated: this.changes })
	}) 
})

// 🔁 Auto-close tickets older than 14 days with no replies
cron.schedule('0 3 * * *', () => {
	const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

	const fetchClosedTicketsSql = `
		SELECT t.id as ticketId, u.fname, u.email, s.store_name
		FROM support_tickets t
		JOIN users u ON t.user_id = u.id
		JOIN store s ON u.tenant_id = s.tenant_id
		WHERE t.status = 'closed' AND t.id IN (
			SELECT ticket_id FROM support_ticket_messages
			GROUP BY ticket_id
			HAVING MAX(timestamp) <= ?
		)
	`

	DB.all(fetchClosedTicketsSql, [cutoff], async (err3, ticketsToNotify) => {
		if (err3) {
		  console.error('❌ Failed to fetch ticket data for email:', err3.message)
		  return
		}
	  
		for (const { ticketId, fname, email } of ticketsToNotify) {
		  await sendTicketExpiredEmail({
				to: email,
				subject: `EasyLiquor POS - Ticket #${ticketId} Automatically Closed`,
				html: `
						<h2>Hi ${fname},</h2>
						<p>Your support ticket <strong>#${ticketId}</strong> has been automatically closed after 14 days of inactivity.</p>

						<p>If your issue is still unresolved or you'd like to continue the conversation, feel free to open a new ticket at any time.</p>

						<p style="margin-top: 20px;">
							You can manage your tickets by logging into your account:
							<br />
							<a href="${WEB_URL}/support" style="text-decoration: underline;">View Support Tickets</a>
						</p>

						<p style="margin-top: 30px;">Thank you for using EasyLiquor POS!</p>

						<div style="text-align: center; margin-top: 40px;">
							<p style="margin: 0;">Need assistance?</p>
							<a href="${WEB_URL}/support" style="text-decoration: underline;">Contact Support</a>
							<p style="font-size: 12px; margin-top: 20px;">© ${new Date().getFullYear()} EasyLiquor POS. All rights reserved.</p>
						</div>
					`
			})
		}
	})
})

module.exports = router