import React, { useState } from 'react';

interface FallbackModalProps {
  onVerified: () => void;
  onCancel: () => void;
}

export const FallbackModal: React.FC<FallbackModalProps> = ({ onVerified, onCancel }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [verified, setVerified] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  const handleMouseUp = () => {
    if (sliderValue > 95) {
      setSliderValue(100);
      setVerified(true);
      setTimeout(() => {
        onVerified();
      }, 500);
    } else {
      setSliderValue(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 antialiased font-sans h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Blurred Background Wrapper */}
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-login-simulated"></div>
      
      {/* Background Geometric Shapes */}
      <div aria-hidden="true" className="fixed inset-0 z-5 pointer-events-none overflow-hidden">
        <div className="shape circle w-64 h-64 -top-20 -left-20"></div>
        <div className="shape square w-48 h-48 top-1/4 -right-10 opacity-10"></div>
        <div className="shape triangle bottom-10 left-1/4 rotate-45"></div>
        <div className="shape circle w-32 h-32 bottom-20 -right-5 bg-enterprise-blue"></div>
        <div className="shape square w-24 h-24 top-10 left-1/2 opacity-5"></div>
      </div>
      <div aria-hidden="true" className="fixed inset-0 z-10 overlay-lighten"></div>

      {/* Security Modal */}
      <main className="relative z-50 w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-slate-200">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-enterprise-blue" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${verified ? 'text-green-600' : 'text-slate-900'}`}>
              {verified ? 'Verified' : 'Verification Required'}
            </h1>
            <p className="text-slate-500 text-center mt-2 leading-relaxed">
              We detected unusual interaction timing. <br className="hidden sm:block" />Please confirm you are human.
            </p>
          </div>

          {/* Verification Slider */}
          <div className="mt-8 space-y-4">
            <div className="relative flex items-center h-14 bg-slate-100 rounded-xl px-1 border border-slate-200 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest select-none">Slide to Verify</span>
              </div>
              <input 
                className="w-full h-full appearance-none bg-transparent relative z-20 cursor-pointer" 
                id="verify-slider" 
                max="100" 
                min="0" 
                type="range" 
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                disabled={verified}
              />
              <div 
                className={`absolute left-0 top-0 h-full bg-enterprise-blue transition-all duration-75 ${verified ? 'opacity-20' : 'opacity-10'}`} 
                style={{ width: `${sliderValue}%` }}
              ></div>
            </div>
            
            <div className="pt-4 text-center">
              <button onClick={onCancel} className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight" type="button">
                Cancel and Return
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-slate-400 border-t border-slate-100 pt-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Secure Enterprise Verification</span>
          </div>
        </div>
      </main>
    </div>
  );
};
