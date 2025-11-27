import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import OwnerDashboard from "./OwnerDashboard";
import EmployeeManagementPage from "./components/EmployeeManagementPage";
import RestaurantMenuPage from "./components/RestaurantMenuPage";
import LiveInventoryPage from "./components/LiveInventoryPage";
import TableManagementPage from "./components/TableManagementPage";
import BillingPage from "./components/BillingPage";
import QRCodeGenerator from './components/QRCodeGenerator';



function App() {
  return (
    <Routes>
     
    
    
      {/* Login */}
      <Route path="/" element={<LoginPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<OwnerDashboard />}>
        {/* Default route (when user only goes to /dashboard) */}
        <Route index element={<h2>Welcome to the Owner Dashboard!</h2>} />

        {/* Child routes */}
        <Route path="employees" element={<EmployeeManagementPage />} />
        <Route path="menu" element={<RestaurantMenuPage />} />
        <Route path="inventory" element={<LiveInventoryPage />} />
        <Route path="tables" element={<TableManagementPage />} />
          <Route path="qr-codes" element={<QRCodeGenerator />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
