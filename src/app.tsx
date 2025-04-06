import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { Router } from 'src/routes/sections';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { ThemeProvider } from 'src/theme/theme-provider';
import { AuthProvider } from 'src/contexts/auth-context';

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}
