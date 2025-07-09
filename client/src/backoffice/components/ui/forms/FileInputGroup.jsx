import { useRef, useState, useEffect } from "react";

export default function FileInputGroup({ handleFileUpload, label, required, fileTypes, disabled = false }) {
    const inputRef = useRef(null);
    const [fileName, setFileName] = useState("");

    function handleFileClick() {
        inputRef.current?.click();
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name); // Show file name in input
    
            // Trigger parent upload
            handleFileUpload(file).then((success) => {
                if (success) {
                    // Reset after upload finishes
                    setFileName("");
                    if (inputRef.current) {
                        inputRef.current.value = "";
                    }
                }
                // if (success) {
                //     setFileName("");
                //     if (inputRef.current) inputRef.current.value = "";
                // } else {
                //     // Don't reset immediately if duplicate so user sees the warning
                //     setTimeout(() => {
                //         setFileName("");
                //         if (inputRef.current) inputRef.current.value = "";
                //     }, 2000); // gives time to see the warning
                // }
            });
        }
    }

    return (
        <div className="w-full mb-[30px]">
            {label && (
                <label className="text-[#5a5a5a] text-[1rem] font-semibold mb-1 block">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="flex items-center border border-[#ccc] rounded-lg h-[40px] overflow-hidden">
                <input
                    type="text"
                    readOnly
                    value={fileName}
                    placeholder="No file selected"
                    className="flex-1 px-3 py-[6px] text-[0.95rem] text-[#5a5a5a] bg-white focus:outline-none"
                    disabled
                />
                <button
                    type="button"
                    onClick={handleFileClick}
                    className="px-4 py-2 border-l border-l-[#ccc] hover:border-blue-500 text-sm hover:text-white 
                        text-[#5a5a5a] bg-gray-300 hover:bg-blue-500 cursor-pointer"
                    style={{
                        backgroundColor: disabled ? "#ccc" : "#3B82F6",
                        color: disabled ? "#F5F5F5" : "#fff",
                        cursor: disabled ? "not-allowed" : "pointer",
                        pointerEvents: disabled ? "none" : "auto"
                    }}
                >
                    Browse
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={fileTypes} // ".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
        </div>
    );
}

