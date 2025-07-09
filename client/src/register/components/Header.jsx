// APPLICATION DEPENDENCIES
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


// COMPONENT DEPENDENCIES
import logo from '../../assets/EasyLiquorPOS_Logo.png'


// COMPONENT: HEADER
export default function Header({ closeRegister}) {
    // STYLES
    const header = `
        flex flex-row w-full h-[70px] !bg-[#3994DF] relative
    `
    const smallLogo = `
        h-[46px] mt-[16px] absolute left-[20px]
    `
    const menuButton = `
        w-[200px] absolute top-[6px] right-[20px] text-white 
        flex flex-row justify-end mt-[6px] bg-[transparent]
        cursor-pointer
    `
    const logoutBtn = `
        absolute left-[500px] top-[20px] h-[40px] w-[80px] text-white 
        cursor-pointer select-none z-[1000]
    `

    //const { userName, isBackoffice, logout } = useSession()
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    

    // RENDER JSX
    return (
        <div className={header}>
            <img id="logo" src={logo} className={smallLogo} />
           
            <div className={menuButton} onClick={closeRegister}>
                <button className='w-[160px] h-[50px] border border-white px-1.5 cursor-pointer'>
                    Close Out Register
                </button>
            </div>
        </div>
    )
}