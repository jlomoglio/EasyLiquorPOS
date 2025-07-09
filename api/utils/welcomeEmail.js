const nodemailer = require('nodemailer')

let testAccount, transporter

async function setup() {
  testAccount = await nodemailer.createTestAccount()

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })
}

setup()

async function sendWelcomeEmail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: `"EasyLiquor POS" <no-reply@easyliquor.test>`,
    to,
    subject,
    text,
    html
  })

  console.log('✅ Welcome Email sent:', info.messageId)
  console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(info))
  return info
}

module.exports = sendWelcomeEmail
