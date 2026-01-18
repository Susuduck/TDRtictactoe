const { useState, useEffect, useCallback, useRef } = React;

/**
 * COOK-OFF - Kitchen Chaos
 *
 * Professional progression system:
 * - 10 Worlds (Opponents), each with 10 Levels
 * - Each level earns up to 1 star (0.5 for completion, 1.0 for excellence)
 * - Worlds unlock when previous world has 10 stars
 * - Difficulty STEPS UP when entering a new world (World N+1 Level 1 > World N Level 10)
 * - Each level has specific difficulty parameters and objectives
 * - Each world has unique themed environment and atmosphere
 */

const CookOff = () => {
    // Base Theme
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff4500', accentBright: '#ff6633',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        timerGreen: '#50c878', timerYellow: '#f4c542', timerOrange: '#ff8c00', timerRed: '#e85a50',
        starEmpty: '#3a3450', starHalf: '#8a7a40', starFull: '#f4c542'
    };

    // World-specific themes with unique environments
    const worldThemes = {
        0: { // Funky Frog - Peaceful Pond Cafe
            name: 'Lily Pad Cafe',
            setting: 'outdoor',
            timeOfDay: 'day',
            bgGradient: 'linear-gradient(180deg, #87CEEB 0%, #98D8AA 40%, #2E7D32 100%)',
            bgPattern: 'radial-gradient(circle at 20% 80%, #4CAF5033 0%, transparent 30%), radial-gradient(circle at 80% 60%, #81C78433 0%, transparent 25%)',
            ambientEmojis: ['🌿', '🪷', '💧', '🦟', '🌸', '☘️'],
            decorations: ['🌳', '🪨', '🌺'],
            particleEmoji: '💧',
            panelBg: 'rgba(46, 125, 50, 0.85)',
            panelBorder: '#4CAF50',
            glowColor: '#50c87844'
        },
        1: { // Cheeky Chicken - Cozy Farm Kitchen
            name: 'Farm Kitchen',
            setting: 'indoor',
            timeOfDay: 'morning',
            bgGradient: 'linear-gradient(180deg, #FFE4B5 0%, #DEB887 50%, #8B4513 100%)',
            bgPattern: 'repeating-linear-gradient(90deg, #D2691E11 0px, #D2691E11 2px, transparent 2px, transparent 20px)',
            ambientEmojis: ['🌾', '🥚', '🌻', '☀️', '🐣', '🌽'],
            decorations: ['🏠', '🌻', '🚜'],
            particleEmoji: '🥚',
            panelBg: 'rgba(139, 69, 19, 0.85)',
            panelBorder: '#e8a840',
            glowColor: '#e8a84044'
        },
        2: { // Disco Dinosaur - Retro Diner
            name: 'Disco Diner',
            setting: 'indoor',
            timeOfDay: 'night',
            bgGradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 50%, #4a1942 100%)',
            bgPattern: 'radial-gradient(circle at 30% 20%, #ff00ff22 0%, transparent 30%), radial-gradient(circle at 70% 80%, #00ffff22 0%, transparent 30%)',
            ambientEmojis: ['🪩', '✨', '💜', '🎵', '🎤', '💫'],
            decorations: ['🎸', '🎹', '📻'],
            particleEmoji: '✨',
            panelBg: 'rgba(75, 0, 130, 0.85)',
            panelBorder: '#a080c0',
            glowColor: '#a080c044'
        },
        3: { // Radical Raccoon - Back Alley Food Truck
            name: 'Night Market',
            setting: 'outdoor',
            timeOfDay: 'night',
            bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #2d2d44 50%, #16213e 100%)',
            bgPattern: 'repeating-linear-gradient(0deg, #ffffff05 0px, #ffffff05 1px, transparent 1px, transparent 40px)',
            ambientEmojis: ['🌙', '🏮', '💡', '🗑️', '📦', '🔧'],
            decorations: ['🚚', '🏪', '🌃'],
            particleEmoji: '💡',
            panelBg: 'rgba(45, 45, 68, 0.9)',
            panelBorder: '#808090',
            glowColor: '#80809044'
        },
        4: { // Electric Eel - Underwater Sushi Bar
            name: 'Deep Sea Kitchen',
            setting: 'underwater',
            timeOfDay: 'night',
            bgGradient: 'linear-gradient(180deg, #001830 0%, #003366 50%, #001a33 100%)',
            bgPattern: 'radial-gradient(ellipse at 50% 0%, #0066cc33 0%, transparent 50%)',
            ambientEmojis: ['🫧', '🐠', '🦑', '⚡', '🌊', '💎'],
            decorations: ['🪸', '🐚', '⚓'],
            particleEmoji: '🫧',
            panelBg: 'rgba(0, 51, 102, 0.85)',
            panelBorder: '#50a8e8',
            glowColor: '#50a8e844'
        },
        5: { // Mysterious Moth - Candlelit Mystery Kitchen
            name: 'Candlelit Cellar',
            setting: 'indoor',
            timeOfDay: 'night',
            bgGradient: 'linear-gradient(180deg, #1a0a1a 0%, #2d1a2d 50%, #1a0a0a 100%)',
            bgPattern: 'radial-gradient(circle at 50% 30%, #ffaa0015 0%, transparent 40%)',
            ambientEmojis: ['🕯️', '🦇', '🌙', '🔮', '📜', '🗝️'],
            decorations: ['🏚️', '🕸️', '⚗️'],
            particleEmoji: '🦋',
            panelBg: 'rgba(45, 26, 45, 0.9)',
            panelBorder: '#c090a0',
            glowColor: '#c090a044'
        },
        6: { // Professor Penguin - Laboratory Kitchen
            name: 'Science Lab Kitchen',
            setting: 'indoor',
            timeOfDay: 'day',
            bgGradient: 'linear-gradient(180deg, #e8f4f8 0%, #b8d4e3 50%, #88a4b3 100%)',
            bgPattern: 'repeating-linear-gradient(90deg, #ffffff33 0px, #ffffff33 1px, transparent 1px, transparent 30px), repeating-linear-gradient(0deg, #ffffff33 0px, #ffffff33 1px, transparent 1px, transparent 30px)',
            ambientEmojis: ['🧪', '⚗️', '🔬', '📊', '💉', '🧫'],
            decorations: ['🖥️', '📋', '🔭'],
            particleEmoji: '❄️',
            panelBg: 'rgba(64, 128, 160, 0.85)',
            panelBorder: '#4080a0',
            glowColor: '#4080a044'
        },
        7: { // Sly Snake - Jungle Treehouse
            name: 'Jungle Canopy',
            setting: 'outdoor',
            timeOfDay: 'day',
            bgGradient: 'linear-gradient(180deg, #228B22 0%, #006400 40%, #004d00 100%)',
            bgPattern: 'radial-gradient(circle at 10% 20%, #32CD3233 0%, transparent 30%), radial-gradient(circle at 90% 70%, #00800033 0%, transparent 25%)',
            ambientEmojis: ['🌴', '🦜', '🌺', '🍃', '🦎', '🌿'],
            decorations: ['🏝️', '🎋', '🪵'],
            particleEmoji: '🍃',
            panelBg: 'rgba(0, 100, 0, 0.85)',
            panelBorder: '#60a060',
            glowColor: '#60a06044'
        },
        8: { // Wolf Warrior - Mountain Lodge
            name: 'Mountain Lodge',
            setting: 'indoor',
            timeOfDay: 'evening',
            bgGradient: 'linear-gradient(180deg, #4a4a5a 0%, #3a3a4a 50%, #2a2a3a 100%)',
            bgPattern: 'radial-gradient(circle at 20% 80%, #ff660022 0%, transparent 30%)',
            ambientEmojis: ['🏔️', '🌲', '🔥', '🪵', '❄️', '🐾'],
            decorations: ['🏕️', '🪓', '🛖'],
            particleEmoji: '❄️',
            panelBg: 'rgba(60, 60, 80, 0.9)',
            panelBorder: '#606080',
            glowColor: '#60608044'
        },
        9: { // Grand Master Grizzly - Royal Grand Kitchen
            name: 'Royal Palace Kitchen',
            setting: 'indoor',
            timeOfDay: 'evening',
            bgGradient: 'linear-gradient(180deg, #2a1a0a 0%, #4a3520 50%, #3a2510 100%)',
            bgPattern: 'repeating-linear-gradient(45deg, #d4a84011 0px, #d4a84011 2px, transparent 2px, transparent 20px)',
            ambientEmojis: ['👑', '💎', '🏆', '✨', '🎖️', '⭐'],
            decorations: ['🏰', '🪞', '🕯️'],
            particleEmoji: '✨',
            panelBg: 'rgba(74, 53, 32, 0.9)',
            panelBorder: '#d4a840',
            glowColor: '#d4a84066'
        }
    };

    // Ingredients
    const allIngredients = [
        { id: 'tomato', emoji: '🍅', name: 'Tomato' },
        { id: 'lettuce', emoji: '🥬', name: 'Lettuce' },
        { id: 'cheese', emoji: '🧀', name: 'Cheese' },
        { id: 'meat', emoji: '🥩', name: 'Meat' },
        { id: 'bread', emoji: '🍞', name: 'Bread' },
        { id: 'egg', emoji: '🥚', name: 'Egg' },
        { id: 'onion', emoji: '🧅', name: 'Onion' },
        { id: 'pepper', emoji: '🌶️', name: 'Pepper' },
        { id: 'mushroom', emoji: '🍄', name: 'Mushroom' },
        { id: 'fish', emoji: '🐟', name: 'Fish' },
        { id: 'shrimp', emoji: '🦐', name: 'Shrimp' },
        { id: 'carrot', emoji: '🥕', name: 'Carrot' },
        { id: 'potato', emoji: '🥔', name: 'Potato' },
        { id: 'rice', emoji: '🍚', name: 'Rice' },
        { id: 'noodle', emoji: '🍜', name: 'Noodles' },
        { id: 'avocado', emoji: '🥑', name: 'Avocado' }
    ];

    const dishEmojis = ['🍔', '🌮', '🍕', '🥗', '🍜', '🍛', '🥘', '🍲', '🥙', '🌯', '🍱', '🥡'];

    // World definitions with base parameters
    // Each world introduces a unique mechanic and has base difficulty settings
    // IMPORTANT: Each world's Level 1 must be HARDER than the previous world's Level 10
    // This creates a clear "step up" feeling when entering a new world
    // Note: Timer formula adds (recipeSize - 2) * 0.6s, so actual times are higher for larger recipes
    const worlds = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Beginner Chef',
            taunt: "Ribbit! Let's start simple!",
            winQuote: "Hop hop, delicious!", loseQuote: "You're learning!",
            special: 'none',
            specialDesc: 'Master the basics - no special mechanics',
            // World 1: Very forgiving, teaches the basics
            baseTime: 12,        // L1: 12s (comfortable learning)
            minTime: 9,          // L10: 9s (still relaxed)
            baseRecipeMin: 2, baseRecipeMax: 2, maxRecipeSize: 2,
            baseIngredients: 4, maxIngredients: 5,
            baseTarget: 300, targetGrowth: 25
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Breakfast Master',
            taunt: "Bawk! Keep that combo going!",
            winQuote: "Egg-cellent!", loseQuote: "Cluck cluck, nice try!",
            special: 'bonus_time',
            specialDesc: 'Combos grant +2 seconds - keep the streak alive!',
            // World 2: L1 at 8.5s (HARDER than W1 L10's 9s), introduces 3-ingredient recipes
            baseTime: 8.5, minTime: 6.5,
            baseRecipeMin: 2, baseRecipeMax: 3, maxRecipeSize: 3,
            baseIngredients: 5, maxIngredients: 6,
            baseTarget: 350, targetGrowth: 30
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Rhythm Cook',
            taunt: "Feel the beat, baby!",
            winQuote: "Groovy!", loseQuote: "You've got rhythm!",
            special: 'rhythm_bonus',
            specialDesc: 'Complete orders on the golden beat for 2x points!',
            // World 3: L1 at 6s (HARDER than W2 L10's 6.5s)
            baseTime: 6, minTime: 4.8,
            baseRecipeMin: 2, baseRecipeMax: 3, maxRecipeSize: 3,
            baseIngredients: 6, maxIngredients: 7,
            baseTarget: 400, targetGrowth: 35
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Scrappy Chef',
            taunt: "Use that wild card wisely!",
            winQuote: "Resourceful!", loseQuote: "Good scrapping!",
            special: 'wild_card',
            specialDesc: 'Wild card substitutes any ingredient - use it strategically!',
            // World 4: L1 at 4.5s (HARDER than W3 L10's 4.8s), wild card helps offset
            baseTime: 4.5, minTime: 3.5,
            baseRecipeMin: 3, baseRecipeMax: 3, maxRecipeSize: 4,
            baseIngredients: 7, maxIngredients: 8,
            baseTarget: 450, targetGrowth: 40
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Speed Demon',
            taunt: "Lightning reflexes required!",
            winQuote: "Shockingly fast!", loseQuote: "Quick thinking!",
            special: 'speed_surge',
            specialDesc: 'Speed rounds appear - faster timer but 1.5x points!',
            // World 5: L1 at 3.3s (HARDER than W4 L10's 3.5s) - this world is about speed
            baseTime: 3.3, minTime: 2.8,
            baseRecipeMin: 3, baseRecipeMax: 3, maxRecipeSize: 4,
            baseIngredients: 7, maxIngredients: 9,
            baseTarget: 500, targetGrowth: 45
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Secret Recipe Keeper',
            taunt: "Can you remember the hidden one?",
            winQuote: "Mystery solved!", loseQuote: "Sharp memory!",
            special: 'hidden_ingredient',
            specialDesc: 'One ingredient is hidden briefly - memorize the recipe!',
            // World 6: L1 at 2.6s (HARDER than W5 L10's 2.8s) + hidden ingredient challenge
            baseTime: 2.6, minTime: 2.2,
            baseRecipeMin: 3, baseRecipeMax: 4, maxRecipeSize: 4,
            baseIngredients: 8, maxIngredients: 10,
            baseTarget: 400, targetGrowth: 35
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Precision Chef',
            taunt: "No mistakes allowed!",
            winQuote: "Precisely!", loseQuote: "Scientific approach!",
            special: 'strict_order',
            specialDesc: 'Wrong ingredient = order failed, but 2x point rewards!',
            // World 7: L1 at 2s (HARDER than W6 L10's 2.2s) + strict order = punishing
            // 2x points compensate for the brutal precision requirement
            baseTime: 2, minTime: 1.7,
            baseRecipeMin: 3, baseRecipeMax: 4, maxRecipeSize: 4,
            baseIngredients: 8, maxIngredients: 11,
            baseTarget: 300, targetGrowth: 30  // Lower targets - strict mode is very hard
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Tricky Chef',
            taunt: "Watch for my tricksss!",
            winQuote: "Sssslippery!", loseQuote: "Sssharp eyes!",
            special: 'decoy_ingredients',
            specialDesc: 'Decoy ingredients appear - avoid the fakes!',
            // World 8: L1 at 1.5s (HARDER than W7 L10's 1.7s) + decoys = dangerous
            baseTime: 1.5, minTime: 1.2,
            baseRecipeMin: 3, baseRecipeMax: 4, maxRecipeSize: 5,
            baseIngredients: 9, maxIngredients: 12,
            baseTarget: 350, targetGrowth: 35
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Feeder',
            taunt: "The pack needs feeding! AWOO!",
            winQuote: "Pack satisfied!", loseQuote: "Alpha material!",
            special: 'multi_order',
            specialDesc: 'Two orders at once - complete either one!',
            // World 9: L1 at 1s (HARDER than W8 L10's 1.2s) - 2 order options help
            baseTime: 1, minTime: 0.8,
            baseRecipeMin: 3, baseRecipeMax: 4, maxRecipeSize: 5,
            baseIngredients: 9, maxIngredients: 13,
            baseTarget: 400, targetGrowth: 40
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Chef',
            taunt: "Face all challenges combined!",
            winQuote: "Legendary!", loseQuote: "True chef spirit!",
            special: 'all_challenges',
            specialDesc: 'All mechanics combined - the ultimate test!',
            // World 10: L1 at 0.6s (HARDER than W9 L10's 0.8s)
            // BRUTAL finale - but multi-order + wild card + large recipes give buffer
            // Recipe size bonus: (5-2)*0.6 = 1.8s extra, so actual time ~2.4-2.8s
            baseTime: 0.6, minTime: 0.4,
            baseRecipeMin: 4, baseRecipeMax: 5, maxRecipeSize: 5,
            baseIngredients: 10, maxIngredients: 14,
            baseTarget: 450, targetGrowth: 45
        }
    ];

    // Level configuration generator
    // Creates specific parameters for each level within a world
    const getLevelConfig = useCallback((worldId, level) => {
        const world = worlds[worldId];
        const progress = (level - 1) / 9; // 0 to 1 across 10 levels

        // Time decreases as levels progress
        const timer = world.baseTime - (world.baseTime - world.minTime) * progress;

        // Recipe size increases
        const recipeMin = Math.floor(world.baseRecipeMin + (world.maxRecipeSize - world.baseRecipeMin) * progress * 0.5);
        const recipeMax = Math.floor(world.baseRecipeMax + (world.maxRecipeSize - world.baseRecipeMax) * progress);

        // Ingredient pool grows
        const ingredientPool = Math.floor(world.baseIngredients + (world.maxIngredients - world.baseIngredients) * progress);

        // Target score for this level
        const targetScore = world.baseTarget + world.targetGrowth * (level - 1);

        // Orders needed to have a fair shot at the target (based on ~120-180 points per order average)
        const ordersNeeded = Math.ceil(targetScore / 150);

        // Special mechanic intensity (how often it appears)
        // Levels 1-3: 20%, Levels 4-6: 40%, Levels 7-10: 60%
        let mechanicIntensity = 0;
        if (world.special !== 'none') {
            if (level <= 3) mechanicIntensity = 0.2;
            else if (level <= 6) mechanicIntensity = 0.4;
            else mechanicIntensity = 0.6;
        }

        // Level-specific modifiers for variety
        const levelVariants = {
            1: { name: 'Introduction', desc: 'Get comfortable with the basics' },
            2: { name: 'Warm Up', desc: 'Building speed and confidence' },
            3: { name: 'Getting Started', desc: 'Finding your rhythm' },
            4: { name: 'Picking Up Pace', desc: 'Time to push a bit harder' },
            5: { name: 'Midpoint', desc: 'Halfway through this world' },
            6: { name: 'Stepping Up', desc: 'The challenge increases' },
            7: { name: 'Advanced', desc: 'Serious cooking territory' },
            8: { name: 'Expert', desc: 'Only skilled chefs make it here' },
            9: { name: 'Intense', desc: 'Near-mastery required' },
            10: { name: 'Mastery', desc: 'Prove your worth to advance' }
        };

        return {
            timer: Math.round(timer * 10) / 10,
            recipeMin,
            recipeMax: Math.max(recipeMin, recipeMax),
            ingredientPool,
            targetScore,
            ordersNeeded,
            mechanicIntensity,
            levelName: levelVariants[level].name,
            levelDesc: levelVariants[level].desc
        };
    }, []);

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [levelConfig, setLevelConfig] = useState(null);

    // Match state
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [secondOrder, setSecondOrder] = useState(null);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [orderTimer, setOrderTimer] = useState(0);
    const [maxOrderTime, setMaxOrderTime] = useState(0);
    const [ordersCompleted, setOrdersCompleted] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [streak, setStreak] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [showFeedback, setShowFeedback] = useState(null);
    const [beatPhase, setBeatPhase] = useState(0);
    const [hiddenIndex, setHiddenIndex] = useState(-1);
    const [decoyIngredient, setDecoyIngredient] = useState(null);
    const [isSpeedRound, setIsSpeedRound] = useState(false);
    const [wildCardActive, setWildCardActive] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [lastClickedIngredient, setLastClickedIngredient] = useState(null);
    const [completedDish, setCompletedDish] = useState(null);
    const [perfectBonus, setPerfectBonus] = useState(false);
    const [onFire, setOnFire] = useState(false);
    const [encouragement, setEncouragement] = useState(null);
    const [opponentMood, setOpponentMood] = useState('neutral'); // neutral, happy, worried, excited, taunting
    const [ambientParticles, setAmbientParticles] = useState([]);

    // Refs
    const timerRef = useRef(null);
    const gameTimerRef = useRef(null);
    const beatRef = useRef(null);
    const hiddenRevealRef = useRef(null);

    // Progression - stores star count per level (0, 0.5, or 1)
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('cookoff_progression_v3');
        if (saved) {
            const data = JSON.parse(saved);
            // Ensure structure is correct
            if (data.levelStars && data.levelStars.length === 10) {
                return data;
            }
        }
        // Initialize: 10 worlds, each with 10 levels, each level can have 0, 0.5, or 1 star
        return {
            levelStars: Array(10).fill(null).map(() => Array(10).fill(0)),
            bestScores: Array(10).fill(null).map(() => Array(10).fill(0))
        };
    });

    useEffect(() => {
        localStorage.setItem('cookoff_progression_v3', JSON.stringify(progression));
    }, [progression]);

    // Calculate total stars for a world
    const getWorldStars = useCallback((worldId) => {
        return progression.levelStars[worldId].reduce((sum, stars) => sum + stars, 0);
    }, [progression]);

    // Check if world is unlocked (need 10 stars in previous world)
    const isWorldUnlocked = useCallback((worldId) => {
        if (worldId === 0) return true;
        return getWorldStars(worldId - 1) >= 10;
    }, [getWorldStars]);

    // Check if world is mastered (all 10 stars)
    const isWorldMastered = useCallback((worldId) => {
        return getWorldStars(worldId) >= 10;
    }, [getWorldStars]);

    // Check if level is unlocked (previous level must have at least 0.5 stars)
    const isLevelUnlocked = useCallback((worldId, level) => {
        if (level === 1) return isWorldUnlocked(worldId);
        return progression.levelStars[worldId][level - 2] >= 0.5;
    }, [progression, isWorldUnlocked]);

    // Get stars for a specific level
    const getLevelStars = useCallback((worldId, level) => {
        return progression.levelStars[worldId][level - 1];
    }, [progression]);

    // Generate dish name
    const generateDishName = useCallback((recipe) => {
        const adjectives = ['Sizzling', 'Crispy', 'Zesty', 'Savory', 'Golden', 'Gourmet', 'Supreme', 'Deluxe',
                          'Smoky', 'Tangy', 'Hearty', 'Fresh', 'Spicy', 'Sweet', 'Rustic', 'Classic'];
        const styles = ['Delight', 'Surprise', 'Special', 'Fusion', 'Creation', 'Masterpiece',
                       'Bowl', 'Platter', 'Stack', 'Feast', 'Treat', 'Wonder'];
        const adjIdx = (recipe.length + (recipe[0]?.id.length || 0)) % adjectives.length;
        const styleIdx = (recipe.length * 2) % styles.length;
        return `${adjectives[adjIdx]} ${styles[styleIdx]}`;
    }, []);

    // Generate order based on level config
    const generateOrder = useCallback((isSecondary = false) => {
        if (!selectedWorld || !levelConfig) return null;

        const world = selectedWorld;
        const config = levelConfig;

        // Determine recipe size
        const size = config.recipeMin + Math.floor(Math.random() * (config.recipeMax - config.recipeMin + 1));

        // Get ingredient pool
        const pool = allIngredients.slice(0, config.ingredientPool);

        // Generate recipe (prefer no duplicates for clarity)
        const recipe = [];
        const usedIds = new Set();
        for (let i = 0; i < size; i++) {
            let ing;
            let attempts = 0;
            do {
                ing = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (usedIds.has(ing.id) && attempts < 20);
            usedIds.add(ing.id);
            recipe.push(ing);
        }

        // Available ingredients (recipe + extras)
        const extraCount = Math.min(config.ingredientPool, 4 + Math.floor(currentLevel / 3));
        const available = [...new Set(recipe.map(r => r.id))];
        while (available.length < extraCount && available.length < pool.length) {
            const extra = pool[Math.floor(Math.random() * pool.length)];
            if (!available.includes(extra.id)) {
                available.push(extra.id);
            }
        }

        const shuffledAvailable = available
            .map(id => pool.find(ing => ing.id === id))
            .sort(() => Math.random() - 0.5);

        // Apply special mechanics based on intensity
        let hidden = -1;
        let decoy = null;
        let hasWildCard = false;
        let speedRound = false;

        const shouldApplyMechanic = Math.random() < config.mechanicIntensity;

        if (shouldApplyMechanic) {
            if (world.special === 'hidden_ingredient' || world.special === 'all_challenges') {
                if (world.special === 'hidden_ingredient' || Math.random() < 0.3) {
                    hidden = Math.floor(Math.random() * recipe.length);
                }
            }

            if (world.special === 'decoy_ingredients' || world.special === 'all_challenges') {
                if (world.special === 'decoy_ingredients' || Math.random() < 0.3) {
                    const notInRecipe = pool.filter(ing => !recipe.find(r => r.id === ing.id));
                    if (notInRecipe.length > 0) {
                        decoy = notInRecipe[Math.floor(Math.random() * notInRecipe.length)];
                        shuffledAvailable.push(decoy);
                    }
                }
            }

            if (world.special === 'wild_card' || world.special === 'all_challenges') {
                hasWildCard = world.special === 'wild_card' || Math.random() < 0.3;
            }

            if (world.special === 'speed_surge' || world.special === 'all_challenges') {
                speedRound = world.special === 'speed_surge' ? Math.random() < 0.3 : Math.random() < 0.2;
            }
        }

        // Calculate timer
        let time = config.timer;

        // Add time for recipe size
        time += (size - 2) * 0.6;

        // Speed round reduction
        if (speedRound) time = Math.max(3, time * 0.65);

        // Gradual acceleration within match (very gentle)
        time = Math.max(3, time - ordersCompleted * 0.03);

        const order = {
            recipe,
            name: generateDishName(recipe),
            hidden,
            decoy,
            hasWildCard,
            speedRound,
            baseTime: time
        };

        if (!isSecondary) {
            setCurrentOrder(order);
            setAvailableIngredients(shuffledAvailable.sort(() => Math.random() - 0.5));
            setSelectedIngredients([]);
            setOrderTimer(time);
            setMaxOrderTime(time);
            setHiddenIndex(hidden);
            setDecoyIngredient(decoy);
            setIsSpeedRound(speedRound);
            setWildCardActive(hasWildCard);

            if (hidden >= 0) {
                clearTimeout(hiddenRevealRef.current);
                hiddenRevealRef.current = setTimeout(() => setHiddenIndex(-1), 1500);
            }
        }

        return order;
    }, [selectedWorld, levelConfig, currentLevel, ordersCompleted, generateDishName]);

    // Generate second order for Wolf Warrior
    const generateSecondOrder = useCallback(() => {
        if (!selectedWorld || selectedWorld.special !== 'multi_order') return;
        if (!levelConfig) return;

        const pool = allIngredients.slice(0, levelConfig.ingredientPool);
        const size = 2 + Math.floor(Math.random() * 2);
        const recipe = [];
        for (let i = 0; i < size; i++) {
            recipe.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        setSecondOrder({
            recipe,
            name: generateDishName(recipe)
        });
    }, [selectedWorld, levelConfig, generateDishName]);

    // Start match
    const startMatch = useCallback((world, level) => {
        const config = getLevelConfig(world.id, level);
        setSelectedWorld(world);
        setCurrentLevel(level);
        setLevelConfig(config);
        setScore(0);
        setMistakes(0);
        setOrdersCompleted(0);
        setCombo(0);
        setMaxCombo(0);
        setStreak(0);
        setGameTime(90);
        setShowFeedback(null);
        setScreenShake(false);
        setCompletedDish(null);
        setPerfectBonus(false);
        setOnFire(false);
        setEncouragement(null);
        setCurrentOrder(null);
        setSecondOrder(null);
        setGameState('playing');
    }, [getLevelConfig]);

    // Initialize first order
    useEffect(() => {
        if (gameState === 'playing' && !currentOrder && levelConfig) {
            generateOrder();
            if (selectedWorld?.special === 'multi_order') {
                generateSecondOrder();
            }
        }
    }, [gameState, currentOrder, levelConfig, generateOrder, generateSecondOrder, selectedWorld]);

    // Order timer
    useEffect(() => {
        if (gameState !== 'playing' || !currentOrder) return;

        timerRef.current = setInterval(() => {
            setOrderTimer(t => {
                if (t <= 0.1) {
                    handleOrderFailed('timeout');
                    return 0;
                }
                return Math.max(0, t - 0.1);
            });
        }, 100);

        return () => clearInterval(timerRef.current);
    }, [gameState, currentOrder]);

    // Game timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        gameTimerRef.current = setInterval(() => {
            setGameTime(t => {
                if (t <= 1) {
                    setGameState('result');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(gameTimerRef.current);
    }, [gameState]);

    // Beat timer
    useEffect(() => {
        if (gameState !== 'playing' || !selectedWorld) return;
        if (selectedWorld.special !== 'rhythm_bonus' && selectedWorld.special !== 'all_challenges') return;

        beatRef.current = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 600);

        return () => clearInterval(beatRef.current);
    }, [gameState, selectedWorld]);

    // Check milestones
    useEffect(() => {
        if (gameState !== 'playing' || !levelConfig) return;

        const percentage = score / levelConfig.targetScore;

        if (percentage >= 1 && !encouragement) {
            setEncouragement('TARGET REACHED! Keep going for excellence!');
            setOpponentMood('worried');
            setTimeout(() => setEncouragement(null), 2000);
        } else if (percentage >= 0.75 && percentage < 1 && !encouragement) {
            setEncouragement('Almost there! 75%');
            setTimeout(() => setEncouragement(null), 1500);
        } else if (percentage >= 0.5 && percentage < 0.75 && !encouragement) {
            setEncouragement('Halfway to completion!');
            setTimeout(() => setEncouragement(null), 1500);
        }
    }, [score, levelConfig, gameState, encouragement]);

    // Ambient particles animation
    useEffect(() => {
        if (gameState !== 'playing' || !selectedWorld) return;

        const worldTheme = worldThemes[selectedWorld.id];
        const createParticle = () => ({
            id: Math.random(),
            emoji: worldTheme.ambientEmojis[Math.floor(Math.random() * worldTheme.ambientEmojis.length)],
            x: Math.random() * 100,
            y: -10,
            speed: 0.5 + Math.random() * 1,
            size: 12 + Math.random() * 12,
            opacity: 0.3 + Math.random() * 0.4
        });

        // Initialize with some particles
        setAmbientParticles(Array(6).fill(null).map(() => ({
            ...createParticle(),
            y: Math.random() * 100
        })));

        const interval = setInterval(() => {
            setAmbientParticles(prev => {
                // Move existing particles down
                const moved = prev.map(p => ({
                    ...p,
                    y: p.y + p.speed
                })).filter(p => p.y < 110);

                // Add new particle occasionally
                if (moved.length < 8 && Math.random() < 0.3) {
                    moved.push(createParticle());
                }
                return moved;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [gameState, selectedWorld]);

    // Opponent mood based on game state
    useEffect(() => {
        if (gameState !== 'playing') {
            setOpponentMood('neutral');
            return;
        }

        // Update mood based on player performance
        if (combo >= 5) {
            setOpponentMood('worried');
        } else if (mistakes >= 2) {
            setOpponentMood('happy');
        } else if (combo >= 3) {
            setOpponentMood('taunting');
        } else if (orderTimer < maxOrderTime * 0.25) {
            setOpponentMood('excited');
        } else {
            setOpponentMood('neutral');
        }
    }, [gameState, combo, mistakes, orderTimer, maxOrderTime]);

    // Screen shake
    const triggerShake = useCallback(() => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
    }, []);

    // Handle ingredient click
    const handleIngredientClick = useCallback((ingredient) => {
        if (gameState !== 'playing' || !currentOrder) return;

        const world = selectedWorld;
        const recipe = currentOrder.recipe;
        const currentIndex = selectedIngredients.length;

        setLastClickedIngredient(ingredient.id);
        setTimeout(() => setLastClickedIngredient(null), 150);

        // Check decoy
        if (decoyIngredient && ingredient.id === decoyIngredient.id) {
            triggerShake();
            handleOrderFailed('decoy');
            return;
        }

        // Wild card
        if (wildCardActive && ingredient.id === 'wild') {
            const newSelected = [...selectedIngredients, recipe[currentIndex]];
            setSelectedIngredients(newSelected);
            if (newSelected.length === recipe.length) {
                handleOrderComplete();
            }
            return;
        }

        // Check correct ingredient
        const expected = recipe[currentIndex];
        if (ingredient.id === expected.id) {
            const newSelected = [...selectedIngredients, ingredient];
            setSelectedIngredients(newSelected);
            if (newSelected.length === recipe.length) {
                handleOrderComplete();
            }
        } else {
            triggerShake();
            if (world.special === 'strict_order') {
                handleOrderFailed('wrong');
            } else {
                setStreak(0);
                setOnFire(false);
                setShowFeedback({ type: 'wrong', message: 'Wrong!' });
                setTimeout(() => setShowFeedback(null), 400);
            }
        }
    }, [gameState, currentOrder, selectedIngredients, selectedWorld, decoyIngredient, wildCardActive, triggerShake]);

    // Handle order complete
    const handleOrderComplete = useCallback(() => {
        const world = selectedWorld;
        let points = 100;
        let bonusMessages = [];

        // Time bonus
        const timePercent = orderTimer / maxOrderTime;
        points += Math.floor(orderTimer * 15);

        // Perfect bonus
        if (timePercent > 0.7) {
            points += 50;
            bonusMessages.push('PERFECT!');
            setPerfectBonus(true);
            setTimeout(() => setPerfectBonus(false), 500);
        }

        // Combo
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(m => Math.max(m, newCombo));
        if (newCombo >= 2) {
            points += newCombo * 15;
        }

        // Streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 5 && !onFire) {
            setOnFire(true);
            bonusMessages.push('ON FIRE!');
        }
        if (onFire) {
            points = Math.floor(points * 1.25);
        }

        // World-specific bonuses
        if ((world.special === 'rhythm_bonus' || world.special === 'all_challenges') && beatPhase === 0) {
            points = Math.floor(points * 2);
            bonusMessages.push('RHYTHM 2X!');
        }

        if (world.special === 'strict_order') {
            points = Math.floor(points * 2);
            bonusMessages.push('PRECISION 2X!');
        }

        if (isSpeedRound) {
            points = Math.floor(points * 1.5);
            bonusMessages.push('SPEED 1.5X!');
        }

        setScore(s => s + points);
        setOrdersCompleted(o => o + 1);

        // Bonus time
        if (world.special === 'bonus_time' && newCombo >= 2) {
            setGameTime(t => Math.min(90, t + 2));
            bonusMessages.push('+2s!');
        }

        const dish = dishEmojis[Math.floor(Math.random() * dishEmojis.length)];
        setCompletedDish(dish);

        setShowFeedback({
            type: 'success',
            message: `+${points}!`,
            combo: newCombo,
            bonuses: bonusMessages,
            dish
        });

        setTimeout(() => {
            setShowFeedback(null);
            setCompletedDish(null);
            setCurrentOrder(null);
            setSecondOrder(null);
            generateOrder();
            if (world.special === 'multi_order') {
                generateSecondOrder();
            }
        }, 600);
    }, [combo, streak, onFire, orderTimer, maxOrderTime, selectedWorld, beatPhase, isSpeedRound, generateOrder, generateSecondOrder]);

    // Handle order failed
    const handleOrderFailed = useCallback((reason) => {
        setMistakes(m => {
            const newMistakes = m + 1;
            if (newMistakes >= 3) {
                setTimeout(() => setGameState('result'), 600);
            }
            return newMistakes;
        });
        setCombo(0);
        setStreak(0);
        setOnFire(false);

        const messages = {
            timeout: "Time's up!",
            wrong: 'Wrong order!',
            decoy: 'Decoy caught you!'
        };

        setShowFeedback({ type: 'error', message: messages[reason] || 'Failed!' });

        setTimeout(() => {
            setShowFeedback(null);
            setCurrentOrder(null);
            setSecondOrder(null);
            if (mistakes + 1 < 3) {
                generateOrder();
                if (selectedWorld?.special === 'multi_order') {
                    generateSecondOrder();
                }
            }
        }, 600);
    }, [mistakes, generateOrder, generateSecondOrder, selectedWorld]);

    // Switch to second order
    const switchToSecondOrder = useCallback(() => {
        if (!secondOrder) return;
        const temp = currentOrder;
        setCurrentOrder({
            ...secondOrder,
            hidden: -1,
            decoy: null,
            hasWildCard: false,
            speedRound: false,
            baseTime: maxOrderTime
        });
        setSecondOrder(temp);
        setSelectedIngredients([]);
        setHiddenIndex(-1);
        setDecoyIngredient(null);
        setWildCardActive(false);
        setIsSpeedRound(false);
    }, [currentOrder, secondOrder, maxOrderTime]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result' || !levelConfig || !selectedWorld) return;

        const percentage = score / levelConfig.targetScore;
        const hadNoMistakes = mistakes === 0;

        // Calculate stars earned
        // 0.5 stars: Complete level (50% of target, less than 3 mistakes)
        // 1.0 stars: Excellence (100% of target OR 0 mistakes)
        let starsEarned = 0;

        if (mistakes < 3 && percentage >= 0.5) {
            starsEarned = 0.5; // Completion
            if (percentage >= 1 || hadNoMistakes) {
                starsEarned = 1; // Excellence
            }
        }

        // Only update if we earned more stars than before
        const currentStars = getLevelStars(selectedWorld.id, currentLevel);
        if (starsEarned > currentStars) {
            setProgression(prev => {
                const newLevelStars = prev.levelStars.map((world, wIdx) =>
                    world.map((stars, lIdx) => {
                        if (wIdx === selectedWorld.id && lIdx === currentLevel - 1) {
                            return starsEarned;
                        }
                        return stars;
                    })
                );
                const newBestScores = prev.bestScores.map((world, wIdx) =>
                    world.map((best, lIdx) => {
                        if (wIdx === selectedWorld.id && lIdx === currentLevel - 1) {
                            return Math.max(best, score);
                        }
                        return best;
                    })
                );
                return { levelStars: newLevelStars, bestScores: newBestScores };
            });
        }
    }, [gameState, score, levelConfig, selectedWorld, currentLevel, mistakes, getLevelStars]);

    // Keyboard
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    setGameState('select');
                    setCurrentOrder(null);
                    setSecondOrder(null);
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState]);

    // Cleanup
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearInterval(gameTimerRef.current);
            clearInterval(beatRef.current);
            clearTimeout(hiddenRevealRef.current);
        };
    }, []);

    // Star display component
    const StarIcon = ({ filled }) => (
        <div style={{
            width: '18px',
            height: '18px',
            position: 'relative',
            display: 'inline-block'
        }}>
            {/* Empty star background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                color: theme.starEmpty,
                fontSize: '16px',
                lineHeight: '18px',
                textAlign: 'center'
            }}>★</div>
            {/* Filled portion */}
            {filled > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: filled === 1 ? '100%' : '50%',
                    height: '100%',
                    overflow: 'hidden',
                    color: theme.starFull,
                    fontSize: '16px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    textShadow: filled === 1 ? `0 0 8px ${theme.gold}` : 'none'
                }}>★</div>
            )}
        </div>
    );

    // World star bar
    const WorldStarBar = ({ worldId }) => {
        const stars = getWorldStars(worldId);
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                    width: '100px',
                    height: '8px',
                    background: theme.bgDark,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{
                        width: `${(stars / 10) * 100}%`,
                        height: '100%',
                        background: stars >= 10
                            ? `linear-gradient(90deg, ${theme.gold}, ${theme.accent})`
                            : `linear-gradient(90deg, ${theme.gold}, ${theme.gold}88)`,
                        transition: 'width 0.3s'
                    }} />
                </div>
                <span style={{
                    fontSize: '12px',
                    color: stars >= 10 ? theme.gold : theme.textMuted,
                    minWidth: '40px'
                }}>
                    {stars}/10 ★
                </span>
            </div>
        );
    };

    // Timer color
    const getTimerColor = (timer, maxTime) => {
        const percent = timer / maxTime;
        if (percent > 0.6) return theme.timerGreen;
        if (percent > 0.35) return theme.timerYellow;
        if (percent > 0.15) return theme.timerOrange;
        return theme.timerRed;
    };

    // MENU SCREEN
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f1a 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '80px', marginBottom: '10px', animation: 'bounce 1s infinite' }}>👨‍🍳</div>
                <h1 style={{ fontSize: '42px', marginBottom: '5px', color: theme.accent, textShadow: '0 0 20px rgba(255,69,0,0.5)' }}>
                    COOK-OFF
                </h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px', fontSize: '22px' }}>Kitchen Chaos</p>
                <p style={{ color: theme.textMuted, marginBottom: '30px', textAlign: 'center', maxWidth: '450px', lineHeight: '1.6' }}>
                    Master 10 worlds of culinary chaos! Complete levels to earn stars and unlock new challenges!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '18px 60px', fontSize: '22px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '12px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 6px 20px rgba(255, 69, 0, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 69, 0, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 69, 0, 0.4)';
                    }}
                >
                    START COOKING
                </button>

                <a href="../menu.html" style={{
                    marginTop: '25px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>← Back to Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // WORLD SELECT SCREEN
    if (gameState === 'select') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f1a 100%)`,
                padding: '20px', color: theme.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                    }}>← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your World</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '18px', maxWidth: '1300px', margin: '0 auto'
                }}>
                    {worlds.map((world, idx) => {
                        const unlocked = isWorldUnlocked(idx);
                        const mastered = isWorldMastered(idx);
                        const stars = getWorldStars(idx);
                        const needsStars = idx > 0 ? 10 - getWorldStars(idx - 1) : 0;

                        return (
                            <div
                                key={world.id}
                                onClick={() => unlocked && (setSelectedWorld(world), setGameState('level_select'))}
                                style={{
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? world.color : theme.border}`,
                                    borderRadius: '15px', padding: '18px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    boxShadow: unlocked ? `0 4px 15px ${world.color}22` : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = `0 8px 25px ${world.color}44`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = unlocked ? `0 4px 15px ${world.color}22` : 'none';
                                }}
                            >
                                {/* Lock or mastery badge */}
                                {!unlocked && (
                                    <div style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        background: theme.bgDark, padding: '4px 10px',
                                        borderRadius: '8px', fontSize: '11px', color: theme.textMuted
                                    }}>
                                        🔒 Need {needsStars} more ★
                                    </div>
                                )}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        background: `linear-gradient(135deg, ${theme.gold}, ${theme.accent})`,
                                        padding: '4px 10px', borderRadius: '8px',
                                        fontSize: '11px', fontWeight: 'bold', color: 'white'
                                    }}>
                                        ★ MASTERED
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px', width: '75px', height: '75px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${world.color}44, ${world.color}22)`,
                                        borderRadius: '50%', border: `2px solid ${world.color}66`
                                    }}>{world.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '11px', color: theme.textMuted, marginBottom: '2px'
                                        }}>World {idx + 1}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: world.color }}>{world.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>{world.title}</div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            background: `${world.color}22`, padding: '5px 10px',
                                            borderRadius: '6px', marginBottom: '8px',
                                            border: `1px solid ${world.color}33`
                                        }}>
                                            ✨ {world.specialDesc}
                                        </div>
                                        {/* Kitchen theme preview */}
                                        <div style={{
                                            fontSize: '10px', color: theme.textMuted,
                                            marginBottom: '8px',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                            <span style={{
                                                background: worldThemes[idx].bgGradient,
                                                width: '20px', height: '20px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }} />
                                            <span>{worldThemes[idx].name}</span>
                                            <span style={{ opacity: 0.5 }}>•</span>
                                            <span>{worldThemes[idx].setting === 'outdoor' ? '🌳' : worldThemes[idx].setting === 'underwater' ? '🌊' : '🏠'}</span>
                                            <span>{worldThemes[idx].timeOfDay === 'day' ? '☀️' : worldThemes[idx].timeOfDay === 'morning' ? '🌅' : worldThemes[idx].timeOfDay === 'evening' ? '🌆' : '🌙'}</span>
                                        </div>
                                        <WorldStarBar worldId={idx} />
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
    if (gameState === 'level_select' && selectedWorld) {
        const worldStars = getWorldStars(selectedWorld.id);
        const worldTheme = worldThemes[selectedWorld.id];

        return (
            <div style={{
                minHeight: '100vh',
                background: worldTheme.bgGradient,
                padding: '20px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: worldTheme.bgPattern,
                    opacity: 0.5,
                    pointerEvents: 'none'
                }} />

                {/* Ambient decorations */}
                <div style={{
                    position: 'absolute',
                    top: '20%', left: '5%',
                    fontSize: '40px', opacity: 0.3,
                    pointerEvents: 'none',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    {worldTheme.ambientEmojis[0]}
                </div>
                <div style={{
                    position: 'absolute',
                    top: '60%', right: '5%',
                    fontSize: '35px', opacity: 0.3,
                    pointerEvents: 'none',
                    animation: 'float 4s ease-in-out infinite'
                }}>
                    {worldTheme.ambientEmojis[1]}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10%', left: '10%',
                    fontSize: '45px', opacity: 0.25,
                    pointerEvents: 'none'
                }}>
                    {worldTheme.decorations[0]}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10%', right: '10%',
                    fontSize: '45px', opacity: 0.25,
                    pointerEvents: 'none'
                }}>
                    {worldTheme.decorations[2]}
                </div>

                <style>{`
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                `}</style>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(0,0,0,0.4)', border: `1px solid ${worldTheme.panelBorder}`,
                    color: theme.text, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(5px)'
                }}>← Back to Worlds</button>

                {/* Kitchen name badge */}
                <div style={{
                    marginTop: '15px',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    zIndex: 10
                }}>
                    <span>{worldTheme.setting === 'outdoor' ? '🌳' : worldTheme.setting === 'underwater' ? '🌊' : '🏠'}</span>
                    <span style={{ color: worldTheme.panelBorder }}>{worldTheme.name}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{worldTheme.timeOfDay === 'day' ? '☀️' : worldTheme.timeOfDay === 'morning' ? '🌅' : worldTheme.timeOfDay === 'evening' ? '🌆' : '🌙'}</span>
                </div>

                <div style={{ fontSize: '80px', marginTop: '15px', zIndex: 10, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{selectedWorld.emoji}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px', zIndex: 10 }}>World {selectedWorld.id + 1}</div>
                <h2 style={{ color: selectedWorld.color, marginTop: '5px', fontSize: '28px', zIndex: 10, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{selectedWorld.name}</h2>
                <p style={{ color: theme.text, zIndex: 10 }}>{selectedWorld.title}</p>
                <p style={{ color: theme.textSecondary, fontStyle: 'italic', marginTop: '8px', zIndex: 10, background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '8px' }}>"{selectedWorld.taunt}"</p>

                <div style={{
                    marginTop: '12px', padding: '10px 20px',
                    background: worldTheme.panelBg, borderRadius: '8px',
                    border: `1px solid ${worldTheme.panelBorder}`,
                    zIndex: 10, backdropFilter: 'blur(5px)'
                }}>
                    ✨ {selectedWorld.specialDesc}
                </div>

                <div style={{ marginTop: '15px', zIndex: 10 }}>
                    <WorldStarBar worldId={selectedWorld.id} />
                </div>

                <h3 style={{ marginTop: '25px', marginBottom: '15px', color: theme.text, zIndex: 10 }}>Select Level</h3>

                {/* Level grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '10px',
                    maxWidth: '500px',
                    width: '100%',
                    zIndex: 10
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const level = i + 1;
                        const unlocked = isLevelUnlocked(selectedWorld.id, level);
                        const stars = getLevelStars(selectedWorld.id, level);
                        const config = getLevelConfig(selectedWorld.id, level);
                        const bestScore = progression.bestScores[selectedWorld.id][i];

                        return (
                            <div
                                key={i}
                                onClick={() => unlocked && startMatch(selectedWorld, level)}
                                style={{
                                    background: unlocked
                                        ? worldTheme.panelBg
                                        : 'rgba(0,0,0,0.4)',
                                    border: `2px solid ${unlocked ? worldTheme.panelBorder : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '12px',
                                    padding: '12px 8px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    textAlign: 'center',
                                    backdropFilter: 'blur(5px)',
                                    boxShadow: unlocked && stars >= 1 ? `0 0 15px ${worldTheme.glowColor}` : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.boxShadow = `0 6px 20px ${worldTheme.glowColor}`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = unlocked && stars >= 1 ? `0 0 15px ${worldTheme.glowColor}` : 'none';
                                }}
                            >
                                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                                    {unlocked ? level : '🔒'}
                                </div>
                                <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '6px' }}>
                                    {unlocked ? config.levelName : 'Locked'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                    <StarIcon filled={stars >= 0.5 ? (stars >= 1 ? 1 : 0.5) : 0} />
                                </div>
                                {unlocked && (
                                    <div style={{ fontSize: '9px', color: theme.textMuted, marginTop: '4px' }}>
                                        Target: {config.targetScore}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Star requirements legend */}
                <div style={{
                    marginTop: '20px', padding: '15px',
                    background: worldTheme.panelBg, borderRadius: '10px',
                    fontSize: '12px', color: theme.text,
                    maxWidth: '400px', textAlign: 'center',
                    zIndex: 10,
                    border: `1px solid ${worldTheme.panelBorder}55`,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>How to earn stars:</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <div>
                            <StarIcon filled={0.5} />
                            <span style={{ marginLeft: '5px' }}>Complete level</span>
                        </div>
                        <div>
                            <StarIcon filled={1} />
                            <span style={{ marginLeft: '5px' }}>100% target OR 0 mistakes</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // PLAYING SCREEN
    if (gameState === 'playing' && levelConfig) {
        const world = selectedWorld;
        const worldTheme = worldThemes[world?.id] || worldThemes[0];
        const showBeat = world?.special === 'rhythm_bonus' || world?.special === 'all_challenges';
        const timerColor = getTimerColor(orderTimer, maxOrderTime);
        const timerPercent = (orderTimer / maxOrderTime) * 100;
        const scorePercent = Math.min(100, (score / levelConfig.targetScore) * 100);

        // Opponent expressions based on mood
        const opponentExpressions = {
            neutral: { scale: 1, message: '' },
            happy: { scale: 1.1, message: '😏' },
            worried: { scale: 0.9, message: '😰' },
            excited: { scale: 1.15, message: '😤' },
            taunting: { scale: 1.05, message: '😎' }
        };
        const opponentState = opponentExpressions[opponentMood];

        return (
            <div style={{
                minHeight: '100vh',
                background: worldTheme.bgGradient,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                padding: '15px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(5px)' : 'none',
                transition: screenShake ? 'none' : 'transform 0.1s'
            }}>
                {/* Background pattern overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: worldTheme.bgPattern,
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Ambient floating particles */}
                {ambientParticles.map(particle => (
                    <div
                        key={particle.id}
                        style={{
                            position: 'absolute',
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            fontSize: `${particle.size}px`,
                            opacity: particle.opacity,
                            pointerEvents: 'none',
                            zIndex: 1,
                            transition: 'top 0.2s linear',
                            filter: 'blur(0.5px)'
                        }}
                    >
                        {particle.emoji}
                    </div>
                ))}

                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px', left: '10px',
                    fontSize: '30px', opacity: 0.4,
                    pointerEvents: 'none', zIndex: 1
                }}>
                    {worldTheme.decorations[0]}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '10px', right: '10px',
                    fontSize: '30px', opacity: 0.4,
                    pointerEvents: 'none', zIndex: 1
                }}>
                    {worldTheme.decorations[2]}
                </div>

                {/* Opponent character with reactions */}
                <div style={{
                    position: 'absolute',
                    top: '80px', right: '20px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', zIndex: 2,
                    transition: 'transform 0.3s ease'
                }}>
                    <div style={{
                        fontSize: '50px',
                        transform: `scale(${opponentState.scale})`,
                        transition: 'transform 0.3s ease',
                        filter: combo >= 5 ? 'grayscale(0.3)' : 'none',
                        animation: opponentMood === 'excited' ? 'opponentBounce 0.3s infinite' : 'none'
                    }}>
                        {world?.emoji}
                    </div>
                    {opponentState.message && (
                        <div style={{
                            fontSize: '20px',
                            marginTop: '4px',
                            animation: 'popIn 0.2s ease-out'
                        }}>
                            {opponentState.message}
                        </div>
                    )}
                    {opponentMood === 'taunting' && (
                        <div style={{
                            fontSize: '10px',
                            color: world?.color,
                            marginTop: '4px',
                            maxWidth: '80px',
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '4px 8px',
                            borderRadius: '8px'
                        }}>
                            {world?.taunt.split(' ').slice(0, 3).join(' ')}...
                        </div>
                    )}
                </div>

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '10px', padding: '10px 15px',
                    background: worldTheme.panelBg,
                    borderRadius: '10px',
                    border: `2px solid ${worldTheme.panelBorder}`,
                    boxShadow: `0 4px 15px ${worldTheme.glowColor}`,
                    zIndex: 10,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>TIME </span>
                            <span style={{
                                color: gameTime <= 15 ? theme.error : theme.text,
                                fontWeight: 'bold', fontSize: '18px', fontFamily: 'monospace'
                            }}>{gameTime}s</span>
                        </div>
                        <div>
                            <span style={{ color: theme.textMuted, fontSize: '10px' }}>SCORE </span>
                            <span style={{
                                color: score >= levelConfig.targetScore ? theme.success : theme.gold,
                                fontWeight: 'bold', fontSize: '18px'
                            }}>{score}</span>
                            <span style={{ color: theme.textMuted, fontSize: '11px' }}>/{levelConfig.targetScore}</span>
                        </div>
                        {combo >= 2 && (
                            <div style={{ color: onFire ? theme.accent : theme.success, fontWeight: 'bold' }}>
                                {onFire ? '🔥' : '⚡'} x{combo}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: world?.color }}>
                        <span style={{ fontSize: '20px' }}>{world?.emoji}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{world?.name}</span>
                        <span style={{ color: theme.textMuted, fontSize: '12px' }}>Lv.{currentLevel}</span>
                        {showBeat && (
                            <div style={{
                                width: '20px', height: '20px',
                                background: beatPhase === 0 ? theme.gold : theme.bgDark,
                                borderRadius: '50%', border: `2px solid ${beatPhase === 0 ? theme.gold : theme.border}`,
                                boxShadow: beatPhase === 0 ? `0 0 12px ${theme.gold}` : 'none'
                            }} />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '24px', height: '24px',
                                background: i < mistakes ? theme.error : theme.success,
                                borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                            }}>
                                {i < mistakes ? '✗' : '❤️'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '8px', padding: '0 5px' }}>
                    <div style={{
                        width: '100%', height: '6px', background: theme.bgDark,
                        borderRadius: '3px', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${scorePercent}%`, height: '100%',
                            background: scorePercent >= 100 ? theme.success : theme.gold,
                            transition: 'width 0.3s'
                        }} />
                    </div>
                </div>

                {/* Kitchen name badge */}
                <div style={{
                    position: 'absolute',
                    top: '15px', left: '15px',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: worldTheme.panelBorder,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(5px)'
                }}>
                    <span>{worldTheme.setting === 'outdoor' ? '🌳' : worldTheme.setting === 'underwater' ? '🌊' : '🏠'}</span>
                    <span>{worldTheme.name}</span>
                    <span style={{ opacity: 0.6 }}>•</span>
                    <span>{worldTheme.timeOfDay === 'day' ? '☀️' : worldTheme.timeOfDay === 'morning' ? '🌅' : worldTheme.timeOfDay === 'evening' ? '🌆' : '🌙'}</span>
                </div>

                {/* Speed round indicator */}
                {isSpeedRound && (
                    <div style={{
                        textAlign: 'center', padding: '6px',
                        background: `${theme.accent}88`,
                        borderRadius: '6px',
                        marginBottom: '8px', color: 'white', fontWeight: 'bold',
                        animation: 'pulse 0.4s infinite', fontSize: '13px',
                        zIndex: 10,
                        border: `2px solid ${theme.accent}`,
                        boxShadow: `0 0 20px ${theme.accent}66`
                    }}>
                        ⚡ SPEED ROUND - 1.5x POINTS! ⚡
                    </div>
                )}

                {/* Encouragement */}
                {encouragement && (
                    <div style={{
                        position: 'fixed', top: '18%', left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '12px 25px', background: theme.success,
                        borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                        color: 'white', zIndex: 50, animation: 'popIn 0.3s ease-out'
                    }}>
                        {encouragement}
                    </div>
                )}

                {/* Second order (Wolf Warrior) */}
                {secondOrder && (
                    <div
                        onClick={switchToSecondOrder}
                        style={{
                            background: worldTheme.panelBg,
                            border: `2px dashed ${worldTheme.panelBorder}`,
                            borderRadius: '8px', padding: '8px 12px', marginBottom: '8px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 10,
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 10px ${worldTheme.glowColor}`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.borderStyle = 'solid';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderStyle = 'dashed';
                        }}
                    >
                        <span style={{ fontSize: '11px', color: theme.textMuted }}>ALT:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {secondOrder.recipe.map((ing, i) => (
                                <span key={i} style={{ fontSize: '20px' }}>{ing.emoji}</span>
                            ))}
                        </div>
                        <span style={{ fontSize: '11px', color: world?.color }}>Switch →</span>
                    </div>
                )}

                {/* Current Order */}
                {currentOrder && (
                    <div style={{
                        background: worldTheme.panelBg,
                        borderRadius: '12px',
                        padding: '15px', marginBottom: '12px',
                        border: `2px solid ${timerPercent < 25 ? theme.error : worldTheme.panelBorder}`,
                        boxShadow: timerPercent < 25 ? `0 0 20px ${theme.error}44` : `0 4px 15px ${worldTheme.glowColor}`,
                        zIndex: 10,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '10px'
                        }}>
                            <div>
                                <span style={{ color: theme.textMuted, fontSize: '11px' }}>ORDER: </span>
                                <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '18px' }}>
                                    {currentOrder.name}
                                </span>
                            </div>
                            <div style={{
                                background: timerColor, padding: '4px 12px',
                                borderRadius: '15px', fontWeight: 'bold', fontSize: '16px',
                                fontFamily: 'monospace',
                                animation: timerPercent < 25 ? 'pulse 0.3s infinite' : 'none'
                            }}>
                                {orderTimer.toFixed(1)}s
                            </div>
                        </div>

                        {/* Timer bar */}
                        <div style={{
                            width: '100%', height: '8px', background: theme.bgDark,
                            borderRadius: '4px', overflow: 'hidden', marginBottom: '12px'
                        }}>
                            <div style={{
                                width: `${timerPercent}%`, height: '100%',
                                background: timerColor, transition: 'width 0.1s linear'
                            }} />
                        </div>

                        {/* Recipe */}
                        <div style={{
                            display: 'flex', gap: '10px', justifyContent: 'center',
                            flexWrap: 'wrap', marginBottom: '8px'
                        }}>
                            {currentOrder.recipe.map((ing, i) => {
                                const isSelected = i < selectedIngredients.length;
                                const isNext = i === selectedIngredients.length;
                                const isHidden = i === hiddenIndex && hiddenIndex >= 0;

                                return (
                                    <div key={i} style={{
                                        width: '55px', height: '55px',
                                        background: isSelected ? `${theme.success}44` : theme.bgDark,
                                        border: `3px solid ${isSelected ? theme.success : isNext ? theme.accent : theme.border}`,
                                        borderRadius: '10px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '30px',
                                        boxShadow: isNext ? `0 0 12px ${theme.accent}44` : 'none',
                                        transform: isSelected ? 'scale(0.95)' : 'scale(1)'
                                    }}>
                                        {isHidden ? '❓' : ing.emoji}
                                    </div>
                                );
                            })}
                            {completedDish && (
                                <div style={{
                                    width: '55px', height: '55px',
                                    background: `${theme.gold}44`, border: `3px solid ${theme.gold}`,
                                    borderRadius: '10px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '30px',
                                    marginLeft: '10px', animation: 'popIn 0.3s ease-out'
                                }}>
                                    {completedDish}
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: '12px' }}>
                            {selectedIngredients.length} / {currentOrder.recipe.length}
                            {perfectBonus && <span style={{ color: theme.gold, marginLeft: '8px' }}>⭐ PERFECT!</span>}
                        </div>
                    </div>
                )}

                {/* Ingredients */}
                <div style={{
                    flex: 1,
                    background: `${worldTheme.panelBg}`,
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex', flexDirection: 'column',
                    border: `2px solid ${worldTheme.panelBorder}55`,
                    boxShadow: `inset 0 2px 10px rgba(0,0,0,0.3)`,
                    zIndex: 10,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        textAlign: 'center', marginBottom: '15px',
                        color: theme.textSecondary, fontSize: '12px'
                    }}>
                        Tap ingredients in order →
                    </div>

                    <div style={{
                        display: 'flex', gap: '10px', justifyContent: 'center',
                        flexWrap: 'wrap', flex: 1, alignContent: 'center'
                    }}>
                        {availableIngredients.map((ing, i) => {
                            const isDecoy = decoyIngredient?.id === ing.id;
                            const isClicked = lastClickedIngredient === ing.id;

                            return (
                                <button
                                    key={`${ing.id}-${i}`}
                                    onClick={() => handleIngredientClick(ing)}
                                    style={{
                                        width: '75px', height: '75px',
                                        background: isDecoy
                                            ? `linear-gradient(135deg, ${theme.bgPanel}, #3a2440)`
                                            : `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bg})`,
                                        border: `2px solid ${isDecoy ? '#5a3050' : theme.borderLight}`,
                                        borderRadius: '12px', display: 'flex',
                                        flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer',
                                        fontSize: '32px', transition: 'all 0.1s',
                                        transform: isClicked ? 'scale(0.9)' : 'scale(1)',
                                        boxShadow: isClicked ? `0 0 15px ${theme.accent}` : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.borderColor = theme.accent;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = isDecoy ? '#5a3050' : theme.borderLight;
                                    }}
                                >
                                    {ing.emoji}
                                    <span style={{ fontSize: '9px', color: theme.textMuted, marginTop: '2px' }}>
                                        {ing.name}
                                    </span>
                                </button>
                            );
                        })}

                        {wildCardActive && (
                            <button
                                onClick={() => handleIngredientClick({ id: 'wild', emoji: '🌟', name: 'Wild' })}
                                style={{
                                    width: '75px', height: '75px',
                                    background: `linear-gradient(135deg, ${theme.gold}55, ${theme.gold}22)`,
                                    border: `3px solid ${theme.gold}`, borderRadius: '12px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: '32px', animation: 'pulse 0.8s infinite'
                                }}
                            >
                                🌟
                                <span style={{ fontSize: '9px', color: theme.gold, marginTop: '2px', fontWeight: 'bold' }}>
                                    WILD
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Feedback overlay */}
                {showFeedback && (
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px 40px',
                        background: showFeedback.type === 'success' ? theme.success
                            : showFeedback.type === 'error' ? theme.error : theme.accent,
                        borderRadius: '15px', fontSize: '30px', fontWeight: 'bold',
                        color: 'white', zIndex: 100, animation: 'popIn 0.2s ease-out',
                        textAlign: 'center'
                    }}>
                        <div>{showFeedback.message}</div>
                        {showFeedback.combo >= 3 && (
                            <div style={{ fontSize: '14px', marginTop: '4px' }}>🔥 {showFeedback.combo}x Combo!</div>
                        )}
                        {showFeedback.bonuses?.length > 0 && (
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>{showFeedback.bonuses.join(' • ')}</div>
                        )}
                        {showFeedback.dish && (
                            <div style={{ fontSize: '40px', marginTop: '4px' }}>{showFeedback.dish}</div>
                        )}
                    </div>
                )}

                <style>{`
                    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                    @keyframes popIn { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
                    @keyframes opponentBounce { 0%, 100% { transform: translateY(0) scale(1.15); } 50% { transform: translateY(-5px) scale(1.15); } }
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                    @keyframes glow { 0%, 100% { box-shadow: 0 0 10px ${worldTheme.glowColor}; } 50% { box-shadow: 0 0 25px ${worldTheme.glowColor}; } }
                `}</style>
            </div>
        );
    }

    // RESULT SCREEN
    if (gameState === 'result' && levelConfig && selectedWorld) {
        const percentage = score / levelConfig.targetScore;
        const hadNoMistakes = mistakes === 0;
        const completed = mistakes < 3 && percentage >= 0.5;
        const excellent = mistakes < 3 && (percentage >= 1 || hadNoMistakes);

        // Stars earned this round
        let starsEarned = 0;
        if (completed) starsEarned = 0.5;
        if (excellent) starsEarned = 1;

        const previousStars = getLevelStars(selectedWorld.id, currentLevel);
        const newStars = Math.max(previousStars, starsEarned);
        const gainedStars = newStars - previousStars;

        // Check if next level unlocked
        const nextLevelUnlocked = currentLevel < 10 && newStars >= 0.5;

        // Check if world completed
        const worldStars = getWorldStars(selectedWorld.id);
        const nextWorldId = selectedWorld.id + 1;
        const nextWorldUnlocked = nextWorldId < 10 && worldStars >= 10;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${completed ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '15px' }}>
                    {mistakes >= 3 ? '💔' : excellent ? '🌟' : completed ? '✓' : '😢'}
                </div>

                <h1 style={{
                    fontSize: '36px',
                    color: excellent ? theme.gold : completed ? theme.success : theme.error,
                    marginBottom: '8px'
                }}>
                    {mistakes >= 3 ? 'KITCHEN DISASTER!'
                     : excellent ? 'EXCELLENCE!'
                     : completed ? 'LEVEL COMPLETE!'
                     : 'NOT QUITE...'}
                </h1>

                <p style={{
                    color: selectedWorld.color, fontStyle: 'italic', fontSize: '16px', marginBottom: '20px'
                }}>
                    {selectedWorld.emoji} "{completed ? selectedWorld.loseQuote : selectedWorld.winQuote}"
                </p>

                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px', marginBottom: '20px',
                    background: theme.bgPanel, padding: '20px', borderRadius: '12px', minWidth: '280px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>SCORE</div>
                        <div style={{ color: theme.gold, fontSize: '26px', fontWeight: 'bold' }}>{score}</div>
                        <div style={{ color: theme.textMuted, fontSize: '10px' }}>/ {levelConfig.targetScore}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>ORDERS</div>
                        <div style={{ color: theme.accent, fontSize: '26px', fontWeight: 'bold' }}>{ordersCompleted}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>MAX COMBO</div>
                        <div style={{ color: theme.success, fontSize: '26px', fontWeight: 'bold' }}>{maxCombo}x</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>MISTAKES</div>
                        <div style={{
                            color: mistakes === 0 ? theme.gold : mistakes < 3 ? theme.text : theme.error,
                            fontSize: '26px', fontWeight: 'bold'
                        }}>{mistakes}/3</div>
                    </div>
                </div>

                {/* Star reward */}
                <div style={{
                    background: theme.bgPanel, padding: '15px 25px', borderRadius: '10px',
                    marginBottom: '20px', textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '8px', color: theme.textSecondary, fontSize: '12px' }}>
                        Level {currentLevel} Stars:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        <StarIcon filled={newStars >= 0.5 ? (newStars >= 1 ? 1 : 0.5) : 0} />
                        {gainedStars > 0 && (
                            <span style={{ color: theme.gold, fontSize: '14px', fontWeight: 'bold' }}>
                                +{gainedStars === 0.5 ? '½' : '1'} ★ NEW!
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: theme.textMuted }}>
                        {excellent
                            ? '★ Excellence achieved!'
                            : completed
                            ? 'Get 100% target OR 0 mistakes for full star'
                            : 'Reach 50% target to earn half star'}
                    </div>
                </div>

                {/* Unlock notifications */}
                {nextLevelUnlocked && currentLevel < 10 && gainedStars > 0 && (
                    <div style={{
                        background: `${theme.success}33`, border: `1px solid ${theme.success}`,
                        padding: '10px 20px', borderRadius: '8px', marginBottom: '15px',
                        color: theme.success, fontSize: '13px'
                    }}>
                        🔓 Level {currentLevel + 1} Unlocked!
                    </div>
                )}

                {nextWorldUnlocked && (
                    <div style={{
                        background: `${theme.gold}33`, border: `1px solid ${theme.gold}`,
                        padding: '10px 20px', borderRadius: '8px', marginBottom: '15px',
                        color: theme.gold, fontSize: '13px'
                    }}>
                        🎉 World {nextWorldId + 1}: {worlds[nextWorldId].name} Unlocked!
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => {
                            setCurrentOrder(null);
                            setSecondOrder(null);
                            startMatch(selectedWorld, currentLevel);
                        }}
                        style={{
                            padding: '14px 30px', fontSize: '16px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '10px', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {completed ? 'Play Again' : 'Try Again'}
                    </button>

                    {completed && currentLevel < 10 && isLevelUnlocked(selectedWorld.id, currentLevel + 1) && (
                        <button
                            onClick={() => {
                                setCurrentOrder(null);
                                setSecondOrder(null);
                                startMatch(selectedWorld, currentLevel + 1);
                            }}
                            style={{
                                padding: '14px 30px', fontSize: '16px',
                                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                                border: 'none', borderRadius: '10px', color: 'white',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Next Level →
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setCurrentOrder(null);
                            setSecondOrder(null);
                            setGameState('level_select');
                        }}
                        style={{
                            padding: '14px 30px', fontSize: '16px',
                            background: 'transparent', border: `2px solid ${theme.border}`,
                            borderRadius: '10px', color: theme.textSecondary, cursor: 'pointer'
                        }}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes bounce { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
                `}</style>
            </div>
        );
    }

    return null;
};
