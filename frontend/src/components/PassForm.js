import React, { useState, useEffect } from 'react';
import { createPass, fetchDepartments, fetchTemplates } from '../api';

const PassForm = ({ onPassCreated }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    purpose: '',
    valid_until: '',
    email: '',
    template: '',
  });
  
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, templatesData] = await Promise.all([
          fetchDepartments(),
          fetchTemplates(),
        ]);
        setDepartments(departmentsData);
        setTemplates(templatesData);
      } catch (err) {
        setError('Failed to load form data');
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Format date for backend
      const data = { ...formData };
      
      await createPass(data);
      alert('Pass created successfully');
      
      // Reset form
      setFormData({
        full_name: '',
        department: '',
        purpose: '',
        valid_until: '',
        email: '',
        template: '',
      });
      
      if (onPassCreated) {
        onPassCreated();
      }
    } catch (err) {
      setError('Failed to create pass');
      console.error('Error creating pass:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading form data...</div>;

  return (
    <div className="pass-form">
      <h2>Создать новый пропуск</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="full_name">Полное имя</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="department">Отдел</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="purpose">Цель</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="valid_until">Действителен до</label>
          <input
            type="datetime-local"
            id="valid_until"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Электронная почта</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="template">Шаблон (необязательно)</label>
          <select
            id="template"
            name="template"
            value={formData.template}
            onChange={handleChange}
          >
            <option value="">Default Template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Создание...' : 'Создать пропуск'}
        </button>
      </form>
    </div>
  );
};

export default PassForm;