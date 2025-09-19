# Define a imagem base (frontend)
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia as dependências
COPY package.json package-lock.json* ./

# Instala as dependências do projeto
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi

# Copia o código-fonte para o diretório de trabalho
COPY . .

# Expõe a porta do Vite 
EXPOSE 5173

# Define o comando de execução do front (Vite dev)
# --host 0.0.0.0 permite acesso via http://localhost:5173 no host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
