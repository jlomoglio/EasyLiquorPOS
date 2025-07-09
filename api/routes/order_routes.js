/** 
 *  BACK OFFICE: ORDER ROUTES
*/

/* Dependencies */
const express = require("express");
const router = express.Router();
const DB = require('../db/connect')
const { spawn } = require("child_process");
const path = require("path");
const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)


// Get All Purchase Orders
router.get('/purchase_orders', (req, res) => {
    const tenant_id = req.tenant_id;

    const sql = `
        SELECT 
            po.id,
            po.po_number,
            po.date,
            po.status,
            po.total,
            po.vendor_id,
            v.vendor_name
        FROM purchase_orders po
        LEFT JOIN vendors v ON po.vendor_id = v.id AND v.tenant_id = ?
        WHERE po.tenant_id = ?
        ORDER BY po.date DESC
    `;

    DB.all(sql, [tenant_id, tenant_id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch purchase orders" });
        }

        res.json({ purchase_orders: rows });
    });
});

// Get All Purchase Orders not scheduled for delivery
router.get('/get_unscheduled_purchase_orders', (req, res) => {
    const tenant_id = req.tenant_id

    const sql = `
        SELECT 
            po.id,
            po.po_number,
            po.vendor_id,
            v.vendor_name
        FROM purchase_orders po
        LEFT JOIN vendors v ON v.id = po.vendor_id AND v.tenant_id = ?
        WHERE (po.delivery_id IS NULL OR po.delivery_id = '') 
            AND po.status = ? 
            AND po.tenant_id = ?
    `

    DB.all(sql, [tenant_id, 'Pending', tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Failed to get unscheduled purchase orders:", err.message)
            return res.status(500).json({ error: "Failed to get unscheduled purchase orders" })
        }

        res.json({ purchase_orders: rows })
    })
})

// GET PO ID
router.get('/get_po_id/:po_number', (req, res) => {
    const tenant_id = req.tenant_id
    const {po_number} = req.params

    const sql = `SELECT id FROM purchase_orders WHERE po_number = ? AND tenant_id = ?`
    DB.get(sql, [po_number, tenant_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to generate PO number" });
        }
        
        res.json({ po_id: row });
    });
});

router.get("/purchase_order_items/:po_id", (req, res) => {
    const { po_id } = req.params
    const { delivery_id } = req.query
    const tenantId = req.tenant_id

    let sql = `
        SELECT *
        FROM purchase_order_items 
        WHERE purchase_order_id = ? AND delivery_id = ? AND tenant_id = ?
    `

    DB.all(sql, [po_id, delivery_id, tenantId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch items" })
            
        res.json({ items: rows })
    })
})

// GET Generate PO Number
router.get('/get_po_number', (req, res) => {
    const tenant_id = req.tenant_id
    const year = new Date().getFullYear();
    const sql = `SELECT po_number FROM purchase_orders WHERE po_number LIKE ? AND tenant_id = ? ORDER BY id DESC LIMIT 1`;
    const yearPattern = `%${year}`;

    DB.get(sql, [yearPattern, tenant_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to generate PO number" });
        }

        let nextNumber = 1;

        if (row && row.po_number) {
            const match = row.po_number.match(/^PO-(\d+)-\d{4}$/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        const padded = String(nextNumber).padStart(5, "0");
        const newPoNumber = `PO-${padded}-${year}`;
        res.json({ po_number: newPoNumber });
    });
});

// GET PO Number by ID
router.get('/get_po_number_by_id/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id

    const purchaseOrderSql = `SELECT * FROM purchase_orders WHERE id = ? AND tenant_id = ?`
    const itemsSql = `SELECT * FROM purchase_order_items WHERE purchase_order_id = ? AND tenant_id = ?`
    const vendorSql = `SELECT * FROM vendors WHERE id = ? AND tenant_id = ?`
    const storeSql = `SELECT * FROM store WHERE tenant_id = ?`

    DB.get(purchaseOrderSql, [id, tenant_id], (err, poRow) => {
        if (err) return res.status(500).json({ error: "Failed to get purchase order" })
        if (!poRow) return res.status(404).json({ error: "Purchase order not found" })

        DB.all(itemsSql, [id, tenant_id], (err, itemsRows) => {
            if (err) return res.status(500).json({ error: "Failed to get PO items" })

            DB.get(vendorSql, [poRow.vendor_id, tenant_id], (err, vendorRow) => {
                if (err) return res.status(500).json({ error: "Failed to get vendor" })

                DB.get(storeSql, [tenant_id], (err, storeRow) => {
                    if (err) return res.status(500).json({ error: "Failed to get store" })

                    return res.json({
                        po_number: poRow.po_number,
                        store_name: storeRow?.name || "",
                        store_address: `${storeRow?.address || ""}, ${storeRow?.city || ""}, ${storeRow?.state || ""} ${storeRow?.zip || ""}`,
                        store_email: storeRow?.email || "",
                        store_phone: storeRow?.phone || "",
                        store_owner: poRow.store_owner,
                        vendor_name: vendorRow?.vendor_name || "",
                        vendor_address: `${vendorRow?.address || ""}, ${vendorRow?.city || ""}, ${vendorRow?.state || ""} ${vendorRow?.zip || ""}`,
                        vendor_email: vendorRow?.email || "",
                        vendor_phone: vendorRow?.phone || "",
                        date: poRow.date,
                        subtotal: poRow.subtotal,
                        tax: poRow.tax,
                        shipping: poRow.shipping,
                        total: poRow.total,
                        items: itemsRows
                    })
                })
            })
        })
    })
})

// Generate Purchase Order
router.post('/generate_purchase_order', async (req, res) => {
    const tenant_id = req.tenant_id
    const { po_number, store_id, vendor_name, store_owner, date, subtotal, tax, shipping, total, items } = req.body;

    const getVendorIdByName = (vendorName, tenantId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT id FROM vendors WHERE vendor_name = ? AND tenant_id = ?`
            DB.get(sql, [vendorName, tenantId], (err, row) => {
                if (err || !row) return reject("Vendor not found")
                resolve(row.id)
            })
        })
    }

    let vendor_id;
    try {
        vendor_id = await getVendorIdByName(vendor_name, tenant_id)
    } 
    catch (err) {
        console.error("❌ Vendor lookup failed:", err)
        return res.status(400).json({ error: "Invalid vendor" })
    }

    DB.serialize(() => {
        DB.run('BEGIN TRANSACTION', () => {
            console.log("🔸 Transaction started")
        })

        DB.run(`
            INSERT INTO purchase_orders (tenant_id, po_number, store_id, vendor_id, store_owner, date, subtotal, tax, shipping, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [tenant_id, po_number, store_id, vendor_id, store_owner, date, subtotal, tax, shipping, total], function (err) {
            if (err) {
                console.error("❌ Failed to insert purchase order:", err.message);
                DB.run('ROLLBACK');
                return res.status(500).json({ error: "Failed to create purchase order" });
            }

            const purchaseOrderId = this.lastID;
            const stmt = DB.prepare(`
                INSERT INTO purchase_order_items (
                    purchase_order_id, product_id, qty, unit, name, volume, cost, total, tenant_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let index = 0

            function insertNext() {
                if (index >= items.length) {
                    return stmt.finalize((finalizeErr) => {
                        if (finalizeErr) {
                            console.error("❌ Finalize error:", finalizeErr.message)
                            DB.run('ROLLBACK')
                            return res.status(500).json({ error: "Finalize error" })
                        }

                        DB.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                console.error("❌ Commit failed:", commitErr.message)
                                return res.status(500).json({ error: "Commit failed" })
                            }

                            return res.status(201).json({ success: true, id: purchaseOrderId })
                        })
                    })
                }

                const item = items[index]
                const currentIndex = index // capture for logging
                stmt.run(
                    purchaseOrderId,
                    item.product_id,
                    item.qty,
                    item.unit,
                    item.name,
                    item.volume,
                    item.cost,
                    item.total,
                    tenant_id,
                    (err) => {
                        if (err) {
                            DB.run('ROLLBACK')
                            return res.status(500).json({ error: "Insert item failed" })
                        }

                        index++
                        insertNext()
                    }
                )
            }

            insertNext()
        });
    });
});

// Get PO for the Edit Form
router.get('/purchase_order/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
  
    if (!tenant_id) {
      return res.status(400).json({ error: "[ERR-20250408-TMZOBU] Vendor ID is required" })
    }
  
    const sql = `
        SELECT
            p.id, p.po_number, p.vendor_id, v.vendor_name,
            i.product_id, inv.category, inv.subcategory, i.qty, i.unit
        FROM purchase_orders p
        JOIN purchase_order_items i ON p.id = i.purchase_order_id
        JOIN vendors v ON p.vendor_id = v.id
        JOIN inventory inv ON i.product_id = inv.id
        WHERE p.id = ? AND p.tenant_id = ?
    `
  
    DB.all(sql, [id, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ SQL error (purchase_order):", err.message)
            console.error("🧪 SQL Query:", sql)
            console.error("🧪 Params:", [id, tenant_id])
            return res.status(500).json({ error: "[ERR-20250408-4850JM] Failed to load purchase order" })
        }
  
      if (!rows.length) {
        return res.status(404).json({ error: "Purchase order not found" })
      }
  
      const po = {
        id: rows[0].id,
        po_number: rows[0].po_number,
        vendor_id: rows[0].vendor_id,
        vendor_name: rows[0].vendor_name,
        items: rows.map(row => ({
          product_id: row.product_id,
          category: row.category,
          subcategory: row.subcategory,
          qty: row.qty,
          unit: row.unit
        }))
      }
  
      res.json(po)
    })
  })
  

// Update Purchase Order
router.put('/update_purchase_order/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const { vendor_id, subtotal, tax, shipping, total, items } = req.body

    if (!id || !vendor_id || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    const updateSql = `
        UPDATE purchase_orders
        SET vendor_id = ?, subtotal = ?, tax = ?, shipping = ?, total = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND tenant_id = ?
    `

    DB.run(updateSql, [vendor_id, subtotal, tax, shipping, total, id, tenant_id], function (err) {
        if (err) {
            console.error("❌ Failed to update PO:", err)
            return res.status(500).json({ error: "Failed to update purchase order" })
        }

        const deleteSql = `DELETE FROM purchase_order_items WHERE purchase_order_id = ? AND tenant_id = ?`
        DB.run(deleteSql, [id, tenant_id], function (err) {
            if (err) {
                console.error("❌ Failed to delete PO items:", err)
                return res.status(500).json({ error: "Failed to delete existing PO items" })
            }

            const insertSql = `
                INSERT INTO purchase_order_items
                (purchase_order_id, product_id, qty, unit, name, volume, cost, total, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `

            const stmt = DB.prepare(insertSql)

            for (const item of items) {
                stmt.run([
                    id,
                    item.product_id,
                    item.qty,
                    item.unit,
                    item.name,
                    item.volume,
                    item.cost,
                    item.total,
                    tenant_id
                ])
            }

            stmt.finalize(err => {
                if (err) {
                    console.error("❌ Failed to insert PO items:", err)
                    return res.status(500).json({ error: "Failed to insert PO items" })
                }

                return res.json({ message: "Purchase order updated successfully" })
            })
        })
    })
})

// Delete a Purchase Order
router.delete('/delete_purchase_order/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id

    if (!id || !tenant_id) {
        return res.status(400).json({ error: "Missing purchase order ID or tenant ID" })
    }

    DB.serialize(() => {
        DB.run('BEGIN TRANSACTION')

        // Delete PO items first
        DB.run(
            `DELETE FROM purchase_order_items WHERE purchase_order_id = ? AND tenant_id = ?`,
            [id, tenant_id],
            function (err) {
                if (err) {
                    console.error("❌ Failed to delete PO items:", err.message)
                    DB.run('ROLLBACK')
                    return res.status(500).json({ error: "Failed to delete purchase order items" })
                }

                // Then delete the purchase order
                DB.run(
                    `DELETE FROM purchase_orders WHERE id = ? AND tenant_id = ?`,
                    [id, tenant_id],
                    function (err2) {
                        if (err2) {
                            console.error("❌ Failed to delete purchase order:", err2.message)
                            DB.run('ROLLBACK')
                            return res.status(500).json({ error: "Failed to delete purchase order" })
                        }

                        DB.run('COMMIT')
                        res.json({ success: true, message: "Purchase order deleted successfully" })
                    }
                )
            }
        )
    })
})


// GET: Vendors with at least one product in inventory
router.get('/vendors_with_products', (req, res) => {
    const tenant_id = req.tenant_id

    const sql = `
        SELECT DISTINCT v.id, v.vendor_name
        FROM vendors v
        JOIN inventory i ON v.vendor_name = i.vendor
        WHERE v.tenant_id = ? AND i.tenant_id = ?
        ORDER BY v.vendor_name ASC
    `

    DB.all(sql, [tenant_id, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching vendors with products:", err.message)
            return res.status(500).json({ error: 'Failed to get vendors with products' })
        }

        res.json({ vendors: rows })
    })
})


module.exports = router