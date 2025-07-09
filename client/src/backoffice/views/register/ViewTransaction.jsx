import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch } from '../../../utils/api'

import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"

export default function ViewTransaction() {
    const navigate = useNavigate()
    const { transactionId, registerId } = useParams()
    const dispatch = useDispatch()

    const [txData, setTxData] = useState(null)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    useEffect(() => {
        dispatch(setView("Registers"))
        dispatch(setMenuDisabled(false))
        fetchTransaction()
    }, [])

    async function fetchTransaction() {
        try {
            const resData = await apiFetch(`/api/get_transaction/${transactionId}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })
            setTxData(resData)
        } 
        catch (err) {
            console.error("❌ Error fetching transaction:", err.message)
        }
    }

    function handlePrint() {
        window.print()
    }

    if (!txData) return <ViewContainer>Loading...</ViewContainer>

    const {
        transaction_id,
        date,
        time,
        subtotal,
        tax,
        total_amount,
        store_name,
        store_address,
        store_email,
        store_phone,
        items = [],
    } = txData

    return (
        <>
        <ViewContainer>
            <ViewTitle title="View Transaction" subtitle={`Receipt for ${transaction_id}`} />

            <div className="flex gap-4 mt-2 mb-6">
                <ButtonSmall label="Back" onClick={() => navigate(`/backoffice/registerTransactions/${registerId}`)} />
                <ButtonSmall label="Print" type="solid" onClick={handlePrint} />
            </div>

            <div id="printable-receipt" className="p-10 text-sm text-gray-800 font-mono w-[600px] bg-white shadow rounded">
                {/* Store Info */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase">{store_name}</h2>
                    <div>{store_address}</div>
                    <div>Email: {store_email}</div>
                    <div>Phone: {store_phone}</div>
                    <hr className="my-4 border-dashed" />
                </div>

                {/* Transaction Info */}
                <div className="mb-4">
                    <div><span className="font-bold">Transaction:</span> {transaction_id}</div>
                    <div><span className="font-bold">Date:</span> {date}</div>
                    <div><span className="font-bold">Time:</span> {time}</div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm border-t border-b border-gray-300 my-4">
                    <thead>
                        <tr className="text-left border-b border-gray-300">
                            <th className="py-2">Qty</th>
                            <th className="py-2">Item</th>
                            <th className="py-2">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-1">{item.quantity}</td>
                                <td>{item.product_name} {item.volume}</td>
                                <td>{item.price}</td>
                                <td className="text-right">{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="text-right mt-4 space-y-1 text-sm">
                    <div><span className="font-bold">Subtotal:</span> {subtotal}</div>
                    <div><span className="font-bold">Tax:</span> {tax}</div>
                    <div className="text-lg font-bold border-t pt-2 mt-2">
                        Total: {total_amount}
                    </div>
                </div>

                <div className="mt-6 text-center text-xs italic">
                    Thank you for your purchase!
                </div>
            </div>
        </ViewContainer>
        </>
    )
}
