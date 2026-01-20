const { useState, useEffect, useCallback, useMemo, useRef } = React;

/**
 * HONEY GRID - Roguelike Puzzle Dungeon Crawler
 *
 * Core Loop:
 * - Explore dungeon floors (each floor is a 5x5 grid)
 * - Flip tiles to find gems (x2, x3 multipliers)
 * - Avoid traps (they damage you, not instant death)
 * - Collect gold to buy items at the shop
 * - Items help you: reveal tiles, mark traps, heal, etc.
 * - Goal: Reach floor 10 of each dungeon
 * - Permadeath: Die and start over (but unlock permanent upgrades)
 */

const ASSET_PATH = './assets';

// Dungeon configurations
const DUNGEONS = {
    forest: {
        name: 'Enchanted Forest',
        icon: '🌲',
        floors: 10,
        color: '#2d5a27',
        bgColor: '#1a2f1a',
        description: 'A mystical forest filled with hidden treasures',
        unlocked: true,
        trapDamage: 1,
        baseGold: 5,
    },
    cave: {
        name: 'Crystal Caverns',
        icon: '💎',
        floors: 15,
        color: '#4a5568',
        bgColor: '#1a1a2e',
        description: 'Deep caves with rare crystals and lurking dangers',
        unlocked: false,
        unlockRequirement: { dungeon: 'forest', floors: 5 },
        trapDamage: 1,
        baseGold: 8,
    },
    volcano: {
        name: 'Molten Depths',
        icon: '🌋',
        floors: 20,
        color: '#c53030',
        bgColor: '#2d1a1a',
        description: 'Scorching tunnels with valuable fire gems',
        unlocked: false,
        unlockRequirement: { dungeon: 'cave', floors: 10 },
        trapDamage: 2,
        baseGold: 12,
    },
    temple: {
        name: 'Ancient Temple',
        icon: '🏛️',
        floors: 25,
        color: '#d69e2e',
        bgColor: '#2d2a1a',
        description: 'A forgotten temple holding legendary artifacts',
        unlocked: false,
        unlockRequirement: { dungeon: 'volcano', floors: 15 },
        trapDamage: 2,
        baseGold: 15,
    },
};

// Items you can buy/find
const ITEMS = {
    revealOne: {
        name: 'Crystal Ball',
        description: 'Reveal one random unrevealed tile',
        icon: '🔮',
        cost: 15,
        effect: 'reveal_one',
    },
    revealTraps: {
        name: 'Trap Sensor',
        description: 'Mark all traps in one row or column',
        icon: '⚡',
        cost: 25,
        effect: 'reveal_traps_line',
    },
    shield: {
        name: 'Magic Shield',
        description: 'Block the next trap damage',
        icon: '🛡️',
        cost: 20,
        effect: 'shield',
    },
    heal: {
        name: 'Health Potion',
        description: 'Restore 1 HP',
        icon: '❤️‍🩹',
        cost: 30,
        effect: 'heal',
    },
    doubleGold: {
        name: 'Gold Magnet',
        description: 'Double gold earned this floor',
        icon: '🧲',
        cost: 35,
        effect: 'double_gold',
    },
    safeFlip: {
        name: 'Lucky Charm',
        description: 'Your next flip cannot be a trap',
        icon: '🍀',
        cost: 40,
        effect: 'safe_flip',
    },
};

const HoneyGrid = () => {
    // Game state
    const [screen, setScreen] = useState('title'); // title, dungeon_select, playing, shop, game_over, victory
    const [currentDungeon, setCurrentDungeon] = useState(null);
    const [currentFloor, setCurrentFloor] = useState(1);

    // Player state
    const [maxHp, setMaxHp] = useState(3);
    const [hp, setHp] = useState(3);
    const [gold, setGold] = useState(0);
    const [inventory, setInventory] = useState([]);
    const [activeEffects, setActiveEffects] = useState([]); // shield, double_gold, safe_flip

    // Floor state
    const [grid, setGrid] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [marked, setMarked] = useState([]);
    const [hints, setHints] = useState({ rows: [], cols: [] });
    const [floorScore, setFloorScore] = useState(1);
    const [gemsFound, setGemsFound] = useState(0);
    const [totalGems, setTotalGems] = useState(0);
    const [floorComplete, setFloorComplete] = useState(false);

    // Animation state
    const [shake, setShake] = useState(false);
    const [flashTile, setFlashTile] = useState(null);
    const [particles, setParticles] = useState([]);
    const [damageFlash, setDamageFlash] = useState(false);

    // Persistent progress (saved to localStorage)
    const [progress, setProgress] = useState(() => {
        const saved = localStorage.getItem('honeygrid_progress_v4');
        if (saved) return JSON.parse(saved);
        return {
            bestFloors: {}, // { dungeon: floor }
            totalRuns: 0,
            totalGemsCollected: 0,
            permanentUpgrades: [],
            unlockedDungeons: ['forest'],
        };
    });

    // Save progress
    useEffect(() => {
        localStorage.setItem('honeygrid_progress_v4', JSON.stringify(progress));
    }, [progress]);

    // Generate floor grid
    const generateFloor = useCallback((dungeonId, floor) => {
        const dungeon = DUNGEONS[dungeonId];
        const size = 5;

        // Difficulty scales with floor
        const trapCount = Math.min(2 + Math.floor(floor / 3), 8);
        const gemCount = Math.max(8 - Math.floor(floor / 4), 4);
        const x3Chance = Math.min(0.1 + floor * 0.03, 0.5);

        // Create empty grid
        const newGrid = Array(size).fill(null).map(() => Array(size).fill(1));

        // Place traps
        let trapsPlaced = 0;
        while (trapsPlaced < trapCount) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (newGrid[y][x] === 1) {
                newGrid[y][x] = 0;
                trapsPlaced++;
            }
        }

        // Place gems (x2 and x3)
        let gemsPlaced = 0;
        while (gemsPlaced < gemCount) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            if (newGrid[y][x] === 1) {
                newGrid[y][x] = Math.random() < x3Chance ? 3 : 2;
                gemsPlaced++;
            }
        }

        // Calculate hints
        const rowHints = [];
        const colHints = [];
        for (let i = 0; i < size; i++) {
            let rowSum = 0, rowTraps = 0;
            let colSum = 0, colTraps = 0;
            for (let j = 0; j < size; j++) {
                if (newGrid[i][j] === 0) rowTraps++;
                else rowSum += newGrid[i][j];
                if (newGrid[j][i] === 0) colTraps++;
                else colSum += newGrid[j][i];
            }
            rowHints.push({ sum: rowSum, traps: rowTraps });
            colHints.push({ sum: colSum, traps: colTraps });
        }

        // Count total gems
        let gems = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (newGrid[y][x] > 1) gems++;
            }
        }

        return { grid: newGrid, hints: { rows: rowHints, cols: colHints }, totalGems: gems };
    }, []);

    // Start a new run
    const startRun = useCallback((dungeonId) => {
        const floorData = generateFloor(dungeonId, 1);

        setCurrentDungeon(dungeonId);
        setCurrentFloor(1);
        setMaxHp(3);
        setHp(3);
        setGold(0);
        setInventory([]);
        setActiveEffects([]);
        setGrid(floorData.grid);
        setRevealed(Array(5).fill(null).map(() => Array(5).fill(false)));
        setMarked(Array(5).fill(null).map(() => Array(5).fill(null)));
        setHints(floorData.hints);
        setFloorScore(1);
        setGemsFound(0);
        setTotalGems(floorData.totalGems);
        setFloorComplete(false);
        setScreen('playing');

        setProgress(prev => ({ ...prev, totalRuns: prev.totalRuns + 1 }));
    }, [generateFloor]);

    // Advance to next floor
    const nextFloor = useCallback(() => {
        const newFloor = currentFloor + 1;
        const dungeon = DUNGEONS[currentDungeon];

        // Check for victory
        if (newFloor > dungeon.floors) {
            setScreen('victory');
            setProgress(prev => ({
                ...prev,
                bestFloors: {
                    ...prev.bestFloors,
                    [currentDungeon]: Math.max(prev.bestFloors[currentDungeon] || 0, dungeon.floors)
                }
            }));
            return;
        }

        const floorData = generateFloor(currentDungeon, newFloor);

        setCurrentFloor(newFloor);
        setGrid(floorData.grid);
        setRevealed(Array(5).fill(null).map(() => Array(5).fill(false)));
        setMarked(Array(5).fill(null).map(() => Array(5).fill(null)));
        setHints(floorData.hints);
        setFloorScore(1);
        setGemsFound(0);
        setTotalGems(floorData.totalGems);
        setFloorComplete(false);
        setActiveEffects(prev => prev.filter(e => e !== 'double_gold')); // Remove floor-specific effects

        // Update best floor
        setProgress(prev => ({
            ...prev,
            bestFloors: {
                ...prev.bestFloors,
                [currentDungeon]: Math.max(prev.bestFloors[currentDungeon] || 0, newFloor - 1)
            }
        }));
    }, [currentDungeon, currentFloor, generateFloor]);

    // Go to shop
    const goToShop = useCallback(() => {
        // Award gold based on floor score
        const dungeon = DUNGEONS[currentDungeon];
        let earnedGold = dungeon.baseGold + Math.floor(floorScore / 2);
        if (activeEffects.includes('double_gold')) earnedGold *= 2;

        setGold(prev => prev + earnedGold);
        setScreen('shop');
    }, [currentDungeon, floorScore, activeEffects]);

    // Flip a tile
    const flipTile = useCallback((x, y) => {
        if (!grid.length || revealed[y]?.[x] || floorComplete) return;

        const value = grid[y][x];

        // Safe flip effect
        if (value === 0 && activeEffects.includes('safe_flip')) {
            setActiveEffects(prev => prev.filter(e => e !== 'safe_flip'));
            // Find a safe tile nearby
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5 &&
                        grid[ny][nx] > 0 && !revealed[ny][nx]) {
                        x = nx;
                        y = ny;
                        break;
                    }
                }
            }
        }

        const actualValue = grid[y][x];

        setFlashTile({ x, y, value: actualValue });
        setTimeout(() => setFlashTile(null), 200);

        setRevealed(prev => {
            const next = prev.map(row => [...row]);
            next[y][x] = true;
            return next;
        });

        if (actualValue === 0) {
            // Hit a trap!
            let damage = DUNGEONS[currentDungeon].trapDamage;

            // Shield blocks damage
            if (activeEffects.includes('shield')) {
                setActiveEffects(prev => prev.filter(e => e !== 'shield'));
                damage = 0;
                spawnParticles(x * 60 + 150, y * 60 + 200, 10, '#4299e1');
            }

            if (damage > 0) {
                setHp(prev => prev - damage);
                setShake(true);
                setDamageFlash(true);
                setTimeout(() => setShake(false), 300);
                setTimeout(() => setDamageFlash(false), 100);

                // Check for death
                if (hp - damage <= 0) {
                    setTimeout(() => {
                        setScreen('game_over');
                    }, 500);
                }
            }
        } else {
            // Found a safe tile or gem
            const newScore = floorScore * actualValue;
            setFloorScore(newScore);

            if (actualValue > 1) {
                setGemsFound(prev => prev + 1);
                spawnParticles(x * 60 + 150, y * 60 + 200, 15, actualValue === 3 ? '#ffd700' : '#48bb78');

                // Check for floor completion
                if (gemsFound + 1 >= totalGems) {
                    setFloorComplete(true);
                    setProgress(prev => ({
                        ...prev,
                        totalGemsCollected: prev.totalGemsCollected + gemsFound + 1
                    }));
                }
            }
        }
    }, [grid, revealed, floorComplete, activeEffects, currentDungeon, hp, floorScore, gemsFound, totalGems]);

    // Mark a tile
    const markTile = useCallback((x, y, e) => {
        e.preventDefault();
        if (revealed[y]?.[x] || floorComplete) return;

        setMarked(prev => {
            const next = prev.map(row => [...row]);
            next[y][x] = next[y][x] === 'trap' ? 'safe' : next[y][x] === 'safe' ? null : 'trap';
            return next;
        });
    }, [revealed, floorComplete]);

    // Use an item
    const useItem = useCallback((itemId, index) => {
        const item = ITEMS[itemId];
        if (!item) return;

        switch (item.effect) {
            case 'reveal_one': {
                // Find an unrevealed tile that's not a trap
                const candidates = [];
                for (let y = 0; y < 5; y++) {
                    for (let x = 0; x < 5; x++) {
                        if (!revealed[y][x] && grid[y][x] > 0) {
                            candidates.push({ x, y });
                        }
                    }
                }
                if (candidates.length > 0) {
                    const { x, y } = candidates[Math.floor(Math.random() * candidates.length)];
                    setRevealed(prev => {
                        const next = prev.map(row => [...row]);
                        next[y][x] = true;
                        return next;
                    });
                    if (grid[y][x] > 1) {
                        setFloorScore(prev => prev * grid[y][x]);
                        setGemsFound(prev => prev + 1);
                    }
                }
                break;
            }
            case 'reveal_traps_line': {
                // Mark all traps in a random row or column with traps
                const options = [];
                for (let i = 0; i < 5; i++) {
                    if (hints.rows[i].traps > 0) options.push({ type: 'row', index: i });
                    if (hints.cols[i].traps > 0) options.push({ type: 'col', index: i });
                }
                if (options.length > 0) {
                    const choice = options[Math.floor(Math.random() * options.length)];
                    setMarked(prev => {
                        const next = prev.map(row => [...row]);
                        for (let i = 0; i < 5; i++) {
                            const y = choice.type === 'row' ? choice.index : i;
                            const x = choice.type === 'col' ? choice.index : i;
                            if (grid[y][x] === 0 && !revealed[y][x]) {
                                next[y][x] = 'trap';
                            }
                        }
                        return next;
                    });
                }
                break;
            }
            case 'shield':
                setActiveEffects(prev => [...prev, 'shield']);
                break;
            case 'heal':
                setHp(prev => Math.min(prev + 1, maxHp));
                break;
            case 'double_gold':
                setActiveEffects(prev => [...prev, 'double_gold']);
                break;
            case 'safe_flip':
                setActiveEffects(prev => [...prev, 'safe_flip']);
                break;
        }

        // Remove item from inventory
        setInventory(prev => prev.filter((_, i) => i !== index));
    }, [revealed, grid, hints, maxHp]);

    // Buy an item
    const buyItem = useCallback((itemId) => {
        const item = ITEMS[itemId];
        if (!item || gold < item.cost || inventory.length >= 6) return;

        setGold(prev => prev - item.cost);
        setInventory(prev => [...prev, itemId]);
    }, [gold, inventory]);

    // Spawn particles
    const spawnParticles = useCallback((x, y, count, color) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: Date.now() + i + Math.random(),
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 4,
                life: 1,
                color,
                size: 4 + Math.random() * 6
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
                    vy: p.vy + 0.3,
                    life: p.life - 0.03
                }))
                .filter(p => p.life > 0)
            );
        }, 16);
        return () => clearInterval(interval);
    }, [particles.length]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Escape') {
                if (screen === 'playing' || screen === 'shop') {
                    setScreen('dungeon_select');
                } else if (screen !== 'title') {
                    setScreen('title');
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [screen]);

    // Styles
    const styles = {
        container: {
            minHeight: '100vh',
            background: currentDungeon ? DUNGEONS[currentDungeon].bgColor : '#1a1a2e',
            fontFamily: "'Press Start 2P', monospace",
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            imageRendering: 'pixelated',
        },
        pixelBorder: {
            border: '4px solid #fff',
            boxShadow: 'inset -4px -4px 0 #888, inset 4px 4px 0 #fff, 4px 4px 0 #000',
            background: '#2d3748',
        },
        button: {
            padding: '12px 24px',
            fontSize: '12px',
            fontFamily: "'Press Start 2P', monospace",
            border: '4px solid #fff',
            boxShadow: '4px 4px 0 #000',
            background: '#4a5568',
            color: '#fff',
            cursor: 'pointer',
            transition: 'transform 0.1s',
        },
        buttonHover: {
            transform: 'translate(2px, 2px)',
            boxShadow: '2px 2px 0 #000',
        },
    };

    // Title Screen
    if (screen === 'title') {
        return (
            <div style={styles.container}>
                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>💎</div>
                    <h1 style={{ fontSize: '24px', marginBottom: '10px', textShadow: '4px 4px 0 #000' }}>
                        DUNGEON
                    </h1>
                    <h1 style={{ fontSize: '24px', marginBottom: '40px', color: '#ffd700', textShadow: '4px 4px 0 #000' }}>
                        GRID
                    </h1>

                    <button
                        style={styles.button}
                        onClick={() => setScreen('dungeon_select')}
                        onMouseOver={e => Object.assign(e.target.style, styles.buttonHover)}
                        onMouseOut={e => { e.target.style.transform = ''; e.target.style.boxShadow = '4px 4px 0 #000'; }}
                    >
                        START GAME
                    </button>

                    <div style={{
                        marginTop: '60px',
                        padding: '20px',
                        ...styles.pixelBorder,
                        maxWidth: '400px',
                        fontSize: '10px',
                        lineHeight: '1.8'
                    }}>
                        <p style={{ marginBottom: '12px', color: '#48bb78' }}>▸ Flip tiles to find gems</p>
                        <p style={{ marginBottom: '12px', color: '#f56565' }}>▸ Avoid traps (they hurt!)</p>
                        <p style={{ marginBottom: '12px', color: '#ffd700' }}>▸ Collect gold for items</p>
                        <p style={{ color: '#63b3ed' }}>▸ Reach the final floor!</p>
                    </div>

                    <div style={{ marginTop: '40px', fontSize: '10px', color: '#718096' }}>
                        Runs: {progress.totalRuns} | Gems: {progress.totalGemsCollected}
                    </div>
                </div>
            </div>
        );
    }

    // Dungeon Select
    if (screen === 'dungeon_select') {
        return (
            <div style={styles.container}>
                <h2 style={{ fontSize: '16px', marginBottom: '30px', marginTop: '30px' }}>SELECT DUNGEON</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' }}>
                    {Object.entries(DUNGEONS).map(([id, dungeon]) => {
                        const isUnlocked = progress.unlockedDungeons.includes(id) || id === 'forest';
                        const bestFloor = progress.bestFloors[id] || 0;

                        // Check unlock requirements
                        let canUnlock = false;
                        if (!isUnlocked && dungeon.unlockRequirement) {
                            const reqBest = progress.bestFloors[dungeon.unlockRequirement.dungeon] || 0;
                            canUnlock = reqBest >= dungeon.unlockRequirement.floors;
                        }

                        return (
                            <div
                                key={id}
                                onClick={() => {
                                    if (isUnlocked) {
                                        startRun(id);
                                    } else if (canUnlock) {
                                        setProgress(prev => ({
                                            ...prev,
                                            unlockedDungeons: [...prev.unlockedDungeons, id]
                                        }));
                                    }
                                }}
                                style={{
                                    ...styles.pixelBorder,
                                    padding: '16px',
                                    cursor: isUnlocked || canUnlock ? 'pointer' : 'not-allowed',
                                    opacity: isUnlocked ? 1 : canUnlock ? 0.8 : 0.4,
                                    borderColor: dungeon.color,
                                    transition: 'transform 0.1s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '32px' }}>{isUnlocked ? dungeon.icon : '🔒'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: dungeon.color, marginBottom: '4px' }}>
                                            {dungeon.name}
                                        </div>
                                        <div style={{ fontSize: '8px', color: '#a0aec0' }}>
                                            {isUnlocked ? dungeon.description :
                                             canUnlock ? 'Click to unlock!' :
                                             `Clear ${dungeon.unlockRequirement.dungeon} floor ${dungeon.unlockRequirement.floors}`}
                                        </div>
                                        {isUnlocked && (
                                            <div style={{ fontSize: '8px', color: '#ffd700', marginTop: '4px' }}>
                                                Best: Floor {bestFloor}/{dungeon.floors}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    style={{ ...styles.button, marginTop: '30px' }}
                    onClick={() => setScreen('title')}
                >
                    BACK
                </button>
            </div>
        );
    }

    // Game Over
    if (screen === 'game_over') {
        return (
            <div style={styles.container}>
                <div style={{ marginTop: '80px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>💀</div>
                    <h2 style={{ fontSize: '20px', color: '#f56565', marginBottom: '20px' }}>GAME OVER</h2>

                    <div style={{ ...styles.pixelBorder, padding: '20px', marginBottom: '30px' }}>
                        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                            Reached Floor {currentFloor}
                        </div>
                        <div style={{ fontSize: '10px', color: '#ffd700' }}>
                            Gold collected: {gold}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button style={styles.button} onClick={() => startRun(currentDungeon)}>
                            TRY AGAIN
                        </button>
                        <button style={styles.button} onClick={() => setScreen('dungeon_select')}>
                            DUNGEONS
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Victory
    if (screen === 'victory') {
        const dungeon = DUNGEONS[currentDungeon];
        return (
            <div style={styles.container}>
                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
                    <h2 style={{ fontSize: '20px', color: '#ffd700', marginBottom: '20px' }}>VICTORY!</h2>
                    <p style={{ fontSize: '12px', marginBottom: '30px' }}>
                        You conquered {dungeon.name}!
                    </p>

                    <div style={{ ...styles.pixelBorder, padding: '20px', marginBottom: '30px' }}>
                        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                            Floors cleared: {dungeon.floors}
                        </div>
                        <div style={{ fontSize: '10px', color: '#ffd700' }}>
                            Total gold: {gold}
                        </div>
                    </div>

                    <button style={styles.button} onClick={() => setScreen('dungeon_select')}>
                        CONTINUE
                    </button>
                </div>
            </div>
        );
    }

    // Shop
    if (screen === 'shop') {
        return (
            <div style={styles.container}>
                <h2 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '20px' }}>🏪 SHOP</h2>

                <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '20px' }}>
                    💰 Gold: {gold}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    maxWidth: '400px',
                    marginBottom: '20px'
                }}>
                    {Object.entries(ITEMS).map(([id, item]) => (
                        <div
                            key={id}
                            onClick={() => buyItem(id)}
                            style={{
                                ...styles.pixelBorder,
                                padding: '12px',
                                cursor: gold >= item.cost && inventory.length < 6 ? 'pointer' : 'not-allowed',
                                opacity: gold >= item.cost ? 1 : 0.5,
                            }}
                        >
                            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{item.icon}</div>
                            <div style={{ fontSize: '8px', marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ fontSize: '8px', color: '#ffd700' }}>{item.cost}g</div>
                        </div>
                    ))}
                </div>

                <div style={{ ...styles.pixelBorder, padding: '12px', marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
                    <div style={{ fontSize: '10px', marginBottom: '8px' }}>Inventory ({inventory.length}/6)</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {inventory.map((itemId, i) => (
                            <div key={i} style={{ fontSize: '20px' }}>{ITEMS[itemId].icon}</div>
                        ))}
                        {inventory.length === 0 && <div style={{ fontSize: '10px', color: '#718096' }}>Empty</div>}
                    </div>
                </div>

                <button style={styles.button} onClick={nextFloor}>
                    NEXT FLOOR →
                </button>
            </div>
        );
    }

    // Playing
    if (screen === 'playing') {
        const dungeon = DUNGEONS[currentDungeon];

        return (
            <div style={{
                ...styles.container,
                animation: shake ? 'shake 0.3s' : 'none',
            }}>
                {/* Particles */}
                {particles.map(p => (
                    <div
                        key={p.id}
                        style={{
                            position: 'fixed',
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            background: p.color,
                            opacity: p.life,
                            pointerEvents: 'none',
                            zIndex: 100,
                        }}
                    />
                ))}

                {/* Damage flash overlay */}
                {damageFlash && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255, 0, 0, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 50,
                    }} />
                )}

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '400px',
                    marginBottom: '16px',
                    ...styles.pixelBorder,
                    padding: '12px',
                }}>
                    <div>
                        <div style={{ fontSize: '10px', color: dungeon.color }}>{dungeon.icon} {dungeon.name}</div>
                        <div style={{ fontSize: '8px', color: '#a0aec0' }}>Floor {currentFloor}/{dungeon.floors}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px' }}>
                            {Array(maxHp).fill(0).map((_, i) => (
                                <span key={i} style={{ marginLeft: '2px' }}>
                                    {i < hp ? '❤️' : '🖤'}
                                </span>
                            ))}
                        </div>
                        <div style={{ fontSize: '10px', color: '#ffd700' }}>💰 {gold}</div>
                    </div>
                </div>

                {/* Score and progress */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '400px',
                    marginBottom: '16px',
                    fontSize: '10px',
                }}>
                    <div>Score: <span style={{ color: '#ffd700' }}>{floorScore}</span></div>
                    <div>Gems: <span style={{ color: '#48bb78' }}>{gemsFound}/{totalGems}</span></div>
                </div>

                {/* Active effects */}
                {activeEffects.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {activeEffects.includes('shield') && <span title="Shield active">🛡️</span>}
                        {activeEffects.includes('double_gold') && <span title="Double gold">🧲</span>}
                        {activeEffects.includes('safe_flip') && <span title="Safe flip">🍀</span>}
                    </div>
                )}

                {/* Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Column hints */}
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '52px' }}>
                        {hints.cols.map((hint, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    ...styles.pixelBorder,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    background: hint.traps === 0 ? '#2f855a' : '#2d3748',
                                }}
                            >
                                <div style={{ color: '#ffd700' }}>{hint.sum}</div>
                                <div style={{ color: '#f56565', fontSize: '8px' }}>
                                    {'💀'.repeat(hint.traps) || '✓'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grid rows */}
                    {grid.map((row, y) => (
                        <div key={y} style={{ display: 'flex', gap: '4px' }}>
                            {/* Row hint */}
                            <div
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    ...styles.pixelBorder,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    background: hints.rows[y]?.traps === 0 ? '#2f855a' : '#2d3748',
                                }}
                            >
                                <div style={{ color: '#ffd700' }}>{hints.rows[y]?.sum}</div>
                                <div style={{ color: '#f56565', fontSize: '8px' }}>
                                    {'💀'.repeat(hints.rows[y]?.traps) || '✓'}
                                </div>
                            </div>

                            {/* Tiles */}
                            {row.map((value, x) => {
                                const isRevealed = revealed[y]?.[x];
                                const mark = marked[y]?.[x];
                                const isFlashing = flashTile?.x === x && flashTile?.y === y;

                                let bg = '#4a5568';
                                let content = '?';
                                let contentColor = '#a0aec0';

                                if (isRevealed) {
                                    if (value === 0) {
                                        bg = '#c53030';
                                        content = '💀';
                                    } else if (value === 1) {
                                        bg = '#2d3748';
                                        content = '·';
                                        contentColor = '#718096';
                                    } else if (value === 2) {
                                        bg = '#2f855a';
                                        content = '💎';
                                    } else if (value === 3) {
                                        bg = '#d69e2e';
                                        content = '👑';
                                    }
                                } else if (mark === 'trap') {
                                    bg = '#742a2a';
                                    content = '⚠️';
                                } else if (mark === 'safe') {
                                    bg = '#276749';
                                    content = '✓';
                                }

                                return (
                                    <div
                                        key={x}
                                        onClick={() => flipTile(x, y)}
                                        onContextMenu={(e) => markTile(x, y, e)}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            ...styles.pixelBorder,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            background: bg,
                                            cursor: isRevealed || floorComplete ? 'default' : 'pointer',
                                            transform: isFlashing ? 'scale(1.2)' : 'scale(1)',
                                            transition: 'transform 0.1s',
                                            color: contentColor,
                                        }}
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Inventory */}
                <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}>
                    {inventory.map((itemId, i) => (
                        <div
                            key={i}
                            onClick={() => useItem(itemId, i)}
                            title={ITEMS[itemId].description}
                            style={{
                                ...styles.pixelBorder,
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                cursor: 'pointer',
                            }}
                        >
                            {ITEMS[itemId].icon}
                        </div>
                    ))}
                </div>

                {/* Floor complete overlay */}
                {floorComplete && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
                        <h2 style={{ fontSize: '16px', color: '#48bb78', marginBottom: '20px' }}>
                            FLOOR CLEARED!
                        </h2>
                        <div style={{ fontSize: '12px', marginBottom: '30px' }}>
                            Score: <span style={{ color: '#ffd700' }}>{floorScore}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button style={styles.button} onClick={goToShop}>
                                🏪 SHOP
                            </button>
                            <button style={styles.button} onClick={nextFloor}>
                                NEXT →
                            </button>
                        </div>
                    </div>
                )}

                {/* Controls hint */}
                <div style={{ marginTop: '20px', fontSize: '8px', color: '#718096' }}>
                    Click = Flip | Right-click = Mark | ESC = Menu
                </div>

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-8px); }
                        75% { transform: translateX(8px); }
                    }
                    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                `}</style>
            </div>
        );
    }

    return null;
};

ReactDOM.render(<HoneyGrid />, document.getElementById('root'));
