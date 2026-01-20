const { useState, useEffect, useCallback, useRef } = React;

/**
 * HONEY CATCH - Comprehensive Redesign
 *
 * Design Principles Applied:
 * - Flow State: Clear goals, immediate feedback, challenge-skill balance
 * - The Toy Lens: Movement feels good on its own (acceleration, momentum)
 * - Four Keys: Hard Fun (fiero), Easy Fun (discovery), Serious Fun (progress)
 * - Feedback Lens: Every action has immediate, satisfying response
 * - Pattern Learning: Core loop is learning and mastering patterns
 * - 40-60% success rate target for optimal engagement
 */

const HoneyCatch = () => {
    // Theme - Warm honey colors with good contrast
    const theme = {
        bg: '#1a1625',
        bgPanel: '#2a2440',
        bgDark: '#1a1020',
        border: '#4a4468',
        borderLight: '#5a5478',
        text: '#ffffff',
        textSecondary: '#b8b0c8',
        textMuted: '#8880a0',
        accent: '#ff69b4',
        accentBright: '#ff89d4',
        gold: '#ffd700',
        goldGlow: 'rgba(255, 215, 0, 0.4)',
        error: '#ff6b6b',
        success: '#50c878',
        honey: '#f4a460',
        warning: '#ffa500'
    };

    // ═══════════════════════════════════════════════════════════════
    // OPPONENT DESIGN - Each introduces ONE clear new mechanic
    // Difficulty curve: gradual introduction, no spikes
    // ═══════════════════════════════════════════════════════════════
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Beginner',
            taunt: "Ribbit! Let's warm up!",
            winQuote: "Hop hop hooray!",
            loseQuote: "Great catching!",
            mechanic: 'Just honey pots - learn the basics!',
            // Generous settings for learning
            baseSpawnRate: 1.2, baseFallSpeed: 1.8,
            items: ['honey'],
            patterns: ['straight'],
            badItemChance: 0,
            goldenChance: 0.08,
            powerUpChance: 0.12
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Clucky Teacher',
            taunt: "Bawk! Watch for bees!",
            winQuote: "Egg-cellent!",
            loseQuote: "You're learning!",
            mechanic: 'NEW: Bees appear - avoid them!',
            baseSpawnRate: 1.1, baseFallSpeed: 2.0,
            items: ['honey', 'bee'],
            patterns: ['straight'],
            badItemChance: 0.18,
            goldenChance: 0.10,
            powerUpChance: 0.10
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            taunt: "Feel the rhythm!",
            winQuote: "Groovy moves!",
            loseQuote: "Keep dancing!",
            mechanic: 'NEW: Items sway side to side',
            baseSpawnRate: 1.0, baseFallSpeed: 2.2,
            items: ['honey', 'bee'],
            patterns: ['sway'],
            badItemChance: 0.20,
            goldenChance: 0.12,
            powerUpChance: 0.10
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            taunt: "Dodge these rocks!",
            winQuote: "Garbage day win!",
            loseQuote: "Nice reflexes!",
            mechanic: 'NEW: Heavy rocks with big penalties',
            baseSpawnRate: 0.95, baseFallSpeed: 2.4,
            items: ['honey', 'bee', 'rock'],
            patterns: ['straight', 'sway'],
            badItemChance: 0.25,
            goldenChance: 0.12,
            powerUpChance: 0.10
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            taunt: "Catch the sparkles!",
            winQuote: "Electrifying!",
            loseQuote: "Shocking skill!",
            mechanic: 'NEW: More golden honey appears!',
            baseSpawnRate: 0.9, baseFallSpeed: 2.5,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['straight', 'sway'],
            badItemChance: 0.22,
            goldenChance: 0.18,
            powerUpChance: 0.12
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Shadow Dancer',
            taunt: "Trust your instincts!",
            winQuote: "You see clearly!",
            loseQuote: "Well spotted!",
            mechanic: 'NEW: Some items fade until close',
            baseSpawnRate: 0.85, baseFallSpeed: 2.6,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['straight', 'sway'],
            badItemChance: 0.25,
            goldenChance: 0.15,
            powerUpChance: 0.12,
            hasFading: true
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Pattern Master',
            taunt: "Study my patterns!",
            winQuote: "Class dismissed!",
            loseQuote: "A+ student!",
            mechanic: 'NEW: Items fall in wave patterns',
            baseSpawnRate: 0.8, baseFallSpeed: 2.8,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['wave', 'sway'],
            badItemChance: 0.25,
            goldenChance: 0.15,
            powerUpChance: 0.10
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            taunt: "Sssso unpredictable!",
            winQuote: "Ssssweet!",
            loseQuote: "Impresssssive!",
            mechanic: 'NEW: Items can change direction!',
            baseSpawnRate: 0.75, baseFallSpeed: 3.0,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['swerve', 'wave'],
            badItemChance: 0.28,
            goldenChance: 0.15,
            powerUpChance: 0.10
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            taunt: "The pack attacks!",
            winQuote: "AWOOOO!",
            loseQuote: "Worthy prey!",
            mechanic: 'NEW: Items come in groups!',
            baseSpawnRate: 0.7, baseFallSpeed: 3.2,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['straight', 'sway', 'wave'],
            badItemChance: 0.28,
            goldenChance: 0.15,
            powerUpChance: 0.08,
            hasSwarms: true
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            taunt: "Show me everything!",
            winQuote: "A true master!",
            loseQuote: "Incredible!",
            mechanic: 'ULTIMATE: All mechanics combined!',
            baseSpawnRate: 0.65, baseFallSpeed: 3.5,
            items: ['honey', 'bee', 'rock', 'golden'],
            patterns: ['straight', 'sway', 'wave', 'swerve'],
            badItemChance: 0.30,
            goldenChance: 0.18,
            powerUpChance: 0.10,
            hasFading: true,
            hasSwarms: true,
            speedRamp: true
        }
    ];

    // ═══════════════════════════════════════════════════════════════
    // ITEM DEFINITIONS - Balanced risk/reward
    // ═══════════════════════════════════════════════════════════════
    const itemTypes = {
        honey: { emoji: '🍯', points: 15, type: 'good', name: 'Honey' },
        golden: { emoji: '⭐', points: 40, type: 'good', name: 'Golden Honey' },
        bee: { emoji: '🐝', points: -10, type: 'bad', name: 'Bee' },
        rock: { emoji: '🪨', points: -20, type: 'bad', name: 'Rock' }
    };

    // ═══════════════════════════════════════════════════════════════
    // POWER-UPS - Meaningful choices and excitement
    // ═══════════════════════════════════════════════════════════════
    const powerUpTypes = {
        magnet: {
            emoji: '🧲',
            name: 'Honey Magnet',
            duration: 5000,
            description: 'Attracts nearby honey!'
        },
        shield: {
            emoji: '🛡️',
            name: 'Bear Shield',
            duration: 4000,
            description: 'Blocks bad items!'
        },
        slowmo: {
            emoji: '⏱️',
            name: 'Slow Time',
            duration: 4000,
            description: 'Everything slows down!'
        },
        multiplier: {
            emoji: '✨',
            name: 'Double Points',
            duration: 5000,
            description: '2x points on catches!'
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // GAME STATE
    // ═══════════════════════════════════════════════════════════════
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [fallingItems, setFallingItems] = useState([]);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [catchEffects, setCatchEffects] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [screenShake, setScreenShake] = useState(0);
    const [particles, setParticles] = useState([]);

    // Player state with physics
    const [playerX, setPlayerX] = useState(50);
    const playerVelocity = useRef(0);
    const [playerTilt, setPlayerTilt] = useState(0);

    // Power-up state
    const [activePowerUps, setActivePowerUps] = useState({});
    const [feverMode, setFeverMode] = useState(false);

    // Wave system for pacing
    const [currentWave, setCurrentWave] = useState('warmup');
    const waveTimerRef = useRef(null);

    // Refs
    const gameLoopRef = useRef(null);
    const timerRef = useRef(null);
    const spawnTimerRef = useRef(null);
    const keysPressed = useRef({});
    const itemIdRef = useRef(0);
    const lastTimeRef = useRef(0);
    const gameAreaRef = useRef(null);

    // ═══════════════════════════════════════════════════════════════
    // PROGRESSION SYSTEM
    // ═══════════════════════════════════════════════════════════════
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('honey_catch_progression_v2');
        if (saved) return JSON.parse(saved);
        return {
            starPoints: Array(10).fill(0),
            bestScores: Array(10).fill(null).map(() => Array(10).fill(0)),
            totalHoneyCaught: 0,
            totalGamesPlayed: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('honey_catch_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 4;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // ═══════════════════════════════════════════════════════════════
    // DIFFICULTY SYSTEM - Smooth curve, calibrated for 50% success
    // ═══════════════════════════════════════════════════════════════
    const getDifficulty = useCallback((opponentIdx, level) => {
        const opp = opponents[opponentIdx];
        // Gentler scaling: 5% per level instead of 8%
        const levelMod = 1 + (level - 1) * 0.05;

        // Target score calibrated for ~50% first-attempt success
        // Base: enough to catch ~60% of spawned good items
        const baseTarget = 80 + opponentIdx * 30;
        const levelBonus = level * 20;

        return {
            spawnRate: Math.max(0.4, opp.baseSpawnRate / levelMod),
            fallSpeed: opp.baseFallSpeed * levelMod,
            targetScore: baseTarget + levelBonus,
            badItemChance: Math.min(0.35, opp.badItemChance + level * 0.01),
            goldenChance: opp.goldenChance + level * 0.005,
            powerUpChance: opp.powerUpChance
        };
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // WAVE SYSTEM - Pacing within each round
    // Creates rhythm: warmup → buildup → intensity → breather → climax
    // ═══════════════════════════════════════════════════════════════
    const getWaveModifier = useCallback(() => {
        switch (currentWave) {
            case 'warmup': return { spawnMod: 0.7, speedMod: 0.85, duration: 8 };
            case 'buildup': return { spawnMod: 0.9, speedMod: 0.95, duration: 12 };
            case 'intensity': return { spawnMod: 1.2, speedMod: 1.1, duration: 15 };
            case 'breather': return { spawnMod: 0.6, speedMod: 0.8, duration: 8 };
            case 'climax': return { spawnMod: 1.3, speedMod: 1.15, duration: 17 };
            default: return { spawnMod: 1, speedMod: 1, duration: 10 };
        }
    }, [currentWave]);

    // ═══════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM - Visual feedback / "juice"
    // ═══════════════════════════════════════════════════════════════
    const spawnParticles = useCallback((x, y, type, count = 8) => {
        const newParticles = [];
        const colors = type === 'good'
            ? ['#ffd700', '#ffec8b', '#fff8dc', '#ffa500']
            : ['#ff6b6b', '#ff8888', '#ffaaaa', '#ff4444'];

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: `particle-${Date.now()}-${i}`,
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 6 - 2,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // SCREEN SHAKE - Feedback for bad catches
    // ═══════════════════════════════════════════════════════════════
    const triggerScreenShake = useCallback((intensity = 5) => {
        setScreenShake(intensity);
        setTimeout(() => setScreenShake(0), 200);
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // ITEM SPAWNING - Pattern-based, telegraphed
    // ═══════════════════════════════════════════════════════════════
    const spawnItem = useCallback((forceType = null, forceX = null) => {
        if (!selectedOpponent) return;

        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);
        const waveMod = getWaveModifier();

        // Determine item type
        let itemKey;
        if (forceType) {
            itemKey = forceType;
        } else {
            const roll = Math.random();
            const powerUpRoll = Math.random();

            // Power-up spawn (separate roll)
            if (powerUpRoll < difficulty.powerUpChance) {
                const powerUpKeys = Object.keys(powerUpTypes);
                const powerUp = powerUpKeys[Math.floor(Math.random() * powerUpKeys.length)];

                const item = {
                    id: itemIdRef.current++,
                    type: 'powerup',
                    powerUpType: powerUp,
                    x: forceX ?? (15 + Math.random() * 70),
                    y: -5,
                    pattern: 'straight',
                    speed: difficulty.fallSpeed * waveMod.speedMod * 0.8,
                    baseX: forceX ?? (15 + Math.random() * 70),
                    time: 0,
                    fading: false,
                    swerveDir: 1,
                    swerveTimer: Math.random() * Math.PI * 2
                };
                setFallingItems(prev => [...prev, item]);
                return;
            }

            // Regular item type selection
            if (roll < difficulty.goldenChance && opp.items.includes('golden')) {
                itemKey = 'golden';
            } else if (roll < difficulty.goldenChance + difficulty.badItemChance) {
                if (opp.items.includes('rock') && Math.random() < 0.35) {
                    itemKey = 'rock';
                } else if (opp.items.includes('bee')) {
                    itemKey = 'bee';
                } else {
                    itemKey = 'honey';
                }
            } else {
                itemKey = 'honey';
            }
        }

        // Choose pattern from opponent's available patterns
        const patterns = opp.patterns;
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        // Position - avoid edges for fairness
        const x = forceX ?? (15 + Math.random() * 70);

        // Create item with pattern data
        const item = {
            id: itemIdRef.current++,
            type: itemKey,
            x: x,
            y: -5,
            pattern: pattern,
            speed: difficulty.fallSpeed * waveMod.speedMod,
            baseX: x,
            time: 0,
            fading: opp.hasFading && itemTypes[itemKey].type === 'bad' && Math.random() < 0.4,
            swerveDir: Math.random() < 0.5 ? 1 : -1,
            swerveTimer: Math.random() * Math.PI * 2,
            telegraphed: true // Items are always visible/predictable
        };

        setFallingItems(prev => [...prev, item]);

        // Swarm spawning for Wolf and Grizzly
        if (opp.hasSwarms && Math.random() < 0.3) {
            const swarmCount = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < swarmCount; i++) {
                setTimeout(() => {
                    if (gameState === 'playing' && !isPaused) {
                        const swarmX = Math.max(15, Math.min(85, x + (Math.random() - 0.5) * 30));
                        spawnItem(Math.random() < 0.7 ? 'honey' : 'bee', swarmX);
                    }
                }, (i + 1) * 150);
            }
        }
    }, [selectedOpponent, currentLevel, getDifficulty, getWaveModifier, gameState, isPaused]);

    // ═══════════════════════════════════════════════════════════════
    // START MATCH
    // ═══════════════════════════════════════════════════════════════
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        setTimeLeft(60);
        setPlayerX(50);
        playerVelocity.current = 0;
        setPlayerTilt(0);
        setFallingItems([]);
        setCombo(0);
        setMaxCombo(0);
        setCatchEffects([]);
        setParticles([]);
        setIsPaused(false);
        setScreenShake(0);
        setActivePowerUps({});
        setFeverMode(false);
        setCurrentWave('warmup');
        itemIdRef.current = 0;
        lastTimeRef.current = performance.now();
        setGameState('playing');
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // WAVE PROGRESSION TIMER
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        if (gameState !== 'playing' || isPaused) return;

        const waveSequence = ['warmup', 'buildup', 'intensity', 'breather', 'climax'];
        let waveIndex = 0;

        const advanceWave = () => {
            waveIndex = (waveIndex + 1) % waveSequence.length;
            setCurrentWave(waveSequence[waveIndex]);
        };

        // Set initial wave duration
        const waveMod = getWaveModifier();
        waveTimerRef.current = setTimeout(advanceWave, waveMod.duration * 1000);

        return () => clearTimeout(waveTimerRef.current);
    }, [gameState, isPaused, currentWave, getWaveModifier]);

    // ═══════════════════════════════════════════════════════════════
    // GAME TIMER
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // ITEM SPAWNER
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        if (gameState !== 'playing' || isPaused || !selectedOpponent) return;

        const difficulty = getDifficulty(selectedOpponent.id, currentLevel);
        const waveMod = getWaveModifier();
        const spawnInterval = (difficulty.spawnRate / waveMod.spawnMod) * 1000;

        spawnTimerRef.current = setInterval(spawnItem, spawnInterval);

        return () => clearInterval(spawnTimerRef.current);
    }, [gameState, isPaused, selectedOpponent, currentLevel, spawnItem, getDifficulty, getWaveModifier]);

    // ═══════════════════════════════════════════════════════════════
    // MAIN GAME LOOP - Physics-based movement and updates
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        if (gameState !== 'playing' || isPaused) return;

        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);

        const loop = (currentTime) => {
            const deltaTime = Math.min((currentTime - lastTimeRef.current) / 16.67, 3);
            lastTimeRef.current = currentTime;

            // ─────────────────────────────────────────────────────
            // PLAYER PHYSICS - Acceleration-based movement (The Toy)
            // ─────────────────────────────────────────────────────
            const acceleration = 0.8;
            const maxSpeed = 4;
            const friction = 0.85;

            let targetVelocity = 0;
            if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
                targetVelocity = -maxSpeed;
            }
            if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
                targetVelocity = maxSpeed;
            }

            // Apply acceleration toward target velocity
            if (targetVelocity !== 0) {
                playerVelocity.current += (targetVelocity - playerVelocity.current) * acceleration * deltaTime * 0.1;
            } else {
                // Apply friction when no input
                playerVelocity.current *= Math.pow(friction, deltaTime);
            }

            // Clamp velocity
            playerVelocity.current = Math.max(-maxSpeed, Math.min(maxSpeed, playerVelocity.current));

            // Update position
            setPlayerX(x => {
                const newX = x + playerVelocity.current * deltaTime;
                return Math.max(8, Math.min(92, newX));
            });

            // Visual tilt based on velocity (juice!)
            setPlayerTilt(playerVelocity.current * 3);

            // ─────────────────────────────────────────────────────
            // UPDATE FALLING ITEMS
            // ─────────────────────────────────────────────────────
            const slowMoActive = activePowerUps.slowmo;
            const speedMultiplier = slowMoActive ? 0.5 : 1;
            const magnetActive = activePowerUps.magnet;

            setFallingItems(items => {
                return items.map(item => {
                    let newX = item.x;
                    let newY = item.y;
                    let speed = item.speed * speedMultiplier;

                    // Speed ramp for Grizzly
                    if (opp.speedRamp && timeLeft < 30) {
                        speed *= 1 + (30 - timeLeft) * 0.015;
                    }

                    // Update time for pattern calculations
                    const newTime = item.time + deltaTime * 0.05;

                    // Pattern-based movement
                    switch (item.pattern) {
                        case 'sway':
                            // Gentle side-to-side
                            newX = item.baseX + Math.sin(newTime * 2) * 12;
                            break;
                        case 'wave':
                            // Larger wave pattern
                            newX = item.baseX + Math.sin(newTime * 1.5) * 20;
                            break;
                        case 'swerve':
                            // Unpredictable direction changes
                            if (Math.sin(item.swerveTimer + newTime * 3) > 0.85) {
                                item.swerveDir *= -1;
                            }
                            newX = item.x + item.swerveDir * 0.5 * deltaTime;
                            break;
                        default:
                            // Straight fall
                            break;
                    }

                    // Magnet effect for good items
                    if (magnetActive && item.type !== 'powerup') {
                        const itemDef = itemTypes[item.type];
                        if (itemDef && itemDef.type === 'good') {
                            const dx = playerX - newX;
                            if (Math.abs(dx) < 25 && newY > 50) {
                                newX += dx * 0.08 * deltaTime;
                            }
                        }
                    }

                    // Apply gravity
                    newY += speed * 0.4 * deltaTime;

                    // Keep in bounds
                    newX = Math.max(5, Math.min(95, newX));

                    return {
                        ...item,
                        x: newX,
                        y: newY,
                        time: newTime
                    };
                }).filter(item => item.y < 105);
            });

            // ─────────────────────────────────────────────────────
            // UPDATE PARTICLES
            // ─────────────────────────────────────────────────────
            setParticles(prev => prev
                .map(p => ({
                    ...p,
                    x: p.x + p.vx * deltaTime,
                    y: p.y + p.vy * deltaTime,
                    vy: p.vy + 0.3 * deltaTime, // gravity
                    life: p.life - 0.03 * deltaTime
                }))
                .filter(p => p.life > 0)
            );

            // ─────────────────────────────────────────────────────
            // COLLISION DETECTION (every frame for responsiveness)
            // ─────────────────────────────────────────────────────
            setFallingItems(items => {
                const remaining = [];
                const shieldActive = activePowerUps.shield;
                const multiplierActive = activePowerUps.multiplier;

                for (const item of items) {
                    // Catch zone - generous for good items, tighter for bad
                    const catchWidth = item.type === 'powerup' ||
                        (itemTypes[item.type] && itemTypes[item.type].type === 'good') ? 14 : 10;
                    const catchTop = 78;
                    const catchBottom = 92;

                    const inCatchZone = item.y >= catchTop && item.y <= catchBottom;
                    const inRange = Math.abs(item.x - playerX) < catchWidth;

                    if (inCatchZone && inRange) {
                        // CAUGHT!
                        if (item.type === 'powerup') {
                            // Activate power-up
                            const powerUp = powerUpTypes[item.powerUpType];
                            setActivePowerUps(prev => ({
                                ...prev,
                                [item.powerUpType]: true
                            }));

                            // Schedule deactivation
                            setTimeout(() => {
                                setActivePowerUps(prev => {
                                    const newState = { ...prev };
                                    delete newState[item.powerUpType];
                                    return newState;
                                });
                            }, powerUp.duration);

                            // Visual feedback
                            spawnParticles(item.x, item.y, 'good', 12);
                            setCatchEffects(prev => [...prev, {
                                id: item.id,
                                x: item.x,
                                y: item.y,
                                text: powerUp.name + '!',
                                type: 'powerup'
                            }]);
                            setTimeout(() => {
                                setCatchEffects(prev => prev.filter(e => e.id !== item.id));
                            }, 800);
                        } else {
                            const itemDef = itemTypes[item.type];

                            if (itemDef.type === 'bad' && shieldActive) {
                                // Shield blocks bad items
                                spawnParticles(item.x, item.y, 'good', 6);
                                setCatchEffects(prev => [...prev, {
                                    id: item.id,
                                    x: item.x,
                                    y: item.y,
                                    text: 'BLOCKED!',
                                    type: 'shield'
                                }]);
                                setTimeout(() => {
                                    setCatchEffects(prev => prev.filter(e => e.id !== item.id));
                                }, 500);
                            } else {
                                // Calculate points with combo and multipliers
                                let comboBonus = 1 + Math.min(combo * 0.15, 1.5); // Up to 2.5x at 10 combo
                                let points = Math.floor(itemDef.points * comboBonus);

                                // Fever mode bonus
                                if (feverMode && itemDef.type === 'good') {
                                    points = Math.floor(points * 1.5);
                                }

                                // Multiplier power-up
                                if (multiplierActive && itemDef.type === 'good') {
                                    points *= 2;
                                }

                                setScore(s => Math.max(0, s + points));

                                if (itemDef.type === 'good') {
                                    setCombo(c => {
                                        const newCombo = c + 1;
                                        setMaxCombo(m => Math.max(m, newCombo));

                                        // Trigger fever mode at high combo
                                        if (newCombo >= 8 && !feverMode) {
                                            setFeverMode(true);
                                            setTimeout(() => setFeverMode(false), 5000);
                                        }

                                        return newCombo;
                                    });
                                    spawnParticles(item.x, item.y, 'good', item.type === 'golden' ? 15 : 8);
                                } else {
                                    setCombo(0);
                                    setFeverMode(false);
                                    spawnParticles(item.x, item.y, 'bad', 6);
                                    triggerScreenShake(item.type === 'rock' ? 8 : 5);
                                }

                                // Catch effect
                                setCatchEffects(prev => [...prev, {
                                    id: item.id,
                                    x: item.x,
                                    y: item.y,
                                    points: points,
                                    type: itemDef.type,
                                    isGolden: item.type === 'golden',
                                    isFever: feverMode
                                }]);
                                setTimeout(() => {
                                    setCatchEffects(prev => prev.filter(e => e.id !== item.id));
                                }, 600);
                            }
                        }
                    } else {
                        remaining.push(item);

                        // Missed good item - break combo (but no score penalty)
                        if (item.y >= 100 && itemTypes[item.type]?.type === 'good') {
                            setCombo(0);
                        }
                    }
                }

                return remaining;
            });

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameState, isPaused, selectedOpponent, currentLevel, timeLeft, getDifficulty,
        activePowerUps, feverMode, playerX, spawnParticles, triggerScreenShake]);

    // ═══════════════════════════════════════════════════════════════
    // KEYBOARD INPUT
    // ═══════════════════════════════════════════════════════════════
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

            if (e.code === 'Space' && gameState === 'playing' && isPaused) {
                setIsPaused(false);
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
    }, [gameState, isPaused]);

    // ═══════════════════════════════════════════════════════════════
    // TOUCH/MOUSE INPUT
    // ═══════════════════════════════════════════════════════════════
    const handlePointerMove = useCallback((e) => {
        if (gameState !== 'playing' || isPaused) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        if (clientX === undefined) return;

        const x = ((clientX - rect.left) / rect.width) * 100;
        const targetX = Math.max(8, Math.min(92, x));

        // Smooth movement toward touch position
        setPlayerX(currentX => {
            const diff = targetX - currentX;
            return currentX + diff * 0.3;
        });
    }, [gameState, isPaused]);

    // ═══════════════════════════════════════════════════════════════
    // HANDLE RESULT - Calculate rewards
    // ═══════════════════════════════════════════════════════════════
    useEffect(() => {
        if (gameState !== 'result' || !selectedOpponent) return;

        const difficulty = getDifficulty(selectedOpponent.id, currentLevel);
        const won = score >= difficulty.targetScore;

        // Update progression
        setProgression(prev => {
            const newState = { ...prev };
            newState.totalGamesPlayed++;

            // Update best score
            if (score > newState.bestScores[selectedOpponent.id][currentLevel - 1]) {
                newState.bestScores[selectedOpponent.id][currentLevel - 1] = score;
            }

            if (won) {
                // Calculate points: 1-4 based on performance
                const ratio = score / difficulty.targetScore;
                let points = 1;
                if (ratio >= 1.8) points = 4;
                else if (ratio >= 1.4) points = 3;
                else if (ratio >= 1.15) points = 2;

                newState.starPoints[selectedOpponent.id] = Math.min(
                    40,
                    newState.starPoints[selectedOpponent.id] + points
                );
            }

            return newState;
        });
    }, [gameState, score, selectedOpponent, currentLevel, getDifficulty]);

    // ═══════════════════════════════════════════════════════════════
    // UI COMPONENTS
    // ═══════════════════════════════════════════════════════════════

    const StarBar = ({ points, size = 'normal' }) => {
        const starSize = size === 'small' ? '10px' : '14px';
        return (
            <div style={{ display: 'flex', gap: '3px' }}>
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} style={{
                        width: starSize,
                        height: starSize,
                        background: i < Math.floor(points / 4)
                            ? `linear-gradient(135deg, ${theme.gold}, #ffaa00)`
                            : theme.bgDark,
                        borderRadius: '3px',
                        border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                        boxShadow: i < Math.floor(points / 4) ? `0 0 4px ${theme.goldGlow}` : 'none'
                    }} />
                ))}
            </div>
        );
    };

    const ProgressBar = ({ current, target, color }) => {
        const percentage = Math.min(100, (current / target) * 100);
        const isComplete = current >= target;

        return (
            <div style={{
                width: '100%',
                height: '8px',
                background: theme.bgDark,
                borderRadius: '4px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isComplete
                        ? `linear-gradient(90deg, ${theme.success}, #70e898)`
                        : `linear-gradient(90deg, ${color}, ${color}88)`,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease-out',
                    boxShadow: isComplete ? `0 0 10px ${theme.success}` : 'none'
                }} />
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════════
    // MENU SCREEN
    // ═══════════════════════════════════════════════════════════════
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 20px',
                color: theme.text
            }}>
                <div style={{ fontSize: '72px', marginBottom: '10px', filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))' }}>🍯</div>
                <h1 style={{
                    fontSize: '42px',
                    marginBottom: '5px',
                    color: theme.gold,
                    textShadow: `0 0 20px ${theme.goldGlow}`
                }}>HONEY CATCH</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px', fontSize: '18px' }}>
                    Catch honey, dodge danger, become the champion!
                </p>

                <div style={{
                    display: 'flex',
                    gap: '25px',
                    marginBottom: '35px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px' }}>🍯</div>
                        <div style={{ color: theme.success, fontWeight: 'bold' }}>+15</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px' }}>⭐</div>
                        <div style={{ color: theme.gold, fontWeight: 'bold' }}>+40</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px' }}>🐝</div>
                        <div style={{ color: theme.error, fontWeight: 'bold' }}>-10</div>
                    </div>
                    <div style={{ textAlign: '32px' }}>
                        <div style={{ fontSize: '32px' }}>🪨</div>
                        <div style={{ color: theme.error, fontWeight: 'bold' }}>-20</div>
                    </div>
                </div>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px',
                        fontSize: '24px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none',
                        borderRadius: '15px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: `0 6px 20px rgba(255, 105, 180, 0.4)`,
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 8px 25px rgba(255, 105, 180, 0.6)';
                    }}
                    onMouseLeave={e => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 105, 180, 0.4)';
                    }}
                >
                    PLAY
                </button>

                <div style={{
                    marginTop: '35px',
                    padding: '25px',
                    background: theme.bgPanel,
                    borderRadius: '15px',
                    maxWidth: '450px',
                    border: `1px solid ${theme.border}`
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '15px', fontSize: '20px' }}>How to Play</h3>
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: '15px',
                        lineHeight: 1.8,
                        textAlign: 'left'
                    }}>
                        <div style={{ marginBottom: '8px' }}>🎮 <strong>Move:</strong> Arrow keys, A/D, or touch</div>
                        <div style={{ marginBottom: '8px' }}>🍯 <strong>Catch:</strong> Honey pots for points</div>
                        <div style={{ marginBottom: '8px' }}>⚡ <strong>Combo:</strong> Chain catches for bonus points</div>
                        <div style={{ marginBottom: '8px' }}>🛡️ <strong>Power-ups:</strong> Collect special abilities</div>
                        <div>🔥 <strong>Fever:</strong> 8+ combo triggers Fever Mode!</div>
                    </div>
                </div>

                {progression.totalGamesPlayed > 0 && (
                    <div style={{
                        marginTop: '20px',
                        color: theme.textMuted,
                        fontSize: '14px'
                    }}>
                        Games Played: {progression.totalGamesPlayed}
                    </div>
                )}

                <a href="../menu.html" style={{
                    marginTop: '25px',
                    color: theme.textMuted,
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '10px 20px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.borderColor = theme.accent}
                onMouseLeave={e => e.target.style.borderColor = theme.border}
                >← Back to Menu</a>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // OPPONENT SELECT SCREEN
    // ═══════════════════════════════════════════════════════════════
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                padding: '20px',
                color: theme.text
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    maxWidth: '1200px',
                    margin: '0 auto 25px auto'
                }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent',
                        border: `1px solid ${theme.border}`,
                        color: theme.textSecondary,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>← Back</button>
                    <h2 style={{ color: theme.gold, fontSize: '28px' }}>Choose Your Challenger</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '18px',
                    maxWidth: '1200px',
                    margin: '0 auto'
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
                                    borderRadius: '16px',
                                    padding: '18px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = `0 8px 25px ${opp.color}33`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {!unlocked && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        fontSize: '24px'
                                    }}>🔒</div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: `linear-gradient(135deg, ${theme.success}, #40b868)`,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>★ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px',
                                        width: '75px',
                                        height: '75px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `${opp.color}22`,
                                        borderRadius: '50%',
                                        border: `2px solid ${opp.color}44`
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: opp.color
                                        }}>
                                            {opp.name}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: theme.textMuted,
                                            marginBottom: '8px'
                                        }}>
                                            {opp.title}
                                        </div>
                                        <StarBar points={progression.starPoints[idx]} size="small" />
                                        <div style={{
                                            fontSize: '12px',
                                            color: theme.accent,
                                            marginTop: '8px',
                                            padding: '4px 8px',
                                            background: `${theme.accent}15`,
                                            borderRadius: '6px',
                                            display: 'inline-block'
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

    // ═══════════════════════════════════════════════════════════════
    // LEVEL SELECT SCREEN
    // ═══════════════════════════════════════════════════════════════
    if (gameState === 'level_select' && selectedOpponent) {
        const currentStars = getStars(selectedOpponent.id);

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 100%)`,
                padding: '20px',
                color: theme.text,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'transparent',
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>← Back</button>

                <div style={{
                    fontSize: '90px',
                    marginTop: '20px',
                    filter: `drop-shadow(0 0 30px ${selectedOpponent.color}66)`
                }}>{selectedOpponent.emoji}</div>
                <h2 style={{
                    color: selectedOpponent.color,
                    marginTop: '10px',
                    fontSize: '32px'
                }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>
                <p style={{
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                    marginTop: '10px',
                    fontSize: '16px'
                }}>"{selectedOpponent.taunt}"</p>

                <div style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    background: `${selectedOpponent.color}15`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    border: `1px solid ${selectedOpponent.color}33`
                }}>
                    {selectedOpponent.mechanic}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginTop: '35px', marginBottom: '20px', fontSize: '22px' }}>Select Level</h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    maxWidth: '420px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;
                        const levelDiff = getDifficulty(selectedOpponent.id, levelNum);
                        const bestScore = progression.bestScores[selectedOpponent.id][i];

                        return (
                            <div key={i} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                    disabled={!unlocked}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        background: unlocked
                                            ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                            : theme.bgDark,
                                        border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                        borderRadius: '12px',
                                        color: unlocked ? 'white' : theme.textMuted,
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        cursor: unlocked ? 'pointer' : 'not-allowed',
                                        opacity: unlocked ? 1 : 0.5,
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={e => {
                                        if (unlocked) {
                                            e.target.style.transform = 'scale(1.08)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    {unlocked ? levelNum : '🔒'}
                                    {unlocked && bestScore > 0 && (
                                        <div style={{
                                            fontSize: '10px',
                                            marginTop: '2px',
                                            opacity: 0.8
                                        }}>
                                            {bestScore >= levelDiff.targetScore ? '★' : ''}
                                        </div>
                                    )}
                                </button>
                                {unlocked && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '10px',
                                        color: theme.textMuted,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {levelDiff.targetScore} pts
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    marginTop: '40px',
                    color: theme.textMuted,
                    fontSize: '13px',
                    textAlign: 'center'
                }}>
                    Earn stars by reaching the target score!<br/>
                    Each star unlocks the next level.
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // PLAYING SCREEN - The main game!
    // ═══════════════════════════════════════════════════════════════
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);
        const progressPercent = Math.min(100, (score / difficulty.targetScore) * 100);
        const isWinning = score >= difficulty.targetScore;

        // Screen shake transform
        const shakeX = screenShake ? (Math.random() - 0.5) * screenShake * 2 : 0;
        const shakeY = screenShake ? (Math.random() - 0.5) * screenShake * 2 : 0;

        return (
            <div
                ref={gameAreaRef}
                style={{
                    minHeight: '100vh',
                    background: feverMode
                        ? `linear-gradient(135deg, #2a1030 0%, ${opp.color}25 50%, #2a1030 100%)`
                        : `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}12 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    color: theme.text,
                    userSelect: 'none',
                    overflow: 'hidden',
                    transform: `translate(${shakeX}px, ${shakeY}px)`,
                    transition: feverMode ? 'background 0.5s' : 'none'
                }}
                onMouseMove={handlePointerMove}
                onTouchMove={handlePointerMove}
            >
                {/* PAUSE OVERLAY */}
                {isPaused && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <h2 style={{ fontSize: '56px', marginBottom: '30px', color: theme.gold }}>PAUSED</h2>
                        <button
                            onClick={() => setIsPaused(false)}
                            style={{
                                padding: '18px 50px',
                                fontSize: '20px',
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Resume
                        </button>
                        <button
                            onClick={() => setGameState('select')}
                            style={{
                                marginTop: '15px',
                                padding: '12px 35px',
                                background: 'transparent',
                                border: `2px solid ${theme.border}`,
                                borderRadius: '8px',
                                color: theme.textMuted,
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Quit to Menu
                        </button>
                    </div>
                )}

                {/* HEADER - Clear goals, immediate feedback */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 20px',
                    background: 'rgba(0,0,0,0.4)',
                    borderBottom: `2px solid ${opp.color}44`
                }}>
                    {/* Left: Opponent info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{opp.emoji}</span>
                        <div>
                            <div style={{ color: opp.color, fontWeight: 'bold' }}>Level {currentLevel}</div>
                            <div style={{ fontSize: '11px', color: theme.textMuted }}>{currentWave}</div>
                        </div>
                    </div>

                    {/* Center: Score and progress */}
                    <div style={{ textAlign: 'center', minWidth: '180px' }}>
                        <div style={{
                            color: isWinning ? theme.success : theme.gold,
                            fontSize: '36px',
                            fontWeight: 'bold',
                            textShadow: isWinning ? `0 0 15px ${theme.success}` : 'none',
                            transition: 'all 0.3s'
                        }}>
                            {score}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                            <ProgressBar current={score} target={difficulty.targetScore} color={opp.color} />
                        </div>
                        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
                            Target: {difficulty.targetScore}
                        </div>
                    </div>

                    {/* Right: Combo and timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Combo counter */}
                        <div style={{ textAlign: 'center', minWidth: '60px' }}>
                            {combo > 0 && (
                                <div style={{
                                    color: feverMode ? '#ff4488' : theme.accent,
                                    fontWeight: 'bold',
                                    fontSize: combo >= 8 ? '24px' : '20px',
                                    animation: combo >= 5 ? 'pulse 0.4s infinite' : 'none',
                                    textShadow: feverMode ? '0 0 15px #ff4488' : 'none'
                                }}>
                                    {combo}x
                                    {feverMode && <span style={{ fontSize: '12px' }}> FEVER!</span>}
                                </div>
                            )}
                        </div>

                        {/* Timer with urgency */}
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: timeLeft <= 10 ? theme.error : theme.text,
                            animation: timeLeft <= 10 ? 'pulse 0.5s infinite' : 'none',
                            textShadow: timeLeft <= 10 ? `0 0 10px ${theme.error}` : 'none'
                        }}>
                            {timeLeft}s
                        </div>
                    </div>
                </div>

                {/* Active power-ups display */}
                {Object.keys(activePowerUps).length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.3)'
                    }}>
                        {Object.entries(activePowerUps).map(([key, active]) => active && (
                            <div key={key} style={{
                                padding: '4px 12px',
                                background: `linear-gradient(135deg, ${theme.accent}44, ${theme.accentBright}44)`,
                                borderRadius: '15px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                border: `1px solid ${theme.accent}`
                            }}>
                                {powerUpTypes[key].emoji} {powerUpTypes[key].name}
                            </div>
                        ))}
                    </div>
                )}

                {/* GAME AREA */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Falling items */}
                    {fallingItems.map(item => {
                        const isPowerUp = item.type === 'powerup';
                        const itemDef = isPowerUp ? powerUpTypes[item.powerUpType] : itemTypes[item.type];
                        const isFadingItem = item.fading && item.y < 60;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    position: 'absolute',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: isPowerUp ? '36px' : '44px',
                                    opacity: isFadingItem ? 0.2 : 1,
                                    transition: 'opacity 0.3s',
                                    filter: isPowerUp
                                        ? 'drop-shadow(0 0 15px rgba(255, 105, 180, 0.8))'
                                        : (itemDef.type === 'good'
                                            ? `drop-shadow(0 0 12px ${theme.goldGlow})`
                                            : 'none'),
                                    animation: isPowerUp ? 'float 1s ease-in-out infinite' : 'none'
                                }}
                            >
                                {isPowerUp ? itemDef.emoji : itemDef.emoji}
                            </div>
                        );
                    })}

                    {/* Particles */}
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            style={{
                                position: 'absolute',
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                background: particle.color,
                                borderRadius: '50%',
                                opacity: particle.life,
                                pointerEvents: 'none',
                                boxShadow: `0 0 ${particle.size}px ${particle.color}`
                            }}
                        />
                    ))}

                    {/* Catch effects */}
                    {catchEffects.map(effect => (
                        <div
                            key={effect.id}
                            style={{
                                position: 'absolute',
                                left: `${effect.x}%`,
                                top: `${effect.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: effect.isGolden ? '28px' : '22px',
                                fontWeight: 'bold',
                                color: effect.type === 'powerup' ? theme.accent
                                    : effect.type === 'shield' ? theme.success
                                    : effect.type === 'good' ? theme.gold
                                    : theme.error,
                                animation: 'floatUp 0.6s ease-out forwards',
                                pointerEvents: 'none',
                                textShadow: effect.isGolden
                                    ? `0 0 20px ${theme.gold}`
                                    : effect.isFever
                                    ? '0 0 15px #ff4488'
                                    : 'none',
                                zIndex: 100
                            }}
                        >
                            {effect.text || (effect.points > 0 ? '+' : '') + effect.points}
                            {effect.isFever && effect.type === 'good' && ' 🔥'}
                        </div>
                    ))}

                    {/* Player - animated bear with basket */}
                    <div style={{
                        position: 'absolute',
                        left: `${playerX}%`,
                        bottom: '6%',
                        transform: `translateX(-50%) rotate(${playerTilt}deg)`,
                        transition: 'transform 0.05s ease-out',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        {/* Shield effect */}
                        {activePowerUps.shield && (
                            <div style={{
                                position: 'absolute',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: `3px solid ${theme.success}`,
                                background: `${theme.success}22`,
                                animation: 'pulse 1s infinite',
                                zIndex: -1
                            }} />
                        )}
                        {/* Magnet effect */}
                        {activePowerUps.magnet && (
                            <div style={{
                                position: 'absolute',
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                border: `2px dashed ${theme.accent}`,
                                animation: 'spin 3s linear infinite',
                                zIndex: -1,
                                opacity: 0.5
                            }} />
                        )}
                        <div style={{
                            fontSize: '65px',
                            filter: feverMode ? 'drop-shadow(0 0 20px #ff4488)' : 'none'
                        }}>🐻</div>
                        <div style={{
                            fontSize: '45px',
                            marginTop: '-18px'
                        }}>🧺</div>
                    </div>

                    {/* Ground with honey glow */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '4%',
                        background: `linear-gradient(to top, ${theme.honey}66, transparent)`
                    }} />
                </div>

                {/* Controls hint */}
                <div style={{
                    padding: '10px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    fontSize: '12px',
                    color: theme.textMuted
                }}>
                    ← → or A/D to move | ESC to pause | Touch/drag on mobile
                </div>

                {/* Animations */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -180%) scale(1.3); opacity: 0; }
                    }
                    @keyframes float {
                        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                        50% { transform: translate(-50%, -50%) translateY(-5px); }
                    }
                    @keyframes spin {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // RESULT SCREEN - Celebration of achievement (Fiero!)
    // ═══════════════════════════════════════════════════════════════
    if (gameState === 'result') {
        const opp = selectedOpponent;
        const difficulty = getDifficulty(opp.id, currentLevel);
        const won = score >= difficulty.targetScore;
        const ratio = score / difficulty.targetScore;

        let earnedPoints = 0;
        let performanceText = '';
        if (won) {
            if (ratio >= 1.8) { earnedPoints = 4; performanceText = 'LEGENDARY!'; }
            else if (ratio >= 1.4) { earnedPoints = 3; performanceText = 'EXCELLENT!'; }
            else if (ratio >= 1.15) { earnedPoints = 2; performanceText = 'GREAT!'; }
            else { earnedPoints = 1; performanceText = 'GOOD!'; }
        }

        return (
            <div style={{
                minHeight: '100vh',
                background: won
                    ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.success}22 50%, ${theme.bg} 100%)`
                    : `linear-gradient(135deg, ${theme.bg} 0%, ${theme.error}15 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.text,
                padding: '20px'
            }}>
                {/* Victory/Defeat emoji */}
                <div style={{
                    fontSize: '100px',
                    marginBottom: '15px',
                    animation: won ? 'bounce 0.6s ease infinite' : 'none'
                }}>
                    {won ? '🏆' : '💪'}
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '48px',
                    color: won ? theme.gold : theme.accent,
                    marginBottom: '5px',
                    textShadow: won ? `0 0 30px ${theme.goldGlow}` : 'none'
                }}>
                    {won ? 'SWEET VICTORY!' : 'KEEP TRYING!'}
                </h1>

                {won && performanceText && (
                    <div style={{
                        fontSize: '24px',
                        color: theme.success,
                        marginBottom: '15px',
                        fontWeight: 'bold'
                    }}>
                        {performanceText}
                    </div>
                )}

                {/* Opponent quote */}
                <p style={{
                    color: opp.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '25px'
                }}>
                    {opp.emoji} "{won ? opp.loseQuote : opp.winQuote}"
                </p>

                {/* Score display */}
                <div style={{
                    background: theme.bgPanel,
                    padding: '25px 50px',
                    borderRadius: '20px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    border: `2px solid ${won ? theme.success : theme.border}`
                }}>
                    <div style={{
                        fontSize: '48px',
                        color: theme.gold,
                        fontWeight: 'bold'
                    }}>
                        {score}
                    </div>
                    <div style={{ color: theme.textMuted, marginTop: '5px' }}>
                        Target: {difficulty.targetScore}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <ProgressBar current={score} target={difficulty.targetScore} color={opp.color} />
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    gap: '30px',
                    marginBottom: '25px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.accent, fontSize: '24px', fontWeight: 'bold' }}>
                            {maxCombo}x
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Best Combo</div>
                    </div>
                </div>

                {/* Points earned */}
                {won && (
                    <div style={{
                        background: `linear-gradient(135deg, ${theme.gold}22, ${theme.gold}11)`,
                        padding: '15px 35px',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        border: `1px solid ${theme.gold}44`
                    }}>
                        <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>
                            +{earnedPoints} Star Points
                        </span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(opp.id)}/10 Stars)
                        </span>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => startMatch(opp, currentLevel)}
                        style={{
                            padding: '16px 35px',
                            fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>

                    {won && currentLevel < 10 && (
                        <button
                            onClick={() => startMatch(opp, currentLevel + 1)}
                            style={{
                                padding: '16px 35px',
                                fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.success}, #40b868)`,
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                            Next Level →
                        </button>
                    )}

                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            padding: '16px 35px',
                            fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '12px',
                            color: theme.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.borderColor = theme.accent}
                        onMouseLeave={e => e.target.style.borderColor = theme.border}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};
