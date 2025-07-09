// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import PinInputGroup from "../../components/ui/forms/PinInputGroup";
import DynamicForm from "../../components/ui/forms/DynamicForm"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import { toast } from 'react-hot-toast'


// COMPONENT: STORE
export default function EditUser() {
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
            { name: "fname", label: "FIRST NAME", type: "text", required: true },
            { name: "address", label: "ADDRESS", type: "text", required: true },
            { name: "role", label: "ROLE", type: "select", 
                options: [
                    {name: "admin", label: "Admin", value: "Admin"}, 
                    {name: "employee", label: "Employee", value: "Employee"}
                ], 
                required: true 
            },

            // ROW 2
            { name: "lname", label: "LAST NAME", type: "text", required: true },
            { name: "city", label: "CITY", type: "text", required: true },
            { name: "username", label: "USERNAME", type: "text", required: true },
           
            
            // ROW 3
            { name: "email", label: "EMAIL", type: "email", required: true, },
            { name: "state", label: "State", type: "state", required: true },
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
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        username: "",
        password: "",
        pin: "",
        role: ""
    })


    // REDUX
    const dispatch = useDispatch()

    // USER ID
    const { id } = useParams()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Users")) 
        dispatch(setMenuDisabled(false))
    }, [])

    // FETCH EXISTING USER DATA
    useEffect(() => {
        async function fetchUserData() {
            try {
                const resData = await apiFetch(`/api/user/${id}`, {
                    headers: {
                        'x-tenant-id': tenantId
                    }
                })

                const u = resData.user || {}
                setFormData(prev => ({
                    ...prev,
                    fname: u.fname ?? "",
                    lname: u.lname ?? "",
                    email: u.email ?? "",
                    phone: u.phone ?? "",
                    address: u.address ?? "",
                    city: u.city ?? "",
                    state: u.state ?? "",
                    zip: u.zip ?? "",
                    username: u.username ?? "",
                    password: u.password ?? "",
                    pin: u.pin ?? "",
                    role: u.role ?? ""
                  }))
            } 
            catch (error) {
                console.error("❌ Error fetching store data:", error)
            }
        }
        fetchUserData()
    }, [])


    // HANDLE SUBMITING THE FORM
    async function handleFormSubmit(formData) {
        try {
            await apiFetch(`/api/update_user/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'x-tenant-id': tenantId
                },
                body: JSON.stringify({
                    ...formData,
                }),
            })
            
            toast.success("User updated successfully")
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
            <ViewTitle title="Edit User" subtitle="Modify user details and roles to maintain accurate records and manage permissions." />
            
            <div className="ml-[-20px]">
            <p className={viewSubTitle}>
                Fileds with * are required.
            </p>

                <div className="ml-[20px] mt-[15px] mb-[-20px] w-[120px]">
                    <ButtonSmall label="Back" onClick={() => navigate('../users')} />
                </div>

                <DynamicForm 
                    formConfig={formConfig}
                    customValidations={customValidations}
                    customComponents={customComponents}
                    onSubmit={(formData) => handleFormSubmit(formData)}
                    formData={formData}
                    setFormData={setFormData}
                    showErrors={true}
                    buttonLable="Update User"
                    buttonType="solid"
                />
            </div>
        </ViewContainer>
        </>
    )
}