const { useState, useEffect, useCallback, useRef } = React;

const SnakeGame = () => {
  // Base constants
  const CELL_SIZE = 24;
  const BASE_SPEED = 150;

  // Level configurations per enemy - smaller grids for slower enemies
  const levelConfigs = {
    slime_king: {
      gridSize: 12,
      name: "Slimy Swamp",
      background: 'linear-gradient(180deg, #1a3a25 0%, #0d2818 50%, #1a4028 100%)',
      boardBg: 'linear-gradient(135deg, #1a3020 0%, #0d2515 100%)',
      gridColor: 'rgba(100, 220, 100, 0.12)',
      decorations: [
        { type: 'lily', positions: [[1,1], [10,1], [1,10], [10,10]] },
        { type: 'reed', positions: [[5,0], [6,0], [5,11], [6,11]] }
      ]
    },
    speedy_scorpion: {
      gridSize: 16,
      name: "Scorching Desert",
      background: 'linear-gradient(180deg, #4a3520 0%, #3a2510 50%, #5a4525 100%)',
      boardBg: 'linear-gradient(135deg, #3a2a15 0%, #2a1a08 100%)',
      gridColor: 'rgba(230, 180, 100, 0.1)',
      decorations: [
        { type: 'cactus', positions: [[2,2], [13,2], [2,13], [13,13]] },
        { type: 'rock', positions: [[7,0], [8,0], [7,15], [8,15], [0,7], [0,8], [15,7], [15,8]] }
      ]
    },
    phantom_fox: {
      gridSize: 16,
      name: "Mystic Grove",
      background: 'linear-gradient(180deg, #2a1a3a 0%, #1a0a2a 50%, #3a2040 100%)',
      boardBg: 'linear-gradient(135deg, #2a1830 0%, #1a0820 100%)',
      gridColor: 'rgba(200, 150, 220, 0.1)',
      decorations: [
        { type: 'mushroom', positions: [[3,3], [12,3], [3,12], [12,12], [7,7], [8,8]] },
        { type: 'wisp', positions: [[1,5], [14,5], [5,1], [5,14]] }
      ]
    },
    ice_wizard: {
      gridSize: 18,
      name: "Frozen Peaks",
      background: 'linear-gradient(180deg, #1a2a3a 0%, #0d1a2a 50%, #2a3a4a 100%)',
      boardBg: 'linear-gradient(135deg, #1a2535 0%, #0d1520 100%)',
      gridColor: 'rgba(150, 200, 255, 0.12)',
      decorations: [
        { type: 'crystal', positions: [[2,2], [15,2], [2,15], [15,15], [8,8], [9,9]] },
        { type: 'snowpile', positions: [[0,4], [0,13], [17,4], [17,13]] }
      ]
    },
    thunder_tiger: {
      gridSize: 18,
      name: "Storm Valley",
      background: 'linear-gradient(180deg, #2a2a35 0%, #1a1a25 50%, #3a3a40 100%)',
      boardBg: 'linear-gradient(135deg, #252530 0%, #151520 100%)',
      gridColor: 'rgba(255, 220, 100, 0.1)',
      decorations: [
        { type: 'cloud', positions: [[3,1], [10,1], [14,1], [6,16], [11,16]] },
        { type: 'scorch', positions: [[4,4], [13,4], [4,13], [13,13]] }
      ]
    },
    shadow_serpent: {
      gridSize: 18,
      name: "Dark Hollow",
      background: 'linear-gradient(180deg, #15102a 0%, #0a0518 50%, #201530 100%)',
      boardBg: 'linear-gradient(135deg, #150d25 0%, #080410 100%)',
      gridColor: 'rgba(120, 80, 180, 0.1)',
      decorations: [
        { type: 'shadow', positions: [[2,2], [15,2], [2,15], [15,15], [8,2], [8,15]] },
        { type: 'eyes', positions: [[5,5], [12,5], [5,12], [12,12]] }
      ]
    },
    mirror_mantis: {
      gridSize: 18,
      name: "Crystal Cavern",
      background: 'linear-gradient(180deg, #1a2a2a 0%, #0d1a1a 50%, #2a3a3a 100%)',
      boardBg: 'linear-gradient(135deg, #1a2828 0%, #0d1515 100%)',
      gridColor: 'rgba(150, 220, 200, 0.12)',
      decorations: [
        { type: 'mirror', positions: [[3,3], [14,3], [3,14], [14,14]] },
        { type: 'gem', positions: [[8,1], [9,1], [1,8], [1,9], [16,8], [16,9], [8,16], [9,16]] }
      ]
    },
    gravity_gorilla: {
      gridSize: 20,
      name: "Boulder Mountain",
      background: 'linear-gradient(180deg, #2a2525 0%, #1a1515 50%, #3a3030 100%)',
      boardBg: 'linear-gradient(135deg, #252020 0%, #151010 100%)',
      gridColor: 'rgba(180, 160, 140, 0.1)',
      decorations: [
        { type: 'boulder', positions: [[3,3], [16,3], [3,16], [16,16], [9,9], [10,10]] },
        { type: 'crack', positions: [[5,0], [14,0], [0,5], [0,14], [19,5], [19,14], [5,19], [14,19]] }
      ]
    },
    chaos_chimera: {
      gridSize: 20,
      name: "Chaos Realm",
      background: 'linear-gradient(135deg, #3a1a2a 0%, #1a3a2a 33%, #2a1a3a 66%, #3a2a1a 100%)',
      boardBg: 'linear-gradient(135deg, #2a1520 0%, #152a20 50%, #201525 100%)',
      gridColor: 'rgba(255, 100, 200, 0.1)',
      decorations: [
        { type: 'portal', positions: [[4,4], [15,4], [4,15], [15,15]] },
        { type: 'rift', positions: [[9,2], [10,2], [9,17], [10,17], [2,9], [2,10], [17,9], [17,10]] }
      ]
    },
    eternal_wyrm: {
      gridSize: 22,
      name: "Cosmic Void",
      background: 'linear-gradient(180deg, #0a0510 0%, #050208 50%, #100815 100%)',
      boardBg: 'linear-gradient(135deg, #0d0815 0%, #050308 100%)',
      gridColor: 'rgba(255, 215, 0, 0.08)',
      decorations: [
        { type: 'star', positions: [[3,3], [18,3], [3,18], [18,18], [10,10], [11,11], [10,1], [11,20]] },
        { type: 'nebula', positions: [[5,5], [16,5], [5,16], [16,16]] }
      ]
    }
  };

  // Default config for safety
  const defaultConfig = {
    gridSize: 16,
    name: "Unknown Realm",
    background: 'linear-gradient(135deg, #1a2520 0%, #0d3320 50%, #1a2525 100%)',
    boardBg: 'linear-gradient(135deg, #1a2a20 0%, #0d1f15 100%)',
    gridColor: 'rgba(80, 200, 120, 0.1)',
    decorations: []
  };

  // Decoration emoji mapping
  const decorationEmojis = {
    lily: '🪷', reed: '🌾', cactus: '🌵', rock: '🪨',
    mushroom: '🍄', wisp: '✨', crystal: '💎', snowpile: '❄️',
    cloud: '☁️', scorch: '🔥', shadow: '👁️', eyes: '👀',
    mirror: '🪞', gem: '💠', boulder: '🗿', crack: '⚡',
    portal: '🌀', rift: '💫', star: '⭐', nebula: '🌌'
  };

  // Game state
  const [gameState, setGameState] = useState('menu');
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 10, type: 'normal' });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(BASE_SPEED);
  const [isPaused, setIsPaused] = useState(false);

  // RPG elements
  const [currentWave, setCurrentWave] = useState(1);
  const [foodEaten, setFoodEaten] = useState(0);
  const [waveTarget, setWaveTarget] = useState(5);
  const [powerUps, setPowerUps] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [isBossWave, setIsBossWave] = useState(false);

  // Gimmick state
  const [gimmickActive, setGimmickActive] = useState(false);
  const [gimmickData, setGimmickData] = useState({});

  // Visual effects
  const [particles, setParticles] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [flashColor, setFlashColor] = useState(null);

  // RPG Progression constants
  const XP_PER_LEVEL = 100; // Base XP needed per level
  const MAX_LEVEL = 50;

  // Unlockables by level
  const UNLOCKS = {
    3: { type: 'ability', id: 'dash', name: 'Dash Ability' },
    5: { type: 'powerup', id: 'shield', name: 'Shield Power-up' },
    10: { type: 'powerup', id: 'magnet', name: 'Magnet Power-up' },
    15: { type: 'powerup', id: 'double_points', name: 'Double Points Power-up' },
    20: { type: 'skin', id: 'golden', name: 'Golden Snake Skin' },
    30: { type: 'skin', id: 'neon', name: 'Neon Snake Skin' },
    40: { type: 'skin', id: 'fire', name: 'Fire Snake Skin' },
    50: { type: 'skin', id: 'cosmic', name: 'Cosmic Snake Skin' },
  };

  // Shop items
  const SHOP_ITEMS = {
    xp_boost: { name: 'XP Boost', desc: '+10% XP per level', icon: '📈', baseCost: 200, maxLevel: 5 },
    coin_boost: { name: 'Coin Boost', desc: '+15% coins per level', icon: '💰', baseCost: 200, maxLevel: 5 },
    dash_distance: { name: 'Dash Range', desc: '+1 dash distance', icon: '💨', baseCost: 300, maxLevel: 2, reqLevel: 3 },
    dash_cooldown: { name: 'Quick Dash', desc: '-1s dash cooldown', icon: '⏱️', baseCost: 400, maxLevel: 3, reqLevel: 3 },
    magnet_range: { name: 'Super Magnet', desc: '+1 magnet range', icon: '🧲', baseCost: 350, maxLevel: 2, reqLevel: 10 },
    magnet_duration: { name: 'Lasting Magnet', desc: '+2s magnet duration', icon: '⏰', baseCost: 300, maxLevel: 2, reqLevel: 10 },
    shield_charges: { name: 'Fortified Shield', desc: '+1 shield charge', icon: '🛡️', baseCost: 500, maxLevel: 2, reqLevel: 5 },
    starting_length: { name: 'Head Start', desc: '+1 starting length', icon: '📏', baseCost: 250, maxLevel: 3 },
    double_duration: { name: 'Extended Double', desc: '+3s double points', icon: '✨', baseCost: 350, maxLevel: 2, reqLevel: 15 },
  };

  // Achievements
  const ACHIEVEMENTS = {
    // Progression
    first_game: { name: 'First Steps', desc: 'Play your first game', icon: '👶', reward: 25 },
    level_5: { name: 'Getting Started', desc: 'Reach level 5', icon: '⭐', reward: 50 },
    level_10: { name: 'Rising Star', desc: 'Reach level 10', icon: '🌟', reward: 100 },
    level_25: { name: 'Veteran', desc: 'Reach level 25', icon: '💫', reward: 250 },
    level_50: { name: 'Master', desc: 'Reach max level', icon: '👑', reward: 500 },
    // Score
    score_500: { name: 'High Scorer', desc: 'Score 500 in one game', icon: '🎯', reward: 50 },
    score_1000: { name: 'Score Hunter', desc: 'Score 1000 in one game', icon: '🏆', reward: 100 },
    score_2500: { name: 'Score Legend', desc: 'Score 2500 in one game', icon: '🥇', reward: 200 },
    // Waves
    wave_5: { name: 'Survivor', desc: 'Reach wave 5', icon: '🌊', reward: 40 },
    wave_10: { name: 'Endurance', desc: 'Reach wave 10', icon: '💪', reward: 100 },
    wave_15: { name: 'Unstoppable', desc: 'Reach wave 15', icon: '🔥', reward: 200 },
    // Length
    length_20: { name: 'Long Boi', desc: 'Reach length 20', icon: '📏', reward: 50 },
    length_35: { name: 'Snek Lord', desc: 'Reach length 35', icon: '🐍', reward: 150 },
    // Enemies
    beat_slime: { name: 'Slime Slayer', desc: 'Beat Slime King', icon: '👑', reward: 30 },
    beat_3_enemies: { name: 'Monster Hunter', desc: 'Beat 3 different enemies', icon: '⚔️', reward: 75 },
    beat_5_enemies: { name: 'Champion', desc: 'Beat 5 different enemies', icon: '🏅', reward: 150 },
    beat_all: { name: 'Legendary', desc: 'Beat all 10 enemies', icon: '🌟', reward: 500 },
    // Cumulative
    food_100: { name: 'Hungry', desc: 'Eat 100 total food', icon: '🍎', reward: 30 },
    food_500: { name: 'Glutton', desc: 'Eat 500 total food', icon: '🍔', reward: 75 },
    food_1000: { name: 'Insatiable', desc: 'Eat 1000 total food', icon: '🍕', reward: 150 },
    games_10: { name: 'Regular', desc: 'Play 10 games', icon: '🎮', reward: 40 },
    games_50: { name: 'Dedicated', desc: 'Play 50 games', icon: '🕹️', reward: 100 },
    games_100: { name: 'Addict', desc: 'Play 100 games', icon: '💯', reward: 200 },
    // Special
    no_powerups: { name: 'Purist', desc: 'Reach wave 5 without power-ups', icon: '🧘', reward: 100 },
    dash_master: { name: 'Dash Master', desc: 'Use dash 50 times total', icon: '💨', reward: 75 },
    coins_1000: { name: 'Wealthy', desc: 'Accumulate 1000 coins', icon: '💰', reward: 100 },
  };

  // Stats tracking with RPG progression
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('snake_rpg_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old stats to new format
      return {
        totalScore: parsed.totalScore || 0,
        gamesPlayed: parsed.gamesPlayed || 0,
        enemiesDefeated: parsed.enemiesDefeated || {},
        highScores: parsed.highScores || {},
        // Enemy progression - stars earned per enemy (0-10, need 10 to unlock next)
        enemyStars: parsed.enemyStars || {},
        // New RPG stats
        xp: parsed.xp || 0,
        level: parsed.level || 1,
        totalXpEarned: parsed.totalXpEarned || 0,
        unlockedAbilities: parsed.unlockedAbilities || [],
        unlockedSkins: parsed.unlockedSkins || ['default'],
        selectedSkin: parsed.selectedSkin || 'default',
        coins: parsed.coins || 0,
        // Shop purchases
        shopPurchases: parsed.shopPurchases || {},
        // Achievements
        achievements: parsed.achievements || [],
        totalFood: parsed.totalFood || 0,
        totalDashes: parsed.totalDashes || 0,
        maxScore: parsed.maxScore || 0,
        maxWave: parsed.maxWave || 0,
        maxLength: parsed.maxLength || 0,
      };
    }
    return {
      totalScore: 0,
      gamesPlayed: 0,
      enemiesDefeated: {},
      highScores: {},
      // Enemy progression - stars earned per enemy (0-10, need 10 to unlock next)
      enemyStars: {},
      xp: 0,
      level: 1,
      totalXpEarned: 0,
      unlockedAbilities: [],
      unlockedSkins: ['default'],
      selectedSkin: 'default',
      coins: 0,
      shopPurchases: {},
      achievements: [],
      totalFood: 0,
      totalDashes: 0,
      maxScore: 0,
      maxWave: 0,
      maxLength: 0,
    };
  });

  // New achievements earned this game (for display)
  const [newAchievements, setNewAchievements] = useState([]);

  // Current game XP (awarded at end)
  const [gameXp, setGameXp] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [levelUps, setLevelUps] = useState([]);

  // Ability state
  const [dashCooldown, setDashCooldown] = useState(0);
  const [isDashing, setIsDashing] = useState(false);
  const DASH_COOLDOWN = 8000; // 8 seconds
  const DASH_DISTANCE = 3;

  // Active power-up state
  const [shieldCharges, setShieldCharges] = useState(0); // Number of shield hits remaining
  const hasShield = shieldCharges > 0; // For backwards compatibility
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasDoublePoints, setHasDoublePoints] = useState(false);

  // Mission system
  const MISSION_TYPES = {
    collect_food: {
      name: 'Collector',
      desc: (t) => `Eat ${t} food in one run`,
      icon: '🍎',
      targets: [10, 15, 20, 30],
      xpReward: [30, 50, 75, 100],
      coinReward: [15, 25, 40, 60],
    },
    collect_bonus: {
      name: 'Bonus Hunter',
      desc: (t) => `Eat ${t} bonus food (oranges)`,
      icon: '🍊',
      targets: [3, 5, 8],
      xpReward: [40, 60, 90],
      coinReward: [20, 35, 50],
    },
    collect_super: {
      name: 'Star Chaser',
      desc: (t) => `Collect ${t} stars`,
      icon: '⭐',
      targets: [2, 3, 5],
      xpReward: [50, 75, 120],
      coinReward: [25, 40, 65],
    },
    reach_wave: {
      name: 'Survivor',
      desc: (t) => `Reach wave ${t}`,
      icon: '🌊',
      targets: [3, 5, 7, 10],
      xpReward: [40, 70, 100, 150],
      coinReward: [20, 40, 60, 100],
    },
    reach_score: {
      name: 'High Scorer',
      desc: (t) => `Score ${t} points in one run`,
      icon: '🏆',
      targets: [200, 400, 600, 1000],
      xpReward: [35, 60, 90, 150],
      coinReward: [20, 35, 55, 100],
    },
    reach_length: {
      name: 'Long Snake',
      desc: (t) => `Grow to length ${t}`,
      icon: '📏',
      targets: [10, 15, 20, 30],
      xpReward: [30, 50, 80, 120],
      coinReward: [15, 30, 50, 80],
    },
    use_dash: {
      name: 'Dasher',
      desc: (t) => `Use dash ${t} times`,
      icon: '💨',
      targets: [3, 5, 10],
      xpReward: [25, 40, 70],
      coinReward: [15, 25, 45],
      requiresLevel: 3,
    },
    collect_powerups: {
      name: 'Power Player',
      desc: (t) => `Collect ${t} power-ups`,
      icon: '💎',
      targets: [3, 5, 8],
      xpReward: [35, 55, 85],
      coinReward: [20, 30, 50],
    },
    no_damage: {
      name: 'Untouchable',
      desc: (t) => `Complete ${t} waves without using shield`,
      icon: '🛡️',
      targets: [2, 3, 5],
      xpReward: [50, 80, 130],
      coinReward: [30, 50, 85],
    },
    beat_enemy: {
      name: 'Enemy Slayer',
      desc: (t, e) => `Beat ${e || 'any enemy'}`,
      icon: '⚔️',
      targets: [1],
      xpReward: [60],
      coinReward: [40],
      enemySpecific: true,
    },
  };

  // Mission state (persisted)
  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('snake_missions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if missions need refresh (daily reset)
      const lastRefresh = parsed.lastRefresh || 0;
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      if (now - lastRefresh > dayInMs) {
        return { active: [], completed: [], lastRefresh: now };
      }
      return parsed;
    }
    return { active: [], completed: [], lastRefresh: Date.now() };
  });

  // Current game mission progress
  const [missionProgress, setMissionProgress] = useState({});
  const [completedMissions, setCompletedMissions] = useState([]);
  const [dashesUsed, setDashesUsed] = useState(0);
  const [powerUpsCollected, setPowerUpsCollected] = useState(0);
  const [shieldUsed, setShieldUsed] = useState(false);
  const [wavesWithoutShield, setWavesWithoutShield] = useState(0);

  // Food type tracking for missions
  const [bonusFoodCount, setBonusFoodCount] = useState(0);
  const [superFoodCount, setSuperFoodCount] = useState(0);
  const [totalFoodCount, setTotalFoodCount] = useState(0);

  // Refs
  const gameLoopRef = useRef(null);
  const lastMoveRef = useRef(Date.now());
  const dashCooldownRef = useRef(null);

  // Snake skin colors
  const snakeSkins = {
    default: { head: 'linear-gradient(135deg, #70ee90, #50c878)', body: 'linear-gradient(135deg, #50c878, #3cb371)', glow: 'rgba(80, 200, 120, 0.5)' },
    golden: { head: 'linear-gradient(135deg, #ffd700, #daa520)', body: 'linear-gradient(135deg, #daa520, #b8860b)', glow: 'rgba(255, 215, 0, 0.5)' },
    neon: { head: 'linear-gradient(135deg, #00ffff, #ff00ff)', body: 'linear-gradient(135deg, #ff00ff, #00ffff)', glow: 'rgba(255, 0, 255, 0.5)' },
    fire: { head: 'linear-gradient(135deg, #ff4500, #ff8c00)', body: 'linear-gradient(135deg, #ff6347, #ff4500)', glow: 'rgba(255, 69, 0, 0.5)' },
    cosmic: { head: 'linear-gradient(135deg, #9400d3, #00bfff)', body: 'linear-gradient(135deg, #4b0082, #9400d3)', glow: 'rgba(148, 0, 211, 0.5)' },
  };

  // XP calculation helpers
  const getXpForLevel = (level) => Math.floor(XP_PER_LEVEL * Math.pow(1.1, level - 1));
  const getTotalXpForLevel = (level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXpForLevel(i);
    }
    return total;
  };

  // Check if ability is unlocked
  const hasAbility = (abilityId) => stats.unlockedAbilities.includes(abilityId) || stats.level >= Object.keys(UNLOCKS).find(lvl => UNLOCKS[lvl].id === abilityId);

  // Check if power-up is unlocked (for spawning)
  const isPowerUpUnlocked = (powerUpId) => {
    const unlockLevel = Object.keys(UNLOCKS).find(lvl => UNLOCKS[lvl].id === powerUpId);
    return unlockLevel ? stats.level >= parseInt(unlockLevel) : true;
  };

  // Get current skin
  const getCurrentSkin = () => snakeSkins[stats.selectedSkin] || snakeSkins.default;

  // Shop helper functions
  const getShopLevel = (itemId) => stats.shopPurchases[itemId] || 0;
  const getShopCost = (itemId) => {
    const item = SHOP_ITEMS[itemId];
    const currentLevel = getShopLevel(itemId);
    return Math.floor(item.baseCost * Math.pow(1.5, currentLevel));
  };
  const canBuyShopItem = (itemId) => {
    const item = SHOP_ITEMS[itemId];
    const currentLevel = getShopLevel(itemId);
    if (currentLevel >= item.maxLevel) return false;
    if (item.reqLevel && stats.level < item.reqLevel) return false;
    return stats.coins >= getShopCost(itemId);
  };
  const buyShopItem = (itemId) => {
    if (!canBuyShopItem(itemId)) return;
    const cost = getShopCost(itemId);
    setStats(s => ({
      ...s,
      coins: s.coins - cost,
      shopPurchases: { ...s.shopPurchases, [itemId]: (s.shopPurchases[itemId] || 0) + 1 }
    }));
  };

  // Enemy progression helpers - sequential unlocking
  const STARS_TO_UNLOCK = 10; // Stars needed to unlock next enemy
  const POINTS_PER_STAR = 50; // Score needed per star (500 total to fully complete an enemy)

  const getEnemyStars = (enemyId) => stats.enemyStars[enemyId] || 0;

  const isEnemyUnlocked = (enemyIndex) => {
    if (enemyIndex === 0) return true; // First enemy always unlocked
    const prevEnemy = enemyDefs[enemyIndex - 1];
    return getEnemyStars(prevEnemy.id) >= STARS_TO_UNLOCK;
  };

  const isEnemyComplete = (enemyId) => getEnemyStars(enemyId) >= STARS_TO_UNLOCK;

  // Check and award achievements
  const checkAchievements = useCallback((gameData, updatedStats) => {
    const earned = [];
    const has = (id) => updatedStats.achievements.includes(id);

    // Progression
    if (!has('first_game') && updatedStats.gamesPlayed >= 1) earned.push('first_game');
    if (!has('level_5') && updatedStats.level >= 5) earned.push('level_5');
    if (!has('level_10') && updatedStats.level >= 10) earned.push('level_10');
    if (!has('level_25') && updatedStats.level >= 25) earned.push('level_25');
    if (!has('level_50') && updatedStats.level >= 50) earned.push('level_50');

    // Score (this game)
    if (!has('score_500') && gameData.score >= 500) earned.push('score_500');
    if (!has('score_1000') && gameData.score >= 1000) earned.push('score_1000');
    if (!has('score_2500') && gameData.score >= 2500) earned.push('score_2500');

    // Waves (this game)
    if (!has('wave_5') && gameData.wave >= 5) earned.push('wave_5');
    if (!has('wave_10') && gameData.wave >= 10) earned.push('wave_10');
    if (!has('wave_15') && gameData.wave >= 15) earned.push('wave_15');

    // Length (this game)
    if (!has('length_20') && gameData.length >= 20) earned.push('length_20');
    if (!has('length_35') && gameData.length >= 35) earned.push('length_35');

    // Enemies
    const defeatedCount = Object.keys(updatedStats.enemiesDefeated).length;
    if (!has('beat_slime') && updatedStats.enemiesDefeated['slime_king']) earned.push('beat_slime');
    if (!has('beat_3_enemies') && defeatedCount >= 3) earned.push('beat_3_enemies');
    if (!has('beat_5_enemies') && defeatedCount >= 5) earned.push('beat_5_enemies');
    if (!has('beat_all') && defeatedCount >= 10) earned.push('beat_all');

    // Cumulative
    if (!has('food_100') && updatedStats.totalFood >= 100) earned.push('food_100');
    if (!has('food_500') && updatedStats.totalFood >= 500) earned.push('food_500');
    if (!has('food_1000') && updatedStats.totalFood >= 1000) earned.push('food_1000');
    if (!has('games_10') && updatedStats.gamesPlayed >= 10) earned.push('games_10');
    if (!has('games_50') && updatedStats.gamesPlayed >= 50) earned.push('games_50');
    if (!has('games_100') && updatedStats.gamesPlayed >= 100) earned.push('games_100');

    // Special
    if (!has('no_powerups') && gameData.wave >= 5 && gameData.powerUpCount === 0) earned.push('no_powerups');
    if (!has('dash_master') && updatedStats.totalDashes >= 50) earned.push('dash_master');
    if (!has('coins_1000') && updatedStats.coins >= 1000) earned.push('coins_1000');

    return earned;
  }, []);

  // Save missions to localStorage
  useEffect(() => {
    localStorage.setItem('snake_missions', JSON.stringify(missions));
  }, [missions]);

  // Generate new missions
  const generateMissions = useCallback(() => {
    const missionTypes = Object.keys(MISSION_TYPES);
    const newMissions = [];
    const usedTypes = new Set();

    while (newMissions.length < 3) {
      const typeKey = missionTypes[Math.floor(Math.random() * missionTypes.length)];
      if (usedTypes.has(typeKey)) continue;

      const mType = MISSION_TYPES[typeKey];

      // Skip if requires higher level
      if (mType.requiresLevel && stats.level < mType.requiresLevel) continue;

      // Pick a random difficulty
      const difficultyIndex = Math.min(
        Math.floor(Math.random() * mType.targets.length),
        Math.floor(stats.level / 10) // Higher levels get harder missions
      );

      const mission = {
        id: `${typeKey}_${Date.now()}_${newMissions.length}`,
        type: typeKey,
        target: mType.targets[difficultyIndex],
        xpReward: mType.xpReward[difficultyIndex],
        coinReward: mType.coinReward[difficultyIndex],
        progress: 0,
        completed: false,
      };

      // For enemy-specific missions, pick a random enemy
      if (mType.enemySpecific) {
        const enemies = ['slime_king', 'speedy_scorpion', 'phantom_fox', 'ice_wizard', 'thunder_tiger'];
        mission.enemyId = enemies[Math.floor(Math.random() * enemies.length)];
      }

      newMissions.push(mission);
      usedTypes.add(typeKey);
    }

    setMissions(m => ({ ...m, active: newMissions, lastRefresh: Date.now() }));
  }, [stats.level]);

  // Initialize missions if empty or refill if less than 3
  useEffect(() => {
    if (missions.active.length === 0) {
      generateMissions();
    } else if (missions.active.length < 3 && gameState === 'menu') {
      // Refill missions when back at menu
      const missionTypes = Object.keys(MISSION_TYPES);
      const existingTypes = new Set(missions.active.map(m => m.type));
      const newMissions = [...missions.active];

      while (newMissions.length < 3) {
        const typeKey = missionTypes[Math.floor(Math.random() * missionTypes.length)];
        if (existingTypes.has(typeKey)) continue;

        const mType = MISSION_TYPES[typeKey];
        if (mType.requiresLevel && stats.level < mType.requiresLevel) continue;

        const difficultyIndex = Math.min(
          Math.floor(Math.random() * mType.targets.length),
          Math.floor(stats.level / 10)
        );

        newMissions.push({
          id: `${typeKey}_${Date.now()}_${newMissions.length}`,
          type: typeKey,
          target: mType.targets[difficultyIndex],
          xpReward: mType.xpReward[difficultyIndex],
          coinReward: mType.coinReward[difficultyIndex],
          progress: 0,
          completed: false,
        });
        existingTypes.add(typeKey);
      }

      setMissions(m => ({ ...m, active: newMissions }));
    }
  }, [missions.active.length, generateMissions, gameState, stats.level]);

  // Get mission description
  const getMissionDesc = (mission) => {
    const mType = MISSION_TYPES[mission.type];
    if (!mType) return 'Unknown mission';
    if (mission.type === 'beat_enemy' && mission.enemyId) {
      const enemy = enemyDefs.find(e => e.id === mission.enemyId);
      return mType.desc(mission.target, enemy?.name || 'enemy');
    }
    return mType.desc(mission.target);
  };

  // Check mission progress
  const checkMissionProgress = useCallback((gameData) => {
    const { score: gameScore, wave, length, foodCount, bonusCount, superCount, dashCount, powerUpCount, shieldBroken, enemy } = gameData;

    const updates = {};
    const completed = [];

    missions.active.forEach(mission => {
      if (mission.completed) return;

      let progress = 0;
      let isComplete = false;

      switch (mission.type) {
        case 'collect_food':
          progress = foodCount;
          isComplete = foodCount >= mission.target;
          break;
        case 'collect_bonus':
          progress = bonusCount;
          isComplete = bonusCount >= mission.target;
          break;
        case 'collect_super':
          progress = superCount;
          isComplete = superCount >= mission.target;
          break;
        case 'reach_wave':
          progress = wave;
          isComplete = wave >= mission.target;
          break;
        case 'reach_score':
          progress = gameScore;
          isComplete = gameScore >= mission.target;
          break;
        case 'reach_length':
          progress = length;
          isComplete = length >= mission.target;
          break;
        case 'use_dash':
          progress = dashCount;
          isComplete = dashCount >= mission.target;
          break;
        case 'collect_powerups':
          progress = powerUpCount;
          isComplete = powerUpCount >= mission.target;
          break;
        case 'no_damage':
          progress = shieldBroken ? 0 : wave;
          isComplete = !shieldBroken && wave >= mission.target;
          break;
        case 'beat_enemy':
          // This is checked when defeating an enemy (not implemented yet)
          break;
      }

      updates[mission.id] = progress;
      if (isComplete && !mission.completed) {
        completed.push(mission);
      }
    });

    setMissionProgress(updates);
    return completed;
  }, [missions.active]);

  // Get current level config helper
  const getCurrentConfig = useCallback(() => {
    if (!selectedEnemy) return defaultConfig;
    return levelConfigs[selectedEnemy.id] || defaultConfig;
  }, [selectedEnemy]);

  // Get current grid size
  const getGridSize = useCallback(() => {
    return getCurrentConfig().gridSize;
  }, [getCurrentConfig]);

  // Enemy definitions with unique gimmicks
  const enemyDefs = [
    {
      id: 'slime_king',
      name: 'Slime King',
      title: 'The Gooey Starter',
      emoji: '👑',
      color: '#50c878',
      accentColor: '#70e898',
      speedMod: 1.0,
      gimmick: 'slime_trail',
      gimmickDesc: 'Leaves slime trails that slow you down',
      taunt: "Splish splash! Try to catch me!",
      winQuote: "Blobbed you good!",
      loseQuote: "I'm melting... MELTING!"
    },
    {
      id: 'speedy_scorpion',
      name: 'Speedy Scorpion',
      title: 'The Desert Dasher',
      emoji: '🦂',
      color: '#e8a840',
      accentColor: '#f8c860',
      speedMod: 0.8,
      gimmick: 'speed_zones',
      gimmickDesc: 'Creates speed boost and slow zones',
      taunt: "Can you keep up with my stinger?",
      winQuote: "Too fast for you!",
      loseQuote: "You... outran me?"
    },
    {
      id: 'phantom_fox',
      name: 'Phantom Fox',
      title: 'The Tricky Trickster',
      emoji: '🦊',
      color: '#c080a0',
      accentColor: '#e0a0c0',
      speedMod: 0.95,
      gimmick: 'fake_food',
      gimmickDesc: 'Spawns fake food that hurts you',
      taunt: "Which one is real? Hehe~",
      winQuote: "Fooled again!",
      loseQuote: "How did you see through my tricks?!"
    },
    {
      id: 'ice_wizard',
      name: 'Ice Wizard',
      title: 'The Frozen Scholar',
      emoji: '🧙',
      color: '#60a0e0',
      accentColor: '#80c0ff',
      speedMod: 0.9,
      gimmick: 'ice_walls',
      gimmickDesc: 'Creates temporary ice walls',
      taunt: "Let me show you the cold truth!",
      winQuote: "Ice cold victory!",
      loseQuote: "My ice... it thaws..."
    },
    {
      id: 'thunder_tiger',
      name: 'Thunder Tiger',
      title: 'The Storm Striker',
      emoji: '🐯',
      color: '#f4c542',
      accentColor: '#ffe066',
      speedMod: 0.85,
      gimmick: 'lightning_strikes',
      gimmickDesc: 'Random lightning strikes on the board',
      taunt: "Feel the thunder of my roar!",
      winQuote: "SHOCKING defeat!",
      loseQuote: "The storm... subsides..."
    },
    {
      id: 'shadow_serpent',
      name: 'Shadow Serpent',
      title: 'The Dark Slitherer',
      emoji: '🐍',
      color: '#6040a0',
      accentColor: '#8060c0',
      speedMod: 0.9,
      gimmick: 'darkness',
      gimmickDesc: 'Parts of the board go dark',
      taunt: "Embrace the shadows...",
      winQuote: "Lost in darkness forever!",
      loseQuote: "The light... it burns..."
    },
    {
      id: 'mirror_mantis',
      name: 'Mirror Mantis',
      title: 'The Reflecting Rogue',
      emoji: '🦗',
      color: '#80c0a0',
      accentColor: '#a0e0c0',
      speedMod: 0.85,
      gimmick: 'reverse_controls',
      gimmickDesc: 'Occasionally reverses your controls',
      taunt: "Left is right, up is down!",
      winQuote: "Backwards into defeat!",
      loseQuote: "My reflections... shattered!"
    },
    {
      id: 'gravity_gorilla',
      name: 'Gravity Gorilla',
      title: 'The Heavy Hitter',
      emoji: '🦍',
      color: '#808080',
      accentColor: '#a0a0a0',
      speedMod: 0.8,
      gimmick: 'gravity_wells',
      gimmickDesc: 'Creates gravity wells that pull you',
      taunt: "You can't escape my pull!",
      winQuote: "Crushed by gravity!",
      loseQuote: "Impossible weight..."
    },
    {
      id: 'chaos_chimera',
      name: 'Chaos Chimera',
      title: 'The Wild Card',
      emoji: '🐲',
      color: '#e05080',
      accentColor: '#ff70a0',
      speedMod: 0.75,
      gimmick: 'random_all',
      gimmickDesc: 'Uses random gimmicks from all enemies',
      taunt: "Expect the unexpected!",
      winQuote: "Chaos reigns supreme!",
      loseQuote: "Order... from chaos?!"
    },
    {
      id: 'eternal_wyrm',
      name: 'Eternal Wyrm',
      title: 'The Final Boss',
      emoji: '🌟',
      color: '#ffd700',
      accentColor: '#fff0a0',
      speedMod: 0.7,
      gimmick: 'boss_battle',
      gimmickDesc: 'Epic boss battle with all mechanics',
      taunt: "I have waited eons for this battle!",
      winQuote: "Eternity belongs to ME!",
      loseQuote: "A worthy champion... at last..."
    },
  ];

  // Food types
  const foodTypes = {
    normal: { emoji: '🍎', points: 10, color: '#ff6b6b', xp: 5 },
    bonus: { emoji: '🍊', points: 25, color: '#ffa500', xp: 12 },
    super: { emoji: '⭐', points: 50, color: '#ffd700', xp: 25 },
    power: { emoji: '💎', points: 30, color: '#00ffff', effect: 'invincible', xp: 15 },
    speed: { emoji: '⚡', points: 15, color: '#ffff00', effect: 'speed_boost', xp: 8 },
    shrink: { emoji: '🍃', points: 20, color: '#90ee90', effect: 'shrink', xp: 10 },
    boss: { emoji: '💀', points: 100, color: '#ff0000', damage: true, xp: 50 },
    // New power-ups (level-gated)
    shield: { emoji: '🛡️', points: 20, color: '#4169e1', effect: 'shield', xp: 15 },
    magnet: { emoji: '🧲', points: 15, color: '#ff69b4', effect: 'magnet', xp: 12 },
    double_points: { emoji: '✨', points: 10, color: '#daa520', effect: 'double_points', xp: 10 },
  };

  // Save stats
  useEffect(() => {
    localStorage.setItem('snake_rpg_stats', JSON.stringify(stats));
  }, [stats]);

  // Dash ability function
  const performDash = useCallback(() => {
    if (dashCooldown > 0 || !hasAbility('dash') || gameState !== 'playing' || isPaused) return;

    const gridSize = getGridSize();
    setIsDashing(true);
    setActiveEffects(e => [...e, 'invincible']);
    setDashesUsed(d => d + 1); // Track for missions

    // Move snake forward by DASH_DISTANCE tiles (+ shop upgrades)
    const dashDist = DASH_DISTANCE + getShopLevel('dash_distance');
    setSnake(currentSnake => {
      const head = currentSnake[0];
      const newSegments = [];

      for (let i = 1; i <= dashDist; i++) {
        const newX = (head.x + direction.x * i + gridSize) % gridSize;
        const newY = (head.y + direction.y * i + gridSize) % gridSize;
        newSegments.push({ x: newX, y: newY });
      }

      // Create dash trail particles
      newSegments.forEach((seg, idx) => {
        createParticles(seg.x, seg.y, '#00ffff', 4);
      });

      return [...newSegments.reverse(), ...currentSnake];
    });

    setFlashColor('#00ffff');
    setTimeout(() => {
      setFlashColor(null);
      setIsDashing(false);
      setActiveEffects(e => e.filter(ef => ef !== 'invincible'));
    }, 200);

    // Start cooldown (reduced by shop upgrade)
    const cooldownReduction = getShopLevel('dash_cooldown') * 1000; // -1s per level
    setDashCooldown(DASH_COOLDOWN - cooldownReduction);
  }, [dashCooldown, gameState, isPaused, direction, createParticles, getGridSize, stats.level, stats.shopPurchases]);

  // Dash cooldown timer
  useEffect(() => {
    if (dashCooldown <= 0) return;

    dashCooldownRef.current = setInterval(() => {
      setDashCooldown(cd => Math.max(0, cd - 100));
    }, 100);

    return () => clearInterval(dashCooldownRef.current);
  }, [dashCooldown > 0]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'menu' || gameState === 'select') return;

      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setIsPaused(p => !p);
        } else {
          setGameState('menu');
        }
        return;
      }

      if (gameState !== 'playing' || isPaused) return;

      // Dash with Space bar
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        performDash();
        return;
      }

      const isReversed = activeEffects.includes('reverse');
      let newDir = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDir = isReversed ? { x: 0, y: 1 } : { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDir = isReversed ? { x: 0, y: -1 } : { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDir = isReversed ? { x: 1, y: 0 } : { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDir = isReversed ? { x: -1, y: 0 } : { x: 1, y: 0 };
          break;
        default:
          return;
      }

      if (newDir && (newDir.x !== -direction.x || newDir.y !== -direction.y)) {
        setNextDirection(newDir);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, direction, isPaused, activeEffects, performDash]);

  // Spawn food
  const spawnFood = useCallback((currentSnake = snake) => {
    const gridSize = getGridSize();
    const occupied = new Set(currentSnake.map(s => `${s.x},${s.y}`));
    hazards.forEach(h => occupied.add(`${h.x},${h.y}`));

    let pos;
    let attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
      attempts++;
    } while (occupied.has(`${pos.x},${pos.y}`) && attempts < 100);

    // Determine food type
    let type = 'normal';
    const rand = Math.random();
    if (isBossWave) {
      type = 'boss';
    } else if (rand < 0.05) {
      type = 'super';
    } else if (rand < 0.12) {
      type = 'bonus';
    } else if (rand < 0.18) {
      type = 'power';
    } else if (rand < 0.24) {
      type = 'speed';
    } else if (rand < 0.30) {
      type = 'shrink';
    } else if (rand < 0.34 && isPowerUpUnlocked('shield')) {
      type = 'shield';
    } else if (rand < 0.38 && isPowerUpUnlocked('magnet')) {
      type = 'magnet';
    } else if (rand < 0.42 && isPowerUpUnlocked('double_points')) {
      type = 'double_points';
    }

    setFood({ ...pos, type });
  }, [snake, hazards, isBossWave, stats.level]);

  // Create particles
  const createParticles = useCallback((x, y, color, count = 8) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        life: 1,
      });
    }
    setParticles(p => [...p, ...newParticles]);
  }, []);

  // Update particles
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(p => p
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.3,
          life: particle.life - 0.05,
        }))
        .filter(particle => particle.life > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [particles.length]);

  // Apply gimmicks
  const applyGimmick = useCallback(() => {
    if (!selectedEnemy) return;

    const gimmick = selectedEnemy.gimmick;
    const gridSize = getGridSize();

    switch (gimmick) {
      case 'slime_trail':
        // Add slime where snake was
        if (snake.length > 3) {
          const slimePos = snake[snake.length - 1];
          if (Math.random() < 0.3) {
            setHazards(h => [...h.slice(-15), { x: slimePos.x, y: slimePos.y, type: 'slime', life: 50 }]);
          }
        }
        break;

      case 'speed_zones':
        if (Math.random() < 0.02) {
          const zoneType = Math.random() < 0.5 ? 'speed_up' : 'slow_down';
          setHazards(h => [...h.slice(-10), {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
            type: zoneType,
            life: 100
          }]);
        }
        break;

      case 'fake_food':
        if (Math.random() < 0.01 && powerUps.length < 3) {
          setPowerUps(p => [...p, {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
            type: 'fake',
            emoji: '🍎',
          }]);
        }
        break;

      case 'ice_walls':
        if (Math.random() < 0.015) {
          const wallX = Math.floor(Math.random() * gridSize);
          const wallY = Math.floor(Math.random() * gridSize);
          for (let i = 0; i < 3; i++) {
            const dir = Math.random() < 0.5;
            setHazards(h => [...h.slice(-20), {
              x: dir ? wallX + i : wallX,
              y: dir ? wallY : wallY + i,
              type: 'ice_wall',
              life: 80
            }]);
          }
        }
        break;

      case 'lightning_strikes':
        if (Math.random() < 0.02) {
          const strikeX = Math.floor(Math.random() * gridSize);
          const strikeY = Math.floor(Math.random() * gridSize);
          setHazards(h => [...h, { x: strikeX, y: strikeY, type: 'lightning_warning', life: 20 }]);
          setTimeout(() => {
            setHazards(h => h.map(hz =>
              hz.type === 'lightning_warning' && hz.x === strikeX && hz.y === strikeY
                ? { ...hz, type: 'lightning', life: 10 }
                : hz
            ));
            setFlashColor('#ffff00');
            setTimeout(() => setFlashColor(null), 100);
          }, 500);
        }
        break;

      case 'darkness':
        if (Math.random() < 0.01) {
          const darkSize = Math.min(5, Math.floor(gridSize / 4));
          setGimmickData(d => ({ ...d, darkZones: [
            ...(d.darkZones || []).slice(-5),
            { x: Math.floor(Math.random() * (gridSize - darkSize)), y: Math.floor(Math.random() * (gridSize - darkSize)), size: darkSize, life: 100 }
          ]}));
        }
        break;

      case 'reverse_controls':
        if (Math.random() < 0.005 && !activeEffects.includes('reverse')) {
          setActiveEffects(e => [...e, 'reverse']);
          setFlashColor('#8060c0');
          setTimeout(() => {
            setActiveEffects(e => e.filter(ef => ef !== 'reverse'));
            setFlashColor(null);
          }, 3000);
        }
        break;

      case 'gravity_wells':
        if (Math.random() < 0.01 && (gimmickData.gravityWells || []).length < 2) {
          setGimmickData(d => ({
            ...d,
            gravityWells: [...(d.gravityWells || []), {
              x: Math.floor(Math.random() * gridSize),
              y: Math.floor(Math.random() * gridSize),
              life: 150
            }]
          }));
        }
        break;

      case 'random_all':
        const allGimmicks = ['slime_trail', 'speed_zones', 'fake_food', 'ice_walls', 'lightning_strikes', 'darkness', 'reverse_controls', 'gravity_wells'];
        const randomGimmick = allGimmicks[Math.floor(Math.random() * allGimmicks.length)];
        const tempEnemy = { ...selectedEnemy, gimmick: randomGimmick };
        // Recursively apply a random gimmick
        break;

      case 'boss_battle':
        // Boss uses all mechanics at once but less frequently
        if (Math.random() < 0.005) {
          const bossGimmicks = ['ice_walls', 'lightning_strikes', 'speed_zones'];
          const chosen = bossGimmicks[Math.floor(Math.random() * bossGimmicks.length)];
          // Apply chosen gimmick
        }
        break;
    }
  }, [selectedEnemy, snake, activeEffects, powerUps, gimmickData]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const speed = gameSpeed * (activeEffects.includes('speed_boost') ? 0.7 : 1) *
                  (activeEffects.includes('slowed') ? 1.4 : 1);
    const gridSize = getGridSize();

    gameLoopRef.current = setInterval(() => {
      setDirection(nextDirection);

      setSnake(currentSnake => {
        const head = currentSnake[0];
        let newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y
        };

        // Apply gravity well pull
        if (gimmickData.gravityWells) {
          gimmickData.gravityWells.forEach(well => {
            const dx = well.x - newHead.x;
            const dy = well.y - newHead.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5 && dist > 0) {
              const pull = 0.3 / dist;
              newHead.x += Math.sign(dx) * (Math.random() < pull ? 1 : 0);
              newHead.y += Math.sign(dy) * (Math.random() < pull ? 1 : 0);
            }
          });
        }

        // Wall collision (wrap around)
        newHead.x = (newHead.x + gridSize) % gridSize;
        newHead.y = (newHead.y + gridSize) % gridSize;

        // Self collision
        if (currentSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          if (!activeEffects.includes('invincible')) {
            if (hasShield) {
              setShieldCharges(c => c - 1);
              setShieldUsed(true); // Track for missions
              createParticles(newHead.x, newHead.y, '#4169e1', 15);
              setFlashColor('#4169e1');
              setTimeout(() => setFlashColor(null), 200);
            } else {
              handleGameOver();
              return currentSnake;
            }
          }
        }

        // Hazard collision
        const hitHazard = hazards.find(h => h.x === newHead.x && h.y === newHead.y);
        if (hitHazard) {
          if (hitHazard.type === 'ice_wall' || hitHazard.type === 'lightning') {
            if (!activeEffects.includes('invincible')) {
              if (hasShield) {
                setShieldCharges(c => c - 1);
                setShieldUsed(true); // Track for missions
                createParticles(newHead.x, newHead.y, '#4169e1', 15);
                setFlashColor('#4169e1');
                setTimeout(() => setFlashColor(null), 200);
                // Remove the hazard that was blocked
                setHazards(h => h.filter(hz => !(hz.x === newHead.x && hz.y === newHead.y)));
              } else {
                handleGameOver();
                return currentSnake;
              }
            }
          } else if (hitHazard.type === 'slime') {
            setActiveEffects(e => [...e.filter(ef => ef !== 'slowed'), 'slowed']);
            setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'slowed')), 2000);
          } else if (hitHazard.type === 'speed_up') {
            setActiveEffects(e => [...e.filter(ef => ef !== 'speed_boost'), 'speed_boost']);
            setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'speed_boost')), 3000);
          } else if (hitHazard.type === 'slow_down') {
            setActiveEffects(e => [...e.filter(ef => ef !== 'slowed'), 'slowed']);
            setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'slowed')), 2000);
          }
        }

        // Fake food collision
        const hitFake = powerUps.find(p => p.x === newHead.x && p.y === newHead.y && p.type === 'fake');
        if (hitFake) {
          if (!activeEffects.includes('invincible')) {
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 200);
            createParticles(newHead.x, newHead.y, '#ff0000', 12);
            setPowerUps(p => p.filter(pu => pu !== hitFake));
            // Lose some length
            if (currentSnake.length > 3) {
              return currentSnake.slice(0, -2);
            }
          }
        }

        // Food collision (check with magnet range + shop upgrade)
        let newSnake;
        const baseMagnetRange = 3 + getShopLevel('magnet_range');
        const magnetRange = hasMagnet ? baseMagnetRange : 0;
        const distToFood = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
        const gotFood = distToFood === 0 || (hasMagnet && distToFood <= magnetRange);

        if (gotFood) {
          const foodData = foodTypes[food.type];
          const pointMultiplier = hasDoublePoints ? 2 : 1;
          setScore(s => s + foodData.points * pointMultiplier);
          setGameXp(xp => xp + (foodData.xp || 5) * pointMultiplier);
          createParticles(food.x, food.y, foodData.color, 10);

          // Track food types for missions
          setTotalFoodCount(c => c + 1);
          if (food.type === 'bonus') setBonusFoodCount(c => c + 1);
          if (food.type === 'super') setSuperFoodCount(c => c + 1);
          if (foodData.effect) setPowerUpsCollected(c => c + 1);

          // Apply food effects
          if (foodData.effect === 'invincible') {
            setActiveEffects(e => [...e, 'invincible']);
            setFlashColor('#00ffff');
            setTimeout(() => {
              setActiveEffects(e => e.filter(ef => ef !== 'invincible'));
              setFlashColor(null);
            }, 5000);
          } else if (foodData.effect === 'speed_boost') {
            setActiveEffects(e => [...e, 'speed_boost']);
            setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'speed_boost')), 4000);
          } else if (foodData.effect === 'shrink' && currentSnake.length > 5) {
            newSnake = [newHead, ...currentSnake.slice(0, -3)];
            setFoodEaten(f => f + 1);
            spawnFood(newSnake);
            return newSnake;
          } else if (foodData.effect === 'shield') {
            const shieldAmount = 1 + getShopLevel('shield_charges'); // +1 charge per shop level
            setShieldCharges(c => c + shieldAmount);
            setFlashColor('#4169e1');
            setTimeout(() => setFlashColor(null), 300);
          } else if (foodData.effect === 'magnet') {
            setHasMagnet(true);
            const magnetDur = 5000 + getShopLevel('magnet_duration') * 2000; // +2s per level
            setTimeout(() => setHasMagnet(false), magnetDur);
          } else if (foodData.effect === 'double_points') {
            setHasDoublePoints(true);
            const doubleDur = 8000 + getShopLevel('double_duration') * 3000; // +3s per level
            setTimeout(() => setHasDoublePoints(false), doubleDur);
          }

          if (food.type === 'boss') {
            setBossHealth(h => {
              const newHealth = h - 1;
              if (newHealth <= 0) {
                handleWaveComplete();
              }
              return Math.max(0, newHealth);
            });
          }

          setFoodEaten(f => {
            const newCount = f + 1;
            if (!isBossWave && newCount >= waveTarget) {
              handleWaveComplete();
            }
            return newCount;
          });

          newSnake = [newHead, ...currentSnake];
          spawnFood(newSnake);
        } else {
          newSnake = [newHead, ...currentSnake.slice(0, -1)];
        }

        return newSnake;
      });

      // Apply gimmicks
      applyGimmick();

      // Decay hazards
      setHazards(h => h.map(hz => ({ ...hz, life: hz.life - 1 })).filter(hz => hz.life > 0));

      // Decay gravity wells
      setGimmickData(d => ({
        ...d,
        gravityWells: (d.gravityWells || []).map(w => ({ ...w, life: w.life - 1 })).filter(w => w.life > 0),
        darkZones: (d.darkZones || []).map(z => ({ ...z, life: z.life - 1 })).filter(z => z.life > 0),
      }));

    }, speed);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, isPaused, gameSpeed, nextDirection, food, activeEffects, applyGimmick, spawnFood, hazards, gimmickData, isBossWave, waveTarget]);

  const handleWaveComplete = () => {
    setCurrentWave(w => w + 1);
    setFoodEaten(0);

    const nextWave = currentWave + 1;
    if (nextWave % 5 === 0) {
      // Boss wave
      setIsBossWave(true);
      const bossHp = 5 + Math.floor(nextWave / 5) * 2;
      setBossHealth(bossHp);
      setBossMaxHealth(bossHp);
      setWaveTarget(bossHp);
    } else {
      setIsBossWave(false);
      setWaveTarget(5 + nextWave);
    }

    // Speed up slightly each wave
    setGameSpeed(s => Math.max(60, s - 5));

    // Clear hazards between waves
    setHazards([]);
    setPowerUps([]);

    createParticles(10, 10, '#ffd700', 20);
    setFlashColor('#ffd700');
    setTimeout(() => setFlashColor(null), 300);
  };

  const handleGameOver = () => {
    setGameState('gameover');
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    if (score > highScore) {
      setHighScore(score);
    }

    // Check mission progress
    const gameData = {
      score,
      wave: currentWave,
      length: snake.length,
      foodCount: totalFoodCount,
      bonusCount: bonusFoodCount,
      superCount: superFoodCount,
      dashCount: dashesUsed,
      powerUpCount: powerUpsCollected,
      shieldBroken: shieldUsed,
      enemy: selectedEnemy?.id,
    };

    const completedMissionsThisGame = checkMissionProgress(gameData);
    setCompletedMissions(completedMissionsThisGame);

    // Calculate mission rewards
    let missionXpBonus = 0;
    let missionCoinBonus = 0;
    completedMissionsThisGame.forEach(mission => {
      missionXpBonus += mission.xpReward;
      missionCoinBonus += mission.coinReward;
    });

    // Mark missions as completed and generate new ones for completed
    if (completedMissionsThisGame.length > 0) {
      setMissions(m => {
        const remaining = m.active.filter(
          am => !completedMissionsThisGame.find(cm => cm.id === am.id)
        );
        const completed = [...m.completed, ...completedMissionsThisGame.map(cm => cm.id)];
        return { ...m, active: remaining, completed };
      });
    }

    // Calculate wave bonus XP with shop boost
    const waveBonus = currentWave * 20;
    const xpBoostMultiplier = 1 + (getShopLevel('xp_boost') * 0.1); // +10% per level
    const totalXpGained = Math.floor((gameXp + waveBonus + missionXpBonus) * xpBoostMultiplier);
    setXpGained(totalXpGained);

    // Calculate coins (based on score and wave + mission bonus) with shop boost
    const coinBoostMultiplier = 1 + (getShopLevel('coin_boost') * 0.15); // +15% per level
    const coinsEarned = Math.floor((Math.floor(score / 10) + currentWave * 5 + missionCoinBonus) * coinBoostMultiplier);

    // Update stats with XP and check for level ups
    setStats(s => {
      let newXp = s.xp + totalXpGained;
      let newLevel = s.level;
      const newLevelUps = [];
      const newUnlockedAbilities = [...s.unlockedAbilities];
      const newUnlockedSkins = [...s.unlockedSkins];

      // Check for level ups
      while (newLevel < MAX_LEVEL && newXp >= getXpForLevel(newLevel)) {
        newXp -= getXpForLevel(newLevel);
        newLevel++;
        newLevelUps.push(newLevel);

        // Check for unlocks at this level
        if (UNLOCKS[newLevel]) {
          const unlock = UNLOCKS[newLevel];
          if (unlock.type === 'ability' && !newUnlockedAbilities.includes(unlock.id)) {
            newUnlockedAbilities.push(unlock.id);
          } else if (unlock.type === 'skin' && !newUnlockedSkins.includes(unlock.id)) {
            newUnlockedSkins.push(unlock.id);
          }
        }
      }

      setLevelUps(newLevelUps);

      // Calculate enemy stars earned this game (1 star per 50 points, max 10)
      const currentEnemyStars = s.enemyStars[selectedEnemy?.id] || 0;
      const starsFromScore = Math.min(STARS_TO_UNLOCK, Math.floor(score / POINTS_PER_STAR));
      const newEnemyStars = Math.max(currentEnemyStars, starsFromScore);

      // Check if enemy was defeated (reached 10 stars)
      const wasDefeated = newEnemyStars >= STARS_TO_UNLOCK && currentEnemyStars < STARS_TO_UNLOCK;
      const newEnemiesDefeated = wasDefeated
        ? { ...s.enemiesDefeated, [selectedEnemy?.id]: true }
        : s.enemiesDefeated;

      // Build updated stats for achievement checking
      const updatedStats = {
        ...s,
        totalScore: s.totalScore + score,
        gamesPlayed: s.gamesPlayed + 1,
        highScores: {
          ...s.highScores,
          [selectedEnemy?.id]: Math.max(s.highScores[selectedEnemy?.id] || 0, score)
        },
        enemyStars: {
          ...s.enemyStars,
          [selectedEnemy?.id]: newEnemyStars
        },
        enemiesDefeated: newEnemiesDefeated,
        xp: newXp,
        level: newLevel,
        totalXpEarned: s.totalXpEarned + totalXpGained,
        unlockedAbilities: newUnlockedAbilities,
        unlockedSkins: newUnlockedSkins,
        coins: s.coins + coinsEarned,
        // Cumulative tracking
        totalFood: s.totalFood + totalFoodCount,
        totalDashes: s.totalDashes + dashesUsed,
        maxScore: Math.max(s.maxScore, score),
        maxWave: Math.max(s.maxWave, currentWave),
        maxLength: Math.max(s.maxLength, snake.length),
      };

      // Check for new achievements
      const earnedAchievements = checkAchievements(gameData, updatedStats);
      if (earnedAchievements.length > 0) {
        setNewAchievements(earnedAchievements);
        // Add achievement rewards
        let achievementBonus = 0;
        earnedAchievements.forEach(id => {
          achievementBonus += ACHIEVEMENTS[id].reward;
        });
        updatedStats.coins += achievementBonus;
        updatedStats.achievements = [...s.achievements, ...earnedAchievements];
      }

      return updatedStats;
    });
  };

  const startGame = (enemy) => {
    const config = levelConfigs[enemy.id] || defaultConfig;
    const gridSize = config.gridSize;
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);

    // Build starting snake with shop-upgraded length
    const startingLength = 1 + getShopLevel('starting_length');
    const startingSnake = [];
    for (let i = 0; i < startingLength; i++) {
      startingSnake.push({ x: startX - i, y: startY });
    }

    setSelectedEnemy(enemy);
    setSnake(startingSnake);
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setScore(0);
    setCurrentWave(1);
    setFoodEaten(0);
    setWaveTarget(5);
    setGameSpeed(Math.floor(BASE_SPEED * enemy.speedMod));
    setHazards([]);
    setPowerUps([]);
    setActiveEffects([]);
    setGimmickData({});
    setIsBossWave(false);
    setBossHealth(0);
    // Reset RPG state
    setGameXp(0);
    setXpGained(0);
    setLevelUps([]);
    setDashCooldown(0);
    setIsDashing(false);
    setShieldCharges(0);
    setHasMagnet(false);
    setHasDoublePoints(false);
    // Reset mission tracking
    setMissionProgress({});
    setCompletedMissions([]);
    setNewAchievements([]);
    setDashesUsed(0);
    setPowerUpsCollected(0);
    setShieldUsed(false);
    setWavesWithoutShield(0);
    setBonusFoodCount(0);
    setSuperFoodCount(0);
    setTotalFoodCount(0);

    // Need to set enemy first so getGridSize works, then spawn food after state update
    setTimeout(() => {
      setFood(prev => {
        const occupied = new Set([`${startX},${startY}`]);
        let pos;
        let attempts = 0;
        do {
          pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
          };
          attempts++;
        } while (occupied.has(`${pos.x},${pos.y}`) && attempts < 100);
        return { ...pos, type: 'normal' };
      });
    }, 0);

    setGameState('playing');
    setIsPaused(false);
  };

  // Render functions
  const renderMenu = () => {
    const xpForCurrentLevel = getXpForLevel(stats.level);
    const xpProgress = (stats.xp / xpForCurrentLevel) * 100;

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#fff',
      textAlign: 'center',
    }}>
      {/* Player Level & XP Bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '900',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
          }}>
            {stats.level}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffd700' }}>Level {stats.level}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{stats.xp} / {xpForCurrentLevel} XP</div>
          </div>
        </div>
        <div style={{
          width: '150px',
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${xpProgress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Coins */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '20px',
      }}>
        <span style={{ fontSize: '20px' }}>💰</span>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffd700' }}>{stats.coins}</span>
      </div>

      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'float 2s ease-in-out infinite',
      }}>🐍</div>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '900',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #50c878 0%, #90ee90 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>RPG SNAKE</h1>
      <p style={{ color: '#8fbc8f', marginBottom: '40px' }}>Defeat enemies, collect power-ups, survive!</p>

      <button
        onClick={() => setGameState('select')}
        style={{
          padding: '16px 48px',
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #50c878, #3cb371)',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(80, 200, 120, 0.4)',
        }}
        onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
        onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
      >
        SELECT ENEMY
      </button>

      <button
        onClick={() => setGameState('shop')}
        style={{
          marginTop: '12px',
          padding: '12px 36px',
          fontSize: '16px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
        }}
        onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
        onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
      >
        SHOP
      </button>

      <button
        onClick={() => setGameState('achievements')}
        style={{
          marginTop: '8px',
          padding: '10px 28px',
          fontSize: '14px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #9400d3, #4b0082)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 15px rgba(148, 0, 211, 0.3)',
        }}
        onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
        onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
      >
        ACHIEVEMENTS ({stats.achievements.length}/{Object.keys(ACHIEVEMENTS).length})
      </button>

      {/* Active Missions */}
      {missions.active.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          maxWidth: '350px',
          width: '100%',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffd700', marginBottom: '12px' }}>
            Daily Missions
          </div>
          {missions.active.slice(0, 3).map(mission => {
            const mType = MISSION_TYPES[mission.type];
            return (
              <div key={mission.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '20px' }}>{mType?.icon || '?'}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: '#fff' }}>{getMissionDesc(mission)}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    +{mission.xpReward} XP, +{mission.coinReward} coins
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unlocks preview */}
      {stats.level < 50 && (
        <div style={{ marginTop: '20px', color: '#666', fontSize: '12px' }}>
          {Object.keys(UNLOCKS).map(Number).filter(lvl => lvl > stats.level).slice(0, 2).map(lvl => (
            <div key={lvl} style={{ marginTop: '4px' }}>
              Level {lvl}: {UNLOCKS[lvl].name}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', color: '#6a8f6a', fontSize: '14px' }}>
        <p>Games Played: {stats.gamesPlayed} | Total Score: {stats.totalScore}</p>
      </div>

      <button
        onClick={() => window.location.href = 'menu.html'}
        style={{
          marginTop: '20px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#8fbc8f',
          cursor: 'pointer',
        }}
      >
        ← Back to Menu
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
  };

  const renderEnemySelect = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      color: '#fff',
      minHeight: '100vh',
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '8px',
        color: '#50c878',
      }}>Choose Your Challenge</h2>
      <p style={{ color: '#6a8f6a', marginBottom: '30px' }}>Each enemy has unique abilities</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        maxWidth: '900px',
        width: '100%',
      }}>
        {enemyDefs.map((enemy, idx) => {
          const bestScore = stats.highScores[enemy.id] || 0;
          const isUnlocked = isEnemyUnlocked(idx);
          const stars = getEnemyStars(enemy.id);
          const isComplete = isEnemyComplete(enemy.id);
          return (
            <div
              key={enemy.id}
              onClick={() => isUnlocked && startGame(enemy)}
              style={{
                background: !isUnlocked
                  ? 'rgba(40, 40, 40, 0.5)'
                  : isComplete
                    ? `linear-gradient(135deg, ${enemy.color}33, ${enemy.accentColor}22)`
                    : `linear-gradient(135deg, ${enemy.color}22, ${enemy.accentColor}11)`,
                border: `2px solid ${isUnlocked ? enemy.color : '#444'}44`,
                borderRadius: '12px',
                padding: '20px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: isUnlocked ? 1 : 0.5,
                position: 'relative',
              }}
              onMouseOver={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = enemy.color;
                  e.currentTarget.style.boxShadow = `0 8px 30px ${enemy.color}33`;
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${isUnlocked ? enemy.color : '#444'}44`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {!isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '18px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>🔒</div>
              )}
              {isComplete && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '12px',
                  background: `${enemy.color}40`,
                  color: enemy.color,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '700',
                }}>✓ MASTERED</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  fontSize: '40px',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isUnlocked ? `${enemy.color}33` : 'rgba(60,60,60,0.5)',
                  borderRadius: '12px',
                }}>{isUnlocked ? enemy.emoji : '🔒'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: isUnlocked ? enemy.color : '#666' }}>{enemy.name}</div>
                  <div style={{ fontSize: '12px', color: isUnlocked ? '#888' : '#555' }}>{enemy.title}</div>
                  <div style={{ fontSize: '11px', color: isUnlocked ? '#666' : '#444', marginTop: '4px' }}>{enemy.gimmickDesc}</div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
                    {levelConfigs[enemy.id]?.name || 'Unknown'} • {levelConfigs[enemy.id]?.gridSize || 16}x{levelConfigs[enemy.id]?.gridSize || 16} grid
                  </div>
                </div>
              </div>
              {/* Star progress bar */}
              {isUnlocked && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#888' }}>Progress:</span>
                    <span style={{ fontSize: '10px', color: enemy.color }}>
                      {'★'.repeat(stars)}{'☆'.repeat(STARS_TO_UNLOCK - stars)}
                    </span>
                  </div>
                  {bestScore > 0 && (
                    <div style={{ fontSize: '12px', color: '#ffd700' }}>
                      Best: {bestScore} pts
                    </div>
                  )}
                </div>
              )}
              {!isUnlocked && idx > 0 && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                  Defeat {enemyDefs[idx - 1].name} to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '30px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#8fbc8f',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  );

  const renderShop = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      color: '#fff',
      minHeight: '100vh',
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>Upgrade Shop</h2>
      <p style={{ color: '#888', marginBottom: '8px' }}>Spend coins on permanent upgrades</p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '20px',
        marginBottom: '24px',
      }}>
        <span style={{ fontSize: '24px' }}>💰</span>
        <span style={{ fontSize: '22px', fontWeight: '700', color: '#ffd700' }}>{stats.coins}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        maxWidth: '900px',
        width: '100%',
      }}>
        {Object.entries(SHOP_ITEMS).map(([itemId, item]) => {
          const currentLevel = getShopLevel(itemId);
          const maxed = currentLevel >= item.maxLevel;
          const cost = getShopCost(itemId);
          const canBuy = canBuyShopItem(itemId);
          const locked = item.reqLevel && stats.level < item.reqLevel;

          return (
            <div
              key={itemId}
              onClick={() => canBuy && buyShopItem(itemId)}
              style={{
                background: locked ? 'rgba(60,60,60,0.3)' : maxed ? 'rgba(80,200,120,0.15)' : 'rgba(255,215,0,0.08)',
                border: `2px solid ${locked ? '#444' : maxed ? '#50c878' : canBuy ? '#ffd700' : '#555'}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: canBuy ? 'pointer' : 'default',
                opacity: locked ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => canBuy && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '32px',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: maxed ? '#50c878' : '#fff' }}>
                    {item.name}
                    {locked && <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>Lv{item.reqLevel}+</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.desc}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Level: {currentLevel} / {item.maxLevel}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {maxed ? (
                    <div style={{ color: '#50c878', fontWeight: '700', fontSize: '14px' }}>MAX</div>
                  ) : locked ? (
                    <div style={{ color: '#666', fontSize: '12px' }}>Locked</div>
                  ) : (
                    <div style={{
                      padding: '6px 12px',
                      background: canBuy ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : 'rgba(100,100,100,0.3)',
                      borderRadius: '8px',
                      color: canBuy ? '#fff' : '#666',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}>
                      {cost} 💰
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '30px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#8fbc8f',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  );

  const renderAchievements = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      color: '#fff',
      minHeight: '100vh',
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #9400d3, #4b0082)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>Achievements</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        {stats.achievements.length} / {Object.keys(ACHIEVEMENTS).length} unlocked
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '10px',
        maxWidth: '850px',
        width: '100%',
      }}>
        {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
          const unlocked = stats.achievements.includes(id);
          return (
            <div
              key={id}
              style={{
                background: unlocked ? 'rgba(148, 0, 211, 0.15)' : 'rgba(60,60,60,0.3)',
                border: `2px solid ${unlocked ? '#9400d3' : '#444'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '28px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: unlocked ? 'rgba(148, 0, 211, 0.3)' : 'rgba(100,100,100,0.2)',
                  borderRadius: '8px',
                  filter: unlocked ? 'none' : 'grayscale(100%)',
                }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: unlocked ? '#d8b4fe' : '#888' }}>
                    {ach.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{ach.desc}</div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  background: unlocked ? '#9400d333' : 'rgba(100,100,100,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: unlocked ? '#d8b4fe' : '#666',
                  fontWeight: '600',
                }}>
                  {unlocked ? '✓' : `+${ach.reward}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '30px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#8fbc8f',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  );

  const renderGame = () => {
    const config = getCurrentConfig();
    const gridSize = config.gridSize;
    const boardSize = gridSize * CELL_SIZE;

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      transform: screenShake ? `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)` : 'none',
    }}>
      {/* Level name banner */}
      <div style={{
        marginBottom: '8px',
        padding: '4px 16px',
        background: `${selectedEnemy?.color}22`,
        border: `1px solid ${selectedEnemy?.color}44`,
        borderRadius: '20px',
        color: selectedEnemy?.color,
        fontSize: '12px',
        fontWeight: '600',
      }}>
        {config.name}
      </div>

      {/* HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: boardSize,
        marginBottom: '16px',
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '12px',
        color: '#fff',
      }}>
        <div>
          <span style={{ fontSize: '14px', color: '#888' }}>Score</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#50c878' }}>{score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#888' }}>Wave {currentWave}</span>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            {isBossWave ? (
              <div style={{ color: '#ff6b6b' }}>
                BOSS: {bossHealth}/{bossMaxHealth}
              </div>
            ) : (
              <>{foodEaten}/{waveTarget}</>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{selectedEnemy?.emoji}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: selectedEnemy?.color }}>{selectedEnemy?.name}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{selectedEnemy?.gimmickDesc}</div>
          </div>
        </div>
      </div>

      {/* Abilities bar */}
      {stats.level >= 3 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '8px',
        }}>
          {/* Dash ability */}
          <div style={{
            position: 'relative',
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            background: dashCooldown > 0 ? 'rgba(100,100,100,0.5)' : 'rgba(0,255,255,0.3)',
            border: dashCooldown > 0 ? '2px solid #555' : '2px solid #00ffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: dashCooldown > 0 ? 'not-allowed' : 'pointer',
          }} onClick={performDash}>
            <span style={{ fontSize: '24px', opacity: dashCooldown > 0 ? 0.5 : 1 }}>💨</span>
            {dashCooldown > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: '#888',
                background: 'rgba(0,0,0,0.7)',
                padding: '1px 4px',
                borderRadius: '4px',
              }}>
                {Math.ceil(dashCooldown / 1000)}s
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: '-18px',
              fontSize: '9px',
              color: '#666',
            }}>
              SPACE
            </div>
          </div>
        </div>
      )}

      {/* Active effects */}
      {(activeEffects.length > 0 || hasShield || hasMagnet || hasDoublePoints) && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {hasShield && (
            <div style={{ padding: '4px 12px', background: '#4169e133', borderRadius: '20px', color: '#4169e1', fontSize: '12px' }}>
              🛡️ SHIELD{shieldCharges > 1 ? ` x${shieldCharges}` : ''}
            </div>
          )}
          {hasMagnet && (
            <div style={{ padding: '4px 12px', background: '#ff69b433', borderRadius: '20px', color: '#ff69b4', fontSize: '12px' }}>
              🧲 MAGNET
            </div>
          )}
          {hasDoublePoints && (
            <div style={{ padding: '4px 12px', background: '#daa52033', borderRadius: '20px', color: '#daa520', fontSize: '12px' }}>
              ✨ 2X POINTS
            </div>
          )}
          {activeEffects.includes('invincible') && !isDashing && (
            <div style={{ padding: '4px 12px', background: '#00ffff33', borderRadius: '20px', color: '#00ffff', fontSize: '12px' }}>
              💎 INVINCIBLE
            </div>
          )}
          {activeEffects.includes('speed_boost') && (
            <div style={{ padding: '4px 12px', background: '#ffff0033', borderRadius: '20px', color: '#ffff00', fontSize: '12px' }}>
              ⚡ SPEED BOOST
            </div>
          )}
          {activeEffects.includes('slowed') && (
            <div style={{ padding: '4px 12px', background: '#8080ff33', borderRadius: '20px', color: '#8080ff', fontSize: '12px' }}>
              🐌 SLOWED
            </div>
          )}
          {activeEffects.includes('reverse') && (
            <div style={{ padding: '4px 12px', background: '#ff00ff33', borderRadius: '20px', color: '#ff00ff', fontSize: '12px' }}>
              🔄 REVERSED
            </div>
          )}
        </div>
      )}

      {/* Game board */}
      <div style={{
        position: 'relative',
        width: boardSize,
        height: boardSize,
        background: config.boardBg,
        borderRadius: '8px',
        border: `3px solid ${selectedEnemy?.color}44`,
        overflow: 'hidden',
      }}>
        {/* Flash overlay */}
        {flashColor && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: flashColor,
            opacity: 0.3,
            pointerEvents: 'none',
            zIndex: 100,
          }} />
        )}

        {/* Grid lines */}
        {Array.from({ length: gridSize }).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute',
              left: i * CELL_SIZE,
              top: 0,
              width: '1px',
              height: '100%',
              background: config.gridColor,
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              top: i * CELL_SIZE,
              width: '100%',
              height: '1px',
              background: config.gridColor,
            }} />
          </React.Fragment>
        ))}

        {/* Level decorations */}
        {config.decorations.map((decor, idx) =>
          decor.positions.map(([x, y], posIdx) => (
            <div
              key={`decor-${idx}-${posIdx}`}
              style={{
                position: 'absolute',
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                opacity: 0.4,
                pointerEvents: 'none',
              }}
            >
              {decorationEmojis[decor.type] || ''}
            </div>
          ))
        )}

        {/* Dark zones */}
        {(gimmickData.darkZones || []).map((zone, idx) => (
          <div
            key={`dark-${idx}`}
            style={{
              position: 'absolute',
              left: zone.x * CELL_SIZE,
              top: zone.y * CELL_SIZE,
              width: zone.size * CELL_SIZE,
              height: zone.size * CELL_SIZE,
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Hazards */}
        {hazards.map((hazard, idx) => (
          <div
            key={`hazard-${idx}`}
            style={{
              position: 'absolute',
              left: hazard.x * CELL_SIZE + 2,
              top: hazard.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              borderRadius: hazard.type === 'ice_wall' ? '4px' : '50%',
              background:
                hazard.type === 'slime' ? 'rgba(100, 200, 100, 0.5)' :
                hazard.type === 'ice_wall' ? 'rgba(150, 200, 255, 0.8)' :
                hazard.type === 'lightning_warning' ? 'rgba(255, 255, 0, 0.3)' :
                hazard.type === 'lightning' ? 'rgba(255, 255, 0, 1)' :
                hazard.type === 'speed_up' ? 'rgba(0, 255, 255, 0.4)' :
                hazard.type === 'slow_down' ? 'rgba(128, 0, 128, 0.4)' :
                'rgba(255, 0, 0, 0.5)',
              boxShadow: hazard.type === 'lightning' ? '0 0 20px #ffff00' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            {hazard.type === 'slime' && '💧'}
            {hazard.type === 'ice_wall' && '🧊'}
            {hazard.type === 'lightning_warning' && '⚠️'}
            {hazard.type === 'lightning' && '⚡'}
            {hazard.type === 'speed_up' && '💨'}
            {hazard.type === 'slow_down' && '🐌'}
          </div>
        ))}

        {/* Gravity wells */}
        {(gimmickData.gravityWells || []).map((well, idx) => (
          <div
            key={`grav-${idx}`}
            style={{
              position: 'absolute',
              left: well.x * CELL_SIZE - CELL_SIZE * 2,
              top: well.y * CELL_SIZE - CELL_SIZE * 2,
              width: CELL_SIZE * 5,
              height: CELL_SIZE * 5,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(128,0,255,0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        ))}

        {/* Fake food */}
        {powerUps.map((pu, idx) => (
          <div
            key={`pu-${idx}`}
            style={{
              position: 'absolute',
              left: pu.x * CELL_SIZE,
              top: pu.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            {pu.emoji}
          </div>
        ))}

        {/* Food */}
        <div style={{
          position: 'absolute',
          left: food.x * CELL_SIZE,
          top: food.y * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          animation: 'foodPulse 0.5s ease-in-out infinite',
        }}>
          {foodTypes[food.type].emoji}
        </div>

        {/* Snake */}
        {snake.map((segment, idx) => {
          const isHead = idx === 0;
          const prevSeg = snake[idx - 1];
          const nextSeg = snake[idx + 1];

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background: isHead
                  ? `linear-gradient(135deg, #70ee90, #50c878)`
                  : `linear-gradient(135deg, ${activeEffects.includes('invincible') ? '#00ffff' : '#50c878'}, ${activeEffects.includes('invincible') ? '#0088ff' : '#3cb371'})`,
                borderRadius: isHead ? '8px' : '4px',
                boxShadow: isHead
                  ? '0 0 10px rgba(80, 200, 120, 0.5)'
                  : activeEffects.includes('invincible')
                    ? '0 0 8px rgba(0, 255, 255, 0.5)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isHead ? `rotate(${
                  direction.x === 1 ? 0 :
                  direction.x === -1 ? 180 :
                  direction.y === 1 ? 90 :
                  -90
                }deg)` : 'none',
              }}
            >
              {isHead && (
                <span style={{ fontSize: '14px', transform: 'scaleX(-1)' }}>👀</span>
              )}
            </div>
          );
        })}

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: p.color,
              opacity: p.life,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Pause overlay */}
        {isPaused && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>PAUSED</div>
            <button
              onClick={() => setIsPaused(false)}
              style={{
                padding: '12px 32px',
                background: '#50c878',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              Resume
            </button>
            <button
              onClick={() => setGameState('menu')}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid #666',
                borderRadius: '8px',
                color: '#888',
                cursor: 'pointer',
              }}
            >
              Quit to Menu
            </button>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div style={{
        marginTop: '16px',
        color: '#5a7a5a',
        fontSize: '12px',
      }}>
        Arrow keys or WASD to move {stats.level >= 3 && '• SPACE to dash'} • ESC to pause
      </div>

      <style>{`
        @keyframes foodPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
  };

  const renderGameOver = () => {
    const xpForCurrentLevel = getXpForLevel(stats.level);
    const xpProgress = (stats.xp / xpForCurrentLevel) * 100;

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#fff',
      textAlign: 'center',
      overflow: 'auto',
      padding: '20px',
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>💀</div>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '800',
        color: '#ff6b6b',
        marginBottom: '8px',
      }}>GAME OVER</h2>

      <div style={{
        fontSize: '48px',
        marginBottom: '10px',
      }}>{selectedEnemy?.emoji}</div>
      <p style={{ color: '#888', marginBottom: '20px', fontStyle: 'italic' }}>
        "{selectedEnemy?.winQuote}"
      </p>

      {/* Score and stats */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '20px 40px',
        borderRadius: '12px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '14px', color: '#888' }}>Final Score</div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#50c878' }}>{score}</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          Wave {currentWave} • Length {snake.length}
        </div>
        {score > (stats.highScores[selectedEnemy?.id] || 0) && (
          <div style={{ color: '#ffd700', marginTop: '10px', fontWeight: '700' }}>
            ⭐ NEW BEST SCORE!
          </div>
        )}
      </div>

      {/* XP Rewards */}
      <div style={{
        background: 'rgba(255,215,0,0.1)',
        border: '1px solid rgba(255,215,0,0.3)',
        padding: '16px 30px',
        borderRadius: '12px',
        marginBottom: '16px',
        minWidth: '200px',
      }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>XP EARNED</div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffd700' }}>+{xpGained} XP</div>

        {/* Level progress bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
            <span>Level {stats.level}</span>
            <span>{stats.xp} / {xpForCurrentLevel}</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${xpProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Level up notification */}
        {levelUps.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(255,215,0,0.2)',
            borderRadius: '8px',
          }}>
            <div style={{ color: '#ffd700', fontWeight: '700', fontSize: '16px' }}>
              🎉 LEVEL UP!
            </div>
            {levelUps.map(lvl => (
              <div key={lvl} style={{ fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                Level {lvl}
                {UNLOCKS[lvl] && (
                  <span style={{ color: '#00ffff', marginLeft: '8px' }}>
                    Unlocked: {UNLOCKS[lvl].name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div style={{
          background: 'rgba(80, 200, 120, 0.1)',
          border: '1px solid rgba(80, 200, 120, 0.3)',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '16px',
          minWidth: '200px',
        }}>
          <div style={{ fontSize: '12px', color: '#50c878', fontWeight: '700', marginBottom: '8px' }}>
            MISSIONS COMPLETED!
          </div>
          {completedMissions.map(mission => {
            const mType = MISSION_TYPES[mission.type];
            return (
              <div key={mission.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                marginBottom: '4px',
              }}>
                <span style={{ fontSize: '16px' }}>{mType?.icon || '?'}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: '#fff' }}>{getMissionDesc(mission)}</div>
                  <div style={{ fontSize: '10px', color: '#50c878' }}>
                    +{mission.xpReward} XP, +{mission.coinReward} coins
                  </div>
                </div>
                <span style={{ fontSize: '14px', color: '#50c878' }}>✓</span>
              </div>
            );
          })}
        </div>
      )}

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div style={{
          background: 'rgba(148, 0, 211, 0.15)',
          border: '1px solid rgba(148, 0, 211, 0.4)',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '16px',
          minWidth: '200px',
        }}>
          <div style={{ fontSize: '12px', color: '#d8b4fe', fontWeight: '700', marginBottom: '8px' }}>
            ACHIEVEMENTS UNLOCKED!
          </div>
          {newAchievements.map(id => {
            const ach = ACHIEVEMENTS[id];
            return (
              <div key={id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px',
                background: 'rgba(148, 0, 211, 0.2)',
                borderRadius: '6px',
                marginBottom: '4px',
              }}>
                <span style={{ fontSize: '20px' }}>{ach.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{ach.name}</div>
                  <div style={{ fontSize: '10px', color: '#d8b4fe' }}>+{ach.reward} coins</div>
                </div>
                <span style={{ fontSize: '14px', color: '#d8b4fe' }}>✓</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => startGame(selectedEnemy)}
          style={{
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #50c878, #3cb371)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => setGameState('select')}
          style={{
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '700',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Change Enemy
        </button>
      </div>

      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '20px',
          padding: '10px 24px',
          background: 'transparent',
          border: '1px solid #444',
          borderRadius: '8px',
          color: '#666',
          cursor: 'pointer',
        }}
      >
        Main Menu
      </button>
    </div>
  );
  };

  // Get background based on current state
  const getBackgroundStyle = () => {
    if (gameState === 'playing' || gameState === 'gameover') {
      const config = getCurrentConfig();
      return config.background;
    }
    return 'linear-gradient(135deg, #1a2520 0%, #0d3320 50%, #1a2525 100%)';
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: getBackgroundStyle(),
      transition: 'background 0.5s ease',
    }}>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'select' && renderEnemySelect()}
      {gameState === 'shop' && renderShop()}
      {gameState === 'achievements' && renderAchievements()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.SnakeGame = SnakeGame;
