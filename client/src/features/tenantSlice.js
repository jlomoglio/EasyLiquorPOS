import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    tenantId: null,
}

const tenantSlice = createSlice({
    name: "tenant",
    initialState,
    reducers: {
        setTenantId: (state, action) => {
            state.tenantId = action.payload
        },
        clearTenantId: (state) => {
            state.tenantId = null
        },
    },
})

export const { setTenantId, clearTenantId } = tenantSlice.actions

export default tenantSlice.reducer
