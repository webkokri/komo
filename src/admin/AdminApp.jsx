import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Layout from './Layout.jsx';
import { Spinner } from './ui.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PageList from './pages/PageList.jsx';
import PageSettings from './pages/PageSettings.jsx';
import MenuManager from './pages/MenuManager.jsx';
import MediaLibrary from './pages/MediaLibrary.jsx';
import Leads from './pages/Leads.jsx';
import Users from './pages/Users.jsx';
import SiteSettings from './pages/SiteSettings.jsx';
import SeoSettings from './pages/SeoSettings.jsx';
import CodeSettings from './pages/CodeSettings.jsx';

function Guard() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="sc-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<Guard />}>
          <Route index element={<Dashboard />} />
          <Route path="pages" element={<PageList />} />
          <Route path="pages/:slug" element={<PageSettings />} />
          <Route path="menus" element={<MenuManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="leads" element={<Leads />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="seo" element={<SeoSettings />} />
          <Route path="code" element={<CodeSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
