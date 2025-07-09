import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userName: null,
    firstName: null,
    userId: null,
    role: null,
    firstTimeLogin: false,
    showErrorModal: false,
    errorMessage: "",
}

const backofficeLoginSlice = createSlice({
    name: "backofficeLogin",
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
        setUserName: (state, action) => {
            state.userName = action.payload;
        },
        setFirstName: (state, action) => {
            state.firstName = action.payload;
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
        setFirstTimeLogin(state, action) {
            state.firstTimeLogin = action.payload
        },
    },
});

export const { 
    setUserId,
    setUserName,
    setFirstName,
    setRole,
    setFirstTimeLogin,
    showError,
    setErrorMessage,
} = backofficeLoginSlice.actions;

export default backofficeLoginSlice.reducer;