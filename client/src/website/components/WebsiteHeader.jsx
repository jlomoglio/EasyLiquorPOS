// APPLICATION DEPENDENCIES
import { useNavigate } from 'react-router-dom'

// COMPONENT DEPENDENCIES
import logo from "/images/EasyLiquorPOS_Logo.png"

// COMPONENT: HEADER
export default function WebsiteHeader() {
    // STYLES
    const header = `
        flex flex-row h-[50px] bg-[black] fixed
        left-0 top-0 right-0 z-[500] flex flex-row
    `

    const isLoggedIn = !!localStorage.getItem('tenantId')

    const navigate = useNavigate()

    function loadView(view) {
        navigate(`/${view}`)
    }

    function handleLogout() {
        localStorage.removeItem('tenantId')
        navigate('/')
      }


    // RENDER JSX
    return (
        <div className={header}>
            <div className='mt-[5px] ml-[10px]'>
                <img src={logo} alt="" />
            </div>

            <div className='absolute right-[20px] flex flex-row gap-5 py-3 text-white'>
                <div className='py-1 cursor-pointer' onClick={() => loadView('')}>Home</div>
                <div className='py-1 cursor-pointer' onClick={() => loadView('signup')}>Signup</div>
                
                {isLoggedIn ? (
                    <div
                        className='text-white bg-red-600 py-1 px-2 rounded-md cursor-pointer'
                        onClick={handleLogout}
                    >
                        Logout
                    </div>
                    ) : (
                    <div
                        className='text-white bg-blue-600 py-1 px-2 rounded-md cursor-pointer'
                        onClick={() => loadView('login')}
                    >
                        Login
                    </div>
                )}
            </div>
        </div>
    )
}