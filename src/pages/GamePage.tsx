import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { HUD } from '../components/game/HUD';
import { ProblemCard } from '../components/game/ProblemCard';
import { PauseModal } from '../components/game/PauseModal';
import { Flame } from 'lucide-react';

export const GamePage = () => {
  const { streak, setIsPaused, showLevelUpAlert } = useGame();

  return (
    <motion.div 
      key="game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-4 pt-24 sm:pt-28 pb-6 overflow-y-auto relative"
    >
      <HUD />
      <PauseModal />
  
      {/* Level Up Flash overlay for kids */}
      <AnimatePresence>
        {showLevelUpAlert?.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm pointer-events-none"
          >
            <div className="text-center p-8 border-8 border-amber-300 bg-white rounded-3xl shadow-2xl max-w-sm mx-4 animate-bounce">
              <motion.div 
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 mb-2 font-mono"
              >
                LEVEL UP! ⭐
              </motion.div>
              <div className="text-xs font-bold uppercase mb-4 tracking-widest text-slate-500">
                QUEST LEVEL {showLevelUpAlert.to} REACHED!
              </div>
              <div className="py-2 px-5 bg-sky-100 text-sky-500 border-2 border-sky-300 rounded-full inline-block text-[11px] font-extrabold uppercase tracking-wider animate-pulse">
                🚀 +{showLevelUpAlert.bonus}s EXTRA TIME BONUS! 🚀
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-auto pb-4">
        <ProblemCard />
  
        {/* Streak Progress */}
        {streak > 0 && (
          <div className="w-full max-w-md mb-4 mt-2">
             <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-500">
              <span>🔥 {streak}-STREAK COMBO</span>
              <span>Next Level: {Math.ceil((streak + 1) / 5) * 5}x</span>
            </div>
            <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-0.5">
              <motion.div 
                className="h-full bg-gradient-to-r from-pink-400 to-amber-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(streak % 5) * 20 || 100}%` }}
              />
            </div>
          </div>
        )}
  
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsPaused(true)}
          className="w-full max-w-xs bg-slate-100 hover:bg-pink-100 text-slate-500 hover:text-pink-500 font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-2xl border-2 border-slate-300 shadow-[0_4px_0px_#cbd5e1] hover:shadow-none transition-all cursor-pointer"
        >
          🚪 Pause or Back to Hub
        </motion.button>
      </div>
    </motion.div>
  );
};
