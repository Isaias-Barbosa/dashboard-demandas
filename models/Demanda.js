import mongoose from 'mongoose';

const demandaSchema = new mongoose.Schema({
  dataAbertura: {
    type: Date,
    required: [true, 'Data de abertura é obrigatória'],
    default: Date.now,
  },
  demanda: {
    type: Number,
    required: [true, 'Número da demanda é obrigatório'],
  },
  gri: {
    type: String,
    required: [true, 'GRI é obrigatório'],
    trim: true,
  },
  atividade: {
    type: String,
    required: [true, 'Atividade é obrigatória'],
    trim: true,
  },
  responsavel: {
    type: String,
    required: [true, 'Responsável é obrigatório'],
    trim: true,
  },
  rdmLink: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Aberta', 'Em Andamento', 'Concluída', 'Cancelada'],
    default: 'Aberta',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Atualizar updatedAt antes de salvar
demandaSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Demanda', demandaSchema);
