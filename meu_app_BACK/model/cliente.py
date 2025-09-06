from sqlalchemy import Column, String, Integer
from sqlalchemy.sql import func
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
