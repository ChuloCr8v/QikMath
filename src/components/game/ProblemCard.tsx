import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useHardInput } from './useHardInput';
import { Keypad } from './Keypad';

export const ProblemCard = () => {
  const { 
    currentProblem, handleAnswer, feedback, difficulty, questionTimeLeft, questionMaxTime 
  } = useGame();

  const hardInput = useHardInput();

  const shakeAnimation = {
    shake: {
      x: [0, -6, 6, -6, 6, -4, 4, 0],
      transition: { duration: 0.3 }
    },
    none: { x: 0 }
  };

  const slots = Array.from({ length: 4 });

  const percentLeft = questionMaxTime > 0 ? (questionTimeLeft / questionMaxTime) * 100 : 0;
  const isOrange = difficulty === 'HARD' ? (percentLeft <= 50) : (percentLeft <= 25);
  const isRed = percentLeft <= 25;
  const isShaking = difficulty === 'HARD' && questionTimeLeft <= 1.5 && questionTimeLeft > 0;

  // Delightful kids pastel button styling
  const getCandyButtonStyle = (index: number) => {
    switch(index) {
      case 0:
        return 'bg-pink-100 hover:bg-pink-200 border-pink-400 text-pink-600 shadow-[0_5px_0px_#f43f5e] active:shadow-none active:translate-y-[5px]';
      case 1:
        return 'bg-sky-100 hover:bg-sky-200 border-sky-400 text-sky-600 shadow-[0_5px_0px_#38bdf8] active:shadow-none active:translate-y-[5px]';
      case 2:
        return 'bg-amber-100 hover:bg-amber-250 border-amber-400 text-amber-700 shadow-[0_5px_0px_#fbbf24] active:shadow-none active:translate-y-[5px]';
      default:
        return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-600 shadow-[0_5px_0px_#34d399] active:shadow-none active:translate-y-[5px]';
    }
  };

  return (
    <div className="w-full bg-[#1e293b] border-8 border-amber-400 p-4 sm:p-6 md:p-10 mb-4 relative rounded-3xl shadow-xl transition-all overflow-hidden z-20">
      <div className="absolute inset-0 bg-white/[0.03] pointer-events-none" />
      <div className="relative z-10 text-center">
        {/* Playful giant characters */}
        <div className="text-5xl sm:text-7xl md:text-8xl font-black text-white flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6 select-none font-mono">
          <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] text-pink-300">{currentProblem.num1}</span>
          <span className="text-amber-400 scale-110 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">{currentProblem.operator}</span>
          <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] text-sky-300">{currentProblem.num2}</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400 animate-bounce">?</span>
        </div>

        {difficulty === 'HARD' && (
          <div className="w-full max-w-[280px] sm:max-w-sm mx-auto mb-5 relative z-20">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>⏱️ CHRONO CHARGE</span>
              <span className={`text-xs font-black ${isRed ? 'text-pink-400 animate-pulse' : isOrange ? 'text-amber-300' : 'text-emerald-300'}`}>
                {questionTimeLeft.toFixed(1)}s
              </span>
            </div>
            <motion.div 
              animate={isShaking ? 'shake' : 'none'}
              variants={shakeAnimation}
              className="w-full h-3 bg-slate-800 border-2 border-slate-700 rounded-full overflow-hidden p-0.5"
            >
              <div 
                style={{ width: `${percentLeft}%` }}
                className={`h-full rounded-full transition-all duration-100 ${
                  isRed 
                    ? 'bg-pink-400 animate-pulse' 
                    : isOrange 
                    ? 'bg-amber-300' 
                    : 'bg-emerald-400'
                }`}
              />
            </motion.div>
          </div>
        )}
        
        {difficulty === 'HARD' ? (
          <div className="flex flex-col items-center">
            {/* Blind Display Strip */}
            <motion.div 
              animate={hardInput.feedbackState === 'blocked' ? 'shake' : 'none'}
              variants={shakeAnimation}
              className="flex justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-6"
            >
              {slots.map((_, i) => {
                const isCurrentCursor = i === hardInput.buffer.length && hardInput.feedbackState === 'idle';
                
                // Blind Input Mode: Only reveal characters if revealed or during certain feedbacks
                const showChar = hardInput.isRevealed || 
                  hardInput.feedbackState === 'correct' || 
                  hardInput.feedbackState === 'wrong' || 
                  hardInput.feedbackState === 'timeout';
                const charToDisplay = showChar ? (hardInput.buffer[i] || '') : '';

                return (
                  <div 
                    key={i} 
                    className={`
                      w-9 h-11 sm:w-12 sm:h-15 border-4 flex items-center justify-center rounded-2xl font-mono text-base sm:text-xl md:text-2xl font-black 
                      ${hardInput.feedbackState === 'correct' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_#10b981]' : ''}
                      ${hardInput.feedbackState === 'wrong' ? 'border-pink-400 bg-pink-500/10 text-pink-400 shadow-[0_0_8px_#f43f5e]' : ''}
                      ${hardInput.feedbackState === 'timeout' ? 'border-amber-400 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_#fbbf24]' : ''}
                      ${hardInput.feedbackState === 'blocked' ? 'border-red-500 bg-red-500/10 text-red-500' : ''}
                      ${hardInput.feedbackState === 'idle' ? 'border-slate-600 text-slate-300 bg-slate-800/80' : ''}
                      transition-all duration-150
                    `}
                  >
                    {charToDisplay ? charToDisplay : isCurrentCursor ? (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-5 sm:h-6 bg-pink-400"
                      />
                    ) : (
                      <span className="text-slate-500 font-bold">_</span>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* Custom Keypad for HARD mode */}
            <Keypad 
              onInput={hardInput.append}
              onDelete={hardInput.backspace}
              onSubmit={hardInput.submit}
            />
          </div>
        ) : (
          /* Multi-colored gumdrop button options for younger playing kids */
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-md mx-auto">
            {currentProblem.options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt)}
                className={`border-4 rounded-2xl p-3 sm:p-4 text-center text-xl sm:text-2xl font-black font-mono tracking-wide cursor-pointer transition-all ${getCandyButtonStyle(i)}`}
              >
                <span className="relative z-10 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">{opt}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-40 p-4 rounded-2xl"
          >
            {feedback.type === 'correct' ? (
              <div className="flex flex-col items-center animate-bounce">
                <div className="text-5xl sm:text-7xl mb-1">⭐</div>
                <div className="text-base sm:text-xl font-bold text-emerald-500 tracking-wide">
                  {feedback.val || 'AWESOME! 🌟'}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Keep it going, Super Kid! 🎉</p>
              </div>
            ) : feedback.val === 'TIMEOUT!' ? (
              <div className="flex flex-col items-center">
                <div className="text-5xl sm:text-7xl mb-1">⏰</div>
                <div className="text-base sm:text-xl font-bold text-amber-500 tracking-wide">TIME OUT!</div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Don't worry, let's keep going!</p>
                {difficulty === 'HARD' && (
                  <div className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 px-3 py-1 rounded-full">
                    Correct answer was: {currentProblem.answer}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-5xl sm:text-7xl mb-1">🧸</div>
                <div className="text-base sm:text-xl font-black text-pink-500 tracking-wide">ALMOST THERE!</div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Perfect learning! Correct: {feedback.answer}</p>
                <div className="text-[10px] font-bold text-sky-400 mt-3 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  Great job practicing! 💪🍀
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
