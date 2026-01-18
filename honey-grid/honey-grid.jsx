const { useState, useEffect, useCallback, useMemo, useRef } = React;

/**
 * HONEY GRID - Professional Voltorb Flip-Style Deduction Puzzle
 *
 * Progression System:
 * - 10 Worlds (opponents), each with 10 Levels
 * - Each level awards up to 1 star (in increments of 0.25)
 * - Need 10 stars to unlock next world
 * - World N Level 10 is easier than World N+1 Level 1 (difficulty steps between worlds)
 * - Stars: 0.25 (cash out ≥4), 0.5 (cash out ≥8), 0.75 (complete), 1.0 (perfect - only multipliers flipped)
 */

const HoneyGrid = () => {
    // Theme
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
        bronze: '#cd7f32', silver: '#c0c0c0', platinum: '#e5e4e2'
    };

    /**
     * LEVEL CONFIGURATIONS
     * Each world has 10 levels with specific configurations
     * Difficulty increases within world, then jumps at new world
     * World N Level 10 < World N+1 Level 1 in difficulty
     */
    const levelConfigs = {
        // World 0: Funky Frog - Tutorial (Learning basics)
        0: [
            { traps: 1, mults: 3, x3Chance: 0, safeRows: 2, safeCols: 1, targetScore: 8 },   // L1: Super easy
            { traps: 1, mults: 3, x3Chance: 0, safeRows: 2, safeCols: 0, targetScore: 8 },   // L2
            { traps: 1, mults: 4, x3Chance: 0, safeRows: 2, safeCols: 0, targetScore: 12 },  // L3
            { traps: 2, mults: 3, x3Chance: 0, safeRows: 2, safeCols: 0, targetScore: 8 },   // L4
            { traps: 2, mults: 4, x3Chance: 0, safeRows: 1, safeCols: 1, targetScore: 12 },  // L5
            { traps: 2, mults: 4, x3Chance: 0, safeRows: 1, safeCols: 0, targetScore: 16 },  // L6
            { traps: 2, mults: 5, x3Chance: 0, safeRows: 1, safeCols: 0, targetScore: 24 },  // L7
            { traps: 3, mults: 4, x3Chance: 0, safeRows: 1, safeCols: 0, targetScore: 16 },  // L8
            { traps: 3, mults: 5, x3Chance: 0, safeRows: 1, safeCols: 0, targetScore: 24 },  // L9
            { traps: 3, mults: 5, x3Chance: 0, safeRows: 1, safeCols: 0, targetScore: 32 },  // L10: Comfortable
        ],
        // World 1: Cheeky Chicken - x3 tiles introduced (jump: 3→4 traps, adds x3)
        1: [
            { traps: 4, mults: 4, x3Chance: 0.25, safeRows: 1, safeCols: 0, targetScore: 24 },  // L1: Step up!
            { traps: 4, mults: 4, x3Chance: 0.30, safeRows: 1, safeCols: 0, targetScore: 32 },
            { traps: 4, mults: 5, x3Chance: 0.30, safeRows: 1, safeCols: 0, targetScore: 48 },
            { traps: 4, mults: 5, x3Chance: 0.35, safeRows: 1, safeCols: 0, targetScore: 48 },
            { traps: 5, mults: 5, x3Chance: 0.35, safeRows: 1, safeCols: 0, targetScore: 48 },
            { traps: 5, mults: 5, x3Chance: 0.35, safeRows: 0, safeCols: 1, targetScore: 64 },
            { traps: 5, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 1, targetScore: 72 },
            { traps: 5, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 0, targetScore: 96 },
            { traps: 5, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 0, targetScore: 96 },
            { traps: 5, mults: 7, x3Chance: 0.40, safeRows: 0, safeCols: 0, targetScore: 128 }, // L10
        ],
        // World 2: Disco Dinosaur - More traps, tighter play (jump: 5→6 traps)
        2: [
            { traps: 6, mults: 5, x3Chance: 0.35, safeRows: 1, safeCols: 0, targetScore: 48 },
            { traps: 6, mults: 5, x3Chance: 0.35, safeRows: 0, safeCols: 1, targetScore: 64 },
            { traps: 6, mults: 6, x3Chance: 0.35, safeRows: 0, safeCols: 1, targetScore: 72 },
            { traps: 6, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 0, targetScore: 96 },
            { traps: 7, mults: 5, x3Chance: 0.40, safeRows: 0, safeCols: 1, targetScore: 64 },
            { traps: 7, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 0, targetScore: 96 },
            { traps: 7, mults: 6, x3Chance: 0.45, safeRows: 0, safeCols: 0, targetScore: 128 },
            { traps: 7, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, targetScore: 144 },
            { traps: 7, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, targetScore: 192 },
            { traps: 7, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, targetScore: 192 },
        ],
        // World 3: Radical Raccoon - Fuzzy hints introduced (jump: adds fuzzy mechanic)
        3: [
            { traps: 6, mults: 6, x3Chance: 0.40, safeRows: 1, safeCols: 0, fuzzyChance: 0.20, targetScore: 72 },
            { traps: 6, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 1, fuzzyChance: 0.25, targetScore: 96 },
            { traps: 7, mults: 6, x3Chance: 0.40, safeRows: 0, safeCols: 1, fuzzyChance: 0.25, targetScore: 96 },
            { traps: 7, mults: 6, x3Chance: 0.45, safeRows: 0, safeCols: 0, fuzzyChance: 0.30, targetScore: 128 },
            { traps: 7, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, fuzzyChance: 0.30, targetScore: 144 },
            { traps: 8, mults: 6, x3Chance: 0.45, safeRows: 0, safeCols: 0, fuzzyChance: 0.30, targetScore: 128 },
            { traps: 8, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, fuzzyChance: 0.35, targetScore: 192 },
            { traps: 8, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, fuzzyChance: 0.35, targetScore: 216 },
            { traps: 8, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, fuzzyChance: 0.40, targetScore: 256 },
            { traps: 8, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, fuzzyChance: 0.40, targetScore: 288 },
        ],
        // World 4: Electric Eel - Hidden hints (jump: adds hidden hints)
        4: [
            { traps: 7, mults: 6, x3Chance: 0.40, safeRows: 1, safeCols: 0, hiddenChance: 0.15, targetScore: 96 },
            { traps: 7, mults: 7, x3Chance: 0.40, safeRows: 0, safeCols: 1, hiddenChance: 0.20, targetScore: 144 },
            { traps: 7, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, hiddenChance: 0.20, targetScore: 192 },
            { traps: 8, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, hiddenChance: 0.25, targetScore: 192 },
            { traps: 8, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 0, hiddenChance: 0.25, targetScore: 216 },
            { traps: 8, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, hiddenChance: 0.25, targetScore: 256 },
            { traps: 8, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, hiddenChance: 0.30, targetScore: 288 },
            { traps: 9, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, hiddenChance: 0.30, targetScore: 256 },
            { traps: 9, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, hiddenChance: 0.30, targetScore: 324 },
            { traps: 9, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, hiddenChance: 0.35, targetScore: 384 },
        ],
        // World 5: Mysterious Moth - Clustered traps (jump: adds clustering)
        5: [
            { traps: 7, mults: 7, x3Chance: 0.45, safeRows: 1, safeCols: 0, clustered: true, targetScore: 144 },
            { traps: 8, mults: 7, x3Chance: 0.45, safeRows: 0, safeCols: 1, clustered: true, targetScore: 192 },
            { traps: 8, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, clustered: true, targetScore: 216 },
            { traps: 8, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, clustered: true, targetScore: 256 },
            { traps: 9, mults: 7, x3Chance: 0.50, safeRows: 0, safeCols: 0, clustered: true, targetScore: 256 },
            { traps: 9, mults: 8, x3Chance: 0.50, safeRows: 0, safeCols: 0, clustered: true, targetScore: 288 },
            { traps: 9, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, clustered: true, targetScore: 324 },
            { traps: 10, mults: 7, x3Chance: 0.55, safeRows: 0, safeCols: 0, clustered: true, targetScore: 288 },
            { traps: 10, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, clustered: true, targetScore: 384 },
            { traps: 10, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, clustered: true, targetScore: 432 },
        ],
        // World 6: Professor Penguin - High reward density (jump: more x3s, more mults)
        6: [
            { traps: 8, mults: 9, x3Chance: 0.55, safeRows: 0, safeCols: 1, targetScore: 432 },
            { traps: 8, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 486 },
            { traps: 9, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 512 },
            { traps: 9, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 576 },
            { traps: 9, mults: 10, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 648 },
            { traps: 10, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 576 },
            { traps: 10, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 648 },
            { traps: 10, mults: 10, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 729 },
            { traps: 10, mults: 10, x3Chance: 0.70, safeRows: 0, safeCols: 0, targetScore: 864 },
            { traps: 11, mults: 10, x3Chance: 0.70, safeRows: 0, safeCols: 0, targetScore: 972 },
        ],
        // World 7: Sly Snake - Diagonal patterns (jump: adds diagonal mechanic)
        7: [
            { traps: 9, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 1, diagonal: true, targetScore: 384 },
            { traps: 9, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 432 },
            { traps: 9, mults: 9, x3Chance: 0.55, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 486 },
            { traps: 10, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 432 },
            { traps: 10, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 512 },
            { traps: 10, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 576 },
            { traps: 10, mults: 9, x3Chance: 0.60, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 648 },
            { traps: 11, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 512 },
            { traps: 11, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 648 },
            { traps: 11, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, diagonal: true, targetScore: 729 },
        ],
        // World 8: Wolf Warrior - Heavy trap density (jump: 11→12 traps)
        8: [
            { traps: 12, mults: 7, x3Chance: 0.55, safeRows: 0, safeCols: 1, targetScore: 324 },
            { traps: 12, mults: 7, x3Chance: 0.55, safeRows: 0, safeCols: 0, targetScore: 384 },
            { traps: 12, mults: 8, x3Chance: 0.55, safeRows: 0, safeCols: 0, targetScore: 432 },
            { traps: 12, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 486 },
            { traps: 12, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, targetScore: 512 },
            { traps: 12, mults: 8, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 576 },
            { traps: 12, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 648 },
            { traps: 12, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, targetScore: 729 },
            { traps: 12, mults: 9, x3Chance: 0.70, safeRows: 0, safeCols: 0, targetScore: 864 },
            { traps: 12, mults: 9, x3Chance: 0.70, safeRows: 0, safeCols: 0, targetScore: 972 },
        ],
        // World 9: Grand Master Grizzly - All mechanics combined (jump: all mechanics)
        9: [
            { traps: 10, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 1, fuzzyChance: 0.15, hiddenChance: 0.10, clustered: true, targetScore: 512 },
            { traps: 10, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, fuzzyChance: 0.20, hiddenChance: 0.15, clustered: true, targetScore: 576 },
            { traps: 11, mults: 8, x3Chance: 0.60, safeRows: 0, safeCols: 0, fuzzyChance: 0.20, hiddenChance: 0.15, diagonal: true, targetScore: 576 },
            { traps: 11, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, fuzzyChance: 0.25, hiddenChance: 0.15, clustered: true, targetScore: 729 },
            { traps: 11, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, fuzzyChance: 0.25, hiddenChance: 0.20, diagonal: true, targetScore: 864 },
            { traps: 12, mults: 8, x3Chance: 0.65, safeRows: 0, safeCols: 0, fuzzyChance: 0.25, hiddenChance: 0.20, clustered: true, targetScore: 729 },
            { traps: 12, mults: 9, x3Chance: 0.65, safeRows: 0, safeCols: 0, fuzzyChance: 0.30, hiddenChance: 0.20, diagonal: true, targetScore: 972 },
            { traps: 12, mults: 9, x3Chance: 0.70, safeRows: 0, safeCols: 0, fuzzyChance: 0.30, hiddenChance: 0.25, clustered: true, diagonal: true, targetScore: 1024 },
            { traps: 12, mults: 9, x3Chance: 0.70, safeRows: 0, safeCols: 0, fuzzyChance: 0.35, hiddenChance: 0.25, clustered: true, diagonal: true, targetScore: 1296 },
            { traps: 12, mults: 10, x3Chance: 0.75, safeRows: 0, safeCols: 0, fuzzyChance: 0.35, hiddenChance: 0.30, clustered: true, diagonal: true, targetScore: 1536 },
        ],
    };

    // Opponents/Worlds
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Beginner',
            description: 'Learn the basics with simple puzzles',
            mechanic: 'Tutorial - Safe rows guaranteed!',
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Cunning Clucker',
            description: 'x3 multipliers appear for bigger scores!',
            mechanic: 'x3 tiles introduced!',
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Groovy Giant',
            description: 'More traps, tighter deductions needed',
            mechanic: 'Denser trap fields!',
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trash Tactician',
            description: 'Some sums shown as ranges (±1)',
            mechanic: 'Fuzzy hints (~) appear!',
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Shocking Strategist',
            description: 'Some hints hidden until you reveal tiles',
            mechanic: 'Hidden hints (?) appear!',
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Light Seeker',
            description: 'Traps cluster together in groups',
            mechanic: 'Clustered trap patterns!',
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Antarctic Academic',
            description: 'Dense grids with high-value tiles',
            mechanic: 'High reward density!',
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Slithering Schemer',
            description: 'Traps form diagonal patterns',
            mechanic: 'Diagonal trap lines!',
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Leader',
            description: 'Maximum trap density - every move counts',
            mechanic: 'Heavy trap fields!',
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Champion',
            description: 'All mechanics combined - prove mastery!',
            mechanic: 'Master challenge!',
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
    const [marks, setMarks] = useState([]);
    const [rowHints, setRowHints] = useState([]);
    const [colHints, setColHints] = useState([]);
    const [hiddenHints, setHiddenHints] = useState({ rows: new Set(), cols: new Set() });
    const [revealedHints, setRevealedHints] = useState({ rows: new Set(), cols: new Set() });
    const [levelConfig, setLevelConfig] = useState(null);

    // Interaction state
    const [hoveredTile, setHoveredTile] = useState(null);
    const [hoveredHint, setHoveredHint] = useState(null);

    // Game progress
    const [currentScore, setCurrentScore] = useState(1);
    const [roundResult, setRoundResult] = useState(null);
    const [totalMultipliers, setTotalMultipliers] = useState(0);
    const [foundMultipliers, setFoundMultipliers] = useState(0);
    const [x1sFlipped, setX1sFlipped] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);
    const [showSolution, setShowSolution] = useState(false);

    // Animation states
    const [flipAnimation, setFlipAnimation] = useState(null);
    const [shakeAnimation, setShakeAnimation] = useState(false);
    const [celebrateAnimation, setCelebrateAnimation] = useState(false);
    const [particles, setParticles] = useState([]);

    // Progression - now stores stars per level (0, 0.25, 0.5, 0.75, or 1)
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('honeygrid_progression_v3');
        if (saved) return JSON.parse(saved);
        return {
            levelStars: Array(10).fill(null).map(() => Array(10).fill(0)), // [world][level] = stars (0-1)
            totalWins: 0,
            perfectClears: 0,
        };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('honeygrid_progression_v3', JSON.stringify(progression));
    }, [progression]);

    // Calculate world stars (sum of all level stars in that world)
    const getWorldStars = (worldIdx) => {
        return progression.levelStars[worldIdx].reduce((sum, stars) => sum + stars, 0);
    };

    // Check if world is unlocked (need 10 stars from previous world)
    const isWorldUnlocked = (worldIdx) => {
        if (worldIdx === 0) return true;
        return getWorldStars(worldIdx - 1) >= 10;
    };

    // Check if level is unlocked (previous level must have at least 0.25 stars, or it's level 1)
    const isLevelUnlocked = (worldIdx, levelIdx) => {
        if (!isWorldUnlocked(worldIdx)) return false;
        if (levelIdx === 0) return true;
        return progression.levelStars[worldIdx][levelIdx - 1] >= 0.25;
    };

    // Get star rating for display
    const getLevelStars = (worldIdx, levelIdx) => {
        return progression.levelStars[worldIdx][levelIdx];
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

    // Generate grid based on level config
    const generateGrid = useCallback((config) => {
        const size = 5;
        const grid = Array(size).fill(null).map(() => Array(size).fill(1));

        // Determine safe rows/cols
        const safeRows = new Set();
        const safeCols = new Set();

        while (safeRows.size < (config.safeRows || 0)) {
            safeRows.add(Math.floor(Math.random() * size));
        }
        while (safeCols.size < (config.safeCols || 0)) {
            safeCols.add(Math.floor(Math.random() * size));
        }

        // Place traps
        let trapPositions = [];

        if (config.clustered) {
            // Cluster traps together
            const clusterCount = Math.ceil(config.traps / 4);
            for (let c = 0; c < clusterCount && trapPositions.length < config.traps; c++) {
                let cx, cy, attempts = 0;
                do {
                    cx = Math.floor(Math.random() * size);
                    cy = Math.floor(Math.random() * size);
                    attempts++;
                } while ((safeRows.has(cy) || safeCols.has(cx)) && attempts < 50);

                if (!trapPositions.some(([px, py]) => px === cx && py === cy)) {
                    trapPositions.push([cx, cy]);
                }

                const neighbors = [
                    [cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1],
                    [cx-1, cy-1], [cx+1, cy+1], [cx-1, cy+1], [cx+1, cy-1]
                ].filter(([x, y]) =>
                    x >= 0 && x < size && y >= 0 && y < size &&
                    !safeRows.has(y) && !safeCols.has(x)
                );

                for (const [nx, ny] of neighbors) {
                    if (trapPositions.length >= config.traps) break;
                    if (Math.random() < 0.5 && !trapPositions.some(([px, py]) => px === nx && py === ny)) {
                        trapPositions.push([nx, ny]);
                    }
                }
            }
        } else if (config.diagonal) {
            // Diagonal pattern
            const startX = Math.floor(Math.random() * 3);
            const startY = Math.floor(Math.random() * 3);
            const dir = Math.random() < 0.5 ? 1 : -1;

            for (let i = 0; i < size && trapPositions.length < config.traps; i++) {
                const x = (startX + i) % size;
                const y = (startY + i * dir + size) % size;
                if (!safeRows.has(y) && !safeCols.has(x)) {
                    trapPositions.push([x, y]);
                }
            }
        }

        // Fill remaining traps randomly
        let attempts = 0;
        while (trapPositions.length < config.traps && attempts < 200) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            attempts++;

            if (safeRows.has(y) || safeCols.has(x)) continue;
            if (trapPositions.some(([px, py]) => px === x && py === y)) continue;
            trapPositions.push([x, y]);
        }

        // Place traps on grid
        for (const [x, y] of trapPositions) {
            grid[y][x] = 0;
        }

        // Collect non-trap positions for multipliers
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

        let placed = 0;
        for (const [x, y] of nonTrapPositions) {
            if (placed >= config.mults) break;
            const value = Math.random() < (config.x3Chance || 0) ? 3 : 2;
            grid[y][x] = value;
            placed++;
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

            let rowHint = { sum: rowSum, traps: rowTraps, fuzzy: false };
            if ((config.fuzzyChance || 0) > 0 && Math.random() < config.fuzzyChance && rowTraps > 0) {
                rowHint.sum = Math.max(0, rowSum + (Math.random() < 0.5 ? -1 : 1));
                rowHint.fuzzy = true;
            }
            rowHints.push(rowHint);

            let colSum = 0, colTraps = 0;
            for (let j = 0; j < size; j++) {
                if (grid[j][i] === 0) colTraps++;
                else colSum += grid[j][i];
            }

            let colHint = { sum: colSum, traps: colTraps, fuzzy: false };
            if ((config.fuzzyChance || 0) > 0 && Math.random() < config.fuzzyChance && colTraps > 0) {
                colHint.sum = Math.max(0, colSum + (Math.random() < 0.5 ? -1 : 1));
                colHint.fuzzy = true;
            }
            colHints.push(colHint);
        }

        // Hidden hints
        const hiddenRows = new Set();
        const hiddenCols = new Set();
        if ((config.hiddenChance || 0) > 0) {
            for (let i = 0; i < size; i++) {
                if (rowHints[i].traps > 0 && Math.random() < config.hiddenChance) {
                    hiddenRows.add(i);
                }
                if (colHints[i].traps > 0 && Math.random() < config.hiddenChance) {
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

        return { grid, rowHints, colHints, hiddenHints: { rows: hiddenRows, cols: hiddenCols }, totalMultipliers: totalMult };
    }, []);

    // Start game
    const startGame = useCallback((opponent, level) => {
        const config = levelConfigs[opponent.id][level - 1];
        const result = generateGrid(config);

        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setLevelConfig(config);
        setGrid(result.grid);
        setRowHints(result.rowHints);
        setColHints(result.colHints);
        setHiddenHints(result.hiddenHints);
        setRevealedHints({ rows: new Set(), cols: new Set() });
        setRevealed(Array(5).fill(null).map(() => Array(5).fill(false)));
        setMarks(Array(5).fill(null).map(() => Array(5).fill(null).map(() => ({ flagged: null }))));
        setCurrentScore(1);
        setRoundResult(null);
        setTotalMultipliers(result.totalMultipliers);
        setFoundMultipliers(0);
        setX1sFlipped(0);
        setMoveHistory([]);
        setShowSolution(false);
        setFlipAnimation(null);
        setShakeAnimation(false);
        setCelebrateAnimation(false);
        setParticles([]);
        setGameState('playing');

        // Tutorial for first time
        if (opponent.id === 0 && level === 1 && progression.levelStars[0][0] === 0) {
            setShowTutorial(true);
            setTutorialStep(0);
        }
    }, [generateGrid, progression.levelStars]);

    // Handle tile flip
    const flipTile = useCallback((x, y) => {
        if (revealed[y][x] || roundResult) return;

        const value = grid[y][x];

        setMoveHistory(prev => [...prev, {
            x, y, score: currentScore, revealed: revealed.map(r => [...r]),
            foundMultipliers, x1sFlipped
        }]);

        setFlipAnimation({ x, y, value });

        setTimeout(() => {
            const newRevealed = revealed.map(row => [...row]);
            newRevealed[y][x] = true;
            setRevealed(newRevealed);

            setRevealedHints(prev => ({
                rows: new Set([...prev.rows, y]),
                cols: new Set([...prev.cols, x])
            }));

            if (value === 0) {
                setShakeAnimation(true);
                setTimeout(() => setShakeAnimation(false), 500);
                setCurrentScore(0);
                setRoundResult('lose');
            } else {
                const newScore = currentScore * value;
                setCurrentScore(newScore);

                if (value === 1) {
                    setX1sFlipped(prev => prev + 1);
                }

                if (value > 1) {
                    const tileElement = document.querySelector(`[data-tile="${x}-${y}"]`);
                    if (tileElement) {
                        const rect = tileElement.getBoundingClientRect();
                        spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 8,
                            value === 3 ? theme.gold : theme.honey);
                    }

                    const newFound = foundMultipliers + 1;
                    setFoundMultipliers(newFound);

                    if (newFound >= totalMultipliers) {
                        setCelebrateAnimation(true);
                        setRoundResult('win');
                    }
                }
            }

            setFlipAnimation(null);
        }, 150);
    }, [revealed, roundResult, grid, currentScore, foundMultipliers, totalMultipliers, spawnParticles, theme, x1sFlipped]);

    // Mark tile
    const cycleMark = useCallback((x, y, e) => {
        e.preventDefault();
        if (revealed[y][x] || roundResult) return;

        setMarks(prev => {
            const newMarks = prev.map(row => row.map(m => ({...m})));
            const current = newMarks[y][x];
            current.flagged = current.flagged === null ? 'safe' : current.flagged === 'safe' ? 'trap' : null;
            return newMarks;
        });
    }, [revealed, roundResult]);

    // Auto-mark safe
    const autoMarkSafe = useCallback(() => {
        setMarks(prev => {
            const newMarks = prev.map(row => row.map(m => ({...m})));
            for (let i = 0; i < 5; i++) {
                if (rowHints[i]?.traps === 0) {
                    for (let j = 0; j < 5; j++) {
                        if (!revealed[i][j]) newMarks[i][j].flagged = 'safe';
                    }
                }
                if (colHints[i]?.traps === 0) {
                    for (let j = 0; j < 5; j++) {
                        if (!revealed[j][i]) newMarks[j][i].flagged = 'safe';
                    }
                }
            }
            return newMarks;
        });
    }, [rowHints, colHints, revealed]);

    // Undo
    const undoMove = useCallback(() => {
        if (moveHistory.length === 0 || roundResult) return;
        const lastMove = moveHistory[moveHistory.length - 1];
        setRevealed(lastMove.revealed);
        setCurrentScore(lastMove.score);
        setFoundMultipliers(lastMove.foundMultipliers);
        setX1sFlipped(lastMove.x1sFlipped);
        setMoveHistory(prev => prev.slice(0, -1));
    }, [moveHistory, roundResult]);

    // Cash out
    const cashOut = useCallback(() => {
        if (roundResult) return;
        setRoundResult('cashout');
    }, [roundResult]);

    // Calculate earned stars based on result
    const calculateEarnedStars = useCallback(() => {
        if (roundResult === 'lose') return 0;

        if (roundResult === 'win') {
            // Perfect clear = 1 star, with x1s = 0.75 stars
            return x1sFlipped === 0 ? 1 : 0.75;
        }

        if (roundResult === 'cashout') {
            // Based on score
            if (currentScore >= (levelConfig?.targetScore || 8)) return 0.5;
            if (currentScore >= 8) return 0.5;
            if (currentScore >= 4) return 0.25;
            return 0;
        }

        return 0;
    }, [roundResult, x1sFlipped, currentScore, levelConfig]);

    // Handle round end
    useEffect(() => {
        if (!roundResult || !selectedOpponent) return;

        const earnedStars = calculateEarnedStars();

        if (earnedStars > 0) {
            setProgression(prev => {
                const newLevelStars = prev.levelStars.map(world => [...world]);
                // Only update if new stars are higher
                const currentStars = newLevelStars[selectedOpponent.id][currentLevel - 1];
                if (earnedStars > currentStars) {
                    newLevelStars[selectedOpponent.id][currentLevel - 1] = earnedStars;
                }
                return {
                    ...prev,
                    levelStars: newLevelStars,
                    totalWins: prev.totalWins + (roundResult === 'win' ? 1 : 0),
                    perfectClears: prev.perfectClears + (roundResult === 'win' && x1sFlipped === 0 ? 1 : 0),
                };
            });
        }
    }, [roundResult, selectedOpponent, currentLevel, calculateEarnedStars, x1sFlipped]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (showTutorial) setShowTutorial(false);
                else if (gameState === 'playing') setGameState('level_select');
                else if (gameState !== 'menu') setGameState('menu');
            }
            if (gameState === 'playing' && !roundResult) {
                if (e.code === 'Space') { e.preventDefault(); cashOut(); }
                if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undoMove(); }
                if (e.code === 'KeyA') autoMarkSafe();
            }
            if (showTutorial && (e.code === 'Space' || e.code === 'Enter')) {
                if (tutorialStep < tutorialSteps.length - 1) setTutorialStep(prev => prev + 1);
                else setShowTutorial(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, roundResult, cashOut, undoMove, autoMarkSafe, showTutorial, tutorialStep]);

    // Tutorial
    const tutorialSteps = [
        { title: "Welcome to Honey Grid!", content: "Find all honey tiles (x2 and x3) without hitting traps." },
        { title: "Reading Hints", content: "Each row/column shows the SUM of values and TRAP count (! marks)." },
        { title: "Safe Rows", content: "A row with 0 traps (✓) means ALL tiles are safe to flip!" },
        { title: "Using Deduction", content: "Compare hints. If a row has 4 traps, only 1 tile is safe!" },
        { title: "Marking Tiles", content: "Right-click to mark tiles as SAFE (blue) or TRAP (red)." },
        { title: "Earning Stars", content: "★ 0.25 = Cash out ≥4 | ★ 0.5 = Cash out ≥8 | ★ 0.75 = Complete | ★ 1.0 = Perfect!" },
        { title: "You're Ready!", content: "Get 10 stars to unlock the next world. Good luck!" }
    ];

    // Star display component
    const StarDisplay = ({ stars, size = 'normal' }) => {
        const starSize = size === 'small' ? 14 : 20;
        const fullStars = Math.floor(stars);
        const partialStar = stars - fullStars;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {/* Full star */}
                {fullStars >= 1 && (
                    <span style={{ fontSize: `${starSize}px`, color: theme.gold }}>★</span>
                )}
                {/* Partial star */}
                {partialStar > 0 && (
                    <span style={{
                        fontSize: `${starSize}px`,
                        color: partialStar >= 0.75 ? theme.gold : partialStar >= 0.5 ? theme.silver : theme.bronze,
                        opacity: partialStar >= 0.75 ? 1 : partialStar >= 0.5 ? 0.9 : 0.7
                    }}>
                        {partialStar >= 0.75 ? '¾' : partialStar >= 0.5 ? '½' : '¼'}
                    </span>
                )}
                {stars === 0 && <span style={{ fontSize: `${starSize}px`, color: theme.textMuted }}>☆</span>}
            </div>
        );
    };

    // World stars bar
    const WorldStarsBar = ({ worldIdx }) => {
        const totalStars = getWorldStars(worldIdx);
        const starCount = Math.floor(totalStars);
        const partial = totalStars - starCount;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '1px' }}>
                    {Array(10).fill(0).map((_, i) => {
                        let fillColor = theme.bgDark;
                        let opacity = 0.3;

                        if (i < starCount) {
                            fillColor = theme.gold;
                            opacity = 1;
                        } else if (i === starCount && partial > 0) {
                            fillColor = partial >= 0.75 ? theme.gold : partial >= 0.5 ? theme.silver : theme.bronze;
                            opacity = partial >= 0.75 ? 0.9 : partial >= 0.5 ? 0.7 : 0.5;
                        }

                        return (
                            <div key={i} style={{
                                width: '10px', height: '10px',
                                background: fillColor,
                                opacity,
                                borderRadius: '2px',
                                border: `1px solid ${i < totalStars ? theme.gold : theme.border}`
                            }} />
                        );
                    })}
                </div>
                <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '4px' }}>
                    {totalStars.toFixed(totalStars % 1 === 0 ? 0 : 2)}/10
                </span>
            </div>
        );
    };

    // Hint display
    const HintDisplay = ({ hint, hidden, revealed: hintRevealed, direction, index, isHighlighted }) => {
        const isHidden = hidden && !hintRevealed;
        const isSafe = hint?.traps === 0;
        const isDangerous = hint?.traps >= 3;

        if (isHidden) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', width: '52px', height: '52px',
                    background: theme.bgDark, borderRadius: '10px',
                    border: `2px solid ${theme.border}`
                }}>
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
                    justifyContent: 'center', gap: '3px', width: '52px', height: '52px',
                    background: isSafe ? `${theme.safe}33` : isDangerous ? `${theme.error}22` : theme.bgDark,
                    borderRadius: '10px',
                    border: `2px solid ${isHighlighted ? theme.accentBright : isSafe ? theme.safe : isDangerous ? theme.error : theme.border}`,
                    boxShadow: isHighlighted ? `0 0 15px ${theme.accentBright}66` : 'none',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{
                    fontSize: '18px', fontWeight: 'bold',
                    color: hint?.fuzzy ? theme.textMuted : theme.honey
                }}>
                    {hint?.fuzzy ? `~${hint.sum}` : hint?.sum}
                </div>
                <div style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: isSafe ? theme.success : theme.error
                }}>
                    {hint?.traps === 0 ? '✓' : '!'.repeat(hint?.traps || 0)}
                </div>
            </div>
        );
    };

    // Tile component
    const Tile = ({ x, y }) => {
        const isRevealed = revealed[y]?.[x];
        const value = grid[y]?.[x];
        const mark = marks[y]?.[x];
        const isFlipping = flipAnimation?.x === x && flipAnimation?.y === y;
        const isHighlighted = (hoveredHint?.type === 'row' && hoveredHint?.index === y) ||
                             (hoveredHint?.type === 'col' && hoveredHint?.index === x);
        const isInSafeZone = (rowHints[y]?.traps === 0) || (colHints[x]?.traps === 0);

        const getStyle = () => {
            if (!isRevealed) {
                const flagColor = mark?.flagged === 'safe' ? theme.safe : mark?.flagged === 'trap' ? theme.error : null;
                return {
                    bg: flagColor ? `${flagColor}33` : isHighlighted ? theme.bgHover : theme.bgPanel,
                    border: flagColor || (isHighlighted ? theme.borderBright : theme.accent),
                    content: mark?.flagged === 'safe' ? '✓' : mark?.flagged === 'trap' ? '✗' : '?'
                };
            }
            switch(value) {
                case 0: return { bg: theme.error, border: theme.error, content: '💥', glow: theme.errorGlow };
                case 1: return { bg: theme.bgDark, border: theme.border, content: 'x1', textColor: theme.textMuted };
                case 2: return { bg: theme.honey, border: theme.honey, content: 'x2', textColor: '#000', glow: theme.honeyGlow };
                case 3: return { bg: theme.gold, border: theme.gold, content: 'x3', textColor: '#000', glow: theme.goldGlow };
                default: return { bg: theme.bgPanel, border: theme.border, content: '?' };
            }
        };

        const style = getStyle();

        return (
            <div
                data-tile={`${x}-${y}`}
                onClick={() => flipTile(x, y)}
                onContextMenu={(e) => cycleMark(x, y, e)}
                onMouseEnter={() => !isRevealed && setHoveredTile({ x, y })}
                onMouseLeave={() => setHoveredTile(null)}
                style={{
                    width: '56px', height: '56px',
                    background: style.bg, border: `2px solid ${style.border}`,
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isRevealed || roundResult ? 'default' : 'pointer',
                    fontSize: isRevealed ? '20px' : '22px', fontWeight: 'bold',
                    color: style.textColor || theme.text,
                    transition: 'all 0.15s ease',
                    transform: isFlipping ? 'rotateY(90deg) scale(1.1)' :
                               (hoveredTile?.x === x && hoveredTile?.y === y) ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: style.glow ? `0 0 15px ${style.glow}` :
                               isHighlighted ? `0 0 12px ${theme.accentBright}44` : 'none',
                    position: 'relative'
                }}
            >
                {style.content}
                {!isRevealed && isInSafeZone && !mark?.flagged && (
                    <div style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '8px', height: '8px', background: theme.safe,
                        borderRadius: '50%', opacity: 0.7
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
                <div style={{ fontSize: '80px', marginBottom: '15px', animation: 'float 3s ease-in-out infinite' }}>🍯</div>
                <h1 style={{ fontSize: '42px', marginBottom: '8px', color: theme.accent }}>HONEY GRID</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '30px' }}>A Deduction Puzzle Game</p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: `0 6px 25px ${theme.accent}66`
                    }}
                >
                    PLAY
                </button>

                {progression.totalWins > 0 && (
                    <div style={{
                        marginTop: '25px', padding: '12px 24px',
                        background: theme.bgPanel, borderRadius: '10px',
                        display: 'flex', gap: '30px', fontSize: '14px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>{progression.totalWins}</div>
                            <div style={{ color: theme.textMuted }}>Wins</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.platinum, fontWeight: 'bold', fontSize: '18px' }}>{progression.perfectClears}</div>
                            <div style={{ color: theme.textMuted }}>Perfect</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: theme.accent, fontWeight: 'bold', fontSize: '18px' }}>
                                {opponents.filter((_, i) => getWorldStars(i) >= 10).length}/10
                            </div>
                            <div style={{ color: theme.textMuted }}>Worlds</div>
                        </div>
                    </div>
                )}

                <div style={{
                    marginTop: '35px', padding: '25px',
                    background: theme.bgPanel, borderRadius: '16px',
                    maxWidth: '450px', textAlign: 'left'
                }}>
                    <h3 style={{ color: theme.accent, marginBottom: '18px' }}>How to Earn Stars</h3>
                    <div style={{ color: theme.textSecondary, lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ color: theme.bronze }}>¼★</span> Cash out with score ≥ 4
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ color: theme.silver }}>½★</span> Cash out with score ≥ 8 or target
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ color: theme.gold }}>¾★</span> Complete level (all multipliers)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: theme.gold }}>★</span> Perfect! (Only flip multipliers)
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', color: theme.textMuted, fontSize: '13px' }}>
                        Earn 10 stars to unlock the next world!
                    </div>
                </div>

                <a href="../menu.html" style={{
                    marginTop: '25px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px',
                    padding: '10px 20px', borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                }}>← Back to Menu</a>

                <style>{`
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                `}</style>
            </div>
        );
    }

    // WORLD SELECT
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f4f 100%)`,
                padding: '25px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', maxWidth: '1200px', margin: '0 auto 25px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose World</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '18px', maxWidth: '1200px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isWorldUnlocked(idx);
                        const completed = getWorldStars(idx) >= 10;

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
                                    borderRadius: '16px', padding: '18px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s ease', position: 'relative'
                                }}
                            >
                                {!unlocked && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '24px' }}>🔒</div>}
                                {completed && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.success, padding: '4px 12px',
                                        borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#000'
                                    }}>COMPLETE</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '50px', width: '75px', height: '75px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${opp.color}22`, borderRadius: '50%'
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '2px' }}>World {idx + 1}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: opp.color, marginBottom: '2px' }}>{opp.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>{opp.title}</div>
                                        <div style={{
                                            fontSize: '12px', color: theme.textSecondary,
                                            background: `${opp.color}15`, padding: '5px 10px',
                                            borderRadius: '6px', marginBottom: '10px'
                                        }}>{opp.mechanic}</div>
                                        <WorldStarsBar worldIdx={idx} />
                                    </div>
                                </div>

                                {!unlocked && idx > 0 && (
                                    <div style={{
                                        marginTop: '12px', fontSize: '11px', color: theme.textMuted,
                                        textAlign: 'center', padding: '6px', background: theme.bgDark, borderRadius: '6px'
                                    }}>
                                        Need {(10 - getWorldStars(idx - 1)).toFixed(1)} more stars in World {idx}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // LEVEL SELECT
    if (gameState === 'level_select' && selectedOpponent) {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent.color}15 50%, ${theme.bg} 100%)`,
                padding: '25px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start', background: 'transparent',
                    border: `1px solid ${theme.border}`, color: theme.textSecondary,
                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px'
                }}>← Back</button>

                <div style={{ fontSize: '90px', marginBottom: '10px' }}>{selectedOpponent.emoji}</div>
                <div style={{ fontSize: '14px', color: theme.textMuted }}>World {selectedOpponent.id + 1}</div>
                <h2 style={{ color: selectedOpponent.color, fontSize: '32px', marginBottom: '5px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted, marginBottom: '10px' }}>{selectedOpponent.title}</p>

                <div style={{
                    padding: '12px 24px', background: `${selectedOpponent.color}15`,
                    borderRadius: '10px', color: theme.textSecondary, marginBottom: '15px'
                }}>{selectedOpponent.description}</div>

                <div style={{ marginBottom: '30px' }}>
                    <WorldStarsBar worldIdx={selectedOpponent.id} />
                </div>

                <h3 style={{ marginBottom: '20px', color: theme.textSecondary }}>Select Level</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', maxWidth: '420px' }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = isLevelUnlocked(selectedOpponent.id, i);
                        const stars = getLevelStars(selectedOpponent.id, i);
                        const config = levelConfigs[selectedOpponent.id][i];

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startGame(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '70px', height: '80px',
                                    background: stars >= 1 ? `linear-gradient(135deg, ${theme.gold}88, ${theme.gold}44)` :
                                               stars >= 0.75 ? `linear-gradient(135deg, ${theme.gold}66, ${theme.gold}33)` :
                                               stars > 0 ? `linear-gradient(135deg, ${selectedOpponent.color}88, ${selectedOpponent.color}44)` :
                                               unlocked ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)` : theme.bgDark,
                                    border: `2px solid ${stars >= 1 ? theme.gold : stars > 0 ? selectedOpponent.color : unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px', color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '18px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.4,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                }}
                            >
                                <span>{unlocked ? levelNum : '🔒'}</span>
                                {unlocked && <StarDisplay stars={stars} size="small" />}
                                {unlocked && (
                                    <span style={{ fontSize: '9px', color: theme.textMuted, opacity: 0.8 }}>
                                        {config.traps}💀 {config.mults}🍯
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div style={{
                    marginTop: '30px', padding: '15px 25px',
                    background: theme.bgPanel, borderRadius: '10px',
                    textAlign: 'center', fontSize: '13px', color: theme.textMuted
                }}>
                    <div style={{ marginBottom: '8px', color: theme.textSecondary }}>Level Difficulty Info</div>
                    <div>
                        L1: {levelConfigs[selectedOpponent.id][0].traps} traps, {levelConfigs[selectedOpponent.id][0].mults} mults →
                        L10: {levelConfigs[selectedOpponent.id][9].traps} traps, {levelConfigs[selectedOpponent.id][9].mults} mults
                    </div>
                </div>
            </div>
        );
    }

    // PLAYING
    if (gameState === 'playing') {
        const earnedStars = roundResult ? calculateEarnedStars() : 0;
        const currentBest = getLevelStars(selectedOpponent.id, currentLevel - 1);
        const isNewBest = earnedStars > currentBest;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedOpponent?.color}12 50%, ${theme.bg} 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px', color: theme.text, position: 'relative', overflow: 'hidden'
            }}>
                {/* Particles */}
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: 'fixed', left: p.x, top: p.y,
                        width: p.size, height: p.size,
                        background: p.color, borderRadius: '50%',
                        opacity: p.life, pointerEvents: 'none', zIndex: 1000
                    }} />
                ))}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', maxWidth: '520px', marginBottom: '20px',
                    padding: '15px 20px', background: theme.bgPanel, borderRadius: '14px'
                }}>
                    <div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>World {selectedOpponent.id + 1} - Level {currentLevel}</div>
                        <div style={{ color: selectedOpponent?.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '20px' }}>{selectedOpponent?.emoji}</span>
                            {selectedOpponent?.name}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Score</div>
                        <div style={{
                            fontSize: '32px', fontWeight: 'bold',
                            color: currentScore > 1 ? theme.gold : theme.text
                        }}>{currentScore}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>Target: {levelConfig?.targetScore}</div>
                        <div style={{ color: theme.honey, fontSize: '18px', fontWeight: 'bold' }}>{foundMultipliers}/{totalMultipliers}</div>
                        <div style={{ fontSize: '10px', color: theme.textMuted }}>Best: <StarDisplay stars={currentBest} size="small" /></div>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: shakeAnimation ? 'shake 0.5s' : 'none' }}>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '58px' }}>
                        {colHints.map((hint, i) => (
                            <HintDisplay key={i} hint={hint} hidden={hiddenHints.cols?.has(i)}
                                revealed={revealedHints.cols?.has(i)} direction="col" index={i}
                                isHighlighted={hoveredTile?.x === i} />
                        ))}
                    </div>
                    {grid.map((row, y) => (
                        <div key={y} style={{ display: 'flex', gap: '6px' }}>
                            <HintDisplay hint={rowHints[y]} hidden={hiddenHints.rows?.has(y)}
                                revealed={revealedHints.rows?.has(y)} direction="row" index={y}
                                isHighlighted={hoveredTile?.y === y} />
                            {row.map((_, x) => <Tile key={x} x={x} y={y} />)}
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={autoMarkSafe} disabled={roundResult !== null} style={{
                        padding: '10px 20px', fontSize: '14px', background: 'transparent',
                        border: `1px solid ${theme.safe}`, borderRadius: '8px', color: theme.safe,
                        cursor: roundResult ? 'not-allowed' : 'pointer', opacity: roundResult ? 0.5 : 1
                    }}>Auto-Mark Safe (A)</button>

                    {moveHistory.length > 0 && !roundResult && (
                        <button onClick={undoMove} style={{
                            padding: '10px 20px', fontSize: '14px', background: 'transparent',
                            border: `1px solid ${theme.border}`, borderRadius: '8px',
                            color: theme.textSecondary, cursor: 'pointer'
                        }}>Undo (Ctrl+Z)</button>
                    )}

                    {!roundResult && currentScore > 1 && (
                        <button onClick={cashOut} style={{
                            padding: '12px 30px', fontSize: '16px', fontWeight: 'bold',
                            background: `linear-gradient(135deg, ${theme.gold}, ${theme.honey})`,
                            border: 'none', borderRadius: '10px', color: '#000', cursor: 'pointer',
                            boxShadow: `0 4px 20px ${theme.goldGlow}`
                        }}>💰 CASH OUT ({currentScore})</button>
                    )}
                </div>

                <div style={{ marginTop: '15px', color: theme.textMuted, fontSize: '12px', textAlign: 'center' }}>
                    Click = Flip | Right-click = Mark | Space = Cash Out | ESC = Exit
                </div>

                {/* Tutorial */}
                {showTutorial && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px'
                    }}>
                        <div style={{
                            background: theme.bgPanel, borderRadius: '20px', padding: '30px',
                            maxWidth: '450px', textAlign: 'center', border: `2px solid ${theme.accent}`
                        }}>
                            <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '10px' }}>
                                Tutorial {tutorialStep + 1}/{tutorialSteps.length}
                            </div>
                            <h2 style={{ color: theme.accent, marginBottom: '15px', fontSize: '24px' }}>
                                {tutorialSteps[tutorialStep].title}
                            </h2>
                            <p style={{ color: theme.textSecondary, lineHeight: '1.6', marginBottom: '25px', fontSize: '16px' }}>
                                {tutorialSteps[tutorialStep].content}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button onClick={() => setShowTutorial(false)} style={{
                                    padding: '12px 24px', fontSize: '14px', background: 'transparent',
                                    border: `1px solid ${theme.border}`, borderRadius: '8px',
                                    color: theme.textMuted, cursor: 'pointer'
                                }}>Skip</button>
                                <button onClick={() => {
                                    if (tutorialStep < tutorialSteps.length - 1) setTutorialStep(prev => prev + 1);
                                    else setShowTutorial(false);
                                }} style={{
                                    padding: '12px 24px', fontSize: '14px',
                                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                    border: 'none', borderRadius: '8px', color: 'white',
                                    cursor: 'pointer', fontWeight: 'bold'
                                }}>{tutorialStep < tutorialSteps.length - 1 ? 'Next →' : 'Start!'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result */}
                {roundResult && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.88)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', zIndex: 100
                    }}>
                        <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                            {roundResult === 'win' ? (x1sFlipped === 0 ? '💎' : '🏆') : roundResult === 'cashout' ? '💰' : '💥'}
                        </div>

                        <h2 style={{
                            fontSize: '40px', marginBottom: '15px',
                            color: roundResult === 'lose' ? theme.error : theme.gold
                        }}>
                            {roundResult === 'win' ? (x1sFlipped === 0 ? 'PERFECT CLEAR!' : 'LEVEL COMPLETE!') :
                             roundResult === 'cashout' ? 'CASHED OUT!' : 'TRAP HIT!'}
                        </h2>

                        {roundResult !== 'lose' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '48px', color: theme.gold }}>
                                    {earnedStars === 1 ? '★' : earnedStars === 0.75 ? '¾★' : earnedStars === 0.5 ? '½★' : earnedStars === 0.25 ? '¼★' : '☆'}
                                </div>
                                {isNewBest && <span style={{ color: theme.success, fontSize: '18px' }}>NEW BEST!</span>}
                            </div>
                        )}

                        {roundResult === 'win' && x1sFlipped > 0 && (
                            <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '10px' }}>
                                Flip only multipliers for a perfect ★ star!
                            </div>
                        )}

                        {roundResult === 'cashout' && (
                            <div style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '10px' }}>
                                Score: {currentScore} | Target: {levelConfig?.targetScore}
                            </div>
                        )}

                        {roundResult === 'lose' && (
                            <>
                                <div style={{ fontSize: '20px', color: theme.error, marginBottom: '20px' }}>No stars earned</div>
                                <button onClick={() => setShowSolution(true)} style={{
                                    padding: '10px 20px', fontSize: '14px', background: 'transparent',
                                    border: `1px solid ${theme.border}`, borderRadius: '8px',
                                    color: theme.textMuted, cursor: 'pointer', marginBottom: '20px'
                                }}>Show Solution</button>
                            </>
                        )}

                        {showSolution && (
                            <div style={{ marginBottom: '20px', padding: '15px', background: theme.bgPanel, borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '10px', textAlign: 'center' }}>
                                    Solution (x2=🟡, x3=⭐, trap=💥)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {grid.map((row, y) => (
                                        <div key={y} style={{ display: 'flex', gap: '4px' }}>
                                            {row.map((val, x) => (
                                                <div key={x} style={{
                                                    width: '30px', height: '30px', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    background: val === 0 ? theme.error : val === 3 ? theme.gold : val === 2 ? theme.honey : theme.bgDark,
                                                    borderRadius: '4px', fontSize: '12px',
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
                            <button onClick={() => startGame(selectedOpponent, currentLevel)} style={{
                                padding: '15px 35px', fontSize: '18px',
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                                border: 'none', borderRadius: '12px', color: 'white',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}>Play Again</button>

                            {roundResult === 'win' && currentLevel < 10 && (
                                <button onClick={() => startGame(selectedOpponent, currentLevel + 1)} style={{
                                    padding: '15px 35px', fontSize: '18px',
                                    background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                                    border: 'none', borderRadius: '12px', color: '#000',
                                    cursor: 'pointer', fontWeight: 'bold'
                                }}>Next Level →</button>
                            )}

                            <button onClick={() => setGameState('level_select')} style={{
                                padding: '15px 35px', fontSize: '18px', background: 'transparent',
                                border: `2px solid ${theme.border}`, borderRadius: '12px',
                                color: theme.textSecondary, cursor: 'pointer'
                            }}>Level Select</button>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-10px); } 40%, 80% { transform: translateX(10px); } }
                `}</style>
            </div>
        );
    }

    return null;
};

ReactDOM.render(<HoneyGrid />, document.getElementById('root'));
