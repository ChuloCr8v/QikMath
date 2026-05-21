import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';

export const PauseModal = () => {
  const { isPaused, setIsPaused, abortGame, level } = useGame();

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <div className="bg-white border-8 border-pink-300 p-6 md:p-8 w-full max-w-sm text-center rounded-3xl shadow-2xl">
            <div className="text-5xl mb-3 animate-pulse">⏸️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">GAME PAUSED</h2>
            <p className="text-slate-500 text-xs mb-6 font-medium leading-relaxed">
              Your points are fully safe! But if you quit, you'll go back to the welcome lobby. Let's finish learning! 🥳💫
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsPaused(false)}
                className="w-full bg-emerald-400 text-white font-extrabold py-3 rounded-2xl border-2 border-emerald-500 shadow-[0_4px_0px_#10b981] text-sm transition-all active:shadow-none translate-y-0 active:translate-y-[4px] cursor-pointer"
              >
                💖 KEEP LEARNING! 💖
              </button>
              <button 
                onClick={abortGame}
                className="w-full bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-500 font-bold py-2.5 rounded-2xl border-2 border-slate-200 transition-all text-sm cursor-pointer"
              >
                🚪 Quit to Main Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
