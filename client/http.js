// Open the cash drawer
export async function openCashDrawer() {
    try {
        const response = await fetch("http://localhost:5000/api/register/drawer_open")

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        return {success: true}
    } 
    catch (error) {
        console.error("Error opening cash drawer:", error)
    }
}

// Open Register
export async function openRegister(user_id, opening_amount, user_name) {
    console.log("Sending open register") 

    try {
        const response = await fetch("http://localhost:5000/api/open_register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                user_id: user_id,
                opening_amount: opening_amount,
                user_name: user_name
            }),
            mode: "cors"
        })

        console.log("Raw Response:", response) // Log full response object

        if (!response.ok) {
            console.error("HTTP Error:", response.status)
            throw new Error("Failed to open register")
        }

        const resData = await response.json()
        console.log("Response Data:", resData) // Log the parsed response

        return resData
    } 
    catch (error) {
        console.error("Error logging in:", error)
        return { success: false, message: "Error opening register" }
    }
}

