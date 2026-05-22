import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Smartphone, Plus } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sounds';

export const DownloadShortcutButton = () => {
  const { gameState } = useGame();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed / running as standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Hide during active game, or once installed
  if (gameState === 'PLAYING' || isInstalled) return null;

  const handleInstallClick = async () => {
    sounds.tap();

    if (deferredPrompt) {
      // Android / Chrome — native prompt available
      setInstalling(true);
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // `appinstalled` event will set isInstalled → true
      } else {
        console.log('User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setInstalling(false);
    } else {
      // iOS Safari or unsupported browser — show manual steps
      setShowInstructions(true);
    }
  };

  const closeInstructions = () => {
    sounds.tap();
    setShowInstructions(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={handleInstallClick}
          disabled={installing}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: installing ? 1 : 1.1 }}
          whileTap={{ scale: installing ? 1 : 0.9 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-pink-500 text-white rounded-full font-bold text-xs sm:text-sm border-2 border-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] cursor-pointer select-none disabled:opacity-70"
          title="Add shortcut to home screen"
        >
          <div className="relative flex items-center justify-center">
            <Smartphone size={16} className={installing ? '' : 'animate-pulse'} />
            {!installing && (
              <Plus size={8} className="absolute -top-1.5 -right-1.5 font-bold" />
            )}
          </div>
          <span>{installing ? 'OPENING…' : 'GET PHONE APP'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showInstructions && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeInstructions}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-8 border-amber-300 p-5 rounded-3xl max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                onClick={closeInstructions}
                className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:text-pink-500 rounded-full cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex justify-center mb-3">
                <div className="p-3.5 bg-amber-50 rounded-full border-2 border-amber-200 text-amber-500">
                  <Smartphone size={32} />
                </div>
              </div>

              <h3 className="text-base font-black text-slate-700 uppercase tracking-wide mb-2">
                Create Home Shortcut! 📱
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Add <strong>Math Quest</strong> to your phone or tablet's home screen to play
                instantly anytime — just like a real app!
              </p>

              <div className="space-y-3 text-left">
                {isIOS ? (
                  <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-extrabold text-pink-500 uppercase block mb-1">
                      🍎 iOS Safari (iPhone &amp; iPad)
                    </span>
                    1. Tap the <strong className="text-pink-500">Share</strong> button{' '}
                    <Share2 className="inline ml-0.5" size={12} /> in Safari.<br />
                    2. Scroll down &amp; select <strong>'Add to Home Screen'</strong>{' '}
                    <Plus className="inline ml-0.5 border border-slate-300 bg-white rounded" size={11} />.<br />
                    3. Tap <strong>'Add'</strong> at the top right!
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-xl text-[10px] text-yellow-700">
                      ⚠️ Must be opened in <strong>Safari</strong> — not Chrome or Firefox
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-extrabold text-sky-500 uppercase block mb-1">
                      🤖 Google Chrome (Android &amp; PC)
                    </span>
                    1. Tap the <strong className="text-sky-500">Menu</strong> button (three dots{' '}
                    <span className="font-bold">⋮</span> in top-right corner).<br />
                    2. Click <strong>'Add to Home Screen'</strong> or <strong>'Install App'</strong>.<br />
                    3. Confirm to save your shortcut instantly!
                  </div>
                )}
              </div>

              <button
                onClick={closeInstructions}
                className="w-full mt-4 bg-emerald-400 text-white font-extrabold py-2.5 rounded-2xl border border-emerald-500 shadow-[0_4px_0px_#10b981] hover:scale-[1.01] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-xs uppercase"
              >
                Awe-some! Let's Go 🌟
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
