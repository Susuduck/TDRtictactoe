const { useState, useEffect, useCallback, useRef } = React;

const ArmWrestling = () => {
    // Theme
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#e85a50', accentBright: '#ff6b5b',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Opponents
    const opponents = [
        { id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878', title: 'The Groovy Beginner', taunt: "Ribbit! Let's wrestle!", winQuote: "Hop hop hooray!", loseQuote: "Ribbit... you're strong!", gimmick: 'none', gimmickDesc: 'No special moves' },
        { id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840', title: 'The Cunning Clucker', taunt: "Bawk! Think you can beat these wings?", winQuote: "Winner winner!", loseQuote: "Bawk... impressive!", gimmick: 'feather_flurry', gimmickDesc: 'Feathers obscure view briefly' },
        { id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0', title: 'The Groovy Giant', taunt: "Time to boogie, baby!", winQuote: "Disco power!", loseQuote: "The dance floor is yours...", gimmick: 'rhythm_boost', gimmickDesc: 'Gets power surges on the beat' },
        { id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090', title: 'The Trash Tactician', taunt: "Found your weakness in the trash!", winQuote: "Garbage day victory!", loseQuote: "Back to the bins...", gimmick: 'stamina_drain', gimmickDesc: 'Your stamina drains faster' },
        { id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8', title: 'The Shocking Strategist', taunt: "Prepare to be shocked!", winQuote: "ZAP! Electrifying!", loseQuote: "Circuits fried...", gimmick: 'shock_stun', gimmickDesc: 'Can stun you briefly' },
        { id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0', title: 'The Light Seeker', taunt: "Drawn to victory...", winQuote: "The light guides me!", loseQuote: "Into the darkness...", gimmick: 'dim_lights', gimmickDesc: 'Screen darkens periodically' },
        { id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0', title: 'The Antarctic Academic', taunt: "Let me educate you!", winQuote: "Class dismissed!", loseQuote: "I must study more...", gimmick: 'quiz_pause', gimmickDesc: 'Quick math questions pause action' },
        { id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060', title: 'The Slithering Schemer', taunt: "Sssso you dare?", winQuote: "Ssssweet victory!", loseQuote: "Thisss isssn't over...", gimmick: 'progress_steal', gimmickDesc: 'Can steal some of your progress' },
        { id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080', title: 'The Pack Leader', taunt: "The pack hunts!", winQuote: "AWOOOO!", loseQuote: "The pack retreats...", gimmick: 'pack_rush', gimmickDesc: 'Gets aggressive power bursts' },
        { id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840', title: 'The Ultimate Champion', taunt: "You dare face the champion?", winQuote: "Undefeated!", loseQuote: "Impossible!", gimmick: 'all_gimmicks', gimmickDesc: 'Uses all gimmicks randomly' }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [playerPower, setPlayerPower] = useState(50);
    const [playerStamina, setPlayerStamina] = useState(100);
    const [armAngle, setArmAngle] = useState(0);
    const [isStunned, setIsStunned] = useState(false);
    const [screenDim, setScreenDim] = useState(false);
    const [showFeathers, setShowFeathers] = useState(false);
    const [quizActive, setQuizActive] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState(null);
    const [matchResult, setMatchResult] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [tapsThisSecond, setTapsThisSecond] = useState(0);

    // Animation refs
    const gameLoopRef = useRef(null);
    const lastTapTime = useRef(0);
    const tapCountRef = useRef(0);

    // Progression state
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('armwrestling_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('armwrestling_progression_v1', JSON.stringify(progression));
    }, [progression]);

    // Get stars for opponent
    const getStars = (opponentIndex) => Math.floor(progression.starPoints[opponentIndex] / 4);
    const isOpponentUnlocked = (index) => index === 0 || progression.starPoints[index - 1] >= 40;
    const isOpponentMastered = (index) => progression.starPoints[index] >= 40;

    // Difficulty settings based on opponent and level
    const getDifficulty = useCallback((opponentIdx, level) => {
        const base = opponentIdx * 0.08;
        const levelMod = (level - 1) * 0.015;
        const total = Math.min(0.95, base + levelMod);

        return {
            aiTapRate: 2 + total * 8,           // 2-10 taps per second
            aiPowerPerTap: 0.4 + total * 0.6,   // 0.4-1.0 power per tap
            playerPowerPerTap: 1.2 - total * 0.4, // 1.2-0.8 power per tap
            staminaDrain: 0.1 + total * 0.4,    // Stamina drain per tap when exhausted
            staminaRegen: 2 - total * 1.5,      // Stamina regen per second
            gimmickChance: total * 0.3,         // Chance of gimmick triggering
            aiRecoveryRate: 0.5 + total * 0.5,  // How fast AI recovers when losing
        };
    }, []);

    // Generate quiz question
    const generateQuiz = () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let answer;
        switch(op) {
            case '+': answer = a + b; break;
            case '-': answer = a - b; break;
            case '×': answer = a * b; break;
        }
        const options = [answer];
        while (options.length < 4) {
            const wrong = answer + Math.floor(Math.random() * 10) - 5;
            if (wrong !== answer && !options.includes(wrong)) options.push(wrong);
        }
        options.sort(() => Math.random() - 0.5);
        return { question: `${a} ${op} ${b} = ?`, answer, options };
    };

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setPlayerPower(50);
        setPlayerStamina(100);
        setArmAngle(0);
        setIsStunned(false);
        setScreenDim(false);
        setShowFeathers(false);
        setQuizActive(false);
        setMatchResult(null);
        setCountdown(3);
        setGameState('countdown');
    }, []);

    // Countdown effect
    useEffect(() => {
        if (gameState !== 'countdown') return;
        if (countdown === 0) {
            setGameState('playing');
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, gameState]);

    // Handle player tap
    const handleTap = useCallback(() => {
        if (gameState !== 'playing' || isStunned || quizActive) return;

        const now = Date.now();
        const timeSinceLast = now - lastTapTime.current;
        lastTapTime.current = now;

        // Track taps per second for stamina system
        if (timeSinceLast < 1000) {
            tapCountRef.current++;
        } else {
            tapCountRef.current = 1;
        }
        setTapsThisSecond(tapCountRef.current);

        const diff = getDifficulty(selectedOpponent.id, currentLevel);

        // Stamina drain if tapping too fast (more than 10 taps/sec)
        if (tapCountRef.current > 8) {
            setPlayerStamina(s => Math.max(0, s - diff.staminaDrain * 5));
        }

        // Power gain (reduced if stamina low)
        const staminaMod = playerStamina > 20 ? 1 : playerStamina / 40;
        const powerGain = diff.playerPowerPerTap * staminaMod;

        setPlayerPower(p => Math.min(100, p + powerGain));
    }, [gameState, isStunned, quizActive, selectedOpponent, currentLevel, playerStamina, getDifficulty]);

    // Handle quiz answer
    const handleQuizAnswer = useCallback((answer) => {
        if (answer === quizQuestion.answer) {
            setPlayerPower(p => Math.min(100, p + 5));
        } else {
            setPlayerPower(p => Math.max(0, p - 10));
        }
        setQuizActive(false);
        setQuizQuestion(null);
    }, [quizQuestion]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const diff = getDifficulty(selectedOpponent.id, currentLevel);

        const loop = setInterval(() => {
            // AI tapping
            const aiPower = diff.aiTapRate * diff.aiPowerPerTap / 60;

            // Player stamina regen
            setPlayerStamina(s => Math.min(100, s + diff.staminaRegen / 60));

            // Update power balance
            setPlayerPower(p => {
                let newPower = p - aiPower;

                // AI recovery boost when losing badly
                if (newPower > 70) {
                    newPower -= diff.aiRecoveryRate / 30;
                }

                // Clamp
                newPower = Math.max(0, Math.min(100, newPower));

                // Check win/lose
                if (newPower <= 0) {
                    setMatchResult('lose');
                    setGameState('result');
                } else if (newPower >= 100) {
                    setMatchResult('win');
                    setGameState('result');
                }

                return newPower;
            });

            // Update arm angle
            setArmAngle((playerPower - 50) * 0.9);

            // Gimmick triggers
            if (Math.random() < diff.gimmickChance / 60) {
                const gimmick = selectedOpponent.id === 9
                    ? ['feather_flurry', 'shock_stun', 'dim_lights', 'quiz_pause', 'progress_steal'][Math.floor(Math.random() * 5)]
                    : selectedOpponent.gimmick;

                switch(gimmick) {
                    case 'feather_flurry':
                        setShowFeathers(true);
                        setTimeout(() => setShowFeathers(false), 1500);
                        break;
                    case 'shock_stun':
                        setIsStunned(true);
                        setTimeout(() => setIsStunned(false), 800);
                        break;
                    case 'dim_lights':
                        setScreenDim(true);
                        setTimeout(() => setScreenDim(false), 2000);
                        break;
                    case 'quiz_pause':
                        setQuizActive(true);
                        setQuizQuestion(generateQuiz());
                        break;
                    case 'progress_steal':
                        setPlayerPower(p => Math.max(0, p - 5));
                        break;
                    case 'pack_rush':
                        setPlayerPower(p => Math.max(0, p - 8));
                        break;
                    case 'rhythm_boost':
                        setPlayerPower(p => Math.max(0, p - 3));
                        break;
                }
            }
        }, 1000 / 60);

        gameLoopRef.current = loop;
        return () => clearInterval(loop);
    }, [gameState, selectedOpponent, currentLevel, playerPower, getDifficulty]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result' || !matchResult) return;

        const points = matchResult === 'win' ? 2 : 0;
        if (points > 0) {
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, matchResult, selectedOpponent]);

    // Keyboard/touch handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleTap();
            }
            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    setGameState('select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleTap, gameState]);

    // Stars display component
    const StarBar = ({ points, max = 40 }) => {
        const stars = Math.floor(points / 4);
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} style={{
                        width: '12px', height: '12px',
                        background: i < stars ? theme.gold : theme.bgDark,
                        borderRadius: '2px',
                        border: `1px solid ${i < stars ? theme.gold : theme.border}`
                    }} />
                ))}
            </div>
        );
    };

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f2f 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>💪</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>ARM WRESTLING</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Tap rapidly to overpower your opponent!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(232, 90, 80, 0.4)'
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
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Opponent</h2>
                    <div style={{ width: '80px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                                    if (!unlocked) return;
                                    setSelectedOpponent(opp);
                                    setGameState('level_select');
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
                                    }}>✓ MASTERED</div>
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
                                        <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '5px' }}>
                                            ⚡ {opp.gimmickDesc}
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
                <p style={{
                    color: theme.textSecondary, fontStyle: 'italic',
                    marginTop: '10px', fontSize: '14px'
                }}>"{selectedOpponent.taunt}"</p>

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

    // Countdown screen
    if (gameState === 'countdown') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text
            }}>
                <div style={{ display: 'flex', gap: '100px', alignItems: 'center', marginBottom: '50px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '80px' }}>🐻</div>
                        <div style={{ fontSize: '24px', marginTop: '10px' }}>YOU</div>
                    </div>
                    <div style={{ fontSize: '32px', color: theme.textMuted }}>VS</div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '80px' }}>{selectedOpponent.emoji}</div>
                        <div style={{ fontSize: '24px', marginTop: '10px', color: selectedOpponent.color }}>
                            {selectedOpponent.name}
                        </div>
                    </div>
                </div>

                <div style={{
                    fontSize: '120px', fontWeight: 'bold',
                    color: countdown === 0 ? theme.success : theme.gold,
                    animation: 'pulse 0.5s ease-in-out'
                }}>
                    {countdown === 0 ? 'GO!' : countdown}
                </div>

                <div style={{ marginTop: '30px', color: theme.textSecondary }}>
                    Level {currentLevel}
                </div>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '20px', color: theme.text,
                    filter: screenDim ? 'brightness(0.3)' : 'brightness(1)',
                    transition: 'filter 0.3s',
                    userSelect: 'none'
                }}
                onClick={handleTap}
                onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
            >
                {/* Feather effect */}
                {showFeathers && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        pointerEvents: 'none', zIndex: 100,
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                        animation: 'fadeIn 0.2s'
                    }}>
                        {Array(20).fill(0).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                fontSize: '40px',
                                animation: `fall ${1 + Math.random()}s ease-out`
                            }}>🪶</div>
                        ))}
                    </div>
                )}

                {/* Stun indicator */}
                {isStunned && (
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '80px', zIndex: 100
                    }}>⚡ STUNNED! ⚡</div>
                )}

                {/* Quiz popup */}
                {quizActive && quizQuestion && (
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: theme.bgPanel, padding: '30px',
                        borderRadius: '15px', border: `2px solid ${theme.accent}`,
                        zIndex: 100, textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '10px' }}>
                            🐧 POP QUIZ!
                        </div>
                        <div style={{ fontSize: '28px', marginBottom: '20px' }}>
                            {quizQuestion.question}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {quizQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); handleQuizAnswer(opt); }}
                                    style={{
                                        padding: '15px', fontSize: '20px',
                                        background: theme.bgDark, border: `1px solid ${theme.border}`,
                                        borderRadius: '8px', color: theme.text, cursor: 'pointer'
                                    }}
                                >{opt}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '100%', maxWidth: '600px', marginBottom: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>🐻</div>
                        <div>YOU</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color: theme.textMuted }}>Level {currentLevel}</div>
                        <div style={{ fontSize: '24px', color: selectedOpponent.color }}>{selectedOpponent.name}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px' }}>{selectedOpponent.emoji}</div>
                        <div style={{ color: selectedOpponent.color }}>{selectedOpponent.name.split(' ')[0]}</div>
                    </div>
                </div>

                {/* Power bar */}
                <div style={{
                    width: '100%', maxWidth: '600px', height: '50px',
                    background: theme.bgDark, borderRadius: '25px',
                    border: `2px solid ${theme.border}`, position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${playerPower}%`,
                        background: `linear-gradient(90deg, ${theme.success}, ${theme.gold})`,
                        transition: 'width 0.05s'
                    }} />
                    <div style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0,
                        width: `${100 - playerPower}%`,
                        background: `linear-gradient(270deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`,
                        transition: 'width 0.05s'
                    }} />
                    <div style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px', fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>💪</div>
                </div>

                {/* Arm wrestling visual */}
                <div style={{
                    marginTop: '40px', marginBottom: '40px',
                    position: 'relative', width: '300px', height: '200px'
                }}>
                    <div style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: `translate(-50%, -50%) rotate(${armAngle}deg)`,
                        fontSize: '100px',
                        transition: 'transform 0.1s'
                    }}>
                        🤝
                    </div>
                    <div style={{
                        position: 'absolute', left: '10%', top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '60px'
                    }}>🐻</div>
                    <div style={{
                        position: 'absolute', right: '10%', top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '60px'
                    }}>{selectedOpponent.emoji}</div>
                </div>

                {/* Stamina bar */}
                <div style={{ width: '100%', maxWidth: '300px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '5px' }}>
                        Stamina
                    </div>
                    <div style={{
                        height: '15px', background: theme.bgDark,
                        borderRadius: '8px', overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%', width: `${playerStamina}%`,
                            background: playerStamina > 30 ? theme.success : theme.error,
                            transition: 'width 0.1s'
                        }} />
                    </div>
                </div>

                {/* Tap instruction */}
                <div style={{
                    marginTop: '30px', padding: '20px 40px',
                    background: `${theme.accent}22`, borderRadius: '15px',
                    border: `2px solid ${theme.accent}`,
                    animation: 'pulse 1s infinite'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                        TAP RAPIDLY!
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textMuted, marginTop: '5px' }}>
                        Press SPACE, click, or tap screen
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes fall {
                        0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const won = matchResult === 'win';

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
                    {won ? 'VICTORY!' : 'DEFEATED'}
                </h1>
                <p style={{
                    color: selectedOpponent.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '30px'
                }}>
                    {selectedOpponent.emoji} "{won ? selectedOpponent.loseQuote : selectedOpponent.winQuote}"
                </p>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+2 Points</span>
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
