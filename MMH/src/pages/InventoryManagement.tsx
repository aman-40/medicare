import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Package,
  Search,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";
import { useState } from "react";

export default function InventoryManagement() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "medicines", "eyewear", "lenses", "accessories"];

  const inventory = [
    {
      id: "MED-001",
      name: "Paracetamol 500mg",
      category: "Medicines",
      batch: "BT20240506",
      stock: 245,
      reorder: 100,
      expiry: "Dec 2026",
      supplier: "Generic Pharma",
      status: "good",
      price: 5.99
    },
    {
      id: "EYE-045",
      name: "Ray-Ban Round Frame",
      category: "Eyewear",
      batch: "RB-2024-45",
      stock: 45,
      reorder: 20,
      expiry: "N/A",
      supplier: "Ray-Ban Inc",
      status: "good",
      price: 149.99
    },
    {
      id: "MED-028",
      name: "Aspirin 75mg",
      category: "Medicines",
      batch: "BT20240312",
      stock: 15,
      reorder: 50,
      expiry: "Aug 2024",
      supplier: "MediCare",
      status: "low",
      price: 7.99
    },
    {
      id: "LENS-089",
      name: "Blue Cut Lenses",
      category: "Lenses",
      batch: "BC-2024-89",
      stock: 120,
      reorder: 30,
      expiry: "N/A",
      supplier: "Lens Corp",
      status: "good",
      price: 30.00
    },
    {
      id: "MED-067",
      name: "Vitamin D3 1000 IU",
      category: "Medicines",
      batch: "BT20240415",
      stock: 8,
      reorder: 50,
      expiry: "Jul 2024",
      supplier: "HealthVit",
      status: "critical",
      price: 12.99
    },
    {
      id: "EYE-112",
      name: "Oakley Aviator",
      category: "Eyewear",
      batch: "OK-2024-112",
      stock: 0,
      reorder: 15,
      expiry: "N/A",
      supplier: "Oakley",
      status: "out",
      price: 189.99
    },
  ];

  const getStatusBadge = (status: string, stock: number, reorder: number) => {
    if (status === "out" || stock === 0) {
      return (
        <Badge className="bg-red-500 text-white">
          <XCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </Badge>
      );
    }
    if (status === "critical" || stock < reorder * 0.3) {
      return (
        <Badge className="bg-red-500 text-white">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Critical
        </Badge>
      );
    }
    if (status === "low" || stock < reorder) {
      return (
        <Badge className="bg-amber-500 text-white">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500 text-white">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        In Stock
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--healthcare-blue)] to-[var(--healthcare-teal)] flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold">VisionCare</span>
              <span className="text-xs text-muted-foreground">Inventory System</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-slate-100 transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--healthcare-light-blue)] text-[var(--healthcare-blue)] transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Inventory</span>
          </button>
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-slate-100 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Inventory Management</h1>
              <p className="text-sm text-muted-foreground">Manage stock levels and product inventory</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button className="bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3,620</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Out of Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[var(--healthcare-blue)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--healthcare-light-blue)] flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[var(--healthcare-blue)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Search by name, batch, or ID..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      onClick={() => setSelectedCategory(cat)}
                      className={selectedCategory === cat ? "bg-[var(--healthcare-blue)]" : ""}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Reorder Level</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className={item.status === "out" || item.status === "critical" ? "bg-red-50/50" : item.status === "low" ? "bg-amber-50/30" : ""}>
                      <TableCell>
                        <span className="font-mono text-sm">{item.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{item.batch}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${item.stock === 0 ? "text-red-500" : item.stock < item.reorder ? "text-amber-500" : "text-emerald-500"}`}>
                          {item.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">{item.reorder}</span>
                      </TableCell>
                      <TableCell>
                        <span className={item.expiry.includes("2024") ? "text-red-500 font-semibold" : ""}>
                          {item.expiry}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.supplier}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status, item.stock, item.reorder)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-[var(--healthcare-blue)] border-[var(--healthcare-blue)]">
                            Restock
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
