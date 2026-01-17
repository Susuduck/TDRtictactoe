const { useState, useEffect, useCallback, useRef } = React;

/**
 * BASKETBALL TOSS - Honey Hoops
 *
 * Design Principles Applied:
 * - Pattern Learning: Power meter has learnable timing patterns, wind has predictable cycles
 * - Flow State: Miss = easier next shot, hit = progressively harder (dynamic difficulty)
 * - 4 Keys: Hard Fun (precision), Easy Fun (new court gimmicks per opponent)
 * - Clear Feedback: Ball trajectory shows exactly where you went wrong
 * - Agency: Choose when to shoot, power timing is skill-based
 * - Variation: Each opponent has unique court mechanics, not just "faster"
 */

const Basketball = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#f4a460', accentBright: '#ffc080',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces NEW MECHANICS to learn, not just speed
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            court: 'basic', // Stationary hoop, no wind
            mechanic: 'Learn the arc - power = distance',
            hoopSize: 1.2, wind: 0, hoopMove: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            court: 'gentle_wind', // Introduces wind mechanic
            mechanic: 'Wind pushes the ball - compensate!',
            hoopSize: 1.1, wind: 0.3, hoopMove: 'none'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            court: 'rhythm_hoop', // Hoop pulses in size to a beat
            mechanic: 'Hoop expands on the BEAT - time your shot!',
            hoopSize: 0.8, wind: 0.2, hoopMove: 'pulse'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            court: 'obstacles', // Trash cans block some shots
            mechanic: 'Avoid the obstacles in your path',
            hoopSize: 1.0, wind: 0.4, hoopMove: 'none', obstacles: true
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            court: 'charged_zones', // Zones boost/slow ball
            mechanic: 'Electric zones change ball speed!',
            hoopSize: 1.0, wind: 0.3, hoopMove: 'none', chargedZones: true
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            court: 'spotlight', // Can only see ball in spotlight
            mechanic: 'Follow the spotlight - dark zones hide the ball',
            hoopSize: 1.0, wind: 0.4, hoopMove: 'none', spotlight: true
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            court: 'ice', // Ball slides on ice patches
            mechanic: 'Ice affects ball trajectory - plan ahead',
            hoopSize: 0.9, wind: 0.5, hoopMove: 'none', ice: true
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            court: 'moving_hoop', // Hoop moves side to side
            mechanic: 'The hoop slithers! Track its movement',
            hoopSize: 0.9, wind: 0.4, hoopMove: 'horizontal'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            court: 'multi_hoop', // Multiple hoops, only one active
            mechanic: 'The pack moves together - find the active hoop',
            hoopSize: 0.85, wind: 0.5, hoopMove: 'none', multiHoop: true
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            court: 'chaos', // All mechanics combined
            mechanic: 'EVERYTHING! Master all skills to win',
            hoopSize: 0.8, wind: 0.6, hoopMove: 'vertical', allMechanics: true
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [shotsRemaining, setShotsRemaining] = useState(10);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [powerMeter, setPowerMeter] = useState(0);
    const [powerDirection, setPowerDirection] = useState(1);
    const [isCharging, setIsCharging] = useState(false);
    const [ball, setBall] = useState(null);
    const [shotResult, setShotResult] = useState(null);
    const [hoopX, setHoopX] = useState(75);
    const [hoopY, setHoopY] = useState(25);
    const [hoopScale, setHoopScale] = useState(1);
    const [wind, setWind] = useState(0);
    const [obstacles, setObstacles] = useState([]);
    const [activeHoop, setActiveHoop] = useState(0);
    const [beatPhase, setBeatPhase] = useState(0);
    const [dynamicDifficulty, setDynamicDifficulty] = useState(1.0); // Flow adjustment

    // Animation
    const animationRef = useRef(null);
    const canvasRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('basketball_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('basketball_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Get difficulty with dynamic flow adjustment
    const getDifficulty = useCallback((oppIdx, level) => {
        const base = oppIdx * 0.08 + (level - 1) * 0.015;
        const flow = dynamicDifficulty; // Adjusts based on recent performance

        return {
            meterSpeed: (2 + base * 4) * flow,
            sweetSpotSize: Math.max(0.08, 0.2 - base * 0.1) / flow,
            windStrength: opponents[oppIdx].wind * (1 + level * 0.1) * flow,
            hoopMoveSpeed: (0.5 + base * 1.5) * flow,
        };
    }, [dynamicDifficulty]);

    // Power meter animation
    useEffect(() => {
        if (gameState !== 'playing' || ball) return;

        const diff = getDifficulty(selectedOpponent.id, currentLevel);
        const interval = setInterval(() => {
            setPowerMeter(p => {
                let newP = p + powerDirection * diff.meterSpeed;
                if (newP >= 100) {
                    setPowerDirection(-1);
                    newP = 100;
                } else if (newP <= 0) {
                    setPowerDirection(1);
                    newP = 0;
                }
                return newP;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [gameState, ball, powerDirection, selectedOpponent, currentLevel, getDifficulty]);

    // Hoop movement animation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const diff = getDifficulty(opp.id, currentLevel);

        const interval = setInterval(() => {
            // Beat for rhythm hoop
            setBeatPhase(p => (p + 0.05) % (Math.PI * 2));

            // Hoop pulsing (Disco Dinosaur)
            if (opp.hoopMove === 'pulse') {
                const pulse = Math.sin(beatPhase) * 0.3 + 1;
                setHoopScale(pulse * opp.hoopSize);
            }

            // Horizontal movement (Sly Snake)
            if (opp.hoopMove === 'horizontal') {
                setHoopX(x => {
                    const newX = x + Math.sin(Date.now() / 1000) * diff.hoopMoveSpeed;
                    return Math.max(60, Math.min(90, newX));
                });
            }

            // Vertical movement (Grand Master)
            if (opp.hoopMove === 'vertical') {
                setHoopY(y => {
                    const newY = 25 + Math.sin(Date.now() / 800) * 10;
                    return newY;
                });
            }

            // Wind variation
            setWind(opp.wind * Math.sin(Date.now() / 2000) * (1 + currentLevel * 0.1));

        }, 16);

        return () => clearInterval(interval);
    }, [gameState, selectedOpponent, currentLevel, beatPhase, getDifficulty]);

    // Shoot the ball
    const shoot = useCallback(() => {
        if (ball || shotsRemaining <= 0) return;

        const power = powerMeter / 100;
        const diff = getDifficulty(selectedOpponent.id, currentLevel);

        // Calculate sweet spot hit quality
        const sweetSpotCenter = 0.75; // 75% power is ideal
        const distFromSweet = Math.abs(power - sweetSpotCenter);
        const hitQuality = Math.max(0, 1 - distFromSweet / diff.sweetSpotSize);

        setBall({
            x: 15,
            y: 70,
            vx: 2 + power * 3,
            vy: -4 - power * 3,
            power,
            hitQuality,
            trail: []
        });

        setShotsRemaining(s => s - 1);
    }, [ball, powerMeter, shotsRemaining, selectedOpponent, currentLevel, getDifficulty]);

    // Ball physics
    useEffect(() => {
        if (!ball || gameState !== 'playing') return;

        const opp = selectedOpponent;
        const gravity = 0.15;
        const windEffect = wind * 0.02;

        const animate = () => {
            setBall(b => {
                if (!b) return null;

                let { x, y, vx, vy, trail, power, hitQuality } = b;

                // Apply physics
                vy += gravity;
                vx += windEffect;

                // Ice effect (Professor Penguin) - ball curves
                if (opp.ice && x > 40 && x < 60) {
                    vx *= 0.98;
                    vy *= 1.02;
                }

                // Charged zones (Electric Eel)
                if (opp.chargedZones) {
                    if (x > 30 && x < 50 && y > 30 && y < 50) {
                        vx *= 1.1;
                        vy *= 0.9;
                    }
                }

                x += vx;
                y += vy;

                // Add trail point
                trail = [...trail.slice(-20), { x, y }];

                // Check if ball reached hoop area
                const hoopCenterX = hoopX;
                const hoopCenterY = hoopY;
                const effectiveHoopSize = 8 * (opp.hoopSize || 1) * hoopScale;

                // Scoring based on accuracy
                const distToHoop = Math.sqrt((x - hoopCenterX) ** 2 + (y - hoopCenterY) ** 2);

                if (y > hoopCenterY - 5 && y < hoopCenterY + 15 && Math.abs(x - hoopCenterX) < effectiveHoopSize) {
                    // HIT! Determine quality
                    let result;
                    let points;

                    if (distToHoop < effectiveHoopSize * 0.3) {
                        result = 'swish';
                        points = 3;
                    } else if (distToHoop < effectiveHoopSize * 0.6) {
                        result = 'clean';
                        points = 2;
                    } else {
                        result = 'rim';
                        points = 1;
                    }

                    // Streak bonus
                    const streakBonus = streak >= 3 ? 2 : 1;
                    points *= streakBonus;

                    setScore(s => s + points);
                    setStreak(st => st + 1);
                    setShotResult({ type: result, points });

                    // Flow: Made shot = slightly harder
                    setDynamicDifficulty(d => Math.min(1.3, d + 0.05));

                    setTimeout(() => {
                        setBall(null);
                        setShotResult(null);
                    }, 1000);
                    return { ...b, x, y, vx: 0, vy: 0, trail };
                }

                // Check for miss (ball goes off screen or hits ground)
                if (y > 95 || x > 100 || x < 0) {
                    setStreak(0);
                    setShotResult({ type: 'miss', points: 0 });

                    // Flow: Miss = slightly easier
                    setDynamicDifficulty(d => Math.max(0.7, d - 0.08));

                    setTimeout(() => {
                        setBall(null);
                        setShotResult(null);
                    }, 800);
                    return null;
                }

                // Check obstacles (Radical Raccoon)
                if (opp.obstacles) {
                    for (const obs of obstacles) {
                        if (x > obs.x - 5 && x < obs.x + 5 && y > obs.y - 8 && y < obs.y + 8) {
                            // Bounce off obstacle
                            vx *= -0.5;
                            vy *= 0.5;
                        }
                    }
                }

                return { ...b, x, y, vx, vy, trail };
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [ball, gameState, wind, hoopX, hoopY, hoopScale, selectedOpponent, obstacles, streak]);

    // Generate obstacles for Raccoon court
    useEffect(() => {
        if (selectedOpponent?.obstacles) {
            setObstacles([
                { x: 35, y: 50 },
                { x: 50, y: 35 + currentLevel * 2 },
            ]);
        } else {
            setObstacles([]);
        }
    }, [selectedOpponent, currentLevel]);

    // Check end of round
    useEffect(() => {
        if (shotsRemaining === 0 && !ball && gameState === 'playing') {
            // Calculate result
            const maxScore = 30 * 2; // 10 shots * 3 points * 2x streak potential
            const percentage = score / maxScore;

            setTimeout(() => {
                if (percentage >= 0.4) { // Need 40% to "win"
                    const points = percentage >= 0.7 ? 2 : 1;
                    setProgression(prev => {
                        const newPoints = [...prev.starPoints];
                        newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                        return { ...prev, starPoints: newPoints };
                    });
                    setGameState('result');
                } else {
                    setGameState('result');
                }
            }, 500);
        }
    }, [shotsRemaining, ball, gameState, score, selectedOpponent]);

    // Start match
    const startMatch = (opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setShotsRemaining(10);
        setScore(0);
        setStreak(0);
        setPowerMeter(0);
        setPowerDirection(1);
        setBall(null);
        setShotResult(null);
        setHoopX(75);
        setHoopY(25);
        setHoopScale(opponent.hoopSize || 1);
        setDynamicDifficulty(1.0);
        setGameState('playing');
    };

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space' && gameState === 'playing') {
                e.preventDefault();
                shoot();
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, shoot]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d2520 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🏀</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>HONEY HOOPS</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Time your shot to sink the basket!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(244, 164, 96, 0.4)'
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

    // Select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d2520 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Court</h2>
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
                                onClick={() => unlocked && setSelectedOpponent(opp) && setGameState('level_select')}
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
                                    }}>✓ MASTERED</div>
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
                                            🎯 {opp.mechanic}
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
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    color: theme.textSecondary
                }}>
                    🎯 {selectedOpponent.mechanic}
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
                padding: '20px', color: theme.text, userSelect: 'none'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '10px'
                }}>
                    <div>
                        <span style={{ fontSize: '14px', color: theme.textMuted }}>Level {currentLevel}</span>
                        <span style={{ marginLeft: '15px', color: opp.color }}>{opp.emoji} {opp.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>Score: <span style={{ color: theme.gold, fontWeight: 'bold' }}>{score}</span></div>
                        <div>Shots: <span style={{ color: theme.accent }}>{shotsRemaining}</span></div>
                        {streak >= 2 && <div style={{ color: theme.success }}>🔥 Streak x{streak}!</div>}
                    </div>
                </div>

                {/* Game area */}
                <div style={{
                    flex: 1, position: 'relative',
                    background: `linear-gradient(to bottom, #1a2a3a, #2a3a4a)`,
                    borderRadius: '15px', overflow: 'hidden',
                    minHeight: '400px'
                }}>
                    {/* Wind indicator */}
                    {Math.abs(wind) > 0.1 && (
                        <div style={{
                            position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px',
                            fontSize: '14px'
                        }}>
                            💨 Wind: {wind > 0 ? '→' : '←'} {Math.abs(wind * 10).toFixed(1)}
                        </div>
                    )}

                    {/* Court/Hoop */}
                    <div style={{
                        position: 'absolute',
                        left: `${hoopX}%`, top: `${hoopY}%`,
                        transform: `translate(-50%, -50%) scale(${hoopScale})`,
                        transition: opp.hoopMove === 'pulse' ? 'none' : 'left 0.1s, top 0.1s'
                    }}>
                        <div style={{ fontSize: '60px' }}>🏀</div>
                        <div style={{
                            width: '80px', height: '10px',
                            background: '#ff6600', borderRadius: '5px',
                            marginTop: '-30px', marginLeft: '10px'
                        }} />
                    </div>

                    {/* Obstacles (Raccoon) */}
                    {opp.obstacles && obstacles.map((obs, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${obs.x}%`, top: `${obs.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '40px'
                        }}>🗑️</div>
                    ))}

                    {/* Player */}
                    <div style={{
                        position: 'absolute', left: '15%', bottom: '10%',
                        fontSize: '50px'
                    }}>🐻</div>

                    {/* Ball */}
                    {ball && (
                        <>
                            {/* Trail */}
                            {ball.trail.map((t, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${t.x}%`, top: `${t.y}%`,
                                    width: '10px', height: '10px',
                                    background: `rgba(244, 164, 96, ${i / ball.trail.length * 0.5})`,
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }} />
                            ))}
                            {/* Ball */}
                            <div style={{
                                position: 'absolute',
                                left: `${ball.x}%`, top: `${ball.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: '30px'
                            }}>🏀</div>
                        </>
                    )}

                    {/* Shot result */}
                    {shotResult && (
                        <div style={{
                            position: 'absolute', top: '40%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: shotResult.type === 'swish' ? '48px' : '36px',
                            fontWeight: 'bold',
                            color: shotResult.type === 'miss' ? theme.error : theme.gold,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            animation: 'pop 0.3s ease-out'
                        }}>
                            {shotResult.type === 'swish' && '🎯 SWISH! +' + shotResult.points}
                            {shotResult.type === 'clean' && '✓ Clean! +' + shotResult.points}
                            {shotResult.type === 'rim' && 'Rim! +' + shotResult.points}
                            {shotResult.type === 'miss' && '✗ Miss!'}
                        </div>
                    )}

                    {/* Spotlight effect (Moth) */}
                    {opp.spotlight && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle at 50% 50%, transparent 100px, rgba(0,0,0,0.9) 200px)',
                            pointerEvents: 'none'
                        }} />
                    )}
                </div>

                {/* Power meter */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px', color: theme.textMuted }}>
                        Power Meter (aim for 75% sweet spot)
                    </div>
                    <div style={{
                        width: '100%', maxWidth: '500px', height: '40px',
                        background: theme.bgDark, borderRadius: '20px',
                        margin: '0 auto', position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Sweet spot indicator */}
                        <div style={{
                            position: 'absolute',
                            left: '70%', width: '10%', top: 0, bottom: 0,
                            background: 'rgba(80, 200, 120, 0.3)',
                            borderLeft: '2px solid rgba(80, 200, 120, 0.5)',
                            borderRight: '2px solid rgba(80, 200, 120, 0.5)'
                        }} />
                        {/* Power fill */}
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${powerMeter}%`,
                            background: `linear-gradient(90deg, ${theme.accent}, ${theme.gold})`,
                            transition: 'width 0.05s linear'
                        }} />
                        {/* Marker */}
                        <div style={{
                            position: 'absolute',
                            left: `${powerMeter}%`, top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '4px', height: '50px',
                            background: 'white',
                            borderRadius: '2px'
                        }} />
                    </div>

                    <button
                        onClick={shoot}
                        disabled={!!ball}
                        style={{
                            marginTop: '20px',
                            padding: '15px 60px', fontSize: '24px',
                            background: ball ? theme.bgDark : `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '15px',
                            color: ball ? theme.textMuted : 'white',
                            cursor: ball ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {ball ? 'Shooting...' : 'SHOOT! (SPACE)'}
                    </button>
                </div>

                <style>{`
                    @keyframes pop {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                        50% { transform: translate(-50%, -50%) scale(1.2); }
                        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const maxScore = 60;
        const percentage = score / maxScore;
        const won = percentage >= 0.4;
        const excellent = percentage >= 0.7;

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
                    {excellent ? 'EXCELLENT!' : won ? 'GOOD GAME!' : 'TRY AGAIN'}
                </h1>

                <div style={{
                    fontSize: '36px', marginBottom: '20px',
                    color: theme.gold
                }}>
                    Score: {score}
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
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
                        Play Again
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
