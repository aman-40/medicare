import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Receipt, Plus, Trash2, Printer, Search, AlertCircle } from "lucide-react";
import api from "../../api/axios";

export default function Billing() {
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [printData, setPrintData] = useState<any>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoices();
    
    // Close suggestions on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await api.get(`/medicines/search?q=${searchQuery}`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
        }
      };
      const debounce = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchInvoices = async () => {
    try {
      const invoicesRes = await api.get('/invoices');
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    }
  };

  const handleSelectMedicine = (medicine: any) => {
    // Check if already exists in items
    const existingIndex = items.findIndex(i => i.medicineId === medicine.id);
    if (existingIndex >= 0) {
      const newItems = [...items];
      if (newItems[existingIndex].quantity < medicine.stock) {
        updateItemQuantity(existingIndex, newItems[existingIndex].quantity + 1, medicine.stock);
      } else {
        alert("Cannot add more than available stock.");
      }
    } else {
      setItems([...items, {
        medicineId: medicine.id,
        productName: medicine.name,
        batchNo: medicine.batchNo,
        quantity: 1,
        rate: medicine.sellingPrice,
        gst: medicine.gstPercent || 0,
        total: medicine.sellingPrice + (medicine.sellingPrice * (medicine.gstPercent || 0) / 100),
        maxStock: medicine.stock
      }]);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const updateItemQuantity = (index: number, qty: number, maxStock: number) => {
    if (qty > maxStock) {
      alert(`Only ${maxStock} items available in stock.`);
      qty = maxStock;
    }
    if (qty < 1) qty = 1;
    
    const newItems = [...items];
    const rate = newItems[index].rate;
    const gst = newItems[index].gst;
    
    newItems[index].quantity = qty;
    newItems[index].total = (rate * qty) + ((rate * qty) * (gst / 100));
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.rate * item.quantity), 0);
  };

  const calculateGST = () => {
    return items.reduce((acc, item) => acc + ((item.rate * item.quantity) * (item.gst / 100)), 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateGST() - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Please add at least one medicine.");

    setLoading(true);
    try {
      const payload = {
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        discount,
        items: items.map(i => ({
          medicineId: i.medicineId,
          productName: i.productName,
          quantity: i.quantity,
          rate: i.rate,
          gst: i.gst,
          total: i.total
        }))
      };

      const res = await api.post('/invoices', payload);
      alert("Invoice generated successfully!");
      setItems([]);
      setPatientName("");
      setMobileNumber("");
      setDiscount(0);
      fetchInvoices();
      
      // Auto trigger print for the new invoice
      handlePrint(res.data);
    } catch (error: any) {
      console.error("Failed to generate invoice", error);
      alert(error.response?.data?.message || "Failed to generate invoice");
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
          Pharmacy Billing
        </h1>
        <Button variant="outline" onClick={() => {
            setItems([]);
            setPatientName("");
            setMobileNumber("");
            setDiscount(0);
        }}>
          New Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:hidden">
        {/* Generate Invoice Form */}
        <Card className="border-2 border-slate-200 shadow-sm xl:col-span-2">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-3">
            <CardTitle className="text-lg">Create Invoice</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient Name</Label>
                  <Input 
                    value={patientName} 
                    onChange={e => setPatientName(e.target.value)} 
                    placeholder="Enter patient name..." 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input 
                    value={mobileNumber} 
                    onChange={e => setMobileNumber(e.target.value)} 
                    placeholder="Enter mobile number..." 
                  />
                </div>
              </div>

              {/* Medicine Search Section */}
              <div className="space-y-2 relative" ref={searchRef}>
                <Label>Search Medicine</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by Medicine Name, Brand, or Generic Name..." 
                    className="pl-9 text-lg py-6"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((med) => (
                      <div 
                        key={med.id} 
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                        onClick={() => handleSelectMedicine(med)}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{med.name}</p>
                          <p className="text-xs text-slate-500">{med.brandName || med.genericName || med.company} | Batch: {med.batchNo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₹{med.sellingPrice.toFixed(2)}</p>
                          <p className={`text-xs ${med.stock > 10 ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                            Stock: {med.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showSuggestions && searchQuery.length > 1 && suggestions.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-4 text-center text-slate-500">
                    No medicines found or out of stock.
                  </div>
                )}
              </div>

              {/* Billing Table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="w-24 text-center">Qty</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead className="text-right">GST %</TableHead>
                      <TableHead className="text-right">Total (₹)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Search and add medicines to the bill
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-xs text-slate-500">{item.batchNo}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="1" 
                              max={item.maxStock}
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1, item.maxStock)}
                              className="w-20 text-center mx-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.gst}%</TableCell>
                          <TableCell className="text-right font-bold text-blue-600">{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-4">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST Amount</span>
                    <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 items-center">
                    <span>Discount</span>
                    <Input 
                      type="number" 
                      min="0" 
                      value={discount} 
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                      className="w-24 text-right h-8"
                    />
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold text-slate-800">
                    <span>Grand Total</span>
                    <span className="text-blue-600">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                  <Button disabled={loading || items.length === 0} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg mt-4">
                    {loading ? "Processing..." : "Save & Print Invoice"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card className="border-2 border-slate-200 shadow-sm xl:col-span-1">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-3">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-slate-400">No invoices yet</TableCell></TableRow>
                  ) : (
                    invoices.slice(0, 10).map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium text-xs text-blue-600">{inv.invoiceNo}</TableCell>
                        <TableCell className="text-sm truncate max-w-[100px]">{inv.patientName || inv.patient?.name || 'Walk-in'}</TableCell>
                        <TableCell className="text-right font-bold text-sm">₹{inv.grandTotal ? inv.grandTotal.toFixed(2) : inv.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handlePrint(inv)}>
                            <Printer className="w-4 h-4 text-slate-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thermal Receipt Print Layout (Hidden unless printing) */}
      <div className="hidden print:block absolute top-0 left-0 w-[80mm] bg-white text-black text-sm font-mono leading-tight">
        {printData && (
          <div className="p-2 border-b-2 border-dashed border-black pb-4 mb-4">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase mb-1">New Manoj Medical Hall</h1>
              <p className="text-xs">Your Shop Address Here</p>
              <p className="text-xs">City, State, ZIP</p>
              <p className="text-xs">Ph: +91 9999999999</p>
            </div>
            
            <div className="border-t border-b border-dashed border-black py-2 mb-4 space-y-1">
              <p><strong>Invoice:</strong> {printData.invoiceNo}</p>
              <p><strong>Date:</strong> {new Date(printData.createdAt).toLocaleString()}</p>
              <p><strong>Patient:</strong> {printData.patientName || printData.patient?.name || 'Walk-in'}</p>
              {printData.mobileNumber && <p><strong>Mobile:</strong> {printData.mobileNumber}</p>}
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
                    <td className="text-right py-1 align-top">{(item.total || item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-black pt-2 space-y-1 text-right">
              <p>Subtotal: {printData.subtotal.toFixed(2)}</p>
              <p>GST: {printData.gstAmount.toFixed(2)}</p>
              {printData.discount > 0 && <p>Discount: -{printData.discount.toFixed(2)}</p>}
              <p className="text-lg font-bold mt-2 pt-2 border-t border-black">
                TOTAL: ₹{(printData.grandTotal || printData.totalAmount).toFixed(2)}
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
