const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const cors = require('cors')
// ✅ Required for reading .env values
require('dotenv').config()

const app = express()

// ✅ Enable CORS early
app.use(cors())



// Static and URL parsing
app.use(express.static('public'))
app.use("/delivery_attachments", express.static(path.join(__dirname, "delivery_attachments")))

// File upload routes FIRST — do not parse JSON before this
const deliveryAttachemntRouter = require('./routes/delivery_attchments_routes.js')
app.use('/api', deliveryAttachemntRouter)


//app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// Other routes
app.use('/api', require('./routes/root_routes.js'))
app.use('/api', require('./routes/devops_routes.js'))
app.use('/api', require('./routes/auth_routes.js'))
app.use('/api', require('./routes/register_routes.js'))
app.use('/api', require('./routes/dashboard_routes.js'))
app.use('/api', require('./routes/store_routes.js'))
app.use('/api', require('./routes/user_routes.js'))
app.use('/api', require('./routes/vendor_routes.js'))
app.use('/api', require('./routes/inventory_routes.js'))
app.use('/api', require('./routes/order_routes.js'))
app.use('/api', require('./routes/delivery_routes.js'))
app.use('/api', require('./routes/transaction_routes.js'))
app.use("/api", require("./routes/email_routes.js"))


// Start server
app.listen(5000, () => console.log("🟢 API Server running on port 5000"))
