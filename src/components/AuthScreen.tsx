import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Error al iniciar sesión. Por favor intenta de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-stone-950 p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=2070&auto=format&fit=crop")' }}
      />
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white border-4 border-[#2D3339] p-8 shadow-[8px_8px_0px_#2D3339] flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-center text-center">
            <div className="bg-[#C4A484] p-3 border-2 border-[#2D3339] rounded-none mb-2">
              <Sparkles className="h-6 w-6 text-[#2D3339]" />
            </div>
            <h1 className="font-display font-black text-3xl text-[#2D3339] uppercase tracking-tighter">Moon Paracas</h1>
            <p className="text-sm font-mono text-stone-500 uppercase tracking-widest text-center mt-1">
              Portal del Inversionista
            </p>
          </div>

          <p className="text-sm text-stone-700 text-center font-medium my-2">
            Inicia sesión para interactuar con el Masterplan y asegurar tu lote ideal frente al oasis.
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border-l-4 border-red-500 rounded-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-[#2D3339] font-bold font-mono text-sm py-4 px-6 border-2 border-[#2D3339] transition-all relative overflow-hidden group shadow-[4px_4px_0px_#2D3339] active:translate-y-1 active:shadow-[0px_0px_0px_#2D3339]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
