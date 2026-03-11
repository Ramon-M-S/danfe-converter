import React, { useState } from 'react';
import logoSvg from './assets/logo.svg';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setPdfUrl(null);
    setShowPreview(false);
  };

  const handleUpload = async () => {
  if (!selectedFile) {
    setMessage('Selecione um arquivo XML');
    return;
  }

  if (!selectedFile.name.endsWith('.xml')) {
    setMessage('Formato inválido. Use .xml');
    return;
  }

  
  const formData = new FormData();
  formData.append('xml', selectedFile);

  setLoading(true);
  setMessage('');

  try {
    const response = await axios.post('http://localhost:3000/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/pdf'
      },
      responseType: 'blob'
    });

    // Verificar se a resposta é realmente um PDF
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/pdf')) {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setShowPreview(true);
      setMessage('PDF gerado com sucesso');
    } else {
      // Se não for PDF, pode ser uma mensagem de erro
      const text = await response.data.text();
      console.error('Resposta não é PDF:', text);
      setMessage('Erro: formato inválido');
    }
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    setMessage('Erro ao processar');
  } finally {
    setLoading(false);
  }
};


  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'DANFE.pdf';
      link.click();
    }
  };

  return (
    <div className="app">
       <img src={logoSvg} alt="DANFE Converter" className="app-logo" />
      <div className="grid">
        {/* Lado Esquerdo - Upload */}
        <div className="left-panel">
          <div className="content">
            <h1 className="title">DANFE<span className="light">.converter</span></h1>
            <p className="subtitle">
              Transforme XML em PDF<br />
              e visualize antes de baixar
            </p>

            <div className="upload-box">
              <input
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                id="file"
                className="file-input"
              />
              <label htmlFor="file" className="file-label">
                {selectedFile ? (
                  <span className="file-selected">
                    <span className="check">✓</span> {selectedFile.name}
                  </span>
                ) : (
                  <>
                    <span className="plus">+</span>
                    <span>Escolher arquivo XML</span>
                  </>
                )}
              </label>

              <button
                className="convert-button"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
              >
                {loading ? 'Processando...' : 'Converter para PDF'}
              </button>

              {message && (
                <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>

            <div className="info-bar">
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Grátis</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Instantâneo</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✓</span>
                <span>Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Preview do PDF */}
        <div className="right-panel">
          {!showPreview ? (
            <div className="visual-content">
              <div className="floating-card card-1">
                <span className="card-icon">📄</span>
                <div className="card-info">
                  <strong>XML</strong>
                  <small>Arquivo de entrada</small>
                </div>
              </div>
              <div className="floating-card card-2">
                <span className="card-icon">📑</span>
                <div className="card-info">
                  <strong>DANFE</strong>
                  <small>PDF de saída</small>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="circle-bg"></div>
            </div>
          ) : (
            <div className="preview-container">
              <div className="preview-header">
                <h3>Pré-visualização</h3>
              </div>
              
              <div className="pdf-viewer">
                {pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className="pdf-iframe"
                    title="Visualizador de PDF"
                  />
                )}
              </div>

              <button className="download-button" onClick={handleDownload}>
                ⬇️ Baixar DANFE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;