import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Login from './components/Login';
import PassList from './components/PassList';
import PassForm from './components/PassForm';
import TemplateEditor from './components/TemplateEditor';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('passes');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return (
      <div className="dashboard">
        <nav className="tabs">
          <button 
            className={activeTab === 'passes' ? 'active' : ''} 
            onClick={() => setActiveTab('passes')}
          >
            Просмотр пропусков
          </button>
          <button 
            className={activeTab === 'create' ? 'active' : ''} 
            onClick={() => setActiveTab('create')}
          >
            Создать пропуск
          </button>
          <button 
            className={activeTab === 'templates' ? 'active' : ''} 
            onClick={() => setActiveTab('templates')}
          >
            Шаблоны
          </button>
          <button className="logout" onClick={handleLogout}>
            Выйти
          </button>
        </nav>

        <div className="content">
          {activeTab === 'passes' && <PassList />}
          {activeTab === 'create' && <PassForm onPassCreated={() => setActiveTab('passes')} />}
          {activeTab === 'templates' && <TemplateEditor />}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Система управления пропусками WRC486</h1>
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 Система управления пропусками WRC486</p>
      </footer>
    </div>
  );
}

export default App;