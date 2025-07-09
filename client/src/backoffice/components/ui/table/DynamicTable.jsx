// APPLICATION DEPENDENCIES
import { useMemo, useState } from "react";

// COMPONENT: DYNAMIC TABLE
export default function DynamicTable({ data, columns, onAction, tableWidth }) {
    // STYLES
    const table = `
        bg-white rounded-lg shadow-md mt-5 overflow-hidden 
        border border-[#ccc]
    `
    const tableHeader = `
        flex w-full h-[40px] bg-gray-800 text-white 
        text-[1.1rem] rounded-t-md
    `
    const headerCols = `
        p-2 font-bold text-left pl-[20px] cursor-pointer
    `
    const actionHeaderCol = `
        p-2 text-center font-bold
    `
    const tableRowContainer = `
        flex flex-col overflow-y-auto max-h-[800px]
    `
    const tableRow = `
        flex w-full h-[50px] border-b border-b-[#ccc] 
        text-left text-[1.2rem] pl-[10px]
    `
    const tableRowCols = `
        p-2 pl-[10px] text-gray-700
    `
    const actionRowColContainer = `
        p-2 flex justify-start gap-5 mt-[4px] pl-[20px]
    `
    const viewIcon = `
        fa-solid fa-eye text-[1.2rem] cursor-pointer
    `
    const editIcon = `
        fa-solid fa-edit text-[1.2rem] cursor-pointer
    `

    
    // ENSURE THE DATA BEFORE RENDERING
    if (!data || data.length === 0) {
        return <p className="text-gray-500">No data available.</p>;
    }

    // STATE: SORTING
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

    // GENERATE THE TABLE HEADERS BASED ON SELECTED COLUMNS
    const headers = useMemo(() => {
        return columns.map(col => ({ key: col.key, label: col.label, width: col.width || "150px" }));
    }, [columns])

    // SORT THE DATA
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig])


    // HANDLE COLUMN CLICK FOR SORTING
    function handleSort(key) {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    }


    // RENDER JSX
    return (
        <div className={table} style={{ width: tableWidth }}>
            {/* Table Header */}
            <div className={tableHeader}>
                {headers.map((col) => (
                    <div 
                        key={col.key} 
                        className={headerCols} 
                        style={{ width: col.width }}
                        onClick={() => handleSort(col.key)}
                    >
                        {col.label}
                        {sortConfig.key === col.key && (
                            <span className="ml-2 items-right">
                                {sortConfig.direction === "asc" ? 
                                    <i className="fa-solid fa-arrow-up"></i> : 
                                    <i className="fa-solid fa-arrow-down"></i>}
                            </span>
                        )}
                    </div>
                ))}
                <div className={actionHeaderCol} style={{ width: "120px" }}>Actions</div>
            </div>

            {/* Table Rows */}
            <div className={tableRowContainer}>
                {sortedData.length > 0 ? sortedData.map((row) => (
                    <div key={row.id} className={tableRow}>
                        {headers.map((col) => (
                            <div key={col.key} className={tableRowCols} style={{ width: col.width }}>
                                {row[col.key]}
                            </div>
                        ))}
                        <div className={actionRowColContainer} style={{ width: "130px" }}>
                            <i className={viewIcon}  onClick={() => onAction("view", row.id)}></i>
                            <i className={editIcon} onClick={() => onAction("edit", row.id)}></i>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 text-center text-gray-500">No data available</div>
                )}
            </div>
        </div>
    );
}