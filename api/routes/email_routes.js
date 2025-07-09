// routes/email_routes.js
const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")
require("dotenv").config()

router.post("/send_test_email", async (req, res) => {
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        auth: {
            user: process.env.MAIL_USER || "5ada73ce0e4a45",
            pass: process.env.MAIL_PASS || "dc45f87d42740d"
        }
    })

    const mailOptions = {
        from: '"LiquorPOS Alerts" <noreply@liquorpos.com>',
        to: '5e109537bd-a24e5a+1@inbox.mailtrap.io', // change this to your actual test inbox
        subject: '📦 Delivery Reminder Test',
        text: 'This is a test delivery reminder from your POS system.',
        html: '<p>This is a <strong>test</strong> delivery reminder from your POS system.</p>'
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log("📧 Email sent:", info.messageId)
        res.json({ success: true, messageId: info.messageId })
    } catch (err) {
        console.error("❌ Failed to send test email:", err)
        res.status(500).json({ error: "Failed to send email" })
    }
})

module.exports = router
