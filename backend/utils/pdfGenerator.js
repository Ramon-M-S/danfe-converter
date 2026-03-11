const PDFDocument = require('pdfkit');

class PDFGenerator {
  static async gerarDANFE(nfData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Criar documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `DANFE - NF-e ${nfData.numero}`,
            Author: 'Sistema Conversor NF-e'
          }
        });

        // Configurar stream para salvar arquivo
        const stream = doc.pipe(require('fs').createWriteStream(outputPath));

        // Título
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('DANFE', { align: 'center' })
           .moveDown(0.5);
        
        doc.fontSize(16)
           .text(`Documento Auxiliar da Nota Fiscal Eletrônica`, { align: 'center' })
           .moveDown(1);

        // Linha separadora
        doc.strokeColor('#cccccc')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown(1);

        // Informações da NF-e
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('IDENTIFICAÇÃO DA NF-e', { underline: true })
           .moveDown(0.5);

        doc.font('Helvetica')
           .fontSize(10)
           .text(`Número: ${nfData.numero}                     Série: ${nfData.serie}`)
           .text(`Data de Emissão: ${nfData.dataEmissao}`)
           .text(`Valor Total: R$ ${parseFloat(nfData.valorTotal).toFixed(2)}`)
           .moveDown(1);

        // Emitente
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('EMITENTE', { underline: true })
           .moveDown(0.5);

        doc.font('Helvetica')
           .fontSize(10)
           .text(`Razão Social: ${nfData.emitente.nome}`)
           .text(`CNPJ: ${nfData.emitente.cnpj}`)
           .moveDown(1);

        // Destinatário
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DESTINATÁRIO', { underline: true })
           .moveDown(0.5);

        doc.font('Helvetica')
           .fontSize(10)
           .text(`Razão Social: ${nfData.destinatario.nome}`)
           .text(`CNPJ/CPF: ${nfData.destinatario.cnpj}`)
           .moveDown(1);

        // Produtos
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('PRODUTOS', { underline: true })
           .moveDown(0.5);

        // Cabeçalho da tabela
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 300;
        const col3 = 400;
        const col4 = 500;

        doc.font('Helvetica-Bold')
           .fontSize(8)
           .text('Descrição', col1, tableTop)
           .text('Qtd', col2, tableTop)
           .text('Vl Unit', col3, tableTop)
           .text('Vl Total', col4, tableTop);

        doc.strokeColor('#cccccc')
           .lineWidth(0.5)
           .moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();

        // Lista de produtos
        let yPos = tableTop + 25;
        nfData.produtos.forEach((prod, index) => {
          if (yPos > 700) { // Quebra de página se necessário
            doc.addPage();
            yPos = 50;
          }

          doc.font('Helvetica')
             .fontSize(8)
             .text(prod.nome.substring(0, 30), col1, yPos, { width: 200 })
             .text(prod.quantidade, col2, yPos)
             .text(`R$ ${parseFloat(prod.valorUnitario).toFixed(2)}`, col3, yPos)
             .text(`R$ ${parseFloat(prod.valorTotal).toFixed(2)}`, col4, yPos);

          yPos += 15;
        });

        // Linha final
        doc.strokeColor('#cccccc')
           .lineWidth(0.5)
           .moveTo(50, yPos)
           .lineTo(550, yPos)
           .stroke();
        yPos += 15;

        // Totalizadores
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text(`TOTAL DA NOTA: R$ ${parseFloat(nfData.valorTotal).toFixed(2)}`, 
                 50, yPos, { align: 'right' });

        // Rodapé
        doc.fontSize(8)
           .font('Helvetica')
           .text('Este é um DANFE simplificado gerado para fins de teste.', 
                 50, 750, { align: 'center' });

        // Finalizar documento
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;
