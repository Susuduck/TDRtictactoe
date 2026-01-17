const { useState, useEffect, useCallback, useRef } = React;

/**
 * COOK-OFF - Kitchen Chaos
 *
 * Fast-paced order matching game where players must:
 * - Match orders by selecting ingredients in correct order
 * - Beat the timer for each order
 * - Avoid 3 wrong orders (game over)
 * - Handle increasing speed and complexity
 */

const CookOff = () => {
    // Theme - Orange Red (#ff4500)
    const theme = {
        bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020',
        border: '#4a4468', borderLight: '#5a5478',
        text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0',
        accent: '#ff4500', accentBright: '#ff6633',
        gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)',
        error: '#e85a50', success: '#50c878'
    };

    // Ingredient definitions
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

    // Opponents with unique cooking challenges
    const opponents = [
        {
            id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878',
            title: 'The Beginner Chef',
            taunt: "Ribbit! Let's cook something simple!",
            winQuote: "Hop hop, delicious!", loseQuote: "You're a natural!",
            recipeSize: [2, 3], baseTime: 8, ingredientPool: 4,
            special: 'none', specialDesc: 'Simple recipes to learn the basics'
        },
        {
            id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840',
            title: 'The Breakfast Master',
            taunt: "Bawk! Time for eggs and toast!",
            winQuote: "Breakfast is served!", loseQuote: "Impressive scramble!",
            recipeSize: [2, 4], baseTime: 7, ingredientPool: 5,
            special: 'bonus_time', specialDesc: 'Correct combos grant bonus time'
        },
        {
            id: 2, name: 'Disco Dinosaur', emoji: '🦕', color: '#a080c0',
            title: 'The Rhythm Cook',
            taunt: "Cook to the beat, baby!",
            winQuote: "Groovy grub!", loseQuote: "You've got the groove!",
            recipeSize: [3, 4], baseTime: 7, ingredientPool: 6,
            special: 'rhythm_bonus', specialDesc: 'Tap on beat for score multiplier'
        },
        {
            id: 3, name: 'Radical Raccoon', emoji: '🦝', color: '#808090',
            title: 'The Scrappy Chef',
            taunt: "Let's make something from nothing!",
            winQuote: "Trash to treasure!", loseQuote: "Creative cooking!",
            recipeSize: [3, 4], baseTime: 6, ingredientPool: 7,
            special: 'wild_card', specialDesc: 'Wild card ingredient appears'
        },
        {
            id: 4, name: 'Electric Eel', emoji: '⚡', color: '#50a8e8',
            title: 'The Speed Demon',
            taunt: "Zap! Fast food coming up!",
            winQuote: "Lightning fast!", loseQuote: "Shocking speed!",
            recipeSize: [3, 5], baseTime: 5, ingredientPool: 8,
            special: 'speed_surge', specialDesc: 'Occasional speed rounds'
        },
        {
            id: 5, name: 'Mysterious Moth', emoji: '🦋', color: '#c090a0',
            title: 'The Secret Recipe Keeper',
            taunt: "Can you guess the hidden ingredient?",
            winQuote: "Mystery solved!", loseQuote: "Keen intuition!",
            recipeSize: [3, 5], baseTime: 6, ingredientPool: 9,
            special: 'hidden_ingredient', specialDesc: 'One ingredient is hidden initially'
        },
        {
            id: 6, name: 'Professor Penguin', emoji: '🐧', color: '#4080a0',
            title: 'The Precision Chef',
            taunt: "Exact measurements required!",
            winQuote: "Scientifically delicious!", loseQuote: "Perfect precision!",
            recipeSize: [4, 5], baseTime: 5, ingredientPool: 10,
            special: 'strict_order', specialDesc: 'No mistakes allowed, but higher rewards'
        },
        {
            id: 7, name: 'Sly Snake', emoji: '🐍', color: '#60a060',
            title: 'The Tricky Chef',
            taunt: "Ssssome ingredients are fake!",
            winQuote: "Sssslippery!", loseQuote: "You avoided my trapsss!",
            recipeSize: [4, 5], baseTime: 5, ingredientPool: 11,
            special: 'decoy_ingredients', specialDesc: 'Watch out for decoy ingredients'
        },
        {
            id: 8, name: 'Wolf Warrior', emoji: '🐺', color: '#606080',
            title: 'The Pack Feeder',
            taunt: "The pack is hungry! AWOO!",
            winQuote: "The pack is satisfied!", loseQuote: "A worthy alpha!",
            recipeSize: [4, 6], baseTime: 4, ingredientPool: 12,
            special: 'multi_order', specialDesc: 'Multiple orders at once'
        },
        {
            id: 9, name: 'Grand Master Grizzly', emoji: '👑', color: '#d4a840',
            title: 'The Ultimate Chef',
            taunt: "You dare challenge the master?",
            winQuote: "Impossible!", loseQuote: "A true culinary master!",
            recipeSize: [5, 7], baseTime: 4, ingredientPool: 14,
            special: 'all_challenges', specialDesc: 'All challenges combined!'
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
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [orderTimer, setOrderTimer] = useState(0);
    const [ordersCompleted, setOrdersCompleted] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [showFeedback, setShowFeedback] = useState(null);
    const [beatPhase, setBeatPhase] = useState(0);
    const [hiddenIndex, setHiddenIndex] = useState(-1);
    const [decoyIngredient, setDecoyIngredient] = useState(null);
    const [isSpeedRound, setIsSpeedRound] = useState(false);
    const [wildCardActive, setWildCardActive] = useState(false);

    // Refs
    const timerRef = useRef(null);
    const gameTimerRef = useRef(null);
    const beatRef = useRef(null);

    // Progression
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('cookoff_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    useEffect(() => {
        localStorage.setItem('cookoff_progression_v1', JSON.stringify(progression));
    }, [progression]);

    const getStars = (idx) => Math.floor(progression.starPoints[idx] / 4);
    const isOpponentUnlocked = (idx) => idx === 0 || progression.starPoints[idx - 1] >= 40;
    const isOpponentMastered = (idx) => progression.starPoints[idx] >= 40;

    // Get difficulty settings
    const getDifficulty = useCallback((opponentIdx, level) => {
        const opp = opponents[opponentIdx];
        const levelMod = (level - 1) * 0.1;

        return {
            minRecipeSize: opp.recipeSize[0],
            maxRecipeSize: Math.min(opp.recipeSize[1], opp.recipeSize[0] + Math.floor(level / 3)),
            baseTime: Math.max(2, opp.baseTime - levelMod * 2),
            ingredientPool: Math.min(allIngredients.length, opp.ingredientPool + Math.floor(level / 2)),
            speedMultiplier: 1 + levelMod * 0.3
        };
    }, []);

    // Generate new order
    const generateOrder = useCallback(() => {
        if (!selectedOpponent) return;

        const diff = getDifficulty(selectedOpponent.id, currentLevel);
        const opp = selectedOpponent;

        // Recipe size
        const size = diff.minRecipeSize + Math.floor(Math.random() * (diff.maxRecipeSize - diff.minRecipeSize + 1));

        // Get available ingredients for this opponent
        const poolSize = diff.ingredientPool;
        const pool = allIngredients.slice(0, poolSize);

        // Generate recipe (can have duplicates)
        const recipe = [];
        for (let i = 0; i < size; i++) {
            recipe.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        // Set up available ingredients (more than needed to add challenge)
        const extraCount = Math.min(4 + Math.floor(currentLevel / 2), 8);
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

        // Handle special mechanics
        let hidden = -1;
        let decoy = null;

        if (opp.special === 'hidden_ingredient' || (opp.special === 'all_challenges' && Math.random() < 0.3)) {
            hidden = Math.floor(Math.random() * recipe.length);
            setTimeout(() => setHiddenIndex(-1), 2000); // Reveal after 2 seconds
        }

        if (opp.special === 'decoy_ingredients' || (opp.special === 'all_challenges' && Math.random() < 0.3)) {
            // Add a decoy that looks similar but isn't in recipe
            const notInRecipe = pool.filter(ing => !recipe.find(r => r.id === ing.id));
            if (notInRecipe.length > 0) {
                decoy = notInRecipe[Math.floor(Math.random() * notInRecipe.length)];
                shuffledAvailable.push(decoy);
            }
        }

        // Wild card
        const hasWildCard = opp.special === 'wild_card' || (opp.special === 'all_challenges' && Math.random() < 0.2);

        // Speed round
        const speedRound = (opp.special === 'speed_surge' || opp.special === 'all_challenges') && Math.random() < 0.2;

        // Calculate timer
        let time = diff.baseTime;
        if (speedRound) time = Math.max(2, time * 0.6);
        time = Math.max(2, time - (ordersCompleted * 0.1)); // Gets faster over time

        setCurrentOrder({
            recipe,
            name: generateDishName(recipe)
        });
        setAvailableIngredients(shuffledAvailable.sort(() => Math.random() - 0.5));
        setSelectedIngredients([]);
        setOrderTimer(time);
        setHiddenIndex(hidden);
        setDecoyIngredient(decoy);
        setIsSpeedRound(speedRound);
        setWildCardActive(hasWildCard);
    }, [selectedOpponent, currentLevel, ordersCompleted, getDifficulty]);

    // Generate fun dish names
    const generateDishName = (recipe) => {
        const adjectives = ['Sizzling', 'Crispy', 'Zesty', 'Savory', 'Tasty', 'Gourmet', 'Supreme', 'Deluxe'];
        const styles = ['Delight', 'Surprise', 'Special', 'Fusion', 'Creation', 'Masterpiece'];
        return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${styles[Math.floor(Math.random() * styles.length)]}`;
    };

    // Start match
    const startMatch = (opponent, level) => {
        setSelectedOpponent(opponent);
        setCurrentLevel(level);
        setScore(0);
        setMistakes(0);
        setOrdersCompleted(0);
        setCombo(0);
        setMaxCombo(0);
        setGameTime(90); // 90 second matches
        setShowFeedback(null);
        setGameState('playing');
    };

    // Initialize first order when playing starts
    useEffect(() => {
        if (gameState === 'playing' && !currentOrder) {
            generateOrder();
        }
    }, [gameState, currentOrder, generateOrder]);

    // Order timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || !currentOrder) return;

        timerRef.current = setInterval(() => {
            setOrderTimer(t => {
                if (t <= 0.1) {
                    // Time's up - order failed
                    handleOrderFailed('timeout');
                    return 0;
                }
                return t - 0.1;
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

    // Beat timer for rhythm bonus
    useEffect(() => {
        if (gameState !== 'playing') return;
        if (!selectedOpponent) return;
        if (selectedOpponent.special !== 'rhythm_bonus' && selectedOpponent.special !== 'all_challenges') return;

        beatRef.current = setInterval(() => {
            setBeatPhase(p => (p + 1) % 4);
        }, 500);

        return () => clearInterval(beatRef.current);
    }, [gameState, selectedOpponent]);

    // Handle ingredient selection
    const handleIngredientClick = useCallback((ingredient) => {
        if (gameState !== 'playing' || !currentOrder) return;

        const opp = selectedOpponent;
        const recipe = currentOrder.recipe;
        const currentIndex = selectedIngredients.length;

        // Check for decoy
        if (decoyIngredient && ingredient.id === decoyIngredient.id) {
            handleOrderFailed('decoy');
            return;
        }

        // Wild card matches anything
        if (wildCardActive && ingredient.id === 'wild') {
            setSelectedIngredients([...selectedIngredients, recipe[currentIndex]]);
            checkOrderComplete([...selectedIngredients, recipe[currentIndex]]);
            return;
        }

        // Check if correct ingredient
        const expected = recipe[currentIndex];
        if (ingredient.id === expected.id) {
            // Correct!
            const newSelected = [...selectedIngredients, ingredient];
            setSelectedIngredients(newSelected);

            // Check if order complete
            if (newSelected.length === recipe.length) {
                handleOrderComplete();
            }
        } else {
            // Wrong ingredient
            if (opp.special === 'strict_order') {
                // Strict mode - immediate failure
                handleOrderFailed('wrong');
            } else {
                // Normal mode - show feedback but continue
                setShowFeedback({ type: 'wrong', message: 'Wrong!' });
                setTimeout(() => setShowFeedback(null), 500);
            }
        }
    }, [gameState, currentOrder, selectedIngredients, selectedOpponent, decoyIngredient, wildCardActive]);

    // Handle order completion
    const handleOrderComplete = useCallback(() => {
        const opp = selectedOpponent;
        let points = 100;

        // Combo bonus
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(m => Math.max(m, newCombo));
        if (newCombo >= 3) {
            points += newCombo * 10;
        }

        // Time bonus
        const timeBonus = Math.floor(orderTimer * 10);
        points += timeBonus;

        // Rhythm bonus
        if ((opp.special === 'rhythm_bonus' || opp.special === 'all_challenges') && beatPhase === 0) {
            points = Math.floor(points * 1.5);
        }

        // Strict order bonus
        if (opp.special === 'strict_order') {
            points = Math.floor(points * 1.5);
        }

        // Speed round bonus
        if (isSpeedRound) {
            points = Math.floor(points * 1.3);
        }

        setScore(s => s + points);
        setOrdersCompleted(o => o + 1);

        // Bonus time for Cheeky Chicken
        if (opp.special === 'bonus_time' && newCombo >= 2) {
            setGameTime(t => Math.min(90, t + 2));
        }

        setShowFeedback({ type: 'success', message: `+${points}!`, combo: newCombo });
        setTimeout(() => {
            setShowFeedback(null);
            setCurrentOrder(null);
            generateOrder();
        }, 800);
    }, [combo, orderTimer, selectedOpponent, beatPhase, isSpeedRound, generateOrder]);

    // Handle order failure
    const handleOrderFailed = useCallback((reason) => {
        setMistakes(m => {
            const newMistakes = m + 1;
            if (newMistakes >= 3) {
                setTimeout(() => setGameState('result'), 500);
            }
            return newMistakes;
        });
        setCombo(0);

        const messages = {
            timeout: "Time's up!",
            wrong: 'Wrong order!',
            decoy: 'Decoy ingredient!'
        };

        setShowFeedback({ type: 'error', message: messages[reason] || 'Failed!' });
        setTimeout(() => {
            setShowFeedback(null);
            setCurrentOrder(null);
            if (mistakes + 1 < 3) {
                generateOrder();
            }
        }, 800);
    }, [mistakes, generateOrder]);

    // Handle result
    useEffect(() => {
        if (gameState !== 'result') return;

        // Calculate performance
        const baseTarget = 500 + currentLevel * 100 + selectedOpponent.id * 150;
        const percentage = score / baseTarget;

        if (percentage >= 0.5 && mistakes < 3) {
            const points = percentage >= 0.8 ? 2 : 1;
            setProgression(prev => {
                const newPoints = [...prev.starPoints];
                newPoints[selectedOpponent.id] = Math.min(40, newPoints[selectedOpponent.id] + points);
                return { ...prev, starPoints: newPoints };
            });
        }
    }, [gameState, score, currentLevel, selectedOpponent, mistakes]);

    // Keyboard handling
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    setGameState('select');
                    setCurrentOrder(null);
                } else if (gameState !== 'menu') {
                    setGameState('menu');
                }
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

    // Menu screen
    if (gameState === 'menu') {
        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, #2d1f1a 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 20px', color: theme.text
            }}>
                <div style={{ fontSize: '64px', marginBottom: '10px' }}>👨‍🍳</div>
                <h1 style={{ fontSize: '36px', marginBottom: '5px', color: theme.accent }}>COOK-OFF</h1>
                <p style={{ color: theme.textSecondary, marginBottom: '10px', fontSize: '20px' }}>Kitchen Chaos</p>
                <p style={{ color: theme.textMuted, marginBottom: '30px', textAlign: 'center', maxWidth: '400px' }}>
                    Match orders by tapping ingredients in the correct order! Beat the timer and avoid mistakes!
                </p>

                <button
                    onClick={() => setGameState('select')}
                    style={{
                        padding: '15px 50px', fontSize: '20px',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentBright})`,
                        border: 'none', borderRadius: '10px', color: 'white',
                        cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 69, 0, 0.4)'
                    }}
                >
                    START COOKING
                </button>

                <a href="../menu.html" style={{
                    marginTop: '20px', color: theme.textMuted,
                    textDecoration: 'none', fontSize: '14px'
                }}>Back to Menu</a>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setGameState('menu')} style={{
                        background: 'transparent', border: `1px solid ${theme.border}`,
                        color: theme.textSecondary, padding: '8px 16px', borderRadius: '5px', cursor: 'pointer'
                    }}>Back</button>
                    <h2 style={{ color: theme.accent }}>Choose Your Rival Chef</h2>
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
                                            🍳 {opp.specialDesc}
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
                }}>Back</button>

                <div style={{ fontSize: '80px', marginTop: '20px' }}>{selectedOpponent.emoji}</div>
                <h2 style={{ color: selectedOpponent.color, marginTop: '10px' }}>{selectedOpponent.name}</h2>
                <p style={{ color: theme.textMuted }}>{selectedOpponent.title}</p>
                <p style={{
                    color: theme.textSecondary, fontStyle: 'italic',
                    marginTop: '10px', fontSize: '14px'
                }}>"{selectedOpponent.taunt}"</p>

                <div style={{
                    marginTop: '15px', padding: '10px 20px',
                    background: `${selectedOpponent.color}22`, borderRadius: '8px',
                    color: theme.textSecondary
                }}>
                    🍳 {selectedOpponent.specialDesc}
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

    // Playing screen
    if (gameState === 'playing') {
        const opp = selectedOpponent;
        const showBeat = opp?.special === 'rhythm_bonus' || opp?.special === 'all_challenges';

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${opp?.color}22 100%)`,
                display: 'flex', flexDirection: 'column',
                padding: '20px', color: theme.text, userSelect: 'none'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '15px', padding: '10px 20px',
                    background: theme.bgPanel, borderRadius: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: theme.textMuted }}>Time: </span>
                            <span style={{
                                color: gameTime <= 10 ? theme.error : theme.text,
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}>{gameTime}s</span>
                        </div>
                        <div>
                            <span style={{ color: theme.textMuted }}>Score: </span>
                            <span style={{ color: theme.gold, fontWeight: 'bold', fontSize: '18px' }}>{score}</span>
                        </div>
                        {combo >= 2 && (
                            <div style={{ color: theme.success, fontWeight: 'bold' }}>
                                🔥 x{combo}
                            </div>
                        )}
                    </div>
                    <div style={{ color: opp?.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {opp?.emoji} {opp?.name} - Level {currentLevel}
                        {showBeat && (
                            <div style={{
                                width: '20px', height: '20px',
                                background: beatPhase === 0 ? theme.gold : theme.bgDark,
                                borderRadius: '50%',
                                transition: 'background 0.1s',
                                marginLeft: '10px'
                            }} />
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '25px', height: '25px',
                                background: i < mistakes ? theme.error : theme.success,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px'
                            }}>
                                {i < mistakes ? '✗' : '❤️'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Speed round indicator */}
                {isSpeedRound && (
                    <div style={{
                        textAlign: 'center',
                        padding: '5px',
                        background: `${theme.accent}44`,
                        borderRadius: '5px',
                        marginBottom: '10px',
                        color: theme.accent,
                        fontWeight: 'bold',
                        animation: 'pulse 0.5s infinite'
                    }}>
                        ⚡ SPEED ROUND! ⚡
                    </div>
                )}

                {/* Current Order */}
                {currentOrder && (
                    <div style={{
                        background: theme.bgPanel,
                        borderRadius: '15px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: `2px solid ${theme.accent}`
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <div>
                                <span style={{ color: theme.textMuted }}>Order: </span>
                                <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '20px' }}>
                                    {currentOrder.name}
                                </span>
                            </div>
                            <div style={{
                                background: orderTimer <= 2 ? theme.error : theme.accent,
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                animation: orderTimer <= 2 ? 'pulse 0.3s infinite' : 'none'
                            }}>
                                {orderTimer.toFixed(1)}s
                            </div>
                        </div>

                        {/* Timer bar */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: theme.bgDark,
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '15px'
                        }}>
                            <div style={{
                                width: `${(orderTimer / getDifficulty(opp.id, currentLevel).baseTime) * 100}%`,
                                height: '100%',
                                background: orderTimer <= 2 ? theme.error : theme.accent,
                                transition: 'width 0.1s linear'
                            }} />
                        </div>

                        {/* Recipe display */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '10px'
                        }}>
                            {currentOrder.recipe.map((ing, i) => {
                                const isSelected = i < selectedIngredients.length;
                                const isHidden = i === hiddenIndex && hiddenIndex >= 0;

                                return (
                                    <div key={i} style={{
                                        width: '60px',
                                        height: '60px',
                                        background: isSelected ? `${theme.success}44` : theme.bgDark,
                                        border: `3px solid ${isSelected ? theme.success : (i === selectedIngredients.length ? theme.accent : theme.border)}`,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '32px',
                                        transition: 'all 0.2s'
                                    }}>
                                        {isHidden ? '❓' : ing.emoji}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>
                            {selectedIngredients.length} / {currentOrder.recipe.length} ingredients added
                        </div>
                    </div>
                )}

                {/* Available Ingredients */}
                <div style={{
                    flex: 1,
                    background: theme.bgDark,
                    borderRadius: '15px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px', color: theme.textSecondary }}>
                        Tap Ingredients In Order
                    </h3>

                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        flex: 1,
                        alignContent: 'center'
                    }}>
                        {availableIngredients.map((ing, i) => (
                            <button
                                key={`${ing.id}-${i}`}
                                onClick={() => handleIngredientClick(ing)}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: decoyIngredient?.id === ing.id
                                        ? `linear-gradient(135deg, ${theme.bgPanel}, #3a2440)`
                                        : `linear-gradient(135deg, ${theme.bgPanel}, ${theme.bg})`,
                                    border: `2px solid ${theme.border}`,
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s, box-shadow 0.1s',
                                    fontSize: '36px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = `0 0 15px ${theme.accent}44`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {ing.emoji}
                                <span style={{ fontSize: '10px', color: theme.textMuted, marginTop: '2px' }}>
                                    {ing.name}
                                </span>
                            </button>
                        ))}

                        {/* Wild card */}
                        {wildCardActive && (
                            <button
                                onClick={() => handleIngredientClick({ id: 'wild', emoji: '🌟', name: 'Wild' })}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: `linear-gradient(135deg, ${theme.gold}44, ${theme.gold}22)`,
                                    border: `2px solid ${theme.gold}`,
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s',
                                    fontSize: '36px',
                                    animation: 'pulse 1s infinite'
                                }}
                            >
                                🌟
                                <span style={{ fontSize: '10px', color: theme.gold, marginTop: '2px' }}>
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
                        padding: '30px 50px',
                        background: showFeedback.type === 'success' ? theme.success
                            : showFeedback.type === 'error' ? theme.error
                            : theme.accent,
                        borderRadius: '20px',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 100,
                        animation: 'popIn 0.3s ease-out',
                        textAlign: 'center'
                    }}>
                        <div>{showFeedback.message}</div>
                        {showFeedback.combo >= 3 && (
                            <div style={{ fontSize: '18px', marginTop: '5px' }}>
                                🔥 {showFeedback.combo}x Combo!
                            </div>
                        )}
                    </div>
                )}

                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes popIn {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const baseTarget = 500 + currentLevel * 100 + selectedOpponent.id * 150;
        const percentage = score / baseTarget;
        const won = percentage >= 0.5 && mistakes < 3;
        const excellent = percentage >= 0.8 && mistakes < 3;

        return (
            <div style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.bg} 0%, ${won ? theme.success : theme.error}22 100%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.text, padding: '20px'
            }}>
                <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                    {mistakes >= 3 ? '💔' : excellent ? '🏆' : won ? '🍽️' : '😢'}
                </div>
                <h1 style={{
                    fontSize: '48px',
                    color: excellent ? theme.gold : won ? theme.success : theme.error,
                    marginBottom: '10px'
                }}>
                    {mistakes >= 3 ? 'KITCHEN DISASTER!' : excellent ? 'MASTER CHEF!' : won ? 'ORDER UP!' : 'NEEDS PRACTICE'}
                </h1>

                <p style={{
                    color: selectedOpponent?.color,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    marginBottom: '20px'
                }}>
                    {selectedOpponent?.emoji} "{won ? selectedOpponent?.loseQuote : selectedOpponent?.winQuote}"
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px',
                    marginBottom: '30px',
                    background: theme.bgPanel,
                    padding: '20px',
                    borderRadius: '15px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>Score</div>
                        <div style={{ color: theme.gold, fontSize: '28px', fontWeight: 'bold' }}>{score}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>Orders Completed</div>
                        <div style={{ color: theme.accent, fontSize: '28px', fontWeight: 'bold' }}>{ordersCompleted}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>Max Combo</div>
                        <div style={{ color: theme.success, fontSize: '28px', fontWeight: 'bold' }}>{maxCombo}x</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: theme.textMuted, fontSize: '14px' }}>Mistakes</div>
                        <div style={{ color: mistakes >= 3 ? theme.error : theme.text, fontSize: '28px', fontWeight: 'bold' }}>{mistakes}/3</div>
                    </div>
                </div>

                {won && (
                    <div style={{
                        background: theme.bgPanel, padding: '15px 30px',
                        borderRadius: '10px', marginBottom: '30px'
                    }}>
                        <span style={{ color: theme.gold }}>+{excellent ? 2 : 1} Points</span>
                        <span style={{ color: theme.textMuted, marginLeft: '15px' }}>
                            ({getStars(selectedOpponent?.id || 0)}/10 stars)
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => {
                            setCurrentOrder(null);
                            startMatch(selectedOpponent, currentLevel);
                        }}
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
                        onClick={() => {
                            setCurrentOrder(null);
                            setGameState('level_select');
                        }}
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
