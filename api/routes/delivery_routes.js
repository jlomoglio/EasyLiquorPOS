/** 
 *  BACK OFFICE: DELIVERY ROUTES (Multi-Tenant)
*/

const express = require("express")
const router = express.Router()
const DB = require('../db/connect')
const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)


router.get('/deliveries', (req, res) => {
	const tenantId = req.tenant_id
	const query = `
    SELECT 
      po.id,
      po.po_number,
      po.date,
      po.updated_at,
      po.total,
      po.status,
      po.delivery_date,
      v.vendor_name AS vendor
    FROM purchase_orders po
    JOIN vendors v ON po.vendor_id = v.id
    WHERE po.tenant_id = ?
    ORDER BY po.updated_at DESC`

	DB.all(query, [tenantId], (err, rows) => {
		if (err) return res.status(500).json({ error: "Failed to fetch purchase orders" })
		res.json({ deliveries: rows })
	})
})

router.get('/delivery/:id', (req, res) => {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    const deliverySQL = `SELECT * FROM delivery_schedule WHERE id = ? AND tenant_id = ?`;
    DB.get(deliverySQL, [id, tenantId], (err, delivery) => {
        if (err) return res.status(500).json({ error: "Failed to fetch delivery." });
        if (!delivery) return res.status(404).json({ error: "Delivery not found." });

        let attachments = [];
        try { attachments = delivery.attachments ? JSON.parse(delivery.attachments) : []; } catch {}

        // Get purchase_order_items by PO number
        const poItemsSQL = `
            SELECT * FROM purchase_order_items
            WHERE purchase_order_id = (
                SELECT id FROM purchase_orders
                WHERE po_number = ? AND tenant_id = ?
            )
        `;
        DB.all(poItemsSQL, [delivery.po_number, tenantId], (err, items) => {
            if (err) {
                console.error("❌ Failed to get PO items:", err.message);
                return res.status(500).json({ error: "Failed to fetch delivery items." });
            }

            res.json({
                ...delivery,
                attachments,
                items: items || []
            });
        });
    });
});


router.get('/delivery_events', (req, res) => {
	const tenantId = req.tenant_id
	const query = `
    SELECT 
      ds.id,
      ds.po_number,
      ds.delivery_date,
      ds.start_time,
      ds.end_time,
      ds.status,
      ds.notes,
      ds.attachments,
      ds.repeat,
      ds.reminder,
      ds.delivery_id,
      po.id AS purchase_order_id,         
      v.vendor_name
    FROM delivery_schedule ds
    JOIN purchase_orders po ON po.po_number = ds.po_number
    JOIN vendors v ON po.vendor_id = v.id
    WHERE ds.tenant_id = ?
    ORDER BY ds.delivery_date ASC`

	DB.all(query, [tenantId], (err, rows) => {
		if (err) {
            console.error("❌ SQL Error loading delivery events:", err.message)
            return res.status(500).json({ error: "[ERR-20250402-3N7NTX] Failed to load delivery events" })
        }

		if (!rows || rows.length === 0) {
			return res.json({ events: [] })
		}

		const events = rows.map(row => ({
			id: row.id,
			title: `${row.vendor_name} Delivery`,
			start: new Date(`${row.delivery_date} ${row.start_time || '08:00 AM'}`).toISOString(),
			backgroundColor: row.parent_delivery_id !== null
				? "#C084FC"
				: row.status === "Completed" ? "#10B981"
					: row.status === "Canceled" ? "#EF4444"
						: row.status === "Partial" ? "#FACC15"
							: "#60A5FA",
			extendedProps: { ...row, po_id: row.purchase_order_id }
		}))

		res.json({ events })
	})
})


// Create Delivery
router.post('/create_delivery', async (req, res) => {
    const tenant_id = req.tenant_id
    const { po_number, vendor_name, vendor_id, delivery_date, start_time, end_time, status, repeat, reminder } = req.body

    if (!po_number || !delivery_date || !tenant_id) {
        return res.status(400).json({ error: "Missing required delivery fields" })
    }

    DB.serialize(() => {
        DB.run('BEGIN TRANSACTION')

        const insertSql = `
            INSERT INTO delivery_schedule (
                po_number, vendor_id, vendor_name, delivery_date, start_time, end_time, status,
                repeat, reminder, tenant_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        const params = [
            po_number,
            vendor_id || null,
            vendor_name,
            delivery_date,
            start_time || null,
            end_time || null,
            status || 'Scheduled',
            repeat || '',
            reminder || '',
            tenant_id
        ]

        DB.run(insertSql, params, function (err) {
            if (err) {
                console.error("❌ Failed to insert delivery_schedule:", err.message)
                DB.run('ROLLBACK')
                return res.status(500).json({ error: "Failed to save delivery" })
            }

            const deliveryId = this.lastID

            DB.run(`
                UPDATE purchase_orders
                SET delivery_id = ?, delivery_date = ?, status = ?
                WHERE po_number = ? AND tenant_id = ?
            `, [deliveryId, delivery_date, status || 'Scheduled', po_number, tenant_id], function (err) {
                if (err) {
                    console.error("❌ Failed to update purchase_orders:", err.message)
                    DB.run('ROLLBACK')
                    return res.status(500).json({ error: "Failed to link delivery to PO" })
                }

                DB.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        return res.status(500).json({ error: "Commit failed" })
                    }

                    return res.status(201).json({ success: true, id: deliveryId })
                })
            })
        })
    })
})


// Update Delivery
router.post('/update_delivery_details', async (req, res) => {
    const tenant_id = req.tenant_id
    const {
        po_number,
        vendor_id,
        vendor_name,
        delivery_date,
        start_time,
        end_time,
        status,
        repeat,
        reminder,
        notes = '',
        attachments = [],
        items = [],
        itemStatuses = [],
        receivedQuantities = []
    } = req.body

    if (!po_number || !delivery_date || !tenant_id) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    DB.serialize(() => {
        DB.run('BEGIN TRANSACTION')

        // 1. Update delivery_schedule
        const updateDeliverySQL = `
            UPDATE delivery_schedule
            SET 
                start_time = ?, 
                end_time = ?, 
                status = ?, 
                repeat = ?, 
                reminder = ?, 
                notes = ?, 
                attachments = ?
                vendor_name = ?,
                vendor_id = ?
            WHERE po_number = ? AND tenant_id = ?
        `
        const deliveryParams = [
            start_time || null,
            end_time || null,
            status || 'Scheduled',
            repeat || '',
            reminder || '',
            notes,
            JSON.stringify(attachments),
            vendor_name || '',
            vendor_id || '',
            po_number,
            tenant_id
        ]

        DB.run(updateDeliverySQL, deliveryParams, function (err) {
            if (err) {
                console.error("❌ Failed to update delivery_schedule:", err.message)
                DB.run('ROLLBACK')
                return res.status(500).json({ error: "Failed to update delivery details" })
            }

            // 2. Update purchase_orders status + delivery date
            let resolvedCount = 0
            for (let status of itemStatuses) {
                if (["Delivered", "Canceled", "Credited"].includes(status)) {
                    resolvedCount++
                }
            }
            const allResolved = resolvedCount === itemStatuses.length
            const finalStatus = allResolved ? "Completed" : status || "Scheduled"

            DB.run(`
                UPDATE purchase_orders
                SET status = ?, delivery_date = ?
                WHERE po_number = ? AND tenant_id = ?
            `, [finalStatus, delivery_date, po_number, tenant_id], function (err) {
                if (err) {
                    DB.run('ROLLBACK')
                    return res.status(500).json({ error: "Failed to update purchase order" })
                }
                    // ✅ Update delivery_schedule status too
                    DB.run(`
                        UPDATE delivery_schedule
                        SET status = ?
                        WHERE po_number = ? AND tenant_id = ?
                    `, [finalStatus, po_number, tenant_id], function (err) {

                        // 3. Update purchase_order_items: delivery_id, delivery_status, received_qty
                        const getPOIDSQL = `SELECT id FROM purchase_orders WHERE po_number = ? AND tenant_id = ?`
                        DB.get(getPOIDSQL, [po_number, tenant_id], (err, row) => {
                            if (err || !row) {
                                DB.run('ROLLBACK')
                                return res.status(500).json({ error: "Failed to get purchase order ID" })
                            }

                            const purchase_order_id = row.id

                            // Loop and update item records
                            const itemUpdateSQL = `
                                UPDATE purchase_order_items
                                SET delivery_status = ?, received_qty = ?, delivery_id = (
                                    SELECT id FROM delivery_schedule WHERE po_number = ? AND tenant_id = ?
                                )
                                WHERE purchase_order_id = ? AND tenant_id = ? AND name = ?
                            `

                            const updateNext = (index = 0) => {
                                if (index >= items.length) {
                                    // All done
                                    DB.run('COMMIT', (commitErr) => {
                                        if (commitErr) {
                                            return res.status(500).json({ error: "Commit failed" })
                                        }
                                        return res.status(200).json({ success: true })
                                    })
                                    return
                                }

                                const item = items[index]
                                const delivery_status = itemStatuses[index] || ''
                                const received_qty = receivedQuantities[index] || 0

                                DB.run(itemUpdateSQL, [
                                    delivery_status,
                                    received_qty,
                                    po_number,
                                    tenant_id,
                                    purchase_order_id,
                                    tenant_id,
                                    item.name
                                ], (err) => {
                                    if (err) {
                                        console.error("❌ Failed to update item:", item.name, err.message)
                                        DB.run('ROLLBACK')
                                        return res.status(500).json({ error: "Failed to update item" })
                                    }

                                    updateNext(index + 1)
                                })
                            }

                            updateNext()
                        })
                    })
            })
        })
    })
})

// Get upcoming deliveries
router.get('/get_upcoming_deliveries', (req, res) => {
    const tenant_id = req.tenant_id
    const today = dayjs().format('YYYY-MM-DD')
    const fiveDaysOut = dayjs().add(5, 'day').format('YYYY-MM-DD')

    const sql = `
        SELECT d.id, d.delivery_date, d.start_time, d.status, v.vendor_name
        FROM delivery_schedule d
        JOIN vendors v ON d.vendor_id = v.id
        WHERE d.tenant_id = ?
        AND d.delivery_date BETWEEN ? AND ?
        ORDER BY d.delivery_date ASC
    `

    DB.all(sql, [tenant_id, today, fiveDaysOut], (err, rows) => {
        if (err) {
            console.error("❌ Failed to fetch upcoming deliveries:", err.message)
            return res.status(500).json({ error: "Failed to fetch upcoming deliveries" })
        }

        res.send({ deliveries: rows })
    })
})

module.exports = router

