import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Package, AlertTriangle, Clock, Plus, Save, Trash2, RefreshCw, Upload, Download, Settings, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router";
import api from "../../api/axios";

const getValidUnitsForType = (type: string) => {
  switch (type) {
    case 'tablet':
      return [{ value: 'tablet', label: 'Tablet' }, { value: 'piece', label: 'Piece' }];
    case 'capsule':
      return [{ value: 'capsule', label: 'Capsule' }, { value: 'piece', label: 'Piece' }];
    case 'syrup':
      return [{ value: 'bottle', label: 'Bottle' }];
    case 'injection':
      return [{ value: 'vial', label: 'Vial' }];
    case 'cream':
    case 'ointment':
      return [{ value: 'tube', label: 'Tube' }];
    case 'drops':
      return [{ value: 'bottle', label: 'Bottle' }, { value: 'piece', label: 'Piece' }];
    case 'medical_device':
      return [{ value: 'piece', label: 'Piece' }];
    default:
      return [{ value: 'piece', label: 'Piece' }];
  }
};

export default function MedicalInventory() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRING'>('ALL');
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
        purchaseDate: m.purchaseDate ? new Date(m.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: new Date(m.expiryDate).toISOString().split('T')[0],
        supplierId: m.supplierId,
        supplierName: m.supplier?.name || '',
        supplierPhone: m.supplier?.phone || '',
        productType: m.productType || 'tablet',
        saleUnit: m.saleUnit || 'piece',
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
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      supplierName: '',
      supplierPhone: '',
      productType: 'tablet',
      saleUnit: 'tablet',
      stripsPerBox: 10,
      unitsPerStrip: 15,
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
          const validUnits = getValidUnitsForType(value).map(u => u.value);
          if (!validUnits.includes(updated.saleUnit)) {
            updated.saleUnit = validUnits[0];
          }
        }
        return updated;
      }
      return m;
    }));
  };

  const saveSingleRow = async (med: any) => {
    if (!med.name || !med.batchNo || med.stock === '' || !med.purchasePrice || !med.sellingPrice || !med.expiryDate || !med.supplierName) {
      throw new Error(`Please fill all required fields for ${med.name || 'new medicine'}.`);
    }

    const payload = {
      name: med.name,
      genericName: med.genericName,
      company: med.company,
      batchNo: med.batchNo,
      stock: med.stock, // Only used when isNew is true to set initial stock
      minimumStockAlert: med.minimumStockAlert,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      purchaseDate: med.purchaseDate,
      expiryDate: med.expiryDate,
      supplierId: med.supplierId,
      supplierName: med.supplierName,
      supplierPhone: med.supplierPhone,
      productType: med.productType,
      saleUnit: med.saleUnit,
      stripsPerBox: med.stripsPerBox,
      unitsPerStrip: med.unitsPerStrip,
      bottleVolume: med.bottleVolume
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
    const headers = "Name,Company,BatchNo,Stock,PurchasePrice,SellingPrice,ExpiryDate,SupplierName,ProductType,SaleUnit\n";
    const sample = "Paracetamol 500mg,Glaxo,B-12345,100,2.50,5.00,2026-12-31,PharmaCorp,tablet,tablet\n";
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
            if (h === 'batchno') obj.batchNo = vals[index];
            if (h === 'stock') obj.stock = vals[index];
            if (h === 'purchaseprice') obj.purchasePrice = vals[index];
            if (h === 'sellingprice') obj.sellingPrice = vals[index];
            if (h === 'expirydate') obj.expiryDate = vals[index];
            if (h === 'suppliername') obj.supplierName = vals[index];
            if (h === 'producttype') obj.productType = vals[index];
            if (h === 'saleunit') obj.saleUnit = vals[index];
          });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Inventory Management
          </h1>
          {filterMode !== 'ALL' && (
            <div className="mt-2 text-sm">
              <span className="text-slate-500 mr-2">Showing:</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex inline-flex items-center">
                {filterMode === 'LOW_STOCK' ? 'Low Stock Only' : 'Expiring Soon Only'}
                <button onClick={() => setFilterMode('ALL')} className="ml-2 text-blue-500 hover:text-blue-800">&times;</button>
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className={`border-2 cursor-pointer transition-all ${filterMode === 'ALL' ? 'bg-blue-100 border-blue-400' : 'bg-white shadow-sm hover:border-blue-300'}`}
            onClick={() => setFilterMode('ALL')}
          >
            <CardContent className="p-6">
              <p className={`text-sm font-medium mb-1 ${filterMode === 'ALL' ? 'text-blue-700' : 'text-slate-500'}`}>All Medicines</p>
              <h3 className={`text-3xl font-bold ${filterMode === 'ALL' ? 'text-blue-800' : 'text-slate-800'}`}>{stats.totalMedicines}</h3>
            </CardContent>
          </Card>
          <Card 
            className="border-2 bg-white shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
            onClick={() => navigate('/admin/optical-store')}
          >
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Frames & Lenses</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totalFrames + stats.totalLenses}</h3>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 cursor-pointer transition-all ${filterMode === 'LOW_STOCK' ? 'bg-red-100 border-red-400' : 'bg-red-50 border-red-200 hover:border-red-300'}`}
            onClick={() => setFilterMode(filterMode === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className={`text-sm font-medium mb-1 ${filterMode === 'LOW_STOCK' ? 'text-red-700' : 'text-red-600'}`}>Low Stock Alerts</p>
                <h3 className={`text-3xl font-bold ${filterMode === 'LOW_STOCK' ? 'text-red-800' : 'text-red-700'}`}>{stats.lowStockItems}</h3>
              </div>
              <AlertTriangle className={`w-10 h-10 ${filterMode === 'LOW_STOCK' ? 'text-red-500 opacity-80' : 'text-red-400 opacity-50'}`} />
            </CardContent>
          </Card>
          <Card 
            className={`border-2 cursor-pointer transition-all ${filterMode === 'EXPIRING' ? 'bg-orange-100 border-orange-400' : 'bg-orange-50 border-orange-200 hover:border-orange-300'}`}
            onClick={() => setFilterMode(filterMode === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
          >
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className={`text-sm font-medium mb-1 ${filterMode === 'EXPIRING' ? 'text-orange-700' : 'text-orange-600'}`}>Expiring Soon</p>
                <h3 className={`text-3xl font-bold ${filterMode === 'EXPIRING' ? 'text-orange-800' : 'text-orange-700'}`}>{stats.expiringSoon}</h3>
              </div>
              <Clock className={`w-10 h-10 ${filterMode === 'EXPIRING' ? 'text-orange-500 opacity-80' : 'text-orange-400 opacity-50'}`} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* DATABASE TABLE */}
      <Card className="border-2 border-slate-200 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-lg text-slate-800">Medicine Database</CardTitle>
            {dirtyCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                {dirtyCount} unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleDownloadTemplate} size="sm" className="text-slate-600 h-8">
              <Download className="w-4 h-4 mr-1" /> Template
            </Button>
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
                disabled={isUploadingCSV}
              />
              <Button size="sm" variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-800 h-8" disabled={isUploadingCSV}>
                {isUploadingCSV ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                {isUploadingCSV ? "Uploading..." : "CSV"}
              </Button>
            </div>
            {dirtyCount > 0 && (
              <Button onClick={handleSaveAll} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" disabled={isSavingAll}>
                {isSavingAll ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save All
              </Button>
            )}
            <Button onClick={handleAddRow} size="sm" className="bg-blue-600 hover:bg-blue-700 h-8">
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[180px]">Medicine Name *</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[160px]">Unit / Config</TableHead>
                <TableHead className="w-[100px]">Batch No *</TableHead>
                <TableHead className="w-[140px]">Stock Ledger</TableHead>
                <TableHead className="w-[110px]" title="Price per Strip for Tablets, otherwise per unit">Purch. (₹) *</TableHead>
                <TableHead className="w-[110px]" title="Price per Strip for Tablets, otherwise per unit">Sell (₹) *</TableHead>
                <TableHead className="w-[140px]">Expiry *</TableHead>
                <TableHead className="w-[150px]">Supplier *</TableHead>
                <TableHead className="w-[130px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.filter(m => {
                if (filterMode === 'LOW_STOCK') return Number(m.stock) < 10;
                if (filterMode === 'EXPIRING') {
                  const threshold = new Date();
                  threshold.setDate(threshold.getDate() + 60);
                  return new Date(m.expiryDate) <= threshold;
                }
                return true;
              }).length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {filterMode === 'ALL' ? 'No medicines. Click "Add Row" to start typing.' : 'No medicines match the selected filter.'}
                </TableCell></TableRow>
              ) : (
                medicines.filter(m => {
                  if (filterMode === 'LOW_STOCK') return Number(m.stock) < 10;
                  if (filterMode === 'EXPIRING') {
                    const threshold = new Date();
                    threshold.setDate(threshold.getDate() + 60);
                    return new Date(m.expiryDate) <= threshold;
                  }
                  return true;
                }).map((item) => (
                  <TableRow key={item.id} className={item.isDirty ? 'bg-amber-50/50' : ''}>
                    <TableCell className="p-1">
                      <Input 
                        value={item.name} 
                        onChange={(e) => handleChange(item.id, 'name', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2" 
                        placeholder="Name" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <select 
                        value={item.productType} 
                        onChange={(e) => handleChange(item.id, 'productType', e.target.value)}
                        className="h-8 w-full border-transparent hover:border-slate-300 focus:ring-1 bg-transparent px-1 rounded-md text-sm"
                      >
                        <option value="tablet">Tablet</option>
                        <option value="capsule">Capsule</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                        <option value="cream">Cream</option>
                        <option value="ointment">Ointment</option>
                        <option value="drops">Drops</option>
                        <option value="medical_device">Device</option>
                      </select>
                    </TableCell>
                    <TableCell className="p-1">
                      <div className="flex flex-col gap-1">
                        <select 
                          value={item.saleUnit} 
                          onChange={(e) => handleChange(item.id, 'saleUnit', e.target.value)}
                          className="h-7 w-full border-transparent hover:border-slate-300 focus:ring-1 bg-transparent px-1 rounded-md text-xs font-semibold"
                        >
                          {getValidUnitsForType(item.productType).map(u => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                        {(item.productType === 'tablet' || item.productType === 'capsule') && (
                          <div className="flex gap-1">
                            <Input 
                              type="number" value={item.stripsPerBox} onChange={(e) => handleChange(item.id, 'stripsPerBox', e.target.value)}
                              className="h-6 w-full text-xs px-1" title="Strips per Box" placeholder="Str/Box"
                            />
                            <Input 
                              type="number" value={item.unitsPerStrip} onChange={(e) => handleChange(item.id, 'unitsPerStrip', e.target.value)}
                              className="h-6 w-full text-xs px-1" title="Units per Strip" placeholder="Units/Str"
                            />
                          </div>
                        )}
                        {item.productType === 'syrup' && (
                          <Input 
                            value={item.bottleVolume} onChange={(e) => handleChange(item.id, 'bottleVolume', e.target.value)}
                            className="h-6 w-full text-xs px-1" title="Bottle Volume" placeholder="e.g. 100ml"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.batchNo} 
                        onChange={(e) => handleChange(item.id, 'batchNo', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2" 
                        placeholder="Batch" 
                      />
                    </TableCell>
                    <TableCell className="p-1 text-center bg-slate-50 border-x border-slate-200">
                      <div className="flex items-center justify-between px-1">
                        <Input 
                          type="number" 
                          value={item.stock} 
                          onChange={(e) => handleChange(item.id, 'stock', e.target.value)} 
                          disabled={!item.isNew}
                          className={`h-8 w-16 border-transparent focus-visible:ring-1 bg-transparent px-2 disabled:opacity-100 disabled:font-bold ${item.stock < item.minimumStockAlert && item.stock !== '' ? 'text-red-600' : 'text-slate-800'}`} 
                          placeholder="0" 
                        />
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
                    <TableCell className="p-1">
                      <Input 
                        type="number" step="0.01" 
                        value={item.purchasePrice} 
                        onChange={(e) => handleChange(item.id, 'purchasePrice', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2" 
                        placeholder="0.00" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number" step="0.01" 
                        value={item.sellingPrice} 
                        onChange={(e) => handleChange(item.id, 'sellingPrice', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 font-bold text-emerald-700" 
                        placeholder="0.00" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="date" 
                        value={item.expiryDate} 
                        onChange={(e) => handleChange(item.id, 'expiryDate', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2 text-sm" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.supplierName} 
                        onChange={(e) => handleChange(item.id, 'supplierName', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent px-2" 
                        placeholder="Supplier Name" 
                      />
                    </TableCell>
                    <TableCell className="p-1 text-center">
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
                ))
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
              Note: For Tablets/Capsules, enter quantity in <strong>Strips</strong>. The system will convert it to total tablets.
            </div>
            <div>
              <label className="text-sm font-medium">Quantity Purchased ({activeMedicine?.productType === 'tablet' || activeMedicine?.productType === 'capsule' ? 'Strips' : 'Units'})</label>
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
