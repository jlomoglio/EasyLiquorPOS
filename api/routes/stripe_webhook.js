const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const sendReceiptEmail = require('../utils/receiptEmail')
const DB = require('../db/connect')


module.exports = async (req, res) => {
	//console.log('🔥 stripe_webhook hit at', new Date().toISOString())
	const sig = req.headers['stripe-signature']

	let event
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		)
		//console.log('✅ Event received:', event.type)
	} catch (err) {
		console.error('❌ Webhook error:', err.message)
		return res.status(400).send(`Webhook Error: ${err.message}`)
	}

	const eventId = event.id
	const eventType = event.type

	// 🧠 Check if event has already been handled
	DB.get(`SELECT event_id FROM event_logs WHERE event_id = ?`, [eventId], async (err, row) => {
		if (err) {
			console.error('❌ DB check error:', err.message)
			return res.status(500).send('Internal server error')
		}

		if (row) {
			console.log(`⚠️ Duplicate webhook event skipped: ${eventId}`)
			return res.status(200).send({ received: true })
		}

		// 🧾 Log event
		DB.run(
			`INSERT INTO event_logs (event_id, type) VALUES (?, ?)`,
			[eventId, eventType],
			(err) => {
				if (err) {
					console.error('❌ DB insert error:', err.message)
					return res.status(500).send('Failed to log event')
				}

				// ✅ Wrap async logic inside an IIFE so await works
				; (async () => {
					//console.log('🚀 Inside async handler block')

					//console.log('🧠 Event Type:', eventType)

					if (eventType === 'charge.succeeded') {
						//console.log('📦 invoice.payment_succeeded triggered')

						const invoice = event.data.object
						const charge = event.data.object

						const customer = await stripe.customers.retrieve(invoice.customer)
						const amount = (charge.amount / 100).toFixed(2)

						const result = await sendReceiptEmail({
							to: customer.email,
							subject: '🎉 Payment Received - EasyLiquor POS',
							text: '',
							html: `
								<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0;">
									<!-- HEADER -->
									<div style="background-color: #0d2ea0; color: white; padding: 20px; text-align: center;">
										<h1 style="margin: 0; font-size: 24px;">
											EasyLiquor<span style="font-weight: 900;">POS</span> - Billing Summary
										</h1>
									</div>

									<!-- BODY -->
									<div style="padding: 20px; color: #333; margin-bottom: 30px; margin-top: 0px;">
										<p>Hi <strong>${customer.name}</strong>,</p>
										<p margin-bottom: 50px;">Thank you for your payment</p>
										<div style="width: 100%; margin-top: 50px;"
										<h3>Subscription Details:</h3>
										<table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse; background: #fff;">
											<thead style="background-color: #f1f1f1;">
												<tr>
													<th align="left">Product</th>
													<th align="right">Amount</th>
												</tr>
											</thead>
											<tbody>
											<tr>
												<td>EasyLiquorPOS Software Subscription</td>
												<td align="right">$${amount}</td>
											</tr>
											</tbody>
										</table>
									</div>

									<!-- FOOTER -->
									<div style="text-align: center; margin-top: 50px;">
										<p style="margin: 0;">
											Login into your
											<a href="https://localhost:3000/account" style="text-decoration: underline;"> Account Dashboard</a>
										</p>
										<p style="margin-top: 15px;">Need help? <a href="https://localhost:3000/support" style="text-decoration: underline;">Contact Support</a></p>
										<p style="font-size: 12px; margin-top: 15px;">© ${new Date().getFullYear()} EasyLiquor POS. All rights reserved.</p>
									</div>
								</div>
							`
						})

						//console.log('📨 Email result:', result)
					}

					res.status(200).send({ received: true })
				})()
			}
		)
	})
}

