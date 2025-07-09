export default function ExportPurchaseOrderPDF({ poData }) {
    if (!poData) return null;
  
    const {
      po_number,
      store_name,
      store_address,
      store_email,
      store_phone,
      store_owner,
      vendor_name,
      vendor_address,
      vendor_email,
      vendor_phone,
      date,
      subtotal,
      tax,
      shipping,
      total,
      items
    } = poData;
  
    const cellStyle = {
      border: "1px solid #ccc",
      padding: "8px",
      fontSize: "13px",
      color: "#000"
    };
  
    return (
      <div id="pdf-content" style={{ width: "800px", padding: "40px", fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#000" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "18px", textTransform: "uppercase" }}>Purchase Order</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><strong>Company Name:</strong></div>
            <div>{store_name}</div>
            <div>{store_address}</div>
            <div>Email: {store_email}</div>
            <div>Phone: {store_phone}</div>
          </div>
        </div>
  
        {/* PO Info */}
        <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "10px" }}>
            <strong>P.O. Number:</strong> {po_number}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div><strong>Vendor:</strong></div>
              <div>{vendor_name}</div>
              <div>{vendor_address}</div>
              <div>Email: {vendor_email}</div>
              <div>Phone: {vendor_phone}</div>
            </div>
            <div>
              <div><strong>Ship To:</strong></div>
              <div>{store_name}</div>
              <div>{store_address}</div>
              <div>Email: {store_email}</div>
              <div>Phone: {store_phone}</div>
            </div>
          </div>
        </div>
  
        {/* Order Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#3B82F6", color: "#fff", textTransform: "uppercase", fontSize: "12px" }}>
              <th style={cellStyle}>Qty</th>
              <th style={cellStyle}>Unit</th>
              <th style={cellStyle}>Product</th>
              <th style={cellStyle}>Unit Price</th>
              <th style={cellStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={cellStyle}>{item.qty}</td>
                <td style={cellStyle}>{item.unit}</td>
                <td style={cellStyle}>{item.name} - {item.volume}</td>
                <td style={cellStyle}>${item.cost.toFixed(2)}</td>
                <td style={cellStyle}>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <table style={{ textAlign: "right", width: "50%" }}>
            <tbody>
              <tr>
                <td style={cellStyle}>Subtotal:</td>
                <td style={cellStyle}>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={cellStyle}>Sales Tax:</td>
                <td style={cellStyle}>${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={cellStyle}>Shipping:</td>
                <td style={cellStyle}>${shipping.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td style={cellStyle}>Total:</td>
                <td style={cellStyle}>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        {/* Footer */}
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
          <div>
            <div style={{ marginBottom: "4px", fontWeight: "bold" }}>Authorized By:</div>
            <div style={{ borderTop: "1px solid #444", width: "180px", paddingTop: "6px" }}>{store_owner}</div>
          </div>
          <div>
            <div style={{ marginBottom: "4px", fontWeight: "bold" }}>Date:</div>
            <div style={{ borderTop: "1px solid #444", width: "120px", paddingTop: "6px" }}>{date}</div>
          </div>
        </div>
      </div>
    );
  }
  