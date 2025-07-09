import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userName: null,
    userId: null,
    role: null,
    showErrorModal: false,
    errorMessage: null,
}

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
        setUserName: (state, action) => {
            state.userName = action.payload;
        },
        setRole: (state, action) => {
            state.role = action.payload;
        },
        showError: (state, action) => {
            state.showErrorModal = action.payload;
        },
        setErrorMessage: (state, action) => {
            state.errorMessage = action.payload;
        },
    },
});

export const { 
    setUserId,
    setUserName,
    setRole,
    showError,
    setErrorMessage
} = loginSlice.actions;

export default loginSlice.reducer;