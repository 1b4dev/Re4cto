import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Logout from './pages/Logout';
import AppLayout from './AppLayout';
import { ProtectedRoute } from './AppRoute';
import { ErrorProvider } from './pages/components/hooks/useError';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ErrorProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path='/logout' element={<ProtectedRoute><Logout/></ProtectedRoute>} />
          <Route path="*" element={<ProtectedRoute><AppLayout/></ProtectedRoute>} />
        </Routes>
      </ErrorProvider>
    </BrowserRouter>
  );
}

export default App;