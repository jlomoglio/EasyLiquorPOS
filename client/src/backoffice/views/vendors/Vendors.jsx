// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable"
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal"
import SelectGroup from "../../components/ui/forms/SelectGroup"
import InputGroup from "../../components/ui/forms/InputGroup"
import ResetButton from "../../components/ui/forms/ResetButton"
import { Plus } from "lucide-react";

// COMPONENT: VENDORS
export default function Vendors() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // STATE
    const [originalVendors, setOriginalVendors] = useState([])
    const [vendors, setVendors] = useState([])
    const [vendorId, setVendorId] = useState("")
    const [vendorName, setVendorName] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [searchBy, setSearchBy] = useState("vendor_name") // Default to Vendor Name
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SEARCH FILTER OPTIONS
    const searchByOptions = [
        { label: "Vendor Name", value: "vendor_name" },
        { label: "Contact Person", value: "contact_person" }
    ]

    // GET ALL VENDORS ON FIRST RENDER
    useEffect(() => {
        handleGetVendors()
        dispatch(setView("Vendors"))
        dispatch(setMenuDisabled(false))
    }, [])

    // FETCH ALL VENDORS
    async function handleGetVendors() {
        try {
            const resData = await apiFetch("/api/vendors", {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            // Sort vendors alphabetically by vendor_name
            const sortedVendors = resData.vendors.sort((a, b) => 
                a.vendor_name.localeCompare(b.vendor_name)
            );
    
            setOriginalVendors(sortedVendors); // ✅ Store original sorted data
            setVendors(sortedVendors); // ✅ Set sorted vendors to state
        } catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    // HANDLE SEARCH TYPE CHANGE (Vendor Name or Contact Person)
    function handleSearchTypeChange(name, value) {
        setSearchBy(value)
        setSearchTerm("") // Clear search input
        setVendors(originalVendors) // Reset vendor list
    }

    // HANDLE SEARCH INPUT
    function handleSearchChange(name, value) {
        setSearchTerm(value);

        if (!value.trim()) {
            setVendors(originalVendors); // ✅ Reset vendors list when search is cleared
            return;
        }

        const filtered = originalVendors.filter(v =>
            v[searchBy].toLowerCase().startsWith(value.toLowerCase()) // ✅ Match from the start
        );

        setVendors(filtered);
    }

    // HANDLE RESET
    function resetVendors() {
        setSearchBy("vendor_name") // ✅ Reset to Vendor Name
        setSearchTerm("") // ✅ Clear input
        setVendors(originalVendors) // ✅ Reset vendor list
    }

    // HANDLE ADD VENDOR
    function handleAddVendor() {
        dispatch(setView("Vendors"))
        navigate("../addVendor")
    }

    // TABLE CONFIGURATION
    const vendorColumns = [
        { key: "vendor_name", label: "Vendor Name", width: "350px" },
        { key: "contact_person", label: "Contact Person", width: "250px" },
        { key: "phone", label: "Phone", width: "150px" }
    ]

    // HANDLE TABLE ACTIONS
    function handleTableAction(action, id) {
        if (action === "view") navigate(`../viewVendor/${id}`)
        if (action === "delete") {
            setShowConfirmDeleteModal(true)
            handleGetVendorNameById(id)
            setVendorId(id)
        }
    }

    // HANDLE GET VENDOR NAME BY ID
    async function handleGetVendorNameById(id) {
        try {
            const resData = await apiFetch(`/api/vendor/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setVendorName(resData.vendor.vendor_name)
            setVendorId(id)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }


    // HANDLE DELETE VENDOR
    async function handleDeleteVendor() {
        setShowConfirmDeleteModal(false)
        try {
            await apiFetch(`/api/delete_vendor/${vendorId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
    
            handleGetVendors()
            setVendorName('')
            setVendorId('')
            
        } catch (err) {
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
            onConfirm={handleDeleteVendor}
            title="Delete Vendor"
            message={
                <>
                    Are you sure you want to delete vendor <strong>"{vendorName}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <ViewContainer>
            <ViewTitle title="Manage Vendors" subtitle="Easily organize, update, and oversee your vendor partnerships in one place." />

            <div className="flex flex-row gap-4">
                <ButtonSmall
                    label="Add Vendor"
                    Icon={Plus}
                    type="solid"
                    color="#4A90E2"
                    onClick={handleAddVendor}
                />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-row mb-[-15px] mt-[-20px]">
                <div className="w-[200px] ml-[-20px]">
                    <SelectGroup
                        label="Search Type"
                        options={searchByOptions}
                        onChange={handleSearchTypeChange}
                        value={searchBy}
                    />
                </div>
                <div className="w-[400px] ml-[-25px] pt-[22px]">
                    <InputGroup
                        label=""
                        type="text"
                        placeholder="Enter search text"
                        onChange={handleSearchChange}
                        value={searchTerm}
                    />
                </div>
                <div className="w-[40px] h-[40px] ml-[-5px] mt-[53px]">
                    <ResetButton onClick={resetVendors} />
                </div>
                <div className="w-[440px] h-[40px] ml-[-5px] mt-[75px] text-right font-[500] absolute right-[10px]">
                    Total Vendors: {vendors.length}
                </div>
            </div>

            <DynamicScrollTable
                data={vendors}
                columns={vendorColumns}
                onAction={handleTableAction}
                actions={["view", "delete"]}
                tableWidth="100%"
                tableHeight="dynamic"
            />
        </ViewContainer>
        </>
    )
}
