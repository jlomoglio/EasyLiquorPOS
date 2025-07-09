// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"


// COMPONENT: VIEW VENDOR
export default function ViewVendor() {
     // STYLES
    const buttonWrapper = `
        ml-[0px] mt-[5px] mb-[-20px] flex flex-row gap-4
    `
    const vendorInfoWrapper = `
        w-[920px] flex flex-row mt-[30px] ml-[0px] border border-[#ccc] rounded-xl p-4 bg-white shadow-lg
    `
    const vendorInfoCol = `
        w-[380px] flex flex-col
    `
    const vendorFieldWrapper = `
        text-left flex flex-col mt-[15px]
    `
    const labelText = `
        text-[1.1rem] font-bold
    `
    const infoText = `
        text-[1.1rem]
    `


    // VENDOR ID
    const { id } = useParams()

    // NAVIGATE
    const navigate = useNavigate()

    // REDUX
    const dispatch = useDispatch()

    // STATE
    const [vendor, setVendor] = useState()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // HANDLE RETURING TO PREVIOUS VIEW
    function handleBackButton() {
        navigate('../vendors')
    }

    // HANDLE EDIT VENDOR BUTTON
    function handleEditVendorButton() {
        navigate(`../editVendor/${id}`)
    }

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Vendors"))
        dispatch(setMenuDisabled(false))
        handleGetVendor()
    }, [])

    
    // HANDLE GET VENDOR
    async function handleGetVendor() {
        try {
            const resData = await apiFetch(`/api/vendor/${id}`, {
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
        <ViewContainer>
            <ViewTitle title="Vendor Information" subtitle="Detailed information about your vendor." />

            <div className={buttonWrapper}>
                <ButtonSmall 
                    label="Back"
                    type="outline"
                    color="#111827"
                    onClick={handleBackButton}
                />

                <ButtonSmall 
                    label="Edit Vendor"
                    type="solid"
                    onClick={handleEditVendorButton}
                />
            </div>

            { vendor &&
                <div className={vendorInfoWrapper}>
                    <div className={vendorInfoCol}>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Vendor Name</span>
                            <span className={infoText}>{vendor.vendor_name}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Address</span>
                            <span className={infoText}>{vendor.address}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>City, State, Zip</span>
                            <span className={infoText}>{vendor.city}, {vendor.state} {vendor.zip}</span>
                        </div>
                    </div>
                    <div className={vendorInfoCol}>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Contact Person</span>
                            <span className={infoText}>{vendor.contact_person}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Phone</span>
                            <span className={infoText}>{vendor.phone}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Email</span>
                            <span className={infoText}>{vendor.email}</span>
                        </div>
                    </div>
                    <div className={vendorInfoCol}>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Vendor ID</span>
                            <span className={infoText}>{vendor.vendor_id}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Account Number</span>
                            <span className={infoText}>{vendor.account_number}</span>
                        </div>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Tax ID</span>
                            <span className={infoText}>{vendor.tax_id}</span>
                        </div>
                        
                    </div>
                    <div className={vendorInfoCol}>
                        <div className={vendorFieldWrapper}>
                            <span className={labelText}>Payment Terms</span>
                            <span className={infoText}>{vendor.payment_terms}</span>
                        </div>
                    </div>
                </div>
            }
        </ViewContainer>
    )
}