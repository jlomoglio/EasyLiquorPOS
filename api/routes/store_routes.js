/** 
 *  STORE ROUTES
*/

/* Dependencies */
require('dotenv').config()
const express = require('express')
const router = express.Router()
const DB = require('../db/connect')
const { getDateTime } = require('../utils.js')
const crypto = require('crypto')
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const sendWelcomeEmail = require('../utils/welcomeEmail')


function generateTenantId() {
	return crypto.randomBytes(6).toString('hex')
}

function generateCode() {

}

// GENERATE SOFTWARE CODE
router.post('/generate_software_code', async (req, res) => {

})

// VERIFY SOFTWARE CODE
router.get('/verify_software_code/:code', async (req, res) => {
	const code = req.params.code
	const tenant_id = req.tenant_id
	const sql = `SELECT * FROM store WHERE tenant_id = ? AND software_code = ?`

	DB.get(sql, [tenant_id, code], function (err, row) {
		if (err) return res.status(500).json({ error: "Database error", details: err.message })
		if (!row) return res.status(404).json({ error: "Store not found" })

		res.send({ success: true })
	})
})

// GET STORE DATA
router.get('/store', (req, res) => {
	const tenant_id = req.tenant_id
	const sql = `SELECT * FROM store WHERE tenant_id = ?`

	DB.get(sql, [tenant_id], function (err, row) {
		if (err) return res.status(500).json({ error: "Database error", details: err.message })
		if (!row) return res.status(404).json({ error: "Store not found" })

		// 💡 Convert stored strings back to JS
		row.open_days = row.open_days ? row.open_days.split(',') : []
		row.store_hours = row.store_hours ? JSON.parse(row.store_hours) : {}

		res.send({ success: true, store: row })
	})
})


// ✅ CREATE STORE + STRIPE CUSTOMER
router.post('/create_store', async (req, res) => {
	const tenant_id = generateTenantId()
	const {
		store_name, store_number, address, city, state, zip,
		fname, lname, phone, email, username, password
	} = req.body

	const role = "Owner"

	try {
		// 🗄️ Insert store into DB
		const sql = `INSERT INTO store(
			tenant_id, store_name, store_number, address, city, state, zip,
			fname, lname, phone, email, username, password, role, status
		) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

		DB.run(sql, [
			tenant_id, store_name, store_number, address, city, state, zip,
			fname, lname, phone, email, username, password, role, 'active'
		], async function (err) {
			if (err) {
				console.error("🔴 Error at store insert:", err)
				return res.status(500).json({ error: 'Failed to create store' })
			}

			const users_sql = `INSERT INTO users(
				tenant_id, fname, lname, email, phone, address, city, state, zip,
				username, password, role 
				) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

			DB.run(users_sql, [
				tenant_id, fname, lname, email, phone, address, city, state, zip,
				username, password, role
			], async function (err) {
				if (err) {
					console.error("🔴 Error at user insert:", err)
					return res.status(500).json({ error: 'Failed to create user' })
				}

				// await sendWelcomeEmail({
				// 	to: email,
				// 	subject: `Welcome to EasyLiquor POS!`,
				// 	text: `Hi ${fname}, thanks for signing up for EasyLiquor POS! Your account has been created successfully.`,
				// 	html: `
				// 		<!-- HEADER -->
				// 		<div style="background-color: #0d2ea0; color: white; padding: 20px; text-align: center;">
				// 			<h1 style="margin: 0; font-size: 24px;">
				// 				Welcome to EasyLiquor<span style="font-weight: 900;">POS</span>
				// 			</h1>
				// 		</div>

				// 		<!-- Body -->
				// 		<h2>Hello, ${fname}!</h2>
				// 		<p>Your store <strong>${store_name}</strong> has been successfully created.</p>
				// 		<p>You can now manage your store, track sales, and more.</p>
				// 		<p style="margin-top:20px;">
				// 			You can now goto your account and 
				// 			<a href="https://www.easyliquorpos:5173/login" style="text-decoration: underline;">download</a> 
				// 			your software.
				// 		</p>
				// 		<p>
				// 			Software Code: ${generateCode}
				// 		</p>
				// 		<p style="margin-top:20px;">— The EasyLiquor POS Team</p>

				// 		<!-- FOOTER -->
				// 		<div style="text-align: center; margin-top: 50px;">
				// 			<p style="margin: 0;">
				// 				Login into your
				// 				<a href="https://www.easyliquorpos:5173/login" style="text-decoration: underline;"> Account Dashboard</a>
				// 			</p>
				// 			<p style="margin-top: 15px;">Need help? <a href="https://localhost:3000/support" style="text-decoration: underline;">Contact Support</a></p>
				// 			<p style="font-size: 12px; margin-top: 15px;">© ${new Date().getFullYear()} EasyLiquor POS. All rights reserved.</p>
				// 		</div>
				// 	`
				// })

				return res.send({ success: true, tenant_id })
			})
		})
	} catch (err) {
		console.error("🔴 Stripe or DB error:", err)
		return res.status(500).json({ error: 'Store creation failed' })
	}
})

// ✅ CHECK USERNAME + PASSWORD AVAILABILITY for users only
router.post('/check_username_password', (req, res) => {
	const { username, password } = req.body

	const sql = `SELECT username, password FROM users WHERE username = ? OR password = ?`
	DB.all(sql, [username, password], (err, rows) => {
		if (err) return res.status(500).json({ error: 'Database error' })

		const usernameTaken = rows.some(row => row.username === username)
		const passwordTaken = rows.some(row => row.password === password)

		res.send({ usernameTaken, passwordTaken })
	})
})

// CHECK USERNAME AND EMAIL
router.post('/check_username_email', (req, res) => {
	const { username, email } = req.body

	if (!username && !email) {
		return res.status(400).json({ success: false, message: 'Username or email is required.' })
	}

	const checkSql = `
      SELECT username, email FROM store
      WHERE username = ? OR email = ?
    `

	DB.all(checkSql, [username, email], (err, rows) => {
		if (err) {
			console.error("🔴 Error checking username/email:", err)
			return res.status(500).json({ success: false, message: 'Database error.' })
		}

		let usernameTaken = false
		let emailTaken = false

		rows.forEach(row => {
			if (row.username === username) usernameTaken = true
			if (row.email === email) emailTaken = true
		})

		const available = !usernameTaken && !emailTaken
		res.send({ success: true, available, usernameTaken, emailTaken })
	})
})




// WEBSITE SOFTWARE VERIFIY CODE
router.post('/verify_code', (req, res) => {
	const { code } = req.body

	console.log('🔐 Software verify code attempt:', code)

	if (!code) {
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



// Update Store
// TODO: ADD STAUS SO WHEN THE SUBSCRIPTION IS CANCLED
router.put('/update_store', (req, res) => {
	const {
		tenant_id,
		store_name, store_number, address, city, state, zip,
		fname, lname, phone, email, username, password,
		pin, sales_tax, open_days, store_hours, id
	} = req.body

	const sql = `UPDATE store SET
        store_name = ?, store_number = ?, address = ?, city = ?, state = ?, zip = ?,
        fname = ?, lname = ?, phone = ?, email = ?, username = ?, password = ?,
        pin = ?, sales_tax = ?, open_days = ?, store_hours = ?, first_time_login = 0
    WHERE id = ? AND tenant_id = ?`

	console.log("🛠️ Update Params:", {
		open_days: Array.isArray(open_days) ? open_days.join(',') : open_days,
		store_hours: typeof store_hours === 'object' ? JSON.stringify(store_hours) : store_hours
	})

	DB.run(sql, [
		store_name, store_number, address, city, state, zip,
		fname, lname, phone, email, username, password,
		pin, sales_tax,
		Array.isArray(open_days) ? open_days.join(',') : open_days,
		typeof store_hours === 'object' ? JSON.stringify(store_hours) : store_hours,
		id, tenant_id
	], function (err) {
		if (err) {
			console.error("❌ SQL Error (store):", err)
			return res.status(500).json({ error: 'Failed to update store' })
		}

		console.log("🟡 Rows updated in store:", this.changes)

		const sql_user = `UPDATE users SET
            fname = ?, lname = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?,
            username = ?, password = ?, pin = ?
        WHERE username = ? AND tenant_id = ?`

		DB.run(sql_user, [
			fname, lname, email, phone, address, city, state, zip,
			username, password, pin, username, tenant_id
		], function (err) {
			if (err) {
				console.error("🔴 Error updating user:", err.message)
				return res.status(500).json({ error: 'Failed to update user' })
			}

			console.log("✅ Store and user updated successfully!")
			return res.send({ success: true })
		})
	})
})
  

// // ✅ Get payment history
// router.get('/stripe/invoices/:customerId', async (req, res) => {
// 	try {
// 		const { customerId } = req.params
// 		const invoices = await stripe.invoices.list({ customer: customerId, limit: 12 })
// 		res.send({ success: true, invoices: invoices.data })
// 	} catch (err) {
// 		console.error('Stripe Invoice Error:', err)
// 		res.status(500).send({ success: false, message: 'Failed to fetch invoices' })
// 	}
// })

// // ✅ Update payment method
// router.post('/stripe/update_payment_method', async (req, res) => {
// 	const { customerId, paymentMethodId } = req.body
// 	try {
// 		// Attach payment method
// 		await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

// 		// Set as default
// 		await stripe.customers.update(customerId, {
// 			invoice_settings: { default_payment_method: paymentMethodId }
// 		})

// 		res.send({ success: true })
// 	} catch (err) {
// 		console.error('Stripe Update Payment Error:', err)
// 		res.status(500).send({ success: false, message: 'Failed to update payment method' })
// 	}
// })

module.exports = router
