import React from 'react';
import { motion } from 'motion/react';

export const BackgroundShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute select-none pointer-events-none"
        initial={{ 
          x: `${Math.random() * 100}%`, 
          y: `${Math.random() * 100}%`,
          opacity: 0.15,
          scale: 0.6 + Math.random() * 0.8,
          rotate: Math.random() * 360
        }}
        animate={{
          x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          rotate: [0, i % 2 === 0 ? 360 : -360],
        }}
        transition={{
          duration: 30 + Math.random() * 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {i % 4 === 0 ? (
          // Sweet Smiling Cloud SVG
          <div className="text-center">
            <svg width="80" height="80" viewBox="0 0 100 80" className="text-sky-300 fill-sky-200">
              <path d="M20 50 A 20 20 0 0 1 40 30 A 25 25 0 0 1 75 35 A 20 20 0 0 1 80 50 A 15 15 0 0 1 70 70 L 30 70 A 15 15 0 0 1 20 50 Z" />
            </svg>
            <div className="text-[10px] mt-1 text-sky-400 font-bold">☁️ Yay!</div>
          </div>
        ) : i % 4 === 1 ? (
          // Happy Glowing Star
          <div className="text-5xl text-amber-300 drop-shadow-[0_4px_6px_rgba(251,191,36,0.2)]">
            ⭐
          </div>
        ) : i % 4 === 2 ? (
          // Fun colorful balloon
          <div className="text-5xl shrink-0">
            {['🎈', '🍭', '🎨', '🧸'][i % 4]}
          </div>
        ) : (
          // Cute friendly math bubble symbols
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold font-mono text-xl ${
            i % 3 === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-400' :
            i % 3 === 1 ? 'bg-pink-50 border-pink-200 text-pink-400' :
            'bg-emerald-50 border-emerald-200 text-emerald-400'
          }`}>
            {['➕', '➖', '✖️', '＝', '✨'][i % 5]}
          </div>
        )}
      </motion.div>
    ))}
  </div>
);
