const { useState, useEffect, useCallback, useRef } = React;

const BattingCage = () => {
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#228b22', accentBright: '#32cd32',
        gold: '#f4c542', error: '#e85a50', success: '#50c878'
    };

    const opponents = [
        { id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878', title: 'The Groovy Beginner', mechanic: 'Slow pitches - learn timing!', pitchSpeed: 1, pitchTypes: ['slow'], special: 'none' },
        { id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840', title: 'The Cunning Clucker', mechanic: 'Fast pitches introduced!', pitchSpeed: 1.2, pitchTypes: ['slow', 'fast'], special: 'fast' },
        { id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0', title: 'The Groovy Giant', mechanic: 'Rhythm pitches - bonus on beat!', pitchSpeed: 1.3, pitchTypes: ['slow', 'fast'], special: 'rhythm' },
        { id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090', title: 'The Trash Tactician', mechanic: 'Curve balls appear!', pitchSpeed: 1.4, pitchTypes: ['slow', 'fast', 'curve'], special: 'curve' },
        { id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8', title: 'The Shocking Strategist', mechanic: 'Lightning fast pitches!', pitchSpeed: 1.5, pitchTypes: ['slow', 'fast', 'curve', 'lightning'], special: 'lightning' },
        { id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0', title: 'The Light Seeker', mechanic: 'Dark mode - track the ball!', pitchSpeed: 1.6, pitchTypes: ['slow', 'fast', 'curve'], special: 'dark' },
        { id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0', title: 'The Antarctic Academic', mechanic: 'Change-up pitches - speed varies!', pitchSpeed: 1.7, pitchTypes: ['slow', 'fast', 'curve', 'changeup'], special: 'changeup' },
        { id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060', title: 'The Slithering Schemer', mechanic: 'Slithering ball movement!', pitchSpeed: 1.8, pitchTypes: ['slow', 'fast', 'curve', 'slither'], special: 'slither' },
        { id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080', title: 'The Pack Leader', mechanic: 'Multiple pitches at once!', pitchSpeed: 1.9, pitchTypes: ['slow', 'fast', 'curve'], special: 'multi' },
        { id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840', title: 'The Ultimate Champion', mechanic: 'Boss Specials - all pitch types!', pitchSpeed: 2.0, pitchTypes: ['slow', 'fast', 'curve', 'lightning', 'slither'], special: 'all' }
    ];

    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [pitchesRemaining, setPitchesRemaining] = useState(10);
    const [score, setScore] = useState(0);
    const [pitch, setPitch] = useState(null);
    const [swinging, setSwinging] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [beatPhase, setBeatPhase] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('battingcage_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('battingcage_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    const throwPitch = useCallback(() => {
        if (!selectedOpponent || pitchesRemaining <= 0) return;

        const opp = selectedOpponent;
        const levelMod = 1 + (currentLevel - 1) * 0.1;
        const types = opp.pitchTypes;
        const type = types[Math.floor(Math.random() * types.length)];

        let speed = opp.pitchSpeed * levelMod;
        let curve = 0;

        switch (type) {
            case 'slow': speed *= 0.7; break;
            case 'fast': speed *= 1.2; break;
            case 'curve': curve = (Math.random() - 0.5) * 40; break;
            case 'lightning': speed *= 1.5; break;
            case 'changeup': speed *= Math.random() * 0.5 + 0.7; break;
            case 'slither': curve = Math.sin(Date.now() / 100) * 30; break;
        }

        setPitch({
            x: 100,
            y: 50 + (Math.random() - 0.5) * 20,
            type,
            speed: speed * 2,
            curve,
            thrown: Date.now()
        });

        if (opp.special === 'dark' || opp.special === 'all') {
            setDarkMode(Math.random() < 0.3);
        }
    }, [selectedOpponent, currentLevel, pitchesRemaining]);

    // Pitch animation
    useEffect(() => {
        if (!pitch || gameState !== 'playing') return;

        const animate = () => {
            setPitch(p => {
                if (!p) return null;

                let newX = p.x - p.speed;
                let newY = p.y + p.curve * 0.01;

                // Slither effect
                if (p.type === 'slither') {
                    newY += Math.sin((100 - newX) / 10) * 2;
                }

                // Ball passed
                if (newX < 10) {
                    if (!swinging) {
                        setLastResult({ type: 'strike', points: 0 });
                        setTimeout(() => setLastResult(null), 1000);
                    }
                    setPitchesRemaining(r => r - 1);
                    setTimeout(() => throwPitch(), 1500);
                    return null;
                }

                return { ...p, x: newX, y: newY };
            });
        };

        const interval = setInterval(animate, 16);
        return () => clearInterval(interval);
    }, [pitch, gameState, swinging, throwPitch]);

    // Handle swing
    const swing = useCallback(() => {
        if (gameState !== 'playing' || swinging || !pitch) return;

        setSwinging(true);

        const hitZone = { xMin: 15, xMax: 30 };
        const inZone = pitch.x >= hitZone.xMin && pitch.x <= hitZone.xMax;
        const timing = 1 - Math.abs(pitch.x - 22) / 15; // 0-1 timing quality

        let result;
        let points = 0;

        if (!inZone) {
            result = 'whiff';
        } else if (timing > 0.9) {
            result = 'homerun';
            points = 50;
        } else if (timing > 0.7) {
            result = 'double';
            points = 25;
        } else if (timing > 0.5) {
            result = 'single';
            points = 15;
        } else if (timing > 0.3) {
            result = 'foul';
            points = 5;
        } else {
            result = 'whiff';
        }

        // Rhythm bonus
        if ((selectedOpponent.special === 'rhythm' || selectedOpponent.special === 'all') && beatPhase === 0 && result !== 'whiff') {
            points = Math.floor(points * 1.5);
            result = '🎵' + result;
        }

        setScore(s => s + points);
        setLastResult({ type: result, points });
        setPitch(null);
        setPitchesRemaining(r => r - 1);

        setTimeout(() => {
            setSwinging(false);
            setLastResult(null);
            if (pitchesRemaining > 1) throwPitch();
        }, 1500);
    }, [gameState, swinging, pitch, selectedOpponent, beatPhase, pitchesRemaining, throwPitch]);

    // Beat timer
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => setBeatPhase(p => (p + 1) % 4), 500);
        return () => clearInterval(interval);
    }, [gameState]);

    // Check end game
    useEffect(() => {
        if (pitchesRemaining <= 0 && !pitch && gameState === 'playing') {
            setTimeout(() => setGameState('result'), 500);
        }
    }, [pitchesRemaining, pitch, gameState]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;
        const maxScore = 500;
        const percentage = score / maxScore;
        if (percentage >= 0.3) {
            const points = percentage >= 0.6 ? 2 : 1;
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
        setSwinging(false);
        setLastResult(null);
        setDarkMode(false);
        setGameState('playing');
        setTimeout(() => throwPitch(), 1000);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') { e.preventDefault(); swing(); }
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
        };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('click', swing);
        return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('click', swing); };
    }, [swing, gameState]);

    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{ width: '12px', height: '12px', background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark, borderRadius: '2px', border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}` }} />
            ))}
        </div>
    );

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
                                style={{ background: unlocked ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})` : theme.bgDark, border: `2px solid ${unlocked ? opp.color : theme.border}`, borderRadius: '12px', padding: '15px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5, position: 'relative' }}
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
                            <button key={i} onClick={() => unlocked && startMatch(selectedOpponent, levelNum)} disabled={!unlocked} style={{ width: '60px', height: '60px', background: unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark, border: `2px solid ${unlocked ? selectedOpponent.color : theme.border}`, borderRadius: '10px', color: unlocked ? 'white' : theme.textMuted, fontSize: '20px', fontWeight: 'bold', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.5 }}>{unlocked ? levelNum : '🔒'}</button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        const opp = selectedOpponent;
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}22 100%)`, display: 'flex', flexDirection: 'column', color: theme.text, userSelect: 'none', filter: darkMode ? 'brightness(0.3)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'rgba(0,0,0,0.3)' }}>
                    <div>Pitches: <span style={{ color: theme.gold }}>{pitchesRemaining}</span></div>
                    <div style={{ color: opp.color }}>{opp.emoji} Level {currentLevel}</div>
                    <div>Score: <span style={{ color: theme.gold }}>{score}</span></div>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {/* Batter */}
                    <div style={{ position: 'absolute', left: '15%', top: '50%', transform: `translateY(-50%) ${swinging ? 'rotate(-45deg)' : ''}`, fontSize: '80px', transition: 'transform 0.1s' }}>🐻</div>
                    {/* Bat */}
                    <div style={{ position: 'absolute', left: '20%', top: '45%', width: '80px', height: '10px', background: '#8b4513', borderRadius: '5px', transform: `rotate(${swinging ? '-60deg' : '30deg'})`, transformOrigin: 'left center', transition: 'transform 0.1s' }} />
                    {/* Pitcher */}
                    <div style={{ position: 'absolute', right: '15%', top: '50%', transform: 'translateY(-50%)', fontSize: '60px' }}>{opp.emoji}</div>
                    {/* Ball */}
                    {pitch && (
                        <div style={{ position: 'absolute', left: `${pitch.x}%`, top: `${pitch.y}%`, transform: 'translate(-50%, -50%)', fontSize: '30px' }}>⚾</div>
                    )}
                    {/* Strike zone */}
                    <div style={{ position: 'absolute', left: '15%', top: '35%', width: '15%', height: '30%', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '5px' }} />
                    {/* Result */}
                    {lastResult && (
                        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', fontSize: '36px', fontWeight: 'bold', color: lastResult.points > 0 ? theme.gold : theme.error }}>
                            {lastResult.type.toUpperCase()}! {lastResult.points > 0 && `+${lastResult.points}`}
                        </div>
                    )}
                </div>
                <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>TAP / SPACE to swing!</div>
            </div>
        );
    }

    if (gameState === 'result') {
        const won = score >= 150;
        const excellent = score >= 300;
        return (
            <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.text, padding: '20px' }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>{excellent ? '🏆' : won ? '✓' : '😢'}</div>
                <h1 style={{ fontSize: '48px', color: excellent ? theme.gold : won ? theme.success : theme.error, marginBottom: '10px' }}>{excellent ? 'HOME RUN!' : won ? 'GOOD GAME!' : 'STRIKE OUT'}</h1>
                <div style={{ fontSize: '36px', marginBottom: '20px' }}>Score: <span style={{ color: theme.gold }}>{score}</span></div>
                {won && (
                    <div style={{ background: theme.bgPanel, padding: '15px 30px', borderRadius: '10px', marginBottom: '30px' }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>({getStars(selectedOpponent.id)}/10 ⭐)</span>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => startMatch(selectedOpponent, currentLevel)} style={{ padding: '15px 30px', fontSize: '18px', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Play Again</button>
                    <button onClick={() => setGameState('level_select')} style={{ padding: '15px 30px', fontSize: '18px', background: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '10px', color: theme.textSecondary, cursor: 'pointer' }}>Level Select</button>
                </div>
            </div>
        );
    }

    return null;
};
