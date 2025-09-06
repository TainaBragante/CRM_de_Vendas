from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Dict

class EnderecoIn(BaseModel):
    cep: str 
    numero: str
    complemento: Optional[str] = ""


from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional, Dict

class ClienteIn(BaseModel):
    nome: str 
    cpf: str 
    email: EmailStr
    telefone: str 
    endereco: EnderecoIn

class ClienteOut(BaseModel):
    id: str
    nome: str
    cpf: str
    email: EmailStr
    telefone: str
    endereco: Dict[str, str]           # logradouro, bairro, cidade, uf, etc.
