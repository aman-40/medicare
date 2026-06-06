import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

// Admin / Internal Layout
import InternalLayout from "../layouts/InternalLayout";
import Dashboard from "../pages/internal/Dashboard";
import PatientRegistration from "../pages/internal/PatientRegistration";
import PatientRecords from "../pages/internal/PatientRecords";
import QueueManagement from "../pages/internal/QueueManagement";
import EyeExamination from "../pages/internal/EyeExamination";
import OpticalStore from "../pages/internal/OpticalStore";
import OpticalOrders from "../pages/internal/OpticalOrders";
import MedicalInventory from "../pages/internal/MedicalInventory";
import Billing from "../pages/internal/Billing";
import StaffManagement from "../pages/internal/StaffManagement";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/", Component: LandingPage },
  { path: "/login", Component: Login },
  
  // Protected Admin Routes
  {
    path: "/admin",
    Component: InternalLayout,
    children: [
      { path: "", Component: Dashboard },
      { path: "patients/register", Component: PatientRegistration },
      { path: "patients/records", Component: PatientRecords },
      { path: "queue", Component: QueueManagement },
      { path: "eye-exams", Component: EyeExamination },
      { path: "optical-store", Component: OpticalStore },
      { path: "optical-orders", Component: OpticalOrders },
      { path: "inventory", Component: MedicalInventory },
      { path: "billing", Component: Billing },
      { path: "staff", Component: StaffManagement },
    ]
  }
]);
