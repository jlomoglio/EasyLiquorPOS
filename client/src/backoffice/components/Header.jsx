// APPLICATION DEPENDENCIES
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'

// COMPONENT DEPENDENCIES
import logo from '../../assets/EasyLiquorPOS_Logo.png'
import { AlignJustify, CircleUserRound, Store, HelpCircle, SquareLibrary, SlidersVertical, LogOut } from 'lucide-react'


// COMPONENT: HEADER
export default function Header() {
    // STYLES
    const header = `
        flex flex-row w-full h-[40px] !bg-[#3994DF]
    `
    const smallLogo = `
        h-[26px] mt-[10px] absolute left-[10px]
    `
    const menuRoot = `
        absolute right-[20px] top-[30px] w-[200px] h-[110px] bg-white border border-[#ccc] shadow-lg rounded-md z-[500]
    `
    const menuAdmin = `
        absolute right-[20px] top-[30px] w-[200px] h-[310px] bg-white border border-[#ccc] shadow-lg rounded-md z-[500]
    `

    // NAVIGATE
    const navigate = useNavigate()

    // REF
    const menuRef = useRef(null)

    // REDUX
    const { userName } = useSelector((state) => state.backofficeLogin)
    
    // STATE
    const [isOpen, setIsOpen] = useState(false)
    const [showAbout, setShowAbout] = useState(false)

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false)
          }
        }
      
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
      }, [])

    // HANDLE LOGOUT
    function handleLogout() {
        localStorage.removeItem('tenant_id')
        window.location.href = '/pos/pos_login'
    }

    // RENDER JSX
    return (
        <>
        <div className={header}>
            <img id="logo" src={logo} className={smallLogo} />
            <div className='absolute right-[20px] pt-2 cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
                <AlignJustify color="#fff" />
            </div>

            {isOpen && (
                <div ref={menuRef} className={userName === 'root' ? menuRoot : menuAdmin}>
                   
                    { userName !== 'root' && (
                        <>
                        <div 
                            className='flex flex-row gap-4 mt-[5px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                        >
                            <CircleUserRound /> Account
                        </div>

                        <div className='border-b border-b-[#ccc] mt-[5px] mb-[5px]'></div>

                        <div 
                            className='flex flex-row gap-4 mt-[5px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                            onClick={() => {
                                setIsOpen(false)
                                navigate('/pos/backoffice/about')
                            }}
                        >
                            <Store /> About
                        </div>

                        <div 
                            className='flex flex-row gap-4 mt-[10px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                            onClick={() => {
                                navigate('/pos/backoffice/support')
                                setIsOpen(false)
                            }}
                        >
                            <HelpCircle /> Support
                        </div>

                        <div 
                            className='flex flex-row gap-4 mt-[10px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                            onClick={() => {
                                navigate('/pos/backoffice/tutorials')
                                setIsOpen(false)
                            }}
                        >
                            <SquareLibrary /> Tutorials
                        </div>

                        <div className='border-b border-b-[#ccc] mt-[5px] mb-[5px]'></div>

                        <div 
                            className='flex flex-row gap-4 mt-[10px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                            onClick={() => {
                                navigate('/pos/backoffice/settings')
                                setIsOpen(false)
                            }}
                        >
                            <SlidersVertical /> Settings
                        </div>
                        </>
                    )}
                    <div className='border-b border-b-[#ccc] mt-[5px] mb-[5px]'></div>

                    <div 
                        className='flex flex-row gap-4 mt-[10px] cursor-pointer py-2 px-4 hover:bg-[#D4D4D8]'
                        onClick={handleLogout}
                    >
                        <LogOut /> Logout
                    </div>
                </div>
            )}
        </div>

        {showAbout && 
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        }
        </>
    )
}