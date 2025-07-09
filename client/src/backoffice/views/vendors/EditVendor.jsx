// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle";
import SuccessAlert from "../../components/ui/forms/SuccessAlert";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import InputGroup from "../../components/ui/forms/InputGroup";
import SelectGroup from "../../components/ui/forms/SelectGroup";
import TextareaGroup from "../../components/ui/forms/TextAreaGroup";
import StateGroup from "../../components/ui/forms/StateGroup";
import { toast } from 'react-hot-toast'

export default function EditVendor() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const initialFormState = {
        vendor_name: "", contact_person: "", phone: "", email: "",
        address: "", city: "", state: "", zip: "", vendor_id: "", 
        account_number: "", tax_id: "", payment_terms: "", notes: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({})
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successAlertMessage, setSuccessAlertMessage] = useState("");

    const paymentTermOptions = [
        { label: "Net 7 days", value: "Net 7 days" },
        { label: "Net 10 days", value: "Net 10 days" },
        { label: "Net 15 days", value: "Net 15 days" },
        { label: "Net 30 days", value: "Net 30 days" },
        { label: "Net 60 days", value: "Net 60 days" },
        { label: "Net 90 days", value: "Net 90 days" },
        { label: "Cash in Advance (CIA)", value: "CIA" },
        { label: "Cash on Delivery (COD)", value: "COD" },
        { label: "End of Month (EOM)", value: "EOM" },
        { label: "Monthly Credit Payment (MCP)", value: "MCP" }
    ];

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Edit Vendor"));
        dispatch(setMenuDisabled(false));
        fetchVendorData();
    }, []);

    async function fetchVendorData() {
        try {
            const resData = await apiFetch(`/api/vendor/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setFormData(resData.vendor);
        } catch (err) {
            console.error("Error fetching vendor data:", err.message);
        }
    }

    function handleInputChange(nameOrEvent, maybeValue) {
        let name, value;
    
        if (typeof nameOrEvent === "string") {
            // Custom component: onChange(name, value)
            name = nameOrEvent
            value = maybeValue
        } else {
            // Native input: onChange(event)
            name = nameOrEvent.target.name
            value = nameOrEvent.target.value
        }
    
        let formattedValue = value;
    
        if (name === "phone") {
            const numbers = value.replace(/\D/g, "").slice(0, 10);
            formattedValue =
                numbers.length > 6
                    ? `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
                    : numbers.length > 3
                    ? `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
                    : numbers.length > 0
                    ? `(${numbers}`
                    : "";
        }
    
        if (name === "zip") {
            formattedValue = value.replace(/\D/g, "").slice(0, 5);
        }
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: formattedValue,
        }));
    
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }
    

    function validateForm() {
        const newErrors = {};
        const requiredFields = [
            "vendor_name", "contact_person", "phone", "email",
            "address", "city", "state", "zip", "payment_terms"
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === "") {
                newErrors[field] = "This field is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await apiFetch(`/api/update_vendor/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify(formData),
            });

            toast.success("Vendor was successfully updated")

            setTimeout(() => {
                setShowSuccessAlert(false);
                navigate("../vendors");
            }, 2000);
        } catch (err) {
            console.error("Error updating vendor:", err.message);
        }
    }

    return (
        <>
            {showSuccessAlert && <SuccessAlert message={successAlertMessage} />}

            <ViewContainer>
                <ViewTitle title="Edit Vendor" subtitle="Update vendor details." />
                <div className="ml-[0px] mt-[5px]">
                    <ButtonSmall label="Back" onClick={() => navigate("../vendors")} />
                </div>

                <form onSubmit={handleFormSubmit} className="w-[1000px] ml-[-20px] mt-[0px]">
                    <div className="w-[800px] mb-[0] flex flex-row">
                        <div className="flex flex-row w-[400px] text-[1.3rem] font-[600] ml-[20px]">GENERAL INFORMATION</div>
                    </div>

                    <div className="flex flex-row mt-[-20px] w-[1260px]">
                        <div className="w-[420px] flex flex-col">
                            <InputGroup label="VENDOR NAME" name="vendor_name" space="15px" value={formData.vendor_name} onChange={handleInputChange} required error={errors.vendor_name} />
                            <InputGroup label="CONTACT PERSON" name="contact_person" type="text" space="15px" value={formData.contact_person} onChange={handleInputChange} required error={errors.contact_person} />
                            <InputGroup label="PHONE" name="phone" type="phone" space="15px" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
                            <InputGroup label="EMAIL" name="email" type="email" space="15px" value={formData.email} onChange={handleInputChange} required error={errors.email} />
                        </div>

                        <div className="w-[420px] flex flex-col">
                            <InputGroup label="ADDRESS" name="address" space="15px" value={formData.address} onChange={handleInputChange} required error={errors.address} />
                            <InputGroup label="CITY" name="city" type="text" space="15px" value={formData.city} onChange={handleInputChange} required error={errors.city} />
                            <StateGroup label="STATE" name="state" space="18px" value={formData.state} onChange={handleInputChange} required error={errors.state} />
                            <InputGroup label="ZIP CODE" name="zip" type="zip" space="15px" value={formData.zip} onChange={handleInputChange} required error={errors.zip} />
                        </div>

                        <div className="w-[420px] flex flex-col">
                            <div className="w-[400px] mt-[-10px] mb-[-20px] text-[1.3rem] text-left font-[600] ml-[20px]">ACCOUNT INFORMATION</div>
                            <InputGroup label="VENDOR ID" name="vendor_id" space="15px" value={formData.vendor_id} onChange={handleInputChange} />
                            <InputGroup label="ACCOUNT NUMBER" name="account_number" space="15px" value={formData.account_number} onChange={handleInputChange} />
                            <InputGroup label="TAX ID" name="tax_id" space="15px" value={formData.tax_id} onChange={handleInputChange} />
                            <SelectGroup label="PAYMENT TERMS" name="payment_terms" space="15px" value={formData.payment_terms || ""} onChange={handleInputChange} options={paymentTermOptions} required error={errors.payment_terms} />
                        </div>
                    </div>

                    <div className="flex flex-row mt-[5px] w-[1260px]">
                        <TextareaGroup label="NOTES" name="notes" space="100px" value={formData.notes} height="125px" onChange={handleInputChange} />
                    </div>

                    <div className="ml-[20px] mt-[30px] mb-[30px] flex flex-row gap-4">
                        <button type="submit" className="h-[40px] px-4 py-2 text-small text-white rounded flex items-center justify-center select-none cursor-pointer bg-blue-500 shadow-md font-[400]">
                            Update Vendor
                        </button>

                        <button type="button" className="h-[40px] px-4 py-2 text-small rounded flex items-center justify-center select-none cursor-pointer shadow-md bg-white text-[#5a5a5a] border border-[#ccc] font-[400]" onClick={() => setFormData(initialFormState)}>
                            Reset
                        </button>
                    </div>
                </form>
            </ViewContainer>
        </>
    );
}
