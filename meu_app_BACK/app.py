from flask_openapi3 import OpenAPI, Info, Tag
from flask import redirect
from flask_cors import CORS
from urllib.parse import unquote
from sqlalchemy.exc import IntegrityError
from model import *
from schemas import *
import httpx
import logging


# Logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Swagger 
info = Info(title="CRM VENDAS - API", version="1.0.0")
app = OpenAPI(__name__, info=info)
CORS(app)
home_tag = Tag(name="Documentação", description="Selecione a documentação: Swagger, Redoc ou RapiDoc")
cliente_tag = Tag(name="Clientes", description="Cadastro, consulta e remoção de clientes")

Base.metadata.create_all(engine)

# Utils
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


# Documentação
@app.get("/", tags=[home_tag])
def home():
    """Redireciona para /openapi, tela que permite a escolha do estilo de documentação (Swagger/Redoc/RapiDoc)."""
    return redirect("/openapi")


# Clientes
@app.post("/cliente", tags=[cliente_tag], responses={"200": ClienteViewSchema, "400": ErrorSchema})
def add_cliente(form: ClienteSchema):
    """Adiciona um novo cliente à base de dados.

    Retorna os dados do cliente adicionado.
    """
    if not cpf_valido(form.cpf):
        return ErrorSchema(message="CPF inválido"), 400

    db = SessionLocal()
    try:
        endereco = {}
        try:
            endereco = httpx.get(f"https://viacep.com.br/ws/{only_digits(form.cep)}/json/").json()
            if endereco.get("erro"):
                raise ValueError("CEP não encontrado")
        except Exception as e:
            logger.error(f"Erro ao buscar CEP: {e}")
            return ErrorSchema(message="Erro ao buscar CEP"), 400

        cliente = Cliente(
            cpf=only_digits(form.cpf),
            nome=form.nome,
            email=form.email,
            telefone=only_digits(form.telefone),
            cep=only_digits(form.cep),
            logradouro=endereco.get("logradouro", ""),
            numero=form.numero,
            complemento=form.complemento or "",
            bairro=endereco.get("bairro", ""),
            cidade=endereco.get("localidade", ""),
            estado=endereco.get("uf", "")
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
        return apresentar_cliente(cliente)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Erro de integridade: {e}")
        return ErrorSchema(message="Cliente com CPF, email ou telefone já existe."), 409
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao adicionar cliente: {e}")
        return ErrorSchema(message="Erro ao adicionar cliente."), 400
    finally:
        db.close()

@app.get("/cliente", tags=[cliente_tag], responses={"200": ListagemClientesSchema, "400": ErrorSchema})
def get_clientes():
    """Lista todos os clientes cadastrados.

    Retorna uma lista com todos os clientes.
    """
    db = SessionLocal()
    try:
        clientes = db.query(Cliente).all()
        return ListagemClientesSchema(clientes=apresentar_clientes(clientes))
    except Exception as e:
        logger.error(f"Erro ao listar clientes: {e}")
        return ErrorSchema(message="Erro ao listar clientes."), 400
    finally:
        db.close()

@app.get("/cliente/{cpf}", tags=[cliente_tag], responses={"200": ClienteViewSchema, "404": ErrorSchema})
def get_cliente(cpf: str):
    """Busca um cliente pelo CPF.

    Retorna os dados do cliente encontrado.
    """
    db = SessionLocal()
    try:
        cliente = db.query(Cliente).filter(Cliente.cpf == only_digits(cpf)).first()
        if not cliente:
            return ErrorSchema(message="Cliente não encontrado."), 404
        return apresentar_cliente(cliente)
    except Exception as e:
        logger.error(f"Erro ao buscar cliente: {e}")
        return ErrorSchema(message="Erro ao buscar cliente."), 400
    finally:
        db.close()

@app.delete("/cliente/{cpf}", tags=[cliente_tag], responses={"200": ClienteDeleteSchema, "404": ErrorSchema})
def delete_cliente(cpf: str):
    """Deleta um cliente pelo CPF.

    Retorna uma mensagem de confirmação da deleção.
    """
    db = SessionLocal()
    try:
        cliente = db.query(Cliente).filter(Cliente.cpf == only_digits(cpf)).first()
        if not cliente:
            return ErrorSchema(message="Cliente não encontrado."), 404
        db.delete(cliente)
        db.commit()
        return deletar_cliente(cpf=only_digits(cpf))
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar cliente: {e}")
        return ErrorSchema(message="Erro ao deletar cliente."), 400
    finally:
        db.close()

@app.put("/cliente/{cpf}", tags=[cliente_tag], responses={"200": ClienteViewSchema, "404": ErrorSchema})
def update_cliente(cpf: str, form: ClienteSchema):
    """Atualiza os dados de um cliente pelo CPF.

    Retorna os dados atualizados do cliente.
    """
    if not cpf_valido(form.cpf):
        return ErrorSchema(message="CPF inválido"), 400

    db = SessionLocal()
    try:
        cliente = db.query(Cliente).filter(Cliente.cpf == only_digits(cpf)).first()
        if not cliente:
            return ErrorSchema(message="Cliente não encontrado."), 404

        endereco = {}
        try:
            endereco = httpx.get(f"https://viacep.com.br/ws/{only_digits(form.cep)}/json/").json()
            if endereco.get("erro"):
                raise ValueError("CEP não encontrado")
        except Exception as e:
            logger.error(f"Erro ao buscar CEP: {e}")
            return ErrorSchema(message="Erro ao buscar CEP"), 400

        cliente.cpf = only_digits(form.cpf)
        cliente.nome = form.nome
        cliente.email = form.email
        cliente.telefone = only_digits(form.telefone)
        cliente.cep = only_digits(form.cep)
        cliente.logradouro = endereco.get("logradouro", "")
        cliente.numero = form.numero
        cliente.complemento = form.complemento or ""
        cliente.bairro = endereco.get("bairro", "")
        cliente.cidade = endereco.get("localidade", "")
        cliente.estado = endereco.get("uf", "")

        db.commit()
        db.refresh(cliente)
        return apresentar_cliente(cliente)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Erro de integridade: {e}")
        return ErrorSchema(message="Cliente com CPF, email ou telefone já existe."), 409
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar cliente: {e}")
        return ErrorSchema(message="Erro ao atualizar cliente."), 400
    finally:
        db.close()

