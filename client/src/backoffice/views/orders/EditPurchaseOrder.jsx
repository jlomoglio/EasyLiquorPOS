// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from './../../../utils/api'

// LUCIDE ICONS DEPENDENCIES
import { Trash2 } from "lucide-react"

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import Button from "../../components/ui/forms/Button"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import SelectGroup from "../../components/ui/forms/SelectGroup"
import NumberInputGroup from "../../components/ui/forms/NumberInputGroup"
import { toast } from 'react-hot-toast'


// COMPONENT: EDIT PURCHASE ORDERS
export default function EditPurchaseOrder() {
    // STYLES
    const wrapper = `
        absolute top-0 left-0 right-0 bottom-0
        text-[#5a5a5a] p-[20px] flex flex-col items-start ml-[20px]
        overflow-y-scroll h-[calc(100vh-50px)] w-[calc(100vw-110px)] pb-[50px]
    `
    const labelText = `
        text-[#5a5a5] text-[1rem] font-[600] mt-[30px]
        flex flex-row justify-start font-[Roboto] ml-[15px]
    `



    // NAVIGATE
    const navigate = useNavigate();

    const { id } = useParams()

    // REDUX
    const dispatch = useDispatch()


    // STATE
    const [vendorId, setVendorId] = useState(null)
    const [poNumber, setPoNumber] = useState("")
    const [products, setProducts] = useState([
        {
          id: Date.now(),
          category: "",
          subcategory: "",
          subcategoryOptions: [], // ✅ This was missing
          product: "",
          quantity: 1,
          unit: "",
          productOptions: [],
        },
    ])
    const [vendorName, setVendorName] = useState('')
    const [categoryOptions, setCategoryOptions] = useState([])
    const [unitsOptions, setUnitsOptions] = useState([])

    // LOCALSTORAGE
	  const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Orders"));
        dispatch(setMenuDisabled(false))

        if (id) {
            handleGetPurchaseOrder(id)
        }
        
        handleGetCategories()
        handleGetUnits()
    }, [])

    
    // HANDLE GET PURCHASE ORDER
    async function handleGetPurchaseOrder() {
        try {
          const data = await apiFetch(`/api/purchase_order/${id}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })

          if (!data || data.error) throw new Error(data?.error || "Failed to load purchase order")
    
          setPoNumber(data.po_number)
          setVendorName(data.vendor_name)
          setVendorId(data.vendor_id)
    
          const enrichedItems = await Promise.all(
            (data.items || []).map(async (item, index) => {
              const category = item.category
              const subcategory = item.subcategory
    
              const [subData, productData] = await Promise.all([
                apiFetch(`/api/subcategories/${category}`, {
                  headers: {
                      'x-tenant-id': tenantId
                  }
              }),
                apiFetch(`/api/products_by_subcategory/${category}/${subcategory}?vendor_id=${data.vendor_id}`, {
                  headers: {
                      'x-tenant-id': tenantId
                  }
              })
              ])
    
              return {
                id: Date.now() + index,
                category,
                subcategory,
                product: item.product_id,
                quantity: item.qty,
                unit: item.unit,
                subcategoryOptions: (subData.subcategories || []).map(s => ({ value: s.subcategory, label: s.subcategory })),
                productOptions: (productData.products || []).map(p => ({ value: p.id, label: p.name }))
              }
            })
          )
    
          setProducts(enrichedItems)
        } catch (err) {
          console.error("❌ Failed to load PO:", err.message)
        }
      }
    
      async function handleGetCategories() {
        try {
          const res = await apiFetch("/api/categories", {
            headers: {
                'x-tenant-id': tenantId
            }
        })
          const formatted = res.categories?.map(c => ({ label: c.category, value: c.category })) || []
          setCategoryOptions(formatted)
        } catch (err) {
          console.error("❌ Category fetch error:", err.message)
        }
      }
    
      async function handleGetUnits() {
        try {
          const res = await apiFetch("/api/units", {
            headers: {
                'x-tenant-id': tenantId
            }
        })
          const formatted = res.units?.map(u => ({ label: u.unit, value: u.unit })) || []
          setUnitsOptions(formatted)
        } catch (err) {
          console.error("❌ Units fetch error:", err.message)
        }
      }
    
      function handleProductChange(index, field, value) {
        setProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
      }
    
      function handleCategoryChange(index, value) {
        handleProductChange(index, "category", value)
        handleProductChange(index, "subcategory", "")
        handleProductChange(index, "product", "")
        handleProductChange(index, "subcategoryOptions", [])
        handleProductChange(index, "productOptions", [])
        loadSubcategories(value, index)
        loadProductsByCategory(value, index)
      }
    
      function handleSubcategoryChange(index, value) {
        const category = products[index]?.category
        handleProductChange(index, "subcategory", value)
        handleProductChange(index, "product", "")
        loadProductsBySubcategory(category, value, index)
      }
    
      async function loadSubcategories(category, index) {
        try {
          const res = await apiFetch(`/api/subcategories/${category}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
          const options = res.subcategories?.map(s => ({ label: s.subcategory, value: s.subcategory })) || []
          handleProductChange(index, "subcategoryOptions", options)
        } catch (err) {
          console.error("❌ Subcategory load error:", err.message)
        }
      }
    
      async function loadProductsByCategory(category, index) {
        try {
          const res = await apiFetch(`/api/products_by_category/${category}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
          const options = res.products?.map(p => ({ label: p.name, value: p.id })) || []
          handleProductChange(index, "productOptions", options)
        } catch (err) {
          console.error("❌ Product load error:", err.message)
        }
      }
    
      async function loadProductsBySubcategory(category, subcategory, index) {
        try {
          const res = await apiFetch(`/api/products_by_subcategory/${category}/${subcategory}?vendor_id=${vendorId}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
          const options = res.products?.map(p => ({ label: p.name, value: p.id })) || []
          handleProductChange(index, "productOptions", options)
        } catch (err) {
          console.error("❌ Subcategory product load error:", err.message)
        }
      }
    
      function handleAddRow() {
        setProducts(prev => [
          ...prev,
          {
            id: Date.now(),
            category: "",
            subcategory: "",
            subcategoryOptions: [],
            product: "",
            quantity: 1,
            unit: "",
            productOptions: []
          }
        ])
      }
    
      function handleRemoveRow(id) {
        setProducts(prev => prev.filter(row => row.id !== id))
      }
    
      async function handleFormSubmit(e) {
        e.preventDefault()
        try {
          const store = await apiFetch("/api/store", {
            headers: {
                'x-tenant-id': tenantId
            }
        }).then(r => r.store)
          const shipping = await apiFetch(`/api/vendor/${vendorId}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        }).then(r => r.vendor.shipping_cost || 0)
    
          const items = await Promise.all(products.map(async row => {
            const product = await apiFetch(`/api/product/${row.product}`, {
              headers: {
                  'x-tenant-id': tenantId
              }
          })
            const name = `${product.product.brand || ""} ${product.product.name || ""}`.trim() || "Unnamed Product"
            const cost = parseFloat(product.product.cost || 0)
            const qty = parseInt(row.quantity)
            const total = cost * qty
            return {
              product_id: row.product,
              qty,
              unit: row.unit,
              name,
              volume: product.product.volume,
              cost,
              total
            }
          }))
    
          const subtotal = items.reduce((acc, curr) => acc + curr.total, 0)
          const tax = subtotal * ((parseFloat(store.sales_tax) || 0) / 100)
          const total = subtotal + tax + shipping
    
          const payload = {
            vendor_id: vendorId,
            subtotal,
            tax,
            shipping,
            total,
            items
          }
    
          await apiFetch(`/api/update_purchase_order/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
            body: JSON.stringify(payload)
          })
    
          toast.success("Purchase Order was successfully updated")
          setTimeout(() => navigate("../orders"), 1500)
        } catch (err) {
          console.error("❌ Submit error:", err.message)
          toast.error("Failed to update purchase order")
        }
      }
    

    // RENDER JSX
    return (
        <>
        <ViewContainer>
            {/* View Title */}
            <ViewTitle title="Edit Purchase Order" subtitle="Here's what's happening with your store today." />
            <div className="ml-[0px] mt-[5px]">
                <ButtonSmall label="Back" onClick={() => navigate("../orders")} />
            </div>
            <div className="flex flex-col ml-[10px]">
                <div className="flex flex-col mt-[20px]">
                    <div className="w-[250px] ml-[-5px]">
                        <h1 className="text-[1.7rem]">{poNumber}</h1>
                    </div>
                    <div className="w-[570px] ml-[-5px]">
                        <span className="text-[1.5rem]">{vendorName || ""}</span>
                    </div>
                </div>

                <div className="flex flex-row mt-[0px] ml-[-10px] mb-[-40px]">
                    <div className="w-[250px] ml-[-10px]">
                        <div className={labelText}>CATEGORY *</div>
                    </div>
                    <div className="w-[300px] ml-[-20px]">
                        <div className={labelText}>SUBCATEGORY *</div>
                    </div>
                    <div className="w-[300px] ml-[-25px]">
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
                    {products.map((row, index) => {return (
                            <div key={row.id} className={index > 0 ? "mt-[-50px]" : "mt-[0px]"}>
                                <div className="flex flex-row">
                                    {/* Category */}
                                    <div className="w-[250px] ml-[-25px]">
                                        <SelectGroup
                                            name="category"
                                            selectText="Select a category"
                                            options={categoryOptions}
                                            value={row.category || ""}
                                            onChange={(name, value) => {
                                                handleCategoryChange(index, value);
                                                loadSubcategories(value, index);
                                                
                                                // Reset all dependent fields
                                                handleProductChange(index, "subcategory", "");
                                                handleProductChange(index, "product", "");
                                                handleProductChange(index, "quantity", 1); // Default to 1, or "" if you prefer
                                                handleProductChange(index, "unit", "");
                                            }}
                                        />
                                    </div>
                                
                                    {/* Subcategory */}
                                    <div className="w-[300px] ml-[-20px]">
                                        <SelectGroup
                                            name="subcategory"
                                            selectText="Select a subcategory"
                                            options={row.subcategoryOptions || []}
                                            value={row.subcategory || ""}
                                            onChange={(name, value) => {
                                                handleSubcategoryChange(index, value);
                                                loadProductsBySubcategory(value, index)
                                            }}
                                        />
                                    </div>

                                    {/* Product */}
                                    <div className="w-[300px] ml-[-25px]">
                                        <SelectGroup
                                            name="product"
                                            selectText="Select a product"
                                            options={row.productOptions || []}
                                            value={row.product || ""}
                                            onChange={(name, value) => handleProductChange(index, "product", value)}
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="w-[110px] ml-[-20px]">
                                        <NumberInputGroup
                                            type="number"
                                            min="1"
                                            placeholder="Quantity"
                                            value={row.quantity}
                                            onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                            className="w-full h-[40px] px-3 border border-gray-300 rounded-lg"
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
                        )
                    })}
                </div>
                
                <div 
                    className=" h-[30px] w-[150px] border-none text-[1.1rem] text-[blue] bg-[transparent] mt-[-20px] ml-[0px] cursor-pointer" 
                    onClick={handleAddRow}
                >
                        + Add Another
                </div>
            </div>
            
            <div className="flex gap-4 mt-[20px] ml-[10px]">
                <Button type="solid" label="Update Purchase Order" onClick={handleFormSubmit} />
                <Button type="outline" label="Reset" />
            </div>
        </ViewContainer>
        </>
    )
}