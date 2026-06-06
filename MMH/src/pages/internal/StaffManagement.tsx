import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Users, Trash2, ShieldCheck } from "lucide-react";
import api from "../../api/axios";

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPTIONIST'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (error) {
      console.error("Failed to fetch staff", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return alert("Please fill all fields.");
    }

    setLoading(true);
    try {
      await api.post('/staff', formData);
      alert("Staff member created successfully!");
      setFormData({ name: '', email: '', password: '', role: 'RECEPTIONIST' });
      fetchStaff();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create staff member");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'DOCTOR': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'RECEPTIONIST': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'PHARMACIST': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'OPTOMETRIST': return 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <ShieldCheck className="w-8 h-8 mr-3 text-purple-600" />
          Staff Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Staff Form */}
        <Card className="col-span-1 border-2 border-slate-200 shadow-sm h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle>Add New Staff</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Dr. John Doe" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="john@visioncare.com" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Set initial password" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={r => setFormData({...formData, role: r})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                    <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                    <SelectItem value="OPTOMETRIST">Optometrist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? "Creating..." : "Create Staff Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="col-span-1 lg:col-span-2 border-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-slate-500" />
              Active Staff Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Badge className={`border-none ${getRoleColor(s.role)}`}>
                        {s.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {s.role !== 'ADMIN' && (
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
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
