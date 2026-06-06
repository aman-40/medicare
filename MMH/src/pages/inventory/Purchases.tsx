import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Purchases() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState([{ productType: 'Medicine', productId: '', quantity: 1, remarks: '' }]);
  const [medicines, setMedicines] = useState<any[]>([]);
  
  useEffect(() => {
    // We would ideally fetch suppliers and medicines here
    // For now we'll stub the fetch
    api.get('/medicines').then(res => setMedicines(res.data)).catch(console.error);
    // Supposing we have a suppliers API
    // api.get('/inventory/suppliers').then(res => setSuppliers(res.data));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productType: 'Medicine', productId: '', quantity: 1, remarks: '' }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      invoiceNo: formData.get('invoiceNo'),
      supplierId: formData.get('supplierId') || 'test-supplier-id', // Stub
      totalAmount: Number(formData.get('totalAmount')),
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity)
      }))
    };

    try {
      await api.post('/inventory/purchases', payload);
      alert('Purchase successfully recorded! Stock levels have been automatically updated.');
      (e.target as HTMLFormElement).reset();
      setItems([{ productType: 'Medicine', productId: '', quantity: 1, remarks: '' }]);
    } catch (err) {
      alert('Failed to record purchase.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-healthcare-text mb-6">Record New Purchase</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input required name="invoiceNo" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <select name="supplierId" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border">
                <option value="">Select Supplier...</option>
                <option value="test1">PharmaCorp Ltd</option>
                <option value="test2">Visionary Optics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Invoice Amount (₹)</label>
              <input required name="totalAmount" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Received Items</h3>
              <button type="button" onClick={handleAddItem} className="text-sm text-healthcare-blue hover:text-blue-800 font-medium">
                + Add Another Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="w-1/4">
                    <label className="block text-xs font-medium text-gray-700 uppercase">Product Type</label>
                    <select 
                      value={item.productType}
                      onChange={(e) => handleItemChange(index, 'productType', e.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
                    >
                      <option value="Medicine">Medicine</option>
                      <option value="Frame">Frame</option>
                      <option value="Lens">Lens</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 uppercase">Product</label>
                    <select 
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm"
                    >
                      <option value="">Select product...</option>
                      {item.productType === 'Medicine' && medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.company})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 uppercase">Qty</label>
                    <input 
                      required 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm px-3 py-2 border text-sm" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-healthcare-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-sm font-medium transition">
              Save Purchase & Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
