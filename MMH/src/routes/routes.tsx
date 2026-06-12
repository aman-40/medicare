import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

// Admin / Internal Layout
import InternalLayout from "../layouts/InternalLayout";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/", Component: LandingPage },
  { path: "/login", Component: Login },
  
  // Protected Admin Routes
  {
    path: "/admin",
    Component: InternalLayout,
    children: [
      { path: "", async lazy() { let { default: Component } = await import("../pages/internal/Dashboard"); return { Component }; } },
      { path: "patients/register", async lazy() { let { default: Component } = await import("../pages/internal/PatientRegistration"); return { Component }; } },
      { path: "patients/records", async lazy() { let { default: Component } = await import("../pages/internal/PatientRecords"); return { Component }; } },
      { path: "queue", async lazy() { let { default: Component } = await import("../pages/internal/QueueManagement"); return { Component }; } },
      { path: "eye-exams", async lazy() { let { default: Component } = await import("../pages/internal/EyeExamination"); return { Component }; } },
      { path: "optical-store", async lazy() { let { default: Component } = await import("../pages/internal/OpticalStore"); return { Component }; } },
      { path: "optical-orders", async lazy() { let { default: Component } = await import("../pages/internal/OpticalOrders"); return { Component }; } },
      { path: "inventory", async lazy() { let { default: Component } = await import("../pages/internal/MedicalInventory"); return { Component }; } },
      { path: "billing", async lazy() { let { default: Component } = await import("../pages/internal/Billing"); return { Component }; } },
      { path: "reports", async lazy() { let { default: Component } = await import("../pages/internal/Reports"); return { Component }; } },
      { path: "staff", async lazy() { let { default: Component } = await import("../pages/internal/StaffManagement"); return { Component }; } },
    ]
  }
]);
