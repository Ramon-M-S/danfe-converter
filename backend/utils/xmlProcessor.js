const xml2js = require('xml2js');

class XMLProcessor {
  static async parseXML(xmlString) {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlString);
      
      // Navegar pela estrutura do XML
      const infNFe = result.NFE?.infNFe || result.nfeProc?.NFe?.infNFe;
      
      if (!infNFe) {
        throw new Error('Estrutura de NF-e não encontrada no XML');
      }

      // Extrair dados da NF-e
      const nfData = {
        // Dados da nota
        numero: infNFe.ide?.nNF || 'N/D',
        serie: infNFe.ide?.serie || 'N/D',
        dataEmissao: infNFe.ide?.dhEmi || 'N/D',
        
        // Emitente
        emitente: {
          cnpj: infNFe.emit?.CNPJ || 'N/D',
          nome: infNFe.emit?.xNome || 'N/D'
        },
        
        // Destinatário
        destinatario: {
          cnpj: infNFe.dest?.CNPJ || infNFe.dest?.CPF || 'N/D',
          nome: infNFe.dest?.xNome || 'N/D'
        },
        
        // Totais
        valorTotal: infNFe.total?.ICMSTot?.vNF || '0.00',
        
        // Produtos
        produtos: []
      };

      // Processar produtos (pode ser um ou vários)
      const det = infNFe.det;
      if (det) {
        if (Array.isArray(det)) {
          det.forEach(item => {
            nfData.produtos.push({
              nome: item.prod?.xProd || 'Produto sem nome',
              quantidade: item.prod?.qCom || '0',
              valorUnitario: item.prod?.vUnCom || '0',
              valorTotal: item.prod?.vProd || '0'
            });
          });
        } else {
          nfData.produtos.push({
            nome: det.prod?.xProd || 'Produto sem nome',
            quantidade: det.prod?.qCom || '0',
            valorUnitario: det.prod?.vUnCom || '0',
            valorTotal: det.prod?.vProd || '0'
          });
        }
      }

      return nfData;
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      throw new Error('Falha ao processar arquivo XML');
    }
  }
}

module.exports = XMLProcessor;
