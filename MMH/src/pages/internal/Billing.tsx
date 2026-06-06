import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Receipt, Plus, Trash2, Printer } from "lucide-react";
import api from "../../api/axios";

export default function Billing() {
  const [patientName, setPatientName] = useState("");
  
  const [items, setItems] = useState([{ productName: '', quantity: 1, rate: 0 }]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const invoicesRes = await api.get('/billing');
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, rate: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.rate * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return alert("Please enter a patient name.");
    if (items.some(i => !i.productName || i.rate <= 0 || i.quantity <= 0)) {
      return alert("Please fill all item details correctly.");
    }

    setLoading(true);
    try {
      const res = await api.post('/billing/invoice', { 
        patientName: patientName.trim(), 
        items 
      });
      alert("Invoice generated successfully!");
      setItems([{ productName: '', quantity: 1, rate: 0 }]);
      setPatientName("");
      fetchData();
      
      // Auto trigger print for the new invoice
      handlePrint(res.data);
    } catch (error) {
      console.error("Failed to generate invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (invoice: any) => {
    setPrintData(invoice);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <Receipt className="w-8 h-8 mr-3 text-blue-600" />
          Billing & Invoices
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* Generate Invoice Form */}
        <Card className="border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Patient Name <span className="text-red-500">*</span></Label>
                <Input 
                  value={patientName} 
                  onChange={e => setPatientName(e.target.value)} 
                  placeholder="Enter patient name..." 
                  required 
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-slate-700">Line Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Product/Service</Label>
                      <Input 
                        value={item.productName} 
                        onChange={e => updateItem(index, 'productName', e.target.value)} 
                        placeholder="e.g. Eyedrops / Frame" 
                        required 
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input 
                        type="number" min="1" 
                        value={item.quantity} 
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} 
                        required 
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Rate (₹)</Label>
                      <Input 
                        type="number" min="0" step="0.01" 
                        value={item.rate} 
                        onChange={e => updateItem(index, 'rate', parseFloat(e.target.value))} 
                        required 
                      />
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border flex flex-col items-end space-y-1">
                <div className="flex justify-between w-48 text-sm">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-sm">
                  <span className="text-slate-500">GST (18%):</span>
                  <span className="font-medium">₹{(calculateSubtotal() * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-lg font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{(calculateSubtotal() * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <Button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "Processing..." : "Generate Invoice & Print"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card className="border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices generated yet</TableCell></TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                      <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.patientName || inv.patient?.name || 'Walk-in'}</TableCell>
                      <TableCell className="font-bold">₹{inv.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handlePrint(inv)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Thermal Receipt Print Layout (Hidden unless printing) */}
      <div className="hidden print:block absolute top-0 left-0 w-[80mm] bg-white text-black text-sm font-mono leading-tight">
        {printData && (
          <div className="p-2 border-b-2 border-dashed border-black pb-4 mb-4">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase mb-1">VisionCare Clinic</h1>
              <p className="text-xs">123 Health Street, Medical District</p>
              <p className="text-xs">Ph: +91 9876543210</p>
              <p className="text-xs">GSTIN: 22AAAAA0000A1Z5</p>
            </div>
            
            <div className="border-t border-b border-dashed border-black py-2 mb-4 space-y-1">
              <p><strong>Invoice:</strong> {printData.invoiceNo}</p>
              <p><strong>Date:</strong> {new Date(printData.createdAt).toLocaleString()}</p>
              <p><strong>Patient:</strong> {printData.patientName || printData.patient?.name || 'Walk-in'}</p>
              {printData.patient?.patientCode && <p><strong>Pt. ID:</strong> {printData.patient.patientCode}</p>}
            </div>

            <table className="w-full mb-4 text-xs">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left pb-1">Item</th>
                  <th className="text-right pb-1">Qty</th>
                  <th className="text-right pb-1">Amt</th>
                </tr>
              </thead>
              <tbody>
                {printData.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-1 pr-2">{item.productName}</td>
                    <td className="text-right py-1 align-top">{item.quantity}</td>
                    <td className="text-right py-1 align-top">{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-black pt-2 space-y-1 text-right">
              <p>Subtotal: {printData.subtotal.toFixed(2)}</p>
              <p>GST: {printData.gstAmount.toFixed(2)}</p>
              <p className="text-lg font-bold mt-2 pt-2 border-t border-black">
                TOTAL: ₹{printData.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-dashed border-black text-xs">
              <p className="font-bold">Thank You for visiting!</p>
              <p className="mt-1">For appointments, please call.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
