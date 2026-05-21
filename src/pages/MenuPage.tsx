import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { getAvatarUrl, getLevelGroup, Difficulty } from '../types/game';
import { sounds } from '../lib/sounds';

export const MenuPage = () => {
    const { 
      startGame, playerName, setPlayerName, difficulty, setDifficulty, 
      leaderboard, setGameState, suggestedName, user, history, playerAvatarSeed,
      personalBest, signInWithGoogle
    } = useGame();
    const [activeTab, setActiveTab] = useState<'LAUNCH' | 'RANKINGS' | 'HISTORY'>('LAUNCH');
    const [rankingsDiff, setRankingsDiff] = useState<Difficulty>('NORMAL');
    const [showRulesModal, setShowRulesModal] = useState(false);

    // Filter, group, and rank leaderboard logs for the display inside the RANKINGS tab
    const activeRankedEntries = useMemo(() => {
      return leaderboard
        .filter((entry) => entry.difficulty === rankingsDiff)
        .sort((a, b) => {
          const lvlA = a.levelReached || 1;
          const lvlB = b.levelReached || 1;
          if (lvlB !== lvlA) {
            return lvlB - lvlA;
          }
          return b.score - a.score;
        })
        .slice(0, 10);
    }, [leaderboard, rankingsDiff]);
  
    return (
      <div className="min-h-0 pt-10 sm:pt-14 md:pt-18 pb-6 w-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-md w-full mx-auto flex flex-col items-center gap-2 sm:gap-3 relative"
        >
          {/* Compact visual header */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-400 to-sky-400 select-none tracking-tight font-sans">
              MATH PLAYGROUND ⭐
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Practice & Level Up!</p>
            <button
              onClick={() => { setShowRulesModal(true); sounds.tap(); }}
              className="mt-2 inline-flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-800 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wide transition-all cursor-pointer shadow-[0_2px_0px_#ca8a04] hover:scale-[1.02] active:translate-y-[2px] active:shadow-none select-none"
            >
              📖 HOW TO PLAY & SCORING RULES
            </button>
          </div>
  
        <div className="w-full">
          {/* Kids-themed bubbly tab switcher */}
          <div className="flex bg-slate-100 border-2 border-slate-200 rounded-2xl p-1 relative mb-3 sm:mb-4 overflow-x-auto gap-0.5 shadow-inner">
            <button
              onClick={() => { setActiveTab('LAUNCH'); sounds.tap(); }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-xl font-bold text-[11px] tracking-wider relative whitespace-nowrap px-1.5 cursor-pointer transition-colors ${
                activeTab === 'LAUNCH' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">🎮 PLAY ADVENTURE</span>
              {activeTab === 'LAUNCH' && (
                <motion.div
                  layoutId="activeMenuTabBg"
                  className="absolute inset-0 bg-amber-400 rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('RANKINGS'); sounds.tap(); }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-xl font-bold text-[11px] tracking-wider relative whitespace-nowrap px-1.5 cursor-pointer transition-colors ${
                activeTab === 'RANKINGS' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">🏆 HALL OF FAME</span>
              {activeTab === 'RANKINGS' && (
                <motion.div
                  layoutId="activeMenuTabBg"
                  className="absolute inset-0 bg-pink-400 rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('HISTORY'); sounds.tap(); }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-xl font-bold text-[11px] tracking-wider relative whitespace-nowrap px-1.5 cursor-pointer transition-colors ${
                activeTab === 'HISTORY' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">📚 MY SCORES</span>
              {activeTab === 'HISTORY' && (
                <motion.div
                  layoutId="activeMenuTabBg"
                  className="absolute inset-0 bg-sky-400 rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </button>
          </div>
  
          <div className="min-h-[360px] sm:min-h-[390px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'LAUNCH' ? (
                <motion.div
                  key="launch-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col justify-between bg-white border-4 border-amber-300 p-5 rounded-3xl shadow-[0_8px_0px_#fecf33]"
                >
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <img 
                          src={getAvatarUrl(playerAvatarSeed || playerName || suggestedName)} 
                          alt="Character Face" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full border-4 border-amber-200 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-sky-400 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full border-2 border-white shadow-sm font-mono">
                          HERO
                        </div>
                      </div>
                    </div>
 
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 text-center tracking-wide">
                        What is your adventurer name? 🥰
                      </label>
                      <input 
                        type="text"
                        placeholder={suggestedName}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 text-center text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-400 focus:bg-white"
                      />
                    </div>
 
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-500 text-center tracking-wide">
                        Choose Math Difficulty:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['EASY', 'NORMAL', 'HARD'] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => { setDifficulty(d); sounds.tap(); }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                              difficulty === d 
                                ? 'bg-pink-400 border-pink-500 text-white shadow-[0_4px_0px_#ff439f]' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {d === 'EASY' ? '🌈 EASY' : d === 'NORMAL' ? '⭐ MEDIUM' : '🚀 HARD'}
                          </button>
                        ))}
                      </div>
                      
                      {/* Level/Difficulty Description */}
                      <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-2 text-center text-xs font-medium leading-relaxed text-slate-600 min-h-[58px] flex items-center justify-center">
                        {difficulty === 'EASY' && (
                          <span>
                            🌈 Plus (+) and Minus (-) math up to 20! Has big bubble buttons to choose answers. Perfect for young learners!
                          </span>
                        )}
                        {difficulty === 'NORMAL' && (
                          <span>
                            ⭐ Fun double digits and multiplication (×)! Great training helper with easy direct-select answer bubbles!
                          </span>
                        )}
                        {difficulty === 'HARD' && (
                          <span>
                            🚀 Hard Mode! Giant digits and manual entry! Type direct answers using the screen keyboard keys.
                          </span>
                        )}
                      </div>
                    </div>
 
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={startGame}
                      className="w-full bg-emerald-400 text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 rounded-2xl border-2 border-emerald-500 shadow-[0_5px_0px_#10b981] mt-2 active:shadow-none translate-y-0 active:translate-y-[4px] transition-all"
                    >
                      ✨ START MATH ADVENTURE! ✨
                    </motion.button>
                  </div>
                </motion.div>
              ) : activeTab === 'RANKINGS' ? (
                <motion.div
                  key="rankings-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col justify-between bg-white border-4 border-pink-300 p-5 rounded-3xl shadow-[0_8px_0px_#ff5ebd]"
                >
                  {/* Switchable sub-tabs for rankings difficulty breakdown */}
                  <div className="flex bg-slate-50 rounded-xl p-0.5 border border-slate-100 mb-3 gap-0.5">
                    {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => { setRankingsDiff(diff); sounds.tap(); }}
                        className={`flex-1 py-1 text-[10px] sm:text-xs rounded-lg font-bold transition-all ${
                          rankingsDiff === diff
                            ? 'bg-pink-400 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {diff === 'EASY' ? '🌈 EASY' : diff === 'NORMAL' ? '⭐ MEDIUM' : '🚀 HARD'}
                      </button>
                    ))}
                  </div>
 
                  <div className="space-y-2 flex-1 max-h-[190px] sm:max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {leaderboard.length > 0 ? (
                      activeRankedEntries.length > 0 ? (
                        activeRankedEntries.map((entry, idx) => {
                          const isCurrentUser = (user && entry.userId === user.uid) || (!user && entry.name === playerName);
                          const lvl = entry.levelReached || 1;
                          const group = getLevelGroup(lvl);
                          return (
                            <div key={entry.id || idx} className={`flex items-center justify-between p-2 rounded-xl last:border-0 ${isCurrentUser ? 'bg-sky-50 border-2 border-sky-300' : 'bg-slate-50 border border-slate-100'}`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-bold text-sky-400 w-4 shrink-0">#{idx + 1}</span>
                                <img src={getAvatarUrl(entry.avatarSeed || entry.name)} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-200 bg-white shrink-0" alt="v" />
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[11px] font-bold truncate max-w-[90px] ${isCurrentUser ? 'text-sky-500' : 'text-slate-700'}`}>{entry.name}</span>
                                  <span className={`text-[8px] font-bold truncate ${group.textColor}`}>{group.name} (Lvl {lvl})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-pink-400 font-extrabold text-sm">{entry.score} pts</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">
                          No high scores recorded here yet! 🐨
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-400 animate-pulse font-medium">
                        Downloading cloud data... ✨
                      </div>
                    )}
                  </div>
 
                  <div className="mt-4 space-y-3">
                    {!user && (
                      <div className="bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-2xl p-2 text-center">
                        <button 
                          onClick={() => { sounds.tap(); signInWithGoogle(); }}
                          className="text-[10px] font-bold text-pink-400 hover:underline tracking-wide"
                        >
                          ⚠️ Playing as Guest. Click to [ SIGN IN ] & save scores!
                        </button>
                      </div>
                    )}
 
                    <button 
                      onClick={() => { setGameState('LEADERBOARD'); sounds.tap(); }}
                      className="w-full bg-white font-bold text-[11px] text-pink-500 hover:bg-pink-50 transition-all py-2 rounded-xl border-2 border-pink-300 shadow-[0_4px_0px_#ff5ebd] hover:shadow-none translate-y-0"
                    >
                      🏆 GLOBAL HALL OF CHAMPIONS 🏆
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col bg-white border-4 border-sky-300 p-5 rounded-3xl shadow-[0_8px_0px_#3fc1ff]"
                >
                  {!user ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 my-auto">
                      <div className="text-sky-500 font-bold mb-2 text-sm animate-pulse">🔒 PROFILE NOT SIGNED IN</div>
                      <p className="text-slate-500 text-[11px] mb-4 leading-relaxed max-w-[280px] mx-auto font-medium">
                        Adventurer score histories are stored for signed-in players. Sign in securely with Google to view your records and track progress!
                      </p>
                      <button
                        onClick={() => { sounds.tap(); signInWithGoogle(); }}
                        className="px-6 py-2 bg-sky-400 hover:bg-white text-white hover:text-sky-500 border-2 border-sky-400 font-bold text-xs rounded-xl shadow-[0_4px_0px_#0284c7] hover:shadow-none transition-all active:translate-y-[2px]"
                      >
                        [ SIGN IN SECURELY ]
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1 max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.length > 0 ? [...history].reverse().map((entry, idx) => (
                        <div key={entry.id || idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-slate-700 text-xs font-bold">
                              📅 {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
                              Difficulty: {entry.difficulty} // {entry.accuracy}% accuracy
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sky-400 font-extrabold text-sm">+{entry.score} pts</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">
                          No score logs found yet! 🎉
                          <p className="mt-2 text-[10px] text-slate-400">COMMAND: START AN ADVENTURE!</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Rulebook & Scoring Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-[0_12px_0px_#fecf33] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Bubbly Modal Header */}
              <div className="bg-amber-100 border-b-2 border-amber-200 px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <div className="text-left">
                    <h2 className="text-xs sm:text-sm font-extrabold text-amber-800 tracking-wide uppercase">
                      Math Adventure Rulebook
                    </h2>
                    <span className="text-[9px] text-amber-600 font-bold font-mono">
                      LEARNING IS YOUR SUPERPOWER! ⭐
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowRulesModal(false); sounds.tap(); }}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 border-2 border-amber-300 hover:border-rose-400 text-amber-600 hover:text-rose-500 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)] text-left custom-scrollbar">
                
                {/* 1. Difficulties */}
                <div className="bg-amber-50/50 rounded-2xl border-2 border-amber-100 p-3.5 space-y-2.5">
                  <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1">
                    <span>🌈</span> WORLD DIFFICULTIES & PROBLEMS
                  </h3>
                  
                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-600 font-medium whitespace-normal">
                    <p className="pl-3 border-l-2 border-emerald-400">
                      <strong className="text-emerald-600">🌱 EASY WORLD:</strong> Addition and subtraction only (no multiplication until Level 4+). Single digits for Levels 1–2, double digits for Level 3+. Perfect for young heroes to build absolute focus and speed!
                    </p>
                    <p className="pl-3 border-l-2 border-amber-400">
                      <strong className="text-amber-600">🌟 NORMAL WORLD:</strong> Starts with basic operations, introduces multiplication at Level 2 using simple tables of <strong>2, 5, and 10</strong> only. Expands to the full 2–12 tables at Level 4+!
                    </p>
                    <p className="pl-3 border-l-2 border-pink-400">
                      <strong className="text-pink-600">🔥 HARD CHALLENGE:</strong> Addition, subtraction, multiplication, and clean quotients (whole number division with no remainders) from Level 2+. Dividend products guarantee clean non-decimal options!
                    </p>
                    <p className="text-[10px] text-slate-400 pl-3 italic">
                      💡 All answers and decoy selections are always positive whole numbers across all worlds and levels.
                    </p>
                  </div>
                </div>

                {/* 2. Scoring System */}
                <div className="bg-sky-50/50 rounded-2xl border-2 border-sky-100 p-3.5 space-y-2.5">
                  <h3 className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-sky-100 pb-1">
                    <span>📈</span> MATHEMATICS SCORING ENGINE
                  </h3>
                  
                  <div className="space-y-2.5 text-[11px] leading-relaxed text-slate-600 font-medium whitespace-normal">
                    <div>
                      <span className="text-emerald-600 font-bold">🌱 Easy Mode Points:</span>
                      <p className="text-[10.5px] text-slate-500 pl-3">
                        Flat <strong>10 points</strong> per correct answer. Streak bonus grants an extra <strong>+2 points</strong> per consecutive correct answer, capped at <strong>+20 bonus points</strong> (reached at a 10-streak combo!).
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-amber-600 font-bold">🌟 Normal Mode Points:</span>
                      <p className="text-[10.5px] text-slate-500 pl-3">
                        Base <strong>15 points</strong>. Combo multiplier multiplies points by <strong>+10% (1.1x)</strong> per consecutive correct answer, up to a maximum multiplier of <strong>2.0x</strong> (double points!) at 10+ streak. Rounded to nearest whole number.
                      </p>
                    </div>

                    <div>
                      <span className="text-pink-600 font-bold">🚀 Hard Mode Points:</span>
                      <p className="text-[10.5px] text-slate-500 pl-3">
                        Base <strong>20 points</strong> scaled by Level Factor (<code>Level × 1.5</code>) and Combo multiplier up to <strong>3.0x</strong> (achieved at a 15-streak!). 
                      </p>
                      <p className="text-[10.5px] text-slate-500 pl-3 mt-1 font-bold text-sky-600">
                        ⚡ Quick Speed Bonus: Grants up to <strong>+10 point bonus</strong> if answered in under 3 seconds! Total score is capped at 100 points maximum per question.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Caution Corner */}
                <div className="bg-rose-50/50 rounded-2xl border-2 border-rose-100 p-3.5 space-y-2">
                  <h3 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100 pb-1">
                    <span>⚠️</span> CAUTION CORNER (MISTAKES)
                  </h3>
                  <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 font-medium pl-1 whitespace-normal">
                    <p>
                      ❌ <strong className="text-slate-700">Combos:</strong> Making a mistake or running out of time resets your answer streak right back to <strong>0</strong> in all worlds!
                    </p>
                    <p>
                      🛡️ <strong className="text-emerald-600">Easy World:</strong> Safe zone! Wrong answers never subtract points.
                    </p>
                    <p>
                      💔 <strong className="text-amber-600">Normal World:</strong> Incorrect answers deduct <strong>5 points</strong> (cannot go below 0).
                    </p>
                    <p>
                      💀 <strong className="text-pink-600">Hard World:</strong> Incorrect answers deduct <strong>10 points</strong> (cannot go below 0).
                    </p>
                  </div>
                </div>

              </div>

              {/* Bubbly Footer */}
              <div className="bg-slate-50 border-t-2 border-slate-100 p-4 text-center shrink-0">
                <button
                  onClick={() => { setShowRulesModal(false); sounds.tap(); }}
                  className="px-8 py-2 bg-emerald-400 text-white font-black text-xs rounded-xl shadow-[0_4px_0px_#10b981] hover:scale-102 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  🚀 LET'S DO SOME MATH!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
