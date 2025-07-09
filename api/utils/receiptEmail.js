const nodemailer = require('nodemailer')

let transporterPromise = (async () => {
  //console.log('📩 receiptEmail.js LOADED')
  const testAccount = await nodemailer.createTestAccount()

  console.log('📧 Receipt: Ethereal Receipt Account Ready:')
  console.log('Login:', testAccount.user)
  console.log('Password:', testAccount.pass)

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })
})()

async function sendReceiptEmail({ to, subject, text, html }) {
  const transporter = await transporterPromise

  //console.log(`📨 Sending receipt to: ${to}`)

  const info = await transporter.sendMail({
    from: `"EasyLiquor POS Billing" <billing@easyliquor.test>`,
    to,
    subject,
    text,
    html
  })

  console.log('✅ Receipt Email sent:', info.messageId)
  console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info))
  return info
}

module.exports = sendReceiptEmail
