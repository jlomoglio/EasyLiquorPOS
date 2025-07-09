// APPLICATION DEPENDENCIES
import { useNavigate } from 'react-router-dom'
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useEffect, useState } from 'react'
import { Outlet } from "react-router-dom"

// COMPONENT DEPENDENCIES
import ViewContainer from '../../components/ui/ViewContainer';
import ViewTitle from '../../components/ui/ViewTitle';
import { toast } from 'react-hot-toast'


// COMPONENT: SETTINGS
export default function Settings() {
    // STYLES
    const tabBar = "flex border-b border-gray-300 w-full mb-4";
    const tabButton = "p-3 text-sm font-[400] cursor-pointer";
    const activeTabStyle = "border-b-2 border-black font-[900]";

    // REDUX
    const dispatch = useDispatch()

    // STATE
    const [activeTab, setActiveTab] = useState("store")

    // NAVIGATE
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(setView("Settings"))

        // Add logic if store is setup or not
        navigate('../settings/editStore')
        dispatch(setMenuDisabled(false))
    }, [])

    
    // RENDER JSX
    return (
        <ViewContainer>
            <ViewTitle title="Settings" subtitle="Manage applciton features." />

            {/* Tab Navigation */}
            <div className={tabBar}>
                <div 
                    className={`${tabButton} ${activeTab === "store" ? activeTabStyle : ""}`} 
                    onClick={() => {
                        setActiveTab("store")
                        navigate('../settings/editStore')
                    }}
                >
                    STORE
                </div>
                <div 
                    className={`${tabButton} ${activeTab === "vendors" ? activeTabStyle : ""}`} 
                    onClick={() => {
                        setActiveTab("vendors")
                        navigate('../settings/managePaymentTerms')
                    }}
                >
                    PAYMENT TERMS
                </div>
                <div 
                    className={`${tabButton} ${activeTab === "categories" ? activeTabStyle : ""}`} 
                    onClick={() => {
                        setActiveTab("categories")
                        navigate('../settings/manageCategories')
                    }}
                >
                    CATEGORIES
                </div>
                <div 
                    className={`${tabButton} ${activeTab === "units" ? activeTabStyle : ""}`} 
                    onClick={() => {
                        setActiveTab("units")
                        navigate('../settings/managePackagingTypes')
                    }}
                >
                    UNITS
                </div>
            </div>

            <div className='flex w-full h-full'>
                <Outlet />
            </div>
        </ViewContainer>
    )
}