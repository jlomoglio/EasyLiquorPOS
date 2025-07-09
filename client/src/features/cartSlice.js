import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    salesTaxRate: 0.06, // 6% sales tax
    amountPaid: 0,
    showCashPaymentPopup: false,
    showChangeDuePopup: false,
    showMenuPopup: false,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setTax: (state, action) => {
            state.tax = action.payload;
        },
        addItem: (state, action) => {
            const newItem = action.payload;
            state.cartItems.push(newItem);

            // ✅ Update totals dynamically
            state.subtotal += newItem.price;
            state.tax = state.subtotal * state.salesTaxRate;
            state.total = state.subtotal + state.tax;
        },
        removeItem: (state, action) => {
            const index = action.payload;
            const itemToRemove = state.cartItems[index];

            if (itemToRemove) {
                // ✅ Deduct removed item's price from subtotal
                state.subtotal -= itemToRemove.price;
                state.tax = state.subtotal * state.salesTaxRate;
                state.total = state.subtotal + state.tax;
            }

            // ✅ Remove item from cart
            state.cartItems = state.cartItems.filter((_, i) => i !== index);
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.subtotal = 0;
            state.tax = 0;
            state.total = 0;
            state.amountPaid = 0
        },
        showCashPayment: (state, action) => {
            state.showCashPaymentPopup = action.payload
        },
        showChangeDue: (state, action) => {
            state.showChangeDuePopup = action.payload
        },
        showMenu: (state, action) => {
            state.showMenuPopup = action.payload
        },
        setAmountPaid: (state, action) => {
            state.amountPaid = action.payload;
        },
        getCartItems: (state, action) => {
            state.cartItems = action.payload;
        },
    },
});

export const { 
    setTax,
    addItem, 
    removeItem, 
    clearCart, 
    showCashPayment, 
    showChangeDue,
    showMenu,
    setAmountPaid, 
    getCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
