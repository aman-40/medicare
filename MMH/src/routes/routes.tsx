import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

// Admin / Internal Layout
import InternalLayout from "../layouts/InternalLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/", Component: LandingPage },
  { path: "/login", Component: Login },
  
  // Protected Admin Routes
  {
    path: "/admin",
    Component: InternalLayout,
    children: [
      { 
        path: "", 
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/Dashboard"); return { Component }; } }]
      },
      { 
        path: "patients/register", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/PatientRegistration"); return { Component }; } }]
      },
      { 
        path: "patients/records", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/PatientRecords"); return { Component }; } }]
      },
      { 
        path: "queue", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/QueueManagement"); return { Component }; } }]
      },
      { 
        path: "eye-exams", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/EyeExamination"); return { Component }; } }]
      },
      { 
        path: "optical-store", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'OPTOMETRIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/OpticalStore"); return { Component }; } }]
      },
      { 
        path: "optical-orders", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST', 'OPTOMETRIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/OpticalOrders"); return { Component }; } }]
      },
      { 
        path: "inventory", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/MedicalInventory"); return { Component }; } }]
      },
      { 
        path: "billing", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'PHARMACIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/Billing"); return { Component }; } }]
      },
      { 
        path: "reports", 
        element: <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/Reports"); return { Component }; } }]
      },
      { 
        path: "staff", 
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [{ path: "", async lazy() { let { default: Component } = await import("../pages/internal/StaffManagement"); return { Component }; } }]
      },
    ]
  }
]);
