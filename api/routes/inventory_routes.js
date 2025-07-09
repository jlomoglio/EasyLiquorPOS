/** 
 *  BACK OFFICE: INVENTORY ROUTES
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
 * CATEGORIES
 * 
 */
// Get All Categories (Scoped by tenant_id)
router.get('/categories', (req, res) => {
    const tenant_id = req.tenant_id
    DB.all(`SELECT * FROM categories WHERE tenant_id = ?`, [tenant_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch categories' })
      res.json({ categories: rows })
    })
})

// Get Subcategories for a Category (Scoped by tenant_id)
router.get('/subcategories/:category', (req, res) => {
    const tenant_id = req.tenant_id
    const category = req.params.category

    const sql = `SELECT * FROM subcategories WHERE category = ? AND tenant_id = ?`
    DB.all(sql, [category, tenant_id], (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to fetch subcategories' })
        }
        res.send({ subcategories: rows })
    })
})

// Check if Category Has Subcategories (Scoped by tenant_id)
router.get('/category_has_subcategories/:category', (req, res) => {
    const tenant_id = req.tenant_id
    const category = req.params.category

    console.log("category_has_subcategories | Category = " + category)

    const sql = `SELECT COUNT(*) as count FROM subcategories WHERE category = ? AND tenant_id = ?`
    DB.get(sql, [category, tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to check subcategories' })
        }

        if(row.count > 0) {
            return res.send({ hasSubcategories: true })
        }
        else {
            return res.send({ hasSubcategories: false })
        }
        
    })
})

// Add New Category (Scoped by tenant)
router.post('/add_category', (req, res) => {
    const tenant_id = req.tenant_id
    const { category } = req.body
  
    if (!category || category.trim() === '') return res.status(400).json({ error: 'Category name is required' })
  
    DB.run(`INSERT INTO categories (category, tenant_id) VALUES (?, ?)`, [category.trim(), tenant_id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add category' })
      res.json({ success: true, id: this.lastID })
    })
})

// DELETE CATEGORY BY NAME
router.delete('/delete_category/:category', (req, res) => {
    const tenant_id = req.tenant_id
    const category = decodeURIComponent(req.params.category)

    if (!tenant_id || !category) {
        return res.status(400).json({ error: "Missing tenant_id or category" })
    }

    const sql = `DELETE FROM categories WHERE category = ? AND tenant_id = ?`
    
    DB.run(sql, [category, tenant_id], function(err) {
        if (err) {
            console.error("❌ Failed to delete category:", err.message)
            return res.status(500).json({ error: "Failed to delete category" })
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Category not found" })
        }

        res.send({ success: true, message: "Category deleted" })
    })
})

// Get Categories & Subcategories
router.get('/categories_subcategories', (req, res) => {
    const tenant_id = req.tenant_id

    if (!tenant_id) {
        return res.status(400).json({ error: "Missing tenant_id" })
    }

    const sqlCategories = `SELECT * FROM categories WHERE tenant_id ?`
    const sqlSubategories = `SELECT * FROM subcategories WHERE tenant_id ?`

    DB.all(sqlCategories, [tenant_id], (err, rows_categories) => {

        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get categories' })
        }

        DB.all(sqlSubategories, [tenant_id], (err, rows_subcategories) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get subcategories' })
            }

            res.json({ 
                "categories": rows_categories, 
                "subcategories": rows_subcategories 
            })
        })
    })
})

// Filter Subcategories by Category
router.get('/filter_subcategories/:category', (req, res) => {
    const tenant_id = req.tenant_id
    const category = req.params.category
    
    let sql = ""

    if (category === "all") {
        // Query for all subcategories
        sql = `SELECT * FROM subcategories WHERE tenant_id ?`

        // Execute the query without parameters
        DB.all(sql, [tenant_id], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get subcategories' })
            }

            res.json({ subcategories: rows })
        })
    } else {
        // Query for specific category
        sql = `SELECT * FROM subcategories WHERE category = ? AND tenant_id = ?`

        // Execute the query with parameters
        DB.all(sql, [category, tenant_id], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get subcategories' })
            }

            res.json({ subcategories: rows })
        })
    }
})

// Get Category Name by ID
router.get('/category/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params;

    const sql = `SELECT category FROM categories WHERE id = ? AND tenant_id = ?`;

    DB.get(sql, [id, tenant_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve subcategories' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ category: row.category });
    });
});


/**
 * 
 * SUBCATEGORIES
 * 
 */

// Get Subcategory Name by ID
router.get('/subcategory/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params

    const sql = `SELECT subcategory FROM subcategories WHERE id = ? AND tenant_id = ?`;

    DB.get(sql, [id, tenant_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve subcategories' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ subcategory: row.subcategory });
    });
});

// GET Subcategories
router.get('/get_subcategories/:category', (req, res) => {
    const tenant_id = req.tenant_id
    const { category } = req.params

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }

    const sql = "SELECT * FROM subcategories WHERE category = ? AND tenant_id = ?";
    
    DB.all(sql, [category, tenant_id], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching subcategories:", err);
            return res.status(500).json({ error: "Failed to fetch subcategories" });
        }

        if (!rows || rows.length === 0) {
            console.warn("⚠️ No subcategories found for:", category)
            return res.json({ subcategories: [] }) // ✅ Good
        }

        res.json({ subcategories: rows });
    });
})

// Add Subcategory
router.post('/add_subcategory', (req, res) => {
    const tenant_id = req.tenant_id
    const { category, subcategory } = req.body

    if (!category || !subcategory) {
        return res.status(400).json({ error: 'Category and subcategory are required' })
    }

    // Check if subcategory already exists for this category and tenant
    const checkSql = `SELECT * FROM subcategories WHERE category = ? AND subcategory = ? AND tenant_id = ?`

    DB.get(checkSql, [category, subcategory, tenant_id], (err, row) => {
        if (err) {
            console.error('❌ Error checking for existing subcategory:', err)
            return res.status(500).json({ error: 'Failed to check subcategory' })
        }

        if (row) {
            return res.send({ success: false })
        }

        // If not exists, insert it
        const insertSql = `INSERT INTO subcategories(category, subcategory, tenant_id) VALUES(?, ?, ?)`

        DB.run(insertSql, [category, subcategory, tenant_id], function (err) {
            if (err) {
                console.error('❌ Error inserting subcategory:', err)
                return res.status(500).json({ error: 'Failed to add subcategory' })
            }

            res.status(200).send({ success: true, id: this.lastID })
        })
    })
})

// DELETE Subcategory
router.delete('/delete_subcategory/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const subcategoryId = req.params.id;

    // SQL to update inventory products that have this subcategory
    const updateInventorySql = `
        UPDATE inventory SET subcategory = NULL     
        WHERE subcategory = (SELECT subcategory FROM subcategories WHERE id = ? AND tenant_id = ?)`;

    // SQL to delete the subcategory
    const deleteSubcategorySql = 'DELETE FROM subcategories WHERE id = ? AND tenant_id = ?';

    DB.run(updateInventorySql, [subcategoryId, tenant_id], function (err) {
        if (err) {
            console.error("❌ Error updating inventory:", err.message);
            return res.status(500).json({ error: 'Failed to update inventory' });
        }

        DB.run(deleteSubcategorySql, [subcategoryId, tenant_id], function (err) {
            if (err) {
                console.error("❌ Error deleting subcategory:", err.message);
                return res.status(500).json({ error: 'Failed to delete subcategory' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Subcategory not found' });
            }

            res.status(200).send({ success: true, message: 'Subcategory deleted and inventory updated' });
        });
    });
});


/**
 * 
 * UNITS
 * 
 */

// Get All Units (Scoped by tenant_id)
router.get('/units', (req, res) => {
    const tenant_id = req.tenant_id

    DB.all(`SELECT * FROM units WHERE tenant_id = ?`, [tenant_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch categories' })
      res.json({ units: rows })
    })
})

// Get Unit (Scoped by tenant_id)
router.get('/unit/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const { id } = req.params

    DB.all(`SELECT unit FROM units WHERE id = ? AND tenant_id = ?`, [id, tenant_id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch categories' })
      res.json({ unit: row })
    })
})

// Add New Unit (Scoped by tenant)
router.post('/add_unit', (req, res) => {
    const tenant_id = req.tenant_id
    const { unit } = req.body
  
    if (!unit || unit.trim() === '') return res.status(400).json({ error: 'Unit name is required' })
  
    DB.run(`INSERT INTO units (unit, tenant_id) VALUES (?, ?)`, [unit.trim(), tenant_id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add category' })
      res.json({ success: true, id: this.lastID })
    })
})

// Delete Unit
router.delete('/delete_unit/:id', (req, res) => {
    const tenant_id = req.tenant_id
    const {id} = req.params

    if (!tenant_id || !id) {
        return res.status(400).json({ error: "Missing tenant_id or unit id" })
    }

    const sql = `DELETE FROM units WHERE id = ? AND tenant_id = ?`
    
    DB.run(sql, [id, tenant_id], function(err) {
        if (err) {
            console.error("❌ Failed to delete unit:", err.message)
            return res.status(500).json({ error: "Failed to delete unit" })
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Unit not found" })
        }

        res.send({ success: true, message: "Unit deleted" })
    })
})


/**
 * 
 * PRODUCTS
 * 
 */

// Get All Products from Inventory (Scoped by tenant_id)
router.get('/products', (req, res) => {
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM inventory WHERE tenant_id = ?`

    DB.all(sql, [tenant_id], (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get products' })
        }
        res.send({ products: rows })
    })
})


// Get Products by Vendor
router.get('/products_by_vendor/:vendor', (req, res) => {
    const { vendor } = req.params
    const tenant_id = req.tenant_id
    
    const sql = `SELECT * FROM inventory WHERE vendor = ? AND tenant_id = ?`

    DB.all(sql, [vendor, tenant_id], (err, rows) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get products' })
        }
        res.send({ products: rows })
    })
})


// Get Products by Category (Scoped by tenant_id + vendor_name)
router.get('/products_by_category/:category', (req, res) => {
    const { category } = req.params
    const vendorId = req.query.vendor_id
    const tenant_id = req.tenant_id

    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' })

    // Get vendor name from vendor ID
    DB.get(`SELECT vendor_name FROM vendors WHERE id = ?`, [vendorId], (err, vendorRow) => {
        if (err || !vendorRow) {
            console.error(err)
            return res.status(500).json({ error: 'Vendor not found' })
        }

        const vendorName = vendorRow.vendor_name
        const sql = `SELECT * FROM inventory WHERE category = ? AND vendor = ? AND tenant_id = ?`

        DB.all(sql, [category, vendorName, tenant_id], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get products' })
            }
            res.send({ products: rows })
        })
    })
})

// Get Products by Subcategory (Scoped by tenant_id + vendor_name)
router.get('/products_by_subcategory/:category/:subcategory', (req, res) => {
    const { category, subcategory } = req.params
    const vendorId = req.query.vendor_id
    const tenant_id = req.tenant_id

    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' })

    // Get vendor name from vendor ID
    DB.get(`SELECT vendor_name FROM vendors WHERE id = ?`, [vendorId], (err, vendorRow) => {
        if (err || !vendorRow) {
            console.error(err)
            return res.status(500).json({ error: 'Vendor not found' })
        }

        const vendorName = vendorRow.vendor_name
        const sql = `SELECT * FROM inventory WHERE category = ? AND subcategory = ? AND vendor = ? AND tenant_id = ?`

        DB.all(sql, [category, subcategory, vendorName, tenant_id], (err, rows) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ error: 'Failed to get products' })
            }
            res.send({ products: rows })
        })
    })
})

// Get Products with categories by id
router.get('/product_with_categories/:id', (req, res) => {
    const productId = req.params.id
    const tenant_id = req.tenant_id

    // SQL query to fetch product details, categories, and subcategories
    const sql = `
        SELECT 
            (SELECT json_object('id', id, 'name', name, 'brand', brand, 'category', category, 'subcategory', subcategory, 
                'volume', volume, 'cost', cost, 'quantity', quantity, 'total_value', total_value, 'price_per_unit', price_per_unit, 
                'vendor', vendor, 'unit', unit, 'notes', notes, 'upc_outer', upc_outer, 'upc_inner', upc_inner, 'restock_level', restock_level) 
             FROM inventory WHERE id = ? AND tenant_id = ?) AS product,
             
            (SELECT json_group_array(json_object('label', category, 'value', category)) FROM categories WHERE tenant_id = ?) AS categories,
            
            (SELECT json_group_array(json_object('label', subcategory, 'value', subcategory)) 
             FROM subcategories 
             WHERE category = COALESCE((SELECT category FROM inventory WHERE id = ? AND tenant_id = ?), '')) AS subcategories;
    `;

    DB.get(sql, [productId, tenant_id, tenant_id, productId, tenant_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to retrieve product data" });
        }

        if (!row || !row.product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({
            product: JSON.parse(row.product),
            categories: row.categories ? JSON.parse(row.categories) : [],
            subcategories: row.subcategories ? JSON.parse(row.subcategories) : []
        });
    });
});

// Get Product Note (Scoped by tenant_id)
router.get('/product_note/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM inventory WHERE item_id = ? AND tenant_id = ?`

    DB.get(sql, [id, tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get product note' })
        }
        res.send(row?.notes || '')
    })
})

// Delete Product by ID (Scoped by tenant_id)
router.delete('/delete_product/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const sql = 'DELETE FROM inventory WHERE id = ? AND tenant_id = ?'

    DB.run(sql, [id, tenant_id], function (err) {
        if (err) {
            console.error(err.message)
            return res.status(500).json({ error: 'Failed to delete product' })
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' })
        }
        res.status(200).json({ success: 'Product was deleted' })
    })
})

// Get Product by ID (Scoped by tenant_id)
router.get('/product/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const sql = `SELECT * FROM inventory WHERE id = ? AND tenant_id = ?`

    DB.get(sql, [id, tenant_id], (err, row) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to get product' })
        }
        return res.send({ product: row })
    })
})

// UPDATE Product (Scoped by tenant_id)
router.put('/update_product/:id', (req, res) => {
    const { id } = req.params
    const tenant_id = req.tenant_id
    const {
        name, brand, category, subcategory, volume, cost, price_per_unit, total_value,
        vendor, notes, quantity, unit, upc_outer, upc_inner, restock_level
      } = req.body
      
      const sql = `UPDATE inventory SET
        name = ?, brand = ?, category = ?, subcategory = ?, volume = ?, cost = ?,
        price_per_unit = ?, total_value = ?, vendor = ?, notes = ?,
        quantity = ?, unit = ?, upc_outer = ?, upc_inner = ?, restock_level = ?
        WHERE id = ? AND tenant_id = ?`
      
      DB.run(sql, [
        name, brand, category, subcategory, volume, cost, price_per_unit,
        total_value, vendor, notes, quantity, unit, upc_outer, upc_inner, restock_level,
        id, tenant_id
      ], function (err) {
        if (err) {
            console.error("❌ SQL error:", err.message)
            return res.status(500).json({ error: 'Failed to update product' })
        }
        res.status(200).json({ success: 'Product was updated' })
    })
})


// ADD Product (Scoped by tenant_id)
router.post('/add_product', (req, res) => {
    const tenant_id = req.tenant_id
    const date_added = new Date().toISOString().slice(0, 10)

    const {
        name, brand, category, subcategory, volume, cost, price_per_unit, total_value,
        vendor, notes, quantity, unit, upc_outer, upc_inner, restock_level
      } = req.body
      
      const sql = `INSERT INTO inventory (
        name, brand, category, subcategory, volume, cost, price_per_unit, total_value,
        date_added, vendor, notes, quantity, unit,
        upc_outer, upc_inner, restock_level, tenant_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

      DB.run(sql, [
        name, brand, category, subcategory, volume, cost, price_per_unit, total_value,
        date_added, vendor, notes, quantity, unit, upc_outer, upc_inner, restock_level, tenant_id
      ], function (err) {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Failed to add product' })
        }
        res.json({ success: true, id: this.lastID })
    })
})

module.exports = router
