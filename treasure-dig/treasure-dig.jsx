const { useState, useEffect, useCallback, useRef, useMemo } = React;

/**
 * TREASURE DIG - Professional Hot/Cold Treasure Hunting
 *
 * Design Principles Applied:
 * - Pattern Learning (Koster): Distance numbers enable triangulation/deduction
 * - Flow State (Csikszentmihalyi): Balanced challenge, clear feedback, sense of control
 * - Four Keys (Lazzaro): Hard Fun (fiero), Easy Fun (exploration), Serious Fun (progression)
 * - Agency (SDT): Tools, meaningful choices, skill-based gameplay
 * - Essential Experience: The "aha!" moment of deductive treasure finding
 */

const TreasureDig = () => {
    const theme = {
        bg: '#1a1815', bgPanel: '#2a2820', bgDark: '#151210',
        border: '#4a4438', borderLight: '#5a5448',
        text: '#ffffff', textSecondary: '#c8c0a8', textMuted: '#908870',
        accent: '#daa520', accentBright: '#f4c542',
        gold: '#f4c542', goldGlow: 'rgba(218, 165, 32, 0.4)',
        error: '#e85a50', success: '#50c878',
        hot: '#ff2222', warm: '#ff8844', lukewarm: '#ddaa44',
        cool: '#44aadd', cold: '#4466ff', frozen: '#8888ff',
        treasure: '#ffd700', gem: '#44ffaa', decoy: '#ff4488'
    };

    // Enhanced distance feedback with clear visual language
    const getDistanceInfo = (distance, gridSize) => {
        const maxDist = Math.sqrt(2) * gridSize;
        const ratio = distance / maxDist;

        if (distance === 0) return { color: theme.treasure, label: 'TREASURE!', emoji: '💎', tier: 0 };
        if (distance <= 1.5) return { color: '#ff0000', label: 'BURNING!', emoji: '🔥', tier: 1 };
        if (distance <= 2.5) return { color: '#ff4400', label: 'Very Hot', emoji: '🌡️', tier: 2 };
        if (distance <= 3.5) return { color: '#ff8800', label: 'Hot', emoji: '☀️', tier: 3 };
        if (distance <= 5) return { color: '#ddaa00', label: 'Warm', emoji: '🌤️', tier: 4 };
        if (distance <= 7) return { color: '#88bb44', label: 'Lukewarm', emoji: '🌿', tier: 5 };
        if (distance <= 9) return { color: '#44aadd', label: 'Cool', emoji: '❄️', tier: 6 };
        if (distance <= 12) return { color: '#4466ff', label: 'Cold', emoji: '🧊', tier: 7 };
        return { color: '#6644ff', label: 'Freezing', emoji: '🥶', tier: 8 };
    };

    // Opponents with progressive mechanics - each teaches new patterns
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Guide',
            mechanic: 'Learn triangulation basics - distance numbers show exactly how far!',
            description: 'Perfect for learning! Distance numbers let you pinpoint treasures with logic.',
            gridSize: 6, baseDigs: 12, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: [], tutorial: true
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Gem Collector',
            mechanic: 'Bonus gems scattered around - collect them for extra points and tools!',
            description: 'Gems give bonus points and sometimes extra digs. Worth seeking out!',
            gridSize: 7, baseDigs: 14, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: ['gems']
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Dual Digger',
            mechanic: 'Two treasures to find! Distance shows nearest treasure.',
            description: 'Multiple treasures require strategic digging. Find them all!',
            gridSize: 8, baseDigs: 16, treasures: 2, decoys: 0,
            tools: { radar: 2, flag: 6, xray: 1 },
            special: ['multi']
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trickster',
            mechanic: 'Decoy chests look like treasure but waste your digs!',
            description: 'Decoys show distance 0 but give no points. Use X-Ray to verify!',
            gridSize: 8, baseDigs: 15, treasures: 1, decoys: 2,
            tools: { radar: 1, flag: 6, xray: 2 },
            special: ['decoys']
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Scanner',
            mechanic: 'Sonar reveals distance hints for nearby tiles!',
            description: 'Strategic sonar use can reveal treasure locations efficiently.',
            gridSize: 9, baseDigs: 14, treasures: 1, decoys: 1,
            tools: { radar: 2, flag: 6, xray: 1, sonar: 2 },
            special: ['sonar', 'decoys']
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Shadow Seeker',
            mechanic: 'Fog covers the grid - only recently dug tiles stay visible!',
            description: 'Memory and marking are crucial. Flag tiles before fog hides them!',
            gridSize: 9, baseDigs: 16, treasures: 2, decoys: 1,
            tools: { radar: 2, flag: 10, xray: 2, lantern: 2 },
            special: ['fog', 'decoys']
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Ice Scholar',
            mechanic: 'Frozen tiles cost 2 digs to break through!',
            description: 'Plan around frozen tiles. Sometimes going around is better than through.',
            gridSize: 10, baseDigs: 18, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, pickaxe: 2 },
            special: ['frozen', 'decoys', 'gems']
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Shifty One',
            mechanic: 'Treasure moves every 4 digs! Track its movement pattern.',
            description: 'Moving treasure follows patterns. Predict where it will be!',
            gridSize: 10, baseDigs: 18, treasures: 1, decoys: 2,
            tools: { radar: 3, flag: 8, xray: 2, tracker: 1 },
            special: ['moving', 'decoys']
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Deep Digger',
            mechanic: 'Some treasures are buried deep - need 2 digs to uncover!',
            description: 'Deep treasures require commitment. Choose dig locations wisely.',
            gridSize: 11, baseDigs: 20, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems']
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Challenge',
            mechanic: 'All mechanics combined! Master everything you have learned.',
            description: 'The final test. Every skill, every tool, every strategy matters.',
            gridSize: 12, baseDigs: 22, treasures: 3, decoys: 3,
            tools: { radar: 3, flag: 12, xray: 3, sonar: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems', 'frozen', 'moving']
        }
    ];

    // Level configurations - hand-crafted difficulty curve
    const getLevelConfig = (opponent, level) => {
        const baseConfig = {
            gridSize: opponent.gridSize + Math.floor((level - 1) / 3),
            digs: opponent.baseDigs - Math.floor((level - 1) * 0.4),
            treasures: opponent.treasures + (level >= 7 ? 1 : 0),
            decoys: opponent.decoys + Math.floor((level - 1) / 4),
            parDigs: Math.floor((opponent.baseDigs - Math.floor((level - 1) * 0.4)) * 0.7),
            bonusObjective: null
        };

        // Ensure minimum digs for solvability
        const minDigs = baseConfig.treasures * 4 + 3;
        baseConfig.digs = Math.max(minDigs, baseConfig.digs);

        // Level-specific bonus objectives
        if (level === 3) baseConfig.bonusObjective = { type: 'efficiency', target: 5, desc: 'Find treasure with 5+ digs remaining' };
        if (level === 5) baseConfig.bonusObjective = { type: 'noDecoy', desc: 'Avoid all decoys' };
        if (level === 7) baseConfig.bonusObjective = { type: 'streak', target: 3, desc: 'Get 3 hot digs in a row' };
        if (level === 10) baseConfig.bonusObjective = { type: 'perfect', desc: 'Complete under par with no decoys hit' };

        return baseConfig;
    };

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // Grid state
    const [grid, setGrid] = useState([]);
    const [gridSize, setGridSize] = useState(6);
    const [treasurePositions, setTreasurePositions] = useState([]);
    const [decoyPositions, setDecoyPositions] = useState([]);
    const [gemPositions, setGemPositions] = useState([]);
    const [frozenTiles, setFrozenTiles] = useState([]);
    const [deepTiles, setDeepTiles] = useState([]);

    // Player state
    const [dugTiles, setDugTiles] = useState([]);
    const [flaggedTiles, setFlaggedTiles] = useState([]);
    const [digsRemaining, setDigsRemaining] = useState(0);
    const [score, setScore] = useState(0);
    const [treasuresFound, setTreasuresFound] = useState(0);
    const [decoysHit, setDecoysHit] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);

    // Tools
    const [tools, setTools] = useState({});
    const [activeTool, setActiveTool] = useState(null);
    const [sonarTiles, setSonarTiles] = useState([]);

    // Visual effects
    const [lastDigResult, setLastDigResult] = useState(null);
    const [hitEffects, setHitEffects] = useState([]);
    const [screenShake, setScreenShake] = useState(false);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [hintTile, setHintTile] = useState(null);

    // Level config
    const [levelConfig, setLevelConfig] = useState(null);

    // Progression with enhanced tracking
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('treasuredig_progression_v2');
        if (saved) return JSON.parse(saved);
        return {
            starPoints: Array(10).fill(0),
            levelsBeat: Array(10).fill().map(() => Array(10).fill(false)),
            bestScores: Array(10).fill().map(() => Array(10).fill(0)),
            achievements: [],
            totalTreasures: 0,
            totalGames: 0,
            hintsUsed: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('treasuredig_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 20;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;
    const isLevelUnlocked = (oppIdx, level) => {
        if (level === 1) return true;
        return progression.levelsBeat[oppIdx]?.[level - 2] || false;
    };

    // Calculate Euclidean distance
    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Get minimum distance to any unfound treasure
    const getMinTreasureDistance = useCallback((x, y, positions) => {
        if (!positions || positions.length === 0) return Infinity;
        return Math.min(...positions.map(t => getDistance(x, y, t.x, t.y)));
    }, []);

    // Get minimum distance to any decoy
    const getMinDecoyDistance = useCallback((x, y, positions) => {
        if (!positions || positions.length === 0) return Infinity;
        return Math.min(...positions.map(d => getDistance(x, y, d.x, d.y)));
    }, []);

    // Smart treasure placement - ensures solvability
    const placeItemsSmart = (size, count, excludePositions = [], minDistance = 2) => {
        const items = [];
        let attempts = 0;
        const maxAttempts = 1000;

        while (items.length < count && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            // Check not on excluded positions
            const onExcluded = excludePositions.some(p => p.x === x && p.y === y);

            // Check minimum distance from other items
            const tooClose = items.some(p => getDistance(x, y, p.x, p.y) < minDistance);

            // Avoid edges for treasures (makes triangulation more interesting)
            const onEdge = x === 0 || y === 0 || x === size - 1 || y === size - 1;

            if (!onExcluded && !tooClose && !onEdge) {
                items.push({ x, y });
            }
            attempts++;
        }

        // Fallback if smart placement fails
        while (items.length < count) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (!excludePositions.some(p => p.x === x && p.y === y) &&
                !items.some(p => p.x === x && p.y === y)) {
                items.push({ x, y });
            }
        }

        return items;
    };

    // Initialize game grid with smart placement
    const initializeGrid = useCallback((opp, level) => {
        const config = getLevelConfig(opp, level);
        setLevelConfig(config);

        const size = Math.min(14, config.gridSize);
        setGridSize(size);

        // Place treasures with smart spacing
        const treasures = placeItemsSmart(size, config.treasures, [], 3);
        setTreasurePositions(treasures);

        // Place decoys away from treasures
        const decoys = opp.special.includes('decoys')
            ? placeItemsSmart(size, config.decoys, treasures, 2)
            : [];
        setDecoyPositions(decoys);

        // Place gems
        const gems = opp.special.includes('gems')
            ? placeItemsSmart(size, 4 + Math.floor(level / 2), [...treasures, ...decoys], 1)
                .map(g => ({ ...g, value: [15, 25, 50][Math.floor(Math.random() * 3)], type: Math.random() > 0.7 ? 'dig' : 'points' }))
            : [];
        setGemPositions(gems);

        // Place frozen tiles
        const frozen = opp.special.includes('frozen')
            ? placeItemsSmart(size, Math.floor(size * size * 0.12), [...treasures], 0)
            : [];
        setFrozenTiles(frozen);

        // Mark deep tiles
        const deep = opp.special.includes('deep')
            ? treasures.map(t => ({ ...t }))
            : [];
        setDeepTiles(deep);

        // Initialize grid data
        const newGrid = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const isDeep = deep.some(d => d.x === x && d.y === y);
                row.push({
                    x, y,
                    dug: false,
                    dugDepth: 0,
                    requiredDepth: isDeep ? 2 : 1,
                    distance: null,
                    distanceInfo: null,
                    flagged: false,
                    revealed: false
                });
            }
            newGrid.push(row);
        }
        setGrid(newGrid);

        // Set digs
        setDigsRemaining(config.digs);

        // Set tools
        const toolCounts = { ...opp.tools };
        // Add level bonuses
        if (level >= 5) toolCounts.radar = (toolCounts.radar || 0) + 1;
        if (level >= 8) toolCounts.xray = (toolCounts.xray || 0) + 1;
        setTools(toolCounts);
        setActiveTool(null);

        // Reset state
        setDugTiles([]);
        setFlaggedTiles([]);
        setScore(0);
        setTreasuresFound(0);
        setDecoysHit(0);
        setCombo(0);
        setMaxCombo(0);
        setMoveHistory([]);
        setLastDigResult(null);
        setHitEffects([]);
        setSonarTiles([]);
        setRevealedTiles(treasures.map(t => ({ ...t, time: Date.now() })));
        setShowHint(false);
        setHintTile(null);

        return { size, treasures, config };
    }, []);

    // Start a match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        initializeGrid(opponent, level);

        // Show tutorial for first opponent, first level
        if (opponent.tutorial && level === 1 && !progression.levelsBeat[0][0]) {
            setShowTutorial(true);
            setTutorialStep(0);
        }

        setGameState('playing');
    }, [initializeGrid, progression.levelsBeat]);

    // Move treasure (for moving mechanic)
    const moveTreasure = useCallback(() => {
        if (!selectedOpponent?.special.includes('moving')) return;

        setTreasurePositions(current => {
            return current.map(t => {
                // Move in a semi-predictable pattern
                const directions = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                    { dx: 1, dy: 1 }, { dx: -1, dy: -1 }
                ];

                // Prefer moving away from dug tiles
                const dugNearby = dugTiles.filter(d => getDistance(t.x, t.y, d.x, d.y) <= 2);
                let bestDir = directions[Math.floor(Math.random() * directions.length)];

                if (dugNearby.length > 0) {
                    // Move away from dug tiles
                    const avgX = dugNearby.reduce((sum, d) => sum + d.x, 0) / dugNearby.length;
                    const avgY = dugNearby.reduce((sum, d) => sum + d.y, 0) / dugNearby.length;
                    bestDir = {
                        dx: t.x > avgX ? 1 : -1,
                        dy: t.y > avgY ? 1 : -1
                    };
                }

                const newX = Math.max(1, Math.min(gridSize - 2, t.x + bestDir.dx));
                const newY = Math.max(1, Math.min(gridSize - 2, t.y + bestDir.dy));

                // Don't move to dug tile
                if (dugTiles.some(d => d.x === newX && d.y === newY)) {
                    return t;
                }

                return { x: newX, y: newY };
            });
        });

        // Visual feedback
        addHitEffect(gridSize / 2, 0, '🏃 Treasure moved!', 'info');
    }, [selectedOpponent, gridSize, dugTiles]);

    // Add visual effect
    const addHitEffect = useCallback((x, y, text, type) => {
        const id = Date.now() + Math.random();
        setHitEffects(e => [...e, { id, x, y, text, type }]);
        setTimeout(() => {
            setHitEffects(e => e.filter(ef => ef.id !== id));
        }, 1200);
    }, []);

    // Trigger screen shake
    const triggerShake = useCallback((intensity = 1) => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 150 * intensity);
    }, []);

    // Use a tool
    const useTool = useCallback((toolName) => {
        if (tools[toolName] > 0) {
            if (activeTool === toolName) {
                setActiveTool(null);
            } else {
                setActiveTool(toolName);
            }
        }
    }, [tools, activeTool]);

    // Handle radar tool (row/column scan)
    const handleRadar = useCallback((x, y) => {
        if (tools.radar <= 0) return;

        setTools(t => ({ ...t, radar: t.radar - 1 }));
        setActiveTool(null);

        // Check row and column for treasures
        const inRow = treasurePositions.some(t => t.y === y);
        const inCol = treasurePositions.some(t => t.x === x);

        // Visual feedback
        const rowTiles = [];
        const colTiles = [];
        for (let i = 0; i < gridSize; i++) {
            rowTiles.push({ x: i, y, highlight: inRow ? 'hot' : 'cold' });
            colTiles.push({ x, y: i, highlight: inCol ? 'hot' : 'cold' });
        }
        setSonarTiles([...rowTiles, ...colTiles]);

        const msg = inRow && inCol ? '📡 Treasure in BOTH row & column!' :
                    inRow ? '📡 Treasure in this ROW!' :
                    inCol ? '📡 Treasure in this COLUMN!' :
                    '📡 No treasure in row or column';
        addHitEffect(x, y, msg, inRow || inCol ? 'treasure' : 'info');

        setTimeout(() => setSonarTiles([]), 2000);
    }, [tools, treasurePositions, gridSize, addHitEffect]);

    // Handle X-Ray tool (reveal without digging)
    const handleXRay = useCallback((x, y) => {
        if (tools.xray <= 0) return;
        if (dugTiles.some(d => d.x === x && d.y === y)) return;

        setTools(t => ({ ...t, xray: t.xray - 1 }));
        setActiveTool(null);

        // Check what's at this location
        const isTreasure = treasurePositions.some(t => t.x === x && t.y === y);
        const isDecoy = decoyPositions.some(d => d.x === x && d.y === y);
        const isGem = gemPositions.some(g => g.x === x && g.y === y);

        // Calculate distance
        const distance = getMinTreasureDistance(x, y, treasurePositions);
        const distanceInfo = getDistanceInfo(distance, gridSize);

        // Update grid with revealed info
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = {
                ...newGrid[y][x],
                revealed: true,
                distance: Math.round(distance * 10) / 10,
                distanceInfo
            };
            return newGrid;
        });

        setRevealedTiles(r => [...r, { x, y, time: Date.now() }]);

        const msg = isTreasure ? '🔍 TREASURE HERE!' :
                    isDecoy ? '🔍 Decoy detected!' :
                    isGem ? '🔍 Gem here!' :
                    `🔍 Distance: ${distance.toFixed(1)}`;

        addHitEffect(x, y, msg, isTreasure ? 'treasure' : isDecoy ? 'decoy' : 'info');
        triggerShake(0.5);
    }, [tools, dugTiles, treasurePositions, decoyPositions, gemPositions, gridSize, getMinTreasureDistance, addHitEffect, triggerShake]);

    // Handle sonar tool (area reveal)
    const handleSonar = useCallback((x, y) => {
        if (tools.sonar <= 0) return;

        setTools(t => ({ ...t, sonar: t.sonar - 1 }));
        setActiveTool(null);

        const radius = 2;
        const tiles = [];

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                    const dist = getMinTreasureDistance(nx, ny, treasurePositions);
                    const info = getDistanceInfo(dist, gridSize);
                    tiles.push({ x: nx, y: ny, distance: dist, info });
                }
            }
        }

        setSonarTiles(tiles);
        addHitEffect(x, y, '📡 Sonar pulse!', 'info');
        triggerShake(0.3);

        setTimeout(() => setSonarTiles([]), 3000);
    }, [tools, gridSize, treasurePositions, getMinTreasureDistance, addHitEffect, triggerShake]);

    // Handle flag toggle
    const handleFlag = useCallback((x, y) => {
        const tile = grid[y]?.[x];
        if (!tile || tile.dug) return;

        const alreadyFlagged = flaggedTiles.some(f => f.x === x && f.y === y);

        if (alreadyFlagged) {
            setFlaggedTiles(f => f.filter(t => !(t.x === x && t.y === y)));
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...newGrid[y][x], flagged: false };
                return newGrid;
            });
        } else if (tools.flag > 0 || flaggedTiles.length < (tools.flag || 0)) {
            setFlaggedTiles(f => [...f, { x, y }]);
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...newGrid[y][x], flagged: true };
                return newGrid;
            });
        }

        setActiveTool(null);
    }, [grid, flaggedTiles, tools]);

    // Main dig handler
    const handleDig = useCallback((x, y) => {
        if (gameState !== 'playing' || digsRemaining <= 0) return;

        const tile = grid[y]?.[x];
        if (!tile) return;

        // Handle tool usage
        if (activeTool === 'radar') {
            handleRadar(x, y);
            return;
        }
        if (activeTool === 'xray') {
            handleXRay(x, y);
            return;
        }
        if (activeTool === 'sonar') {
            handleSonar(x, y);
            return;
        }
        if (activeTool === 'flag') {
            handleFlag(x, y);
            return;
        }

        // Check if already fully dug
        if (tile.dug && tile.dugDepth >= tile.requiredDepth) return;

        // Check frozen tile cost
        const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !tile.dug;
        const digCost = isFrozen ? 2 : 1;

        if (digsRemaining < digCost) {
            addHitEffect(x, y, 'Not enough digs!', 'error');
            return;
        }

        // Deduct digs
        setDigsRemaining(d => d - digCost);

        // Track move
        setMoveHistory(h => [...h, { x, y, time: Date.now() }]);

        // Handle deep digging
        const newDepth = (tile.dugDepth || 0) + 1;
        if (newDepth < tile.requiredDepth) {
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...tile, dugDepth: newDepth };
                return newGrid;
            });
            addHitEffect(x, y, '⛏️ Dig deeper!', 'info');
            triggerShake(0.5);
            return;
        }

        // Calculate distance to nearest treasure
        const treasureDistance = getMinTreasureDistance(x, y, treasurePositions);
        const decoyDistance = getMinDecoyDistance(x, y, decoyPositions);

        // Show distance to closest (treasure or decoy)
        const showDistance = Math.min(treasureDistance, decoyDistance);
        const distanceInfo = getDistanceInfo(showDistance, gridSize);

        // Update grid
        setGrid(g => {
            const newGrid = [...g];
            newGrid[y] = [...newGrid[y]];
            newGrid[y][x] = {
                ...tile,
                dug: true,
                dugDepth: newDepth,
                distance: Math.round(showDistance * 10) / 10,
                distanceInfo,
                flagged: false
            };
            return newGrid;
        });

        setDugTiles(d => [...d, { x, y }]);
        setRevealedTiles(r => [...r, { x, y, time: Date.now() }]);
        setFlaggedTiles(f => f.filter(t => !(t.x === x && t.y === y)));

        // Update combo based on distance
        if (distanceInfo.tier <= 3) {
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                if (newCombo >= 3) {
                    addHitEffect(x, y, `🔥 ${newCombo}x COMBO!`, 'combo');
                    setScore(s => s + newCombo * 5);
                }
                return newCombo;
            });
        } else {
            setCombo(0);
        }

        setLastDigResult({ x, y, distance: showDistance, ...distanceInfo });

        // Check for treasure
        const foundTreasure = treasurePositions.find(t => t.x === x && t.y === y);
        if (foundTreasure) {
            setTreasuresFound(f => f + 1);
            const treasureScore = 100 + combo * 20;
            setScore(s => s + treasureScore);
            addHitEffect(x, y, `💎 +${treasureScore} TREASURE!`, 'treasure');
            triggerShake(1.5);

            setTreasurePositions(t => t.filter(pos => !(pos.x === x && pos.y === y)));

            // Check win condition
            if (treasurePositions.length <= 1) {
                setTimeout(() => setGameState('result'), 800);
            }
            return;
        }

        // Check for decoy
        const foundDecoy = decoyPositions.find(d => d.x === x && d.y === y);
        if (foundDecoy) {
            setDecoysHit(d => d + 1);
            setScore(s => Math.max(0, s - 30));
            addHitEffect(x, y, '💀 -30 DECOY!', 'decoy');
            setDecoyPositions(d => d.filter(pos => !(pos.x === x && pos.y === y)));
            triggerShake(1);
            setCombo(0);
            return;
        }

        // Check for gem
        const foundGem = gemPositions.find(g => g.x === x && g.y === y);
        if (foundGem) {
            if (foundGem.type === 'dig') {
                setDigsRemaining(d => d + 1);
                addHitEffect(x, y, '💚 +1 DIG!', 'gem');
            } else {
                setScore(s => s + foundGem.value);
                addHitEffect(x, y, `💎 +${foundGem.value}`, 'gem');
            }
            setGemPositions(g => g.filter(pos => !(pos.x === x && pos.y === y)));
            return;
        }

        // Regular dig feedback
        addHitEffect(x, y, distanceInfo.emoji, 'dig');
        triggerShake(0.3);

        // Move treasure periodically
        if (selectedOpponent?.special.includes('moving') && moveHistory.length > 0 && (moveHistory.length + 1) % 4 === 0) {
            setTimeout(moveTreasure, 500);
        }

        // Check lose condition
        if (digsRemaining - digCost <= 0 && treasurePositions.length > 0) {
            setTimeout(() => setGameState('result'), 800);
        }
    }, [gameState, digsRemaining, grid, activeTool, frozenTiles, treasurePositions,
        decoyPositions, gemPositions, gridSize, combo, maxCombo, moveHistory,
        selectedOpponent, getMinTreasureDistance, getMinDecoyDistance,
        handleRadar, handleXRay, handleSonar, handleFlag, moveTreasure,
        addHitEffect, triggerShake]);

    // Hint system
    const getHint = useCallback(() => {
        if (treasurePositions.length === 0) return;

        // Find the best undug tile to suggest
        const undugTiles = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (!grid[y][x].dug) {
                    const dist = getMinTreasureDistance(x, y, treasurePositions);
                    undugTiles.push({ x, y, dist });
                }
            }
        }

        // Sort by distance and suggest a good one (not the best, to keep challenge)
        undugTiles.sort((a, b) => a.dist - b.dist);
        const hintIndex = Math.min(2, Math.floor(undugTiles.length * 0.1));
        const hint = undugTiles[hintIndex];

        if (hint) {
            setHintTile(hint);
            setShowHint(true);
            setProgression(p => ({ ...p, hintsUsed: p.hintsUsed + 1 }));
            setTimeout(() => setShowHint(false), 3000);
        }
    }, [treasurePositions, gridSize, grid, getMinTreasureDistance]);

    // Fog of war effect
    useEffect(() => {
        if (!selectedOpponent?.special.includes('fog')) return;

        const interval = setInterval(() => {
            const now = Date.now();
            setRevealedTiles(tiles => tiles.filter(t => now - t.time < 8000));
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedOpponent]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        const won = treasurePositions.length === 0;
        const config = levelConfig;

        if (won && config) {
            // Calculate bonuses
            const digBonus = digsRemaining * 10;
            const comboBonus = maxCombo * 15;
            const noDecoyBonus = decoysHit === 0 ? 50 : 0;
            const underParBonus = digsRemaining >= (config.digs - config.parDigs) ? 75 : 0;

            const totalBonus = digBonus + comboBonus + noDecoyBonus + underParBonus;
            setScore(s => s + totalBonus);

            // Calculate stars earned
            const finalScore = score + totalBonus;
            const targetScore = 100 + currentLevel * 25;
            const performance = finalScore / targetScore;
            const starsEarned = performance >= 1.5 ? 3 : performance >= 1 ? 2 : 1;

            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + starsEarned);

                const newLevelsBeat = prev.levelsBeat.map(arr => [...arr]);
                newLevelsBeat[selectedOpponent.id][currentLevel - 1] = true;

                const newBestScores = prev.bestScores.map(arr => [...arr]);
                newBestScores[selectedOpponent.id][currentLevel - 1] = Math.max(
                    newBestScores[selectedOpponent.id][currentLevel - 1] || 0,
                    finalScore
                );

                return {
                    ...prev,
                    starPoints: newPoints,
                    levelsBeat: newLevelsBeat,
                    bestScores: newBestScores,
                    totalTreasures: prev.totalTreasures + treasuresFound,
                    totalGames: prev.totalGames + 1
                };
            });
        }
    }, [gameState]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (showTutorial) {
                    setShowTutorial(false);
                } else if (gameState === 'playing') {
                    setGameState('level_select');
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
            if (gameState === 'playing') {
                if (e.code === 'KeyR' && tools.radar > 0) useTool('radar');
                if (e.code === 'KeyX' && tools.xray > 0) useTool('xray');
                if (e.code === 'KeyS' && tools.sonar > 0) useTool('sonar');
                if (e.code === 'KeyF') useTool('flag');
                if (e.code === 'KeyH') getHint();
            }
            if (showTutorial && (e.code === 'Space' || e.code === 'Enter')) {
                if (tutorialStep < 4) {
                    setTutorialStep(s => s + 1);
                } else {
                    setShowTutorial(false);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, showTutorial, tutorialStep, tools, useTool, getHint]);

    // Star bar component
    const StarBar = ({ points, size = 'normal' }) => {
        const starSize = size === 'small' ? '10px' : '14px';
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} style={{
                        width: starSize, height: starSize,
                        background: i < Math.floor(points / 4) ? theme.gold : theme.bgDark,
                        borderRadius: '2px',
                        border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                        boxShadow: i < Math.floor(points / 4) ? `0 0 4px ${theme.goldGlow}` : 'none'
                    }} />
                ))}
            </div>
        );
    };

    // Tool button component
    const ToolButton = ({ name, icon, count, hotkey, active, onClick }) => (
        <button
            onClick={onClick}
            disabled={count <= 0}
            style={{
                padding: '8px 12px',
                background: active ? theme.accent : count > 0 ? theme.bgPanel : theme.bgDark,
                border: `2px solid ${active ? theme.accentBright : count > 0 ? theme.border : theme.bgDark}`,
                borderRadius: '8px',
                color: active ? '#1a1815' : count > 0 ? theme.text : theme.textMuted,
                cursor: count > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: active ? 'bold' : 'normal',
                transition: 'all 0.2s',
                opacity: count > 0 ? 1 : 0.5
            }}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span>{name}</span>
            <span style={{
                background: active ? '#1a1815' : theme.bgDark,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                color: active ? theme.accent : theme.textSecondary
            }}>
                {count} [{hotkey}]
            </span>
        </button>
    );

    // Tutorial overlay
    const TutorialOverlay = () => {
        const steps = [
            {
                title: 'Welcome to Treasure Dig!',
                content: 'Your goal is to find hidden treasure using distance clues. Each dig reveals how far you are from the nearest treasure.',
                icon: '💎'
            },
            {
                title: 'Distance Numbers',
                content: 'When you dig, you see a DISTANCE NUMBER. This tells you exactly how many tiles away the treasure is. Use multiple digs to triangulate!',
                icon: '📏'
            },
            {
                title: 'Triangulation Strategy',
                content: 'If one dig shows distance 3 and another shows distance 2, the treasure must be where those distances intersect. Think like a detective!',
                icon: '🎯'
            },
            {
                title: 'Tools & Flags',
                content: 'Use RADAR to scan rows/columns, X-RAY to peek without digging, and FLAGS to mark suspected locations. Tools are limited - use wisely!',
                icon: '🛠️'
            },
            {
                title: 'Ready to Dig!',
                content: 'Hot colors (red/orange) mean close. Cold colors (blue/purple) mean far. Find all treasures before running out of digs. Good luck!',
                icon: '⛏️'
            }
        ];

        const step = steps[tutorialStep];

        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    background: theme.bgPanel,
                    border: `3px solid ${theme.accent}`,
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>{step.icon}</div>
                    <h2 style={{ color: theme.accent, marginBottom: '15px' }}>{step.title}</h2>
                    <p style={{ color: theme.textSecondary, lineHeight: '1.6', marginBottom: '30px' }}>
                        {step.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{
                                width: '12px', height: '12px',
                                borderRadius: '50%',
                                background: i === tutorialStep ? theme.accent : theme.border
                            }} />
                        ))}
                    </div>

                    <button
                        onClick={() => tutorialStep < 4 ? setTutorialStep(s => s + 1) : setShowTutorial(false)}
                        style={{
                            padding: '12px 40px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none',
                            borderRadius: '10px',
                            color: '#1a1815',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {tutorialStep < 4 ? 'Next →' : 'Start Digging!'}
                    </button>
                    <div style={{ marginTop: '10px', color: theme.textMuted, fontSize: '12px' }}>
                        Press SPACE or ENTER to continue
                    </div>
                </div>
            </div>
        );
    };

    // MENU SCREEN
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2a2515 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '80px', marginBottom: '10px', animation: 'bounce 2s infinite' }}>💎</div>
                <h1 style={{ fontSize: '42px', marginBottom: '5px', color: theme.accent, textShadow: `0 0 20px ${theme.goldGlow}` }}>
                    TREASURE DIG
                </h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px', fontSize: '18px' }}>
                    Find hidden treasure using logic and deduction!
                </p>
                <p style={{ color: theme.textMuted, marginBottom: '30px', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
                    Dig tiles to reveal distance numbers. Triangulate the treasure location. Use tools wisely!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: '#1a1815',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 4px 20px ${theme.goldGlow}`,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    START EXPEDITION
                </button>

                {progression.totalGames > 0 && (
                    <div style={{
                        marginTop: '30px',
                        padding: '15px 25px',
                        background: theme.bgPanel,
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '30px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontSize: '24px', fontWeight: 'bold' }}>
                                {progression.totalTreasures}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Treasures Found</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.accent, fontSize: '24px', fontWeight: 'bold' }}>
                                {progression.totalGames}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Games Played</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.success, fontSize: '24px', fontWeight: 'bold' }}>
                                {progression.starPoints.reduce((a, b) => a + b, 0)}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '12px' }}>Total Stars</div>
                        </div>
                    </div>
                )}

                <a href="../menu.html" style={{
                    marginTop: '30px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>← Back to Main Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // SELECT SCREEN
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
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your Expedition</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '15px', maxWidth: '1400px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isOpponentUnlocked(idx);
                        const mastered = isOpponentMastered(idx);
                        const starsEarned = getStars(idx);

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
                                    borderRadius: '15px',
                                    padding: '20px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.3s',
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
                                        position: 'absolute', top: '15px', right: '15px',
                                        fontSize: '24px'
                                    }}>🔒</div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: `linear-gradient(135deg, ${theme.gold}, ${theme.accentBright})`,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#1a1815'
                                    }}>⭐ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px',
                                        width: '80px', height: '80px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}22`,
                                        borderRadius: '50%',
                                        border: `2px solid ${opp.color}44`,
                                        flexShrink: 0
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '20px', fontWeight: 'bold', color: opp.color,
                                            marginBottom: '2px'
                                        }}>{opp.name}</div>
                                        <div style={{
                                            fontSize: '12px', color: theme.textMuted, marginBottom: '8px'
                                        }}>{opp.title}</div>

                                        <div style={{
                                            fontSize: '12px', color: theme.textSecondary,
                                            background: `${opp.color}15`,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            borderLeft: `3px solid ${opp.color}`
                                        }}>
                                            {opp.mechanic}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StarBar points={progression.starPoints[idx]} size="small" />
                                            <span style={{ color: theme.textMuted, fontSize: '11px' }}>
                                                {starsEarned}/10 ⭐
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${theme.border}`,
                                    display: 'flex',
                                    gap: '15px',
                                    fontSize: '11px',
                                    color: theme.textMuted
                                }}>
                                    <span>📐 {opp.gridSize}x{opp.gridSize}</span>
                                    <span>⛏️ {opp.baseDigs} digs</span>
                                    <span>💎 {opp.treasures} treasure{opp.treasures > 1 ? 's' : ''}</span>
                                    {opp.decoys > 0 && <span>💀 {opp.decoys} decoy{opp.decoys > 1 ? 's' : ''}</span>}
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
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 100%)`,
                padding: '20px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'transparent', border: `1px solid ${theme.border}`,
                    color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                }}>← Back</button>

                <div style={{
                    fontSize: '100px', marginTop: '20px',
                    filter: 'drop-shadow(0 0 20px ' + selectedOpponent.color + ')'
                }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px', fontSize: '32px' }}>
                    {selectedOpponent.name}
                </h2>
                <p style={{ color: theme.textMuted, marginBottom: '10px' }}>{selectedOpponent.title}</p>

                <div style={{
                    marginTop: '10px', padding: '15px 25px',
                    background: `${selectedOpponent.color}15`,
                    borderRadius: '12px',
                    color: theme.textSecondary,
                    maxWidth: '500px',
                    textAlign: 'center',
                    border: `1px solid ${selectedOpponent.color}33`
                }}>
                    <div style={{ fontWeight: 'bold', color: selectedOpponent.color, marginBottom: '5px' }}>
                        Special Mechanic:
                    </div>
                    {selectedOpponent.description}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                    <div style={{ textAlign: 'center', marginTop: '5px', color: theme.textMuted, fontSize: '12px' }}>
                        {getStars(selectedOpponent.id)}/10 stars earned
                    </div>
                </div>

                <h3 style={{ marginTop: '30px', marginBottom: '15px', color: theme.textSecondary }}>
                    Select Level
                </h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px', maxWidth: '450px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = isLevelUnlocked(selectedOpponent.id, levelNum);
                        const beaten = progression.levelsBeat[selectedOpponent.id]?.[i];
                        const bestScore = progression.bestScores[selectedOpponent.id]?.[i] || 0;

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '75px', height: '75px',
                                    background: beaten
                                        ? `linear-gradient(135deg, ${theme.success}88, ${theme.success}44)`
                                        : unlocked
                                            ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                            : theme.bgDark,
                                    border: `2px solid ${beaten ? theme.success : unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '22px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => unlocked && (e.target.style.transform = 'scale(1.08)')}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            >
                                {unlocked ? (
                                    <>
                                        {levelNum}
                                        {beaten && <span style={{ fontSize: '10px', marginTop: '2px' }}>✓ {bestScore}</span>}
                                    </>
                                ) : '🔒'}
                            </button>
                        );
                    })}
                </div>

                {selectedOpponent.tutorial && (
                    <button
                        onClick={() => {
                            setShowTutorial(true);
                            setTutorialStep(0);
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: 'transparent',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            color: theme.textMuted,
                            cursor: 'pointer'
                        }}
                    >
                        📖 View Tutorial
                    </button>
                )}
            </div>
        );
    }

    // PLAYING SCREEN
    if (gameState === 'playing' && grid.length > 0) {
        const opp = selectedOpponent;
        const tileSize = Math.min(45, Math.max(32, Math.floor(550 / gridSize)));
        const hasFog = opp?.special.includes('fog');
        const treasureCount = levelConfig?.treasures || opp?.treasures || 1;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp?.color || theme.accent}12 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '15px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(3px)' : 'none',
                transition: 'transform 0.05s'
            }}>
                {/* Tutorial overlay */}
                {showTutorial && <TutorialOverlay />}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '10px', padding: '12px 20px',
                    background: theme.bgPanel, borderRadius: '12px',
                    flexWrap: 'wrap', gap: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>⛏️</span>
                            <span style={{
                                color: digsRemaining <= 3 ? theme.error : theme.accent,
                                fontWeight: 'bold',
                                fontSize: '20px'
                            }}>{digsRemaining}</span>
                            <span style={{ color: theme.textMuted, fontSize: '12px' }}>digs</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>💰</span>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '20px' }}>{score}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>💎</span>
                            <span style={{ color: theme.success, fontWeight: 'bold' }}>
                                {treasuresFound}/{treasureCount}
                            </span>
                        </div>
                        {combo >= 2 && (
                            <div style={{
                                background: `linear-gradient(135deg, ${theme.hot}, ${theme.warm})`,
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                animation: 'pulse 0.5s infinite'
                            }}>
                                🔥 {combo}x COMBO
                            </div>
                        )}
                    </div>
                    <div style={{ color: opp?.color || theme.accent, fontWeight: 'bold' }}>
                        {opp?.emoji} {opp?.name} - Level {currentLevel}
                    </div>
                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            background: 'transparent', border: `1px solid ${theme.border}`,
                            color: theme.textMuted, padding: '6px 12px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '12px'
                        }}
                    >ESC</button>
                </div>

                {/* Tools bar */}
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '10px',
                    padding: '10px 15px', background: theme.bgPanel, borderRadius: '10px',
                    flexWrap: 'wrap', justifyContent: 'center'
                }}>
                    {tools.radar > 0 && (
                        <ToolButton
                            name="Radar" icon="📡" count={tools.radar} hotkey="R"
                            active={activeTool === 'radar'} onClick={() => useTool('radar')}
                        />
                    )}
                    {tools.xray > 0 && (
                        <ToolButton
                            name="X-Ray" icon="🔍" count={tools.xray} hotkey="X"
                            active={activeTool === 'xray'} onClick={() => useTool('xray')}
                        />
                    )}
                    {tools.sonar > 0 && (
                        <ToolButton
                            name="Sonar" icon="📍" count={tools.sonar} hotkey="S"
                            active={activeTool === 'sonar'} onClick={() => useTool('sonar')}
                        />
                    )}
                    <ToolButton
                        name="Flag" icon="🚩" count={flaggedTiles.length + '/' + (tools.flag || 5)} hotkey="F"
                        active={activeTool === 'flag'} onClick={() => useTool('flag')}
                    />
                    <button
                        onClick={getHint}
                        style={{
                            padding: '8px 12px',
                            background: theme.bgDark,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            color: theme.textMuted,
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        💡 Hint [H]
                    </button>
                </div>

                {/* Last dig feedback */}
                {lastDigResult && (
                    <div style={{
                        textAlign: 'center', marginBottom: '8px',
                        padding: '10px 25px', borderRadius: '10px',
                        background: `${lastDigResult.color}25`,
                        border: `2px solid ${lastDigResult.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'
                    }}>
                        <span style={{ fontSize: '28px' }}>{lastDigResult.emoji}</span>
                        <span style={{ color: lastDigResult.color, fontSize: '20px', fontWeight: 'bold' }}>
                            {lastDigResult.label}
                        </span>
                        <span style={{
                            color: theme.text,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: theme.bgDark,
                            padding: '4px 12px',
                            borderRadius: '8px'
                        }}>
                            {lastDigResult.distance.toFixed(1)} away
                        </span>
                    </div>
                )}

                {/* Active tool indicator */}
                {activeTool && (
                    <div style={{
                        textAlign: 'center', marginBottom: '8px',
                        padding: '8px 20px', borderRadius: '8px',
                        background: theme.accent,
                        color: '#1a1815',
                        fontWeight: 'bold'
                    }}>
                        Click a tile to use {activeTool.toUpperCase()} (or press key again to cancel)
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
                        gap: '3px',
                        background: theme.bgDark,
                        padding: '12px',
                        borderRadius: '12px',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        {grid.map((row, y) =>
                            row.map((tile, x) => {
                                const isDug = tile.dug;
                                const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !isDug;
                                const isFlagged = tile.flagged;
                                const isRevealed = tile.revealed || revealedTiles.some(r => r.x === x && r.y === y);
                                const sonarTile = sonarTiles.find(s => s.x === x && s.y === y);
                                const isHinted = showHint && hintTile?.x === x && hintTile?.y === y;

                                // Fog visibility
                                const fogVisible = !hasFog || isDug || isRevealed;
                                const fogOpacity = hasFog && !isDug && !isRevealed ? 0.15 : 1;

                                // Deep dig indicator
                                const isDeepPartial = tile.dugDepth > 0 && tile.dugDepth < tile.requiredDepth;

                                // Tile colors
                                let bgColor = '#8B7355'; // Default dirt
                                let borderColor = '#6B5344';
                                let content = null;

                                if (isDug) {
                                    bgColor = tile.distanceInfo?.color || theme.bgPanel;
                                    borderColor = tile.distanceInfo?.color || theme.border;
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.45,
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                        }}>
                                            {tile.distance?.toFixed(1)}
                                        </span>
                                    );
                                } else if (isDeepPartial) {
                                    bgColor = '#5a4a3a';
                                    content = <span style={{ fontSize: tileSize * 0.4 }}>🕳️</span>;
                                } else if (isFlagged) {
                                    bgColor = '#4a5a4a';
                                    borderColor = theme.success;
                                    content = <span style={{ fontSize: tileSize * 0.5 }}>🚩</span>;
                                } else if (isFrozen) {
                                    bgColor = '#aaddff';
                                    borderColor = '#88bbdd';
                                    content = <span style={{ fontSize: tileSize * 0.4 }}>❄️</span>;
                                } else if (tile.revealed && tile.distanceInfo) {
                                    // X-ray revealed
                                    bgColor = `${tile.distanceInfo.color}44`;
                                    borderColor = tile.distanceInfo.color;
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.35,
                                            opacity: 0.7
                                        }}>
                                            ~{tile.distance?.toFixed(1)}
                                        </span>
                                    );
                                }

                                // Sonar overlay
                                if (sonarTile) {
                                    const sonarInfo = sonarTile.info || getDistanceInfo(sonarTile.distance, gridSize);
                                    borderColor = sonarInfo.color;
                                }

                                // Hint highlight
                                if (isHinted) {
                                    borderColor = theme.gold;
                                    bgColor = `${theme.gold}44`;
                                }

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        onClick={() => handleDig(x, y)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            handleFlag(x, y);
                                        }}
                                        style={{
                                            width: tileSize,
                                            height: tileSize,
                                            background: bgColor,
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: '6px',
                                            cursor: isDug && !isDeepPartial ? 'default' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s',
                                            opacity: fogOpacity,
                                            boxShadow: sonarTile
                                                ? `0 0 12px ${sonarTile.info?.color || theme.accent}`
                                                : isHinted
                                                    ? `0 0 15px ${theme.gold}`
                                                    : isDug
                                                        ? `inset 0 2px 4px rgba(0,0,0,0.3)`
                                                        : '0 2px 4px rgba(0,0,0,0.2)',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDug || isDeepPartial) {
                                                e.currentTarget.style.transform = 'scale(1.08)';
                                                e.currentTarget.style.zIndex = '10';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.zIndex = '1';
                                        }}
                                    >
                                        {content}

                                        {/* Sonar distance preview */}
                                        {sonarTile && !isDug && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '2px',
                                                fontSize: '10px',
                                                color: theme.text,
                                                textShadow: '1px 1px 2px black'
                                            }}>
                                                {sonarTile.distance?.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {/* Hit effects */}
                        {hitEffects.map(e => {
                            const effectX = e.x * (tileSize + 3) + tileSize / 2;
                            const effectY = e.y * (tileSize + 3) + tileSize / 2;
                            return (
                                <div
                                    key={e.id}
                                    style={{
                                        position: 'absolute',
                                        left: effectX + 12,
                                        top: effectY + 12,
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: e.type === 'treasure' ? '20px' : e.type === 'combo' ? '18px' : '14px',
                                        fontWeight: 'bold',
                                        color: e.type === 'treasure' ? theme.gold
                                            : e.type === 'decoy' ? theme.error
                                            : e.type === 'gem' ? theme.gem
                                            : e.type === 'combo' ? theme.hot
                                            : e.type === 'error' ? theme.error
                                            : theme.text,
                                        pointerEvents: 'none',
                                        animation: 'floatUp 1.2s ease-out forwards',
                                        zIndex: 100,
                                        textShadow: '0 0 8px black, 0 0 4px black',
                                        whiteSpace: 'nowrap'
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
                    marginTop: '12px', textAlign: 'center',
                    color: theme.textMuted, fontSize: '12px',
                    display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap',
                    padding: '10px',
                    background: theme.bgPanel,
                    borderRadius: '8px'
                }}>
                    <span>🔥 Hot = Close (0-3)</span>
                    <span>☀️ Warm (3-5)</span>
                    <span>❄️ Cold (7-12)</span>
                    <span>🥶 Freezing (12+)</span>
                    <span style={{ color: theme.textSecondary }}>| Right-click to flag</span>
                </div>

                {/* Par info */}
                {levelConfig && (
                    <div style={{
                        marginTop: '8px', textAlign: 'center',
                        color: theme.textMuted, fontSize: '11px'
                    }}>
                        Par: Find all treasures with {levelConfig.parDigs}+ digs remaining for bonus points
                    </div>
                )}

                <style>{`
                    @keyframes floatUp {
                        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                        15% { transform: translate(-50%, -60%) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                `}</style>
            </div>
        );
    }

    // RESULT SCREEN
    if (gameState === 'result') {
        const won = treasurePositions.length === 0;
        const config = levelConfig;

        const digBonus = won ? digsRemaining * 10 : 0;
        const comboBonus = maxCombo * 15;
        const noDecoyBonus = won && decoysHit === 0 ? 50 : 0;
        const underParBonus = won && config && digsRemaining >= (config.digs - config.parDigs) ? 75 : 0;
        const finalScore = score + digBonus + comboBonus + noDecoyBonus + underParBonus;

        const performance = finalScore / (100 + currentLevel * 25);
        const starsEarned = won ? (performance >= 1.5 ? 3 : performance >= 1 ? 2 : 1) : 0;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}18 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{
                    fontSize: '120px', marginBottom: '20px',
                    animation: won ? 'bounce 1s infinite' : 'shake 0.5s'
                }}>
                    {won ? (starsEarned >= 3 ? '👑' : starsEarned >= 2 ? '🏆' : '💎') : '💀'}
                </div>

                <h1 style={{
                    fontSize: '42px',
                    color: won ? (starsEarned >= 3 ? theme.gold : theme.success) : theme.error,
                    marginBottom: '10px',
                    textShadow: won ? `0 0 30px ${theme.goldGlow}` : 'none'
                }}>
                    {won
                        ? (starsEarned >= 3 ? 'PERFECT!' : starsEarned >= 2 ? 'EXCELLENT!' : 'TREASURE FOUND!')
                        : 'OUT OF DIGS!'}
                </h1>

                {won && (
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                        {[1,2,3].map(i => (
                            <span key={i} style={{
                                fontSize: '32px',
                                opacity: i <= starsEarned ? 1 : 0.3,
                                filter: i <= starsEarned ? 'none' : 'grayscale(1)'
                            }}>⭐</span>
                        ))}
                    </div>
                )}

                <div style={{
                    fontSize: '48px', marginBottom: '15px', color: theme.gold,
                    textShadow: `0 0 20px ${theme.goldGlow}`
                }}>
                    {finalScore} pts
                </div>

                <div style={{
                    background: theme.bgPanel,
                    padding: '20px 30px',
                    borderRadius: '15px',
                    marginBottom: '25px',
                    minWidth: '300px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '10px 20px',
                        fontSize: '14px'
                    }}>
                        <span style={{ color: theme.textMuted }}>Base Score:</span>
                        <span style={{ color: theme.text, textAlign: 'right' }}>{score}</span>

                        <span style={{ color: theme.textMuted }}>Treasures Found:</span>
                        <span style={{ color: theme.success, textAlign: 'right' }}>{treasuresFound}</span>

                        <span style={{ color: theme.textMuted }}>Max Combo:</span>
                        <span style={{ color: theme.warm, textAlign: 'right' }}>{maxCombo}x</span>

                        {won && (
                            <>
                                <span style={{ color: theme.textMuted }}>Digs Remaining:</span>
                                <span style={{ color: theme.accent, textAlign: 'right' }}>
                                    {digsRemaining} (+{digBonus})
                                </span>

                                {comboBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>Combo Bonus:</span>
                                        <span style={{ color: theme.warm, textAlign: 'right' }}>+{comboBonus}</span>
                                    </>
                                )}

                                {noDecoyBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>No Decoys Hit:</span>
                                        <span style={{ color: theme.success, textAlign: 'right' }}>+{noDecoyBonus}</span>
                                    </>
                                )}

                                {underParBonus > 0 && (
                                    <>
                                        <span style={{ color: theme.textMuted }}>Under Par Bonus:</span>
                                        <span style={{ color: theme.gold, textAlign: 'right' }}>+{underParBonus}</span>
                                    </>
                                )}
                            </>
                        )}

                        {decoysHit > 0 && (
                            <>
                                <span style={{ color: theme.error }}>Decoys Hit:</span>
                                <span style={{ color: theme.error, textAlign: 'right' }}>{decoysHit}</span>
                            </>
                        )}
                    </div>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel,
                        padding: '12px 25px',
                        borderRadius: '10px',
                        marginBottom: '25px',
                        border: `2px solid ${theme.gold}`
                    }}>
                        <span style={{ color: theme.gold, fontWeight: 'bold' }}>
                            +{starsEarned} Star{starsEarned > 1 ? 's' : ''} Earned!
                        </span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent?.id || 0)}/10 total)
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => startMatch(selectedOpponent, currentLevel)}
                        style={{
                            padding: '15px 35px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '12px', color: '#1a1815',
                            cursor: 'pointer', fontWeight: 'bold',
                            boxShadow: `0 4px 15px ${theme.goldGlow}`
                        }}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>

                    {won && currentLevel < 10 && (
                        <button
                            onClick={() => startMatch(selectedOpponent, currentLevel + 1)}
                            style={{
                                padding: '15px 35px', fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}88)`,
                                border: 'none', borderRadius: '12px', color: 'white',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Next Level →
                        </button>
                    )}

                    <button
                        onClick={() => setGameState('level_select')}
                        style={{
                            padding: '15px 35px', fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '12px', color: theme.textSecondary,
                            cursor: 'pointer'
                        }}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        25% { transform: translateY(-15px) rotate(-5deg); }
                        75% { transform: translateY(-15px) rotate(5deg); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TreasureDig />);
