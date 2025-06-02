import React, { useState, useEffect } from 'react';
import { fetchPasses, generateDocument, sendEmail, downloadPass, printPass } from '../api';

const PassList = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const data = await fetchPasses();
        setPasses(data);
      } catch (err) {
        setError('Failed to load passes');
        console.error('Error loading passes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPasses();
  }, []);

  const handleGenerateDocument = async (passId) => {
    try {
      const result = await generateDocument(passId);
      alert(`Document generated successfully: ${result.document}`);
      
      // Refresh passes list
      const data = await fetchPasses();
      setPasses(data);
    } catch (err) {
      alert('Failed to generate document');
      console.error('Error generating document:', err);
    }
  };

  const handlePrint = async (passId) => {
    try {
      const { document } = await printPass(passId);
      const win = window.open(document, '_blank');
      if (!win) {
        alert('Не удалось открыть окно печати.');
        return;
      }
      win.focus();
      // wait for document to load, then print
      win.onload = () => { win.print(); };
    } catch (err) {
      alert('Ошибка при отправке на печать');
      console.error('Print error:', err);
    }
  };

  const handleSendEmail = async (passId) => {
    try {
      await sendEmail(passId);
      alert('Email sent successfully');
    } catch (err) {
      alert('Failed to send email');
      console.error('Error sending email:', err);
    }
  };

  const handleDownload = async (passId) => {
    try {
      const result = await downloadPass(passId);
      if (!result) {
        alert('Failed to download document');
      }
    } catch (err) {
      alert('Failed to download document');
      console.error('Error downloading document:', err);
    }
  };

  if (loading) return <div>Loading passes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pass-list">
      <h2>Пропуска</h2>
      {passes.length === 0 ? (
        <p>Пропуска не найдены</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Отдел</th>
              <th>Цель</th>
              <th>Действителен до</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {passes.map((pass) => (
              <tr key={pass.id}>
                <td>{pass.full_name}</td>
                <td>{pass.department_name}</td>
                <td>{pass.purpose}</td>
                <td>{new Date(pass.valid_until).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={() => handleGenerateDocument(pass.id)}>
                    Создать
                  </button>
                  <button onClick={() => handleSendEmail(pass.id)}>
                    Отправить
                  </button>
		  <button onClick={() => handlePrint(pass.id)}>
  	            Печать
                  </button>
                  {pass.generated_document && (
                    <button onClick={() => handleDownload(pass.id)}>
                      Скачать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PassList;