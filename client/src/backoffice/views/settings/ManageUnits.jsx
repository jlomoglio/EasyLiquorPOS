// APPLICATION DEPENDENCIES
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import Button from "../../components/ui/forms/Button"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable"
import InputGroup from "../../components/ui/forms/InputGroup"
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal"


// COMPONENT: MANAGE PACKAGING TYPES
export default function ManageUnits() {
    // NAVIGATE
    const navigate = useNavigate()

    // REF
    const unitInputRef = useRef()

    // REDUX
    const dispatch = useDispatch()

    // STATE: UNITS
    const [units, setUnits] = useState([])
    const [unitId, setUnitId] = useState('')
    const [unit, setUnit] = useState('')
    const [errorText, setErrorText] = useState('')
    const [showDeleteUnitModal, setShowDeleteUnitModal] = useState(false)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")
    
    // GET ALL CATEGORIES
    useEffect(() => {
        handleGetUnits()
        dispatch(setView("Inventory")) 
        dispatch(setMenuDisabled(false))
    }, [])

    
    // DEFINE THE CATEGORY COLUMNS TO SHOW
    const tableColumns = [
        { key: "unit", label: "Units", width: "470px" }
    ]

    // HANDLE GET ALL UNITS
    async function handleGetUnits() {
        try {
            const resData = await apiFetch(`/api/units`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            setUnits(resData.units)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE UNIT ACTIONS (DELETE)
    function handleTableAction(action, id) {
        if (action === "delete") {
            setShowDeleteUnitModal(true)
            setUnitId(id)
            handleGetUnitName(id)
        }
    }

    // HANDLE ADD UNIT
    async function handleAddUnit(unit) {
        if (unitInputRef.current.value === '') {
            setErrorText("This filed is required!")
            return
        }

        try {
            const response = await apiFetch(`/api/add_unit`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify({ unit: unit }),
            })

            unitInputRef.current.value = ''
            handleGetUnits()
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE GET UNIT NAME
    async function handleGetUnitName(id) {
        try {
            const resData = await apiFetch(`/api/unit/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            setUnit(resData.unit[0].unit)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }
   
    // HANDLE DELETE PACKAGING TYPE
    async function handleDeleteUnit() {
        try {
            const response = await apiFetch(`/api/delete_unit/${unitId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
     
            unitInputRef.current.value = ''
            handleGetUnits()
            handleCloseDeleteUnitModal()
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE ONCHANGE
    function handleOnChange() {
        if (errorText) {
           setErrorText('')
        }
    }

    // HANDEL CLOSE DELETE UNIT MODAL
    function handleCloseDeleteUnitModal() {
        setShowDeleteUnitModal(false)
        setUnitId('')
    }


    // RENDER JSX
    return (
        <>
        <ConfirmDeleteModal
            isOpen={showDeleteUnitModal}
            onClose={handleCloseDeleteUnitModal}
            onConfirm={handleDeleteUnit}
            title="Delete Unit"
            message={
                <>
                    Are you sure you want to delete unit <strong>"{unit}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <div className="flex flex-row w-[1100px]">
            {/* UNITS */}
            <div className="flex flex-col absolute top-[160px] bottom-[40px]">
                <div className="flex flex-row relative h-[60px] w-[500px] mb-[10px]">
                    <div className="w-[430px] h-[60px] absolute top-[-50px] left-[-20px]">
                        <InputGroup
                            ref={unitInputRef}
                            label="Unit"
                            type="text"
                            error={errorText}
                            required
                            onChange={handleOnChange}
                        />
                    </div>
                    <div className="w-[100px] h-[60px] absolute top-0 right-[0px] pt-[2px]">
                        <Button
                            label="Add"
                            type={"solid"}
                            onClick={() => handleAddUnit(unitInputRef.current.value)}
                        />
                    </div>
                </div>
                <DynamicScrollTable
                    data={units}
                    columns={tableColumns}
                    onAction={handleTableAction}
                    actions={["delete"]}
                    tableWidth="500px" 
                    tableHeight="dynamic"
                    rowSelect
                    actionColHeaderPaddingRight="15px"
                />
            </div>
        </div>
        </>
    )
}