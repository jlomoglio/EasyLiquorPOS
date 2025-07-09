import React, { useEffect, useState, forwardRef } from "react";

const Receipt = forwardRef(({ transactionId }, ref) => {
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        if (!transactionId) {
            console.error("❌ No transaction_id provided.");
            return;
        }

        console.log(`🟢 Fetching transaction: ${transactionId}`);

        fetch(`http://localhost:5000/api/get_transaction?transaction_id=${transactionId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP Error ${res.status} - ${res.statusText}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.error) {
                    console.error("❌ Error loading transaction:", data.error);
                } else {
                    console.log("🟢 Transaction Data:", data);
                    setTransaction(data);
                }
            })
            .catch((err) => console.error("❌ Fetch error:", err));
    }, [transactionId]);

    if (!transaction) return <p>Loading receipt...</p>;

    return (
        <div ref={ref} style={{
            width: "58mm",
            fontSize: "12px",
            fontFamily: "monospace",
            padding: "10px",
            textAlign: "center",
            color: "black",
            background: "white"
        }}>
            <h3>EasyLiquor POS</h3>
            <p>{transaction.date} {transaction.time}</p>
            <hr />
            {transaction.items.map((item, index) => (
                <p key={index}>{item.product_name} x{item.quantity} - ${item.total.toFixed(2)}</p>
            ))}
            <hr />
            <p><strong>Total: ${transaction.total_amount.toFixed(2)}</strong></p>
            <p>Thank you for your business!</p>
        </div>
    );
});

export default Receipt;

