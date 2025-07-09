// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import SuccessAlert from "../../components/ui/forms/SuccessAlert";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import DynamicForm from "../../components/ui/forms/DynamicForm";
import { toast } from 'react-hot-toast'

// COMPONENT: ADD PRODUCT
export default function AddProduct() {
    // NAVIGATE
    const navigate = useNavigate();

    // REDUX
    const dispatch = useDispatch()


    // STATE: FORM DATA
    const [formData, setFormData] = useState({
        name: "", brand: "", category: "", subcategory: "",
        volume: "", cost: "", quantity: "", total_value: "", price_per_unit: "", vendor: "", notes: "", upc_outer: "", upc_inner: "", 
        unit: "", restock_level: "",
    });

    // STATE: OPTIONS (Vendor, Category, Subcategory)
    const [vendorOptions, setVendorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // FETCH CATEGORIES FROM API
    async function handleGetCategories() {
        try {
            const resData = await apiFetch(`/api/categories`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setCategoryOptions(resData.categories.map((cat) => ({ label: cat.category, value: cat.category })));
        } 
        catch (error) {
            console.error("❌ Error fetching categories:", error);
        }
    }

    // FETCH SUBCATEGORIES BASED ON CATEGORY
    async function handleGetSubcategories(category) {
        try {
            const resData = await apiFetch(`/api/subcategories/${category}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setSubcategoryOptions(resData.subcategories.map((sub) => ({ label: sub.subcategory, value: sub.subcategory })));
        } 
        catch (error) {
            console.error("❌ Error fetching subcategories:", error);
        }
    }

    // FETCH VENDORS FROM API
    async function handleGetVendors() {
        try {
            const resData = await apiFetch(`/api/vendors`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setVendorOptions(resData.vendors.map((vendor) => ({ label: vendor.vendor_name, value: vendor.vendor_name })));
        } 
        catch (error) {
            console.error("❌ Error fetching vendors:", error);
        }
    }

    // FETCH VENDORS FROM API
    async function handleGetUnits() {
        try {
            const resData = await apiFetch(`/api/units`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setUnitOptions(resData.units.map((unit) => ({ label: unit.unit, value: unit.unit })));
        } 
        catch (error) {
            console.error("❌ Error fetching vendors:", error);
        }
    }

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Inventory"))
        dispatch(setMenuDisabled(false))
        handleGetCategories()
        handleGetVendors()
        handleGetUnits()
    }, []);

    // LISTEN FOR COST OR QUANTITY CHANGES TO UPDATE TOTAL VALUE
    useEffect(() => {
        const cost = parseFloat(formData.cost) || 0;
        const quantity = parseFloat(formData.quantity) || 0;
        const total = (cost * quantity).toFixed(2);

        setFormData(prevFormData => ({
            ...prevFormData,
            total_value: total
        }));
    }, [formData.cost, formData.quantity]);

    // Listen for category changes and fetch subcategories automatically
    useEffect(() => {
        if (formData.category) {
            handleGetSubcategories(formData.category);
        }
    }, [formData.category]);

    // HANDLE INPUT CHANGE
    function handleInputChange(eventOrData) {
        if (eventOrData.target) {
            const { name, value } = eventOrData.target;
            if (!name) return;
            updateFormData(name, value);
        } else if (typeof eventOrData === "object" && !Array.isArray(eventOrData)) {
            setFormData(eventOrData);
        }
    }

    // UPDATE FORM DATA & FETCH SUBCATEGORIES IF CATEGORY CHANGES
    function updateFormData(name, value) {
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData, [name]: value };

            // Fetch subcategories when category changes
            if (name === "category") {
                updatedFormData.subcategory = ""; // Reset subcategory
                handleGetSubcategories(value);
            }

            // Ensure total_value updates when cost or quantity changes
            if (name === "cost" || name === "quantity") {
                const cost = parseFloat(updatedFormData.cost) || 0;
                const quantity = parseFloat(updatedFormData.quantity) || 0;
                const total = (cost * quantity).toFixed(2);

                updatedFormData.total_value = total;
            }

            return { ...updatedFormData };
        });
    }

     // FORM CONFIGURATION
     const formConfig = {
         columns: 3,
         fields: [
            { name: "name", label: "PRODUCT NAME", type: "text", required: true },
            { name: "cost", label: "PRODUCT COST", type: "currency", required: true },
            { name: "unit", label: "UNIT", type: "select", 
                options: [
                    { name: "", value: "", label: "Select a unit"},
                    ...unitOptions
                ],  
                required: true 
            },
             

            { name: "brand", label: "BRAND", type: "text", required: true },
            { name: "quantity", label: "QUANTITY", type: "numbers", required: true },
            { name: "upc_outer", label: "OUTER UPC", type: "text", required: true },
            

            { name: "volume", label: "VOLUME", type: "text", required: true },
            { name: "total_value", label: "TOTAL VALUE", type: "currency", required: true, disabled: true },
            { name: "upc_inner", label: "INNER UPC", type: "text", required: true },
            
            
            { name: "category", label: "CATEGORY", type: "select",
                options: [
                    { name: "", value: "", label: "Select a category"},
                    ...categoryOptions
                ], 
                space: "35px", required: true 
            },
            { name: "price_per_unit", label: "SALES PRICE", type: "currency", required: true },
            { name: "restock_level", label: "RESTOCK LEVEL", type: "numbers", required: true },
            
            
            
            { name: "subcategory", label: "SUBCATEGORY", type: "select", 
                options: [
                    { name: "", value: "", label: "Select a subcategory"},
                    ...subcategoryOptions
                ], 
                space: "20px", required: false 
            },
            { name: "vendor", label: "VENDOR", type: "select", 
                options: [
                    { name: "", value: "", label: "Select a vendor"},
                    ...vendorOptions
                ], 
                required: true 
            },
            { name: "notes", label: "NOTE", type: "text", },
            
        ],
    };

    // HANDLE FORM SUBMIT
    function handleFormSubmit(data) {
        const payload = {
            ...data
        }
    
        apiFetch("/api/add_product", {
            method: "POST",
            headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
            body: JSON.stringify(payload)
        })
        .then(resData => {
            if (resData.success) {
                toast.success("Product added successfully")
                navigate("../inventory")
            } else {
                throw new Error(resData.error || "Unknown error")
            }
        })
        .catch(err => {
            console.error("❌ Failed to add product:", err.message)
        })
    }
    
    return (
        <>
        <ViewContainer>
            <ViewTitle title="Add Product" subtitle="Detailed information about your product." />
            <div className="ml-[0px] mt-[5px]">
                <ButtonSmall label="Back" onClick={() => navigate("../inventory")} />
            </div>
            <div className="ml-[-20px]">
                <DynamicForm
                    formConfig={formConfig}
                    onSubmit={(formData) => handleFormSubmit(formData)}
                    onChange={handleInputChange}
                    formData={formData}
                    setFormData={setFormData}
                    showErrors={true}
                    buttonLable="Add Product"
                    buttonColor="#4A90E2"
                    buttonType="solid"
                />
            </div>
        </ViewContainer>
        </>
    );
}
