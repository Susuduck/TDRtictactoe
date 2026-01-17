const { useState, useEffect, useCallback, useRef } = React;

/**
 * SHOOTING GALLERY - Pest Blaster
 *
 * Design Principles:
 * - Pattern Learning: Targets spawn in learnable patterns, not pure random
 * - Each opponent introduces NEW target types/behaviors to master
 * - Clear Feedback: Hit effects, combo counter, miss penalty visible
 * - Flow: Adaptive spawn rate based on performance
 * - Agency: Choose targets strategically (high value vs safe)
 */

const ShootingGallery = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#50c878', accentBright: '#70e898',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Each opponent introduces NEW mechanics to learn
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Basic bugs - learn timing and accuracy',
            targetTypes: ['fly'], spawnRate: 1.5, friendlyChance: 0,
            special: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'Introduces COMBO system - chain hits for bonus!',
            targetTypes: ['fly', 'roach'], spawnRate: 1.3, friendlyChance: 0,
            special: 'combo_focus'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'RHYTHM targets - hit on the beat for double points!',
            targetTypes: ['fly', 'roach', 'rhythm_bug'], spawnRate: 1.2, friendlyChance: 0,
            special: 'rhythm'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'FRIENDLIES appear - don\'t shoot the Worm Gang!',
            targetTypes: ['fly', 'roach', 'mosquito'], spawnRate: 1.1, friendlyChance: 0.15,
            special: 'friendlies'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'CHAIN LIGHTNING - some bugs electrify neighbors!',
            targetTypes: ['fly', 'roach', 'mosquito', 'electric_bug'], spawnRate: 1.0, friendlyChance: 0.1,
            special: 'chain'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'SPOTLIGHT - can only hit bugs in the light!',
            targetTypes: ['fly', 'roach', 'mosquito', 'golden'], spawnRate: 1.0, friendlyChance: 0.12,
            special: 'spotlight'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'PATTERN SPAWNS - bugs come in formations!',
            targetTypes: ['fly', 'roach', 'mosquito', 'golden'], spawnRate: 0.9, friendlyChance: 0.15,
            special: 'formations'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'MOVING TARGETS - bugs now slither around!',
            targetTypes: ['fly', 'roach', 'mosquito', 'golden', 'slither_bug'], spawnRate: 0.8, friendlyChance: 0.15,
            special: 'movement'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'BOSS BUGS - big bugs take 3 hits!',
            targetTypes: ['fly', 'roach', 'mosquito', 'golden', 'boss_bug'], spawnRate: 0.8, friendlyChance: 0.18,
            special: 'bosses'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'EVERYTHING! All mechanics at once!',
            targetTypes: ['fly', 'roach', 'mosquito', 'golden', 'electric_bug', 'boss_bug'],
            spawnRate: 0.7, friendlyChance: 0.2,
            special: 'all'
        }
    ];

    // Target definitions with unique behaviors
    const targetDefs = {
        fly: { emoji: '🪰', points: 10, duration: 2000, size: 40 },
        roach: { emoji: '🪳', points: 25, duration: 1500, size: 45 },
        mosquito: { emoji: '🦟', points: 50, duration: 1000, size: 35 },
        golden: { emoji: '✨', points: 100, duration: 500, size: 50, glow: true },
        rhythm_bug: { emoji: '🎵', points: 30, duration: 1500, size: 45, rhythm: true },
        electric_bug: { emoji: '⚡', points: 40, duration: 1200, size: 45, chain: true },
        boss_bug: { emoji: '🐛', points: 200, duration: 3000, size: 70, hp: 3 },
        slither_bug: { emoji: '🐍', points: 60, duration: 1800, size: 40, moves: true },
        friendly: { emoji: '🪱', points: -50, duration: 1500, size: 45, friendly: true }
    };

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [targets, setTargets] = useState([]);
    const [hitEffects, setHitEffects] = useState([]);
    const [beatPhase, setBeatPhase] = useState(0);
    const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
    const [accuracy, setAccuracy] = useState({ hits: 0, misses: 0 });

    // Refs
    const nextTargetId = useRef(0);
    const gameAreaRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('shootinggallery_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('shootinggallery_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Spawn a target
    const spawnTarget = useCallback(() => {
        if (!selectedOpponent) return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.1;

        // Decide target type
        let type;
        if (Math.random() < opp.friendlyChance) {
            type = 'friendly';
        } else {
            type = opp.targetTypes[Math.floor(Math.random() * opp.targetTypes.length)];
        }

        const def = targetDefs[type];
        const id = nextTargetId.current++;

        // Position - avoid edges, use patterns for Professor Penguin
        let x, y;
        if (opp.special === 'formations' && Math.random() < 0.5) {
            // Spawn in formation
            const formations = [
                [{ x: 20, y: 30 }, { x: 50, y: 30 }, { x: 80, y: 30 }], // Line
                [{ x: 50, y: 20 }, { x: 30, y: 50 }, { x: 70, y: 50 }], // Triangle
                [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 60 }, { x: 70, y: 60 }], // Square
            ];
            const formation = formations[Math.floor(Math.random() * formations.length)];
            formation.forEach((pos, i) => {
                setTimeout(() => {
                    setTargets(t => [...t, {
                        id: id + i,
                        type,
                        x: pos.x + (Math.random() - 0.5) * 10,
                        y: pos.y + (Math.random() - 0.5) * 10,
                        vx: 0, vy: 0,
                        hp: def.hp || 1,
                        spawnTime: Date.now() + i * 100,
                        duration: def.duration / levelMod
                    }]);
                }, i * 100);
            });
            return;
        }

        x = 10 + Math.random() * 80;
        y = 10 + Math.random() * 60;

        // Movement for slither bugs
        let vx = 0, vy = 0;
        if (def.moves || opp.special === 'movement') {
            vx = (Math.random() - 0.5) * 2;
            vy = (Math.random() - 0.5) * 2;
        }

        setTargets(t => [...t, {
            id, type, x, y, vx, vy,
            hp: def.hp || 1,
            spawnTime: Date.now(),
            duration: def.duration / levelMod
        }]);
    }, [selectedOpponent, currentLevel]);

    // Game timer and spawning
    useEffect(() => {
        if (gameState !== 'playing') return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.15;

        // Timer countdown
        const timer = setInterval(() => {
            setTimeRemaining(t => {
                if (t <= 1) {
                    setGameState('result');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        // Target spawning - adaptive based on current targets
        const spawner = setInterval(() => {
            setTargets(current => {
                // Adaptive spawn: more targets if player is doing well
                const maxTargets = 3 + Math.floor(combo / 5);
                if (current.length < maxTargets) {
                    spawnTarget();
                }
                return current;
            });
        }, opp.spawnRate * 1000 / levelMod);

        // Beat for rhythm mechanic
        const beat = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 500);

        // Spotlight movement
        const spotlight = setInterval(() => {
            setSpotlightPos({
                x: 20 + Math.random() * 60,
                y: 20 + Math.random() * 40
            });
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
            clearInterval(beat);
            clearInterval(spotlight);
        };
    }, [gameState, selectedOpponent, currentLevel, combo, spawnTarget]);

    // Target lifetime and movement
    useEffect(() => {
        if (gameState !== 'playing') return;

        const update = setInterval(() => {
            setTargets(current => {
                const now = Date.now();
                return current
                    .filter(t => now - t.spawnTime < t.duration) // Remove expired
                    .map(t => ({
                        ...t,
                        x: Math.max(5, Math.min(95, t.x + t.vx)),
                        y: Math.max(5, Math.min(75, t.y + t.vy)),
                        // Bounce off edges
                        vx: (t.x <= 5 || t.x >= 95) ? -t.vx : t.vx,
                        vy: (t.y <= 5 || t.y >= 75) ? -t.vy : t.vy
                    }));
            });
        }, 50);

        return () => clearInterval(update);
    }, [gameState]);

    // Handle click/tap
    const handleShoot = useCallback((e) => {
        if (gameState !== 'playing') return;

        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        const opp = selectedOpponent;

        // Check spotlight constraint
        if (opp.special === 'spotlight' || opp.special === 'all') {
            const distToSpotlight = Math.sqrt(
                (clickX - spotlightPos.x) ** 2 + (clickY - spotlightPos.y) ** 2
            );
            if (distToSpotlight > 25) {
                // Can't shoot in darkness
                addHitEffect(clickX, clickY, '🌑', 'dark');
                return;
            }
        }

        // Find hit target
        let hitTarget = null;
        let hitIndex = -1;

        targets.forEach((t, idx) => {
            const def = targetDefs[t.type];
            const dist = Math.sqrt((clickX - t.x) ** 2 + (clickY - t.y) ** 2);
            if (dist < (def.size / 10)) {
                hitTarget = t;
                hitIndex = idx;
            }
        });

        if (hitTarget) {
            const def = targetDefs[hitTarget.type];

            // Handle friendly
            if (def.friendly) {
                setScore(s => s + def.points); // Negative!
                setCombo(0);
                addHitEffect(hitTarget.x, hitTarget.y, '❌', 'friendly');
                setTargets(t => t.filter((_, i) => i !== hitIndex));
                setAccuracy(a => ({ ...a, misses: a.misses + 1 }));
                return;
            }

            // Reduce HP for boss bugs
            if (hitTarget.hp > 1) {
                setTargets(t => t.map((target, i) =>
                    i === hitIndex ? { ...target, hp: target.hp - 1 } : target
                ));
                addHitEffect(hitTarget.x, hitTarget.y, '💥', 'damage');
                return;
            }

            // Calculate points
            let points = def.points;

            // Rhythm bonus
            if (def.rhythm && beatPhase === 0) {
                points *= 2;
                addHitEffect(hitTarget.x, hitTarget.y, '🎵x2!', 'rhythm');
            }

            // Combo bonus
            const newCombo = combo + 1;
            if (newCombo >= 5) {
                points = Math.floor(points * (1 + newCombo * 0.1));
            }

            setScore(s => s + points);
            setCombo(newCombo);
            setMaxCombo(m => Math.max(m, newCombo));
            setAccuracy(a => ({ ...a, hits: a.hits + 1 }));

            // Show hit effect
            const effectText = points >= 100 ? '🌟' + points : '+' + points;
            addHitEffect(hitTarget.x, hitTarget.y, effectText, def.glow ? 'golden' : 'hit');

            // Remove target
            setTargets(t => t.filter((_, i) => i !== hitIndex));

            // Chain lightning
            if (def.chain && (opp.special === 'chain' || opp.special === 'all')) {
                targets.forEach((t, i) => {
                    if (i !== hitIndex) {
                        const dist = Math.sqrt((t.x - hitTarget.x) ** 2 + (t.y - hitTarget.y) ** 2);
                        if (dist < 20 && !targetDefs[t.type].friendly) {
                            setTimeout(() => {
                                setTargets(curr => curr.filter(ct => ct.id !== t.id));
                                setScore(s => s + 20);
                                addHitEffect(t.x, t.y, '⚡+20', 'chain');
                            }, 200);
                        }
                    }
                });
            }
        } else {
            // Miss
            setCombo(0);
            setAccuracy(a => ({ ...a, misses: a.misses + 1 }));
            addHitEffect(clickX, clickY, '✗', 'miss');
        }
    }, [gameState, targets, combo, beatPhase, spotlightPos, selectedOpponent]);

    // Add visual hit effect
    const addHitEffect = (x, y, text, type) => {
        const id = Date.now() + Math.random();
        setHitEffects(e => [...e, { id, x, y, text, type }]);
        setTimeout(() => {
            setHitEffects(e => e.filter(ef => ef.id !== id));
        }, 500);
    };

    // Start match
    const startMatch = (opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setTimeRemaining(60);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setTargets([]);
        setHitEffects([]);
        setAccuracy({ hits: 0, misses: 0 });
        nextTargetId.current = 0;
        setGameState('playing');
    };

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        // Calculate performance
        const baseTarget = 200 + currentLevel * 50 + selectedOpponent.id * 100;
        const percentage = score / baseTarget;

        if (percentage >= 0.5) {
            const points = percentage >= 0.8 ? 2 : 1;
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, currentLevel, selectedOpponent]);

    // Keyboard
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

    // Menu
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🎯</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>PEST BLASTER</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Tap the bugs! Don't hit the Worm Gang!</p>

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

    // Select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Arena</h2>
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
                                    background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})` : theme.bgDark,
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
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '5px' }}>{opp.title}</div>
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

    // Playing
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const showSpotlight = opp.special === 'spotlight' || opp.special === 'all';

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
                    marginBottom: '10px', padding: '10px 20px',
                    background: theme.bgPanel, borderRadius: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div>⏱️ <span style={{ color: timeRemaining <= 10 ? theme.error : theme.text, fontWeight: 'bold' }}>{timeRemaining}s</span></div>
                        <div>🎯 <span style={{ color: theme.gold, fontWeight: 'bold' }}>{score}</span></div>
                    </div>
                    <div style={{ color: opp.color }}>
                        {opp.emoji} {opp.name} - Level {currentLevel}
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {combo >= 3 && <div style={{ color: theme.success }}>🔥 x{combo}</div>}
                        {(opp.special === 'rhythm' || opp.special === 'all') && (
                            <div style={{
                                width: '20px', height: '20px',
                                background: beatPhase === 0 ? theme.gold : theme.bgDark,
                                borderRadius: '50%',
                                transition: 'background 0.1s'
                            }} />
                        )}
                    </div>
                </div>

                {/* Game area */}
                <div
                    ref={gameAreaRef}
                    onClick={handleShoot}
                    style={{
                        flex: 1, position: 'relative',
                        background: 'linear-gradient(to bottom, #0a1510, #152015)',
                        borderRadius: '15px', overflow: 'hidden',
                        cursor: 'crosshair', minHeight: '400px'
                    }}
                >
                    {/* Spotlight overlay */}
                    {showSpotlight && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: `radial-gradient(circle at ${spotlightPos.x}% ${spotlightPos.y}%, transparent 80px, rgba(0,0,0,0.85) 150px)`,
                            pointerEvents: 'none', zIndex: 10
                        }} />
                    )}

                    {/* Targets */}
                    {targets.map(t => {
                        const def = targetDefs[t.type];
                        const age = Date.now() - t.spawnTime;
                        const lifePercent = 1 - (age / t.duration);

                        return (
                            <div
                                key={t.id}
                                style={{
                                    position: 'absolute',
                                    left: `${t.x}%`, top: `${t.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: `${def.size}px`,
                                    opacity: lifePercent < 0.3 ? lifePercent * 3 : 1,
                                    filter: def.glow ? 'drop-shadow(0 0 10px gold)' : 'none',
                                    transition: 'left 0.05s, top 0.05s',
                                    animation: def.rhythm && beatPhase === 0 ? 'pulse 0.2s ease-out' : 'none'
                                }}
                            >
                                {def.emoji}
                                {t.hp > 1 && (
                                    <div style={{
                                        position: 'absolute', bottom: '-10px', left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '12px', color: theme.error
                                    }}>
                                        {'❤️'.repeat(t.hp)}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Hit effects */}
                    {hitEffects.map(e => (
                        <div
                            key={e.id}
                            style={{
                                position: 'absolute',
                                left: `${e.x}%`, top: `${e.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: e.type === 'golden' ? '28px' : '20px',
                                fontWeight: 'bold',
                                color: e.type === 'miss' ? theme.error
                                    : e.type === 'friendly' ? theme.error
                                    : e.type === 'golden' ? theme.gold
                                    : e.type === 'chain' ? '#50a8e8'
                                    : theme.success,
                                pointerEvents: 'none',
                                animation: 'floatUp 0.5s ease-out forwards',
                                zIndex: 20
                            }}
                        >
                            {e.text}
                        </div>
                    ))}
                </div>

                {/* Instructions */}
                <div style={{
                    marginTop: '10px', textAlign: 'center',
                    color: theme.textMuted, fontSize: '14px'
                }}>
                    Click/tap bugs to shoot! {opp.special === 'friendlies' || opp.special === 'all' ? '🪱 = Friendly (DON\'T shoot!)' : ''}
                </div>

                <style>{`
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -100%) scale(1.2); opacity: 0; }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.3); }
                    }
                `}</style>
            </div>
        );
    }

    // Result
    if (gameState === 'result') {
        const baseTarget = 200 + currentLevel * 50 + selectedOpponent.id * 100;
        const percentage = score / baseTarget;
        const won = percentage >= 0.5;
        const excellent = percentage >= 0.8;
        const accuracyPct = accuracy.hits / Math.max(1, accuracy.hits + accuracy.misses) * 100;

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
                    {excellent ? 'SHARPSHOOTER!' : won ? 'GOOD GAME!' : 'TRY AGAIN'}
                </h1>

                <div style={{ fontSize: '36px', marginBottom: '10px', color: theme.gold }}>
                    Score: {score}
                </div>

                <div style={{
                    display: 'flex', gap: '30px', marginBottom: '20px',
                    color: theme.textSecondary
                }}>
                    <div>Max Combo: <span style={{ color: theme.accent }}>{maxCombo}</span></div>
                    <div>Accuracy: <span style={{ color: accuracyPct >= 70 ? theme.success : theme.error }}>{accuracyPct.toFixed(0)}%</span></div>
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
