import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { Router } from 'src/routes/sections';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { ThemeProvider } from 'src/theme/theme-provider';

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
      <Router />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </ThemeProvider>
  );
}
