from pydantic import BaseModel, EmailStr
from typing import Optional, List
from model.cliente import Cliente


class ClienteSchema(BaseModel):
    """ Define como um novo cliente a ser inserido deve ser representado
    """
    cpf: int = 42210111811
    nome: str = "Taina Costa"
    email: EmailStr = "taina_costa@gmail.com"
    telefone: int = 11999999999
    cep: int = 86067000
    logradouro: str = "Avenida Jockei Club"
    numero: int = 485
    complemento: Optional[str] = "Apto 45"
    bairro: str = "Jardim Jockei Club"
    cidade: str = "Londrina"
    estado: str = "PR"

class ClienteBuscaSchema(BaseModel):
    """ Define a estrutura de busca, que será feita por CPF
    """
    cpf: int = 42210111811

class ListagemClientesSchema(BaseModel):
    """ Define como uma listagem de clientes será retornada.
    """
    clientes:List[ClienteSchema]

class ClienteViewSchema(ClienteSchema):
    """ Define como um cliente será retornado.
    """
    id: int = 1
    cpf: int = 42210111811
    nome: str = "Taina Costa"
    email: EmailStr = "taina_costa@gmail.com"
    telefone: int = 11999999999
    cep: int = 86067000
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
    cpf: int


def apresentar_clientes(clientes: List[Cliente]):
    """ Retorna uma representação do cliente seguindo o schema definido em ClienteViewSchema
    """
    resultado = []
    for cliente in clientes:
        resultado.append({
            "cpf": cliente.cpf,
            "nome": cliente.nome,
            "email": cliente.email,
            "telefone": cliente.telefone,
            "cep": cliente.cep,
            "logradouro": cliente.logradouro,
            "numero": cliente.numero,
            "complemento": cliente.complemento,
            "bairro": cliente.bairro,
            "cidade": cliente.cidade,
            "estado": cliente.estado,
        })

    return {"clientes": resultado}

def apresentar_cliente(cliente: Cliente):
    """ Retorna uma representação do cliente seguindo o schema definido em ClienteViewSchema
    """
    return {
            "cpf": cliente.cpf,
            "nome": cliente.nome,
            "email": cliente.email,
            "telefone": cliente.telefone,
            "cep": cliente.cep,
            "logradouro": cliente.logradouro,
            "numero": cliente.numero,
            "complemento": cliente.complemento,
            "bairro": cliente.bairro,
            "cidade": cliente.cidade,
            "estado": cliente.estado,
        }

def deletar_cliente(cpf: int):
    """ Retorna uma mensagem de confirmação de deleção de cliente
    """
    return ClienteDeleteSchema(
        mesage="Cliente deletado com sucesso",
        cpf=cpf
    )

