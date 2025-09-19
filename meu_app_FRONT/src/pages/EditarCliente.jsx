import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import BackHomeButton from "../components/BackHomeButton";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const onlyDigits = (str) => str.replace(/\D/g, "");

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
    reset,
    setValue,
    setFocus,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  // Carrega os dados do cliente pelo CPF 
  useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      setServerError("");
      try {
        const resp = await fetch(`${API_URL}/cliente?cpf=${cpfKey}`);
        if (!resp.ok) {
          let detail = "Não foi possível carregar o cliente.";
          try {
            const body = await resp.json();
            detail = body?.detail || body?.message || detail;
          } catch {
            // Fallback to default error message
          }
          throw new Error(detail);
        }

        const data = await resp.json();
        const c =
          data?.cliente ??
          (data?.clientes && Array.isArray(data.clientes)
            ? data.clientes[0]
            : data);

        if (!c) throw new Error("Cliente não encontrado.");

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
    return () => { abort = true; };
  }, [cpfKey, reset]);

  // API ViaCEP
  const checkCEP = async (e) => {
    const cep = onlyDigits(e.target.value);
    if (cep.length !== 8) {
      clearErrors("cep");
      setError("cep", {
        type: "manual",
        message: "CEP inválido (digite 8 dígitos).",
      });
      return;
    }
    clearErrors("cep");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("cep", { type: "manual", message: "CEP não encontrado." });
        return;
      }
      // CEP válido: popula os campos
      setValue("rua", data.logradouro || "");
      setValue("bairro", data.bairro || "");
      setValue("cidade", data.localidade || "");
      setValue("estado", data.estado || "");
      setFocus("numero");
    } catch {
      setError("cep", {
        type: "manual",
        message: "Erro ao buscar o CEP. Tente novamente.",
      });
    }
  };

  // PUT /cliente?cpf=...
  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const payload = {
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
          // Fallback to default error message
        }
        throw new Error(detail);
      }

      setSuccessMsg("Cliente alterado com sucesso.");
      // setTimeout(() => navigate("/"), 1200);     // Volta para a home após editar
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE /cliente?cpf=...
  const onDelete = async () => {
    const yes = window.confirm(
      `Deseja excluir o cliente de CPF ${cpfKey}? Essa ação não pode ser desfeita.`
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
          // Fallback to default error message
        }
        throw new Error(detail);
      }

      setSuccessMsg("Cliente excluído com sucesso.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="editForm">
      <h1>Editar Cliente</h1>

      {loading && <p>Carregando...</p>}
      {!!serverError && <p className="error-message">{serverError}</p>}
      {!!successMsg && <p className="success-message">{successMsg}</p>}
      {!loading && (
      
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-edit">
            <label>CPF:</label>
            <input type="text" disabled {...register("cpf")} />
            <small>CPF não editável.</small>
          </div>

          <div className="form-edit">
            <label>Nome:</label>
            <input type="text" {...register("nome", { required: "Informe o nome." })} />
            {errors.nome && <p className="error-message">{errors.nome.message}</p>}
          </div>

          <div className="form-edit">
            <label>E-mail:</label>
            <input type="email" {...register("email", { required: "Informe o e-mail." })} />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          <div className="form-edit">
            <label>WhatsApp:</label>
            <input type="text" {...register("whatsapp")} />
          </div>

          <div className="form-edit">
            <label>CEP:</label>
            <input type="text" {...register("cep")} onBlur={checkCEP} />
            {errors.cep && <p className="error-message">{errors.cep.message}</p>}
          </div>

          <div className="form-edit">
            <label>Logradouro:</label>
            <input type="text" {...register("rua")} />
          </div>

          <div className="form-edit">
            <label>Número:</label>
            <input type="text" {...register("numero")} />
          </div>

          <div className="form-edit">
            <label>Complemento:</label>
            <input type="text" {...register("complemento")} />
          </div>

          <div className="form-edit">
            <label>Bairro:</label>
            <input type="text" {...register("bairro")} />
          </div>

          <div className="form-edit">
            <label>Cidade:</label>
            <input type="text" {...register("cidade")} />
          </div>

          <div className="form-edit">
            <label>Estado:</label>
            <input type="text" {...register("estado")} />
          </div>

          <div className="form-actions" style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="save">Alterar</button>
            <button
              type="button"
              onClick={onDelete}
              className="btnDanger"
              style={{ background: "#ffebee", border: "1px solid #ef9a9a" }}
            >
              Excluir
            </button>
            <BackHomeButton />
          </div>
        </form>
      )}

    </div>
  );
}
