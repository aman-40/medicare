import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import PatientDashboard from "../pages/PatientDashboard";
import EyeCheckupBooking from "../pages/EyeCheckupBooking";
import LiveQueue from "../pages/LiveQueue";
import DoctorDashboard from "../pages/DoctorDashboard";
import OpticalStore from "../pages/OpticalStore";
import ProductDetail from "../pages/ProductDetail";
import PharmacyStore from "../pages/PharmacyStore";
import AdminDashboard from "../pages/AdminDashboard";
import OrderTracking from "../pages/OrderTracking";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PharmacistDashboard from "../pages/PharmacistDashboard";
import ReceptionistDashboard from "../pages/ReceptionistDashboard";
import InventoryLayout from "../pages/inventory/InventoryLayout";
import Dashboard from "../pages/inventory/Dashboard";
import Medicines from "../pages/inventory/Medicines";
import Purchases from "../pages/inventory/Purchases";
import ExpiryAlerts from "../pages/inventory/Expiry";
import Suppliers from "../pages/inventory/Suppliers";
import Frames from "../pages/inventory/Frames";
import Lenses from "../pages/inventory/Lenses";
import Logs from "../pages/inventory/Logs";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/patient-dashboard", Component: PatientDashboard },
  { path: "/appointments", Component: EyeCheckupBooking },
  { path: "/queue", Component: LiveQueue },
  { path: "/doctor", Component: DoctorDashboard },
  { path: "/optical-store", Component: OpticalStore },
  { path: "/optical-store/:id", Component: ProductDetail },
  { path: "/medicines", Component: PharmacyStore },
  { path: "/admin", Component: AdminDashboard },
  {
    path: "/inventory",
    Component: InventoryLayout,
    children: [
      { path: "", Component: Dashboard },
      { path: "medicines", Component: Medicines },
      { path: "purchases", Component: Purchases },
      { path: "expiry", Component: ExpiryAlerts },
      { path: "suppliers", Component: Suppliers },
      { path: "frames", Component: Frames },
      { path: "lenses", Component: Lenses },
      { path: "logs", Component: Logs },
    ]
  },
  { path: "/track-order/:id", Component: OrderTracking },
  { path: "/pharmacist", Component: PharmacistDashboard },
  { path: "/receptionist", Component: ReceptionistDashboard }
]);
