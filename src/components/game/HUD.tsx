import React from 'react';
import { motion } from 'motion/react';
import { Timer as ClockIcon, Flame, Star, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getAvatarUrl } from '../../types/game';

export const HUD = () => {
  const { 
    timeLeft, score, streak, playerName, playerAvatarSeed,
    level, levelCorrectCount, levelCorrectGoal, levelTitle
  } = useGame();

  return (
    <div className="absolute top-2 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] sm:w-[94%] md:w-full max-w-5xl p-3 sm:p-5 flex items-center justify-between z-40 gap-3 bg-white/95 rounded-2xl sm:rounded-3xl border-4 border-amber-300 shadow-[0_6px_0px_#fecf33]">
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        {/* TIME BAR & CLOCK */}
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <ClockIcon size={12} className="text-pink-400" /> TIME
          </div>
          <div className={`text-sm sm:text-xl font-bold ${timeLeft <= 5 ? 'text-red-500 scale-110 animate-bounce' : 'text-slate-700'} transition-all`}>
            ⏰ {timeLeft}s
          </div>
        </div>
        
        <div className="h-8 w-[2px] bg-slate-150 hidden sm:block" />

        {/* LEVEL STATS TRACKER */}
        <div className="flex flex-col min-w-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            QUEST LEVEL
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-base font-extrabold text-orange-400 uppercase shrink-0">
              ⭐ LEVEL {level}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-sky-400 capitalize truncate max-w-[80px] sm:max-w-[150px]">
              {levelTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <div className="w-16 sm:w-28 h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(levelCorrectCount / levelCorrectGoal) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 font-bold font-mono">
              {levelCorrectCount}/{levelCorrectGoal}🏆
            </span>
          </div>
        </div>

        <div className="h-8 w-[2px] bg-slate-150 hidden md:block" />
        
        {/* PLAYER AVATAR AND NAME */}
        <div className="flex flex-col hidden sm:flex shrink-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            HERO
          </div>
          <div className="flex items-center gap-1.5">
            <img 
              src={getAvatarUrl(playerAvatarSeed)} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border-2 border-amber-300 bg-amber-50" 
            />
            <div className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[80px]">
              {playerName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 justify-end">
        {/* TOTAL ADVENTURE POINTS SCORE */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-0.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Award size={11} className="text-emerald-400" /> SCORE
          </div>
          <motion.div 
            key={score}
            initial={{ scale: 1.3, color: '#f43f5e' }}
            animate={{ scale: 1, color: '#334155' }}
            className="text-base sm:text-2xl font-black text-slate-700"
          >
            {score.toFixed(0)} 🌟
          </motion.div>
        </div>

        {/* COMBO STREAK COUNT */}
        <div className="flex flex-col items-end shrink-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            STREAK
          </div>
          <div className={`text-sm sm:text-xl font-black flex items-center gap-1 ${streak > 0 ? 'text-emerald-500 font-extrabold animate-pulse' : 'text-slate-300'}`}>
            {streak}x {streak >= 3 && <Flame size={14} className="animate-bounce text-pink-500 fill-pink-500" />}
          </div>
        </div>
      </div>
    </div>
  );
};
