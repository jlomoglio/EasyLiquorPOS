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
import UserLogTable from "../../components/ui/table/UserLogTable"


// COMPONENT: USERS
export default function UserLogs() {
    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // STATE
    const [users, setUsers] = useState([])
    const [logs, setLogs] = useState([])
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedUser, setSelectedUser] = useState("")

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // GET ALL USERS, SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Users")) 
        dispatch(setMenuDisabled(false))

        handleGetUsers()
        handleGetAllLogs()
    }, [])


    // DEFINE THE COLUMNS TO SHOW
    const userColumns = [
        { key: "user_name", label: "Name", width: "250px" },
        { key: "login_date", label: "Login", width: "180px" },
        { key: "logout_date", label: "Logout", width: "180px" },
    ]

    // HANDLE USER LOGS TABLE ACTIONS
    function handleTableAction(action, logId) {
        if (action === 'delete') {
            handleDeleteSelectedLog(logId)
        }
    }

    // HANDLE GET LOGGED USERS FOR FILTER BY USER
    async function handleGetUsers() {
        try {
            const resData = await apiFetch("/api/get_logged_users", {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setUsers(resData.logged_users)
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDEL GET ALL LOGS
    async function handleGetAllLogs() {
        try {
            const resData = await apiFetch("/api/user_logs", {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setLogs(resData.user_logs)
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    useEffect(() => {
        async function fetchFilteredLogs() {
          try {
            if (!selectedDate) {
              handleGetAllLogs()
              return
            }
      
            let url = `/api/filter_user_logs_by_date/${selectedDate}`
      
            if (selectedUser) {
              // Match user object by name to get ID
              const userObj = users.find(u => `${u.fname} ${u.lname}` === selectedUser)
              if (userObj) url += `/${userObj.id}`
            }
      
            const res = await apiFetch(url, {
                method: "GET",
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setLogs(res.user_logs || [])
          } 
          catch (err) {
            console.error("❌ Failed to fetch filtered logs:", err.message)
          }
        }
      
        fetchFilteredLogs()
      }, [selectedDate, selectedUser])


    // HANDLE DELETE USER FROM LOG
    async function handleDeleteSelectedLog(logId) {
        try {
            await apiFetch(`/api/delete_user_log/${logId}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            handleGetUsers()
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }


    // RENDER JSX
    return (
        <>
        <ViewContainer>
            <ViewTitle title="User Logs" subtitle="Track and review user activities to monitor system interactions and maintain accountability." />

            <div className="flex flex-row gap-4">
                <ButtonSmall 
                    label="Back"
                    type="outline"
                    color="#4A90E2"
                    onClick={() => navigate('../users')}
                />
            </div>
            
            <UserLogTable
                users={users}
                data={logs}
                columns={userColumns}
                onAction={handleTableAction}
                onDateChange={setSelectedDate}
                onUserChange={setSelectedUser}
                selectedDate={selectedDate}
                selectedUser={selectedUser}
                tableWidth="100%"
                tableHeight="dynamic"
            />

            {/* SPACER */}
            <div className="h-[30px]"></div>
        </ViewContainer>
        </>
    )
}