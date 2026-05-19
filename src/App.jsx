import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';

// Pages
import Home from './pages/Home';
import AddMedicine from './pages/AddMedicine';
import Billing from './pages/Billing';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const AppShell = () => (
  <ProductProvider>
    <Sidebar />
    <div className="min-h-screen md:ml-64 ml-0 pb-28 md:pb-8 flex flex-col transition-all duration-500 ease-in-out">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-0">
        <Routes>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-medicine"
            element={
              <ProtectedRoute>
                <AddMedicine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/medicines" element={<Navigate to="/add-medicine" replace />} />
          <Route path="/admin" element={<Navigate to="/billing" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </div>
    <MobileBottomNav />
  </ProductProvider>
);


function App() {
  const fontFaceStyles = `
    @font-face {
      font-family: 'Clash Display';
      src: url('${process.env.PUBLIC_URL}/ClashDisplay-Regular.woff') format('woff');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  `;

  return (
    <AuthProvider>
      <Router>
        <style>{fontFaceStyles}</style>
        <div className="fixed inset-0 z-[-1] bg-white"></div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={<AppShell />}
          />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-2xl border border-slate-200 bg-white shadow-lg text-sm font-medium !text-slate-800"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
