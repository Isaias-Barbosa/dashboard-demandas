// Servidor Mock - para teste sem MongoDB
// Use: npm run dev:mock

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mock em memória
let demandas = [
  {
    _id: '1',
    dataAbertura: '2026-10-13',
    demanda: 49542,
    gri: 'S-2503651088',
    atividade: 'Lentidão produto relatório títulos descontados, processo relatório inventário contábil',
    responsavel: 'Carlos',
    rdmLink: 'https://sisbr.atlassian.net/browse/RDM-49542',
    status: 'Aberta',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    dataAbertura: '2026-10-12',
    demanda: 49541,
    gri: 'S-2503651087',
    atividade: 'Ajuste na tela de consulta de clientes',
    responsavel: 'Maria',
    rdmLink: 'https://sisbr.atlassian.net/browse/RDM-49541',
    status: 'Em Andamento',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    dataAbertura: '2026-10-11',
    demanda: 49540,
    gri: 'S-2503651086',
    atividade: 'Bug no cálculo de juros',
    responsavel: 'João',
    rdmLink: 'https://sisbr.atlassian.net/browse/RDM-49540',
    status: 'Concluída',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let nextId = 4;

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/demandas', (req, res) => {
  const { responsavel, status, busca } = req.query;
  let result = [...demandas];

  if (responsavel && responsavel !== 'Todos') {
    result = result.filter(d => d.responsavel === responsavel);
  }
  if (status && status !== 'Todos') {
    result = result.filter(d => d.status === status);
  }
  if (busca) {
    const lower = busca.toLowerCase();
    result = result.filter(d => 
      String(d.demanda).includes(busca) ||
      d.gri.toLowerCase().includes(lower) ||
      d.atividade.toLowerCase().includes(lower)
    );
  }

  result.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
  res.json(result);
});

app.get('/api/demandas/:id', (req, res) => {
  const d = demandas.find(d => d._id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Não encontrada' });
  res.json(d);
});

app.post('/api/demandas', (req, res) => {
  const { dataAbertura, demanda, gri, atividade, responsavel, rdmLink, status } = req.body;
  const nova = {
    _id: String(nextId++),
    dataAbertura: dataAbertura || new Date().toISOString().split('T')[0],
    demanda,
    gri,
    atividade,
    responsavel,
    rdmLink: rdmLink || '',
    status: status || 'Aberta',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demandas.push(nova);
  res.status(201).json(nova);
});

app.put('/api/demandas/:id', (req, res) => {
  const idx = demandas.findIndex(d => d._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrada' });
  
  const { dataAbertura, demanda, gri, atividade, responsavel, rdmLink, status } = req.body;
  demandas[idx] = {
    ...demandas[idx],
    dataAbertura,
    demanda,
    gri,
    atividade,
    responsavel,
    rdmLink,
    status,
    updatedAt: new Date(),
  };
  res.json(demandas[idx]);
});

app.delete('/api/demandas/:id', (req, res) => {
  const idx = demandas.findIndex(d => d._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Não encontrada' });
  demandas.splice(idx, 1);
  res.json({ message: 'Excluída com sucesso' });
});

app.get('/api/stats', (req, res) => {
  const total = demandas.length;
  const abertas = demandas.filter(d => d.status === 'Aberta').length;
  const emAndamento = demandas.filter(d => d.status === 'Em Andamento').length;
  const concluidas = demandas.filter(d => d.status === 'Concluída').length;
  const canceladas = demandas.filter(d => d.status === 'Cancelada').length;

  const porResponsavel = [];
  demandas.forEach(d => {
    const existing = porResponsavel.find(p => p._id === d.responsavel);
    if (existing) existing.count++;
    else porResponsavel.push({ _id: d.responsavel, count: 1 });
  });
  porResponsavel.sort((a, b) => b.count - a.count);

  const porStatus = [
    { _id: 'Aberta', count: abertas },
    { _id: 'Em Andamento', count: emAndamento },
    { _id: 'Concluída', count: concluidas },
    { _id: 'Cancelada', count: canceladas },
  ];

  res.json({ total, abertas, emAndamento, concluidas, canceladas, porResponsavel, porMes: [], porStatus });
});

// Export simples (retorna erro em modo mock)
app.get('/api/export/excel', (req, res) => {
  res.status(501).json({ error: 'Export não disponível em modo mock' });
});

app.post('/api/import/excel', (req, res) => {
  res.status(501).json({ error: 'Import não disponível em modo mock' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard rodando em modo MOCK: http://localhost:${PORT}`);
  console.log('📊 Dados de exemplo carregados!');
});