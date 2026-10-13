import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Demanda from './models/Demanda.js';
import { exportToExcel } from './utils/excelHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ajuste para Render.com - usar variável correta
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// API REST - CRUD de Demandas
// ============================================================================

// LISTAR todas (com filtros opcionais)
app.get('/api/demandas', async (req, res) => {
  try {
    const { responsavel, status, busca } = req.query;
    const filter = {};

    if (responsavel && responsavel !== 'Todos') {
      filter.responsavel = { $regex: responsavel, $options: 'i' };
    }
    if (status && status !== 'Todos') {
      filter.status = status;
    }
    if (busca) {
      filter.$or = [
        { atividade: { $regex: busca, $options: 'i' } },
        { gri: { $regex: busca, $options: 'i' } },
        { demanda: !isNaN(busca) ? Number(busca) : { $regex: busca, $options: 'i' } },
      ];
    }

    const demandas = await Demanda.find(filter).sort({ dataAbertura: -1 });
    res.json(demandas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUSCAR por ID
app.get('/api/demandas/:id', async (req, res) => {
  try {
    const demanda = await Demanda.findById(req.params.id);
    if (!demanda) return res.status(404).json({ error: 'Demanda não encontrada' });
    res.json(demanda);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRIAR nova demanda
app.post('/api/demandas', async (req, res) => {
  try {
    const { dataAbertura, demanda, gri, atividade, responsavel, rdmLink, status } = req.body;

    // Validações
    if (!demanda || !gri || !atividade || !responsavel) {
      return res.status(400).json({ error: 'Campos obrigatórios: demanda, gri, atividade, responsavel' });
    }

    const novaDemanda = new Demanda({
      dataAbertura: dataAbertura || Date.now(),
      demanda: Number(demanda),
      gri,
      atividade,
      responsavel,
      rdmLink: rdmLink || '',
      status: status || 'Aberta',
    });

    await novaDemanda.save();
    res.status(201).json(novaDemanda);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ATUALIZAR demanda
app.put('/api/demandas/:id', async (req, res) => {
  try {
    const { dataAbertura, demanda, gri, atividade, responsavel, rdmLink, status } = req.body;

    const atualizada = await Demanda.findByIdAndUpdate(
      req.params.id,
      {
        dataAbertura,
        demanda: Number(demanda),
        gri,
        atividade,
        responsavel,
        rdmLink,
        status,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!atualizada) return res.status(404).json({ error: 'Demanda não encontrada' });
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETAR demanda
app.delete('/api/demandas/:id', async (req, res) => {
  try {
    const deletada = await Demanda.findByIdAndDelete(req.params.id);
    if (!deletada) return res.status(404).json({ error: 'Demanda não encontrada' });
    res.json({ message: 'Demanda excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ESTATÍSTICAS / MÉTRICAS PARA O DASHBOARD
// ============================================================================
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Demanda.countDocuments();
    const abertas = await Demanda.countDocuments({ status: 'Aberta' });
    const emAndamento = await Demanda.countDocuments({ status: 'Em Andamento' });
    const concluidas = await Demanda.countDocuments({ status: 'Concluída' });
    const canceladas = await Demanda.countDocuments({ status: 'Cancelada' });

    // Demandas por responsável
    const porResponsavel = await Demanda.aggregate([
      { $group: { _id: '$responsavel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Demandas por mês
    const porMes = await Demanda.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$dataAbertura' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Demandas por status
    const porStatus = await Demanda.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      total,
      abertas,
      emAndamento,
      concluidas,
      canceladas,
      porResponsavel,
      porMes,
      porStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// IMPORTAR / EXPORTAR EXCEL
// ============================================================================

// Exportar para Excel
app.get('/api/export/excel', async (req, res) => {
  try {
    const demandas = await Demanda.find().sort({ dataAbertura: -1 });

    const buffer = exportToExcel(demandas);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Controle_de_Demandas.xlsx"'
    );
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Importar de Excel (upload de arquivo)
app.post('/api/import/excel', async (req, res) => {
  try {
    if (!req.body || !req.body.data) {
      return res.status(400).json({ error: 'Nenhum dado enviado' });
    }

    // O frontend envia os dados como JSON (já processados do XLSX no cliente)
    const dados = req.body.data;
    let importados = 0;
    let erros = [];

    for (const item of dados) {
      try {
        // Verificar se já existe (por número da demanda)
        const existe = await Demanda.findOne({ demanda: Number(item.demanda) });
        if (existe) {
          erros.push(`Demanda ${item.demanda} já existe - pulada`);
          continue;
        }

        const nova = new Demanda({
          dataAbertura: item.dataAbertura ? new Date(item.dataAbertura) : new Date(),
          demanda: Number(item.demanda),
          gri: String(item.gri || ''),
          atividade: String(item.atividade || ''),
          responsavel: String(item.responsavel || ''),
          rdmLink: String(item.rdmLink || ''),
          status: item.status || 'Aberta',
        });
        await nova.save();
        importados++;
      } catch (e) {
        erros.push(`Erro na linha ${item.demanda}: ${e.message}`);
      }
    }

    res.json({ importados, erros, total: dados.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SPA fallback - servir index.html para rotas não-API
// ============================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// CONEXÃO MONGODB + START
// ============================================================================
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    console.error('Verifique MONGODB_URI no arquivo .env');
    process.exit(1);
  });
