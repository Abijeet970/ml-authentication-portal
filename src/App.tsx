import { useState, useCallback, useEffect } from 'react';
import { Login } from './components/Login';
import { FallbackModal } from './components/FallbackModal';
import { Dashboard } from './components/Dashboard';
import { useBehaviorTracker } from './hooks/useBehaviorTracker';
import { verifyBehavior } from './services/api';

function App() {
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [showFallback, setShowFallback] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { collectPayload } = useBehaviorTracker();

  // Debug override — keep for demo flexibility
  const [debugConfidence, setDebugConfidence] = useState<number | null>(null);

  useEffect(() => {
    (window as any).setMlConfidence = (score: number) => {
      setDebugConfidence(score);
      console.log(
        `%c[Secura] Debug override: confidence set to ${score}`,
        'color: #f59e0b; font-weight: bold;'
      );
    };
    console.log(
      '%c[Secura Portal] ML Authentication System Active',
      'color: #2563eb; font-weight: bold; font-size: 14px;'
    );
    console.log(
      'Debug: run window.setMlConfidence(0.5) to force low confidence'
    );
  }, []);

  const handleLoginClick = useCallback(async () => {
    setIsVerifying(true);

    try {
      // Step 1: Collect all behavioral data
      const payload = await collectPayload();

      // Step 2: Send to backend for ML scoring
      const result = await verifyBehavior(payload);

      // Allow debug override
      const finalConfidence = debugConfidence ?? result.confidence;
      const finalDecision = debugConfidence !== null
        ? (debugConfidence >= 0.85 ? 'PASS' : debugConfidence >= 0.60 ? 'FALLBACK' : 'BLOCK')
        : result.decision;

      // Log result for demo terminal visibility
      console.log(
        '%c[Secura] ML Verification Result',
        'color: #10b981; font-weight: bold;',
        {
          confidence: finalConfidence,
          decision: finalDecision,
          breakdown: result.breakdown,
          requestId: result.request_id,
        }
      );

      // Step 3: Route based on decision
      if (finalDecision === 'PASS') {
        setView('dashboard');
      } else {
        setShowFallback(true);
      }
    } catch (error) {
      console.warn('[Secura] Verification error — staying on login page:', error);
      // Stay on login page on error (fail-safe) — don't skip auth
    } finally {
      setIsVerifying(false);
    }
  }, [collectPayload, debugConfidence]);

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
      <Login onLoginClick={handleLoginClick} isVerifying={isVerifying} />
      {showFallback && (
        <FallbackModal onVerified={handleVerified} onCancel={handleCancel} />
      )}
    </>
  );
}

export default App;
