const { useState, useEffect, useCallback, useRef } = React;

/**
 * TREASURE DIG - Hot/Cold Treasure Hunting
 *
 * Design Principles:
 * - Pattern Learning: Grid mechanics become predictable over time
 * - Each opponent introduces NEW grid mechanics (not just harder)
 * - Clear Feedback: Distance-based colors show how close you are
 * - Strategic Depth: Limited digs forces smart choices
 * - Agency: Choose where to dig based on feedback clues
 */

const TreasureDig = () => {
    const theme = {
        bg: '#1a1815', bgPanel: '#2a2820', bgDark: '#151210',
        border: '#4a4438', borderLight: '#5a5448',
        text: '#ffffff', textSecondary: '#c8c0a8', textMuted: '#908870',
        accent: '#daa520', accentBright: '#f4c542',
        gold: '#f4c542', goldGlow: 'rgba(218, 165, 32, 0.4)',
        error: '#e85a50', success: '#50c878',
        hot: '#ff4444', warm: '#ff8844', cool: '#4488ff', cold: '#4444ff', frozen: '#8888ff'
    };

    // Distance-based color feedback
    const getDistanceColor = (distance, maxDistance) => {
        const ratio = distance / maxDistance;
        if (ratio < 0.1) return { color: theme.hot, label: 'BURNING HOT!', emoji: '🔥' };
        if (ratio < 0.25) return { color: '#ff6644', label: 'Very Hot!', emoji: '🌡️' };
        if (ratio < 0.4) return { color: theme.warm, label: 'Warm', emoji: '☀️' };
        if (ratio < 0.55) return { color: '#ccaa44', label: 'Lukewarm', emoji: '🌤️' };
        if (ratio < 0.7) return { color: theme.cool, label: 'Cool', emoji: '❄️' };
        if (ratio < 0.85) return { color: theme.cold, label: 'Cold', emoji: '🧊' };
        return { color: theme.frozen, label: 'Freezing!', emoji: '🥶' };
    };

    // Each opponent introduces unique grid mechanics
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Groovy Beginner',
            mechanic: 'Basic treasure hunt - learn the hot/cold system',
            gridSize: 7, digs: 15, treasures: 1, decoys: 0,
            special: 'none'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            mechanic: 'BONUS GEMS - some tiles have extra points!',
            gridSize: 8, digs: 14, treasures: 1, decoys: 0,
            special: 'gems'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            mechanic: 'TWO TREASURES - find both to win!',
            gridSize: 9, digs: 18, treasures: 2, decoys: 0,
            special: 'multi_treasure'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            mechanic: 'DECOY CHESTS - some treasures are fake!',
            gridSize: 9, digs: 16, treasures: 1, decoys: 2,
            special: 'decoys'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            mechanic: 'SONAR PULSE - reveals nearby tiles briefly!',
            gridSize: 10, digs: 14, treasures: 1, decoys: 1,
            special: 'sonar'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            mechanic: 'FOG OF WAR - only see recently dug areas!',
            gridSize: 10, digs: 16, treasures: 2, decoys: 1,
            special: 'fog'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            mechanic: 'FROZEN TILES - some tiles cost 2 digs!',
            gridSize: 11, digs: 18, treasures: 2, decoys: 2,
            special: 'frozen'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            mechanic: 'MOVING TREASURE - it shifts every 3 digs!',
            gridSize: 12, digs: 20, treasures: 1, decoys: 2,
            special: 'moving'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            mechanic: 'BURIED DEEP - treasure needs 2 digs to uncover!',
            gridSize: 13, digs: 22, treasures: 2, decoys: 2,
            special: 'deep'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            mechanic: 'ALL MECHANICS combined!',
            gridSize: 15, digs: 25, treasures: 3, decoys: 3,
            special: 'all'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [grid, setGrid] = useState([]);
    const [treasurePositions, setTreasurePositions] = useState([]);
    const [decoyPositions, setDecoyPositions] = useState([]);
    const [gemPositions, setGemPositions] = useState([]);
    const [frozenTiles, setFrozenTiles] = useState([]);
    const [dugTiles, setDugTiles] = useState([]);
    const [digsRemaining, setDigsRemaining] = useState(0);
    const [score, setScore] = useState(0);
    const [treasuresFound, setTreasuresFound] = useState(0);
    const [lastDigResult, setLastDigResult] = useState(null);
    const [moveCounter, setMoveCounter] = useState(0);
    const [sonarActive, setSonarActive] = useState(false);
    const [sonarTiles, setSonarTiles] = useState([]);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [hitEffects, setHitEffects] = useState([]);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('treasuredig_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('treasuredig_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Calculate distance between two grid positions
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Get minimum distance to any treasure
    const getMinTreasureDistance = useCallback((x, y, positions) => {
        if (positions.length === 0) return Infinity;
        return Math.min(...positions.map(t => getDistance(x, y, t.x, t.y)));
    }, []);

    // Generate random position
    const getRandomPosition = (size, excludePositions = []) => {
        let x, y, attempts = 0;
        do {
            x = Math.floor(Math.random() * size);
            y = Math.floor(Math.random() * size);
            attempts++;
        } while (
            attempts < 100 &&
            excludePositions.some(p => p.x === x && p.y === y)
        );
        return { x, y };
    };

    // Initialize game grid
    const initializeGrid = useCallback((opp, level) => {
        const levelMod = 1 + (level - 1) * 0.1;
        const size = Math.min(15, Math.floor(opp.gridSize * (1 + (level - 1) * 0.05)));
        const maxDist = Math.sqrt(2) * size;

        // Place treasures
        const treasures = [];
        const treasureCount = opp.special === 'all' ? opp.treasures : opp.treasures;
        for (let i = 0; i < treasureCount; i++) {
            treasures.push(getRandomPosition(size, treasures));
        }
        setTreasurePositions(treasures);

        // Place decoys
        const decoys = [];
        const decoyCount = (opp.special === 'decoys' || opp.special === 'all') ? opp.decoys + Math.floor(level / 3) : 0;
        for (let i = 0; i < decoyCount; i++) {
            decoys.push(getRandomPosition(size, [...treasures, ...decoys]));
        }
        setDecoyPositions(decoys);

        // Place gems
        const gems = [];
        if (opp.special === 'gems' || opp.special === 'all') {
            const gemCount = 3 + Math.floor(level / 2);
            for (let i = 0; i < gemCount; i++) {
                gems.push({
                    ...getRandomPosition(size, [...treasures, ...decoys, ...gems]),
                    value: [10, 25, 50][Math.floor(Math.random() * 3)]
                });
            }
        }
        setGemPositions(gems);

        // Place frozen tiles
        const frozen = [];
        if (opp.special === 'frozen' || opp.special === 'all') {
            const frozenCount = Math.floor(size * size * 0.15);
            for (let i = 0; i < frozenCount; i++) {
                frozen.push(getRandomPosition(size, [...treasures, ...frozen]));
            }
        }
        setFrozenTiles(frozen);

        // Initialize grid data
        const newGrid = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                row.push({
                    x, y,
                    dug: false,
                    depth: (opp.special === 'deep' || opp.special === 'all') ? 2 : 1,
                    distanceColor: null
                });
            }
            newGrid.push(row);
        }
        setGrid(newGrid);

        // Set digs based on level
        const baseDigs = opp.digs - Math.floor(level * 0.5);
        setDigsRemaining(Math.max(8, baseDigs));

        // Reset other state
        setDugTiles([]);
        setScore(0);
        setTreasuresFound(0);
        setLastDigResult(null);
        setMoveCounter(0);
        setSonarActive(false);
        setSonarTiles([]);
        setRevealedTiles([]);
        setHitEffects([]);

        return { size, maxDist, treasures };
    }, []);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        initializeGrid(opponent, level);
        setGameState('playing');
    }, [initializeGrid]);

    // Move treasure (for moving mechanic)
    const moveTreasure = useCallback(() => {
        if (!selectedOpponent) return;
        const opp = selectedOpponent;
        if (opp.special !== 'moving' && opp.special !== 'all') return;

        setTreasurePositions(current => {
            return current.map(t => {
                const directions = [
                    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
                ];
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const newX = Math.max(0, Math.min(grid.length - 1, t.x + dir.dx));
                const newY = Math.max(0, Math.min(grid.length - 1, t.y + dir.dy));

                // Don't move to dug tile
                if (dugTiles.some(d => d.x === newX && d.y === newY)) {
                    return t;
                }

                return { x: newX, y: newY };
            });
        });
    }, [selectedOpponent, grid, dugTiles]);

    // Activate sonar
    const activateSonar = useCallback((x, y) => {
        const radius = 2;
        const tiles = [];
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid.length) {
                    tiles.push({ x: nx, y: ny });
                }
            }
        }
        setSonarTiles(tiles);
        setSonarActive(true);
        setTimeout(() => {
            setSonarActive(false);
            setSonarTiles([]);
        }, 1500);
    }, [grid]);

    // Add visual effect
    const addHitEffect = (x, y, text, type) => {
        const id = Date.now() + Math.random();
        setHitEffects(e => [...e, { id, x, y, text, type }]);
        setTimeout(() => {
            setHitEffects(e => e.filter(ef => ef.id !== id));
        }, 800);
    };

    // Handle tile click
    const handleDig = useCallback((x, y) => {
        if (gameState !== 'playing' || digsRemaining <= 0) return;

        const opp = selectedOpponent;
        const tile = grid[y]?.[x];
        if (!tile) return;

        // Check if already fully dug
        if (tile.dug && tile.depth <= 0) return;

        // Check frozen tile cost
        const isFrozen = frozenTiles.some(f => f.x === x && f.y === y);
        const digCost = isFrozen && !tile.dug ? 2 : 1;

        if (digsRemaining < digCost) return;

        // Deduct digs
        setDigsRemaining(d => d - digCost);
        setMoveCounter(m => {
            const newCount = m + 1;
            // Move treasure every 3 digs
            if (newCount % 3 === 0 && (opp.special === 'moving' || opp.special === 'all')) {
                moveTreasure();
            }
            return newCount;
        });

        // Handle deep digging
        const newDepth = tile.depth - 1;
        if (newDepth > 0 && (opp.special === 'deep' || opp.special === 'all')) {
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...tile, depth: newDepth };
                return newGrid;
            });
            addHitEffect(x, y, 'DIG DEEPER!', 'info');
            return;
        }

        // Mark as dug
        setDugTiles(d => [...d, { x, y }]);
        setRevealedTiles(r => [...r, { x, y, time: Date.now() }]);

        // Calculate distance to nearest treasure
        const maxDist = Math.sqrt(2) * grid.length;
        const distance = getMinTreasureDistance(x, y, treasurePositions);
        const feedback = getDistanceColor(distance, maxDist);

        // Update grid
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = {
                ...tile,
                dug: true,
                depth: 0,
                distanceColor: feedback.color
            };
            return newGrid;
        });

        setLastDigResult({ x, y, ...feedback });

        // Check for treasure
        const foundTreasure = treasurePositions.find(t => t.x === x && t.y === y);
        if (foundTreasure) {
            setTreasuresFound(f => f + 1);
            setScore(s => s + 100);
            addHitEffect(x, y, '+100 TREASURE!', 'treasure');
            setTreasurePositions(t => t.filter(pos => !(pos.x === x && pos.y === y)));

            // Check win condition
            if (treasurePositions.length <= 1) {
                setTimeout(() => setGameState('result'), 500);
            }
            return;
        }

        // Check for decoy
        const foundDecoy = decoyPositions.find(d => d.x === x && d.y === y);
        if (foundDecoy) {
            setScore(s => Math.max(0, s - 25));
            addHitEffect(x, y, '-25 DECOY!', 'decoy');
            setDecoyPositions(d => d.filter(pos => !(pos.x === x && pos.y === y)));
            return;
        }

        // Check for gem
        const foundGem = gemPositions.find(g => g.x === x && g.y === y);
        if (foundGem) {
            setScore(s => s + foundGem.value);
            addHitEffect(x, y, `+${foundGem.value}`, 'gem');
            setGemPositions(g => g.filter(pos => !(pos.x === x && pos.y === y)));
            return;
        }

        // Activate sonar on dig
        if ((opp.special === 'sonar' || opp.special === 'all') && moveCounter % 5 === 0) {
            activateSonar(x, y);
        }

        // Regular dig feedback
        addHitEffect(x, y, feedback.emoji, 'dig');

        // Check lose condition
        if (digsRemaining - digCost <= 0 && treasurePositions.length > 0) {
            setTimeout(() => setGameState('result'), 500);
        }
    }, [gameState, digsRemaining, selectedOpponent, grid, treasurePositions, decoyPositions,
        gemPositions, frozenTiles, moveCounter, moveTreasure, activateSonar, getMinTreasureDistance]);

    // Fog of war - fade old reveals
    useEffect(() => {
        if (!selectedOpponent) return;
        if (selectedOpponent.special !== 'fog' && selectedOpponent.special !== 'all') return;

        const interval = setInterval(() => {
            const now = Date.now();
            setRevealedTiles(tiles => tiles.filter(t => now - t.time < 10000));
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedOpponent]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = treasurePositions.length === 0;
        if (won) {
            // Calculate bonus based on remaining digs
            const digBonus = digsRemaining * 5;
            setScore(s => s + digBonus);

            const totalScore = score + digBonus;
            const targetScore = 50 + currentLevel * 20 + selectedOpponent.id * 30;
            const percentage = totalScore / targetScore;
            const points = percentage >= 1.5 ? 2 : 1;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, treasurePositions, score, digsRemaining, currentLevel, selectedOpponent]);

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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2a2515 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>💎</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>TREASURE DIG</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>Find the treasure using hot/cold clues!</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: '#1a1815',
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
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2a2515 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Expedition</h2>
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
                                            💎 {opp.mechanic}
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
                    💎 {selectedOpponent.mechanic}
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
    if (gameState === 'playing' && grid.length > 0) {
        const opp = selectedOpponent;
        const gridSize = grid.length;
        const tileSize = Math.min(40, Math.floor(500 / gridSize));
        const hasFog = opp.special === 'fog' || opp.special === 'all';

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp.color}15 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '20px', color: theme.text, userSelect: 'none'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '15px', padding: '10px 20px',
                    background: theme.bgPanel, borderRadius: '10px',
                    flexWrap: 'wrap', gap: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div>⛏️ <span style={{ color: digsRemaining <= 3 ? theme.error : theme.accent, fontWeight: 'bold' }}>{digsRemaining}</span> digs</div>
                        <div>💎 <span style={{ color: theme.gold, fontWeight: 'bold' }}>{score}</span></div>
                        <div>🎯 <span style={{ color: theme.success }}>{treasuresFound}</span>/{opp.treasures + treasuresFound} found</div>
                    </div>
                    <div style={{ color: opp.color }}>
                        {opp.emoji} {opp.name} - Level {currentLevel}
                    </div>
                    <button
                        onClick={() => setGameState('select')}
                        style={{
                            background: 'transparent', border: `1px solid ${theme.border}`,
                            color: theme.textMuted, padding: '5px 10px', borderRadius: '5px',
                            cursor: 'pointer', fontSize: '12px'
                        }}
                    >ESC</button>
                </div>

                {/* Last dig feedback */}
                {lastDigResult && (
                    <div style={{
                        textAlign: 'center', marginBottom: '10px',
                        padding: '8px 20px', borderRadius: '8px',
                        background: `${lastDigResult.color}33`,
                        border: `2px solid ${lastDigResult.color}`,
                        color: lastDigResult.color,
                        fontSize: '18px', fontWeight: 'bold'
                    }}>
                        {lastDigResult.emoji} {lastDigResult.label}
                    </div>
                )}

                {/* Game grid */}
                <div style={{
                    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
                        gap: '2px',
                        background: theme.bgDark,
                        padding: '10px',
                        borderRadius: '10px',
                        position: 'relative'
                    }}>
                        {grid.map((row, y) =>
                            row.map((tile, x) => {
                                const isDug = tile.dug;
                                const isFrozen = frozenTiles.some(f => f.x === x && f.y === y);
                                const isSonarRevealed = sonarActive && sonarTiles.some(s => s.x === x && s.y === y);
                                const isRecentlyRevealed = revealedTiles.some(r => r.x === x && r.y === y);

                                // Fog of war visibility
                                const fogVisible = !hasFog || isDug || isRecentlyRevealed || isSonarRevealed;
                                const fogOpacity = hasFog && !isDug && !isRecentlyRevealed ? 0.3 : 1;

                                // Sonar treasure hint
                                const sonarTreasureNear = isSonarRevealed && treasurePositions.some(t =>
                                    Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1
                                );

                                // Deep dig indicator
                                const needsMoreDig = tile.depth > 0 && tile.depth < ((opp.special === 'deep' || opp.special === 'all') ? 2 : 1);

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        onClick={() => handleDig(x, y)}
                                        style={{
                                            width: tileSize,
                                            height: tileSize,
                                            background: isDug
                                                ? (tile.distanceColor || theme.bgPanel)
                                                : isFrozen
                                                    ? '#aaddff'
                                                    : sonarTreasureNear
                                                        ? `${theme.gold}88`
                                                        : '#8B7355',
                                            border: `2px solid ${isDug ? tile.distanceColor || theme.border : isFrozen ? '#88bbdd' : '#6B5344'}`,
                                            borderRadius: '4px',
                                            cursor: isDug && tile.depth <= 0 ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: tileSize * 0.5,
                                            transition: 'all 0.2s',
                                            opacity: fogOpacity,
                                            boxShadow: isSonarRevealed ? `0 0 10px ${theme.accent}` : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDug || tile.depth > 0) {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.zIndex = '10';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.zIndex = '1';
                                        }}
                                    >
                                        {isDug && !needsMoreDig && '⬛'}
                                        {needsMoreDig && '🕳️'}
                                        {!isDug && isFrozen && '❄️'}
                                    </div>
                                );
                            })
                        )}

                        {/* Hit effects */}
                        {hitEffects.map(e => {
                            const effectX = e.x * (tileSize + 2) + tileSize / 2;
                            const effectY = e.y * (tileSize + 2) + tileSize / 2;
                            return (
                                <div
                                    key={e.id}
                                    style={{
                                        position: 'absolute',
                                        left: effectX + 10,
                                        top: effectY + 10,
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: e.type === 'treasure' ? '24px' : '16px',
                                        fontWeight: 'bold',
                                        color: e.type === 'treasure' ? theme.gold
                                            : e.type === 'decoy' ? theme.error
                                            : e.type === 'gem' ? '#44ff88'
                                            : theme.text,
                                        pointerEvents: 'none',
                                        animation: 'floatUp 0.8s ease-out forwards',
                                        zIndex: 100,
                                        textShadow: '0 0 5px black'
                                    }}
                                >
                                    {e.text}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div style={{
                    marginTop: '15px', textAlign: 'center',
                    color: theme.textMuted, fontSize: '13px',
                    display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'
                }}>
                    <span>🔥 Hot = Close</span>
                    <span>🥶 Cold = Far</span>
                    {(opp.special === 'frozen' || opp.special === 'all') && <span>❄️ Frozen = 2 digs</span>}
                    {(opp.special === 'decoys' || opp.special === 'all') && <span>💀 Beware decoys!</span>}
                    {(opp.special === 'moving' || opp.special === 'all') && <span>🏃 Treasure moves every 3 digs!</span>}
                </div>

                <style>{`
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -150%) scale(1.3); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Result
    if (gameState === 'result') {
        const won = treasurePositions.length === 0;
        const digBonus = won ? digsRemaining * 5 : 0;
        const finalScore = score + digBonus;
        const targetScore = 50 + currentLevel * 20 + selectedOpponent.id * 30;
        const percentage = finalScore / targetScore;
        const excellent = percentage >= 1.5;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {won ? (excellent ? '👑' : '💎') : '💀'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px'
                }}>
                    {excellent ? 'TREASURE MASTER!' : won ? 'TREASURE FOUND!' : 'OUT OF DIGS!'}
                </h1>

                <div style={{ fontSize: '36px', marginBottom: '10px', color: theme.gold }}>
                    Score: {finalScore}
                </div>

                <div style={{
                    display: 'flex', gap: '30px', marginBottom: '20px',
                    color: theme.textSecondary, flexWrap: 'wrap', justifyContent: 'center'
                }}>
                    <div>Treasures Found: <span style={{ color: theme.success }}>{treasuresFound}</span></div>
                    <div>Digs Remaining: <span style={{ color: theme.accent }}>{digsRemaining}</span></div>
                    {won && <div>Dig Bonus: <span style={{ color: theme.gold }}>+{digBonus}</span></div>}
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent.id)}/10 stars)
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '15px 30px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '10px', color: '#1a1815',
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
