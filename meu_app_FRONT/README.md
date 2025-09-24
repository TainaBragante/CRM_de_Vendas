# React + Vite

Front-End da aplicação CRM de Vendas construído com React. 

Integrações com APIs Externas: **ViaCEP - pública, sem chave, para consulta de endereços a partir do CEP; AwesomeAPI - pública, sem chave, para consulta de cotações; Nager.Date - pública, sem chave, para consulta de feriados nacionais.** Tornando o CRM mais prático, automatizando preenchimentos, trazendo dados financeiros em tempo real e melhorando a experiência do usuário final.


---
## Como executar

Para executar o front-end desta aplicação é necessário ter o **Node.js** instalado em sua máquina.  
- Recomenda-se a versão LTS mais recente (18.x ou superior).  
- O Node.js já inclui o **npm** (Node Package Manager), que será utilizado para instalar as dependências do projeto.  
Caso ainda não tenha o Node.js instalado, faça o download em: [https://nodejs.org/](https://nodejs.org/).

No terminal, execute os comandos:

```
cd meu_app_FRONT
npm install
npm run dev
```


---
## Como executar através do Docker
Certifique-se de ter o [Docker](https://docs.docker.com/engine/install/) instalado e em execução em sua máquina.

Navegue até o diretório que contém o Dockerfile e o requirements.txt no terminal.
Execute **como administrador** o seguinte comando para construir a imagem Docker:

```
cd meu_app_FRONT
docker build -t crm-front .
```

Uma vez criada a imagem, para executar o container basta executar, **como administrador**, seguinte o comando:

```
docker run -p 5173:5173 crm-front
```

Uma vez executando, para acessar o FRONT-END, basta abrir o [http://localhost:5173/#/](http://localhost:5173/#/) no navegador.



### Alguns comandos úteis do Docker

>**Para verificar se a imagem foi criada** você pode executar o seguinte comando:
>
>```
>$ docker images
>```
>
> Caso queira **remover uma imagem**, basta executar o comando:
>```
>$ docker rmi <IMAGE ID>
>```
>Subistituindo o `IMAGE ID` pelo código da imagem
>
>**Para verificar se o container está em exceução** você pode executar o seguinte comando:
>
>```
>$ docker container ls --all
>```
>
> Caso queira **parar um conatiner**, basta executar o comando:
>```
>$ docker stop <CONTAINER ID>
>```
>Subistituindo o `CONTAINER ID` pelo ID do conatiner
>
>
> Caso queira **destruir um conatiner**, basta executar o comando:
>```
>$ docker rm <CONTAINER ID>
>```
>Para mais comandos, veja a [documentação do docker](https://docs.docker.com/engine/reference/run/).
