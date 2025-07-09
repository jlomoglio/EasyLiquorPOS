import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice";
import { apiFetch } from "../../../utils/api";

// COMPONENTS
import ViewContainer from "../../components/ui/ViewContainer";
import ViewTitle from "../../components/ui/ViewTitle";
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable";
import SelectGroup from "../../components/ui/forms/SelectGroup";
import InputGroup from "../../components/ui/forms/InputGroup";
import { Calendar } from "lucide-react"
import ResetButton from "../../components/ui/forms/ResetButton";

export default function Register() {
    // STYLES
    const dateWrapper = `
        w-full h-[60px] flex flex-col justify-start p-[20px]
        mt-[10px] mb-[35px] relative
    `
    const dateInput = `
        w-full h-[40px] rounded-lg text-[1rem] p-[10px]
        border border-[#ccc] bg-[#fff] mt-[5px] text-[#5a5a5a]
        focus:outline-none outline-none focus:border-[#60A5FA]
    `

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [originalRegisters, setOriginalRegisters] = useState([]);
    const [registers, setRegisters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("opened_date");
    const [showDatePicker, setShowDatePicker] = useState(true);

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Register"));
        dispatch(setMenuDisabled(false));
        handleGetRegisters();
    }, []);

    async function handleGetRegisters() {
        try {
            const resData = await apiFetch(`/api/registers`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            const sorted = [...resData.registers].sort((a, b) => {
                const aDate = new Date(`${a.opened_date} ${a.opened_time}`);
                const bDate = new Date(`${b.opened_date} ${b.opened_time}`);
                return bDate - aDate;
            });
            setOriginalRegisters(sorted);
            setRegisters(sorted);
        } catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    function handleSearchTypeChange(name, value) {
        setSearchBy(value);
        setSearchTerm("");
        setShowDatePicker(value === "opened_date");
        setRegisters(originalRegisters);
    }

    function handleSearchChange(name, value) {
        const inputValue = typeof name === 'string' ? value : name.target.value
    
        setSearchTerm(inputValue)
    
        const filtered = originalRegisters.filter(reg => {
            if (searchBy === "user") {
                return reg.user_name?.toLowerCase().includes(inputValue.toLowerCase())
            } else if (searchBy === "opened_date") {
                return reg.raw_opened_date === inputValue
            }
            return true
        })
    
        setRegisters(filtered)
    }

    function resetFilters() {
        setSearchBy("opened_date");
        setSearchTerm("");
        setShowDatePicker(true);
        setRegisters(originalRegisters);
    }

    const searchByOptions = [
        { label: "Opened Date", value: "opened_date" },
        { label: "User", value: "user" }
    ];

    const tableColumns = [
        { key: "opened_date", label: "Opened Date", width: "180px" },
        { key: "opened_time", label: "Opened Time", width: "180px" },
        { key: "opening_amount", label: "Opening Amount", width: "180px" },
        { key: "closing_amount", label: "Closing Amount", width: "180px" },
        { key: "user_name", label: "User", width: "150px" },
    ];

    function handleTableAction(action, id) {
        if (action === "view") navigate(`../registerTransactions/${id}`)
    }

    // REFERENCE FOR INPUT FIELD
    const inputRef = useRef(null)


    // FUNCTION TO TRIGGER DATE PICKER WHEN CLICKING ICON
    function handleIconClick() {
        if (inputRef.current) {
            inputRef.current.showPicker() // Opens the date picker
        }
    }

    return (
        <ViewContainer>
            <ViewTitle title="Cash Register" subtitle="View all register data." />

            <div className="flex flex-row mb-[-15px] mt-[-20px] w-full relative">
                <div className="w-[200px] ml-[-20px]">
                    <SelectGroup
                        label="Search Type"
                        options={searchByOptions}
                        onChange={handleSearchTypeChange}
                        value={searchBy}
                    />
                </div>

                {showDatePicker ? (
                    <div className="w-[400px] ml-[-25px] pt-[22px]">
                        <div className={dateWrapper}>
                            <input 
                                ref={inputRef}
                                type="date"
                                className={dateInput}
                                onChange={handleSearchChange}
                                value={searchBy === "opened_date" ? searchTerm || "" : ""}
                            />
                            <Calendar 
                                size={20} 
                                strokeWidth={2}
                                onClick={handleIconClick}
                                style={{
                                    position: "absolute",
                                    right: "30px",
                                    top: "44px",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "auto",
                                    color: "#5a5a5a",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-[400px] ml-[-25px] pt-[22px]">
                        <InputGroup
                            name="search"
                            label=""
                            type="text"
                            placeholder="Search by user"
                            onChange={handleSearchChange}
                            value={searchTerm || ""}
                        />
                    </div>
                )}

                <div className="w-[40px] h-[40px] ml-[-5px] mt-[55px]">
                    <ResetButton onClick={resetFilters} />
                </div>

                <div className="w-[440px] h-[40px] ml-[-5px] mt-[75px] text-right font-[500] absolute right-[10px]">
                    Total Records: {registers.length}
                </div>
            </div>

            <DynamicScrollTable
                data={registers}
                columns={tableColumns}
                onAction={handleTableAction}
                actions={["view"]}
                tableWidth="100%"
                tableHeight="dynamic"
            />
            <div className="h-[20px]"></div>
        </ViewContainer>
    );
}
