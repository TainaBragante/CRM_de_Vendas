from flask_openapi3 import OpenAPI, Info, Tag
from flask import redirect, request
from flask_cors import CORS
from urllib.parse import unquote
from sqlalchemy.exc import IntegrityError
from model import * 
from schemas import *
import logging
import httpx


# Logger
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Swagger 
info = Info(title="CRM VENDAS - API", version="2.0.0")
app = OpenAPI(__name__, info=info)
CORS(app)
home_tag = Tag(name="Documentação", description="Selecione a documentação: Swagger, Redoc ou RapiDoc")
cliente_tag = Tag(name="Clientes", description="Cadastro, consulta e remoção de clientes")

@app.get("/", tags=[home_tag])
def home():
    """Redireciona para /openapi, tela que permite a escolha do estilo de documentação (Swagger/Redoc/RapiDoc)."""
    return redirect("/openapi")


# Clientes
@app.post("/cliente", tags=[cliente_tag], responses={"200": ClienteViewSchema, "409": ErrorSchema, "400": ErrorSchema})
def add_cliente(form: ClienteSchema):
    """Adiciona um novo cliente à base de dados.

    Retorna os dados do cliente adicionado.
    """
    # aceitar dados JSON, do frontend
    if request.content_type == "application/json":
        form = ClienteSchema(**request.json)
        logger.debug(f"Recebido JSON: {request.json}")
   
    # aceitar dados de formulário, do Swagger
    cliente = Cliente(
        cpf=form.cpf,
        nome=form.nome,
        email=form.email,
        telefone=form.telefone,
        cep=form.cep,
        logradouro=form.logradouro,
        numero=form.numero,
        complemento=form.complemento or "",
        bairro=form.bairro,
        cidade=form.cidade,
        estado=form.estado
    )
    logger.debug(f"Adicionando cliente: {cliente.nome}, CPF: {cliente.cpf}")

    try:
        # criando conexão com a base
        db = Session()
        # adicionando o cliente
        db.add(cliente)
        # efetivando a transação
        db.commit()
        logger.debug(f"Cliente adicionado com sucesso: {cliente.nome}, CPF: {cliente.cpf}")
        return apresentar_cliente(cliente), 200
    
    except IntegrityError as e:
        error_msg = "Cliente com CPF, email ou telefone já cadastrado."
        logger.warning(f"Erro ao adicionar cliente: {cliente.nome}, CPF: {cliente.cpf} - {error_msg}")
        return {"mesage": error_msg}, 409
    
    except Exception as e:
        error_msg = "Erro ao adicionar cliente."
        logger.warning(f"Erro ao adicionar cliente: {cliente.nome}, CPF: {cliente.cpf} - {error_msg}")
        return {"mesage": error_msg}, 400

@app.get("/clientes", tags=[cliente_tag], responses={"200": ListagemClientesSchema, "409": ErrorSchema, "400": ErrorSchema})
def get_clientes():
    """Lista todos os clientes cadastrados.

    Retorna uma lista com todos os clientes.
    """
    logger.debug(f"Listando clientes")
    # criando conexão com a base
    db = Session()
    # fazendo a busca
    clientes = db.query(Cliente).all()

    if not clientes:
        return {"clientes": []}, 200
    else:
        logger.debug(f"{len(clientes)} clientes encontrados")
        # retorna a representação dos clientes
        print(clientes)
        return apresentar_clientes(clientes), 200
    
@app.get("/cliente", tags=[cliente_tag], responses={"200": ListagemClientesSchema, "409": ErrorSchema, "400": ErrorSchema})
def get_cliente(query: ClienteBuscaSchema):
    """Busca um cliente pelo CPF.

    Retorna os dados do cliente encontrado.
    """
    cliente_cpf = query.cpf
    logger.debug(f"Buscando cliente com CPF: {cliente_cpf}")
    # criando conexão com a base
    db = Session()
    # fazendo a busca
    cliente = db.query(Cliente).filter(Cliente.cpf == cliente_cpf).first()

    if not cliente:
        error_msg = "Cliente não encontrado."
        logger.warning(f"Erro ao buscar cliente com CPF: {cliente_cpf} - {error_msg}")
        return {"mesage": error_msg}, 404
    else:
        logger.debug(f"Cliente encontrado com CPF: {cliente_cpf}")
        # retorna a representação do cliente
        return apresentar_cliente(cliente), 200

@app.delete("/cliente", tags=[cliente_tag], responses={"200": ClienteDeleteSchema, "409": ErrorSchema, "400": ErrorSchema})
def delete_cliente(query: ClienteBuscaSchema):
    """Deleta um cliente pelo CPF.

    Retorna uma mensagem de confirmação da deleção.
    """
    cliente_cpf = query.cpf
    print(cliente_cpf)
    logger.debug(f"Deletando cliente com CPF: {cliente_cpf}")
    # criando conexão com a base
    db = Session()
    # fazendo a remoção
    cliente = db.query(Cliente).filter(Cliente.cpf == cliente_cpf).first()
    if cliente:
        db.delete(cliente)
        db.commit()

    if cliente:
        # retorna a representação da mensagem de deleção
        logger.debug(f"Cliente deletado com CPF: {cliente_cpf}")
        return {"mesage": "Cliente removido", "id": cliente_cpf}, 200
    else:
        error_msg = "Cliente não encontrado."
        logger.warning(f"Erro ao deletar cliente com CPF: {cliente_cpf} - {error_msg}")
        return {"mesage": error_msg}, 404
    
@app.put("/cliente", tags=[cliente_tag], responses={"200": ClienteViewSchema, "409": ErrorSchema, "400": ErrorSchema})
def update_cliente(query: ClienteBuscaSchema, form: ClienteSchema):
    """Atualiza os dados de um cliente pelo CPF.

    Retorna os dados atualizados do cliente.
    """
    # aceitar dados JSON, do frontend
    if request.content_type == "application/json":
        form = ClienteSchema(**request.json)
        logger.debug(f"Recebido JSON: {request.json}")
    
    cliente_cpf = query.cpf
    logger.debug(f"Atualizando cliente com CPF: {cliente_cpf}")
    # criando conexão com a base
    db = Session()
    # fazendo a busca
    cliente = db.query(Cliente).filter(Cliente.cpf == cliente_cpf).first()

    if not cliente:
        error_msg = "Cliente não encontrado."
        logger.warning(f"Erro ao atualizar cliente com CPF: {cliente_cpf} - {error_msg}")
        return {"mesage": error_msg}, 404
    else:
        try:
            cliente.nome        = form.nome
            cliente.email       = form.email
            cliente.telefone    = form.telefone
            cliente.cep         = form.cep
            cliente.logradouro  = form.logradouro
            cliente.numero      = form.numero
            cliente.complemento = form.complemento or ""
            cliente.bairro      = form.bairro
            cliente.cidade      = form.cidade
            cliente.estado      = form.estado

            db.add(cliente)
            db.commit()
            logger.debug(f"Cliente atualizado com sucesso: {cliente.nome}, CPF: {cliente.cpf}")
            return apresentar_cliente(cliente), 200
        
        except IntegrityError as e:
            error_msg = "Cliente com email ou telefone já cadastrado."
            logger.warning(f"Erro ao atualizar cliente: {cliente.nome}, CPF: {cliente.cpf} - {error_msg}")
            return {"mesage": error_msg}, 409
        
        except Exception as e:
            error_msg = "Erro ao atualizar cliente."
            logger.warning(f"Erro ao atualizar cliente: {cliente.nome}, CPF: {cliente.cpf} - {error_msg}")
            return {"mesage": error_msg}, 400
        
