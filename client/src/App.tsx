import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/Home/Home';
import { LoginPage } from './pages/Login/Login';
import { RegisterPage } from './pages/Register/Register';
import { ProfilePage } from './pages/Profile/Profile';
import { WikiListPage } from './pages/WikiList/WikiList';
import { WikiViewPage } from './pages/WikiView/WikiView';
import { WikiEditPage } from './pages/WikiEdit/WikiEdit';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/u/:username" element={<ProfilePage />} />

              <Route path="/wiki" element={<WikiListPage />} />
              <Route path="/wiki/new" element={<ProtectedRoute><WikiEditPage mode="create" /></ProtectedRoute>} />
              <Route path="/wiki/:slug" element={<WikiViewPage />} />
              <Route path="/wiki/:slug/edit" element={<ProtectedRoute><WikiEditPage mode="edit" /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
