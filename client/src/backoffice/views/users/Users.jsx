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
import { Plus } from "lucide-react";


// COMPONENT: USERS
export default function Users() {
     // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // STATE
    const [users, setUsers] = useState([])
    const [userName, setUserName] = useState("")
    const [userId, setUserId] = useState("")
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)

    // GET ALL USERS ON FIRST RENDER
    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        handleGetUsers()
        dispatch(setView("Users")) 
        dispatch(setMenuDisabled(false))
    }, [])


    // HANDLE VIEW ADD USER FROM
    function handleAddUser() {
        dispatch(setView('Users'))
        navigate('../addUser')
    }

    // HANDLE VIEW USERS LOGS
    function handleViewUserLogs() {
        dispatch(setView('Users'))
        navigate('../userLogs')
    }


    // DEFINE THE COLUMNS TO SHOW
    const userColumns = [
        { key: "fname", label: "First Name", width: "200px" },
        { key: "lname", label: "Last Name", width: "200px" },
        { key: "email", label: "Email", width: "350px" },
        { key: "phone", label: "Phone", width: "220px" },
        { key: "role", label: "Role", width: "210px" }
    ]

    // HANDLE USER ACTIONS (VIEW/DELETE)
    function handleTableAction(action, id) {
        if (action === 'view') navigate(`../viewUser/${id}`)
        if (action === 'delete') {
            setUserId(id)
            handleGetUsersName(id)
            setShowConfirmDeleteModal(true)
        }
    }

    // HANDLE GET ALL USERS
    async function handleGetUsers() {
        try {
            const resData = await apiFetch("/api/users", {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setUsers(resData.users)
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE GET THE USER'S NAME
    async function handleGetUsersName(id) {
        try {
            const resData = await apiFetch(`/api/user/${id}`, {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setUserName(`${resData.user.fname} ${resData.user.lname}`)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE DELETE USER
    async function handleDeleteUser() {
        setShowConfirmDeleteModal(false)
        try {
            await apiFetch(`/api/delete_user/${userId}`, {
                method: "DELETE",
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            handleGetUsers()
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
        
    }

    // FILTER OUT ROOT AND OWNER
    const filteredUsers = users ? users.filter(row => row.role !== "Root" && row.role !== "Owner" && row.role !== "Setup") : [];

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
            onConfirm={handleDeleteUser}
            title="Delete User"
            message={
                <>
                    Are you sure you want to delete user <strong>"{userName}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <ViewContainer>
            <ViewTitle title="Manage Users" subtitle="Easily add, update, and oversee your users." />

            <div className="flex flex-row gap-4">
                <ButtonSmall 
                    label="Add User"
                    Icon={Plus}
                    type="solid"
                    color="#4A90E2"
                    onClick={handleAddUser}
                />

                <ButtonSmall 
                    label="View User Logs"
                    type="solid"
                    color="#4A90E2"
                    onClick={handleViewUserLogs}
                />
            </div>

            <DynamicScrollTable
                data={filteredUsers} 
                columns={userColumns} 
                onAction={handleTableAction}
                actions={["view", "delete"]}
                tableWidth="100%"
                tableHeight="dynamic"
            />
        </ViewContainer>
        </>
    )
}