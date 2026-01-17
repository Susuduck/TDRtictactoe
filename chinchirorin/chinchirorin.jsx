const { useState, useEffect, useCallback, useRef } = React;

const Chinchirorin = () => {
    // Theme - Dark red
    const theme = {
        bg: '#1a1215', bgPanel: '#2a2025', bgDark: '#1a1015',
        border: '#4a3438', borderLight: '#5a4448',
        text: '#ffffff', textSecondary: '#c8b0b4', textMuted: '#9880a0',
        accent: '#8b0000', accentBright: '#b01010',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Dice faces for display
    const diceFaces = {
        1: ['', '', '', '', '\u2022', '', '', '', ''],
        2: ['\u2022', '', '', '', '', '', '', '', '\u2022'],
        3: ['\u2022', '', '', '', '\u2022', '', '', '', '\u2022'],
        4: ['\u2022', '', '\u2022', '', '', '', '\u2022', '', '\u2022'],
        5: ['\u2022', '', '\u2022', '', '\u2022', '', '\u2022', '', '\u2022'],
        6: ['\u2022', '', '\u2022', '\u2022', '', '\u2022', '\u2022', '', '\u2022']
    };

    // Opponents - different luck and cheating tendencies
    const opponents = [
        { id: 0, name: 'Funky Frog', emoji: '\uD83D\uDC38', color: '#50c878', title: 'The Pond Punk', taunt: "Ribbit! Roll 'em, ribbit!", winQuote: "Hop hop hooray!", loseQuote: "Ribbit... lucky roll!", luck: 0.0, cheatChance: 0.0, gimmick: 'none', gimmickDesc: 'Fair and square' },
        { id: 1, name: 'Cheeky Chicken', emoji: '\uD83D\uDC14', color: '#e8a840', title: 'The Coop Gambler', taunt: "Bawk! Let's see those bones!", winQuote: "Winner winner chicken dinner!", loseQuote: "Bawk... beginner's luck!", luck: 0.05, cheatChance: 0.05, gimmick: 'lucky_reroll', gimmickDesc: 'Sometimes rerolls bad results' },
        { id: 2, name: 'Disco Dinosaur', emoji: '\uD83E\uDD95', color: '#a080c0', title: 'The Groovy Gambler', taunt: "Shake those dice, baby!", winQuote: "Groooovy!", loseQuote: "The dance floor is yours...", luck: 0.1, cheatChance: 0.08, gimmick: 'rhythm_luck', gimmickDesc: 'Gets luckier with style' },
        { id: 3, name: 'Radical Raccoon', emoji: '\uD83E\uDD9D', color: '#808090', title: 'The Trash Tycoon', taunt: "Found these dice in the dumpster!", winQuote: "Trash treasure!", loseQuote: "Back to the bins...", luck: 0.15, cheatChance: 0.12, gimmick: 'loaded_dice', gimmickDesc: 'Uses weighted dice occasionally' },
        { id: 4, name: 'Electric Eel', emoji: '\u26A1', color: '#50a8e8', title: 'The Shocking Shark', taunt: "Electrifying wagers!", winQuote: "ZAP! Shocking victory!", loseQuote: "Circuits fried...", luck: 0.2, cheatChance: 0.15, gimmick: 'static_cling', gimmickDesc: 'Dice stick to favorable sides' },
        { id: 5, name: 'Mysterious Moth', emoji: '\uD83E\uDD8B', color: '#c090a0', title: 'The Night Roller', taunt: "The light draws fortune...", winQuote: "The light guided me!", loseQuote: "Into the darkness...", luck: 0.25, cheatChance: 0.18, gimmick: 'shadow_swap', gimmickDesc: 'Can swap dice in shadows' },
        { id: 6, name: 'Professor Penguin', emoji: '\uD83D\uDC27', color: '#4080a0', title: 'The Arctic Actuary', taunt: "Probability favors me!", winQuote: "Statistically inevitable!", loseQuote: "Impossible odds...", luck: 0.3, cheatChance: 0.22, gimmick: 'probability_bend', gimmickDesc: 'Bends probability slightly' },
        { id: 7, name: 'Sly Snake', emoji: '\uD83D\uDC0D', color: '#60a060', title: 'The Serpent Swindler', taunt: "Ssssmooth rolling!", winQuote: "Ssssweet victory!", loseQuote: "Thisss isssn't over...", luck: 0.35, cheatChance: 0.28, gimmick: 'sleight_of_tail', gimmickDesc: 'Quick tail swaps dice' },
        { id: 8, name: 'Wolf Warrior', emoji: '\uD83D\uDC3A', color: '#606080', title: 'The Pack Leader', taunt: "The pack always wins!", winQuote: "AWOOOO!", loseQuote: "The pack retreats...", luck: 0.4, cheatChance: 0.32, gimmick: 'pack_tactics', gimmickDesc: 'Pack mates signal winning rolls' },
        { id: 9, name: 'Grand Master Grizzly', emoji: '\uD83D\uDC51', color: '#d4a840', title: 'The Ultimate Dealer', taunt: "The house always wins!", winQuote: "Bow to the champion!", loseQuote: "Impossible! ...well played.", luck: 0.5, cheatChance: 0.4, gimmick: 'house_edge', gimmickDesc: 'Master of all tricks' }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [honey, setHoney] = useState(100);
    const [currentBet, setCurrentBet] = useState(0);
    const [playerDice, setPlayerDice] = useState([0, 0, 0]);
    const [dealerDice, setDealerDice] = useState([0, 0, 0]);
    const [playerResult, setPlayerResult] = useState(null);
    const [dealerResult, setDealerResult] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollPhase, setRollPhase] = useState('bet'); // bet, player_roll, dealer_roll, result
    const [message, setMessage] = useState('');
    const [roundsPlayed, setRoundsPlayed] = useState(0);
    const [roundsWon, setRoundsWon] = useState(0);
    const [matchResult, setMatchResult] = useState(null);
    const [cheatDetected, setCheatDetected] = useState(false);

    // Animation refs
    const rollIntervalRef = useRef(null);

    // Progression state
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('chinchirorin_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0), totalHoneyWon: 0 };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('chinchirorin_progression_v1', JSON.stringify(progression));
    }, [progression]);

    // Get stars for opponent
    const getStars = (opponentIndex) => Math.floor(progression.starPoints[opponentIndex] / 4);
    const isOpponentUnlocked = (index) => index === 0 || progression.starPoints[index - 1] >= 40;
    const isOpponentMastered = (index) => progression.starPoints[index] >= 40;

    // Get minimum bet for level
    const getMinBet = (level) => 5 + (level - 1) * 5; // 5, 10, 15, ..., 50
    const getMaxBet = (level) => 10 + (level - 1) * 10; // 10, 20, 30, ..., 100

    // Evaluate dice result
    const evaluateDice = useCallback((dice) => {
        const sorted = [...dice].sort((a, b) => a - b);
        const counts = {};
        dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
        const values = Object.keys(counts).map(Number);

        // Check for triple
        if (values.length === 1) {
            if (dice[0] === 6) {
                return { type: 'triple_six', multiplier: 5, rank: 1000, name: 'Triple 6!' };
            }
            return { type: 'triple', multiplier: 3, rank: 900 + dice[0], name: `Triple ${dice[0]}s!` };
        }

        // Check for 4-5-6 (Shigoro)
        if (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) {
            return { type: 'shigoro', multiplier: 2, rank: 800, name: '4-5-6 Shigoro!' };
        }

        // Check for 1-2-3 (Hifumi - automatic loss)
        if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) {
            return { type: 'hifumi', multiplier: -2, rank: -100, name: '1-2-3 Bust!' };
        }

        // Check for pair + point
        for (let val of values) {
            if (counts[val] === 2) {
                const point = dice.find(d => d !== val);
                return { type: 'point', multiplier: 1, rank: point, name: `Point: ${point}`, point };
            }
        }

        // No valid combination - re-roll needed (in actual game, we'll just score 0)
        return { type: 'menashi', multiplier: 0, rank: -50, name: 'No Score (Menashi)' };
    }, []);

    // Roll dice with opponent's luck/cheat factor
    const rollDiceForDealer = useCallback((opponent, level) => {
        const luckFactor = opponent.luck + (level - 1) * 0.02;
        const cheatChance = opponent.cheatChance + (level - 1) * 0.015;

        // Check if cheating occurs
        if (Math.random() < cheatChance) {
            setCheatDetected(true);
            // Cheating: roll multiple times and pick best
            let bestRoll = [1, 2, 4]; // Default bad roll
            let bestRank = -1000;

            for (let i = 0; i < 3; i++) {
                const roll = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ];
                const result = evaluateDice(roll);
                if (result.rank > bestRank) {
                    bestRank = result.rank;
                    bestRoll = roll;
                }
            }
            return bestRoll;
        }

        // Luck factor: chance to get better outcomes
        if (Math.random() < luckFactor) {
            // Lucky roll - bias towards better results
            const luckyRolls = [
                [6, 6, 6], [5, 5, 5], [4, 4, 4], [4, 5, 6],
                [6, 6, 5], [6, 6, 4], [5, 5, 6], [5, 5, 4]
            ];
            return luckyRolls[Math.floor(Math.random() * luckyRolls.length)];
        }

        // Normal roll
        return [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
    }, [evaluateDice]);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        const minBet = getMinBet(level);
        setHoney(50 + level * 10); // Starting honey scales with level
        setCurrentBet(minBet);
        setPlayerDice([0, 0, 0]);
        setDealerDice([0, 0, 0]);
        setPlayerResult(null);
        setDealerResult(null);
        setRollPhase('bet');
        setMessage(`Place your bet! (Min: ${minBet}, Max: ${getMaxBet(level)})`);
        setRoundsPlayed(0);
        setRoundsWon(0);
        setMatchResult(null);
        setCheatDetected(false);
        setGameState('playing');
    }, []);

    // Animate dice roll
    const animateRoll = useCallback((callback, isDealer = false) => {
        setIsRolling(true);
        let count = 0;
        const maxRolls = 15;

        rollIntervalRef.current = setInterval(() => {
            const randomDice = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];

            if (isDealer) {
                setDealerDice(randomDice);
            } else {
                setPlayerDice(randomDice);
            }

            count++;
            if (count >= maxRolls) {
                clearInterval(rollIntervalRef.current);
                setIsRolling(false);
                callback();
            }
        }, 80);
    }, []);

    // Player rolls
    const handlePlayerRoll = useCallback(() => {
        if (isRolling || rollPhase !== 'bet') return;
        if (currentBet > honey) {
            setMessage("Not enough honey for that bet!");
            return;
        }

        setRollPhase('player_roll');
        animateRoll(() => {
            const finalDice = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            setPlayerDice(finalDice);
            const result = evaluateDice(finalDice);
            setPlayerResult(result);
            setMessage(`You rolled: ${result.name}`);

            // Delay before dealer rolls
            setTimeout(() => {
                setRollPhase('dealer_roll');
                handleDealerRoll(result);
            }, 1500);
        });
    }, [isRolling, rollPhase, currentBet, honey, animateRoll, evaluateDice]);

    // Dealer rolls
    const handleDealerRoll = useCallback((playerRes) => {
        setCheatDetected(false);
        animateRoll(() => {
            const finalDice = rollDiceForDealer(selectedOpponent, currentLevel);
            setDealerDice(finalDice);
            const result = evaluateDice(finalDice);
            setDealerResult(result);

            // Determine winner
            setTimeout(() => {
                setRollPhase('result');
                determineWinner(playerRes, result);
            }, 1000);
        }, true);
    }, [selectedOpponent, currentLevel, animateRoll, evaluateDice, rollDiceForDealer]);

    // Determine winner
    const determineWinner = useCallback((playerRes, dealerRes) => {
        let honeyChange = 0;
        let won = false;
        let resultMsg = '';

        if (playerRes.rank > dealerRes.rank) {
            // Player wins
            won = true;
            const multiplier = playerRes.multiplier > 0 ? playerRes.multiplier : 1;
            honeyChange = currentBet * multiplier;
            resultMsg = `You win ${honeyChange} honey!`;
            if (cheatDetected) {
                resultMsg += ' (They tried to cheat!)';
            }
        } else if (playerRes.rank < dealerRes.rank) {
            // Dealer wins
            const multiplier = dealerRes.multiplier > 0 ? dealerRes.multiplier : 1;
            honeyChange = -currentBet * multiplier;
            resultMsg = `${selectedOpponent.name} wins! You lose ${Math.abs(honeyChange)} honey.`;
            if (cheatDetected) {
                resultMsg += ' (Suspicious roll...)';
            }
        } else {
            // Tie
            resultMsg = "It's a tie! No honey changes hands.";
        }

        setMessage(resultMsg);
        setHoney(h => Math.max(0, h + honeyChange));
        setRoundsPlayed(r => r + 1);
        if (won) setRoundsWon(w => w + 1);

        // Check for match end (5 rounds or out of honey)
        const newHoney = Math.max(0, honey + honeyChange);
        const newRounds = roundsPlayed + 1;

        setTimeout(() => {
            if (newHoney <= 0) {
                // Lost all honey
                endMatch(false);
            } else if (newRounds >= 5) {
                // 5 rounds complete - win if more than starting honey
                const startingHoney = 50 + currentLevel * 10;
                endMatch(newHoney > startingHoney);
            } else {
                // Continue playing
                setRollPhase('bet');
                setPlayerResult(null);
                setDealerResult(null);
                setPlayerDice([0, 0, 0]);
                setDealerDice([0, 0, 0]);
                const minBet = getMinBet(currentLevel);
                setCurrentBet(Math.min(minBet, newHoney));
                setMessage(`Round ${newRounds + 1}! Place your bet.`);
            }
        }, 2500);
    }, [currentBet, honey, roundsPlayed, selectedOpponent, currentLevel, cheatDetected]);

    // End match
    const endMatch = useCallback((won) => {
        setMatchResult(won ? 'win' : 'lose');
        setGameState('result');

        if (won) {
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + 2);
                return {
                    ...prev,
                    starPoints: newPoints,
                    totalHoneyWon: prev.totalHoneyWon + honey
                };
            });
        }
    }, [selectedOpponent, honey]);

    // Adjust bet
    const adjustBet = useCallback((amount) => {
        const minBet = getMinBet(currentLevel);
        const maxBet = Math.min(getMaxBet(currentLevel), honey);
        setCurrentBet(b => Math.max(minBet, Math.min(maxBet, b + amount)));
    }, [currentLevel, honey]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (rollIntervalRef.current) {
                clearInterval(rollIntervalRef.current);
            }
        };
    }, []);

    // Dice component
    const Dice = ({ value, size = 60, rolling = false }) => {
        const dots = value > 0 ? diceFaces[value] : Array(9).fill('');
        return (
            <div style={{
                width: size, height: size,
                background: rolling
                    ? 'linear-gradient(135deg, #fff 0%, #f0e0e0 100%)'
                    : 'linear-gradient(135deg, #fff 0%, #e8d8d8 100%)',
                borderRadius: size * 0.15,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                padding: size * 0.12,
                gap: size * 0.02,
                boxShadow: `0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)`,
                transform: rolling ? `rotate(${Math.random() * 30 - 15}deg)` : 'rotate(0deg)',
                transition: rolling ? 'none' : 'transform 0.3s'
            }}>
                {dots.map((dot, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: size * 0.35,
                        color: '#1a1015',
                        fontWeight: 'bold'
                    }}>
                        {dot}
                    </div>
                ))}
            </div>
        );
    };

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1a1d 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>{'\uD83C\uDFB2'}</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>CHINCHIRORIN</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px' }}>Dice Cup Gambling</p>
                <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '30px', textAlign: 'center', maxWidth: '400px' }}>
                    Roll 3 dice against The Boss! Triple 6 pays 5x, any triple 3x, 4-5-6 pays 2x.
                    Match pairs to score points. Avoid 1-2-3!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(139, 0, 0, 0.4)'
                    }}
                >
                    PLAY
                </button>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>{'\u2190'} Back to Menu</a>
            </div>
        );
    }

    // Opponent select screen
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1a1d 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>{'\u2190'} Back</button>
                    <h2 style={{ color: theme.accent }}>Choose The Boss</h2>
                    <div style={{ width: '80px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                                    }}>{'\uD83D\uDD12'}</div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.success, padding: '2px 8px',
                                        borderRadius: '10px', fontSize: '12px'
                                    }}>{'\u2713'} MASTERED</div>
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
                                            {'\uD83C\uDFB0'} {opp.gimmickDesc}
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
                }}>{'\u2190'} Back</button>

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

                <div style={{ marginTop: '15px', fontSize: '12px', color: theme.textMuted }}>
                    Luck: {Math.round(selectedOpponent.luck * 100)}% | Cheat: {Math.round(selectedOpponent.cheatChance * 100)}%
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
                                {unlocked ? levelNum : '\uD83D\uDD12'}
                            </button>
                        );
                    })}
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: theme.textMuted }}>
                    Bet Range: {getMinBet(1)} - {getMaxBet(10)} honey
                </div>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px', color: theme.text
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', maxWidth: '500px', marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            background: 'transparent', border: `1px solid ${theme.border}`,
                            color: theme.textSecondary, padding: '5px 10px', borderRadius: '5px', cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >Quit</button>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', color: theme.textMuted }}>Level {currentLevel}</div>
                        <div style={{ fontSize: '18px', color: selectedOpponent.color }}>{selectedOpponent.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>Round</div>
                        <div style={{ fontSize: '18px' }}>{roundsPlayed + 1}/5</div>
                    </div>
                </div>

                {/* Honey display */}
                <div style={{
                    background: theme.bgPanel, padding: '15px 30px', borderRadius: '15px',
                    marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <span style={{ fontSize: '24px' }}>{'\uD83C\uDF6F'}</span>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: theme.gold }}>{honey}</span>
                    <span style={{ color: theme.textMuted }}>honey</span>
                </div>

                {/* Dealer area */}
                <div style={{
                    background: theme.bgPanel, padding: '20px', borderRadius: '15px',
                    width: '100%', maxWidth: '400px', marginBottom: '20px',
                    border: `2px solid ${selectedOpponent.color}40`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '36px' }}>{selectedOpponent.emoji}</span>
                        <div>
                            <div style={{ fontWeight: 'bold', color: selectedOpponent.color }}>The Boss</div>
                            <div style={{ fontSize: '12px', color: theme.textMuted }}>{selectedOpponent.name}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        {dealerDice.map((d, i) => (
                            <Dice key={i} value={d} rolling={isRolling && rollPhase === 'dealer_roll'} />
                        ))}
                    </div>
                    {dealerResult && (
                        <div style={{
                            textAlign: 'center', marginTop: '15px',
                            color: dealerResult.rank > 0 ? selectedOpponent.color : theme.error,
                            fontWeight: 'bold'
                        }}>
                            {dealerResult.name}
                            {cheatDetected && <span style={{ color: theme.error, marginLeft: '10px' }}>(Suspicious!)</span>}
                        </div>
                    )}
                </div>

                {/* VS indicator */}
                <div style={{
                    fontSize: '24px', color: theme.textMuted, marginBottom: '20px',
                    fontWeight: 'bold'
                }}>VS</div>

                {/* Player area */}
                <div style={{
                    background: theme.bgPanel, padding: '20px', borderRadius: '15px',
                    width: '100%', maxWidth: '400px', marginBottom: '20px',
                    border: `2px solid ${theme.accent}40`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '36px' }}>{'\uD83D\uDC3B'}</span>
                        <div>
                            <div style={{ fontWeight: 'bold', color: theme.accent }}>You</div>
                            <div style={{ fontSize: '12px', color: theme.textMuted }}>The Challenger</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        {playerDice.map((d, i) => (
                            <Dice key={i} value={d} rolling={isRolling && rollPhase === 'player_roll'} />
                        ))}
                    </div>
                    {playerResult && (
                        <div style={{
                            textAlign: 'center', marginTop: '15px',
                            color: playerResult.rank > 0 ? theme.success : theme.error,
                            fontWeight: 'bold'
                        }}>
                            {playerResult.name}
                        </div>
                    )}
                </div>

                {/* Message */}
                <div style={{
                    fontSize: '18px', color: theme.textSecondary, marginBottom: '20px',
                    textAlign: 'center', minHeight: '50px', padding: '10px'
                }}>
                    {message}
                </div>

                {/* Betting controls */}
                {rollPhase === 'bet' && (
                    <div style={{
                        background: theme.bgPanel, padding: '20px', borderRadius: '15px',
                        width: '100%', maxWidth: '400px'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ color: theme.textMuted, fontSize: '14px' }}>Your Bet</div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: theme.gold }}>
                                {currentBet} {'\uD83C\uDF6F'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <button
                                onClick={() => adjustBet(-5)}
                                style={{
                                    width: '50px', height: '40px', fontSize: '20px',
                                    background: theme.bgDark, border: `1px solid ${theme.border}`,
                                    borderRadius: '8px', color: theme.text, cursor: 'pointer'
                                }}
                            >-</button>
                            <button
                                onClick={() => adjustBet(-1)}
                                style={{
                                    width: '40px', height: '40px', fontSize: '16px',
                                    background: theme.bgDark, border: `1px solid ${theme.border}`,
                                    borderRadius: '8px', color: theme.text, cursor: 'pointer'
                                }}
                            >-1</button>
                            <button
                                onClick={() => adjustBet(1)}
                                style={{
                                    width: '40px', height: '40px', fontSize: '16px',
                                    background: theme.bgDark, border: `1px solid ${theme.border}`,
                                    borderRadius: '8px', color: theme.text, cursor: 'pointer'
                                }}
                            >+1</button>
                            <button
                                onClick={() => adjustBet(5)}
                                style={{
                                    width: '50px', height: '40px', fontSize: '20px',
                                    background: theme.bgDark, border: `1px solid ${theme.border}`,
                                    borderRadius: '8px', color: theme.text, cursor: 'pointer'
                                }}
                            >+</button>
                        </div>

                        <button
                            onClick={handlePlayerRoll}
                            disabled={isRolling || currentBet > honey}
                            style={{
                                width: '100%', padding: '15px', fontSize: '20px',
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                border: 'none', borderRadius: '10px', color: 'white',
                                cursor: isRolling ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: isRolling ? 0.7 : 1
                            }}
                        >
                            {'\uD83C\uDFB2'} ROLL DICE!
                        </button>
                    </div>
                )}

                {/* Scoring guide */}
                <div style={{
                    marginTop: '20px', padding: '15px', background: theme.bgDark,
                    borderRadius: '10px', fontSize: '12px', color: theme.textMuted,
                    maxWidth: '400px', width: '100%'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', color: theme.textSecondary }}>Scoring:</div>
                    <div>Triple 6: 5x | Any Triple: 3x | 4-5-6: 2x | Pair+Point: 1x</div>
                    <div style={{ color: theme.error }}>1-2-3 (Bust): Lose 2x</div>
                </div>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const won = matchResult === 'win';
        const startingHoney = 50 + currentLevel * 10;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {won ? '\uD83C\uDFC6' : '\uD83D\uDCB8'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: won ? theme.gold : theme.error,
                    marginBottom: '10px'
                }}>
                    {won ? 'VICTORY!' : 'BUSTED!'}
                </h1>
                <p style={{
                    color: selectedOpponent.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '20px'
                }}>
                    {selectedOpponent.emoji} "{won ? selectedOpponent.loseQuote : selectedOpponent.winQuote}"
                </p>

                <div style={{
                    background: theme.bgPanel, padding: '20px', borderRadius: '15px',
                    marginBottom: '30px', textAlign: 'center'
                }}>
                    <div style={{ color: theme.textMuted, marginBottom: '10px' }}>Final Results</div>
                    <div style={{ fontSize: '24px' }}>
                        Rounds Won: <span style={{ color: theme.gold }}>{roundsWon}</span> / 5
                    </div>
                    <div style={{ fontSize: '20px', marginTop: '10px' }}>
                        Honey: <span style={{ color: won ? theme.success : theme.error }}>
                            {honey} {won ? `(+${honey - startingHoney})` : `(-${startingHoney - honey})`}
                        </span>
                    </div>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+2 Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent.id)}/10 {'\u2B50'})
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
