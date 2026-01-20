const { useState, useEffect, useCallback, useRef } = React;

/**
 * BEACH BALL - Keep It Up!
 *
 * Design Principles Applied:
 * - Flow State: Challenge-skill balance, immediate feedback, clear goals
 * - The Lens of the Toy: Ball bouncing is inherently satisfying
 * - Four Keys: Hard Fun (fiero), Easy Fun (discovery), Serious Fun (mastery)
 * - Pattern Learning: Timing, positioning, force control depth
 * - Juice: Screen shake, particles, squash/stretch, sound escalation
 */

const BeachBall = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff6347', accentBright: '#ff7f6a',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        danger: '#ff4444', dangerGlow: 'rgba(255, 68, 68, 0.3)'
    };

    // Opponents with carefully tuned mechanics for progression
    // Each introduces ONE new concept clearly (Pattern Learning principle)
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Starter',
            mechanic: 'Learn the basics - keep it up!',
            // Generous physics for learning the core loop
            baseGravity: 0.28, bounciness: 0.7, baseSpeedIncrease: 0.0008, baseShrinkRate: 0.0002,
            special: 'none',
            startY: 40, // Higher start = more reaction time
            baseHitZone: 100, minHitZone: 50
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Precision Teacher',
            mechanic: 'Center hits give +2 points!',
            baseGravity: 0.32, bounciness: 0.65, baseSpeedIncrease: 0.001, baseShrinkRate: 0.0003,
            special: 'perfect_bonus',
            startY: 38, baseHitZone: 95, minHitZone: 45
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Rhythm Master',
            mechanic: 'Ball pulses to the beat - time your hits!',
            baseGravity: 0.34, bounciness: 0.62, baseSpeedIncrease: 0.0012, baseShrinkRate: 0.00035,
            special: 'pulsing_ball',
            startY: 36, baseHitZone: 90, minHitZone: 42
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Wind Rider',
            mechanic: 'Wind pushes the ball - watch the indicator!',
            baseGravity: 0.35, bounciness: 0.6, baseSpeedIncrease: 0.0013, baseShrinkRate: 0.0004,
            special: 'wind',
            startY: 35, baseHitZone: 88, minHitZone: 40,
            windStrength: 0.15 // Gentle wind to learn
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Multiplier',
            mechanic: 'Ball splits at milestones - juggle them both!',
            baseGravity: 0.33, bounciness: 0.65, baseSpeedIncrease: 0.001, baseShrinkRate: 0.00035,
            special: 'split_ball',
            startY: 38, baseHitZone: 92, minHitZone: 42,
            splitInterval: 15 // Split every 15 points
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Shadow Dancer',
            mechanic: 'Ball fades - track its movement!',
            baseGravity: 0.36, bounciness: 0.58, baseSpeedIncrease: 0.0014, baseShrinkRate: 0.00045,
            special: 'invisible',
            startY: 34, baseHitZone: 85, minHitZone: 38,
            minOpacity: 0.25 // Never fully invisible - that would be unfair
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Ice Strategist',
            mechanic: 'Ice zones slow the ball - use them wisely!',
            baseGravity: 0.38, bounciness: 0.55, baseSpeedIncrease: 0.0015, baseShrinkRate: 0.0005,
            special: 'ice_zones',
            startY: 33, baseHitZone: 82, minHitZone: 36
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Curve Artist',
            mechanic: 'Ball curves mid-air - predict the path!',
            baseGravity: 0.4, bounciness: 0.55, baseSpeedIncrease: 0.0016, baseShrinkRate: 0.00055,
            special: 'curve',
            startY: 32, baseHitZone: 80, minHitZone: 34,
            curveStrength: 0.04
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Gravity Bender',
            mechanic: 'Gravity shifts direction - stay alert!',
            baseGravity: 0.38, bounciness: 0.55, baseSpeedIncrease: 0.0017, baseShrinkRate: 0.0006,
            special: 'gravity_shift',
            startY: 35, baseHitZone: 85, minHitZone: 35,
            gravityShiftSpeed: 0.0012
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Challenge',
            mechanic: 'Master of all - prove your worth!',
            // Tough but fair - all mechanics at reduced intensity
            baseGravity: 0.42, bounciness: 0.52, baseSpeedIncrease: 0.0018, baseShrinkRate: 0.0007,
            special: 'chaos',
            startY: 32, baseHitZone: 78, minHitZone: 32,
            // Reduced intensity for chaos mode so it's challenging but beatable
            windStrength: 0.1,
            curveStrength: 0.025,
            gravityShiftSpeed: 0.0008,
            minOpacity: 0.35
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
    const [gravityAngle, setGravityAngle] = useState(Math.PI / 2);
    const [lastHitResult, setLastHitResult] = useState(null);
    const [perfectCount, setPerfectCount] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [bestCombo, setBestCombo] = useState(0);
    const [beatPhase, setBeatPhase] = useState(0);
    const [iceZones, setIceZones] = useState([]);
    const [ballOpacity, setBallOpacity] = useState(1);
    const [gameTime, setGameTime] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [graceTime, setGraceTime] = useState(0); // Grace period at start

    // Juice state
    const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
    const [particles, setParticles] = useState([]);
    const [flashEffect, setFlashEffect] = useState(null);
    const [dangerLevel, setDangerLevel] = useState(0); // 0-1, how close ball is to ground
    const [lastClickPos, setLastClickPos] = useState(null);
    const [milestoneReached, setMilestoneReached] = useState(null);

    // Refs
    const animationRef = useRef(null);
    const gameAreaRef = useRef(null);
    const audioContextRef = useRef(null);
    const lastScoreRef = useRef(0);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('beachball_progression_v2');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0), bestScores: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('beachball_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Enhanced sound system with variety and escalation
    const playSound = useCallback((type, intensity = 1) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;

            // Create oscillator and gain
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            let freq, duration, volume, waveType = 'sine';

            switch(type) {
                case 'perfect':
                    // Triumphant two-tone (fiero feedback)
                    freq = 880;
                    duration = 0.15;
                    volume = 0.2 * intensity;
                    // Add harmonic
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.frequency.value = 1100;
                    gain2.gain.setValueAtTime(0.1 * intensity, now);
                    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                    osc2.start(now);
                    osc2.stop(now + 0.12);
                    break;
                case 'good':
                    freq = 660;
                    duration = 0.1;
                    volume = 0.15 * intensity;
                    break;
                case 'hit':
                    freq = 440 + (Math.random() * 40 - 20); // Slight variation
                    duration = 0.08;
                    volume = 0.12 * intensity;
                    break;
                case 'combo':
                    // Escalating combo sound
                    freq = 500 + (intensity * 100); // Higher pitch for higher combos
                    duration = 0.06;
                    volume = 0.1;
                    waveType = 'triangle';
                    break;
                case 'danger':
                    // Low warning pulse
                    freq = 150;
                    duration = 0.2;
                    volume = 0.08 * intensity;
                    waveType = 'sawtooth';
                    break;
                case 'drop':
                    // Descending failure sound
                    freq = 300;
                    duration = 0.4;
                    volume = 0.2;
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
                    break;
                case 'milestone':
                    // Achievement fanfare
                    freq = 523; // C5
                    duration = 0.3;
                    volume = 0.15;
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.1); // E5
                    osc.frequency.setValueAtTime(784, now + 0.2); // G5
                    break;
                case 'win':
                    // Victory fanfare
                    freq = 523;
                    duration = 0.5;
                    volume = 0.2;
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.12);
                    osc.frequency.setValueAtTime(784, now + 0.24);
                    osc.frequency.setValueAtTime(1047, now + 0.36);
                    break;
                case 'nearMiss':
                    // Subtle whoosh
                    freq = 200;
                    duration = 0.1;
                    volume = 0.05;
                    waveType = 'sawtooth';
                    break;
                default:
                    freq = 440;
                    duration = 0.1;
                    volume = 0.1;
            }

            osc.type = waveType;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }, []);

    // Particle system for juice
    const createParticles = useCallback((x, y, count, color, type = 'burst') => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = type === 'burst' ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
            newParticles.push({
                id: Date.now() + Math.random(),
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (type === 'burst' ? 2 : 0),
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: type === 'burst' ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
                color
            });
        }
        setParticles(prev => [...prev, ...newParticles].slice(-50)); // Limit particles
    }, []);

    // Screen shake for impact feedback
    const triggerScreenShake = useCallback((intensity) => {
        const shake = () => {
            const decay = 0.9;
            let currentIntensity = intensity;

            const shakeFrame = () => {
                if (currentIntensity < 0.5) {
                    setScreenShake({ x: 0, y: 0 });
                    return;
                }
                setScreenShake({
                    x: (Math.random() - 0.5) * currentIntensity,
                    y: (Math.random() - 0.5) * currentIntensity
                });
                currentIntensity *= decay;
                requestAnimationFrame(shakeFrame);
            };
            shakeFrame();
        };
        shake();
    }, []);

    // Create ball with squash/stretch properties
    const createBall = useCallback((x, y, vx = 0, vy = 0) => ({
        id: Date.now() + Math.random(),
        x, y,
        vx: vx || (Math.random() - 0.5) * 1.5,
        vy: vy || 0,
        baseSize: 55,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        hue: Math.random() * 60 + 330,
        trail: [] // Position history for trail effect
    }), []);

    // Calculate level-adjusted parameters (smooth difficulty curve)
    const getLevelParams = useCallback((opponent, level) => {
        // Level 1 = base difficulty, Level 10 = max difficulty
        // Use exponential curve for smooth progression
        const levelFactor = (level - 1) / 9; // 0 to 1
        const curve = Math.pow(levelFactor, 1.5); // Exponential curve - easier early, harder late

        return {
            gravity: opponent.baseGravity * (1 + curve * 0.4),
            speedIncrease: opponent.baseSpeedIncrease * (1 + curve * 0.8),
            shrinkRate: opponent.baseShrinkRate * (1 + curve * 0.6),
            hitZone: opponent.baseHitZone - (opponent.baseHitZone - opponent.minHitZone) * curve,
            // Target score: 12 base + level scaling + opponent scaling
            // Level 1: ~12-18 points, Level 10: ~35-55 points
            targetScore: Math.round(12 + level * 2.5 + opponent.id * 2 + curve * 15)
        };
    }, []);

    // Start match with proper initialization
    const startMatch = useCallback((opponent, level) => {
        const params = getLevelParams(opponent, level);

        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        lastScoreRef.current = 0;
        setTargetScore(params.targetScore);
        setBalls([createBall(50, opponent.startY)]);
        setHitZoneSize(params.hitZone);
        setSpeedMultiplier(1);
        setWind(0);
        setGravityAngle(Math.PI / 2);
        setLastHitResult(null);
        setPerfectCount(0);
        setComboCount(0);
        setBestCombo(0);
        setBeatPhase(0);
        setBallOpacity(1);
        setGameTime(0);
        setIsGameOver(false);
        setGraceTime(120); // 2 seconds of grace at 60fps
        setParticles([]);
        setScreenShake({ x: 0, y: 0 });
        setDangerLevel(0);
        setMilestoneReached(null);

        // Set up ice zones for Professor Penguin
        if (opponent.special === 'ice_zones' || opponent.special === 'chaos') {
            setIceZones([
                { x: 15, y: 55, width: 22, height: 18 },
                { x: 63, y: 35, width: 18, height: 22 }
            ]);
        } else {
            setIceZones([]);
        }

        setGameState('playing');
    }, [createBall, getLevelParams]);

    // Handle ball bop with enhanced feedback
    const handleBop = useCallback((e) => {
        if (gameState !== 'playing' || isGameOver) return;

        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        const clickX = (clientX - rect.left) / rect.width * 100;
        const clickY = (clientY - rect.top) / rect.height * 100;

        setLastClickPos({ x: clickX, y: clickY, time: Date.now() });

        let hitAnyBall = false;
        let nearMiss = false;
        let nearMissDistance = Infinity;

        setBalls(prevBalls => {
            const newBalls = prevBalls.map(ball => {
                const dx = ball.x - clickX;
                const dy = ball.y - clickY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const hitRadius = hitZoneSize / 2;

                // Check for near miss (within 1.5x hit radius but outside hit radius)
                if (dist >= hitRadius && dist < hitRadius * 1.5) {
                    nearMiss = true;
                    nearMissDistance = Math.min(nearMissDistance, dist - hitRadius);
                }

                if (dist < hitRadius) {
                    hitAnyBall = true;

                    // Calculate hit quality based on distance from center
                    const centerDist = dist / hitRadius;
                    const isPerfect = centerDist < 0.25;
                    const isGood = centerDist < 0.5;

                    // Calculate bop direction and force
                    // Force is stronger for center hits (rewarding precision)
                    const angle = Math.atan2(dy, dx);
                    const baseBopForce = 10;
                    const bonusForce = (1 - centerDist) * 4;
                    const bopForce = baseBopForce + bonusForce;

                    // Score based on hit quality
                    const points = isPerfect ? 2 : 1;
                    setScore(s => s + points);
                    setComboCount(c => {
                        const newCombo = c + 1;
                        setBestCombo(best => Math.max(best, newCombo));
                        // Combo sound escalation
                        if (newCombo >= 3) {
                            playSound('combo', Math.min(newCombo / 3, 3));
                        }
                        return newCombo;
                    });

                    // Visual and audio feedback based on hit quality
                    if (isPerfect) {
                        setPerfectCount(p => p + 1);
                        setLastHitResult('perfect');
                        playSound('perfect', 1);
                        triggerScreenShake(8);
                        createParticles(ball.x, ball.y, 12, theme.gold, 'burst');
                        setFlashEffect({ color: theme.gold, opacity: 0.3 });
                    } else if (isGood) {
                        setLastHitResult('good');
                        playSound('good', 1);
                        triggerScreenShake(4);
                        createParticles(ball.x, ball.y, 8, theme.success, 'burst');
                    } else {
                        setLastHitResult('hit');
                        playSound('hit', 1);
                        triggerScreenShake(2);
                        createParticles(ball.x, ball.y, 5, theme.accent, 'burst');
                    }

                    setTimeout(() => setLastHitResult(null), 400);
                    setTimeout(() => setFlashEffect(null), 150);

                    // Apply velocity with squash effect
                    return {
                        ...ball,
                        vx: Math.cos(angle) * bopForce * 0.4,
                        vy: -bopForce,
                        scaleX: 1.3, // Squash on hit
                        scaleY: 0.7,
                        rotation: ball.rotation + (Math.random() - 0.5) * 30
                    };
                }
                return ball;
            });

            if (!hitAnyBall) {
                setComboCount(0);
                if (nearMiss) {
                    playSound('nearMiss');
                    setLastHitResult('miss');
                    setTimeout(() => setLastHitResult(null), 200);
                }
            }

            return newBalls;
        });
    }, [gameState, isGameOver, hitZoneSize, playSound, triggerScreenShake, createParticles, theme]);

    // Game loop with enhanced physics and juice
    useEffect(() => {
        if (gameState !== 'playing' || isGameOver) return;

        const opp = selectedOpponent;
        const params = getLevelParams(opp, currentLevel);
        let lastTime = performance.now();

        const animate = (currentTime) => {
            const rawDelta = currentTime - lastTime;
            lastTime = currentTime;
            // Cap delta to prevent physics explosions on tab switch
            const delta = Math.min(rawDelta / 16.67, 3);

            setGameTime(t => t + delta);

            // Grace period countdown
            setGraceTime(gt => Math.max(0, gt - delta));

            // Update beat phase for pulsing effects
            setBeatPhase(p => (p + 0.06 * delta) % (Math.PI * 2));

            // Gradual speed increase (creates ramping difficulty within level)
            setSpeedMultiplier(s => Math.min(s + params.speedIncrease * delta, 2.5));

            // Gradual hit zone shrink
            setHitZoneSize(hz => Math.max(opp.minHitZone, hz - params.shrinkRate * delta));

            // Wind effect
            if (opp.special === 'wind' || opp.special === 'chaos') {
                const windStr = opp.windStrength || 0.15;
                setWind(Math.sin(currentTime / 2500) * windStr);
            }

            // Gravity shift
            if (opp.special === 'gravity_shift' || opp.special === 'chaos') {
                const shiftSpeed = opp.gravityShiftSpeed || 0.0012;
                setGravityAngle(a => a + shiftSpeed * delta);
            }

            // Ball visibility
            if (opp.special === 'invisible' || opp.special === 'chaos') {
                const minOp = opp.minOpacity || 0.25;
                const range = (1 - minOp) / 2;
                setBallOpacity(minOp + range + Math.sin(currentTime / 800) * range);
            }

            // Update particles
            setParticles(prev => prev
                .map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + 0.1, // Gravity on particles
                    life: p.life - p.decay
                }))
                .filter(p => p.life > 0)
            );

            // Update balls
            setBalls(prevBalls => {
                if (prevBalls.length === 0) return prevBalls;

                let maxDanger = 0;

                const newBalls = prevBalls.map(ball => {
                    let { x, y, vx, vy, baseSize, scaleX, scaleY, rotation, hue, id, trail } = ball;

                    // Apply gravity based on current angle
                    const effectiveGravity = params.gravity * speedMultiplier;
                    const gravX = Math.cos(gravityAngle) * effectiveGravity * delta;
                    const gravY = Math.sin(gravityAngle) * effectiveGravity * delta;
                    vx += gravX;
                    vy += gravY;

                    // Apply wind
                    vx += wind * delta;

                    // Curve effect
                    if (opp.special === 'curve' || opp.special === 'chaos') {
                        const curveStr = opp.curveStrength || 0.04;
                        vx += Math.sin(currentTime / 600) * curveStr * delta;
                    }

                    // Air resistance (makes physics feel better)
                    vx *= 0.998;
                    vy *= 0.999;

                    // Ice zone slowdown
                    let inIceZone = false;
                    for (const zone of iceZones) {
                        if (x > zone.x && x < zone.x + zone.width &&
                            y > zone.y && y < zone.y + zone.height) {
                            vx *= 0.96;
                            vy *= 0.96;
                            inIceZone = true;
                        }
                    }

                    // Apply velocity
                    x += vx * delta;
                    y += vy * delta;

                    // Update trail
                    const newTrail = [...trail, { x, y }].slice(-8);

                    // Bounce off walls with satisfying feedback
                    if (x < 5) {
                        x = 5;
                        vx = Math.abs(vx) * opp.bounciness;
                        scaleX = 0.7;
                        scaleY = 1.3;
                    }
                    if (x > 95) {
                        x = 95;
                        vx = -Math.abs(vx) * opp.bounciness;
                        scaleX = 0.7;
                        scaleY = 1.3;
                    }
                    if (y < 5) {
                        y = 5;
                        vy = Math.abs(vy) * opp.bounciness;
                        scaleX = 1.3;
                        scaleY = 0.7;
                    }

                    // Squash/stretch recovery (spring back to normal)
                    scaleX += (1 - scaleX) * 0.15 * delta;
                    scaleY += (1 - scaleY) * 0.15 * delta;

                    // Rotation based on horizontal velocity
                    rotation += vx * 2 * delta;

                    // Pulsing ball size
                    let displaySize = baseSize;
                    if (opp.special === 'pulsing_ball' || opp.special === 'chaos') {
                        displaySize = baseSize * (0.85 + Math.sin(beatPhase) * 0.15);
                    }

                    // Calculate danger level (for warning effects)
                    const ballDanger = Math.max(0, (y - 70) / 25); // Danger starts at y=70
                    maxDanger = Math.max(maxDanger, ballDanger);

                    return {
                        id, x, y, vx, vy, baseSize, displaySize,
                        scaleX, scaleY, rotation, hue, trail,
                        inIceZone
                    };
                });

                setDangerLevel(maxDanger);

                // Danger warning sound
                if (maxDanger > 0.5 && Math.random() < 0.02 * maxDanger) {
                    playSound('danger', maxDanger);
                }

                // Check if any ball hit the ground
                const groundLevel = 92; // Slightly higher to give visual warning
                const aliveBalls = newBalls.filter(ball => {
                    if (ball.y >= groundLevel && graceTime <= 0) {
                        // Ball dropped - create explosion particles
                        createParticles(ball.x, groundLevel, 15, theme.error, 'burst');
                        return false;
                    }
                    return true;
                });

                if (aliveBalls.length < newBalls.length) {
                    playSound('drop');
                    setIsGameOver(true);
                    triggerScreenShake(15);
                    setFlashEffect({ color: theme.error, opacity: 0.4 });
                    setTimeout(() => {
                        setFlashEffect(null);
                        setGameState('result');
                    }, 1200);
                }

                // Split ball mechanic
                if ((opp.special === 'split_ball' || opp.special === 'chaos') &&
                    aliveBalls.length === 1 &&
                    score > 0 &&
                    score !== lastScoreRef.current &&
                    score % (opp.splitInterval || 15) === 0 &&
                    aliveBalls[0].y < 60) {

                    lastScoreRef.current = score;
                    const original = aliveBalls[0];
                    playSound('milestone');
                    createParticles(original.x, original.y, 10, opp.color, 'burst');
                    setMilestoneReached('SPLIT!');
                    setTimeout(() => setMilestoneReached(null), 800);

                    return [
                        { ...original, vx: original.vx - 2.5, id: Date.now() },
                        { ...original, vx: original.vx + 2.5, id: Date.now() + 1, hue: (original.hue + 60) % 360 }
                    ];
                }

                return aliveBalls;
            });

            // Check score milestones for feedback
            if (score > 0 && score % 10 === 0 && score !== lastScoreRef.current) {
                lastScoreRef.current = score;
                if (selectedOpponent.special !== 'split_ball' && selectedOpponent.special !== 'chaos') {
                    playSound('milestone');
                    setMilestoneReached(`${score} POINTS!`);
                    setTimeout(() => setMilestoneReached(null), 800);
                }
            }

            // Check win condition
            if (score >= targetScore) {
                playSound('win');
                setFlashEffect({ color: theme.gold, opacity: 0.3 });
                setTimeout(() => {
                    setFlashEffect(null);
                    setGameState('result');
                }, 500);
                return;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [gameState, isGameOver, selectedOpponent, currentLevel, score, targetScore,
        speedMultiplier, wind, gravityAngle, iceZones, beatPhase, graceTime,
        playSound, createParticles, triggerScreenShake, getLevelParams, theme]);

    // Handle result and progression
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = score >= targetScore;
        if (won && selectedOpponent) {
            // Points based on performance
            let points = 1;
            if (perfectCount >= 5) points += 1;
            if (bestCombo >= 10) points += 1;
            if (score >= targetScore * 1.5) points += 1; // Overkill bonus

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                const newBestScores = [...(prev.bestScores || Array(10).fill(0))];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                newBestScores[selectedOpponent.id] = Math.max(newBestScores[selectedOpponent.id] || 0, score);
                return { ...prev, starPoints: newPoints, bestScores: newBestScores };
            });
        }
    }, [gameState, score, targetScore, perfectCount, bestCombo, selectedOpponent]);

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
            if (e.code === 'Space' && gameState === 'result') {
                startMatch(selectedOpponent, currentLevel);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, selectedOpponent, currentLevel, startMatch]);

    // Star bar component
    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{
                    width: '12px', height: '12px',
                    background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark,
                    borderRadius: '2px',
                    border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                    boxShadow: i < Math.floor(points / 4) ? `0 0 4px ${theme.goldGlow}` : 'none'
                }} />
            ))}
        </div>
    );

    // Progress bar component
    const ProgressBar = ({ current, target }) => {
        const progress = Math.min(current / target, 1);
        return (
            <div style={{
                width: '100%', height: '8px',
                background: theme.bgDark,
                borderRadius: '4px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`
            }}>
                <div style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: progress >= 1
                        ? `linear-gradient(90deg, ${theme.success}, ${theme.gold})`
                        : `linear-gradient(90deg, ${theme.accent}, ${theme.accentBright})`,
                    borderRadius: '4px',
                    transition: 'width 0.2s ease-out',
                    boxShadow: progress >= 0.8 ? `0 0 10px ${theme.gold}` : 'none'
                }} />
            </div>
        );
    };

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f20 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '80px', marginBottom: '10px', animation: 'bounce 2s infinite' }}>🏐</div>
                <h1 style={{ fontSize: '42px', marginBottom: '5px', color: theme.accent, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>BEACH BALL</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px', fontSize: '18px' }}>Keep It Up!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(255, 99, 71, 0.4)',
                        transform: 'scale(1)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 6px 25px rgba(255, 99, 71, 0.6)';
                    }}
                    onMouseLeave={e => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 20px rgba(255, 99, 71, 0.4)';
                    }}
                >
                    PLAY
                </button>

                <div style={{
                    marginTop: '40px', padding: '25px',
                    background: theme.bgPanel, borderRadius: '12px',
                    maxWidth: '420px', textAlign: 'center',
                    border: `1px solid ${theme.border}`
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '15px' }}>How to Play</h3>
                    <p style={{ color: theme.textSecondary, fontSize: '14px', lineHeight: '1.8' }}>
                        <span style={{ color: theme.gold }}>Click or tap</span> the ball to bop it upward!<br />
                        <span style={{ color: theme.success }}>Center hits</span> give bonus points.<br />
                        Build <span style={{ color: theme.accentBright }}>combos</span> for extra style!<br />
                        The ball speeds up over time - stay sharp!
                    </p>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '25px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px',
                    padding: '10px 20px', borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.borderColor = theme.accent}
                onMouseLeave={e => e.target.style.borderColor = theme.border}
                >← Back to Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }
                `}</style>
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
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.borderColor = theme.accent}
                    onMouseLeave={e => e.target.style.borderColor = theme.border}
                    >← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your Challenger</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '15px', maxWidth: '1200px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isOpponentUnlocked(idx);
                        const mastered = isOpponentMastered(idx);
                        const stars = getStars(idx);

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
                                    borderRadius: '14px', padding: '18px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    boxShadow: unlocked ? `0 4px 15px ${opp.color}22` : 'none'
                                }}
                                onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-4px)')}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {!unlocked && (
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '22px' }}>🔒</div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        background: `linear-gradient(135deg, ${theme.gold}, #e8b830)`,
                                        padding: '4px 10px',
                                        borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                        color: '#1a1020'
                                    }}>★ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px', width: '75px', height: '75px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}33`, borderRadius: '50%',
                                        boxShadow: `0 0 20px ${opp.color}22`
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: opp.color }}>
                                            {opp.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>
                                            {opp.title}
                                        </div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            background: `${opp.color}22`, padding: '5px 10px',
                                            borderRadius: '6px', marginBottom: '10px'
                                        }}>
                                            {opp.mechanic}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StarBar points={progression.starPoints[idx]} />
                                            <span style={{ fontSize: '12px', color: theme.textMuted }}>
                                                {stars}/10
                                            </span>
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
                    color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'all 0.2s'
                }}>← Back</button>

                <div style={{
                    fontSize: '90px', marginTop: '20px',
                    filter: `drop-shadow(0 0 20px ${selectedOpponent.color}66)`
                }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px', fontSize: '28px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted, fontSize: '14px' }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '15px', padding: '12px 24px',
                    background: `${selectedOpponent.color}22`, borderRadius: '10px',
                    color: theme.textSecondary, border: `1px solid ${selectedOpponent.color}44`
                }}>
                    {selectedOpponent.mechanic}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginTop: '35px', marginBottom: '20px', fontSize: '18px' }}>Select Level</h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px', maxWidth: '400px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;
                        const params = getLevelParams(selectedOpponent, levelNum);

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                title={unlocked ? `Target: ${params.targetScore} points` : 'Locked'}
                                style={{
                                    width: '65px', height: '65px',
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '22px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    boxShadow: unlocked ? `0 4px 15px ${selectedOpponent.color}33` : 'none'
                                }}
                                onMouseEnter={e => unlocked && (e.target.style.transform = 'scale(1.1)')}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            >
                                {unlocked ? levelNum : '🔒'}
                            </button>
                        );
                    })}
                </div>

                <p style={{ marginTop: '25px', color: theme.textMuted, fontSize: '13px' }}>
                    Earn stars by winning to unlock more levels!
                </p>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const progressPercent = Math.min(score / targetScore * 100, 100);

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}15 100%)`,
                display: 'flex', flexDirection: 'column',
                color: theme.text, userSelect: 'none',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    padding: '12px 20px', background: 'rgba(0,0,0,0.4)',
                    borderBottom: `1px solid ${theme.border}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '14px', color: theme.textMuted }}>Lv.{currentLevel}</span>
                            <span style={{ color: opp.color, fontWeight: 'bold' }}>{opp.emoji} {opp.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ fontSize: '18px' }}>
                                <span style={{ color: theme.gold, fontWeight: 'bold' }}>{score}</span>
                                <span style={{ color: theme.textMuted }}> / {targetScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ProgressBar current={score} target={targetScore} />
                        <span style={{ fontSize: '12px', color: theme.textMuted, minWidth: '40px' }}>
                            {Math.round(progressPercent)}%
                        </span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                        {comboCount >= 3 && (
                            <div style={{
                                color: theme.success,
                                fontWeight: 'bold',
                                animation: 'pulse 0.5s infinite'
                            }}>
                                🔥 Combo x{comboCount}!
                            </div>
                        )}
                        {perfectCount > 0 && (
                            <div style={{ color: theme.gold }}>⭐ Perfect: {perfectCount}</div>
                        )}
                        {graceTime > 0 && (
                            <div style={{ color: theme.success }}>
                                ✓ Grace: {Math.ceil(graceTime / 60)}s
                            </div>
                        )}
                    </div>
                </div>

                {/* Wind indicator */}
                {Math.abs(wind) > 0.02 && (
                    <div style={{
                        position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.6)', padding: '8px 18px', borderRadius: '20px',
                        fontSize: '14px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <span style={{ fontSize: '18px' }}>{wind > 0 ? '→' : '←'}</span>
                        <span>Wind {Math.abs(wind * 30).toFixed(0)}%</span>
                    </div>
                )}

                {/* Game area */}
                <div
                    ref={gameAreaRef}
                    onClick={handleBop}
                    onTouchStart={(e) => { e.preventDefault(); handleBop(e); }}
                    style={{
                        flex: 1, position: 'relative',
                        background: `linear-gradient(to bottom,
                            ${opp.color}08 0%,
                            ${theme.bgDark} 60%,
                            ${dangerLevel > 0.3 ? `rgba(255,68,68,${dangerLevel * 0.15})` : '#2a1a10'} 85%,
                            #c49830 100%)`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        minHeight: '400px',
                        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
                        touchAction: 'none'
                    }}
                >
                    {/* Flash effect overlay */}
                    {flashEffect && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: flashEffect.color,
                            opacity: flashEffect.opacity,
                            pointerEvents: 'none',
                            zIndex: 100
                        }} />
                    )}

                    {/* Beach/sand at bottom */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '12%',
                        background: 'linear-gradient(to bottom, #d4a840, #c49830)',
                        boxShadow: dangerLevel > 0.5 ? `0 -10px 30px ${theme.danger}` : 'none'
                    }} />

                    {/* Danger zone indicator */}
                    {dangerLevel > 0.3 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12%',
                            left: 0, right: 0,
                            height: '20%',
                            background: `linear-gradient(to bottom, transparent, ${theme.dangerGlow})`,
                            pointerEvents: 'none',
                            opacity: dangerLevel
                        }} />
                    )}

                    {/* Ice zones */}
                    {iceZones.map((zone, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${zone.x}%`, top: `${zone.y}%`,
                            width: `${zone.width}%`, height: `${zone.height}%`,
                            background: 'rgba(100, 200, 255, 0.15)',
                            border: '2px solid rgba(100, 200, 255, 0.4)',
                            borderRadius: '12px',
                            boxShadow: '0 0 20px rgba(100, 200, 255, 0.2)'
                        }}>
                            <span style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '28px', opacity: 0.6
                            }}>❄️</span>
                        </div>
                    ))}

                    {/* Particles */}
                    {particles.map(p => (
                        <div key={p.id} style={{
                            position: 'absolute',
                            left: `${p.x}%`, top: `${p.y}%`,
                            width: `${p.size}px`, height: `${p.size}px`,
                            background: p.color,
                            borderRadius: '50%',
                            opacity: p.life,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            boxShadow: `0 0 ${p.size}px ${p.color}`
                        }} />
                    ))}

                    {/* Balls */}
                    {balls.map(ball => (
                        <div key={ball.id} style={{
                            position: 'absolute',
                            left: `${ball.x}%`, top: `${ball.y}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: ballOpacity,
                            transition: 'opacity 0.1s'
                        }}>
                            {/* Ball trail */}
                            {ball.trail && ball.trail.map((pos, i) => (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${(pos.x - ball.x)}%`,
                                    top: `${(pos.y - ball.y)}%`,
                                    width: `${(ball.displaySize || ball.baseSize) * 0.3 * (i / ball.trail.length)}px`,
                                    height: `${(ball.displaySize || ball.baseSize) * 0.3 * (i / ball.trail.length)}px`,
                                    background: `hsla(${ball.hue}, 70%, 60%, ${0.1 * (i / ball.trail.length)})`,
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none'
                                }} />
                            ))}

                            {/* Hit zone indicator */}
                            <div style={{
                                position: 'absolute',
                                left: '50%', top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: `${hitZoneSize}px`, height: `${hitZoneSize}px`,
                                border: `2px dashed rgba(255,255,255,${0.2 + Math.sin(beatPhase) * 0.1})`,
                                borderRadius: '50%',
                                pointerEvents: 'none',
                                boxShadow: comboCount >= 5 ? `0 0 15px ${theme.gold}44` : 'none'
                            }} />

                            {/* Ball */}
                            <div style={{
                                width: `${(ball.displaySize || ball.baseSize)}px`,
                                height: `${(ball.displaySize || ball.baseSize)}px`,
                                transform: `scaleX(${ball.scaleX}) scaleY(${ball.scaleY}) rotate(${ball.rotation}deg)`,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 30% 30%,
                                    hsl(${ball.hue}, 85%, 75%),
                                    hsl(${ball.hue}, 85%, 55%),
                                    hsl(${ball.hue}, 85%, 45%))`,
                                boxShadow: `
                                    0 4px 20px rgba(0,0,0,0.4),
                                    inset 0 -8px 20px rgba(0,0,0,0.25),
                                    inset 0 8px 20px rgba(255,255,255,0.35)
                                    ${comboCount >= 5 ? `, 0 0 20px ${theme.gold}` : ''}
                                    ${ball.inIceZone ? `, 0 0 15px rgba(100,200,255,0.5)` : ''}
                                `,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: `${(ball.displaySize || ball.baseSize) * 0.4}px`,
                                transition: 'transform 0.05s ease-out'
                            }}>
                                🏐
                            </div>
                        </div>
                    ))}

                    {/* Hit result indicator */}
                    {lastHitResult && lastHitResult !== 'miss' && (
                        <div style={{
                            position: 'absolute',
                            top: '25%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: lastHitResult === 'perfect' ? '42px' : '32px',
                            fontWeight: 'bold',
                            color: lastHitResult === 'perfect' ? theme.gold
                                : lastHitResult === 'good' ? theme.success
                                : theme.accent,
                            textShadow: `0 0 20px ${lastHitResult === 'perfect' ? theme.gold : theme.accent}`,
                            animation: 'popUp 0.4s ease-out',
                            pointerEvents: 'none',
                            zIndex: 20
                        }}>
                            {lastHitResult === 'perfect' && '✨ PERFECT! +2'}
                            {lastHitResult === 'good' && 'Great! +1'}
                            {lastHitResult === 'hit' && '+1'}
                        </div>
                    )}

                    {/* Near miss indicator */}
                    {lastHitResult === 'miss' && (
                        <div style={{
                            position: 'absolute',
                            top: '30%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '20px',
                            color: theme.textMuted,
                            animation: 'fadeOut 0.2s ease-out',
                            pointerEvents: 'none'
                        }}>
                            miss...
                        </div>
                    )}

                    {/* Milestone notification */}
                    {milestoneReached && (
                        <div style={{
                            position: 'absolute',
                            top: '40%', left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: theme.gold,
                            textShadow: `0 0 30px ${theme.gold}`,
                            animation: 'popUp 0.8s ease-out',
                            pointerEvents: 'none',
                            zIndex: 25
                        }}>
                            🎯 {milestoneReached}
                        </div>
                    )}

                    {/* Game over overlay */}
                    {isGameOver && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column',
                            animation: 'fadeIn 0.3s ease-out',
                            zIndex: 50
                        }}>
                            <div style={{ fontSize: '100px', animation: 'shake 0.5s ease-out' }}>💥</div>
                            <div style={{ fontSize: '42px', color: theme.error, marginTop: '20px', fontWeight: 'bold' }}>
                                DROPPED!
                            </div>
                            <div style={{ fontSize: '18px', color: theme.textMuted, marginTop: '10px' }}>
                                Score: {score} / {targetScore}
                            </div>
                        </div>
                    )}

                    {/* Gravity indicator */}
                    {(opp.special === 'gravity_shift' || opp.special === 'chaos') && !isGameOver && (
                        <div style={{
                            position: 'absolute', bottom: '15%', right: '15px',
                            background: 'rgba(0,0,0,0.6)', padding: '12px',
                            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{
                                transform: `rotate(${gravityAngle - Math.PI/2}rad)`,
                                fontSize: '26px',
                                transition: 'transform 0.1s'
                            }}>⬇️</div>
                        </div>
                    )}

                    {/* Click ripple effect */}
                    {lastClickPos && Date.now() - lastClickPos.time < 200 && (
                        <div style={{
                            position: 'absolute',
                            left: `${lastClickPos.x}%`,
                            top: `${lastClickPos.y}%`,
                            width: '60px', height: '60px',
                            border: '2px solid rgba(255,255,255,0.4)',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: 'ripple 0.3s ease-out',
                            pointerEvents: 'none'
                        }} />
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 20px',
                    background: 'rgba(0,0,0,0.4)',
                    borderTop: `1px solid ${theme.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ fontSize: '13px', color: theme.textMuted }}>
                        Tap the ball to keep it up!
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
                        <span>
                            Zone: <span style={{ color: theme.accent }}>{Math.round(hitZoneSize)}px</span>
                        </span>
                        <span>
                            Speed: <span style={{ color: theme.accent }}>{speedMultiplier.toFixed(2)}x</span>
                        </span>
                    </div>
                </div>

                <style>{`
                    @keyframes popUp {
                        0% { transform: translateX(-50%) scale(0.5) translateY(20px); opacity: 0; }
                        50% { transform: translateX(-50%) scale(1.2) translateY(-10px); }
                        100% { transform: translateX(-50%) scale(1) translateY(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        0% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    @keyframes fadeIn {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px) rotate(-5deg); }
                        75% { transform: translateX(10px) rotate(5deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes ripple {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const won = score >= targetScore;
        const excellent = won && perfectCount >= 5;
        const overkill = won && score >= targetScore * 1.5;

        // Calculate points earned
        let pointsEarned = 0;
        if (won) {
            pointsEarned = 1;
            if (perfectCount >= 5) pointsEarned += 1;
            if (bestCombo >= 10) pointsEarned += 1;
            if (overkill) pointsEarned += 1;
        }

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{
                    fontSize: '120px', marginBottom: '20px',
                    animation: won ? 'bounce 1s ease-out' : 'shake 0.5s ease-out',
                    filter: won ? `drop-shadow(0 0 30px ${theme.gold})` : 'none'
                }}>
                    {excellent ? '🏆' : won ? '🎉' : '😢'}
                </div>

                <h1 style={{
                    fontSize: '52px',
                    color: excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px',
                    textShadow: `0 0 20px ${excellent ? theme.gold : won ? theme.success : theme.error}44`
                }}>
                    {excellent ? 'EXCELLENT!' : won ? 'SUCCESS!' : 'DROPPED!'}
                </h1>

                <div style={{
                    fontSize: '28px', marginBottom: '20px',
                    color: theme.accent
                }}>
                    Score: {score} / {targetScore}
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex', gap: '30px', marginBottom: '25px',
                    fontSize: '16px'
                }}>
                    {perfectCount > 0 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontSize: '24px' }}>⭐ {perfectCount}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Perfect Hits</div>
                        </div>
                    )}
                    {bestCombo >= 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.success, fontSize: '24px' }}>🔥 {bestCombo}</div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Best Combo</div>
                        </div>
                    )}
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '20px 40px',
                        borderRadius: '12px', marginBottom: '30px',
                        border: `1px solid ${theme.gold}44`,
                        textAlign: 'center'
                    }}>
                        <div style={{ color: theme.gold, fontSize: '24px', fontWeight: 'bold' }}>
                            +{pointsEarned} Point{pointsEarned > 1 ? 's' : ''}!
                        </div>
                        <div style={{ color: theme.textMuted, marginTop: '8px', fontSize: '14px' }}>
                            {getStars(selectedOpponent.id)}/10 Stars with {selectedOpponent.name}
                        </div>
                        {pointsEarned > 1 && (
                            <div style={{ marginTop: '10px', fontSize: '12px', color: theme.textSecondary }}>
                                {perfectCount >= 5 && <span style={{ marginRight: '10px' }}>⭐ Perfect Bonus</span>}
                                {bestCombo >= 10 && <span style={{ marginRight: '10px' }}>🔥 Combo Bonus</span>}
                                {overkill && <span>💪 Overkill Bonus</span>}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '16px 35px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '10px', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold',
                            boxShadow: `0 4px 15px ${theme.accent}44`,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            padding: '16px 35px', fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '10px', color: theme.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.borderColor = theme.accent}
                        onMouseLeave={e => e.target.style.borderColor = theme.border}
                    >
                        Level Select
                    </button>
                </div>

                <p style={{ marginTop: '20px', color: theme.textMuted, fontSize: '13px' }}>
                    Press SPACE to retry
                </p>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        30% { transform: translateY(-30px); }
                        50% { transform: translateY(-15px); }
                        70% { transform: translateY(-8px); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: rotate(0); }
                        25% { transform: rotate(-10deg); }
                        75% { transform: rotate(10deg); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};
