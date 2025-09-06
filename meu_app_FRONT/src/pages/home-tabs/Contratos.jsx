export default function Contratos() {
  return (
    <section className="panel">
      <h2>Contratos Ativos</h2>

      <div className="contractCard">
        <div>
          <h3>João Santos</h3>
          <p>Mercados: B3, Internacional, Cripto</p>
          <p>Início: 2024-01-01 • Próx. pagamento: 2024-02-01</p>
        </div>
        <div className="contractActions">
          <strong>R$ 3.500/mês</strong>
          <div>
            <button className="btnGhost">Ver Contrato</button>
            <button className="btnGhost">Gerar Boleto</button>
            <button className="btnGhost">Histórico</button>
          </div>
        </div>
      </div>

      <div className="contractCard">
        <div>
          <h3>Maria Oliveira</h3>
          <p>Mercados: B3, Cripto</p>
          <p>Início: 2023-12-15 • Próx. pagamento: 2024-01-15</p>
        </div>
        <div className="contractActions">
          <strong>R$ 2.200/mês</strong>
          <div>
            <button className="btnGhost">Ver Contrato</button>
            <button className="btnGhost">Gerar Boleto</button>
            <button className="btnGhost">Histórico</button>
          </div>
        </div>
      </div>
    </section>
  );
}
