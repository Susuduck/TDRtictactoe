const { useState, useEffect, useCallback, useRef } = React;

/**
 * FLAPPY TEDDY
 *
 * Design Principles:
 * - Pattern Learning: Pipe patterns become recognizable
 * - Each opponent introduces NEW mechanics (not just harder)
 * - Clear Feedback: Know exactly why you hit
 * - Flow: Target-based levels with difficulty scaling
 * - Agency: Choose safe path vs risky golden gaps
 */

const FlappyTeddy = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#87ceeb', accentBright: '#a7eeff',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces unique mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Wide gaps - learn to flap!',
            gapSize: 180, pipeSpeed: 2, gravity: 0.4, special: 'none',
            skyColor: '#87ceeb'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Honey collectibles between pipes!',
            gapSize: 160, pipeSpeed: 2.2, gravity: 0.4, special: 'collectibles',
            skyColor: '#f0d080'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'Rhythm flapping - beat timing bonus!',
            gapSize: 150, pipeSpeed: 2.3, gravity: 0.42, special: 'rhythm',
            skyColor: '#d080c0'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Moving pipes - they shift up and down!',
            gapSize: 145, pipeSpeed: 2.4, gravity: 0.43, special: 'moving_pipes',
            skyColor: '#8090a0'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Speed zones - fast and slow areas!',
            gapSize: 140, pipeSpeed: 2.5, gravity: 0.44, special: 'speed_zones',
            skyColor: '#5080b0'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Night mode - visibility limited!',
            gapSize: 135, pipeSpeed: 2.6, gravity: 0.45, special: 'night',
            skyColor: '#302040'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Wind gusts - Teddy drifts!',
            gapSize: 130, pipeSpeed: 2.7, gravity: 0.46, special: 'wind',
            skyColor: '#90c0d0'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Snake pipes - they wave!',
            gapSize: 125, pipeSpeed: 2.8, gravity: 0.47, special: 'wave_pipes',
            skyColor: '#60a060'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Double pipes - two gaps to navigate!',
            gapSize: 120, pipeSpeed: 2.9, gravity: 0.48, special: 'double_pipes',
            skyColor: '#505060'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'ALL mechanics combined!',
            gapSize: 115, pipeSpeed: 3.0, gravity: 0.5, special: 'all',
            skyColor: '#806030'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Physics state
    const [birdY, setBirdY] = useState(50);
    const [birdVY, setBirdVY] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [collectibles, setCollectibles] = useState([]);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const [targetPipes, setTargetPipes] = useState(10);
    const [beatPhase, setBeatPhase] = useState(0);
    const [wind, setWind] = useState(0);
    const [currentSpeedMod, setCurrentSpeedMod] = useState(1);

    // Refs
    const gameLoopRef = useRef(null);
    const nextPipeId = useRef(0);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('flappyteddy_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('flappyteddy_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Flap function
    const flap = useCallback(() => {
        if (gameState !== 'playing') return;
        setBirdVY(-7);

        // Rhythm bonus
        if (selectedOpponent && (selectedOpponent.special === 'rhythm' || selectedOpponent.special === 'all')) {
            if (beatPhase === 0) {
                setScore(s => s + 1); // Bonus for on-beat flap
            }
        }
    }, [gameState, selectedOpponent, beatPhase]);

    // Generate pipe
    const generatePipe = useCallback((x, opp, level) => {
        const levelMod = 1 + (level - 1) * 0.08;
        const gapSize = opp.gapSize / levelMod;

        // Random gap position
        const minY = 80;
        const maxY = 320;
        const gapY = minY + Math.random() * (maxY - minY - gapSize);

        const pipe = {
            id: nextPipeId.current++,
            x,
            gapY,
            gapSize,
            passed: false,
            baseY: gapY, // For moving pipes
            phase: Math.random() * Math.PI * 2, // For wave pipes
            isDouble: (opp.special === 'double_pipes' || opp.special === 'all') && Math.random() < 0.3
        };

        // Double pipe adds second gap
        if (pipe.isDouble) {
            pipe.gapY2 = gapY + gapSize + 50 + Math.random() * 30;
            pipe.gapSize2 = gapSize * 0.8;
        }

        return pipe;
    }, []);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setBirdY(50);
        setBirdVY(0);
        setScore(0);
        setDistance(0);
        setWind(0);
        setCurrentSpeedMod(1);

        // Target pipes based on level
        const target = 5 + level * 2 + opponent.id;
        setTargetPipes(target);

        // Generate initial pipes
        const initialPipes = [];
        for (let i = 0; i < 5; i++) {
            initialPipes.push(generatePipe(400 + i * 200, opponent, level));
        }
        setPipes(initialPipes);

        // Generate collectibles
        if (opponent.special === 'collectibles' || opponent.special === 'all') {
            const items = initialPipes.map(p => ({
                id: p.id,
                x: p.x + 50,
                y: p.gapY + p.gapSize / 2,
                collected: false
            }));
            setCollectibles(items);
        } else {
            setCollectibles([]);
        }

        setGameState('playing');
    }, [generatePipe]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.1;
        const baseSpeed = opp.pipeSpeed * levelMod;

        const loop = () => {
            // Update bird physics
            setBirdVY(vy => {
                let newVY = vy + opp.gravity;

                // Wind effect
                if (opp.special === 'wind' || opp.special === 'all') {
                    newVY += wind * 0.1;
                }

                return Math.min(10, newVY);
            });

            setBirdY(y => {
                const newY = y + birdVY;

                // Check ceiling/floor collision
                if (newY < 2 || newY > 98) {
                    setTimeout(() => setGameState('result'), 100);
                }

                return Math.max(0, Math.min(100, newY));
            });

            // Update pipes
            setPipes(currentPipes => {
                const speed = baseSpeed * currentSpeedMod;
                let pipesPassed = score;

                const updated = currentPipes
                    .map(p => {
                        let newX = p.x - speed;

                        // Moving pipes
                        if (opp.special === 'moving_pipes' || opp.special === 'all') {
                            p.gapY = p.baseY + Math.sin(Date.now() / 500 + p.phase) * 30;
                        }

                        // Wave pipes
                        if (opp.special === 'wave_pipes' || opp.special === 'all') {
                            p.gapY = p.baseY + Math.sin(Date.now() / 300 + p.phase) * 40;
                        }

                        // Check if passed
                        if (!p.passed && newX < 15) {
                            p.passed = true;
                            pipesPassed++;
                        }

                        return { ...p, x: newX };
                    })
                    .filter(p => p.x > -50);

                // Update score
                if (pipesPassed !== score) {
                    setScore(pipesPassed);

                    // Check win condition
                    if (pipesPassed >= targetPipes) {
                        setTimeout(() => setGameState('result'), 100);
                    }
                }

                // Generate new pipes
                if (updated.length < 5) {
                    const lastPipe = updated[updated.length - 1];
                    const newX = lastPipe ? lastPipe.x + 200 : 400;
                    updated.push(generatePipe(newX, opp, currentLevel));

                    // Add collectible
                    if (opp.special === 'collectibles' || opp.special === 'all') {
                        const newPipe = updated[updated.length - 1];
                        setCollectibles(c => [...c, {
                            id: newPipe.id,
                            x: newPipe.x + 50,
                            y: newPipe.gapY + newPipe.gapSize / 2,
                            collected: false
                        }]);
                    }
                }

                return updated;
            });

            // Update collectibles position
            setCollectibles(items => items
                .map(item => ({ ...item, x: item.x - baseSpeed * currentSpeedMod }))
                .filter(item => item.x > -50)
            );

            // Check collectible collection
            setCollectibles(items => {
                return items.map(item => {
                    if (!item.collected && Math.abs(item.x - 80) < 20 && Math.abs(item.y - birdY * 4) < 30) {
                        setScore(s => s + 1);
                        return { ...item, collected: true };
                    }
                    return item;
                });
            });

            // Check collision with pipes
            const birdX = 80; // Bird position in pixels (20% of 400)
            const birdPxY = birdY * 4; // Convert to pixels
            const birdSize = 20;

            for (const pipe of pipes) {
                const pipeLeft = pipe.x;
                const pipeRight = pipe.x + 50;

                // Check if bird is within pipe x range
                if (birdX + birdSize > pipeLeft && birdX - birdSize < pipeRight) {
                    // Check if bird is outside gap
                    const inGap = birdPxY > pipe.gapY && birdPxY < pipe.gapY + pipe.gapSize;
                    const inGap2 = pipe.isDouble && birdPxY > pipe.gapY2 && birdPxY < pipe.gapY2 + pipe.gapSize2;

                    if (!inGap && !inGap2) {
                        setTimeout(() => setGameState('result'), 100);
                        break;
                    }
                }
            }

            // Speed zones effect
            if (opp.special === 'speed_zones' || opp.special === 'all') {
                // Random speed changes
                if (Math.random() < 0.01) {
                    setCurrentSpeedMod(Math.random() < 0.5 ? 1.5 : 0.7);
                    setTimeout(() => setCurrentSpeedMod(1), 2000);
                }
            }

            // Update distance
            setDistance(d => d + baseSpeed * currentSpeedMod);

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, selectedOpponent, currentLevel, birdVY, birdY, pipes, score,
        targetPipes, currentSpeedMod, wind, generatePipe]);

    // Beat timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 500);
        return () => clearInterval(interval);
    }, [gameState]);

    // Wind changes
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (selectedOpponent?.special !== 'wind' && selectedOpponent?.special !== 'all') return;

        const interval = setInterval(() => {
            setWind(Math.sin(Date.now() / 2000) * 2);
        }, 100);
        return () => clearInterval(interval);
    }, [gameState, selectedOpponent]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = score >= targetPipes;
        if (won) {
            const percentage = score / targetPipes;
            const points = percentage >= 1.5 ? 2 : 1;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, targetPipes, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flap();
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };
        const handleClick = () => flap();

        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', handleClick);
        window.addEventListener('touchstart', handleClick);

        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('touchstart', handleClick);
        };
    }, [flap, gameState]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1a2535 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🐻</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>FLAPPY TEDDY</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Teddy got fired so hard he's flying!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: '#1a1625',
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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1a2535 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Sky</h2>
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
                                    background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${opp.skyColor}33)` : theme.bgDark,
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
                                            ✈️ {opp.mechanic}
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
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.skyColor}33 100%)`,
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
                    ✈️ {selectedOpponent.mechanic}
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
        const isNight = opp.special === 'night' || opp.special === 'all';

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(to bottom, ${opp.skyColor}, ${opp.skyColor}88)`,
                display: 'flex', flexDirection: 'column',
                color: theme.text, userSelect: 'none',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Night mode overlay */}
                {isNight && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: `radial-gradient(circle at 20% ${birdY}%, transparent 100px, rgba(0,0,0,0.8) 200px)`,
                        pointerEvents: 'none', zIndex: 10
                    }} />
                )}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 20px', background: 'rgba(0,0,0,0.3)', zIndex: 20
                }}>
                    <div>🎯 Pipes: <span style={{ color: theme.gold }}>{score}</span> / {targetPipes}</div>
                    <div style={{ color: opp.color }}>{opp.emoji} Level {currentLevel}</div>
                    {(opp.special === 'rhythm' || opp.special === 'all') && (
                        <div style={{
                            width: '20px', height: '20px',
                            background: beatPhase === 0 ? theme.gold : theme.bgDark,
                            borderRadius: '50%'
                        }} />
                    )}
                </div>

                {/* Game area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    {/* Pipes */}
                    {pipes.map(pipe => (
                        <div key={pipe.id}>
                            {/* Top pipe */}
                            <div style={{
                                position: 'absolute',
                                left: `${pipe.x / 4}%`,
                                top: 0,
                                width: '50px',
                                height: `${pipe.gapY / 4}%`,
                                background: 'linear-gradient(90deg, #228b22, #32cd32, #228b22)',
                                borderRadius: '0 0 5px 5px'
                            }} />
                            {/* Bottom pipe */}
                            <div style={{
                                position: 'absolute',
                                left: `${pipe.x / 4}%`,
                                top: `${(pipe.gapY + pipe.gapSize) / 4}%`,
                                width: '50px',
                                bottom: 0,
                                background: 'linear-gradient(90deg, #228b22, #32cd32, #228b22)',
                                borderRadius: '5px 5px 0 0'
                            }} />
                            {/* Second gap for double pipes */}
                            {pipe.isDouble && (
                                <>
                                    <div style={{
                                        position: 'absolute',
                                        left: `${pipe.x / 4}%`,
                                        top: `${(pipe.gapY + pipe.gapSize) / 4}%`,
                                        width: '50px',
                                        height: `${(pipe.gapY2 - pipe.gapY - pipe.gapSize) / 4}%`,
                                        background: 'linear-gradient(90deg, #228b22, #32cd32, #228b22)'
                                    }} />
                                </>
                            )}
                        </div>
                    ))}

                    {/* Collectibles */}
                    {collectibles.filter(c => !c.collected).map(item => (
                        <div key={item.id} style={{
                            position: 'absolute',
                            left: `${item.x / 4}%`,
                            top: `${item.y / 4}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '24px'
                        }}>🍯</div>
                    ))}

                    {/* Bird */}
                    <div style={{
                        position: 'absolute',
                        left: '20%',
                        top: `${birdY}%`,
                        transform: `translate(-50%, -50%) rotate(${Math.min(30, Math.max(-30, birdVY * 5))}deg)`,
                        fontSize: '40px',
                        transition: 'transform 0.1s',
                        zIndex: 5
                    }}>
                        🐻
                    </div>

                    {/* Wind indicator */}
                    {(opp.special === 'wind' || opp.special === 'all') && Math.abs(wind) > 0.5 && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '30px', opacity: 0.5
                        }}>
                            {wind > 0 ? '💨⬇️' : '💨⬆️'}
                        </div>
                    )}

                    {/* Speed indicator */}
                    {currentSpeedMod !== 1 && (
                        <div style={{
                            position: 'absolute', top: '20%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '24px', fontWeight: 'bold',
                            color: currentSpeedMod > 1 ? theme.error : theme.accent
                        }}>
                            {currentSpeedMod > 1 ? '⚡ FAST!' : '🐢 SLOW'}
                        </div>
                    )}

                    {/* Ground */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '50px',
                        background: 'linear-gradient(to bottom, #8b4513, #654321)'
                    }} />
                </div>

                {/* Instructions */}
                <div style={{
                    padding: '10px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)', zIndex: 20
                }}>
                    TAP / SPACE to flap!
                </div>
            </div>
        );
    }

    // Result
    if (gameState === 'result') {
        const won = score >= targetPipes;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {won ? '🏆' : '💥'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: won ? theme.gold : theme.error,
                    marginBottom: '10px'
                }}>
                    {won ? 'FLIGHT COMPLETE!' : 'CRASHED!'}
                </h1>

                <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                    Pipes Passed: <span style={{ color: theme.accent }}>{score}</span> / {targetPipes}
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{score >= targetPipes * 1.5 ? 2 : 1} Points</span>
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
                            border: 'none', borderRadius: '10px', color: '#1a1625',
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
