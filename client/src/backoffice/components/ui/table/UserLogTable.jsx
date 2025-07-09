// APPLICATION DEPENDENCIES
import { useMemo, useState, useEffect } from "react"

// COMPONENT DEPENDENCIES
import SelectGroup from "../forms/SelectGroup"
import DateGroup from "../forms/DateGroup"
import ResetButton from "../forms/ResetButton"

// LUCIDE ICONS DEPENDENCIES
import { Trash2, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"


// COMPONENT: USER LOG TABLE
export default function UserLogTable({
    data = [],
    users = [],
    columns,
    onAction,
    onDateChange,
    onUserChange,
    selectedDate,
    selectedUser,
    tableWidth,
    tableHeight
  }) {
    // STYLES
    const filterWrapper = `w-[300px] mt-[-20px] mb-[10px] ml-[-20px] flex flex-row`
    const table = `bg-white rounded-lg shadow-md mt-0 overflow-hidden border border-[#ccc]`
    const tableHeader = `flex w-full h-[40px] bg-[#fff] text-[#5a5a5a] text-[1rem] rounded-t-md sticky top-0 z-10 border-b border-b-[#ccc] shadow-md`
    const headerCols = `p-2 pl-[20px] font-bold flex justify-between items-center cursor-pointer select-none`
    const actionHeaderCol = `p-2 text-right font-bold pr-[50px]`
    const tableRow = `flex w-full h-[40px] border-b border-b-[#ccc] text-left text-sm pl-[10px]`
    const tableRowCols = `p-2 pl-[10px] text-gray-700`
    const actionRowColContainer = `p-2 flex justify-start gap-5 mt-[4px] pl-[20px] pr-[30px]`
    const deleteIcon = `fa-solid fa-trash text-[1.2rem] cursor-pointer ml-[25px]`

    // STATE: SORTING
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
    
    // STATE: FILTERS
    const [userSelectOptions, setUserSelectOptions] = useState([])


    // GET USERS FOR SELECT DROPDOWN
    useEffect(() => {
        if (users.length > 0) {
            setUserSelectOptions(users.map(user => ({ label: user.name, value: user.name })))
        }
    }, [users])

    // GENERATE THE TABLE HEADERS BASED ON SELECTED COLUMNS
    const headers = useMemo(() => {
        return columns.map(col => ({ key: col.key, label: col.label, width: col.width || "150px" }))
    }, [columns])

    // FILTER THE DATA
    const filteredData = useMemo(() => {
        return data.filter(row =>
          (!selectedUser || row.user_name === selectedUser) &&
          (!selectedDate || row.login_date === selectedDate)
        )
    }, [data, selectedUser, selectedDate])

    // SORT THE DATA
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData

        return [...filteredData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }, [filteredData, sortConfig])

    // HANDLE COLUMN CLICK FOR SORTING
    function handleSort(key) {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }))
    }

    // HANDLE RESET FILTERS
    function handleResetFilters() {
        onDateChange("")
        onUserChange("")
    }

    // HANDLE SELECTED USER
    function handleSelectedUser(name, value) {
        console.log("➡️ User selected:", value)
        setSelectedUser(value)
    }

    return (
        <>
        <div className="w-[800px] flex flex-row">
            <div className={filterWrapper}>
                <SelectGroup 
                    label="Filter By User"
                    onChange={(name, value) => onUserChange(value)}
                    options={[{ label: "Select user to filter", value: "" }, ...userSelectOptions]}
                    value={selectedUser}
                />
            </div>
            <div className={filterWrapper}>
                <DateGroup 
                    label="Filter By Date" 
                    onChange={onDateChange} 
                    value={selectedDate}
                />
            </div>
            <div className="mt-[38px]  ml-[-10px]">
                <ResetButton onClick={handleResetFilters} /> 
            </div>
        </div>

        {/* TABLE */}
        <div 
            className={table}
            style={{ 
                width: tableWidth,
                display: "flex",
                flexDirection: "column",
                maxHeight: `calc(100vh - 30px)`,
                overflow: "hidden",
                alignItems: "stretch" // ✅ fix alignment issue
            }}
        >
            {/* Table Header - Always Renders */}
            <div className={tableHeader}>
                {headers.map((col, index) => (
                    <div
                        key={col.key}
                        className={headerCols}
                        style={{
                            width: col.width,
                            flexGrow: index === headers.length - 1 ? 1 : 0,
                        }}
                        onClick={() => handleSort(col.key)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="truncate">{col.label}</span>
                            {sortConfig.key === col.key ? (
                                sortConfig.direction === "asc" ? 
                                    <ChevronUp size={18} strokeWidth={2.5} /> : 
                                    <ChevronDown size={18} strokeWidth={2.5} />
                            ) : (
                                <ChevronsUpDown size={18} strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                ))}
                <div className={actionHeaderCol} style={{ flex: 1, justifyContent: "flex-end" }}>Actions</div>
            </div>

            {/* Scrollable Table Body */}
            <div 
                className="overflow-y-auto" 
                style={{
                    height: tableHeight === "dynamic" 
                        ? `calc(100vh - 250px)` 
                        : tableHeight,
                    minHeight: "200px",
                }}
            >
                {sortedData.length > 0 ? (
                    sortedData.map((row) => (
                        <div key={row.id} className={tableRow}>
                            {headers.map((col) => (
                                <div key={col.key} className={tableRowCols} style={{ width: col.width }}>
                                    {row[col.key]}
                                </div>
                            ))}
                            <div className={actionRowColContainer} style={{ width: "100%" }}>
                                {(!row.logout_date || row.logout_date.trim() === "") && (
                                    <i className={deleteIcon} onClick={() => onAction("delete", row.id)}></i>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    // Show "No Data Available" row
                    <div className={tableRow}>
                        <div className="p-4 text-center text-gray-500 w-full">No data available</div>
                    </div>
                )}
            </div>
        </div>
        
        </>
    )
}

