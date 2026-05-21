import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getAvatarUrl, getLevelGroup, Difficulty } from '../types/game';
import { sounds } from '../lib/sounds';

export const LeaderboardPage = () => {
  const { leaderboard, playerName, setGameState, user } = useGame();
  const [activeTab, setActiveTab] = useState<Difficulty>('NORMAL');

  // Filter & Rank logs primarily based on levelReached (then score as tie-breaker)
  const rankedEntries = useMemo(() => {
    return leaderboard
      .filter((entry) => entry.difficulty === activeTab)
      .sort((a, b) => {
        const lvlA = a.levelReached || 1;
        const lvlB = b.levelReached || 1;
        if (lvlB !== lvlA) {
          return lvlB - lvlA;
        }
        return b.score - a.score;
      });
  }, [leaderboard, activeTab]);

  return (
    <motion.div 
      key="leaderboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-4 sm:py-6 md:py-12 pb-24 md:pb-32"
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8 text-left w-full">
        <button 
          onClick={() => { setGameState('MENU'); sounds.tap(); }}
          className="p-2.5 sm:p-3 bg-white border-2 border-slate-300 text-slate-600 hover:text-pink-500 hover:bg-pink-50 rounded-full shadow-md hover:shadow-lg hover:border-pink-300 transition-all cursor-pointer shrink-0 active:translate-y-[2px]"
          title="Return to Menu"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-400 to-sky-400 select-none truncate">
          🏆 Hall of Fame
        </h2>
      </div>

      {/* Switchable Leaderboard Difficulty Tabs for kids (highly responsive grid block instead of overflow-x-auto) */}
      <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-2xl border-2 border-slate-200 mb-6 gap-1 sm:gap-1.5 relative select-none">
        {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => {
          const isActive = activeTab === diff;
          const bgClassName = diff === 'EASY' ? 'bg-emerald-400' : diff === 'NORMAL' ? 'bg-amber-300' : 'bg-pink-400';
          return (
            <button
              key={diff}
              onClick={() => { setActiveTab(diff); sounds.tap(); }}
              className={`py-2 sm:py-2.5 px-0.5 rounded-xl text-[9px] sm:text-xs font-black uppercase cursor-pointer transition-all relative ${
                isActive
                  ? 'text-white'
                  : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="relative z-10 block text-center truncate">
                {diff === 'EASY' ? '🌱 EASY' : diff === 'NORMAL' ? '🌟 MEDIUM' : '🔥 HARD'}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeLeaderboardTabBg"
                  className={`absolute inset-0 rounded-xl shadow-sm ${bgClassName}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Ranked Logs List */}
      <div className="space-y-4 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {rankedEntries.length > 0 ? (
              rankedEntries.map((entry, idx) => {
                const isCurrentUser = (user && entry.userId === user.uid) || (!user && entry.name === playerName);
                const lvl = entry.levelReached || 1;
                const group = getLevelGroup(lvl);

                // Placement medals helper
                const getMedal = (rankIndex: number) => {
                  if (rankIndex === 0) return '🥇';
                  if (rankIndex === 1) return '🥈';
                  if (rankIndex === 2) return '🥉';
                  return `#${rankIndex + 1}`;
                };

                return (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                    key={entry.id || idx} 
                    className={`flex items-center justify-between bg-white border-4 rounded-2xl ${
                      isCurrentUser 
                        ? 'border-amber-300 shadow-[0_5px_0px_#fecf33] bg-amber-50/20' 
                        : 'border-slate-200 shadow-[0_4px_0px_#e2e8f0]'
                    } p-3 sm:p-4 hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                      <span className="text-xs sm:text-base font-black text-slate-400 w-6 sm:w-8 text-center shrink-0">
                        {getMedal(idx)}
                      </span>
                      <img 
                        src={getAvatarUrl(entry.avatarSeed || entry.name)} 
                        className="w-9 h-9 sm:w-12 sm:h-12 border-2 border-slate-200 rounded-full bg-slate-50 shrink-0" 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-base font-black text-slate-800 truncate max-w-[90px] sm:max-w-[180px]">
                            {entry.name}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-pink-400 text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 font-bold rounded-full shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5 sm:mt-1 flex items-center flex-wrap gap-1 sm:gap-1.5 leading-none">
                          <span className={`px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] ${group.textColor} ${group.borderColor} ${group.bgColor} font-black`}>
                            {group.name} (Lvl {lvl})
                          </span>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span>🎯 {entry.accuracy}% OK</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 leading-none">
                        {entry.score}
                      </div>
                      <div className="text-[7.5px] sm:text-[8px] text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1 font-bold">Points 🌟</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border-4 border-dashed border-slate-200 rounded-3xl p-4 text-slate-400 text-xs sm:text-sm font-bold">
                🧸 SECURING SERVER WORLD DATA...
                <p className="text-[10px] text-slate-300 mt-1 uppercase">NO ADVENTURES RECORDED IN {activeTab === 'NORMAL' ? 'MEDIUM' : activeTab} WORLD YET</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <button 
        onClick={() => { setGameState('MENU'); sounds.tap(); }}
        className="mt-6 sm:mt-8 w-full bg-sky-400 text-white font-bold py-3.5 text-sm sm:text-base rounded-2xl border-2 border-sky-500 shadow-[0_5px_0px_#0284c7] hover:scale-[1.01] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
      >
        🏠 RETURN TO WELCOME LOBBY
      </button>
    </motion.div>
  );
};
