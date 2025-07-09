// COMPONENT: VIEW TITLE
export default function ViewTitle({ title, subtitle }) {
    return (
        <div className="text-left mb-2 mt-[0px]">
            <h3 className="text-[24px] font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600">{subtitle}</p>
        </div>
    )
}