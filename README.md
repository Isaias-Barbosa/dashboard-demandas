# Dashboard de Demandas - Sicoob

Dashboard interativo para controle de demandas técnicas, integrado com MongoDB Atlas.

## 🚀 Funcionalidades

- ✅ **Dashboard interativo** com gráficos e métricas em tempo real
- ✅ **CRUD completo** - Criar, visualizar, editar e excluir demandas
- ✅ **Filtros** - Por responsável, status e busca por texto
- ✅ **Importar Excel** - Faça upload de planilhas Excel para importar demandas
- ✅ **Exportar Excel** - Baixe os dados em formato Excel
- ✅ **Gráficos** - Visualize a distribuição por status, responsável e evolução mensal
- ✅ **Persistência** - Dados salvos no MongoDB Atlas

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Banco de dados**: MongoDB Atlas (já configurado!)
- **Frontend**: HTML5 + CSS3 + JavaScript (vanilla)
- **Gráficos**: Chart.js
- **Excel**: xlsx.js
- **Hospedagem**: Render.com (gratuito)

## 📋 Pré-requisitos

- Node.js 18+
- Conta no MongoDB Atlas
- Conta no GitHub
- Conta no Render.com

## 🖥️ Instalação Local

```bash
# Clone ou extraia o projeto
cd dashboard-demandas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Edite o arquivo .env com sua string de conexão do MongoDB Atlas
# Exemplo: mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/dashboard-demandas

# Inicie o servidor
npm start
```

Acesse: **http://localhost:3000**

## 🌐 Deploy no Render.com

### Passo 1: Preparar o projeto

1. Crie um repositório no GitHub
2. Faça upload dos arquivos do projeto
3. **Importante**: Remova ou renomeie o arquivo `.env` local (não submeta para o Git)
4. No Render, você configurará as variáveis de ambiente

### Passo 2: Criar banco de dados MongoDB Atlas

Se ainda não tiver:

1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita (Free Tier)
3. Crie um cluster (M0 Free)
4. Crie usuário e senha de acesso
5.whitelist seu IP (ou 0.0.0.0/0 para qualquer lugar)
6. Copie a string de conexão (conectar > drivers)
7.Formato: `mongodb+srv://usuario:senha@cluster.mongodb.net/nome-do-banco`

### Passo 3: Deploy no Render

1. Acesse https://dashboard.render.com
2. Clique em **New +** > **Web Service**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `dashboard-demandas`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node

5. Em **Environment Variables**, adicione:
   - `MONGODB_URI`: Sua string de conexão do Atlas
   - `PORT`: 3000 (ou deixe em branco)
   - `CORS_ORIGIN`: * (ou URL do seu frontend)

6. Clique em **Create Web Service**

### Passo 4: Acessar o Dashboard

Após o deploy (2-3 minutos), você recibirá uma URL como:
`https://dashboard-demandas.onrender.com`

## 📱 Uso do Dashboard

### Adicionar nova demanda
1. Clique no botão **+ Nova Demanda**
2. Preencha os campos obrigatórios (demanda, GRI, atividade, responsável)
3. Opcional: adicione o link do RDM no Jira
4. Clique em **Salvar**

### Importar demandas do Excel
1. Clique em **Importar Excel** na tabela
2. Selecione um arquivo `.xlsx` com as colunas:
   - Data Abertura
   - Demanda
   - GRI
   - Atividade
   - Responsável
   - RDM Link
   - Status (opcional)

### Exportar dados
1. Clique em **Exportar Excel** no menu superior
2. O arquivo será baixado automaticamente

### Filtrar demandas
- Use a **busca** para encontrar por número, GRI ou atividade
- Filtre por **responsável** ou **status** usando os dropdowns

## 📊 Estrutura do Projeto

```
dashboard-demandas/
├── public/
│   └── index.html        # Frontend completo
├── models/
│   └── Demanda.js        # Modelo Mongoose
├── utils/
│   └── excelHandler.js   # Funções para Excel
├── .env                  # Variáveis de ambiente (NÃO commitar!)
├── .gitignore
├── package.json
├── server.js             # Servidor Express
└── README.md
```

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MONGODB_URI` | String de conexão do MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Porta do servidor | `3000` |
| `CORS_ORIGIN` | Origens permitidas para CORS | `*` ou URL específica |

## ✅ Status Homologado

Este projeto utiliza tecnologias homologadas pelo Sicoob:
- ✅ Node.js 24 (runtime)
- ✅ MongoDB 7 (banco de dados)
- ✅ Express.js (framework)
- ✅ Render.com (hospedagem gratuita)

---

**Desenvolvido por Isaias Oliveira - Sicoob**