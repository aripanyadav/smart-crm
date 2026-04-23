import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Tasks from './pages/Tasks';
import Pipeline from './pages/Pipeline';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ProfileProvider } from './contexts/ProfileContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center p-4"><Login /></div>} />
            <Route path="/signup" element={<div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center p-4"><Signup /></div>} />
            
            <Route element={<ProtectedRoute><Layout><div /></Layout></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
            <Route path="/pipeline" element={<ProtectedRoute><Layout><Pipeline /></Layout></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Layout><InvoiceGenerator /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          </Routes>
        </ProfileProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
