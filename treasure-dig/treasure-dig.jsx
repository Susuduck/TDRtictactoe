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

    // World themes - visual and gameplay elements for each world
    const worldThemes = {
        0: { // Frog - Swamp
            name: 'Murky Swamp',
            tileBase: '#4a5a3a', tileDug: '#3a4a2a', tileAccent: '#2a5a6a',
            tileSpecial: '#2a6a7a', specialBorder: '#4a8a9a',
            bgGradient: ['#1a2a1a', '#2a3a2a', '#1a3a3a'],
            bgPattern: 'swamp',
            specialTile: 'water', specialEmoji: '💧', specialName: 'Water Lily',
            specialDesc: 'Dig adjacent tiles first to drain',
            ambientEmojis: ['🌿', '🪷', '🐸', '🦟'],
            variation: { early: 'Shallow Pond', late: 'Deep Swamp', lateMultiplier: 1.5 }
        },
        1: { // Chicken - Farm
            name: 'Sunny Farm',
            tileBase: '#9b8365', tileDug: '#7b6345', tileAccent: '#c9b277',
            tileSpecial: '#d4a030', specialBorder: '#e8b840',
            bgGradient: ['#2a2515', '#3a3520', '#4a4025'],
            bgPattern: 'farm',
            specialTile: 'nest', specialEmoji: '🥚', specialName: 'Hidden Nest',
            specialDesc: 'Eggs give +25 points or +1 dig',
            ambientEmojis: ['🌾', '🌻', '🐔', '🌽'],
            variation: { early: 'Daytime Fields', late: 'Sunset Barn', lateMultiplier: 1.3 }
        },
        2: { // Dinosaur - Prehistoric
            name: 'Prehistoric Jungle',
            tileBase: '#6a5a4a', tileDug: '#4a3a2a', tileAccent: '#7a6a5a',
            tileSpecial: '#a08a6a', specialBorder: '#c0a080',
            bgGradient: ['#1a2015', '#2a3020', '#3a2a1a'],
            bgPattern: 'jungle',
            specialTile: 'fossil', specialEmoji: '🦴', specialName: 'Ancient Fossil',
            specialDesc: 'Shows distance to ALL treasures',
            ambientEmojis: ['🌴', '🦕', '🌋', '🥚'],
            variation: { early: 'Fern Valley', late: 'Volcanic Ridge', lateMultiplier: 1.4 }
        },
        3: { // Raccoon - Urban
            name: 'Urban Night',
            tileBase: '#4a4a55', tileDug: '#3a3a45', tileAccent: '#5a5a65',
            tileSpecial: '#f0e068', specialBorder: '#ffee88',
            bgGradient: ['#15151a', '#1a1a22', '#202028'],
            bgPattern: 'urban',
            specialTile: 'spotlight', specialEmoji: '💡', specialName: 'Street Light',
            specialDesc: 'Reveals 3x3 area permanently',
            ambientEmojis: ['🏙️', '🗑️', '🦝', '🚗'],
            variation: { early: 'Back Alley', late: 'Underground', lateMultiplier: 1.5 }
        },
        4: { // Eel - Underwater
            name: 'Ocean Depths',
            tileBase: '#3a5a6a', tileDug: '#2a4a5a', tileAccent: '#4a6a7a',
            tileSpecial: '#5090b0', specialBorder: '#60a0c0',
            bgGradient: ['#0a1a2a', '#1a2a3a', '#0a2a4a'],
            bgPattern: 'underwater',
            specialTile: 'current', specialEmoji: '🌊', specialName: 'Ocean Current',
            specialDesc: 'Shifts items in arrow direction',
            ambientEmojis: ['🐠', '🪸', '🫧', '🦑'],
            variation: { early: 'Coral Reef', late: 'Abyssal Depths', lateMultiplier: 1.6 }
        },
        5: { // Moth - Forest
            name: 'Enchanted Forest',
            tileBase: '#4a5040', tileDug: '#3a4030', tileAccent: '#5a6050',
            tileSpecial: '#70b070', specialBorder: '#90d090',
            bgGradient: ['#151a15', '#1a2018', '#18221a'],
            bgPattern: 'forest',
            specialTile: 'firefly', specialEmoji: '✨', specialName: 'Firefly Swarm',
            specialDesc: 'Reveals random nearby tiles briefly',
            ambientEmojis: ['🍄', '🦋', '🌙', '🦉'],
            variation: { early: 'Twilight Grove', late: 'Midnight Hollow', lateMultiplier: 1.4 }
        },
        6: { // Penguin - Arctic
            name: 'Frozen Tundra',
            tileBase: '#8aa8c0', tileDug: '#6a88a0', tileAccent: '#9ab8d0',
            tileSpecial: '#b0e0f0', specialBorder: '#c0f0ff',
            bgGradient: ['#1a2530', '#202a38', '#283040'],
            bgPattern: 'arctic',
            specialTile: 'slide', specialEmoji: '⛷️', specialName: 'Ice Slide',
            specialDesc: 'Dig slides to next tile automatically',
            ambientEmojis: ['❄️', '🐧', '🏔️', '🌨️'],
            variation: { early: 'Ice Shelf', late: 'Crystal Cavern', lateMultiplier: 1.3 }
        },
        7: { // Snake - Desert
            name: 'Desert Temple',
            tileBase: '#c8a870', tileDug: '#a8884a', tileAccent: '#d8b880',
            tileSpecial: '#e0c060', specialBorder: '#f0d070',
            bgGradient: ['#2a2015', '#3a3020', '#4a3a25'],
            bgPattern: 'desert',
            specialTile: 'quicksand', specialEmoji: '⏳', specialName: 'Quicksand',
            specialDesc: 'Wastes dig - no information gained',
            ambientEmojis: ['🏜️', '🐍', '🏛️', '🦂'],
            variation: { early: 'Sandy Dunes', late: 'Ancient Temple', lateMultiplier: 1.5 }
        },
        8: { // Wolf - Cave
            name: 'Crystal Cave',
            tileBase: '#5a5a6a', tileDug: '#4a4a5a', tileAccent: '#6a6a7a',
            tileSpecial: '#8080c0', specialBorder: '#a0a0e0',
            bgGradient: ['#12121a', '#1a1a25', '#151520'],
            bgPattern: 'cave',
            specialTile: 'echo', specialEmoji: '🔊', specialName: 'Echo Crystal',
            specialDesc: 'Reveals if treasure in row OR column',
            ambientEmojis: ['💎', '🐺', '🦇', '🕯️'],
            variation: { early: 'Cave Entrance', late: 'Deep Cavern', lateMultiplier: 1.4 }
        },
        9: { // Grizzly - Vault
            name: 'Royal Vault',
            tileBase: '#7a6a50', tileDug: '#5a4a30', tileAccent: '#8a7a60',
            tileSpecial: '#d4af37', specialBorder: '#f4cf57',
            bgGradient: ['#1a1510', '#2a2015', '#35281a'],
            bgPattern: 'vault',
            specialTile: 'mirror', specialEmoji: '🪞', specialName: 'Magic Mirror',
            specialDesc: 'Dig reflects to opposite side too',
            ambientEmojis: ['👑', '💰', '🏆', '💎'],
            variation: { early: 'Outer Vault', late: 'Inner Sanctum', lateMultiplier: 1.2 }
        }
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
    // Each world has a unique environment with themed special tiles
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Friendly Guide',
            mechanic: 'Learn triangulation basics in the murky swamp!',
            description: '💧 Water Lilies block your path - dig nearby tiles first to drain them!',
            gridSize: 6, baseDigs: 12, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: [], tutorial: true
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Gem Collector',
            mechanic: 'Explore the sunny farm for hidden treasures!',
            description: '🥚 Hidden Nests contain bonus eggs - extra points or digs await!',
            gridSize: 7, baseDigs: 14, treasures: 1, decoys: 0,
            tools: { radar: 1, flag: 5 },
            special: ['gems']
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Dual Digger',
            mechanic: 'Two treasures hidden in the prehistoric jungle!',
            description: '🦴 Ancient Fossils reveal distance to ALL treasures at once!',
            gridSize: 8, baseDigs: 16, treasures: 2, decoys: 0,
            tools: { radar: 2, flag: 6, xray: 1 },
            special: ['multi']
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Trickster',
            mechanic: 'Navigate the urban night - watch for decoys!',
            description: '💡 Street Lights illuminate 3x3 areas permanently when dug!',
            gridSize: 8, baseDigs: 15, treasures: 1, decoys: 2,
            tools: { radar: 1, flag: 6, xray: 2 },
            special: ['decoys']
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Scanner',
            mechanic: 'Dive into the ocean depths with sonar!',
            description: '🌊 Ocean Currents shift treasures and decoys each turn!',
            gridSize: 9, baseDigs: 14, treasures: 1, decoys: 1,
            tools: { radar: 2, flag: 6, xray: 1, sonar: 2 },
            special: ['sonar', 'decoys']
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Shadow Seeker',
            mechanic: 'The enchanted forest hides in magical fog!',
            description: '✨ Firefly Swarms briefly reveal distances of nearby tiles!',
            gridSize: 9, baseDigs: 16, treasures: 2, decoys: 1,
            tools: { radar: 2, flag: 10, xray: 2, lantern: 2 },
            special: ['fog', 'decoys']
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Ice Scholar',
            mechanic: 'Traverse the frozen tundra carefully!',
            description: '⛷️ Ice Slides cause chain reactions - dig one, slide to another!',
            gridSize: 10, baseDigs: 18, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, pickaxe: 2 },
            special: ['frozen', 'decoys', 'gems']
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Shifty One',
            mechanic: 'The desert temple holds shifting secrets!',
            description: '⏳ Quicksand tiles waste your dig - no information revealed!',
            gridSize: 10, baseDigs: 18, treasures: 1, decoys: 2,
            tools: { radar: 3, flag: 8, xray: 2, tracker: 1 },
            special: ['moving', 'decoys']
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Deep Digger',
            mechanic: 'Explore the crystal cave depths!',
            description: '🔊 Echo Crystals reveal if treasure is in the same row or column!',
            gridSize: 11, baseDigs: 20, treasures: 2, decoys: 2,
            tools: { radar: 2, flag: 8, xray: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems']
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Challenge',
            mechanic: 'The royal vault - master all mechanics!',
            description: '🪞 Magic Mirrors reflect your dig to the opposite side of the grid!',
            gridSize: 12, baseDigs: 22, treasures: 3, decoys: 3,
            tools: { radar: 3, flag: 12, xray: 3, sonar: 2, drill: 2 },
            special: ['deep', 'decoys', 'gems', 'frozen', 'moving']
        }
    ];

    // Level configurations - carefully tuned difficulty curve
    // Key principle: World N Level 10 should be easier than World N+1 Level 1
    // Each level within a world gets progressively harder
    // Each world introduces new mechanics at baseline difficulty, then increases
    const getLevelConfig = (opponent, level) => {
        // Smoother scaling: grid grows more slowly, digs decrease more gradually
        const gridGrowth = Math.floor((level - 1) / 4); // +1 grid every 4 levels
        const digReduction = Math.floor((level - 1) * 0.3); // Slower dig reduction

        const baseConfig = {
            gridSize: opponent.gridSize + gridGrowth,
            digs: opponent.baseDigs - digReduction,
            treasures: opponent.treasures + (level >= 8 ? 1 : 0), // Extra treasure only at level 8+
            decoys: opponent.decoys + Math.floor((level - 1) / 5), // Slower decoy addition
            parDigs: 0, // Calculated below
            bonusObjective: null,
            scoreThreshold: 0 // For star bonus
        };

        // Ensure minimum digs for solvability
        const minDigs = baseConfig.treasures * 4 + 4;
        baseConfig.digs = Math.max(minDigs, baseConfig.digs);

        // Par is 60% of available digs (generous but challenging)
        baseConfig.parDigs = Math.floor(baseConfig.digs * 0.6);

        // Calculate score threshold for bonus star (varies by level)
        // Base threshold + level scaling, adjusted for opponent difficulty
        const baseDifficulty = opponent.id * 10; // Higher opponents = harder base
        baseConfig.scoreThreshold = 80 + (level * 15) + baseDifficulty;

        // Every level has a bonus objective for the second half-star
        // Alternating between different objective types for variety
        const objectiveTypes = [
            { type: 'score', desc: `Score ${baseConfig.scoreThreshold}+ points` },
            { type: 'efficiency', target: Math.ceil(baseConfig.digs * 0.3), desc: `Finish with ${Math.ceil(baseConfig.digs * 0.3)}+ digs remaining` },
            { type: 'noDecoy', desc: 'Complete without hitting any decoys' },
            { type: 'underPar', desc: `Finish under par (${baseConfig.parDigs}+ digs left)` },
            { type: 'combo', target: 2 + Math.floor(level / 3), desc: `Achieve ${2 + Math.floor(level / 3)}x combo` }
        ];

        // Assign objective based on level (cycles through types with some variation)
        const objIndex = (level + opponent.id) % objectiveTypes.length;
        baseConfig.bonusObjective = objectiveTypes[objIndex];

        // Override for specific milestone levels
        if (level === 5) {
            baseConfig.bonusObjective = { type: 'efficiency', target: Math.ceil(baseConfig.digs * 0.35),
                desc: `Master efficiency: ${Math.ceil(baseConfig.digs * 0.35)}+ digs remaining` };
        }
        if (level === 10) {
            baseConfig.bonusObjective = { type: 'perfect',
                desc: 'Perfect run: under par with no decoys' };
        }

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

    // World-themed special tiles
    const [specialTiles, setSpecialTiles] = useState([]); // {x, y, type, activated, direction?}
    const [illuminatedTiles, setIlluminatedTiles] = useState([]); // For spotlight reveals
    const [ambientParticles, setAmbientParticles] = useState([]); // Floating ambient effects
    const [currentTheme, setCurrentTheme] = useState(null); // Active world theme
    const [isLateLevel, setIsLateLevel] = useState(false); // Levels 6-10 = "late" variant

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
    const [sonarFading, setSonarFading] = useState(false); // For radar fade effect

    // Visual effects
    const [lastDigResult, setLastDigResult] = useState(null);
    const [hitEffects, setHitEffects] = useState([]);
    const [screenShake, setScreenShake] = useState(false);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [hintTile, setHintTile] = useState(null);

    // Level config
    const [levelConfig, setLevelConfig] = useState(null);

    // Progression with enhanced tracking - v3 with fractional stars per level
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('treasuredig_progression_v3');
        if (saved) return JSON.parse(saved);
        // Initialize with per-level star tracking: each level can earn 0, 0.5, or 1 star
        // 0.5 for completing the level, +0.5 for achieving the bonus objective
        return {
            levelStars: Array(10).fill().map(() => Array(10).fill(0)), // 0, 0.5, or 1 per level
            levelsBeat: Array(10).fill().map(() => Array(10).fill(false)),
            bonusAchieved: Array(10).fill().map(() => Array(10).fill(false)), // Bonus objective per level
            bestScores: Array(10).fill().map(() => Array(10).fill(0)),
            achievements: [],
            totalTreasures: 0,
            totalGames: 0,
            hintsUsed: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('treasuredig_progression_v3', JSON.stringify(progression));
    }, [progression]);

    // Calculate total stars for an opponent (sum of all level stars, max 10)
    const getStars = (idx) => {
        const levelStars = progression.levelStars[idx] || Array(10).fill(0);
        return levelStars.reduce((sum, s) => sum + s, 0);
    };

    // Get star status for a specific level (0, 0.5, or 1)
    const getLevelStar = (oppIdx, level) => {
        return progression.levelStars[oppIdx]?.[level - 1] || 0;
    };

    // World unlocks when previous world has 10 stars (all levels completed with bonus)
    const isOpponentUnlocked = (idx) => idx === 0 || getStars(idx - 1) >= 10;
    const isOpponentMastered = (idx) => getStars(idx) >= 10;
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

        // Set world theme
        const worldTheme = worldThemes[opp.id] || worldThemes[0];
        setCurrentTheme(worldTheme);
        const lateLevel = level >= 6;
        setIsLateLevel(lateLevel);

        // Place world-themed special tiles (more in late levels)
        const specialCount = Math.floor(size * size * (lateLevel ? 0.08 : 0.05));
        const excludeFromSpecial = [...treasures, ...decoys, ...gems];
        const specialPositions = placeItemsSmart(size, specialCount, excludeFromSpecial, 1);

        // Add direction for current tiles, type info for all
        const specials = specialPositions.map((pos, idx) => ({
            ...pos,
            type: worldTheme.specialTile,
            activated: false,
            // Direction for current tiles (arrows)
            direction: worldTheme.specialTile === 'current'
                ? ['up', 'down', 'left', 'right'][idx % 4]
                : null
        }));
        setSpecialTiles(specials);
        setIlluminatedTiles([]);

        // Initialize ambient particles for visual flair
        const particles = [];
        for (let i = 0; i < 8; i++) {
            particles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                emoji: worldTheme.ambientEmojis[i % worldTheme.ambientEmojis.length],
                speed: 0.5 + Math.random() * 1,
                drift: (Math.random() - 0.5) * 2
            });
        }
        setAmbientParticles(particles);

        // Initialize grid data
        const newGrid = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const isDeep = deep.some(d => d.x === x && d.y === y);
                const special = specials.find(s => s.x === x && s.y === y);
                row.push({
                    x, y,
                    dug: false,
                    dugDepth: 0,
                    requiredDepth: isDeep ? 2 : 1,
                    distance: null,
                    distanceInfo: null,
                    flagged: false,
                    revealed: false,
                    specialType: special?.type || null,
                    specialDirection: special?.direction || null
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
        const { size, treasures } = initializeGrid(opponent, level);
        setBonusAchieved(false); // Reset bonus tracking for new match

        // For early levels (1-3), give players a free starting hint
        // This makes early gameplay more strategic instead of random clicking
        if (level <= 3 && opponent.id <= 2) {
            setTimeout(() => {
                // Reveal a tile that's moderately close to treasure (gives direction)
                const hintTiles = [];
                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const dist = Math.min(...treasures.map(t =>
                            Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2)
                        ));
                        // Pick tiles that are 2-4 distance away (not too close, not too far)
                        if (dist >= 2 && dist <= 4) {
                            hintTiles.push({ x, y, dist });
                        }
                    }
                }

                // Pick 1-2 good hint tiles and auto-reveal them
                const numHints = level === 1 ? 2 : 1;
                const sortedHints = hintTiles.sort((a, b) => a.dist - b.dist);
                const selectedHints = sortedHints.slice(0, numHints);

                selectedHints.forEach(hint => {
                    // Auto-dig this tile to give player a starting point
                    setGrid(g => {
                        if (!g[hint.y]) return g;
                        const newGrid = [...g];
                        newGrid[hint.y] = [...newGrid[hint.y]];
                        const dist = hint.dist;
                        const distInfo = getDistanceInfo(dist, size);
                        newGrid[hint.y][hint.x] = {
                            ...newGrid[hint.y][hint.x],
                            dug: true,
                            dugDepth: 1,
                            distance: Math.round(dist * 10) / 10,
                            distanceInfo: distInfo
                        };
                        return newGrid;
                    });
                    setDugTiles(d => [...d, { x: hint.x, y: hint.y }]);
                    addHitEffect(hint.x, hint.y, '🎁 Free hint!', 'info');
                });
            }, 500); // Slight delay for dramatic effect
        }

        // Show tutorial for first opponent, first level
        if (opponent.tutorial && level === 1 && !progression.levelsBeat[0][0]) {
            setShowTutorial(true);
            setTutorialStep(0);
        }

        setGameState('playing');
    }, [initializeGrid, progression.levelsBeat, getDistanceInfo, addHitEffect]);

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

    // Handle radar tool (row/column scan) - now with fade effect
    const handleRadar = useCallback((x, y) => {
        if (tools.radar <= 0) return;

        setTools(t => ({ ...t, radar: t.radar - 1 }));
        setActiveTool(null);
        setSonarFading(false);

        // Check row and column for treasures
        const inRow = treasurePositions.some(t => t.y === y);
        const inCol = treasurePositions.some(t => t.x === x);

        // Visual feedback - highlight tiles temporarily
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

        // Start fading after 1.5s, then clear after fade completes
        setTimeout(() => setSonarFading(true), 1500);
        setTimeout(() => {
            setSonarTiles([]);
            setSonarFading(false);
        }, 3000);
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

    // Handle special tile effects (world-themed mechanics)
    const handleSpecialTile = useCallback((x, y, tile) => {
        if (!tile.specialType || !currentTheme) return { canDig: true, extraEffect: null };

        const specialType = tile.specialType;

        switch (specialType) {
            case 'water': {
                // Water tiles need adjacent tiles dug first to "drain"
                const adjacentDug = [
                    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
                ].some(({ dx, dy }) => {
                    const nx = x + dx, ny = y + dy;
                    return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny]?.[nx]?.dug;
                });
                if (!adjacentDug) {
                    addHitEffect(x, y, '💧 Drain nearby first!', 'info');
                    return { canDig: false, extraEffect: null };
                }
                return { canDig: true, extraEffect: 'drained' };
            }

            case 'quicksand': {
                // Quicksand wastes the dig - no info revealed
                addHitEffect(x, y, '⏳ Quicksand! Dig wasted!', 'error');
                triggerShake(0.8);
                return { canDig: true, extraEffect: 'quicksand' }; // Dig consumed but no info
            }

            case 'nest': {
                // Nest gives bonus - points or extra dig
                const bonus = Math.random() > 0.5 ? 'dig' : 'points';
                if (bonus === 'dig') {
                    setDigsRemaining(d => d + 1);
                    addHitEffect(x, y, '🥚 +1 DIG!', 'gem');
                } else {
                    setScore(s => s + 25);
                    addHitEffect(x, y, '🥚 +25 points!', 'gem');
                }
                return { canDig: true, extraEffect: 'nest' };
            }

            case 'fossil': {
                // Fossil shows distance to ALL treasures
                const allDistances = treasurePositions.map(t =>
                    Math.round(getDistance(x, y, t.x, t.y) * 10) / 10
                );
                if (allDistances.length > 0) {
                    addHitEffect(x, y, `🦴 All: ${allDistances.join(', ')}`, 'info');
                }
                return { canDig: true, extraEffect: 'fossil' };
            }

            case 'spotlight': {
                // Spotlight illuminates 3x3 permanently
                const illuminated = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                            illuminated.push({ x: nx, y: ny });
                        }
                    }
                }
                setIlluminatedTiles(prev => [...prev, ...illuminated]);
                addHitEffect(x, y, '💡 Area revealed!', 'info');
                return { canDig: true, extraEffect: 'spotlight' };
            }

            case 'firefly': {
                // Firefly briefly reveals random nearby tiles
                const nearbyTiles = [];
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !grid[ny]?.[nx]?.dug) {
                            nearbyTiles.push({ x: nx, y: ny });
                        }
                    }
                }
                // Reveal 3 random nearby tiles briefly via sonar display
                const shuffled = nearbyTiles.sort(() => Math.random() - 0.5).slice(0, 3);
                const reveals = shuffled.map(pos => {
                    const dist = getMinTreasureDistance(pos.x, pos.y, treasurePositions);
                    return { ...pos, distance: dist, info: getDistanceInfo(dist, gridSize) };
                });
                setSonarTiles(reveals);
                setTimeout(() => setSonarTiles([]), 2500);
                addHitEffect(x, y, '✨ Fireflies reveal!', 'info');
                return { canDig: true, extraEffect: 'firefly' };
            }

            case 'slide': {
                // Slide chains to next tile in a random direction
                const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
                const dir = directions[Math.floor(Math.random() * 4)];
                const slideX = x + dir.dx, slideY = y + dir.dy;
                if (slideX >= 0 && slideX < gridSize && slideY >= 0 && slideY < gridSize && !grid[slideY]?.[slideX]?.dug) {
                    addHitEffect(x, y, '⛷️ Sliding!', 'info');
                    // Queue the slide dig (handled after this dig completes)
                    setTimeout(() => handleDig(slideX, slideY), 300);
                }
                return { canDig: true, extraEffect: 'slide' };
            }

            case 'echo': {
                // Echo reveals if treasure is in this row OR column
                const inRow = treasurePositions.some(t => t.y === y);
                const inCol = treasurePositions.some(t => t.x === x);
                const msg = inRow && inCol ? '🔊 Echo: ROW & COL!' :
                           inRow ? '🔊 Echo: in ROW!' :
                           inCol ? '🔊 Echo: in COLUMN!' :
                           '🔊 Echo: neither...';
                addHitEffect(x, y, msg, inRow || inCol ? 'treasure' : 'info');
                return { canDig: true, extraEffect: 'echo' };
            }

            case 'mirror': {
                // Mirror reflects dig to opposite side
                const mirrorX = gridSize - 1 - x;
                const mirrorY = gridSize - 1 - y;
                if (!grid[mirrorY]?.[mirrorX]?.dug) {
                    addHitEffect(x, y, '🪞 Mirrored!', 'info');
                    setTimeout(() => handleDig(mirrorX, mirrorY), 300);
                }
                return { canDig: true, extraEffect: 'mirror' };
            }

            case 'current': {
                // Current tiles are visual indicators - they shift items periodically
                // The shifting is handled elsewhere, this just marks the tile
                return { canDig: true, extraEffect: 'current' };
            }

            default:
                return { canDig: true, extraEffect: null };
        }
    }, [currentTheme, grid, gridSize, treasurePositions, getMinTreasureDistance, addHitEffect, triggerShake]);

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

        // Handle special tile pre-check (water blocking, etc.)
        const specialResult = handleSpecialTile(x, y, tile);
        if (!specialResult.canDig) {
            return; // Special tile blocked the dig (e.g., water not drained)
        }

        // Check frozen tile cost
        const isFrozen = frozenTiles.some(f => f.x === x && f.y === y) && !tile.dug;
        const digCost = isFrozen ? 2 : 1;

        if (digsRemaining < digCost) {
            addHitEffect(x, y, 'Not enough digs!', 'error');
            return;
        }

        // Deduct digs
        setDigsRemaining(d => d - digCost);

        // Handle quicksand - dig is consumed but no info revealed
        if (specialResult.extraEffect === 'quicksand') {
            setDugTiles(d => [...d, { x, y }]);
            setGrid(g => {
                const newGrid = [...g];
                newGrid[y] = [...newGrid[y]];
                newGrid[y][x] = { ...tile, dug: true, dugDepth: 1, distance: '?', distanceInfo: { color: '#888', label: 'Lost!', emoji: '⏳', tier: 9 } };
                return newGrid;
            });
            setMoveHistory(h => [...h, { x, y, time: Date.now() }]);
            return; // No further processing
        }

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
        handleRadar, handleXRay, handleSonar, handleFlag, handleSpecialTile, moveTreasure,
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

    // Track bonus objective achievement for result screen
    const [bonusAchieved, setBonusAchieved] = useState(false);

    // Check if bonus objective was achieved
    const checkBonusObjective = useCallback((config, finalScore) => {
        if (!config?.bonusObjective) return false;

        const obj = config.bonusObjective;
        switch (obj.type) {
            case 'score':
                return finalScore >= config.scoreThreshold;
            case 'efficiency':
                return digsRemaining >= obj.target;
            case 'noDecoy':
                return decoysHit === 0;
            case 'underPar':
                return digsRemaining >= config.parDigs;
            case 'combo':
                return maxCombo >= obj.target;
            case 'perfect':
                return digsRemaining >= config.parDigs && decoysHit === 0;
            default:
                return false;
        }
    }, [digsRemaining, decoysHit, maxCombo]);

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
            const underParBonus = digsRemaining >= config.parDigs ? 75 : 0;

            const totalBonus = digBonus + comboBonus + noDecoyBonus + underParBonus;
            setScore(s => s + totalBonus);

            const finalScore = score + totalBonus;

            // Check if bonus objective achieved
            const bonusCompleted = checkBonusObjective(config, finalScore);
            setBonusAchieved(bonusCompleted);

            // Calculate stars: 0.5 for completion, +0.5 for bonus objective
            const completionStar = 0.5;
            const bonusStar = bonusCompleted ? 0.5 : 0;
            const totalStarEarned = completionStar + bonusStar;

            setProgression(prev => {
                const newLevelStars = prev.levelStars.map(arr => [...arr]);
                // Only update if we earned more stars than before
                const currentStar = newLevelStars[selectedOpponent.id][currentLevel - 1] || 0;
                newLevelStars[selectedOpponent.id][currentLevel - 1] = Math.max(currentStar, totalStarEarned);

                const newLevelsBeat = prev.levelsBeat.map(arr => [...arr]);
                newLevelsBeat[selectedOpponent.id][currentLevel - 1] = true;

                const newBonusAchieved = prev.bonusAchieved.map(arr => [...arr]);
                if (bonusCompleted) {
                    newBonusAchieved[selectedOpponent.id][currentLevel - 1] = true;
                }

                const newBestScores = prev.bestScores.map(arr => [...arr]);
                newBestScores[selectedOpponent.id][currentLevel - 1] = Math.max(
                    newBestScores[selectedOpponent.id][currentLevel - 1] || 0,
                    finalScore
                );

                return {
                    ...prev,
                    levelStars: newLevelStars,
                    levelsBeat: newLevelsBeat,
                    bonusAchieved: newBonusAchieved,
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

    // Star bar component - shows 10 stars with half-star support
    const StarBar = ({ stars, size = 'normal' }) => {
        const starSizeNum = size === 'small' ? 12 : 16;
        const starSize = `${starSizeNum}px`;

        // Stars can be fractional (0-10 in 0.5 increments)
        const totalStars = Math.min(10, stars || 0);

        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {Array(10).fill(0).map((_, i) => {
                    const starValue = i + 1;
                    let fillPercent = 0;

                    if (totalStars >= starValue) {
                        fillPercent = 100; // Full star
                    } else if (totalStars >= starValue - 0.5) {
                        fillPercent = 50; // Half star
                    }

                    return (
                        <div key={i} style={{
                            width: starSize, height: starSize,
                            position: 'relative',
                            borderRadius: '2px',
                            background: theme.bgDark,
                            border: `1px solid ${fillPercent > 0 ? theme.gold : theme.border}`,
                            overflow: 'hidden'
                        }}>
                            {/* Filled portion */}
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: `${fillPercent}%`,
                                background: theme.gold,
                                boxShadow: fillPercent > 0 ? `0 0 4px ${theme.goldGlow}` : 'none'
                            }} />
                        </div>
                    );
                })}
            </div>
        );
    };

    // Single star indicator for level buttons
    const LevelStar = ({ stars, size = 14 }) => {
        // 0 = empty, 0.5 = half, 1 = full
        const fillPercent = stars === 1 ? 100 : stars === 0.5 ? 50 : 0;

        if (stars === 0) return null;

        return (
            <div style={{
                width: size, height: size,
                position: 'relative',
                borderRadius: '50%',
                background: theme.bgDark,
                border: `1px solid ${theme.gold}`,
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${fillPercent}%`,
                    background: theme.gold
                }} />
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
                                {opponents.reduce((total, _, idx) => total + getStars(idx), 0)}/100
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
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: theme.bgDark,
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: theme.textMuted,
                                        border: `1px solid ${theme.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span>🔒</span>
                                        <span>{10 - getStars(idx - 1)}★ needed</span>
                                    </div>
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
                                            <StarBar stars={starsEarned} size="small" />
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
                    <StarBar stars={getStars(selectedOpponent.id)} />
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
                        const levelStar = getLevelStar(selectedOpponent.id, levelNum);
                        const hasBonus = progression.bonusAchieved?.[selectedOpponent.id]?.[i] || false;

                        // Star colors: gold for full, half gold for half star
                        const starBg = levelStar === 1 ? theme.gold :
                                       levelStar === 0.5 ? `linear-gradient(90deg, ${theme.gold} 50%, ${theme.bgDark} 50%)` :
                                       theme.bgDark;

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                style={{
                                    width: '75px', height: '75px',
                                    background: beaten
                                        ? `linear-gradient(135deg, ${levelStar === 1 ? theme.gold : theme.success}44, ${theme.bgPanel})`
                                        : unlocked
                                            ? `linear-gradient(135deg, ${selectedOpponent.color}88, ${selectedOpponent.color}44)`
                                            : theme.bgDark,
                                    border: `2px solid ${levelStar === 1 ? theme.gold : beaten ? theme.success : unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '20px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={e => unlocked && (e.currentTarget.style.transform = 'scale(1.08)')}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {unlocked ? (
                                    <>
                                        {levelNum}
                                        {/* Star indicator */}
                                        {beaten && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px'
                                            }}>
                                                <div style={{
                                                    width: '14px', height: '14px',
                                                    borderRadius: '50%',
                                                    border: `1px solid ${theme.gold}`,
                                                    background: starBg,
                                                    boxShadow: levelStar > 0 ? `0 0 4px ${theme.goldGlow}` : 'none'
                                                }} />
                                            </div>
                                        )}
                                    </>
                                ) : '🔒'}
                            </button>
                        );
                    })}
                </div>

                {/* Level info: show bonus objective for next unbeaten level or completion message */}
                {(() => {
                    // Find first unbeaten level
                    const nextLevel = Array(10).fill(0).findIndex((_, i) =>
                        isLevelUnlocked(selectedOpponent.id, i + 1) && !progression.levelsBeat[selectedOpponent.id]?.[i]
                    );
                    const worldStars = getStars(selectedOpponent.id);
                    const isMastered = worldStars >= 10;

                    // All levels beaten
                    if (nextLevel === -1) {
                        return (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px 25px',
                                background: isMastered
                                    ? `linear-gradient(135deg, ${theme.gold}33, ${theme.bgPanel})`
                                    : theme.bgPanel,
                                borderRadius: '12px',
                                textAlign: 'center',
                                maxWidth: '400px',
                                border: isMastered ? `2px solid ${theme.gold}` : 'none'
                            }}>
                                {isMastered ? (
                                    <>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
                                        <div style={{ color: theme.gold, fontSize: '18px', fontWeight: 'bold' }}>
                                            WORLD MASTERED!
                                        </div>
                                        <div style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '5px' }}>
                                            All 10 stars collected - You've unlocked the next world!
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                                        <div style={{ color: theme.success, fontSize: '16px', fontWeight: 'bold' }}>
                                            All Levels Complete!
                                        </div>
                                        <div style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '5px' }}>
                                            You have {worldStars}/10★ - Replay levels to earn bonus stars and unlock the next world!
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    }

                    const config = getLevelConfig(selectedOpponent, nextLevel + 1);
                    return (
                        <div style={{
                            marginTop: '20px',
                            padding: '12px 20px',
                            background: theme.bgPanel,
                            borderRadius: '10px',
                            textAlign: 'center',
                            maxWidth: '400px'
                        }}>
                            <div style={{ color: theme.textSecondary, fontSize: '12px', marginBottom: '5px' }}>
                                Level {nextLevel + 1} Bonus Objective:
                            </div>
                            <div style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold' }}>
                                ⭐ {config.bonusObjective?.desc}
                            </div>
                            <div style={{ color: theme.textMuted, fontSize: '11px', marginTop: '5px' }}>
                                Complete level = ½ star | Bonus = full star
                            </div>
                        </div>
                    );
                })()}

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

        // Get world theme for background
        const wTheme = currentTheme || worldThemes[opp?.id || 0];
        const bgColors = wTheme?.bgGradient || [theme.bg, theme.bgPanel, theme.bg];
        const levelVariation = isLateLevel ? wTheme?.variation?.late : wTheme?.variation?.early;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '15px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(3px)' : 'none',
                transition: 'transform 0.05s',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Ambient floating particles */}
                {ambientParticles.map((p, idx) => (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            fontSize: '20px',
                            opacity: 0.15 + (idx % 3) * 0.1,
                            pointerEvents: 'none',
                            animation: `float-${idx % 3} ${8 + p.speed * 4}s infinite ease-in-out`,
                            zIndex: 0
                        }}
                    >
                        {p.emoji}
                    </div>
                ))}

                {/* World/Level indicator */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `${wTheme.bgGradient[1]}cc`,
                    padding: '4px 15px',
                    borderRadius: '15px',
                    fontSize: '11px',
                    color: theme.textMuted,
                    zIndex: 1,
                    border: `1px solid ${wTheme.tileAccent}44`
                }}>
                    {wTheme.name} • {levelVariation}
                </div>

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

                {/* Bonus objective display */}
                {levelConfig?.bonusObjective && (
                    <div style={{
                        marginBottom: '8px',
                        padding: '6px 15px',
                        background: theme.bgPanel,
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        border: `1px solid ${theme.gold}33`
                    }}>
                        <span style={{ color: theme.gold }}>⭐ Bonus: </span>
                        <span style={{ color: theme.textSecondary }}>{levelConfig.bonusObjective.desc}</span>
                    </div>
                )}

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

                                // Special tile indicator
                                const isSpecialTile = tile.specialType && !isDug;
                                const isIlluminated = illuminatedTiles.some(t => t.x === x && t.y === y);

                                // Get world-themed colors
                                const wTheme = currentTheme || worldThemes[0];
                                const baseTileColor = wTheme.tileBase;
                                const dugTileColor = wTheme.tileDug;

                                // Tile colors - use world theme
                                let bgColor = isLateLevel ? `${baseTileColor}` : baseTileColor;
                                let borderColor = wTheme.tileAccent;
                                let content = null;
                                let specialIndicator = null;

                                // Add special tile indicator - make it very visible
                                if (isSpecialTile) {
                                    bgColor = wTheme.tileSpecial;
                                    borderColor = wTheme.specialBorder;
                                    // Large centered emoji for special tiles
                                    specialIndicator = (
                                        <span style={{
                                            fontSize: tileSize * 0.5,
                                            opacity: 1,
                                            textShadow: `0 0 8px ${wTheme.specialBorder}, 0 0 4px white`,
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            {wTheme.specialEmoji}
                                        </span>
                                    );
                                }

                                if (isDug) {
                                    bgColor = tile.distanceInfo?.color || dugTileColor;
                                    borderColor = tile.distanceInfo?.color || wTheme.tileAccent;
                                    content = (
                                        <span style={{
                                            fontSize: tileSize * 0.45,
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                        }}>
                                            {typeof tile.distance === 'number' ? tile.distance?.toFixed(1) : tile.distance}
                                        </span>
                                    );
                                    specialIndicator = null; // Clear indicator when dug
                                } else if (isDeepPartial) {
                                    bgColor = dugTileColor;
                                    content = <span style={{ fontSize: tileSize * 0.4 }}>🕳️</span>;
                                } else if (isFlagged) {
                                    bgColor = wTheme.tileAccent;
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

                                // Illuminated tiles (from spotlight) get a glow
                                if (isIlluminated && !isDug) {
                                    borderColor = '#ffee88';
                                    bgColor = `${bgColor}`;
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
                                                ? `0 0 ${sonarFading ? '4px' : '12px'} ${sonarTile.info?.color || theme.accent}`
                                                : isHinted
                                                    ? `0 0 15px ${theme.gold}`
                                                    : isDug
                                                        ? `inset 0 2px 4px rgba(0,0,0,0.3)`
                                                        : '0 2px 4px rgba(0,0,0,0.2)',
                                            // Smooth transition for radar fade
                                            ...(sonarTile && sonarFading ? { opacity: 0.3, transition: 'all 1.5s ease-out' } : {}),
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

                                        {/* Special tile indicator */}
                                        {specialIndicator}

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
                        0%, 100% { transform: scale(1); opacity: 0.9; }
                        50% { transform: scale(1.15); opacity: 1; }
                    }
                    @keyframes float-0 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        25% { transform: translate(10px, -20px) rotate(5deg); }
                        50% { transform: translate(-5px, -35px) rotate(-3deg); }
                        75% { transform: translate(8px, -15px) rotate(3deg); }
                    }
                    @keyframes float-1 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(-15px, -25px) rotate(-5deg); }
                        66% { transform: translate(10px, -40px) rotate(5deg); }
                    }
                    @keyframes float-2 {
                        0%, 100% { transform: translate(0, 0); }
                        50% { transform: translate(5px, -30px); }
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
        const underParBonus = won && config && digsRemaining >= config.parDigs ? 75 : 0;
        const finalScore = score + digBonus + comboBonus + noDecoyBonus + underParBonus;

        // New star system: 0.5 for completion + 0.5 for bonus objective
        const completionStar = won ? 0.5 : 0;
        const bonusStar = won && bonusAchieved ? 0.5 : 0;
        const starsEarned = completionStar + bonusStar;
        const isFullStar = starsEarned === 1;

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
                    {won ? (isFullStar ? '👑' : '💎') : '💀'}
                </div>

                <h1 style={{
                    fontSize: '42px',
                    color: won ? (isFullStar ? theme.gold : theme.success) : theme.error,
                    marginBottom: '10px',
                    textShadow: won ? `0 0 30px ${theme.goldGlow}` : 'none'
                }}>
                    {won
                        ? (isFullStar ? 'PERFECT LEVEL!' : 'TREASURE FOUND!')
                        : 'OUT OF DIGS!'}
                </h1>

                {won && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        {/* Star display with half-star support */}
                        <div style={{
                            width: '50px', height: '50px',
                            borderRadius: '50%',
                            border: `3px solid ${theme.gold}`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: starsEarned > 0 ? `0 0 15px ${theme.goldGlow}` : 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: `${starsEarned * 100}%`,
                                background: theme.gold
                            }} />
                        </div>
                        <span style={{ fontSize: '28px', color: theme.gold, fontWeight: 'bold' }}>
                            {starsEarned === 1 ? '★' : starsEarned === 0.5 ? '½★' : '☆'}
                        </span>
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
                        padding: '15px 25px',
                        borderRadius: '10px',
                        marginBottom: '25px',
                        border: `2px solid ${isFullStar ? theme.gold : theme.success}`
                    }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ color: theme.success, fontWeight: 'bold' }}>
                                ✓ Level Complete: +½★
                            </span>
                        </div>
                        {config?.bonusObjective && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{
                                    color: bonusAchieved ? theme.gold : theme.textMuted,
                                    fontWeight: bonusAchieved ? 'bold' : 'normal'
                                }}>
                                    {bonusAchieved ? '✓' : '○'} Bonus: {config.bonusObjective.desc}
                                    {bonusAchieved ? ' +½★' : ''}
                                </span>
                            </div>
                        )}
                        <div style={{
                            borderTop: `1px solid ${theme.border}`,
                            paddingTop: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>
                                    +{starsEarned}★ earned!
                                </div>
                                <div style={{ color: theme.textMuted, fontSize: '11px' }}>
                                    (Level {currentLevel} of 10)
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: theme.textSecondary }}>
                                    World Progress: {getStars(selectedOpponent?.id || 0)}/10★
                                </div>
                                {getStars(selectedOpponent?.id || 0) >= 10 && selectedOpponent?.id < 9 && (
                                    <div style={{ color: theme.success, fontSize: '11px' }}>
                                        ✓ Next world unlocked!
                                    </div>
                                )}
                            </div>
                        </div>
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
