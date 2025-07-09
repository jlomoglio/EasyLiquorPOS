// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice";

// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle";
import TodaySalesCard from "../../components/ui/dashboard/TodaySalesCard";
import ThisMonthSalesCard from "../../components/ui/dashboard/ThisMonthSalesCard";
import TotalSalesCard from "../../components/ui/dashboard/TotalSalesCard"
import UpcomingDeliveriesCard from "../../components/ui/dashboard/UpcomingDeliveriesCard";
import TopSellingProductsCard from "../../components/ui/dashboard/TopSellingProductsCard";
import InventoryKPICards from "../../components/ui/dashboard/InventoryKPICards";
import SalesBreakdownChart from "../../components/ui/dashboard/SalesBreakdownChart";
import LowStockAlertsCard from "../../components/ui/dashboard/LowStockAlertsCard";
import OverstockWarningsCard from "../../components/ui/dashboard/OverstockWarningsCard";
import InventoryTurnoverRatioCard from "../../components/ui/dashboard/InventoryTurnoverRatioCard";
import StaleInventoryCard from "../../components/ui/dashboard/StaleInventoryCard";
import CategoryValueBreakdownCard from "../../components/ui/dashboard/CategoryValueBreakdownCard";

// COMPONENT: DASHBOARD
export default function Dashboard() {
    // STYLES
    const tabBar = "flex border-b border-gray-300 w-full mb-4";
    const tabButton = "p-3 text-sm font-semibold cursor-pointer";
    const activeTabStyle = "border-b-2 border-black";
    const card = `bg-[#F9FAFB] p-1`

    // REDUX
    const dispatch = useDispatch();
    const { firstName } = useSelector((state) => state.backofficeLogin);

    // STATE
    const [titleText, setTitleText] = useState("");
    const [activeTab, setActiveTab] = useState("sales")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Dashboard"));
        dispatch(setMenuDisabled(false));

        setTitleText(`Good ${getTimeOfDay()}, ${firstName}!`);
    }, []);

    // GET TIME OF DAY
    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Morning";
        if (hour >= 12 && hour < 17) return "Afternoon";
        return "Evening";
    }


    // RENDER JSX
    return (
        <>     
        <ViewContainer>
            <ViewTitle title={`Good ${getTimeOfDay()}, ${firstName}!`} subtitle="Here's what's happening with your store today." />
            
            {/* Tab Navigation */}
            <div className={tabBar}>
                <div className={`${tabButton} ${activeTab === "sales" ? activeTabStyle : ""}`} onClick={() => setActiveTab("sales")}>
                    SALES
                </div>
                <div className={`${tabButton} ${activeTab === "inventory" ? activeTabStyle : ""}`} onClick={() => setActiveTab("inventory")}>
                    INVENTORY
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full flex flex-col">
                {activeTab === "sales" && (
                    <>
                    <div className="flex flex-col">
                        {/* Sales KPI Cards */}
                        <div className="grid grid-cols-3">
                            <div className={card}>
                                <TodaySalesCard />
                            </div>
                            <div className={card}>
                                <ThisMonthSalesCard />
                            </div>
                            <div className={card}>
                                <TotalSalesCard />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col relative h-[980px] mt-[8px]">
                        {/* Sales Deliveries and Top sellers Cards */}
                        <div className="grid grid-cols-2 relative">
                            <div className={card} style={{ width: "430px", height: "450px" }}>
                                <UpcomingDeliveriesCard />
                            </div>
                            <div className={card} style={{ position: "absolute", left: "430px", right: "0px" }}>
                                <SalesBreakdownChart />
                            </div>
                        </div>
                        <div className="flex flex-col relative mt-[15px] ml-[6px] mr-[6px]">
                            {/* Top Selling Products Full Card */}
                            <div className="w-full">
                                <TopSellingProductsCard />
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {activeTab === "inventory" && (
                    <div className="flex flex-col gap-4 h-[820px]">
                        {/* Inventory KPI Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className={card}>
                                <InventoryKPICards />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <LowStockAlertsCard />
                                <OverstockWarningsCard />
                                {/* <InventoryTurnoverRatioCard /> */}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {/* <StaleInventoryCard />
                                <CategoryValueBreakdownCard /> */}
                            </div>
                        </div>
                  </div>
                )}
            </div>
        </ViewContainer>
        </>
    );
}
