# Define a imagem base (backend) 
FROM python:3.9

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de requisitos para o diretório de trabalho
COPY requirements.txt .

# Instala as dependências do projeto
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte para o diretório de trabalho
COPY . .

# Define o comando de execução da API
# --host 0.0.0.0 permite acesso via http://localhost:5000 no host
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]
