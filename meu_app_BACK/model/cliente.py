from sqlalchemy import Column, String, Integer, Boolean
from .base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id         = Column("pk_cliente", Integer, primary_key=True, autoincrement=True)
    cpf        = Column(String(11),  unique=True, nullable=False)
    nome       = Column(String(140), nullable=False)
    email      = Column(String(200), unique=True, nullable=False)
    telefone   = Column(String(20),  unique=True, nullable=False)
    cep        = Column(String(8),   nullable=False)
    logradouro = Column(String(140), nullable=False)
    numero     = Column(String(10),  nullable=False)
    complemento= Column(String(100), default="")
    bairro     = Column(String(140), nullable=False)
    cidade     = Column(String(140), nullable=False)
    estado     = Column(String(2),   nullable=False)
    proposta_enviada = Column(Boolean, nullable=False, default=False)

    def __init__(self, cpf: str, nome: str, email: str, telefone: str, cep: str, logradouro: str, numero: str, complemento: str, bairro: str, cidade: str, estado: str, proposta_enviada: bool = False):
        """
        Cria um cliente
        """
        self.cpf         = cpf
        self.nome        = nome
        self.email       = email
        self.telefone    = telefone
        self.cep         = cep
        self.logradouro  = logradouro
        self.numero      = numero
        self.complemento = complemento
        self.bairro      = bairro
        self.cidade      = cidade
        self.estado      = estado
        self.proposta_enviada = proposta_enviada

