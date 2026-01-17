const { useState, useEffect, useCallback, useRef } = React;

/**
 * SUBMARINE - Worm Tunnel
 *
 * Design Principles:
 * - Pattern Learning: Tunnel shapes become recognizable patterns
 * - Each opponent introduces NEW tunnel mechanics (not just narrower)
 * - Flow: Distance-based difficulty, but each world has unique challenges
 * - Clear Feedback: Near-miss effects, collision is obvious
 * - Agency: Choose path through collectibles vs safety
 */

const Submarine = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#4169e1', accentBright: '#6189ff',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces unique tunnel mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Wide tunnels - learn the controls',
            tunnelWidth: 0.5, speed: 1, gravity: 0.15, special: 'none',
            theme: { wall: '#3d5c3d', bg: '#1a251a' }
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Honey drops appear - collect for bonus!',
            tunnelWidth: 0.45, speed: 1.1, gravity: 0.15, special: 'collectibles',
            theme: { wall: '#5c4d3d', bg: '#25201a' }
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'Rhythm tunnels - walls pulse to the beat!',
            tunnelWidth: 0.4, speed: 1.15, gravity: 0.15, special: 'rhythm',
            theme: { wall: '#5d3d5c', bg: '#251a25' }
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Obstacles in the tunnel - navigate around!',
            tunnelWidth: 0.4, speed: 1.2, gravity: 0.16, special: 'obstacles',
            theme: { wall: '#4d4d5c', bg: '#1a1a20' }
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Speed zones - boost and slow areas!',
            tunnelWidth: 0.38, speed: 1.25, gravity: 0.16, special: 'speed_zones',
            theme: { wall: '#3d4d5c', bg: '#1a2025' }
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Dark zones - can\'t see the tunnel!',
            tunnelWidth: 0.36, speed: 1.3, gravity: 0.17, special: 'darkness',
            theme: { wall: '#5c4d55', bg: '#201a1d' }
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Ice physics - slippery controls!',
            tunnelWidth: 0.34, speed: 1.35, gravity: 0.12, special: 'ice',
            theme: { wall: '#4d6080', bg: '#1a2030' }
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Winding tunnels - sharp turns!',
            tunnelWidth: 0.32, speed: 1.4, gravity: 0.17, special: 'winding',
            theme: { wall: '#4d5c4d', bg: '#1a201a' }
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Moving walls - the tunnel shifts!',
            tunnelWidth: 0.30, speed: 1.45, gravity: 0.18, special: 'moving_walls',
            theme: { wall: '#505060', bg: '#1a1a20' }
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'ALL mechanics combined!',
            tunnelWidth: 0.28, speed: 1.5, gravity: 0.18, special: 'all',
            theme: { wall: '#5c5040', bg: '#201a15' }
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Game state
    const [playerY, setPlayerY] = useState(50);
    const [playerVY, setPlayerVY] = useState(0);
    const [distance, setDistance] = useState(0);
    const [score, setScore] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [tunnelData, setTunnelData] = useState([]);
    const [collectibles, setCollectibles] = useState([]);
    const [obstacles, setObstacles] = useState([]);
    const [speedZones, setSpeedZones] = useState([]);
    const [darkZones, setDarkZones] = useState([]);
    const [beatPhase, setBeatPhase] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(1);
    const [nearMiss, setNearMiss] = useState(false);
    const [targetDistance, setTargetDistance] = useState(1000);

    // Refs
    const gameLoopRef = useRef(null);
    const lastUpdateRef = useRef(Date.now());

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('submarine_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('submarine_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Generate tunnel segment
    const generateTunnel = useCallback((startX, opp, level) => {
        const segments = [];
        const levelMod = 1 + (level - 1) * 0.1;
        const width = opp.tunnelWidth / levelMod;

        let currentCenter = 50;
        let x = startX;

        while (x < startX + 200) {
            // Determine tunnel center movement
            let centerChange = (Math.random() - 0.5) * 10;

            // Winding tunnels for Snake
            if (opp.special === 'winding' || opp.special === 'all') {
                centerChange = Math.sin(x / 30) * 15;
            }

            currentCenter = Math.max(20, Math.min(80, currentCenter + centerChange));

            const tunnelHeight = (100 * width);
            const top = currentCenter - tunnelHeight / 2;
            const bottom = currentCenter + tunnelHeight / 2;

            segments.push({
                x,
                top,
                bottom,
                center: currentCenter
            });

            x += 5;
        }

        return segments;
    }, []);

    // Generate collectibles
    const generateCollectibles = useCallback((segments, opp) => {
        if (opp.special !== 'collectibles' && opp.special !== 'all') return [];

        const items = [];
        for (let i = 0; i < segments.length; i += 20) {
            if (Math.random() < 0.3) {
                const seg = segments[i];
                items.push({
                    x: seg.x,
                    y: seg.center + (Math.random() - 0.5) * 20,
                    type: Math.random() < 0.1 ? 'golden' : 'honey'
                });
            }
        }
        return items;
    }, []);

    // Generate obstacles
    const generateObstacles = useCallback((segments, opp) => {
        if (opp.special !== 'obstacles' && opp.special !== 'all') return [];

        const items = [];
        for (let i = 10; i < segments.length; i += 25) {
            if (Math.random() < 0.4) {
                const seg = segments[i];
                items.push({
                    x: seg.x,
                    y: seg.center + (Math.random() - 0.5) * 15,
                    size: 15 + Math.random() * 10
                });
            }
        }
        return items;
    }, []);

    // Generate speed zones
    const generateSpeedZones = useCallback((segments, opp) => {
        if (opp.special !== 'speed_zones' && opp.special !== 'all') return [];

        const zones = [];
        for (let i = 0; i < segments.length; i += 40) {
            if (Math.random() < 0.5) {
                zones.push({
                    x: segments[i].x,
                    width: 30,
                    type: Math.random() < 0.5 ? 'boost' : 'slow'
                });
            }
        }
        return zones;
    }, []);

    // Generate dark zones
    const generateDarkZones = useCallback((segments, opp) => {
        if (opp.special !== 'darkness' && opp.special !== 'all') return [];

        const zones = [];
        for (let i = 20; i < segments.length; i += 50) {
            if (Math.random() < 0.4) {
                zones.push({
                    x: segments[i].x,
                    width: 40 + Math.random() * 30
                });
            }
        }
        return zones;
    }, []);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setPlayerY(50);
        setPlayerVY(0);
        setDistance(0);
        setScore(0);
        setIsHolding(false);
        setCurrentSpeed(opponent.speed);
        setNearMiss(false);

        // Calculate target distance based on level
        const target = 500 + level * 150 + opponent.id * 100;
        setTargetDistance(target);

        // Generate initial tunnel
        const tunnel = generateTunnel(0, opponent, level);
        setTunnelData(tunnel);
        setCollectibles(generateCollectibles(tunnel, opponent));
        setObstacles(generateObstacles(tunnel, opponent));
        setSpeedZones(generateSpeedZones(tunnel, opponent));
        setDarkZones(generateDarkZones(tunnel, opponent));

        setGameState('playing');
    }, [generateTunnel, generateCollectibles, generateObstacles, generateSpeedZones, generateDarkZones]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.1;

        const loop = () => {
            const now = Date.now();
            const delta = (now - lastUpdateRef.current) / 16.67; // Normalize to ~60fps
            lastUpdateRef.current = now;

            // Update player physics
            setPlayerVY(vy => {
                let newVY = vy;

                // Apply gravity or lift
                if (isHolding) {
                    newVY -= 0.3 * delta; // Lift
                } else {
                    newVY += opp.gravity * delta; // Fall
                }

                // Ice physics - slower response
                if (opp.special === 'ice' || opp.special === 'all') {
                    newVY *= 0.95;
                }

                // Clamp velocity
                return Math.max(-4, Math.min(4, newVY));
            });

            setPlayerY(y => {
                let newY = y + playerVY * delta;
                return Math.max(5, Math.min(95, newY));
            });

            // Update distance
            setDistance(d => {
                const newDist = d + currentSpeed * delta;

                // Check win condition
                if (newDist >= targetDistance) {
                    setTimeout(() => setGameState('result'), 100);
                }

                return newDist;
            });

            // Update score based on distance
            setScore(Math.floor(distance / 10));

            // Check collision with tunnel
            const playerX = 20; // Player is always at 20% from left
            const relevantSegments = tunnelData.filter(
                seg => Math.abs(seg.x - (distance % 200) - playerX) < 10
            );

            if (relevantSegments.length > 0) {
                const seg = relevantSegments[0];

                // Rhythm pulse effect
                let effectiveTop = seg.top;
                let effectiveBottom = seg.bottom;

                if ((opp.special === 'rhythm' || opp.special === 'all') && beatPhase < 2) {
                    const pulse = Math.sin(beatPhase * Math.PI) * 5;
                    effectiveTop += pulse;
                    effectiveBottom -= pulse;
                }

                // Moving walls effect
                if (opp.special === 'moving_walls' || opp.special === 'all') {
                    const shift = Math.sin(distance / 50) * 8;
                    effectiveTop += shift;
                    effectiveBottom += shift;
                }

                // Check collision
                if (playerY < effectiveTop + 3 || playerY > effectiveBottom - 3) {
                    setGameState('result');
                    return;
                }

                // Near miss detection
                if (playerY < effectiveTop + 8 || playerY > effectiveBottom - 8) {
                    setNearMiss(true);
                    setTimeout(() => setNearMiss(false), 200);
                }
            }

            // Check obstacle collision
            obstacles.forEach(obs => {
                const obsX = obs.x - (distance % 200);
                if (Math.abs(obsX - playerX) < obs.size / 3 && Math.abs(playerY - obs.y) < obs.size / 3) {
                    setGameState('result');
                }
            });

            // Collect items
            setCollectibles(items => {
                return items.filter(item => {
                    const itemX = item.x - (distance % 200);
                    if (Math.abs(itemX - playerX) < 5 && Math.abs(playerY - item.y) < 5) {
                        setScore(s => s + (item.type === 'golden' ? 50 : 10));
                        return false;
                    }
                    return true;
                });
            });

            // Speed zones
            speedZones.forEach(zone => {
                const zoneX = zone.x - (distance % 200);
                if (zoneX > playerX - 10 && zoneX < playerX + 10) {
                    setCurrentSpeed(zone.type === 'boost' ? opp.speed * 1.5 : opp.speed * 0.7);
                }
            });

            // Generate more tunnel as needed
            if (distance > tunnelData.length * 2.5 - 200) {
                const newTunnel = generateTunnel(tunnelData.length * 5, opp, currentLevel);
                setTunnelData(t => [...t, ...newTunnel]);
                setCollectibles(c => [...c, ...generateCollectibles(newTunnel, opp)]);
                setObstacles(o => [...o, ...generateObstacles(newTunnel, opp)]);
                setSpeedZones(s => [...s, ...generateSpeedZones(newTunnel, opp)]);
                setDarkZones(d => [...d, ...generateDarkZones(newTunnel, opp)]);
            }

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        lastUpdateRef.current = Date.now();
        gameLoopRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, selectedOpponent, currentLevel, isHolding, playerVY, distance,
        tunnelData, obstacles, collectibles, speedZones, beatPhase, currentSpeed,
        targetDistance, generateTunnel, generateCollectibles, generateObstacles,
        generateSpeedZones, generateDarkZones]);

    // Beat timer for rhythm
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 500);
        return () => clearInterval(interval);
    }, [gameState]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = distance >= targetDistance;
        if (won) {
            const percentage = score / (targetDistance / 5);
            const points = percentage >= 1.5 ? 2 : 1;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, distance, targetDistance, score, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleDown = () => setIsHolding(true);
        const handleUp = () => setIsHolding(false);

        window.addEventListener('mousedown', handleDown);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchstart', handleDown);
        window.addEventListener('touchend', handleUp);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsHolding(true);
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') setIsHolding(false);
        });

        return () => {
            window.removeEventListener('mousedown', handleDown);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchstart', handleDown);
            window.removeEventListener('touchend', handleUp);
        };
    }, [gameState]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1a2035 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🚇</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>WORM TUNNEL</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Navigate the underground!</p>

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1a2035 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Tunnel</h2>
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
                                    background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${opp.theme.bg})` : theme.bgDark,
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
                                            🚇 {opp.mechanic}
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
                    🚇 {selectedOpponent.mechanic}
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
        const progressPercent = Math.min(100, (distance / targetDistance) * 100);

        // Calculate darkness effect
        const inDarkZone = darkZones.some(z => {
            const zx = z.x - (distance % 200);
            return zx > -z.width && zx < 100;
        });

        return (
            <div style={{
                minHeight: '100vh',
                background: opp.theme.bg,
                display: 'flex', flexDirection: 'column',
                color: theme.text, userSelect: 'none'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 20px', background: 'rgba(0,0,0,0.3)'
                }}>
                    <div>🎯 Score: <span style={{ color: theme.gold }}>{score}</span></div>
                    <div style={{ flex: 1, margin: '0 20px' }}>
                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '3px' }}>
                            Distance: {Math.floor(distance)}m / {targetDistance}m
                        </div>
                        <div style={{ height: '8px', background: theme.bgDark, borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${progressPercent}%`,
                                background: `linear-gradient(90deg, ${opp.color}, ${theme.gold})`,
                                transition: 'width 0.1s'
                            }} />
                        </div>
                    </div>
                    <div style={{ color: opp.color }}>{opp.emoji} Level {currentLevel}</div>
                </div>

                {/* Game area */}
                <div style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    filter: (opp.special === 'darkness' || opp.special === 'all') && inDarkZone ? 'brightness(0.1)' : 'none'
                }}>
                    {/* Tunnel rendering */}
                    <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                        {/* Top wall */}
                        <path
                            d={tunnelData.slice(0, 50).map((seg, i) => {
                                const x = (seg.x - (distance % 200) + 200) % 200;
                                const xPercent = (x / 200) * 100;
                                let top = seg.top;

                                // Rhythm pulse
                                if ((opp.special === 'rhythm' || opp.special === 'all') && beatPhase < 2) {
                                    top += Math.sin(beatPhase * Math.PI) * 5;
                                }
                                // Moving walls
                                if (opp.special === 'moving_walls' || opp.special === 'all') {
                                    top += Math.sin(distance / 50) * 8;
                                }

                                return `${i === 0 ? 'M' : 'L'} ${xPercent}% ${top}%`;
                            }).join(' ') + ' L 100% 0 L 0 0 Z'}
                            fill={opp.theme.wall}
                        />
                        {/* Bottom wall */}
                        <path
                            d={tunnelData.slice(0, 50).map((seg, i) => {
                                const x = (seg.x - (distance % 200) + 200) % 200;
                                const xPercent = (x / 200) * 100;
                                let bottom = seg.bottom;

                                if ((opp.special === 'rhythm' || opp.special === 'all') && beatPhase < 2) {
                                    bottom -= Math.sin(beatPhase * Math.PI) * 5;
                                }
                                if (opp.special === 'moving_walls' || opp.special === 'all') {
                                    bottom += Math.sin(distance / 50) * 8;
                                }

                                return `${i === 0 ? 'M' : 'L'} ${xPercent}% ${bottom}%`;
                            }).join(' ') + ' L 100% 100 L 0 100 Z'}
                            fill={opp.theme.wall}
                        />
                    </svg>

                    {/* Speed zones */}
                    {speedZones.map((zone, i) => {
                        const zx = zone.x - (distance % 200);
                        if (zx < -50 || zx > 150) return null;
                        return (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${(zx / 200) * 100}%`,
                                top: '20%', bottom: '20%',
                                width: `${(zone.width / 200) * 100}%`,
                                background: zone.type === 'boost' ? 'rgba(255,100,100,0.2)' : 'rgba(100,100,255,0.2)',
                                border: `1px solid ${zone.type === 'boost' ? '#ff6666' : '#6666ff'}`,
                                pointerEvents: 'none'
                            }}>
                                <div style={{ textAlign: 'center', marginTop: '50%' }}>
                                    {zone.type === 'boost' ? '⚡' : '🐢'}
                                </div>
                            </div>
                        );
                    })}

                    {/* Obstacles */}
                    {obstacles.map((obs, i) => {
                        const ox = obs.x - (distance % 200);
                        if (ox < -20 || ox > 120) return null;
                        return (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${(ox / 200) * 100}%`,
                                top: `${obs.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${obs.size}px`
                            }}>🪨</div>
                        );
                    })}

                    {/* Collectibles */}
                    {collectibles.map((item, i) => {
                        const ix = item.x - (distance % 200);
                        if (ix < -20 || ix > 120) return null;
                        return (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${(ix / 200) * 100}%`,
                                top: `${item.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: '24px',
                                filter: item.type === 'golden' ? 'drop-shadow(0 0 5px gold)' : 'none'
                            }}>
                                {item.type === 'golden' ? '⭐' : '🍯'}
                            </div>
                        );
                    })}

                    {/* Player */}
                    <div style={{
                        position: 'absolute',
                        left: '20%',
                        top: `${playerY}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '40px',
                        filter: nearMiss ? 'drop-shadow(0 0 10px red)' : 'none',
                        transition: 'top 0.05s linear'
                    }}>
                        🪱
                    </div>

                    {/* Near miss warning */}
                    {nearMiss && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: theme.error, fontSize: '24px', fontWeight: 'bold'
                        }}>⚠️ CLOSE!</div>
                    )}
                </div>

                {/* Instructions */}
                <div style={{
                    padding: '15px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                        {isHolding ? '⬆️ RISING' : '⬇️ FALLING'}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '14px' }}>
                        Hold SPACE / Click / Touch to rise
                    </div>
                </div>
            </div>
        );
    }

    // Result
    if (gameState === 'result') {
        const won = distance >= targetDistance;
        const percentage = distance / targetDistance;

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
                    {won ? 'TUNNEL CLEARED!' : 'CRASHED!'}
                </h1>

                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                    Distance: <span style={{ color: theme.accent }}>{Math.floor(distance)}m</span>
                    {' / '}{targetDistance}m
                </div>
                <div style={{ fontSize: '20px', marginBottom: '20px' }}>
                    Score: <span style={{ color: theme.gold }}>{score}</span>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{percentage >= 1.5 ? 2 : 1} Points</span>
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
