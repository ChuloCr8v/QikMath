import React from 'react';
import { motion } from 'motion/react';
import { sounds } from '../../lib/sounds';

interface KeypadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onSubmit }) => {
  const keys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '-', '0', '⌫'
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] md:max-w-[280px] mt-2 md:mt-4">
      {keys.map((key) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sounds.tap();
            if (key === '⌫') onDelete();
            else onInput(key);
          }}
          className={`h-11 sm:h-12 md:h-14 rounded-2xl text-base sm:text-lg md:text-xl font-bold transition-all border-2 ${
            key === '⌫'
              ? 'bg-pink-100 text-pink-500 border-pink-300 shadow-[0_3px_0px_#f43f5e] active:shadow-none active:translate-y-[3px]'
              : key === '-'
              ? 'bg-purple-100 text-purple-600 border-purple-300 shadow-[0_3px_0px_#8b5cf6] active:shadow-none active:translate-y-[3px]'
              : 'bg-slate-50 text-slate-755 border-slate-200 shadow-[0_3px_0px_#cbd5e1] hover:bg-slate-100 active:shadow-none active:translate-y-[3px]'
          }`}
        >
          {key}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          sounds.tap();
          onSubmit();
        }}
        className="col-span-3 h-11 sm:h-12 md:h-14 rounded-2xl bg-emerald-400 text-white font-bold text-xs sm:text-sm md:text-base border-2 border-emerald-500 shadow-[0_4px_0px_#10b981] active:shadow-none active:translate-y-[4px] uppercase tracking-wider mt-1 cursor-pointer"
      >
        ✨ SUBMIT ANSWER ✨
      </motion.button>
    </div>
  );
};
