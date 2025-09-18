import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { isEmail } from "validator";
import { useState } from "react";
import BackHomeButton from "../components/BackHomeButton";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const onlyDigits = (str) => str.replace(/\D/g, "");

// Validação algorítmica de CPF válido
function isValidCPF(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf.charAt(10));
}

export default function CadastroCliente() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

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

  // Submit -> envia para o backend
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

      const resp = await fetch(`${API_URL}/cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let detail = "Erro ao salvar o cliente.";
        try {
          const body = await resp.json();
          detail = body?.detail || detail;
        } catch {
          // Fallback to default error message
        }
        throw new Error(detail);
      }

      setSuccessMsg("Lead cadastrado com sucesso.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="leadForm">
      <h1>Novo Lead</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {successMsg && <div className="success-message">{successMsg}</div>}
        {serverError && <div className="error-message">{serverError}</div>}

        <div className="form-lead">
          <label>CPF:</label>
          <input
            className={errors?.cpf ? "input-error" : ""}
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder="CPF (somente números)"
            {...register("cpf", {
              required: "Preencha o CPF.",
              validate: (v) => isValidCPF(v) || "CPF inválido.",
            })}
          />
          {errors?.cpf && <p className="error-message">{errors.cpf.message}</p>}
        </div>

        <div className="form-lead">
          <label>Nome:</label>
          <input
            className={errors?.nome ? "input-error" : ""}
            type="text"
            placeholder="Nome completo"
            {...register("nome", { required: "Preencha o nome." })}
          />
          {errors?.nome && (
            <p className="error-message">{errors.nome.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>E-mail:</label>
          <input
            className={errors?.email ? "input-error" : ""}
            type="email"
            placeholder="E-mail"
            {...register("email", {
              required: "Preencha o e-mail.",
              validate: (value) => isEmail(value) || "E-mail inválido.",
            })}
          />
          {errors?.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>WhatsApp:</label>
          <input
            className={errors?.whatsapp ? "input-error" : ""}
            type="text"
            inputMode="tel"
            placeholder="(DDD) número"
            {...register("whatsapp", {
              required: "Informe o WhatsApp.",
              validate: (v) =>
                onlyDigits(v).length >= 10 || "WhatsApp inválido.",
            })}
          />
          {errors?.whatsapp && (
            <p className="error-message">{errors.whatsapp.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>CEP:</label>
          <input
            className={errors?.cep ? "input-error" : ""}
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder="CEP (somente números)"
            {...register("cep", { required: "Preencha o CEP." })}
            onBlur={checkCEP}
          />
          {errors?.cep && <p className="error-message">{errors.cep.message}</p>}
        </div>

        <div className="form-lead">
          <label>Rua:</label>
          <input
            className={errors?.rua ? "input-error" : ""}
            type="text"
            placeholder="Rua"
            {...register("rua", { required: "Preencha a rua." })}
          />
          {errors?.rua && <p className="error-message">{errors.rua.message}</p>}
        </div>

        <div className="form-lead">
          <label>Número:</label>
          <input
            className={errors?.numero ? "input-error" : ""}
            type="text"
            inputMode="numeric"
            placeholder="Número"
            {...register("numero", { required: "Preencha o número." })}
          />
          {errors?.numero && (
            <p className="error-message">{errors.numero.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>Complemento:</label>
          <input
            type="text"
            placeholder="Apto, bloco (opcional)"
            {...register("complemento")}
          />
        </div>

        <div className="form-lead">
          <label>Bairro:</label>
          <input
            className={errors?.bairro ? "input-error" : ""}
            type="text"
            placeholder="Bairro"
            {...register("bairro", { required: "Preencha o bairro." })}
          />
          {errors?.bairro && (
            <p className="error-message">{errors.bairro.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>Cidade:</label>
          <input
            className={errors?.cidade ? "input-error" : ""}
            type="text"
            placeholder="Cidade"
            {...register("cidade", { required: "Preencha a cidade." })}
          />
          {errors?.cidade && (
            <p className="error-message">{errors.cidade.message}</p>
          )}
        </div>

        <div className="form-lead">
          <label>Estado:</label>
          <input
            className={errors?.estado ? "input-error" : ""}
            type="text"
            placeholder="UF"
            {...register("estado", { required: "Preencha o estado." })}
          />
          {errors?.estado && (
            <p className="error-message">{errors.estado.message}</p>
          )}
        </div>

        <div className="align-buttons">
          <div className="form-lead">
            <BackHomeButton />
          </div>
          <div className="form-lead">
            <button className="save" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
