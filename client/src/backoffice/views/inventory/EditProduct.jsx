// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

// COMPONENT: EDIT PRODUCT
export default function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        name: "", brand: "", category: "", subcategory: "", volume: "", cost: "", 
        price_per_unit: "", total_value: "", vendor: "", notes: "", quantity: "", 
        unit: "", upc_outer: "", upc_inner: "", restock_level: "",
    });

    const [vendorOptions, setVendorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Inventory"));
        dispatch(setMenuDisabled(false));
        fetchProductData();
        fetchVendors();
        fetchUnits();
        fetchCategories();
    }, []);

    useEffect(() => {
        const cost = parseFloat(formData.cost) || 0;
        const quantity = parseFloat(formData.quantity) || 0;
        setFormData(prev => ({ ...prev, total_value: (cost * quantity).toFixed(2) }));
    }, [formData.cost, formData.quantity]);

    useEffect(() => {
        if (formData.category) fetchSubcategories(formData.category);
    }, [formData.category]);

    function handleInputChange(name, value) {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "category") {
                updated.subcategory = "";
                fetchSubcategories(value);
            }
            if (["cost", "quantity"].includes(name)) {
                const cost = parseFloat(updated.cost) || 0;
                const qty = parseFloat(updated.quantity) || 0;
                updated.total_value = (cost * qty).toFixed(2);
            }
            return updated;
        });
    }

    async function fetchProductData() {
        try {
            setIsLoading(true);
            const data = await apiFetch(`/api/product_with_categories/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            const { product, categories, subcategories } = data;

            setFormData({
                name: product.name || "",
                brand: product.brand || "",
                category: product.category || "",
                subcategory: product.subcategory || "",
                volume: product.volume || "",
                cost: product.cost || "",
                price_per_unit: product.price_per_unit || "",
                total_value: product.total_value || "",
                vendor: product.vendor || "",
                notes: product.notes || "",
                quantity: product.quantity || "",
                unit: product.unit || "",
                upc_outer: product.upc_outer || "",
                upc_inner: product.upc_inner || "",
                restock_level: product.restock_level || ""
            });

            setCategoryOptions(categories.map(c => ({ label: c.category, value: c.category })));
            setSubcategoryOptions(subcategories.map(s => ({ label: s.subcategory, value: s.subcategory })));
        } catch (err) {
            console.error("❌ ERROR fetching product:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchVendors() {
        try {
            const res = await apiFetch(`/api/vendors`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setVendorOptions(res.vendors.map(v => ({ label: v.vendor_name, value: v.vendor_name })));
        } catch (err) {
            console.error("❌ ERROR fetching vendors:", err);
        }
    }

    async function fetchUnits() {
        try {
            const resData = await apiFetch(`/api/units`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setUnitOptions([
                { label: "Select a unit", value: "" },
                ...resData.units.map((unit) => ({
                  label: unit.unit,
                  value: unit.unit
                }))
              ])
        } catch (err) {
            console.error("❌ ERROR fetching units:", err);
        }
    }

    async function fetchCategories() {
        try {
            const res = await apiFetch(`/api/categories`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setCategoryOptions(res.categories.map(c => ({ label: c.category, value: c.category })));
        } catch (err) {
            console.error("❌ ERROR fetching categories:", err);
        }
    }

    async function fetchSubcategories(category) {
        try {
            const res = await apiFetch(`/api/subcategories/${category}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setSubcategoryOptions(res.subcategories.map(s => ({ label: s.subcategory, value: s.subcategory })));
        } catch (err) {
            console.error("❌ ERROR fetching subcategories:", err);
        }
    }

    const formConfig = {
        columns: 3,
        fields: [
            { name: "name", label: "PRODUCT NAME", type: "text", required: true },
            { name: "cost", label: "PRODUCT COST", type: "currency", required: true },
            { name: "unit", label: "UNIT", type: "select", options: [...unitOptions], required: true },

            { name: "brand", label: "BRAND", type: "text", required: true },
            { name: "quantity", label: "QUANTITY", type: "numbers", required: true },
            { name: "upc_outer", label: "OUTER UPC", type: "text", required: true },

            { name: "volume", label: "VOLUME", type: "text", required: true },
            { name: "total_value", label: "TOTAL VALUE", type: "currency", required: true, disabled: true },
            { name: "upc_inner", label: "INNER UPC", type: "text", required: true },

            { name: "category", label: "CATEGORY", type: "select", options: [...categoryOptions], space: "35px", required: true },
            { name: "price_per_unit", label: "SALES PRICE", type: "currency", required: true },
            { name: "restock_level", label: "RESTOCK LEVEL", type: "numbers", required: true },
            

            { name: "subcategory", label: "SUBCATEGORY", type: "select", options: [...subcategoryOptions], space: "20px", required: false },
            { name: "vendor", label: "VENDOR", type: "select", options: [{ label: "Select a vendor", value: "" }, ...vendorOptions], required: true },
            { name: "notes", label: "NOTE", type: "text" },
        ]
    };

    async function handleFormSubmit() {
        try {
            const response = await apiFetch(`/api/update_product/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify(formData)
            });

            toast.success("Product updated successfully")
            setTimeout(() => navigate("../inventory"), 2000);
        } 
        catch (err) {
            console.error("❌ ERROR updating product:", err.message);
        }
    }

    return (
        <>
            <ViewContainer>
                <ViewTitle title="Edit Product" subtitle="Update information about your product." />
                <div className="ml-[0px] mt-[5px]">
                    <ButtonSmall label="Back" onClick={() => navigate("../inventory")} />
                </div>
                <div className="ml-[-20px]">
                    {!isLoading && (
                        <DynamicForm
                            formConfig={formConfig}
                            onSubmit={handleFormSubmit}
                            onChange={handleInputChange}
                            formData={formData}
                            setFormData={setFormData}
                            showErrors={true}
                            buttonLable="Update Product"
                            buttonColor="#4A90E2"
                            buttonType="solid"
                        />
                    )}
                </div>
            </ViewContainer>
        </>
    );
}
