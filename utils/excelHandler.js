import XLSX from 'xlsx';

/**
 * Exporta demandas para formato Excel (.xlsx)
 * @param {Array} demandas - Array de documentos mongoose
 * @returns {Buffer} Buffer do arquivo Excel
 */
export function exportToExcel(demandas) {
  // Preparar dados para planilha
  const data = demandas.map((d) => ({
    'Data Abertura': d.dataAbertura ? formatDate(d.dataAbertura) : '',
    'Demanda': d.demandaDisplay || (d.demandas ? d.demandas.join(' e ') : d.demanda),
    'GRI': d.gri,
    'Atividade': d.atividade,
    'Responsável': d.responsavel,
    'Status': d.status || 'Aberta',
    'RDM Link': d.rdmLink || '',
    'Criado em': d.createdAt ? formatDate(d.createdAt) : '',
    'Atualizado em': d.updatedAt ? formatDate(d.updatedAt) : '',
  }));

  // Criar workbook e worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Ajustar larguras das colunas
  worksheet['!cols'] = [
    { wch: 12 },  // Data Abertura
    { wch: 10 },  // Demanda
    { wch: 20 },  // GRI
    { wch: 60 },  // Atividade
    { wch: 15 },  // Responsável
    { wch: 12 },  // Status
    { wch: 40 },  // RDM Link
    { wch: 18 },  // Criado em
    { wch: 18 },  // Atualizado em
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Corretivas');

  // Gerar buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Importa dados de Excel (lê arquivo uploaded no frontend)
 * @param {ArrayBuffer} buffer - Buffer do arquivo Excel
 * @returns {Array} Array de objetos com os dados
 */
export function parseExcel(buffer) {
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array' });

  // Ler primeira planilha
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Converter para JSON
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return json;
}

/**
 * Converte dados do Excel vindos do frontend (já em JSON)
 * para formato aceito pela API
 */
export function normalizeExcelData(excelRows) {
  return excelRows.map((row) => {
    // Aceita múltiplas demandas separadas por "e" ou ","
    const demandaRaw = String(row['Demanda'] || '').trim();
    const demandaParts = demandaRaw.split(/[e,]/).map(d => d.trim()).filter(d => d);
    const demandas = demandaParts.map(d => parseInt(d, 10)).filter(n => !isNaN(n));
    const demandaDisplay = demandaParts.join(' e ');

    return {
      dataAbertura: parseDate(row['Data Abertura']) || new Date(),
      demandas: demandas,
      demandaDisplay: demandaDisplay,
      gri: String(row['GRI'] || '').trim(),
      atividade: String(row['Atividade'] || '').trim(),
      responsavel: String(row[' Responsável'] || row['Responsável'] || '').trim(),
      rdmLink: String(row['RDM Link'] || '').trim(),
      status: row['Status'] || 'Aberta',
    };
  });
}

// Helpers
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Tentar parser diversos formatos
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}