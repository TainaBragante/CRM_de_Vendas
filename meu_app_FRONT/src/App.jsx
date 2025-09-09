import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import EditarCliente from "./pages/EditarCliente";
import CadastroCliente from "./pages/CadastroCliente";
import LeadsOrcamentos from "./pages/home-tabs/LeadsOrcamentos";
import Contratos from "./pages/home-tabs/Contratos";
import Relatorio from "./pages/home-tabs/Relatorio";


export default function App() {
  return (
    <Routes>
      {/* Página principal com abas internas */}
      <Route path="/" element={<Home />}>
        <Route index element={<Navigate to="leads" replace />} />
        <Route path="leads" element={<LeadsOrcamentos />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="relatorio" element={<Relatorio />} />
      </Route>

      {/* Página separada para o botão "+ Novo Lead" */}
      <Route path="/leads/novo" element={<CadastroCliente />} />

      {/* Página separada para o botão "Ver Detalhes" */}
      <Route path="/leads/editar/:cpf" element={<EditarCliente />} />

      {/* 404 -> volta pro início */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
