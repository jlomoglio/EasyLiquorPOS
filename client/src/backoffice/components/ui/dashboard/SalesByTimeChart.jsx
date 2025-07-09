import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart, Bar } from "recharts";
import dayjs from "dayjs";
import { apiFetch } from "../../../../utils/api";

export default function SalesByTimeChart() {
    // STATE
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD")); // Default to today
    const [salesByTimeData, setSalesByTimeData] = useState([]);

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // FETCH DATA ON DATE CHANGE
    useEffect(() => {
        fetchSalesByTimeData(selectedDate);
    }, [selectedDate]);

    // FETCH SALES BY TIME DATA
    async function fetchSalesByTimeData(date) {
        try {
            const url = `/api/get_sales_by_time/day?date=${date}`;

            const response = await apiFetch(url, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            if (!response.ok) throw new Error("Failed to fetch sales by time data");

            const data = await response.json();

            if (!data.labels || data.labels.length === 0) {
                console.warn("⚠️ No sales data available. API returned an empty array.");
                setSalesByTimeData([]);
                return;
            }


            // Call generateHourlyData to fill missing hours
            const formattedData = generateHourlyData({
                labels: data.labels,
                sales: data.sales,
                transactions: data.transactions,
            });

            setSalesByTimeData([...formattedData]); // Ensure new object reference to force re-render

        } catch (err) {
            console.error("❌ ERROR:", err.message);
            setSalesByTimeData([]);
        }
    }

    // FORMAT 24-HOUR TIME TO AM/PM
    function formatHourLabel(hour) {
        const intHour = parseInt(hour, 10);
        const formattedHour = intHour === 12 ? 12 : intHour % 12 || 12; // Handles midnight/noon correctly
        const period = intHour >= 12 ? "PM" : "AM";
        return `${formattedHour} ${period}`;
    }

    function generateHourlyData(rawData) {
        const fullRange = Array.from({ length: 15 }, (_, i) => (i + 8).toString().padStart(2, "0")); // 08 - 22 (8 AM - 10 PM)
        const mappedData = fullRange.map(hour => {
            const index = rawData.labels.indexOf(hour);
            return {
                label: formatHourLabel(hour),
                sales: index !== -1 ? rawData.sales[index] : 0,
                transactions: index !== -1 ? rawData.transactions[index] : 0
            };
        });
        return mappedData;
    }

    return (
        <Card className="p-4 w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-[20px]">
                <h2 className="text-lg font-bold">Sales By Time of Day</h2>
            </div>

            {/* Timeframe Control */}
            <div className="flex gap-4 items-center mb-4">
                <TextField
                    label="Select Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* This div will take up remaining space and fix vertical alignment */}
            <div className="flex-grow flex">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={salesByTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickFormatter={formatHourLabel} />
                        <YAxis tickMargin={0} padding={{ top: 10, bottom: 0 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" barSize={40} fill="#BAE6FD" />
                        <Line type="monotone" dataKey="sales" stroke="#22C55E" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}


