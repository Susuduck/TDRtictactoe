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
        // New RPG stats
        xp: parsed.xp || 0,
        level: parsed.level || 1,
        totalXpEarned: parsed.totalXpEarned || 0,
        unlockedAbilities: parsed.unlockedAbilities || [],
        unlockedSkins: parsed.unlockedSkins || ['default'],
        selectedSkin: parsed.selectedSkin || 'default',
        coins: parsed.coins || 0,
      };
    }
    return {
      totalScore: 0,
      gamesPlayed: 0,
      enemiesDefeated: {},
      highScores: {},
      xp: 0,
      level: 1,
      totalXpEarned: 0,
      unlockedAbilities: [],
      unlockedSkins: ['default'],
      selectedSkin: 'default',
      coins: 0,
    };
  });

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
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [hasDoublePoints, setHasDoublePoints] = useState(false);

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

    // Move snake forward by DASH_DISTANCE tiles
    setSnake(currentSnake => {
      const head = currentSnake[0];
      const newSegments = [];

      for (let i = 1; i <= DASH_DISTANCE; i++) {
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

    // Start cooldown
    setDashCooldown(DASH_COOLDOWN);
  }, [dashCooldown, gameState, isPaused, direction, createParticles, getGridSize, stats.level]);

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
              setHasShield(false);
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
                setHasShield(false);
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

        // Food collision (check with magnet range)
        let newSnake;
        const magnetRange = hasMagnet ? 3 : 0;
        const distToFood = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
        const gotFood = distToFood === 0 || (hasMagnet && distToFood <= magnetRange);

        if (gotFood) {
          const foodData = foodTypes[food.type];
          const pointMultiplier = hasDoublePoints ? 2 : 1;
          setScore(s => s + foodData.points * pointMultiplier);
          setGameXp(xp => xp + (foodData.xp || 5) * pointMultiplier);
          createParticles(food.x, food.y, foodData.color, 10);

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
            setHasShield(true);
            setFlashColor('#4169e1');
            setTimeout(() => setFlashColor(null), 300);
          } else if (foodData.effect === 'magnet') {
            setHasMagnet(true);
            setTimeout(() => setHasMagnet(false), 5000);
          } else if (foodData.effect === 'double_points') {
            setHasDoublePoints(true);
            setTimeout(() => setHasDoublePoints(false), 8000);
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

    // Calculate wave bonus XP
    const waveBonus = currentWave * 20;
    const totalXpGained = gameXp + waveBonus;
    setXpGained(totalXpGained);

    // Calculate coins (based on score and wave)
    const coinsEarned = Math.floor(score / 10) + currentWave * 5;

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

      return {
        ...s,
        totalScore: s.totalScore + score,
        gamesPlayed: s.gamesPlayed + 1,
        highScores: {
          ...s.highScores,
          [selectedEnemy?.id]: Math.max(s.highScores[selectedEnemy?.id] || 0, score)
        },
        xp: newXp,
        level: newLevel,
        totalXpEarned: s.totalXpEarned + totalXpGained,
        unlockedAbilities: newUnlockedAbilities,
        unlockedSkins: newUnlockedSkins,
        coins: s.coins + coinsEarned,
      };
    });
  };

  const startGame = (enemy) => {
    const config = levelConfigs[enemy.id] || defaultConfig;
    const gridSize = config.gridSize;
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);

    setSelectedEnemy(enemy);
    setSnake([{ x: startX, y: startY }]);
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
    setHasShield(false);
    setHasMagnet(false);
    setHasDoublePoints(false);

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
          return (
            <div
              key={enemy.id}
              onClick={() => startGame(enemy)}
              style={{
                background: `linear-gradient(135deg, ${enemy.color}22, ${enemy.accentColor}11)`,
                border: `2px solid ${enemy.color}44`,
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = enemy.color;
                e.currentTarget.style.boxShadow = `0 8px 30px ${enemy.color}33`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${enemy.color}44`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  fontSize: '40px',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${enemy.color}33`,
                  borderRadius: '12px',
                }}>{enemy.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: enemy.color }}>{enemy.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{enemy.title}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{enemy.gimmickDesc}</div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '4px' }}>
                    {levelConfigs[enemy.id]?.name || 'Unknown'} • {levelConfigs[enemy.id]?.gridSize || 16}x{levelConfigs[enemy.id]?.gridSize || 16} grid
                  </div>
                </div>
              </div>
              {bestScore > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#ffd700' }}>
                  Best: {bestScore} pts
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
              🛡️ SHIELD
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
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.SnakeGame = SnakeGame;
