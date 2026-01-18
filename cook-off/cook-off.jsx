const { useState, useEffect, useCallback, useRef } = React;

/**
 * COOK-OFF - Kitchen Chaos
 *
 * A professionally designed cooking game applying core game design principles:
 * - Flow State: Challenge/skill balance with 40-60% success rate target
 * - Four Keys to Fun: Hard Fun (fiero), Easy Fun (variety), Serious Fun (progress)
 * - Immediate Feedback: Screen shake, particles, visual juice
 * - Visible Progress: Score targets, milestones, encouragement
 * - Anti-pattern avoidance: No unfair spikes, clear learning, fair challenge
 */

const CookOff = () => {
    // Theme - Warm Kitchen Orange
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff4500', accentBright: '#ff6633',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878',
        timerGreen: '#50c878', timerYellow: '#f4c542', timerOrange: '#ff8c00', timerRed: '#e85a50'
    };

    // Ingredient definitions with visual categories for variety
    const allIngredients = [
        { id: 'tomato', emoji: '🍅', name: 'Tomato', category: 'veggie' },
        { id: 'lettuce', emoji: '🥬', name: 'Lettuce', category: 'veggie' },
        { id: 'cheese', emoji: '🧀', name: 'Cheese', category: 'dairy' },
        { id: 'meat', emoji: '🥩', name: 'Meat', category: 'protein' },
        { id: 'bread', emoji: '🍞', name: 'Bread', category: 'grain' },
        { id: 'egg', emoji: '🥚', name: 'Egg', category: 'protein' },
        { id: 'onion', emoji: '🧅', name: 'Onion', category: 'veggie' },
        { id: 'pepper', emoji: '🌶️', name: 'Pepper', category: 'spice' },
        { id: 'mushroom', emoji: '🍄', name: 'Mushroom', category: 'veggie' },
        { id: 'fish', emoji: '🐟', name: 'Fish', category: 'protein' },
        { id: 'shrimp', emoji: '🦐', name: 'Shrimp', category: 'protein' },
        { id: 'carrot', emoji: '🥕', name: 'Carrot', category: 'veggie' },
        { id: 'potato', emoji: '🥔', name: 'Potato', category: 'veggie' },
        { id: 'rice', emoji: '🍚', name: 'Rice', category: 'grain' },
        { id: 'noodle', emoji: '🍜', name: 'Noodles', category: 'grain' },
        { id: 'avocado', emoji: '🥑', name: 'Avocado', category: 'veggie' }
    ];

    // Dish visuals for completed orders (adds Easy Fun - variety)
    const dishEmojis = ['🍔', '🌮', '🍕', '🥗', '🍜', '🍛', '🥘', '🍲', '🥙', '🌯', '🍱', '🥡'];

    // Opponents with REBALANCED difficulty curves
    // Design principle: Smooth progression, no arbitrary spikes
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Beginner Chef',
            taunt: "Ribbit! Let's cook something simple!",
            winQuote: "Hop hop, delicious!", loseQuote: "You're a natural!",
            recipeSize: [2, 2], baseTime: 12, ingredientPool: 4, // Very generous start
            special: 'none', specialDesc: 'Simple recipes to learn the basics',
            targetBase: 400 // Easy to beat
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Breakfast Master',
            taunt: "Bawk! Time for eggs and toast!",
            winQuote: "Breakfast is served!", loseQuote: "Impressive scramble!",
            recipeSize: [2, 3], baseTime: 10, ingredientPool: 5,
            special: 'bonus_time', specialDesc: 'Combos grant +3 seconds bonus time',
            targetBase: 500
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Rhythm Cook',
            taunt: "Cook to the beat, baby!",
            winQuote: "Groovy grub!", loseQuote: "You've got the groove!",
            recipeSize: [2, 3], baseTime: 9, ingredientPool: 6,
            special: 'rhythm_bonus', specialDesc: 'Tap on the golden beat for 2x points!',
            targetBase: 600
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Scrappy Chef',
            taunt: "Let's make something from nothing!",
            winQuote: "Trash to treasure!", loseQuote: "Creative cooking!",
            recipeSize: [2, 4], baseTime: 9, ingredientPool: 7,
            special: 'wild_card', specialDesc: 'Wild card can substitute any ingredient',
            targetBase: 700
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Speed Demon',
            taunt: "Zap! Fast food coming up!",
            winQuote: "Lightning fast!", loseQuote: "Shocking speed!",
            recipeSize: [3, 4], baseTime: 8, ingredientPool: 8,
            special: 'speed_surge', specialDesc: 'Speed rounds give 1.5x points!',
            targetBase: 800
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Secret Recipe Keeper',
            taunt: "Can you guess the hidden ingredient?",
            winQuote: "Mystery solved!", loseQuote: "Keen intuition!",
            recipeSize: [3, 4], baseTime: 9, ingredientPool: 9,
            special: 'hidden_ingredient', specialDesc: 'One ingredient reveals after 1.5 seconds',
            targetBase: 900
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Precision Chef',
            taunt: "Exact measurements required!",
            winQuote: "Scientifically delicious!", loseQuote: "Perfect precision!",
            recipeSize: [3, 4], baseTime: 8, ingredientPool: 10,
            special: 'strict_order', specialDesc: 'Wrong ingredient fails order, but 2x rewards!',
            targetBase: 1000
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Tricky Chef',
            taunt: "Ssssome ingredients are fake!",
            winQuote: "Sssslippery!", loseQuote: "You avoided my trapsss!",
            recipeSize: [3, 5], baseTime: 8, ingredientPool: 11,
            special: 'decoy_ingredients', specialDesc: 'Decoys have a subtle shimmer - avoid them!',
            targetBase: 1100
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Feeder',
            taunt: "The pack is hungry! AWOO!",
            winQuote: "The pack is satisfied!", loseQuote: "A worthy alpha!",
            recipeSize: [3, 5], baseTime: 7, ingredientPool: 12,
            special: 'multi_order', specialDesc: 'Two orders at once - complete either one!',
            targetBase: 1200
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Chef',
            taunt: "You dare challenge the master?",
            winQuote: "Impossible!", loseQuote: "A true culinary master!",
            recipeSize: [4, 5], baseTime: 7, ingredientPool: 14,
            special: 'all_challenges', specialDesc: 'All challenges combined - the ultimate test!',
            targetBase: 1400
        }
    ];

    // Game state
    const [gameState, setGameState] = useState('menu');
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);

    // Match state
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [secondOrder, setSecondOrder] = useState(null); // For Wolf Warrior
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [orderTimer, setOrderTimer] = useState(0);
    const [maxOrderTime, setMaxOrderTime] = useState(0);
    const [ordersCompleted, setOrdersCompleted] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [streak, setStreak] = useState(0); // Orders without any mistakes
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
    const [milestoneReached, setMilestoneReached] = useState(null);
    const [targetScore, setTargetScore] = useState(0);
    const [encouragement, setEncouragement] = useState(null);

    // Refs
    const timerRef = useRef(null);
    const gameTimerRef = useRef(null);
    const beatRef = useRef(null);
    const hiddenRevealRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('cookoff_progression_v2');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0), bestScores: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('cookoff_progression_v2', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Calculate target score for current match
    // Design principle: Achievable targets that scale smoothly
    const calculateTargetScore = useCallback((opponent, level) => {
        // Base target from opponent + level scaling
        // Much gentler scaling than before
        const base = opponent.targetBase;
        const levelBonus = (level - 1) * 50; // Only +50 per level, not +100
        return base + levelBonus;
    }, []);

    // Get difficulty settings with SMOOTH CURVE
    // Design principle: No arbitrary spikes, learnable patterns
    const getDifficulty = useCallback((opponentIdx, level) => {
        const opp = opponents[opponentIdx];
        // Gentler level modifier
        const levelMod = (level - 1) * 0.08; // Reduced from 0.1

        // Recipe size scales slowly
        const minSize = opp.recipeSize[0];
        const maxSize = Math.min(opp.recipeSize[1], minSize + Math.floor(level / 4)); // Slower scaling

        // Timer is more generous, especially early
        // Design: Players should succeed 40-60% on first attempt
        const baseTime = Math.max(4, opp.baseTime - levelMod * 1.5);

        return {
            minRecipeSize: minSize,
            maxRecipeSize: maxSize,
            baseTime: baseTime,
            ingredientPool: Math.min(allIngredients.length, opp.ingredientPool + Math.floor(level / 3)),
            // Warmup: First 3 orders are easier
            warmupOrders: 3,
            // Breather: Every 5th order is easier
            breatherInterval: 5
        };
    }, []);

    // Generate dish name with more variety (Easy Fun - surprise)
    const generateDishName = useCallback((recipe) => {
        const adjectives = ['Sizzling', 'Crispy', 'Zesty', 'Savory', 'Golden', 'Gourmet', 'Supreme', 'Deluxe',
                          'Smoky', 'Tangy', 'Hearty', 'Fresh', 'Spicy', 'Sweet', 'Rustic', 'Classic'];
        const styles = ['Delight', 'Surprise', 'Special', 'Fusion', 'Creation', 'Masterpiece',
                       'Bowl', 'Platter', 'Stack', 'Feast', 'Treat', 'Wonder'];

        // Use recipe to seed some consistency
        const adjIdx = recipe.length + recipe[0]?.id.length || 0;
        const styleIdx = recipe.length * 2;

        return `${adjectives[adjIdx % adjectives.length]} ${styles[styleIdx % styles.length]}`;
    }, []);

    // Generate new order with warmup/breather system
    const generateOrder = useCallback((isSecondary = false) => {
        if (!selectedOpponent) return null;

        const diff = getDifficulty(selectedOpponent.id, currentLevel);
        const opp = selectedOpponent;

        // Determine if this is a warmup or breather order (easier)
        const isWarmup = ordersCompleted < diff.warmupOrders;
        const isBreather = ordersCompleted > 0 && ordersCompleted % diff.breatherInterval === 0;
        const isEasyOrder = isWarmup || isBreather;

        // Recipe size - smaller for easy orders
        let minSize = diff.minRecipeSize;
        let maxSize = diff.maxRecipeSize;
        if (isEasyOrder) {
            minSize = Math.max(2, minSize - 1);
            maxSize = Math.max(2, maxSize - 1);
        }

        const size = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

        // Get available ingredients
        const poolSize = isEasyOrder ? Math.min(diff.ingredientPool, 6) : diff.ingredientPool;
        const pool = allIngredients.slice(0, poolSize);

        // Generate recipe (no duplicates for easier recognition)
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

        // Set up available ingredients (clear visual distinction)
        const extraCount = isEasyOrder ? 4 : Math.min(5 + Math.floor(currentLevel / 3), 8);
        const available = [...new Set(recipe.map(r => r.id))];
        while (available.length < extraCount && available.length < poolSize) {
            const extra = pool[Math.floor(Math.random() * pool.length)];
            if (!available.includes(extra.id)) {
                available.push(extra.id);
            }
        }

        // Shuffle available
        const shuffledAvailable = available
            .map(id => pool.find(ing => ing.id === id))
            .sort(() => Math.random() - 0.5);

        // Handle special mechanics (reduced frequency for fairness)
        let hidden = -1;
        let decoy = null;
        let hasWildCard = false;
        let speedRound = false;

        // Only apply specials after warmup and not on breathers
        if (!isEasyOrder) {
            if (opp.special === 'hidden_ingredient' || (opp.special === 'all_challenges' && Math.random() < 0.25)) {
                hidden = Math.floor(Math.random() * recipe.length);
            }

            if (opp.special === 'decoy_ingredients' || (opp.special === 'all_challenges' && Math.random() < 0.25)) {
                const notInRecipe = pool.filter(ing => !recipe.find(r => r.id === ing.id));
                if (notInRecipe.length > 0) {
                    decoy = notInRecipe[Math.floor(Math.random() * notInRecipe.length)];
                    shuffledAvailable.push(decoy);
                }
            }

            hasWildCard = opp.special === 'wild_card' || (opp.special === 'all_challenges' && Math.random() < 0.3);
            speedRound = (opp.special === 'speed_surge' || opp.special === 'all_challenges') && Math.random() < 0.25;
        }

        // Calculate timer - MORE GENEROUS
        // Design: Time should feel tight but achievable
        let time = diff.baseTime;

        // Add time based on recipe size (0.8s per ingredient beyond 2)
        time += Math.max(0, (size - 2) * 0.8);

        // Speed round reduces time but not too harshly
        if (speedRound) time = Math.max(4, time * 0.7);

        // Gradual acceleration (very gentle - 0.05s per order, capped)
        const acceleration = Math.min(ordersCompleted * 0.05, 2);
        time = Math.max(4, time - acceleration);

        // Easy orders get bonus time
        if (isEasyOrder) time += 2;

        const order = {
            recipe,
            name: generateDishName(recipe),
            isWarmup,
            isBreather,
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

            // Reveal hidden ingredient after delay
            if (hidden >= 0) {
                clearTimeout(hiddenRevealRef.current);
                hiddenRevealRef.current = setTimeout(() => setHiddenIndex(-1), 1500);
            }
        }

        return order;
    }, [selectedOpponent, currentLevel, ordersCompleted, getDifficulty, generateDishName]);

    // Generate second order for Wolf Warrior
    const generateSecondOrder = useCallback(() => {
        if (!selectedOpponent || selectedOpponent.special !== 'multi_order') return;

        const diff = getDifficulty(selectedOpponent.id, currentLevel);
        const pool = allIngredients.slice(0, diff.ingredientPool);

        // Smaller recipe for second order
        const size = 2 + Math.floor(Math.random() * 2);
        const recipe = [];
        for (let i = 0; i < size; i++) {
            recipe.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        setSecondOrder({
            recipe,
            name: generateDishName(recipe)
        });
    }, [selectedOpponent, currentLevel, getDifficulty, generateDishName]);

    // Start match
    const startMatch = useCallback((opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
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
        setMilestoneReached(null);
        setEncouragement(null);
        setCurrentOrder(null);
        setSecondOrder(null);
        setTargetScore(calculateTargetScore(opponent, level));
        setGameState('playing');
    }, [calculateTargetScore]);

    // Initialize first order when playing starts
    useEffect(() => {
        if (gameState === 'playing' && !currentOrder) {
            generateOrder();
            if (selectedOpponent?.special === 'multi_order') {
                generateSecondOrder();
            }
        }
    }, [gameState, currentOrder, generateOrder, generateSecondOrder, selectedOpponent]);

    // Order timer countdown with grace period
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

    // Beat timer for rhythm bonus (clearer visual)
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (!selectedOpponent) return;
        if (selectedOpponent.special !== 'rhythm_bonus' && selectedOpponent.special !== 'all_challenges') return;

        beatRef.current = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 600); // Slightly slower for easier timing

        return () => clearInterval(beatRef.current);
    }, [gameState, selectedOpponent]);

    // Check milestones and show encouragement
    useEffect(() => {
        if (gameState !== 'playing' || !targetScore) return;

        const percentage = score / targetScore;

        // Milestone celebrations
        if (percentage >= 1 && milestoneReached !== 'win') {
            setMilestoneReached('win');
            setEncouragement('TARGET REACHED! Keep going for a high score!');
            setTimeout(() => setEncouragement(null), 2000);
        } else if (percentage >= 0.75 && milestoneReached !== '75' && milestoneReached !== 'win') {
            setMilestoneReached('75');
            setEncouragement('Almost there! 75% complete!');
            setTimeout(() => setEncouragement(null), 1500);
        } else if (percentage >= 0.5 && !milestoneReached) {
            setMilestoneReached('50');
            setEncouragement('Halfway there!');
            setTimeout(() => setEncouragement(null), 1500);
        }
    }, [score, targetScore, gameState, milestoneReached]);

    // Screen shake effect
    const triggerShake = useCallback(() => {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
    }, []);

    // Handle ingredient selection with better feedback
    const handleIngredientClick = useCallback((ingredient) => {
        if (gameState !== 'playing' || !currentOrder) return;

        const opp = selectedOpponent;
        const recipe = currentOrder.recipe;
        const currentIndex = selectedIngredients.length;

        // Visual feedback for click
        setLastClickedIngredient(ingredient.id);
        setTimeout(() => setLastClickedIngredient(null), 150);

        // Check for decoy
        if (decoyIngredient && ingredient.id === decoyIngredient.id) {
            triggerShake();
            handleOrderFailed('decoy');
            return;
        }

        // Wild card matches anything
        if (wildCardActive && ingredient.id === 'wild') {
            const newSelected = [...selectedIngredients, recipe[currentIndex]];
            setSelectedIngredients(newSelected);

            if (newSelected.length === recipe.length) {
                handleOrderComplete();
            }
            return;
        }

        // Check if correct ingredient
        const expected = recipe[currentIndex];
        if (ingredient.id === expected.id) {
            // Correct! Satisfying feedback
            const newSelected = [...selectedIngredients, ingredient];
            setSelectedIngredients(newSelected);

            // Check if order complete
            if (newSelected.length === recipe.length) {
                handleOrderComplete();
            }
        } else {
            // Wrong ingredient
            triggerShake();

            if (opp.special === 'strict_order') {
                handleOrderFailed('wrong');
            } else {
                // Reset streak but continue
                setStreak(0);
                setOnFire(false);
                setShowFeedback({ type: 'wrong', message: 'Wrong!' });
                setTimeout(() => setShowFeedback(null), 400);
            }
        }
    }, [gameState, currentOrder, selectedIngredients, selectedOpponent, decoyIngredient, wildCardActive, triggerShake]);

    // Handle order completion with rich feedback
    const handleOrderComplete = useCallback(() => {
        const opp = selectedOpponent;
        let points = 100;
        let bonusMessages = [];

        // Time remaining bonus (rewarding speed)
        const timePercent = orderTimer / maxOrderTime;
        const timeBonus = Math.floor(orderTimer * 15);
        points += timeBonus;

        // Perfect bonus: >70% time remaining
        const isPerfect = timePercent > 0.7;
        if (isPerfect) {
            points += 50;
            bonusMessages.push('PERFECT!');
            setPerfectBonus(true);
            setTimeout(() => setPerfectBonus(false), 500);
        }

        // Combo bonus (starts at 2)
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(m => Math.max(m, newCombo));
        if (newCombo >= 2) {
            const comboBonus = newCombo * 15;
            points += comboBonus;
        }

        // Streak bonus (orders without ANY wrong clicks)
        const newStreak = streak + 1;
        setStreak(newStreak);

        // "On Fire" state after 5 streak
        if (newStreak >= 5 && !onFire) {
            setOnFire(true);
            bonusMessages.push('ON FIRE!');
        }

        if (onFire) {
            points = Math.floor(points * 1.25); // 25% bonus while on fire
        }

        // Rhythm bonus (clearer timing window)
        if ((opp.special === 'rhythm_bonus' || opp.special === 'all_challenges') && beatPhase === 0) {
            points = Math.floor(points * 2);
            bonusMessages.push('RHYTHM 2X!');
        }

        // Strict order bonus
        if (opp.special === 'strict_order') {
            points = Math.floor(points * 2);
            bonusMessages.push('PRECISION 2X!');
        }

        // Speed round bonus
        if (isSpeedRound) {
            points = Math.floor(points * 1.5);
            bonusMessages.push('SPEED 1.5X!');
        }

        setScore(s => s + points);
        setOrdersCompleted(o => o + 1);

        // Bonus time for Cheeky Chicken
        if (opp.special === 'bonus_time' && newCombo >= 2) {
            setGameTime(t => Math.min(90, t + 3));
            bonusMessages.push('+3s TIME!');
        }

        // Show completed dish
        const dish = dishEmojis[Math.floor(Math.random() * dishEmojis.length)];
        setCompletedDish(dish);

        // Rich feedback
        setShowFeedback({
            type: 'success',
            message: `+${points}!`,
            combo: newCombo,
            bonuses: bonusMessages,
            dish: dish
        });

        setTimeout(() => {
            setShowFeedback(null);
            setCompletedDish(null);
            setCurrentOrder(null);
            setSecondOrder(null);
            generateOrder();
            if (opp.special === 'multi_order') {
                generateSecondOrder();
            }
        }, 600); // Faster to maintain flow
    }, [combo, streak, onFire, orderTimer, maxOrderTime, selectedOpponent, beatPhase, isSpeedRound, generateOrder, generateSecondOrder]);

    // Handle order failure with clear feedback
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
                if (selectedOpponent?.special === 'multi_order') {
                    generateSecondOrder();
                }
            }
        }, 600);
    }, [mistakes, generateOrder, generateSecondOrder, selectedOpponent]);

    // Handle switching to second order (Wolf Warrior)
    const switchToSecondOrder = useCallback(() => {
        if (!secondOrder) return;

        // Swap orders
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

    // Handle result with fair evaluation
    useEffect(() => {
        if (gameState !== 'result') return;

        const percentage = score / targetScore;

        // More generous win condition
        if (percentage >= 0.5 && mistakes < 3) {
            // 50% = 1 point, 80% = 2 points, 100%+ = 3 points
            const points = percentage >= 1 ? 3 : percentage >= 0.8 ? 2 : 1;
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                const newBest = [...(prev.bestScores || Array(10).fill(0))];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                newBest[selectedOpponent.id] = Math.max(newBest[selectedOpponent.id] || 0, score);
                return { ...prev, starPoints: newPoints, bestScores: newBest };
            });
        }
    }, [gameState, score, targetScore, selectedOpponent, mistakes]);

    // Keyboard handling
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearInterval(gameTimerRef.current);
            clearInterval(beatRef.current);
            clearTimeout(hiddenRevealRef.current);
        };
    }, []);

    // Star bar component
    const StarBar = ({ points }) => (
        <div style={{ display: 'flex', gap: '3px' }}>
            {Array(10).fill(0).map((_, i) => (
                <div key={i} style={{
                    width: '14px', height: '14px',
                    background: i < Math.floor(points / 4)
                        ? `linear-gradient(135deg, ${theme.gold}, ${theme.accent})`
                        : theme.bgDark,
                    borderRadius: '3px',
                    border: `1px solid ${i < Math.floor(points / 4) ? theme.gold : theme.border}`,
                    boxShadow: i < Math.floor(points / 4) ? `0 0 5px ${theme.goldGlow}` : 'none'
                }} />
            ))}
        </div>
    );

    // Progress bar component
    const ProgressBar = ({ current, target }) => {
        const percentage = Math.min(100, (current / target) * 100);
        const color = percentage >= 100 ? theme.success : percentage >= 50 ? theme.gold : theme.accent;

        return (
            <div style={{
                width: '100%',
                height: '8px',
                background: theme.bgDark,
                borderRadius: '4px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}`
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    transition: 'width 0.3s ease-out',
                    boxShadow: percentage >= 100 ? `0 0 10px ${theme.success}` : 'none'
                }} />
            </div>
        );
    };

    // Timer color based on urgency
    const getTimerColor = (timer, maxTime) => {
        const percent = timer / maxTime;
        if (percent > 0.6) return theme.timerGreen;
        if (percent > 0.35) return theme.timerYellow;
        if (percent > 0.15) return theme.timerOrange;
        return theme.timerRed;
    };

    // Menu screen
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
                    Race against the clock to match orders by tapping ingredients in sequence!
                    Build combos, earn bonuses, and become the ultimate chef!
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
                    textDecoration: 'none', fontSize: '14px',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.textMuted}
                >← Back to Menu</a>

                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        );
    }

    // Select screen
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
                        color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
                    >← Back</button>
                    <h2 style={{ color: theme.accent, fontSize: '24px' }}>Choose Your Rival Chef</h2>
                    <div style={{ width: '100px' }} />
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '18px', maxWidth: '1300px', margin: '0 auto'
                }}>
                    {opponents.map((opp, idx) => {
                        const unlocked = isOpponentUnlocked(idx);
                        const mastered = isOpponentMastered(idx);
                        const stars = getStars(idx);

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
                                    borderRadius: '15px', padding: '18px',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.5,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    boxShadow: unlocked ? `0 4px 15px ${opp.color}22` : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = `0 8px 25px ${opp.color}44`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = unlocked ? `0 4px 15px ${opp.color}22` : 'none';
                                }}
                            >
                                {!unlocked && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '22px' }}>🔒</div>}
                                {mastered && (
                                    <div style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                                        padding: '4px 10px',
                                        borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                        boxShadow: `0 2px 8px ${theme.success}44`
                                    }}>★ MASTERED</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '52px', width: '75px', height: '75px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${opp.color}44, ${opp.color}22)`,
                                        borderRadius: '50%',
                                        border: `2px solid ${opp.color}66`
                                    }}>{opp.emoji}</div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: opp.color }}>{opp.name}</div>
                                        <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>{opp.title}</div>
                                        <div style={{
                                            fontSize: '11px', color: theme.textSecondary,
                                            background: `${opp.color}22`, padding: '5px 10px',
                                            borderRadius: '6px', marginBottom: '10px',
                                            border: `1px solid ${opp.color}33`
                                        }}>
                                            ✨ {opp.specialDesc}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StarBar points={progression.starPoints[idx]} />
                                            <span style={{ fontSize: '12px', color: theme.textMuted }}>{stars}/10</span>
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

    // Level select
    if (gameState === 'level_select' && selectedOpponent) {
        const currentStars = getStars(selectedOpponent.id);
        const bestScore = progression.bestScores?.[selectedOpponent.id] || 0;

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
                    color: theme.textSecondary, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                }}>← Back</button>

                <div style={{
                    fontSize: '90px', marginTop: '20px',
                    filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))'
                }}>{selectedOpponent.emoji}</div>
                <h2 style={{
                    color: selectedOpponent.color, marginTop: '10px', fontSize: '28px',
                    textShadow: `0 0 20px ${selectedOpponent.color}44`
                }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted, fontSize: '14px' }}>{selectedOpponent.title}</p>
                <p style={{
                    color: theme.textSecondary, fontStyle: 'italic',
                    marginTop: '10px', fontSize: '16px'
                }}>"{selectedOpponent.taunt}"</p>

                <div style={{
                    marginTop: '15px', padding: '12px 24px',
                    background: `linear-gradient(135deg, ${selectedOpponent.color}33, ${selectedOpponent.color}11)`,
                    borderRadius: '10px',
                    color: theme.textSecondary,
                    border: `1px solid ${selectedOpponent.color}44`
                }}>
                    ✨ {selectedOpponent.specialDesc}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <StarBar points={progression.starPoints[selectedOpponent.id]} />
                    <span style={{ color: theme.textMuted }}>{currentStars}/10 stars</span>
                </div>

                {bestScore > 0 && (
                    <div style={{ marginTop: '10px', color: theme.gold, fontSize: '14px' }}>
                        Best Score: {bestScore}
                    </div>
                )}

                <h3 style={{ marginTop: '30px', marginBottom: '15px', color: theme.textSecondary }}>Select Level</h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px', maxWidth: '420px'
                }}>
                    {Array(10).fill(0).map((_, i) => {
                        const levelNum = i + 1;
                        const unlocked = i <= currentStars;
                        const target = calculateTargetScore(selectedOpponent, levelNum);

                        return (
                            <button
                                key={i}
                                onClick={() => unlocked && startMatch(selectedOpponent, levelNum)}
                                disabled={!unlocked}
                                title={unlocked ? `Target: ${target} points` : 'Locked'}
                                style={{
                                    width: '70px', height: '70px',
                                    background: unlocked
                                        ? `linear-gradient(135deg, ${selectedOpponent.color}, ${selectedOpponent.color}88)`
                                        : theme.bgDark,
                                    border: `3px solid ${unlocked ? selectedOpponent.color : theme.border}`,
                                    borderRadius: '12px',
                                    color: unlocked ? 'white' : theme.textMuted,
                                    fontSize: '24px', fontWeight: 'bold',
                                    cursor: unlocked ? 'pointer' : 'not-allowed',
                                    opacity: unlocked ? 1 : 0.4,
                                    transition: 'all 0.2s',
                                    boxShadow: unlocked ? `0 4px 12px ${selectedOpponent.color}44` : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (unlocked) {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.boxShadow = `0 6px 18px ${selectedOpponent.color}66`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = unlocked ? `0 4px 12px ${selectedOpponent.color}44` : 'none';
                                }}
                            >
                                {unlocked ? levelNum : '🔒'}
                            </button>
                        );
                    })}
                </div>

                <p style={{ marginTop: '20px', color: theme.textMuted, fontSize: '12px' }}>
                    Earn stars to unlock higher levels!
                </p>
            </div>
        );
    }

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const showBeat = opp?.special === 'rhythm_bonus' || opp?.special === 'all_challenges';
        const timerColor = getTimerColor(orderTimer, maxOrderTime);
        const timerPercent = (orderTimer / maxOrderTime) * 100;
        const scorePercent = Math.min(100, (score / targetScore) * 100);

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp?.color}15 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '15px', color: theme.text, userSelect: 'none',
                transform: screenShake ? 'translateX(5px)' : 'none',
                transition: screenShake ? 'none' : 'transform 0.1s'
            }}>
                {/* Header with stats */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '12px', padding: '12px 20px',
                    background: `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`,
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {/* Game Timer */}
                        <div>
                            <span style={{ color: theme.textMuted, fontSize: '11px' }}>TIME </span>
                            <span style={{
                                color: gameTime <= 15 ? theme.error : gameTime <= 30 ? theme.timerYellow : theme.text,
                                fontWeight: 'bold',
                                fontSize: '20px',
                                fontFamily: 'monospace'
                            }}>{gameTime}s</span>
                        </div>

                        {/* Score with target */}
                        <div>
                            <span style={{ color: theme.textMuted, fontSize: '11px' }}>SCORE </span>
                            <span style={{
                                color: score >= targetScore ? theme.success : theme.gold,
                                fontWeight: 'bold',
                                fontSize: '20px'
                            }}>{score}</span>
                            <span style={{ color: theme.textMuted, fontSize: '12px' }}>/{targetScore}</span>
                        </div>

                        {/* Combo */}
                        {combo >= 2 && (
                            <div style={{
                                color: onFire ? theme.accent : theme.success,
                                fontWeight: 'bold',
                                animation: 'pulse 0.5s infinite',
                                fontSize: '16px'
                            }}>
                                {onFire ? '🔥' : '⚡'} x{combo}
                            </div>
                        )}

                        {/* On Fire indicator */}
                        {onFire && (
                            <div style={{
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.gold})`,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                animation: 'pulse 0.3s infinite'
                            }}>
                                ON FIRE! +25%
                            </div>
                        )}
                    </div>

                    {/* Opponent info */}
                    <div style={{
                        color: opp?.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px'
                    }}>
                        <span style={{ fontSize: '24px' }}>{opp?.emoji}</span>
                        <span style={{ fontWeight: 'bold' }}>{opp?.name}</span>
                        <span style={{ color: theme.textMuted }}>Lv.{currentLevel}</span>

                        {/* Rhythm beat indicator */}
                        {showBeat && (
                            <div style={{
                                width: '24px', height: '24px',
                                background: beatPhase === 0
                                    ? `linear-gradient(135deg, ${theme.gold}, ${theme.accent})`
                                    : theme.bgDark,
                                borderRadius: '50%',
                                transition: 'all 0.15s',
                                border: `2px solid ${beatPhase === 0 ? theme.gold : theme.border}`,
                                boxShadow: beatPhase === 0 ? `0 0 15px ${theme.gold}` : 'none',
                                marginLeft: '5px'
                            }} />
                        )}
                    </div>

                    {/* Hearts */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '28px', height: '28px',
                                background: i < mistakes
                                    ? `linear-gradient(135deg, ${theme.error}, ${theme.error}88)`
                                    : `linear-gradient(135deg, ${theme.success}, ${theme.success}88)`,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px',
                                border: `2px solid ${i < mistakes ? theme.error : theme.success}`,
                                transition: 'all 0.3s'
                            }}>
                                {i < mistakes ? '✗' : '❤️'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress bar toward target */}
                <div style={{ marginBottom: '10px', padding: '0 5px' }}>
                    <ProgressBar current={score} target={targetScore} />
                    {scorePercent >= 50 && scorePercent < 100 && (
                        <div style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            color: theme.success,
                            marginTop: '3px'
                        }}>
                            {scorePercent >= 80 ? '🌟 Excellent pace!' : '✓ On track to win!'}
                        </div>
                    )}
                </div>

                {/* Speed round indicator */}
                {isSpeedRound && (
                    <div style={{
                        textAlign: 'center',
                        padding: '8px',
                        background: `linear-gradient(135deg, ${theme.accent}66, ${theme.gold}44)`,
                        borderRadius: '8px',
                        marginBottom: '10px',
                        color: 'white',
                        fontWeight: 'bold',
                        animation: 'pulse 0.4s infinite',
                        border: `2px solid ${theme.accent}`,
                        fontSize: '14px'
                    }}>
                        ⚡ SPEED ROUND - 1.5x POINTS! ⚡
                    </div>
                )}

                {/* Encouragement popup */}
                {encouragement && (
                    <div style={{
                        position: 'fixed',
                        top: '20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '15px 30px',
                        background: `linear-gradient(135deg, ${theme.success}, ${theme.success}cc)`,
                        borderRadius: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 50,
                        animation: 'popIn 0.3s ease-out',
                        boxShadow: `0 8px 30px ${theme.success}66`
                    }}>
                        {encouragement}
                    </div>
                )}

                {/* Multi-order indicator for Wolf Warrior */}
                {secondOrder && (
                    <div
                        onClick={switchToSecondOrder}
                        style={{
                            background: `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`,
                            border: `2px dashed ${opp?.color}`,
                            borderRadius: '10px',
                            padding: '10px 15px',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderStyle = 'solid'}
                        onMouseLeave={(e) => e.currentTarget.style.borderStyle = 'dashed'}
                    >
                        <span style={{ color: theme.textMuted, fontSize: '12px' }}>ALT ORDER:</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {secondOrder.recipe.map((ing, i) => (
                                <span key={i} style={{ fontSize: '24px' }}>{ing.emoji}</span>
                            ))}
                        </div>
                        <span style={{ color: opp?.color, fontSize: '12px' }}>Click to switch →</span>
                    </div>
                )}

                {/* Current Order */}
                {currentOrder && (
                    <div style={{
                        background: `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`,
                        borderRadius: '15px',
                        padding: '20px',
                        marginBottom: '15px',
                        border: `2px solid ${timerPercent < 25 ? theme.error : theme.accent}`,
                        boxShadow: timerPercent < 25 ? `0 0 20px ${theme.error}44` : 'none',
                        transition: 'border-color 0.3s, box-shadow 0.3s'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <span style={{ color: theme.textMuted, fontSize: '12px' }}>ORDER: </span>
                                <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '22px' }}>
                                    {currentOrder.name}
                                </span>
                                {(currentOrder.isWarmup || currentOrder.isBreather) && (
                                    <span style={{
                                        marginLeft: '10px',
                                        background: theme.success + '33',
                                        color: theme.success,
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '11px'
                                    }}>
                                        {currentOrder.isWarmup ? 'WARMUP' : 'BREATHER'}
                                    </span>
                                )}
                            </div>

                            {/* Order timer */}
                            <div style={{
                                background: `linear-gradient(135deg, ${timerColor}, ${timerColor}88)`,
                                padding: '6px 18px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                fontFamily: 'monospace',
                                animation: timerPercent < 25 ? 'pulse 0.3s infinite' : 'none',
                                boxShadow: timerPercent < 25 ? `0 0 15px ${theme.error}` : 'none'
                            }}>
                                {orderTimer.toFixed(1)}s
                            </div>
                        </div>

                        {/* Timer bar */}
                        <div style={{
                            width: '100%',
                            height: '10px',
                            background: theme.bgDark,
                            borderRadius: '5px',
                            overflow: 'hidden',
                            marginBottom: '15px',
                            border: `1px solid ${theme.border}`
                        }}>
                            <div style={{
                                width: `${timerPercent}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
                                transition: 'width 0.1s linear',
                                boxShadow: timerPercent < 25 ? `0 0 10px ${timerColor}` : 'none'
                            }} />
                        </div>

                        {/* Recipe display */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '12px'
                        }}>
                            {currentOrder.recipe.map((ing, i) => {
                                const isSelected = i < selectedIngredients.length;
                                const isNext = i === selectedIngredients.length;
                                const isHidden = i === hiddenIndex && hiddenIndex >= 0;

                                return (
                                    <div key={i} style={{
                                        width: '65px',
                                        height: '65px',
                                        background: isSelected
                                            ? `linear-gradient(135deg, ${theme.success}44, ${theme.success}22)`
                                            : theme.bgDark,
                                        border: `3px solid ${
                                            isSelected ? theme.success
                                            : isNext ? theme.accent
                                            : theme.border
                                        }`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '36px',
                                        transition: 'all 0.2s',
                                        boxShadow: isNext ? `0 0 15px ${theme.accent}44` :
                                                   isSelected ? `0 0 10px ${theme.success}44` : 'none',
                                        transform: isSelected ? 'scale(0.95)' : 'scale(1)'
                                    }}>
                                        {isHidden ? (
                                            <span style={{
                                                fontSize: '28px',
                                                animation: 'pulse 0.5s infinite'
                                            }}>❓</span>
                                        ) : (
                                            <span>{ing.emoji}</span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Completed dish preview */}
                            {completedDish && (
                                <div style={{
                                    width: '65px',
                                    height: '65px',
                                    background: `linear-gradient(135deg, ${theme.gold}44, ${theme.gold}22)`,
                                    border: `3px solid ${theme.gold}`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '36px',
                                    marginLeft: '15px',
                                    animation: 'popIn 0.3s ease-out',
                                    boxShadow: `0 0 20px ${theme.gold}66`
                                }}>
                                    {completedDish}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: '13px' }}>
                            {selectedIngredients.length} / {currentOrder.recipe.length} ingredients
                            {perfectBonus && <span style={{ color: theme.gold, marginLeft: '10px' }}>⭐ PERFECT!</span>}
                        </div>
                    </div>
                )}

                {/* Available Ingredients */}
                <div style={{
                    flex: 1,
                    background: `linear-gradient(135deg, ${theme.bgDark}, ${theme.bg})`,
                    borderRadius: '15px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${theme.border}`
                }}>
                    <h3 style={{
                        textAlign: 'center',
                        marginBottom: '20px',
                        color: theme.textSecondary,
                        fontSize: '14px',
                        fontWeight: 'normal'
                    }}>
                        Tap ingredients in order →
                    </h3>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        flex: 1,
                        alignContent: 'center'
                    }}>
                        {availableIngredients.map((ing, i) => {
                            const isDecoy = decoyIngredient?.id === ing.id;
                            const isClicked = lastClickedIngredient === ing.id;

                            return (
                                <button
                                    key={`${ing.id}-${i}`}
                                    onClick={() => handleIngredientClick(ing)}
                                    style={{
                                        width: '85px',
                                        height: '85px',
                                        background: isDecoy
                                            ? `linear-gradient(135deg, ${theme.bgPanel}, #3a2440)`
                                            : `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bg})`,
                                        border: `2px solid ${isDecoy ? '#5a3050' : theme.borderLight}`,
                                        borderRadius: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s',
                                        fontSize: '38px',
                                        transform: isClicked ? 'scale(0.9)' : 'scale(1)',
                                        boxShadow: isClicked ? `0 0 20px ${theme.accent}` : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.boxShadow = `0 0 20px ${theme.accent}44`;
                                        e.currentTarget.style.borderColor = theme.accent;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = isDecoy ? '#5a3050' : theme.borderLight;
                                    }}
                                >
                                    {ing.emoji}
                                    <span style={{
                                        fontSize: '10px',
                                        color: theme.textMuted,
                                        marginTop: '3px'
                                    }}>
                                        {ing.name}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Wild card */}
                        {wildCardActive && (
                            <button
                                onClick={() => handleIngredientClick({ id: 'wild', emoji: '🌟', name: 'Wild' })}
                                style={{
                                    width: '85px',
                                    height: '85px',
                                    background: `linear-gradient(135deg, ${theme.gold}55, ${theme.gold}22)`,
                                    border: `3px solid ${theme.gold}`,
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s',
                                    fontSize: '38px',
                                    animation: 'pulse 0.8s infinite',
                                    boxShadow: `0 0 20px ${theme.gold}66`
                                }}
                            >
                                🌟
                                <span style={{
                                    fontSize: '10px',
                                    color: theme.gold,
                                    marginTop: '3px',
                                    fontWeight: 'bold'
                                }}>
                                    WILD
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Feedback overlay */}
                {showFeedback && (
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '25px 45px',
                        background: showFeedback.type === 'success'
                            ? `linear-gradient(135deg, ${theme.success}, ${theme.success}dd)`
                            : showFeedback.type === 'error'
                            ? `linear-gradient(135deg, ${theme.error}, ${theme.error}dd)`
                            : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                        borderRadius: '20px',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 100,
                        animation: 'popIn 0.2s ease-out',
                        textAlign: 'center',
                        boxShadow: `0 10px 40px rgba(0,0,0,0.5)`
                    }}>
                        <div>{showFeedback.message}</div>
                        {showFeedback.combo >= 3 && (
                            <div style={{ fontSize: '16px', marginTop: '5px', opacity: 0.9 }}>
                                🔥 {showFeedback.combo}x Combo!
                            </div>
                        )}
                        {showFeedback.bonuses && showFeedback.bonuses.length > 0 && (
                            <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.85 }}>
                                {showFeedback.bonuses.join(' • ')}
                            </div>
                        )}
                        {showFeedback.dish && (
                            <div style={{ fontSize: '48px', marginTop: '5px' }}>
                                {showFeedback.dish}
                            </div>
                        )}
                    </div>
                )}

                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.9; }
                    }
                    @keyframes popIn {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                        70% { transform: translate(-50%, -50%) scale(1.1); }
                        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const percentage = score / targetScore;
        const won = percentage >= 0.5 && mistakes < 3;
        const excellent = percentage >= 0.8 && mistakes < 3;
        const perfect = percentage >= 1 && mistakes < 3;

        // Points earned
        const pointsEarned = !won ? 0 : perfect ? 3 : excellent ? 2 : 1;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{
                    fontSize: '120px',
                    marginBottom: '15px',
                    animation: won ? 'bounce 0.5s ease-out' : 'none',
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))'
                }}>
                    {mistakes >= 3 ? '💔' : perfect ? '👑' : excellent ? '🏆' : won ? '🍽️' : '😢'}
                </div>

                <h1 style={{
                    fontSize: '44px',
                    color: perfect ? theme.gold : excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px',
                    textShadow: won ? `0 0 30px ${theme.gold}44` : 'none'
                }}>
                    {mistakes >= 3 ? 'KITCHEN DISASTER!'
                     : perfect ? 'PERFECT SCORE!'
                     : excellent ? 'MASTER CHEF!'
                     : won ? 'ORDER UP!'
                     : 'NEEDS PRACTICE'}
                </h1>

                <p style={{
                    color: selectedOpponent?.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '25px'
                }}>
                    {selectedOpponent?.emoji} "{won ? selectedOpponent?.loseQuote : selectedOpponent?.winQuote}"
                </p>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '25px',
                    background: `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bgDark})`,
                    padding: '25px',
                    borderRadius: '15px',
                    border: `1px solid ${theme.border}`,
                    minWidth: '320px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '5px' }}>SCORE</div>
                        <div style={{ color: theme.gold, fontSize: '32px', fontWeight: 'bold' }}>{score}</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>/ {targetScore} target</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '5px' }}>ORDERS</div>
                        <div style={{ color: theme.accent, fontSize: '32px', fontWeight: 'bold' }}>{ordersCompleted}</div>
                        <div style={{ color: theme.textMuted, fontSize: '11px' }}>completed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '5px' }}>MAX COMBO</div>
                        <div style={{ color: theme.success, fontSize: '32px', fontWeight: 'bold' }}>{maxCombo}x</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '5px' }}>ACCURACY</div>
                        <div style={{
                            color: mistakes === 0 ? theme.gold : mistakes < 3 ? theme.text : theme.error,
                            fontSize: '32px',
                            fontWeight: 'bold'
                        }}>
                            {mistakes === 0 ? '★★★' : mistakes === 1 ? '★★' : mistakes === 2 ? '★' : '—'}
                        </div>
                    </div>
                </div>

                {/* Reward display */}
                {won && (
                    <div style={{
                        background: `linear-gradient(135deg, ${theme.gold}33, ${theme.gold}11)`,
                        border: `2px solid ${theme.gold}`,
                        padding: '15px 35px',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: `0 4px 20px ${theme.gold}33`
                    }}>
                        <div>
                            <span style={{ color: theme.gold, fontSize: '24px', fontWeight: 'bold' }}>
                                +{pointsEarned} Star Point{pointsEarned > 1 ? 's' : ''}!
                            </span>
                        </div>
                        <div style={{
                            borderLeft: `1px solid ${theme.gold}44`,
                            paddingLeft: '20px',
                            color: theme.textMuted
                        }}>
                            {getStars(selectedOpponent?.id || 0)}/10 stars earned
                        </div>
                    </div>
                )}

                {/* Tip for improvement */}
                {!won && (
                    <div style={{
                        background: theme.bgPanel,
                        padding: '12px 25px',
                        borderRadius: '10px',
                        marginBottom: '25px',
                        color: theme.textSecondary,
                        fontSize: '14px',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        💡 Tip: {mistakes >= 3
                            ? "Take your time - accuracy beats speed!"
                            : percentage < 0.3
                            ? "Try an easier level to build your skills"
                            : "You're close! Keep practicing the ingredient order"}
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => {
                            setCurrentOrder(null);
                            setSecondOrder(null);
                            startMatch(selectedOpponent, currentLevel);
                        }}
                        style={{
                            padding: '16px 35px', fontSize: '18px',
                            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                            border: 'none', borderRadius: '12px', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(255, 69, 0, 0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 69, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 69, 0, 0.4)';
                        }}
                    >
                        {won ? 'Play Again' : 'Try Again'}
                    </button>
                    <button
                        onClick={() => {
                            setCurrentOrder(null);
                            setSecondOrder(null);
                            setGameState('level_select');
                        }}
                        style={{
                            padding: '16px 35px', fontSize: '18px',
                            background: 'transparent',
                            border: `2px solid ${theme.border}`,
                            borderRadius: '12px', color: theme.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.accent;
                            e.currentTarget.style.color = theme.text;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border;
                            e.currentTarget.style.color = theme.textSecondary;
                        }}
                    >
                        Level Select
                    </button>
                </div>

                <style>{`
                    @keyframes bounce {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
};
