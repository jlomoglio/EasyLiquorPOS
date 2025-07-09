// APPLICATION DEPENDENCIES
import { useState, useEffect, useCallback } from "react"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { File, ChevronDown, Calendar, Trash } from "lucide-react";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import FileInputGroup from './../../components/ui/forms/FileInputGroup';

// COMPONENT: DELIVERY DETAILS MODAL
export default function DeliveryDetailsModal({ isOpen, onClose, onComplete, onSave, date, delivery, deliveries = [] }) {
    // STYLES
    const dialog = `
        fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-hidden
    `

    // DETAILS OBJECT FOR EXTENED PROPS
    const details = delivery?.extendedProps || {}

    // DETECT FOLLOW-UP STATUS
    const hasFollowUp = deliveries.some(
        (d) => d.extendedProps.parent_delivery_id === delivery?.id
    );
    const isFollowUp = details.parent_delivery_id !== null && details.parent_delivery_id !== undefined;
    
    // RECEIVED QNTY OPTION NUMBERS
    const receivedQtyCount = Array.from({ length: 51 }, (_, i) => i)


    // STATE
    const [form, setForm] = useState({
        vendor_id: "",
        vendor_name: "",
        poNumber: "",
        startDate: "",
        startTime: "",
        endTime: "",
        reminder: "",
        repeat: "",
        status: details.status || "Scheduled",
        notes: "",
        attachments: [],
    })
    const [items, setItems] = useState([]);
    const [itemStatuses, setItemStatuses] = useState([]);
    const [fileExists, setFileExists] = useState(false)
    const [receivedQuantities, setReceivedQuantities] = useState([])

    // COMPLETED STATUS
    const isCompleted = form.status === "Completed"

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SETS UP GETTING THE DATA AND SETTING THE FORM WHEN THE MODAL IS OPENED
    useEffect(() => {
        if (isOpen && delivery?.id) {
            const fetchDeliveryDetails = async () => {
                try {
                    const data = await apiFetch(`/api/delivery/${delivery.id}`, {
                        headers: {
                            'x-tenant-id': tenantId
                        }
                    })
    
                    setForm({
                        vendor_id: data.vendor_id || "",
                        vendor: data.vendor_name || "",
                        poNumber: data.po_number || "",
                        startDate: data.delivery_date || "",
                        startTime: data.start_time || "",
                        endTime: data.end_time || "",
                        reminder: data.reminder || "",
                        repeat: data.repeat || "",
                        status: data.status || "Scheduled",
                        notes: data.notes || "",
                        attachments: data.attachments || [],
                    });
    
                    const allItems = data.items || []

                    setItems(allItems)
                    setItemStatuses(allItems.map(item => item.delivery_status || ""))
                    setReceivedQuantities(allItems.map(item => item.received_qty || ""))
                } catch (err) {
                    console.error("❌ Error loading delivery details:", err);
                }
            };
    
            fetchDeliveryDetails();
        }
    }, [isOpen, delivery]);
    
    


    // GET OVERALL DELIVERY STATUS
    function getOverallDeliveryStatus(itemStatuses = []) {
        const total = itemStatuses.length;
        const count = {
            completed: 0,
            partial: 0,
            backordered: 0,
            canceled: 0,
            out_of_stock: 0,
        };
    
        itemStatuses.forEach(status => {
        switch (status.toLowerCase()) {
            case "completed":
                count.delivered++;
                break;
            case "partial":
                count.partial++;
                break;
            case "backordered":
                count.backordered++;
                break;
            case "canceled":
                count.canceled++;
                break;
            case "out of stock":
                count.out_of_stock++;
                break;
        }
        });
    
        // STEP 3: Derive overall delivery status based on item statuses
    
        // 🔴 Entire delivery canceled
        if (count.canceled === total) return "Canceled";
    
        // ⚠️ All items out of stock or canceled (functionally same as above)
        if ((count.canceled + count.out_of_stock) === total) return "Canceled";
    
        // 🟡 At least one item is partially received
        if (count.partial > 0) return "Partial";
    
        // 🟡 At least one backordered item (even if others are delivered)
        if (count.backordered > 0) return "Partial";
    
        // 🟢 All items delivered
        if (count.delivered === total) return "Delivered";
    
        // 🔵 Scheduled or no updates yet
        return "Scheduled";
    }

    // HANDLE ITEMS STATUS CHANGE
    function handleItemStatusChange(index, value) {
        const updated = [...itemStatuses];
        updated[index] = value;
        setItemStatuses(updated);
    
        const newStatus = getOverallDeliveryStatus(updated);
        setForm(prev => ({ ...prev, status: newStatus }));
    }

    // HANDLE RECEIVED QUANTITY CHANGE
    function handleReceivedQtyChange(index, value) {
        const updated = [...receivedQuantities];
        updated[index] = value;
        setReceivedQuantities(updated);
    
        // Optional logic: auto-set status if received < ordered
        const qtyOrdered = items[index]?.qty || 0;
        const received = parseInt(value, 10);
    
        let status = "";
        if (received === 0) status = "Canceled";
        else if (received < qtyOrdered) status = "Backordered";
        else if (received >= qtyOrdered) status = "Delivered";
    
        handleItemStatusChange(index, status); // reuse existing logic
    }
    
    // HANDLE CHAGE
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // HANDLE SAVE OR COMPLETE
    async function handleSaveOrComplete(action = "save") {
        console.log("🚚 Submitting delivery with values:", {
            po_number: form.poNumber,
            delivery_date: form.startDate,
            tenant_id: localStorage.getItem("tenant_id")
        })
        try {
            const resData = await apiFetch("/api/update_delivery_details", {
                method: "POST",
                headers: { "Content-Type": "application/json",'x-tenant-id': tenantId },
                body: JSON.stringify({
                    po_number: form.poNumber,
                    vendor_id: form.vendor_id,
                    vendor_name: form.vendor_name,
                    delivery_date: form.startDate,
                    start_time: form.startTime,
                    end_time: form.endTime,
                    status: form.status,
                    notes: form.notes,
                    attachments: form.attachments, // TODO: wire if uploading files
                    repeat: form.repeat,
                    reminder: form.reminder,
                    items,
                    itemStatuses,
                    receivedQuantities,
                }),

            })
    
            onSave(form);
            onClose();
        } 
        catch (err) {
            console.error(`❌ Failed to ${action} delivery:`, err.message);
        }
    }
    
    // HANDLE FILE UPLOAD
    const handleFileUpload = useCallback((file) => {
        if (form.attachments.some(att => att.fileName === file.name)) {
            setFileExists(true)
            return false;
        }
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("po_number", form.poNumber);
    
        return apiFetch(`/api/upload_attachment?po_number=${form.poNumber}`, {
            method: "POST",
            headers: {
                'x-tenant-id': tenantId
            },
            body: formData,
            isMultipart: true,
            parseJson: true // still want parsed response
        })
        .then(data => {
            if (data?.fileName) {
                setForm(prev => {
                    if (prev.attachments.some(att => att.fileName === data.fileName)) {
                        return prev;
                    }
                    return {
                        ...prev,
                        attachments: [
                            ...prev.attachments,
                            {
                                fileName: data.fileName,
                                path: data.path.replace(/\\/g, "/")
                            }
                        ]
                    };
                });
                return true;
            }
            return false;
        })
        .catch(err => {
            console.error("❌ File upload failed:", err);
            return false;
        });
    }, [form.poNumber, form.attachments]);
    

    // HANDLE DELETE FILE
    function handleDeleteFile(fileName) {
        // Remove from UI
        setForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter(att => att.fileName !== fileName)
        }));
    
        // Optional: tell server to delete
        apiFetch(`/api/delete_attachment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
            body: JSON.stringify({
                po_number: form.poNumber,
                file_name: fileName,
            }),
        })
        .then(data => {
            if (!data.success) {
                console.warn("⚠️ Server didn't delete file:", data.message);
            }
        })
        .catch(err => console.error("❌ Server delete failed:", err));
    }

    // RENDER JSX
    return (
        <Dialog open={isOpen} onClose={onClose} className={dialog} style={{ border: '0 !important', outlineStyle: 'none'}}>
            <div className="w-[1390px] h-[730px] box-border overflow-hidden rounded-xl shadow-lg border border-gray-300 bg-white">
                <DialogPanel className="w-full h-full p-4 box-border overflow-hidden">
                    <DialogTitle className="text-lg font-semibold text-[#5a5a5a]">Delivery Details</DialogTitle>
                    
                    <div className="border-t border-t-[#ccc] w-full mt-[5px]"></div>

                    {/* TOP ROW */}
                    <div className="flex flex-col justify-start items-left mb-4 mt-2">
                            {/* PURCHASE ORDER NUMBER */}
                            <div className="text-[1.4rem] text-[#5a5a5a] font-[600]">{form.poNumber}</div>

                            {/* VENDOR */}
                            <div className="text-[1.2rem] text-[#5a5a5a] font-[600]">{form.vendor}</div>

                            {/* DELEIVERY STATUS */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-gray-500">Status:</span>
                                <span className={`
                                    text-xs font-bold px-2 py-1 rounded
                                    ${form.status === "Completed" ? "bg-green-500 text-white" : ""}
                                    ${form.status === "Partial" ? "bg-yellow-400 text-black" : ""}
                                    ${form.status === "Scheduled" ? "bg-blue-400 text-white" : ""}
                                    ${form.status === "Canceled" ? "bg-red-400 text-white" : ""}
                                `}>
                                    {form.status}
                                </span>

                                {hasFollowUp && (
                                    <div className="text-xs text-yellow-600 mt-1">
                                        This delivery has a follow-up scheduled.
                                    </div>
                                )}

                                {isFollowUp && (
                                    <div className="text-xs text-blue-600 mt-1">
                                        This delivery is a follow-up to 
                                        <button
                                            className="text-blue-600 underline ml-1"
                                            onClick={() => {
                                                const parent = deliveries.find(d => d.id === details.parent_delivery_id);
                                                if (parent) {
                                                    onClose();
                                                    setTimeout(() => {
                                                        onSave(parent);
                                                    }, 200);
                                                }
                                            }}
                                        >
                                            #{details.po_number} (Original)
                                        </button>
                                    </div>
                                )}

                                {!form.startDate && (
                                    <div className="text-xs text-red-600 mt-1">
                                        This follow-up delivery has not been scheduled yet.
                                    </div>
                                )}

                                {/* Backorder label */}
                                {details.backorder_sequence && (
                                    <div className="text-xs text-indigo-600 mt-1">
                                        Backorder #{details.backorder_sequence}
                                    </div>
                                )}
                            </div>
                    </div>

                    {/* MIDDLE ROW */}
                    <div className="flex flex-row gap-2 relative">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col">
                            <div className="space-y-3">
                                {/* DATE | TIME | REPEAT | REMINDER */}
                                <div className="flex gap-2">
                                    {/* DATE */}
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={form.startDate}
                                            onChange={handleChange}
                                            className="w-[260px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                                focus:outline-none outline-none focus:border-[#60A5FA]"
                                            disabled={isCompleted}
                                        />
                                        <Calendar 
                                            size={15} 
                                            strokeWidth={1} 
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "20px",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                color: "#5a5a5a",
                                                fontSize: "0.8rem"
                                            }}
                                        />
                                    </div>
                                    
                                    {/* START TIME */}
                                    <div className="relative">
                                        <select
                                            name="startTime"
                                            value={form.startTime || ""}
                                            onChange={handleChange}
                                            className="w-[160px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] appearance-none focus:outline-none outline-none focus:border-[#60A5FA]"
                                            disabled={isCompleted}
                                        >
                                            <option value="6:00 AM">6:00 AM</option>
                                            <option value="6:30 AM">6:30 AM</option>
                                            <option value="7:00 AM">7:00 AM</option>
                                            <option value="7:30 AM">7:30 AM</option>
                                            <option value="8:00 AM">8:00 AM</option>
                                            <option value="8:30 AM">8:30 AM</option>
                                            <option value="9:00 AM">9:00 AM</option>
                                            <option value="9:30 AM">6:30 AM</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                            <option value="10:30 AM">10:30 AM</option>
                                            <option value="11:00 AM">11:00 AM</option>
                                            <option value="11:30 AM">11:30 AM</option>
                                            <option value="12:00 PM">12:00 PM</option>
                                            <option value="12:30 AM">12:30 PM</option>
                                            <option value="1:00 PM">1:00 PM</option>
                                            <option value="1:30 PM">1:30 PM</option>
                                            <option value="2:00 PM">2:00 PM</option>
                                            <option value="2:30 PM">2:30 PM</option>
                                            <option value="3:00 PM">3:00 PM</option>
                                            <option value="3:30 PM">3:30 PM</option>
                                            <option value="4:00 PM">4:00 PM</option>
                                            <option value="4:30 PM">4:30 PM</option>
                                            <option value="5:00 PM">5:00 PM</option>
                                            <option value="5:30 PM">5:30 PM</option>
                                            <option value="6:00 PM">6:00 PM</option>
                                            <option value="6:30 PM">6:30 PM</option>
                                        </select>
                                        <ChevronDown 
                                            size={15} 
                                            strokeWidth={3} 
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "20px",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                color: "#4b5563", // Tailwind `text-gray-600`
                                                fontSize: "0.8rem"
                                            }}
                                        />
                                    </div>
                                    
                                    {/* END TIME */}
                                    <div className="relative">
                                        <select
                                            name="endTime"
                                            value={form.endTime || ""}
                                            onChange={handleChange}
                                            className="w-[160px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] appearance-none 
                                                focus:outline-none outline-none focus:border-[#60A5FA]"
                                            disabled={isCompleted}
                                        >
                                            <option value="6:00 AM">6:00 AM</option>
                                            <option value="6:30 AM">6:30 AM</option>
                                            <option value="7:00 AM">7:00 AM</option>
                                            <option value="7:30 AM">7:30 AM</option>
                                            <option value="8:00 AM">8:00 AM</option>
                                            <option value="8:30 AM">8:30 AM</option>
                                            <option value="9:00 AM">9:00 AM</option>
                                            <option value="9:30 AM">6:30 AM</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                            <option value="10:30 AM">10:30 AM</option>
                                            <option value="11:00 AM">11:00 AM</option>
                                            <option value="11:30 AM">11:30 AM</option>
                                            <option value="12:00 PM">12:00 PM</option>
                                            <option value="12:30 AM">12:30 PM</option>
                                            <option value="1:00 PM">1:00 PM</option>
                                            <option value="1:30 PM">1:30 PM</option>
                                            <option value="2:00 PM">2:00 PM</option>
                                            <option value="2:30 PM">2:30 PM</option>
                                            <option value="3:00 PM">3:00 PM</option>
                                            <option value="3:30 PM">3:30 PM</option>
                                            <option value="4:00 PM">4:00 PM</option>
                                            <option value="4:30 PM">4:30 PM</option>
                                            <option value="5:00 PM">5:00 PM</option>
                                            <option value="5:30 PM">5:30 PM</option>
                                            <option value="6:00 PM">6:00 PM</option>
                                            <option value="6:30 PM">6:30 PM</option>
                                        </select>
                                        <ChevronDown 
                                            size={15} 
                                            strokeWidth={3} 
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "20px",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                color: "#4b5563", // Tailwind `text-gray-600`
                                                fontSize: "0.8rem"
                                            }}
                                        />
                                    </div>
                                    
                                    {/* REPEAT */}
                                    <div className="relative">
                                        <select
                                            name="repeat"
                                            value={form.repeat || ""}
                                            onChange={handleChange}
                                            className="w-[216px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                                appearance-none focus:outline-none outline-none focus:border-[#60A5FA]"
                                            disabled={isCompleted}
                                        >
                                            <option value="">Don't repeat</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <ChevronDown 
                                            size={15} 
                                            strokeWidth={3} 
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "20px",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                color: "#4b5563", // Tailwind `text-gray-600`
                                                fontSize: "0.8rem"
                                            }}
                                        />
                                    </div>

                                    {/* REMINDER */}
                                    <div className="relative">
                                        <select
                                            name="reminder"
                                            value={form.reminder || ""}
                                            onChange={handleChange}
                                            className="w-[210px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                                appearance-none focus:outline-none outline-none focus:border-[#60A5FA]"
                                            disabled={isCompleted}
                                        >
                                            <option value="">Don't remind me</option>
                                            <option value="At time of delivery">At time of delivery</option>
                                            <option value="15 minutes before">15 minutes before</option>
                                            <option value="30 minutes before">30 minutes before</option>
                                            <option value="1 hour before">1 hour before</option>
                                            <option value="2 hour before">2 hour before</option>
                                            <option value="12 hours before">12 hours before</option>
                                            <option value="1 day before">1 day before</option>
                                            <option value="1 week before">1 week before</option>
                                        </select>
                                        <ChevronDown 
                                            size={15} 
                                            strokeWidth={3} 
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "20px",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                color: "#4b5563", // Tailwind `text-gray-600`
                                                fontSize: "0.8rem"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* PRODUCTS ORDERED LIST */}
                                <div className="border border-[#ccc] rounded w-[1040px] h-[400px]">
                                    <div className="bg-blue-500 flex flex-row text-white text-sm font-[500] h-[30px] uppercase">
                                        <div className="w-[70px] py-2 px-3">Qty</div>
                                        <div className="w-[95px] py-2 px-2">Unit</div>
                                        <div className="w-[600px] py-2 px-2">Product</div>
                                        <div className="w-[140px] py-2 px-1">Unit Price</div>
                                        <div className="w-[130px] py-2 px-0">Total</div>
                                        <div className="w-[110px] py-2 px-2 text-left mr-[25px]">Recv Qty</div>
                                        <div className="w-[130px] py-2 px-0 text-left mr-[20px]">Status</div>
                                    </div>
                                    <div className="h-[368px] overflow-y-scroll">
                                        {items.map((item, index) => (
                                            <div 
                                                key={`${item.id}-${index}`} 
                                                className={`
                                                    text-[#5a5a5a] text-sm flex flex-row h-[48px] border-b border-b-gray-300
                                                    ${["Canceled", "Delivered", "Credited"].includes(itemStatuses[index]) ? "bg-gray-100" : ""}
                                                `}
                                            >
                                                <div className="w-[60px] py-3 px-3 border-r border-r-gray-300 flex flex-row gap-2">
                                                    {item.qty}
                                                </div>
                                                <div className="w-[80px] py-3 px-2 border-r border-r-gray-300">{item.unit}</div>
                                                <div className="w-[452px] py-3 px-2 border-r border-r-gray-300">{item.name}</div>
                                                <div className="w-[110px] py-3 px-2 border-r border-r-gray-300">${item.cost.toFixed(2)}</div>
                                                <div className="w-[110px] py-3 px-2 border-r border-r-gray-300">${item.total.toFixed(2)}</div>
                                                <div className="w-[80px] py-2 border-r border-r-gray-300 relative">
                                                    <select
                                                        value={receivedQuantities[index] || "0"}
                                                        onChange={(e) => handleReceivedQtyChange(index, e.target.value)}
                                                        className={`w-full h-full text-sm border focus:outline-none outline-none 
                                                            appearance-none focus:border-white border-white px-3 
                                                            ${["Canceled", "Delivered", "Credited"].includes(itemStatuses[index]) ? "text-[#ccc]" : "text-[#5a5a5a]"}
                                                        `}
                                                        disabled={
                                                            itemStatuses[index] === "Canceled" ||
                                                            itemStatuses[index] === "Delivered" ||
                                                            isCompleted
                                                        }
                                                    >
                                                        {receivedQtyCount.map((num) => (
                                                            <option key={num} value={num}>{num}</option>
                                                        ))}
                                                        
                                                    </select>
                                                    <ChevronDown 
                                                        size={15} 
                                                        strokeWidth={3} 
                                                        style={{
                                                            position: "absolute",
                                                            right: "15px",
                                                            top: "23px",
                                                            transform: "translateY(-50%)",
                                                            pointerEvents: "none",
                                                            color: ["Canceled", "Delivered", "Credited"].includes(itemStatuses[index]) ? "#ccc" : "#4b5563",
                                                            fontSize: "0.8rem"
                                                        }}
                                                    />
                                                </div>
                                                <div className="w-[130px] py-2 border-r border-r-gray-300 relative">
                                                    <select
                                                        name="itemStatus"
                                                        value={itemStatuses[index] || ""}
                                                        onChange={(e) => handleItemStatusChange(index, e.target.value)}
                                                        className={`w-full h-full text-sm border focus:outline-none outline-none 
                                                            appearance-none focus:border-white border-white px-3 
                                                            ${["Canceled", "Delivered", "Credited"].includes(itemStatuses[index]) ? "text-[#ccc]" : "text-[#5a5a5a]"}
                                                        `}
                                                        disabled={
                                                            itemStatuses[index] === "Canceled" ||
                                                            itemStatuses[index] === "Delivered" ||
                                                            isCompleted
                                                        }
                                                    >
                                                        <option value="">Select option</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Partial">Partial</option>
                                                        <option value="Backordered">Backordered</option>
                                                        <option value="Out of stock">Out of stock</option>
                                                        <option value="Canceled">Canceled</option>
                                                        <option value="Credited">Credited</option>
                                                    </select>
                                                    <ChevronDown 
                                                        size={15} 
                                                        strokeWidth={3} 
                                                        style={{
                                                            position: "absolute",
                                                            right: "15px",
                                                            top: "23px",
                                                            transform: "translateY(-50%)",
                                                            pointerEvents: "none",
                                                            color: ["Canceled", "Delivered", "Credited"].includes(itemStatuses[index]) ? "#ccc" : "#4b5563",
                                                            fontSize: "0.8rem"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="rounded border border-[#ccc] w-[300px] h-[453px] absolute right-[5px] top-0">
                            {/* ATTACHEMENTS */}
                            <div className="bg-blue-500 flex flex-row text-white text-sm font-[500] h-[30px] uppercase py-2 px-3">
                                Attchments
                            </div>
                            <div className="h-[180px] overflow-y-scroll overflow-x-hidden">
                                {form.attachments.map((file, idx) => (
                                    <div key={`${file.fileName}-${idx}`} className="flex flex-row gap-2 w-[340px] h-[40px] border-b border-b-[#ccc] text-[#5a5a5a] py-2 px-3">
                                        <div className="w-[230px] flex flex-row gap-2">
                                            <File color="#9CA3AF" size="20px" disabled={isCompleted} />
                                            {!isCompleted ? (
                                                <a
                                                    href={`http://localhost:5000/${file.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600 mt-[1px] text-sm"
                                                >
                                                    {file.fileName}
                                                </a>
                                            ) : 
                                                file.fileName
                                            }
                                                
                                        </div>
                                        {!isCompleted && (
                                            <div className="w-[40px] mr-[5px] cursor-pointer" onClick={() => handleDeleteFile(file.fileName)}>
                                                <Trash color="#9CA3AF" size="20px" />
                                            </div>
                                        )}
                                            
                                    </div>
                                ))}
                            </div>

                            {/* NOTES */}
                            <div className="bg-blue-500 flex flex-row text-white text-sm font-[500] h-[30px] uppercase py-2 px-3">
                                Notes
                            </div>
                            <textarea 
                                name="notes"
                                className="text-[#5a5a5a] w-full h-[190px] focus:outline-none outline-none p-2 resize-none"
                                value={form.notes}
                                onChange={handleChange}
                                disabled={isCompleted}
                            />
                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="flex flex-row w-full">
                        {/* UPLOAD INPUT */}
                        <div className="flex flex-col justify-end gap-2 mt-5 relative w-[500px]">
                            <label className="text-sm text-[#5a5a5a] font-[500] uppercase" htmlFor="">
                                Add Attachement 
                                { fileExists && <span className="text-red-600">- File already attached</span> }
                            </label>
                            <FileInputGroup 
                                handleFileUpload={handleFileUpload} 
                                disabled={isCompleted}
                            />
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-end gap-2 mt-11 relative w-[910px] mr-[-4px]">
                            <ButtonSmall
                                label="Close" 
                                onClick={onClose} 
                                type="outline"
                            />
                            {!isCompleted && (
                                <>
                                <ButtonSmall
                                    label="Save" 
                                    onClick={() => handleSaveOrComplete("save")}
                                    type="solid"
                                />
                                <ButtonSmall
                                    label="Complete Delivery" 
                                    onClick={() => handleSaveOrComplete("complete")}
                                    type="solid"
                                    disabled={
                                        itemStatuses.some(status =>
                                          ["Backordered", "Partial"].includes(status)
                                        )
                                    }
                                />
                                </>
                            )}
                                
                        </div>
                        
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
