// APPLICATION DEPENDENCIES
import { Outlet } from "react-router-dom"


// COMPONENT DEPENDENCIES
import Header from './components/Header'
import Navbar from "./components/Navbar"
import { Toaster } from 'react-hot-toast'

// COMPONENT: BACKOFFICE
export default function Backoffice() {
    // STYLES
    const chatbotButton = `
        fixed right-7 bottom-[20px] w-[60px] h-[60px] rounded-full shadow-lg 
        bg-white flex items-center justify-center border border-gray-300 
        hover:bg-gray-100 transition-all !z-[1000] cursor-pointer
    `
    const wrapper = `
        bg-white fixed top-0 left-0 right-0 bottom-0
        flex flex-col overflow-hidden
    `
    const leftcol = `
        flex flex-col bg-[#2c2933] absolute left-0 bottom-0
        top-[40px] w-[75px]
    `
    const rightCol = `
        flex flex-col bg-[#fff] absolute
        left-[85px] top-[40px] right-0 bottom-0 overflow-y-auto
    `


    // RENDER JSX
    return (
        <>
        <Toaster
            position="top-center"
            toastOptions={{
                success: {
                    style: {
                        background: '#22c55e', // Tailwind green-500
                        color: '#fff',
                        fontWeight: '600',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1rem',
                        minWidth: '450px'
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#16a34a' // Tailwind green-600
                    }
                    },
                    error: {
                    style: {
                        background: '#ef4444', // Tailwind red-500
                        color: '#fff',
                        fontWeight: '600'
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#b91c1c'
                    }
                }
            }}
        />

        <div className={wrapper}>
            <Header />
            <div className={leftcol}>
                <Navbar />
            </div>
            <div className={rightCol}>
                <Outlet />
            </div>
        </div>
    </>
    )
}