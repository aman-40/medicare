import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Package, AlertTriangle, Clock, Plus, Save, Trash2, RefreshCw, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router";
import api from "../../api/axios";

export default function MedicalInventory() {
  const [stats, setStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRING'>('ALL');
  const navigate = useNavigate();

  // Custom Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
      
      // Transform fetched data to include editable fields easily
      const formattedMeds = medsRes.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        company: m.company || '',
        batchNo: m.batchNo,
        stock: m.stock,
        purchasePrice: m.purchasePrice,
        sellingPrice: m.sellingPrice,
        expiryDate: new Date(m.expiryDate).toISOString().split('T')[0],
        supplierName: m.supplier?.name || '',
        supplierPhone: m.supplier?.phone || '',
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
      company: '',
      batchNo: '',
      stock: '',
      purchasePrice: '',
      sellingPrice: '',
      expiryDate: '',
      supplierName: '',
      supplierPhone: '',
      isDirty: true,
      isNew: true
    };
    setMedicines([newRow, ...medicines]);
  };

  const handleChange = (id: string, field: string, value: any) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value, isDirty: true };
      }
      return m;
    }));
  };

  const handleSaveRow = async (med: any) => {
    if (!med.name || !med.batchNo || !med.stock || !med.purchasePrice || !med.sellingPrice || !med.expiryDate || !med.supplierName) {
      return alert("Please fill all required fields (Name, Batch, Stock, Prices, Expiry, Supplier Name).");
    }

    setLoadingRowId(med.id);
    try {
      const payload = {
        name: med.name,
        company: med.company,
        batchNo: med.batchNo,
        stock: med.stock,
        purchasePrice: med.purchasePrice,
        sellingPrice: med.sellingPrice,
        expiryDate: med.expiryDate,
        supplierName: med.supplierName,
        supplierPhone: med.supplierPhone
      };

      if (med.isNew) {
        await api.post('/inventory/medicines', payload);
      } else {
        await api.put(`/inventory/medicines/${med.id}`, payload);
      }
      
      // Refresh to get actual IDs and clean state
      fetchData();
    } catch (error) {
      console.error("Failed to save row", error);
      alert("Error saving medicine");
    } finally {
      setLoadingRowId(null);
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

  const handleDownloadTemplate = () => {
    const headers = "Name,Company,BatchNo,Stock,PurchasePrice,SellingPrice,ExpiryDate,SupplierName\n";
    const sample = "Paracetamol 500mg,Glaxo,B-12345,100,2.50,5.00,2026-12-31,PharmaCorp\n";
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
          });
          parsedMedicines.push(obj);
        }

        const res = await api.post('/inventory/medicines/bulk', { medicines: parsedMedicines });
        alert(`Upload Complete!\nSuccess: ${res.data.successCount}\nErrors: ${res.data.errorCount}\n${res.data.errorCount > 0 ? 'Check console for error details.' : ''}`);
        if(res.data.errors?.length) console.error("CSV Upload Errors:", res.data.errors);
        
        fetchData(); // Refresh the table
      } catch (err: any) {
        alert(`Error processing CSV: ${err.message}`);
      } finally {
        setIsUploadingCSV(false);
        // Reset file input
        if (e.target) e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
      setIsUploadingCSV(false);
    };
    reader.readAsText(file);
  };

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

      {/* SPREADSHEET TABLE */}
      <Card className="border-2 border-slate-200 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-800">Medicine Database (Spreadsheet Mode)</CardTitle>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleDownloadTemplate} size="sm" className="text-slate-600 border-slate-300">
              <Download className="w-4 h-4 mr-2" /> Template
            </Button>
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
                disabled={isUploadingCSV}
              />
              <Button size="sm" variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-800" disabled={isUploadingCSV}>
                {isUploadingCSV ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {isUploadingCSV ? "Uploading..." : "Upload CSV"}
              </Button>
            </div>
            <Button onClick={handleAddRow} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[200px]">Medicine Name *</TableHead>
                <TableHead className="w-[150px]">Company</TableHead>
                <TableHead className="w-[120px]">Batch No *</TableHead>
                <TableHead className="w-[100px]">Stock *</TableHead>
                <TableHead className="w-[120px]">Purch. (₹) *</TableHead>
                <TableHead className="w-[120px]">Sell (₹) *</TableHead>
                <TableHead className="w-[150px]">Expiry *</TableHead>
                <TableHead className="w-[180px]">Supplier *</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
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
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent" 
                        placeholder="Name" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.company} 
                        onChange={(e) => handleChange(item.id, 'company', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent" 
                        placeholder="Company" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.batchNo} 
                        onChange={(e) => handleChange(item.id, 'batchNo', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent" 
                        placeholder="Batch" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number" 
                        value={item.stock} 
                        onChange={(e) => handleChange(item.id, 'stock', e.target.value)} 
                        className={`h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent ${item.stock < 10 && item.stock !== '' ? 'text-red-600 font-bold' : ''}`} 
                        placeholder="0" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number" step="0.01" 
                        value={item.purchasePrice} 
                        onChange={(e) => handleChange(item.id, 'purchasePrice', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent" 
                        placeholder="0.00" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number" step="0.01" 
                        value={item.sellingPrice} 
                        onChange={(e) => handleChange(item.id, 'sellingPrice', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent font-bold text-emerald-700" 
                        placeholder="0.00" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="date" 
                        value={item.expiryDate} 
                        onChange={(e) => handleChange(item.id, 'expiryDate', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent text-sm" 
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.supplierName} 
                        onChange={(e) => handleChange(item.id, 'supplierName', e.target.value)} 
                        className="h-8 border-transparent hover:border-slate-300 focus-visible:ring-1 bg-transparent" 
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
                            disabled={loadingRowId === item.id}
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
                          disabled={loadingRowId === item.id}
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
      
    </div>
  );
}
