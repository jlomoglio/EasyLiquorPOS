/** 
 *  BACK OFFICE: DELIVERY ATTCMNET ROUTES (Multi-Tenant)
*/

const express = require("express")
const router = express.Router()
const DB = require('../db/connect')
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const requireTenant = require('../middleware/requireTenant.js')

router.use(requireTenant)

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const poNumber = req.query.po_number
		const tenantId = req.tenant_id

		if (!tenantId || !poNumber) {
			return cb(new Error("Missing tenant ID or PO number"))
		}

		const uploadPath = path.join(__dirname, "..", "delivery_attachments", String(tenantId), poNumber)
		fs.mkdirSync(uploadPath, { recursive: true })
		cb(null, uploadPath)
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
})

const upload = multer({ storage })

router.post("/upload_attachment", upload.single("file"), (req, res) => {
	const poNumber = req.query.po_number
	const tenantId = req.tenant_id

	if (!req.file || !poNumber || !tenantId) {
		return res.status(400).json({
			success: false,
			error: "[ERR-UPLOAD] Missing file, PO number, or tenant ID"
		})
	}

	res.json({
		message: "✅ File uploaded successfully.",
		fileName: req.file.originalname,
		path: path.relative(path.join(__dirname, ".."), req.file.path)
	})
})

router.post("/delete_attachment", (req, res) => {
	const { po_number, file_name } = req.body
	const tenantId = req.tenant_id

	if (!po_number || !file_name || !tenantId) {
		return res.status(400).json({ error: "Missing PO number, file name, or tenant ID." })
	}

	const filePath = path.join(__dirname, "..", "delivery_attachments", String(tenantId), po_number, file_name)

	fs.unlink(filePath, err => {
		if (err) return res.status(500).json({ success: false, message: "Delete failed." })
		res.json({ success: true, message: "File deleted." })
	})
})

module.exports = router