import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import "../../../styles/fullcalendar-overrides.css";
import { Trash2 } from "lucide-react"

export default function DeliveryCalendar({ events = [], onDateClick, onEventClick, onDelete }) {
    return (
        <div className="w-full h-full bg-white rounded-lg p-4">
            <FullCalendar
                    events={events}
                    dateClick={onDateClick}
                    eventClick={(info) => {
                        if (onEventClick) {
                            onEventClick(info.event);
                        }
                    }}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                    }}
                    height="105%"
                    dayMaxEvents={true}
                    themeSystem="standard"
                    buttonText={{
                        today: "Today",
                        month: "Month",
                        week: "Week",
                        day: "Day",
                        list: "List"
                    }}
                    dayCellClassNames={({ date }) => {
                        const today = new Date();
                        if (date.toDateString() === today.toDateString()) {
                            return "!bg-blue-100 !text-blue-800";
                        }
                        return ""
                    }}
                    dayHeaderClassNames={() => "bg-slate-100 text-blue-800 font-semibold"}
                    eventColor="#60A5FA"
                    buttonIcons={false}
                    eventContent={(arg) => {
                        const isListView = arg.view.type.startsWith("list")
                        const status = arg.event.extendedProps.status?.toLowerCase();

                        // Tailwind color classes per status
                        const statusColor =
                            status === "completed" ? "text-green-600" :
                            status === "partial" ? "text-yellow-500" :
                            status === "backordered" ? "text-pink-500" :
                            status === "canceled" ? "text-red-500" :
                            status === "scheduled" ? "text-blue-500" :
                            status === "pending" ? "text-orange-500" : "text-gray-700"

                        return (
                            <div className="flex justify-between items-center w-full pr-2">
                                <div className={`flex items-center gap-2 ${statusColor}`}>
                                    {arg.timeText}: {arg.event.title}
                                </div>
                                
                                {isListView && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent triggering eventClick
                                            if (onDelete) onDelete(arg.event.id);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete Delivery"
                                    >
                                        <Trash2 size={20} strokeWidth={2.2} style={{ cursor: "pointer"}} />
                                    </button>
                                )}
                            </div>
                        );
                    }}
                    customButtons={{}}
                    dayHeaderDidMount={(arg) => {
                        arg.el.style.backgroundColor = "#f1f5f9";
                        arg.el.style.color = "#1e3a8a";
                    }}
                    datesSet={(arg) => {
                        const buttons = document.querySelectorAll('.fc-button');
                        buttons.forEach(btn => {
                            btn.classList.add(
                                'bg-[#60A5FA]',
                                'text-white',
                                'hover:bg-[#3b82f6]',
                                'rounded',
                                'px-2',
                                'py-1',
                                'mx-[2px]' // ✅ Add horizontal margin for spacing
                            );
                        });
                    }}
                />
        </div>
    );
}
