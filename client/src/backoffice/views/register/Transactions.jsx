// APPLICATION DEPENDENCIES
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from '../../../utils/api'
import { useParams } from "react-router-dom";


// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import DynamicTransactionsScrollTable from "../../components/ui/table/DynamicTransactionsScrollTable";
import ButtonSmall from "../../components/ui/forms/ButtonSmall";
import TidInputGroup from "../../components/ui/forms/TidInputGroup";
import ResetButton from "../../components/ui/forms/ResetButton";


// COMPONENT: INVENTORY
export default function Transactions() {
    const { id: registerId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [registerMeta, setRegisterMeta] = useState({ register_id: "", opened_date: "" });

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Transactions"));
        dispatch(setMenuDisabled(false));
        fetchTransactions();
    }, [registerId]);

    async function fetchTransactions() {
        try {
            const resData = await apiFetch(`/api/transactions?registerId=${registerId}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            const formatted = resData.transactions.map(t => ({
                ...t,
                total_amount: `$${parseFloat(t.total_amount).toFixed(2)}`
            }));
            setTransactions(formatted);

            // Pull metadata (first transaction's register info)
            if (resData.registerMeta) setRegisterMeta(resData.registerMeta);
        } 
        catch (err) {
            console.error("❌ Error fetching transactions:", err.message);
        }
    }

    function handleSearchChange(name, value) {
        setSearchTerm(value);
        const filtered = transactions.filter(t => {
            const rawId = t.transaction_id.replace(/^TID-/, '').toLowerCase();
            return rawId.includes(value.toLowerCase());
        });
        setTransactions(filtered);
    }

    function resetFilters() {
        setSearchTerm("");
        fetchTransactions();
    }

    const tableColumns = [
        { key: "transaction_id", label: "Transaction ID", width: "220px" },
        { key: "time", label: "Time", width: "140px" },
        { key: "total_amount", label: "Total Amount", width: "160px" }
    ];

    function formatDate(dateStr) {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${month}/${day}/${year}`
    }

    return (
        <ViewContainer>
            <ViewTitle 
                title="Sales Transactions" 
                subtitle={`Viewing transactions on  ${formatDate(registerMeta.opened_date)}`} 
            />
            <div className="ml-[0px] mt-[5px]">
                <ButtonSmall label="Back" onClick={() => navigate("../registers")} />
            </div>

            <div className="flex flex-row mt-[-20px] w-full relative mb-[5px] ml-[10px]">
                <div className="w-[400px] ml-[-25px] pt-[52px]">
                    <TidInputGroup 
                        label="Find Transaction ID" 
                        type="text" 
                        placeholder="Enter Transaction ID" 
                        onChange={handleSearchChange}
                        value={searchTerm}
                    />
                </div>
                <div className="w-[40px] h-[40px] ml-[-5px] mt-[80px]">
                    <ResetButton onClick={resetFilters} />
                </div>
                <div className="w-[440px] h-[40px] ml-[-5px] mt-[100px] text-right font-[500] absolute right-[20px]">
                    Total Transactions: {transactions.length}
                </div>
            </div>

            <DynamicTransactionsScrollTable
                data={transactions}
                columns={tableColumns}
                onAction={(action, transaction_id) => {
                    if (action === "view") navigate(`../viewTransaction/${transaction_id}/${registerId}`);
                }}
                actions={["view"]}
                tableWidth="100%"
                tableHeight="dynamic"
            />
            <div className="h-[20px]"></div>
        </ViewContainer>
    );
}
