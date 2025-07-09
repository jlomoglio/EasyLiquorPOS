// APPLICATION DEPENDENCIES
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import Button from "../../components/ui/forms/Button"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import DynamicScrollTable from "../../components/ui/table/DynamicScrollTable"
import WarningModal from "../../components/ui/WarningModal"
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal"
import InputGroup from "../../components/ui/forms/InputGroup"


// COMPONENT: MANAGE CATEGORIES
export default function ManageCategories() {
    // STYLES
    // NAVIGATE
    const navigate = useNavigate()

    // REFS
    const categoryInputRef = useRef(null)
    const subcategoryInputRef = useRef(null)

    // REDUX
    const dispatch = useDispatch()


    // STATE: CATEGORES & SUBCATEGORIES
    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState([])
    const [subcategory, setSubcategory] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [subcategoryDisabled, setSubcategoryDisabled] = useState(true)
    const [hasSubcategories, setHasSubcategories] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState()
    const [categoryError, setCategoryError] = useState("")
    const [subcategoryError, setSubcategoryError] = useState("")
    

    // STATE: SHOW MODALS
    const [showWarningModal, setShowWarningModal] = useState(false)
    const [showAddSubcategoryWarningModal, setShowAddSubcategoryWarningModal] = useState(false)
    const [showDeleteCategoriesModal, setShowDeleteCategoriesModal] = useState(false)
    const [showDeleteSubcategoriesModal, setShowDeleteSubcategoriesModal] = useState(false)
    const [showDeleteCategoryWarningModal, setShowDeleteCategoryWarningModal] = useState(false)
    const [deleteCategory, setDeleteCategory] = useState(true)
    const [categoryId, setCategoryId] = useState('')
    const [deleteSubcategory, setDeleteSubcategory] = useState(true)
    const [subcategoryId, setSubcategoryId] = useState('')

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")
    

    // GET ALL CATEGORIES
    useEffect(() => {
        handleGetCategories()
        dispatch(setView("Inventory")) 
        dispatch(setMenuDisabled(false))
        setSubcategoryDisabled(true)
    }, [])

    /** ***************************************************************
     * CATEGORY CODE
     */

    // DEFINE THE CATEGORY COLUMNS TO SHOW
    const categoryColumns = [
        { key: "category", label: "Category", width: "470px" }
    ]

    // HANDLE GET ALL CATEGORIES
    async function handleGetCategories() {
        try {
            const resData = await apiFetch(`/api/categories`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setCategories(resData.categories)
    
            // ❌ REMOVE this line:
            // setCategoryId(resData.categories.id)
    
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE ADD CATEGORY
    async function handleAddCategory(category) {
        // Trim the input to prevent issues with spaces
        const trimmedCategory = category.trim()

        // Check if the category already exists (case-insensitive)
        const categoryExists = categories.some(cat => cat.category.toLowerCase() === trimmedCategory.toLowerCase())

        if (categoryExists) {
            // Show warning that category already exists
            setShowWarningModal(true)

            return // Stop execution if the category already exists
        }

        if (categoryInputRef.current.value === "") {
            return setCategoryError("This field is required")
        }

        setCategoryError("")

        try {
            await apiFetch(`/api/add_category`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify({ category: category }),
            })
               
            categoryInputRef.current.value = ""
            await handleGetCategories()
            setSubcategoryDisabled(true)
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE CATEGORY ACTIONS (DELETE)
    async function handleCategoryTableAction(action, id) {
        if (action === "delete") {
            setCategoryId(id)
    
            // Get actual category name from backend
            const nameRes = await apiFetch(`/api/category/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            const categoryName = nameRes.category
            setCategory(categoryName)
    
            // Use categoryName instead of category (which may not be updated yet)
            const res = await apiFetch(`/api/category_has_subcategories/${categoryName}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            if (res.hasSubcategories) {
                setHasSubcategories(true)
                setDeleteCategory(false)
                setShowDeleteCategoryWarningModal(true)
            } else {
                setHasSubcategories(false)
                setDeleteCategory(true)
                setShowDeleteCategoriesModal(true)
            }
        }
    }

    // HANDLE SELECT CATEGORY ROW
    function handleSelectCategoryRow(category) {
        // NEED TO CHECK IF IT HAS SUBCATEGORES FIRST
        handleCheckCategorHasSubcategories(category)
        setSelectedCategory(category) // ✅ new line to track it

        handleGetSubcategoriesByCategory(category)
        setCategory(category)
        setSubcategoryDisabled(false)
    }

    // HANDLE CHECK IF CATEGORY HAS SUBCATEGORIES
    async function handleCheckCategorHasSubcategories(category) {
        try {
            const resData = await apiFetch(`/api/category_has_subcategories/${category}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            if (resData.hasSubcategories) setHasSubcategories(true)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE GET CATEGORY NAME
    async function handleGetCategoryName(id) {
        try {
            const resData = await apiFetch(`/api/category/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setCategory(resData.category)
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE DELETE CATEGORY
    async function handleDeleteCategory() {
        setCategoryError("")
        try {
            const nameRes = await apiFetch(`/api/category/${categoryId}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            const categoryName = nameRes.category
    
            const check = await apiFetch(`/api/category_has_subcategories/${categoryName}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            if (check.hasSubcategories) {
                setShowDeleteCategoryWarningModal(true)
            } else {
                await apiFetch(`/api/delete_category/${categoryName}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
                })
    
                handleGetCategories()
                setSubcategoryDisabled(true)
                setCategory("")
                handleCloseDeleteCategoryModal()
                categoryInputRef.current.value = ""
            }
        } catch (err) {
            console.log("ERROR:", err.message)
        }
    }
    

    /** ***************************************************************
     * SUBCATEGORY CODE
     */

    // DEFINE THE SUBCATEGORY COLUMNS TO SHOW
    const subcategoryColumns = [
        { key: "subcategory", label: "Subategory", width: "590px" }
    ]

    // HANDLE ADD SUBCATEGORY
    async function handleAddSubcategory(subcategory) {
        try {
            if (subcategoryInputRef.current.value === "") {
                return setSubcategoryError("This field is required")
            }

            setSubcategoryError("")

            const resData = await apiFetch("/api/add_subcategory", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify({ category: category, subcategory: subcategory })
            })
    
            if (!resData.success) {
                setShowAddSubcategoryWarningModal(true)
            }
            else {
                // Regenrate the list
                handleGetSubcategoriesByCategory(category)

                // Clear the input
                subcategoryInputRef.current.value = ""
            }
        } 
        catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE GET SUBCATEGORIES FOR CATEGORY
    async function handleGetSubcategoriesByCategory(category) {
        try {
            const resData = await apiFetch(`/api/get_subcategories/${category}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setSubcategories(resData.subcategories)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    

    // HANDLE SUBCATEGORY ACTIONS (DELETE)
    function handleSubcategoryTableAction(action, id) {
        if (action === 'delete') {
            setShowDeleteSubcategoriesModal(true)
            setDeleteSubcategory(true)
            setDeleteCategory(false)

            // Need to get the name of the category from its id to display in the modal
            handleGetSubcategoryName(id)
            setSubcategoryId(id)
        }
    }

    // HANDLE GET SUBCATEGORY NAME
    async function handleGetSubcategoryName(id) {
        try {
            const resData = await apiFetch(`/api/subcategory/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
    
            setSubcategory(resData.subcategory)
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    // HANDLE DELETE SUBCATEGORY
    async function handleDeleteSubcategory() {
        setShowDeleteSubcategoriesModal(true)
        setSubcategoryError("")

        try {
            const response = await apiFetch(`/api/delete_subcategory/${subcategoryId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId }
            })
    
            handleGetSubcategoriesByCategory(category)
            setSubcategoryDisabled(false)
            handleCloseDeleteSubcategoryModal()
            setSubcategory('')
            
        } catch (err) {
            console.log("ERROR: " + err.message)
        }
    }

    


    /** ***************************************************************
     * MODAL CODE
     */
    // HANDEL CLOSE WARNING MODAL
    function handleCloseWarningModal() {
        setShowWarningModal(false)
        categoryInputRef.current.value = ""
    }

    // HANDEL CLOSE DELETE CATEGORY WARNING MODAL
    function handleCloseDeleteCategoryWarningModal() {
        setShowDeleteCategoryWarningModal(false)
        categoryInputRef.current.value = ""
    }

    // HANDLE COSE ADD SUBCATEGORY WARNING MODAL
    function handleCloseAddSubcategoryWarningModal() {
        setShowAddSubcategoryWarningModal(false)
        subcategoryInputRef.current.value = ""
    }


    // HANDEL CLOSE DELETE CATEGORY MODAL
    function handleCloseDeleteCategoryModal() {
        setShowDeleteCategoriesModal(false)
        setCategoryId('')
        setSubcategoryId('')
    }

    // HANDEL CLOSE DELETE SUBCATEGORY MODAL
    function handleCloseDeleteSubcategoryModal() {
        setShowDeleteSubcategoriesModal(false)
        setCategoryId('')
        setSubcategoryId('')
    }




    // RENDER JSX
    return (
        <>
        <ConfirmDeleteModal
            isOpen={showDeleteCategoriesModal}
            onClose={handleCloseDeleteCategoryModal}
            onConfirm={handleDeleteCategory}
            title="Delete Category"
            message={
                <>
                    Are you sure you want to delete category <strong>"{category}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <ConfirmDeleteModal
            isOpen={showDeleteSubcategoriesModal}
            onClose={handleCloseDeleteSubcategoryModal}
            onConfirm={handleDeleteSubcategory}
            title="Delete Subategory"
            message={
                <>
                    Are you sure you want to delete subcategory <strong>"{subcategory}"</strong>?<br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete"
            cancelLabel="Cancel"
        />

        <WarningModal
            isOpen={showWarningModal}
            onClose={handleCloseWarningModal}
            onConfirm={handleCloseWarningModal}
            title="Add Category"
            message={
                <>
                    Category already exists!
                </>
            }
            cancelLabel="Close"
        />

        <WarningModal
            isOpen={showAddSubcategoryWarningModal}
            onClose={handleCloseAddSubcategoryWarningModal}
            onConfirm={handleCloseAddSubcategoryWarningModal}
            title="Add Subategory"
            message={
                <>
                    Subategory already exists!
                </>
            }
            cancelLabel="Close"
        />

        <WarningModal
            isOpen={showDeleteCategoryWarningModal}
            onClose={handleCloseDeleteCategoryWarningModal}
            onConfirm={handleCloseAddSubcategoryWarningModal}
            title="Delete Category"
            message={
                <>
                    Category <strong>"{category}"</strong> has subcategories and can not be deleted.<br />
                    You need to first delete all of it's subcategories.
                </>
            }
            cancelLabel="Close"
        />
        
        <div className="flex flex-row w-[1100px]">
            {/* CATEGORIES */}
            <div className="flex flex-col absolute top-[160px] bottom-[40px]">
                <div className="flex flex-row relative h-[60px] w-[500px] mb-[10px]">
                    <div className="w-[430px] h-[60px] absolute top-[-50px] left-[-20px]">
                        <InputGroup
                            ref={categoryInputRef}
                            label="Categories"
                            type={"text"}
                            error={categoryError}
                            required
                        />
                    </div>
                    <div className="w-[100px] h-[60px] absolute top-0 right-[0px] pt-[2px]">
                        <Button
                            label="Add"
                            type={"solid"}
                            onClick={() => handleAddCategory(categoryInputRef.current.value)}
                        />
                    </div>
                </div>
                <DynamicScrollTable
                    data={categories}
                    columns={categoryColumns}
                    onAction={handleCategoryTableAction}
                    selectedRow={handleSelectCategoryRow}
                    selectedRowValue={selectedCategory} // <- new
                    actions={["delete"]}
                    tableWidth="500px" 
                    tableHeight="dynamic"
                    rowSelect
                    actionColHeaderPaddingRight="15px"
                />
            </div>

            {/* SUBCATEGORIES */}
            <div className="flex flex-col absolute top-[160px] bottom-[40px] left-[550px]">
                <div className="flex flex-row relative h-[60px] w-[500px] mb-[10px]">
                    <div className="w-[430px] h-[60px] absolute top-[-50px] left-[-20px]">
                        <InputGroup
                            ref={subcategoryInputRef}
                            label="Subategory"
                            type={"text"}
                            disabled={subcategoryDisabled}
                            error={subcategoryError}
                            required
                        />
                    </div>
                    <div className="w-[100px] h-[60px] absolute top-0 right-[0px] pt-[2px]">
                        <Button
                            label="Add"
                            type={"solid"}
                            onClick={() => handleAddSubcategory(subcategoryInputRef.current.value)}
                            disabled={subcategoryDisabled}
                        />
                    </div>
                </div>
                <DynamicScrollTable
                    data={subcategories}
                    columns={subcategoryColumns}
                    onAction={handleSubcategoryTableAction}
                    actions={["delete"]}
                    tableWidth="500px" 
                    tableHeight="dynamic"
                    message={
                        category 
                            ? (Array.isArray(subcategories) && subcategories.length > 0 ? "" : "Category has no subcategories")
                            : "Select a Category"
                    }
                    actionColHeaderPaddingRight="15px" 
                />
            </div>
        </div>
        </>
    )
}