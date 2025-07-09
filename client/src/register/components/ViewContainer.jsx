
export default function ViewContainer({ children, rightMargin="20px" }) {
    // STYLES
    const container = `
        absolute top-0 left-0 right-[${rightMargin}] bottom-0 text-[#5a5a5a] p-[10px] 
        pr-0 mr-0 flex flex-col items-start
    `

    return (
        <div className={container}>
            { children }
        </div>
    )
}