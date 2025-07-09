import { useDispatch, useSelector } from "react-redux"
import { showError } from '../../features/loginSlice'

export default function ErrorModal({ buttonText }) {
    // STYLES
    const wrapper = `
        h-[490px] w-[600px] mt-[0px] z-[100] flex flex-column 
        absolute top-[200px] left-0 right-0 ml-[auto] mr-[auto] rounded-lg 
        shadow-lg bg-[#ccc] z-[150] flex flex-col
    `
    const header = `
        w-[600px] h-[200px] flex flex-col justify-center
        bg-[red] rounded-tl-lg rounded-tr-lg
    `
    const icon = `
        fa-solid fa-triangle-exclamation text-[8rem] text-white mt-[10px]
    `
    const body = `
        w-[600px] h-[290px] flex flex-col text-center
        items-center relative bg-white p-[20px]
    `
    const label = `
        text-[2.8rem] text-center text-[#5a5a5a] font-[400] 
        h-[20px] mt-[20px]
    `
    const messageText = `
        text-[1.2rem] text-[red] mt-[50px]
    `
    const button = `
        w-[300px] h-[60px] bg-[red] rounded-full p-[8px] 
        text-[1.6rem] text-white cursor-pointer absolute
        bottom-[20px]
    `

    // REDUX
    const dispatch = useDispatch()
    const { errorMessage } = useSelector((state) => state.login)

    // Cloese the popup
    function handleCloseModal() {
        dispatch(showError(false))
    }

    // RENDER JSX
    return (
        <div id="change-due-popup" className={wrapper}>
            <div className={header}>
                <i className={icon}></i>
            </div>
            <div className={body}>
                <div className={label}>Ooops!</div>
                <div className={messageText}>
                    {errorMessage.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                <div className={button} onClick={handleCloseModal}>
                    {buttonText}
                </div>
            </div>
        </div>
    )
}