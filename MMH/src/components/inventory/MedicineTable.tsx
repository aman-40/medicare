import React from 'react';

interface Medicine {
  id: string;
  name: string;
  company: string;
  category: string;
  batchNo: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  supplier: { name: string };
}

export default function MedicineTable({ data }: { data: Medicine[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No medicines found in database.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company / Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch & Expiry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">Sup: {item.supplier?.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.company}</div>
                <div className="text-xs px-2 inline-flex leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {item.category}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">#{item.batchNo}</div>
                <div className={`text-xs font-bold ${new Date(item.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                  {new Date(item.expiryDate).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.stock} Units
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>Cost: ₹{item.purchasePrice}</div>
                <div className="font-medium text-gray-900">MRP: ₹{item.sellingPrice}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
