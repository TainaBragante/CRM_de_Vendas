import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import BackHomeButton from "../components/BackHomeButton";


const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EditarCliente() {
  const navigate = useNavigate();
  const { cpf: cpfParam } = useParams();           
  const cpfKey = onlyDigits(cpfParam);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Carrega dados do cliente pelo CPF da URL
  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      setServerError("");
      try {
        const resp = await fetch(`${API_URL}/cliente?cpf=${cpfKey}`);
        if (!resp.ok) {
          // 404 etc
          let detail = "Não foi possível carregar o cliente.";
          try {
            const body = await resp.json();
            detail = body?.detail || body?.message || detail;
          } catch {
            // Intentionally left blank: fallback to default detail message
          }
          throw new Error(detail);
        }

        const data = await resp.json();
        // back pode responder {cliente:{...}} ou diretamente {...}
        const c =
          data?.cliente ??
          (data?.clientes && Array.isArray(data.clientes)
            ? data.clientes[0]
            : data);

        if (!c) throw new Error("Cliente não encontrado.");

        // joga nos campos
        reset({
          cpf: c.cpf,
          nome: c.nome,
          email: c.email,
          whatsapp: c.telefone,
          cep: c.cep,
          rua: c.logradouro,
          numero: c.numero,
          complemento: c.complemento || "",
          bairro: c.bairro,
          cidade: c.cidade,
          estado: c.estado,
        });
      } catch (err) {
        if (!abort) setServerError(err.message);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [cpfKey, reset]);

  // PUT /cliente?cpf=...
  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const payload = {
        // CPF é chave; mantido apenas para referência do back (se ele aceitar no body)
        cpf: onlyDigits(data.cpf),
        nome: data.nome,
        email: data.email,
        telefone: onlyDigits(data.whatsapp),
        cep: onlyDigits(data.cep),
        logradouro: data.rua,
        numero: String(data.numero),
        complemento: data.complemento || "",
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      };

      const resp = await fetch(`${API_URL}/cliente?cpf=${cpfKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let detail = "Erro ao alterar o cliente.";
        try {
          const body = await resp.json();
          detail = body?.detail || body?.message || detail;
        } catch {
          // Intentionally left blank: fallback to default detail message
        }
        throw new Error(detail);
      }

      setSuccessMsg("Cliente alterado com sucesso.");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE /cliente?cpf=...
  const onDelete = async () => {
    const yes = window.confirm(
      `Confirma excluir o cliente de CPF ${cpfKey}? Essa ação não pode ser desfeita.`
    );
    if (!yes) return;

    setServerError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/cliente?cpf=${cpfKey}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        let detail = "Erro ao excluir o cliente.";
        try {
          const body = await resp.json();
          detail = body?.detail || body?.message || detail;
        } catch {
          // Intentionally left blank: fallback to default detail message
        }
        throw new Error(detail);
      }

      setSuccessMsg("Cliente excluído com sucesso.");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>Editar Cliente</h2>

      {loading && <p>Carregando...</p>}
      {!!serverError && <p className="error-message">{serverError}</p>}
      {!!successMsg && <p className="success-message">{successMsg}</p>}

      {!loading && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>CPF:</label>
            <input
              type="text"
              disabled                       // CPF como chave não editável
              {...register("cpf")}
            />
            <small>CPF não editável.</small>
          </div>

          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              {...register("nome", { required: "Informe o nome." })}
            />
            {errors.nome && (
              <p className="error-message">{errors.nome.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>E-mail:</label>
            <input
              type="email"
              {...register("email", { required: "Informe o e-mail." })}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>WhatsApp:</label>
            <input type="text" {...register("whatsapp")} />
          </div>

          <div className="form-group">
            <label>CEP:</label>
            <input type="text" {...register("cep")} />
          </div>

          <div className="form-group">
            <label>Rua (Logradouro):</label>
            <input type="text" {...register("rua")} />
          </div>

          <div className="form-group">
            <label>Número:</label>
            <input type="text" {...register("numero")} />
          </div>

          <div className="form-group">
            <label>Complemento:</label>
            <input type="text" {...register("complemento")} />
          </div>

          <div className="form-group">
            <label>Bairro:</label>
            <input type="text" {...register("bairro")} />
          </div>

          <div className="form-group">
            <label>Cidade:</label>
            <input type="text" {...register("cidade")} />
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <input type="text" {...register("estado")} />
          </div>

          <div className="form-actions" style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="save">
              Alterar
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="btnDanger"
              style={{ background: "#ffebee", border: "1px solid #ef9a9a" }}
            >
              Excluir
            </button>

            <BackHomeButton label="Voltar" />
          </div>
        </form>
      )}
    </section>
  );
}
