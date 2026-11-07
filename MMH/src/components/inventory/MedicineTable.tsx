import React from 'react';

interface Medicine {
  id: string;
  name: string;
  company: string;
  category?: string;
  batchNo?: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  doctorPrice?: number;
  expiryDate: string;
  supplier?: { name: string };
}

export const getExpiryStatus = (dateStr: string) => {
  if (!dateStr) return { status: 'NORMAL' as const, label: 'N/A', days: 0 };
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return { status: 'NORMAL' as const, label: 'Invalid Date', days: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expiry);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'EXPIRED' as const,
      label: 'Expired',
      subText: `${Math.abs(diffDays)}d ago`,
      days: diffDays
    };
  } else if (diffDays <= 60) {
    return {
      status: 'EXPIRING_SOON' as const,
      label: 'Expiring Soon',
      subText: diffDays === 0 ? 'Today' : `in ${diffDays}d`,
      days: diffDays
    };
  }
  return { status: 'NORMAL' as const, label: 'Valid', subText: '', days: diffDays };
};

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
          {data.map((item) => {
            const exp = getExpiryStatus(item.expiryDate);
            return (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 ${
                  exp.status === 'EXPIRED' 
                    ? 'bg-red-50/40' 
                    : exp.status === 'EXPIRING_SOON' 
                    ? 'bg-amber-50/40' 
                    : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">Sup: {item.supplier?.name || 'General / Direct'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.company || '-'}</div>
                  {item.category && (
                    <div className="text-xs px-2 inline-flex leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">#{item.batchNo || 'N/A'}</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                  </div>
                  {exp.status === 'EXPIRED' && (
                    <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
                      ● Expired ({exp.subText})
                    </span>
                  )}
                  {exp.status === 'EXPIRING_SOON' && (
                    <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      ▲ Expiring Soon ({exp.subText})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.stock} Units
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-xs text-slate-500">Cost: ₹{item.purchasePrice}</div>
                  <div className="font-semibold text-emerald-700">Cust: ₹{item.sellingPrice}</div>
                  <div className="font-semibold text-blue-700 text-xs">Dr: ₹{item.doctorPrice || item.sellingPrice}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
