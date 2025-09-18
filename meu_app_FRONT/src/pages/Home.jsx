import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "../style.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
// --------- Card 1: Leads Ativos e Card 2: Propostas enviadas ---------
  const [leadCount, setLeadCount] = useState(0);
  const [propsSent, setPropsSent] = useState(0);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [, setErrLeads] = useState("");

  useEffect(() => {
    let abort = false;
    setLoadingLeads(true);
    setErrLeads("");
    fetch(`${API_URL}/clientes`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (abort) return;
        const arr = Array.isArray(json) ? json : json.clientes || [];
        setLeadCount(arr.length);
        setPropsSent(arr.filter(c => c.proposta_enviada).length);
      })
      .catch(() => !abort && setErrLeads("Falha ao carregar clientes."))
      .finally(() => !abort && setLoadingLeads(false));
    return () => { abort = true; };
  }, []);

// --------- Card 3: Valor do Dólar (USD/BRL) ---------
  const [usd, setUsd] = useState(null);
  const [usdLoading, setUsdLoading] = useState(true);
  const [usdErr, setUsdErr] = useState("");
  
  useEffect(() => {
    const loadUSD = async () => {
      setUsdLoading(true);
      setUsdErr("");
      try {
        // API pública de câmbio
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        const data = await res.json();
        if (data?.USDBRL?.bid) {
          setUsd(parseFloat(data.USDBRL.bid));
        } else {
          throw new Error("Dados inválidos");
        }
      } catch {
        setUsdErr("Falha ao carregar valor do dólar");
      } finally {
        setUsdLoading(false);
      }
    }
    loadUSD();
  }, []);

// --------- Card 4: Calendário (dia de hoje // próximo feriado) ---------
const [agenda, setAgenda] = useState({
  loading: true,
  err: "",
  todayBR: "",
  nextHoliday: null, 
});

useEffect(() => {
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parseISOAsLocalDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d); 
  };

  const fmtHoje = today.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  const loadAgenda = async () => {
    try {
      const year = today.getFullYear();
      const fetchYear = async (y) => {
        // API pública de feriados
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/BR`);
        return res.json();
      };

      const holidaysThis = await fetchYear(year);

      // próximo feriado >= hoje
      let upcoming = (Array.isArray(holidaysThis) ? holidaysThis : [])
        .map(h => ({ ...h, d: parseISOAsLocalDate(h.date) }))
        .filter(h => startOfDay(h.d) >= startOfDay(today))
        .sort((a, b) => a.d - b.d)[0] || null;

      // se acabou o ano, pega o 1º do ano seguinte
      if (!upcoming) {
        const holidaysNext = await fetchYear(year + 1);
        if (Array.isArray(holidaysNext) && holidaysNext.length) {
          const h0 = holidaysNext[0];
          upcoming = { ...h0, d: parseISOAsLocalDate(h0.date) };
        }
      }

      const nextHoliday = upcoming ? {
        name: upcoming.localName,
        dateBR: upcoming.d.toLocaleDateString("pt-BR"),
      } : null;

      setAgenda({ loading: false, err: "", todayBR: fmtHoje, nextHoliday });
    } catch {
      setAgenda(a => ({ ...a, loading: false, err: "Falha ao carregar calendário" }));
    }
  };

  loadAgenda();
}, []);



  return (
    <div className="container">
      <header className="topbar">
        <h1>Gestão Comercial</h1>
        <Link to="/leads/novo" className="btnPrimary">+ Novo Lead</Link>
      </header>

      {/* cards superiores */}
      <section className="cards">
        {/* Card 1 */}
        <div className="card">
          <span>Leads Ativos</span>
          <strong>
            {loadingLeads ? "Carregando..." : leadCount}
          </strong>
        </div>

        {/* Card 2 */}
        <div className="card">
          <span>Propostas Enviadas</span>
          <strong>
            {loadingLeads ? "Carregando..." : propsSent}
          </strong>

        </div>

        {/* Card 3 */}
        <div className="card">
          <span>Valor do Dólar</span>
          <strong>
            {usdLoading ? "Carregando..." : (usd ? `R$ ${usd.toFixed(2)}` : "—")}
          </strong>
          {usdErr && <small style={{opacity:0.8}}>{usdErr}</small>}
        </div>

        {/* Card 4 */}
        <div className="card">
          <span>Calendário</span>
          <strong>
            {agenda.loading ? "Carregando..." : agenda.todayBR}
          </strong>
          {agenda.nextHoliday && (
            <small style={{opacity:0.8}}>
              Próx. feriado: {agenda.nextHoliday.name} ({agenda.nextHoliday.dateBR})
            </small>
          )}
          {agenda.err && <small style={{opacity:0.8}}>{agenda.err}</small>}
        </div>

      </section>

      {/* home-tabs */}
      <nav className="tabs">
        <NavLink to="/leads" className={({ isActive }) => isActive ? "tab active" : "tab"}>
          Leads & Orçamentos
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
