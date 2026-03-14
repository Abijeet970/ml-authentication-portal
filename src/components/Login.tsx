import React, { useEffect } from 'react';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';

interface LoginProps {
  onLoginClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginClick }) => {
  useBehaviorTracker();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const layers = document.querySelectorAll('.parallax-layer');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        layers.forEach(layer => {
            const depth = parseFloat(layer.getAttribute('data-depth') || '0');
            const moveX = (mouseX - window.innerWidth / 2) * depth;
            const moveY = (mouseY - window.innerHeight / 2) * depth;
            (layer as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden min-h-screen relative w-full flex flex-col items-center justify-center">
      <div className="bg-pattern text-black dark:text-white" id="bg-parallax-container">
        <div className="geometric-shape rounded-full w-[600px] h-[600px] -top-40 -left-40 parallax-layer" data-depth="0.02" style={{animationDuration: '20s', opacity: 0.08}}></div>
        <div className="geometric-shape w-96 h-96 top-20 -right-20 rotate-12 parallax-layer" data-depth="0.04" style={{animationDelay: '-5s', animationDuration: '25s', opacity: 0.08}}></div>
        <div className="geometric-shape w-40 h-40 bottom-40 left-10 rotate-45 parallax-layer" data-depth="0.06" style={{animationDelay: '-2s', opacity: 0.08}}></div>
        <div className="geometric-shape rounded-full w-24 h-24 top-1/2 right-10 parallax-layer" data-depth="0.05" style={{animationDelay: '-3s', animationDuration: '18s'}}></div>
        <div className="geometric-shape w-12 h-12 top-10 left-1/3 rotate-[15deg] parallax-layer" data-depth="0.03" style={{animationDelay: '-8s', animationDuration: '22s'}}></div>
        <div className="geometric-shape shape-triangle w-32 h-32 bottom-20 right-20 parallax-layer" data-depth="0.07" style={{animationDelay: '-1s', animationDuration: '20s'}}></div>
        <div className="geometric-shape shape-triangle w-16 h-16 top-1/4 left-1/4 -rotate-12 parallax-layer" data-depth="0.04" style={{animationDelay: '-12s'}}></div>
        <div className="geometric-shape w-[1px] h-64 top-0 left-1/2 parallax-layer" data-depth="0.01" style={{animationDuration: '30s', opacity: 0.1}}></div>
        <div className="geometric-shape w-64 h-[1px] bottom-1/4 left-0 parallax-layer" data-depth="0.02" style={{animationDuration: '25s', opacity: 0.1}}></div>
        <div className="geometric-shape rounded-full w-4 h-4 top-[15%] right-[25%] parallax-layer" data-depth="0.08"></div>
        <div className="geometric-shape rounded-full w-6 h-6 bottom-[30%] left-[40%] parallax-layer" data-depth="0.09" style={{animationDelay: '-4s'}}></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-900/10 dark:bg-white/10 transform -translate-y-1/2"></div>
      </div>
      
      <div className="relative flex w-full flex-col items-center justify-center p-6 z-10 w-full h-full">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 w-full">
          <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start">
            <span className="material-symbols-outlined cursor-pointer hover:opacity-70 transition-opacity">close</span>
          </div>
        </div>
        
        <div className="w-full max-w-[400px] flex flex-col backdrop-blur-sm bg-white/30 dark:bg-transparent rounded-xl">
          <div className="mb-10 flex flex-col items-center opacity-0 animate-fade-in-up">
            <div className="w-16 h-16 rounded bg-black flex items-center justify-center mb-6 shadow-2xl shadow-black/10">
              <span className="material-symbols-outlined text-white text-4xl">shield_person</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">Please enter your details to sign in</p>
          </div>
          
          <div className="w-full space-y-5">
            <div className="flex flex-col w-full opacity-0 animate-fade-in-up delay-1">
              <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <input className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-4 text-sm focus:ring-1 focus:ring-black focus:border-black transition-all outline-none" placeholder="Enter your username" type="text" />
              </div>
            </div>
            
            <div className="flex flex-col w-full opacity-0 animate-fade-in-up delay-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Password</label>
                <a className="text-slate-900 dark:text-white text-xs font-semibold hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative flex items-center">
                <input className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-4 pr-12 text-sm focus:ring-1 focus:ring-black focus:border-black transition-all outline-none" placeholder="Enter your password" type="password" />
                <button className="absolute right-4 text-slate-400 hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 py-1 opacity-0 animate-fade-in-up delay-3">
              <input className="w-4 h-4 text-black bg-white border-slate-300 rounded focus:ring-black dark:bg-slate-700 dark:border-slate-600" id="remember" type="checkbox" />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">Keep me signed in</label>
            </div>
            
            <button onClick={onLoginClick} className="w-full h-12 bg-black text-white font-bold rounded hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 opacity-0 animate-fade-in-up delay-4 shadow-xl shadow-black/10">
              <span>Log In</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
          
          <div className="mt-8 text-center opacity-0 animate-fade-in-up delay-4" style={{animationDelay: '0.5s'}}>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Don't have an account? 
              <a className="text-slate-900 dark:text-white font-bold hover:underline ml-1" href="#">Sign Up</a>
            </p>
          </div>
          
          <div className="w-full mt-10 opacity-0 animate-fade-in-up delay-4" style={{animationDelay: '0.6s'}}>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Or continue with</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="flex items-center justify-center h-12 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <img alt="Google" className="w-5 h-5 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_6CsEl_buFUDL6U5K97EkMVn4JwUiG-CQr-CrhPiA6elNDO61pYiInJFgbihIDXUD_jdr8sLoVsURBY5TvnF_s1jc3fVyMSFIwW0m_PfMM_N50xtS0sDhUFB9FMjAob26kDvAzrVuPtcTxuBqyaWe_nHWoJHGW3DmLgm7eDeBza5W79AwihkBHhMB6brNzdPPNG6uN4FUFXD_QROm6Wscp1d4uAvC792zk5KqdrsZHFDf_WGnZQ52XHXpOcjRVnhN7kPc7uRV10NV" />
                <span className="text-xs font-bold uppercase tracking-wider">Google</span>
              </button>
              <button className="flex items-center justify-center h-12 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <img alt="Apple" className="w-5 h-5 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjDfqeq8hCPPqflNvDcelkLeqiIIExPRhKJsDkAoXV7J5Uuy5TqTF85ckeMAAY_WlJli7y7fcK9ylMYEaV3_-qQSDbAQHuESDaALs9hgmmw7_EBy6TcVSVU35YNrgSPZgo_Xx5o9zf81zvkXmNP6IhW6bsKky75dlaYBUK6Qahtfrw_bseM0U_yf-3Pq7tYWbhIRxgq4_lsV0eIUcowFfFUi_bkEsK0v8zbFS61CRCjIGRe0adSXj5ZukNySYIXoh31Mn047jHTAAa" />
                <span className="text-xs font-bold uppercase tracking-wider">Apple</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
