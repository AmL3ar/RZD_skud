import React, { useState, useEffect } from 'react';
import { fetchTemplates } from '../api';
import axios from 'axios';

const API_URL = 'http://localhost:8010/api';

const TemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    template_file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({
      ...newTemplate,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setNewTemplate({
      ...newTemplate,
      template_file: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newTemplate.name);
      formData.append('description', newTemplate.description);
      formData.append('template_file', newTemplate.template_file);
      
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/passes/templates/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      alert('Template created successfully');
      
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        template_file: null,
      });
      
      // Reload templates
      loadTemplates();
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="template-editor">
      <h2>Управление шаблонами</h2>
      
      <div className="template-list">
        <h3>Доступные шаблоны</h3>
        {templates.length === 0 ? (
          <p>Шаблоны не найдены</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.description}</td>
                  <td>{new Date(template.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="template-form">
        <h3>Добавить новый шаблон</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название шаблона</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newTemplate.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={newTemplate.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="template_file">Файл шаблона (DOCX)</label>
            <input
              type="file"
              id="template_file"
              name="template_file"
              accept=".docx"
              onChange={handleFileChange}
              required
            />
          </div>
          
          <button type="submit" disabled={submitting}>
            {submitting ? 'Загрузка...' : 'Загрузить шаблон'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;