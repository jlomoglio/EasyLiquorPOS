// APPLICATION DEPENDENCIES
import { useDispatch } from 'react-redux'
import { showMenu } from '../../features/cartSlice'
import { useNavigate } from "react-router-dom"

// COMPONENT: MENU POPUP
export default function MenuPopup() {
    // STYLES
    const closeButtonWrapper = `
        absolute top-[30px] right-[30px] z-[110] cursor-pointer !bg-[transparent]
        hover:outline-none border !border-[transparent]
    `
    const closeButtonIcon = `
        fa-solid fa-circle-xmark text-[100px] text-white
    `
    const menuWrapper = `
        fixed top-[200px] left-[50%] !-translate-x-1/2 !z-[120] flex flex items-center 
        mt-[6px] bg-[transparent] rounded-lg
    `
    const closeRegisterWrapper = `
        w-[550px] h-[500px] bg-[#50C878] text-center rounded-lg shadow-lg cursor-pointer
    `
    const closeRegisterIcon = `
        fa-solid fa-cash-register text-[300px] text-white mt-[30px]
    `
    const closeRegisterText = `
        text-[4rem] mt-[20px] text-white font-[900]
    `

    // NAVIGATION: Used to change route
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // CLOSE THE MENU
    function handleCloseMenu() {
        dispatch(showMenu(false))  
    }

    // CLOSE THE REGISTER
    function handleCloseRegister() {
        dispatch(showMenu(false))
        navigate("/close_register")
    }

    // RENDER JSX
    return (
        <>
        <button 
            id="menu-close-button" 
            className={closeButtonWrapper}
            onClick={handleCloseMenu}
            onMouseDown={(e) => e.preventDefault()}
        >
            <i 
                className={closeButtonIcon} 
                style={{ outline: "none", boxShadow: "none" }}
            ></i>
        </button>

        <div 
            id="menu" 
            className={menuWrapper}
        >
            <div 
                className={closeRegisterWrapper}
                onClick={handleCloseRegister}
            >
                <i className={closeRegisterIcon}></i>
                <p className={closeRegisterText}>Close Register</p>
            </div>
        </div>
        </>
    )
}