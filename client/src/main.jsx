import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import './index.css'
import { store } from "./store"
import { MantineProvider } from '@mantine/core'
import App from './App.jsx'


ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <MantineProvider withGlobalStyles withNormalizeCSS>
        <App />
    </MantineProvider>
  </Provider>
)