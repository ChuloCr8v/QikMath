import React from 'react';
import { useGame } from '../../context/GameContext';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthButton: React.FC = () => {
  const { user, isAuthLoading, signInWithGoogle, logout } = useGame();

  if (isAuthLoading) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-retro-text/20 animate-pulse bg-retro-text/5" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-mono text-retro-text font-bold uppercase">{user.displayName}</span>
          <button 
            onClick={() => logout()}
            className="text-[8px] font-mono text-retro-pink uppercase hover:underline"
          >
            Signed In
          </button>
        </div>
        <button 
          onClick={() => logout()}
          className="group relative w-10 h-10 flex items-center justify-center bg-retro-bg border-4 border-retro-text hover:bg-retro-pink hover:text-white transition-all shadow-[4px_4px_0px_var(--color-retro-text)]"
          title="Sign Out"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={18} />
          )}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-retro-green border-2 border-retro-text rounded-full" />
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signInWithGoogle()}
      className="flex items-center gap-2 px-4 py-2 bg-retro-cyan text-white font-mono text-xs font-black uppercase border-4 border-retro-text shadow-[4px_4px_0px_var(--color-retro-text)]"
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </motion.button>
  );
};
