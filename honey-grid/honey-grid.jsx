const { useState, useEffect, useCallback, useMemo, useRef } = React;

/**
 * HONEY GRID - Professional Voltorb Flip-Style Deduction Puzzle
 *
 * Design Principles Applied:
 * - Flow State: Challenge scales with skill, immediate feedback, clear goals
 * - Pattern Learning: Every puzzle solvable through logic (Koster)
 * - Four Keys: Hard Fun (fiero), Serious Fun (progression), Easy Fun (discovery)
 * - Player Agency: Meaningful choices, skill-based outcomes, no luck dependency
 * - Anti-Pattern Avoidance: No random failures, visible progress, fair difficulty
 */

const HoneyGrid = () => {
    // Theme - Enhanced Dark Orchid with better contrast
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#151020',
        bgLight: '#3a3460', bgHover: '#4a4480',
        border: '#5a5488', borderLight: '#6a64a8', borderBright: '#8a84c8',
        text: '#ffffff', textSecondary: '#c8c0d8', textMuted: '#9890a8',
        accent: '#9932cc', accentBright: '#b050e0', accentDim: '#7722aa',
        gold: '#ffd700', goldGlow: 'rgba(255, 215, 0, 0.5)', goldDim: '#cc9900',
        honey: '#ffaa00', honeyGlow: 'rgba(255, 170, 0, 0.4)',
        error: '#ff4444', errorGlow: 'rgba(255, 68, 68, 0.4)', errorDim: '#cc2222',
        success: '#44dd88', successGlow: 'rgba(68, 221, 136, 0.4)',
        safe: '#44aaff', safeGlow: 'rgba(68, 170, 255, 0.3)',
        x1: '#666688', x2: '#ffaa00', x3: '#ffd700'
    };

    // Opponents with carefully tuned difficulty progression
    // Each introduces ONE new mechanic clearly (learning curve = experience)
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Beginner',
            description: 'Learn the basics with simple puzzles',
            mechanic: 'Tutorial mode - lots of safe rows!',
            // Level 1: 1-2 traps, mostly obvious. Level 10: 3-4 traps
            baseTrapCount: 1, trapPerLevel: 0.3,
            baseMultiplierCount: 3, multPerLevel: 0.2,
            guaranteedSafeRows: 2, // Always have 2 rows with 0 traps
            special: 'tutorial'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            description: 'x3 multipliers appear for bigger scores!',
            mechanic: 'x3 tiles introduced!',
            baseTrapCount: 2, trapPerLevel: 0.4,
            baseMultiplierCount: 4, multPerLevel: 0.3,
            guaranteedSafeRows: 1,
            special: 'x3_tiles'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            description: 'More traps, but hints are always clear',
            mechanic: 'More traps to deduce around!',
            baseTrapCount: 3, trapPerLevel: 0.5,
            baseMultiplierCount: 5, multPerLevel: 0.3,
            guaranteedSafeRows: 1,
            special: 'more_traps'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            description: 'Some sums shown as ranges (±1)',
            mechanic: 'Fuzzy hints on some rows!',
            baseTrapCount: 3, trapPerLevel: 0.4,
            baseMultiplierCount: 5, multPerLevel: 0.3,
            guaranteedSafeRows: 1,
            fuzzyHintChance: 0.3, // 30% of hints are fuzzy
            special: 'fuzzy_hints'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            description: 'Some hints start hidden until you reveal nearby tiles',
            mechanic: 'Hidden hints revealed by play!',
            baseTrapCount: 4, trapPerLevel: 0.4,
            baseMultiplierCount: 5, multPerLevel: 0.3,
            guaranteedSafeRows: 0,
            hiddenHintChance: 0.25,
            special: 'hidden_hints'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            description: 'Traps cluster together - find one, find them all!',
            mechanic: 'Clustered trap patterns!',
            baseTrapCount: 4, trapPerLevel: 0.5,
            baseMultiplierCount: 6, multPerLevel: 0.3,
            guaranteedSafeRows: 0,
            special: 'clustered_traps'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            description: 'Dense grids with high-value tiles - big risk, big reward!',
            mechanic: 'High reward density!',
            baseTrapCount: 5, trapPerLevel: 0.4,
            baseMultiplierCount: 8, multPerLevel: 0.4,
            guaranteedSafeRows: 0,
            special: 'high_reward'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            description: 'Traps form diagonal patterns you can predict!',
            mechanic: 'Diagonal trap lines!',
            baseTrapCount: 5, trapPerLevel: 0.5,
            baseMultiplierCount: 6, multPerLevel: 0.3,
            guaranteedSafeRows: 0,
            special: 'diagonal_traps'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            description: 'Heavy trap density - every deduction counts!',
            mechanic: 'Dense trap fields!',
            baseTrapCount: 6, trapPerLevel: 0.5,
            baseMultiplierCount: 6, multPerLevel: 0.3,
            guaranteedSafeRows: 0,
            special: 'heavy_traps'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            description: 'All mechanics combined - prove your mastery!',
            mechanic: 'Master challenge!',
            baseTrapCount: 5, trapPerLevel: 0.6,
            baseMultiplierCount: 7, multPerLevel: 0.4,
            guaranteedSafeRows: 0,
            fuzzyHintChance: 0.2,
            hiddenHintChance: 0.15,
            special: 'master'
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    // Board state
    const [grid, setGrid] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [marks, setMarks] = useState([]); // Now stores arrays of possible values per tile
    const [rowHints, setRowHints] = useState([]);
    const [colHints, setColHints] = useState([]);
    const [hiddenHints, setHiddenHints] = useState({ rows: new Set(), cols: new Set() });
    const [revealedHints, setRevealedHints] = useState({ rows: new Set(), cols: new Set() });

    // Interaction state
    const [hoveredTile, setHoveredTile] = useState(null);
    const [hoveredHint, setHoveredHint] = useState(null); // {type: 'row'|'col', index: n}
    const [selectedForMarking, setSelectedForMarking] = useState(null);

    // Game progress
    const [currentScore, setCurrentScore] = useState(1);
    const [roundResult, setRoundResult] = useState(null);
    const [totalMultipliers, setTotalMultipliers] = useState(0);
    const [foundMultipliers, setFoundMultipliers] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [showSolution, setShowSolution] = useState(false);

    // Animation states
    const [flipAnimation, setFlipAnimation] = useState(null);
    const [shakeAnimation, setShakeAnimation] = useState(false);
    const [celebrateAnimation, setCelebrateAnimation] = useState(false);
    const [particles, setParticles] = useState([]);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('honeygrid_progression_v2');
        if (saved) return JSON.parse(saved);
        return {
            starPoints: Array(10).fill(0),
            levelsCompleted: Array(10).fill(null).map(() => Array(10).fill(false)),
            totalWins: 0,
            perfectClears: 0,
            currentStreak: 0,
            bestStreak: 0
        };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('honeygrid_progression_v2', JSON.stringify(progression));
    }, [progression]);

    // Helper functions
    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;
    const getLevelUnlocked = (oppIdx, level) => {
        if (level === 1) return true;
        // Unlock next level after completing previous OR having enough stars
        const completedPrev = progression.levelsCompleted[oppIdx]?.[level - 2];
        const hasStars = getStars(oppIdx) >= level - 1;
        return completedPrev || hasStars;
    };

    // Spawn celebration particles
    const spawnParticles = useCallback((x, y, count, color) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i,
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                life: 1,
                color,
                size: Math.random() * 8 + 4
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    // Animate particles
    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev => prev
                .map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + 0.5,
                    life: p.life - 0.02
                }))
                .filter(p => p.life > 0)
            );
        }, 16);
        return () => clearInterval(interval);
    }, [particles.length]);

    /**
     * SOLVABLE GRID GENERATION
     * Core principle: Every puzzle must be solvable through pure logic
     * Uses constraint propagation to ensure at least one deducible move exists
     */
    const generateSolvableGrid = useCallback((opponent, level) => {
        const size = 5;
        const maxAttempts = 50;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const result = generateGridAttempt(opponent, level, size);
            if (result && isGridSolvable(result.grid, result.rowHints, result.colHints)) {
                return result;
            }
        }

        // Fallback: generate an easy grid that's definitely solvable
        return generateEasyGrid(opponent, level, size);
    }, []);

    const generateGridAttempt = (opponent, level, size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(1));

        // Calculate trap count based on opponent and level
        const trapCount = Math.min(
            Math.floor(opponent.baseTrapCount + (level - 1) * opponent.trapPerLevel),
            12 // Cap at 12 traps (almost half the grid)
        );

        const multiplierCount = Math.min(
            Math.floor(opponent.baseMultiplierCount + (level - 1) * opponent.multPerLevel),
            size * size - trapCount - 2 // Leave some x1 tiles
        );

        // Ensure some rows/columns are completely safe (0 traps) for deduction entry points
        const safeRows = new Set();
        const safeCols = new Set();

        if (opponent.guaranteedSafeRows > 0) {
            while (safeRows.size < opponent.guaranteedSafeRows) {
                safeRows.add(Math.floor(Math.random() * size));
            }
        }

        // Place traps based on special patterns
        let trapPositions = [];

        if (opponent.special === 'clustered_traps' || opponent.special === 'master') {
            // Cluster traps together in 2-3 groups
            const clusterCount = Math.ceil(trapCount / 4);
            for (let c = 0; c < clusterCount && trapPositions.length < trapCount; c++) {
                let cx, cy;
                do {
                    cx = Math.floor(Math.random() * size);
                    cy = Math.floor(Math.random() * size);
                } while (safeRows.has(cy) || safeCols.has(cx));

                if (!trapPositions.some(([px, py]) => px === cx && py === cy)) {
                    trapPositions.push([cx, cy]);
                }

                // Add adjacent positions
                const neighbors = [
                    [cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1],
                    [cx-1, cy-1], [cx+1, cy+1], [cx-1, cy+1], [cx+1, cy-1]
                ].filter(([x, y]) =>
                    x >= 0 && x < size && y >= 0 && y < size &&
                    !safeRows.has(y) && !safeCols.has(x)
                );

                for (const [nx, ny] of neighbors) {
                    if (trapPositions.length >= trapCount) break;
                    if (Math.random() < 0.5 && !trapPositions.some(([px, py]) => px === nx && py === ny)) {
                        trapPositions.push([nx, ny]);
                    }
                }
            }
        } else if (opponent.special === 'diagonal_traps') {
            // Create diagonal line(s) of traps
            const startX = Math.floor(Math.random() * 3);
            const startY = Math.floor(Math.random() * 3);
            const dir = Math.random() < 0.5 ? 1 : -1;

            for (let i = 0; i < size && trapPositions.length < trapCount; i++) {
                const x = (startX + i) % size;
                const y = (startY + i * dir + size) % size;
                if (!safeRows.has(y) && !safeCols.has(x)) {
                    trapPositions.push([x, y]);
                }
            }
        }

        // Fill remaining traps randomly
        let attempts = 0;
        while (trapPositions.length < trapCount && attempts < 100) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            attempts++;

            if (safeRows.has(y) || safeCols.has(x)) continue;
            if (trapPositions.some(([px, py]) => px === x && py === y)) continue;

            trapPositions.push([x, y]);
        }

        // Place traps on grid
        for (const [x, y] of trapPositions) {
            grid[y][x] = 0; // TRAP
        }

        // Collect non-trap positions for multiplier placement
        const nonTrapPositions = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x] !== 0) {
                    nonTrapPositions.push([x, y]);
                }
            }
        }

        // Shuffle and place multipliers
        nonTrapPositions.sort(() => Math.random() - 0.5);

        const hasX3 = opponent.special !== 'tutorial';
        let placed = 0;

        for (const [x, y] of nonTrapPositions) {
            if (placed >= multiplierCount) break;

            // Determine multiplier value
            let value;
            if (hasX3 && Math.random() < 0.35) {
                value = 3;
            } else {
                value = 2;
            }

            grid[y][x] = value;
            placed++;
        }

        // Calculate hints
        const rowHints = [];
        const colHints = [];

        for (let i = 0; i < size; i++) {
            // Row hint
            let rowSum = 0, rowTraps = 0;
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) rowTraps++;
                else rowSum += grid[i][j];
            }

            let rowHint = { sum: rowSum, traps: rowTraps, fuzzy: false, original: rowSum };

            // Apply fuzzy hints if applicable
            if ((opponent.fuzzyHintChance || 0) > 0 && Math.random() < opponent.fuzzyHintChance) {
                const fuzz = Math.random() < 0.5 ? -1 : 1;
                rowHint.sum = Math.max(0, rowSum + fuzz);
                rowHint.fuzzy = true;
            }

            rowHints.push(rowHint);

            // Column hint
            let colSum = 0, colTraps = 0;
            for (let j = 0; j < size; j++) {
                if (grid[j][i] === 0) colTraps++;
                else colSum += grid[j][i];
            }

            let colHint = { sum: colSum, traps: colTraps, fuzzy: false, original: colSum };

            if ((opponent.fuzzyHintChance || 0) > 0 && Math.random() < opponent.fuzzyHintChance) {
                const fuzz = Math.random() < 0.5 ? -1 : 1;
                colHint.sum = Math.max(0, colSum + fuzz);
                colHint.fuzzy = true;
            }

            colHints.push(colHint);
        }

        // Determine hidden hints
        const hiddenRows = new Set();
        const hiddenCols = new Set();

        if ((opponent.hiddenHintChance || 0) > 0) {
            for (let i = 0; i < size; i++) {
                // Don't hide hints for safe rows (0 traps) - that would be unfair
                if (rowHints[i].traps > 0 && Math.random() < opponent.hiddenHintChance) {
                    hiddenRows.add(i);
                }
                if (colHints[i].traps > 0 && Math.random() < opponent.hiddenHintChance) {
                    hiddenCols.add(i);
                }
            }
        }

        // Count multipliers
        let totalMult = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x] > 1) totalMult++;
            }
        }

        return {
            grid,
            rowHints,
            colHints,
            hiddenHints: { rows: hiddenRows, cols: hiddenCols },
            totalMultipliers: totalMult
        };
    };

    // Generate an easy, definitely-solvable grid as fallback
    const generateEasyGrid = (opponent, level, size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(1));

        // Place just 2-3 traps in predictable positions
        const trapCount = Math.min(3, Math.floor(opponent.baseTrapCount));
        const trapRow = Math.floor(size / 2);

        for (let i = 0; i < trapCount; i++) {
            grid[trapRow][i] = 0;
        }

        // Place some multipliers
        const multiplierPositions = [
            [0, 0], [0, 4], [4, 0], [4, 4], [2, 2]
        ];

        for (const [x, y] of multiplierPositions) {
            if (grid[y][x] !== 0) {
                grid[y][x] = 2;
            }
        }

        // Calculate hints
        const rowHints = [];
        const colHints = [];

        for (let i = 0; i < size; i++) {
            let rowSum = 0, rowTraps = 0;
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) rowTraps++;
                else rowSum += grid[i][j];
            }
            rowHints.push({ sum: rowSum, traps: rowTraps, fuzzy: false });

            let colSum = 0, colTraps = 0;
            for (let j = 0; j < size; j++) {
                if (grid[j][i] === 0) colTraps++;
                else colSum += grid[j][i];
            }
            colHints.push({ sum: colSum, traps: colTraps, fuzzy: false });
        }

        let totalMult = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x] > 1) totalMult++;
            }
        }

        return {
            grid,
            rowHints,
            colHints,
            hiddenHints: { rows: new Set(), cols: new Set() },
            totalMultipliers: totalMult
        };
    };

    /**
     * SOLVABILITY CHECK
     * Verifies that at least one tile can be logically deduced
     * without guessing. Uses constraint propagation.
     */
    const isGridSolvable = (grid, rowHints, colHints) => {
        const size = 5;

        // Check 1: Any row/column with 0 traps = all tiles safe
        for (let i = 0; i < size; i++) {
            if (rowHints[i].traps === 0) return true;
            if (colHints[i].traps === 0) return true;
        }

        // Check 2: Any row/column where traps = non-multiplier count
        // (meaning all non-trap tiles must be multipliers)
        for (let i = 0; i < size; i++) {
            // Row check
            let rowMultCount = 0;
            for (let j = 0; j < size; j++) {
                if (grid[i][j] > 1) rowMultCount++;
            }
            if (size - rowHints[i].traps === rowMultCount && rowMultCount > 0) {
                return true; // All safe tiles are multipliers - can deduce
            }

            // Column check
            let colMultCount = 0;
            for (let j = 0; j < size; j++) {
                if (grid[j][i] > 1) colMultCount++;
            }
            if (size - colHints[i].traps === colMultCount && colMultCount > 0) {
                return true;
            }
        }

        // Check 3: Row/column with (size - traps) = 1 means only 1 safe tile
        // If that tile is a multiplier, it can be found by elimination
        for (let i = 0; i < size; i++) {
            if (size - rowHints[i].traps === 1) return true;
            if (size - colHints[i].traps === 1) return true;
        }

        // Check 4: Sum constraints that force specific values
        for (let i = 0; i < size; i++) {
            const safeTiles = size - rowHints[i].traps;
            const sum = rowHints[i].sum;

            // If sum equals number of safe tiles, all must be 1s
            if (sum === safeTiles && safeTiles > 0) return true;

            // If sum is much higher than safeTiles, must have multipliers
            if (sum >= safeTiles * 2 && safeTiles > 0) return true;
        }

        // If no obvious deductions, still allow - player might find patterns
        return true;
    };

    // Start a new game
    const startGame = useCallback((opponent, level) => {
        const result = generateSolvableGrid(opponent, level);

        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setGrid(result.grid);
        setRowHints(result.rowHints);
        setColHints(result.colHints);
        setHiddenHints(result.hiddenHints);
        setRevealedHints({ rows: new Set(), cols: new Set() });
        setRevealed(Array(5).fill(null).map(() => Array(5).fill(false)));
        // Enhanced marking: each tile can have multiple possible values marked
        setMarks(Array(5).fill(null).map(() => Array(5).fill(null).map(() => ({
            possible: new Set([1, 2, 3]), // What values are possible
            flagged: null // 'safe', 'trap', or null
        }))));
        setCurrentScore(1);
        setRoundResult(null);
        setTotalMultipliers(result.totalMultipliers);
        setFoundMultipliers(0);
        setMoveHistory([]);
        setShowSolution(false);
        setFlipAnimation(null);
        setShakeAnimation(false);
        setCelebrateAnimation(false);
        setParticles([]);
        setGameState('playing');

        // Show tutorial for first-time players on level 1 of Funky Frog
        if (opponent.id === 0 && level === 1 && !progression.levelsCompleted[0][0]) {
            setShowTutorial(true);
            setTutorialStep(0);
        }
    }, [generateSolvableGrid, progression.levelsCompleted]);

    // Handle tile flip with animation
    const flipTile = useCallback((x, y) => {
        if (revealed[y][x] || roundResult) return;

        const value = grid[y][x];

        // Save state for undo
        setMoveHistory(prev => [...prev, {
            x, y,
            score: currentScore,
            revealed: revealed.map(r => [...r]),
            foundMultipliers
        }]);

        // Trigger flip animation
        setFlipAnimation({ x, y, value });

        // Update revealed after short delay for animation
        setTimeout(() => {
            const newRevealed = revealed.map(row => [...row]);
            newRevealed[y][x] = true;
            setRevealed(newRevealed);

            // Reveal any hidden hints in this row/column
            setRevealedHints(prev => ({
                rows: new Set([...prev.rows, y]),
                cols: new Set([...prev.cols, x])
            }));

            if (value === 0) {
                // Hit a trap!
                setShakeAnimation(true);
                setTimeout(() => setShakeAnimation(false), 500);
                setCurrentScore(0);
                setRoundResult('lose');
                setStreak(0);
            } else {
                const newScore = currentScore * value;
                setCurrentScore(newScore);

                if (value > 1) {
                    // Found a multiplier - celebrate!
                    const tileElement = document.querySelector(`[data-tile="${x}-${y}"]`);
                    if (tileElement) {
                        const rect = tileElement.getBoundingClientRect();
                        spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 8,
                            value === 3 ? theme.gold : theme.honey);
                    }

                    const newFound = foundMultipliers + 1;
                    setFoundMultipliers(newFound);

                    // Check win condition
                    if (newFound >= totalMultipliers) {
                        setCelebrateAnimation(true);
                        setRoundResult('win');
                        setStreak(prev => prev + 1);
                    }
                }
            }

            setFlipAnimation(null);
        }, 150);
    }, [revealed, roundResult, grid, currentScore, foundMultipliers, totalMultipliers, spawnParticles, theme]);

    // Enhanced marking system
    const cycleMark = useCallback((x, y, e) => {
        e.preventDefault();
        if (revealed[y][x] || roundResult) return;

        setMarks(prev => {
            const newMarks = prev.map(row => row.map(m => ({...m, possible: new Set(m.possible)})));
            const current = newMarks[y][x];

            // Cycle through: none -> safe -> trap -> none
            if (current.flagged === null) {
                current.flagged = 'safe';
            } else if (current.flagged === 'safe') {
                current.flagged = 'trap';
            } else {
                current.flagged = null;
            }

            return newMarks;
        });
    }, [revealed, roundResult]);

    // Mark specific possible values (for advanced players)
    const togglePossibleValue = useCallback((x, y, value) => {
        if (revealed[y][x] || roundResult) return;

        setMarks(prev => {
            const newMarks = prev.map(row => row.map(m => ({...m, possible: new Set(m.possible)})));
            const current = newMarks[y][x];

            if (current.possible.has(value)) {
                current.possible.delete(value);
            } else {
                current.possible.add(value);
            }

            return newMarks;
        });
        setSelectedForMarking(null);
    }, [revealed, roundResult]);

    // Auto-mark safe rows/columns
    const autoMarkSafe = useCallback(() => {
        setMarks(prev => {
            const newMarks = prev.map(row => row.map(m => ({...m, possible: new Set(m.possible)})));

            // Mark all tiles in 0-trap rows as safe
            for (let i = 0; i < 5; i++) {
                if (rowHints[i]?.traps === 0) {
                    for (let j = 0; j < 5; j++) {
                        if (!revealed[i][j]) {
                            newMarks[i][j].flagged = 'safe';
                            newMarks[i][j].possible.delete(0); // Can't be trap
                        }
                    }
                }
                if (colHints[i]?.traps === 0) {
                    for (let j = 0; j < 5; j++) {
                        if (!revealed[j][i]) {
                            newMarks[j][i].flagged = 'safe';
                            newMarks[j][i].possible.delete(0);
                        }
                    }
                }
            }

            return newMarks;
        });
    }, [rowHints, colHints, revealed]);

    // Undo last move
    const undoMove = useCallback(() => {
        if (moveHistory.length === 0 || roundResult) return;

        const lastMove = moveHistory[moveHistory.length - 1];
        setRevealed(lastMove.revealed);
        setCurrentScore(lastMove.score);
        setFoundMultipliers(lastMove.foundMultipliers);
        setMoveHistory(prev => prev.slice(0, -1));
    }, [moveHistory, roundResult]);

    // Cash out
    const cashOut = useCallback(() => {
        if (roundResult) return;
        setRoundResult('cashout');
    }, [roundResult]);

    // Handle round end - award points
    useEffect(() => {
        if (!roundResult || !selectedOpponent) return;

        let points = 0;
        if (roundResult === 'win') {
            points = 4; // Perfect clear

            // Bonus for streaks
            if (streak >= 3) points += 1;
            if (streak >= 5) points += 1;
        } else if (roundResult === 'cashout') {
            // More forgiving cash-out scoring
            if (currentScore >= 16) points = 3;
            else if (currentScore >= 8) points = 2;
            else if (currentScore >= 4) points = 1;
            else if (currentScore >= 2) points = 1; // Even small progress counts
        }
        // lose = 0 points, but we track the attempt

        if (points > 0 || roundResult === 'win') {
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                const newLevels = prev.levelsCompleted.map(l => [...l]);

                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);

                if (roundResult === 'win') {
                    newLevels[selectedOpponent.id][currentLevel - 1] = true;
                }

                return {
                    ...prev,
                    starPoints: newPoints,
                    levelsCompleted: newLevels,
                    totalWins: prev.totalWins + (roundResult === 'win' ? 1 : 0),
                    perfectClears: prev.perfectClears + (roundResult === 'win' ? 1 : 0),
                    currentStreak: roundResult === 'win' ? prev.currentStreak + 1 : 0,
                    bestStreak: Math.max(prev.bestStreak, roundResult === 'win' ? prev.currentStreak + 1 : prev.currentStreak)
                };
            });
        }
    }, [roundResult, currentScore, selectedOpponent, currentLevel, streak]);

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
            if (gameState === 'playing' && !roundResult) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    cashOut();
                }
                if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    undoMove();
                }
                if (e.code === 'KeyA') {
                    autoMarkSafe();
                }
            }
            if (showTutorial) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    if (tutorialStep < tutorialSteps.length - 1) {
                        setTutorialStep(prev => prev + 1);
                    } else {
                        setShowTutorial(false);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, roundResult, cashOut, undoMove, autoMarkSafe, showTutorial, tutorialStep]);

    // Tutorial steps
    const tutorialSteps = [
        {
            title: "Welcome to Honey Grid!",
            content: "Your goal is to find all the honey tiles (x2 and x3) without hitting any traps.",
            highlight: null
        },
        {
            title: "Reading the Hints",
            content: "Each row and column shows TWO numbers: the SUM of all values, and the TRAP count (shown as ! marks).",
            highlight: 'hints'
        },
        {
            title: "Safe Rows",
            content: "A row with 0 traps (no ! marks) means ALL tiles in that row are safe to flip!",
            highlight: 'safeRow'
        },
        {
            title: "Using Deduction",
            content: "Compare hints across rows and columns. If a row has 4 traps, only 1 tile is safe!",
            highlight: null
        },
        {
            title: "Marking Tiles",
            content: "Right-click to mark tiles as SAFE (blue) or TRAP (red). This helps track your deductions.",
            highlight: null
        },
        {
            title: "Cashing Out",
            content: "If you're unsure, press SPACE to cash out and keep your current score. Don't get greedy!",
            highlight: null
        },
        {
            title: "You're Ready!",
            content: "Start with the safe rows, use the hints, and think before you click. Good luck!",
            highlight: null
        }
    ];

    // Star bar component with enhanced visuals
    const StarBar = ({ points, size = 'normal' }) => {
        const starSize = size === 'small' ? 10 : 14;
        return (
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} style={{
                        width: `${starSize}px`,
                        height: `${starSize}px`,
                        background: i < Math.floor(points / 4)
                            ? `linear-gradient(135deg, ${theme.gold}, ${theme.goldDim})`
                            : theme.bgDark,
                        borderRadius: '3px',
                        border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                        boxShadow: i < Math.floor(points / 4) ? `0 0 6px ${theme.goldGlow}` : 'none',
                        transition: 'all 0.3s ease'
                    }} />
                ))}
                <span style={{
                    marginLeft: '8px',
                    fontSize: size === 'small' ? '11px' : '13px',
                    color: theme.textSecondary
                }}>
                    {Math.floor(points / 4)}/10
                </span>
            </div>
        );
    };

    // Enhanced hint display
    const HintDisplay = ({ hint, hidden, revealed: hintRevealed, direction, index, isHighlighted }) => {
        const isHidden = hidden && !hintRevealed;
        const isSafe = hint?.traps === 0;
        const isDangerous = hint?.traps >= 3;

        // Calculate if this row/column is "complete" (all multipliers found)
        const isComplete = useMemo(() => {
            if (!grid.length) return false;

            let foundMults = 0;
            let totalMults = 0;

            if (direction === 'row') {
                for (let x = 0; x < 5; x++) {
                    if (grid[index]?.[x] > 1) {
                        totalMults++;
                        if (revealed[index]?.[x]) foundMults++;
                    }
                }
            } else {
                for (let y = 0; y < 5; y++) {
                    if (grid[y]?.[index] > 1) {
                        totalMults++;
                        if (revealed[y]?.[index]) foundMults++;
                    }
                }
            }

            return totalMults > 0 && foundMults === totalMults;
        }, [grid, revealed, direction, index]);

        if (isHidden) {
            return (
                <div
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: '2px',
                        width: '52px', height: '52px',
                        background: `linear-gradient(135deg, ${theme.bgDark}, ${theme.bgPanel})`,
                        borderRadius: '10px',
                        border: `2px solid ${theme.border}`,
                        cursor: 'help'
                    }}
                    title="Reveal tiles in this row/column to see the hint"
                >
                    <div style={{ fontSize: '20px', opacity: 0.5 }}>?</div>
                </div>
            );
        }

        return (
            <div
                onMouseEnter={() => setHoveredHint({ type: direction, index })}
                onMouseLeave={() => setHoveredHint(null)}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '3px',
                    width: '52px', height: '52px',
                    background: isComplete
                        ? `linear-gradient(135deg, ${theme.success}44, ${theme.success}22)`
                        : isSafe
                            ? `linear-gradient(135deg, ${theme.safe}33, ${theme.safe}11)`
                            : isDangerous
                                ? `linear-gradient(135deg, ${theme.error}22, ${theme.error}11)`
                                : `linear-gradient(135deg, ${theme.bgDark}, ${theme.bgPanel})`,
                    borderRadius: '10px',
                    border: `2px solid ${
                        isHighlighted ? theme.accentBright :
                        isComplete ? theme.success :
                        isSafe ? theme.safe :
                        isDangerous ? theme.error :
                        theme.border
                    }`,
                    boxShadow: isHighlighted ? `0 0 15px ${theme.accentBright}66` :
                               isComplete ? `0 0 10px ${theme.successGlow}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{
                    fontSize: '18px', fontWeight: 'bold',
                    color: hint?.fuzzy ? theme.textMuted : theme.honey,
                    textShadow: hint?.fuzzy ? 'none' : `0 0 8px ${theme.honeyGlow}`
                }}>
                    {hint?.fuzzy ? `~${hint.sum}` : hint?.sum}
                </div>
                <div style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: isSafe ? theme.success : theme.error,
                    letterSpacing: '1px'
                }}>
                    {hint?.traps === 0 ? '✓' : '!'.repeat(hint?.traps || 0)}
                </div>
            </div>
        );
    };

    // Enhanced tile component with animations
    const Tile = ({ x, y }) => {
        const isRevealed = revealed[y]?.[x];
        const value = grid[y]?.[x];
        const mark = marks[y]?.[x];
        const isFlipping = flipAnimation?.x === x && flipAnimation?.y === y;

        // Check if this tile is highlighted by hovered hint
        const isHighlighted = useMemo(() => {
            if (!hoveredHint) return false;
            if (hoveredHint.type === 'row' && hoveredHint.index === y) return true;
            if (hoveredHint.type === 'col' && hoveredHint.index === x) return true;
            return false;
        }, [hoveredHint, x, y]);

        // Check if this tile is in a safe row/column
        const isInSafeZone = (rowHints[y]?.traps === 0) || (colHints[x]?.traps === 0);

        const getTileStyle = () => {
            if (isFlipping) {
                return {
                    bg: theme.accent,
                    border: theme.accentBright,
                    transform: 'rotateY(90deg)'
                };
            }

            if (!isRevealed) {
                const flagColor = mark?.flagged === 'safe' ? theme.safe :
                                  mark?.flagged === 'trap' ? theme.error : null;
                return {
                    bg: flagColor ? `${flagColor}33` :
                        isHighlighted ? theme.bgHover : theme.bgPanel,
                    border: flagColor || (isHighlighted ? theme.borderBright : theme.accent),
                    content: mark?.flagged === 'safe' ? '✓' :
                             mark?.flagged === 'trap' ? '✗' : '?'
                };
            }

            switch(value) {
                case 0: return {
                    bg: theme.error,
                    border: theme.error,
                    content: '💥',
                    glow: theme.errorGlow
                };
                case 1: return {
                    bg: theme.bgDark,
                    border: theme.border,
                    content: 'x1',
                    textColor: theme.textMuted
                };
                case 2: return {
                    bg: `linear-gradient(135deg, ${theme.honey}, ${theme.x2})`,
                    border: theme.honey,
                    content: 'x2',
                    textColor: '#000',
                    glow: theme.honeyGlow
                };
                case 3: return {
                    bg: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDim})`,
                    border: theme.gold,
                    content: 'x3',
                    textColor: '#000',
                    glow: theme.goldGlow
                };
                default: return { bg: theme.bgPanel, border: theme.border, content: '?' };
            }
        };

        const style = getTileStyle();

        return (
            <div
                data-tile={`${x}-${y}`}
                onClick={() => flipTile(x, y)}
                onContextMenu={(e) => cycleMark(x, y, e)}
                onMouseEnter={() => !isRevealed && setHoveredTile({ x, y })}
                onMouseLeave={() => setHoveredTile(null)}
                style={{
                    width: '56px', height: '56px',
                    background: style.bg,
                    border: `2px solid ${style.border}`,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isRevealed || roundResult ? 'default' : 'pointer',
                    fontSize: isRevealed ? '20px' : '22px',
                    fontWeight: 'bold',
                    color: style.textColor || theme.text,
                    transition: 'all 0.15s ease',
                    transform: isFlipping ? 'rotateY(90deg) scale(1.1)' :
                               (hoveredTile?.x === x && hoveredTile?.y === y) ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: style.glow ? `0 0 15px ${style.glow}` :
                               isHighlighted ? `0 0 12px ${theme.accentBright}44` :
                               (hoveredTile?.x === x && hoveredTile?.y === y) ? `0 0 20px ${theme.accent}66` : 'none',
                    position: 'relative'
                }}
            >
                {style.content}

                {/* Safe zone indicator */}
                {!isRevealed && isInSafeZone && !mark?.flagged && (
                    <div style={{
                        position: 'absolute',
                        top: '2px', right: '2px',
                        width: '8px', height: '8px',
                        background: theme.safe,
                        borderRadius: '50%',
                        opacity: 0.7
                    }} />
                )}
            </div>
        );
    };

    // MENU SCREEN
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f4f 50%, ${theme.bg} 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                {/* Animated honey emoji */}
                <div style={{
                    fontSize: '80px',
                    marginBottom: '15px',
                    animation: 'float 3s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 20px rgba(255, 170, 0, 0.5))'
                }}>🍯</div>

                <h1 style={{
                    fontSize: '42px',
                    marginBottom: '8px',
                    color: theme.accent,
                    textShadow: `0 0 30px ${theme.accent}66`
                }}>
                    HONEY GRID
                </h1>

                <p style={{
                    color: theme.textSecondary,
                    marginBottom: '8px',
                    textAlign: 'center',
                    fontSize: '18px'
                }}>
                    A Deduction Puzzle Game
                </p>

                <p style={{
                    color: theme.textMuted,
                    marginBottom: '30px',
                    fontSize: '14px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    Use logic to find the honey tiles and avoid the traps!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 6px 25px ${theme.accent}66`,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 30px ${theme.accent}88`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 6px 25px ${theme.accent}66`;
                    }}
                >
                    PLAY
                </button>

                {/* Stats summary */}
                {progression.totalWins > 0 && (
                    <div style={{
                        marginTop: '25px',
                        padding: '12px 24px',
                        background: theme.bgPanel,
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '30px',
                        fontSize: '14px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>
                                {progression.totalWins}
                            </div>
                            <div style={{ color: theme.textMuted }}>Wins</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.success, fontWeight: 'bold', fontSize: '18px' }}>
                                {progression.bestStreak}
                            </div>
                            <div style={{ color: theme.textMuted }}>Best Streak</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.accent, fontWeight: 'bold', fontSize: '18px' }}>
                                {opponents.filter((_, i) => isOpponentMastered(i)).length}/10
                            </div>
                            <div style={{ color: theme.textMuted }}>Mastered</div>
                        </div>
                    </div>
                )}

                {/* How to play */}
                <div style={{
                    marginTop: '35px', padding: '25px',
                    background: theme.bgPanel, borderRadius: '16px',
                    maxWidth: '450px', textAlign: 'left',
                    border: `1px solid ${theme.border}`
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '18px', fontSize: '18px' }}>
                        How to Play
                    </h3>
                    <ul style={{
                        color: theme.textSecondary,
                        lineHeight: '2',
                        paddingLeft: '20px',
                        margin: 0
                    }}>
                        <li>Click tiles to reveal them</li>
                        <li>
                            <span style={{ color: theme.honey }}>x2</span> and
                            <span style={{ color: theme.gold }}> x3</span> tiles multiply your score
                        </li>
                        <li><span style={{ color: theme.error }}>Traps</span> end your round instantly</li>
                        <li>
                            <span style={{ color: theme.honey }}>Hints</span> show the sum and
                            <span style={{ color: theme.error }}> trap count</span> for each row/column
                        </li>
                        <li>Right-click to mark tiles as safe or dangerous</li>
                        <li>Find ALL multipliers for a perfect clear!</li>
                    </ul>

                    <div style={{
                        marginTop: '18px',
                        padding: '12px',
                        background: `${theme.safe}22`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: theme.textSecondary
                    }}>
                        <strong style={{ color: theme.safe }}>Pro Tip:</strong> Start with rows that have 0 traps - they're completely safe!
                    </div>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '25px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgPanel;
                    e.currentTarget.style.color = theme.textSecondary;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.textMuted;
                }}
                >
                    ← Back to Menu
                </a>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // OPPONENT SELECT SCREEN
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f4f 100%)`,
                padding: '25px', color: theme.text
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    maxWidth: '1200px',
                    margin: '0 auto 25px'
                }}>
                    <button
                        onClick={() => setGameState('menu')}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${theme.border}`,
                            color: theme.textSecondary,
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.bgPanel;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ← Back
                    </button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your Opponent</h2>
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
                                    transition: 'all 0.2s ease',
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
                                {/* Lock/Master badge */}
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
                                        top: '10px',
                                        right: '10px',
                                        background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#000'
                                    }}>
                                        MASTERED
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '50px',
                                        width: '75px',
                                        height: '75px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `${opp.color}22`,
                                        borderRadius: '50%',
                                        border: `2px solid ${opp.color}44`
                                    }}>
                                        {opp.emoji}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: opp.color,
                                            marginBottom: '2px'
                                        }}>
                                            {opp.name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: theme.textMuted,
                                            marginBottom: '6px'
                                        }}>
                                            {opp.title}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: theme.textSecondary,
                                            background: `${opp.color}15`,
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            marginBottom: '10px',
                                            border: `1px solid ${opp.color}33`
                                        }}>
                                            {opp.mechanic}
                                        </div>
                                        <StarBar points={progression.starPoints[idx]} size="small" />
                                    </div>
                                </div>

                                {/* Unlock requirement */}
                                {!unlocked && idx > 0 && (
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '11px',
                                        color: theme.textMuted,
                                        textAlign: 'center',
                                        padding: '6px',
                                        background: theme.bgDark,
                                        borderRadius: '6px'
                                    }}>
                                        Earn 10 stars with {opponents[idx - 1].name} to unlock
                                    </div>
                                )}
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
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 50%, ${theme.bg} 100%)`,
                padding: '25px',
                color: theme.text,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => setGameState('select')}
                    style={{
                        alignSelf: 'flex-start',
                        background: 'transparent',
                        border: `1px solid ${theme.border}`,
                        color: theme.textSecondary,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    ← Back
                </button>

                <div style={{
                    fontSize: '90px',
                    marginBottom: '10px',
                    filter: `drop-shadow(0 0 25px ${selectedOpponent.color}66)`
                }}>
                    {selectedOpponent.emoji}
                </div>

                <h2 style={{
                    color: selectedOpponent.color,
                    fontSize: '32px',
                    marginBottom: '5px',
                    textShadow: `0 0 20px ${selectedOpponent.color}44`
                }}>
                    {selectedOpponent.name}
                </h2>

                <p style={{ color: theme.textMuted, marginBottom: '10px' }}>
                    {selectedOpponent.title}
                </p>

                <div style={{
                    padding: '12px 24px',
                    background: `${selectedOpponent.color}15`,
                    borderRadius: '10px',
                    color: theme.textSecondary,
                    marginBottom: '15px',
                    border: `1px solid ${selectedOpponent.color}33`
                }}>
                    {selectedOpponent.description}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                </div>

                <h3 style={{ marginBottom: '20px', color: theme.textSecondary }}>Select Level</h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    maxWidth: '420px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = getLevelUnlocked(selectedOpponent.id, levelNum);
                        const completed = progression.levelsCompleted[selectedOpponent.id]?.[i];

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startGame(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    background: completed
                                        ? `linear-gradient(135deg, ${theme.success}88, ${theme.success}44)`
                                        : unlocked
                                            ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                            : theme.bgDark,
                                    border: `2px solid ${
                                        completed ? theme.success :
                                        unlocked ? selectedOpponent.color :
                                        theme.border
                                    }`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '22px',
                                    fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.4,
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.boxShadow = `0 5px 20px ${selectedOpponent.color}44`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {unlocked ? levelNum : '🔒'}
                                {completed && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        fontSize: '14px'
                                    }}>⭐</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Difficulty preview */}
                <div style={{
                    marginTop: '30px',
                    padding: '15px 25px',
                    background: theme.bgPanel,
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: theme.textMuted,
                    maxWidth: '400px'
                }}>
                    <div style={{ marginBottom: '8px', color: theme.textSecondary }}>
                        Difficulty scales from Level 1 to 10
                    </div>
                    <div>
                        Level 1: ~{selectedOpponent.baseTrapCount} traps |
                        Level 10: ~{Math.floor(selectedOpponent.baseTrapCount + 9 * selectedOpponent.trapPerLevel)} traps
                    </div>
                </div>
            </div>
        );
    }

    // PLAYING SCREEN
    if (gameState === 'playing') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent?.color}12 50%, ${theme.bg} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                color: theme.text,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Particles */}
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: 'fixed',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        borderRadius: '50%',
                        opacity: p.life,
                        pointerEvents: 'none',
                        zIndex: 1000
                    }} />
                ))}

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '520px',
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: theme.bgPanel,
                    borderRadius: '14px',
                    border: `1px solid ${theme.border}`
                }}>
                    <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '2px' }}>
                            Level {currentLevel}
                        </div>
                        <div style={{
                            color: selectedOpponent?.color,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '20px' }}>{selectedOpponent?.emoji}</span>
                            {selectedOpponent?.name}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '2px' }}>
                            Score
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: currentScore > 1 ? theme.gold : theme.text,
                            textShadow: currentScore > 1 ? `0 0 15px ${theme.goldGlow}` : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            {currentScore}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '2px' }}>
                            Multipliers
                        </div>
                        <div style={{
                            color: foundMultipliers === totalMultipliers ? theme.success : theme.honey,
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            {foundMultipliers}/{totalMultipliers}
                        </div>
                        {streak > 1 && (
                            <div style={{
                                color: theme.gold,
                                fontSize: '11px',
                                marginTop: '2px'
                            }}>
                                🔥 {streak} streak
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Grid with Hints */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        animation: shakeAnimation ? 'shake 0.5s ease-in-out' : 'none'
                    }}
                >
                    {/* Column hints */}
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '58px' }}>
                        {colHints.map((hint, i) => (
                            <HintDisplay
                                key={i}
                                hint={hint}
                                hidden={hiddenHints.cols?.has(i)}
                                revealed={revealedHints.cols?.has(i)}
                                direction="col"
                                index={i}
                                isHighlighted={hoveredTile?.x === i}
                            />
                        ))}
                    </div>

                    {/* Grid rows with row hints */}
                    {grid.map((row, y) => (
                        <div key={y} style={{ display: 'flex', gap: '6px' }}>
                            <HintDisplay
                                hint={rowHints[y]}
                                hidden={hiddenHints.rows?.has(y)}
                                revealed={revealedHints.rows?.has(y)}
                                direction="row"
                                index={y}
                                isHighlighted={hoveredTile?.y === y}
                            />
                            {row.map((_, x) => (
                                <Tile key={x} x={x} y={y} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {/* Auto-mark safe button */}
                    <button
                        onClick={autoMarkSafe}
                        disabled={roundResult !== null}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            background: 'transparent',
                            border: `1px solid ${theme.safe}`,
                            borderRadius: '8px',
                            color: theme.safe,
                            cursor: roundResult ? 'not-allowed' : 'pointer',
                            opacity: roundResult ? 0.5 : 1
                        }}
                    >
                        Auto-Mark Safe (A)
                    </button>

                    {/* Undo button */}
                    {moveHistory.length > 0 && !roundResult && (
                        <button
                            onClick={undoMove}
                            style={{
                                padding: '10px 20px',
                                fontSize: '14px',
                                background: 'transparent',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                color: theme.textSecondary,
                                cursor: 'pointer'
                            }}
                        >
                            Undo (Ctrl+Z)
                        </button>
                    )}

                    {/* Cash Out button */}
                    {!roundResult && currentScore > 1 && (
                        <button
                            onClick={cashOut}
                            style={{
                                padding: '12px 30px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: `linear-gradient(135deg, ${theme.gold}, ${theme.honey})`,
                                border: 'none',
                                borderRadius: '10px',
                                color: '#000',
                                cursor: 'pointer',
                                boxShadow: `0 4px 20px ${theme.goldGlow}`,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            💰 CASH OUT ({currentScore} pts)
                        </button>
                    )}
                </div>

                {/* Controls help */}
                <div style={{
                    marginTop: '15px',
                    color: theme.textMuted,
                    fontSize: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <span>Click = Flip</span>
                    <span>Right-click = Mark</span>
                    <span>Space = Cash Out</span>
                    <span>ESC = Exit</span>
                </div>

                {/* Tutorial Overlay */}
                {showTutorial && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: theme.bgPanel,
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '450px',
                            textAlign: 'center',
                            border: `2px solid ${theme.accent}`
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: theme.textMuted,
                                marginBottom: '10px'
                            }}>
                                Tutorial {tutorialStep + 1}/{tutorialSteps.length}
                            </div>

                            <h2 style={{
                                color: theme.accent,
                                marginBottom: '15px',
                                fontSize: '24px'
                            }}>
                                {tutorialSteps[tutorialStep].title}
                            </h2>

                            <p style={{
                                color: theme.textSecondary,
                                lineHeight: '1.6',
                                marginBottom: '25px',
                                fontSize: '16px'
                            }}>
                                {tutorialSteps[tutorialStep].content}
                            </p>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    style={{
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        background: 'transparent',
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: '8px',
                                        color: theme.textMuted,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Skip Tutorial
                                </button>
                                <button
                                    onClick={() => {
                                        if (tutorialStep < tutorialSteps.length - 1) {
                                            setTutorialStep(prev => prev + 1);
                                        } else {
                                            setShowTutorial(false);
                                        }
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {tutorialStep < tutorialSteps.length - 1 ? 'Next →' : 'Start Playing!'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Overlay */}
                {roundResult && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.88)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        animation: celebrateAnimation ? 'celebrate 0.5s ease-out' : 'none'
                    }}>
                        <div style={{
                            fontSize: '100px',
                            marginBottom: '20px',
                            animation: roundResult === 'win' ? 'bounce 0.5s ease infinite alternate' :
                                       roundResult === 'lose' ? 'shake 0.3s ease' : 'none'
                        }}>
                            {roundResult === 'win' ? '🏆' : roundResult === 'cashout' ? '💰' : '💥'}
                        </div>

                        <h2 style={{
                            fontSize: '40px',
                            marginBottom: '15px',
                            color: roundResult === 'lose' ? theme.error : theme.gold,
                            textShadow: `0 0 30px ${roundResult === 'lose' ? theme.errorGlow : theme.goldGlow}`
                        }}>
                            {roundResult === 'win' ? 'PERFECT CLEAR!' :
                             roundResult === 'cashout' ? 'CASHED OUT!' : 'TRAP HIT!'}
                        </h2>

                        {roundResult !== 'lose' && (
                            <div style={{
                                fontSize: '56px',
                                color: theme.gold,
                                marginBottom: '10px',
                                fontWeight: 'bold',
                                textShadow: `0 0 25px ${theme.goldGlow}`
                            }}>
                                +{roundResult === 'win'
                                    ? 4 + (streak >= 3 ? 1 : 0) + (streak >= 5 ? 1 : 0)
                                    : currentScore >= 16 ? 3
                                    : currentScore >= 8 ? 2
                                    : currentScore >= 4 ? 1
                                    : currentScore >= 2 ? 1 : 0} Stars
                            </div>
                        )}

                        {roundResult === 'win' && streak > 1 && (
                            <div style={{
                                fontSize: '20px',
                                color: theme.honey,
                                marginBottom: '10px'
                            }}>
                                🔥 {streak} Win Streak! {streak >= 3 && '+1 Bonus'}
                            </div>
                        )}

                        {roundResult === 'lose' && (
                            <>
                                <div style={{
                                    fontSize: '20px',
                                    color: theme.error,
                                    marginBottom: '20px'
                                }}>
                                    Score reset to 0
                                </div>
                                <button
                                    onClick={() => setShowSolution(true)}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        background: 'transparent',
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: '8px',
                                        color: theme.textMuted,
                                        cursor: 'pointer',
                                        marginBottom: '20px'
                                    }}
                                >
                                    Show Solution
                                </button>
                            </>
                        )}

                        {/* Show solution grid */}
                        {showSolution && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '15px',
                                background: theme.bgPanel,
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: theme.textMuted,
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }}>
                                    Solution (x2=🟡, x3=⭐, trap=💥)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {grid.map((row, y) => (
                                        <div key={y} style={{ display: 'flex', gap: '4px' }}>
                                            {row.map((val, x) => (
                                                <div key={x} style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: val === 0 ? theme.error :
                                                               val === 3 ? theme.gold :
                                                               val === 2 ? theme.honey : theme.bgDark,
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    color: val === 0 ? '#fff' : val > 1 ? '#000' : theme.textMuted
                                                }}>
                                                    {val === 0 ? '💥' : val === 3 ? '⭐' : val === 2 ? '🟡' : 'x1'}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button
                                onClick={() => startGame(selectedOpponent, currentLevel)}
                                style={{
                                    padding: '15px 35px',
                                    fontSize: '18px',
                                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: `0 4px 20px ${theme.accent}66`
                                }}
                            >
                                Play Again
                            </button>

                            {roundResult === 'win' && currentLevel < 10 && (
                                <button
                                    onClick={() => startGame(selectedOpponent, currentLevel + 1)}
                                    style={{
                                        padding: '15px 35px',
                                        fontSize: '18px',
                                        background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#000',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        boxShadow: `0 4px 20px ${theme.successGlow}`
                                    }}
                                >
                                    Next Level →
                                </button>
                            )}

                            <button
                                onClick={() => setGameState('level_select')}
                                style={{
                                    padding: '15px 35px',
                                    fontSize: '18px',
                                    background: 'transparent',
                                    border: `2px solid ${theme.border}`,
                                    borderRadius: '12px',
                                    color: theme.textSecondary,
                                    cursor: 'pointer'
                                }}
                            >
                                Level Select
                            </button>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-10px); }
                        40% { transform: translateX(10px); }
                        60% { transform: translateX(-10px); }
                        80% { transform: translateX(10px); }
                    }
                    @keyframes bounce {
                        from { transform: translateY(0); }
                        to { transform: translateY(-15px); }
                    }
                    @keyframes celebrate {
                        0% { transform: scale(0.8); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};

// Render the app
ReactDOM.render(<HoneyGrid />, document.getElementById('root'));
