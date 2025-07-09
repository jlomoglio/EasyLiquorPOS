// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useNavigate } from "react-router-dom"
import { apiFetch } from './../../../utils/api'

// LUCIDE ICONS DEPENDENCIES
import { Trash2 } from "lucide-react"

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import Button from "../../components/ui/forms/Button"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import SelectGroup from "../../components/ui/forms/SelectGroup"
import InputGroup from "../../components/ui/forms/InputGroup"
import NumberInputGroup from "../../components/ui/forms/NumberInputGroup"
import { toast } from 'react-hot-toast'


// COMPONENT: ADD PURCHASE ORDERS
export default function AddPurchaseOrder() {
    // STYLES
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600] mt-[30px]
        flex flex-row justify-start font-[Roboto] ml-[15px]
    `

    // NAVIGATE
    const navigate = useNavigate();

    // REDUX
    const dispatch = useDispatch();


    // STATE
    const [vendorId, setVendorId] = useState(null)
    const [vendorName, setVendorName] = useState("")
    const [poNumber, setPoNumber] = useState("");
    const [poID, setPoID] = useState("");
    const [products, setProducts] = useState([
        {
          id: Date.now(),
          product: "",
          quantity: 1,
          unit: "",
          productOptions: [],
        },
    ])
    const [vendorOptions, setVendorOptions] = useState([])
    const [productOptions, setProductOptions] = useState([])
    const [unitsOptions, setUnitsOption] = useState([])

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")


    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Orders"));
        dispatch(setMenuDisabled(false))

        handleGetPoNumber()
        handleGetVendors()
        handleGetUnits()
    }, [])


    // HANDLE GET STORE DATA
    async function handleGetStoreData() {
        try {
            const data = await apiFetch("/api/store", {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            return data.store;
        } 
        catch (err) {
            console.error("❌ Store fetch error:", err.message);
            return null;
        }
    }

    // HANDLE GET SHIPPING COST
    async function handleGetVendorShippingCost(vendorName) {
        try {
            const res = await apiFetch(`/api/vendors`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            const vendor = res.vendors.find(v => v.vendor_name === vendorName)
    
            if (!vendor) throw new Error("[ERR-20250407-W8X1GP] Invalid vendor")
    
            return vendor.shipping_cost || 0
        } catch (err) {
            console.error("❌ Vendor shipping cost fetch error:", err.message)
            return 0
        }
    }

    // HANDLE GET PRODUCT DETAILS
    async function handleGetProductDetails(productId) {
        try {
            const data = await apiFetch(`/api/product/${productId}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            return {
                name: `${data.product.brand} ${data.product.name}`,
                cost: data.product.cost,
                volume: data.product.volume
            };
        } 
        catch (err) {
            console.error("❌ Product fetch error:", err.message);
            return { cost: 0, volume: "" };
        }
    }

    // HANDEL GET PO NUMBER
    async function handleGetPoNumber() {
        try {
            const data = await apiFetch(`/api/get_po_number`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setPoNumber(data.po_number);
            setPoID(data.id)
        } 
        catch (err) {
            console.error("Failed to fetch PO number", err);
        }
    }

    // HANDLE GET VENDORS
    async function handleGetVendors() {
        try {
            const resData = await apiFetch(`/api/vendors_with_products`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            // Sort vendors alphabetically by vendor_name
            const sortedVendors = resData.vendors.sort((a, b) => 
                a.vendor_name.localeCompare(b.vendor_name)
            );
    
            setVendorOptions(
                sortedVendors.map((t) => ({
                    value: t.id,
                    label: t.vendor_name
                }))
            )
        } 
        catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    // HANDLE GET PACKAGING TYPES
    async function handleGetUnits() {
        try {
            const resData = await apiFetch(`/api/units`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            // Sort types alphabetically
            const sortedUnits = resData.units.sort((a, b) => 
                a.unit.localeCompare(b.unit)
            );
    
            setUnitsOption(
                sortedUnits.map((t) => ({
                  value: t.unit,
                  label: t.unit
                }))
            )
        } 
        catch (err) {
            console.log("ERROR: " + err.message);
        }
    }


    // HANDLE GET PRODUCTS BY CATEGORY
    async function handleGetProductsByVendor(vendorName) {
        try {
            if (!vendorName) return
    
            const resData = await apiFetch(`/api/products_by_vendor/${vendorName}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            if (resData.products.length === 0) {
                toast.error("This vendor has no products in inventory.")
            }
    
            const productOptions = resData.products.map((product) => ({
                value: product.id,
                label: product.name,
            }))
    
            setProductOptions(productOptions)
    
            setProducts((prev) =>
                prev.map((row) => ({
                    ...row,
                    productOptions
                }))
            )
        } catch (err) {
            console.error("Error fetching products by vendor:", err)
        }
    }

    // HANDLE VENDOR CHAGE
    function handleReset() {
        setProducts([
            {
                id: Date.now(),
                product: "",
                quantity: 1,
                unit: "",
                productOptions: [],
            },
        ])
    }

    // HANDLE PRODUCT CHANGE
    function handleProductChange(index, field, value) {
        setProducts((prev) => {
            if (index < 0 || index >= prev.length) return prev;
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return updated;
        });
    }
      
    // HANDLE ADDING A NEW ROW
    function handleAddRow() {
        setProducts((prev) => [
            ...prev,
            {
                id: Date.now(),
                product: "",
                quantity: 1,
                unit: "",
                productOptions: productOptions || [],
            },
        ])
    }
    
    // HANDLE REMOVING A ROW
    function handleRemoveRow(id) {
        setProducts((prevRows) => prevRows.filter(row => row.id !== id));
    }

    // VALIDATE FORM
    function validateForm() {
        const errors = {}
    
        if (!vendorName || vendorName.trim() === "") {
            errors.vendor = "Vendor is required"
        }
    
        if (products.length === 0) {
            errors.products = "At least one product is required"
        } 
        else {
            products.forEach((row, i) => {
                if (!row.product) errors[`product_${i}`] = "Product is required"
                if (!row.quantity || parseInt(row.quantity) <= 0) errors[`quantity_${i}`] = "Quantity must be > 0"
                if (!row.unit) errors[`unit_${i}`] = "Unit is required"
            })
        }
    
        if (Object.keys(errors).length > 0) {
            toast.error("Please complete all required fields")
            return false
        }
    
        return true
    }

    // HANDLE FORM SUBMISSION
    async function handleFormSubmit(e) {
        e.preventDefault()
    
        if (!validateForm()) return
    
        try {
            const store = await handleGetStoreData()
            const taxRate = parseFloat(store.sales_tax || 0)
            const vendorShipping = await handleGetVendorShippingCost(vendorName)
    
            let subtotal = 0
            const enrichedItems = []
    
            for (const row of products) {
                const productDetails = await handleGetProductDetails(row.product)
                const cost = parseFloat(productDetails.cost || 0)
                const qty = parseInt(row.quantity)
                const total = cost * qty
    
                enrichedItems.push({
                    product_id: row.product,
                    qty,
                    unit: row.unit,
                    name: productDetails.name,
                    volume: productDetails.volume,
                    cost,
                    total
                })
    
                subtotal += total
            }
    
            const taxAmount = subtotal * (taxRate / 100)
            const grandTotal = subtotal + taxAmount + vendorShipping
    
            const submissionData = {
                po_number: poNumber,
                vendor_name: vendorName, // ✅ using vendor_name
                store_id: store.id,
                store_owner: `${store.fname} ${store.lname}` || "Unknown",
                date: new Date().toISOString().slice(0, 10),
                subtotal,
                tax: taxAmount,
                shipping: vendorShipping,
                total: grandTotal,
                items: enrichedItems
            }
    
            const data = await apiFetch("/api/generate_purchase_order", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify(submissionData)
            })
    
            toast.success("The purchase order was successfully generated")
            setTimeout(() => navigate(`../purchaseOrder/${data.id}`), 2000)
        } 
        catch (err) {
            console.error("❌ ERROR:", err.message)
            toast.error("Something went wrong submitting the purchase order.")
        }
    }
    


    return (
        <>
        <ViewContainer>
            {/* View Title */}
            <ViewTitle title="New Purchase Order" subtitle="Here's what's happening with your store today." />
            <div className="ml-[0px] mt-[5px]">
                <ButtonSmall label="Back" onClick={() => navigate("../orders")} />
            </div>
            <div className="flex flex-col ml-[10px]">
                <div className="flex flex-row mt-[-20px]">
                    <div className="w-[250px] ml-[-25px]">
                        <InputGroup 
                            label="PO#" 
                            name="vendor_name"
                            value={poNumber}
                            onChange={null} 
                            disabled
                        />
                    </div>
                    <div className="w-[570px] ml-[-20px]">
                        <SelectGroup 
                            label="VENDOR" 
                            name="vendor_name" 
                            selectText="Select a vendor" 
                            options={vendorOptions} 
                            
                            onChange={async (name, value) => {
                                setVendorId(value)
                            
                                try {
                                    const res = await apiFetch(`/api/vendor/${value}`, {
                                        headers: {
                                            'x-tenant-id': tenantId
                                        }
                                    })
                                    const name = res.vendor.vendor_name
                                    setVendorName(name) // ✅ set correct name
                                    handleGetProductsByVendor(name)
                                } catch (err) {
                                    console.error("Failed to fetch vendor name:", err)
                                }
                            
                                // Reset product rows
                                setProducts([
                                    {
                                        id: Date.now(),
                                        product: "",
                                        quantity: 1,
                                        unit: "",
                                        productOptions: [],
                                    },
                                ])
                            }}
                            required 
                        />
                    </div>
                </div>

                <div className="flex flex-row mt-[-15px] ml-[10px] mb-[-40px]">
                    <div className="w-[530px] ml-[-25px]">
                        <div className={labelText}>PRODUCT *</div>
                    </div>
                    <div className="w-[130px] ml-[-20px]">
                        <div className={labelText}>QNTY *</div>
                    </div>
                    <div className="w-[240px] ml-[-40px]">
                        <div className={labelText}>UNIT *</div>
                    </div>
                </div> 
                
                <div className="flex flex-col mt-[10px]">
                    {products.map((row, index) => (
                        <div key={row.id} className={index > 0 ? "mt-[-50px]" : "mt-[0px]"}>
                            <div className="flex flex-row">
                                {/* Product */}
                                <div className="w-[530px] ml-[-25px]">
                                    <SelectGroup
                                        name="product"
                                        selectText="Select a product"
                                        options={row.productOptions || []}
                                        value={row.product || ""}
                                        onChange={(name, value) => handleProductChange(index, "product", value)}
                                        disabled={!vendorName || !row.productOptions || row.productOptions.length === 0}
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="w-[110px] ml-[-20px]">
                                    <NumberInputGroup
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="Quantity"
                                        value={row.quantity}
                                        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                        className="w-full h-[40px] px-3 border border-gray-300 rounded-lg"
                                        disabled={!row.product}
                                    />
                                </div>

                                {/* Unit */}
                                <div className="w-[200px] ml-[-20px]">
                                    <SelectGroup
                                        name="unit"
                                        selectText="Select a unit"
                                        options={unitsOptions}
                                        value={row.unit || ""}
                                        onChange={(name, value) => handleProductChange(index, "unit", value)}
                                        disabled={!row.product}
                                    />
                                </div>

                                {/* Remove Button */}
                                {index > 0 && 
                                    <div onClick={() => handleRemoveRow(row.id)}>
                                        <Trash2 
                                            size={28} 
                                            strokeWidth={2}
                                            style={{
                                                fontSize: "1.6rem",
                                                color: "#5a5a5a",
                                                cursor: "pointer",
                                                marginLeft: "-10px",
                                                marginTop: "40px"
                                            }}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    ))}
                </div>
                
                <div 
                    className=" h-[30px] w-[150px] border-none text-[1.1rem] text-[blue] bg-[transparent] mt-[-20px] ml-[0px] cursor-pointer" 
                    onClick={handleAddRow}
                >
                        + Add Another
                </div>
            </div>
            
            <div className="flex gap-4 mt-[20px] ml-[10px]">
                <Button type="solid" label="Generate Purchase Order" onClick={handleFormSubmit} />
                <Button type="outline" label="Reset" onClick={handleReset} />
            </div>
        </ViewContainer>
        </>
    )
}