import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function OpticalOrders() {
  const [orders, setOrders] = useState([
    { id: "ORD-001", patientName: "Alice Smith", frame: "Ray-Ban Wayfarer", lens: "Zeiss Progressive", status: "In Progress", amount: 9300, deliveryDate: "2026-06-10" },
    { id: "ORD-002", patientName: "John Doe", frame: "Lenskart Rimless", lens: "Essilor Single Vision", status: "Ready", amount: 4400, deliveryDate: "2026-06-08" },
    { id: "ORD-003", patientName: "Sarah Connor", frame: "Oakley Sports", lens: "Standard ARC", status: "Delivered", amount: 6500, deliveryDate: "2026-06-05" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none';
      case 'Ready': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-none';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
          Optical Orders Tracking
        </h1>
      </div>

      <Card className="border-2 border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg">Recent Glass Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Frame Selected</TableHead>
                <TableHead>Lens Selected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-right">Total Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-semibold text-slate-900">{o.id}</TableCell>
                  <TableCell>{o.patientName}</TableCell>
                  <TableCell>{o.frame}</TableCell>
                  <TableCell>{o.lens}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(o.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium">{o.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
