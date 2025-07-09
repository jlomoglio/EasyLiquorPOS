// APPLICATION DEPENDENCIES
import { RouterProvider } from 'react-router-dom'
import './App.css'
import websiteRouter from './websiteRouter.jsx'
import posRouter from './posRouter.jsx'

const isElectron = window?.electron !== undefined

function App() {
  const router = isElectron ? posRouter : websiteRouter
  return <RouterProvider router={router} />
}

export default App


