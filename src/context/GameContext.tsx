import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, signInWithGoogle as firebaseSignIn, logout as firebaseLogout, handleFirestoreError, OperationType } from '../lib/firebase';
import { Difficulty, GameState, ScoreEntry, Problem, GAME_DURATION, HARD_GAME_DURATION, getLevelTitle, getLevelGoal } from '../types/game';
import { sounds } from '../lib/sounds';

interface GameContextType {
  // Global State
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Auth State
  user: User | null;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Player State
  playerName: string;
  setPlayerName: (name: string) => void;
  playerAvatarSeed: string;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  suggestedName: string;
  
  // Audio
  soundEnabled: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (val: number) => void;
  
  // Game Logic State
  score: number;
  streak: number;
  timeLeft: number;
  questionTimeLeft: number;
  questionMaxTime: number;
  currentProblem: Problem;
  totalAttempts: number;
  correctAnswers: number;
  maxStreak: number;
  feedback: { type: 'correct' | 'wrong', val: string, answer?: number } | null;

  // Levels
  level: number;
  levelCorrectCount: number;
  levelCorrectGoal: number;
  levelTitle: string;
  showLevelUpAlert: { show: boolean; from: number; to: number; bonus: number } | null;
  
  // Game Actions
  startGame: () => void;
  handleAnswer: (val: string | number) => void;
  abortGame: () => void;
  endGame: () => void;
  
  // Data
  leaderboard: ScoreEntry[];
  personalBest: number;
  history: ScoreEntry[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const ATLA_NAMES = [
  'Bluey', 'Bingo', 'Pikachu', 'SpongeBob', 'Chase', 'Marshall', 'Skye', 'Elmo', 
  'Gumball', 'Darwin', 'Patrick', 'Mickey', 'Donald', 'Elsa', 'Anna', 'Olaf', 
  'SpiderMan', 'Peppa', 'Blippi', 'Barbie', 'Simba', 'Minion', 'BugsBunny'
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  //const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('qm_theme') as 'light' | 'dark') || 'dark');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('qm_player_name') || '');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [playerAvatarSeed, setPlayerAvatarSeed] = useState(() => localStorage.getItem('qm_avatar_seed') || 'Bluey');
  const [suggestedName, setSuggestedName] = useState('');

  // Game Progress
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10);
  const [questionMaxTime, setQuestionMaxTime] = useState(10);
  const [currentProblem, setCurrentProblem] = useState<Problem>({ num1: 0, num2: 0, operator: '+', answer: 0, options: [] });
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', val: string, answer?: number } | null>(null);

  // Levels
  const [level, setLevel] = useState(1);
  const [levelCorrectCount, setLevelCorrectCount] = useState(0);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState<{ show: boolean; from: number; to: number; bonus: number } | null>(null);

  const levelCorrectGoal = getLevelGoal(difficulty, level);
  const levelTitle = getLevelTitle(difficulty, level);

  // Persistence
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [personalBestInternal, setPersonalBestInternal] = useState(() => Number(localStorage.getItem('qm_pb')) || 0);
  const [personalBests, setPersonalBests] = useState<Record<Difficulty, number>>(() => ({
    EASY: Number(localStorage.getItem('qm_pb_EASY')) || Number(localStorage.getItem('qm_pb')) || 0,
    NORMAL: Number(localStorage.getItem('qm_pb_NORMAL')) || Number(localStorage.getItem('qm_pb')) || 0,
    HARD: Number(localStorage.getItem('qm_pb_HARD')) || Number(localStorage.getItem('qm_pb')) || 0,
  }));
  const personalBest = personalBests[difficulty];
  const [history, setHistory] = useState<ScoreEntry[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedCurrentResultsRef = useRef(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('qm_theme', newTheme);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync Profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.displayName && !playerName) setPlayerName(data.displayName);
            if (data.avatarSeed) setPlayerAvatarSeed(data.avatarSeed);
            
            const cloudBests = data.personalBests || {};
            setPersonalBests(prev => {
              const updated = {
                EASY: Math.max(prev.EASY, cloudBests.EASY || 0, data.personalBest || 0),
                NORMAL: Math.max(prev.NORMAL, cloudBests.NORMAL || 0, data.personalBest || 0),
                HARD: Math.max(prev.HARD, cloudBests.HARD || 0, data.personalBest || 0),
              };
              localStorage.setItem('qm_pb_EASY', updated.EASY.toString());
              localStorage.setItem('qm_pb_NORMAL', updated.NORMAL.toString());
              localStorage.setItem('qm_pb_HARD', updated.HARD.toString());
              
              const overallBest = Math.max(updated.EASY, updated.NORMAL, updated.HARD);
              setPersonalBestInternal(overallBest);
              localStorage.setItem('qm_pb', overallBest.toString());
              return updated;
            });
          } else {
            // Initialize user doc
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              displayName: playerName || user.displayName || 'Player',
              avatarSeed: playerAvatarSeed,
              personalBest: personalBestInternal,
              personalBests: personalBests,
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error syncing profile:", error);
        }
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [personalBests, playerName, playerAvatarSeed]);

  // Save current score if user logs in on results screen
  useEffect(() => {
    if (user && gameState === 'RESULTS' && score > 0 && !hasSavedCurrentResultsRef.current) {
      hasSavedCurrentResultsRef.current = true;
      
      const finalScore = Math.round(score * 10) / 10;
      const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
      
      const newEntry: ScoreEntry = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName || user.displayName || 'Player',
        score: finalScore,
        difficulty,
        accuracy,
        timestamp: Date.now(),
        avatarSeed: playerAvatarSeed,
        userId: user.uid,
        levelReached: level
      };

      setHistory(prev => {
        const nextHistory = [...prev, newEntry].slice(-50);
        localStorage.setItem('qm_history', JSON.stringify(nextHistory));
        return nextHistory;
      });

      // Update personal best
      const newPbForDiff = Math.max(personalBests[difficulty] || 0, finalScore);
      let updatedBests: Record<Difficulty, number> = { ...personalBests };
      setPersonalBests(prev => {
        const updated = { ...prev, [difficulty]: newPbForDiff };
        updatedBests = updated;
        localStorage.setItem(`qm_pb_${difficulty}`, newPbForDiff.toString());
        const overall = Math.max(updated.EASY, updated.NORMAL, updated.HARD);
        setPersonalBestInternal(overall);
        localStorage.setItem('qm_pb', overall.toString());
        return updated;
      });

      // Save Score to Cloud
      const syncCloudScore = async () => {
        try {
          const overallBest = Math.max(Number(localStorage.getItem('qm_pb')) || 0, finalScore);
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: playerName || user.displayName || 'Player',
            avatarSeed: playerAvatarSeed,
            personalBest: overallBest,
            personalBests: updatedBests,
            updatedAt: serverTimestamp()
          }, { merge: true });

          const scorePayload: any = {
            name: newEntry.name,
            score: newEntry.score,
            difficulty: newEntry.difficulty,
            accuracy: newEntry.accuracy,
            timestamp: newEntry.timestamp,
            avatarSeed: newEntry.avatarSeed,
            levelReached: newEntry.levelReached,
            userId: user.uid
          };
          await addDoc(collection(db, 'scores'), scorePayload);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users-or-scores/${user.uid}`);
        }
      };

      syncCloudScore();
    }
  }, [user, gameState, score, totalAttempts, correctAnswers, difficulty, playerAvatarSeed, playerName, level, history, personalBests]);

  // Leaderboard listener
  useEffect(() => {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(250));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScoreEntry));
      const seen = new Set<string>();
      const deduplicated: ScoreEntry[] = [];
      for (const entry of scores) {
        const difficultySuffix = entry.difficulty ? `_${entry.difficulty}` : '_NORMAL';
        const key = entry.userId 
          ? `id_${entry.userId}${difficultySuffix}` 
          : `name_${entry.name.trim().toLowerCase()}${difficultySuffix}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(entry);
        }
      }
      setLeaderboard(deduplicated);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scores');
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebaseSignIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      setHistory([]);
      localStorage.removeItem('qm_history');
      setPersonalBests({ EASY: 0, NORMAL: 0, HARD: 0 });
      setPersonalBestInternal(0);
      localStorage.removeItem('qm_pb');
      localStorage.removeItem('qm_pb_EASY');
      localStorage.removeItem('qm_pb_NORMAL');
      localStorage.removeItem('qm_pb_HARD');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Sync gameState with URL for deep linking if user refreshes
  useEffect(() => {
    if (location.pathname === '/') setGameState('MENU');
    else if (location.pathname === '/play') setGameState('PLAYING');
    else if (location.pathname === '/results') setGameState('RESULTS');
    else if (location.pathname === '/leaderboard') setGameState('LEADERBOARD');
  }, [location.pathname]);

  // Handle GameState changes -> Navigate
  useEffect(() => {
    if (gameState === 'MENU' && location.pathname !== '/') navigate('/');
    if (gameState === 'PLAYING' && location.pathname !== '/play') navigate('/play');
    if (gameState === 'RESULTS' && location.pathname !== '/results') navigate('/results');
    if (gameState === 'LEADERBOARD' && location.pathname !== '/leaderboard') navigate('/leaderboard');
  }, [gameState]);

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('qm_history') || '[]');
    setHistory(savedScores);

    // Suggest an unused name
    const usedNames = new Set(leaderboard.map(s => s.name.toLowerCase()));
    const unusedNames = ATLA_NAMES.filter(name => !usedNames.has(name.toLowerCase()));
    const finalSelection = unusedNames.length > 0 ? unusedNames[Math.floor(Math.random() * unusedNames.length)] : ATLA_NAMES[Math.floor(Math.random() * ATLA_NAMES.length)];
    setSuggestedName(finalSelection);

    const settings = sounds.getSettings();
    setSoundEnabled(!settings.isMuted);
    setVolume(settings.volume);
  }, [leaderboard]);

  // Main overall match timer (tick every 1s)
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGameRef.current();
            return 0;
          }
          if (prev <= 8 && prev > 0 && difficulty !== 'HARD') {
            sounds.timerAlert();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isPaused, difficulty]);

  // Per-question timer (tick every 100ms) only for HARD mode
  useEffect(() => {
    let questionTimer: NodeJS.Timeout | null = null;
    if (gameState === 'PLAYING' && !isPaused && difficulty === 'HARD') {
      questionTimer = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 0.1) {
            // Hard timeout triggered on current question
            if (questionTimer) clearInterval(questionTimer);
            
            sounds.wrong();
            setStreak(0);
            setTotalAttempts((p) => p + 1);
            setFeedback({ type: 'wrong', val: 'TIMEOUT!' });
            
            // Deduct 10 points in Hard on timeout (floor at 0)
            setScore((currentScore) => Math.max(0, currentScore - 10));

            // After 440ms feedback, load next question
            setTimeout(() => {
              setFeedback(null);
              setLevel((currentLvl) => {
                const nextProblem = generateProblem('HARD', currentLvl);
                setCurrentProblem(nextProblem);
                const nextMaxTime = Math.max(5, 10 - (currentLvl - 1) * 0.5);
                setQuestionMaxTime(nextMaxTime);
                setQuestionTimeLeft(nextMaxTime);
                return currentLvl;
              });
            }, 440);

            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => {
      if (questionTimer) clearInterval(questionTimer);
    };
  }, [gameState, isPaused, difficulty, currentProblem]);

  const generateProblem = (diff: Difficulty, lvl: number): Problem => {
    let n1 = 1;
    let n2 = 1;
    let op: '+' | '-' | '×' | '÷' = '+';

    if (diff === 'EASY') {
      if (lvl <= 2) {
        // Single digits (1-9) for levels 1 and 2
        if (lvl === 1) {
          op = '+';
          n1 = Math.floor(Math.random() * 9) + 1;
          n2 = Math.floor(Math.random() * 9) + 1;
        } else {
          op = Math.random() > 0.5 ? '+' : '-';
          if (op === '-') {
            n1 = Math.floor(Math.random() * 8) + 2; // 2-9
            n2 = Math.floor(Math.random() * (n1 - 1)) + 1; // 1 to n1-1
          } else {
            n1 = Math.floor(Math.random() * 9) + 1;
            n2 = Math.floor(Math.random() * 9) + 1;
          }
        }
      } else if (lvl === 3) {
        // Double digits (10-99), Addition and subtraction only
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '-') {
          n1 = Math.floor(Math.random() * 90) + 10; // 10-99
          n2 = Math.floor(Math.random() * (n1 - 10)) + 10; // 10 to n1-1
        } else {
          n1 = Math.floor(Math.random() * 90) + 10;
          n2 = Math.floor(Math.random() * 90) + 10;
        }
      } else {
        // Level 4+: Addition, subtraction, multiplication
        op = (['+', '-', '×'] as const)[Math.floor(Math.random() * 3)];
        if (op === '×') {
          // Simple kid multiplication (1-10)
          n1 = Math.floor(Math.random() * 10) + 1;
          n2 = Math.floor(Math.random() * 10) + 1;
        } else if (op === '-') {
          n1 = Math.floor(Math.random() * 90) + 10;
          n2 = Math.floor(Math.random() * (n1 - 10)) + 10;
        } else {
          n1 = Math.floor(Math.random() * 90) + 10;
          n2 = Math.floor(Math.random() * 90) + 10;
        }
      }
    } else if (diff === 'NORMAL') {
      if (lvl === 1) {
        // Addition and subtraction (no multiplication)
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '-') {
          n1 = Math.floor(Math.random() * 50) + 11; // 11-60
          n2 = Math.floor(Math.random() * (n1 - 10)) + 10; // 10 to n1-1
        } else {
          n1 = Math.floor(Math.random() * 51) + 10; // 10-60
          n2 = Math.floor(Math.random() * 51) + 10;
        }
      } else if (lvl === 2 || lvl === 3) {
        // Level 2-3: Introduce multiplication with tables of 2, 5, 10 only
        op = (['+', '-', '×'] as const)[Math.floor(Math.random() * 3)];
        if (op === '×') {
          n1 = [2, 5, 10][Math.floor(Math.random() * 3)];
          n2 = Math.floor(Math.random() * 12) + 1;
          if (Math.random() > 0.5) {
            [n1, n2] = [n2, n1];
          }
        } else if (op === '-') {
          n1 = Math.floor(Math.random() * 70) + 11; // 11-80
          n2 = Math.floor(Math.random() * (n1 - 10)) + 10;
        } else {
          n1 = Math.floor(Math.random() * 71) + 10; // 10-80
          n2 = Math.floor(Math.random() * 71) + 10;
        }
      } else {
        // Level 4+: Expand to full tables (2-12)
        op = (['+', '-', '×'] as const)[Math.floor(Math.random() * 3)];
        if (op === '×') {
          n1 = Math.floor(Math.random() * 11) + 2; // 2-12
          n2 = Math.floor(Math.random() * 11) + 2; // 2-12
        } else if (op === '-') {
          n1 = Math.floor(Math.random() * 140) + 11; // 11-150
          n2 = Math.floor(Math.random() * (n1 - 10)) + 10;
        } else {
          n1 = Math.floor(Math.random() * 141) + 10; // 10-150
          n2 = Math.floor(Math.random() * 141) + 10;
        }
      }
    } else {
      // HARD World
      if (lvl === 1) {
        // Level 1: Addition and subtraction only
        op = Math.random() > 0.5 ? '+' : '-';
        if (op === '-') {
          n1 = Math.floor(Math.random() * 280) + 21; // 21-300
          n2 = Math.floor(Math.random() * (n1 - 20)) + 20; // 20 to n1-1
        } else {
          n1 = Math.floor(Math.random() * 281) + 20; // 20-300
          n2 = Math.floor(Math.random() * 281) + 20;
        }
      } else {
        // Level 2+: Allow multiplication and division
        op = (['+', '-', '×', '÷'] as const)[Math.floor(Math.random() * 4)];
        if (op === '÷') {
          // Divisor is 2-12, Quotient is 2-12, Dividend is their product
          n2 = Math.floor(Math.random() * 11) + 2;
          const quotient = Math.floor(Math.random() * 11) + 2;
          n1 = n2 * quotient;
        } else if (op === '×') {
          n1 = Math.floor(Math.random() * 11) + 2; // 2-12
          n2 = Math.floor(Math.random() * 11) + 2;
        } else if (op === '-') {
          n1 = Math.floor(Math.random() * 480) + 21; // 21-500
          n2 = Math.floor(Math.random() * (n1 - 20)) + 20;
        } else {
          n1 = Math.floor(Math.random() * 481) + 20; // 20-500
          n2 = Math.floor(Math.random() * 481) + 20;
        }
      }
    }

    // Solve for correct answer
    let ans = 0;
    if (op === '+') ans = n1 + n2;
    if (op === '-') ans = n1 - n2;
    if (op === '×') ans = n1 * n2;
    if (op === '÷') ans = n1 / n2;

    // Decoy answers must always be positive, within reasonable range, and never duplicate
    const optsSet = new Set<number>();
    optsSet.add(ans);

    const maxOffset = diff === 'EASY' ? 5 : diff === 'NORMAL' ? 10 : 15;

    while (optsSet.size < 4) {
      const offsetSign = Math.random() > 0.5 ? 1 : -1;
      const offsetVal = Math.floor(Math.random() * maxOffset) + 1;
      const fakeAns = ans + (offsetSign * offsetVal);
      if (fakeAns >= 1 && fakeAns !== ans) {
        optsSet.add(fakeAns);
      }
    }
    const options = Array.from(optsSet).sort(() => Math.random() - 0.5);

    return { num1: n1, num2: n2, operator: op, answer: ans, options };
  };

  const startGame = () => {
    hasSavedCurrentResultsRef.current = false;
    const pName = playerName.trim() || 'Player ' + Math.floor(Math.random() * 1000);
    setPlayerName(pName);
    localStorage.setItem('qm_player_name', pName);
    localStorage.setItem('qm_avatar_seed', playerAvatarSeed);
    
    setScore(0);
    setStreak(0);
    setLevel(1);
    setLevelCorrectCount(0);
    setShowLevelUpAlert(null);
    const duration = difficulty === 'HARD' ? HARD_GAME_DURATION : GAME_DURATION;
    setTimeLeft(duration);

    if (difficulty === 'HARD') {
      setQuestionMaxTime(10);
      setQuestionTimeLeft(10);
    } else {
      setQuestionMaxTime(30);
      setQuestionTimeLeft(30);
    }

    setTotalAttempts(0);
    setCorrectAnswers(0);
    setMaxStreak(0);
    setCurrentProblem(generateProblem(difficulty, 1));
    setIsPaused(false);
    setGameState('PLAYING');
    sounds.tap();
  };

  const abortGame = () => {
    setGameState('MENU');
    setIsPaused(false);
    sounds.tap();
  };

  const endGame = async () => {
    setGameState('RESULTS');
    sounds.gameOver();
    
    // Only signed in users should have their scores recorded
    if (user) {
      hasSavedCurrentResultsRef.current = true;
      const finalScore = Math.round(score * 10) / 10;
      const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
      
      const newEntry: ScoreEntry = {
        id: Math.random().toString(36).substr(2, 9),
        name: playerName || 'Anonymous',
        score: finalScore,
        difficulty,
        accuracy,
        timestamp: Date.now(),
        avatarSeed: playerAvatarSeed,
        userId: user.uid,
        levelReached: level
      };

      const newHistory = [...history, newEntry].slice(-50);
      setHistory(newHistory);
      localStorage.setItem('qm_history', JSON.stringify(newHistory));

      // Update Personal Best
      const newPbForDiff = Math.max(personalBests[difficulty] || 0, finalScore);
      let updatedBests: Record<Difficulty, number> = { ...personalBests };
      setPersonalBests(prev => {
        const updated = { ...prev, [difficulty]: newPbForDiff };
        updatedBests = updated;
        localStorage.setItem(`qm_pb_${difficulty}`, newPbForDiff.toString());
        const overall = Math.max(updated.EASY, updated.NORMAL, updated.HARD);
        setPersonalBestInternal(overall);
        localStorage.setItem('qm_pb', overall.toString());
        return updated;
      });

      try {
        const overallBest = Math.max(Number(localStorage.getItem('qm_pb')) || 0, finalScore);
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: playerName || user.displayName || 'Player',
          avatarSeed: playerAvatarSeed,
          personalBest: overallBest,
          personalBests: updatedBests,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }

      // Save Score to Cloud (Only for authenticated users)
      try {
        const scorePayload: any = {
          name: newEntry.name,
          score: newEntry.score,
          difficulty: newEntry.difficulty,
          accuracy: newEntry.accuracy,
          timestamp: newEntry.timestamp,
          avatarSeed: newEntry.avatarSeed,
          levelReached: newEntry.levelReached,
          userId: user.uid
        };
        await addDoc(collection(db, 'scores'), scorePayload);
      } catch (error) {
         handleFirestoreError(error, OperationType.WRITE, 'scores');
      }
    }
  };

  const endGameRef = useRef(endGame);

  // Keep the ref updated with the latest endGame function closure from each render
  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const handleAnswer = (val: string | number) => {
    if (val === '') return;
    const userAns = typeof val === 'string' ? parseInt(val) : val;
    const isCorrect = userAns === currentProblem.answer;

    setTotalAttempts(prev => prev + 1);
    let nextLevel = level;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectAnswers(prev => prev + 1);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      let pointsAdded = 0;
      if (difficulty === 'EASY') {
        // Flat 10 points. Streak bonus adds 2 points per consecutive correct answer, capped at +20 bonus (10-streak)
        const bonus = Math.min(20, newStreak * 2);
        pointsAdded = 10 + bonus;
      } else if (difficulty === 'NORMAL') {
        // Base 15 points. Streak multiplier of 1.1x per consecutive answer, capped at 2x (10-streak). Rounded to nearest whole number.
        const multiplier = Math.min(2.0, 1.0 + newStreak * 0.1);
        pointsAdded = Math.round(15 * multiplier);
      } else {
        // Hard: Base 20 points. Level scalar applies (level * 1.5). Streak multiplier up to 3x (at 15-streak).
        // Time speed bonus grants up to 10 extra points if answered in under 3 seconds. Cap total points per answer at 100
        const levelScalar = level * 1.5;
        const streakMultiplier = Math.min(3.0, 1.0 + (newStreak - 1) * 0.151); // 1.0 + 14 * 0.15 = ~3.0

        // Time speed bonus: up to 10 points if answered in under 3 seconds
        const timeSpent = questionMaxTime - questionTimeLeft;
        const timeBonus = timeSpent < 3 ? Math.max(0, Math.min(10, Math.round(((3 - timeSpent) / 3) * 10))) : 0;

        const rawPoints = (20 * levelScalar * streakMultiplier) + timeBonus;
        pointsAdded = Math.min(100, Math.round(rawPoints));
      }

      setScore(prev => prev + pointsAdded);

      // Handle level up (every 5 correct answers for HARD, levelCorrectGoal for others)
      const nextCorrectCount = levelCorrectCount + 1;
      const levelUpGoal = difficulty === 'HARD' ? 5 : levelCorrectGoal;

      if (nextCorrectCount >= levelUpGoal) {
        nextLevel = level + 1;
        setLevel(nextLevel);
        setLevelCorrectCount(0);

        if (difficulty === 'HARD') {
          sounds.levelUp();
          setShowLevelUpAlert({ show: true, from: level, to: nextLevel, bonus: 15 });
          setTimeout(() => {
            setShowLevelUpAlert(null);
          }, 2500);
        } else {
          const timeBonus = 10;
          setTimeLeft(prev => Math.min(99, prev + timeBonus));
          sounds.levelUp();
          setShowLevelUpAlert({ show: true, from: level, to: nextLevel, bonus: timeBonus });
          setTimeout(() => {
            setShowLevelUpAlert(null);
          }, 2500);
        }
      } else {
        setLevelCorrectCount(nextCorrectCount);
        sounds.correct();
      }

      setFeedback({ type: 'correct', val: `+${pointsAdded}` });

      if (newStreak === 3) sounds.streak3();
      if (newStreak === 5) sounds.streak5();
      if (newStreak === 10) sounds.streak10();
    } else {
      // Wrong answer
      setStreak(0);
      sounds.wrong();

      let deductAmount = 0;
      if (difficulty === 'EASY') {
        deductAmount = 0;
      } else if (difficulty === 'NORMAL') {
        deductAmount = 5;
      } else {
        deductAmount = 10;
      }

      // Subtract score and clamp at 0
      setScore(prev => Math.max(0, prev - deductAmount));

      if (difficulty === 'HARD') {
        const testTimeLeft = questionTimeLeft - 2;
        const isInstantTimeout = testTimeLeft <= 0;

        if (isInstantTimeout) {
          setQuestionTimeLeft(0);
          setFeedback({ type: 'wrong', val: 'TIMEOUT!' });
        } else {
          setQuestionTimeLeft(testTimeLeft);
          setFeedback({ type: 'wrong', val: 'WRONG!', answer: currentProblem.answer });
        }
      } else {
        setFeedback({ type: 'wrong', val: 'WRONG!', answer: currentProblem.answer });
      }
    }

    // Load next question
    setTimeout(() => {
      setFeedback(null);
      if (difficulty === 'HARD') {
        const finalLevel = nextLevel;
        const nextProblem = generateProblem('HARD', finalLevel);
        setCurrentProblem(nextProblem);
        const nextMaxTime = Math.max(5, 10 - (finalLevel - 1) * 0.5);
        setQuestionMaxTime(nextMaxTime);
        setQuestionTimeLeft(nextMaxTime);
      } else {
        setCurrentProblem(generateProblem(difficulty, nextLevel));
      }
    }, 440);
  };

  const toggleMute = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    sounds.setMuted(!newVal);
  };

  const handleLevelVolumeChange = (val: number) => {
    setVolume(val);
    sounds.setVolume(val);
  };

  return (
    <GameContext.Provider value={{
      gameState, setGameState, isSettingsOpen, setIsSettingsOpen, isPaused, setIsPaused,
      theme, toggleTheme,
      user, isAuthLoading, signInWithGoogle, logout,
      playerName, setPlayerName, playerAvatarSeed, difficulty, setDifficulty, suggestedName,
      soundEnabled, volume, toggleMute, setVolume: handleLevelVolumeChange,
      score, streak, timeLeft, questionTimeLeft, questionMaxTime, currentProblem, totalAttempts, correctAnswers, maxStreak, feedback,
      level, levelCorrectCount, levelCorrectGoal, levelTitle, showLevelUpAlert,
      startGame, handleAnswer, abortGame, endGame,
      leaderboard, personalBest, history
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
