import React from 'react';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getAvatarUrl } from '../../types/game';
import { sounds } from '../../lib/sounds';

export const Header = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    user, 
    playerAvatarSeed, 
    gameState, 
    personalBest 
  } = useGame();

  // Only show header when not inside active gameplay for maximum screen purity
  if (gameState === 'PLAYING') return null;

  return (
    <div className="w-full fixed top-0 max-w-4xl mx-auto px-4 relative pt-6 pb-2 z-50">
      <motion.header
        animate={{ 
          y: [-1, 1, -1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 5, 
          ease: "easeInOut" 
        }}
        className="relative bg-white border-4 border-amber-400 rounded-2xl px-4 py-2 flex items-center justify-between shadow-[0_6px_0px_rgba(251,191,36,1)]"
      >
        {/* Colorful Kids Logo */}
        <div className="flex items-center select-none">
          <button
            onClick={() => { sounds.tap(); }}
            className="hover:scale-[1.05] active:scale-[0.95] transition-transform flex items-center gap-2 cursor-pointer"
          >
            <div className="relative bg-slate-900 border-2 border-amber-300 p-1 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                <div className="rounded-[4px] bg-pink-400 text-white flex items-center justify-center font-black text-[11px] sm:text-xs font-mono select-none leading-none">+</div>
                <div className="rounded-[4px] bg-sky-400 text-white flex items-center justify-center font-black text-[11px] sm:text-xs font-mono select-none leading-none">−</div>
                <div className="rounded-[4px] bg-amber-400 text-white flex items-center justify-center font-black text-[11px] sm:text-xs font-mono select-none leading-none">×</div>
                <div className="rounded-[4px] bg-emerald-400 text-white flex items-center justify-center font-black text-[11px] sm:text-xs font-mono select-none leading-none">=</div>
              </div>
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-400 to-sky-400 text-sm sm:text-base font-extrabold tracking-wide uppercase select-none">
              Math Quest
            </span>
          </button>
        </div>

        {/* Dynamic Pilot stats & Control panel target */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end leading-tight">
            {user ? (
              <>
                <span className="text-xs text-slate-700 font-bold tracking-wider truncate max-w-[85px] sm:max-w-[130px]">
                  🌟 {user.displayName || 'Hero'}
                </span>
                <span className="text-[10px] text-pink-400 font-bold">
                  Best: {personalBest} pts!
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400 font-bold">
                  Guest Friend
                </span>
                <span className="text-[10px] text-amber-500 font-bold">
                  Play & Save!
                </span>
              </>
            )}
          </div>

          <button 
            onClick={() => { setIsSettingsOpen(true); sounds.tap(); }}
            className="group flex items-center gap-1.5 p-1 bg-sky-50 border-2 border-sky-400 rounded-full hover:bg-sky-400 hover:text-white transition-all shadow-[0_4px_0px_#3fc1ff] hover:shadow-none cursor-pointer"
            title="Adventure Settings"
          >
            <img 
              src={user?.photoURL || getAvatarUrl(playerAvatarSeed || 'guest')} 
              referrerPolicy="no-referrer"
              alt="Avatar" 
              className="w-7 h-7 object-cover rounded-full border-2 border-white bg-white shrink-0" 
            />
            <div className="pr-1 text-sky-400 group-hover:text-white">
              <Settings size={14} className={isSettingsOpen ? 'animate-spin' : 'group-hover:rotate-90 transition-transform duration-300'} />
            </div>
          </button>
        </div>
      </motion.header>
    </div>
  );
};
