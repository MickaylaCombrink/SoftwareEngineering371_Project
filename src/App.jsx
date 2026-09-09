import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/authContext';
import { ProtectedRoute } from './routes/protectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { Login } from './screens/login';
import { Register } from './screens/register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}