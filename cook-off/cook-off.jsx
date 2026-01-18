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
 */

const CookOff = () => {
    // Theme
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
            setTimeout(() => setEncouragement(null), 2000);
        } else if (percentage >= 0.75 && percentage < 1 && !encouragement) {
            setEncouragement('Almost there! 75%');
            setTimeout(() => setEncouragement(null), 1500);
        } else if (percentage >= 0.5 && percentage < 0.75 && !encouragement) {
            setEncouragement('Halfway to completion!');
            setTimeout(() => setEncouragement(null), 1500);
        }
    }, [score, levelConfig, gameState, encouragement]);

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
                                            borderRadius: '6px', marginBottom: '10px',
                                            border: `1px solid ${world.color}33`
                                        }}>
                                            ✨ {world.specialDesc}
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

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${selectedWorld.color}22 100%)`,
                padding: '20px', color: theme.text,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button onClick={() => setGameState('select')} style={{
                    alignSelf: 'flex-start',
                    background: 'transparent', border: `1px solid ${theme.border}`,
                    color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                }}>← Back to Worlds</button>

                <div style={{ fontSize: '80px', marginTop: '15px' }}>{selectedWorld.emoji}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>World {selectedWorld.id + 1}</div>
                <h2 style={{ color: selectedWorld.color, marginTop: '5px', fontSize: '28px' }}>{selectedWorld.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedWorld.title}</p>
                <p style={{ color: theme.textSecondary, fontStyle: 'italic', marginTop: '8px' }}>"{selectedWorld.taunt}"</p>

                <div style={{
                    marginTop: '12px', padding: '10px 20px',
                    background: `${selectedWorld.color}22`, borderRadius: '8px',
                    border: `1px solid ${selectedWorld.color}44`
                }}>
                    ✨ {selectedWorld.specialDesc}
                </div>

                <div style={{ marginTop: '15px' }}>
                    <WorldStarBar worldId={selectedWorld.id} />
                </div>

                <h3 style={{ marginTop: '25px', marginBottom: '15px', color: theme.textSecondary }}>Select Level</h3>

                {/* Level grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '10px',
                    maxWidth: '500px',
                    width: '100%'
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
                                        ? `linear-gradient(135deg, ${selectedWorld.color}88, ${selectedWorld.color}44)`
                                        : theme.bgDark,
                                    border: `2px solid ${unlocked ? selectedWorld.color : theme.border}`,
                                    borderRadius: '12px',
                                    padding: '12px 8px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.4,
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = `0 4px 15px ${selectedWorld.color}44`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
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
                    background: theme.bgPanel, borderRadius: '10px',
                    fontSize: '12px', color: theme.textSecondary,
                    maxWidth: '400px', textAlign: 'center'
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
        const showBeat = world?.special === 'rhythm_bonus' || world?.special === 'all_challenges';
        const timerColor = getTimerColor(orderTimer, maxOrderTime);
        const timerPercent = (orderTimer / maxOrderTime) * 100;
        const scorePercent = Math.min(100, (score / levelConfig.targetScore) * 100);

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${world?.color}15 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '15px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(5px)' : 'none',
                transition: screenShake ? 'none' : 'transform 0.1s'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '10px', padding: '10px 15px',
                    background: theme.bgPanel, borderRadius: '10px'
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

                {/* Speed round indicator */}
                {isSpeedRound && (
                    <div style={{
                        textAlign: 'center', padding: '6px',
                        background: `${theme.accent}44`, borderRadius: '6px',
                        marginBottom: '8px', color: 'white', fontWeight: 'bold',
                        animation: 'pulse 0.4s infinite', fontSize: '13px'
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
                            background: theme.bgPanel, border: `2px dashed ${world?.color}`,
                            borderRadius: '8px', padding: '8px 12px', marginBottom: '8px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between'
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
                        background: theme.bgPanel, borderRadius: '12px',
                        padding: '15px', marginBottom: '12px',
                        border: `2px solid ${timerPercent < 25 ? theme.error : theme.accent}`
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
                    flex: 1, background: theme.bgDark, borderRadius: '12px',
                    padding: '15px', display: 'flex', flexDirection: 'column'
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
