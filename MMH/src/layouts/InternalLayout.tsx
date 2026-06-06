import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  ListOrdered, 
  Eye, 
  Glasses, 
  ShoppingCart, 
  Pill, 
  Receipt,
  LogOut,
  ShieldCheck,
  UserCircle
} from "lucide-react";

export default function InternalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userStr));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Register Patient', path: '/admin/patients/register', icon: UserPlus, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Patient Records', path: '/admin/patients/records', icon: Users, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Queue', path: '/admin/queue', icon: ListOrdered, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { name: 'Eye Exams', path: '/admin/eye-exams', icon: Eye, roles: ['ADMIN', 'DOCTOR'] },
    { name: 'Optical Store', path: '/admin/optical-store', icon: Glasses, roles: ['ADMIN', 'PHARMACIST', 'OPTOMETRIST'] },
    { name: 'Optical Orders', path: '/admin/optical-orders', icon: ShoppingCart, roles: ['ADMIN', 'PHARMACIST', 'OPTOMETRIST'] },
    { name: 'Inventory', path: '/admin/inventory', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
    { name: 'Billing', path: '/admin/billing', icon: Receipt, roles: ['ADMIN', 'RECEPTIONIST', 'PHARMACIST'] },
    { name: 'Staff', path: '/admin/staff', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const navItems = user ? allNavItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden print:bg-white print:h-auto">
      {/* Sidebar - hidden when printing */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-4 text-xl font-bold border-b border-slate-800">
          VisionCare Admin
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-slate-800 text-emerald-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          {user && (
            <div className="flex items-center mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-3 border border-slate-700">
                <UserCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 font-semibold tracking-wider truncate">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-300 hover:bg-slate-900 w-full px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
