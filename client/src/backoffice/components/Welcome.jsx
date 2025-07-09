// COMPONENT DEPENDENCIES
import welcomeImg from './../../assets/backoffice_welcome.png'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../features/backofficeSlice"

// COMPONENT: WELCOME
export default function Welcome() {
    // STYLES
    const wrapper = `
        absolute top-0 left-0 right-0 bottom-0
        text-[#5a5a5a] p-[20px] flex flex-col items-start
        pl-[160px]
    `
    const heading = `
        w-[800px] mt-[50px] ml-[20px] text-center
    `
    const title = `
        text-[2.2rem]
    `
    const subTtitle = `
        text-[1.3rem]
    `
    const img = `
        w-[800px] h-[auto]
    `
    const buttonWrapper = `
        w-[800px] h-[auto] flex flex-row justify-center text-center
    `
    const button = `
        w-[450px] h-[80px] bg-[green] text-[1.9rem] 
        text-white rounded-lg p-[20px] cursor-pointer
    `

    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    useEffect(() => {
            dispatch(setView("Welcome"))
            dispatch(setMenuDisabled(false))
    }, [])

    // LOAD STORE SETUP
    function handleGotoStoreSetup() {
        navigate('/backoffice/storeSetup')
    }


    // RENDER JSX
    return (
        <div className={wrapper}>
            <div className={heading}>
                <h2 className={title}>Welcome to the EasyLiquorPOS Backoffice</h2>
                <p className={subTtitle}>Let's get your store setup</p>
            </div>
            <div>
                <img className={img} src={welcomeImg} alt="" />
            </div>
            <div className={buttonWrapper} onClick={handleGotoStoreSetup}>
                <div className={button}>Get Started</div>
            </div>
        </div>
    )
}