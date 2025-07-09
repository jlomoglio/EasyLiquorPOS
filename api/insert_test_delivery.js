const sqlite3 = require('sqlite3')
const dayjs = require('dayjs')

const DB = require('./db/connect')

const now = dayjs()
const deliveryDate = now.format('YYYY-MM-DD')
const startTime = now.add(5, 'minute').format('h:mm A')
const endTime = now.add(30, 'minute').format('h:mm A')

const testDelivery = {
	po_number: 'PO-TEST-9999',
	delivery_date: deliveryDate,
	start_time: startTime,
	end_time: endTime,
	status: 'Scheduled',
	repeat: 'none',
	reminder: '5 minutes before',
	attachments: JSON.stringify([]),
	notes: 'This is a test delivery reminder',
	tenant_id: 1
}

const sql = `
  INSERT INTO delivery_schedule (
    po_number, delivery_date, start_time, end_time,
    status, repeat, reminder, attachments, notes, tenant_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

DB.run(sql, [
	testDelivery.po_number,
	testDelivery.delivery_date,
	testDelivery.start_time,
	testDelivery.end_time,
	testDelivery.status,
	testDelivery.repeat,
	testDelivery.reminder,
	testDelivery.attachments,
	testDelivery.notes,
	testDelivery.tenant_id
], function (err) {
	if (err) {
		console.error("❌ Insert failed:", err.message)
	} else {
		console.log(`✅ Test delivery inserted with ID ${this.lastID}`)
	}
	DB.close()
})
