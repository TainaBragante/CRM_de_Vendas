export default function LeadsOrcamentos() {
  return (
    <section className="panel">
      <h2>Leads e Orçamentos</h2>
      <div className="searchRow">
        <input placeholder="Pesquisar leads..." />
        <button>Filtrar</button>
      </div>

      {/* cards de leads – placeholders */}
      <div className="leadCard">
        <div>
          <h3>Carlos Mendes</h3>
          <p>carlos@email.com • (11) 99999-9999</p>
          <p>Mercados: B3, Cripto</p>
        </div>
        <div className="leadActions">
          <button className="btnGhost">Ver Detalhes</button>
          <button className="btnGhost">Enviar Proposta</button>
          <button className="btnDark">Gerar Contrato</button>
        </div>
      </div>

      <div className="leadCard">
        <div>
          <h3>Lucia Fernandes</h3>
          <p>lucia@email.com • (21) 88888-8888</p>
          <p>Mercados: Internacional</p>
        </div>
        <div className="leadActions">
          <button className="btnGhost">Ver Detalhes</button>
          <button className="btnGhost">Enviar Proposta</button>
          <button className="btnDark">Gerar Contrato</button>
        </div>
      </div>
    </section>
  );
}
