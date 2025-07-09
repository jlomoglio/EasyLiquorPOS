export default function EmptyCartDisplay() {
    // STYLES
    const wrapper = `
        w-full ml-[auto] mr-[auto] mt-[300px] flex flex-row text-center
    `
    const icon = `
        fa-solid fa-cart-shopping text-[#ccc] text-[#5a5a5a] text-[280px]
        absolute left-1/3 ml-[60px] top-[25%]
    `

    return (
        <div className={wrapper}>
            <i className={icon}></i>
        </div>
    )
}