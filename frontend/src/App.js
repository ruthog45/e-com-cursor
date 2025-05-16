import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/admin/Dashboard';
import { trackPageView } from './utils/analytics';

function App() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute isAdmin>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      {/* ... other routes ... */}
    </Routes>
  );
}

export default App; 