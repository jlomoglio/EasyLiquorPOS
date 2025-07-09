// APPLICATION DEPENDENCIES
import { setTenantId } from "../features/tenantSlice"
import { useDispatch } from 'react-redux'
import { setUserId, setUserName } from "../features/loginSlice.js"
import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { apiFetch } from '../utils/registerApi.js'


// COMPONENT DEPENDENCIES
import logo from '../assets/EasyLiquor_POS_big_logo.png'
import InputGroup from '../backoffice/components/ui/forms/InputGroup.jsx'


// COMPONENT: BACKOFFICE LOGIN
export default function BackofficeLogin() {
    // STYLES
    const wrapper = `
        fixed top-0 left-0 right-0 bottom-0 bg-[#3994DF] flex flex-col 
        items-center overflow-hidden jstify-center-center
    `
    const logoImg = `
        w-[600px] mt-[150px]
    `
    const formWrapper = `
        w-[600px] h-[600px]
    `
    const loginButton = `
        w-[560px] h-[60px] bg-white text-center text-[1.6rem] text-[#5a5a5a] font-[600]
        cursor-pointer mt-[70px] rounded-lg shadow-lg pt-[12px] ml-[20px]
    `
    const copyright = `
        absolute left-0 right-0 bottom-[25px] h-[20px] text-center
        text-[.9rem] ml-[-20px] text-white
    `

    // DATE FOR COPYRIGHT
    const year = new Date().getFullYear()

    // NAVIGATION: Used to change route
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // STATE
    const [formData, setFormData] = useState({ username: "", password: ""})
    const [error, setError] = useState(null)

    // HANDLE INPUT CHANGE
    function handleInputChange(name, value) {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    // LOGIN THE USER
    async function handleLogin() {
        if (!formData.username || !formData.password) {
            setError("Please enter username and password")
            return
        }
    
        try {
            const response = await apiFetch("/api/register_login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                })
            })
    
            if (response.success) {
                console.log("TENANT ID = " + response.tenant_id)
                dispatch(setUserId(response.user_id))
                dispatch(setUserName(response.user_name))
                dispatch(setTenantId(response.tenant_id))
                navigate("/register")
            } 
            else {
                setError(response.message || "Login failed")
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("Network or server error")
        }
    }

    // RENDER JSX
    return (
        <div className={wrapper}>
            <img src={logo} alt="" className={logoImg} />
            <div className={formWrapper}>
                <InputGroup 
                    label="Username"
                    labelColor="white"
                    name="username"
                    type="text" 
                    value={formData.username}
                    onChange={handleInputChange}
                />
                <InputGroup 
                    label="Password"
                    name="password"
                    labelColor="white"
                    type="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                />
                <div className={loginButton} onClick={handleLogin}>LOGIN</div>

                {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
            
            <div className={copyright}>
                Copyright © {year} EasyLiquor POS. All rigths reserved.
            </div>
        </div>
    )
}