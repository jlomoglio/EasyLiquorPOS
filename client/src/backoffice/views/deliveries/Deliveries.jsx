// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice";
import { useNavigate } from "react-router-dom"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import DeliveryCalendar from "./DeliveryCalendar";
import DeliveryAddModal from "./DeliveryAddModal";
import DeliveryDetailsModal from "./DeliveryDetailsModal";
import toast from "react-hot-toast"
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";



function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
        hours = "00";
    }

    if (modifier === "PM") {
        hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, "0")}:${minutes}:00`;
}


// COMPONENT: DELIVERIES
export default function Deliveries() {
    // NAVIGATE
    const navigate = useNavigate()

    // DISPATCH
    const dispatch = useDispatch()


    // STATE
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [deliveries, setDeliveries] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deliveryToDelete, setDeliveryToDelete] = useState(null)
    const [unscheduledPOs, setUnscheduledPOs] = useState([])

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Deliveries"))
        dispatch(setMenuDisabled(false))
    
        const observer = new MutationObserver(() => {
            const buttons = document.querySelectorAll(".fc-button")
    
            buttons.forEach((btn) => {
                btn.classList.add(
                    "bg-[#60A5FA]",
                    "text-white",
                    "hover:bg-[#3b82f6]",
                    "rounded",
                    "px-3",
                    "py-1",
                    "border",
                    "border-[#60A5FA]"
                );
            });
    
            // Fix for active view button
            const active = document.querySelector(".fc-button-active")
            if (active) {
                active.classList.remove("bg-[#60A5FA]")
                active.classList.add("bg-[#3b82f6]")
            }
        });
    
        const calendarEl = document.querySelector(".fc-header-toolbar")
        if (calendarEl) {
            observer.observe(calendarEl, { childList: true, subtree: true })
        }
    
        return () => observer.disconnect()
    }, []);

    useEffect(() => {
        handleGetDeliveries()
        fetchUnscheduledPOs()
    }, []);

    // HANDLE GETTING THE DELIVERIES
    function handleGetDeliveries() {
        apiFetch(`/api/delivery_events`, {
            headers: {
                'x-tenant-id': tenantId
            }
        })
            .then(data => {
                const events = data.events.map((delivery) => {
                    const ext = delivery.extendedProps;
                
                    return {
                        id: delivery.id,
                        title: `${ext.vendor_name}`,
                        start: `${ext.delivery_date}T${convertTo24Hour(ext.start_time || "08:00 AM")}`,
                        extendedProps: {
                            vendor: ext.vendor_name, // 💡 <- This key MUST be `vendor`
                            po_number: ext.po_number,
                            po_id: ext.po_id || delivery.id, 
                            status: ext.status,
                            start_time: ext.start_time,
                            end_time: ext.end_time,
                            repeat: ext.repeat,
                            reminder: ext.reminder,
                            notes: ext.notes,
                            attachments: ext.attachments,
                            parent_delivery_id: ext.parent_delivery_id,
                        },
                        backgroundColor:
                            ext.status === "Completed" ? "#10B981" :
                            ext.status === "Canceled" ? "#EF4444" :
                            ext.status === "Partial" ? "#FACC15" : "#60A5FA"
                    };
                });
                
    
                setDeliveries(events);
            })
            .catch(err => console.error("❌ Failed to fetch deliveries:", err));
    }

    // FETCH UNSCHEDULED PO
    async function fetchUnscheduledPOs() {
        try {
            const data = await apiFetch(`/api/get_unscheduled_purchase_orders`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            
            setUnscheduledPOs(data.purchase_orders || []);
        } 
        catch (err) {
            console.error("❌ Failed to fetch unscheduled POs:", err.message);
        }
    }

    // HANDLE REQUEST DELETE
    function handleRequestDelete(deliveryId) {
        setDeliveryToDelete(deliveryId);
        setShowDeleteModal(true)
    }
    
    // HANDLE DELETE DELIVERY
    async function handleDeleteDelivery(deliveryId) {
        try {
            const resData = await apiFetch(`/api/delete_delivery/${deliveryId}`, {
                method: "DELETE",
                headers: {
                    'x-tenant-id': tenantId
                }
            });
    
            if (!res.ok) throw new Error(resData.error || "Delete failed");
    
            toast.success("Delivery deleted")
            setShowDeleteModal(false)

            // refresh list
            handleGetDeliveries() 
            fetchUnscheduledPOs()
        } 
        catch (err) {
            toast.error(`❌ ${err.message}`);
            console.error("Delete error:", err.message);
        }
    }

    // RENDER JSX
    return (
        <ViewContainer rightMargin="5px">
            <ViewTitle title="Delivery Schedules" subtitle="Track all scheduled and received deliveries." />
            
            {/* CALENDAR CONTAINER */}
            <div className="flex-1 w-full mt-[-15px] ml-[-15px] pb-[25px] overflow-hidden">
                <DeliveryCalendar
                    onDateClick={(info) => {
                        const selectedDateOnly = info.dateStr
                        const today = new Date()
                        const selected = new Date(selectedDateOnly)
                        selected.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                    
                        if (selected < today) {
                            return;
                        }

                        // Check for unscheduled POs
                        if (unscheduledPOs.length === 0) {
                            toast.error("No unscheduled purchase orders available.", {
                                style: {
                                    minWidth: "400px",
                                    fontSize: "1rem",
                                    backgroundColor: "#F87171",
                                    color: "#fff"
                                }
                            });
                            return;
                        }
                    
                        setSelectedDate({
                            startDate: selectedDateOnly
                        });
                        setShowAddModal(true);
                    }}
                    onEventClick={(event) => {
                        setSelectedDelivery(event);
                        setShowDetailsModal(true);
                    }}
                    events={deliveries}
                    onDelete={handleRequestDelete}
                />
            </div>

            {showAddModal && (
                <DeliveryAddModal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false)
                        setTimeout(() => document.activeElement?.blur(), 50)
                      }}
                    date={selectedDate}
                    onSuccess={() => {
                        handleGetDeliveries()
                    }}
                />
            )}

            {showDetailsModal && (
                <DeliveryDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false)
                        setTimeout(() => document.activeElement?.blur(), 50)
                      }}
                    date={{
                        startDate: selectedDelivery?.startStr,
                        startTime: selectedDelivery?.startTime,
                        endTime: selectedDelivery?.endTime,
                    }}
                    onSave={() => {
                        setShowDetailsModal(false);
                    }}
                    delivery={selectedDelivery}
                    deliveries={deliveries}
                />
            )}

            {showDeleteModal && (
                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeliveryToDelete(null);
                    }}
                    onConfirm={() => handleDeleteDelivery(deliveryToDelete)}
                    title="Delete Delivery"
                    message={
                        <>
                          Are you sure you want to delete delivery?<br />
                          This action cannot be undone.
                        </>
                    }
                />
            )}
        </ViewContainer>
    )
}
