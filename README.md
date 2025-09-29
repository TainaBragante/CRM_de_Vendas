# MVP - Back-End Avançado

 Este [projeto](https://youtu.be/GYThx53cgKM) demonstra na prática conceitos essenciais de desenvolvimento **Back-End Avançado**. Trata-se de um MVP (Minimum Viable Product) criado para implementar uma solução funcional para o gerenciamento de orçamentos e contratos fechados de clientes.


## Arquitetura da aplicação

![Arquitetura - Cenário 1](./cenario1.png)

**Descrição do fluxo:**
- A **Interface (Front-End)** consome a **API (Back-End)** via HTTP (REST), e também consulta APIs externas públicas.
- O **Back-End** armazena os dados em SQLite via SQLAlchemy.


---
## Como executar

Clone o repositório completo.  
Ative o Back-End seguindo o README da pasta meu_app_BACK.  
E ative o Front-End seguindo o README da pasta meu_app_FRONT.


---
## Como executar através do Docker
Certifique-se de ter o [Docker](https://docs.docker.com/engine/install/) instalado e em execução em sua máquina.

Navegue até o diretório que contém o docker-compose.yml no terminal.
Execute **como administrador** o seguinte comando para construir as imagens Docker:

```
docker compose build
```

Uma vez criada as imagens, para executar o container basta executar, **como administrador**, seguinte o comando:

```
docker compose up -d
```

Uma vez executando, para acessar:
a API, basta abrir o [http://localhost:5000/#/](http://localhost:5000/#/) no navegador,
e o FRONT-END, basta abrir o [http://localhost:5173/#/](http://localhost:5173/#/) no navegador.

