const { useState, useEffect, useCallback, useRef, useMemo } = React;

/**
 * JUMP ROPE - Skip Teddy (Enhanced Edition)
 *
 * Design Principles from Commercial Rhythm Games:
 * - Clear Beat Anticipation: Visual markers approach showing when to act
 * - Generous Timing Windows: Early taps are buffered, late taps have grace
 * - Progressive Difficulty: Each level builds on skills, not just faster
 * - Encouraging Feedback: Combos, streaks, and positive reinforcement
 * - Forgiving Failures: Miss tolerance before game over
 * - Satisfying Responsiveness: Instant visual feedback on every input
 */

const JumpRope = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff69b4', accentBright: '#ff89d4',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        perfect: '#00ffff', great: '#00ff00', good: '#ffff00', miss: '#ff4444'
    };

    // Each opponent introduces unique rhythm mechanics with proper difficulty curves
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Steady rhythm - learn the basic beat!',
            baseBPM: 55, maxBPM: 75, // Slower start
            timingWindow: { perfect: 80, great: 150, good: 250 }, // ms windows
            missesAllowed: 5, // Very forgiving
            pattern: 'steady', special: 'none',
            tips: ['Jump when the ring reaches the center!', 'Watch the approaching beat markers']
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Perfect timing gives bonus points!',
            baseBPM: 60, maxBPM: 85,
            timingWindow: { perfect: 70, great: 140, good: 220 },
            missesAllowed: 4,
            pattern: 'steady', special: 'perfect_bonus',
            tips: ['Aim for the cyan "PERFECT" zone!', 'Perfect jumps count as 2 jumps!']
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'Speed gradually increases!',
            baseBPM: 65, maxBPM: 110,
            timingWindow: { perfect: 65, great: 130, good: 200 },
            missesAllowed: 4,
            pattern: 'accelerating', special: 'speed_change',
            tips: ['The rope speeds up slowly - stay focused!', 'Rhythm will gradually increase']
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Some beats are off-rhythm!',
            baseBPM: 70, maxBPM: 95,
            timingWindow: { perfect: 60, great: 120, good: 190 },
            missesAllowed: 4,
            pattern: 'syncopated', special: 'syncopation',
            tips: ['Watch for shifted beat markers!', 'Off-beats appear slightly early or late']
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Double-tap for yellow markers!',
            baseBPM: 70, maxBPM: 100,
            timingWindow: { perfect: 55, great: 115, good: 180 },
            missesAllowed: 3,
            pattern: 'double', special: 'double_jump',
            tips: ['Yellow = tap twice quickly!', 'Blue = single tap']
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Visual guides fade - use the beat!',
            baseBPM: 75, maxBPM: 100,
            timingWindow: { perfect: 55, great: 115, good: 180 },
            missesAllowed: 3,
            pattern: 'steady', special: 'blind',
            tips: ['Listen to the rhythm!', 'Markers fade but audio stays']
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Skip the red markers!',
            baseBPM: 75, maxBPM: 105,
            timingWindow: { perfect: 50, great: 110, good: 170 },
            missesAllowed: 3,
            pattern: 'counting', special: 'patterns',
            tips: ['Red markers = DON\'T jump!', 'Jump only on blue markers']
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Tempo shifts unexpectedly!',
            baseBPM: 80, maxBPM: 115,
            timingWindow: { perfect: 50, great: 100, good: 160 },
            missesAllowed: 3,
            pattern: 'irregular', special: 'irregular',
            tips: ['Watch for tempo changes!', 'The beat shifts every few jumps']
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Double Dutch - alternating ropes!',
            baseBPM: 70, maxBPM: 100,
            timingWindow: { perfect: 50, great: 100, good: 160 },
            missesAllowed: 2,
            pattern: 'double_dutch', special: 'two_ropes',
            tips: ['Two ropes = twice the rhythm!', 'Jump when EITHER rope approaches']
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'Master all challenges combined!',
            baseBPM: 85, maxBPM: 130,
            timingWindow: { perfect: 45, great: 90, good: 150 },
            missesAllowed: 2,
            pattern: 'chaos', special: 'all',
            tips: ['Everything combined!', 'Stay calm and trust your skills']
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [score, setScore] = useState(0);
    const [jumps, setJumps] = useState(0);
    const [targetJumps, setTargetJumps] = useState(30);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [missesLeft, setMissesLeft] = useState(3);
    const [isJumping, setIsJumping] = useState(false);
    const [currentBPM, setCurrentBPM] = useState(60);
    const [perfectCount, setPerfectCount] = useState(0);
    const [greatCount, setGreatCount] = useState(0);
    const [goodCount, setGoodCount] = useState(0);
    const [lastJumpResult, setLastJumpResult] = useState(null);
    const [showVisuals, setShowVisuals] = useState(true);
    const [visualOpacity, setVisualOpacity] = useState(1);
    const [encouragement, setEncouragement] = useState('');

    // Beat tracking system
    const [beats, setBeats] = useState([]); // Approaching beat markers
    const [nextBeatTime, setNextBeatTime] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [inputBuffer, setInputBuffer] = useState(null); // Buffer early inputs

    // Double jump tracking
    const [pendingDoubleJump, setPendingDoubleJump] = useState(false);
    const [lastJumpTime, setLastJumpTime] = useState(0);

    // Refs
    const gameLoopRef = useRef(null);
    const audioContextRef = useRef(null);
    const startTimeRef = useRef(0);
    const lastBeatTimeRef = useRef(0);
    const gameContainerRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('jumprope_progression_v2');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0), highScores: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('jumprope_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Level difficulty scaling
    const getLevelConfig = useCallback((opponent, level) => {
        const baseMisses = opponent.missesAllowed;
        const baseTarget = 15 + opponent.id * 2; // Base jumps needed

        // Level 1-3: Learning phase (generous)
        // Level 4-6: Building phase (moderate)
        // Level 7-10: Mastery phase (challenging)
        const difficultyTier = level <= 3 ? 'learning' : level <= 6 ? 'building' : 'mastery';

        let missesAllowed, targetJumps, bpmMultiplier, timingMultiplier;

        switch (difficultyTier) {
            case 'learning':
                missesAllowed = baseMisses + (3 - level); // More forgiving early
                targetJumps = baseTarget + (level * 3);
                bpmMultiplier = 0.9 + (level * 0.05); // 0.95, 1.0, 1.05
                timingMultiplier = 1.3 - (level * 0.1); // 1.2, 1.1, 1.0 (larger windows)
                break;
            case 'building':
                missesAllowed = baseMisses;
                targetJumps = baseTarget + 9 + ((level - 3) * 4);
                bpmMultiplier = 1.05 + ((level - 3) * 0.08); // 1.13, 1.21, 1.29
                timingMultiplier = 1.0 - ((level - 4) * 0.05); // 0.95, 0.9, 0.85
                break;
            case 'mastery':
                missesAllowed = Math.max(1, baseMisses - 1);
                targetJumps = baseTarget + 21 + ((level - 6) * 5);
                bpmMultiplier = 1.29 + ((level - 6) * 0.1); // 1.39, 1.49, 1.59, 1.69
                timingMultiplier = 0.85 - ((level - 7) * 0.05); // 0.8, 0.75, 0.7, 0.65
                break;
        }

        const adjustedBPM = Math.min(opponent.maxBPM, Math.floor(opponent.baseBPM * bpmMultiplier));
        const adjustedWindows = {
            perfect: Math.floor(opponent.timingWindow.perfect * timingMultiplier),
            great: Math.floor(opponent.timingWindow.great * timingMultiplier),
            good: Math.floor(opponent.timingWindow.good * timingMultiplier)
        };

        return { missesAllowed, targetJumps, bpm: adjustedBPM, timingWindow: adjustedWindows };
    }, []);

    // Play beat sound with pitch variation
    const playSound = useCallback((type = 'beat') => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            switch (type) {
                case 'perfect':
                    osc.frequency.value = 880; // High pitch
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    break;
                case 'great':
                    osc.frequency.value = 660;
                    gain.gain.setValueAtTime(0.12, ctx.currentTime);
                    break;
                case 'good':
                    osc.frequency.value = 440;
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    break;
                case 'miss':
                    osc.frequency.value = 220;
                    osc.type = 'sawtooth';
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    break;
                case 'beat':
                default:
                    osc.frequency.value = 330;
                    gain.gain.setValueAtTime(0.05, ctx.currentTime);
                    break;
                case 'countdown':
                    osc.frequency.value = 550;
                    gain.gain.setValueAtTime(0.12, ctx.currentTime);
                    break;
                case 'start':
                    osc.frequency.value = 880;
                    gain.gain.setValueAtTime(0.15, ctx.currentTime);
                    break;
            }

            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
    }, []);

    // Generate beat pattern based on opponent and level
    const generateBeatPattern = useCallback((opponent, level, startTime) => {
        const config = getLevelConfig(opponent, level);
        const msPerBeat = 60000 / config.bpm;
        const newBeats = [];
        const totalBeats = config.targetJumps + 10; // Extra buffer

        let currentTime = startTime + 3000; // 3 second countdown

        for (let i = 0; i < totalBeats; i++) {
            let beatType = 'single'; // Default
            let timeOffset = 0;

            // Syncopation - some beats are slightly off
            if ((opponent.special === 'syncopation' || opponent.special === 'all') && level > 2) {
                if (i % 4 === 2) {
                    timeOffset = (Math.random() > 0.5 ? 1 : -1) * (msPerBeat * 0.15);
                }
            }

            // Double jumps
            if ((opponent.special === 'double_jump' || opponent.special === 'all') && level > 1) {
                if (i > 3 && i % 5 === 0) {
                    beatType = 'double';
                }
            }

            // Skip patterns (red markers)
            if ((opponent.special === 'patterns' || opponent.special === 'all') && level > 1) {
                if (i > 2 && i % 4 === 3) {
                    beatType = 'skip';
                }
            }

            // Double Dutch - alternating ropes
            if ((opponent.special === 'two_ropes' || opponent.special === 'all') && level > 1) {
                if (i % 2 === 1) {
                    beatType = 'rope2';
                }
            }

            newBeats.push({
                id: i,
                targetTime: currentTime + timeOffset,
                type: beatType,
                hit: false,
                missed: false
            });

            currentTime += msPerBeat;

            // Speed changes for Disco Dinosaur
            if ((opponent.special === 'speed_change' || opponent.special === 'all') && i % 10 === 9) {
                const newBPM = Math.min(config.bpm * 1.3, config.bpm + (i / 10) * 5);
                const newMsPerBeat = 60000 / newBPM;
                currentTime = currentTime; // Adjust to new timing
            }
        }

        return newBeats;
    }, [getLevelConfig]);

    // Start match with countdown
    const startMatch = useCallback((opponent, level) => {
        const config = getLevelConfig(opponent, level);

        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        setJumps(0);
        setCombo(0);
        setMaxCombo(0);
        setIsJumping(false);
        setPerfectCount(0);
        setGreatCount(0);
        setGoodCount(0);
        setLastJumpResult(null);
        setShowVisuals(true);
        setVisualOpacity(1);
        setEncouragement('');
        setInputBuffer(null);
        setPendingDoubleJump(false);
        setLastJumpTime(0);

        setTargetJumps(config.targetJumps);
        setMissesLeft(config.missesAllowed);
        setCurrentBPM(config.bpm);

        const now = Date.now();
        startTimeRef.current = now;
        setGameTime(0);
        setCountdown(3);

        // Generate beats starting after countdown
        const newBeats = generateBeatPattern(opponent, level, now);
        setBeats(newBeats);
        setNextBeatTime(newBeats[0]?.targetTime || 0);

        setGameState('playing');
    }, [getLevelConfig, generateBeatPattern]);

    // Get timing rating for a hit
    const getTimingRating = useCallback((timeDiff, timingWindow) => {
        const absDiff = Math.abs(timeDiff);
        if (absDiff <= timingWindow.perfect) return 'perfect';
        if (absDiff <= timingWindow.great) return 'great';
        if (absDiff <= timingWindow.good) return 'good';
        return 'miss';
    }, []);

    // Show encouragement messages
    const showEncouragement = useCallback((combo, rating) => {
        const messages = {
            perfect: ['AMAZING!', 'INCREDIBLE!', 'FLAWLESS!', 'SUPERB!'],
            great: ['Awesome!', 'Nice!', 'Keep it up!', 'Great rhythm!'],
            good: ['Good!', 'Nice try!', 'Getting there!'],
            combo5: ['5 COMBO!', 'ON FIRE!'],
            combo10: ['10 COMBO!', 'UNSTOPPABLE!'],
            combo20: ['20 COMBO!', 'LEGENDARY!'],
            combo50: ['50 COMBO!', 'GODLIKE!']
        };

        let msg = '';
        if (combo === 50) msg = messages.combo50[Math.floor(Math.random() * messages.combo50.length)];
        else if (combo === 20) msg = messages.combo20[Math.floor(Math.random() * messages.combo20.length)];
        else if (combo === 10) msg = messages.combo10[Math.floor(Math.random() * messages.combo10.length)];
        else if (combo === 5) msg = messages.combo5[Math.floor(Math.random() * messages.combo5.length)];
        else if (rating === 'perfect' && Math.random() < 0.3) {
            msg = messages.perfect[Math.floor(Math.random() * messages.perfect.length)];
        }

        if (msg) {
            setEncouragement(msg);
            setTimeout(() => setEncouragement(''), 800);
        }
    }, []);

    // Handle jump input
    const handleJump = useCallback((e) => {
        // Prevent jump if clicking on UI buttons
        if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
            return;
        }

        if (gameState !== 'playing' || countdown > 0) return;

        const now = Date.now();
        const config = getLevelConfig(selectedOpponent, currentLevel);

        // Check for double jump (quick second tap)
        if (pendingDoubleJump && now - lastJumpTime < 400) {
            setPendingDoubleJump(false);
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 150);
            setJumps(j => j + 1);
            setScore(s => s + 50);
            setCombo(c => {
                const newCombo = c + 1;
                setMaxCombo(m => Math.max(m, newCombo));
                return newCombo;
            });
            playSound('great');
            setLastJumpResult({ rating: 'double', time: now });
            setTimeout(() => setLastJumpResult(null), 400);
            return;
        }

        // Find the closest beat that hasn't been hit
        const activeBeat = beats.find(b => !b.hit && !b.missed);
        if (!activeBeat) return;

        const timeDiff = now - activeBeat.targetTime;
        const rating = getTimingRating(timeDiff, config.timingWindow);

        // Handle skip beats - should NOT jump
        if (activeBeat.type === 'skip') {
            // Player jumped on a skip - that's a miss
            playSound('miss');
            setLastJumpResult({ rating: 'wrong', time: now });
            setCombo(0);
            setMissesLeft(m => m - 1);

            setBeats(prev => prev.map(b =>
                b.id === activeBeat.id ? { ...b, hit: true, missed: true } : b
            ));

            setTimeout(() => setLastJumpResult(null), 400);

            if (missesLeft <= 1) {
                setTimeout(() => setGameState('result'), 500);
            }
            return;
        }

        // Input buffering for early jumps
        if (rating === 'miss' && timeDiff < -config.timingWindow.good) {
            // Too early - buffer the input
            setInputBuffer({ time: now, beatId: activeBeat.id });
            return;
        }

        setLastJumpTime(now);

        // Successful hit
        if (rating !== 'miss') {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 150);

            let points = 0;
            switch (rating) {
                case 'perfect':
                    points = 100;
                    setPerfectCount(c => c + 1);
                    playSound('perfect');
                    break;
                case 'great':
                    points = 75;
                    setGreatCount(c => c + 1);
                    playSound('great');
                    break;
                case 'good':
                    points = 50;
                    setGoodCount(c => c + 1);
                    playSound('good');
                    break;
            }

            // Combo multiplier
            const comboMultiplier = 1 + Math.floor(combo / 10) * 0.1;
            points = Math.floor(points * comboMultiplier);

            setScore(s => s + points);
            setJumps(j => j + (rating === 'perfect' && selectedOpponent.special === 'perfect_bonus' ? 2 : 1));
            setCombo(c => {
                const newCombo = c + 1;
                setMaxCombo(m => Math.max(m, newCombo));
                showEncouragement(newCombo, rating);
                return newCombo;
            });

            setBeats(prev => prev.map(b =>
                b.id === activeBeat.id ? { ...b, hit: true } : b
            ));

            // Setup double jump if needed
            if (activeBeat.type === 'double') {
                setPendingDoubleJump(true);
            }

            setLastJumpResult({ rating, time: now });
            setTimeout(() => setLastJumpResult(null), 400);
        } else {
            // Miss
            playSound('miss');
            setLastJumpResult({ rating: 'miss', time: now });
            setCombo(0);
            setMissesLeft(m => m - 1);

            setBeats(prev => prev.map(b =>
                b.id === activeBeat.id ? { ...b, hit: true, missed: true } : b
            ));

            setTimeout(() => setLastJumpResult(null), 400);

            if (missesLeft <= 1) {
                setTimeout(() => setGameState('result'), 500);
            }
        }
    }, [gameState, countdown, beats, selectedOpponent, currentLevel, combo, missesLeft,
        pendingDoubleJump, lastJumpTime, getLevelConfig, getTimingRating, showEncouragement, playSound]);

    // Main game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        let lastFrameTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTimeRef.current;
            setGameTime(elapsed);

            // Countdown logic
            if (elapsed < 3000) {
                const newCountdown = Math.ceil((3000 - elapsed) / 1000);
                setCountdown(prev => {
                    if (prev !== newCountdown && newCountdown > 0) {
                        playSound('countdown');
                    } else if (prev === 1 && newCountdown === 0) {
                        playSound('start');
                    }
                    return newCountdown;
                });
            } else {
                setCountdown(0);
            }

            // Check for missed beats (passed without hitting)
            const config = getLevelConfig(selectedOpponent, currentLevel);
            setBeats(prev => {
                let missedAny = false;
                const updated = prev.map(b => {
                    if (!b.hit && !b.missed && now > b.targetTime + config.timingWindow.good + 100) {
                        // Skip beats that weren't jumped are OK
                        if (b.type === 'skip') {
                            return { ...b, hit: true }; // Mark as handled (good - didn't jump)
                        }
                        missedAny = true;
                        return { ...b, missed: true };
                    }
                    return b;
                });

                if (missedAny) {
                    playSound('miss');
                    setCombo(0);
                    setMissesLeft(m => {
                        if (m <= 1) {
                            setTimeout(() => setGameState('result'), 300);
                        }
                        return m - 1;
                    });
                }

                return updated;
            });

            // Check input buffer
            if (inputBuffer) {
                const bufferedBeat = beats.find(b => b.id === inputBuffer.beatId);
                if (bufferedBeat && !bufferedBeat.hit) {
                    const timeDiff = now - bufferedBeat.targetTime;
                    if (timeDiff >= -config.timingWindow.good && timeDiff <= config.timingWindow.good) {
                        // Buffer can be used now
                        handleJump({ target: {} });
                        setInputBuffer(null);
                    } else if (timeDiff > config.timingWindow.good) {
                        // Buffer expired
                        setInputBuffer(null);
                    }
                }
            }

            // BPM changes for Disco Dinosaur
            if ((selectedOpponent.special === 'speed_change' || selectedOpponent.special === 'all')) {
                const speedIncrement = Math.floor(elapsed / 8000) * 3;
                const newBPM = Math.min(selectedOpponent.maxBPM, config.bpm + speedIncrement);
                setCurrentBPM(newBPM);
            }

            // Blind mode for Moth
            if ((selectedOpponent.special === 'blind' || selectedOpponent.special === 'all') && currentLevel > 2) {
                const fadeStartTime = 5000 + (10 - currentLevel) * 2000;
                if (elapsed > fadeStartTime) {
                    const fadeCycle = Math.sin(elapsed / 3000) * 0.5 + 0.5;
                    setVisualOpacity(0.3 + fadeCycle * 0.7);
                }
            }

            // Irregular tempo shifts for Snake
            if ((selectedOpponent.special === 'irregular' || selectedOpponent.special === 'all') && currentLevel > 3) {
                const tempoShift = Math.sin(elapsed / 5000) * 8;
                setCurrentBPM(bpm => Math.max(60, config.bpm + tempoShift));
            }

            // Check win condition
            if (jumps >= targetJumps) {
                setGameState('result');
                return;
            }

            gameLoopRef.current = requestAnimationFrame(animate);
        };

        gameLoopRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, selectedOpponent, currentLevel, jumps, targetJumps, inputBuffer,
        beats, getLevelConfig, handleJump, playSound]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = jumps >= targetJumps;
        if (won) {
            // Calculate stars earned (1-3 based on performance)
            const accuracy = (perfectCount * 3 + greatCount * 2 + goodCount) /
                            Math.max(1, perfectCount + greatCount + goodCount + (targetJumps - jumps));
            const comboBonus = maxCombo >= 20 ? 1 : maxCombo >= 10 ? 0.5 : 0;
            const points = Math.min(4, 1 + Math.floor(accuracy) + (comboBonus > 0 ? 1 : 0));

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);

                const newHighScores = [...(prev.highScores || Array(10).fill(0))];
                newHighScores[selectedOpponent.id] = Math.max(newHighScores[selectedOpponent.id] || 0, score);

                return { ...prev, starPoints: newPoints, highScores: newHighScores };
            });
        }
    }, [gameState, jumps, targetJumps, perfectCount, greatCount, goodCount, maxCombo, score, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleJump({ target: {} });
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    cancelAnimationFrame(gameLoopRef.current);
                    setGameState('level_select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };

        const handleClick = (e) => {
            if (gameState === 'playing') {
                handleJump(e);
            }
        };

        const handleTouch = (e) => {
            if (gameState === 'playing') {
                e.preventDefault();
                handleJump({ target: {} });
            }
        };

        window.addEventListener('keydown', handleKey);

        // Only attach click/touch to game container
        const container = gameContainerRef.current;
        if (container) {
            container.addEventListener('click', handleClick);
            container.addEventListener('touchstart', handleTouch, { passive: false });
        }

        return () => {
            window.removeEventListener('keydown', handleKey);
            if (container) {
                container.removeEventListener('click', handleClick);
                container.removeEventListener('touchstart', handleTouch);
            }
        };
    }, [handleJump, gameState]);

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

    // Beat marker component
    const BeatMarker = ({ beat, currentTime, timingWindow }) => {
        const timeUntil = beat.targetTime - currentTime;
        const approachDuration = 1500; // 1.5 seconds to approach

        if (timeUntil > approachDuration || timeUntil < -300) return null;
        if (beat.hit) return null;

        const progress = 1 - (timeUntil / approachDuration);
        const scale = 0.3 + progress * 0.7;
        const opacity = beat.missed ? 0.3 : Math.min(1, progress * 2);

        // Position from outer to center
        const size = 200 - progress * 140; // Shrinks as it approaches

        let color = theme.accent;
        if (beat.type === 'double') color = theme.gold;
        if (beat.type === 'skip') color = theme.error;
        if (beat.type === 'rope2') color = '#00ffaa';

        // Perfect zone highlight
        const isInPerfectZone = Math.abs(timeUntil) < timingWindow.perfect;
        const isInGoodZone = Math.abs(timeUntil) < timingWindow.good;

        if (isInPerfectZone && !beat.hit) color = theme.perfect;
        else if (isInGoodZone && !beat.hit) color = theme.great;

        return (
            <div style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `3px solid ${color}`,
                opacity: opacity * (beat.missed ? 0.3 : 1),
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                boxShadow: isInGoodZone ? `0 0 20px ${color}` : 'none',
                transition: 'box-shadow 0.1s'
            }}>
                {beat.type === 'double' && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: theme.gold,
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>x2</div>
                )}
                {beat.type === 'skip' && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: theme.error,
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }}>✗</div>
                )}
            </div>
        );
    };

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🪢</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>SKIP TEDDY</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px' }}>Jump to the rhythm!</p>
                <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '30px' }}>
                    Enhanced Edition - Now with better timing & feedback!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 4px 20px ${theme.accent}66`
                    }}
                >
                    PLAY
                </button>

                <div style={{
                    marginTop: '40px', padding: '20px',
                    background: theme.bgPanel, borderRadius: '10px',
                    maxWidth: '400px', textAlign: 'center'
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '10px' }}>How to Play</h3>
                    <p style={{ color: theme.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                        🎯 Tap SPACE or CLICK when the ring reaches the center<br/>
                        🌟 Cyan = PERFECT timing for max points<br/>
                        💛 Yellow markers = Tap twice quickly<br/>
                        ❌ Red markers = DON'T jump!<br/>
                        🎵 Build combos for bonus multipliers
                    </p>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '30px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>← Back to Menu</a>
            </div>
        );
    }

    // Opponent select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Your Rhythm Master</h2>
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
                                    if (!unlocked) return;
                                    setSelectedOpponent(opp);
                                    setGameState('level_select');
                                }}
                                style={{
                                    background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})` : theme.bgDark,
                                    border: `2px solid ${unlocked ? opp.color : theme.border}`,
                                    borderRadius: '12px', padding: '15px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    position: 'relative',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    ':hover': unlocked ? { transform: 'scale(1.02)' } : {}
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                        e.currentTarget.style.boxShadow = `0 4px 20px ${opp.color}44`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {!unlocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>🔒</div>}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.success, padding: '2px 8px',
                                        borderRadius: '10px', fontSize: '12px'
                                    }}>✓ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '48px', width: '70px', height: '70px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}33`, borderRadius: '50%'
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: opp.color }}>{opp.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted }}>{opp.title}</div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            background: `${opp.color}22`, padding: '4px 8px',
                                            borderRadius: '4px', margin: '5px 0'
                                        }}>
                                            🎵 {opp.baseBPM}-{opp.maxBPM} BPM • {opp.mechanic}
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
                }}>← Back</button>

                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '15px', padding: '10px 20px',
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div>🎵 {selectedOpponent.mechanic}</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>
                        {selectedOpponent.baseBPM} - {selectedOpponent.maxBPM} BPM • {selectedOpponent.missesAllowed} misses allowed
                    </div>
                </div>

                {selectedOpponent.tips && (
                    <div style={{
                        marginTop: '10px', padding: '10px 15px',
                        background: theme.bgPanel, borderRadius: '8px',
                        fontSize: '12px', color: theme.textSecondary
                    }}>
                        💡 Tips: {selectedOpponent.tips[0]}
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Select Level</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxWidth: '400px' }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;
                        const config = getLevelConfig(selectedOpponent, levelNum);

                        // Difficulty indicator
                        const diffLabel = levelNum <= 3 ? '🟢' : levelNum <= 6 ? '🟡' : '🔴';

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '70px', height: '70px',
                                    background: unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark,
                                    border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '10px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '18px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '2px'
                                }}
                                title={unlocked ? `${config.targetJumps} jumps @ ${config.bpm} BPM` : 'Locked'}
                            >
                                {unlocked ? (
                                    <>
                                        <span>{levelNum}</span>
                                        <span style={{ fontSize: '10px' }}>{diffLabel}</span>
                                    </>
                                ) : '🔒'}
                            </button>
                        );
                    })}
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: theme.textMuted }}>
                    🟢 Learning • 🟡 Building • 🔴 Mastery
                </div>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        const config = getLevelConfig(selectedOpponent, currentLevel);
        const now = Date.now();
        const visibleBeats = beats.filter(b => {
            const timeUntil = b.targetTime - now;
            return timeUntil < 1500 && timeUntil > -300 && !b.hit;
        });

        return (
            <div
                ref={gameContainerRef}
                style={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`,
                    display: 'flex', flexDirection: 'column',
                    color: theme.text, userSelect: 'none',
                    cursor: 'pointer'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 20px', background: 'rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                }}>
                    <div>
                        <div>Jumps: <span style={{ color: theme.gold, fontWeight: 'bold' }}>{jumps}</span> / {targetJumps}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>
                            Score: <span style={{ color: theme.accent }}>{score}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: selectedOpponent.color }}>{selectedOpponent.emoji} Level {currentLevel}</div>
                        {combo > 0 && (
                            <div style={{
                                color: combo >= 10 ? theme.gold : theme.success,
                                fontWeight: 'bold',
                                fontSize: combo >= 10 ? '16px' : '14px'
                            }}>
                                {combo}x COMBO!
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>
                            ❤️ <span style={{ color: missesLeft <= 1 ? theme.error : theme.text }}>{missesLeft}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>
                            🎵 {currentBPM} BPM
                        </div>
                    </div>
                </div>

                {/* Game area */}
                <div style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: visualOpacity
                }}>
                    {/* Target circle (center) */}
                    <div style={{
                        position: 'absolute',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: `4px solid ${theme.accent}`,
                        background: `${theme.accent}22`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 30px ${theme.accent}44`
                    }} />

                    {/* Beat markers */}
                    {visibleBeats.map(beat => (
                        <BeatMarker
                            key={beat.id}
                            beat={beat}
                            currentTime={now}
                            timingWindow={config.timingWindow}
                        />
                    ))}

                    {/* Player (Teddy) */}
                    <div style={{
                        position: 'absolute',
                        bottom: isJumping ? '35%' : '20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '80px',
                        transition: 'bottom 0.1s ease-out',
                        filter: isJumping ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : 'none'
                    }}>
                        🐻
                    </div>

                    {/* Rope visual (decorative) */}
                    <div style={{
                        position: 'absolute',
                        left: '20%', right: '20%',
                        bottom: isJumping ? '25%' : '22%',
                        height: '6px',
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold}, ${theme.accent})`,
                        borderRadius: '3px',
                        transition: 'bottom 0.15s ease-out',
                        boxShadow: `0 0 10px ${theme.accent}66`
                    }} />

                    {/* Countdown */}
                    {countdown > 0 && (
                        <div style={{
                            position: 'absolute',
                            fontSize: '120px',
                            fontWeight: 'bold',
                            color: theme.gold,
                            textShadow: `0 0 40px ${theme.gold}`,
                            animation: 'pulse 0.5s ease-out'
                        }}>
                            {countdown}
                        </div>
                    )}

                    {/* Jump result indicator */}
                    {lastJumpResult && (
                        <div style={{
                            position: 'absolute',
                            top: '25%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '32px', fontWeight: 'bold',
                            color: lastJumpResult.rating === 'perfect' ? theme.perfect
                                : lastJumpResult.rating === 'great' ? theme.great
                                : lastJumpResult.rating === 'good' ? theme.good
                                : lastJumpResult.rating === 'double' ? theme.gold
                                : theme.error,
                            textShadow: `0 0 20px currentColor`,
                            animation: 'pop 0.3s ease-out'
                        }}>
                            {lastJumpResult.rating === 'perfect' && '✨ PERFECT!'}
                            {lastJumpResult.rating === 'great' && '⭐ GREAT!'}
                            {lastJumpResult.rating === 'good' && '👍 GOOD'}
                            {lastJumpResult.rating === 'double' && '⚡ DOUBLE!'}
                            {lastJumpResult.rating === 'miss' && '💔 MISS'}
                            {lastJumpResult.rating === 'wrong' && '❌ WRONG!'}
                        </div>
                    )}

                    {/* Encouragement messages */}
                    {encouragement && (
                        <div style={{
                            position: 'absolute',
                            top: '15%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '28px', fontWeight: 'bold',
                            color: theme.gold,
                            textShadow: `0 0 20px ${theme.gold}`,
                            animation: 'slideUp 0.8s ease-out'
                        }}>
                            {encouragement}
                        </div>
                    )}

                    {/* Legend for special mechanics */}
                    {(selectedOpponent.special === 'double_jump' || selectedOpponent.special === 'patterns' ||
                      selectedOpponent.special === 'two_ropes' || selectedOpponent.special === 'all') && countdown === 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '10px', left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '8px 15px',
                            background: 'rgba(0,0,0,0.6)', borderRadius: '8px',
                            fontSize: '12px', display: 'flex', gap: '15px'
                        }}>
                            {(selectedOpponent.special === 'double_jump' || selectedOpponent.special === 'all') && (
                                <span style={{ color: theme.gold }}>🟡 = Tap x2</span>
                            )}
                            {(selectedOpponent.special === 'patterns' || selectedOpponent.special === 'all') && (
                                <span style={{ color: theme.error }}>🔴 = Don't jump!</span>
                            )}
                            {(selectedOpponent.special === 'two_ropes' || selectedOpponent.special === 'all') && (
                                <span style={{ color: '#00ffaa' }}>🟢 = Rope 2</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div style={{
                    padding: '15px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                }}>
                    <div>TAP / SPACE when the ring reaches the center! 🎯</div>
                    <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>
                        ESC to quit
                    </div>
                </div>

                <style>{`
                    @keyframes pop {
                        0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                        50% { transform: translateX(-50%) scale(1.2); }
                        100% { transform: translateX(-50%) scale(1); opacity: 1; }
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                    @keyframes slideUp {
                        0% { transform: translateX(-50%) translateY(20px); opacity: 0; }
                        20% { opacity: 1; }
                        100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const won = jumps >= targetJumps;
        const accuracy = jumps > 0 ? Math.floor(((perfectCount + greatCount + goodCount) / jumps) * 100) : 0;
        const grade = accuracy >= 95 ? 'S' : accuracy >= 85 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 50 ? 'C' : 'D';

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {won ? '🏆' : '😢'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: won ? theme.gold : theme.error,
                    marginBottom: '10px'
                }}>
                    {won ? 'LEVEL COMPLETE!' : 'GAME OVER'}
                </h1>

                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px', marginBottom: '20px',
                    background: theme.bgPanel, padding: '20px', borderRadius: '15px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', color: theme.gold, fontWeight: 'bold' }}>{score}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>SCORE</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', color: theme.accent, fontWeight: 'bold' }}>{maxCombo}x</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>MAX COMBO</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', color: theme.success, fontWeight: 'bold' }}>{jumps}/{targetJumps}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>JUMPS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '32px', fontWeight: 'bold',
                            color: grade === 'S' ? theme.perfect : grade === 'A' ? theme.gold : grade === 'B' ? theme.great : theme.text
                        }}>{grade}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>GRADE</div>
                    </div>
                </div>

                {/* Detailed breakdown */}
                <div style={{
                    display: 'flex', gap: '20px', marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <span style={{ color: theme.perfect }}>✨ Perfect: {perfectCount}</span>
                    <span style={{ color: theme.great }}>⭐ Great: {greatCount}</span>
                    <span style={{ color: theme.good }}>👍 Good: {goodCount}</span>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>
                            +{Math.min(4, 1 + Math.floor(accuracy / 35))} Stars
                        </span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent.id)}/10 ⭐)
                        </span>
                    </div>
                )}

                {!won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px',
                        borderRadius: '10px', marginBottom: '30px',
                        textAlign: 'center', maxWidth: '300px'
                    }}>
                        <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
                            💡 Tip: {selectedOpponent.tips[Math.floor(Math.random() * selectedOpponent.tips.length)]}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '15px 30px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '10px', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>
                    {won && currentLevel < 10 && getStars(selectedOpponent.id) > currentLevel - 1 && (
                        <button
                            onClick={() => startMatch(selectedOpponent, currentLevel + 1)}
                            style={{
                                padding: '15px 30px', fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}aa)`,
                                border: 'none', borderRadius: '10px', color: 'white',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Next Level →
                        </button>
                    )}
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

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<JumpRope />);
