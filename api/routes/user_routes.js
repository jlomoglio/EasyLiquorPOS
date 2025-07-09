/** 
 *  USER ROUTES (Multi-Tenant Enabled)
*/

/* Dependencies */
const express = require('express')
const DB = require('../db/connect')
var router = express.Router()
const { getDateTime } = require('../utils.js')

const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)


/**
 * 
 * USERS
 * 
 */

// GET Users by tenant_id
router.get('/users', (req, res) => {
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM users WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to get users' })
        res.send({ users: rows })
    })
})

// GET A Single User
router.get('/user/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params
    const sql = `SELECT * FROM users WHERE id = ? AND tenant_id = ?`

    DB.get(sql, [id, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get user' })
        return res.send({ user: row })
    })
})

// ADD User
router.post('/add_user', (req, res) => {
    const tenant_id = req.tenant_id
    const { fname, lname, email, phone, address, city, state, zip,
            username, password, pin, role } = req.body

    const sql = `INSERT INTO users(
        fname, lname, email, phone, address, city, state, zip, username, password, pin, role, tenant_id
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    DB.run(sql, [
        fname, lname, email, phone, address, city, state, zip,
        username, password, pin, role, tenant_id
    ], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to add user' })
        res.send({ success: true })
    })
})

// DELETE user by ID
router.delete('/delete_user/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params

    const sql = 'DELETE FROM users WHERE id = ? AND tenant_id = ?'

    DB.run(sql, [id, tenant_id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to delete user' })
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' })
        return res.json({ success: true })
    })
})

// Render View User view
router.get('/view_user/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const id = req.params.id

    const sql = `SELECT * FROM users WHERE id = ? AND tenant_id = ?`

    DB.all(sql, [id, tenant_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to get users' })

        const start_date = new Date(rows[0].start_date)
        const end_date = new Date(rows[0].end_date)

        const formattedStartDate = start_date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const formattedEndDate = end_date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

        res.render('back_office/view_user.twig', { 
            user: rows[0], 
            startDate: formattedStartDate,
            endDate: formattedEndDate
        })
    })
})

// UPDATE User
router.put('/update_user/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const id = req.params.id
    const { fname, lname, email, phone, address, city, state, zip,
            username, password, pin, role} = req.body

    const sql = `UPDATE users SET
        fname = ?, lname = ?, email = ?, phone = ?, address = ?, city = ?,
        state = ?, zip = ?, username = ?, password = ?, pin = ?, role = ?, tenant_id = ?
    WHERE id = ?`

    DB.run(sql, [
        fname, lname, email, phone, address, city, state, zip,
        username, password, pin, role, tenant_id, id
    ], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update user' })
        return res.send({ success: true })
    })
})




/**
 * 
 * USER LOGS
 * 
 */

// GET all user logs
router.get('/user_logs', (req, res) => {
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM user_logs WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to get users' })
        res.send({ user_logs: rows })
    })
})

// GET Employees for user log filter by user
router.get('/get_logged_users', async (req, res) => {
    const tenant_id = req.tenant_id

    // Get user name as a Promise
    function getUsersName(userId) {
        return new Promise((resolve, reject) => {
            const sqlUser = `SELECT fname, lname FROM users WHERE id = ? AND tenant_id = ?`
            DB.get(sqlUser, [userId, tenant_id], (err, row) => {
                if (err) {
                    reject(err)
                } else if (row) {
                    resolve(row.fname + " " + row.lname)
                } else {
                    resolve("Unknown User") // Default if no user is found
                }
            })
        })
    }

    // Query all registers
    const sql = `SELECT DISTINCT user_id FROM register WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], async (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get users' })
        }

        try {
            // Use `Promise.all` to resolve all getUsersName calls
            const logged_users = await Promise.all(
                rows.map(async (user) => {
                    const name = await getUsersName(user.user_id) // Wait for the name to resolve
                    return {
                        user_id: user.user_id,
                        name: name,
                    }
                })
            )

            res.json({ logged_users: logged_users })
        } 
        catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Failed to fetch user names' })
        }
    })
})

// Filter users logs by employee
router.get('/filter_user_logs/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const userId = req.params.id

    if (userId === "0" || userId === "null" || userId === "undefined" || userId === "") {
        // Query for all subcategories
        sql = `SELECT * FROM user_logs`

        // Execute the query without parameters
        DB.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get logged users' })
            }

            res.json({ user_logs: rows })
        })
    } else {
        // Query for specific category
        sql = `SELECT * FROM user_logs WHERE user_id = ?`

        // Execute the query with parameters
        DB.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get logged user' })
            }

            res.json({ user_logs: rows })
        })
    }
})

// Filter users logs by date
router.get('/filter_user_logs_by_date/:date/:userId?', (req, res) => {
    const filter_date = req.params.date;
    const userId = req.params.userId && req.params.userId !== "All" ? req.params.userId : null; // Fix "All" issue

    let sql = `SELECT * FROM user_logs WHERE login_date = ?`;
    let params = [filter_date];

    if (userId) {
        sql += ` AND user_id = ?`;
        params.push(userId);
    }

    DB.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to get logged user' });
        }

        if (rows.length === 0) {
            return res.json({ user_logs: [] }); // Ensure frontend sees an empty list
        }

        // Fetch user details
        const userIds = [...new Set(rows.map(log => log.user_id))];

        if (userIds.length === 0) {
            return res.json({ user_logs: [] }); // No users found for the selected date
        }

        const sqlUsers = `SELECT id as user_id, fname, lname FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`;

        DB.all(sqlUsers, userIds, (err, users) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to get users' });
            }

            const userMap = {};
            users.forEach(user => {
                userMap[user.user_id] = `${user.fname} ${user.lname}`;
            });

            const mergedLogs = rows.map(log => ({
                ...log,
                user_name: userMap[log.user_id] || "Unknown"
            }));

            res.json({ user_logs: mergedLogs });
        });
    });
});

// Delete User Log by log id
router.get('/delete_user_log/:log_id', (req, res) => {
    const log_id = req.params.log_id

    // SQL query to delete the user log
    const sql = 'DELETE FROM user_logs WHERE id = ?'

    // Execute the query
    DB.run(sql, [log_id], function (err) {
        if (err) {
            console.error(err.message)
            return res.status(500).json({ error: 'Failed to delete user log' })
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User log not found' })
        }

        return res.json({ success: true })

    })
})

module.exports = router
