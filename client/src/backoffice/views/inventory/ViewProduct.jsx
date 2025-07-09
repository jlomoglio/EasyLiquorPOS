// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import ViewContainer from "../../components/ui/ViewContainer"


// COMPONENT: VIEW PRODUCT
export default function ViewProduct() {
     // STYLES
    const buttonWrapper = `
        ml-[0px] mt-[5px] mb-[-20px] flex flex-row gap-4
    `
    const card = `
        border border-[#ccc] rounded-xl p-4 bg-white shadow-lg w-[420px]
    `
    const cardVendor = `
        border border-[#ccc] rounded-xl p-4 bg-white shadow-lg w-[420px]
    `
    const cardTitle = `
        text-sm font-semibold text-gray-600 uppercase mb-2
    `
    const productName = `
        text-lg font-bold text-gray-800
    `
    const grid = `
        grid grid-cols-2 gap-y-1 gap-x-0 text-gray-700 text-md
    `
    const label = `
        text-md text-gray-600 font-[500]
    `
    const value = `
        text-md text-gray-600
    `


    // PRODUCT ID
    const { id } = useParams()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()


    // STATE
    const [product, setProduct] = useState()
    const [vendor, setVendor] = useState()

    // HANDLE RETURING TO PREVIOUS VIEW
    function handleBackButton() {
        navigate('../inventory')
    }

    // HANDLE EDIT PRODUCT BUTTON
    function handleEditProductButton() {
        navigate(`../editProduct/${id}`)
    }

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Inventory"))
        dispatch(setMenuDisabled(false))
        handleGetProduct(id)
    }, [])

    
    // HANDLE GET PRODUCT
    async function handleGetProduct(product_id) {
         try {
            const resData = await apiFetch(`/api/product/${product_id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setProduct(resData.product)
            handleGetVendorInformation(resData.product.vendor)
            
        } 
        catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    // HANDLE GET VENDOR INFORMATION
    async function handleGetVendorInformation(vendorName) {
        try {
            const resData = await apiFetch(`/api/vendor_by_name/${encodeURIComponent(vendorName)}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setVendor(resData.vendor)
        } 
        catch (err) {
            console.log("ERROR: " + err.message);
        }
    }
    
    // RENDER JSX
    return (
        <>
        <ViewContainer>
            <ViewTitle title="Product Information" subtitle="Detailed information about your product." />

            <div className={buttonWrapper}>
                <ButtonSmall 
                    label="Back"
                    type="outline"
                    color="#111827"
                    onClick={handleBackButton}
                />

                <ButtonSmall 
                    label="Edit Product"
                    type="solid"
                    color="#4A90E2"
                    onClick={handleEditProductButton}
                />
            </div>

            { product &&
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                    {/* Product Core Info */}
                    <div className={card}>
                        <div className={cardTitle}>Product</div>
                        <div className={productName}>{product.name}</div>
                        
                        <div className={grid}>
                            <div className={label}>Brand:</div>
                            <div className={value}>{product.brand}</div>

                            <div className={label}>Volume:</div>
                            <div className={value}>{product.volume}</div>

                            <div className={label}>Unit:</div>
                            <div className={value}>{product.unit}</div>

                            <div className={label}>Quantity:</div>
                            <div className={value}>{product.quantity}</div>

                            <div className={label}>Category:</div>
                            <div className={value}>{product.category}</div>

                            <div className={label}>Subategory:</div>
                            <div className={value}>{product.subcategory}</div>

                            <div className={label}>Added:</div>
                            <div className={value}>{product.date_added}</div>
                        </div>
                    </div>
                
                    {/* Pricing + Stock */}
                    <div className={card}>
                        <div className={cardTitle}>Pricing</div>

                        <div className={grid}>
                            <div className={label}>Cost:</div>
                            <div className={value}>${product.cost}</div>

                            <div className={label}>Price/Unit:</div>
                            <div className={value}>${product.price_per_unit}</div>

                            <div className={label}>Total Value:</div>
                            <div className={value}>${product.total_value}</div>
                        </div>
                    </div>
                
                    {/* Vendor + Volume */}
                    <div className={cardVendor}>
                        {vendor && (
                            <>
                            <div className={cardTitle}>Vendor Info</div>

                            <div className={grid}>
                                <div className={label}>Vendor:</div>
                                <div className={value}>{product.vendor}</div>

                                <div className={label}>Contact Person:</div>
                                <div className={value}>{vendor.contact_person}</div>

                                <div className={label}>Phone:</div>
                                <div className={value}>{vendor.phone}</div>

                                <div className={label}>Email:</div>
                                <br />
                                <div className={value}>{vendor.email}</div>
                            </div>
                            </>
                        )}
                    </div>
                                
                    {/* UPCs */}
                    <div className={card}>
                        <div className={cardTitle}>UPC Codes</div>
                        <div className={grid}>
                            <div className={label}>Outer:</div>
                            <div className={value}>{product.upc_outer}</div>

                            <div className={label}>Inner:</div>
                            <div className={value}>{product.upc_inner}</div>
                        </div>
                    </div>
                
                    {/* Meta */}
                    <div className={card}>
                        <div className={cardTitle}>Notes</div>
                        
                        <div className={value}>{product.notes}</div>
                    </div>
                 </div>
            }
        </ViewContainer>
        </>
    )
}