// APPLICATION DEPENDENCIES
import { useNavigate } from 'react-router-dom'
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useEffect, useState } from 'react'

// COMPONENT DEPENDENCIES
import ViewContainer from '../../components/ui/ViewContainer';
import ViewTitle from '../../components/ui/ViewTitle';
import { toast } from 'react-hot-toast'


// COMPONENT: ROOT
export default function Root() {
    // STYLES
    const wrapper = `
        absolute top-0 left-0 right-0 bottom-0
        text-[#5a5a5a] p-[20px] flex flex-col items-start
        pl-[160px]
    `
    const heading = `
        w-[800px] mt-[50px] ml-[20px]
    `
    const title = `
        text-[2.2rem]
    `

    // REDUX
    const dispatch = useDispatch()

    // NAVIGATE
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(setView("Root"))
        dispatch(setMenuDisabled(false))
    }, [])

    
    // RENDER JSX
    return (
        <ViewContainer>
            <ViewTitle title="System Administration" subtitle="Manage applciton features and system logs." />
        </ViewContainer>
    )
}