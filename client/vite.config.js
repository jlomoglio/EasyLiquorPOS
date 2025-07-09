import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(),],
	server: {
		//allowedHosts: 'http://www.easyliquorpos.com/',
		watch: {
			ignored: ['**/api/db/pos.db', '**/api'] // Ignore database changes
		},
		port: parseInt(process.env.VITE_PORT) || 5173,
		strictPort: true,
	}
})
