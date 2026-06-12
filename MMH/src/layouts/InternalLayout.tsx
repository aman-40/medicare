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
  UserCircle,
  Menu,
  FileBarChart
} from "lucide-react";

export default function InternalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart, roles: ['ADMIN', 'PHARMACIST'] },
    { name: 'Staff', path: '/admin/staff', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const navItems = user ? allNavItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden print:bg-white print:h-auto">
      {/* Sidebar - hidden when printing */}
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 print:hidden ${isSidebarExpanded ? 'w-64' : 'w-20'}`}>
        <div className={`p-4 text-xl font-bold border-b border-slate-800 flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          {isSidebarExpanded && <span className="truncate">MMH Admin</span>}
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-lg transition-colors whitespace-nowrap ${isSidebarExpanded ? 'px-4 py-3' : 'justify-center p-3'} ${
                      isActive ? 'bg-slate-800 text-emerald-400' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                    title={!isSidebarExpanded ? item.name : undefined}
                  >
                    <item.icon className={`w-6 h-6 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
                    {isSidebarExpanded && <span className="truncate">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950 overflow-x-hidden">
          {user && (
            <div className={`flex items-center mb-4 ${isSidebarExpanded ? 'px-2' : 'justify-center'}`}>
              <div className={`w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center border border-slate-700 ${isSidebarExpanded ? 'mr-3' : ''}`} title={!isSidebarExpanded ? user.name : undefined}>
                <UserCircle className="w-6 h-6 text-emerald-400" />
              </div>
              {isSidebarExpanded && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 font-semibold tracking-wider truncate">{user.role}</p>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`flex items-center text-red-400 hover:text-red-300 hover:bg-slate-900 w-full rounded-lg transition-colors whitespace-nowrap ${isSidebarExpanded ? 'px-4 py-3' : 'justify-center p-3'}`}
            title={!isSidebarExpanded ? "Sign Out" : undefined}
          >
            <LogOut className={`w-6 h-6 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`} />
            {isSidebarExpanded && <span>Sign Out</span>}
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
