import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { QueryTVWS } from './components/QueryTVWS';
import { AdminPanel } from './components/AdminPanel';
import { StateManagement } from './components/StateManagement';
import { authService } from './utils/auth';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('query');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('query');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'query':
        return <QueryTVWS />;
      case 'admin':
        return <AdminPanel />;
      case 'states':
        return <StateManagement />;
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Management</h3>
            <p className="text-slate-600">User management functionality would be implemented here.</p>
          </div>
        );
      default:
        return <QueryTVWS />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} loading={loading} error={error} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;