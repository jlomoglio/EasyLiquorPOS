/**
 * BACK OFFICE: DASHBOARD ROUTES (Multi-Tenant Enabled)
 */

const express = require('express')
const DB = require('../db/connect')
const router = express.Router()
const dayjs = require('dayjs')
const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)


/**
 * GET: Sales Summary by Day
 */
router.get('/get_sales_summary_by_today/:date', (req, res) => {
    const { date } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT 
      SUM(total_amount) AS total_sales,
      SUM(CASE WHEN sales_type = 'cash' THEN total_amount ELSE 0 END) AS total_cash_sales,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN total_amount ELSE 0 END) AS total_credit_sales
    FROM transactions
    WHERE date(date) = ? AND tenant_id = ?
  `

    DB.get(sql, [date, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get daily sales summary' })
        res.json({
            total_sales: row?.total_sales || 0,
            total_cash_sales: row?.total_cash_sales || 0,
            total_credit_sales: row?.total_credit_sales || 0
        })
    })
})


/**
 * GET: Profit by Day
 */
router.get('/get_sales_profit_by_today/:date', (req, res) => {
    const { date } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT SUM((ti.price - i.cost) * ti.quantity) AS profit_amount
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.transaction_id
    LEFT JOIN inventory i ON ti.inventory_id = i.id
    WHERE t.date = ? AND t.tenant_id = ?
  `

    DB.get(sql, [date, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get daily profit' })
        res.json({ profit_amount: row?.profit_amount || 0 })
    })
})

/**
 * GET: Transaction Counts by Day
 */
router.get('/get_transaction_counts_by_today/:date', (req, res) => {
    const { date } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT 
      SUM(CASE WHEN sales_type = 'cash' THEN 1 ELSE 0 END) AS today_cash_transactions,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN 1 ELSE 0 END) AS today_credit_transactions
    FROM transactions
    WHERE date = ? AND tenant_id = ?
  `

    DB.get(sql, [date, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get daily transaction counts' })
        res.json({
            today_cash_transactions: row?.today_cash_transactions || 0,
            today_credit_transactions: row?.today_credit_transactions || 0
        })
    })
})

/**
 * GET: Sales Comparison by Day (vs same day last year)
 */
router.get('/get_sales_comparison_by_today/:date', (req, res) => {
    const { date } = req.params
    const tenant_id = req.tenant_id

    const currentDate = new Date(date)
    if (isNaN(currentDate)) return res.status(400).json({ error: 'Invalid date' })

    const current = date
    const previous = new Date(currentDate.getTime()) // clone
    previous.setFullYear(previous.getFullYear() - 1)

    const previousDate = previous.toISOString().split('T')[0]

    const sql = `
    SELECT 
      SUM(CASE WHEN date = ? THEN total_amount ELSE 0 END) AS current_day_sales,
      SUM(CASE WHEN date = ? THEN total_amount ELSE 0 END) AS previous_day_sales
    FROM transactions
    WHERE tenant_id = ?
  `

    DB.get(sql, [current, previousDate, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get daily comparison' })

        const currentSales = row?.current_day_sales || 0
        const previousSales = row?.previous_day_sales || 0

        let percentage_change = 0
        if (previousSales > 0) {
            percentage_change = ((currentSales - previousSales) / previousSales) * 100
        }

        res.json({ percentage_change: parseFloat(percentage_change.toFixed(2)) })
    })
})




/**
 * GET: Sales Summary By Month
 */
router.get('/get_sales_summary_by_month/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`

    const sql = `
    SELECT 
      SUM(total_amount) AS total_sales,
      SUM(CASE WHEN sales_type = 'cash' THEN total_amount ELSE 0 END) AS total_cash_sales,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN total_amount ELSE 0 END) AS total_credit_sales
    FROM transactions
    WHERE strftime('%Y-%m', date) = ? AND tenant_id = ?
  `

    DB.get(sql, [ym, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get monthly sales summary' })
        res.json({
            total_sales: row?.total_sales || 0,
            total_cash_sales: row?.total_cash_sales || 0,
            total_credit_sales: row?.total_credit_sales || 0
        })
    })
})

/**
 * GET: Sales Comparison by Month
 */
router.get('/get_sales_profit_by_month/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`

    const sql = `
    SELECT SUM((ti.price - i.cost) * ti.quantity) AS profit_amount
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.transaction_id
    LEFT JOIN inventory i ON ti.inventory_id = i.id
    WHERE strftime('%Y-%m', t.date) = ? AND t.tenant_id = ?
  `

    DB.get(sql, [ym, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get monthly profit' })
        res.json({ profit_amount: row?.profit_amount || 0 })
    })
})

/**
 * GET: Transaction Counts by Month
 */
router.get('/get_transaction_counts_by_month/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`

    const sql = `
    SELECT 
      SUM(CASE WHEN sales_type = 'cash' THEN 1 ELSE 0 END) AS total_cash_transactions,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN 1 ELSE 0 END) AS total_credit_transactions
    FROM transactions
    WHERE strftime('%Y-%m', date) = ? AND tenant_id = ?
  `

    DB.get(sql, [ym, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get monthly transaction counts' })
        res.json({
            total_cash_transactions: row?.total_cash_transactions || 0,
            total_credit_transactions: row?.total_credit_transactions || 0
        })
    })
})

/**
 * GET: Sales Comparison by Month
 */
router.get('/get_sales_comparison_by_month/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id

    const current = `${year}-${month}`
    const dateObj = new Date(`${year}-${month}-01`)
    dateObj.setMonth(dateObj.getMonth() - 1)
    const prev = dateObj.toISOString().slice(0, 7) // yyyy-mm

    const sql = `
    SELECT 
      SUM(CASE WHEN strftime('%Y-%m', date) = ? THEN total_amount ELSE 0 END) AS current_month_sales,
      SUM(CASE WHEN strftime('%Y-%m', date) = ? THEN total_amount ELSE 0 END) AS previous_month_sales
    FROM transactions
    WHERE tenant_id = ?
  `

    DB.get(sql, [current, prev, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get monthly comparison' })

        const currentSales = row?.current_month_sales || 0
        const previousSales = row?.previous_month_sales || 0

        let percentage_change = 0
        if (previousSales > 0) {
            percentage_change = ((currentSales - previousSales) / previousSales) * 100
        }

        res.json({ percentage_change: parseFloat(percentage_change.toFixed(2)) })
    })
})





/**
 * GET: Total Sales by Year
 */
router.get('/get_total_sales_by_year/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT SUM(total_amount) AS total_sales
    FROM transactions
    WHERE strftime('%Y', date) = ? AND tenant_id = ?
  `

    DB.get(sql, [year, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get total sales' })
        res.json({ total_sales: row?.total_sales || 0 })
    })
})

/**
 * GET: Sales Summary by Year
 */
router.get('/get_sales_summary_by_year/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT 
      SUM(total_amount) AS total_sales,
      SUM(CASE WHEN sales_type = 'cash' THEN total_amount ELSE 0 END) AS total_cash_sales,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN total_amount ELSE 0 END) AS total_credit_sales
    FROM transactions
    WHERE strftime('%Y', date) = ? AND tenant_id = ?
  `

    DB.get(sql, [year, tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to get sales summary' })
        res.json({
            total_sales: row?.total_sales || 0,
            total_cash_sales: row?.total_cash_sales || 0,
            total_credit_sales: row?.total_credit_sales || 0
        })
    })
})

/**
 * GET: Sales Profit by Year
 */
router.get('/get_sales_profit_by_year/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT SUM((ti.price - i.cost) * ti.quantity) AS profit_amount
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.transaction_id
    LEFT JOIN inventory i ON ti.inventory_id = i.id
    WHERE strftime('%Y', t.date) = ? AND t.tenant_id = ?
  `

    DB.get(sql, [year, tenant_id], (err, row) => {
        if (err) {
            console.error("❌ Error calculating profit:", err)
            return res.status(500).json({ error: 'Failed to get profit' })
        }

        res.json({ profit_amount: row?.profit_amount || 0 })
    })
})

/**
 * GET: Transaction Counts by Year
 */
router.get('/get_transaction_counts_by_year/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id

    const sql = `
    SELECT 
      SUM(CASE WHEN sales_type = 'cash' THEN 1 ELSE 0 END) AS total_cash_transactions,
      SUM(CASE WHEN sales_type IN ('credit', 'debit') THEN 1 ELSE 0 END) AS total_credit_transactions
    FROM transactions
    WHERE strftime('%Y', date) = ? AND tenant_id = ?
  `

    DB.get(sql, [year, tenant_id], (err, row) => {
        if (err) {
            console.error("❌ Error getting yearly transaction count:", err)
            return res.status(500).json({ error: 'Failed to get transaction counts' })
        }

        res.json({
            total_cash_transactions: row?.total_cash_transactions || 0,
            total_credit_transactions: row?.total_credit_transactions || 0
        })
    })
})

/**
 * GET: Sales Comparison by Year
 */
router.get('/get_sales_comparison_by_year/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id

    const currentYear = parseInt(year)
    const previousYear = currentYear - 1

    const sql = `
    SELECT 
      SUM(CASE WHEN strftime('%Y', date) = ? THEN total_amount ELSE 0 END) AS current_year_sales,
      SUM(CASE WHEN strftime('%Y', date) = ? THEN total_amount ELSE 0 END) AS previous_year_sales
    FROM transactions
    WHERE tenant_id = ?
  `

    DB.get(sql, [String(currentYear), String(previousYear), tenant_id], (err, row) => {
        if (err) {
            console.error("❌ Error getting sales comparison:", err)
            return res.status(500).json({ error: 'Failed to get sales comparison' })
        }

        const current = row?.current_year_sales || 0
        const previous = row?.previous_year_sales || 0

        let percentage_change = 0
        if (previous > 0) {
            percentage_change = ((current - previous) / previous) * 100
        }

        res.json({ percentage_change: parseFloat(percentage_change.toFixed(2)) })
    })
})



/**
 * GET: Upcoming deliveries in the next 5 days
 */
router.get('/get_upcoming_deliveries', (req, res) => {
    const tenant_id = req.tenant_id
    const today = dayjs().format('YYYY-MM-DD')
    const futureDate = dayjs().add(5, 'day').format('YYYY-MM-DD')

    const sql = `
    SELECT 
      ds.id,
      ds.delivery_date,
      ds.start_time,
      ds.status,
      COALESCE(v.vendor_name, ds.vendor_name, 'Unknown Vendor') AS vendor_name
    FROM delivery_schedule ds
    LEFT JOIN vendors v ON ds.vendor_id = v.id
    WHERE ds.delivery_date BETWEEN ? AND ?
      AND ds.tenant_id = ?
    ORDER BY ds.delivery_date ASC, ds.start_time ASC
  `

    DB.all(sql, [today, futureDate, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching upcoming deliveries:", err)
            return res.status(500).json({ error: "Failed to fetch upcoming deliveries" })
        }

        res.json({ deliveries: rows || [] })
    })
})




// ///////////////////////////////////////////////////////////////////////////////
// INVENTORY
// ///////////////////////////////////////////////////////////////////////////////

/**
 * GET: Top Selling Products
 */
router.get('/get_top_selling_products/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`

    const sql = `
    SELECT 
      ti.inventory_id,
      ti.product_name,
      i.brand,
      i.volume,
      SUM(ti.quantity) AS total_quantity_sold,
      SUM(ti.total) AS total_revenue
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.transaction_id
    LEFT JOIN inventory i ON ti.inventory_id = i.id
    WHERE strftime('%Y-%m', t.date) = ? AND t.tenant_id = ?
    GROUP BY ti.inventory_id
    ORDER BY total_quantity_sold DESC
    LIMIT 5
  `

    DB.all(sql, [ym, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Failed to fetch top selling products:", err)
            return res.status(500).json({ error: 'Could not retrieve top selling products' })
        }

        res.json({ products: rows || [] })
    })
})


// GET: Total Inventory Count
router.get('/get_total_inventory', (req, res) => {
    const tenant_id = req.tenant_id

    const sql = `SELECT COUNT(*) AS total_inventory FROM inventory WHERE tenant_id = ?`
    DB.get(sql, [tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch total inventory count' })
        res.json({ total_inventory: row.total_inventory || 0 })
    })
})

// GET: Total Inventory Value
router.get('/get_inventory_value', (req, res) => {
    const tenant_id = req.tenant_id

    const sql = `SELECT SUM(total_value) AS inventory_value FROM inventory WHERE tenant_id = ?`
    DB.get(sql, [tenant_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch inventory value' })
        res.json({ inventory_value: row.inventory_value || 0 })
    })
})

// GET: Top Inventory Category (most products)
router.get('/get_top_category', (req, res) => {
    const tenant_id = req.tenant_id
    console.log("📥 [GET] /get_top_category | tenant_id =", tenant_id)
  
    const sql = `
      SELECT category, COUNT(*) AS product_count
      FROM inventory
      WHERE tenant_id = ?
      GROUP BY category
      ORDER BY product_count DESC
      LIMIT 1
    `
  
    DB.get(sql, [tenant_id], (err, row) => {
      if (err) {
        console.error("❌ SQL ERROR (get_top_category):", err.message)
        console.error("🧪 Query:", sql)
        console.error("🧪 Params:", tenant_id)
        return res.status(500).json({
          error: `[ERR-${dayjs().format('YYYYMMDD-HHmmss')}] Failed to fetch top category`,
          detail: err.message
        })
      }
  
      console.log("✅ Top category result:", row)
  
      res.json({
        top_category: row?.category || 'N/A',
        product_count: row?.product_count || 0
      })
    })
  })
  
// GET: Products By Category
router.get('/get_products_by_category/:name', (req, res) => {
    const category = req.params.name
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT name, brand, volume, quantity, price_per_unit
      FROM inventory
      WHERE LOWER(TRIM(category)) = LOWER(TRIM(?)) AND tenant_id = ?
      ORDER BY name ASC
    `
  
    DB.all(sql, [category, tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch products by category:", err.message)
        return res.status(500).json({ error: 'Failed to fetch products by category' })
      }
      res.json({ products: rows })
    })
  })
  
  router.get('/get_total_units', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT SUM(quantity) AS total_units 
      FROM inventory 
      WHERE tenant_id = ?
    `
  
    DB.get(sql, [tenant_id], (err, row) => {
      if (err) {
        console.error("❌ Error getting total units:", err.message)
        return res.status(500).json({ error: 'Failed to fetch total inventory units' })
      }
      res.json({ total_units: row?.total_units || 0 })
    })
  })

  

  router.get('/get_largest_category_value', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT category, SUM(total_value) AS total_value
      FROM inventory
      WHERE tenant_id = ?
      GROUP BY category
      ORDER BY total_value DESC
      LIMIT 1
    `
  
    DB.get(sql, [tenant_id], (err, row) => {
      if (err) {
        console.error("❌ Error getting largest category by value:", err.message)
        return res.status(500).json({ error: 'Failed to fetch largest category value' })
      }
      res.json({
        category: row?.category || 'N/A',
        total_value: row?.total_value || 0
      })
    })
  })
  

// GET: Inventory Value Trend (past 30 days)
router.get('/get_inventory_trend', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        date_added AS date,
        SUM(total_value) AS total
      FROM inventory
      WHERE tenant_id = ?
        AND date_added >= date('now', '-30 days')
      GROUP BY date
      ORDER BY date ASC
    `
  
    DB.all(sql, [tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching inventory trend:", err.message)
        return res.status(500).json({ error: 'Failed to fetch inventory trend' })
      }
  
      const trend = rows.map(row => ({
        date: row.date,
        value: row.total
      }))
  
      res.json({ trend })
    })
  })

  
  // GET: Inventory Category Distribution
router.get('/get_category_distribution', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        category,
        SUM(total_value) AS value
      FROM inventory
      WHERE tenant_id = ?
      GROUP BY category
      ORDER BY value DESC
    `
  
    DB.all(sql, [tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching category distribution:", err.message)
        return res.status(500).json({ error: 'Failed to fetch category distribution' })
      }
  
      const categories = rows.map(row => ({
        category: row.category,
        value: row.value
      }))
  
      res.json({ categories })
    })
  })
  

// GET: Sales by Category
router.get('/get_sales_by_category/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`
  
    const sql = `
      SELECT c.category, 
             COALESCE(SUM(ti.total), 0) AS total
      FROM categories c
      LEFT JOIN inventory i ON i.category = c.category AND i.tenant_id = ?
      LEFT JOIN transaction_items ti ON ti.inventory_id = i.id
      LEFT JOIN transactions t ON ti.transaction_id = t.transaction_id 
                               AND strftime('%Y-%m', t.date) = ? 
                               AND t.tenant_id = ?
      WHERE c.tenant_id = ?
      GROUP BY c.category
      ORDER BY total DESC
    `
  
    DB.all(sql, [tenant_id, ym, tenant_id, tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Failed to get full sales by category:", err.message)
        return res.status(500).json({ error: 'Could not fetch full sales breakdown' })
      }
      res.json({ data: rows })
    })
})
  
// GET: Low Stock Alerts
router.get("/low_stock_alerts", (req, res) => {
    const tenant_id = req.tenant_id
    const threshold = 5 // or use product-level threshold
  
    const sql = `
      SELECT name, quantity
      FROM inventory
      WHERE quantity <= ? AND tenant_id = ?
      ORDER BY quantity ASC
    `
  
    DB.all(sql, [threshold, tenant_id], (err, rows) => {
      if (err) {
        console.error("Failed to fetch low stock alerts:", err)
        return res.status(500).json({ error: "Failed to fetch low stock alerts" })
      }
  
      res.json({ items: rows })
    })
  })


  // GET: Inventory Overstock
  router.get('/inventory_overstock', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        i.id,
        i.name,
        i.volume,
        i.total_units AS current_stock,
        i.restock_level,
        i.total_units - (i.restock_level * 3) AS overstock_amount
      FROM inventory i
      WHERE i.tenant_id = ? AND i.total_units > (i.restock_level * 3)
      ORDER BY overstock_amount DESC
      LIMIT 10
    `
  
    DB.all(sql, [tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch overstock warnings:", err.message)
        return res.status(500).json({ error: "Failed to fetch overstock warnings" })
      }
  
      res.json({ items: rows })
    })
  })
  
  
// GET: Inventory Turnover History
router.get('/inventory_turnover_history/:year', (req, res) => {
    const { year } = req.params
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        strftime('%m', t.date) AS month,
        ROUND(SUM(ti.quantity * i.cost), 2) AS cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.transaction_id
      JOIN inventory i ON ti.inventory_id = i.id
      WHERE strftime('%Y', t.date) = ? AND t.tenant_id = ?
      GROUP BY month
      ORDER BY month ASC
    `
  
    DB.all(sql, [year, tenant_id], async (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch COGS:", err.message)
        return res.status(500).json({ error: "Turnover history fetch failed" })
      }
  
      try {
        // Get avg inventory value (total_value) across the year
        const avgInvSql = `SELECT AVG(total_value) as avg_inventory FROM inventory WHERE tenant_id = ?`
        DB.get(avgInvSql, [tenant_id], (avgErr, avgRow) => {
          if (avgErr) {
            console.error("❌ Failed to fetch avg inventory:", avgErr.message)
            return res.status(500).json({ error: "Avg inventory fetch failed" })
          }
  
          const avgInventory = parseFloat(avgRow.avg_inventory || 1) // avoid divide by 0
  
          const history = rows.map(r => ({
            month: r.month,
            ratio: parseFloat((r.cogs / avgInventory).toFixed(2))
          }))
  
          res.json({ history })
        })
      } catch (err) {
        console.error("❌ Error processing turnover history:", err.message)
        return res.status(500).json({ error: "Server error" })
      }
    })
  })
  
  
// Inventory Turnover Ratio
  router.get('/inventory_turnover_ratio/:year/:month', (req, res) => {
    const { year, month } = req.params
    const tenant_id = req.tenant_id
    const ym = `${year}-${month}`
  
    // We'll assume cost of goods sold (COGS) is total of item costs sold in the month
    const sqlCOGS = `
      SELECT SUM(ti.quantity * i.cost) AS cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.transaction_id
      JOIN inventory i ON ti.inventory_id = i.id
      WHERE strftime('%Y-%m', t.date) = ? AND t.tenant_id = ?
    `
  
    // And average inventory is the average of total_value for the tenant during the month
    const sqlInventory = `
      SELECT AVG(total_value) AS avg_inventory
      FROM inventory
      WHERE tenant_id = ?
    `
  
    DB.get(sqlCOGS, [ym, tenant_id], (err, cogsRow) => {
      if (err) {
        console.error("❌ Failed to calculate COGS:", err.message)
        return res.status(500).json({ error: "Something went wrong." })
      }
  
      const cogs = parseFloat(cogsRow?.cogs || 0)
  
      DB.get(sqlInventory, [tenant_id], (err, invRow) => {
        if (err) {
          console.error("❌ Failed to get average inventory:", err.message)
          return res.status(500).json({ error: "Something went wrong." })
        }
  
        const avgInventory = parseFloat(invRow?.avg_inventory || 0)
  
        if (avgInventory === 0) {
          return res.json({ ratio: 0 }) // Avoid divide by 0
        }
  
        const ratio = parseFloat((cogs / avgInventory).toFixed(2))
        res.json({ ratio })
      })
    })
  })
  


// GET: Stale Inventory
router.get('/inventory_stale', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        i.id,
        i.name,
        i.volume,
        MAX(t.date) AS last_sold
      FROM inventory i
      LEFT JOIN transaction_items ti ON i.id = ti.inventory_id
      LEFT JOIN transactions t ON ti.transaction_id = t.transaction_id AND t.tenant_id = ?
      WHERE i.tenant_id = ?
      GROUP BY i.id
      HAVING last_sold IS NULL OR DATE(last_sold) <= DATE('now', '-60 days')
      ORDER BY last_sold ASC
      LIMIT 10
    `
  
    DB.all(sql, [tenant_id, tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch stale inventory:", err.message)
        return res.status(500).json({ error: "Failed to fetch stale inventory" })
      }
  
      res.json({ items: rows })
    })
  })
  

// GET Inventory Category Breakdown
router.get('/inventory_category_breakdown', (req, res) => {
    const tenant_id = req.tenant_id
  
    const sql = `
      SELECT 
        category,
        SUM(total_value) AS total_value
      FROM inventory
      WHERE tenant_id = ?
      GROUP BY category
      ORDER BY total_value DESC
    `
  
    DB.all(sql, [tenant_id], (err, rows) => {
      if (err) {
        console.error("❌ Failed to fetch inventory category breakdown:", err.message)
        return res.status(500).json({ error: "Failed to fetch inventory category breakdown" })
      }
  
      res.json({ items: rows })
    })
  })
  
  



module.exports = router
