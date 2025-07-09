import { useState } from "react"

const sections = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "inventory", label: "Inventory" },
    { id: "orders", label: "Purchase Orders" },
    { id: "deliveries", label: "Deliveries" },
    { id: "transactions", label: "Transactions" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Store Settings" },
]

export default function TutorialView() {
    const [active, setActive] = useState("dashboard")

    const renderContent = () => {
        switch (active) {
            case "dashboard":
                return <DashboardTutorial />
            case "users":
                return <div className="p-6">Users tutorial coming soon.</div>
            case "inventory":
                return <div className="p-6">Inventory tutorial coming soon.</div>
            case "orders":
                return <div className="p-6">Purchase Order tutorial coming soon.</div>
            case "deliveries":
                return <div className="p-6">Deliveries tutorial coming soon.</div>
            case "transactions":
                return <div className="p-6">Transactions tutorial coming soon.</div>
            case "reports":
                return <div className="p-6">Reports tutorial coming soon.</div>
            case "settings":
                return <div className="p-6">Store Settings tutorial coming soon.</div>
            default:
                return null
        }
    }

    return (
        <div className="flex w-full h-[calc(100vh-50px)]">
            <div className="w-[220px] bg-gray-100 border-r border-gray-300 text-sm">
                <div className="p-4 font-semibold text-gray-600">Tutorial Sections</div>
                <ul className="space-y-1">
                    {sections.map((section) => (
                        <li
                            key={section.id}
                            className={`cursor-pointer px-4 py-2 hover:bg-blue-50 transition text-gray-700 ${active === section.id ? "bg-white font-bold border-l-4 border-blue-500" : ""
                                }`}
                            onClick={() => setActive(section.id)}
                        >
                            {section.label}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    )
}

function DashboardTutorial() {
    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-4">Using the Dashboard</h1>
            <p className="text-gray-700 mb-4">
                The Dashboard is your main control center. It shows key performance indicators, upcoming deliveries, sales
                trends, and a high-level overview of your store activity.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-2">Key Areas</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Sales KPIs:</strong> Today’s Sales, Monthly Sales, Total Transactions</li>
                <li><strong>Sales Charts:</strong> View growth trends by day, month, or year</li>
                <li><strong>Inventory:</strong> Top categories, total value, total inventory units</li>
                <li><strong>Upcoming Deliveries:</strong> A scrollable preview of the next 5 days</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-2">Sales Overview</h2>
            <p className="text-gray-700 mb-4">
                The KPIs update in real time and allow you to track performance against goals.
            </p>
            <img src="images/tutorial/dashboard_kpi.png" alt="Dashboard KPI Example" className="rounded shadow mb-4" />
            {/* <img src="images/tutorial/inventory_highlights.png" alt="Dashboard KPI Example" className="rounded shadow mb-4" /> */}

            <h2 className="text-xl font-semibold mt-8 mb-2">Category Sales Chart</h2>
            <p className="text-gray-700 mb-4">
                This chart tracks monthly sales by category. The chart adjusts automatically.
            </p>
            <img src="/images/tutorial/sales_charts.png" alt="Dashboard Sales Chart" className="rounded shadow mb-4" />

            <h2 className="text-xl font-semibold mt-8 mb-2">Upcoming Deliveries</h2>
            <p className="text-gray-700 mb-4">
                This card shows any deliveries scheduled in the next 5 days.
            </p>
            <img src="/images/tutorial/delivery_preview.png" alt="Upcoming Deliveries Card" className="rounded shadow mb-4" />



            <h2 className="text-xl font-semibold mt-8 mb-2">Inventory Overview</h2>
            <p className="text-gray-700 mb-4">
                The KPIs update in real time and allow you to track performance against goals.
            </p>
            <img src="images/tutorial/inventory_highlights.png" alt="Dashboard KPI Example" className="rounded shadow mb-4" />

            <h2 className="text-xl font-semibold mt-8 mb-2">Category Sales Chart</h2>
            <p className="text-gray-700 mb-4">
                This chart tracks monthly sales by category. The chart adjusts automatically.
            </p>
            <img src="/images/tutorial/sales_charts_products.png" alt="Dashboard Sales Chart" className="rounded shadow mb-4" />

            <h2 className="text-xl font-semibold mt-8 mb-2">Upcoming Deliveries</h2>
            <p className="text-gray-700 mb-4">
                This card shows any deliveries scheduled in the next 5 days.
            </p>
            <img src="/images/tutorial/delivery_preview.png" alt="Upcoming Deliveries Card" className="rounded shadow mb-4" />
        </div>
    )
}