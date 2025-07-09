import { configureStore, combineReducers } from "@reduxjs/toolkit"
import loginReducer from "./features/loginSlice"
import cartReducer from "./features/cartSlice"
import registerReducer from "./features/registerSlice"
import transactionReducer from "./features/transactionSlice"
import backofficeLoginReducer from "./features/backofficeLoginSlice"
import backofficeReducer from "./features/backofficeSlice"
import tenantReducer from "./features/tenantSlice"

const rootReducer = combineReducers({
    login: loginReducer,
    cart: cartReducer,
    register: registerReducer,
    transaction: transactionReducer,
    backofficeLogin: backofficeLoginReducer,
    backoffice: backofficeReducer,
    tenant: tenantReducer,
})

export const store = configureStore({ reducer: rootReducer })
