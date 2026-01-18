const { useState, useEffect, useCallback, useRef } = React;

const BattingCage = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#228b22', accentBright: '#32cd32',
        gold: '#f4c542', error: '#e85a50', success: '#50c878'
    };

    // Opponents with learnable, predictable pitch patterns (Pattern Learning principle)
    const opponents = [
        { id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878', title: 'The Groovy Beginner', mechanic: 'Slow pitches only - learn the timing!', pitchSpeed: 0.7, pitchTypes: ['slow'], special: 'none', pattern: 'consistent', tipText: 'Watch for the golden zone - swing when the ball enters it!' },
        { id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840', title: 'The Cunning Clucker', mechanic: 'Alternates slow and fast pitches', pitchSpeed: 0.85, pitchTypes: ['slow', 'fast'], special: 'fast', pattern: 'alternating', tipText: 'Pitches alternate between slow and fast - learn the rhythm!' },
        { id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0', title: 'The Groovy Giant', mechanic: 'Swing on the BEAT for 1.5x points!', pitchSpeed: 0.9, pitchTypes: ['slow', 'fast'], special: 'rhythm', pattern: 'rhythmic', tipText: 'Hit when the big dot glows gold for bonus points!' },
        { id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090', title: 'The Trash Tactician', mechanic: 'Curves up or down - watch the wind-up!', pitchSpeed: 1.0, pitchTypes: ['slow', 'fast', 'curve'], special: 'curve', pattern: 'telegraphed', tipText: 'The ball curves in the direction the pitcher leans!' },
        { id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8', title: 'The Shocking Strategist', mechanic: 'Lightning pitches glow blue - react fast!', pitchSpeed: 1.1, pitchTypes: ['slow', 'fast', 'curve', 'lightning'], special: 'lightning', pattern: 'mixed', tipText: 'Lightning balls glow blue - they\'re fast but predictable!' },
        { id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0', title: 'The Light Seeker', mechanic: 'Darkness falls - but the ball glows!', pitchSpeed: 1.15, pitchTypes: ['slow', 'fast', 'curve'], special: 'dark', pattern: 'obscured', tipText: 'In darkness, focus only on the glowing ball!' },
        { id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0', title: 'The Antarctic Academic', mechanic: 'Ball changes speed mid-flight!', pitchSpeed: 1.2, pitchTypes: ['slow', 'fast', 'curve', 'changeup'], special: 'changeup', pattern: 'deceptive', tipText: 'Change-ups slow down or speed up - wait for the sweet spot!' },
        { id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060', title: 'The Slithering Schemer', mechanic: 'Ball weaves up and down predictably', pitchSpeed: 1.3, pitchTypes: ['slow', 'fast', 'curve', 'slither'], special: 'slither', pattern: 'wave', tipText: 'Slither balls follow a sine wave - time the center!' },
        { id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080', title: 'The Pack Leader', mechanic: 'Decoys are faded - hit the bright one!', pitchSpeed: 1.4, pitchTypes: ['slow', 'fast', 'curve'], special: 'multi', pattern: 'decoy', tipText: 'Ignore the faded decoys - the real ball is brightest!' },
        { id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840', title: 'The Ultimate Champion', mechanic: 'Master of all pitch types!', pitchSpeed: 1.5, pitchTypes: ['slow', 'fast', 'curve', 'lightning', 'slither', 'changeup'], special: 'all', pattern: 'master', tipText: 'Use everything you\'ve learned - you can do this!' }
    ];

    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [pitchesRemaining, setPitchesRemaining] = useState(10);
    const [score, setScore] = useState(0);
    const [pitch, setPitch] = useState(null);
    const [decoyPitches, setDecoyPitches] = useState([]);
    const [swinging, setSwinging] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [beatPhase, setBeatPhase] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [screenShake, setScreenShake] = useState(0);
    const [particles, setParticles] = useState([]);
    const [ballTrail, setBallTrail] = useState([]);
    const [timingIndicator, setTimingIndicator] = useState(null);
    const [pitchTelegraph, setPitchTelegraph] = useState(null);
    const [pitcherWindup, setPitcherWindup] = useState(null); // Visual telegraph for pitch direction
    const [swingGhost, setSwingGhost] = useState(null); // Shows where you swung vs ball position
    const [isPracticeMode, setIsPracticeMode] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [pitchCount, setPitchCount] = useState(0); // For alternating patterns
    const [sessionStats, setSessionStats] = useState({ hits: 0, misses: 0, homeruns: 0, perfectTimings: 0 });
    const [flashEffect, setFlashEffect] = useState(null); // Screen flash for big moments
    const animationRef = useRef(null);
    const lastFrameTime = useRef(0);

    // Persistent stats tracking (Visible Progress principle)
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('battingcage_progression_v3');
        if (saved) return JSON.parse(saved);
        return {
            starPoints: Array(10).fill(0),
            totalHomeruns: 0,
            totalHits: 0,
            bestCombo: 0,
            gamesPlayed: 0,
            perfectGames: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('battingcage_progression_v3', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Dynamic timing window - wider at lower levels (Flow principle: challenge-skill balance)
    const getTimingWindow = useCallback(() => {
        const baseWindow = 22;
        const levelReduction = (currentLevel - 1) * 0.6;
        return Math.max(14, baseWindow - levelReduction);
    }, [currentLevel]);

    // Create satisfying particles (The Toy principle - make feedback feel good)
    const createParticles = useCallback((x, y, type, count = 10) => {
        const configs = {
            homerun: { colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF', '#FFE4B5'], sizeRange: [8, 16], speed: 18, gravity: 0.3 },
            double: { colors: ['#32CD32', '#7CFC00', '#ADFF2F', '#98FB98'], sizeRange: [6, 12], speed: 14, gravity: 0.4 },
            single: { colors: ['#87CEEB', '#00BFFF', '#1E90FF', '#ADD8E6'], sizeRange: [5, 10], speed: 12, gravity: 0.5 },
            foul: { colors: ['#D3D3D3', '#A9A9A9', '#808080'], sizeRange: [4, 8], speed: 8, gravity: 0.6 },
            whiff: { colors: ['#8B0000', '#A52A2A', '#CD5C5C'], sizeRange: [3, 6], speed: 6, gravity: 0.7 },
            perfect: { colors: ['#FFD700', '#FFFFFF', '#FFF8DC'], sizeRange: [10, 20], speed: 20, gravity: 0.2 }
        };
        const config = configs[type] || configs.foul;

        const newParticles = Array(count).fill(0).map((_, i) => {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = config.speed * (0.5 + Math.random() * 0.5);
            return {
                id: Date.now() + i + Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                size: config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
                life: 1,
                decay: 0.015 + Math.random() * 0.01,
                gravity: config.gravity
            };
        });
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    // Screen shake with decay (Feedback principle)
    const triggerScreenShake = useCallback((intensity) => {
        setScreenShake(intensity);
        const decay = () => {
            setScreenShake(prev => {
                if (prev <= 0.5) return 0;
                setTimeout(decay, 16);
                return prev * 0.85;
            });
        };
        setTimeout(decay, 16);
    }, []);

    // Flash effect for big moments (Fiero - celebration of achievement)
    const triggerFlash = useCallback((color, duration = 150) => {
        setFlashEffect(color);
        setTimeout(() => setFlashEffect(null), duration);
    }, []);

    // Pitch throwing with learnable patterns (Pattern Learning principle)
    const throwPitch = useCallback(() => {
        if (!selectedOpponent || pitchesRemaining <= 0) return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.04; // Gentle 4% per level
        const types = opp.pitchTypes;

        // Predictable pattern selection based on opponent's pattern type
        let type;
        const currentPitchNum = 10 - pitchesRemaining;

        switch (opp.pattern) {
            case 'consistent':
                type = 'slow'; // Always slow for beginner
                break;
            case 'alternating':
                type = currentPitchNum % 2 === 0 ? 'slow' : 'fast'; // Predictable alternation
                break;
            case 'rhythmic':
                type = types[currentPitchNum % types.length]; // Cycles through types
                break;
            default:
                type = types[Math.floor(Math.random() * types.length)];
        }

        let speed = opp.pitchSpeed * levelMod;
        let curve = 0;
        let slitherAmplitude = 0;
        let slitherFrequency = 0;
        let changeupTrigger = -1;
        let windupDirection = null;

        // Show telegraph and windup animation (Feedback principle - telegraph incoming challenge)
        setPitchTelegraph(type);
        setTimeout(() => setPitchTelegraph(null), 500);

        switch (type) {
            case 'slow': speed *= 0.6; break;
            case 'fast': speed *= 1.1; break;
            case 'curve':
                speed *= 0.85;
                curve = (currentPitchNum % 2 === 0 ? 1 : -1) * (12 + Math.random() * 8); // Alternates up/down
                windupDirection = curve > 0 ? 'up' : 'down';
                break;
            case 'lightning': speed *= 1.3; break;
            case 'changeup':
                speed *= 1.0;
                changeupTrigger = 45 + Math.random() * 10;
                break;
            case 'slither':
                speed *= 0.75;
                slitherAmplitude = 6 + Math.random() * 4;
                slitherFrequency = 0.12;
                break;
        }

        // Show windup direction for curve balls (Pattern Learning - telegraph)
        if (windupDirection) {
            setPitcherWindup(windupDirection);
            setTimeout(() => setPitcherWindup(null), 400);
        }

        const baseY = 50 + (Math.random() - 0.5) * 10; // Less random Y variance
        const pitchData = {
            x: 100,
            y: baseY,
            baseY,
            type,
            speed: speed * 1.4,
            originalSpeed: speed * 1.4,
            curve,
            slitherAmplitude,
            slitherFrequency,
            changeupTrigger,
            changeupApplied: false,
            thrown: Date.now()
        };

        setPitch(pitchData);
        setBallTrail([]);
        setPitchCount(prev => prev + 1);

        // Wolf Warrior decoys - clearly distinguishable
        if (opp.special === 'multi' || (opp.special === 'all' && Math.random() < 0.25)) {
            const decoyCount = Math.min(2, Math.floor(currentLevel / 4) + 1);
            const decoys = Array(decoyCount).fill(0).map((_, i) => ({
                id: Date.now() + i + 1,
                x: 100,
                y: baseY + (i === 0 ? -18 : 18),
                speed: pitchData.speed * (0.85 + Math.random() * 0.3),
                opacity: 0.35 // Clearly faded
            }));
            setDecoyPitches(decoys);
        } else {
            setDecoyPitches([]);
        }

        // Dark mode - always shows glowing ball
        if (opp.special === 'dark' || (opp.special === 'all' && Math.random() < 0.2)) {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
    }, [selectedOpponent, currentLevel, pitchesRemaining]);

    // Smooth animation loop
    useEffect(() => {
        if (!pitch || gameState !== 'playing') return;

        const animate = (currentTime) => {
            if (!lastFrameTime.current) lastFrameTime.current = currentTime;
            const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2);
            lastFrameTime.current = currentTime;

            setPitch(p => {
                if (!p) return null;

                let newX = p.x - p.speed * deltaTime;
                let newY = p.y;

                // Smooth curve application
                if (p.curve !== 0) {
                    const progress = (100 - newX) / 100;
                    newY = p.baseY + p.curve * Math.pow(progress, 1.5) * 0.6;
                }

                // Predictable slither wave
                if (p.type === 'slither') {
                    newY = p.baseY + Math.sin((100 - newX) * p.slitherFrequency) * p.slitherAmplitude;
                }

                // Changeup - speed change
                if (p.type === 'changeup' && !p.changeupApplied && newX < p.changeupTrigger) {
                    const newSpeed = p.speed * (Math.random() < 0.5 ? 0.55 : 1.25);
                    return { ...p, x: newX, y: newY, speed: newSpeed, changeupApplied: true };
                }

                newY = Math.max(28, Math.min(72, newY));

                // Ball trail
                setBallTrail(prev => {
                    const newTrail = [...prev, { x: newX, y: newY }];
                    return newTrail.slice(-10);
                });

                // Ball passed batter - clear failure feedback
                if (newX < 8) {
                    if (!swinging) {
                        setLastResult({ type: 'strike', points: 0, message: 'You didn\'t swing!' });
                        setTimingIndicator('missed');
                        setCombo(0);
                        setSessionStats(prev => ({ ...prev, misses: prev.misses + 1 }));
                        setTimeout(() => {
                            setLastResult(null);
                            setTimingIndicator(null);
                        }, 600);
                    }
                    if (!isPracticeMode) {
                        setPitchesRemaining(r => r - 1);
                    }
                    setDecoyPitches([]);
                    setBallTrail([]);
                    setTimeout(() => throwPitch(), 600);
                    return null;
                }

                return { ...p, x: newX, y: newY };
            });

            // Update decoys
            setDecoyPitches(decoys =>
                decoys.map(d => ({ ...d, x: d.x - d.speed * deltaTime }))
                    .filter(d => d.x > 5)
            );

            // Update particles with gravity
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.vx * 0.5,
                    y: p.y + p.vy * 0.5,
                    vy: p.vy + (p.gravity || 0.5),
                    vx: p.vx * 0.98,
                    life: p.life - p.decay
                })).filter(p => p.life > 0)
            );

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            lastFrameTime.current = 0;
        };
    }, [pitch, gameState, swinging, throwPitch, isPracticeMode]);

    // Handle swing with detailed feedback (Feedback principle - understand WHY you failed)
    const swing = useCallback(() => {
        if (gameState !== 'playing' || swinging || !pitch) return;

        setSwinging(true);

        const timingWindow = getTimingWindow();
        const sweetSpot = 20;
        const hitZoneStart = sweetSpot - timingWindow / 2;
        const hitZoneEnd = sweetSpot + timingWindow / 2;

        const ballX = pitch.x;
        const inZone = ballX >= hitZoneStart && ballX <= hitZoneEnd;
        const timing = inZone ? 1 - Math.abs(ballX - sweetSpot) / (timingWindow / 2) : 0;
        const distanceFromZone = !inZone ? (ballX > hitZoneEnd ? ballX - hitZoneEnd : hitZoneStart - ballX) : 0;

        // Show ghost of where you swung vs where ball was (Clear Failure Feedback)
        setSwingGhost({ swingX: sweetSpot, ballX: ballX, inZone });

        // Detailed timing feedback
        let feedbackMessage = '';
        if (ballX > hitZoneEnd + 15) {
            setTimingIndicator('way early');
            feedbackMessage = 'Way too early! Wait longer.';
        } else if (ballX > hitZoneEnd) {
            setTimingIndicator('early');
            feedbackMessage = 'A bit early - wait a moment more.';
        } else if (ballX < hitZoneStart - 15) {
            setTimingIndicator('way late');
            feedbackMessage = 'Way too late! Swing sooner.';
        } else if (ballX < hitZoneStart) {
            setTimingIndicator('late');
            feedbackMessage = 'A bit late - swing earlier.';
        } else if (timing > 0.85) {
            setTimingIndicator('perfect');
            feedbackMessage = 'PERFECT timing!';
        } else if (timing > 0.6) {
            setTimingIndicator('great');
            feedbackMessage = 'Great timing!';
        } else {
            setTimingIndicator('good');
            feedbackMessage = 'Good hit!';
        }

        let result;
        let points = 0;
        let hitType = 'whiff';

        if (!inZone) {
            result = ballX > hitZoneEnd ? 'early' : 'late';
            hitType = 'whiff';
            setSessionStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        } else if (timing > 0.85) {
            result = 'homerun';
            points = 50;
            hitType = 'homerun';
            setSessionStats(prev => ({ ...prev, hits: prev.hits + 1, homeruns: prev.homeruns + 1, perfectTimings: prev.perfectTimings + 1 }));
            triggerFlash('#FFD70066', 200);
        } else if (timing > 0.6) {
            result = 'double';
            points = 30;
            hitType = 'double';
            setSessionStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        } else if (timing > 0.35) {
            result = 'single';
            points = 20;
            hitType = 'single';
            setSessionStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        } else {
            result = 'foul';
            points = 10;
            hitType = 'foul';
            setSessionStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        }

        // Combo system with bigger rewards (Fiero - reward streaks)
        let newCombo = combo;
        if (points > 0) {
            newCombo = combo + 1;
            setCombo(newCombo);
            setMaxCombo(prev => Math.max(prev, newCombo));

            // Combo multiplier: 15% per combo, max 75%
            const comboMultiplier = 1 + Math.min(newCombo - 1, 5) * 0.15;
            points = Math.floor(points * comboMultiplier);

            // Extra celebration for big combos
            if (newCombo === 5) {
                triggerFlash('#50c87866', 150);
                createParticles(50, 50, 'perfect', 15);
            } else if (newCombo === 10) {
                triggerFlash('#FFD70066', 200);
                createParticles(50, 50, 'perfect', 25);
            }
        } else {
            setCombo(0);
            newCombo = 0;
        }

        // Rhythm bonus
        if ((selectedOpponent.special === 'rhythm' || selectedOpponent.special === 'all') && beatPhase === 0 && points > 0) {
            points = Math.floor(points * 1.5);
            result = '🎵' + result;
            triggerFlash('#a080c044', 100);
        }

        // Create particles
        createParticles(pitch.x, pitch.y, hitType, hitType === 'homerun' ? 25 : hitType === 'double' ? 15 : 10);

        // Screen shake
        if (hitType === 'homerun') {
            triggerScreenShake(15);
        } else if (hitType === 'double') {
            triggerScreenShake(8);
        } else if (hitType === 'single') {
            triggerScreenShake(4);
        }

        setScore(s => s + points);
        setLastResult({ type: result, points, combo: newCombo > 1 ? newCombo : null, message: feedbackMessage });
        setPitch(null);
        setDecoyPitches([]);
        setBallTrail([]);

        if (!isPracticeMode) {
            setPitchesRemaining(r => r - 1);
        }

        setTimeout(() => {
            setSwinging(false);
            setLastResult(null);
            setTimingIndicator(null);
            setSwingGhost(null);
            if (isPracticeMode || pitchesRemaining > 1) throwPitch();
        }, 550);
    }, [gameState, swinging, pitch, selectedOpponent, beatPhase, pitchesRemaining, throwPitch, combo, createParticles, triggerScreenShake, triggerFlash, getTimingWindow, isPracticeMode]);

    // Beat timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => setBeatPhase(p => (p + 1) % 4), 500);
        return () => clearInterval(interval);
    }, [gameState]);

    // End game check
    useEffect(() => {
        if (pitchesRemaining <= 0 && !pitch && gameState === 'playing' && !isPracticeMode) {
            setTimeout(() => setGameState('result'), 300);
        }
    }, [pitchesRemaining, pitch, gameState, isPracticeMode]);

    // Handle result with stats update
    useEffect(() => {
        if (gameState !== 'result') return;

        const maxScore = 500;
        const percentage = score / maxScore;
        const isPerfect = sessionStats.misses === 0 && sessionStats.hits >= 8;

        // Update progression
        setProgression(prev => {
            const newProg = { ...prev };
            newProg.gamesPlayed += 1;
            newProg.totalHits += sessionStats.hits;
            newProg.totalHomeruns += sessionStats.homeruns;
            newProg.bestCombo = Math.max(newProg.bestCombo, maxCombo);
            if (isPerfect) newProg.perfectGames += 1;

            if (percentage >= 0.25) {
                const points = percentage >= 0.5 ? 2 : 1;
                newProg.starPoints = [...newProg.starPoints];
                newProg.starPoints[selectedOpponent.id] = Math.min(40, newProg.starPoints[selectedOpponent.id] + points);
            }
            return newProg;
        });
    }, [gameState, score, selectedOpponent, sessionStats, maxCombo]);

    const startMatch = (opponent, level, practice = false) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setPitchesRemaining(practice ? 999 : 10);
        setScore(0);
        setPitch(null);
        setDecoyPitches([]);
        setSwinging(false);
        setLastResult(null);
        setDarkMode(false);
        setCombo(0);
        setMaxCombo(0);
        setParticles([]);
        setBallTrail([]);
        setTimingIndicator(null);
        setPitchTelegraph(null);
        setPitcherWindup(null);
        setSwingGhost(null);
        setIsPracticeMode(practice);
        setShowTutorial(opponent.id === 0 && !practice);
        setPitchCount(0);
        setSessionStats({ hits: 0, misses: 0, homeruns: 0, perfectTimings: 0 });
        setGameState('playing');
        setTimeout(() => throwPitch(), practice ? 500 : 800);
    };

    // Input handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (showTutorial) {
                    setShowTutorial(false);
                } else {
                    swing();
                }
            }
            if (e.code === 'Escape') {
                if (isPracticeMode) {
                    setGameState('level_select');
                    setIsPracticeMode(false);
                } else if (gameState === 'playing') {
                    setGameState('select');
                } else if (gameState === 'level_select') {
                    setGameState('select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };
        const handleClick = (e) => {
            if (gameState === 'playing') {
                if (showTutorial) {
                    setShowTutorial(false);
                } else {
                    swing();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('click', handleClick);
        };
    }, [swing, gameState, showTutorial, isPracticeMode]);

    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{
                    width: '12px', height: '12px',
                    background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark,
                    borderRadius: '2px',
                    border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                    boxShadow: i < Math.floor(points / 4) ? `0 0 4px ${theme.gold}` : 'none'
                }} />
            ))}
        </div>
    );

    const PitchTypeLabel = ({ type }) => {
        const labels = {
            slow: { text: 'SLOW', color: '#50c878', icon: '🐢' },
            fast: { text: 'FAST', color: '#e8a840', icon: '💨' },
            curve: { text: 'CURVE', color: '#a080c0', icon: '🌀' },
            lightning: { text: 'LIGHTNING', color: '#50a8e8', icon: '⚡' },
            changeup: { text: 'CHANGE-UP', color: '#ff6b6b', icon: '🎭' },
            slither: { text: 'SLITHER', color: '#60a060', icon: '🐍' }
        };
        const label = labels[type] || { text: type.toUpperCase(), color: '#fff', icon: '⚾' };
        return (
            <div style={{
                position: 'absolute',
                right: '18%',
                top: '18%',
                padding: '10px 18px',
                background: `${label.color}44`,
                border: `2px solid ${label.color}`,
                borderRadius: '10px',
                color: label.color,
                fontSize: '18px',
                fontWeight: 'bold',
                animation: 'pitchLabel 0.4s ease-out',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span>{label.icon}</span>
                <span>{label.text}</span>
            </div>
        );
    };

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: theme.text }}>
                <div style={{ fontSize: '72px', marginBottom: '10px', animation: 'bounce 1s ease-in-out infinite' }}>⚾</div>
                <h1 style={{ fontSize: '42px', marginBottom: '5px', color: theme.accent, textShadow: `0 0 20px ${theme.accent}` }}>HOME RUN TEDDY</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px', fontSize: '18px' }}>Time your swing perfectly!</p>

                {/* Stats display (Visible Progress principle) */}
                {progression.gamesPlayed > 0 && (
                    <div style={{
                        background: theme.bgPanel,
                        padding: '15px 25px',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        display: 'flex',
                        gap: '25px',
                        fontSize: '14px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontSize: '24px', fontWeight: 'bold' }}>{progression.totalHomeruns}</div>
                            <div style={{ color: theme.textMuted }}>Home Runs</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>{progression.bestCombo}x</div>
                            <div style={{ color: theme.textMuted }}>Best Combo</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.accent, fontSize: '24px', fontWeight: 'bold' }}>{progression.perfectGames}</div>
                            <div style={{ color: theme.textMuted }}>Perfect Games</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px',
                        fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: `0 4px 20px ${theme.accent}66`,
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 6px 30px ${theme.accent}88`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 20px ${theme.accent}66`; }}
                >
                    PLAY
                </button>
                <a href="../menu.html" style={{ marginTop: '25px', color: theme.textMuted, textDecoration: 'none', fontSize: '14px' }}>← Back to Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // Opponent select screen
    if (gameState === 'select') {
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`, padding: '20px', color: theme.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Your Opponent</h2>
                    <div style={{ width: '80px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' }}>
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
                                    borderRadius: '12px',
                                    padding: '15px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    position: 'relative',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={e => { if (unlocked) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 25px ${opp.color}44`; }}}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {!unlocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>🔒</div>}
                                {mastered && <div style={{ position: 'absolute', top: '10px', right: '10px', background: theme.success, padding: '2px 8px', borderRadius: '10px', fontSize: '12px', boxShadow: `0 0 10px ${theme.success}` }}>✓ MASTERED</div>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '48px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${opp.color}33`, borderRadius: '50%', boxShadow: `0 0 15px ${opp.color}44` }}>{opp.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: opp.color }}>{opp.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted }}>{opp.title}</div>
                                        <div style={{ fontSize: '12px', color: theme.textSecondary, background: `${opp.color}22`, padding: '5px 10px', borderRadius: '6px', margin: '6px 0' }}>⚾ {opp.mechanic}</div>
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

    // Level select with practice mode
    if (gameState === 'level_select' && selectedOpponent) {
        const currentStars = getStars(selectedOpponent.id);
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`, padding: '20px', color: theme.text, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => setGameState('select')} style={{ alignSelf: 'flex-start', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
                <div style={{ fontSize: '80px', marginTop: '15px', filter: `drop-shadow(0 0 20px ${selectedOpponent.color})` }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px', textShadow: `0 0 15px ${selectedOpponent.color}` }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>
                <div style={{ marginTop: '12px', padding: '12px 24px', background: `${selectedOpponent.color}22`, borderRadius: '10px', border: `1px solid ${selectedOpponent.color}44` }}>⚾ {selectedOpponent.mechanic}</div>

                {/* Tip box (Pattern Learning principle) */}
                <div style={{ marginTop: '15px', padding: '10px 20px', background: theme.bgPanel, borderRadius: '8px', maxWidth: '400px', textAlign: 'center' }}>
                    <span style={{ color: theme.gold }}>💡 Tip:</span>
                    <span style={{ color: theme.textSecondary, marginLeft: '8px' }}>{selectedOpponent.tipText}</span>
                </div>

                <div style={{ marginTop: '15px' }}><StarBar points={progression.starPoints[selectedOpponent.id]} /></div>

                {/* Practice mode button (Autonomy principle) */}
                <button
                    onClick={() => startMatch(selectedOpponent, 1, true)}
                    style={{
                        marginTop: '20px',
                        padding: '10px 25px',
                        fontSize: '14px',
                        background: 'transparent',
                        border: `2px solid ${theme.gold}`,
                        borderRadius: '8px',
                        color: theme.gold,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${theme.gold}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                    🎯 Practice Mode (Unlimited Pitches)
                </button>

                <h3 style={{ marginTop: '25px', marginBottom: '12px' }}>Select Level</h3>
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
                                    width: '60px',
                                    height: '60px',
                                    background: unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark,
                                    border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '10px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'transform 0.2s',
                                    boxShadow: unlocked ? `0 2px 10px ${selectedOpponent.color}44` : 'none'
                                }}
                                onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {unlocked ? levelNum : '🔒'}
                            </button>
                        );
                    })}
                </div>
                <p style={{ marginTop: '15px', color: theme.textMuted, fontSize: '12px' }}>Earn stars by scoring 125+ points per game</p>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const shakeX = screenShake ? (Math.random() - 0.5) * screenShake : 0;
        const shakeY = screenShake ? (Math.random() - 0.5) * screenShake : 0;
        const isRhythmOpponent = opp.special === 'rhythm' || opp.special === 'all';
        const timingWindow = getTimingWindow();

        return (
            <div style={{
                minHeight: '100vh',
                background: darkMode ? '#080610' : `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}22 100%)`,
                display: 'flex',
                flexDirection: 'column',
                color: theme.text,
                userSelect: 'none',
                transform: `translate(${shakeX}px, ${shakeY}px)`,
                transition: screenShake ? 'none' : 'background 0.3s'
            }}>
                {/* Flash effect overlay */}
                {flashEffect && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: flashEffect,
                        pointerEvents: 'none',
                        zIndex: 100,
                        animation: 'flashFade 0.2s ease-out'
                    }} />
                )}

                {/* Tutorial overlay */}
                {showTutorial && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '20px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐻 ⚾</div>
                        <h2 style={{ color: theme.gold, marginBottom: '15px' }}>How to Play</h2>
                        <div style={{ maxWidth: '400px', textAlign: 'center', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '15px' }}>Watch the ball approach from the pitcher.</p>
                            <p style={{ marginBottom: '15px' }}>Swing when the ball enters the <span style={{ color: theme.gold }}>golden zone</span>!</p>
                            <p style={{ marginBottom: '15px' }}>The closer to the center, the better the hit.</p>
                            <p style={{ color: theme.textMuted }}>Press <span style={{ color: theme.gold }}>SPACE</span> or <span style={{ color: theme.gold }}>TAP</span> to swing</p>
                        </div>
                        <button
                            onClick={() => setShowTutorial(false)}
                            style={{
                                marginTop: '25px',
                                padding: '12px 40px',
                                fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Got it! Let's Play
                        </button>
                    </div>
                )}

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 20px',
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 10
                }}>
                    <div>
                        {isPracticeMode ? (
                            <span style={{ color: theme.gold }}>🎯 PRACTICE</span>
                        ) : (
                            <>Pitches: <span style={{ color: theme.gold, fontSize: '22px', fontWeight: 'bold' }}>{pitchesRemaining}</span></>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: opp.color, fontSize: '24px' }}>{opp.emoji}</span>
                        <span>Level {currentLevel}</span>
                        {combo > 1 && (
                            <span style={{
                                background: combo >= 5 ? `linear-gradient(135deg, ${theme.gold}, #ff6b6b)` : theme.bgPanel,
                                padding: '3px 12px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: combo >= 5 ? 'white' : theme.gold,
                                animation: combo >= 5 ? 'comboPulse 0.5s ease-in-out infinite' : 'none',
                                boxShadow: combo >= 5 ? `0 0 15px ${theme.gold}` : 'none'
                            }}>
                                {combo}x COMBO{combo >= 5 ? ' 🔥' : ''}
                            </span>
                        )}
                    </div>
                    <div>Score: <span style={{ color: theme.gold, fontSize: '22px', fontWeight: 'bold' }}>{score}</span></div>
                </div>

                {/* Game field */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {/* Background */}
                    <div style={{ position: 'absolute', inset: 0, background: darkMode ? 'transparent' : `repeating-linear-gradient(90deg, transparent, transparent 50px, ${opp.color}06 50px, ${opp.color}06 100px)` }} />

                    {/* Timing zone - clear visual guide (Flow principle - clear goals) */}
                    <div style={{
                        position: 'absolute',
                        left: `${20 - timingWindow / 2}%`,
                        top: '25%',
                        width: `${timingWindow}%`,
                        height: '50%',
                        background: darkMode
                            ? 'rgba(255,255,255,0.03)'
                            : `linear-gradient(90deg, transparent 0%, ${theme.gold}12 35%, ${theme.gold}25 50%, ${theme.gold}12 65%, transparent 100%)`,
                        borderRadius: '12px',
                        pointerEvents: 'none'
                    }} />

                    {/* Strike zone outline */}
                    <div style={{
                        position: 'absolute',
                        left: '14%',
                        top: '30%',
                        width: '12%',
                        height: '40%',
                        border: `2px dashed ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: '10px',
                        pointerEvents: 'none'
                    }} />

                    {/* Sweet spot marker - pulses when ball is near */}
                    <div style={{
                        position: 'absolute',
                        left: '20%',
                        top: '25%',
                        height: '50%',
                        width: '3px',
                        background: pitch && pitch.x > 12 && pitch.x < 45
                            ? `linear-gradient(180deg, transparent, ${theme.gold}, transparent)`
                            : 'transparent',
                        pointerEvents: 'none',
                        transition: 'background 0.15s',
                        boxShadow: pitch && pitch.x > 15 && pitch.x < 30 ? `0 0 10px ${theme.gold}` : 'none'
                    }} />

                    {/* Rhythm indicator */}
                    {isRhythmOpponent && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '10px',
                            padding: '8px 20px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '25px',
                            alignItems: 'center'
                        }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: i === 0 ? '20px' : '14px',
                                    height: i === 0 ? '20px' : '14px',
                                    borderRadius: '50%',
                                    background: beatPhase === i
                                        ? (i === 0 ? theme.gold : '#fff')
                                        : (i === 0 ? `${theme.gold}44` : 'rgba(255,255,255,0.2)'),
                                    transition: 'all 0.1s',
                                    boxShadow: beatPhase === i && i === 0 ? `0 0 20px ${theme.gold}` : 'none',
                                    border: i === 0 ? `2px solid ${theme.gold}` : 'none'
                                }} />
                            ))}
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: beatPhase === 0 ? theme.gold : theme.textMuted,
                                minWidth: '70px'
                            }}>
                                {beatPhase === 0 ? '🎵 NOW!' : ''}
                            </span>
                        </div>
                    )}

                    {/* Pitcher windup indicator (Pattern Learning - telegraph) */}
                    {pitcherWindup && (
                        <div style={{
                            position: 'absolute',
                            right: '18%',
                            top: pitcherWindup === 'up' ? '35%' : '60%',
                            fontSize: '24px',
                            animation: 'windupBounce 0.3s ease-out'
                        }}>
                            {pitcherWindup === 'up' ? '⬆️' : '⬇️'}
                        </div>
                    )}

                    {/* Pitch telegraph */}
                    {pitchTelegraph && <PitchTypeLabel type={pitchTelegraph} />}

                    {/* Batter */}
                    <div style={{
                        position: 'absolute',
                        left: '11%',
                        top: '50%',
                        transform: `translateY(-50%) ${swinging ? 'rotate(-35deg)' : ''}`,
                        fontSize: '85px',
                        transition: 'transform 0.06s ease-out',
                        filter: darkMode ? 'brightness(0.6)' : 'none'
                    }}>🐻</div>

                    {/* Bat */}
                    <div style={{
                        position: 'absolute',
                        left: '17%',
                        top: '46%',
                        width: '95px',
                        height: '14px',
                        background: 'linear-gradient(90deg, #654321, #8b4513, #a0522d, #8b4513)',
                        borderRadius: '7px',
                        transform: `rotate(${swinging ? '-55deg' : '35deg'})`,
                        transformOrigin: 'left center',
                        transition: 'transform 0.06s ease-out',
                        boxShadow: swinging ? `0 0 15px ${theme.gold}66` : '0 2px 5px rgba(0,0,0,0.4)',
                        filter: darkMode ? 'brightness(0.6)' : 'none'
                    }} />

                    {/* Pitcher */}
                    <div style={{
                        position: 'absolute',
                        right: '10%',
                        top: '50%',
                        transform: `translateY(-50%) ${pitcherWindup ? (pitcherWindup === 'up' ? 'rotate(-5deg)' : 'rotate(5deg)') : ''}`,
                        fontSize: '70px',
                        filter: darkMode ? 'brightness(0.4)' : 'none',
                        transition: 'transform 0.2s, filter 0.3s'
                    }}>{opp.emoji}</div>

                    {/* Ball trail */}
                    {ballTrail.map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: `${6 + i * 1.2}px`,
                            height: `${6 + i * 1.2}px`,
                            borderRadius: '50%',
                            background: pitch?.type === 'lightning'
                                ? `rgba(80, 168, 232, ${0.08 + i * 0.04})`
                                : darkMode
                                    ? `rgba(255, 215, 0, ${0.05 + i * 0.03})`
                                    : `rgba(255, 255, 255, ${0.04 + i * 0.025})`,
                            pointerEvents: 'none'
                        }} />
                    ))}

                    {/* Decoy pitches */}
                    {decoyPitches.map(d => (
                        <div key={d.id} style={{
                            position: 'absolute',
                            left: `${d.x}%`,
                            top: `${d.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '26px',
                            opacity: d.opacity,
                            filter: 'grayscale(0.6) blur(2px)',
                            pointerEvents: 'none'
                        }}>⚾</div>
                    ))}

                    {/* Ball */}
                    {pitch && (
                        <div style={{
                            position: 'absolute',
                            left: `${pitch.x}%`,
                            top: `${pitch.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '34px',
                            filter: darkMode
                                ? `drop-shadow(0 0 25px #fff) drop-shadow(0 0 50px ${theme.gold}) brightness(1.2)`
                                : pitch.type === 'lightning'
                                    ? 'drop-shadow(0 0 12px #50a8e8) drop-shadow(0 0 25px #50a8e8)'
                                    : 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
                            transition: 'filter 0.1s'
                        }}>⚾</div>
                    )}

                    {/* Particles */}
                    {particles.map(p => (
                        <div key={p.id} style={{
                            position: 'absolute',
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            borderRadius: '50%',
                            background: p.color,
                            opacity: p.life,
                            pointerEvents: 'none',
                            boxShadow: `0 0 ${p.size}px ${p.color}`
                        }} />
                    ))}

                    {/* Swing ghost - shows where you swung vs ball (Failure Feedback) */}
                    {swingGhost && !swingGhost.inZone && (
                        <div style={{
                            position: 'absolute',
                            left: `${swingGhost.ballX}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: theme.error,
                                background: 'rgba(0,0,0,0.7)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                marginBottom: '5px'
                            }}>
                                Ball was here
                            </div>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                border: `2px dashed ${theme.error}`,
                                borderRadius: '50%'
                            }} />
                        </div>
                    )}

                    {/* Timing indicator */}
                    {timingIndicator && (
                        <div style={{
                            position: 'absolute',
                            top: '18%',
                            left: '20%',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: timingIndicator === 'perfect' ? theme.gold
                                : timingIndicator === 'great' ? '#7CFC00'
                                : timingIndicator === 'good' ? theme.success
                                : timingIndicator.includes('early') ? '#ff9966'
                                : timingIndicator.includes('late') ? '#66b3ff'
                                : theme.error,
                            textTransform: 'uppercase',
                            textShadow: '0 0 15px currentColor',
                            animation: 'timingPop 0.3s ease-out'
                        }}>
                            {timingIndicator === 'missed' ? '' : timingIndicator.replace('way ', '').toUpperCase()}
                        </div>
                    )}

                    {/* Result */}
                    {lastResult && (
                        <div style={{
                            position: 'absolute',
                            top: '32%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            animation: 'resultPop 0.3s ease-out'
                        }}>
                            <div style={{
                                fontSize: lastResult.type.includes('homerun') ? '52px' : '40px',
                                fontWeight: 'bold',
                                color: lastResult.points > 0 ? theme.gold : theme.error,
                                textShadow: lastResult.points > 0 ? `0 0 25px ${theme.gold}` : 'none'
                            }}>
                                {lastResult.type.toUpperCase()}!
                            </div>
                            {lastResult.points > 0 && (
                                <div style={{ fontSize: '30px', color: theme.success, marginTop: '5px' }}>
                                    +{lastResult.points}
                                    {lastResult.combo && <span style={{ fontSize: '20px', marginLeft: '10px', color: theme.gold }}>({lastResult.combo}x)</span>}
                                </div>
                            )}
                            {lastResult.message && lastResult.points === 0 && (
                                <div style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '8px', background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '5px' }}>
                                    {lastResult.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 15px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    fontSize: '15px',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <span>
                        <span style={{ color: theme.textSecondary }}>TAP</span>
                        <span style={{ color: theme.textMuted }}> or </span>
                        <span style={{ color: theme.textSecondary }}>SPACE</span>
                        <span style={{ color: theme.textMuted }}> to swing!</span>
                    </span>
                    {darkMode && <span style={{ color: theme.gold }}>🦋 Dark Mode</span>}
                    {isPracticeMode && (
                        <span style={{ color: theme.textMuted }}>| Press ESC to exit practice</span>
                    )}
                </div>

                <style>{`
                    @keyframes comboPulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                    }
                    @keyframes resultPop {
                        0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                        60% { transform: translateX(-50%) scale(1.15); }
                        100% { transform: translateX(-50%) scale(1); opacity: 1; }
                    }
                    @keyframes pitchLabel {
                        0% { opacity: 0; transform: translateY(-15px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes timingPop {
                        0% { transform: scale(0.8); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes windupBounce {
                        0% { transform: scale(0); }
                        50% { transform: scale(1.3); }
                        100% { transform: scale(1); }
                    }
                    @keyframes flashFade {
                        0% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen with detailed stats (Visible Progress & Fiero)
    if (gameState === 'result') {
        const won = score >= 125;
        const excellent = score >= 250;
        const perfect = sessionStats.misses === 0 && sessionStats.hits >= 8;
        const accuracy = sessionStats.hits + sessionStats.misses > 0
            ? Math.round((sessionStats.hits / (sessionStats.hits + sessionStats.misses)) * 100)
            : 0;

        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.text, padding: '20px' }}>
                <div style={{
                    fontSize: '110px',
                    marginBottom: '15px',
                    animation: perfect ? 'perfectBounce 0.8s ease-out' : 'resultBounce 0.5s ease-out',
                    filter: perfect ? `drop-shadow(0 0 30px ${theme.gold})` : 'none'
                }}>
                    {perfect ? '👑' : excellent ? '🏆' : won ? '⚾' : '😢'}
                </div>
                <h1 style={{
                    fontSize: perfect ? '56px' : '48px',
                    color: perfect ? '#FFD700' : excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px',
                    textShadow: perfect ? '0 0 40px #FFD700' : excellent ? `0 0 25px ${theme.gold}` : 'none',
                    animation: perfect ? 'textGlow 1s ease-in-out infinite' : 'none'
                }}>
                    {perfect ? 'PERFECT GAME!' : excellent ? 'HOME RUN!' : won ? 'GOOD GAME!' : 'STRIKE OUT'}
                </h1>

                {/* Score */}
                <div style={{ fontSize: '38px', marginBottom: '15px' }}>
                    Score: <span style={{ color: theme.gold }}>{score}</span>
                </div>

                {/* Stats panel (Visible Progress principle) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    background: theme.bgPanel,
                    padding: '20px 30px',
                    borderRadius: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.success }}>{accuracy}%</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>Accuracy</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.gold }}>{sessionStats.homeruns}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>Home Runs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: maxCombo >= 5 ? theme.gold : theme.textSecondary }}>{maxCombo}x</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>Best Combo</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: theme.accent }}>{sessionStats.perfectTimings}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>Perfect Hits</div>
                    </div>
                </div>

                {won && (
                    <div style={{ background: `${theme.gold}22`, padding: '15px 30px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${theme.gold}44` }}>
                        <span style={{ color: theme.gold, fontSize: '20px' }}>+{excellent ? 2 : 1} Star Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>({getStars(selectedOpponent.id)}/10 ⭐)</span>
                    </div>
                )}

                {!won && (
                    <div style={{ color: theme.textMuted, marginBottom: '25px', textAlign: 'center', maxWidth: '350px' }}>
                        <p style={{ marginBottom: '8px' }}>Need 125+ points to earn stars</p>
                        <p style={{ fontSize: '14px', color: theme.textSecondary }}>💡 {selectedOpponent.tipText}</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '16px 35px',
                            fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s',
                            boxShadow: `0 4px 15px ${theme.accent}66`
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Play Again
                    </button>
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
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes resultBounce {
                        0% { transform: scale(0) rotate(-15deg); }
                        60% { transform: scale(1.2) rotate(5deg); }
                        100% { transform: scale(1) rotate(0); }
                    }
                    @keyframes perfectBounce {
                        0% { transform: scale(0) rotate(-20deg); }
                        40% { transform: scale(1.3) rotate(10deg); }
                        70% { transform: scale(0.9) rotate(-5deg); }
                        100% { transform: scale(1) rotate(0); }
                    }
                    @keyframes textGlow {
                        0%, 100% { text-shadow: 0 0 40px #FFD700; }
                        50% { text-shadow: 0 0 60px #FFD700, 0 0 80px #FFA500; }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};
