// APPLICATION DEPENDENCIES
import { useSelector } from 'react-redux'

// COMPONENT: SUBHEADER
export default function Subheader() {
    // STYLES
    const wrapper = `
        w-full h-[50px] bg-[#CBD5E1] text-[1.4rem] text-left 
        text-[#000] font-[900] p-[10px] pl-[20px] shadow-lg
        border border-l-[#CBD5E1] border-r-[#CBD5E1] border-t-[#CBD5E1] border-b-[#A1A1AA]
    `

    // REDUX
    const { viewTitle } = useSelector((state) => state.backoffice)

    // RENDER JSX
    return (
        <div className={wrapper}>
            {viewTitle}
        </div>
    )
}