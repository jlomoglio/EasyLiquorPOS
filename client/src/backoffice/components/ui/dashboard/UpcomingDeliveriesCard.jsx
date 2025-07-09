import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../../../utils/api"
import dayjs from "dayjs"

export default function UpcomingDeliveriesCard() {
    const [deliveries, setDeliveries] = useState([])
    const navigate = useNavigate()

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        fetchUpcomingDeliveries()
    }, [])

    async function fetchUpcomingDeliveries() {
        try {
            const res = await apiFetch("/api/get_upcoming_deliveries", {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setDeliveries(res.deliveries || [])
        } catch (err) {
            console.error("Failed to fetch upcoming deliveries:", err.message)
        }
    }

    function handleClick(deliveryId) {
        navigate(`../deliveries/deliveries?focus=${deliveryId}`)
    }

    return (
        <div className="bg-[#F9FAFB] shadow-lg rounded-xl p-4 border border-gray-300" style={{height: "445px"}}>
            <h2 className="text-md font-semibold text-gray-700 mb-3">Upcoming Deliveries (Next 5 Days)</h2>
            {deliveries.length === 0 ? (
                <div className="text-sm text-gray-500">No deliveries scheduled.</div>
            ) : (
                <div className="max-h-[375px] overflow-y-auto pr-1">
                    <ul className="divide-y divide-gray-200 pr-2">
                        {deliveries.map((delivery) => (
                            <li
                                key={delivery.id}
                                className="py-2 px-1 hover:bg-gray-100 rounded transition"
                                
                            >
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium text-gray-800">
                                        {delivery.vendor_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {dayjs(delivery.delivery_date).format("MMM D, YYYY")} @ {delivery.start_time || "N/A"}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Status: <span className="font-semibold">{delivery.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
