// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useNavigate } from "react-router-dom";
import { apiFetch } from './../../../utils/api'
import { formatForDisplay, formatForFilter } from '../../../utils/dateHelpers'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer";
import ViewTitle from "../../components/ui/ViewTitle";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable";
import SelectGroup from "../../components/ui/forms/SelectGroup";
import InputGroup from "../../components/ui/forms/InputGroup";
import DateGroup from "../../components/ui/forms/DateGroup";
import ResetButton from "../../components/ui/forms/ResetButton";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import { Plus } from "lucide-react";


// COMPONENT: ORDERS
export default function PurchaseOrders() {
    // NAVIGATE
    const navigate = useNavigate();

    // REDUX
    const dispatch = useDispatch()


    // STATE
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('')
    const [purchaseOrderId, setPurchaseOrderId] = useState('')
    const [originalOrders, setOriginalOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState("po_number");
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Orders"));
        dispatch(setMenuDisabled(false))

        handleFetchPurchaseOrders()
    }, []);

    // SEARCH FILTER OPTIONS
    const searchByOptions = [
        { label: "PO#", value: "po_number" },
        { label: "Vendor", value: "vendor_name" },
        { label: "Order Date", value: "date" },
        { label: "Status", value: "status" }
    ];

    // HANDLE SEARCH TYPE CHANGE
    function handleSearchFieldChange(name, value) {
        setSearchField(value);
        setSearchTerm("");
        setPurchaseOrders(originalOrders);
    }

    // HANDLE SEARCH CHANGE
    function handleSearchInputChange(name, value) {
        setSearchTerm(value)
    
        let filtered = originalOrders
    
        if (searchField === "date" && value.trim()) {
            const selectedFilterDate = formatForFilter(value)
    
            filtered = filtered.filter(po => {
                const poDate = formatForFilter(po.date)
                return poDate === selectedFilterDate
            })
        } else {
            filtered = filtered.filter(po => {
                const field = (po[searchField] || "").toString()
                return field.toLowerCase().includes(value.toLowerCase())
            })
        }
    
        setPurchaseOrders(filtered)
    }

    // HANDLE RESET
    function resetSearch() {
        setSearchField("po_number");
        setSearchTerm("");
        setPurchaseOrders(originalOrders);
    }

    // TABLE CONFIGURATION
    const tableColumns = [
        { key: "po_number", label: "PO#", width: "220px" },
        { key: "vendor_name", label: "Vendor", width: "400px" },
        { key: "order_date", label: "Order Date", width: "200px" },
        { 
            key: "status", 
            label: "Status", 
            width: "160px",
            render: (value, row) => (
                <div className="px-2 py-1 w-[90px] ml-[-5px] h-[24px] rounded text-white text-center text-xs font-bold" style={{
                    backgroundColor: value === "Pending" ? "#f97316" : value === "Delivered" ? "#16a34a" : "#3b82f6"
                }}>
                    {value}
                </div>
            )
        },
        { key: "total", label: "Total", width: "180px" }
    ];

    // HANDLE TABLE ACTION
    function handleTableAction(action, id) {
        if (action === "view") navigate(`../purchaseOrder/${id}`);
        if (action === "delete") {
            setPurchaseOrderId(id)
            handleGetPurchaseOrderNumberById(id)
            setShowConfirmDeleteModal(true)
        }
    }

    // FETCH PURCHASE ORDERS
    async function handleFetchPurchaseOrders() {
        try {
            const resData = await apiFetch(`/api/purchase_orders`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            const formatted = resData.purchase_orders.map((po) => {
                return {
                    ...po,
                    order_date: formatForDisplay(po.date),
                    order_filter_date: formatForFilter(po.date),
                    total: `$${parseFloat(po.total).toFixed(2)}`
                }
            })
    
            setPurchaseOrders(formatted);
            setOriginalOrders(formatted);
        } catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    // HANDLE GET PURCHASE ORDER NUMBER BY ID
    async function handleGetPurchaseOrderNumberById(id) {
        try {
            const resData = await apiFetch(`/api/get_po_number_by_id/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setPurchaseOrderNumber(resData.po_number)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE DELETE PURCHASE ORDER
    async function handleDeletePurchaseOrder() {
        try {
            const response = await apiFetch(`/api/delete_purchase_order/${purchaseOrderId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
    
            handleFetchPurchaseOrders()
            setPurchaseOrderNumber('')
            setPurchaseOrderId('')
            
            handleCloseModal()
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE CLOSE MODAL
    function handleCloseModal() {
        setShowConfirmDeleteModal(false)
    }

    // RENDER JSX
    return (
        <>
        <ConfirmDeleteModal
            isOpen={showConfirmDeleteModal}
            onClose={handleCloseModal}
            onConfirm={handleDeletePurchaseOrder}
            title="Delete Purchase Order"
            message={
                <>
                  Are you sure you want to delete Purchase Order <strong>"{purchaseOrderNumber}"</strong>?<br />
                  This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <ViewContainer>
            {/* View Title */}
            <ViewTitle title="Purchase Orders" subtitle="Here's what's happening with your store today." />
            <div className="ml-[0px] mt-[15px] flex flex-row">
                <ButtonSmall type="solid" label="Add Purchase Order" Icon={Plus} onClick={() => navigate("../addPurchaseOrder")} />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-row mb-[-15px] mt-[-20px]">
                <div className="w-[200px] ml-[-20px]">
                    <SelectGroup 
                        label="Search By" 
                        options={searchByOptions} 
                        onChange={handleSearchFieldChange}
                        value={searchField}  
                    />
                </div>
                <div className="w-[400px] ml-[-25px] pt-[22px]">
                {searchField === "date" ? (
                    <DateGroup
                        label=""
                        name="searchDate"
                        value={searchTerm}
                        onChange={(value) => handleSearchInputChange("searcTerm", value)}
                    />
                ) : (
                    <InputGroup 
                        name="searchTerm"
                        label="" 
                        type="text" 
                        placeholder="Enter search text" 
                        onChange={handleSearchInputChange}
                        value={searchTerm || ""} 
                    />
                )}
                </div>
                <div className="w-[40px] h-[40px] ml-[-5px] mt-[55px]">
                    <ResetButton onClick={resetSearch} />
                </div>
                <div className="absolute right-[5px] h-[40px] ml-[-5px] mt-[75px] text-right font-[500]">
                    Total Purchase Orders: {purchaseOrders.length}
                </div>
            </div>
            
            {/* PURCHASE ORDER TABLE */}
            <DynamicScrollTable
                data={purchaseOrders}
                columns={tableColumns}
                onAction={handleTableAction}
                actions={["view", "delete", "blank"]}
                tableWidth="100%"
                tableHeight="dynamic"
            />
        </ViewContainer>
        </>
    )
}
