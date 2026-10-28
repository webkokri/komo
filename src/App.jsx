import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Header from './components/Header.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import PageView, { ThemeStyle } from './cms/PageView.jsx';
import Editor from './cms/editor/Editor.jsx';
import { useCms } from './cms/store.jsx';

export default function App() {
  const location = useLocation();
  const { editing } = useCms();

  return (
    // reducedMotion="user" turns transforms off for visitors who ask for less motion;
    // the editor turns them off too so content holds still while it is being edited.
    <MotionConfig reducedMotion={editing ? 'always' : 'user'}>
      <ThemeStyle />
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollProgress />
      <Header />
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<PageView />} />
        </Routes>
      </AnimatePresence>
      <Editor />
    </MotionConfig>
  );
}
