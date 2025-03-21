import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/Landingpage/LandingPage';
import Home from './pages/Home';
import Login from './pages/login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './hooks/auth/useauth';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { isCheckingAuth, isAuthenticated } = useAuthStore();
  
  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed3f25]"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/home/*" 
          element={
            <PrivateRoute element={<Home />} isAuthenticated={isAuthenticated} />
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;