const { useState, useEffect, useCallback, useRef } = React;

const BattingCage = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#228b22', accentBright: '#32cd32',
        gold: '#f4c542', error: '#e85a50', success: '#50c878'
    };

    const opponents = [
        { id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878', title: 'The Groovy Beginner', mechanic: 'Slow pitches - learn timing!', pitchSpeed: 0.8, pitchTypes: ['slow'], special: 'none' },
        { id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840', title: 'The Cunning Clucker', mechanic: 'Fast pitches introduced!', pitchSpeed: 0.95, pitchTypes: ['slow', 'fast'], special: 'fast' },
        { id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0', title: 'The Groovy Giant', mechanic: 'Rhythm bonus - swing on the beat!', pitchSpeed: 1.0, pitchTypes: ['slow', 'fast'], special: 'rhythm' },
        { id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090', title: 'The Trash Tactician', mechanic: 'Curve balls appear!', pitchSpeed: 1.1, pitchTypes: ['slow', 'fast', 'curve'], special: 'curve' },
        { id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8', title: 'The Shocking Strategist', mechanic: 'Lightning fast pitches!', pitchSpeed: 1.2, pitchTypes: ['slow', 'fast', 'curve', 'lightning'], special: 'lightning' },
        { id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0', title: 'The Light Seeker', mechanic: 'Darkness falls - track the glowing ball!', pitchSpeed: 1.25, pitchTypes: ['slow', 'fast', 'curve'], special: 'dark' },
        { id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0', title: 'The Antarctic Academic', mechanic: 'Change-up pitches - speed varies mid-flight!', pitchSpeed: 1.35, pitchTypes: ['slow', 'fast', 'curve', 'changeup'], special: 'changeup' },
        { id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060', title: 'The Slithering Schemer', mechanic: 'Slithering wave movement!', pitchSpeed: 1.45, pitchTypes: ['slow', 'fast', 'curve', 'slither'], special: 'slither' },
        { id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080', title: 'The Pack Leader', mechanic: 'Decoy pitches - hit the real ball!', pitchSpeed: 1.55, pitchTypes: ['slow', 'fast', 'curve'], special: 'multi' },
        { id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840', title: 'The Ultimate Champion', mechanic: 'Master of all pitches!', pitchSpeed: 1.7, pitchTypes: ['slow', 'fast', 'curve', 'lightning', 'slither', 'changeup'], special: 'all' }
    ];

    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [pitchesRemaining, setPitchesRemaining] = useState(10);
    const [score, setScore] = useState(0);
    const [pitch, setPitch] = useState(null);
    const [decoyPitches, setDecoyPitches] = useState([]); // For Wolf Warrior
    const [swinging, setSwinging] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [beatPhase, setBeatPhase] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [screenShake, setScreenShake] = useState(0);
    const [particles, setParticles] = useState([]);
    const [ballTrail, setBallTrail] = useState([]);
    const [timingIndicator, setTimingIndicator] = useState(null); // 'early', 'late', 'perfect'
    const [pitchTelegraph, setPitchTelegraph] = useState(null);
    const animationRef = useRef(null);
    const lastFrameTime = useRef(0);

    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('battingcage_progression_v2');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('battingcage_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Get timing window based on level (wider at lower levels for fairness)
    const getTimingWindow = useCallback(() => {
        const baseWindow = 20; // Base hit zone width
        const levelReduction = (currentLevel - 1) * 0.8; // Reduce by 0.8 per level
        return Math.max(12, baseWindow - levelReduction); // Min 12 units wide
    }, [currentLevel]);

    // Create particles for hit effects
    const createParticles = useCallback((x, y, type, count = 10) => {
        const colors = {
            homerun: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF'],
            double: ['#32CD32', '#7CFC00', '#ADFF2F'],
            single: ['#87CEEB', '#00BFFF', '#1E90FF'],
            foul: ['#A0A0A0', '#808080'],
            whiff: ['#8B0000', '#A52A2A']
        };
        const colorSet = colors[type] || colors.foul;

        const newParticles = Array(count).fill(0).map((_, i) => ({
            id: Date.now() + i,
            x,
            y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15 - 5,
            color: colorSet[Math.floor(Math.random() * colorSet.length)],
            size: type === 'homerun' ? Math.random() * 12 + 6 : Math.random() * 8 + 4,
            life: 1,
            decay: 0.02 + Math.random() * 0.02
        }));
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    // Screen shake effect
    const triggerScreenShake = useCallback((intensity) => {
        setScreenShake(intensity);
        setTimeout(() => setScreenShake(intensity * 0.5), 50);
        setTimeout(() => setScreenShake(intensity * 0.25), 100);
        setTimeout(() => setScreenShake(0), 150);
    }, []);

    const throwPitch = useCallback(() => {
        if (!selectedOpponent || pitchesRemaining <= 0) return;

        const opp = selectedOpponent;
        // More gradual level modifier: 5% per level instead of 10%
        const levelMod = 1 + (currentLevel - 1) * 0.05;
        const types = opp.pitchTypes;
        const type = types[Math.floor(Math.random() * types.length)];

        let speed = opp.pitchSpeed * levelMod;
        let curve = 0;
        let slitherAmplitude = 0;
        let slitherFrequency = 0;
        let changeupTrigger = -1;

        // Show telegraph before pitch
        setPitchTelegraph(type);
        setTimeout(() => setPitchTelegraph(null), 400);

        switch (type) {
            case 'slow': speed *= 0.65; break;
            case 'fast': speed *= 1.15; break;
            case 'curve':
                speed *= 0.9;
                curve = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 10); // Consistent curve direction
                break;
            case 'lightning': speed *= 1.4; break;
            case 'changeup':
                speed *= 1.1;
                changeupTrigger = 40 + Math.random() * 20; // Speed change at x=40-60
                break;
            case 'slither':
                speed *= 0.85;
                slitherAmplitude = 8 + Math.random() * 6;
                slitherFrequency = 0.15 + Math.random() * 0.1;
                break;
        }

        const pitchData = {
            x: 100,
            y: 50 + (Math.random() - 0.5) * 15,
            baseY: 50 + (Math.random() - 0.5) * 15,
            type,
            speed: speed * 1.5,
            originalSpeed: speed * 1.5,
            curve,
            slitherAmplitude,
            slitherFrequency,
            changeupTrigger,
            changeupApplied: false,
            thrown: Date.now()
        };

        setPitch(pitchData);
        setBallTrail([]);

        // Wolf Warrior decoy pitches
        if (opp.special === 'multi' || (opp.special === 'all' && Math.random() < 0.3)) {
            const decoyCount = opp.special === 'all' ? 1 : Math.min(2, Math.floor(currentLevel / 3) + 1);
            const decoys = Array(decoyCount).fill(0).map((_, i) => ({
                id: Date.now() + i + 1,
                x: 100 + (Math.random() - 0.5) * 10,
                y: pitchData.y + (i === 0 ? -20 : 20) + (Math.random() - 0.5) * 10,
                speed: pitchData.speed * (0.8 + Math.random() * 0.4),
                opacity: 0.5
            }));
            setDecoyPitches(decoys);
        } else {
            setDecoyPitches([]);
        }

        // Dark mode for Mysterious Moth
        if (opp.special === 'dark' || (opp.special === 'all' && Math.random() < 0.25)) {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
    }, [selectedOpponent, currentLevel, pitchesRemaining]);

    // Animation loop using requestAnimationFrame for smoothness
    useEffect(() => {
        if (!pitch || gameState !== 'playing') return;

        const animate = (currentTime) => {
            if (!lastFrameTime.current) lastFrameTime.current = currentTime;
            const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2); // Normalize to ~60fps, cap at 2x
            lastFrameTime.current = currentTime;

            setPitch(p => {
                if (!p) return null;

                let newX = p.x - p.speed * deltaTime;
                let newY = p.y;

                // Apply curve (gradual bend)
                if (p.curve !== 0) {
                    newY = p.baseY + p.curve * ((100 - newX) / 100) * 0.8;
                }

                // Slither effect (smooth wave)
                if (p.type === 'slither') {
                    newY = p.baseY + Math.sin((100 - newX) * p.slitherFrequency) * p.slitherAmplitude;
                }

                // Changeup - sudden speed change mid-flight
                if (p.type === 'changeup' && !p.changeupApplied && newX < p.changeupTrigger) {
                    return { ...p, x: newX, y: newY, speed: p.speed * (Math.random() < 0.5 ? 0.5 : 1.3), changeupApplied: true };
                }

                // Keep Y in bounds
                newY = Math.max(25, Math.min(75, newY));

                // Update ball trail
                setBallTrail(prev => {
                    const newTrail = [...prev, { x: newX, y: newY }];
                    return newTrail.slice(-8); // Keep last 8 positions
                });

                // Ball passed batter
                if (newX < 8) {
                    if (!swinging) {
                        setLastResult({ type: 'strike', points: 0 });
                        setTimingIndicator('missed');
                        setCombo(0);
                        setTimeout(() => {
                            setLastResult(null);
                            setTimingIndicator(null);
                        }, 800);
                    }
                    setPitchesRemaining(r => r - 1);
                    setDecoyPitches([]);
                    setBallTrail([]);
                    setTimeout(() => throwPitch(), 700);
                    return null;
                }

                return { ...p, x: newX, y: newY };
            });

            // Update decoy pitches
            setDecoyPitches(decoys =>
                decoys.map(d => ({ ...d, x: d.x - d.speed * deltaTime }))
                    .filter(d => d.x > 0)
            );

            // Update particles
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + 0.5, // gravity
                    life: p.life - p.decay
                })).filter(p => p.life > 0)
            );

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            lastFrameTime.current = 0;
        };
    }, [pitch, gameState, swinging, throwPitch]);

    // Handle swing
    const swing = useCallback(() => {
        if (gameState !== 'playing' || swinging || !pitch) return;

        setSwinging(true);

        const timingWindow = getTimingWindow();
        const sweetSpot = 20; // Center of hit zone
        const hitZoneStart = sweetSpot - timingWindow / 2;
        const hitZoneEnd = sweetSpot + timingWindow / 2;

        const inZone = pitch.x >= hitZoneStart && pitch.x <= hitZoneEnd;
        const timing = inZone ? 1 - Math.abs(pitch.x - sweetSpot) / (timingWindow / 2) : 0;

        // Determine timing feedback
        if (pitch.x > hitZoneEnd) {
            setTimingIndicator('early');
        } else if (pitch.x < hitZoneStart) {
            setTimingIndicator('late');
        } else if (timing > 0.8) {
            setTimingIndicator('perfect');
        } else {
            setTimingIndicator('good');
        }

        let result;
        let points = 0;
        let hitType = 'whiff';

        if (!inZone) {
            result = pitch.x > hitZoneEnd ? 'early' : 'late';
            hitType = 'whiff';
        } else if (timing > 0.85) {
            result = 'homerun';
            points = 50;
            hitType = 'homerun';
        } else if (timing > 0.6) {
            result = 'double';
            points = 30;
            hitType = 'double';
        } else if (timing > 0.35) {
            result = 'single';
            points = 20;
            hitType = 'single';
        } else {
            result = 'foul';
            points = 8;
            hitType = 'foul';
        }

        // Combo system
        let newCombo = combo;
        if (points > 0) {
            newCombo = combo + 1;
            setCombo(newCombo);
            setMaxCombo(prev => Math.max(prev, newCombo));

            // Combo bonus: 10% extra per combo level, max 50%
            const comboMultiplier = 1 + Math.min(newCombo - 1, 5) * 0.1;
            points = Math.floor(points * comboMultiplier);
        } else {
            setCombo(0);
            newCombo = 0;
        }

        // Rhythm bonus for Disco Dinosaur
        if ((selectedOpponent.special === 'rhythm' || selectedOpponent.special === 'all') && beatPhase === 0 && points > 0) {
            points = Math.floor(points * 1.5);
            result = '🎵' + result;
        }

        // Create visual effects
        createParticles(pitch.x, pitch.y, hitType, hitType === 'homerun' ? 20 : hitType === 'double' ? 12 : 8);

        // Screen shake for big hits
        if (hitType === 'homerun') {
            triggerScreenShake(12);
        } else if (hitType === 'double') {
            triggerScreenShake(6);
        }

        setScore(s => s + points);
        setLastResult({ type: result, points, combo: newCombo > 1 ? newCombo : null });
        setPitch(null);
        setDecoyPitches([]);
        setBallTrail([]);
        setPitchesRemaining(r => r - 1);

        setTimeout(() => {
            setSwinging(false);
            setLastResult(null);
            setTimingIndicator(null);
            if (pitchesRemaining > 1) throwPitch();
        }, 700);
    }, [gameState, swinging, pitch, selectedOpponent, beatPhase, pitchesRemaining, throwPitch, combo, createParticles, triggerScreenShake, getTimingWindow]);

    // Beat timer for rhythm mechanic
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => setBeatPhase(p => (p + 1) % 4), 500);
        return () => clearInterval(interval);
    }, [gameState]);

    // Check end game
    useEffect(() => {
        if (pitchesRemaining <= 0 && !pitch && gameState === 'playing') {
            setTimeout(() => setGameState('result'), 400);
        }
    }, [pitchesRemaining, pitch, gameState]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;
        // More generous scoring thresholds
        const maxScore = 500;
        const percentage = score / maxScore;
        if (percentage >= 0.25) { // 125 points to win (was 150)
            const points = percentage >= 0.5 ? 2 : 1; // 250 for excellent (was 300)
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, selectedOpponent]);

    const startMatch = (opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setPitchesRemaining(10);
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
        setGameState('playing');
        setTimeout(() => throwPitch(), 800);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') { e.preventDefault(); swing(); }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState === 'level_select') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };
        const handleClick = (e) => {
            // Only handle clicks in the game area during playing
            if (gameState === 'playing') {
                swing();
            }
        };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('click', handleClick);
        };
    }, [swing, gameState]);

    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{ width: '12px', height: '12px', background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark, borderRadius: '2px', border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}` }} />
            ))}
        </div>
    );

    // Pitch type indicator component
    const PitchTypeLabel = ({ type }) => {
        const labels = {
            slow: { text: 'SLOW', color: '#50c878' },
            fast: { text: 'FAST', color: '#e8a840' },
            curve: { text: 'CURVE', color: '#a080c0' },
            lightning: { text: 'LIGHTNING', color: '#50a8e8' },
            changeup: { text: 'CHANGE-UP', color: '#ff6b6b' },
            slither: { text: 'SLITHER', color: '#60a060' }
        };
        const label = labels[type] || { text: type.toUpperCase(), color: '#fff' };
        return (
            <div style={{
                position: 'absolute',
                right: '20%',
                top: '20%',
                padding: '8px 16px',
                background: `${label.color}33`,
                border: `2px solid ${label.color}`,
                borderRadius: '8px',
                color: label.color,
                fontSize: '16px',
                fontWeight: 'bold',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                {label.text}
            </div>
        );
    };

    if (gameState === 'menu') {
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: theme.text }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>⚾</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>HOME RUN TEDDY</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Time your swing perfectly!</p>
                <button onClick={() => setGameState('select')} style={{ padding: '15px 50px', fontSize: '20px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>PLAY</button>
                <a href="../menu.html" style={{ marginTop: '20px', color: theme.textMuted, textDecoration: 'none', fontSize: '14px' }}>← Back to Menu</a>
            </div>
        );
    }

    if (gameState === 'select') {
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, #1f2d1f 100%)`, padding: '20px', color: theme.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Pitcher</h2>
                    <div style={{ width: '80px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' }}>
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
                                style={{ background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})` : theme.bgDark, border: `2px solid ${unlocked ? opp.color : theme.border}`, borderRadius: '12px', padding: '15px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5, position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={e => { if (unlocked) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 20px ${opp.color}44`; }}}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {!unlocked && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px' }}>🔒</div>}
                                {mastered && <div style={{ position: 'absolute', top: '10px', right: '10px', background: theme.success, padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>✓ MASTERED</div>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '48px', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${opp.color}33`, borderRadius: '50%' }}>{opp.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: opp.color }}>{opp.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted }}>{opp.title}</div>
                                        <div style={{ fontSize: '11px', color: theme.textSecondary, background: `${opp.color}22`, padding: '4px 8px', borderRadius: '4px', margin: '5px 0' }}>⚾ {opp.mechanic}</div>
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

    if (gameState === 'level_select' && selectedOpponent) {
        const currentStars = getStars(selectedOpponent.id);
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`, padding: '20px', color: theme.text, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => setGameState('select')} style={{ alignSelf: 'flex-start', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}>← Back</button>
                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>
                <div style={{ marginTop: '15px', padding: '10px 20px', background: `${selectedOpponent.color}22`, borderRadius: '8px' }}>⚾ {selectedOpponent.mechanic}</div>
                <div style={{ marginTop: '20px' }}><StarBar points={progression.starPoints[selectedOpponent.id]} /></div>
                <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Select Level</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxWidth: '400px' }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;
                        return (
                            <button key={i} onClick={() => unlocked && startMatch(selectedOpponent, levelNum)} disabled={!unlocked} style={{ width: '60px', height: '60px', background: unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark, border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`, borderRadius: '10px', color: unlocked ? 'white' : theme.textMuted, fontSize: '20px', fontWeight: 'bold', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5, transition: 'transform 0.2s' }}
                                onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >{unlocked ? levelNum : '🔒'}</button>
                        );
                    })}
                </div>
                <p style={{ marginTop: '20px', color: theme.textMuted, fontSize: '12px' }}>Earn stars to unlock higher levels</p>
            </div>
        );
    }

    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const shakeX = screenShake ? (Math.random() - 0.5) * screenShake : 0;
        const shakeY = screenShake ? (Math.random() - 0.5) * screenShake : 0;
        const isRhythmOpponent = opp.special === 'rhythm' || opp.special === 'all';

        return (
            <div style={{
                minHeight: '100vh',
                background: darkMode ? '#0a0810' : `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}22 100%)`,
                display: 'flex',
                flexDirection: 'column',
                color: theme.text,
                userSelect: 'none',
                transform: `translate(${shakeX}px, ${shakeY}px)`,
                transition: screenShake ? 'none' : 'background 0.3s'
            }}>
                {/* Header - always visible */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 20px',
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 10
                }}>
                    <div>Pitches: <span style={{ color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{pitchesRemaining}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: opp.color }}>{opp.emoji}</span>
                        <span>Level {currentLevel}</span>
                        {combo > 1 && (
                            <span style={{
                                background: `linear-gradient(135deg, ${theme.gold}, #ff6b6b)`,
                                padding: '2px 10px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                animation: 'pulse 0.5s ease-in-out'
                            }}>
                                {combo}x COMBO
                            </span>
                        )}
                    </div>
                    <div>Score: <span style={{ color: theme.gold, fontSize: '20px', fontWeight: 'bold' }}>{score}</span></div>
                </div>

                {/* Game field */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {/* Background grass lines for depth */}
                    <div style={{ position: 'absolute', inset: 0, background: darkMode ? 'transparent' : `repeating-linear-gradient(90deg, transparent, transparent 40px, ${opp.color}08 40px, ${opp.color}08 80px)` }} />

                    {/* Timing zone indicator - visual guide */}
                    <div style={{
                        position: 'absolute',
                        left: `${20 - getTimingWindow() / 2}%`,
                        top: '30%',
                        width: `${getTimingWindow()}%`,
                        height: '40%',
                        background: darkMode ? 'rgba(255,255,255,0.05)' : `linear-gradient(90deg, transparent 0%, ${theme.gold}15 40%, ${theme.gold}25 50%, ${theme.gold}15 60%, transparent 100%)`,
                        borderRadius: '10px',
                        pointerEvents: 'none'
                    }} />

                    {/* Strike zone outline */}
                    <div style={{
                        position: 'absolute',
                        left: '14%',
                        top: '32%',
                        width: '12%',
                        height: '36%',
                        border: `2px dashed ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)'}`,
                        borderRadius: '8px',
                        pointerEvents: 'none'
                    }} />

                    {/* Sweet spot marker */}
                    <div style={{
                        position: 'absolute',
                        left: '20%',
                        top: '30%',
                        height: '40%',
                        width: '2px',
                        background: pitch && pitch.x > 15 && pitch.x < 50
                            ? `linear-gradient(180deg, transparent, ${theme.gold}80, transparent)`
                            : 'transparent',
                        pointerEvents: 'none',
                        transition: 'background 0.1s'
                    }} />

                    {/* Rhythm indicator */}
                    {isRhythmOpponent && (
                        <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px',
                            padding: '5px 15px',
                            background: 'rgba(0,0,0,0.4)',
                            borderRadius: '20px'
                        }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: i === 0 ? '16px' : '12px',
                                    height: i === 0 ? '16px' : '12px',
                                    borderRadius: '50%',
                                    background: beatPhase === i
                                        ? (i === 0 ? theme.gold : '#fff')
                                        : (i === 0 ? `${theme.gold}44` : 'rgba(255,255,255,0.2)'),
                                    transition: 'all 0.1s',
                                    boxShadow: beatPhase === i && i === 0 ? `0 0 15px ${theme.gold}` : 'none'
                                }} />
                            ))}
                            <span style={{ marginLeft: '5px', fontSize: '12px', color: beatPhase === 0 ? theme.gold : theme.textMuted }}>
                                {beatPhase === 0 ? '🎵 BONUS!' : ''}
                            </span>
                        </div>
                    )}

                    {/* Pitch telegraph */}
                    {pitchTelegraph && <PitchTypeLabel type={pitchTelegraph} />}

                    {/* Batter */}
                    <div style={{
                        position: 'absolute',
                        left: '12%',
                        top: '50%',
                        transform: `translateY(-50%) ${swinging ? 'rotate(-30deg)' : ''}`,
                        fontSize: '80px',
                        transition: 'transform 0.08s ease-out',
                        filter: darkMode ? 'brightness(0.7)' : 'none'
                    }}>🐻</div>

                    {/* Bat */}
                    <div style={{
                        position: 'absolute',
                        left: '18%',
                        top: '47%',
                        width: '90px',
                        height: '12px',
                        background: 'linear-gradient(90deg, #8b4513, #a0522d, #8b4513)',
                        borderRadius: '6px',
                        transform: `rotate(${swinging ? '-50deg' : '35deg'})`,
                        transformOrigin: 'left center',
                        transition: 'transform 0.08s ease-out',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        filter: darkMode ? 'brightness(0.7)' : 'none'
                    }} />

                    {/* Pitcher */}
                    <div style={{
                        position: 'absolute',
                        right: '12%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '65px',
                        filter: darkMode ? 'brightness(0.5)' : 'none',
                        transition: 'filter 0.3s'
                    }}>{opp.emoji}</div>

                    {/* Ball trail */}
                    {ballTrail.map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: `${8 + i * 1.5}px`,
                            height: `${8 + i * 1.5}px`,
                            borderRadius: '50%',
                            background: pitch?.type === 'lightning'
                                ? `rgba(80, 168, 232, ${0.1 + i * 0.05})`
                                : `rgba(255, 255, 255, ${0.05 + i * 0.03})`,
                            pointerEvents: 'none'
                        }} />
                    ))}

                    {/* Decoy pitches (Wolf Warrior) */}
                    {decoyPitches.map(d => (
                        <div key={d.id} style={{
                            position: 'absolute',
                            left: `${d.x}%`,
                            top: `${d.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '26px',
                            opacity: d.opacity,
                            filter: 'grayscale(0.5) blur(1px)',
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
                            fontSize: '32px',
                            filter: darkMode
                                ? `drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px ${theme.gold})`
                                : pitch.type === 'lightning'
                                    ? 'drop-shadow(0 0 10px #50a8e8) drop-shadow(0 0 20px #50a8e8)'
                                    : 'drop-shadow(0 0 5px rgba(255,255,255,0.5))',
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
                            boxShadow: `0 0 ${p.size / 2}px ${p.color}`
                        }} />
                    ))}

                    {/* Timing indicator */}
                    {timingIndicator && (
                        <div style={{
                            position: 'absolute',
                            top: '20%',
                            left: '20%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: timingIndicator === 'perfect' ? theme.gold
                                : timingIndicator === 'good' ? theme.success
                                : timingIndicator === 'early' ? '#ff9966'
                                : timingIndicator === 'late' ? '#66b3ff'
                                : theme.error,
                            textTransform: 'uppercase',
                            textShadow: '0 0 10px currentColor'
                        }}>
                            {timingIndicator === 'missed' ? '' : timingIndicator}
                        </div>
                    )}

                    {/* Result */}
                    {lastResult && (
                        <div style={{
                            position: 'absolute',
                            top: '35%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            animation: 'resultPop 0.3s ease-out'
                        }}>
                            <div style={{
                                fontSize: lastResult.type.includes('homerun') ? '48px' : '36px',
                                fontWeight: 'bold',
                                color: lastResult.points > 0 ? theme.gold : theme.error,
                                textShadow: lastResult.points > 0 ? `0 0 20px ${theme.gold}` : 'none'
                            }}>
                                {lastResult.type.toUpperCase()}!
                            </div>
                            {lastResult.points > 0 && (
                                <div style={{ fontSize: '28px', color: theme.success, marginTop: '5px' }}>
                                    +{lastResult.points}
                                    {lastResult.combo && <span style={{ fontSize: '18px', marginLeft: '10px', color: theme.gold }}>({lastResult.combo}x)</span>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer instruction */}
                <div style={{
                    padding: '15px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    fontSize: '16px',
                    zIndex: 10
                }}>
                    <span style={{ color: theme.textSecondary }}>TAP</span>
                    <span style={{ color: theme.textMuted }}> or </span>
                    <span style={{ color: theme.textSecondary }}>SPACE</span>
                    <span style={{ color: theme.textMuted }}> to swing!</span>
                    {darkMode && <span style={{ marginLeft: '15px', color: theme.gold }}>🦋 Dark Mode Active</span>}
                </div>

                {/* CSS animations */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes resultPop {
                        0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                        50% { transform: translateX(-50%) scale(1.2); }
                        100% { transform: translateX(-50%) scale(1); opacity: 1; }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    if (gameState === 'result') {
        const won = score >= 125; // Lowered threshold
        const excellent = score >= 250; // Lowered threshold
        const perfect = score >= 400;
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.text, padding: '20px' }}>
                <div style={{ fontSize: '100px', marginBottom: '20px', animation: 'bounce 0.5s ease-out' }}>
                    {perfect ? '👑' : excellent ? '🏆' : won ? '⚾' : '😢'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: perfect ? '#FFD700' : excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px',
                    textShadow: perfect ? '0 0 30px #FFD700' : excellent ? `0 0 20px ${theme.gold}` : 'none'
                }}>
                    {perfect ? 'PERFECT GAME!' : excellent ? 'HOME RUN!' : won ? 'GOOD GAME!' : 'STRIKE OUT'}
                </h1>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                    Score: <span style={{ color: theme.gold }}>{score}</span>
                </div>
                {maxCombo > 1 && (
                    <div style={{ fontSize: '20px', color: theme.textSecondary, marginBottom: '15px' }}>
                        Best Combo: <span style={{ color: theme.gold }}>{maxCombo}x</span>
                    </div>
                )}
                {won && (
                    <div style={{ background: theme.bgPanel, padding: '15px 30px', borderRadius: '10px', marginBottom: '30px' }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Star Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>({getStars(selectedOpponent.id)}/10 ⭐)</span>
                    </div>
                )}
                {!won && (
                    <div style={{ color: theme.textMuted, marginBottom: '30px', textAlign: 'center' }}>
                        <p>Need 125+ points to win</p>
                        <p style={{ fontSize: '14px' }}>Tip: Time your swings when the ball is in the golden zone!</p>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{ padding: '15px 30px', fontSize: '18px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{ padding: '15px 30px', fontSize: '18px', background: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '10px', color: theme.textSecondary, cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Level Select
                    </button>
                </div>
                <style>{`
                    @keyframes bounce {
                        0% { transform: scale(0) rotate(-10deg); }
                        50% { transform: scale(1.2) rotate(5deg); }
                        100% { transform: scale(1) rotate(0); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};
