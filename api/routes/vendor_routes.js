/** 
 *  BACK OFFICE: VENDOR ROUTES
*/

/* Dependencies */
const express = require('express')
const DB = require('../db/connect')
var router = express.Router()
const { getDateTime } = require('../utils.js')

// GET All Vendors view (tenant-aware)
router.get('/vendors/', (req, res) => {
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM vendors WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get vendors' })
        }

        return res.send({ vendors: rows })
    })
})

// GET Vendors list (tenant-aware)
router.get('/vendors_list/', (req, res) => {
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM vendors WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get vendors' })
        }

        res.json({ vendors: rows })
    })
})

// Get a specific vendor by Id
router.get('/vendor/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const sqlVendors = `SELECT * FROM vendors WHERE id = ? AND tenant_id = ?`

    DB.get(sqlVendors, [id, tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get vendor' })
        }

        return res.send({ vendor: row })
    })
})

// Get a specific vendor by name (requires tenant_id)
router.get('/vendor_by_name/:name', (req, res) => {
    const { name } = req.params
    const tenant_id = req.tenant_id

    const sqlVendors = `
        SELECT * FROM vendors 
        WHERE LOWER(TRIM(vendor_name)) = LOWER(TRIM(?))
        AND tenant_id = ?
    `

    DB.get(sqlVendors, [name, tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get vendor' })
        }
        return res.send({ vendor: row })
    })
})

// Add vendor (tenant-aware)
router.post('/add_vendor', (req, res) => {
    const tenant_id = req.tenant_id
    const {
        vendor_name = "",
        contact_person = "",
        phone = "",
        email = "",
        address = "",
        city = "",
        state = "",
        zip = "",
        vendor_id = "",
        account_number = "",
        tax_id = "",
        payment_terms = "",
        notes = ""
    } = req.body

    const vendorSql = `
        INSERT INTO vendors (
            tenant_id,
            vendor_name, contact_person, phone, email, address, city, state,
            zip, vendor_id, account_number, tax_id, payment_terms, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    DB.run(
        vendorSql,
        [tenant_id, vendor_name, contact_person, phone, email, address, city, state, zip, vendor_id, account_number, tax_id, payment_terms, notes],
        function (err) {
            if (err) {
                console.error("❌ Error inserting vendor:", err)
                return res.status(500).json({ error: "Failed to add vendor." })
            }

            res.send({ success: true, vendor_id: this.lastID })
        }
    )
})

// Update vendor (tenant-aware)
router.put('/update_vendor/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const {
        vendor_name = "",
        contact_person = "",
        phone = "",
        email = "",
        address = "",
        city = "",
        state = "",
        zip = "",
        vendor_id = "",
        account_number = "",
        tax_id = "",
        payment_terms = "",
        notes = ""
    } = req.body

    const vendorSql = `
        UPDATE vendors SET
            vendor_name = ?, contact_person = ?, phone = ?, email = ?,
            address = ?, city = ?, state = ?, zip = ?, vendor_id = ?,
            account_number = ?, tax_id = ?, payment_terms = ?, notes = ?
        WHERE id = ? AND tenant_id = ?
    `

    DB.run(
        vendorSql,
        [vendor_name, contact_person, phone, email, address, city, state, zip, vendor_id, account_number, tax_id, payment_terms, notes, id, tenant_id],
        function (err) {
            if (err) {
                console.error("❌ Error updating vendor:", err)
                return res.status(500).json({ error: "Failed to update vendor." })
            }

            res.send({ success: true, vendor_id: id })
        }
    )
})

// Delete Vendor
router.delete('/delete_vendor/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id

    DB.run('DELETE FROM vendors WHERE id = ? AND tenant_id = ?', [id, tenant_id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to delete vendor' })
        if (this.changes === 0) return res.status(404).json({ error: 'Vendor not found' })
        res.json({ success: true })
            
    })
})


/**
 * 
 * PAYMENT TERMS
 * 
 */

// Get All Payment Terms (Scoped by tenant_id)
router.get('/terms', (req, res) => {
    const tenant_id = req.tenant_id

    DB.all(`SELECT * FROM payment_terms WHERE tenant_id = ?`, [tenant_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch categories' })
      res.json({ terms: rows })
    })
})

// Get Payment Term (Scoped by tenant_id)
router.get('/term/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params

    DB.all(`SELECT payment_term FROM payment_terms WHERE id = ? AND tenant_id = ?`, [id, tenant_id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch categories' })
      res.json({ term: row })
    })
})

// Add New Payment Term (Scoped by tenant)
router.post('/add_term', (req, res) => {
    const tenant_id = req.tenant_id
    const { term } = req.body
  
    if (!term || term.trim() === '') return res.status(400).json({ error: 'Payment Term name is required' })
  
    DB.run(`INSERT INTO payment_terms (payment_term, tenant_id) VALUES (?, ?)`, [term.trim(), tenant_id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add payment term' })
      res.json({ success: true, id: this.lastID })
    })
})

// Delete Payment term
router.delete('/delete_term/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const {id} = req.params

    if (!tenant_id || !id) {
        return res.status(400).json({ error: "Missing tenant_id or unit id" })
    }

    const sql = `DELETE FROM payment_terms WHERE id = ? AND tenant_id = ?`
    
    DB.run(sql, [id, tenant_id], function(err) {
        if (err) {
            console.error("❌ Failed to delete payment term:", err.message)
            return res.status(500).json({ error: "Failed to delete payment term" })
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Payment Term not found" })
        }

        res.send({ success: true, message: "Payment term deleted" })
    })
})

module.exports = router
