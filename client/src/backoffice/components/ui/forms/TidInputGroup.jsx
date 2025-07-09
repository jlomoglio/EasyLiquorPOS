// COMPONENT: TID INPUT GROUP
export default function TidInputGroup({ 
    label, 
    name,
    value,
    onChange = () => {},
    placeholder = "Enter Transaction Number",
}) {
    const wrapper = `
        w-[370px] h-[70px] flex flex-col justify-start p-[0px]
        mt-[0px] ml-[18px] mb-0 relative
    `
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600]
        flex flex-row justify-start font-[Roboto]
    `
    const inputWrapper = `
        w-full h-[50px] flex flex-row items-center mt-[5px]
        border border-[#ccc] bg-[#fff] rounded-lg overflow-hidden
        focus-within:border-[#60A5FA]
    `
    const prefix = `
        bg-[#eee] text-[#5a5a5a] px-3 text-[1rem] h-[50px]
        flex items-center justify-center border-r border-[#ccc]
    `
    const input = `
        flex-1 h-[50px] text-[1rem] p-[10px] bg-transparent border-none
        text-[#5a5a5a] focus:outline-none
    `
    

    function handleChange(e) {
        const rawValue = e.target.value.replace(/\D/g, '').slice(0, 10); // max 10 digits
        onChange(name, rawValue);
    }

    return (
        <div className={wrapper}>
            <div className={labelText}>
                {label} 
            </div>
            <div className={inputWrapper}>
                <span className={prefix}>TID-</span>
                <input
                    type="text"
                    className={input}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
