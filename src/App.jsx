import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/loginPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import ProfitPage from "./pages/ProfitPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/profit" element={<ProfitPage />} />
    </Routes>
  );
}

export default App;
