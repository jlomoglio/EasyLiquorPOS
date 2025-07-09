// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"


// COMPONENT: STORE
export default function ViewUser() {
    // STYLES
    const wrapper = `
         absolute top-0 left-0 right-0 bottom-0
        text-[#5a5a5a] p-[20px] flex flex-col items-start ml-[20px]
        overflow-y-scroll h-[calc(100vh-50px)] w-[calc(100vw-110px)] pb-[50px]
    `
    const buttonWrapper = `
        ml-[20px] mt-[25px] mb-[-20px] flex flex-row gap-4
    `
    const userInfoWrapper = `
        w-[800px] flex flex-row mt-[30px] ml-[20px] border border-[#ccc] rounded-xl p-4 bg-white shadow-lg
    `
    const userInfoCol = `
        w-[400px] flex flex-col
    `
    const userFieldWrapper = `
        text-left flex flex-col mt-[15px]
    `
    const labelText = `
        text-[1.1rem] font-bold
    `
    const infoText = `
        text-[1.1rem]
    `
    
    // NAVIGATE
    const navigate = useNavigate()

    // STATE
    const [user, setUser] = useState()

    // REDUX
    const dispatch = useDispatch()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Users")) 
        dispatch(setMenuDisabled(false))
        handleGetUsers()
    }, [])

    // USER ID
    const { id } = useParams()

    // HANDLE GET ALL USERS
    async function handleGetUsers() {
        try {
            const resData = await apiFetch(`/api/user/${id}`, {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setUser(resData.user)
            
        } 
        catch (err) {
            console.log("ERROR: " + err.message);
        }
    }


    // HANDLE RETURING TO PREVIOUS VIEW
    function handleBackButton() {
        navigate('../users')
    }

    // HANDLE OPENING EDIT USER VIEW
    function handleEditUserButton() {
        navigate(`../editUser/${id}`)
    }


    // RENDER JSX
    return (
        <>
        
        <ViewContainer>
            <ViewTitle title="User Information" subtitle="View and manage detailed information about your user." />
            
            <div className={buttonWrapper}>
                <ButtonSmall 
                    label="Back"
                    type="outline"
                    color="#111827"
                    onClick={handleBackButton}
                />

                <ButtonSmall 
                    label="Edit User"
                    type="solid"
                    onClick={handleEditUserButton}
                />
            </div>
            
            { user &&
                <div className={userInfoWrapper}>
                    <div className={userInfoCol}>
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Employee Name</span>
                            <span className={infoText}>{user.fname} {user.lname}</span>
                        </div>
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Email</span>
                            <span className={infoText}>{user.email}</span>
                        </div>
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Phone</span>
                            <span className={infoText}>{user.phone}</span>
                        </div>
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Address</span>
                            <span className={infoText}>{user.address}, {user.city}, {user.state} {user.zip}</span>
                        </div>
                    </div>
                    <div className={userInfoCol}>
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Role</span>
                            <span className={infoText}>{user.role}</span>
                        </div>
                        { user.role === 'Admin' && 
                            <>
                            <div className={userFieldWrapper}>
                                <span className={labelText}>Username</span>
                                <span className={infoText}>{user.username}</span>
                            </div>
                            <div className={userFieldWrapper}>
                                <span className={labelText}>Password</span>
                                <span className={infoText}>{user.password}</span>
                            </div>
                            </>
                        }
                        <div className={userFieldWrapper}>
                            <span className={labelText}>Register Login PIN</span>
                            <span className={infoText}>{user.pin}</span>
                        </div>
                    </div>
                </div>
            }
        </ViewContainer>
        </>
    )
}