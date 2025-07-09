// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice";
import { useNavigate } from "react-router-dom";

// COMPONENT DEPENDENCIES
import ViewTitle from "../../components/ui/ViewTitle";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import Button from "../../components/ui/forms/Button";
import InputGroup from "../../components/ui/forms/InputGroup";
import DateGroup from './../../components/ui/forms/DateGroup';
import SelectGroup from "../../components/ui/forms/SelectGroup";
import TextareaGroup from "../../components/ui/forms/TextAreaGroup";

// COMPONENT: ADD DELIVERY
export default function AddDelivery() {
    const wrapper = `
        absolute top-0 left-0 right-0 bottom-0
        text-[#5a5a5a] p-[20px] flex flex-col items-start ml-[20px]
        overflow-y-scroll h-[calc(100vh-50px)] w-[calc(100vw-110px)] pb-[50px]
    `;

    // NAVIAGTE
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // REDUX
    const tenantId = useSelector((state) => state.tenant.tenantId)


    // STATE
    const [formData, setFormData] = useState({
        delivery_number: "",
        vendor: "",
        delivery_date: "",
        items_delivered: "",
        status: "",
        notes: "",
        attachment: ""
    });

    const [poOptions, setPoOptions] = useState([])
    const [vendorOptions, setVendorOptions] = useState([])
    const [poNumber, setPoNumber] = useState('')
    const [vendorName, setVendorName] = useState('')
    const [vendorId, setVendorId] = useState('')
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
    const [actualDeliveryDate, setActualDeliveryDate] = useState('')
    const [status, setStatus] = useState('')
    const [receivedItems, setReceivedItems] = useState([])
    const [note, setNote] = useState('')
    const [attachedFiles, setAttachedFiles] = useState([])
    

    useEffect(() => {
        dispatch(setView("Deliveries"));
        dispatch(setMenuDisabled(false));
        fetchVendors();
    }, []);

    async function fetchVendors() {
        if (!tenantId) return console.warn("❌ Missing tenant ID")

        try {
            const data = await apiFetch(`/api/vendors`)
            
            const options = data.vendors.map(v => ({ label: v.vendor_name, value: v.vendor_name }))
            setVendorOptions(options);
        } 
        catch (err) {
            console.log("Error fetching vendors:", err.message);
        }
    }

    function handleInputChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleFormSubmit(data) {
        console.log("🟢 Submitted Delivery:", data);
        // POST to backend...
    }

    const statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Partial', value: 'Partial' },
        { label: 'Canceled', value: 'PCanceled' }
    ]

    return (
        <>
        <div className={wrapper}>
            <ViewTitle title="Schedule Delivery" subtitle="Record or schedule an upcoming delivery." />
            <div className="ml-[0px] mt-[5px]">
                <ButtonSmall label="Back" onClick={() => navigate("../deliveries")} />
            </div>

            <div className="ml-[-20px] flex flex-row gap-6">
                <div className="w-[400px] flex flex-col">
                    <SelectGroup 
                        label="PO#"
                        name="po_number"
                        options={[]}
                        onChange={(name, value) => setPoNumber(value)}
                        value={poNumber}
                        required 
                    />
                    <SelectGroup 
                        label="VENDOR"
                        name="vendor_name"
                        options={vendorOptions}
                        onChange={(name, value) => setVendorName(value)} 
                        value={vendorName}
                        required 
                    />
                    <DateGroup
                        label="EXPECTED DELIVERY"
                        name="expected_deliver_date"
                        onChange={(name, value) => setExpectedDeliveryDate(value)}
                        value={expectedDeliveryDate}
                        required
                    />
                    <DateGroup
                        label="ACTUAL DELIVERY"
                        name="actual_deliver_date"
                        onChange={(name, value) => setActualDeliveryDate(value)}
                        value={actualDeliveryDate}
                    />
                </div>
                <div className="w-[400px] flex flex-col">
                    <SelectGroup 
                        label="STATUS"
                        name="status"
                        options={statusOptions}
                        onChange={(name, value) => setStatus(value)} 
                        value={status}
                        required 
                    />
                </div>
            </div>
        </div>
        </>
    );
}
