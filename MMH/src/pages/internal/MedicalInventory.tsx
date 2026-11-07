import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Package, AlertTriangle, Clock, Plus, Save, Trash2, RefreshCw, Upload, Download, Settings, ShoppingCart, ArrowLeftRight, Search, X } from "lucide-react";
import { useNavigate } from "react-router";
import api from "../../api/axios";

export const getExpiryStatus = (dateStr: string) => {
  if (!dateStr) return { status: 'NORMAL' as const, label: '', subText: '', days: 0 };
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return { status: 'NORMAL' as const, label: '', subText: '', days: 0 };

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
  return { status: 'NORMAL' as const, label: 'Valid', subText: `${diffDays}d left`, days: diffDays };
};

export const MEDICINE_TYPES = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'drop', label: 'Drop' },
  { value: 'other', label: 'Other' },
];

export const MEDICINE_UNITS = [
  { value: 'strip', label: 'Strip' },
  { value: 'piece', label: 'Piece' },
  { value: 'box', label: 'Box' },
];

export default function MedicalInventory() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRED' | 'EXPIRING_SOON'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Custom Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modals for Stock Adjustments and Purchases
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [activeMedicine, setActiveMedicine] = useState<any>(null);
  
  const [adjustType, setAdjustType] = useState('Addition');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  
  const [purchaseQty, setPurchaseQty] = useState('');
  const [purchaseFree, setPurchaseFree] = useState('0');
  const [purchaseTotalAmt, setPurchaseTotalAmt] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, medsRes] = await Promise.all([
        api.get('/inventory/dashboard'),
        api.get('/inventory/medicines')
      ]);
      setStats(statsRes.data);
      
      const formattedMeds = medsRes.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        genericName: m.genericName || '',
        company: m.company || '',
        batchNo: m.batchNo,
        stock: m.stock,
        minimumStockAlert: m.minimumStockAlert || 10,
        purchasePrice: m.purchasePrice,
        sellingPrice: m.sellingPrice,
        doctorPrice: m.doctorPrice !== null && m.doctorPrice !== undefined ? m.doctorPrice : m.sellingPrice,
        purchaseDate: m.purchaseDate ? new Date(m.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: new Date(m.expiryDate).toISOString().split('T')[0],
        supplierId: m.supplierId,
        supplierName: m.supplier?.name || '',
        supplierPhone: m.supplier?.phone || '',
        productType: m.productType || 'tablet',
        saleUnit: m.saleUnit || (m.productType === 'tablet' || m.productType === 'capsule' ? 'strip' : 'piece'),
        stripsPerBox: m.stripsPerBox || '',
        unitsPerStrip: m.unitsPerStrip || '',
        bottleVolume: m.bottleVolume || '',
        isDirty: false,
        isNew: false
      }));
      setMedicines(formattedMeds);
    } catch (error) {
      console.error("Failed to fetch inventory data", error);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      name: '',
      genericName: '',
      company: '',
      batchNo: '',
      stock: '',
      minimumStockAlert: 10,
      purchasePrice: '',
      sellingPrice: '',
      doctorPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      supplierName: '',
      supplierPhone: '',
      productType: 'tablet',
      saleUnit: 'strip',
      stripsPerBox: 10,
      unitsPerStrip: 10,
      bottleVolume: '',
      isDirty: true,
      isNew: true
    };
    setMedicines([newRow, ...medicines]);
  };

  const handleChange = (id: string, field: string, value: any) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value, isDirty: true };
        if (field === 'productType') {
          if ((value === 'tablet' || value === 'capsule') && updated.saleUnit === 'piece') {
            updated.saleUnit = 'strip';
          } else if ((value === 'ointment' || value === 'syrup' || value === 'drop') && updated.saleUnit === 'strip') {
            updated.saleUnit = 'piece';
          }
        }
        return updated;
      }
      return m;
    }));
  };

  const saveSingleRow = async (med: any) => {
    if (!med.name || med.stock === '' || !med.purchasePrice || !med.sellingPrice || !med.expiryDate) {
      throw new Error(`Please fill required fields (Name, Stock, Cost Price, Customer Price, Expiry Date) for ${med.name || 'new medicine'}.`);
    }

    const payload = {
      name: med.name,
      genericName: med.genericName,
      company: med.company,
      batchNo: (med.batchNo && med.batchNo.trim()) ? med.batchNo.trim() : '-',
      stock: med.stock, // Only used when isNew is true to set initial stock
      minimumStockAlert: med.minimumStockAlert,
      purchasePrice: parseFloat(med.purchasePrice),
      sellingPrice: parseFloat(med.sellingPrice),
      doctorPrice: med.doctorPrice !== '' && med.doctorPrice !== undefined ? parseFloat(med.doctorPrice) : parseFloat(med.sellingPrice),
      purchaseDate: med.purchaseDate,
      expiryDate: med.expiryDate,
      supplierId: med.supplierId,
      supplierName: (med.supplierName && med.supplierName.trim()) ? med.supplierName.trim() : 'General / Direct',
      supplierPhone: med.supplierPhone,
      productType: med.productType || 'tablet',
      saleUnit: med.saleUnit || 'strip',
      stripsPerBox: med.stripsPerBox ? parseInt(med.stripsPerBox) : null,
      unitsPerStrip: med.unitsPerStrip ? parseInt(med.unitsPerStrip) : null,
      bottleVolume: med.bottleVolume || null
    };

    if (med.isNew) {
      await api.post('/inventory/medicines', payload);
    } else {
      await api.put(`/inventory/medicines/${med.id}`, payload);
    }
  };

  const handleSaveRow = async (med: any) => {
    setLoadingRowId(med.id);
    try {
      await saveSingleRow(med);
      fetchData();
    } catch (error: any) {
      console.error("Failed to save row", error);
      alert(error.message || "Error saving medicine");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleSaveAll = async () => {
    const dirtyRows = medicines.filter(m => m.isDirty);
    if (dirtyRows.length === 0) return;

    setIsSavingAll(true);
    let successCount = 0;
    const errors: string[] = [];

    for (const med of dirtyRows) {
      try {
        await saveSingleRow(med);
        successCount++;
      } catch (err: any) {
        errors.push(err.message || `Failed to save ${med.name}`);
      }
    }

    setIsSavingAll(false);
    fetchData();

    if (errors.length > 0) {
      alert(`Saved ${successCount} items. Errors:\n${errors.join('\n')}`);
    }
  };

  const confirmDelete = (id: string, isNew: boolean) => {
    if (isNew) {
      setMedicines(prev => prev.filter(m => m.id !== id));
      return;
    }
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;

    setLoadingRowId(deleteConfirmId);
    try {
      await api.delete(`/inventory/medicines/${deleteConfirmId}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Error deleting medicine");
    } finally {
      setLoadingRowId(null);
      setDeleteConfirmId(null);
    }
  };

  const handleStockAdjustment = async () => {
    if (!adjustQty || !adjustReason) return alert("Fill all fields");
    setLoadingRowId(activeMedicine.id);
    try {
      await api.post('/adjustments', {
        medicineId: activeMedicine.id,
        adjustmentType: adjustType,
        quantity: adjustQty,
        reason: adjustReason
      });
      alert("Stock Adjusted!");
      setAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Failed to adjust stock: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingRowId(null);
    }
  };

  const handlePurchase = async () => {
    if (!purchaseQty || !purchaseTotalAmt) return alert("Fill required fields");
    setLoadingRowId(activeMedicine.id);
    try {
      await api.post('/purchases', {
        supplierId: activeMedicine.supplierId || "", // If empty, backend might fail, but we'll fix backend too
        invoiceNo: `INV-${Date.now()}`,
        items: [{
          medicineId: activeMedicine.id,
          batchNo: activeMedicine.batchNo,
          expiryDate: activeMedicine.expiryDate,
          quantity: parseInt(purchaseQty), // Treat this as strips purchased if tablet
          freeQuantity: parseInt(purchaseFree),
          purchasePrice: activeMedicine.purchasePrice,
          mrp: activeMedicine.sellingPrice,
          amount: parseFloat(purchaseTotalAmt)
        }]
      });
      alert("Purchase Recorded!");
      setPurchaseModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Failed to record purchase: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "Name,Company,ProductType,SaleUnit,StripsPerBox,UnitsPerStrip,BatchNo,Stock,CostPrice,CustomerPrice,DoctorPrice,ExpiryDate,SupplierName\n";
    const sample = "Paracetamol 500mg,Glaxo,tablet,strip,10,10,B-12345,100,15.00,25.00,20.00,2026-12-31,PharmaCorp\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "medicine_inventory_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCSV(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error("CSV must contain a header row and at least one data row.");

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const parsedMedicines = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, index) => {
            if (h === 'name') obj.name = vals[index];
            if (h === 'company') obj.company = vals[index];
            if (h === 'batchno') obj.batchNo = vals[index] || '-';
            if (h === 'stock') obj.stock = vals[index];
            if (h === 'costprice' || h === 'purchaseprice' || h === 'cost') obj.purchasePrice = vals[index];
            if (h === 'customerprice' || h === 'sellingprice' || h === 'price') obj.sellingPrice = vals[index];
            if (h === 'doctorprice' || h === 'drprice') obj.doctorPrice = vals[index];
            if (h === 'expirydate') obj.expiryDate = vals[index];
            if (h === 'suppliername') obj.supplierName = vals[index] || 'General / Direct';
            if (h === 'producttype' || h === 'type') obj.productType = vals[index];
            if (h === 'saleunit' || h === 'unit') obj.saleUnit = vals[index];
            if (h === 'stripsperbox') obj.stripsPerBox = vals[index];
            if (h === 'unitsperstrip') obj.unitsPerStrip = vals[index];
          });
          if (!obj.doctorPrice && obj.sellingPrice) {
            obj.doctorPrice = obj.sellingPrice;
          }
          parsedMedicines.push(obj);
        }

        const res = await api.post('/inventory/medicines/bulk', { medicines: parsedMedicines });
        alert(`Upload Complete!\nSuccess: ${res.data.successCount}\nErrors: ${res.data.errorCount}`);
        fetchData(); 
      } catch (err: any) {
        alert(`Error processing CSV: ${err.message}`);
      } finally {
        setIsUploadingCSV(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
      setIsUploadingCSV(false);
    };
    reader.readAsText(file);
  };

  const dirtyCount = medicines.filter(m => m.isDirty).length;

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sixtyDaysDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const lowStockCount = useMemo(() => {
    return medicines.filter(m => Number(m.stock) < (m.minimumStockAlert || 10)).length;
  }, [medicines]);

  const expiredCount = useMemo(() => {
    return medicines.filter(m => {
      if (!m.expiryDate) return false;
      return new Date(m.expiryDate) < todayDate;
    }).length;
  }, [medicines, todayDate]);

  const expiringSoonCount = useMemo(() => {
    return medicines.filter(m => {
      if (!m.expiryDate) return false;
      const d = new Date(m.expiryDate);
      return d >= todayDate && d <= sixtyDaysDate;
    }).length;
  }, [medicines, todayDate, sixtyDaysDate]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches = 
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.genericName && m.genericName.toLowerCase().includes(q)) ||
          (m.company && m.company.toLowerCase().includes(q)) ||
          (m.batchNo && m.batchNo.toLowerCase().includes(q)) ||
          (m.supplierName && m.supplierName.toLowerCase().includes(q)) ||
          (m.productType && m.productType.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status filter
      if (filterMode === 'LOW_STOCK') {
        return Number(m.stock) < (m.minimumStockAlert || 10);
      }
      if (filterMode === 'EXPIRED') {
        if (!m.expiryDate) return false;
        return new Date(m.expiryDate) < todayDate;
      }
      if (filterMode === 'EXPIRING_SOON') {
        if (!m.expiryDate) return false;
        const d = new Date(m.expiryDate);
        return d >= todayDate && d <= sixtyDaysDate;
      }
      return true;
    });
  }, [medicines, searchQuery, filterMode, todayDate, sixtyDaysDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Inventory Management
          </h1>
          {filterMode !== 'ALL' && (
            <div className="mt-2 text-sm flex items-center gap-2">
              <span className="text-slate-500">Filtered by:</span>
              <span className={`px-2.5 py-1 rounded-full font-semibold inline-flex items-center text-xs shadow-xs ${
                filterMode === 'LOW_STOCK'
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : filterMode === 'EXPIRED'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {filterMode === 'LOW_STOCK' && 'Low Stock Medicines Only'}
                {filterMode === 'EXPIRED' && 'Expired Medicines Only'}
                {filterMode === 'EXPIRING_SOON' && 'Expiring Soon Medicines Only'}
                <button onClick={() => setFilterMode('ALL')} className="ml-2 hover:opacity-75 font-bold text-sm leading-none">&times;</button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="hidden">Confirm deletion of medicine</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Are you absolutely sure you want to permanently erase this medicine from the inventory? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete} disabled={!!loadingRowId}>
              {loadingRowId ? "Erasing..." : "Yes, Erase It"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* All Medicines */}
        <Card 
          className={`border-2 cursor-pointer transition-all ${filterMode === 'ALL' ? 'bg-blue-100 border-blue-400 shadow-xs' : 'bg-white shadow-sm hover:border-blue-300'}`}
          onClick={() => setFilterMode('ALL')}
        >
          <CardContent className="p-5">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${filterMode === 'ALL' ? 'text-blue-700' : 'text-slate-500'}`}>All Medicines</p>
            <h3 className={`text-3xl font-black ${filterMode === 'ALL' ? 'text-blue-900' : 'text-slate-800'}`}>{medicines.length}</h3>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card 
          className={`border-2 cursor-pointer transition-all ${filterMode === 'LOW_STOCK' ? 'bg-orange-100 border-orange-400 shadow-xs' : 'bg-orange-50/50 border-orange-200 hover:border-orange-300'}`}
          onClick={() => setFilterMode(filterMode === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
        >
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${filterMode === 'LOW_STOCK' ? 'text-orange-800' : 'text-orange-600'}`}>Low Stock</p>
              <h3 className={`text-3xl font-black ${filterMode === 'LOW_STOCK' ? 'text-orange-950' : 'text-orange-700'}`}>{lowStockCount}</h3>
            </div>
            <AlertTriangle className={`w-8 h-8 ${filterMode === 'LOW_STOCK' ? 'text-orange-600' : 'text-orange-400'}`} />
          </CardContent>
        </Card>

        {/* Expired (RED) */}
        <Card 
          className={`border-2 cursor-pointer transition-all ${filterMode === 'EXPIRED' ? 'bg-red-100 border-red-500 shadow-md ring-2 ring-red-400' : 'bg-red-50/50 border-red-200 hover:border-red-400'}`}
          onClick={() => setFilterMode(filterMode === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
        >
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <p className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'EXPIRED' ? 'text-red-900' : 'text-red-600'}`}>Expired</p>
              </div>
              <h3 className={`text-3xl font-black ${filterMode === 'EXPIRED' ? 'text-red-950' : 'text-red-700'}`}>{expiredCount}</h3>
            </div>
            <AlertTriangle className={`w-8 h-8 ${filterMode === 'EXPIRED' ? 'text-red-600' : 'text-red-400'}`} />
          </CardContent>
        </Card>

        {/* Expiring Soon (YELLOWISH / AMBER) */}
        <Card 
          className={`border-2 cursor-pointer transition-all ${filterMode === 'EXPIRING_SOON' ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400' : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'}`}
          onClick={() => setFilterMode(filterMode === 'EXPIRING_SOON' ? 'ALL' : 'EXPIRING_SOON')}
        >
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <p className={`text-xs font-bold uppercase tracking-wider ${filterMode === 'EXPIRING_SOON' ? 'text-amber-900' : 'text-amber-700'}`}>Expiring Soon</p>
              </div>
              <h3 className={`text-3xl font-black ${filterMode === 'EXPIRING_SOON' ? 'text-amber-950' : 'text-amber-700'}`}>{expiringSoonCount}</h3>
            </div>
            <Clock className={`w-8 h-8 ${filterMode === 'EXPIRING_SOON' ? 'text-amber-600' : 'text-amber-400'}`} />
          </CardContent>
        </Card>

        {/* Frames & Lenses */}
        <Card 
          className="border-2 bg-white shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
          onClick={() => navigate('/admin/optical-store')}
        >
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Frames & Lenses</p>
            <h3 className="text-3xl font-black text-slate-800">{stats ? (stats.totalFrames + stats.totalLenses) : 0}</h3>
          </CardContent>
        </Card>
      </div>

      {/* DATABASE TABLE */}
      <Card className="border-2 border-slate-200 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg text-slate-800">Medicine Database</CardTitle>
              {dirtyCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {dirtyCount} unsaved
                </span>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'ALL' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({medicines.length})
              </button>
              <button
                onClick={() => setFilterMode('LOW_STOCK')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'LOW_STOCK' ? 'bg-white text-orange-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button
                onClick={() => setFilterMode('EXPIRED')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  filterMode === 'EXPIRED' ? 'bg-red-600 text-white font-bold shadow-xs' : 'text-red-700 hover:bg-red-100/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Expired ({expiredCount})
              </button>
              <button
                onClick={() => setFilterMode('EXPIRING_SOON')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  filterMode === 'EXPIRING_SOON' ? 'bg-amber-500 text-amber-950 font-bold shadow-xs' : 'text-amber-800 hover:bg-amber-100/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Expiring Soon ({expiringSoonCount})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SEARCH INPUT */}
            <div className="relative w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, batch, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 h-8 text-xs bg-white border-slate-300 focus-visible:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button variant="outline" onClick={handleDownloadTemplate} size="sm" className="text-slate-600 h-8 text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Template
            </Button>
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
                disabled={isUploadingCSV}
              />
              <Button size="sm" variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-800 h-8 text-xs" disabled={isUploadingCSV}>
                {isUploadingCSV ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                {isUploadingCSV ? "Uploading..." : "CSV"}
              </Button>
            </div>
            {dirtyCount > 0 && (
              <Button onClick={handleSaveAll} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs" disabled={isSavingAll}>
                {isSavingAll ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                Save All
              </Button>
            )}
            <Button onClick={handleAddRow} size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1320px]">
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[180px]">Medicine Name *</TableHead>
                <TableHead className="w-[95px]">Type</TableHead>
                <TableHead className="w-[165px]">Unit & Packaging</TableHead>
                <TableHead className="w-[105px]">Batch No</TableHead>
                <TableHead className="w-[125px]">Stock Ledger</TableHead>
                <TableHead className="w-[95px]" title="Cost price per selected unit">Cost (₹/unit) *</TableHead>
                <TableHead className="w-[95px]" title="Customer selling price per selected unit">Customer (₹) *</TableHead>
                <TableHead className="w-[95px]" title="Doctor / Professional selling price per selected unit">Dr Price (₹)</TableHead>
                <TableHead className="w-[155px]">Expiry *</TableHead>
                <TableHead className="w-[130px]">Supplier</TableHead>
                <TableHead className="w-[85px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                    {searchQuery ? (
                      <div>
                        <p className="font-medium text-slate-700">No medicines match "{searchQuery}"</p>
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-blue-600 hover:underline">
                          Clear search filter
                        </button>
                      </div>
                    ) : filterMode === 'ALL' ? (
                      'No medicines in database. Click "Add Row" to start typing.'
                    ) : filterMode === 'EXPIRED' ? (
                      'No expired medicines found.'
                    ) : filterMode === 'EXPIRING_SOON' ? (
                      'No medicines expiring soon (within 60 days).'
                    ) : (
                      'No low stock medicines found.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((item) => {
                  const exp = getExpiryStatus(item.expiryDate);
                  return (
                    <TableRow 
                      key={item.id} 
                      className={`transition-colors ${
                        item.isDirty ? 'bg-blue-50/30' : ''
                      } ${
                        exp.status === 'EXPIRED' 
                          ? 'bg-red-50/50 hover:bg-red-50/80 border-l-4 border-l-red-500' 
                          : exp.status === 'EXPIRING_SOON' 
                          ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-l-amber-400' 
                          : 'hover:bg-slate-50/60 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Name with Expiry Tag */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          value={item.name} 
                          onChange={(e) => handleChange(item.id, 'name', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 font-medium" 
                          placeholder="Name *" 
                        />
                        {exp.status === 'EXPIRED' && (
                          <div className="px-2 mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 uppercase tracking-wider">
                              ● Expired
                            </span>
                          </div>
                        )}
                        {exp.status === 'EXPIRING_SOON' && (
                          <div className="px-2 mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                              ▲ Expiring Soon
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Type: tablet, capsule, ointment, syrup, drop, other */}
                      <TableCell className="p-1 align-top">
                        <select 
                          value={item.productType} 
                          onChange={(e) => {
                            const newType = e.target.value;
                            handleChange(item.id, 'productType', newType);
                            if ((newType === 'tablet' || newType === 'capsule') && item.saleUnit === 'piece') {
                              handleChange(item.id, 'saleUnit', 'strip');
                            }
                          }}
                          className="h-8 w-full border-transparent hover:border-slate-300 focus:ring-1 bg-transparent px-1 rounded-md text-xs font-semibold capitalize"
                        >
                          {MEDICINE_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </TableCell>

                      {/* Unit & Packaging Config: strip, piece, box */}
                      <TableCell className="p-1 align-top">
                        <div className="flex flex-col gap-1">
                          <select 
                            value={item.saleUnit} 
                            onChange={(e) => handleChange(item.id, 'saleUnit', e.target.value)}
                            className="h-7 w-full border-transparent hover:border-slate-300 focus:ring-1 bg-transparent px-1 rounded-md text-xs font-semibold capitalize"
                          >
                            {MEDICINE_UNITS.map(u => (
                              <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                          </select>
                          
                          {item.saleUnit === 'box' && (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex gap-1">
                                <Input 
                                  type="number" 
                                  value={item.stripsPerBox} 
                                  onChange={(e) => handleChange(item.id, 'stripsPerBox', e.target.value)}
                                  className="h-6 w-full text-xs px-1" 
                                  title="Strips in this Box" 
                                  placeholder="Str/Box"
                                />
                                <Input 
                                  type="number" 
                                  value={item.unitsPerStrip} 
                                  onChange={(e) => handleChange(item.id, 'unitsPerStrip', e.target.value)}
                                  className="h-6 w-full text-xs px-1" 
                                  title="Tablets/Capsules/Pieces in each Strip" 
                                  placeholder="Tabs/Str"
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono text-center">
                                = {(Number(item.stripsPerBox) || 1) * (Number(item.unitsPerStrip) || 1)} units/box
                              </span>
                            </div>
                          )}

                          {item.saleUnit === 'strip' && (
                            <div className="flex flex-col gap-0.5">
                              <Input 
                                type="number" 
                                value={item.unitsPerStrip} 
                                onChange={(e) => handleChange(item.id, 'unitsPerStrip', e.target.value)}
                                className="h-6 w-full text-xs px-1" 
                                title="Tablets or Capsules per Strip" 
                                placeholder="Tabs/Strip"
                              />
                              <span className="text-[10px] text-slate-500 font-mono text-center">
                                {Number(item.unitsPerStrip) || 10} tabs/strip
                              </span>
                            </div>
                          )}

                          {item.saleUnit === 'piece' && (
                            <span className="text-[10px] text-slate-400 font-medium px-1">
                              1 unit / piece
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Batch No (OPTIONAL) */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          value={item.batchNo} 
                          onChange={(e) => handleChange(item.id, 'batchNo', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 text-sm" 
                          placeholder="Batch (optional)" 
                        />
                      </TableCell>

                      {/* Stock Ledger */}
                      <TableCell className="p-1 text-center bg-slate-50/70 border-x border-slate-200 align-top">
                        <div className="flex items-center justify-between px-1">
                          <div>
                            <Input 
                              type="number" 
                              value={item.stock} 
                              onChange={(e) => handleChange(item.id, 'stock', e.target.value)} 
                              disabled={!item.isNew}
                              className={`h-8 w-16 border-transparent focus-visible:ring-1 bg-transparent px-2 disabled:opacity-100 disabled:font-bold ${item.stock < item.minimumStockAlert && item.stock !== '' ? 'text-red-600' : 'text-slate-800'}`} 
                              placeholder="0" 
                            />
                            {item.saleUnit === 'strip' && item.unitsPerStrip && item.stock !== '' && (
                              <div className="text-[10px] text-slate-500 font-mono text-left px-1">
                                {(Number(item.stock) / Number(item.unitsPerStrip)).toFixed(1).replace(/\.0$/, '')} str
                              </div>
                            )}
                            {item.saleUnit === 'box' && item.stripsPerBox && item.unitsPerStrip && item.stock !== '' && (
                              <div className="text-[10px] text-slate-500 font-mono text-left px-1">
                                {(Number(item.stock) / (Number(item.stripsPerBox) * Number(item.unitsPerStrip))).toFixed(1).replace(/\.0$/, '')} box
                              </div>
                            )}
                          </div>
                          {!item.isNew && (
                            <div className="flex flex-col">
                              <Button variant="ghost" size="icon" className="h-4 w-4 text-emerald-600 hover:text-emerald-800" title="Add Purchase" onClick={() => { setActiveMedicine(item); setPurchaseModalOpen(true); }}>
                                <ShoppingCart className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-4 w-4 text-orange-600 hover:text-orange-800 mt-1" title="Stock Adjustment" onClick={() => { setActiveMedicine(item); setAdjustModalOpen(true); }}>
                                <ArrowLeftRight className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Cost Price (By Unit) */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          type="number" step="0.01" 
                          value={item.purchasePrice} 
                          onChange={(e) => handleChange(item.id, 'purchasePrice', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 font-medium" 
                          placeholder="Cost/unit" 
                        />
                      </TableCell>

                      {/* Customer Selling Price */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          type="number" step="0.01" 
                          value={item.sellingPrice} 
                          onChange={(e) => handleChange(item.id, 'sellingPrice', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 font-bold text-emerald-700" 
                          placeholder="Cust. MRP" 
                        />
                      </TableCell>

                      {/* Doctor Selling Price */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          type="number" step="0.01" 
                          value={item.doctorPrice} 
                          onChange={(e) => handleChange(item.id, 'doctorPrice', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 font-bold text-blue-700" 
                          placeholder="Dr. Rate" 
                        />
                      </TableCell>

                      {/* Expiry with Red / Yellowish Labeling */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          type="date" 
                          value={item.expiryDate} 
                          onChange={(e) => handleChange(item.id, 'expiryDate', e.target.value)} 
                          className={`h-8 px-2 text-sm rounded transition-colors ${
                            exp.status === 'EXPIRED' 
                              ? 'border border-red-500 bg-red-100/70 text-red-900 font-bold focus-visible:ring-red-400' 
                              : exp.status === 'EXPIRING_SOON' 
                              ? 'border border-amber-400 bg-amber-100/70 text-amber-950 font-semibold focus-visible:ring-amber-400' 
                              : 'border-transparent hover:border-slate-300 bg-transparent'
                          }`} 
                        />
                        {exp.status === 'EXPIRED' && (
                          <div className="mt-1 px-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white shadow-xs">
                              ● Expired ({exp.subText})
                            </span>
                          </div>
                        )}
                        {exp.status === 'EXPIRING_SOON' && (
                          <div className="mt-1 px-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-amber-950 shadow-xs">
                              ▲ Expiring Soon ({exp.subText})
                            </span>
                          </div>
                        )}
                        {exp.status === 'NORMAL' && item.expiryDate && (
                          <div className="mt-1 px-1 text-[11px] text-emerald-700 font-medium">
                            ✓ Valid ({exp.subText})
                          </div>
                        )}
                      </TableCell>

                      {/* Supplier (OPTIONAL) */}
                      <TableCell className="p-1 align-top">
                        <Input 
                          value={item.supplierName} 
                          onChange={(e) => handleChange(item.id, 'supplierName', e.target.value)} 
                          className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2" 
                          placeholder="Supplier (optional)" 
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="p-1 text-center align-top">
                        <div className="flex items-center justify-center space-x-1">
                          {item.isDirty && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:bg-blue-100" 
                              onClick={() => handleSaveRow(item)}
                              disabled={loadingRowId === item.id || isSavingAll}
                              title="Save Row"
                            >
                              {loadingRowId === item.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-100" 
                            onClick={() => confirmDelete(item.id, item.isNew)}
                            disabled={loadingRowId === item.id || isSavingAll}
                            title="Erase Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* ADJUST STOCK MODAL */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Adjustment: {activeMedicine?.name}</DialogTitle>
            <DialogDescription className="hidden">Adjust stock manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Adjustment Type</label>
              <select className="w-full border rounded p-2 mt-1" value={adjustType} onChange={e => setAdjustType(e.target.value)}>
                <option value="Addition">Addition (+)</option>
                <option value="Deduction">Deduction (-)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity (Base Units)</label>
              <Input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="e.g. Expired, Damaged, Found" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStockAdjustment} disabled={!!loadingRowId}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PURCHASE LOG MODAL */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Purchase: {activeMedicine?.name}</DialogTitle>
            <DialogDescription className="hidden">Log a new purchase for this medicine</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
              Note: Enter quantity in <strong>{activeMedicine?.saleUnit ? activeMedicine.saleUnit.toUpperCase() : 'UNITS'}</strong>. The system will convert it to base stock.
            </div>
            <div>
              <label className="text-sm font-medium">Quantity Purchased ({activeMedicine?.saleUnit ? activeMedicine.saleUnit.charAt(0).toUpperCase() + activeMedicine.saleUnit.slice(1) + 's' : 'Units'})</label>
              <Input type="number" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Free Quantity</label>
              <Input type="number" value={purchaseFree} onChange={e => setPurchaseFree(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Total Amount Paid (₹)</label>
              <Input type="number" value={purchaseTotalAmt} onChange={e => setPurchaseTotalAmt(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={!!loadingRowId} className="bg-emerald-600 hover:bg-emerald-700">Record Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
