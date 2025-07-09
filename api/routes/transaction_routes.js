/** 
 *  BACK OFFICE: TRANSACTIONS ROUTES
*/

/* Dependencies */
const express = require("express");
const router = express.Router();
const DB = require('../db/connect')
const { spawn } = require("child_process");
const path = require("path");
const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)

/**
 * Register
 */
// GET: All Registers
router.get('/registers', (req, res) => {
    const tenant_id = req.tenant_id;

    const sql = `
        SELECT 
            r.id,
            r.opened_date,
            r.opened_time,
            r.closing_amount,
            r.closed_date,
            r.closed_time,
            r.opening_amount,
            r.cash_sales,
            r.user_id,
            r.register_id,
            (u.fname || ' ' || u.lname) AS user_name
        FROM register r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.tenant_id = ?
    `;

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching registers:", err);
            return res.status(500).json({ error: "Failed to fetch registers." });
        }

        const formatted = rows.map(row => ({
            ...row,
            raw_opened_date: row.opened_date,
            opened_time: formatTime(row.opened_time),
            closed_time: row.closed_time ? formatTime(row.closed_time) : null,
            opening_amount: formatCurrency(row.opening_amount),
            closing_amount: row.closing_amount !== null ? formatCurrency(row.closing_amount) : null,
            cash_sales: formatCurrency(row.cash_sales),
            user: row.user_name || "Unknown"
        }));

        res.json({ registers: formatted });
    });
});


function formatTime(timeStr) {
    if (!timeStr) return null;
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr.padStart(2, '0')} ${ampm}`;
}

function formatCurrency(amount) {
    const num = parseFloat(amount || 0);
    return `$${num.toFixed(2)}`;
}

/**
 * Transactions
 */

// GET: All Transactions
router.get('/transactions', (req, res) => {
    const tenant_id = req.tenant_id;
    const { registerId } = req.query;

    // Return all if no registerId provided
    if (!registerId) {
        const sql = `SELECT * FROM transactions WHERE tenant_id = ?`;
        DB.all(sql, [tenant_id], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching all transactions:", err);
                return res.status(500).json({ error: "Failed to fetch transactions." });
            }
            res.json({ transactions: rows });
        });
        return;
    }

    // Lookup register by ID to get opened_date
    const getRegisterSql = `
        SELECT id, register_id, opened_date
        FROM register
        WHERE id = ? AND tenant_id = ?
    `;

    DB.get(getRegisterSql, [registerId, tenant_id], (err, register) => {
        if (err || !register) {
            console.error("❌ Error fetching register:", err || "Not found");
            return res.status(404).json({ error: "Register not found." });
        }

        const { opened_date } = register;

        // Get only cash transactions that match the date
        const getTransactionsSql = `
            SELECT 
                id,
                transaction_id,
                time,
                ROUND(total_amount, 2) AS total_amount,
                sales_type
            FROM transactions
            WHERE tenant_id = ?
              AND date = ?
              AND sales_type = 'cash'
            ORDER BY time ASC
        `;

        DB.all(getTransactionsSql, [tenant_id, opened_date], (err, transactions) => {
            if (err) {
                console.error("❌ Error fetching transactions for register:", err);
                return res.status(500).json({ error: "Failed to fetch transactions." });
            }

            res.json({
                transactions,
                registerMeta: {
                    opened_date,
                    register_id: register.register_id
                }
            });
        });
    });
});

// GET: The Transaction with all items
router.get('/get_transaction/:id', (req, res) => {
    const tenant_id = req.tenant_id  // from middleware
    const transaction_id = req.params.id

    const sql = `
        SELECT 
            t.transaction_id,
            t.date,
            t.time,
            ROUND(t.total_amount, 2) AS total_amount,
            t.sales_type,
            s.store_name,
            s.address || ', ' || s.city || ', ' || s.state || ' ' || s.zip AS store_address,
            s.email AS store_email,
            s.phone AS store_phone,
            s.sales_tax,
            ti.quantity,
            ti.price,
            ti.total,
            ti.product_name,
            ti.upc,
            i.brand,
            i.volume
        FROM transactions t
        JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
        JOIN store s ON t.tenant_id = s.tenant_id
        LEFT JOIN inventory i ON ti.inventory_id = i.id
        WHERE t.transaction_id = ? COLLATE NOCASE AND t.tenant_id = ?
        ORDER BY ti.id ASC
    `

    DB.all(sql, [transaction_id, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching transaction:", err)
            return res.status(500).json({ error: "Failed to fetch transaction details" })
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found" })
        }

        const subtotal = rows.reduce((sum, row) => sum + Number(row.total), 0)
        const taxRate = parseFloat(rows[0].sales_tax || 0)
        const tax = subtotal * (taxRate / 100)
        const total = subtotal + tax

        const meta = {
            transaction_id: rows[0].transaction_id,
            date: rows[0].date,
            time: rows[0].time,
            sales_type: rows[0].sales_type,
            store_name: rows[0].store_name,
            store_address: rows[0].store_address,
            store_email: rows[0].store_email,
            store_phone: rows[0].store_phone,
            subtotal: `$${subtotal.toFixed(2)}`,
            tax: `$${tax.toFixed(2)}`,
            total_amount: `$${total.toFixed(2)}`
        }

        const items = rows.map(row => ({
            product_name: row.product_name,
            brand: row.brand || "",
            volume: row.volume || "",
            quantity: row.quantity,
            price: `$${Number(row.price).toFixed(2)}`,
            total: `$${Number(row.total).toFixed(2)}`,
            upc: row.upc
        }))

        res.json({
            ...meta,
            items,
            success: true
        })
    })
})

// GET: A New Transaction ID
router.get('/get_transaction_id', async (req, res) => {
    console.log('Getting transaction_id...');
    const tenant_id = req.tenant_id // from middleware
    
    const query = `
        SELECT transaction_id 
        FROM transactions 
        WHERE tenant_id = ?
        ORDER BY transaction_id DESC LIMIT 1`;

    DB.get(query, [tenant_id], (err, row) => {
        if (err) {
            console.error("Error fetching last transaction ID:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        let nextID = "TID-000001"; // Default for first transaction

        if (row && row.transaction_id) {
            // Extract numeric part of the ID and increment
            const lastID = row.transaction_id;
            const numPart = parseInt(lastID.split('-')[1], 10); // Extract numeric part
            const incrementedNum = (numPart + 1).toString().padStart(6, '0'); // Increment and pad
            nextID = `TID-${incrementedNum}`;
        }

        res.json({ success: true, transaction_id: nextID });
    });
});

// Get Product by UPC
router.get('/get_product/:upc', (req, res) => {
    const { upc } = req.params
    const tenant_id = req.tenant_id

    const sql = `
        SELECT * FROM inventory 
        WHERE (upc_outer = ? OR upc_inner = ?) AND tenant_id = ?
    `;

    DB.get(sql, [upc, upc,  tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get product' })
        }
        return res.send({ product: row })
    })
})

// Get Cash Sales
router.get('/get_cash_sales/:userId/:registerId', async (req, res) => {
    const { userId, registerId } = req.params
    const tenant_id = req.tenant_id // from middleware

    const query = `
        SELECT SUM(total_amount) AS cash_sales
        FROM transactions
        WHERE user_id = ? AND register_id = ? AND tenant_id = ? AND sales_type = 'cash';
    `

    DB.get(query, [userId, registerId, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message })
        res.json({ cashSales: parseFloat(row?.cash_sales || 0).toFixed(2) })
    })
})


// Complete the transaction
router.post('/complete_transaction', async (req, res) => {
    const { transaction, items } = req.body
    const tenant_id = req.tenant_id // from middleware
  
    if (!transaction || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction data.' })
    }

    const now = new Date()
    const date = now.toISOString().split('T')[0]  // "2025-05-31"
    const time = now.toTimeString().split(' ')[0] // "14:59:00"
  
    const { transaction_id, total_amount, sales_type, user_id, register_id } = transaction

    try {
      // Start transaction
      DB.serialize(() => {
        DB.run('BEGIN TRANSACTION')
  
        // Insert transaction
        DB.run(`
          INSERT INTO transactions (transaction_id, register_id, user_id, date, time, total_amount, sales_type, tenant_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [transaction_id, register_id, user_id, date, time, total_amount, sales_type, tenant_id])
  
        // Prepare statements
        const insertItemStmt = DB.prepare(`
          INSERT INTO transaction_items (transaction_id, inventory_id, product_name, quantity, price, total, unit, upc, tenant_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
  
        const updateInventoryStmt = DB.prepare(`
          UPDATE inventory SET quantity = quantity - ? WHERE id = ?
        `)
  
        // Combine items with same UPC
        const combinedItems = {}
        for (const item of items) {
          const key = item.upc || item.item_id
          if (!combinedItems[key]) {
            combinedItems[key] = { ...item }
          } else {
            combinedItems[key].quantity += item.quantity
            combinedItems[key].total += item.total
          }
        }
  
        // Insert combined items
        for (const key in combinedItems) {
          const item = combinedItems[key]
          const { item_id, product_name, quantity, price, total, unit, upc } = item
  
          insertItemStmt.run(transaction_id, item_id, product_name, quantity, price, total, unit, upc, tenant_id)
          updateInventoryStmt.run(quantity, item_id)
        }
  
        insertItemStmt.finalize()
        updateInventoryStmt.finalize()
  
        DB.run('COMMIT', (err) => {
          if (err) {
            console.error("❌ Commit failed:", err)
            DB.run('ROLLBACK')
            return res.status(500).json({ success: false, message: 'Transaction failed.' })
          }
  
          res.json({ success: true })
        })
      })
    } catch (error) {
      console.error("❌ Error in complete_transaction:", error)
      res.status(500).json({ success: false, message: 'Server error.' })
    }
  })
  

module.exports = router