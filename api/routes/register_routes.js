/************************************************************************************ 
 *  REGISTER ROUTES
*************************************************************************************/

/* Dependencies */
const express = require('express')
const DB = require('../db/connect')
const dayjs = require('dayjs')

const requireTenant = require('../middleware/requireTenant.js')

var router = express.Router()
router.use(express.json())
router.use(requireTenant)


/**
 * ROUTES FOR REGISTER
 */
// OPENT THE REGISTER
router.post('/open_register', async (req, res) => {
    let { user_id, opening_amount, user_name } = req.body
    const tenant_id = req.tenant_id // from middleware

    const now = dayjs()
    const opened_date = now.format('YYYY-MM-DD')
    const opened_time = now.format('hh:mm A')

    const getMaxSql = `SELECT MAX(register_id) AS max_register_id FROM register WHERE tenant_id = ?`
    DB.get(getMaxSql, [tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get max register_id' })

        const register_id = row?.max_register_id ? row.max_register_id + 1 : 1

        const insertSql = `
            INSERT INTO register (user_id, opening_amount, opened_date, opened_time, register_id, tenant_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        DB.run(insertSql, [user_id, opening_amount, opened_date, opened_time, register_id, tenant_id], function (err) {
            if (err) return res.status(500).json({ error: 'Failed to insert register' })

            const logSql = `
                UPDATE user_logs 
                SET register_id = ?, user_name = ? 
                WHERE user_id = ? AND login_date = ? AND tenant_id = ?
            `
            DB.run(logSql, [register_id, user_name, user_id, opened_date, tenant_id], err => {
                if (err) return res.status(500).json({ error: 'Failed to log user' })
            })

            res.send({ success: true, registerID: register_id })
        })
    })
})

// CLOSE THE REGISTER
router.post('/close_register', async (req, res) => {
    let { register_id, user_id, cash_sales, closing_amount } = req.body
    const tenant_id = req.tenant_id // from middleware

    cash_sales = parseFloat(String(cash_sales).replace('$', '')).toFixed(2)
    closing_amount = parseFloat(String(closing_amount).replace('$', '')).toFixed(2)

    const now = dayjs()
    const closed_date = now.format('YYYY-MM-DD')
    const closed_time = now.format('hh:mm A')

    const updateRegisterSql = `
        UPDATE register 
        SET cash_sales = ?, closing_amount = ?, closed_date = ?, closed_time = ?
        WHERE register_id = ? AND user_id = ? AND tenant_id = ?
    `

    DB.run(updateRegisterSql, [cash_sales, closing_amount, closed_date, closed_time, register_id, user_id, tenant_id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update register: ' + err })
        res.send({ success: true })
    })
})




module.exports = router
