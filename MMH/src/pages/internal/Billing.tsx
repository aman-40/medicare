import { useState, useEffect, useRef } from "react";
import { getExpiryStatus } from "../../components/inventory/MedicineTable";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Receipt, Plus, Trash2, Printer, Search, AlertCircle, Download } from "lucide-react";
import api from "../../api/axios";

export default function Billing() {
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [discount, setDiscount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [pricingTier, setPricingTier] = useState<'CUSTOMER' | 'DOCTOR'>('CUSTOMER');

  const [printData, setPrintData] = useState<any>(null);
  
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDays, setExportDays] = useState("7");
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Helper to get unit options for a medicine
  const getUnitOptions = (medicine: any) => {
    const saleUnit = medicine?.saleUnit || 'piece';
    const stripsPerBox = Number(medicine?.stripsPerBox) || 1;
    const unitsPerStrip = Number(medicine?.unitsPerStrip) || 1;

    if (saleUnit === 'box') {
      return [
        { label: `Box (${stripsPerBox} str × ${unitsPerStrip})`, value: 'box', conversion: stripsPerBox * unitsPerStrip },
        { label: `Strip (${unitsPerStrip} tabs)`, value: 'strip', conversion: unitsPerStrip },
        { label: 'Piece / Tab', value: 'piece', conversion: 1 },
      ];
    } else if (saleUnit === 'strip') {
      return [
        { label: `Strip (${unitsPerStrip} tabs)`, value: 'strip', conversion: unitsPerStrip },
        { label: 'Piece / Tab', value: 'piece', conversion: 1 },
      ];
    } else {
      return [
        { label: 'Piece', value: 'piece', conversion: 1 },
      ];
    }
  };

  // Helper to calculate rate for a specific unit and tier
  const calculateRate = (medicine: any, saleType: string, tier: 'CUSTOMER' | 'DOCTOR') => {
    const customerBase = Number(medicine?.sellingPrice) || 0;
    const doctorBase = (medicine?.doctorPrice !== null && medicine?.doctorPrice !== undefined && medicine?.doctorPrice !== '')
      ? Number(medicine.doctorPrice)
      : customerBase;

    const basePrice = tier === 'DOCTOR' ? doctorBase : customerBase;
    const saleUnit = medicine?.saleUnit || 'piece';
    const stripsPerBox = Number(medicine?.stripsPerBox) || 1;
    const unitsPerStrip = Number(medicine?.unitsPerStrip) || 1;

    if (saleUnit === 'box') {
      if (saleType === 'box') return basePrice;
      if (saleType === 'strip') return Number((basePrice / stripsPerBox).toFixed(2));
      if (saleType === 'piece') return Number((basePrice / (stripsPerBox * unitsPerStrip)).toFixed(2));
    } else if (saleUnit === 'strip') {
      if (saleType === 'strip') return basePrice;
      if (saleType === 'piece') return Number((basePrice / unitsPerStrip).toFixed(2));
    }
    return basePrice;
  };

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

  const handlePriceTierChange = (newTier: 'CUSTOMER' | 'DOCTOR') => {
    setPricingTier(newTier);
    // Recalculate rates for all existing items using their current unit
    setItems(prev => prev.map(item => {
      const newRate = calculateRate(item.medicineData, item.saleType, newTier);
      return {
        ...item,
        tier: newTier,
        rate: newRate,
        total: (newRate - (item.discount || 0)) * item.quantity
      };
    }));
  };

  const handleSelectMedicine = (medicine: any) => {
    const unitOpts = getUnitOptions(medicine);
    const defaultOpt = unitOpts[0];
    const initialRate = calculateRate(medicine, defaultOpt.value, pricingTier);

    const existingIndex = items.findIndex(i => i.medicineId === medicine.id);
    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const maxQty = Math.floor(medicine.stock / existing.unitConversionValue);
      if (existing.quantity < maxQty) {
        updateItemQuantity(existingIndex, existing.quantity + 1, existing.saleType, existing.unitConversionValue);
      } else {
        alert(`Cannot add more than available stock (${medicine.stock} units).`);
      }
    } else {
      setItems([...items, {
        medicineId: medicine.id,
        productName: `${medicine.name} (${medicine.productType || 'Medicine'})`,
        batchNo: medicine.batchNo,
        quantity: 1,
        saleType: defaultOpt.value,
        unitConversionValue: defaultOpt.conversion,
        tier: pricingTier,
        rate: initialRate,
        discount: 0,
        total: initialRate,
        maxStock: medicine.stock,
        medicineData: medicine
      }]);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const updateItemUnit = (index: number, newSaleType: string, newConversion: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const newRate = calculateRate(item.medicineData, newSaleType, item.tier || pricingTier);
    
    // Check max stock with new conversion
    const maxQty = Math.floor(item.maxStock / newConversion);
    let qty = item.quantity;
    if (qty > maxQty) {
      qty = Math.max(1, maxQty);
    }

    newItems[index] = {
      ...item,
      saleType: newSaleType,
      unitConversionValue: newConversion,
      rate: newRate,
      quantity: qty,
      total: (newRate - (item.discount || 0)) * qty
    };
    setItems(newItems);
  };

  const updateItemTier = (index: number, newTier: 'CUSTOMER' | 'DOCTOR') => {
    const newItems = [...items];
    const item = newItems[index];
    const newRate = calculateRate(item.medicineData, item.saleType, newTier);

    newItems[index] = {
      ...item,
      tier: newTier,
      rate: newRate,
      total: (newRate - (item.discount || 0)) * item.quantity
    };
    setItems(newItems);
  };

  const updateItemRate = (index: number, manualRate: number) => {
    const newItems = [...items];
    const item = newItems[index];
    newItems[index] = {
      ...item,
      rate: manualRate,
      total: (manualRate - (item.discount || 0)) * item.quantity
    };
    setItems(newItems);
  };

  const updateItemQuantity = (index: number, qty: number, saleType?: string, unitConversionValue?: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const conv = unitConversionValue ?? item.unitConversionValue;
    const st = saleType ?? item.saleType;
    
    const deductedStock = qty * conv;
    if (deductedStock > item.maxStock) {
      alert(`Only ${item.maxStock} base units available in stock. You requested ${deductedStock}.`);
      qty = Math.floor(item.maxStock / conv);
      if (qty < 1) qty = 1;
    }
    
    newItems[index].quantity = qty;
    newItems[index].saleType = st;
    newItems[index].unitConversionValue = conv;
    const discountAmt = newItems[index].discount || 0;
    newItems[index].total = (newItems[index].rate - discountAmt) * qty;
    setItems(newItems);
  };

  const updateItemDiscount = (index: number, discountAmt: number) => {
    const newItems = [...items];
    const item = newItems[index];
    newItems[index].discount = discountAmt;
    newItems[index].total = (item.rate - discountAmt) * item.quantity;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.rate * item.quantity), 0);
  };

  const calculateTotalDiscount = () => {
    const itemDiscounts = items.reduce((acc, item) => acc + ((item.discount || 0) * item.quantity), 0);
    return itemDiscounts + discount; // include global discount if any
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Please add at least one medicine.");

    setLoading(true);
    try {
      const payload = {
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        doctorName: doctorName.trim(),
        discount: discount, // global discount
        paymentMethod,
        items: items.map(item => ({
          medicineId: item.medicineId,
          productName: item.productName,
          quantitySold: item.quantity,
          saleType: item.saleType,
          unitConversionValue: item.unitConversionValue,
          deductedStockUnits: item.quantity * item.unitConversionValue,
          rate: item.rate,
          discount: (item.discount || 0) * item.quantity,
          total: item.total
        })),
      };

      const res = await api.post('/invoices', payload);
      alert("Invoice generated successfully!");
      setItems([]);
      setPatientName("");
      setMobileNumber("");
      setDoctorName("");
      setDiscount(0);
      setPaymentMethod("CASH");
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

  const handleExport = () => {
    const days = parseInt(exportDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = invoices.filter(inv => {
      if (exportDays === "ALL") return true;
      return new Date(inv.createdAt) >= cutoffDate;
    });

    if (filtered.length === 0) {
      alert("No invoices found for the selected time period.");
      return;
    }

    let csv = "Invoice No,Date,Patient,Payment Method,Total Amount\n";
    let grandTotal = 0;

    filtered.forEach(inv => {
      const date = new Date(inv.createdAt).toLocaleDateString();
      const patient = inv.patientName || inv.patient?.name || 'Walk-in';
      const method = inv.paymentMethod || 'CASH';
      const total = inv.grandTotal || inv.totalAmount;
      grandTotal += total;
      
      csv += `${inv.invoiceNo},${date},${patient},${method},${total.toFixed(2)}\n`;
    });

    csv += `\n,,,GRAND TOTAL,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Invoice_History_Past_${exportDays}_Days.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <Receipt className="w-8 h-8 mr-3 text-blue-600" />
          Pharmacy Billing
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setExportOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
          <Button variant="outline" onClick={() => {
              setItems([]);
              setPatientName("");
              setMobileNumber("");
              setDoctorName("");
              setDiscount(0);
          }}>
            New Bill
          </Button>
        </div>
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
                      placeholder="e.g. John Doe" 
                      value={patientName} 
                      onChange={(e) => setPatientName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor Name (Optional)</Label>
                    <Input 
                      placeholder="e.g. Dr. Smith" 
                      value={doctorName} 
                      onChange={(e) => setDoctorName(e.target.value)} 
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

              {/* Medicine Search Section & Pricing Tier Toggle */}
              <div className="space-y-2 relative" ref={searchRef}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>Search Medicine</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Mode:</span>
                    <div className="inline-flex rounded-md shadow-xs" role="group">
                      <button
                        type="button"
                        onClick={() => handlePriceTierChange('CUSTOMER')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-l-md border transition-all ${
                          pricingTier === 'CUSTOMER'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Customer Price (MRP)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceTierChange('DOCTOR')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-r-md border transition-all ${
                          pricingTier === 'DOCTOR'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Doctor Price
                      </button>
                    </div>
                  </div>
                </div>

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
                    {suggestions.map((med) => {
                      const exp = getExpiryStatus(med.expiryDate);
                      return (
                        <div 
                          key={med.id} 
                          className={`p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 flex justify-between items-center ${
                            exp.status === 'EXPIRED' ? 'bg-red-50/50' : exp.status === 'EXPIRING_SOON' ? 'bg-amber-50/40' : ''
                          }`}
                          onClick={() => handleSelectMedicine(med)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">{med.name}</p>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border capitalize">
                                {med.productType || 'tablet'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                                {med.saleUnit || 'piece'}
                              </span>
                              {exp.status === 'EXPIRED' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                                  EXPIRED
                                </span>
                              )}
                              {exp.status === 'EXPIRING_SOON' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950">
                                  EXPIRING SOON
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {med.brandName || med.genericName || med.company || 'Direct'} | Batch: {med.batchNo || '-'}
                              {med.saleUnit === 'box' && ` (${med.stripsPerBox || 10} str × ${med.unitsPerStrip || 10} tabs/str)`}
                              {med.saleUnit === 'strip' && ` (${med.unitsPerStrip || 10} tabs/strip)`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-xs font-semibold text-emerald-700">Cust: ₹{med.sellingPrice.toFixed(2)}</span>
                              <span className="text-xs font-semibold text-blue-700">Dr: ₹{(med.doctorPrice || med.sellingPrice).toFixed(2)}</span>
                            </div>
                            <p className={`text-xs ${med.stock > 10 ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                              Stock: {med.stock} units
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
                      <TableHead className="w-32 text-center">Unit</TableHead>
                      <TableHead className="w-20 text-center">Qty</TableHead>
                      <TableHead className="w-24 text-center">Price Mode</TableHead>
                      <TableHead className="w-24 text-right">Rate (₹)</TableHead>
                      <TableHead className="w-[100px] text-right">Disc/Unit</TableHead>
                      <TableHead className="w-[100px] text-right">Total</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          Search and add medicines to the bill
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => {
                        const unitOpts = getUnitOptions(item.medicineData);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <div>
                                <span className="text-slate-800">{item.productName}</span>
                                {item.medicineData?.saleUnit && (
                                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 uppercase">
                                    [{item.medicineData.saleUnit}]
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">{item.batchNo || 'N/A'}</TableCell>
                            <TableCell>
                              <select 
                                className="border-slate-200 rounded-md text-xs p-1 w-full bg-white capitalize"
                                value={item.saleType}
                                onChange={(e) => {
                                  const selectedOpt = unitOpts.find(o => o.value === e.target.value) || unitOpts[0];
                                  updateItemUnit(index, selectedOpt.value, selectedOpt.conversion);
                                }}
                              >
                                {unitOpts.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min="1" 
                                step="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 text-center mx-auto p-1 h-8"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                onClick={() => updateItemTier(index, item.tier === 'DOCTOR' ? 'CUSTOMER' : 'DOCTOR')}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
                                  item.tier === 'DOCTOR'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                                title="Click to toggle Customer / Doctor price"
                              >
                                {item.tier === 'DOCTOR' ? 'Dr Rate' : 'Customer'}
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => updateItemRate(index, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right ml-auto h-8 p-1 font-semibold text-slate-800"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                min="0"
                                value={item.discount || 0}
                                onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0)}
                                className="w-16 text-right ml-auto h-8 p-1"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-800">
                              ₹{item.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                  <div className="flex justify-between items-center text-red-600 font-medium">
                    <span>Total Discount</span>
                    <span>- ₹{calculateTotalDiscount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 items-center">
                    <span>Global Discount</span>
                    <Input 
                      type="number" 
                      min="0" 
                      value={discount} 
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                      className="w-24 text-right h-8"
                    />
                  </div>
                  <div className="flex justify-between text-slate-600 items-center pt-2">
                    <span>Payment Method</span>
                    <select 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="border-slate-200 rounded-md text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CASH">CASH</option>
                      <option value="ONLINE">ONLINE</option>
                    </select>
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
      <div className="hidden print:block absolute top-0 left-0 w-[148mm] bg-white text-black text-sm font-sans leading-snug p-4 border border-slate-300">
        {printData && (
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-semibold leading-tight">
                <p>DL No. 12345678RRTT</p>
                <p>RLF 12345678RRTT</p>
              </div>
              <div className="text-xs font-semibold text-right leading-tight">
                <p>Mo. 8340508210</p>
                <p>9123456789</p>
              </div>
            </div>

            <div className="text-center mb-4">
              <h1 className="text-2xl font-black tracking-tight uppercase">MANOJ MEDICAL HALL</h1>
              <p className="text-sm font-semibold border-b border-black inline-block pb-0.5 mt-1">
                Makhdumpur Dih, Makhdumpur, Jehanabad, Bihar 804422
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-xs font-medium">
              <div className="flex"><span className="w-12">No.</span> <span className="border-b border-dashed border-slate-400 flex-1">{printData.invoiceNo}</span></div>
              <div className="flex"><span className="w-12 text-right pr-2">Date</span> <span className="border-b border-dashed border-slate-400 flex-1">{new Date(printData.createdAt).toLocaleDateString()}</span></div>
              
              <div className="col-span-2 flex mt-1"><span className="whitespace-nowrap mr-2">Sold to Shree</span> <span className="border-b border-dashed border-slate-400 flex-1">{printData.patientName || printData.patient?.name || 'Walk-in'}</span></div>
              
              <div className="col-span-2 flex mt-1"><span className="whitespace-nowrap mr-2">Add & Mo.</span> <span className="border-b border-dashed border-slate-400 flex-1">{printData.mobileNumber || ''}</span></div>
              
              <div className="col-span-2 flex mt-1"><span className="whitespace-nowrap mr-2">Prescribe by Dr.</span> <span className="border-b border-dashed border-slate-400 flex-1">{printData.doctorName || ''}</span></div>
            </div>

            <table className="w-full mb-2 text-xs border border-black text-center">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-1 font-semibold w-12">Qnt.</th>
                  <th className="border-r border-black p-1 font-semibold text-left">Particulars</th>
                  <th className="border-r border-black p-1 font-semibold w-24">Company<br/>Name</th>
                  <th className="border-r border-black p-1 font-semibold w-24">Batch No./<br/>Ex. Date</th>
                  <th className="border-r border-slate-300 p-2 text-right text-xs">Discount</th>
                  <th className="p-1 font-semibold w-20">Amount</th>
                </tr>
              </thead>
              <tbody>
                {printData.items?.map((item: any, i: number) => (
                  <tr key={item.id} className={i < (printData.items.length - 1) ? "border-b border-slate-300" : ""}>
                    <td className="border-r border-black py-1 px-1 align-top">{item.quantitySold || item.quantity} {item.saleType || ''}</td>
                    <td className="border-r border-black py-1 px-1 text-left align-top font-medium">{item.productName.split('(')[0]}</td>
                    <td className="border-r border-black py-1 px-1 align-top break-all">{item.medicine?.company || ''}</td>
                    <td className="border-r border-black py-1 px-1 align-top">{item.medicine?.batchNo || ''}<br/>{item.medicine?.expiryDate ? new Date(item.medicine.expiryDate).toLocaleDateString() : ''}</td>
                    <td className="py-1 px-1 align-top text-right">{(item.total || item.amount).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Empty rows to fill space */}
                {Array.from({ length: Math.max(0, 8 - (printData.items?.length || 0)) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border-r border-black py-3 px-1"></td>
                    <td className="border-r border-black py-3 px-1"></td>
                    <td className="border-r border-black py-3 px-1"></td>
                    <td className="border-r border-black py-3 px-1"></td>
                    <td className="py-3 px-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex text-xs font-semibold border border-black mb-4">
              <div className="flex-1 text-right p-1 border-r border-black pt-1">
                {printData.discount > 0 && <span className="mr-4 font-normal">Discount: -{printData.discount.toFixed(2)}</span>}
                Total
              </div>
              <div className="w-20 p-1 text-right pt-1 font-bold">
                {(printData.grandTotal || printData.totalAmount).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-between items-end mt-8 text-xs font-semibold">
              <div>बिका हुआ दवाई वापस नहीं होगी ।</div>
              <div className="text-center">
                <p className="mb-6">Proprietor</p>
                <p>Manoj Kumar</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Invoice History</DialogTitle>
            <DialogDescription className="hidden">Export history to CSV</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Time Period</Label>
              <select 
                value={exportDays} 
                onChange={(e) => setExportDays(e.target.value)}
                className="w-full border-slate-200 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Past 24 Hours</option>
                <option value="7">Past 7 Days</option>
                <option value="30">Past 30 Days</option>
                <option value="ALL">All Time</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
