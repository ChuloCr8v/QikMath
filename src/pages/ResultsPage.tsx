import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { getAvatarUrl } from '../types/game';
import { sounds } from '../lib/sounds';

export const ResultsPage = () => {
  const { 
    score, totalAttempts, correctAnswers, maxStreak, personalBest, 
    playerAvatarSeed, startGame, setGameState, level, user, signInWithGoogle
  } = useGame();

  return (
    <motion.div 
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 pb-16 pt-4 max-w-4xl mx-auto"
    >
      <div className="text-center mb-4 flex flex-col items-center w-full">
        {/* Colorful Avatar frame */}
        <div className="relative mb-3">
          <img 
            src={getAvatarUrl(playerAvatarSeed)} 
            alt="Avatar" 
            referrerPolicy="no-referrer"
            className="w-16 h-16 md:w-24 md:h-24 bg-amber-50 rounded-full border-4 border-amber-300 shadow-md object-cover" 
          />
          <div className="absolute -bottom-1 -right-1 bg-pink-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm font-mono rotate-12">
            LEVEL {level}
          </div>
        </div>

        <h1 className="text-base sm:text-lg font-bold text-slate-500 uppercase tracking-wider mb-1">
          🏆 ADVENTURE COMPLETE! 🏆
        </h1>
        <motion.div 
          initial={{ scale: 0.5 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
          className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-emerald-500 my-1 drop-shadow-[0_5px_8px_rgba(0,0,0,0.15)] select-none"
        >
          {Math.round(score)}
        </motion.div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Learn Points 🌟</div>
      </div>

      {/* Colorful Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-6 max-w-xl mx-auto">
        <div className="bg-pink-100 hover:scale-[1.02] transition-transform border-2 border-pink-300 p-3 text-center rounded-2xl shadow-[0_4px_0px_#f43f5e]">
          <div className="text-pink-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Attempts</div>
          <div className="text-lg sm:text-2xl font-black text-pink-700 font-mono">{totalAttempts}</div>
        </div>
        <div className="bg-sky-100 hover:scale-[1.02] transition-transform border-2 border-sky-300 p-3 text-center rounded-2xl shadow-[0_4px_0px_#0ea5e9]">
          <div className="text-sky-600 text-[10px] font-bold uppercase tracking-wider mb-1">Accuracy</div>
          <div className="text-lg sm:text-2xl font-black text-sky-700 font-mono">
            {totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0}%
          </div>
        </div>
        <div className="bg-amber-100 hover:scale-[1.02] transition-transform border-2 border-amber-300 p-3 text-center rounded-2xl shadow-[0_4px_0px_#f59e0b]">
          <div className="text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">Best Combo</div>
          <div className="text-lg sm:text-2xl font-black text-amber-800 font-mono">
            {maxStreak}x 🔥
          </div>
        </div>
        <div className="bg-emerald-100 hover:scale-[1.02] transition-transform border-2 border-emerald-300 p-3 text-center rounded-2xl shadow-[0_4px_0px_#10b981]">
          <div className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">Personal Best</div>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 font-mono">{personalBest}</div>
        </div>
      </div>

      {!user && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-slate-50 border-2 border-dashed border-sky-300 p-4 rounded-3xl text-center mb-6"
        >
          <div className="text-xs font-black text-sky-500 uppercase mb-1.5 animate-pulse">
            ⚠️ GUEST SAVE NOTICE
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed mb-3 font-medium">
            Lock in your {Math.round(score)} high score on the global rankings! Sign in safely with Google to track your learning journey over days!
          </p>
          <button
            onClick={() => { sounds.tap(); signInWithGoogle(); }}
            className="w-full bg-sky-400 hover:bg-white text-white hover:text-sky-500 border-2 border-sky-400 font-bold text-xs py-2.5 rounded-2xl shadow-[0_4px_0px_#0284c7] hover:shadow-none transition-all cursor-pointer"
          >
            💖 SECURE MY HIGHSCORE NOW! 💖
          </button>
        </motion.div>
      )}

      {/* Play Again & Exit Buttons */}
      <div className="flex flex-row gap-3 w-full max-w-sm">
        <button 
          onClick={startGame}
          className="flex-1 bg-emerald-400 text-white py-3.5 rounded-2xl border-2 border-emerald-500 font-bold text-sm sm:text-base shadow-[0_5px_0px_#10b981] cursor-pointer hover:scale-[1.02] active:translate-y-[4px] active:shadow-none transition-all"
        >
          ✨ PLAY AGAIN! ✨
        </button>
        <button 
          onClick={() => { setGameState('MENU'); sounds.tap(); }}
          className="flex-1 bg-sky-400 text-white py-3.5 rounded-2xl border-2 border-sky-500 font-bold text-sm sm:text-base shadow-[0_5px_0px_#0284c7] cursor-pointer hover:scale-[1.02] active:translate-y-[4px] active:shadow-none transition-all"
        >
          🏠 LOBBY
        </button>
      </div>
    </motion.div>
  );
};
