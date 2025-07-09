// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'


// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal"
import Lightbox from "../../components/ui/Lightbox";
import SelectGroup from "../../components/ui/forms/SelectGroup";
import InputGroup from "../../components/ui/forms/InputGroup";
import ResetButton from "../../components/ui/forms/ResetButton";
import { Plus } from "lucide-react";

// COMPONENT: INVENTORY
export default function Inventory() {

    // NAVIAGE
    const navigate = useNavigate();

    // REDUX
    const dispatch = useDispatch()
    
    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // STATE
    const [originalProducts, setOriginalProducts] = useState([])
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState("");
    const [productId, setProductId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("name"); // Default to "name"
    const [searchByOptionsList, setSearchByOptionsList] = useState([]); // Dynamically updated options
    const [selectedSearchBy, setSelectedSearchBy] = useState(""); // Holds the selected Brand, Category, or Vendor
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
    

    // SEARCH FILTER OPTIONS
    const searchByOptions = [
        { label: "Product Name", value: "name" },
        { label: "Brand", value: "brand" },
        { label: "Category", value: "category" },
        { label: "Vendor", value: "vendor" }
    ];

    useEffect(() => {
        handleGetProducts();
        dispatch(setView("Inventory"));
        dispatch(setMenuDisabled(false));
    }, []);

    // HANDLE FETCH ALL PRODUCTS
    async function handleGetProducts() {
        try {
            const resData = await apiFetch(`/api/products`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            // ✅ Sort alphabetically by product name before setting state
            const sortedProducts = resData.products.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    
            setOriginalProducts(sortedProducts); // ✅ Store sorted list
            setProducts(sortedProducts);
        } catch (err) {
            console.log("ERROR: " + err.message);
        }
    }

    // HANDLE SEARCH TYPE CHANGE
    function handleSearchTypeChange(name, value) {
        setSearchBy(value);
        setSelectedSearchBy(""); // Reset the "Search By" dropdown
        setSearchTerm(""); // Clear search input
        setProducts(originalProducts); // Reset products
        
        if (value === "name") {
            setSearchByOptionsList([]); // Disable "Search By"
        } else {
            // Get unique values for Category, Brand, or Vendor
            const uniqueOptions = [...new Set(originalProducts.map(p => p[value]))]
                .filter(Boolean) // Remove empty values
                .map(option => ({ label: option, value: option }));
    
            setSearchByOptionsList(uniqueOptions);
        }
    }

    // HANDLE SEARCH BY SELECTION
    function handleSearchBySelection(name, value) {
        setSelectedSearchBy(value);
        setSearchTerm(""); // Reset search input
        
        // Filter products immediately when "Search By" is selected
        const filtered = originalProducts.filter(product => product[searchBy] === value);
        setProducts(filtered);
    }

    // HANDLE SEARCH CHANGE
    function handleSearchChange(name, value) {
        setSearchTerm(value);
    
        let filtered = originalProducts;
    
        // First filter by po/vendor/order date/stat (if selected)
        if (searchBy !== "name" && selectedSearchBy) {
            filtered = filtered.filter(p => {
                const field = p[searchBy] || "";
                return field === selectedSearchBy;
            });
        }
    
        // Then filter by product name
        if (value.trim()) {
            filtered = filtered.filter(p => {
                const field = p.name || "";
                return field.toLowerCase().includes(value.toLowerCase());
            });
        }
    
        setProducts(filtered);
    }

    // HANDLE RESET
    function resetInventory() {
        setSearchBy("name"); // ✅ Reset Search Type to Product Name
        setSearchTerm("");   // ✅ Clears input field
        setSelectedSearchBy(""); // ✅ Reset Search By dropdown
        setSearchByOptionsList([]); // ✅ Clear dynamic options
        setProducts(originalProducts); // ✅ Reset the table
    }


    // TABLE CONFIGURATION
    const inventoryColumns = [
        { key: "name", label: "Product Name", width: "320px" },
        { key: "brand", label: "Brand", width: "250px" },
        { key: "category", label: "Category", width: "150px" },
        { key: "quantity", label: "Qnty", width: "100px" },
        { key: "vendor", label: "Vendor", width: "300px" }
    ];

    // HANDLE TABLE ACTIONS
    async function handleTableAction(action, id) {
        if (action === "view") return navigate(`../viewProduct/${id}`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
        
        if (action === "delete") {
            await handleGetProductNameById(id); // wait for name to be set
            setShowConfirmDeleteModal(true);
        }
    }

    // HANDLE GET PRODUCT NAME BY ID
    async function handleGetProductNameById(id) {
        try {
            const resData = await apiFetch(`/api/product/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setProductName(resData.product.name)
            setProductId(id)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE DELETE PRODUCT
    async function handleDeleteProduct() {
        try {
           await apiFetch(`/api/delete_product/${productId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
    
            handleGetProducts()
            setProductName('')
            setProductId('')
            setShowConfirmDeleteModal(false)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE CLOSE MODAL
    function handleCloseModal() {
        setShowConfirmDeleteModal(false)
    }

    return (
        <>
            <ConfirmDeleteModal
                isOpen={showConfirmDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                message={
                    <>
                        Are you sure you want to delete product <strong>"{productName}"</strong>?<br />
                        This action cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />

            <ViewContainer>
                <ViewTitle title="Manage Inventory" subtitle="Organize, update, and oversee your inventory." />

                <div className="flex flex-row gap-4">
                    <ButtonSmall label="Add Product" Icon={Plus} type="solid" color="#4A90E2" onClick={() => navigate("../addProduct")} />
                </div>

                {/* SEARCH & FILTERS */}
                <div className="flex flex-row mb-[-15px] mt-[-20px] w-full relative">
                    <div className="w-[200px] ml-[-20px]">
                        <SelectGroup 
                            label="Search Type" 
                            options={searchByOptions} 
                            onChange={handleSearchTypeChange}
                            value={searchBy}  
                        />
                    </div>
                    <div className="w-[220px] ml-[-25px]">
                        <SelectGroup 
                            label="Search By" 
                            options={searchByOptionsList}
                            onChange={handleSearchBySelection} 
                            disabled={searchBy === "name" ? true : false} // Disable if searching by name
                        />
                    </div>
                    <div className="w-[400px] ml-[-25px] pt-[22px]">
                        <InputGroup 
                            label="" 
                            type="text" 
                            placeholder="Enter search text" 
                            onChange={handleSearchChange}
                            value={searchTerm || ""} 
                        />
                    </div>
                    <div className="w-[40px] h-[40px] ml-[-5px] mt-[53px]">
                        <ResetButton onClick={resetInventory} />
                    </div>
                    <div className="w-[440px] h-[40px] ml-[-5px] mt-[75px] text-right font-[500] absolute right-[10px]">
                        Total Products: {products.length}
                    </div>
                </div>

                {/* PRODUCTS TABLE */}
                <DynamicScrollTable
                    data={products}
                    columns={inventoryColumns}
                    onAction={handleTableAction}
                    actions={["view", "delete"]}
                    tableWidth="100%"
                    tableHeight="dynamic"
                />
                
                {/* SPACER */}
                <div className="h-[20px]"></div>
            </ViewContainer>
        </>
    );
}