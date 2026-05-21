import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sounds';

export const useHardInput = () => {
  const { currentProblem, questionTimeLeft, difficulty, handleAnswer, feedback } = useGame();
  const [buffer, setBuffer] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong' | 'blocked' | 'timeout'>('idle');
  const [isRevealed, setIsRevealed] = useState(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger blocked shake feedack
  const triggerBlocked = () => {
    sounds.wrong();
    setFeedbackState('blocked');
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackState('idle');
    }, 400);
  };

  const append = (char: string) => {
    if (feedbackState !== 'idle' && feedbackState !== 'blocked') return;

    if (buffer.length >= 4) {
      triggerBlocked();
      return;
    }

    if (char === '-') {
      if (buffer.length === 0) {
        setBuffer('-');
      } else {
        triggerBlocked();
      }
      return;
    }

    if (/^\d$/.test(char)) {
      if (buffer === '0' || buffer === '-0') {
        triggerBlocked();
        return;
      }
      setBuffer((prev) => prev + char);
    }
  };

  const backspace = () => {
    if (feedbackState !== 'idle' && feedbackState !== 'blocked') return;
    setBuffer((prev) => prev.slice(0, -1));
  };

  const clear = () => {
    if (feedbackState !== 'idle' && feedbackState !== 'blocked') return;
    setBuffer('');
  };

  const submit = () => {
    if (feedbackState !== 'idle') return;
    if (buffer === '' || buffer === '-') {
      triggerBlocked();
      return;
    }

    // Blind mode reveal timing (200ms on EXECUTE before feedback triggers)
    setIsRevealed(true);
    setTimeout(() => {
      setIsRevealed(false);

      const isCorrect = parseInt(buffer, 10) === currentProblem.answer;
      if (isCorrect) {
        setFeedbackState('correct');
        handleAnswer(buffer);
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedbackState('idle');
          setBuffer('');
        }, 400);
      } else {
        setFeedbackState('wrong');
        handleAnswer(buffer);
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedbackState('idle');
          setBuffer('');
        }, 400);
      }
    }, 200);
  };

  // Connect global timeouts from GameContext feedback to hook feedbackState
  useEffect(() => {
    if (feedback?.val === 'TIMEOUT!') {
      setFeedbackState('timeout');
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackState('idle');
        setBuffer('');
      }, 400);
    }
  }, [feedback]);

  // Desktop keyboard listeners
  useEffect(() => {
    if (difficulty !== 'HARD') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcut modifiers
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        append(e.key);
      } else if (e.key === '-') {
        e.preventDefault();
        append('-');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, feedbackState, difficulty, currentProblem]);

  return {
    buffer,
    append,
    backspace,
    clear,
    submit,
    feedbackState,
    isRevealed,
  };
};
