const { useState, useEffect, useCallback, useRef } = React;

/**
 * HONEY CATCH - Honey Pot Drop
 *
 * Design Principles:
 * - Simple Controls: Move left/right to catch falling items
 * - Risk/Reward: Honey gives points, bees/rocks are penalties
 * - Progressive Difficulty: Each opponent introduces new mechanics
 * - Pattern Recognition: Learn falling patterns to maximize score
 * - Time Pressure: 60-second rounds
 */

const HoneyCatch = () => {
    // Theme - Pink/Gold
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff69b4', accentBright: '#ff89d4',
        gold: '#ffd700', goldGlow: 'rgba(255, 215, 0, 0.4)',
        error: '#e85a50', success: '#50c878',
        honey: '#f4a460', bee: '#ffd700'
    };

    // Opponents - each introduces unique mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            taunt: "Ribbit! Catch that honey!",
            winQuote: "Hop hop hooray!",
            loseQuote: "Ribbit... too sweet!",
            mechanic: 'Basic slow falling - just honey pots',
            spawnRate: 1.5, fallSpeed: 2, items: ['honey'], patterns: ['straight']
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            taunt: "Bawk! Watch out for bees!",
            winQuote: "Egg-cellent catching!",
            loseQuote: "Bawk... you're too good!",
            mechanic: 'Introduces bees - avoid them!',
            spawnRate: 1.3, fallSpeed: 2.5, items: ['honey', 'bee'], patterns: ['straight']
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            taunt: "Time to dance, baby!",
            winQuote: "Groovy moves!",
            loseQuote: "The disco continues...",
            mechanic: 'Items speed up over time!',
            spawnRate: 1.2, fallSpeed: 2, items: ['honey', 'bee'], patterns: ['straight'], speedUp: true
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            taunt: "Found these rocks for you!",
            winQuote: "Garbage day victory!",
            loseQuote: "Back to the bins...",
            mechanic: 'Introduces rocks - big penalties! Items zig-zag',
            spawnRate: 1.1, fallSpeed: 2.8, items: ['honey', 'bee', 'rock'], patterns: ['zigzag']
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            taunt: "Golden honey incoming!",
            winQuote: "Electrifying catch!",
            loseQuote: "Circuits overloaded...",
            mechanic: 'Golden honey worth 3x! Items move in waves',
            spawnRate: 1.0, fallSpeed: 3, items: ['honey', 'bee', 'golden'], patterns: ['wave']
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            taunt: "Can you see in the dark?",
            winQuote: "The light guides you!",
            loseQuote: "Into the darkness...",
            mechanic: 'Items are hidden until close!',
            spawnRate: 0.9, fallSpeed: 3.2, items: ['honey', 'bee', 'rock', 'golden'], patterns: ['straight'], hidden: true
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            taunt: "Study these patterns!",
            winQuote: "Class dismissed!",
            loseQuote: "I must study more...",
            mechanic: 'Items fall in groups and patterns',
            spawnRate: 0.8, fallSpeed: 3.5, items: ['honey', 'bee', 'rock', 'golden'], patterns: ['group', 'diagonal']
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            taunt: "Sssso tricky!",
            winQuote: "Ssssweet victory!",
            loseQuote: "Thisss isssn't over...",
            mechanic: 'Items can change direction mid-fall!',
            spawnRate: 0.75, fallSpeed: 3.8, items: ['honey', 'bee', 'rock', 'golden'], patterns: ['swerve']
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            taunt: "The pack descends!",
            winQuote: "AWOOOO!",
            loseQuote: "The pack retreats...",
            mechanic: 'Multiple items at once, faster pace!',
            spawnRate: 0.5, fallSpeed: 4.2, items: ['honey', 'bee', 'rock', 'golden'], patterns: ['swarm']
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            taunt: "Face ALL the challenges!",
            winQuote: "Worthy of the crown!",
            loseQuote: "Impossible...",
            mechanic: 'All mechanics combined - ultimate challenge!',
            spawnRate: 0.4, fallSpeed: 4.5, items: ['honey', 'bee', 'rock', 'golden'], patterns: ['all'], speedUp: true, hidden: true
        }
    ];

    // Item definitions
    const itemTypes = {
        honey: { emoji: '🍯', points: 10, type: 'good' },
        golden: { emoji: '⭐', points: 30, type: 'good' },
        bee: { emoji: '🐝', points: -15, type: 'bad' },
        rock: { emoji: '🪨', points: -25, type: 'bad' }
    };

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [playerX, setPlayerX] = useState(50); // percentage
    const [fallingItems, setFallingItems] = useState([]);
    const [combo, setCombo] = useState(0);
    const [catchEffects, setCatchEffects] = useState([]);
    const [isPaused, setIsPaused] = useState(false);

    // Refs
    const gameLoopRef = useRef(null);
    const timerRef = useRef(null);
    const spawnTimerRef = useRef(null);
    const keysPressed = useRef({});
    const itemIdRef = useRef(0);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('honey_catch_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('honey_catch_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Get difficulty settings
    const getDifficulty = useCallback((opponentIdx, level) => {
        const opp = opponents[opponentIdx];
        const levelMod = 1 + (level - 1) * 0.08;

        return {
            spawnRate: opp.spawnRate / levelMod,
            fallSpeed: opp.fallSpeed * levelMod,
            targetScore: 100 + opponentIdx * 50 + level * 30
        };
    }, []);

    // Generate falling item
    const spawnItem = useCallback(() => {
        if (!selectedOpponent) return;

        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);

        // Choose item type based on opponent's available items
        const items = opp.items;
        let itemKey;

        // Weight towards good items early, bad items later
        const badChance = 0.2 + (opp.id * 0.03) + (currentLevel * 0.02);
        const goldenChance = items.includes('golden') ? 0.15 : 0;

        const roll = Math.random();
        if (roll < goldenChance) {
            itemKey = 'golden';
        } else if (roll < goldenChance + badChance && items.includes('bee')) {
            itemKey = Math.random() < 0.5 && items.includes('rock') ? 'rock' : 'bee';
        } else {
            itemKey = 'honey';
        }

        // Choose pattern
        const patterns = opp.patterns;
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        // Base x position
        let x = 10 + Math.random() * 80;

        // Create item
        const item = {
            id: itemIdRef.current++,
            type: itemKey,
            x: x,
            y: -10,
            pattern: pattern,
            speed: difficulty.fallSpeed,
            hidden: opp.hidden && Math.random() < 0.5,
            swerveDir: Math.random() < 0.5 ? 1 : -1,
            swerveTimer: 0,
            waveOffset: Math.random() * Math.PI * 2
        };

        setFallingItems(prev => [...prev, item]);

        // For group/swarm patterns, spawn multiple items
        if (pattern === 'group' || pattern === 'swarm' || pattern === 'all') {
            const extraCount = pattern === 'swarm' ? 3 : 2;
            for (let i = 0; i < extraCount; i++) {
                setTimeout(() => {
                    const extraItem = {
                        id: itemIdRef.current++,
                        type: Math.random() < 0.7 ? 'honey' : (Math.random() < 0.5 ? 'bee' : 'rock'),
                        x: 10 + Math.random() * 80,
                        y: -10,
                        pattern: pattern === 'all' ? ['straight', 'zigzag', 'wave'][Math.floor(Math.random() * 3)] : 'straight',
                        speed: difficulty.fallSpeed * (0.8 + Math.random() * 0.4),
                        hidden: false,
                        swerveDir: Math.random() < 0.5 ? 1 : -1,
                        swerveTimer: 0,
                        waveOffset: Math.random() * Math.PI * 2
                    };
                    setFallingItems(prev => [...prev, extraItem]);
                }, i * 200);
            }
        }
    }, [selectedOpponent, currentLevel, getDifficulty]);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        setTimeLeft(60);
        setPlayerX(50);
        setFallingItems([]);
        setCombo(0);
        setCatchEffects([]);
        setIsPaused(false);
        itemIdRef.current = 0;
        setGameState('playing');
    }, []);

    // Game timer
    useEffect(() => {
        if (gameState !== 'playing' || isPaused) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('result');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [gameState, isPaused]);

    // Item spawner
    useEffect(() => {
        if (gameState !== 'playing' || isPaused || !selectedOpponent) return;

        const difficulty = getDifficulty(selectedOpponent.id, currentLevel);
        const spawnInterval = difficulty.spawnRate * 1000;

        spawnTimerRef.current = setInterval(spawnItem, spawnInterval);

        return () => clearInterval(spawnTimerRef.current);
    }, [gameState, isPaused, selectedOpponent, currentLevel, spawnItem, getDifficulty]);

    // Game loop - movement and collisions
    useEffect(() => {
        if (gameState !== 'playing' || isPaused) return;

        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);
        let currentTime = 0;

        const loop = () => {
            currentTime += 16;

            // Player movement
            const moveSpeed = 2;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
                setPlayerX(x => Math.max(5, x - moveSpeed));
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
                setPlayerX(x => Math.min(95, x + moveSpeed));
            }

            // Update falling items
            setFallingItems(items => {
                return items.map(item => {
                    let newX = item.x;
                    let newY = item.y;
                    let speed = item.speed;

                    // Speed up over time for Disco Dinosaur and Grizzly
                    if (opp.speedUp) {
                        speed *= 1 + (60 - timeLeft) * 0.01;
                    }

                    newY += speed * 0.5;

                    // Pattern movements
                    switch (item.pattern) {
                        case 'zigzag':
                            newX += Math.sin(newY * 0.1) * 2;
                            break;
                        case 'wave':
                            newX += Math.sin(newY * 0.05 + item.waveOffset) * 3;
                            break;
                        case 'swerve':
                            item.swerveTimer += 0.02;
                            if (Math.sin(item.swerveTimer) > 0.9) {
                                item.swerveDir *= -1;
                            }
                            newX += item.swerveDir * 0.8;
                            break;
                        case 'diagonal':
                            newX += item.swerveDir * 0.5;
                            break;
                    }

                    // Keep in bounds
                    newX = Math.max(5, Math.min(95, newX));

                    return { ...item, x: newX, y: newY };
                }).filter(item => item.y < 110); // Remove items that fell off screen
            });

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, isPaused, selectedOpponent, currentLevel, timeLeft, getDifficulty]);

    // Collision detection
    useEffect(() => {
        if (gameState !== 'playing') return;

        const checkCollisions = () => {
            setFallingItems(items => {
                const remaining = [];
                let caught = false;
                let caughtGood = false;

                for (const item of items) {
                    // Check collision with player (player is at bottom, around y = 85%)
                    const playerWidth = 12;
                    const itemNear = item.y >= 80 && item.y <= 95;
                    const itemInRange = Math.abs(item.x - playerX) < playerWidth;

                    if (itemNear && itemInRange) {
                        // Caught!
                        const itemDef = itemTypes[item.type];
                        const comboMultiplier = itemDef.type === 'good' ? 1 + combo * 0.1 : 1;
                        const points = Math.floor(itemDef.points * comboMultiplier);

                        setScore(s => Math.max(0, s + points));

                        if (itemDef.type === 'good') {
                            setCombo(c => c + 1);
                            caughtGood = true;
                        } else {
                            setCombo(0);
                        }

                        // Add catch effect
                        setCatchEffects(prev => [...prev, {
                            id: item.id,
                            x: item.x,
                            y: item.y,
                            points: points,
                            type: itemDef.type
                        }]);

                        // Remove effect after animation
                        setTimeout(() => {
                            setCatchEffects(prev => prev.filter(e => e.id !== item.id));
                        }, 500);

                        caught = true;
                    } else {
                        remaining.push(item);
                    }
                }

                // Reset combo if item was missed (fell off bottom)
                const missedItem = items.some(item =>
                    item.y >= 100 && itemTypes[item.type].type === 'good'
                );
                if (missedItem && !caught) {
                    setCombo(0);
                }

                return remaining;
            });
        };

        const collisionInterval = setInterval(checkCollisions, 50);
        return () => clearInterval(collisionInterval);
    }, [gameState, playerX, combo]);

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.code] = true;

            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    setIsPaused(p => !p);
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };

        const handleKeyUp = (e) => {
            keysPressed.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    // Touch/mouse handling for mobile
    const handlePointerMove = useCallback((e) => {
        if (gameState !== 'playing') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) / rect.width * 100;
        setPlayerX(Math.max(5, Math.min(95, x)));
    }, [gameState]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result' || !selectedOpponent) return;

        const difficulty = getDifficulty(selectedOpponent.id, currentLevel);
        const won = score >= difficulty.targetScore;

        if (won) {
            // Calculate points: 1-4 based on performance
            const ratio = score / difficulty.targetScore;
            let points = 1;
            if (ratio >= 2) points = 4;
            else if (ratio >= 1.5) points = 3;
            else if (ratio >= 1.2) points = 2;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, selectedOpponent, currentLevel, getDifficulty]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🍯</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.gold }}>HONEY CATCH</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Catch honey, avoid bees!</p>

                <div style={{
                    display: 'flex', gap: '20px', marginBottom: '30px',
                    color: theme.textMuted, fontSize: '14px'
                }}>
                    <span>🍯 +10</span>
                    <span style={{ color: theme.gold }}>⭐ +30</span>
                    <span style={{ color: theme.error }}>🐝 -15</span>
                    <span style={{ color: theme.error }}>🪨 -25</span>
                </div>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 4px 15px ${theme.goldGlow}`
                    }}
                >
                    PLAY
                </button>

                <div style={{
                    marginTop: '30px', padding: '20px',
                    background: theme.bgPanel, borderRadius: '10px',
                    maxWidth: '400px', textAlign: 'center'
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '10px' }}>How to Play</h3>
                    <p style={{ color: theme.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                        Move left/right with arrow keys or A/D.<br/>
                        On mobile, touch and drag to move.<br/>
                        Catch honey pots for points!<br/>
                        Avoid bees and rocks!<br/>
                        Build combos for bonus points!
                    </p>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>Back to Menu</a>
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
                    }}>Back</button>
                    <h2 style={{ color: theme.gold }}>Choose Challenger</h2>
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
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {!unlocked && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        fontSize: '20px'
                                    }}>🔒</div>
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
                                        fontSize: '48px',
                                        width: '70px', height: '70px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}33`, borderRadius: '50%'
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: opp.color }}>
                                            {opp.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted }}>
                                            {opp.title}
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <StarBar points={progression.starPoints[idx]} />
                                        </div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            marginTop: '5px', fontStyle: 'italic'
                                        }}>
                                            {opp.mechanic}
                                        </div>
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
        const difficulty = getDifficulty(selectedOpponent.id, 1);

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
                    fontSize: '13px'
                }}>
                    {selectedOpponent.mechanic}
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
                        const levelDiff = getDifficulty(selectedOpponent.id, levelNum);

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                title={unlocked ? `Target: ${levelDiff.targetScore} points` : 'Locked'}
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

                <div style={{ marginTop: '20px', color: theme.textMuted, fontSize: '12px' }}>
                    Earn stars by reaching the target score!
                </div>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);

        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}15 100%)`,
                    display: 'flex', flexDirection: 'column',
                    color: theme.text, userSelect: 'none',
                    overflow: 'hidden'
                }}
                onMouseMove={handlePointerMove}
                onTouchMove={handlePointerMove}
            >
                {/* Pause overlay */}
                {isPaused && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>PAUSED</h2>
                        <button
                            onClick={() => setIsPaused(false)}
                            style={{
                                padding: '15px 40px', fontSize: '18px',
                                background: theme.accent, border: 'none',
                                borderRadius: '10px', color: 'white', cursor: 'pointer'
                            }}
                        >
                            Resume
                        </button>
                        <button
                            onClick={() => setGameState('select')}
                            style={{
                                marginTop: '10px', padding: '10px 30px',
                                background: 'transparent', border: `1px solid ${theme.border}`,
                                borderRadius: '5px', color: theme.textMuted, cursor: 'pointer'
                            }}
                        >
                            Quit
                        </button>
                    </div>
                )}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 20px', background: 'rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{opp.emoji}</span>
                        <span style={{ color: opp.color }}>Level {currentLevel}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.gold, fontSize: '28px', fontWeight: 'bold' }}>
                            {score}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>
                            Target: {difficulty.targetScore}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {combo > 1 && (
                            <div style={{
                                color: theme.accent, fontWeight: 'bold',
                                animation: 'pulse 0.5s infinite'
                            }}>
                                {combo}x Combo!
                            </div>
                        )}
                        <div style={{
                            fontSize: '24px', fontWeight: 'bold',
                            color: timeLeft <= 10 ? theme.error : theme.text
                        }}>
                            {timeLeft}s
                        </div>
                    </div>
                </div>

                {/* Game area */}
                <div style={{
                    flex: 1, position: 'relative', overflow: 'hidden'
                }}>
                    {/* Falling items */}
                    {fallingItems.map(item => {
                        const itemDef = itemTypes[item.type];
                        const isHidden = item.hidden && item.y < 50;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    position: 'absolute',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '40px',
                                    opacity: isHidden ? 0.1 : 1,
                                    transition: 'opacity 0.3s',
                                    filter: itemDef.type === 'good' ? 'drop-shadow(0 0 10px gold)' : 'none'
                                }}
                            >
                                {itemDef.emoji}
                            </div>
                        );
                    })}

                    {/* Catch effects */}
                    {catchEffects.map(effect => (
                        <div
                            key={effect.id}
                            style={{
                                position: 'absolute',
                                left: `${effect.x}%`,
                                top: `${effect.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: effect.type === 'good' ? theme.gold : theme.error,
                                animation: 'floatUp 0.5s ease-out forwards',
                                pointerEvents: 'none'
                            }}
                        >
                            {effect.points > 0 ? '+' : ''}{effect.points}
                        </div>
                    ))}

                    {/* Player basket */}
                    <div style={{
                        position: 'absolute',
                        left: `${playerX}%`,
                        bottom: '5%',
                        transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '60px' }}>🐻</div>
                        <div style={{
                            fontSize: '40px',
                            marginTop: '-15px'
                        }}>🧺</div>
                    </div>

                    {/* Ground */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '3%',
                        background: `linear-gradient(to top, ${theme.honey}88, transparent)`
                    }} />
                </div>

                {/* Controls hint */}
                <div style={{
                    padding: '10px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)', fontSize: '12px', color: theme.textMuted
                }}>
                    Arrow keys / A,D to move | ESC to pause | Touch/drag on mobile
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);
        const won = score >= difficulty.targetScore;
        const ratio = score / difficulty.targetScore;
        let earnedPoints = 0;
        if (won) {
            if (ratio >= 2) earnedPoints = 4;
            else if (ratio >= 1.5) earnedPoints = 3;
            else if (ratio >= 1.2) earnedPoints = 2;
            else earnedPoints = 1;
        }

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
                    {won ? 'SWEET SUCCESS!' : 'BEE CAREFUL!'}
                </h1>
                <p style={{
                    color: opp.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '20px'
                }}>
                    {opp.emoji} "{won ? opp.loseQuote : opp.winQuote}"
                </p>

                <div style={{
                    background: theme.bgPanel, padding: '20px 40px',
                    borderRadius: '15px', marginBottom: '20px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', color: theme.gold, fontWeight: 'bold' }}>
                        {score}
                    </div>
                    <div style={{ color: theme.textMuted }}>
                        Target: {difficulty.targetScore}
                    </div>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{earnedPoints} Points</span>
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
