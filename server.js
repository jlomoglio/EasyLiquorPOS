import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 5173 // or 80 if running behind NGINX

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'client', 'dist')))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Frontend server running on http://localhost:${port}`)
})
