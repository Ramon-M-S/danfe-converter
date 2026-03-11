const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XMLProcessor = require('./utils/xmlProcessor');
const PDFGenerator = require('./utils/pdfGenerator');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos XML são permitidos'));
    }
  }
});

// Criar pasta temp se não existir
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do DANFE Converter está rodando!' });
});

// Rota de upload e conversão
app.post('/upload', upload.single('xml'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('📁 Arquivo recebido:', req.file.originalname);

    // 1. Ler o arquivo XML
    const xmlContent = fs.readFileSync(req.file.path, 'utf-8');
    console.log('📄 XML lido com sucesso');

    // 2. Processar XML para extrair dados
    const nfData = await XMLProcessor.parseXML(xmlContent);
    console.log('🔍 Dados da NF-e extraídos:', {
      numero: nfData.numero,
      emitente: nfData.emitente.nome,
      valor: nfData.valorTotal
    });

    // 3. Gerar nome do arquivo PDF
    const pdfFileName = `DANFE-${nfData.numero}-${Date.now()}.pdf`;
    const pdfPath = path.join(tempDir, pdfFileName);

    // 4. Gerar PDF
    await PDFGenerator.gerarDANFE(nfData, pdfPath);
    console.log('📄 PDF gerado:', pdfFileName);

    // 5. Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
    res.sendFile(pdfPath, (err) => {
  if (err) {
    console.error('Erro ao enviar PDF:', err);
  }
  
  // 6. Limpar arquivos temporários (após 1 minuto)
  setTimeout(() => {
    try {
      fs.unlinkSync(req.file.path); // Remove XML
      fs.unlinkSync(pdfPath);        // Remove PDF
      console.log('🧹 Arquivos temporários removidos');
    } catch (cleanError) {
      console.error('Erro ao limpar arquivos:', cleanError);
    }
  }, 60000); // 1 minuto
});

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    
    // Limpar arquivo XML em caso de erro
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Erro ao limpar XML:', e);
      }
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar arquivo: ' + error.message 
    });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
  console.log(`📁 Pasta de upload: ${path.join(__dirname, 'uploads')}`);
  console.log(`📁 Pasta temporária: ${tempDir}`);
});
