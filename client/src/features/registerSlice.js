import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    registerId: null,
    openedAmount: 0.00,
    closedAmount: null,
    openedDate: null,
    cashSales: 0.00,
    drawerAmount: 0.00,
    isDisabled: true,
    isRegisterOpen: false
}

const registerSlice = createSlice({
    name: "register",
    initialState,
    reducers: {
        setRegisterId: (state, action) => {
            state.registerId = action.payload;
        },
        setOpenedDate: (state, action) => {
            state.openedDate = action.payload;
        },
        setOpenedAmount: (state, action) => {
            state.openedAmount = Number(action.payload);
        },
        setClosedAmount: (state, action) => {
            state.closedAmount = Number(action.payload);
        },
        setDrawerAmount: (state, action) => {
            state.drawerAmount = Number(action.payload);
        },
        setIsDisabled: (state, action) => {
            state.isDisabled = action.payload;
        },
        openRegister: (state) => {
			state.isRegisterOpen = true
		},
		closeRegister: (state) => {
			state.isRegisterOpen = false
		}
    },
});

export const { 
    setRegisterId,
    setOpenedDate,
    setOpenedAmount,
    setClosedAmount,
    setDrawerAmount,
    setIsDisabled,
    openRegister, 
    closeRegister
} = registerSlice.actions;

export default registerSlice.reducer;