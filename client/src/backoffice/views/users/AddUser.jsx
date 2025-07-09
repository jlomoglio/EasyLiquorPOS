// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle";
import PinInputGroup from "../../components/ui/forms/PinInputGroup";
import DynamicForm from "../../components/ui/forms/DynamicForm"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import { toast } from 'react-hot-toast'


// COMPONENT: ADD USER
export default function AddUser() {
    const formConfig = {
        columns: 3,
        fields: [
            // ROW 1
            { name: "fname", label: "FIRST NAME", type: "letters", required: true },
            { name: "address", label: "ADDRESS", type: "text", required: true },
            { name: "role", label: "ROLE", type: "select",
                options: [
                    {name: "", label: "Select a role", value: ""}, 
                    {name: "admin", label: "Admin", value: "Admin"}, 
                    {name: "employee", label: "Employee", value: "Employee"}
                ], 
                required: true 
            },

            // ROW 2
            { name: "lname", label: "LAST NAME", type: "letters", required: true },
            { name: "city", label: "CITY", type: "letters", space: "30px", required: true },
            { name: "username", label: "USERNAME", type: "text", required: true },
           
            
            // ROW 3
            { name: "email", label: "EMAIL", type: "email", required: true, },
            { name: "state", label: "State", type: "state", space: "42px", required: true },
            { name: "password", label: "PASSWORD", type: "text", required: true },
            
            // ROW 4
            { name: "phone", label: "PHONE", type: "phone", required: true },
            { name: "zip", label: "ZIP CODE", type: "numbers", length: 5, required: true },
            
           
        ],
    }

    // CUSTOM COMPONENTS
    const customComponents = {
        pin: PinInputGroup, // Pass the PinInputGroup dynamically
    }


    // CUSTOM VALIDATIONS
    const customValidations = {
        // PIN validation (must be 6 digits)
        pin: (value) => {
            return /^\d{6}$/.test(value) ? null : "PIN must be exactly 6 digits"
        },
        zip: (value) => {
            return /^\d{5}$/.test(value) ? null : "Zip Code must be exactly 5 digits"
        }
    }

    // NAVIGATE
    const navigate = useNavigate()

    // STATE TO STORE FORM DATA
    const [formData, setFormData] = useState({})

    // REDUX
    const dispatch = useDispatch()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Users")) 
        dispatch(setMenuDisabled(false))
    }, [])


    // HANDLE SUBMITING THE FORM
    async function handleFormSubmit(formData) {
        try {
            const response = await apiFetch("/api/add_user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-tenant-id': tenantId
                },
                body: JSON.stringify(formData),
            })
          
            toast.success("User added successfully")
            setTimeout(() => {
                navigate('../users')
            }, "2000")
        }
        catch (err) {
            console.log(err.message)
        }
    }

    // RENDER JSX
    return (
        <>
        <ViewContainer>
            <ViewTitle title="Add User" subtitle="Detailed information about your user." />

            <div className="ml-[0px] mt-[15px] mb-[-20px]">
                <ButtonSmall label="Back" onClick={() => navigate('../users')} />
            </div>

            <div className="ml-[-20px]">
                <DynamicForm 
                    formConfig={formConfig}
                    customValidations={customValidations}
                    customComponents={customComponents}
                    onSubmit={(formData) => handleFormSubmit(formData)}
                    formData={formData}
                    setFormData={setFormData}
                    showErrors={true}
                    success={() => toast.success("User added successfully")}
                    buttonLable="Add User"
                    buttonType="solid"
                />
            </div>
        </ViewContainer>
        </>
    )
}