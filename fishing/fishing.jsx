const { useState, useEffect, useCallback, useRef } = React;

/**
 * HONEY FISHING - A complete fishing mini-game
 *
 * Gameplay Phases:
 * 1. Cast: Power meter sets distance (affects which fish you can catch)
 * 2. Wait: Random bite time (3-15 seconds) - patience is key
 * 3. Hook: Tap when "!" appears (tight timing window)
 * 4. Reel: Rhythm taps to reel in while balancing tension
 *
 * Progression: 10 opponents, 10 levels each, 4 points = 1 star, 40 to master
 */

const Fishing = () => {
    // Theme - Dodger Blue accent
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#1e90ff', accentBright: '#4db8ff',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        water: '#1e4a6a', waterDeep: '#0a2a4a'
    };

    // Fish types with point values and catch difficulty
    const fishTypes = [
        { id: 'minnow', name: 'Minnow', emoji: '🐟', points: 1, depth: 'shallow', fight: 0.2, rarity: 0.35 },
        { id: 'bass', name: 'Bass', emoji: '🐟', points: 2, depth: 'shallow', fight: 0.4, rarity: 0.25 },
        { id: 'trout', name: 'Rainbow Trout', emoji: '🐠', points: 3, depth: 'medium', fight: 0.5, rarity: 0.2 },
        { id: 'salmon', name: 'Salmon', emoji: '🐡', points: 4, depth: 'medium', fight: 0.6, rarity: 0.12 },
        { id: 'catfish', name: 'Catfish', emoji: '🐟', points: 5, depth: 'deep', fight: 0.7, rarity: 0.05 },
        { id: 'pike', name: 'Northern Pike', emoji: '🐠', points: 6, depth: 'deep', fight: 0.8, rarity: 0.02 },
        { id: 'golden', name: 'Golden Fish', emoji: '✨', points: 10, depth: 'any', fight: 0.9, rarity: 0.008 },
        { id: 'boot', name: 'Old Boot', emoji: '👢', points: 0, depth: 'any', fight: 0.1, rarity: 0.002 }
    ];

    // Opponents - each introduces new fishing mechanics/challenges
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            taunt: "Ribbit! Let's fish!",
            winQuote: "Great catch, friend!",
            loseQuote: "Ribbit... nice fishing!",
            mechanic: 'Basic fishing - learn the rhythm',
            gimmick: 'none',
            hookWindow: 1.5, tensionDecay: 0.3, biteTimeRange: [4, 10]
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            taunt: "Bawk! My fish are feisty!",
            winQuote: "Cluck cluck... you win!",
            loseQuote: "Winner winner!",
            mechanic: 'Faster bites - be ready!',
            gimmick: 'fast_bites',
            hookWindow: 1.2, tensionDecay: 0.4, biteTimeRange: [2, 7]
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            taunt: "Fish to the beat, baby!",
            winQuote: "Groovy moves!",
            loseQuote: "You got the rhythm!",
            mechanic: 'Rhythm reeling - tap on the beat!',
            gimmick: 'rhythm_reel',
            hookWindow: 1.3, tensionDecay: 0.35, biteTimeRange: [3, 9]
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            taunt: "Found some junk for ya!",
            winQuote: "Back to the bins...",
            loseQuote: "One fish's trash!",
            mechanic: 'More junk items - watch out!',
            gimmick: 'junk_items',
            hookWindow: 1.2, tensionDecay: 0.4, biteTimeRange: [3, 10]
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            taunt: "Shocking catches await!",
            winQuote: "Zapped...",
            loseQuote: "Electrifying!",
            mechanic: 'Tension surges - manage the spikes!',
            gimmick: 'tension_surges',
            hookWindow: 1.1, tensionDecay: 0.45, biteTimeRange: [3, 8]
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            taunt: "Fish in the shadows...",
            winQuote: "Into the darkness...",
            loseQuote: "You found the light!",
            mechanic: 'Hidden depth gauge - feel the distance',
            gimmick: 'hidden_depth',
            hookWindow: 1.0, tensionDecay: 0.4, biteTimeRange: [4, 12]
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            taunt: "Calculate your cast!",
            winQuote: "Well calculated!",
            loseQuote: "A+ fishing!",
            mechanic: 'Precise casting required',
            gimmick: 'precise_cast',
            hookWindow: 0.9, tensionDecay: 0.45, biteTimeRange: [3, 10]
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            taunt: "Sssslippery fish ahead!",
            winQuote: "Ssstolen from me!",
            loseQuote: "Sssmooth catch!",
            mechanic: 'Fish can escape - reel fast!',
            gimmick: 'escape_chance',
            hookWindow: 0.8, tensionDecay: 0.5, biteTimeRange: [2, 8]
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            taunt: "The hunt begins!",
            winQuote: "The pack rests...",
            loseQuote: "AWOOOO!",
            mechanic: 'Aggressive fish - high tension battles',
            gimmick: 'aggressive_fish',
            hookWindow: 0.7, tensionDecay: 0.55, biteTimeRange: [2, 6]
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            taunt: "Face the master angler!",
            winQuote: "Impossible!",
            loseQuote: "A worthy challenger!",
            mechanic: 'All challenges combined!',
            gimmick: 'all_gimmicks',
            hookWindow: 0.6, tensionDecay: 0.6, biteTimeRange: [2, 8]
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Fishing phases: 'cast', 'wait', 'hook', 'reel', 'result'
    const [fishingPhase, setFishingPhase] = useState('cast');

    // Cast state
    const [castPower, setCastPower] = useState(0);
    const [castDirection, setCastDirection] = useState(1);
    const [castDistance, setCastDistance] = useState(0);

    // Wait state
    const [waitTime, setWaitTime] = useState(0);
    const [waitTimer, setWaitTimer] = useState(0);
    const [fishBiting, setFishBiting] = useState(false);

    // Hook state
    const [hookTimer, setHookTimer] = useState(0);
    const [hookSuccess, setHookSuccess] = useState(false);
    const [currentFish, setCurrentFish] = useState(null);

    // Reel state
    const [reelProgress, setReelProgress] = useState(0);
    const [tension, setTension] = useState(50);
    const [fishFight, setFishFight] = useState(0);
    const [reelBeatPhase, setReelBeatPhase] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [tapOnBeat, setTapOnBeat] = useState(false);

    // Round state
    const [roundScore, setRoundScore] = useState(0);
    const [castsRemaining, setCastsRemaining] = useState(5);
    const [caughtFish, setCaughtFish] = useState([]);
    const [roundResult, setRoundResult] = useState(null);

    // Animation refs
    const animationRef = useRef(null);
    const waitTimerRef = useRef(null);
    const hookTimerRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('fishing_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('fishing_progression_v1', JSON.stringify(progression));
    }, [progression]);

    // Helper functions
    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Get difficulty based on opponent and level
    const getDifficulty = useCallback((oppIdx, level) => {
        const opp = opponents[oppIdx];
        const base = oppIdx * 0.06 + (level - 1) * 0.012;

        return {
            hookWindow: Math.max(0.4, opp.hookWindow - base * 0.3),
            tensionDecay: opp.tensionDecay + base * 0.15,
            biteTimeMin: Math.max(1, opp.biteTimeRange[0] - level * 0.2),
            biteTimeMax: Math.max(3, opp.biteTimeRange[1] - level * 0.3),
            fishFightMultiplier: 1 + base * 0.8,
            targetScore: 8 + oppIdx * 2 + level,
        };
    }, []);

    // Determine which fish bites based on cast distance
    const selectFish = useCallback((distance, oppIdx) => {
        const opp = opponents[oppIdx];
        let availableFish = [...fishTypes];

        // Determine depth based on cast distance
        let depth = 'shallow';
        if (distance > 70) depth = 'deep';
        else if (distance > 40) depth = 'medium';

        // Filter fish by depth (except 'any' depth fish)
        availableFish = availableFish.filter(f => f.depth === depth || f.depth === 'any');

        // Raccoon gimmick - more junk
        if (opp.gimmick === 'junk_items' || opp.gimmick === 'all_gimmicks') {
            if (Math.random() < 0.15) {
                return fishTypes.find(f => f.id === 'boot');
            }
        }

        // Random selection based on rarity
        const totalRarity = availableFish.reduce((sum, f) => sum + f.rarity, 0);
        let roll = Math.random() * totalRarity;

        for (const fish of availableFish) {
            roll -= fish.rarity;
            if (roll <= 0) return fish;
        }

        return availableFish[0];
    }, []);

    // Cast power meter animation
    useEffect(() => {
        if (fishingPhase !== 'cast' || gameState !== 'playing') return;

        const interval = setInterval(() => {
            setCastPower(p => {
                let newP = p + castDirection * 2;
                if (newP >= 100) {
                    setCastDirection(-1);
                    newP = 100;
                } else if (newP <= 0) {
                    setCastDirection(1);
                    newP = 0;
                }
                return newP;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [fishingPhase, gameState, castDirection]);

    // Wait phase timer
    useEffect(() => {
        if (fishingPhase !== 'wait' || gameState !== 'playing') return;

        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);

        waitTimerRef.current = setInterval(() => {
            setWaitTimer(t => {
                const newT = t + 0.1;
                if (newT >= waitTime) {
                    setFishBiting(true);
                    clearInterval(waitTimerRef.current);

                    // Start hook phase with timer
                    setFishingPhase('hook');
                    setHookTimer(diff.hookWindow);
                }
                return newT;
            });
        }, 100);

        return () => clearInterval(waitTimerRef.current);
    }, [fishingPhase, gameState, waitTime, selectedOpponent, currentLevel, getDifficulty]);

    // Hook phase countdown
    useEffect(() => {
        if (fishingPhase !== 'hook' || gameState !== 'playing') return;

        hookTimerRef.current = setInterval(() => {
            setHookTimer(t => {
                const newT = t - 0.05;
                if (newT <= 0) {
                    // Missed the hook!
                    clearInterval(hookTimerRef.current);
                    setFishBiting(false);
                    setFishingPhase('cast');
                    setCastsRemaining(c => c - 1);
                    setCastPower(0);
                }
                return Math.max(0, newT);
            });
        }, 50);

        return () => clearInterval(hookTimerRef.current);
    }, [fishingPhase, gameState]);

    // Reel phase animation
    useEffect(() => {
        if (fishingPhase !== 'reel' || gameState !== 'playing' || !currentFish) return;

        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);

        const interval = setInterval(() => {
            // Beat phase for rhythm fishing (Disco Dinosaur)
            setReelBeatPhase(p => (p + 0.08) % (Math.PI * 2));

            // Fish fighting - pulls back on reel progress
            const fightStrength = currentFish.fight * diff.fishFightMultiplier;

            // Aggressive fish gimmick (Wolf)
            const aggressiveMod = (opp.gimmick === 'aggressive_fish' || opp.gimmick === 'all_gimmicks')
                ? 1.5 + Math.random() * 0.5 : 1;

            setFishFight(fightStrength * aggressiveMod * (0.5 + Math.random() * 0.5));

            // Tension decay
            setTension(t => {
                let newT = t - diff.tensionDecay;

                // Tension surges (Electric Eel)
                if ((opp.gimmick === 'tension_surges' || opp.gimmick === 'all_gimmicks') && Math.random() < 0.02) {
                    newT += 25;
                }

                return Math.max(0, Math.min(100, newT));
            });

            // Reel progress decay from fish fight
            setReelProgress(p => {
                let newP = p - fightStrength * 0.3 * aggressiveMod;

                // Escape chance (Sly Snake)
                if ((opp.gimmick === 'escape_chance' || opp.gimmick === 'all_gimmicks') && Math.random() < 0.005) {
                    newP -= 15;
                }

                return Math.max(0, newP);
            });

            // Check win/lose conditions
            if (tension <= 0) {
                // Line snapped!
                setFishingPhase('result');
                setRoundResult({ type: 'line_snap', fish: currentFish });
            } else if (tension >= 100) {
                // Too much tension - fish escaped!
                setFishingPhase('result');
                setRoundResult({ type: 'escaped', fish: currentFish });
            }
        }, 50);

        return () => clearInterval(interval);
    }, [fishingPhase, gameState, currentFish, selectedOpponent, currentLevel, getDifficulty]);

    // Check reel completion
    useEffect(() => {
        if (fishingPhase === 'reel' && reelProgress >= 100) {
            // Fish caught!
            setFishingPhase('result');
            setRoundResult({ type: 'caught', fish: currentFish });
        }
    }, [fishingPhase, reelProgress, currentFish]);

    // Handle result and move to next cast
    useEffect(() => {
        if (fishingPhase !== 'result' || !roundResult) return;

        const timer = setTimeout(() => {
            if (roundResult.type === 'caught') {
                setRoundScore(s => s + roundResult.fish.points);
                setCaughtFish(f => [...f, roundResult.fish]);
            }

            setCastsRemaining(c => c - 1);

            // Reset for next cast
            setFishBiting(false);
            setHookSuccess(false);
            setCurrentFish(null);
            setReelProgress(0);
            setTension(50);
            setCastPower(0);
            setCastDistance(0);
            setWaitTimer(0);
            setRoundResult(null);
            setFishingPhase('cast');
        }, 1500);

        return () => clearTimeout(timer);
    }, [fishingPhase, roundResult]);

    // Check end of round (all casts used)
    useEffect(() => {
        if (castsRemaining <= 0 && fishingPhase === 'cast' && gameState === 'playing') {
            const opp = selectedOpponent;
            const diff = getDifficulty(opp.id, currentLevel);

            setTimeout(() => {
                const won = roundScore >= diff.targetScore;
                if (won) {
                    const points = roundScore >= diff.targetScore * 1.5 ? 2 : 1;
                    setProgression(prev => {
                        const newPoints = [...prev.starPoints];
                        newPoints[opp.id] = Math.min(40, newPoints[opp.id] + points);
                        return { ...prev, starPoints: newPoints };
                    });
                }
                setGameState('round_end');
            }, 500);
        }
    }, [castsRemaining, fishingPhase, gameState, roundScore, selectedOpponent, currentLevel, getDifficulty]);

    // Handle player input
    const handleAction = useCallback(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);

        switch (fishingPhase) {
            case 'cast':
                // Lock in cast power and start wait phase
                setCastDistance(castPower);
                setFishingPhase('wait');

                // Determine wait time
                const waitDuration = diff.biteTimeMin + Math.random() * (diff.biteTimeMax - diff.biteTimeMin);
                setWaitTime(waitDuration);
                setWaitTimer(0);

                // Select the fish that will bite
                const fish = selectFish(castPower, opp.id);
                setCurrentFish(fish);
                break;

            case 'hook':
                // Player hooked the fish!
                clearInterval(hookTimerRef.current);
                setHookSuccess(true);
                setFishBiting(false);
                setFishingPhase('reel');
                setReelProgress(0);
                setTension(50);
                break;

            case 'reel':
                // Reel in - balance tension
                const now = Date.now();
                const timeSinceLastTap = now - lastTapTime;
                setLastTapTime(now);

                // Rhythm bonus (Disco Dinosaur)
                const beatValue = Math.sin(reelBeatPhase);
                const onBeat = beatValue > 0.7;
                setTapOnBeat(onBeat);

                let reelAmount = 3;
                let tensionAdd = 8;

                if ((opp.gimmick === 'rhythm_reel' || opp.gimmick === 'all_gimmicks') && onBeat) {
                    reelAmount *= 2;
                    tensionAdd *= 0.5;
                }

                // Fast tapping increases tension more
                if (timeSinceLastTap < 200) {
                    tensionAdd *= 1.5;
                }

                setReelProgress(p => Math.min(100, p + reelAmount));
                setTension(t => Math.min(100, t + tensionAdd));
                break;
        }
    }, [gameState, fishingPhase, castPower, selectedOpponent, currentLevel, getDifficulty, selectFish, reelBeatPhase, lastTapTime]);

    // Keyboard/touch handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleAction();
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    setGameState('select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleAction, gameState]);

    // Start a match
    const startMatch = (opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setFishingPhase('cast');
        setCastPower(0);
        setCastDirection(1);
        setCastDistance(0);
        setWaitTimer(0);
        setFishBiting(false);
        setHookSuccess(false);
        setCurrentFish(null);
        setReelProgress(0);
        setTension(50);
        setRoundScore(0);
        setCastsRemaining(5);
        setCaughtFish([]);
        setRoundResult(null);
        setGameState('playing');
    };

    // Star bar component
    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{
                    width: '12px', height: '12px',
                    background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark,
                    borderRadius: '2px',
                    border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`
                }} />
            ))}
        </div>
    );

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.water} 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🎣</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>HONEY FISHING</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Cast, wait, hook, and reel!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(30, 144, 255, 0.4)'
                    }}
                >
                    PLAY
                </button>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>Back to Menu</a>

                <div style={{
                    marginTop: '40px', padding: '20px',
                    background: theme.bgPanel, borderRadius: '10px',
                    maxWidth: '400px', textAlign: 'left'
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '10px' }}>How to Play</h3>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: 1.6 }}>
                        <p><strong>1. Cast:</strong> Press SPACE to set power - distance affects fish types!</p>
                        <p><strong>2. Wait:</strong> Watch for the fish to bite...</p>
                        <p><strong>3. Hook:</strong> Press SPACE when "!" appears - timing is tight!</p>
                        <p><strong>4. Reel:</strong> Tap rhythmically to reel in. Balance the tension!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Opponent select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.water} 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Opponent</h2>
                    <div style={{ width: '80px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '15px', maxWidth: '1200px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isOpponentUnlocked(idx);
                        const mastered = isOpponentMastered(idx);

                        return (
                            <div
                                key={opp.id}
                                onClick={() => {
                                    if (unlocked) {
                                        setSelectedOpponent(opp);
                                        setGameState('level_select');
                                    }
                                }}
                                style={{
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? opp.color : theme.border}`,
                                    borderRadius: '12px', padding: '15px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'transform 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {!unlocked && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>🔒</div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.success, padding: '2px 8px',
                                        borderRadius: '10px', fontSize: '12px'
                                    }}>MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '48px', width: '70px', height: '70px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}33`, borderRadius: '50%'
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: opp.color }}>
                                            {opp.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '5px' }}>
                                            {opp.title}
                                        </div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            background: `${opp.color}22`, padding: '4px 8px',
                                            borderRadius: '4px', marginBottom: '8px'
                                        }}>
                                            🎣 {opp.mechanic}
                                        </div>
                                        <StarBar points={progression.starPoints[idx]} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Level select screen
    if (gameState === 'level_select' && selectedOpponent) {
        const currentStars = getStars(selectedOpponent.id);

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`,
                padding: '20px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'transparent', border: `1px solid ${theme.border}`,
                    color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                }}>Back</button>

                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>
                <p style={{
                    color: theme.textSecondary, fontStyle: 'italic',
                    marginTop: '10px', fontSize: '14px'
                }}>"{selectedOpponent.taunt}"</p>

                <div style={{
                    marginTop: '15px', padding: '10px 20px',
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    color: theme.textSecondary
                }}>
                    🎣 {selectedOpponent.mechanic}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Select Level</h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '10px', maxWidth: '400px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '60px', height: '60px',
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '10px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '20px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5
                                }}
                            >
                                {unlocked ? levelNum : '🔒'}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Main playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);
        const showDepth = opp.gimmick !== 'hidden_depth' && opp.gimmick !== 'all_gimmicks';

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: `linear-gradient(180deg, #1a2a4a 0%, ${theme.water} 30%, ${theme.waterDeep} 100%)`,
                    display: 'flex', flexDirection: 'column',
                    color: theme.text, userSelect: 'none'
                }}
                onClick={handleAction}
                onTouchStart={(e) => { e.preventDefault(); handleAction(); }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '15px 20px', background: 'rgba(0,0,0,0.3)'
                }}>
                    <div>
                        <span style={{ fontSize: '14px', color: theme.textMuted }}>Level {currentLevel}</span>
                        <span style={{ marginLeft: '15px', color: opp.color }}>{opp.emoji} {opp.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>Score: <span style={{ color: theme.gold, fontWeight: 'bold' }}>{roundScore}</span>/<span style={{ color: theme.textMuted }}>{diff.targetScore}</span></div>
                        <div>Casts: <span style={{ color: theme.accent }}>{castsRemaining}</span></div>
                    </div>
                </div>

                {/* Main fishing area */}
                <div style={{
                    flex: 1, position: 'relative', display: 'flex',
                    flexDirection: 'column', alignItems: 'center',
                    padding: '20px', minHeight: '400px'
                }}>
                    {/* Water surface line */}
                    <div style={{
                        position: 'absolute', top: '30%', left: 0, right: 0,
                        height: '3px', background: `linear-gradient(90deg, transparent, ${theme.accentBright}, transparent)`,
                        opacity: 0.5
                    }} />

                    {/* Dock/Shore */}
                    <div style={{
                        position: 'absolute', left: '5%', top: '20%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '50px' }}>🐻</div>
                        <div style={{
                            width: '80px', height: '15px', background: '#8b4513',
                            borderRadius: '3px', marginTop: '-10px'
                        }} />
                    </div>

                    {/* Fishing line visualization */}
                    {(fishingPhase === 'wait' || fishingPhase === 'hook' || fishingPhase === 'reel') && (
                        <svg style={{
                            position: 'absolute', top: '20%', left: '10%',
                            width: '80%', height: '60%', pointerEvents: 'none'
                        }}>
                            <line
                                x1="0" y1="50"
                                x2={`${castDistance * 0.8}%`} y2={fishingPhase === 'reel' ? `${70 - reelProgress * 0.5}%` : '70%'}
                                stroke={theme.textMuted}
                                strokeWidth="2"
                                strokeDasharray={fishingPhase === 'reel' ? '5,5' : 'none'}
                            />
                            {/* Bobber */}
                            <circle
                                cx={`${castDistance * 0.8}%`}
                                cy={fishingPhase === 'reel' ? `${70 - reelProgress * 0.5}%` : '70%'}
                                r="8"
                                fill={fishBiting ? theme.error : theme.accent}
                                style={{
                                    animation: fishBiting ? 'bob 0.2s infinite' : 'none'
                                }}
                            />
                        </svg>
                    )}

                    {/* Fish under water (during reel) */}
                    {fishingPhase === 'reel' && currentFish && (
                        <div style={{
                            position: 'absolute',
                            left: `${10 + castDistance * 0.6}%`,
                            top: `${80 - reelProgress * 0.4}%`,
                            fontSize: '40px',
                            transform: `scaleX(-1) rotate(${fishFight * 20}deg)`,
                            transition: 'top 0.1s'
                        }}>
                            {currentFish.emoji}
                        </div>
                    )}

                    {/* Phase-specific UI */}
                    <div style={{
                        position: 'absolute', bottom: '20%', left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center', width: '90%', maxWidth: '400px'
                    }}>
                        {/* CAST PHASE */}
                        {fishingPhase === 'cast' && (
                            <div>
                                <div style={{ fontSize: '24px', marginBottom: '15px', color: theme.accent }}>
                                    CAST YOUR LINE
                                </div>

                                {/* Power meter */}
                                <div style={{
                                    height: '40px', background: theme.bgDark,
                                    borderRadius: '20px', position: 'relative',
                                    overflow: 'hidden', border: `2px solid ${theme.border}`
                                }}>
                                    {/* Depth zones */}
                                    {showDepth && (
                                        <>
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%',
                                                background: 'rgba(100, 200, 100, 0.2)',
                                                borderRight: '1px solid rgba(100, 200, 100, 0.5)'
                                            }} />
                                            <div style={{
                                                position: 'absolute', left: '40%', top: 0, bottom: 0, width: '30%',
                                                background: 'rgba(100, 150, 200, 0.2)',
                                                borderRight: '1px solid rgba(100, 150, 200, 0.5)'
                                            }} />
                                            <div style={{
                                                position: 'absolute', left: '70%', top: 0, bottom: 0, width: '30%',
                                                background: 'rgba(100, 100, 180, 0.2)'
                                            }} />
                                        </>
                                    )}

                                    {/* Power indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        left: `${castPower}%`, top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '6px', height: '50px',
                                        background: theme.accent,
                                        borderRadius: '3px',
                                        boxShadow: `0 0 10px ${theme.accent}`
                                    }} />
                                </div>

                                {showDepth && (
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        marginTop: '5px', fontSize: '11px', color: theme.textMuted
                                    }}>
                                        <span>Shallow</span>
                                        <span>Medium</span>
                                        <span>Deep</span>
                                    </div>
                                )}

                                <div style={{ marginTop: '20px', color: theme.textSecondary }}>
                                    Press SPACE or tap to cast!
                                </div>
                            </div>
                        )}

                        {/* WAIT PHASE */}
                        {fishingPhase === 'wait' && (
                            <div>
                                <div style={{ fontSize: '24px', marginBottom: '15px', color: theme.textMuted }}>
                                    Waiting for a bite...
                                </div>

                                <div style={{ fontSize: '48px', animation: 'float 2s ease-in-out infinite' }}>
                                    🎣
                                </div>

                                <div style={{
                                    marginTop: '15px', color: theme.textMuted,
                                    fontSize: '14px'
                                }}>
                                    Cast distance: {Math.round(castDistance)}%
                                </div>
                            </div>
                        )}

                        {/* HOOK PHASE */}
                        {fishingPhase === 'hook' && (
                            <div style={{ animation: 'shake 0.1s infinite' }}>
                                <div style={{
                                    fontSize: '80px', color: theme.error,
                                    textShadow: `0 0 20px ${theme.error}`,
                                    animation: 'pulse 0.3s infinite'
                                }}>
                                    !
                                </div>

                                <div style={{
                                    fontSize: '28px', color: theme.gold,
                                    fontWeight: 'bold', marginTop: '10px'
                                }}>
                                    HOOK IT NOW!
                                </div>

                                {/* Timer bar */}
                                <div style={{
                                    height: '10px', background: theme.bgDark,
                                    borderRadius: '5px', marginTop: '15px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(hookTimer / getDifficulty(opp.id, currentLevel).hookWindow) * 100}%`,
                                        background: hookTimer < 0.3 ? theme.error : theme.success,
                                        transition: 'width 0.05s linear'
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* REEL PHASE */}
                        {fishingPhase === 'reel' && currentFish && (
                            <div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '15px'
                                }}>
                                    <span style={{ color: theme.textSecondary }}>
                                        {currentFish.emoji} {currentFish.name}
                                    </span>
                                    <span style={{ color: theme.gold }}>
                                        +{currentFish.points} pts
                                    </span>
                                </div>

                                {/* Tension meter */}
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        fontSize: '12px', color: theme.textMuted, marginBottom: '3px'
                                    }}>
                                        <span>Tension</span>
                                        <span style={{
                                            color: tension > 80 ? theme.error : tension < 20 ? theme.error : theme.success
                                        }}>
                                            {tension < 20 ? 'TOO LOW!' : tension > 80 ? 'TOO HIGH!' : 'Good'}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '20px', background: theme.bgDark,
                                        borderRadius: '10px', position: 'relative',
                                        overflow: 'hidden', border: `2px solid ${theme.border}`
                                    }}>
                                        {/* Safe zone */}
                                        <div style={{
                                            position: 'absolute', left: '20%', width: '60%',
                                            top: 0, bottom: 0,
                                            background: 'rgba(80, 200, 120, 0.2)'
                                        }} />
                                        {/* Tension level */}
                                        <div style={{
                                            position: 'absolute',
                                            left: `${tension}%`, top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '8px', height: '30px',
                                            background: tension > 80 || tension < 20 ? theme.error : theme.success,
                                            borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>

                                {/* Reel progress */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        fontSize: '12px', color: theme.textMuted, marginBottom: '3px'
                                    }}>
                                        <span>Reel Progress</span>
                                        <span>{Math.round(reelProgress)}%</span>
                                    </div>
                                    <div style={{
                                        height: '15px', background: theme.bgDark,
                                        borderRadius: '8px', overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%', width: `${reelProgress}%`,
                                            background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`,
                                            transition: 'width 0.1s'
                                        }} />
                                    </div>
                                </div>

                                {/* Rhythm indicator (for Disco Dinosaur) */}
                                {(opp.gimmick === 'rhythm_reel' || opp.gimmick === 'all_gimmicks') && (
                                    <div style={{
                                        display: 'flex', justifyContent: 'center', gap: '10px',
                                        marginBottom: '15px'
                                    }}>
                                        {Array(5).fill(0).map((_, i) => {
                                            const phase = (reelBeatPhase + i * 0.4) % (Math.PI * 2);
                                            const active = Math.sin(phase) > 0.7;
                                            return (
                                                <div key={i} style={{
                                                    width: '20px', height: '20px',
                                                    borderRadius: '50%',
                                                    background: active ? theme.gold : theme.bgDark,
                                                    border: `2px solid ${active ? theme.gold : theme.border}`,
                                                    boxShadow: active ? `0 0 10px ${theme.gold}` : 'none'
                                                }} />
                                            );
                                        })}
                                    </div>
                                )}

                                <div style={{
                                    color: theme.textSecondary, fontSize: '14px',
                                    animation: 'pulse 0.8s infinite'
                                }}>
                                    TAP to reel! Balance tension!
                                </div>
                            </div>
                        )}

                        {/* RESULT PHASE */}
                        {fishingPhase === 'result' && roundResult && (
                            <div style={{ animation: 'pop 0.3s ease-out' }}>
                                {roundResult.type === 'caught' && (
                                    <>
                                        <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                                            {roundResult.fish.emoji}
                                        </div>
                                        <div style={{ fontSize: '24px', color: theme.success }}>
                                            CAUGHT!
                                        </div>
                                        <div style={{ color: theme.gold, fontSize: '20px' }}>
                                            {roundResult.fish.name} +{roundResult.fish.points}
                                        </div>
                                    </>
                                )}
                                {roundResult.type === 'line_snap' && (
                                    <>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>💥</div>
                                        <div style={{ fontSize: '24px', color: theme.error }}>
                                            LINE SNAPPED!
                                        </div>
                                        <div style={{ color: theme.textMuted }}>
                                            Too little tension!
                                        </div>
                                    </>
                                )}
                                {roundResult.type === 'escaped' && (
                                    <>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>💨</div>
                                        <div style={{ fontSize: '24px', color: theme.error }}>
                                            FISH ESCAPED!
                                        </div>
                                        <div style={{ color: theme.textMuted }}>
                                            Too much tension!
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Caught fish display */}
                    {caughtFish.length > 0 && (
                        <div style={{
                            position: 'absolute', bottom: '5%', left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex', gap: '5px', flexWrap: 'wrap',
                            justifyContent: 'center', maxWidth: '300px'
                        }}>
                            {caughtFish.map((fish, i) => (
                                <span key={i} style={{ fontSize: '24px' }} title={fish.name}>
                                    {fish.emoji}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes bob {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                    }
                    @keyframes pop {
                        0% { transform: scale(0.5); opacity: 0; }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Round end screen
    if (gameState === 'round_end') {
        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);
        const won = roundScore >= diff.targetScore;
        const excellent = roundScore >= diff.targetScore * 1.5;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                    {excellent ? '🏆' : won ? '🎣' : '😢'}
                </div>

                <h1 style={{
                    fontSize: '42px',
                    color: excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px'
                }}>
                    {excellent ? 'EXCELLENT CATCH!' : won ? 'GOOD FISHING!' : 'TRY AGAIN'}
                </h1>

                <p style={{
                    color: opp.color, fontStyle: 'italic',
                    fontSize: '16px', marginBottom: '20px'
                }}>
                    {opp.emoji} "{won ? opp.loseQuote : opp.winQuote}"
                </p>

                <div style={{
                    fontSize: '32px', marginBottom: '20px',
                    color: theme.gold
                }}>
                    Score: {roundScore} / {diff.targetScore}
                </div>

                {/* Fish caught summary */}
                {caughtFish.length > 0 && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 25px',
                        borderRadius: '10px', marginBottom: '20px'
                    }}>
                        <div style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '10px' }}>
                            Fish Caught:
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {caughtFish.map((fish, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: theme.bgDark, padding: '5px 10px',
                                    borderRadius: '5px', fontSize: '14px'
                                }}>
                                    <span style={{ fontSize: '20px' }}>{fish.emoji}</span>
                                    <span style={{ color: theme.gold }}>+{fish.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(opp.id)}/10 Stars)
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => startMatch(opp, currentLevel)}
                        style={{
                            padding: '15px 30px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '10px', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            padding: '15px 30px', fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '10px', color: theme.textSecondary,
                            cursor: 'pointer'
                        }}
                    >
                        Level Select
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
