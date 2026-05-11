import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import './App.css';

function App() {
  // Planning Tracker has moved to SundaySky AI Apps. The legacy app is read-only
  // and routes/data fetching are disabled so users can't act on stale data.
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

export default App;

