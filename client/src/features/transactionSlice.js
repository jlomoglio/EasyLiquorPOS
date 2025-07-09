import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    transactionId: null,
    salesType: null,
    isVoid: false
}

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        setTransactionId: (state, action) => {
            state.transactionId = action.payload;
        },
        setSalesType: (state, action) => {
            state.salesType = action.payload;
        },
        setVoidTransaction: (state, action) => {
            state.isVoid = action.payload;
        },    
    },
});

export const { 
    setTransactionId,
    setSalesType,
    setVoidTransaction
} = transactionSlice.actions;

export default transactionSlice.reducer;
