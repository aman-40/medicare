import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Glasses, Box } from "lucide-react";

export default function OpticalStore() {
  const [frames, setFrames] = useState([
    { id: 1, name: "Aviator Classic", brand: "Ray-Ban", stock: 12, price: 5400 },
    { id: 2, name: "Wayfarer", brand: "Ray-Ban", stock: 8, price: 4800 },
    { id: 3, name: "Titanium Rimless", brand: "Lenskart", stock: 20, price: 3200 },
  ]);

  const [lenses, setLenses] = useState([
    { id: 1, type: "Single Vision Anti-Glare", brand: "Essilor", stock: 50, price: 1200 },
    { id: 2, type: "Progressive BlueCut", brand: "Zeiss", stock: 15, price: 4500 },
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <Glasses className="w-8 h-8 mr-3 text-blue-600" />
          Optical Store Catalog
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center text-lg">
              <Box className="w-5 h-5 mr-2 text-indigo-600" />
              Frames Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frames.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-semibold">{f.brand}</TableCell>
                    <TableCell>{f.name}</TableCell>
                    <TableCell>{f.stock}</TableCell>
                    <TableCell className="text-right font-medium">{f.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center text-lg">
              <Box className="w-5 h-5 mr-2 text-emerald-600" />
              Lenses Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Lens Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lenses.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-semibold">{l.brand}</TableCell>
                    <TableCell>{l.type}</TableCell>
                    <TableCell>{l.stock}</TableCell>
                    <TableCell className="text-right font-medium">{l.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
