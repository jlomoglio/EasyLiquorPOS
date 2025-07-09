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
export default function ManagePaymentTerms() {
    // NAVIGATE
    const navigate = useNavigate()

    // REF
    const termInputRef = useRef()

    // REDUX
    const dispatch = useDispatch()

    // STATE: UNITS
    const [terms, setTerms] = useState([])
    const [termId, setTermId] = useState('')
    const [term, setTerm] = useState('')
    const [errorText, setErrorText] = useState('')
    const [showDeleteTermModal, setShowDeleteTermModal] = useState(false)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")
    
    // GET ALL CATEGORIES
    useEffect(() => {
        handleGetTerms()
        dispatch(setView("Vendors")) 
        dispatch(setMenuDisabled(false))
    }, [])

    
    // DEFINE THE CATEGORY COLUMNS TO SHOW
    const tableColumns = [
        { key: "payment_term", label: "Payment Terms", width: "470px" }
    ]

    // HANDLE GET ALL UNITS
    async function handleGetTerms() {
        try {
            const resData = await apiFetch(`/api/terms`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setTerms(resData.terms)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE UNIT ACTIONS (DELETE)
    function handleTableAction(action, id) {
        if (action === "delete") {
            setShowDeleteTermModal(true)
            setTermId(id)
            handleGetTermName(id)
        }
    }

    // HANDLE ADD UNIT
    async function handleAddTerm(term) {
        if (termInputRef.current.value === '') {
            setErrorText("This filed is required!")
            return
        }

        try {
            const response = await apiFetch(`/api/add_term`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify({ term: term }),
            })

            termInputRef.current.value = ''
            handleGetTerms()
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE GET UNIT NAME
    async function handleGetTermName(id) {
        try {
            const resData = await apiFetch(`/api/term/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setTerm(resData.term[0].payment_term)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }
   
    // HANDLE DELETE PACKAGING TYPE
    async function handleDeleteTerm() {
        try {
            const response = await apiFetch(`/api/delete_term/${termId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
     
            termInputRef.current.value = ''
            handleGetTerms()
            handleCloseDeleteTermModal()
            
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
    function handleCloseDeleteTermModal() {
        setShowDeleteTermModal(false)
        setTermId('')
    }


    // RENDER JSX
    return (
        <>
        <ConfirmDeleteModal
            isOpen={showDeleteTermModal}
            onClose={handleCloseDeleteTermModal}
            onConfirm={handleDeleteTerm}
            title="Delete Payment Term"
            message={
                <>
                    Are you sure you want to delete payment term <strong>"{term}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        
        <div className="flex flex-row w-[1100px]">
            {/* TERMS */}
            <div className="flex flex-col absolute top-[190px] bottom-[20px]">
                <div className="flex flex-row relative h-[60px] w-[500px] mb-[10px]">
                    <div className="w-[430px] h-[60px] absolute top-[-50px] left-[-20px]">
                        <InputGroup
                            ref={termInputRef}
                            label="Payment Term"
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
                            onClick={() => handleAddTerm(termInputRef.current.value)}
                        />
                    </div>
                </div>
                <DynamicScrollTable
                    data={terms}
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