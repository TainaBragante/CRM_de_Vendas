export default function Relatorio() {
  return (
    <section className="panel">
      <h2>Relatório Comercial</h2>
      <div className="reports">
        <div>
          <h3>Performance do Mês</h3>
          <p>Leads gerados: <strong>89</strong></p>
          <p>Contratos fechados: <strong>61</strong></p>
          <p>Receita gerada: <strong>R$ 142.500</strong></p>
          <p>Ticket médio: <strong>R$ 2.336</strong></p>
        </div>
        <div>
          <h3>Motivos de Não Fechamento</h3>
          <p>Preço alto: <span className="danger">12 leads</span></p>
          <p>Já tem contador: <span className="danger">8 leads</span></p>
          <p>Não retornou: <span className="danger">5 leads</span></p>
          <p>Outros motivos: <span className="danger">3 leads</span></p>
        </div>
      </div>
    </section>
  );
}
