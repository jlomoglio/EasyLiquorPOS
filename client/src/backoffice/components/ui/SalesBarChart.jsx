import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// COMPONENT: SALES BAR CHART
export default function SalesBarChart({ data }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-[20px] w-full">
            <h2 className="text-[1.2rem] font-[700] text-[#5a5a5a] mb-[10px]">Sales Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total" fill="#2563EB" />
                    <Bar dataKey="Cash" fill="#10B981" />
                    <Bar dataKey="Credit" fill="#F59E0B" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


