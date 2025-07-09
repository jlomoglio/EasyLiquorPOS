import { createBrowserRouter, Navigate } from 'react-router-dom'

// COMPONENT DEPENDENCIES: REGISTER
import Layout from './register/Layout'
import LoginPortal from './views/LoginPortal'
import Register from './register/Register'


// COMPONENT DEPENDENCIES: BACKOFFICE
import Welcome from './backoffice/components/Welcome'
import Backoffice from './backoffice/Backoffice'
import Dashboard from './backoffice/views/dashboard/Dashboard'

import Users from './backoffice/views/users/Users'
import AddUser from './backoffice/views/users/AddUser'
import ViewUser from './backoffice/views/users/ViewUser'
import EditUser from './backoffice/views/users/EditUser'
import UserLogs from './backoffice/views/users/UserLogs'

import Vendors from './backoffice/views/vendors/Vendors'
import ViewVendor from './backoffice/views/vendors/ViewVendor'
import AddVendor from './backoffice/views/vendors/AddVendor'
import EditVendor from './backoffice/views/vendors/EditVendor'


import Inventory from './backoffice/views/inventory/Inventory'
import ViewProduct from './backoffice/views/inventory/ViewProduct'
import AddProduct from './backoffice/views/inventory/AddProduct'
import EditProduct from './backoffice/views/inventory/EditProduct'


import PurchaseOrders from './backoffice/views/orders/PurchaseOrders'
import AddPurchaseOrder from './backoffice/views/orders/AddPurchaseOrder'
import EditPurchaseOrder from './backoffice/views/orders/EditPurchaseOrder'
import PurchaseOrder from './backoffice/views/orders/PurchaseOrder'

import Deliveries from './backoffice/views/deliveries/Deliveries'

import Registers from './backoffice/views/register/Registers'
import Transactions from './backoffice/views/register/Transactions'
import ViewTransaction from './backoffice/views/register/ViewTransaction'

import About from './backoffice/views/about/About'

import Support from './backoffice/views/support/Support'
import ViewTicketThread from './backoffice/views/support/ViewTicketThread'
import SubmitTicketForm from './backoffice/views/support/SubmitTicketForm'

import Tutorials from './backoffice/views/tutorials/Tutorials'

import Settings from './backoffice/views/settings/Settings'
import EditStore from './backoffice/views/settings/EditStore'
import ManageCategories from './backoffice/views/settings/ManageCategories'
import ManagePackagingTypes from './backoffice/views/settings/ManageUnits'
import ManagePaymentTerms from './backoffice/views/settings/ManagePaymentTerms'

import Root from './backoffice/views/root/Root'
import ErrorLogs from './backoffice/views/root/ErrorLogs'

const posRouter = createBrowserRouter([
	{
		path: '/pos',
		element: <Layout />,
		children: [
			// REGISTER
			//{ index: true, element: <Navigate to="pos_login" replace /> },
			{ path: 'pos_login', element: <LoginPortal /> },
			{ path: 'register', element: <Register /> },

			// BACKOFFICE
			{ 
				path: 'backoffice', 
				element: <Backoffice />, 
				children: [
					{ path: 'dashboard', element: <Dashboard /> },
				
					// STORE ROUTES
					{ path: 'welcome', element: <Welcome /> },
				
					// USER ROUTES
					{ path: 'users', element: <Users /> },
					{ path: 'addUser', element: <AddUser /> },
					{ path: 'userLogs', element: <UserLogs /> },
					{ path: 'viewUser/:id', element: <ViewUser /> },
					{ path: 'editUser/:id', element: <EditUser /> },
				
					// VENDOR ROUTES
					{ path: 'vendors', element: <Vendors /> },
					{ path: 'viewVendor/:id', element: <ViewVendor /> },
					{ path: 'addVendor', element: <AddVendor /> },
					{ path: 'editVendor/:id', element: <EditVendor /> },
				
					// INVENTORY ROUTES
					{ path: 'inventory', element: <Inventory /> },
					{ path: 'viewProduct/:id', element: <ViewProduct /> },
					{ path: 'addProduct', element: <AddProduct /> },
					{ path: 'editProduct/:id', element: <EditProduct /> },
				
					// ORDERS ROUTES
					{ path: 'orders', element: <PurchaseOrders /> },
					{ path: 'addPurchaseOrder', element: <AddPurchaseOrder /> },
					{ path: 'editPurchaseOrder/:id', element: <EditPurchaseOrder /> },
					{ path: 'purchaseOrder/:id', element: <PurchaseOrder /> },
				
					// DELIVERIES ROUTES
					{ path: 'deliveries', element: <Deliveries /> },
					{ path: 'addDelivery', element: <Deliveries /> },
				
					// REGISTER ROUTES
					{ path: 'registers', element: <Registers /> },
					{ path: 'registerTransactions/:id', element: <Transactions /> },
					{ path: 'viewTransaction/:transactionId/:registerId', element: <ViewTransaction /> },
				
					// ABOUT ROUTES
					{ path: 'about', element: <About /> },
				
					// SUPPORT ROUTES
					{ path: 'support', element: <Support /> },
					{ path: 'view_ticket_thread/:id', element: <ViewTicketThread /> },
					{ path: 'submit_ticket', element: <SubmitTicketForm/> },
				
					// TUTORIAL ROUTES
					{ path: 'tutorials', element: <Tutorials /> },
				
					// SETTINGS ROUTES
					{
						path: 'settings',
						element: <Settings />,
						children: [
							{ path: 'editStore', element: <EditStore /> },
							{ path: 'managePaymentTerms', element: <ManagePaymentTerms /> },
							{ path: 'manageCategories', element: <ManageCategories /> },
							{ path: 'managePackagingTypes', element: <ManagePackagingTypes /> },
						]
					},
				
					// ROOT ROUTES
					{ path: 'root', element: <Root /> },
					{ path: 'errorLogs', element: <ErrorLogs /> },
				]
				
			},
		]
	}
])


export default posRouter