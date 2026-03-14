import { useState, useCallback, useEffect } from 'react';
import { Login } from './components/Login';
import { FallbackModal } from './components/FallbackModal';
import { Dashboard } from './components/Dashboard';

function App() {
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  
  // This state variable stores the simulated ML confidence score
  const [mlConfidence, setMlConfidence] = useState<number>(1.0);
  const [showFallback, setShowFallback] = useState(false);

  // Expose ML confidence to window for easy demo testing
  useEffect(() => {
    (window as any).setMlConfidence = (score: number) => setMlConfidence(score);
    console.log("Run window.setMlConfidence(0.8) to lower confidence score");
  }, []);

  const handleLoginClick = useCallback(() => {
    if (mlConfidence < 0.85) {
      // Need manual verification
      setShowFallback(true);
    } else {
      // Direct success
      setView('dashboard');
    }
  }, [mlConfidence]);

  const handleVerified = useCallback(() => {
    setShowFallback(false);
    setView('dashboard');
  }, []);

  const handleCancel = useCallback(() => {
    setShowFallback(false);
  }, []);

  if (view === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <>
      <Login onLoginClick={handleLoginClick} />
      {showFallback && (
        <FallbackModal onVerified={handleVerified} onCancel={handleCancel} />
      )}
    </>
  );
}

export default App;
