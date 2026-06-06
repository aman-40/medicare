import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UserPlus } from "lucide-react";
import api from "../../api/axios";

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', phone: '', address: '', occupation: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const response = await api.post('/patients', formData);
      const newPatientId = response.data.id;
      
      // Auto-add to Queue
      await api.post('/queue/generate', { patientId: newPatientId });
      
      setFormData({ name: '', age: '', gender: '', phone: '', address: '', occupation: '' });
      setSuccessMsg("Patient registered and added to queue successfully!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (error) {
      console.error("Failed to create patient", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Register Patient</h1>
      </div>

      <Card className="border-2 border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-xl">
          <CardTitle className="text-xl flex items-center">
            <UserPlus className="mr-2 w-5 h-5 text-blue-600" />
            New Patient Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-center font-medium">
              {successMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="35" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, City" />
            </div>
            <div className="pt-4 border-t">
              <Button disabled={loading} type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? "Processing..." : "Register & Auto-Queue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
