from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from sqlalchemy.sql import func
import uuid
from .base import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome: Mapped[str] = mapped_column(String(120))
    cpf: Mapped[str] = mapped_column(String(11), unique=True, index=True)  # só dígitos
    email: Mapped[str] = mapped_column(String(200))
    telefone: Mapped[str] = mapped_column(String(20))  # só dígitos

    # endereço completo (ViaCEP + formulário)
    cep: Mapped[str] = mapped_column(String(8))
    numero: Mapped[str] = mapped_column(String(20))
    complemento: Mapped[str] = mapped_column(String(120), default="")
    logradouro: Mapped[str] = mapped_column(String(200))
    bairro: Mapped[str] = mapped_column(String(120))
    cidade: Mapped[str] = mapped_column(String(120))
    uf: Mapped[str] = mapped_column(String(2))

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
