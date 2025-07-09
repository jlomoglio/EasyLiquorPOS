import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { apiFetch } from "../../../../utils/api"

export default function ViewProductsModal({ category, onClose }) {
  const [products, setProducts] = useState([])

  // LOCALSTORAGE
	const tenantId = localStorage.getItem("tenantId")

  useEffect(() => {
    if (category) {
      fetchProducts()
    }
  }, [category])

  async function fetchProducts() {
    try {
      const res = await apiFetch(`/api/get_products_by_category/${encodeURIComponent(category)}`, {
        headers: {
            'x-tenant-id': tenantId
        }
    })
      setProducts(res.products || [])
    } catch (err) {
      console.error("❌ Error fetching products for category:", err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center">
      <div className="bg-white w-[700px] max-h-[90vh] rounded-lg shadow-lg p-5 overflow-y-auto relative border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Products in {category}</h2>
          <X className="cursor-pointer text-gray-600" onClick={onClose} />
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-sm text-gray-500">No products found in this category.</div>
        ) : (
          <table className="w-full text-sm border-t border-b border-gray-200">
            <thead>
              <tr className="text-left bg-gray-100 text-xs uppercase text-gray-600">
                <th className="p-2">Name</th>
                <th className="p-2">Brand</th>
                <th className="p-2">Volume</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.brand}</td>
                  <td className="p-2">{p.volume}</td>
                  <td className="p-2 text-right">{p.quantity}</td>
                  <td className="p-2 text-right">${parseFloat(p.price_per_unit).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
