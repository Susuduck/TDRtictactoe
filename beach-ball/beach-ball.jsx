const { useState, useEffect, useCallback, useRef } = React;

/**
 * BEACH BALL - Keep It Up!
 *
 * Design Principles:
 * - Pattern Learning: Ball physics become internalized over time
 * - Each opponent introduces NEW ball mechanics to learn
 * - Clear Feedback: Visual hit zones, clear scoring
 * - Flow: Difficulty scales with time and opponent
 * - Agency: Timing and positioning choices matter
 */

const BeachBall = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff6347', accentBright: '#ff7f6a',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces unique ball physics or challenges
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Basic bouncing - learn the timing!',
            gravity: 0.15, bounciness: 0.6, speedIncrease: 0.002, shrinkRate: 0.0005,
            special: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Perfect hits give bonus points!',
            gravity: 0.18, bounciness: 0.55, speedIncrease: 0.003, shrinkRate: 0.0006,
            special: 'perfect_bonus'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'Ball changes size to the beat!',
            gravity: 0.2, bounciness: 0.5, speedIncrease: 0.003, shrinkRate: 0.0007,
            special: 'pulsing_ball'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Wind blows the ball sideways!',
            gravity: 0.2, bounciness: 0.5, speedIncrease: 0.004, shrinkRate: 0.0008,
            special: 'wind'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Ball splits into two - keep both up!',
            gravity: 0.18, bounciness: 0.55, speedIncrease: 0.003, shrinkRate: 0.0006,
            special: 'split_ball'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Ball fades in and out of visibility!',
            gravity: 0.22, bounciness: 0.5, speedIncrease: 0.004, shrinkRate: 0.0008,
            special: 'invisible'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Ice zones slow the ball - plan ahead!',
            gravity: 0.2, bounciness: 0.45, speedIncrease: 0.004, shrinkRate: 0.0009,
            special: 'ice_zones'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Ball curves unpredictably!',
            gravity: 0.22, bounciness: 0.5, speedIncrease: 0.005, shrinkRate: 0.001,
            special: 'curve'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Gravity shifts direction!',
            gravity: 0.2, bounciness: 0.5, speedIncrease: 0.005, shrinkRate: 0.001,
            special: 'gravity_shift'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'ALL challenges combined!',
            gravity: 0.25, bounciness: 0.45, speedIncrease: 0.006, shrinkRate: 0.0012,
            special: 'chaos'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [score, setScore] = useState(0);
    const [targetScore, setTargetScore] = useState(20);
    const [balls, setBalls] = useState([]);
    const [hitZoneSize, setHitZoneSize] = useState(80);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [wind, setWind] = useState(0);
    const [gravityAngle, setGravityAngle] = useState(Math.PI / 2); // Down by default
    const [lastHitResult, setLastHitResult] = useState(null);
    const [perfectCount, setPerfectCount] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [beatPhase, setBeatPhase] = useState(0);
    const [iceZones, setIceZones] = useState([]);
    const [ballOpacity, setBallOpacity] = useState(1);
    const [gameTime, setGameTime] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Refs
    const animationRef = useRef(null);
    const gameAreaRef = useRef(null);
    const audioContextRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('beachball_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('beachball_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Play sound
    const playSound = useCallback((freq, duration = 0.1) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }, []);

    // Create initial ball
    const createBall = useCallback((x = 50, y = 30, vx = 0, vy = 0) => ({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: vx || (Math.random() - 0.5) * 2,
        vy: vy || 0,
        size: 60,
        hue: Math.random() * 60 + 330 // Red to orange hues
    }), []);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        setTargetScore(15 + level * 5 + opponent.id * 3);
        setBalls([createBall()]);
        setHitZoneSize(80 - opponent.id * 3 - level * 2);
        setSpeedMultiplier(1);
        setWind(0);
        setGravityAngle(Math.PI / 2);
        setLastHitResult(null);
        setPerfectCount(0);
        setComboCount(0);
        setBeatPhase(0);
        setBallOpacity(1);
        setGameTime(0);
        setIsGameOver(false);

        // Set up ice zones for Professor Penguin
        if (opponent.special === 'ice_zones' || opponent.special === 'chaos') {
            setIceZones([
                { x: 20, y: 60, width: 25, height: 20 },
                { x: 60, y: 40, width: 20, height: 25 }
            ]);
        } else {
            setIceZones([]);
        }

        setGameState('playing');
    }, [createBall]);

    // Handle ball bop
    const handleBop = useCallback((e) => {
        if (gameState !== 'playing' || isGameOver) return;

        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clickX = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) / rect.width * 100;
        const clickY = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) / rect.height * 100;

        setBalls(prevBalls => {
            let hitAny = false;
            const newBalls = prevBalls.map(ball => {
                const dx = ball.x - clickX;
                const dy = ball.y - clickY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const hitRadius = hitZoneSize / 2;

                if (dist < hitRadius) {
                    hitAny = true;

                    // Calculate hit quality
                    const centerDist = dist / hitRadius;
                    const isPerfect = centerDist < 0.3;
                    const isGood = centerDist < 0.6;

                    // Calculate bop direction (away from click)
                    const angle = Math.atan2(dy, dx);
                    const bopForce = 8 + (1 - centerDist) * 4;

                    // Update score
                    setScore(s => s + (isPerfect ? 2 : 1));
                    setComboCount(c => c + 1);

                    if (isPerfect) {
                        setPerfectCount(p => p + 1);
                        setLastHitResult('perfect');
                        playSound(880, 0.15);
                    } else if (isGood) {
                        setLastHitResult('good');
                        playSound(660, 0.1);
                    } else {
                        setLastHitResult('hit');
                        playSound(440, 0.08);
                    }

                    setTimeout(() => setLastHitResult(null), 300);

                    return {
                        ...ball,
                        vx: Math.cos(angle) * bopForce * 0.5,
                        vy: -bopForce
                    };
                }
                return ball;
            });

            if (!hitAny) {
                setComboCount(0);
            }

            return newBalls;
        });
    }, [gameState, isGameOver, hitZoneSize, playSound]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing' || isGameOver) return;

        const opp = selectedOpponent;
        let lastTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const delta = (now - lastTime) / 16.67; // Normalize to 60fps
            lastTime = now;

            setGameTime(t => t + delta);

            // Update beat phase for pulsing effects
            setBeatPhase(p => (p + 0.05 * delta) % (Math.PI * 2));

            // Update speed multiplier over time
            setSpeedMultiplier(s => s + opp.speedIncrease * delta);

            // Shrink hit zone over time
            setHitZoneSize(hz => Math.max(30, hz - opp.shrinkRate * delta));

            // Wind effect (Radical Raccoon)
            if (opp.special === 'wind' || opp.special === 'chaos') {
                setWind(Math.sin(now / 2000) * 0.3);
            }

            // Gravity shift (Wolf Warrior)
            if (opp.special === 'gravity_shift' || opp.special === 'chaos') {
                setGravityAngle(a => a + 0.002 * delta);
            }

            // Ball visibility (Mysterious Moth)
            if (opp.special === 'invisible' || opp.special === 'chaos') {
                setBallOpacity(Math.sin(now / 1000) * 0.4 + 0.6);
            }

            // Update balls
            setBalls(prevBalls => {
                if (prevBalls.length === 0) return prevBalls;

                const newBalls = prevBalls.map(ball => {
                    let { x, y, vx, vy, size, hue, id } = ball;

                    // Apply gravity
                    const gravX = Math.cos(gravityAngle) * opp.gravity * speedMultiplier * delta;
                    const gravY = Math.sin(gravityAngle) * opp.gravity * speedMultiplier * delta;
                    vx += gravX;
                    vy += gravY;

                    // Apply wind
                    vx += wind * delta;

                    // Curve effect (Sly Snake)
                    if (opp.special === 'curve' || opp.special === 'chaos') {
                        vx += Math.sin(now / 500) * 0.05 * delta;
                    }

                    // Ice zone slowdown
                    for (const zone of iceZones) {
                        if (x > zone.x && x < zone.x + zone.width &&
                            y > zone.y && y < zone.y + zone.height) {
                            vx *= 0.98;
                            vy *= 0.98;
                        }
                    }

                    // Apply velocity
                    x += vx * delta;
                    y += vy * delta;

                    // Bounce off walls
                    if (x < 5) {
                        x = 5;
                        vx = Math.abs(vx) * opp.bounciness;
                    }
                    if (x > 95) {
                        x = 95;
                        vx = -Math.abs(vx) * opp.bounciness;
                    }
                    if (y < 5) {
                        y = 5;
                        vy = Math.abs(vy) * opp.bounciness;
                    }

                    // Pulsing ball size (Disco Dinosaur)
                    if (opp.special === 'pulsing_ball' || opp.special === 'chaos') {
                        size = 50 + Math.sin(beatPhase) * 15;
                    }

                    return { id, x, y, vx, vy, size, hue };
                });

                // Check if any ball hit the ground
                const aliveBalls = newBalls.filter(ball => ball.y < 95);

                if (aliveBalls.length < newBalls.length) {
                    // Ball dropped!
                    playSound(220, 0.3);
                    setIsGameOver(true);
                    setTimeout(() => setGameState('result'), 1000);
                }

                // Split ball mechanic (Electric Eel)
                if ((opp.special === 'split_ball' || opp.special === 'chaos') &&
                    aliveBalls.length === 1 && score > 0 && score % 10 === 0 && aliveBalls[0].y < 50) {
                    const original = aliveBalls[0];
                    return [
                        { ...original, vx: original.vx - 2, id: Date.now() },
                        { ...original, vx: original.vx + 2, id: Date.now() + 1 }
                    ];
                }

                return aliveBalls;
            });

            // Check win condition
            if (score >= targetScore) {
                setGameState('result');
                return;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [gameState, isGameOver, selectedOpponent, score, targetScore, speedMultiplier,
        wind, gravityAngle, iceZones, beatPhase, playSound]);

    // Handle result and progression
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = score >= targetScore;
        if (won && selectedOpponent) {
            const bonus = perfectCount >= 5 ? 1 : 0;
            const points = 1 + bonus;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, targetScore, perfectCount, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f20 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🏐</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>BEACH BALL</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Keep It Up!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 99, 71, 0.4)'
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
                        Click or tap the ball to bop it upward!<br />
                        Keep the ball in the air to score points.<br />
                        The ball speeds up and the hit zone shrinks over time.<br />
                        Master all opponents to become the Beach Ball Champion!
                    </p>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>Back to Menu</a>
            </div>
        );
    }

    // Select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f20 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Challenger</h2>
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
                                            🏐 {opp.mechanic}
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
                }}>Back</button>

                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '15px', padding: '10px 20px',
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    color: theme.textSecondary
                }}>
                    🏐 {selectedOpponent.mechanic}
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

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;

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
                        <span style={{ fontSize: '14px', color: theme.textMuted }}>Level {currentLevel}</span>
                        <span style={{ marginLeft: '15px', color: opp.color }}>{opp.emoji} {opp.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>
                            Score: <span style={{ color: theme.gold, fontWeight: 'bold' }}>{score}</span>
                            <span style={{ color: theme.textMuted }}> / {targetScore}</span>
                        </div>
                        {comboCount >= 3 && (
                            <div style={{ color: theme.success }}>Combo x{comboCount}!</div>
                        )}
                        {perfectCount > 0 && (
                            <div style={{ color: theme.gold }}>Perfect: {perfectCount}</div>
                        )}
                    </div>
                </div>

                {/* Wind indicator */}
                {Math.abs(wind) > 0.05 && (
                    <div style={{
                        position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px',
                        fontSize: '14px', zIndex: 10
                    }}>
                        Wind: {wind > 0 ? '→' : '←'} {Math.abs(wind * 10).toFixed(1)}
                    </div>
                )}

                {/* Game area */}
                <div
                    ref={gameAreaRef}
                    onClick={handleBop}
                    onTouchStart={handleBop}
                    style={{
                        flex: 1, position: 'relative',
                        background: `linear-gradient(to bottom,
                            ${opp.color}11 0%,
                            ${theme.bgDark} 70%,
                            #3a2a18 100%)`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        minHeight: '400px'
                    }}
                >
                    {/* Beach/sand at bottom */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '10%',
                        background: 'linear-gradient(to bottom, #d4a840, #c49830)'
                    }} />

                    {/* Ice zones */}
                    {iceZones.map((zone, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${zone.x}%`, top: `${zone.y}%`,
                            width: `${zone.width}%`, height: `${zone.height}%`,
                            background: 'rgba(100, 200, 255, 0.2)',
                            border: '2px solid rgba(100, 200, 255, 0.4)',
                            borderRadius: '10px'
                        }}>
                            <span style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '24px', opacity: 0.5
                            }}>❄️</span>
                        </div>
                    ))}

                    {/* Balls */}
                    {balls.map(ball => (
                        <div key={ball.id} style={{
                            position: 'absolute',
                            left: `${ball.x}%`, top: `${ball.y}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: ballOpacity
                        }}>
                            {/* Hit zone indicator */}
                            <div style={{
                                position: 'absolute',
                                left: '50%', top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: `${hitZoneSize}px`, height: `${hitZoneSize}px`,
                                border: `2px dashed rgba(255,255,255,0.3)`,
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }} />
                            {/* Ball */}
                            <div style={{
                                width: `${ball.size}px`, height: `${ball.size}px`,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 30% 30%,
                                    hsl(${ball.hue}, 80%, 70%),
                                    hsl(${ball.hue}, 80%, 50%))`,
                                boxShadow: `0 4px 20px rgba(0,0,0,0.4),
                                           inset 0 -5px 15px rgba(0,0,0,0.2),
                                           inset 0 5px 15px rgba(255,255,255,0.3)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: `${ball.size * 0.4}px`
                            }}>
                                🏐
                            </div>
                        </div>
                    ))}

                    {/* Hit result indicator */}
                    {lastHitResult && (
                        <div style={{
                            position: 'absolute',
                            top: '30%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '36px', fontWeight: 'bold',
                            color: lastHitResult === 'perfect' ? theme.gold
                                : lastHitResult === 'good' ? theme.success
                                : theme.accent,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            animation: 'pop 0.3s ease-out',
                            pointerEvents: 'none'
                        }}>
                            {lastHitResult === 'perfect' && 'PERFECT! +2'}
                            {lastHitResult === 'good' && 'Good! +1'}
                            {lastHitResult === 'hit' && '+1'}
                        </div>
                    )}

                    {/* Game over overlay */}
                    {isGameOver && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <div style={{ fontSize: '80px' }}>💥</div>
                            <div style={{ fontSize: '36px', color: theme.error, marginTop: '20px' }}>
                                DROPPED!
                            </div>
                        </div>
                    )}

                    {/* Gravity indicator */}
                    {(opp.special === 'gravity_shift' || opp.special === 'chaos') && (
                        <div style={{
                            position: 'absolute', bottom: '15%', right: '10px',
                            background: 'rgba(0,0,0,0.5)', padding: '10px',
                            borderRadius: '50%'
                        }}>
                            <div style={{
                                transform: `rotate(${gravityAngle - Math.PI/2}rad)`,
                                fontSize: '24px'
                            }}>⬇️</div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '15px 20px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '14px', color: theme.textMuted }}>
                        Tap the ball to keep it up!
                        <span style={{ marginLeft: '15px' }}>
                            Hit Zone: <span style={{ color: theme.accent }}>{Math.round(hitZoneSize)}px</span>
                        </span>
                        <span style={{ marginLeft: '15px' }}>
                            Speed: <span style={{ color: theme.accent }}>{speedMultiplier.toFixed(2)}x</span>
                        </span>
                    </div>
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

    // Result screen
    if (gameState === 'result') {
        const won = score >= targetScore;
        const excellent = won && perfectCount >= 5;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {excellent ? '🏆' : won ? '✓' : '😢'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px'
                }}>
                    {excellent ? 'EXCELLENT!' : won ? 'SUCCESS!' : 'DROPPED!'}
                </h1>

                <div style={{
                    fontSize: '28px', marginBottom: '10px',
                    color: theme.accent
                }}>
                    Score: {score} / {targetScore}
                </div>

                {perfectCount > 0 && (
                    <div style={{ fontSize: '18px', marginBottom: '20px', color: theme.gold }}>
                        Perfect Hits: {perfectCount}
                    </div>
                )}

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent.id)}/10 Stars)
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
