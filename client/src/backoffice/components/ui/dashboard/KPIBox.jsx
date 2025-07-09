import { Circle, TrendingUp, ShoppingCart, DollarSign, Percent } from "lucide-react";

export default function KPIBox({ title, value, icon, color }) {
    return (
        <div className={`flex items-center justify-between bg-white shadow-lg rounded-md p-4 border border-gray-200 h-[calc((100vh-140px)/5)] max-h-[180px]`}>
            <div>
                <div className="text-gray-500 text-sm font-semibold">{title}</div>
                <div className="text-2xl font-bold text-[#333]">{value}</div>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                {icon}
            </div>
        </div>
    );
}
