const { useState, useEffect, useCallback, useRef } = React;

const BreakoutGame = () => {
  // Game constants
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 500;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 12;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 6;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 54;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 4;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 27;
  const DASH_SPEED = 25;
  const DASH_COOLDOWN = 800;
  const TEDDY_METER_MAX = 100;

  // Game state
  const [gameState, setGameState] = useState('menu');
  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, vx: 0 });
  const [balls, setBalls] = useState([]);
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Power-ups
  const [powerUps, setPowerUps] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);

  // Gimmick state
  const [gimmickData, setGimmickData] = useState({});

  // Visual effects
  const [particles, setParticles] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);

  // === NEW: Teddyball Player Mechanics ===
  // Dash system
  const [dashCooldown, setDashCooldown] = useState(0);
  const [isDashing, setIsDashing] = useState(false);
  const [lastTapLeft, setLastTapLeft] = useState(0);
  const [lastTapRight, setLastTapRight] = useState(0);

  // Charge shot system
  const [chargeLevel, setChargeLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  // Teddy Meter system
  const [teddyMeter, setTeddyMeter] = useState(0);
  const [teddyAbilityActive, setTeddyAbilityActive] = useState(null);

  // Twin paddle for Teddy Twins ability
  const [twinPaddle, setTwinPaddle] = useState(null);

  // Stats with unlocks and upgrades
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('teddyball_stats');
    if (saved) return JSON.parse(saved);
    return {
      totalScore: 0,
      gamesPlayed: 0,
      levelsCompleted: 0,
      highScores: {},
      stars: 0,
      unlockedPowerUps: ['expand', 'multi', 'slow', 'life'], // Starting power-ups
      upgrades: {
        paddleSize: 0,      // +10px per level (max 3)
        extraLife: 0,       // +1 starting life per level (max 2)
        magnetCatch: false, // Always have catch ability
        comboMaster: 0,     // +0.5s combo timer per level (max 3)
        luckyDrops: 0,      // +5% power-up chance per level (max 3)
        teddyPower: 0,      // +10% meter gain per level (max 3)
      }
    };
  });

  // All unlockable power-ups with costs
  const powerUpUnlocks = {
    expand: { cost: 0, name: 'Expand', emoji: '📏', desc: 'Wider paddle' },
    multi: { cost: 0, name: 'Multi-Ball', emoji: '✨', desc: 'Split into 3 balls' },
    slow: { cost: 0, name: 'Slow', emoji: '🐌', desc: 'Slow ball speed' },
    life: { cost: 0, name: 'Extra Life', emoji: '❤️', desc: '+1 life' },
    shield: { cost: 15, name: 'Shield', emoji: '🛡️', desc: 'Bottom protection' },
    laser: { cost: 25, name: 'Laser', emoji: '🔫', desc: 'Shoot bricks!' },
    magnet: { cost: 35, name: 'Magnet', emoji: '🧲', desc: 'Catch the ball' },
    mega: { cost: 50, name: 'Mega Ball', emoji: '💫', desc: 'Smash through bricks' },
    warp: { cost: 75, name: 'Warp Gate', emoji: '🌀', desc: 'Skip to next level' },
  };

  // Permanent upgrades shop
  const upgradeShop = {
    paddleSize: { maxLevel: 3, costPerLevel: [15, 30, 50], name: 'Paddle Size', desc: '+10px starting width' },
    extraLife: { maxLevel: 2, costPerLevel: [30, 60], name: 'Extra Life', desc: '+1 starting life' },
    magnetCatch: { maxLevel: 1, costPerLevel: [100], name: 'Magnet Catch', desc: 'Always catch balls' },
    comboMaster: { maxLevel: 3, costPerLevel: [20, 40, 60], name: 'Combo Master', desc: '+0.5s combo window' },
    luckyDrops: { maxLevel: 3, costPerLevel: [25, 50, 75], name: 'Lucky Drops', desc: '+5% drop chance' },
    teddyPower: { maxLevel: 3, costPerLevel: [20, 40, 60], name: 'Teddy Power', desc: '+10% meter gain' },
  };

  // Character-specific rare power-ups
  const characterRares = {
    brick_goblin: { id: 'regen_shield', emoji: '🔄', name: 'Regen Shield', desc: 'Bricks you break stay broken', color: '#e85a50' },
    magnet_mage: { id: 'super_magnet', emoji: '🧲', name: 'Super Magnet', desc: 'Pull all power-ups to paddle', color: '#4080e0' },
    wind_witch: { id: 'wind_rider', emoji: '🌪️', name: 'Wind Rider', desc: 'Control ball with arrow keys', color: '#80c0a0' },
    shadow_smith: { id: 'reveal_all', emoji: '👁️', name: 'Reveal All', desc: 'All invisible bricks shown', color: '#6040a0' },
    fire_phoenix: { id: 'inferno', emoji: '🔥', name: 'Inferno', desc: 'Permanent fire ball', color: '#ff6030' },
    frost_fairy: { id: 'freeze_all', emoji: '❄️', name: 'Freeze All', desc: 'Freeze all bricks (2x damage)', color: '#60c0e0' },
    chaos_clown: { id: 'chaos_control', emoji: '🎯', name: 'Chaos Control', desc: 'Perfect aim for 10s', color: '#e060a0' },
    portal_wizard: { id: 'portal_gun', emoji: '🌀', name: 'Portal Gun', desc: 'Click to place portals', color: '#a060e0' },
    titan_king: { id: 'titan_strike', emoji: '⚔️', name: 'Titan Strike', desc: 'Deal 10x boss damage', color: '#ffd700' },
    cosmic_dragon: { id: 'cosmic_power', emoji: '🐉', name: 'Cosmic Power', desc: 'All abilities combined!', color: '#ff00ff' },
  };

  // Refs
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, space: false, q: false, w: false, e: false });
  const lastTimeRef = useRef(Date.now());
  const comboTimerRef = useRef(null);
  const paddleLastX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);

  // Enemy definitions with unique gimmicks
  const enemyDefs = [
    {
      id: 'brick_goblin',
      name: 'Brick Goblin',
      title: 'The Starter Smasher',
      emoji: '👺',
      color: '#e85a50',
      accentColor: '#ff7a70',
      gimmick: 'regenerating_bricks',
      gimmickDesc: 'Some bricks regenerate over time',
      taunt: "You'll never break them all!",
      winQuote: "Bricks forever!",
      loseQuote: "My precious bricks..."
    },
    {
      id: 'magnet_mage',
      name: 'Magnet Mage',
      title: 'The Attractive Adversary',
      emoji: '🧲',
      color: '#4080e0',
      accentColor: '#60a0ff',
      gimmick: 'magnet_paddle',
      gimmickDesc: 'Ball sticks to paddle briefly',
      taunt: "Attraction is inevitable!",
      winQuote: "Pulled to defeat!",
      loseQuote: "Repelled by skill..."
    },
    {
      id: 'wind_witch',
      name: 'Wind Witch',
      title: 'The Gusty Guardian',
      emoji: '🌬️',
      color: '#80c0a0',
      accentColor: '#a0e0c0',
      gimmick: 'wind_gusts',
      gimmickDesc: 'Wind pushes the ball randomly',
      taunt: "Feel my howling winds!",
      winQuote: "Blown away!",
      loseQuote: "The wind... dies down..."
    },
    {
      id: 'shadow_smith',
      name: 'Shadow Smith',
      title: 'The Dark Forger',
      emoji: '⚒️',
      color: '#6040a0',
      accentColor: '#8060c0',
      gimmick: 'invisible_bricks',
      gimmickDesc: 'Some bricks are invisible',
      taunt: "Can you break what you can't see?",
      winQuote: "Hidden victory!",
      loseQuote: "Exposed by light..."
    },
    {
      id: 'fire_phoenix',
      name: 'Fire Phoenix',
      title: 'The Blazing Bird',
      emoji: '🔥',
      color: '#ff6030',
      accentColor: '#ff8050',
      gimmick: 'burning_ball',
      gimmickDesc: 'Ball occasionally catches fire, breaking through',
      taunt: "Burn bright and fast!",
      winQuote: "Rise from the ashes!",
      loseQuote: "My flames... extinguished..."
    },
    {
      id: 'frost_fairy',
      name: 'Frost Fairy',
      title: 'The Icy Enchanter',
      emoji: '❄️',
      color: '#60c0e0',
      accentColor: '#80e0ff',
      gimmick: 'freeze_paddle',
      gimmickDesc: 'Paddle freezes occasionally',
      taunt: "Winter is coming for you!",
      winQuote: "Frozen solid!",
      loseQuote: "The ice melts away..."
    },
    {
      id: 'chaos_clown',
      name: 'Chaos Clown',
      title: 'The Unpredictable',
      emoji: '🤡',
      color: '#e060a0',
      accentColor: '#ff80c0',
      gimmick: 'random_bounces',
      gimmickDesc: 'Ball bounces unpredictably',
      taunt: "Let's make this FUN!",
      winQuote: "Ha ha ha!",
      loseQuote: "That wasn't funny..."
    },
    {
      id: 'portal_wizard',
      name: 'Portal Wizard',
      title: 'The Dimension Hopper',
      emoji: '🌀',
      color: '#a060e0',
      accentColor: '#c080ff',
      gimmick: 'portals',
      gimmickDesc: 'Portals teleport the ball',
      taunt: "Where will you end up?",
      winQuote: "Lost in the void!",
      loseQuote: "My portals collapse..."
    },
    {
      id: 'titan_king',
      name: 'Titan King',
      title: 'The Mighty Monarch',
      emoji: '👑',
      color: '#ffd700',
      accentColor: '#ffec80',
      gimmick: 'boss_bricks',
      gimmickDesc: 'Giant boss bricks with health bars',
      taunt: "Face the king of bricks!",
      winQuote: "Long live the king!",
      loseQuote: "My throne... crumbles..."
    },
    {
      id: 'cosmic_dragon',
      name: 'Cosmic Dragon',
      title: 'The Final Form',
      emoji: '🐉',
      color: '#ff00ff',
      accentColor: '#ff80ff',
      gimmick: 'all_gimmicks',
      gimmickDesc: 'Uses all enemy abilities',
      taunt: "Face my ultimate power!",
      winQuote: "The cosmos bows to me!",
      loseQuote: "Impossible... a mortal defeats me?"
    },
  ];

  // Power-up types (only unlocked ones can spawn)
  const powerUpTypes = {
    expand: { emoji: '📏', color: '#50c878', effect: 'Wider Paddle', weight: 3 },
    shrink: { emoji: '📐', color: '#ff6b6b', effect: 'Shrink! (penalty)', weight: 1 },
    multi: { emoji: '✨', color: '#ffd700', effect: 'Multi-Ball', weight: 3 },
    fast: { emoji: '⚡', color: '#ffff00', effect: 'Speed Up', weight: 1 },
    slow: { emoji: '🐌', color: '#80c0ff', effect: 'Slow Down', weight: 2 },
    life: { emoji: '❤️', color: '#ff4444', effect: '+1 Life', weight: 2 },
    laser: { emoji: '🔫', color: '#ff00ff', effect: 'Laser Paddle', weight: 2 },
    shield: { emoji: '🛡️', color: '#4080ff', effect: 'Shield', weight: 2 },
    magnet: { emoji: '🧲', color: '#4080e0', effect: 'Magnet Catch', weight: 2 },
    mega: { emoji: '💫', color: '#ffd700', effect: 'Mega Ball!', weight: 1 },
    warp: { emoji: '🌀', color: '#a060e0', effect: 'WARP GATE!', weight: 0.5 },
  };

  // Save stats
  useEffect(() => {
    localStorage.setItem('teddyball_stats', JSON.stringify(stats));
  }, [stats]);

  // Keyboard controls with dash and Teddy abilities
  useEffect(() => {
    const handleKeyDown = (e) => {
      const now = Date.now();

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        // Double-tap detection for dash
        if (!keysRef.current.left && now - lastTapLeft < 300 && dashCooldown <= 0) {
          // Trigger dash left!
          setIsDashing(true);
          setDashCooldown(DASH_COOLDOWN);
          setPaddle(p => ({ ...p, x: Math.max(0, p.x - DASH_SPEED * 4) }));
          setTimeout(() => setIsDashing(false), 150);
        }
        setLastTapLeft(now);
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        // Double-tap detection for dash
        if (!keysRef.current.right && now - lastTapRight < 300 && dashCooldown <= 0) {
          // Trigger dash right!
          setIsDashing(true);
          setDashCooldown(DASH_COOLDOWN);
          setPaddle(p => ({ ...p, x: Math.min(CANVAS_WIDTH - p.width, p.x + DASH_SPEED * 4) }));
          setTimeout(() => setIsDashing(false), 150);
        }
        setLastTapRight(now);
        keysRef.current.right = true;
        e.preventDefault();
      }

      // Space for launch / charge shot
      if (e.key === ' ' && gameState === 'playing') {
        keysRef.current.space = true;
        const hasAttached = balls.some(b => b.attached);
        if (hasAttached) {
          setIsCharging(true);
        }
        e.preventDefault();
      }

      // Teddy Abilities: Q, W, E
      if (e.key === 'q' || e.key === 'Q') {
        keysRef.current.q = true;
        if (teddyMeter >= TEDDY_METER_MAX && !teddyAbilityActive) {
          activateTeddyAbility('slam');
        }
        e.preventDefault();
      }
      if (e.key === 'w' || e.key === 'W') {
        keysRef.current.w = true;
        if (teddyMeter >= TEDDY_METER_MAX && !teddyAbilityActive) {
          activateTeddyAbility('shield');
        }
        e.preventDefault();
      }
      if (e.key === 'e' || e.key === 'E') {
        keysRef.current.e = true;
        if (teddyMeter >= TEDDY_METER_MAX && !teddyAbilityActive) {
          activateTeddyAbility('twins');
        }
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setIsPaused(p => !p);
        } else if (gameState !== 'menu') {
          setGameState('menu');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === ' ') {
        keysRef.current.space = false;
        // Release charged shot
        if (isCharging && gameState === 'playing') {
          const power = Math.min(chargeLevel / 100, 1);
          setBalls(prev => prev.map(ball => {
            if (ball.attached) {
              const speed = ball.baseSpeed * (1 + power * 0.5); // Up to 50% faster
              return {
                ...ball,
                attached: false,
                vy: -speed,
                charged: power > 0.5, // Charged shot if held long enough
                damage: 1 + Math.floor(power * 2), // Up to 3x damage
              };
            }
            return ball;
          }));
          setIsCharging(false);
          setChargeLevel(0);
        }
      }
      if (e.key === 'q' || e.key === 'Q') keysRef.current.q = false;
      if (e.key === 'w' || e.key === 'W') keysRef.current.w = false;
      if (e.key === 'e' || e.key === 'E') keysRef.current.e = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, lastTapLeft, lastTapRight, dashCooldown, teddyMeter, teddyAbilityActive, isCharging, chargeLevel, balls]);

  // Teddy Ability activation
  const activateTeddyAbility = useCallback((ability) => {
    setTeddyMeter(0);
    setTeddyAbilityActive(ability);
    setFlashColor('#ffd700');
    setTimeout(() => setFlashColor(null), 200);

    switch (ability) {
      case 'slam':
        // Next ball hit does 3x damage and breaks through 3 bricks in a line
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '🧸 TEDDY SLAM!', '#ffd700');
        setTimeout(() => setTeddyAbilityActive(null), 10000); // 10s to use it
        break;
      case 'shield':
        // 5-second invincible bottom
        setActiveEffects(e => [...e, 'teddy_shield']);
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '🧸 TEDDY SHIELD!', '#4080ff');
        setTimeout(() => {
          setActiveEffects(e => e.filter(ef => ef !== 'teddy_shield'));
          setTeddyAbilityActive(null);
        }, 5000);
        break;
      case 'twins':
        // Paddle splits into two for 10 seconds
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '🧸 TEDDY TWINS!', '#ff80ff');
        setTwinPaddle({ active: true });
        setTimeout(() => {
          setTwinPaddle(null);
          setTeddyAbilityActive(null);
        }, 10000);
        break;
    }
  }, []);

  // Create brick layout
  const createBricks = useCallback((level, enemy) => {
    const newBricks = [];
    const patterns = [
      // Level patterns - cycle through these
      () => true, // Full grid
      (r, c) => (r + c) % 2 === 0, // Checkerboard
      (r, c) => r < 4, // Top heavy
      (r, c) => Math.abs(c - 4.5) < (BRICK_ROWS - r), // Pyramid
      (r, c) => r === 0 || r === BRICK_ROWS - 1 || c === 0 || c === BRICK_COLS - 1, // Border
      (r, c) => (r < 2) || (r >= 4), // Gap in middle
      (r, c) => Math.abs(r - 2.5) + Math.abs(c - 4.5) < 5, // Diamond
      (r, c) => c < 3 || c > 6, // Side columns
    ];

    const pattern = patterns[(level - 1) % patterns.length];

    // Level-based scaling
    const toughChance = Math.min(0.1 + level * 0.03, 0.4); // 10% -> 40%
    const steelChance = Math.min(0.05 + level * 0.02, 0.25); // 5% -> 25%
    const powerUpChance = Math.max(0.12 - level * 0.01, 0.04); // 12% -> 4%
    const extraHealthChance = level > 5 ? Math.min((level - 5) * 0.05, 0.3) : 0;

    // Add extra rows at higher levels
    const extraRows = Math.min(Math.floor(level / 3), 2);
    const totalRows = BRICK_ROWS + extraRows;

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        // Apply pattern only to base rows, extra rows are always filled
        if (row < BRICK_ROWS && !pattern(row, col)) continue;

        const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
        const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);

        // Determine brick type with level scaling
        let health = 1;
        let type = 'normal';
        let color = ['#ff6b6b', '#ffa500', '#ffd700', '#90ee90', '#60c0ff', '#c080ff'][row % 6];

        // Extra health at high levels
        if (Math.random() < extraHealthChance) {
          health += 1;
        }

        // Special bricks based on level-scaled chances
        const rand = Math.random();
        if (rand < steelChance) {
          health = 3 + Math.floor(level / 4);
          type = 'steel';
          color = '#404040';
        } else if (rand < steelChance + toughChance) {
          health = 2 + Math.floor(level / 5);
          type = 'tough';
          color = '#808080';
        }

        // Power-up bricks (decreasing chance at higher levels)
        if (Math.random() < powerUpChance) {
          type = 'powerup';
        }

        // Explosive bricks at level 4+
        if (level >= 4 && Math.random() < 0.05) {
          type = 'explosive';
          color = '#ff4400';
          health = 1;
        }

        // Boss brick for titan king
        if (enemy?.gimmick === 'boss_bricks' && row === 0 && col === 4) {
          health = 10 + level * 3;
          type = 'boss';
          color = '#ffd700';
        }

        // Invisible bricks (more at higher levels)
        const invisChance = enemy?.gimmick === 'invisible_bricks' ? Math.min(0.2 + level * 0.05, 0.5) : 0;
        const isInvisible = Math.random() < invisChance;

        newBricks.push({
          id: `${row}-${col}`,
          x, y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          health,
          maxHealth: health,
          type,
          color,
          invisible: isInvisible,
          canRegenerate: enemy?.gimmick === 'regenerating_bricks' && Math.random() < 0.2,
        });
      }
    }

    return newBricks;
  }, []);

  // Create particles
  const createParticles = useCallback((x, y, color, count = 8) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        color,
        size: 3 + Math.random() * 4,
        life: 1,
      });
    }
    setParticles(p => [...p, ...newParticles]);
  }, []);

  // Add floating text
  const addFloatingText = useCallback((x, y, text, color) => {
    setFloatingTexts(prev => [...prev, {
      id: Date.now() + Math.random(),
      x, y, text, color,
      life: 1,
    }]);
  }, []);

  // Spawn power-up (only unlocked ones + character rares)
  const spawnPowerUp = useCallback((x, y, forceRare = false) => {
    // Check for character-specific rare drop (2% chance or forced)
    const charRare = selectedEnemy ? characterRares[selectedEnemy.id] : null;
    if (charRare && (forceRare || Math.random() < 0.02)) {
      setPowerUps(prev => [...prev, {
        id: Date.now(),
        x, y,
        type: 'rare_' + charRare.id,
        vy: 2,
        emoji: charRare.emoji,
        color: charRare.color,
        effect: charRare.name,
        isRare: true,
      }]);
      return;
    }

    // Get unlocked power-ups only (plus penalties which are always available)
    const unlockedTypes = stats.unlockedPowerUps.filter(t => powerUpTypes[t]);
    const alwaysAvailable = ['shrink', 'fast']; // Penalties always spawn
    const availableTypes = [...new Set([...unlockedTypes, ...alwaysAvailable])];

    // Build weighted list
    let totalWeight = 0;
    const weightedTypes = availableTypes.map(type => {
      const weight = powerUpTypes[type]?.weight || 1;
      totalWeight += weight;
      return { type, weight };
    });

    // Lucky drops upgrade increases weight of good power-ups
    const luckyBonus = stats.upgrades.luckyDrops * 0.05;

    let rand = Math.random() * totalWeight;
    let selectedType = weightedTypes[0]?.type || 'expand';

    for (const wt of weightedTypes) {
      rand -= wt.weight;
      if (rand <= 0) {
        selectedType = wt.type;
        break;
      }
    }

    const puType = powerUpTypes[selectedType];
    if (!puType) return;

    setPowerUps(prev => [...prev, {
      id: Date.now(),
      x, y,
      type: selectedType,
      vy: 2,
      ...puType,
    }]);
  }, [selectedEnemy, stats.unlockedPowerUps, stats.upgrades.luckyDrops]);

  // Apply gimmicks
  const applyGimmick = useCallback((deltaTime) => {
    if (!selectedEnemy) return;

    const gimmick = selectedEnemy.gimmick;

    switch (gimmick) {
      case 'wind_gusts':
        if (Math.random() < 0.02) {
          const windForce = (Math.random() - 0.5) * 0.5;
          setBalls(prev => prev.map(ball => ({
            ...ball,
            vx: ball.vx + windForce,
          })));
          setGimmickData(d => ({ ...d, windDirection: windForce > 0 ? 'right' : 'left' }));
          setTimeout(() => setGimmickData(d => ({ ...d, windDirection: null })), 500);
        }
        break;

      case 'freeze_paddle':
        if (Math.random() < 0.005 && !activeEffects.includes('frozen')) {
          setActiveEffects(e => [...e, 'frozen']);
          setFlashColor('#80e0ff');
          setTimeout(() => {
            setActiveEffects(e => e.filter(ef => ef !== 'frozen'));
            setFlashColor(null);
          }, 2000);
        }
        break;

      case 'random_bounces':
        // Applied during ball-brick collision
        break;

      case 'portals':
        if (Math.random() < 0.01 && !gimmickData.portals) {
          const p1 = { x: Math.random() * (CANVAS_WIDTH - 40) + 20, y: 150 + Math.random() * 150 };
          const p2 = { x: Math.random() * (CANVAS_WIDTH - 40) + 20, y: 150 + Math.random() * 150 };
          setGimmickData(d => ({ ...d, portals: [p1, p2], portalLife: 200 }));
        }
        if (gimmickData.portalLife > 0) {
          setGimmickData(d => ({
            ...d,
            portalLife: d.portalLife - 1,
            portals: d.portalLife <= 1 ? null : d.portals,
          }));
        }
        break;

      case 'regenerating_bricks':
        if (Math.random() < 0.01) {
          setBricks(prev => {
            const destroyed = prev.filter(b => b.health <= 0 && b.canRegenerate);
            if (destroyed.length > 0) {
              const toRegen = destroyed[Math.floor(Math.random() * destroyed.length)];
              return prev.map(b => b.id === toRegen.id ? { ...b, health: 1 } : b);
            }
            return prev;
          });
        }
        break;

      case 'all_gimmicks':
        // Randomly apply other gimmicks
        const gimmicks = ['wind_gusts', 'freeze_paddle', 'portals'];
        if (Math.random() < 0.01) {
          const chosen = gimmicks[Math.floor(Math.random() * gimmicks.length)];
          // Temporarily switch gimmick
          const tempEnemy = { ...selectedEnemy, gimmick: chosen };
        }
        break;
    }
  }, [selectedEnemy, activeEffects, gimmickData]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 16.67; // Normalize to ~60fps
      lastTimeRef.current = now;

      // Update dash cooldown
      if (dashCooldown > 0) {
        setDashCooldown(prev => Math.max(0, prev - 16.67));
      }

      // Update charge level when holding space with attached ball
      if (isCharging && balls.some(b => b.attached)) {
        setChargeLevel(prev => Math.min(100, prev + 2 * deltaTime));
      }

      // Move paddle with velocity tracking for spin
      if (!activeEffects.includes('frozen')) {
        setPaddle(prev => {
          let newX = prev.x;
          const speed = isDashing ? DASH_SPEED : 8;

          if (keysRef.current.left) newX -= speed * deltaTime;
          if (keysRef.current.right) newX += speed * deltaTime;

          newX = Math.max(0, Math.min(CANVAS_WIDTH - prev.width, newX));

          // Calculate velocity for spin
          const vx = (newX - paddleLastX.current) / deltaTime;
          paddleLastX.current = newX;

          return { ...prev, x: newX, vx };
        });
      }

      // Move balls
      setBalls(prev => {
        let newBalls = prev.map(ball => {
          if (ball.attached) {
            return ball;
          }

          let { x, y, vx, vy, burning } = ball;

          // Speed modifier
          const speedMod = activeEffects.includes('fast') ? 1.3 :
                          activeEffects.includes('slow') ? 0.7 : 1;

          x += vx * deltaTime * speedMod;
          y += vy * deltaTime * speedMod;

          // Wall collisions
          if (x - BALL_RADIUS <= 0 || x + BALL_RADIUS >= CANVAS_WIDTH) {
            vx = -vx;
            x = x - BALL_RADIUS <= 0 ? BALL_RADIUS : CANVAS_WIDTH - BALL_RADIUS;
          }
          if (y - BALL_RADIUS <= 0) {
            vy = -vy;
            y = BALL_RADIUS;
          }

          // Paddle collision (main paddle)
          setPaddle(paddle => {
            if (y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
                y + BALL_RADIUS <= CANVAS_HEIGHT - 10 &&
                x >= paddle.x && x <= paddle.x + paddle.width) {

              // Calculate bounce angle based on hit position
              const hitPos = (x - paddle.x) / paddle.width;
              const angle = (hitPos - 0.5) * Math.PI * 0.7;
              const speed = Math.sqrt(vx * vx + vy * vy);

              // === SPIN CONTROL: Add paddle velocity to ball ===
              const spinFactor = paddle.vx * 0.15; // Paddle velocity affects ball
              vx = Math.sin(angle) * speed + spinFactor;
              vy = -Math.abs(Math.cos(angle) * speed);
              y = CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS;

              // Magnet catch (from upgrade or power-up or enemy gimmick)
              const hasMagnet = stats.upgrades.magnetCatch ||
                               activeEffects.includes('magnet') ||
                               selectedEnemy?.gimmick === 'magnet_paddle';
              if (hasMagnet && !ball.wasAttached) {
                // Ball sticks - will launch on space
                ball.attached = true;
                ball.wasAttached = true;
              }

              // Build Teddy Meter on paddle hits
              const meterGain = 5 * (1 + stats.upgrades.teddyPower * 0.1);
              setTeddyMeter(prev => Math.min(TEDDY_METER_MAX, prev + meterGain));

              createParticles(x, y, isDashing ? '#ffd700' : '#50c878', isDashing ? 10 : 5);

              // Dash hit bonus
              if (isDashing) {
                addFloatingText(x, y - 20, 'DASH HIT!', '#ffd700');
                setScore(s => s + 25);
              }
            }
            return paddle;
          });

          // Twin paddle collision (Teddy Twins ability)
          if (twinPaddle?.active) {
            setPaddle(paddle => {
              // Twin is mirrored on opposite side
              const twinX = CANVAS_WIDTH - paddle.x - paddle.width;
              if (y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
                  y + BALL_RADIUS <= CANVAS_HEIGHT - 10 &&
                  x >= twinX && x <= twinX + paddle.width) {

                const hitPos = (x - twinX) / paddle.width;
                const angle = (hitPos - 0.5) * Math.PI * 0.7;
                const speed = Math.sqrt(vx * vx + vy * vy);

                vx = Math.sin(angle) * speed - (paddle.vx * 0.15); // Inverse spin
                vy = -Math.abs(Math.cos(angle) * speed);
                y = CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS;

                createParticles(x, y, '#ff80ff', 8);
              }
              return paddle;
            });
          }

          // Portal collision
          if (gimmickData.portals) {
            gimmickData.portals.forEach((portal, idx) => {
              const dist = Math.sqrt((x - portal.x) ** 2 + (y - portal.y) ** 2);
              if (dist < 20) {
                const otherPortal = gimmickData.portals[1 - idx];
                x = otherPortal.x;
                y = otherPortal.y;
                createParticles(x, y, '#a060e0', 10);
              }
            });
          }

          return { ...ball, x, y, vx, vy };
        });

        // Check if ball is lost
        newBalls = newBalls.filter(ball => {
          if (ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
            // Check for teddy shield (from ability)
            if (activeEffects.includes('teddy_shield')) {
              ball.vy = -Math.abs(ball.vy);
              ball.y = CANVAS_HEIGHT - BALL_RADIUS;
              createParticles(ball.x, ball.y, '#ffd700', 15);
              addFloatingText(ball.x, ball.y - 20, '🧸 SAVED!', '#ffd700');
              return true;
            }
            // Check for regular shield
            if (activeEffects.includes('shield')) {
              ball.vy = -Math.abs(ball.vy);
              ball.y = CANVAS_HEIGHT - BALL_RADIUS;
              setActiveEffects(e => e.filter(ef => ef !== 'shield'));
              createParticles(ball.x, ball.y, '#4080ff', 10);
              return true;
            }
            return false;
          }
          return true;
        });

        if (newBalls.length === 0) {
          handleBallLost();
          return [createBall(currentLevel)];
        }

        return newBalls;
      });

      // Check brick collisions
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          if (ball.attached) return ball;

          let { x, y, vx, vy, burning } = ball;
          let brickHit = false;

          setBricks(prevBricks => {
            return prevBricks.map(brick => {
              if (brick.health <= 0) return brick;

              // Simple AABB collision
              if (x + BALL_RADIUS > brick.x &&
                  x - BALL_RADIUS < brick.x + brick.width &&
                  y + BALL_RADIUS > brick.y &&
                  y - BALL_RADIUS < brick.y + brick.height) {

                if (!brickHit) {
                  // Determine bounce direction
                  const overlapLeft = (x + BALL_RADIUS) - brick.x;
                  const overlapRight = (brick.x + brick.width) - (x - BALL_RADIUS);
                  const overlapTop = (y + BALL_RADIUS) - brick.y;
                  const overlapBottom = (brick.y + brick.height) - (y - BALL_RADIUS);

                  const minOverlapX = Math.min(overlapLeft, overlapRight);
                  const minOverlapY = Math.min(overlapTop, overlapBottom);

                  // Only bounce if not burning through
                  if (!burning || brick.type === 'boss') {
                    if (minOverlapX < minOverlapY) {
                      vx = -vx;
                    } else {
                      vy = -vy;
                    }

                    // Chaos clown random bounce
                    if (selectedEnemy?.gimmick === 'random_bounces' && Math.random() < 0.3) {
                      vx += (Math.random() - 0.5) * 3;
                      vy += (Math.random() - 0.5) * 2;
                    }
                  }

                  brickHit = true;
                }

                // Calculate damage (Teddy Slam, charged shot, mega ball)
                let damage = ball.damage || 1;
                if (teddyAbilityActive === 'slam') {
                  damage = 3;
                  setTeddyAbilityActive(null); // Used up
                  addFloatingText(brick.x + brick.width/2, brick.y, '🧸 SLAM!', '#ffd700');
                  setScreenShake(true);
                  setTimeout(() => setScreenShake(false), 200);
                }
                if (ball.mega) {
                  damage = 99; // Mega ball destroys everything
                }

                const newHealth = brick.health - damage;
                const points = brick.type === 'boss' ? 50 :
                               brick.type === 'explosive' ? 40 :
                               brick.type === 'steel' ? 30 :
                               brick.type === 'tough' ? 20 : 10;

                // Charged shot bonus
                if (ball.charged) {
                  setScore(s => s + points * 0.5);
                  ball.charged = false; // One-time bonus
                }

                // Build Teddy Meter on brick hits
                const meterGain = (brick.type === 'boss' ? 3 : 1) * (1 + stats.upgrades.teddyPower * 0.1);
                setTeddyMeter(prev => Math.min(TEDDY_METER_MAX, prev + meterGain));

                if (newHealth <= 0) {
                  // Brick destroyed
                  setScore(s => s + points * (1 + combo * 0.1));
                  setCombo(c => {
                    const newCombo = c + 1;
                    if (newCombo > maxCombo) setMaxCombo(newCombo);
                    return newCombo;
                  });

                  // Reset combo timer
                  if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
                  comboTimerRef.current = setTimeout(() => setCombo(0), 2000);

                  createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color, 12);
                  addFloatingText(brick.x + brick.width / 2, brick.y, `+${Math.floor(points * (1 + combo * 0.1))}`, brick.color);

                  // Explosive brick - destroy nearby bricks!
                  if (brick.type === 'explosive') {
                    setScreenShake(true);
                    setTimeout(() => setScreenShake(false), 200);
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ff4400', 25);
                    setFlashColor('#ff4400');
                    setTimeout(() => setFlashColor(null), 100);

                    // Mark nearby bricks for destruction
                    setBricks(allBricks => allBricks.map(b => {
                      if (b.health <= 0 || b.id === brick.id) return b;
                      const dx = Math.abs((b.x + b.width/2) - (brick.x + brick.width/2));
                      const dy = Math.abs((b.y + b.height/2) - (brick.y + brick.height/2));
                      if (dx < BRICK_WIDTH * 2 && dy < BRICK_HEIGHT * 2) {
                        createParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 8);
                        setScore(s => s + 15);
                        return { ...b, health: 0 };
                      }
                      return b;
                    }));
                  }

                  // Spawn power-up
                  if (brick.type === 'powerup' || Math.random() < 0.15) {
                    spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                  }

                  // Reveal invisible brick
                  brick.invisible = false;
                }

                return { ...brick, health: newHealth };
              }
              return brick;
            });
          });

          return { ...ball, x, y, vx, vy };
        });
      });

      // Move power-ups
      setPowerUps(prev => {
        return prev.filter(pu => {
          pu.y += pu.vy * deltaTime;

          // Check paddle collision
          if (pu.y + 15 >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
              pu.x >= paddle.x && pu.x <= paddle.x + paddle.width) {

            // Apply power-up effect
            applyPowerUp(pu.type);
            createParticles(pu.x, pu.y, pu.color, 10);
            addFloatingText(pu.x, pu.y, pu.effect, pu.color);
            return false;
          }

          return pu.y < CANVAS_HEIGHT;
        });
      });

      // Apply gimmicks
      applyGimmick(deltaTime);

      // Update particles
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx * deltaTime,
          y: p.y + p.vy * deltaTime,
          vy: p.vy + 0.2 * deltaTime,
          life: p.life - 0.02 * deltaTime,
        }))
        .filter(p => p.life > 0)
      );

      // Update floating texts
      setFloatingTexts(prev => prev
        .map(t => ({ ...t, y: t.y - 1 * deltaTime, life: t.life - 0.02 * deltaTime }))
        .filter(t => t.life > 0)
      );

      // Check level complete
      setBricks(prev => {
        const remaining = prev.filter(b => b.health > 0 && b.type !== 'boss');
        const bossBrick = prev.find(b => b.type === 'boss' && b.health > 0);
        if (remaining.length === 0 && !bossBrick) {
          handleLevelComplete();
        }
        return prev;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, isPaused, selectedEnemy, activeEffects, applyGimmick, gimmickData, combo, maxCombo, paddle, spawnPowerUp, createParticles, addFloatingText, currentLevel]);

  const applyPowerUp = (type) => {
    // Handle character-specific rare power-ups
    if (type.startsWith('rare_')) {
      applyRarePowerUp(type.replace('rare_', ''));
      return;
    }

    switch (type) {
      case 'expand':
        setPaddle(p => ({ ...p, width: Math.min(200, p.width + 20) }));
        break;
      case 'shrink':
        setPaddle(p => ({ ...p, width: Math.max(40, p.width - 20) }));
        break;
      case 'multi':
        setBalls(prev => {
          const newBalls = [];
          prev.forEach(ball => {
            if (!ball.attached) {
              newBalls.push(
                { ...ball, vx: ball.vx - 2 },
                { ...ball, vx: ball.vx + 2 }
              );
            }
          });
          return [...prev, ...newBalls];
        });
        break;
      case 'fast':
        setActiveEffects(e => [...e.filter(ef => ef !== 'slow'), 'fast']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'fast')), 5000);
        break;
      case 'slow':
        setActiveEffects(e => [...e.filter(ef => ef !== 'fast'), 'slow']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'slow')), 5000);
        break;
      case 'life':
        setLives(l => l + 1);
        break;
      case 'laser':
        setActiveEffects(e => [...e, 'laser']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'laser')), 8000);
        break;
      case 'shield':
        setActiveEffects(e => [...e, 'shield']);
        break;
      case 'magnet':
        setActiveEffects(e => [...e, 'magnet']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'magnet')), 15000);
        break;
      case 'mega':
        // Mega ball - smashes through everything!
        setBalls(prev => prev.map(ball => ({ ...ball, mega: true, burning: true })));
        setFlashColor('#ffd700');
        setTimeout(() => setFlashColor(null), 300);
        setTimeout(() => {
          setBalls(prev => prev.map(ball => ({ ...ball, mega: false, burning: false })));
        }, 8000);
        break;
      case 'warp':
        // Warp gate - skip to next level!
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '🌀 WARP!', '#a060e0');
        setFlashColor('#a060e0');
        setTimeout(() => {
          handleLevelComplete();
          setFlashColor(null);
        }, 500);
        break;
    }
  };

  // Apply character-specific rare power-ups
  const applyRarePowerUp = (rareId) => {
    setFlashColor('#ffd700');
    addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '⭐ RARE DROP!', '#ffd700');
    setTimeout(() => setFlashColor(null), 300);

    switch (rareId) {
      case 'regen_shield': // Brick Goblin - bricks stay broken
        setGimmickData(d => ({ ...d, noRegen: true }));
        setTimeout(() => setGimmickData(d => ({ ...d, noRegen: false })), 20000);
        break;
      case 'super_magnet': // Magnet Mage - pull all power-ups
        setActiveEffects(e => [...e, 'super_magnet']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'super_magnet')), 15000);
        break;
      case 'wind_rider': // Wind Witch - control ball with arrows
        setActiveEffects(e => [...e, 'wind_control']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'wind_control')), 10000);
        break;
      case 'reveal_all': // Shadow Smith - reveal invisible bricks
        setBricks(prev => prev.map(b => ({ ...b, invisible: false })));
        break;
      case 'inferno': // Fire Phoenix - permanent fire
        setBalls(prev => prev.map(ball => ({ ...ball, burning: true, permaBurn: true })));
        break;
      case 'freeze_all': // Frost Fairy - freeze all bricks
        setBricks(prev => prev.map(b => ({ ...b, frozen: true, health: Math.ceil(b.health / 2) })));
        addFloatingText(CANVAS_WIDTH / 2, 100, '❄️ ALL FROZEN!', '#80e0ff');
        break;
      case 'chaos_control': // Chaos Clown - perfect aim
        setActiveEffects(e => [...e, 'perfect_aim']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'perfect_aim')), 10000);
        break;
      case 'portal_gun': // Portal Wizard - controllable portals
        // TODO: Click to place portals
        setGimmickData(d => ({
          ...d,
          portals: [
            { x: 100, y: 200 },
            { x: CANVAS_WIDTH - 100, y: 200 }
          ],
          portalLife: 600
        }));
        break;
      case 'titan_strike': // Titan King - 10x boss damage
        setActiveEffects(e => [...e, 'titan_strike']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'titan_strike')), 15000);
        break;
      case 'cosmic_power': // Cosmic Dragon - everything!
        setBalls(prev => prev.map(ball => ({ ...ball, mega: true, burning: true })));
        setActiveEffects(e => [...e, 'laser', 'shield', 'slow']);
        setPaddle(p => ({ ...p, width: Math.min(200, p.width + 40) }));
        setTimeout(() => {
          setBalls(prev => prev.map(ball => ({ ...ball, mega: false })));
          setActiveEffects(e => e.filter(ef => !['laser', 'slow'].includes(ef)));
        }, 10000);
        break;
    }
  };

  const createBall = (level = 1) => {
    // Ball speed increases with level
    const baseSpeed = 5;
    const speedBonus = Math.min(level * 0.3, 3); // Up to +3 speed at level 10
    const totalSpeed = baseSpeed + speedBonus;

    return {
      id: Date.now(),
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 20 - BALL_RADIUS,
      vx: (Math.random() - 0.5) * 4,
      vy: -totalSpeed,
      attached: true,
      burning: false,
      baseSpeed: totalSpeed,
    };
  };

  const handleBallLost = () => {
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) {
        handleGameOver();
      }
      return newLives;
    });
    setCombo(0);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const handleLevelComplete = () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    setStats(s => ({ ...s, levelsCompleted: s.levelsCompleted + 1 }));

    // Bonus points scale with level
    const levelBonus = 100 * currentLevel + (currentLevel > 5 ? 50 * (currentLevel - 5) : 0);
    setScore(s => s + levelBonus);
    addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, `LEVEL ${nextLevel}! +${levelBonus}`, '#ffd700');

    // Show level info
    addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30,
      nextLevel >= 7 ? '⚠️ HARD MODE' : nextLevel >= 4 ? '💥 Explosive bricks!' : '', '#ff8800');

    setFlashColor('#ffd700');
    setTimeout(() => setFlashColor(null), 500);

    // Setup next level
    setTimeout(() => {
      setBricks(createBricks(nextLevel, selectedEnemy));
      setBalls([createBall(nextLevel)]);
      setPowerUps([]);
      setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH });
    }, 1000);
  };

  const handleGameOver = () => {
    setGameState('gameover');
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    // Award stars based on performance
    const levelStars = currentLevel; // 1 star per level reached
    const comboStars = Math.floor(maxCombo / 10); // 1 star per 10 combo
    const scoreStars = Math.floor(score / 500); // 1 star per 500 points
    const totalNewStars = levelStars + comboStars + scoreStars;

    setStats(s => ({
      ...s,
      totalScore: s.totalScore + score,
      gamesPlayed: s.gamesPlayed + 1,
      stars: s.stars + totalNewStars,
      highScores: {
        ...s.highScores,
        [selectedEnemy?.id]: Math.max(s.highScores[selectedEnemy?.id] || 0, score)
      }
    }));
  };

  const startGame = (enemy) => {
    setSelectedEnemy(enemy);
    setScore(0);

    // Apply upgrades
    const startingLives = 3 + stats.upgrades.extraLife;
    const startingWidth = PADDLE_WIDTH + (stats.upgrades.paddleSize * 10);

    setLives(startingLives);
    setCurrentLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setPaddle({ x: CANVAS_WIDTH / 2 - startingWidth / 2, width: startingWidth, vx: 0 });
    setBalls([createBall(1)]);
    setBricks(createBricks(1, enemy));
    setPowerUps([]);
    setActiveEffects([]);
    setGimmickData({});
    setTeddyMeter(0);
    setTeddyAbilityActive(null);
    setTwinPaddle(null);
    setChargeLevel(0);
    setIsCharging(false);
    setDashCooldown(0);
    setGameState('playing');
    setIsPaused(false);
  };

  // Purchase upgrade
  const purchaseUpgrade = (upgradeId) => {
    const upgrade = upgradeShop[upgradeId];
    const currentLevel = stats.upgrades[upgradeId] || 0;

    if (currentLevel >= upgrade.maxLevel) return;

    const cost = upgrade.costPerLevel[currentLevel];
    if (stats.stars < cost) return;

    setStats(prev => ({
      ...prev,
      stars: prev.stars - cost,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: currentLevel + 1,
      }
    }));
  };

  // Unlock power-up
  const unlockPowerUp = (powerUpId) => {
    const pu = powerUpUnlocks[powerUpId];
    if (!pu || stats.unlockedPowerUps.includes(powerUpId)) return;
    if (stats.stars < pu.cost) return;

    setStats(prev => ({
      ...prev,
      stars: prev.stars - pu.cost,
      unlockedPowerUps: [...prev.unlockedPowerUps, powerUpId],
    }));
  };

  // Render game
  const renderGame = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      transform: screenShake ? `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)` : 'none',
    }}>
      {/* HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: CANVAS_WIDTH,
        marginBottom: '8px',
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        color: '#fff',
      }}>
        <div>
          <span style={{ fontSize: '12px', color: '#888' }}>Score</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffd700' }}>{Math.floor(score)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Level {currentLevel}</span>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} style={{ fontSize: '16px' }}>❤️</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{selectedEnemy?.emoji}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: selectedEnemy?.color }}>{selectedEnemy?.name}</div>
            {combo > 1 && <div style={{ fontSize: '11px', color: '#ffd700' }}>🔥 x{combo} Combo!</div>}
          </div>
        </div>
      </div>

      {/* Teddy Meter Bar */}
      <div style={{
        width: CANVAS_WIDTH,
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '20px' }}>🧸</span>
        <div style={{
          flex: 1,
          height: '12px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${(teddyMeter / TEDDY_METER_MAX) * 100}%`,
            height: '100%',
            background: teddyMeter >= TEDDY_METER_MAX
              ? 'linear-gradient(90deg, #ffd700, #ff8800)'
              : 'linear-gradient(90deg, #8b5a2b, #d2691e)',
            transition: 'width 0.2s',
            boxShadow: teddyMeter >= TEDDY_METER_MAX ? '0 0 10px #ffd700' : 'none',
          }} />
          {teddyMeter >= TEDDY_METER_MAX && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '800',
              color: '#fff',
              textShadow: '0 0 5px #000',
              animation: 'pulse 0.5s ease-in-out infinite',
            }}>
              READY! Q/W/E
            </div>
          )}
        </div>
        {teddyMeter >= TEDDY_METER_MAX && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ fontSize: '12px', padding: '2px 6px', background: '#ffd70033', borderRadius: '4px', color: '#ffd700' }}>Q:Slam</span>
            <span style={{ fontSize: '12px', padding: '2px 6px', background: '#4080ff33', borderRadius: '4px', color: '#4080ff' }}>W:Shield</span>
            <span style={{ fontSize: '12px', padding: '2px 6px', background: '#ff80ff33', borderRadius: '4px', color: '#ff80ff' }}>E:Twins</span>
          </div>
        )}
      </div>

      {/* Dash cooldown indicator */}
      {dashCooldown > 0 && (
        <div style={{
          width: CANVAS_WIDTH,
          marginBottom: '4px',
          fontSize: '11px',
          color: '#888',
          textAlign: 'center',
        }}>
          Dash: {Math.ceil(dashCooldown / 1000)}s ⏱️
        </div>
      )}

      {/* Active effects */}
      {activeEffects.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {activeEffects.includes('shield') && (
            <div style={{ padding: '3px 10px', background: '#4080ff33', borderRadius: '12px', color: '#4080ff', fontSize: '11px' }}>
              🛡️ Shield Active
            </div>
          )}
          {activeEffects.includes('laser') && (
            <div style={{ padding: '3px 10px', background: '#ff00ff33', borderRadius: '12px', color: '#ff00ff', fontSize: '11px' }}>
              🔫 Laser Active
            </div>
          )}
          {activeEffects.includes('fast') && (
            <div style={{ padding: '3px 10px', background: '#ffff0033', borderRadius: '12px', color: '#ffff00', fontSize: '11px' }}>
              ⚡ Fast Ball
            </div>
          )}
          {activeEffects.includes('slow') && (
            <div style={{ padding: '3px 10px', background: '#80c0ff33', borderRadius: '12px', color: '#80c0ff', fontSize: '11px' }}>
              🐌 Slow Ball
            </div>
          )}
          {activeEffects.includes('frozen') && (
            <div style={{ padding: '3px 10px', background: '#80e0ff33', borderRadius: '12px', color: '#80e0ff', fontSize: '11px' }}>
              ❄️ FROZEN!
            </div>
          )}
        </div>
      )}

      {/* Game canvas */}
      <div style={{
        position: 'relative',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)',
        borderRadius: '8px',
        border: '3px solid #2a2a4e',
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

        {/* Wind indicator */}
        {gimmickData.windDirection && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: gimmickData.windDirection === 'right' ? '10px' : 'auto',
            right: gimmickData.windDirection === 'left' ? '10px' : 'auto',
            fontSize: '24px',
            opacity: 0.5,
          }}>
            {gimmickData.windDirection === 'right' ? '💨→' : '←💨'}
          </div>
        )}

        {/* Portals */}
        {gimmickData.portals && gimmickData.portals.map((portal, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: portal.x - 15,
              top: portal.y - 15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${idx === 0 ? '#a060e0' : '#60a0e0'} 0%, transparent 70%)`,
              animation: 'portalSpin 1s linear infinite',
              boxShadow: `0 0 20px ${idx === 0 ? '#a060e0' : '#60a0e0'}`,
            }}
          />
        ))}

        {/* Bricks */}
        {bricks.map(brick => brick.health > 0 && (
          <div
            key={brick.id}
            style={{
              position: 'absolute',
              left: brick.x,
              top: brick.y,
              width: brick.width,
              height: brick.height,
              background: brick.invisible ? 'transparent' : `linear-gradient(180deg, ${brick.color}, ${brick.color}88)`,
              borderRadius: '4px',
              border: brick.invisible ? '1px dashed rgba(255,255,255,0.1)' : `2px solid ${brick.color}`,
              boxShadow: brick.invisible ? 'none' : `0 2px 8px ${brick.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: brick.invisible ? 0.2 : 1,
            }}
          >
            {brick.type === 'boss' && (
              <div style={{
                position: 'absolute',
                bottom: -8,
                left: 0,
                right: 0,
                height: 4,
                background: '#333',
                borderRadius: 2,
              }}>
                <div style={{
                  width: `${(brick.health / brick.maxHealth) * 100}%`,
                  height: '100%',
                  background: '#ff4444',
                  borderRadius: 2,
                }} />
              </div>
            )}
            {brick.type === 'explosive' && !brick.invisible && (
              <span style={{ fontSize: '12px', animation: 'explosivePulse 0.5s ease-in-out infinite' }}>💥</span>
            )}
            {brick.health > 1 && !brick.invisible && brick.type !== 'explosive' && (
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#fff' }}>{brick.health}</span>
            )}
          </div>
        ))}

        {/* Power-ups */}
        {powerUps.map(pu => (
          <div
            key={pu.id}
            style={{
              position: 'absolute',
              left: pu.x - 12,
              top: pu.y - 12,
              width: 24,
              height: 24,
              background: `radial-gradient(circle, ${pu.color}88 0%, ${pu.color}44 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              animation: 'powerUpFloat 0.5s ease-in-out infinite',
              boxShadow: `0 0 10px ${pu.color}`,
            }}
          >
            {pu.emoji}
          </div>
        ))}

        {/* Balls */}
        {balls.map(ball => (
          <div
            key={ball.id}
            style={{
              position: 'absolute',
              left: ball.attached ? paddle.x + paddle.width / 2 - BALL_RADIUS : ball.x - BALL_RADIUS,
              top: ball.attached ? CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS * 2 : ball.y - BALL_RADIUS,
              width: BALL_RADIUS * 2,
              height: BALL_RADIUS * 2,
              background: ball.mega
                ? 'radial-gradient(circle, #ffd700 0%, #ff8800 50%, #ff4400 100%)'
                : ball.burning
                  ? 'radial-gradient(circle, #ff6030 0%, #ff3000 100%)'
                  : ball.charged
                    ? 'radial-gradient(circle, #60ff60 0%, #40c040 100%)'
                    : 'radial-gradient(circle, #ffffff 0%, #c0c0c0 100%)',
              borderRadius: '50%',
              boxShadow: ball.mega
                ? '0 0 20px #ffd700, 0 0 40px #ff8800, 0 0 60px #ff4400'
                : ball.burning
                  ? '0 0 15px #ff6030, 0 0 30px #ff3000'
                  : ball.charged
                    ? '0 0 15px #60ff60'
                    : '0 0 10px rgba(255,255,255,0.5)',
              transform: ball.mega ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.2s',
            }}
          />
        ))}

        {/* Paddle */}
        <div style={{
          position: 'absolute',
          left: paddle.x,
          top: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
          width: paddle.width,
          height: PADDLE_HEIGHT,
          background: activeEffects.includes('frozen')
            ? 'linear-gradient(180deg, #80e0ff, #60c0e0)'
            : activeEffects.includes('laser')
              ? 'linear-gradient(180deg, #ff60ff, #c040c0)'
              : isDashing
                ? 'linear-gradient(180deg, #ffd700, #ff8800)'
                : 'linear-gradient(180deg, #60a0ff, #4080e0)',
          borderRadius: '6px',
          boxShadow: activeEffects.includes('frozen')
            ? '0 0 20px #80e0ff'
            : activeEffects.includes('laser')
              ? '0 0 20px #ff60ff'
              : isDashing
                ? '0 0 25px #ffd700'
                : '0 0 15px rgba(96, 160, 255, 0.5)',
          transition: isDashing ? 'none' : 'left 0.05s',
        }} />

        {/* Twin Paddle (Teddy Twins ability) */}
        {twinPaddle?.active && (
          <div style={{
            position: 'absolute',
            left: CANVAS_WIDTH - paddle.x - paddle.width,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
            width: paddle.width,
            height: PADDLE_HEIGHT,
            background: 'linear-gradient(180deg, #ff80ff, #c060c0)',
            borderRadius: '6px',
            boxShadow: '0 0 20px #ff80ff',
            opacity: 0.9,
          }} />
        )}

        {/* Charge bar when holding space with attached ball */}
        {isCharging && balls.some(b => b.attached) && (
          <div style={{
            position: 'absolute',
            left: paddle.x,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - 25,
            width: paddle.width,
            height: 6,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${chargeLevel}%`,
              height: '100%',
              background: chargeLevel > 50
                ? 'linear-gradient(90deg, #ffd700, #ff4400)'
                : 'linear-gradient(90deg, #60a0ff, #4080e0)',
              transition: 'width 0.1s',
            }} />
          </div>
        )}

        {/* Shield indicator */}
        {activeEffects.includes('shield') && (
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 4,
            background: 'linear-gradient(90deg, transparent, #4080ff, transparent)',
            boxShadow: '0 0 10px #4080ff',
          }} />
        )}

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: '50%',
              opacity: p.life,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Floating texts */}
        {floatingTexts.map(t => (
          <div
            key={t.id}
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y,
              color: t.color,
              fontSize: '14px',
              fontWeight: '800',
              textShadow: '0 0 5px rgba(0,0,0,0.5)',
              opacity: t.life,
              pointerEvents: 'none',
              transform: 'translateX(-50%)',
            }}
          >
            {t.text}
          </div>
        ))}

        {/* Ball launch hint */}
        {balls.some(b => b.attached) && (
          <div style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#888',
            fontSize: '14px',
          }}>
            Press SPACE to launch
          </div>
        )}

        {/* Pause overlay */}
        {isPaused && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
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
                background: '#4080e0',
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
        marginTop: '12px',
        color: '#5a5a8a',
        fontSize: '11px',
        textAlign: 'center',
      }}>
        A/D to move • Double-tap to DASH • Hold SPACE to charge shot
        <br />
        Q/W/E for Teddy abilities when meter is full • ESC to pause
      </div>

      <style>{`
        @keyframes powerUpFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes portalSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes explosivePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );

  const renderMenu = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#fff',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'bounce 1s ease-in-out infinite',
      }}>🧸</div>
      <h1 style={{
        fontSize: '48px',
        fontWeight: '900',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #d2691e 0%, #ffd700 50%, #8b4513 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>TEDDYBALL</h1>
      <p style={{ color: '#8888aa', marginBottom: '30px' }}>Dash, Spin, Charge, and Smash!</p>

      {/* Stars display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '30px',
        padding: '10px 24px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
      }}>
        <span style={{ fontSize: '24px' }}>⭐</span>
        <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffd700' }}>{stats.stars}</span>
        <span style={{ fontSize: '12px', color: '#888' }}>Stars</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          onClick={() => setGameState('select')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #4080e0, #6040a0)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(64, 128, 224, 0.4)',
          }}
          onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
        >
          🎮 PLAY
        </button>

        <button
          onClick={() => setGameState('shop')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffd700, #ff8800)',
            border: 'none',
            borderRadius: '12px',
            color: '#1a1a2e',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
          }}
          onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
        >
          🛒 SHOP
        </button>
      </div>

      <div style={{ marginTop: '20px', color: '#6a6a8a', fontSize: '14px' }}>
        <p>Games: {stats.gamesPlayed} | Levels: {stats.levelsCompleted}</p>
      </div>

      <button
        onClick={() => window.location.href = 'menu.html'}
        style={{
          marginTop: '20px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#8888aa',
          cursor: 'pointer',
        }}
      >
        ← Back to Menu
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );

  const renderEnemySelect = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      color: '#fff',
      minHeight: '100vh',
      overflowY: 'auto',
    }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '8px',
        color: '#60a0ff',
      }}>Choose Your Challenge</h2>
      <p style={{ color: '#6a6a8a', marginBottom: '30px' }}>Each enemy has unique brick abilities</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        maxWidth: '900px',
        width: '100%',
      }}>
        {enemyDefs.map((enemy) => {
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
          color: '#8888aa',
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  );

  const renderGameOver = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#fff',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>💔</div>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '800',
        color: '#ff6b6b',
        marginBottom: '8px',
      }}>GAME OVER</h2>

      <div style={{ fontSize: '48px', marginBottom: '10px' }}>{selectedEnemy?.emoji}</div>
      <p style={{ color: '#888', marginBottom: '30px', fontStyle: 'italic' }}>
        "{selectedEnemy?.winQuote}"
      </p>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '20px 40px',
        borderRadius: '12px',
        marginBottom: '30px',
      }}>
        <div style={{ fontSize: '14px', color: '#888' }}>Final Score</div>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#ffd700' }}>{Math.floor(score)}</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          Level {currentLevel} • Max Combo: x{maxCombo}
        </div>
        {score > (stats.highScores[selectedEnemy?.id] || 0) && (
          <div style={{ color: '#ffd700', marginTop: '10px', fontWeight: '700' }}>
            ⭐ NEW BEST SCORE!
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
            background: 'linear-gradient(135deg, #4080e0, #6040a0)',
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

      {/* Stars earned display */}
      <div style={{
        marginTop: '20px',
        padding: '10px 20px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
      }}>
        <span style={{ color: '#ffd700' }}>
          ⭐ +{currentLevel + Math.floor(maxCombo / 10) + Math.floor(score / 500)} Stars Earned!
        </span>
      </div>
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
      overflowY: 'auto',
    }}>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '800',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #ffd700, #ff8800)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>🛒 TEDDY SHOP</h2>

      {/* Stars balance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '30px',
        padding: '10px 24px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
      }}>
        <span style={{ fontSize: '24px' }}>⭐</span>
        <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffd700' }}>{stats.stars}</span>
      </div>

      {/* Upgrades Section */}
      <h3 style={{ color: '#60a0ff', marginBottom: '16px' }}>⬆️ Permanent Upgrades</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        maxWidth: '700px',
        width: '100%',
        marginBottom: '30px',
      }}>
        {Object.entries(upgradeShop).map(([id, upgrade]) => {
          const currentLevel = stats.upgrades[id] || 0;
          const isMaxed = currentLevel >= upgrade.maxLevel;
          const cost = isMaxed ? 0 : upgrade.costPerLevel[currentLevel];
          const canAfford = stats.stars >= cost;

          return (
            <div
              key={id}
              onClick={() => !isMaxed && canAfford && purchaseUpgrade(id)}
              style={{
                background: isMaxed
                  ? 'rgba(80, 200, 120, 0.2)'
                  : canAfford
                    ? 'rgba(255, 215, 0, 0.1)'
                    : 'rgba(100, 100, 100, 0.1)',
                border: `2px solid ${isMaxed ? '#50c878' : canAfford ? '#ffd700' : '#444'}`,
                borderRadius: '10px',
                padding: '14px',
                cursor: isMaxed ? 'default' : canAfford ? 'pointer' : 'not-allowed',
                opacity: isMaxed ? 1 : canAfford ? 1 : 0.6,
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => { if (!isMaxed && canAfford) e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{upgrade.name}</div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{upgrade.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Lv {currentLevel}/{upgrade.maxLevel}
                </div>
                {isMaxed ? (
                  <span style={{ color: '#50c878', fontSize: '12px' }}>✓ MAX</span>
                ) : (
                  <span style={{ color: canAfford ? '#ffd700' : '#666', fontSize: '12px' }}>⭐ {cost}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Power-ups Section */}
      <h3 style={{ color: '#ff80ff', marginBottom: '16px' }}>⚡ Unlock Power-Ups</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        maxWidth: '700px',
        width: '100%',
        marginBottom: '30px',
      }}>
        {Object.entries(powerUpUnlocks).map(([id, pu]) => {
          const isUnlocked = stats.unlockedPowerUps.includes(id);
          const canAfford = stats.stars >= pu.cost;

          return (
            <div
              key={id}
              onClick={() => !isUnlocked && pu.cost > 0 && canAfford && unlockPowerUp(id)}
              style={{
                background: isUnlocked
                  ? 'rgba(80, 200, 120, 0.2)'
                  : canAfford
                    ? 'rgba(255, 128, 255, 0.1)'
                    : 'rgba(100, 100, 100, 0.1)',
                border: `2px solid ${isUnlocked ? '#50c878' : canAfford ? '#ff80ff' : '#444'}`,
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                cursor: isUnlocked || pu.cost === 0 ? 'default' : canAfford ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : canAfford ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{pu.emoji}</div>
              <div style={{ fontWeight: '600', fontSize: '12px' }}>{pu.name}</div>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{pu.desc}</div>
              {isUnlocked || pu.cost === 0 ? (
                <span style={{ color: '#50c878', fontSize: '11px' }}>✓ Unlocked</span>
              ) : (
                <span style={{ color: canAfford ? '#ffd700' : '#666', fontSize: '11px' }}>⭐ {pu.cost}</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setGameState('menu')}
        style={{
          padding: '12px 32px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ← Back to Menu
      </button>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    }}>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'select' && renderEnemySelect()}
      {gameState === 'shop' && renderShop()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.BreakoutGame = BreakoutGame;
