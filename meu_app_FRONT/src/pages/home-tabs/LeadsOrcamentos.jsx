import { useEffect, useMemo, useState } from "react";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const onlyDigits = (v = "") => String(v ?? "").replace(/\D/g, "");

// tabela de preços para compor mensagem do WhatsApp
const PRICE_TABLE = {
  "1": { label: "Apuração mensal (12 meses) + IRPF do ano", valor: 5000 },
  "2": { label: "Apuração mensal (12 meses)", valor: 4000 },
  "3": { label: "IRPF do ano", valor: 1500 },
};

export default function LeadsOrcamentos() {
  const [q, setQ] = useState("");         
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [leads, setLeads] = useState([]);  

  // carrega a lista de clientes do back
  useEffect(() => {
    let abort = false;
    setLoading(true);
    setErr("");

    fetch(`${API_URL}/clientes`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (abort) return;
        const arr = Array.isArray(json) ? json : json.clientes || [];
        setLeads(arr);
      })
      .catch(() => !abort && setErr("Falha ao carregar clientes."))
      .finally(() => !abort && setLoading(false));

    return () => {
      abort = true; 
    };
  }, []);

  // filtro em memória pelo termo digitado
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((c) =>
      [c.nome, c.email, c.cpf, c.telefone, c.cidade, c.bairro]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, leads]);

  // Botão ver detalhes (edita o cliente - "/leads/editar/:cpf")
  const formatDetails = (c) => {
    // Redireciona para a página de edição do cliente
    window.location.href = `/leads/editar/${onlyDigits(c.cpf)}`;
  }

  // Botão enviar proposta (monta e abre mensagem de proposta no WhatsApp)
 const openWhats = async (c) => {
  if (c.proposta_enviada) {
    alert("Proposta já enviada para este cliente.");
    return;
  }

  const tel = onlyDigits(c.telefone);
  if (!tel) return alert("Cliente sem WhatsApp cadastrado.");

  const msg = [
    `Olá ${c.nome}! Tudo bem?`,
    `Segue a proposta de serviços de contabilidade:`,
    `1) ${PRICE_TABLE["1"].label} — R$ ${PRICE_TABLE["1"].valor.toLocaleString("pt-BR")}`,
    `2) ${PRICE_TABLE["2"].label} — R$ ${PRICE_TABLE["2"].valor.toLocaleString("pt-BR")}`,
    `3) ${PRICE_TABLE["3"].label} — R$ ${PRICE_TABLE["3"].valor.toLocaleString("pt-BR")}`,
    "",
    `Qual serviço gostaria de contratar? Me avise que já gero o contrato.`,
  ].join("\n");

  // abre WhatsApp
  const url = `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");

  // marca no backend que a proposta foi enviada
  try {
    const resp = await fetch(`${API_URL}/cliente/proposta?cpf=${onlyDigits(c.cpf)}`, {
      method: "POST",
    });
    if (!resp.ok) {
      const j = await resp.json().catch(() => ({}));
      alert(j?.mesage || "Falha ao marcar proposta como enviada.");
      return;
    }
    // reflete na UI
    setLeads((old) => old.map((x) =>
      x.cpf === c.cpf ? { ...x, proposta_enviada: true } : x
    ));
  } catch {
    alert("Erro de conexão ao marcar proposta como enviada.");
  }
};

  // Botão gerar contrato (ACEITE/RECUSA)
  const handleContrato = async (c) => {
    const aceito = window.confirm(
      `Gerar contrato para ${c.nome} agora?\n(OK = ACEITAR • Cancelar = RECUSAR)`
    );

    if (aceito) {
      const tel = onlyDigits(c.telefone);
      const msg = [
        "*Contrato*",
        `Cliente: ${c.nome}`,
        `CPF: ${maskCPF(c.cpf)}`,
        "",
        "Conforme proposta enviada, seguiremos com a assinatura do contrato.",
      ].join("\n");

      if (tel) {
        const url = `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank", "noopener");
      }
      alert("Contrato gerado e enviado via WhatsApp.");
    } else {
      alert("Contrato recusado.");
    }
  };


  return (
    <section className="panel">
      <h2>Leads e Orçamentos</h2>

      <div className="searchRow">
        <input
          placeholder="Pesquisar leads (nome, email, telefone, cpf)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={() => setQ(q)}>Filtrar</button>
      </div>

      {loading && <p>Carregando...</p>}
      {err && <p className="error-message">{err}</p>}

      {filtered.map((c) => (
        <article key={String(c.id ?? c.cpf)} className="leadCard">
          <div>
            <h3>{c.nome}</h3>
            <p>
              {c.email} • {formatPhone(c.telefone)}
            </p>
            <small>
              {c.cidade} • CPF {maskCPF(c.cpf)}
            </small>
          </div>

          <div className="leadActions">
            {/* Ver Detalhes */}
            <button className="btnGhost" onClick={() => formatDetails(c)}>
              Ver Detalhes
            </button>

            {/* Enviar Proposta (WhatsApp) */}
            <button
              className={c.proposta_enviada ? "btnDisabled" : "btnGhost"}
              disabled={!!c.proposta_enviada}
              onClick={() => openWhats(c)}
            >
              {c.proposta_enviada ? "Proposta Enviada" : "Enviar Proposta"}
            </button>

            {/* Gerar Contrato (aceite/recusa) */}
            <button className="btnDark" onClick={() => handleContrato(c)}>
              Gerar Contrato
            </button>
          </div>
        </article>
      ))}

      {!loading && filtered.length === 0 && <p>Nenhum lead encontrado.</p>}
    </section>
  );
}


/* helpers de formatação */
function maskCPF(v) {
  const s = onlyDigits(v);
  if (s.length !== 11) return s;
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}

function formatPhone(v) {
  const s = onlyDigits(v);
  if (s.length === 11) return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
  if (s.length === 10) return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
  return s;
}
