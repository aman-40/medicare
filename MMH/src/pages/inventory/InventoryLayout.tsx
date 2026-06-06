import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';

export default function InventoryLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/inventory' },
    { name: 'Medicines', path: '/inventory/medicines' },
    { name: 'Frames', path: '/inventory/frames' },
    { name: 'Lenses', path: '/inventory/lenses' },
    { name: 'Suppliers', path: '/inventory/suppliers' },
    { name: 'Purchases', path: '/inventory/purchases' },
    { name: 'Expiry Alerts', path: '/inventory/expiry' },
    { name: 'Audit Logs', path: '/inventory/logs' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-healthcare-blue">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Control Center</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/inventory' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-healthcare-blue text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}
