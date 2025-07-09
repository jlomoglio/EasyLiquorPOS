import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showMenu: false,
    menuDisabled: true,
    showConfirmDeleteModal: false,
    view: 'Store'
}

const backofficeSlice = createSlice({
    name: "backoffice",
    initialState,
    reducers: {
        setShowMenu: (state, action) => {
            state.showMenu = action.payload;
        },
        setMenuDisabled: (state, action) => {
            state.menuDisabled = action.payload;
        },
        setView: (state, action) => {
            state.view = action.payload;
        },
        setShowConfirmDeleteModal: (state, action) => {
            state.showConfirmDeleteModal = action.payload;
        }
    },
});

export const { 
    setShowMenu,
    setView,
    setMenuDisabled,
    setShowConfirmDeleteModal,
} = backofficeSlice.actions;

export default backofficeSlice.reducer;