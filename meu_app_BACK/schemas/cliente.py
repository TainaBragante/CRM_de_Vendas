from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List
from model.cliente import Cliente


class ClienteSchema(BaseModel):
    """ Define como um novo cliente a ser inserido deve ser representado
    """
    cpf: float = 42210111811
    nome: str = "Taina Costa"
    email: EmailStr = "taina_costa@gmail.com"
    telefone: float = 11999999999
    cep: float = 86067000
    numero: int = 123
    complemento: Optional[str] = "Apto 45"

class ClienteBuscaSchema(BaseModel):
    """ Define a estrutura de busca, que será feita por CPF
    """
    cpf: float = 42210111811

class ListagemClientesSchema(BaseModel):
    """ Define como uma listagem de clientes será retornada.
    """
    clientes:List[ClienteSchema]

class ClienteViewSchema(ClienteSchema):
    """ Define como um cliente será retornado.
    """
    id: int = 1
    cpf: float = 42210111811
    nome: str = "Taina Costa"
    email: EmailStr = "taina_costa@gmail.com"
    telefone: float = 11999999999
    cep: float = 86067000
    logradouro: str = "Avenida Jockei Club"
    numero: int = 485
    complemento: Optional[str] = "Apto 45"
    bairro: str = "Jardim Jockei Club"
    cidade: str = "Londrina"
    estado: str = "PR"

class ClienteDeleteSchema(BaseModel):
    """ Define como um cliente será deletado.
    """
    mesage: str
    cpf: float


def apresentar_clientes(clientes: List[Cliente]):
    """ Retorna uma representação do cliente seguindo o schema definido em ClienteViewSchema
    """
    resultado = []
    for cliente in clientes:
        resultado.append(ClienteViewSchema(
            id=cliente.id,
            cpf=cliente.cpf,
            nome=cliente.nome,
            email=cliente.email,
            telefone=cliente.telefone,
            cep=cliente.cep,
            logradouro=cliente.logradouro,
            numero=cliente.numero,
            complemento=cliente.complemento,
            bairro=cliente.bairro,
            cidade=cliente.cidade,
            estado=cliente.uf
        ))
    return resultado

def apresentar_cliente(cliente: Cliente):
    """ Retorna uma representação do cliente seguindo o schema definido em ClienteViewSchema
    """
    return ClienteViewSchema(
            id=cliente.id,
            cpf=cliente.cpf,
            nome=cliente.nome,
            email=cliente.email,
            telefone=cliente.telefone,
            cep=cliente.cep,
            logradouro=cliente.logradouro,
            numero=cliente.numero,
            complemento=cliente.complemento,
            bairro=cliente.bairro,
            cidade=cliente.cidade,
            estado=cliente.uf
        )

def deletar_cliente(cpf: float):
    """ Retorna uma mensagem de confirmação de deleção de cliente
    """
    return ClienteDeleteSchema(
        mesage="Cliente deletado com sucesso",
        cpf=cpf
    )

