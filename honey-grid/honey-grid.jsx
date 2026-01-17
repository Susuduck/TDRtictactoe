const { useState, useEffect, useCallback, useMemo } = React;

/**
 * HONEY GRID - Voltorb Flip Style Deduction Puzzle
 *
 * Design Principles:
 * - Deduction: Use row/column hints to determine safe tiles
 * - Risk/Reward: Flip tiles to multiply score, but traps end the round
 * - Learning: Each opponent introduces different trap densities and hint styles
 * - Strategic: Mark tiles as safe/trap to help your deduction
 */

const HoneyGrid = () => {
    // Theme - Dark Orchid
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#9932cc', accentBright: '#b050e0',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        honey: '#f4a020', trap: '#e85a50'
    };

    // Opponents with different trap densities and mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Few traps - learn the basics!',
            trapDensity: 0.15, hintClarity: 1.0, maxMultiplier: 2,
            special: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'x3 multipliers appear!',
            trapDensity: 0.18, hintClarity: 1.0, maxMultiplier: 3,
            special: 'none'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'More traps to dodge!',
            trapDensity: 0.22, hintClarity: 1.0, maxMultiplier: 3,
            special: 'none'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'Fuzzy hints - sums shown as ranges',
            trapDensity: 0.20, hintClarity: 0.7, maxMultiplier: 3,
            special: 'fuzzy_hints'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'Some hints are hidden!',
            trapDensity: 0.22, hintClarity: 0.8, maxMultiplier: 3,
            special: 'hidden_hints'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'Traps cluster together!',
            trapDensity: 0.24, hintClarity: 1.0, maxMultiplier: 3,
            special: 'clustered_traps'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'Dense grids with x3 tiles!',
            trapDensity: 0.26, hintClarity: 1.0, maxMultiplier: 3,
            special: 'high_reward'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'Traps form diagonal lines!',
            trapDensity: 0.25, hintClarity: 0.9, maxMultiplier: 3,
            special: 'diagonal_traps'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'Heavy trap density!',
            trapDensity: 0.30, hintClarity: 1.0, maxMultiplier: 3,
            special: 'heavy_traps'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'Master challenge - all mechanics!',
            trapDensity: 0.28, hintClarity: 0.75, maxMultiplier: 3,
            special: 'all'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Board state
    const [grid, setGrid] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [marks, setMarks] = useState([]); // 'none', 'safe', 'trap'
    const [rowHints, setRowHints] = useState([]);
    const [colHints, setColHints] = useState([]);
    const [hiddenHints, setHiddenHints] = useState({ rows: [], cols: [] });

    // Game progress
    const [currentScore, setCurrentScore] = useState(1);
    const [roundResult, setRoundResult] = useState(null); // 'win', 'lose', null
    const [totalMultipliers, setTotalMultipliers] = useState(0);
    const [foundMultipliers, setFoundMultipliers] = useState(0);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('honeygrid_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('honeygrid_progression_v1', JSON.stringify(progression));
    }, [progression]);

    // Helper functions
    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Generate a new grid
    const generateGrid = useCallback((opponent, level) => {
        const size = 5;
        const newGrid = Array(size).fill(null).map(() => Array(size).fill(1));

        const levelMod = 1 + (level - 1) * 0.08;
        const trapCount = Math.floor(size * size * opponent.trapDensity * levelMod);
        const multiplierCount = Math.floor((size * size - trapCount) * 0.4);

        // Place traps based on special patterns
        let trapPositions = [];

        if (opponent.special === 'clustered_traps' || opponent.special === 'all') {
            // Cluster traps together
            const clusterCenters = Math.ceil(trapCount / 3);
            for (let c = 0; c < clusterCenters; c++) {
                const cx = Math.floor(Math.random() * size);
                const cy = Math.floor(Math.random() * size);
                trapPositions.push([cx, cy]);

                // Add adjacent positions
                const neighbors = [
                    [cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]
                ].filter(([x, y]) => x >= 0 && x < size && y >= 0 && y < size);

                for (const [nx, ny] of neighbors) {
                    if (trapPositions.length < trapCount && Math.random() < 0.6) {
                        if (!trapPositions.some(([px, py]) => px === nx && py === ny)) {
                            trapPositions.push([nx, ny]);
                        }
                    }
                }
            }
        } else if (opponent.special === 'diagonal_traps' || opponent.special === 'all') {
            // Diagonal line of traps
            const startX = Math.floor(Math.random() * 3);
            const startY = Math.floor(Math.random() * 3);
            const dir = Math.random() < 0.5 ? 1 : -1;

            for (let i = 0; i < Math.min(trapCount, size); i++) {
                const x = (startX + i) % size;
                const y = (startY + i * dir + size) % size;
                trapPositions.push([x, y]);
            }
        }

        // Fill remaining traps randomly
        while (trapPositions.length < trapCount) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (!trapPositions.some(([px, py]) => px === x && py === y)) {
                trapPositions.push([x, y]);
            }
        }

        // Place traps on grid
        for (const [x, y] of trapPositions) {
            newGrid[y][x] = 0; // TRAP
        }

        // Place multipliers
        let multipliersPlaced = 0;
        const positions = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (newGrid[y][x] !== 0) {
                    positions.push([x, y]);
                }
            }
        }

        // Shuffle positions
        positions.sort(() => Math.random() - 0.5);

        for (const [x, y] of positions) {
            if (multipliersPlaced >= multiplierCount) break;

            const multiplier = opponent.maxMultiplier === 3 && Math.random() < 0.3 ? 3 : 2;
            newGrid[y][x] = multiplier;
            multipliersPlaced++;
        }

        // Calculate hints
        const newRowHints = [];
        const newColHints = [];

        for (let i = 0; i < size; i++) {
            // Row hint
            let rowSum = 0;
            let rowTraps = 0;
            for (let j = 0; j < size; j++) {
                if (newGrid[i][j] === 0) rowTraps++;
                else rowSum += newGrid[i][j];
            }
            newRowHints.push({ sum: rowSum, traps: rowTraps });

            // Column hint
            let colSum = 0;
            let colTraps = 0;
            for (let j = 0; j < size; j++) {
                if (newGrid[j][i] === 0) colTraps++;
                else colSum += newGrid[j][i];
            }
            newColHints.push({ sum: colSum, traps: colTraps });
        }

        // Apply fuzzy hints if needed
        if (opponent.special === 'fuzzy_hints' || opponent.special === 'all') {
            for (let i = 0; i < size; i++) {
                if (Math.random() > opponent.hintClarity) {
                    const fuzz = Math.floor(Math.random() * 3) - 1;
                    newRowHints[i].sum = Math.max(0, newRowHints[i].sum + fuzz);
                    newRowHints[i].fuzzy = true;
                }
                if (Math.random() > opponent.hintClarity) {
                    const fuzz = Math.floor(Math.random() * 3) - 1;
                    newColHints[i].sum = Math.max(0, newColHints[i].sum + fuzz);
                    newColHints[i].fuzzy = true;
                }
            }
        }

        // Determine hidden hints
        const newHiddenHints = { rows: [], cols: [] };
        if (opponent.special === 'hidden_hints' || opponent.special === 'all') {
            for (let i = 0; i < size; i++) {
                if (Math.random() > opponent.hintClarity) {
                    newHiddenHints.rows.push(i);
                }
                if (Math.random() > opponent.hintClarity) {
                    newHiddenHints.cols.push(i);
                }
            }
        }

        // Count total multipliers (x2 and x3 tiles)
        let totalMult = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (newGrid[y][x] > 1) totalMult++;
            }
        }

        return {
            grid: newGrid,
            rowHints: newRowHints,
            colHints: newColHints,
            hiddenHints: newHiddenHints,
            totalMultipliers: totalMult
        };
    }, []);

    // Start a new game
    const startGame = useCallback((opponent, level) => {
        const { grid: newGrid, rowHints: newRowHints, colHints: newColHints, hiddenHints: newHiddenHints, totalMultipliers: totalMult } = generateGrid(opponent, level);

        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setGrid(newGrid);
        setRowHints(newRowHints);
        setColHints(newColHints);
        setHiddenHints(newHiddenHints);
        setRevealed(Array(5).fill(null).map(() => Array(5).fill(false)));
        setMarks(Array(5).fill(null).map(() => Array(5).fill('none')));
        setCurrentScore(1);
        setRoundResult(null);
        setTotalMultipliers(totalMult);
        setFoundMultipliers(0);
        setGameState('playing');
    }, [generateGrid]);

    // Handle tile flip
    const flipTile = useCallback((x, y) => {
        if (revealed[y][x] || roundResult) return;

        const value = grid[y][x];

        // Update revealed
        const newRevealed = revealed.map(row => [...row]);
        newRevealed[y][x] = true;
        setRevealed(newRevealed);

        if (value === 0) {
            // Hit a trap!
            setCurrentScore(0);
            setRoundResult('lose');
        } else {
            // Multiply score
            const newScore = currentScore * value;
            setCurrentScore(newScore);

            if (value > 1) {
                const newFound = foundMultipliers + 1;
                setFoundMultipliers(newFound);

                // Check win condition
                if (newFound >= totalMultipliers) {
                    setRoundResult('win');
                }
            }
        }
    }, [revealed, roundResult, grid, currentScore, foundMultipliers, totalMultipliers]);

    // Handle tile mark (right-click or long press)
    const markTile = useCallback((x, y, e) => {
        e.preventDefault();
        if (revealed[y][x] || roundResult) return;

        const currentMark = marks[y][x];
        const newMark = currentMark === 'none' ? 'safe' : currentMark === 'safe' ? 'trap' : 'none';

        const newMarks = marks.map(row => [...row]);
        newMarks[y][x] = newMark;
        setMarks(newMarks);
    }, [revealed, roundResult, marks]);

    // Cash out early
    const cashOut = useCallback(() => {
        if (roundResult) return;
        setRoundResult('cashout');
    }, [roundResult]);

    // Handle round end
    useEffect(() => {
        if (!roundResult || !selectedOpponent) return;

        let points = 0;
        if (roundResult === 'win') {
            points = 4; // Full win - cleared all multipliers
        } else if (roundResult === 'cashout') {
            // Points based on score achieved
            if (currentScore >= 8) points = 2;
            else if (currentScore >= 4) points = 1;
        }
        // lose = 0 points

        if (points > 0) {
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [roundResult, currentScore, selectedOpponent]);

    // Keyboard handler
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (gameState === 'playing') setGameState('select');
                else if (gameState !== 'menu') setGameState('menu');
            }
            if (e.code === 'Space' && gameState === 'playing' && !roundResult) {
                cashOut();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, roundResult, cashOut]);

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

    // Hint display component
    const HintDisplay = ({ hint, hidden, direction }) => {
        if (hidden) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '2px',
                    width: '50px', height: '50px',
                    background: theme.bgDark, borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{ fontSize: '16px' }}>?</div>
                </div>
            );
        }

        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '2px',
                width: '50px', height: '50px',
                background: hint.traps === 0 ? `${theme.success}33` :
                           hint.traps >= 3 ? `${theme.error}33` : theme.bgDark,
                borderRadius: '8px',
                border: `1px solid ${hint.traps === 0 ? theme.success : theme.border}`
            }}>
                <div style={{
                    fontSize: '16px', fontWeight: 'bold',
                    color: hint.fuzzy ? theme.textMuted : theme.honey
                }}>
                    {hint.fuzzy ? `~${hint.sum}` : hint.sum}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: hint.traps === 0 ? theme.success : theme.trap
                }}>
                    {hint.traps > 0 && Array(hint.traps).fill('!').join('')}
                    {hint.traps === 0 && 'SAFE'}
                </div>
            </div>
        );
    };

    // Tile component
    const Tile = ({ x, y }) => {
        const isRevealed = revealed[y]?.[x];
        const value = grid[y]?.[x];
        const mark = marks[y]?.[x];

        const getTileContent = () => {
            if (!isRevealed) {
                if (mark === 'safe') return { emoji: '?', bg: `${theme.success}44`, border: theme.success };
                if (mark === 'trap') return { emoji: 'X', bg: `${theme.error}44`, border: theme.error };
                return { emoji: '?', bg: theme.bgPanel, border: theme.accent };
            }

            if (value === 0) return { emoji: '!', bg: theme.error, border: theme.error, isHoney: false };
            if (value === 1) return { emoji: 'x1', bg: theme.bgDark, border: theme.border, isHoney: false };
            if (value === 2) return { emoji: 'x2', bg: theme.honey, border: theme.honey, isHoney: true };
            if (value === 3) return { emoji: 'x3', bg: theme.gold, border: theme.gold, isHoney: true };

            return { emoji: '?', bg: theme.bgPanel, border: theme.accent };
        };

        const { emoji, bg, border, isHoney } = getTileContent();

        return (
            <div
                onClick={() => flipTile(x, y)}
                onContextMenu={(e) => markTile(x, y, e)}
                style={{
                    width: '55px', height: '55px',
                    background: bg,
                    border: `2px solid ${border}`,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isRevealed || roundResult ? 'default' : 'pointer',
                    fontSize: isRevealed ? '20px' : '24px',
                    fontWeight: 'bold',
                    color: isHoney ? '#000' : theme.text,
                    transition: 'transform 0.1s, box-shadow 0.1s',
                    boxShadow: isHoney ? `0 0 10px ${border}` : 'none'
                }}
                onMouseEnter={(e) => {
                    if (!isRevealed && !roundResult) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 0 15px ${theme.accent}`;
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = isHoney ? `0 0 10px ${border}` : 'none';
                }}
            >
                {emoji}
            </div>
        );
    };

    // MENU SCREEN
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f3f 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>🍯</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>HONEY GRID</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px', textAlign: 'center' }}>
                    Flip tiles to multiply your score!
                </p>
                <p style={{ color: theme.textMuted, marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>
                    Use hints to avoid traps. Flip all multipliers to win!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 4px 15px ${theme.accent}66`
                    }}
                >
                    PLAY
                </button>

                <div style={{
                    marginTop: '40px', padding: '20px',
                    background: theme.bgPanel, borderRadius: '12px',
                    maxWidth: '400px', textAlign: 'left'
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '15px' }}>How to Play</h3>
                    <ul style={{ color: theme.textSecondary, lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Click tiles to flip them</li>
                        <li><span style={{ color: theme.honey }}>x2</span> and <span style={{ color: theme.gold }}>x3</span> multiply your score</li>
                        <li><span style={{ color: theme.error }}>!</span> traps reset your score to 0</li>
                        <li>Row/column hints show: <span style={{ color: theme.honey }}>sum</span> and <span style={{ color: theme.error }}>trap count</span></li>
                        <li>Right-click to mark tiles</li>
                        <li>Cash out anytime to keep points!</li>
                    </ul>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>Back to Menu</a>
            </div>
        );
    }

    // OPPONENT SELECT SCREEN
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f3f 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Opponent</h2>
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
                                onClick={() => {
                                    if (unlocked) {
                                        setSelectedOpponent(opp);
                                        setGameState('level_select');
                                    }
                                }}
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
                                    }}>MASTERED</div>
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
                                            {opp.mechanic}
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

    // LEVEL SELECT SCREEN
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
                }}>Back</button>

                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '15px', padding: '10px 20px',
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    color: theme.textSecondary
                }}>
                    {selectedOpponent.mechanic}
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
                                onClick={() => unlocked && startGame(selectedOpponent, levelNum)}
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

    // PLAYING SCREEN
    if (gameState === 'playing') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px', color: theme.text
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', maxWidth: '500px', marginBottom: '20px',
                    padding: '15px 20px', background: theme.bgPanel, borderRadius: '12px'
                }}>
                    <div>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Level {currentLevel}</div>
                        <div style={{ color: selectedOpponent.color, fontWeight: 'bold' }}>
                            {selectedOpponent.emoji} {selectedOpponent.name}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Score</div>
                        <div style={{
                            fontSize: '28px', fontWeight: 'bold',
                            color: currentScore > 1 ? theme.gold : theme.text
                        }}>
                            {currentScore}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px' }}>Progress</div>
                        <div style={{ color: theme.success }}>
                            {foundMultipliers}/{totalMultipliers}
                        </div>
                    </div>
                </div>

                {/* Game Grid with Hints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {/* Column hints */}
                    <div style={{ display: 'flex', gap: '5px', marginLeft: '55px' }}>
                        {colHints.map((hint, i) => (
                            <HintDisplay
                                key={i}
                                hint={hint}
                                hidden={hiddenHints.cols.includes(i)}
                                direction="col"
                            />
                        ))}
                    </div>

                    {/* Grid rows with row hints */}
                    {grid.map((row, y) => (
                        <div key={y} style={{ display: 'flex', gap: '5px' }}>
                            <HintDisplay
                                hint={rowHints[y]}
                                hidden={hiddenHints.rows.includes(y)}
                                direction="row"
                            />
                            {row.map((_, x) => (
                                <Tile key={x} x={x} y={y} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Cash Out Button */}
                {!roundResult && currentScore > 1 && (
                    <button
                        onClick={cashOut}
                        style={{
                            marginTop: '20px', padding: '15px 40px',
                            fontSize: '18px', fontWeight: 'bold',
                            background: `linear-gradient(135deg, ${theme.gold}, ${theme.honey})`,
                            border: 'none', borderRadius: '10px',
                            color: '#000', cursor: 'pointer',
                            boxShadow: `0 4px 15px ${theme.gold}66`
                        }}
                    >
                        CASH OUT ({currentScore} pts)
                    </button>
                )}

                {/* Instructions */}
                <div style={{
                    marginTop: '15px', color: theme.textMuted, fontSize: '12px',
                    textAlign: 'center'
                }}>
                    Click to flip | Right-click to mark | SPACE to cash out
                </div>

                {/* Result Overlay */}
                {roundResult && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        zIndex: 100
                    }}>
                        <div style={{
                            fontSize: '80px', marginBottom: '20px'
                        }}>
                            {roundResult === 'win' ? '🏆' : roundResult === 'cashout' ? '💰' : '💥'}
                        </div>
                        <h2 style={{
                            fontSize: '36px', marginBottom: '10px',
                            color: roundResult === 'lose' ? theme.error : theme.gold
                        }}>
                            {roundResult === 'win' ? 'PERFECT CLEAR!' :
                             roundResult === 'cashout' ? 'CASHED OUT!' : 'TRAP HIT!'}
                        </h2>

                        {roundResult !== 'lose' && (
                            <div style={{ fontSize: '48px', color: theme.gold, marginBottom: '20px' }}>
                                +{roundResult === 'win' ? 4 : currentScore >= 8 ? 2 : currentScore >= 4 ? 1 : 0} Points
                            </div>
                        )}

                        {roundResult === 'lose' && (
                            <div style={{ fontSize: '24px', color: theme.error, marginBottom: '20px' }}>
                                Score reset to 0
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button
                                onClick={() => startGame(selectedOpponent, currentLevel)}
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
                )}
            </div>
        );
    }

    return null;
};
