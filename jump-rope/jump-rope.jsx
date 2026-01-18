const { useState, useEffect, useCallback, useRef } = React;

/**
 * JUMP ROPE - Skip Teddy
 *
 * Design Principles:
 * - Pattern Learning: Rhythm patterns become internalized
 * - Each opponent introduces NEW rhythm mechanics
 * - Clear Feedback: Visual timing indicator, clear hit/miss
 * - Flow: Speed increases gradually within session
 * - Agency: Perfect timing vs safe timing choice
 */

const JumpRope = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff69b4', accentBright: '#ff89d4',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces unique rhythm mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Steady rhythm - learn the beat!',
            baseBPM: 60, pattern: 'steady', special: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Perfect jumps give bonus points!',
            baseBPM: 70, pattern: 'steady', special: 'perfect_bonus'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'Speed changes mid-song!',
            baseBPM: 75, pattern: 'accelerating', special: 'speed_change'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Syncopation - off-beat jumps!',
            baseBPM: 80, pattern: 'syncopated', special: 'syncopation'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Double-tap for some jumps!',
            baseBPM: 85, pattern: 'double', special: 'double_jump'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Visual cues disappear - listen!',
            baseBPM: 90, pattern: 'steady', special: 'blind'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Count patterns - skip sequences!',
            baseBPM: 95, pattern: 'counting', special: 'patterns'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Irregular timing - stay alert!',
            baseBPM: 100, pattern: 'irregular', special: 'irregular'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Double dutch - two ropes!',
            baseBPM: 90, pattern: 'double_dutch', special: 'two_ropes'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'ALL rhythm challenges!',
            baseBPM: 110, pattern: 'chaos', special: 'all'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [jumps, setJumps] = useState(0);
    const [targetJumps, setTargetJumps] = useState(30);
    const [ropeAngle, setRopeAngle] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [jumpHeight, setJumpHeight] = useState(0);
    const [currentBPM, setCurrentBPM] = useState(60);
    const [perfectCount, setPerfectCount] = useState(0);
    const [missedJump, setMissedJump] = useState(false);
    const [lastJumpResult, setLastJumpResult] = useState(null);
    const [showVisuals, setShowVisuals] = useState(true);
    const [secondRopeAngle, setSecondRopeAngle] = useState(0);
    const [nextJumpType, setNextJumpType] = useState('single'); // single, double, skip
    const [jumpPattern, setJumpPattern] = useState([]);
    const [patternIndex, setPatternIndex] = useState(0);

    // Refs
    const gameLoopRef = useRef(null);
    const ropeTimerRef = useRef(null);
    const audioContextRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('jumprope_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('jumprope_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Play beat sound
    const playBeat = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 440;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {}
    }, []);

    // Generate jump pattern for pattern-based opponents
    const generatePattern = useCallback((opp, level) => {
        const patterns = [];
        const length = 30 + level * 5;

        for (let i = 0; i < length; i++) {
            if (opp.special === 'double_jump' || opp.special === 'all') {
                patterns.push(Math.random() < 0.2 ? 'double' : 'single');
            } else if (opp.special === 'patterns' || opp.special === 'all') {
                // Create counting patterns like 1-2-3-skip
                const pos = i % 4;
                patterns.push(pos === 3 ? 'skip' : 'single');
            } else {
                patterns.push('single');
            }
        }
        return patterns;
    }, []);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setJumps(0);
        setRopeAngle(0);
        setSecondRopeAngle(Math.PI);
        setIsJumping(false);
        setJumpHeight(0);
        setPerfectCount(0);
        setMissedJump(false);
        setLastJumpResult(null);
        setShowVisuals(true);
        setPatternIndex(0);

        const levelMod = 1 + (level - 1) * 0.1;
        const target = 20 + level * 5 + opponent.id * 3;
        setTargetJumps(target);
        setCurrentBPM(Math.floor(opponent.baseBPM * levelMod));

        setJumpPattern(generatePattern(opponent, level));
        setNextJumpType(opponent.special === 'double_jump' ? 'double' : 'single');

        setGameState('playing');
    }, [generatePattern]);

    // Handle jump
    const handleJump = useCallback(() => {
        if (gameState !== 'playing' || isJumping) return;

        setIsJumping(true);
        setJumpHeight(100);

        // Calculate timing quality
        // Rope at bottom when angle is around PI (180 degrees)
        const ropeAtBottom = Math.abs(ropeAngle - Math.PI) < 0.5 ||
                            Math.abs(ropeAngle - Math.PI * 3) < 0.5;

        // Second rope for double dutch
        const secondRopeAtBottom = Math.abs(secondRopeAngle - Math.PI) < 0.5;

        const opp = selectedOpponent;
        const needsBothRopes = opp.special === 'two_ropes' || opp.special === 'all';

        // Check if jump was at right time
        let jumpSuccess = false;
        let isPerfect = false;

        if (needsBothRopes) {
            // Both ropes must be in safe zone
            jumpSuccess = ropeAtBottom || secondRopeAtBottom;
            isPerfect = Math.abs(ropeAngle - Math.PI) < 0.2;
        } else {
            jumpSuccess = ropeAtBottom;
            isPerfect = Math.abs(ropeAngle - Math.PI) < 0.2;
        }

        // Handle skip pattern
        const currentPattern = jumpPattern[patternIndex];
        if (currentPattern === 'skip') {
            // Should NOT have jumped
            jumpSuccess = false;
        }

        if (jumpSuccess) {
            setJumps(j => j + 1);
            setLastJumpResult(isPerfect ? 'perfect' : 'good');

            if (isPerfect && (opp.special === 'perfect_bonus' || opp.special === 'all')) {
                setPerfectCount(p => p + 1);
                setJumps(j => j + 1); // Bonus jump for perfect
            }

            // Move to next pattern
            setPatternIndex(i => i + 1);

            // Update next jump type
            if (opp.special === 'double_jump' || opp.special === 'all') {
                const next = jumpPattern[patternIndex + 1];
                setNextJumpType(next || 'single');
            }
        } else {
            setMissedJump(true);
            setLastJumpResult('miss');
            setTimeout(() => setGameState('result'), 500);
        }

        // Jump animation
        setTimeout(() => {
            setIsJumping(false);
            setJumpHeight(0);
            setLastJumpResult(null);
        }, 300);
    }, [gameState, isJumping, ropeAngle, secondRopeAngle, selectedOpponent, jumpPattern, patternIndex]);

    // Double jump handler
    const handleDoubleJump = useCallback(() => {
        if (nextJumpType !== 'double') return;

        // Quick second tap for double jump
        setTimeout(() => {
            if (isJumping) {
                setJumps(j => j + 1);
                setJumpHeight(120); // Higher for double
            }
        }, 100);
    }, [nextJumpType, isJumping]);

    // Game loop - rope animation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const msPerBeat = 60000 / currentBPM;

        // Update BPM for accelerating opponents
        if (opp.special === 'speed_change' || opp.special === 'all') {
            const speedTimer = setInterval(() => {
                setCurrentBPM(bpm => Math.min(150, bpm + 2));
            }, 5000);

            return () => clearInterval(speedTimer);
        }
    }, [gameState, selectedOpponent, currentBPM]);

    // Rope rotation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const msPerBeat = 60000 / currentBPM;
        const anglePerMs = (Math.PI * 2) / msPerBeat;

        let lastTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const delta = now - lastTime;
            lastTime = now;

            setRopeAngle(a => {
                let newAngle = a + anglePerMs * delta;

                // Irregular timing for Snake
                if (opp.special === 'irregular' || opp.special === 'all') {
                    newAngle += Math.sin(now / 500) * 0.01;
                }

                // Play beat sound when rope is at top
                if (Math.floor(a / (Math.PI * 2)) < Math.floor(newAngle / (Math.PI * 2))) {
                    playBeat();
                }

                return newAngle;
            });

            // Second rope for double dutch
            if (opp.special === 'two_ropes' || opp.special === 'all') {
                setSecondRopeAngle(a => a + anglePerMs * delta * 0.9); // Slightly different speed
            }

            // Blind mode for Moth
            if (opp.special === 'blind' || opp.special === 'all') {
                if (jumps > 10 && Math.random() < 0.01) {
                    setShowVisuals(false);
                    setTimeout(() => setShowVisuals(true), 2000);
                }
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
    }, [gameState, currentBPM, selectedOpponent, jumps, targetJumps, playBeat]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = jumps >= targetJumps;
        if (won) {
            const bonus = perfectCount >= 5 ? 1 : 0;
            const points = 1 + bonus;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, jumps, targetJumps, perfectCount, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
                handleDoubleJump();
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };

        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', handleJump);
        window.addEventListener('touchstart', handleJump);

        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('click', handleJump);
            window.removeEventListener('touchstart', handleJump);
        };
    }, [handleJump, handleDoubleJump, gameState]);

    // Star bar
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

    // Menu
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
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Jump to the rhythm!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    PLAY
                </button>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>← Back to Menu</a>
            </div>
        );
    }

    // Select
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
                    <h2 style={{ color: theme.accent }}>Choose Rhythm</h2>
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
                                    position: 'relative'
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
                                            🎵 {opp.baseBPM} BPM - {opp.mechanic}
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

    // Level select
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
                    background: `${selectedOpponent.color}22`, borderRadius: '8px'
                }}>
                    🎵 {selectedOpponent.mechanic}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Select Level</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxWidth: '400px' }}>
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
                                    background: unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark,
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

    // Playing
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const ropeY = Math.sin(ropeAngle) * 40;
        const ropeOpacity = showVisuals ? 1 : 0.1;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}22 100%)`,
                display: 'flex', flexDirection: 'column',
                color: theme.text, userSelect: 'none'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 20px', background: 'rgba(0,0,0,0.3)'
                }}>
                    <div>
                        Jumps: <span style={{ color: theme.gold, fontWeight: 'bold' }}>{jumps}</span> / {targetJumps}
                    </div>
                    <div style={{ color: opp.color }}>{opp.emoji} Level {currentLevel}</div>
                    <div>
                        🎵 <span style={{ color: theme.accent }}>{currentBPM}</span> BPM
                        {perfectCount > 0 && <span style={{ color: theme.gold, marginLeft: '10px' }}>⭐{perfectCount}</span>}
                    </div>
                </div>

                {/* Game area */}
                <div style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {/* Rope holders */}
                    <div style={{
                        position: 'absolute', left: '20%', top: '50%',
                        transform: 'translateY(-50%)', fontSize: '60px'
                    }}>🪱</div>
                    <div style={{
                        position: 'absolute', right: '20%', top: '50%',
                        transform: 'translateY(-50%)', fontSize: '60px'
                    }}>🪱</div>

                    {/* Main rope */}
                    <div style={{
                        position: 'absolute',
                        left: '25%', right: '25%',
                        top: `calc(50% + ${ropeY}px)`,
                        height: '8px',
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold}, ${theme.accent})`,
                        borderRadius: '4px',
                        opacity: ropeOpacity,
                        transition: 'top 0.05s linear'
                    }} />

                    {/* Second rope for double dutch */}
                    {(opp.special === 'two_ropes' || opp.special === 'all') && (
                        <div style={{
                            position: 'absolute',
                            left: '25%', right: '25%',
                            top: `calc(50% + ${Math.sin(secondRopeAngle) * 40}px)`,
                            height: '8px',
                            background: `linear-gradient(90deg, ${theme.error}, ${theme.gold}, ${theme.error})`,
                            borderRadius: '4px',
                            opacity: ropeOpacity * 0.7,
                            transition: 'top 0.05s linear'
                        }} />
                    )}

                    {/* Player */}
                    <div style={{
                        position: 'absolute',
                        bottom: `calc(20% + ${jumpHeight}px)`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '80px',
                        transition: 'bottom 0.1s ease-out'
                    }}>
                        🐻
                    </div>

                    {/* Ground */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '15%',
                        background: 'linear-gradient(to bottom, #4a3a28, #3a2a18)'
                    }} />

                    {/* Jump result indicator */}
                    {lastJumpResult && (
                        <div style={{
                            position: 'absolute',
                            top: '30%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '36px', fontWeight: 'bold',
                            color: lastJumpResult === 'perfect' ? theme.gold
                                : lastJumpResult === 'good' ? theme.success
                                : theme.error,
                            animation: 'pop 0.3s ease-out'
                        }}>
                            {lastJumpResult === 'perfect' && '⭐ PERFECT!'}
                            {lastJumpResult === 'good' && '✓ Good!'}
                            {lastJumpResult === 'miss' && '✗ MISS!'}
                        </div>
                    )}

                    {/* Timing indicator */}
                    {showVisuals && (
                        <div style={{
                            position: 'absolute', bottom: '25%', left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{
                                width: '100px', height: '10px',
                                background: theme.bgDark, borderRadius: '5px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: '20px', height: '100%',
                                    background: Math.abs(ropeAngle % (Math.PI * 2) - Math.PI) < 0.5 ? theme.success : theme.accent,
                                    marginLeft: `${((ropeAngle % (Math.PI * 2)) / (Math.PI * 2)) * 80}px`,
                                    borderRadius: '5px'
                                }} />
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>
                                JUMP when green!
                            </div>
                        </div>
                    )}

                    {/* Next jump type indicator */}
                    {(opp.special === 'double_jump' || opp.special === 'patterns' || opp.special === 'all') && (
                        <div style={{
                            position: 'absolute', top: '20%', left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '10px 20px',
                            background: 'rgba(0,0,0,0.5)', borderRadius: '10px'
                        }}>
                            Next: {nextJumpType === 'double' ? '⬆️⬆️ DOUBLE' : nextJumpType === 'skip' ? '⏭️ SKIP' : '⬆️ Jump'}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div style={{
                    padding: '15px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)'
                }}>
                    TAP / SPACE to jump when the rope is at the bottom!
                </div>

                <style>{`
                    @keyframes pop {
                        0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                        50% { transform: translateX(-50%) scale(1.2); }
                        100% { transform: translateX(-50%) scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Result
    if (gameState === 'result') {
        const won = jumps >= targetJumps;

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
                    {won ? 'JUMP COMPLETE!' : 'TRIPPED!'}
                </h1>

                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                    Jumps: <span style={{ color: theme.accent }}>{jumps}</span> / {targetJumps}
                </div>
                {perfectCount > 0 && (
                    <div style={{ fontSize: '18px', marginBottom: '20px', color: theme.gold }}>
                        ⭐ Perfect Jumps: {perfectCount}
                    </div>
                )}

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{perfectCount >= 5 ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent.id)}/10 ⭐)
                        </span>
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
