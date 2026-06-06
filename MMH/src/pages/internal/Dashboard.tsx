import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, ListOrdered, IndianRupee, Glasses } from "lucide-react";
import { useNavigate, Link } from "react-router";
import api from "../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayPatients: 0,
    queueCount: 0,
    todaySales: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Role protection for Dashboard
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN') {
        if (user.role === 'DOCTOR' || user.role === 'RECEPTIONIST') navigate('/admin/queue');
        else navigate('/admin/optical-store');
        return;
      }
    }

    // In a real app, you'd fetch these from a unified dashboard endpoint
    const fetchStats = async () => {
      try {
        const [patientsRes, queueRes, billingRes] = await Promise.all([
          api.get('/patients'),
          api.get('/queue'),
          api.get('/billing')
        ]);
        
        // Mocking today's filtering on frontend for simplicity
        const today = new Date().toDateString();
        const todayPatients = patientsRes.data.filter((p: any) => new Date(p.createdAt).toDateString() === today).length;
        const todaySales = billingRes.data
          .filter((i: any) => new Date(i.createdAt).toDateString() === today)
          .reduce((acc: number, i: any) => acc + i.totalAmount, 0);

        setStats({
          todayPatients,
          queueCount: queueRes.data.queueItems.length,
          todaySales,
          pendingOrders: 12 // Hardcoded mock for now
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Clinic Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-none">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-blue-100 mb-1 font-medium">Today's Patients</p>
              <h3 className="text-4xl font-black">{stats.todayPatients}</h3>
            </div>
            <Users className="w-12 h-12 text-blue-200 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg border-none">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-indigo-100 mb-1 font-medium">Current Queue</p>
              <h3 className="text-4xl font-black">{stats.queueCount}</h3>
            </div>
            <ListOrdered className="w-12 h-12 text-indigo-200 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg border-none">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-emerald-100 mb-1 font-medium">Today's Revenue</p>
              <h3 className="text-4xl font-black">₹{stats.todaySales.toLocaleString()}</h3>
            </div>
            <IndianRupee className="w-12 h-12 text-emerald-200 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg border-none">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-orange-100 mb-1 font-medium">Pending Orders</p>
              <h3 className="text-4xl font-black">{stats.pendingOrders}</h3>
            </div>
            <Glasses className="w-12 h-12 text-orange-200 opacity-80" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-sm border-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-600">Patient Registration: John Doe</span>
                <span className="text-sm text-slate-400">10 mins ago</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-600">Invoice Generated: INV-10001</span>
                <span className="text-sm text-slate-400">25 mins ago</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-600">Eye Exam Completed: Sarah Smith</span>
                <span className="text-sm text-slate-400">1 hr ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link to="/admin/patients/register" className="p-4 border rounded-xl text-center hover:bg-slate-50 transition-colors font-medium text-slate-700">
              Register Patient
            </Link>
            <Link to="/admin/billing" className="p-4 border rounded-xl text-center hover:bg-slate-50 transition-colors font-medium text-slate-700">
              Create Invoice
            </Link>
            <Link to="/admin/queue" className="p-4 border rounded-xl text-center hover:bg-slate-50 transition-colors font-medium text-slate-700">
              View Queue
            </Link>
            <Link to="/admin/eye-exams" className="p-4 border rounded-xl text-center hover:bg-slate-50 transition-colors font-medium text-slate-700">
              New Eye Exam
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
