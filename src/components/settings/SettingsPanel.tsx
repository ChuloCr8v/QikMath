import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getAvatarUrl } from '../../types/game';
import { sounds } from '../../lib/sounds';

export const SettingsPanel = () => {
  const { 
    isSettingsOpen, setIsSettingsOpen, playerName, playerAvatarSeed,
    soundEnabled, volume, toggleMute, setVolume, theme, toggleTheme,
    user, isAuthLoading, signInWithGoogle, logout, personalBest
  } = useGame();

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <div className="bg-white border-8 border-amber-300 p-5 md:p-8 w-full max-w-sm relative rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:text-pink-500 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">
              ⚙️ ADVENTURE OPTIONS
            </h2>

            <div className="space-y-5">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun className="text-amber-400" /> : <Moon className="text-sky-400" />}
                  <span className="text-xs font-bold text-slate-600">Screen Mode</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-250 border-2 border-slate-200 rounded-full text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
                >
                  {theme === 'light' ? '🌞 Daylight' : '🌙 Nightlight'}
                </button>
              </div>

              {/* Volume sliders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="text-emerald-400" /> : <VolumeX className="text-pink-400" />}
                    <span className="text-xs font-bold text-slate-600">Adventure Sounds</span>
                  </div>
                  <button 
                    onClick={toggleMute}
                    className={`w-12 h-6 rounded-full border border-slate-300 transition-colors relative cursor-pointer ${soundEnabled ? 'bg-emerald-400' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      animate={{ x: soundEnabled ? 26 : 2 }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-100 accent-amber-400 rounded-lg appearance-none cursor-pointer border border-slate-200"
                />
              </div>

              {/* Account & Sync Profile Section */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure High Scores
                </label>
                
                {isAuthLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="w-6 h-6 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-2xl border-2 border-sky-150 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[7px] font-bold text-emerald-500 uppercase">ONLINE</span>
                      </div>
                      <img 
                        src={user.photoURL || getAvatarUrl(playerAvatarSeed)} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-amber-50" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-xs font-bold truncate">
                          {user.displayName || 'PILOT'}
                        </p>
                        <p className="text-[8px] text-slate-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-[10px] text-sky-500 font-bold mt-1">
                          Personal Best: {personalBest} 🌟
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => { logout(); sounds.tap(); }}
                      className="w-full py-1.5 bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-500 rounded-xl transition-all font-bold text-[10px] uppercase cursor-pointer border border-slate-200"
                    >
                      Disconnect Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <p className="text-[10px] text-slate-400 tracking-wide leading-relaxed text-center font-medium">
                      Join safely to save your learning stars, milestones, and enter the world Hall of Fame rankings!
                    </p>
                    <button
                      onClick={() => { signInWithGoogle(); sounds.tap(); }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-sky-400 text-white rounded-xl border border-sky-500 hover:bg-white hover:text-sky-500 transition-all font-bold text-xs shadow-[0_3px_0px_#38bdf8] cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fillRule="evenodd" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fillRule="evenodd" />
                      </svg>
                      Sign In Safely!
                    </button>
                  </div>
                )}
              </div>

              {/* Local Player Info */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400">YOUR HERO NAME</label>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200">
                  <img src={getAvatarUrl(playerAvatarSeed)} alt="Avatar" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border-2 border-amber-300 bg-white" />
                  <div>
                    <p className="text-slate-700 text-sm font-black">{playerName || 'GUEST_HERO'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">HERO CODE: {playerAvatarSeed}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-emerald-400 text-white font-extrabold py-3 rounded-2xl border-2 border-emerald-500 shadow-[0_5px_0px_#10b981] text-xs sm:text-sm uppercase cursor-pointer active:translate-y-[4px] active:shadow-none transition-all mt-2"
              >
                ✨ SAVE ADVENTURE SETTINGS ✨
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
