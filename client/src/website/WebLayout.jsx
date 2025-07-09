// APPLICATION DEPENDENCIES
import { Outlet } from "react-router-dom"


// COMPONENT DEPENDENCIES
import WebsiteHeader from './components/WebsiteHeader';


// COMPONENT: BACKOFFICE
export default function WebLayout() {
    // STYLES
    const wrapper = `
        bg-white flex flex-col
    `
    const body = `
        w-[100%] h-[100%] bg-[#fff]
        
    `
    const outletWrapper = `
        absolute left-0 bottom-0 top-[50px] right-0
    `


    // RENDER JSX
    return (
        <div className={wrapper}>
            <WebsiteHeader />
            <div className={body}>
                <div className={outletWrapper}>
                    <Outlet />
                </div>
                
            </div>
        </div>
    )
}