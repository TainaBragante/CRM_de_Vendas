from flask_openapi3 import OpenAPI, Info, Tag
from flask import redirect
from flask_cors import CORS
from urllib.parse import quote
import httpx
from sqlalchemy.exc import IntegrityError
from model import Base, engine, SessionLocal, Cliente
from schemas import ClienteIn, ClienteOut

# ---------- App & Swagger ----------
info = Info(title="ERP Comercial - API", version="1.0.0")
app = OpenAPI(__name__, info=info)
CORS(app, resources={r"*": {"origins": ["http://localhost:5173"]}})

home_tag = Tag(name="Documentação", description="Escolha Swagger / Redoc / RapiDoc")
cliente_tag = Tag(name="Clientes", description="Cadastro e consulta de clientes")

# ---------- DB bootstrap ----------
Base.metadata.create_all(engine)

# ---------- Utils ----------
def only_digits(v: str) -> str:
    return "".join(c for c in (v or "") if c.isdigit())

def cpf_valido(cpf: str) -> bool:
    cpf = only_digits(cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    s = sum(int(cpf[i]) * (10 - i) for i in range(9))
    d1 = (s * 10) % 11
    if d1 == 10: d1 = 0
    if d1 != int(cpf[9]): return False
    s = sum(int(cpf[i]) * (11 - i) for i in range(10))
    d2 = (s * 10) % 11
    if d2 == 10: d2 = 0
    return d2 == int(cpf[10])

async def via_cep(cep: str) -> dict:
    cep = only_digits(cep)
    url = f"https://viacep.com.br/ws/{cep}/json/"
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(url)
    data = r.json()
    if r.status_code != 200 or data.get("erro"):
        raise ValueError("CEP não encontrado")
    return {
        "cep": data.get("cep", "").replace("-", ""),
        "logradouro": data.get("logradouro", ""),
        "bairro": data.get("bairro", ""),
        "cidade": data.get("localidade", ""),
        "uf": data.get("uf", ""),
    }

# ---------- Docs ----------
@app.get("/", tags=[home_tag])
def home():
    """Redireciona para /openapi (Swagger/Redoc/RapiDoc)."""
    return redirect("/openapi")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/deps")
async def deps():
    try:
        await via_cep("01001000")
        return {"viacep": "ok"}
    except Exception as e:
        return {"viacep": f"down: {e}"}, 503

# ---------- Clientes ----------
@app.post("/clientes", tags=[cliente_tag])
async def criar_cliente(form: ClienteIn):
    """
    Cadastra um cliente:
    - valida CPF por dígitos (válido ≠ existência);
    - completa endereço via ViaCEP;
    - salva no SQLite.
    """
    if not cpf_valido(form.cpf):
        return {"detail": "CPF inválido."}, 400

    try:
        # completa endereço
        cep_data = await via_cep(form.endereco.cep)

        cli = Cliente(
            nome=form.nome,
            cpf=only_digits(form.cpf),
            email=form.email,
            telefone=only_digits(form.telefone),
            cep=cep_data["cep"],
            numero=form.endereco.numero,
            complemento=form.endereco.complemento or "",
            logradouro=cep_data["logradouro"],
            bairro=cep_data["bairro"],
            cidade=cep_data["cidade"],
            uf=cep_data["uf"],
        )

        session = SessionLocal()
        session.add(cli)
        session.commit()
        session.refresh(cli)
        session.close()

        out = ClienteOut(
            id=cli.id,
            nome=cli.nome,
            cpf=cli.cpf,
            email=cli.email,
            telefone=cli.telefone,
            endereco={
                "cep": cli.cep,
                "numero": cli.numero,
                "complemento": cli.complemento,
                "logradouro": cli.logradouro,
                "bairro": cli.bairro,
                "cidade": cli.cidade,
                "uf": cli.uf,
            },
        )
        return out.dict(), 201

    except IntegrityError:
        # CPF único
        return {"detail": "Cliente com este CPF já existe."}, 409
    except ValueError as ve:
        return {"detail": str(ve)}, 400
    except Exception as e:
        return {"detail": f"Erro interno: {e}"}, 500

@app.get("/clientes", tags=[cliente_tag])
def listar_clientes():
    """Lista todos os clientes."""
    session = SessionLocal()
    rows = session.query(Cliente).order_by(Cliente.created_at.desc()).all()
    session.close()

    return [
        {
            "id": c.id,
            "nome": c.nome,
            "cpf": c.cpf,
            "email": c.email,
            "telefone": c.telefone,
            "endereco": {
                "cep": c.cep,
                "numero": c.numero,
                "complemento": c.complemento,
                "logradouro": c.logradouro,
                "bairro": c.bairro,
                "cidade": c.cidade,
                "uf": c.uf,
            },
        }
        for c in rows
    ]

@app.get("/clientes/<id>", tags=[cliente_tag])
def obter_cliente(id: str):
    """Retorna um cliente por id."""
    session = SessionLocal()
    c = session.get(Cliente, id)
    session.close()
    if not c:
        return {"detail": "Cliente não encontrado."}, 404
    return {
        "id": c.id,
        "nome": c.nome,
        "cpf": c.cpf,
        "email": c.email,
        "telefone": c.telefone,
        "endereco": {
            "cep": c.cep,
            "numero": c.numero,
            "complemento": c.complemento,
            "logradouro": c.logradouro,
            "bairro": c.bairro,
            "cidade": c.cidade,
            "uf": c.uf,
        },
    }

# ---------- Run ----------
if __name__ == "__main__":
    # Swagger: /openapi, /openapi/swagger, /openapi/redoc, /openapi/rapidoc
    app.run(host="0.0.0.0", port=8000, debug=True)
