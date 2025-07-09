// COMPONENT: TEXTAREA GROUP
export default function TextareaGroup({
    label, 
    labelColor,
    height = "100px",
    name,
    space = "35px",
    value,
    onChange,
    error, 
    required
}) {

    // STYLES
    const wrapper = `
        w-full h-[60px] flex flex-col justify-start p-[20px]
        mt-[10px] relative
    `
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600]
        flex flex-row justify-start font-[Roboto]
    `
    const errorText = `
        text-red-500 text-sm ml-[10px] mt-[3px]
    `
    const textarea = `
        w-full rounded-lg text-[1rem] p-[10px] bg-gray-100
        border border-gray-300 bg-[#fff] mt-[5px] text-[#5a5a5a]
        focus:outline-none focus:ring focus:ring-blue-500
    `


    const handleTextareaChange = (e) => {
        const { name, value } = e.target;
        onChange(name, value); // ✅ Pass correct name & value
    }


    // RENDER JSX
    return (
        <div className={wrapper} style={{ marginBottom: space}}>
            <div 
                className={labelColor ? labelTextWhite : labelText}
            >
                {label} 
                {required && <span className="ml-[5px] text-[1rem]">*</span>}
                {error && <span className={errorText}>{error}</span>}
            </div>
            <textarea 
                className={textarea} 
                name={name} 
                onChange={handleTextareaChange}
                value={value} 
                style={{ minHeight: height }}
            />
        </div>
    )
}