// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X, ChevronDown, Calendar } from "lucide-react";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";


// COMPONENT: DELIVERY QUICK ADD MODAL
export default function DeliveryAddModal({ isOpen, onClose, onSuccess, date }) {
    // STYLES
    const dialog = `
        fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-hidden
    `

       // STATE
    const [form, setForm] = useState({
        poNumber: "",
        startDate: "",
        startTime: "",
        endTime: "",
        repeat: "",
        reminder: "",
    })
    const [poOptions, setPoOptions] = useState([])
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen && date?.startDate) {
            setForm((prev) => ({
                ...prev,
                startDate: date.startDate,
            }))

            handleGetPurchaseOrders()
        }
    }, [isOpen, date])

    // HANDLE GET PURCHASE ORDERS
    async function handleGetPurchaseOrders() {
        try {
            const resData = await apiFetch(`/api/get_unscheduled_purchase_orders`)

            setPoOptions(
                resData.purchase_orders.map((po) => ({
                    value: po.id,
                    label: po.po_number,
                    vendor_name: po.vendor_name,
                    vendor_id: po.vendor_id
                }))
            )
    
        } catch (err) {
            console.log("❌ Error fetching vendors:", err.message);
        }
    }

    // HANDLE CHAGE
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // HANDLE SAVE
    async function handleSubmit() {
        if (isSubmitting) return; // block duplicate clicks

        setIsSubmitting(true)
        const poObj = poOptions.find(po => po.value == form.poNumber);
    
        if (!form.poNumber || !form.startDate) {
            setError(true)
            setIsSubmitting(false)
            return;
        }
    
        const payload = {
            po_number: poObj?.label,
            vendor_id: poObj?.vendor_id || "",
            vendor_name: poObj?.vendor || "",
            delivery_date: form.startDate,
            start_time: form.startTime,
            end_time: form.endTime,
            status: "Scheduled",
            repeat: form.repeat,
            reminder: form.reminder
        };
    
        try {
            const resData = await apiFetch("/api/create_delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-tenant-id': tenantId },
                body: JSON.stringify(payload)
            });
    
            onSuccess?.(payload) // optional: refresh calendar
            onClose();
    
        } catch (err) {
            console.error("❌ Failed to save delivery:", err.message);
        }
    }
     


    // RENDER JSX
    return (
        <Dialog open={isOpen} onClose={onClose} className={dialog} style={{ border: '0 !important', outlineStyle: 'none'}}>
            <DialogPanel className="bg-white p-6 rounded-xl shadow-lg w-[700px] h-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <DialogTitle className="text-lg font-semibold text-[#5a5a5a]">New Delivery</DialogTitle>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-row">
                        {/* PURCHASE ORDER NUMBER */}
                        <div className="relative">
                            <select
                                name="poNumber"
                                value={form.poNumber || ""}
                                onChange={handleChange}
                                className={`w-[430px] border border-gray-300 rounded px-3 py-2  
                                    appearance-none focus:outline-none outline-none focus:border-[#60A5FA]
                                    text-[#5a5a5a]
                                `}
                            >
                                <option value="">Select a PO#</option>
                                {poOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label} ({opt.vendor_name})</option>
                                ))}
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

                    {/* DELIVERY DATE/TIME */}
                    <div className="flex gap-4">
                        {/* DELIVERY DATE */}
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm text-[#5a5a5a] font-[600] mb-[5px]">Delivery Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-[215px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                        focus:outline-none outline-none focus:border-[#60A5FA]"
                                    disabled
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
                        </div>

                        {/* START TIME */}
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm text-[#5a5a5a] font-[600] mb-[5px]">Start Time</label>
                            <div className="relative">
                                <select
                                    name="startTime"
                                    value={form.startTime || ""}
                                    onChange={handleChange}
                                    className="w-[200px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                        appearance-none focus:outline-none outline-none focus:border-[#60A5FA]"
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
                        </div>

                        {/* END TIME */}
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm text-[#5a5a5a] font-[600] mb-[5px]">End Time</label>
                            <div className="relative">
                                <select
                                    name="endTime"
                                    value={form.endTime || ""}
                                    onChange={handleChange}
                                    className="w-[200px] border border-gray-300 rounded px-3 py-2 text-[#5a5a5a] 
                                        appearance-none focus:outline-none outline-none focus:border-[#60A5FA]"
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
                        </div>
                    </div>
                </div>

                <div className="w-full border-b border-b-[#ccc] h-[1px] mt-[20px]"></div>

                <div className="flex justify-end gap-2 mt-3 relative w-full">
                    
                    {error && (
                        <div className="text-sm text-red-600 mt-[15px] mr-[180px]">
                            ERROR: PO# and Start Time are required!
                        </div>
                    )}
                        
                    <ButtonSmall
                        label="Cancel" 
                        onClick={onClose} 
                        type="outline"
                    />
                    <ButtonSmall
                        label="Save" 
                        onClick={handleSubmit} 
                        type="solid"
                        disabled={isSubmitting}
                    />
                </div>
            </DialogPanel>
        </Dialog>
    );
}
