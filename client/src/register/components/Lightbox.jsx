export default function Lightbox({ children }) {
    const lightbox = `
        fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.75)] !z-[100]
    `

    return (
        <div className={lightbox}>
            {children}
        </div>
    )
}