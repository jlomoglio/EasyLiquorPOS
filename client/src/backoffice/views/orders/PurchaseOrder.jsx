// APPLICATION DEPENDENCIES
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { useNavigate, useParams} from "react-router-dom"
import html2pdf from "html2pdf.js"
import { apiFetch } from './../../../utils/api'


// COMPONENT DEPENDENCIES
import ViewContainer from "../../components/ui/ViewContainer"
import ViewTitle from "../../components/ui/ViewTitle"
import ButtonSmall from "../../components/ui/forms/ButtonSmall"
import ExportPurchaseOrderPDF from "./ExportPurchaseOrderPDF"


// COMPONENT: ADD PURCHASE ORDER
export default function PurchaseOrder() {
    // NAVIGATE
    const navigate = useNavigate()
    const { id } = useParams()

    // REDUX
    const dispatch = useDispatch()


    // STATE
    const [poData, setPoData] = useState(null)

    // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

    // SET THE VIEW AND ENABLE MENU
    useEffect(() => {
        dispatch(setView("Orders"));
        dispatch(setMenuDisabled(false))

        handleGetPurchaseOrder() 
    }, [])

    // HANDLE GET PURCHASE ORDER
    async function handleGetPurchaseOrder() {
        try {
            const resData = await apiFetch(`/api/get_po_number_by_id/${id}`, {
                headers: {
                    'x-tenant-id': tenantId
                }
            })

            setPoData(resData);
        } 
        catch (err) {
            console.error("❌ Error fetching PO:", err.message);
        }
    }

    // HANDLE EXPORT TO PDF
    function handleExportToPDF() {
        const element = document.getElementById("pdf-content");
      
        const opt = {
          margin:       0,
          filename:     `${poData.po_number || "purchase-order"}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
      
        html2pdf().set(opt).from(element).save();
    }
    
    // HANDLE PRINT
    function handlePrint() {
        window.print()
    }

    if (!poData) {
        return <ViewContainer>Loading PO...</ViewContainer>
    }

    const {
        po_number,
        store_name,
        store_address, // address, city, state, zip
        store_email,
        store_phone,
        store_owner,
        vendor_name,
        vendor_address, // address, city, state, zip
        vendor_email,
        vendor_phone,
        date, // created_at
        subtotal,
        tax,
        shipping,
        total,
        items = [],
    } = poData

    return (
        <>
        <div style={{ display: "none" }}>
            <ExportPurchaseOrderPDF poData={poData} />
        </div>

        <ViewContainer>
            <ViewTitle title="Purchase Order" subtitle="Here's what's happening with your store today." />
            
            <div className="ml-[0px] mt-[5px] flex flex-row gap-4">
                <ButtonSmall label="Close" onClick={() => navigate('../orders')} />
                {/* <ButtonSmall label="Edit Purchase Order" type="solid" onClick={() => navigate(`../editPurchaseOrder/${id}`)} /> */}
                <ButtonSmall label="Export" type="solid" onClick={handleExportToPDF} />
                <ButtonSmall label="Print" type="solid" onClick={handlePrint} />
            </div>

            <div id="printable-po" className="p-10 text-sm text-gray-800 font-sans w-[800px] ml-[-40px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="font-bold uppercase text-lg">Purchase Order</div>
                        </div>
                        <div className="text-right">
                        <div className="font-semibold">Company Name: </div>
                        <div>{store_name}</div>
                        <div>{store_address}</div>
                        <div>Email: {store_email}</div>
                        <div>Phone: {store_phone}</div>
                    </div>
                </div>

                {/* PO Info */}
                <div className="border border-gray-300 p-4 mb-6">
                    <div className="mb-2">
                    <span className="font-semibold mr-2">P.O. Number:</span> {po_number}
                    </div>
                    <div className="flex justify-between">
                    <div>
                        <div className="font-semibold mb-1">Vendor:</div>
                        <div>{vendor_name}</div>
                        <div>{vendor_address}</div>
                        <div>Email: {vendor_email}</div>
                        <div>Phone: {vendor_phone}</div>
                    </div>
                    <div>
                        <div className="font-semibold mb-1">Ship To:</div>
                        <div>{store_name}</div>
                        <div>{store_address}</div>
                        <div>Email: {store_email}</div>
                        <div>Phone: {store_phone}</div>
                    </div>
                    </div>
                </div>

                {/* Order Table */}
                <table className="w-full text-left border-collapse mb-6">
                    <thead>
                    <tr className="bg-blue-500 text-white text-xs uppercase">
                        <th className="p-2 border border-gray-300">Qty</th>
                        <th className="p-2 border border-gray-300">Unit</th>
                        <th className="p-2 border border-gray-300">Product</th>
                        <th className="p-2 border border-gray-300">Unit Price</th>
                        <th className="p-2 border border-gray-300">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="p-2 border border-gray-300">{item.qty}</td>
                                <td className="p-2 border border-gray-300">{item.unit}</td>
                                <td className="p-2 border border-gray-300">{item.name} - {item.volume}</td>
                                <td className="p-2 border border-gray-300">${item.cost.toFixed(2)}</td>
                                <td className="p-2 border border-gray-300">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end text-sm">
                    <table className="text-right w-1/2">
                        <tbody>
                            <tr>
                                <td className="p-2">Subtotal:</td>
                                <td className="p-2">${subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="p-2">Sales Tax:</td>
                                <td className="p-2">${tax.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="p-2">Shipping:</td>
                                <td className="p-2">${shipping.toFixed(2)}</td>
                            </tr>
                            <tr className="font-bold">
                                <td className="p-2">Total:</td>
                                <td className="p-2">${total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer / Signature */}
                <div className="mt-10 text-sm flex justify-between">
                    <div>
                    <div className="mb-1 font-semibold">Authorized By:</div>
                    <div className="border-t border-gray-400 w-48 pt-1">{store_owner}</div>
                    </div>
                    <div>
                    <div className="mb-1 font-semibold">Date:</div>
                    <div className="border-t border-gray-400 w-32 pt-1">{date}</div>
                    </div>
                </div>
            </div>

        </ViewContainer>
        </>
    )
}