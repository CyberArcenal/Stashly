// src/renderer/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layouts/Layout";
import DashboardPage from "../pages/dashboard";
import ProductsPage from "../pages/products";
import PageNotFound from "../components/Shared/PageNotFound";
import ActivationPage from "../pages/activation/pages/Index";
import VariantsPage from "../pages/productVariant";
import CategoriesPage from "../pages/categories";
import SalesPage from "../pages/orders";
import PurchasesPage from "../pages/purchases";
import WarehousesPage from "../pages/warehouse";
import StockItemsPage from "../pages/stock-items";
import StockMovementsPage from "../pages/stock-movements";
import StockAdjustmentPage from "../pages/stock-adjustment";
import StockTransferPage from "../pages/stock-transfer";

const PlaceholderPage = ({ name }: { name: string }) => <div>{name} Page</div>;

function App() {
  return (
    <Routes>
      {/* ✅ TANGGALIN ANG EXTRA TOP-LEVEL REDIRECT */}
      {/* Main layout route - lahat ng pages dito */}
      <Route path="/" element={<Layout />}>
        {/* Dashboard (default) */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Core */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/variants" element={<VariantsPage/>} />
        <Route path="/products/categories" element={<CategoriesPage/>} />
        <Route path="/orders" element={<SalesPage/>} />
        <Route path="/purchases" element={<PurchasesPage/>} />

        {/* Inventory */}
        <Route path="/locations" element={<WarehousesPage />} />
        <Route path="/stock-items" element={<StockItemsPage/>} />
        <Route path="/stock-movements" element={<StockMovementsPage />} />
        <Route path="/inventory/adjustments" element={<StockAdjustmentPage/>} />
        <Route path="/inventory/transfers" element={<StockTransferPage/>} />

        {/* Analytics */}
        <Route path="/reports/sales" element={<PlaceholderPage name="Sales Reports" />} />
        <Route path="/reports/inventory" element={<PlaceholderPage name="Inventory Reports" />} />
        <Route path="/reports/profit-loss" element={<PlaceholderPage name="Profit & Loss" />} />
        <Route path="/products/low-stock" element={<PlaceholderPage name="Low Stock" />} />
        <Route path="/products/out-of-stock" element={<PlaceholderPage name="Out of Stock" />} />

        {/* System */}
        <Route path="/settings" element={<PlaceholderPage name="Settings" />} />
        <Route path="/settings/inventory" element={<PlaceholderPage name="Inventory Settings" />} />
        {/* <Route path="activation" element={<ActivationPage />} /> */}

        {/* 404 - Dapat last */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default App;