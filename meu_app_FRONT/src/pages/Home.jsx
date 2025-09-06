import { Link, NavLink, Outlet } from "react-router-dom";
import "../style.css";

export default function Home() {
  return (
    <div className="container">
      <header className="topbar">
        <h1>Gestão Comercial</h1>
        <Link to="/leads/novo" className="btnPrimary">+ Novo Lead</Link>
      </header>

      {/* cards superiores (placeholders por enquanto) */}
      <section className="cards">
        <div className="card"><span>Leads Ativos</span><strong>89</strong></div>
        <div className="card"><span>Orçamentos</span><strong>45</strong></div>
        <div className="card"><span>Contratos</span><strong>2.045</strong></div>
        <div className="card"><span>Taxa Conversão</span><strong>68%</strong></div>
      </section>

      {/* abas */}
      <nav className="tabs">
        <NavLink to="/leads" className={({isActive}) => isActive ? "tab active" : "tab"}>
          Leads & Orçamentos
        </NavLink>
        <NavLink to="/contratos" className={({isActive}) => isActive ? "tab active" : "tab"}>
          Contratos
        </NavLink>
        <NavLink to="/relatorio" className={({isActive}) => isActive ? "tab active" : "tab"}>
          Relatório
        </NavLink>
      </nav>

      {/* renderiza o conteúdo da aba */}
      <Outlet />
    </div>
  );
}
