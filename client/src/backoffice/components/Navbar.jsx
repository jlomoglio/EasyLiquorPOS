// APPLICATION DEPENDENCIES
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'

// LUCIDE ICONS DEPENDENCIES
import { Logs, Gauge, Users, Truck, Wine, ClipboardList, User, Receipt } from "lucide-react"

// COMPONENT DEPENDENCIES
import NavButton from "./ui/navButton"


// COMPONENT: NAVBAR
export default function Navbar() {
    // STYLES
    const wrapper = `
        absolute top-0 left-0 bottom-0 w-[70px]
        text-[#5a5a5a] p-[0px] pt-[20px] flex flex-col items-center
    `

    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const { menuDisabled } = useSelector((state) => state.backoffice)
    const { view } = useSelector((state) => state.backoffice)
    const { userName } = useSelector((state) => state.backofficeLogin)


    // RENDER JSX
    return (
        <div className={wrapper}>
            {userName === 'root' ? (
                <>
                <NavButton 
                    label="Dashboard" 
                    Icon={Gauge} 
                    path="/pos/backoffice/root" 
                    disabled={menuDisabled} 
                    selected={view === 'Root' && true}
                />
                <NavButton 
                    label="Logs" 
                    Icon={Logs} 
                    path="/pos/backoffice/errorLogs" 
                    disabled={menuDisabled} 
                    selected={view === 'Error Logs' && true}
                />
                </>
            ) : (
                <>
                <NavButton 
                    label="Dashboard" 
                    Icon={Gauge} 
                    path="/pos/backoffice/dashboard" 
                    disabled={menuDisabled}
                    selected={view === 'Dashboard' && true} 
                />
                <NavButton 
                    label="Users" 
                    Icon={Users}
                    path="/pos/backoffice/users" 
                    disabled={menuDisabled} 
                    selected={view === 'Users' && true}
                />
                <NavButton 
                    label="Vendors" 
                    Icon={User}
                    path="/pos/backoffice/vendors" 
                    disabled={menuDisabled} 
                    selected={view === 'Vendors' && true}
                />
                <NavButton 
                    label="Inventory" 
                    Icon={Wine} 
                    path="/pos/backoffice/inventory" 
                    disabled={menuDisabled} 
                    selected={view === 'Inventory' && true}
                />
                <NavButton 
                    label="Orders" 
                    Icon={ClipboardList} 
                    path="/pos/backoffice/orders" 
                    disabled={menuDisabled} 
                    selected={view === 'Orders' && true}
                />
                <NavButton 
                    label="Deliveries" 
                    Icon={Truck} 
                    path="/pos/backoffice/deliveries" 
                    disabled={menuDisabled} 
                    selected={view === 'Deliveries' && true}
                />
                <NavButton 
                    label="Register" 
                    Icon={Receipt} 
                    path="/pos/backoffice/registers" 
                    disabled={menuDisabled} 
                    selected={view === 'Registers' && true}
                />
                </>
            )}
        </div>
    )
}