// APPLICATION DEPENDENCIES
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setMenuDisabled } from "../../../features/backofficeSlice"
import { setUserName, setUserId } from "../../../features/backofficeLoginSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import PinInputGroup from "../../components/ui/forms/PinInputGroup"
import SalesTaxInputGroup from "../../components/ui/forms/SalesTaxInputGroup"
import DynamicForm from "../../components/ui/forms/DynamicForm"


// COMPONENT: STORE
export default function StoreSetup() {
    // STYLES
    const viewSubTitle = `
        text-[1rem] font-[500] ml-[20px] font-[Roboto]
    `

    /** 
        CONFIGURE THE FORM FIELDS
        USE PLACEHOLDERS: Used for layout - The name must include a unique number
        TYPES: 
            text: Accepts any character
            letters: Accepts only Az - Zz, spaces, tabs
            numbers: Accepts 0-9, spaces
            phone: Accepst only 0-9 and auto formats - (xxx) xxx-xxxx
            email: Accepts Az-Zz, 0-9 and period and @
        LENGTH: Limits how many characters can be added

    */
    const formConfig = {
        columns: 3,
        fields: [
            // ROW 1
            { name: "store_name", label: "STORE NAME", type: "text", required: true },      // Col 1
            { name: "fname", label: "FIRST NAME", type: "letters", required: true },        // Col 2
            { name: "pin", label: "REGISTER LOGIN PIN", type: "numbers", required: true },  // Col 3

            // ROW 2
            { name: "store_number", label: "STORE NUMBER", type: "text", required: false },
            { name: "lname", label: "LAST NAME", type: "letters", required: true },
            { name: "sales_tax", label: "SALES TAX", type: "text", required: true },
                                
            // ROW 3
            { name: "address", label: "ADDRESS", type: "text", required: true },
            { name: "email", label: "EMAIL", type: "email", required: true },
            { name: "placeholder-1", type: "placeholder" }, // Blank placeholder

            // ROW 4
            { name: "city", label: "CITY", type: "letters", required: true },
            { name: "phone", label: "PHONE", type: "phone", required: true },
            { name: "placeholder-2", type: "placeholder" }, // Blank placeholder
            
            // ROW 5
            { name: "state", label: "STATE", type: "state", required: true },
            { name: "username", label: "USERNAME", type: "text", required: true },
            { name: "placeholder-3", type: "placeholder" }, // Blank placeholder

            // ROW 6
            { name: "zip", label: "ZIP CODE", type: "numbers", length: 5, required: true },
            { name: "password", label: "PASSWORD", type: "text", length: 6, required: true },
            { name: "placeholder-4", type: "placeholder" }, // Blank placeholder
        ],
    }

    // CUSTOM COMPONENTS
    const customComponents = {
        pin: PinInputGroup,
        sales_tax: SalesTaxInputGroup
    }

    // CUSTOM VALIDATION ERRPR MESSAGES
    const customValidations = {
        // PIN validation (must be 6 digits)
        pin: (value) => {
            return /^\d{6}$/.test(value) ? null : "PIN must be exactly 6 digits"
        },
        zip: (value) => {
            return /^\d{5}$/.test(value) ? null : "Zip Code must be exactly 5 digits"
        },
        sales_tax: (value) => {
            // Ensure it's a valid decimal number between 0.00 and 0.99
            return /^0\.\d{2}$/.test(value) ? null : "Must be decimal format (e.g., 0.07)";
        }
    }


    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // STATE TO STORE FORM DATA
    const [formData, setFormData] = useState({
        store_name: "",
        store_number: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        fname: "",
        lname: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        pin: "",
        sales_tax: ""
    })

    // STATE: SUCCESS ALERT
    const [showSuccessAlert, setShowSuccessAlert] = useState(false)  // <--- ADDED THIS

    

    // HANDLE SUBMITING THE FORM
    async function handleFormSubmit(formData) {
        try {
            const resData = await apiFetch("/api/create_store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (resData) {
                setMenuDisabled(false)
                setShowSuccessAlert(true) 
                dispatch(setUserId(2))
                dispatch(setUserName(`${formData.fname} ${formData.lname}`))
                setTimeout(() => {
                    dispatch(setMenuDisabled(false))
                    setShowSuccessAlert(false)
                    navigate('../editStore')
                    }, "2000")
                
            }
            else {
                //setErrorMessage(resData.message)
            }
        } 
        catch (err) {
            //setErrors(err.message)
        } 
    }


    // RENDER JSX
    return (
        <>
        <DynamicForm 
            formConfig={formConfig}
            customValidations={customValidations}
            customComponents={customComponents}
            onSubmit={(formData) => handleFormSubmit(formData)}
            formData={formData}
            setFormData={setFormData}
            showErrors={true}
            success={showSuccessAlert}
            buttonLable="Submit"
        />
        </>
    )
}