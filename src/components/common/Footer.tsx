import React from 'react';
import { useGame } from '../../context/GameContext';

export const Footer = () => {
  const { gameState } = useGame();
  const isMinimal = gameState === 'PLAYING';

  return (
    <footer className={`w-full fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isMinimal 
        ? 'py-1 px-4 bg-transparent' 
        : 'py-3 px-4 bg-white/70 backdrop-blur-sm border-t-2 border-amber-200'
    }`}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1">
        {!isMinimal && (
          <div className="text-center md:text-left">
            <h3 className="text-xs font-bold text-sky-400">🎈 Quick Math Adventures for Kids!</h3>
          </div>
        )}

        <div className={`text-center ${isMinimal ? 'w-full' : 'md:text-right'}`}>
          <p className="text-[10px] text-slate-400 tracking-wide font-medium">
            © {new Date().getFullYear()}{' '}
            <a 
              href="https://buildwithclever.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-sky-500 hover:underline font-bold"
            >
              CLEVER
            </a>{' '}
            • Happy Learning! 🍀
          </p>
        </div>
      </div>
    </footer>
  );
};
