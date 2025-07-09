// APPLICATION DEPENDENCIES
import { useNavigate } from "react-router-dom"
import { useDispatch } from 'react-redux'
import { setView } from "../../../features/backofficeSlice"


// COMPONENT: NAVBUTTON
export default function NavButton({ label, Icon, path, disabled, selected }) {
    // STYLES
    const wrapper = `
        w-[78px] h-[70px] p-[10px] items-center
        cursor-pointer select-none flex flex-col mb-[10px]
    `
    const wrapperDisabled = `
        w-[78px] h-[70px] p-[10px] items-center
        select-none flex flex-col mb-[10px]
    `
    const wrapperSelected = `
        w-[78px] h-[70px] p-[10px] items-center
        cursor-pointer select-none flex flex-col mb-[20px] bg-[#4A90E2]
    `
    const labelText = `
        text-[.75rem] font-[700] text-[#E5E7EB]
    `
    const labelTextDisabled = `
        text-[.8rem] font-[700]  text-[#6B7280]
    `

    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // LOAD VIEW
    function loadView() {
        dispatch(setView(label))
        navigate(path)
    }

    // RENDER JSX
    return (
        <div 
            className={disabled ? wrapperDisabled : selected ? wrapperSelected : wrapper}
            onClick={!disabled ? loadView : undefined}
        >
            <p className={disabled ? labelTextDisabled : labelText}>{label}</p>
            <Icon size={50} strokeWidth={1.5} color={disabled ? "#6B7280" : "#D4D4D8"} />
        </div>
    )
}