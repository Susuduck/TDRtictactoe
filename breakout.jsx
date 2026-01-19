const { useState, useEffect, useCallback, useRef } = React;

const BreakoutGame = () => {
  // Game constants - larger play area that fits on screen
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 650;
  const PADDLE_WIDTH = 120;
  const PADDLE_HEIGHT = 16;
  const PADDLE_OFFSET_BOTTOM = 25;
  const BALL_RADIUS = 10;
  const BRICK_ROWS = 6;
  const BRICK_COLS = 12;
  // Bricks: 12*68 + 11*4 = 816 + 44 = 860, centered in 900
  const BRICK_WIDTH = 68;
  const BRICK_HEIGHT = 24;
  const BRICK_PADDING = 4;
  const BRICK_OFFSET_TOP = 70;
  const BRICK_OFFSET_LEFT = 20; // (900 - 860) / 2
  const DASH_SPEED = 35;
  const DASH_COOLDOWN = 800;
  const TEDDY_METER_MAX = 100;
  const KEYBOARD_SPEED = 12;

  // === DIFFICULTY SCALING SYSTEM ===
  // Global level = enemyIndex * 10 + levelNumber (1-100)
  const getDifficulty = (enemyIndex, level) => {
    const globalLevel = enemyIndex * 10 + level;
    const t = (globalLevel - 1) / 99; // 0 to 1 progression

    return {
      globalLevel,
      ballSpeed: 7 + t * 8,                    // 7 -> 15
      brickHealthBonus: Math.floor(t * 6),     // 0 -> 6
      basePaddleWidth: 120 - t * 40,           // 120 -> 80
      powerUpChance: 0.15 - t * 0.10,          // 15% -> 5%
      enemyCount: Math.floor(1 + t * 5),       // 1 -> 6
      enemySpeed: 1 + t * 2,                   // 1 -> 3 multiplier
      enemySpawnRate: 8000 - t * 5000,         // 8s -> 3s between spawns
    };
  };

  // === PIXEL ART ENEMY SPRITES ===
  // Each sprite is a 2D array where each value is a color or null (transparent)
  // Sprites are 16x16 pixels, scaled up when rendered
  const ENEMY_SPRITES = {
    // Slime - simple bouncing blob
    slime: {
      frames: [
        // Frame 1 - squished
        [
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '....GGGGGG......',
          '...GGGGGGGG.....',
          '..GGgGGgGGGG....',
          '..GGGGGGGGGG....',
          '.GGGGGGGGGGGG...',
          '.GGGGGGGGGGGG...',
          '................',
        ],
        // Frame 2 - normal
        [
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '.....GGGG.......',
          '....GGGGGG......',
          '...GGGGGGGG.....',
          '...GGgGGgGG.....',
          '...GGGGGGGG.....',
          '..GGGGGGGGGG....',
          '..GGGGGGGGGG....',
          '...GGGGGGGG.....',
          '................',
          '................',
        ],
        // Frame 3 - stretched
        [
          '................',
          '................',
          '................',
          '................',
          '.....GGGG.......',
          '....GGGGGG......',
          '....GGGGGG......',
          '...GGgGGgGG.....',
          '...GGGGGGGG.....',
          '...GGGGGGGG.....',
          '....GGGGGG......',
          '....GGGGGG......',
          '.....GGGG.......',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'G': '#44dd44', 'g': '#ffffff' }, // Green body, white eyes
      width: 16, height: 16, scale: 2,
      health: 1, points: 50, paddleReward: 5,
    },

    // Bat - flying enemy with wing flap
    bat: {
      frames: [
        // Wings up
        [
          '................',
          '..P........P....',
          '..PP......PP....',
          '..PPP....PPP....',
          '...PPP..PPP.....',
          '...PPPPPPPP.....',
          '....PPPPPP......',
          '....PrPPrP......',
          '....PPPPPP......',
          '.....PPPP.......',
          '.....P..P.......',
          '................',
          '................',
          '................',
          '................',
          '................',
        ],
        // Wings down
        [
          '................',
          '................',
          '................',
          '....PPPPPP......',
          '....PrPPrP......',
          '....PPPPPP......',
          '...PPPPPPPP.....',
          '..PPP....PPP....',
          '..PP......PP....',
          '..P........P....',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'P': '#8844aa', 'r': '#ff4444' }, // Purple body, red eyes
      width: 16, height: 16, scale: 2,
      health: 2, points: 100, paddleReward: 8,
    },

    // Ghost - spooky phasing enemy
    ghost: {
      frames: [
        // Normal
        [
          '................',
          '................',
          '.....WWWW.......',
          '....WWWWWW......',
          '...WWWWWWWW.....',
          '...WbWWWbWW.....',
          '...WWWWWWWW.....',
          '...WWWWWWWW.....',
          '...WWWWWWWW.....',
          '...WWWWWWWW.....',
          '...WW.WW.WW.....',
          '....W..W..W.....',
          '................',
          '................',
          '................',
          '................',
        ],
        // Faded
        [
          '................',
          '................',
          '.....wwww.......',
          '....wwwwww......',
          '...wwwwwwww.....',
          '...wbwwwbww.....',
          '...wwwwwwww.....',
          '...wwwwwwww.....',
          '...wwwwwwww.....',
          '...wwwwwwww.....',
          '...ww.ww.ww.....',
          '....w..w..w.....',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'W': '#ffffff', 'w': 'rgba(255,255,255,0.4)', 'b': '#222222' },
      width: 16, height: 16, scale: 2,
      health: 3, points: 200, paddleReward: 12,
    },

    // Mini-boss - larger, tougher enemy
    miniboss: {
      frames: [
        // Normal
        [
          '....RRRRRR......',
          '...RRRRRRRR.....',
          '..RRRRRRRRRR....',
          '..RRrRRRRrRR....',
          '..RRRRRRRRRR....',
          '..RRRRRRRRRR....',
          '..RR.RRRR.RR....',
          '..RRRRRRRRRR....',
          '...RRRRRRRR.....',
          '...RRR..RRR.....',
          '..RRRR..RRRR....',
          '..RRRR..RRRR....',
          '..RRR....RRR....',
          '................',
          '................',
          '................',
        ],
        // Angry
        [
          '....RRRRRR......',
          '...RRRRRRRR.....',
          '..RRRRRRRRRR....',
          '..RRrRRRRrRR....',
          '..RRRRRRRRRR....',
          '..RR.RRRR.RR....',
          '..RRRRRRRRRR....',
          '..RRRRRRRRRR....',
          '...RRRRRRRR.....',
          '...RRR..RRR.....',
          '..RRRR..RRRR....',
          '..RRRR..RRRR....',
          '..RRR....RRR....',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'R': '#dd3333', 'r': '#ffff44' }, // Red body, yellow eyes
      width: 16, height: 16, scale: 3,
      health: 5, points: 500, paddleReward: 20,
    },
  };

  // World-themed color variants for enemies
  const ENEMY_THEME_COLORS = {
    brick_goblin: { primary: '#44dd44', secondary: '#22aa22' },  // Green
    magnet_mage: { primary: '#4488ff', secondary: '#2266dd' },   // Blue
    wind_witch: { primary: '#88ddaa', secondary: '#55aa77' },    // Teal
    shadow_smith: { primary: '#aa66cc', secondary: '#7744aa' },  // Purple
    fire_phoenix: { primary: '#ff6644', secondary: '#dd4422' },  // Orange
    frost_fairy: { primary: '#66ddff', secondary: '#44aadd' },   // Cyan
    time_tortoise: { primary: '#ddaa44', secondary: '#aa7722' }, // Gold
    void_vampire: { primary: '#aa4466', secondary: '#772244' },  // Crimson
    thunder_titan: { primary: '#ffdd44', secondary: '#ddaa22' }, // Yellow
    chaos_champion: { primary: '#ff44ff', secondary: '#dd22dd' }, // Magenta
  };

  // Level definitions - hand-crafted layouts for each enemy
  // Legend: '.'=empty, '1'=1-hit, '2'=2-hit, '3'=3-hit, '#'=indestructible, '*'=powerup, 'X'=explosive
  const LEVEL_DEFINITIONS = {
    // BRICK GOBLIN - Simple shapes, learning levels
    brick_goblin: [
      // Level 1: Welcome bars - easiest intro
      [
        '111111111111',
        '............',
        '222222222222',
        '............',
        '111111111111',
        '............',
      ],
      // Level 2: Arrow pointing down
      [
        '.....22.....',
        '....2222....',
        '...222222...',
        '..22222222..',
        '.....22.....',
        '.....22.....',
      ],
      // Level 3: Heart shape
      [
        '.22....22...',
        '2222..2222..',
        '2222222222..',
        '.22222222...',
        '..222222....',
        '....22......',
      ],
      // Level 4: Diamond
      [
        '.....11.....',
        '....2222....',
        '...222222...',
        '...222222...',
        '....2222....',
        '.....11.....',
      ],
      // Level 5: Simple face
      [
        '.2222222222.',
        '.2..2..2..2.',
        '.2222222222.',
        '.2........2.',
        '.2.222222.2.',
        '.2222222222.',
      ],
      // Level 6: Castle
      [
        '3.3.3.3.3.3.',
        '333333333333',
        '33.#33#.3333',
        '333333333333',
        '33333..33333',
        '33333..33333',
      ],
      // Level 7: Goblin (their mascot)
      [
        '..333333333.',
        '.3*322223*3.',
        '.3333333333.',
        '..3.3333.3..',
        '...333333...',
        '....3..3....',
      ],
      // Level 8: Zigzag challenge
      [
        '3333........',
        '..#333......',
        '....#333....',
        '......#333..',
        '........#333',
        '333333333333',
      ],
      // Level 9: Fortress
      [
        '#2#2#2#2#2#2',
        '222222222222',
        '22.2*22*2.22',
        '222222222222',
        '22...22...22',
        '#2#2#..#2#2#',
      ],
      // Level 10: Boss - The Goblin King
      [
        '333#3333#333',
        '3*33333333*3',
        '33333##33333',
        '##33333333##',
        '3333X33X3333',
        '333333333333',
      ],
    ],

    // MAGNET MAGE - Introduces BUMPERS (O)
    magnet_mage: [
      // Level 1: Magnetic poles - 2 bumpers intro!
      [
        '222..O...222',
        '222......222',
        '............',
        '............',
        '222......222',
        '222..O...222',
      ],
      // Level 2: Horseshoe magnet - bumper in center
      [
        '33........33',
        '333......333',
        '333..O...333',
        '333......333',
        '3333333333..',
        '..33333333..',
      ],
      // Level 3: Circular orbit - bumpers ring
      [
        '...222222...',
        '..2..O...2..',
        '.2........2.',
        '.2........2.',
        '..2..O...2..',
        '...222222...',
      ],
      // Level 4: Figure 8 - bumper intersection
      [
        '..222..222..',
        '.2....O....2',
        '..222..222..',
        '..222..222..',
        '.2....O....2',
        '..222..222..',
      ],
      // Level 5: Magnetic field - bumper grid
      [
        '2..O..2..O..',
        '.2..2..2..2.',
        '..2..2..2..2',
        '2..2..2..2..',
        '.2..O..2..O.',
        '..2..2..2..2',
      ],
      // Level 6: Repulsion - bumpers protect
      [
        '333..O...333',
        '333#....#333',
        '...#.O..#...',
        '...#....#...',
        '333#....#333',
        '333..O...333',
      ],
      // Level 7: Spiral with bumpers
      [
        '333333333...',
        '....O...33..',
        '.3333333.3..',
        '.3...O...3..',
        '.3.33333.3..',
        '.3.3*..333..',
      ],
      // Level 8: Atom - bumper nucleus
      [
        '....33......',
        '.333.O333...',
        '33..33..33..',
        '33..OO..33..',
        '.333..333...',
        '....33......',
      ],
      // Level 9: Magnetic maze
      [
        '#.#.#.#.#.#.',
        '.222222222.#',
        '#.........#.',
        '.#.........#',
        '#.222222222.',
        '.#.#.#.#.#.#',
      ],
      // Level 10: Magnet Mage Boss
      [
        '33#3333#3333',
        '333*3333*333',
        '..33333333..',
        '..33333333..',
        '333*3333*333',
        '33#3333#3333',
      ],
    ],

    // WIND WITCH - Introduces PORTALS (@1 pairs)
    wind_witch: [
      // Level 1: Gentle breeze - 1 portal pair intro!
      [
        '@12.2.2.2.@1',
        '.2.2.2.2.2.2',
        '2.2.2.2.2.2.',
        '.2.2.2.2.2.2',
        '............',
        '............',
      ],
      // Level 2: Wave - portal shortcut
      [
        '22.......@1.',
        '..22........',
        '....22......',
        '......22....',
        '........22..',
        '@1........22',
      ],
      // Level 3: Double wave - 2 portal pairs
      [
        '@1......@2..',
        '..22......22',
        '....22......',
        '@2......@1..',
        '..22......22',
        '....22......',
      ],
      // Level 4: Tornado - portal in eye
      [
        '.....33.....',
        '....3333....',
        '...22@122...',
        '..22@12222..',
        '.1111111111.',
        '111111111111',
      ],
      // Level 5: Swirl - portal + bumpers
      [
        '..O.2222222.',
        '...2....@1..',
        '..2.22222...',
        '..2.2.O.2...',
        '..2.22222...',
        '@1.2222..O..',
      ],
      // Level 6: Cloud - hidden portal
      [
        '...2222222..',
        '..222@12222.',
        '.22222222222',
        '.22222222222',
        '..222@12222.',
        '....22222...',
      ],
      // Level 7: Lightning bolt - portal chain
      [
        '@1....33333.',
        '.....333.@2.',
        '....333.....',
        '@2.33333....',
        '.....333....',
        '......3333@1',
      ],
      // Level 8: Gusts - 3 portal pairs!
      [
        '@1.222.@2..@3',
        '..222..#..22',
        '@2222.@3.222',
        '222..#..222.',
        '22..#..222..',
        '@3.#.@1222.@2',
      ],
      // Level 9: Storm
      [
        '3X3.3X3.3X3.',
        '333333333333',
        '.#.#.#.#.#.#',
        '333333333333',
        '3X3.3X3.3X3.',
        '............',
      ],
      // Level 10: Wind Witch Boss
      [
        '..3333333...',
        '.33*3333*33.',
        '333333333333',
        '#....33....#',
        '.333333333..',
        '..#......#..',
      ],
    ],

    // SHADOW SMITH - Introduces SPAWNERS (S)
    shadow_smith: [
      // Level 1: Shadows - 1 spawner intro!
      [
        '22..22.S22..',
        '..22..22..22',
        '22..22..22..',
        '..22..22..22',
        '22..22..22..',
        '..22..22..22',
      ],
      // Level 2: Corridor - spawner behind wall
      [
        '######S#####',
        '#..........#',
        '#.########.#',
        '#.########.#',
        '#..........#',
        '############',
      ],
      // Level 3: Hidden chamber - 2 spawners
      [
        '33333S333333',
        '3..........3',
        '3.333..333.3',
        '3.3.*..*.3.3',
        '3.333..333.3',
        '33333S333333',
      ],
      // Level 4: Forge - spawner + bumpers
      [
        '#.S#33#S.#..',
        '.333333333..',
        '.33O333O33..',
        '.33#33#33...',
        '.333333333..',
        '#..#..#..#..',
      ],
      // Level 5: Anvil - protected spawner
      [
        '....3S33....',
        '...333333...',
        '..33333333..',
        '333333333333',
        '.....##.....',
        '....####....',
      ],
      // Level 6: Crossed swords - spawner + portals
      [
        'S........S..',
        '.3..@1..3...',
        '..3....3....',
        '...3333.....',
        '..3....3....',
        '.3..@1..3...',
      ],
      // Level 7: Dungeon - 3 spawners!
      [
        '#S#2#2#2#S#2',
        '2.........2.',
        '#.22..22..#.',
        '2....S....2.',
        '#.22..22..#.',
        '#2#2#2#2#2#2',
      ],
      // Level 8: Shadow maze - spawner maze
      [
        '###S###.###.',
        '..#...#...#.',
        '.##.#.#S#.#.',
        '.#..#.#.#...',
        '.#.##.###.##',
        'S..........#',
      ],
      // Level 9: The void
      [
        '333333333333',
        '3#3#3#3#3#3#',
        '333333333333',
        '3*3*3*3*3*3*',
        '333333333333',
        '3#3#3#3#3#3#',
      ],
      // Level 10: Shadow Smith Boss
      [
        '#33#33#33#33',
        '3333333333*3',
        '33########33',
        '33########33',
        '3*3333333333',
        '#33#33#33#33',
      ],
    ],

    // FIRE PHOENIX - ALL FEATURES COMBINED (midpoint world!)
    fire_phoenix: [
      // Level 1: Embers - review bumpers
      [
        '..1.O.1...1.',
        '.1.1.1.1.1..',
        '1...1...1..1',
        '.1.1.1.1.1..',
        '..1.O.1...1.',
        '............',
      ],
      // Level 2: Rising flames - bumpers + explosives
      [
        '.....O......',
        '..2......2..',
        '.222.O..222.',
        '22222..22222',
        '222222222222',
        '33X333X33333',
      ],
      // Level 3: Fireball - portals
      [
        '@1..2222..@1',
        '..22222222..',
        '.2222222222.',
        '.2222222222.',
        '..22222222..',
        '@2..2222..@2',
      ],
      // Level 4: Candles - spawners!
      [
        'S.1...1...1S',
        '.222.222.222',
        '.2#2.2#2.2#2',
        '.2#2.2#2.2#2',
        '.2#2.2#2.2#2',
        '.###.###.###',
      ],
      // Level 5: Wings spread - all features!
      [
        'S..O....O..S',
        '33........33',
        '333.@1@1.333',
        '33333333333.',
        '.3333333333.',
        '..33333333..',
      ],
      // Level 6: Inferno - intense combo
      [
        '1X1X1X1X1X1X',
        '222O2222O222',
        '33333S333333',
        '333333333333',
        '222O2222O222',
        '1X1X1X1X1X1X',
      ],
      // Level 7: Phoenix rising - portal wings
      [
        '@1..33..@2..',
        '...3333.....',
        '..33O.33....',
        '.33....33...',
        '@2333333@1..',
        '..333333....',
      ],
      // Level 8: Fire maze - everything!
      [
        '#S#333#.#333',
        '.X.3O3.X.333',
        '#@1333#@1333',
        '333#.#333#.#',
        '333.X.333.X.',
        '333#.#333#.#',
      ],
      // Level 9: Volcano
      [
        '....XXX.....',
        '...X333X....',
        '..X33333X...',
        '.X3333333X..',
        '#333333333#.',
        '############',
      ],
      // Level 10: Fire Phoenix Boss
      [
        '..*3333*33..',
        '..33333333..',
        '.3333##3333.',
        '333333333333',
        '3X33X33X33X3',
        '#3#3#33#3#3#',
      ],
    ],
  };

  // Default fallback pattern for enemies without custom levels
  const DEFAULT_LEVEL = [
    '222222222222',
    '222222222222',
    '222222222222',
    '222222222222',
    '222222222222',
    '222222222222',
  ];

  // Game state
  const [gameState, setGameState] = useState('menu');
  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, vx: 0 });
  const [balls, setBalls] = useState([]);
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [victoryInfo, setVictoryInfo] = useState(null); // { level, score, stars, isNewBest } - set after completing a level
  const [isPaused, setIsPaused] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Power-ups
  const [powerUps, setPowerUps] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);

  // Gimmick state
  const [gimmickData, setGimmickData] = useState({});

  // === ENEMY SYSTEM ===
  const [enemies, setEnemies] = useState([]);
  const [lastEnemySpawn, setLastEnemySpawn] = useState(0);
  const [difficulty, setDifficulty] = useState(null); // Current difficulty settings

  // === PINBALL FEATURES ===
  const [bumpers, setBumpers] = useState([]); // Circular bounce objects
  const [portals, setPortals] = useState([]); // Paired teleporters
  const [spawners, setSpawners] = useState([]); // Enemy spawn points

  // Visual effects
  const [particles, setParticles] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [powerUpAnnouncement, setPowerUpAnnouncement] = useState(null);
  const [fallingHearts, setFallingHearts] = useState([]); // Heart break animation
  const [paddleVelocity, setPaddleVelocity] = useState(0); // For keyboard ease-out

  // === NEW: Teddyball Player Mechanics ===
  // Dash system
  const [dashCooldown, setDashCooldown] = useState(0);
  const [isDashing, setIsDashing] = useState(false);

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
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        // Ensure fields exist for migration
        enemyStars: parsed.enemyStars || {},
        enemiesDefeated: parsed.enemiesDefeated || {},
        highestLevels: parsed.highestLevels || {},
        levelStats: parsed.levelStats || {}, // Per-level stats: levelStats[enemyId][level] = { bestScore, stars, completed }
      };
    }
    return {
      totalScore: 0,
      gamesPlayed: 0,
      levelsCompleted: 0,
      highScores: {},
      stars: 0,
      // Enemy progression - stars earned per enemy (0-10, need 10 to unlock next)
      enemyStars: {},
      enemiesDefeated: {},
      highestLevels: {},
      levelStats: {}, // Per-level stats: levelStats[enemyId][level] = { bestScore, stars, completed }
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
  const keysRef = useRef({ left: false, right: false, space: false, shift: false, q: false, w: false, e: false });
  const lastTimeRef = useRef(Date.now());
  const comboTimerRef = useRef(null);
  const paddleLastX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  // Refs for keyboard handling to avoid dependency issues
  const lastTapLeftRef = useRef(0);
  const lastTapRightRef = useRef(0);
  const dashCooldownRef = useRef(0);
  const teddyMeterRef = useRef(0);
  const teddyAbilityActiveRef = useRef(null);
  const isChargingRef = useRef(false);
  const chargeLevelRef = useRef(0);
  const ballsRef = useRef([]);
  const bricksRef = useRef([]);
  const paddleRef = useRef(paddle);

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

  // Enemy progression helpers - sequential unlocking
  const STARS_TO_UNLOCK = 10; // Stars needed to unlock next enemy
  const POINTS_PER_STAR = 200; // Score needed per star (2000 total to fully complete an enemy)

  const getEnemyStars = (enemyId) => stats.enemyStars[enemyId] || 0;

  const isEnemyUnlocked = (enemyIndex) => {
    if (enemyIndex === 0) return true; // First enemy always unlocked
    const prevEnemy = enemyDefs[enemyIndex - 1];
    return getEnemyStars(prevEnemy.id) >= STARS_TO_UNLOCK;
  };

  const isEnemyComplete = (enemyId) => getEnemyStars(enemyId) >= STARS_TO_UNLOCK;

  // Level star thresholds - score needed for 1/2/3 stars (scales with level)
  const MAX_LEVELS = 10;
  const calculateLevelStars = (score, level) => {
    const baseThresholds = [150, 350, 600]; // Base thresholds for level 1
    const multiplier = 1 + (level - 1) * 0.3; // 30% harder per level
    const thresholds = baseThresholds.map(t => Math.floor(t * multiplier));
    if (score >= thresholds[2]) return 3;
    if (score >= thresholds[1]) return 2;
    if (score >= thresholds[0]) return 1;
    return 0;
  };

  const getLevelStats = (enemyId, level) => {
    return stats.levelStats[enemyId]?.[level] || { bestScore: 0, stars: 0, completed: false };
  };

  const getTotalStarsForEnemy = (enemyId) => {
    const enemyLevelStats = stats.levelStats[enemyId] || {};
    return Object.values(enemyLevelStats).reduce((sum, ls) => sum + (ls.stars || 0), 0);
  };

  // Keep refs in sync with state for keyboard handlers
  useEffect(() => { dashCooldownRef.current = dashCooldown; }, [dashCooldown]);
  useEffect(() => { teddyMeterRef.current = teddyMeter; }, [teddyMeter]);
  useEffect(() => { teddyAbilityActiveRef.current = teddyAbilityActive; }, [teddyAbilityActive]);
  useEffect(() => { isChargingRef.current = isCharging; }, [isCharging]);
  useEffect(() => { chargeLevelRef.current = chargeLevel; }, [chargeLevel]);
  useEffect(() => { ballsRef.current = balls; }, [balls]);
  useEffect(() => { bricksRef.current = bricks; }, [bricks]);
  useEffect(() => { paddleRef.current = paddle; }, [paddle]);

  // Keyboard controls with dash and Teddy abilities - stable event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const now = Date.now();

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        // Double-tap detection for dash
        if (!keysRef.current.left && now - lastTapLeftRef.current < 300 && dashCooldownRef.current <= 0) {
          // Trigger dash left!
          setIsDashing(true);
          setDashCooldown(DASH_COOLDOWN);
          setPaddle(p => ({ ...p, x: Math.max(0, p.x - DASH_SPEED * 4) }));
          setTimeout(() => setIsDashing(false), 150);
        }
        lastTapLeftRef.current = now;
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        // Double-tap detection for dash
        if (!keysRef.current.right && now - lastTapRightRef.current < 300 && dashCooldownRef.current <= 0) {
          // Trigger dash right!
          setIsDashing(true);
          setDashCooldown(DASH_COOLDOWN);
          setPaddle(p => ({ ...p, x: Math.min(CANVAS_WIDTH - p.width, p.x + DASH_SPEED * 4) }));
          setTimeout(() => setIsDashing(false), 150);
        }
        lastTapRightRef.current = now;
        keysRef.current.right = true;
        e.preventDefault();
      }

      // Shift for speed boost
      if (e.key === 'Shift') {
        keysRef.current.shift = true;
      }

      // Space for launch / charge shot
      if (e.key === ' ') {
        keysRef.current.space = true;
        const hasAttached = ballsRef.current.some(b => b.attached);
        if (hasAttached) {
          setIsCharging(true);
        }
        e.preventDefault();
      }

      // Teddy Abilities: Q, W, E
      if (e.key === 'q' || e.key === 'Q') {
        keysRef.current.q = true;
        if (teddyMeterRef.current >= TEDDY_METER_MAX && !teddyAbilityActiveRef.current) {
          activateTeddyAbility('slam');
        }
        e.preventDefault();
      }
      if (e.key === 'w' || e.key === 'W') {
        keysRef.current.w = true;
        if (teddyMeterRef.current >= TEDDY_METER_MAX && !teddyAbilityActiveRef.current) {
          activateTeddyAbility('shield');
        }
        e.preventDefault();
      }
      if (e.key === 'e' || e.key === 'E') {
        keysRef.current.e = true;
        if (teddyMeterRef.current >= TEDDY_METER_MAX && !teddyAbilityActiveRef.current) {
          activateTeddyAbility('twins');
        }
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        setGameState(gs => {
          if (gs === 'playing') {
            setIsPaused(p => !p);
            return gs;
          } else if (gs !== 'menu') {
            return 'menu';
          }
          return gs;
        });
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
        if (isChargingRef.current) {
          const power = Math.min(chargeLevelRef.current / 100, 1);
          const currentPaddle = paddleRef.current;
          if (currentPaddle) {
            setBalls(prev => prev.map(ball => {
              if (ball.attached) {
                const speed = ball.baseSpeed * (1 + power * 0.5); // Up to 50% faster
                return {
                  ...ball,
                  x: currentPaddle.x + currentPaddle.width / 2, // Launch from paddle position
                  attached: false,
                  vy: -speed,
                  charged: power > 0.5, // Charged shot if held long enough
                  damage: 1 + Math.floor(power * 2), // Up to 3x damage
                };
              }
              return ball;
            }));
          }
          setIsCharging(false);
          setChargeLevel(0);
        }
      }
      if (e.key === 'Shift') keysRef.current.shift = false;
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
  }, [activateTeddyAbility]); // Minimal dependencies - refs handle the rest

  // Mouse/pointer control for paddle - smooth and responsive
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const handlePointerMove = (e) => {
      if (activeEffects.includes('frozen')) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // Account for any CSS scaling of the canvas
      const scaleX = CANVAS_WIDTH / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;

      // Calculate paddle position centered on pointer
      setPaddle(prev => {
        const targetX = Math.max(0, Math.min(CANVAS_WIDTH - prev.width, mouseX - prev.width / 2));
        // Calculate velocity for spin effect
        const vx = (targetX - prev.x) * 2;
        const nextPaddle = { ...prev, x: targetX, vx };
        paddleRef.current = nextPaddle;
        return nextPaddle;
      });
    };

    // Touch move for mobile/trackpad
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handlePointerMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }
    };

    // Click/touch to launch ball
    const handleClick = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        // Launch attached ball on click - use paddle position
        const currentPaddle = paddleRef.current;
        if (!currentPaddle) return;
        setBalls(prev => prev.map(ball => {
          if (ball.attached) {
            return {
              ...ball,
              x: currentPaddle.x + currentPaddle.width / 2,
              attached: false,
              vy: -ball.baseSpeed,
              vx: (Math.random() - 0.5) * 2,
            };
          }
          return ball;
        }));
      }
    };

    // Use both mouse and pointer events for maximum compatibility
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('click', handleClick);

    // Touch support for mobile and some trackpads
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleClick, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', handleClick);
      }
    };
  }, [gameState, isPaused, activeEffects]);

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

  // Health tier colors - higher health = tougher appearance
  const healthTiers = [
    { minHealth: 10, color: '#505050', name: 'steel' },    // Dark grey steel
    { minHealth: 8, color: '#6a5acd', name: 'purple' },    // Purple
    { minHealth: 6, color: '#4080e0', name: 'blue' },      // Blue
    { minHealth: 4, color: '#50c878', name: 'green' },     // Green/Lime
    { minHealth: 2, color: '#ffa500', name: 'orange' },    // Orange
    { minHealth: 1, color: '#ff6b6b', name: 'red' },       // Red
  ];

  // Get color for a given health value
  const getColorForHealth = (health) => {
    for (const tier of healthTiers) {
      if (health >= tier.minHealth) return tier.color;
    }
    return '#ff6b6b'; // Default red for 1 health
  };

  // Get which tier a health value belongs to
  const getHealthTier = (health) => {
    for (let i = 0; i < healthTiers.length; i++) {
      if (health >= healthTiers[i].minHealth) return i;
    }
    return healthTiers.length - 1;
  };

  // Portal pair colors
  const PORTAL_COLORS = [
    { primary: '#4488ff', secondary: '#88bbff' }, // Blue
    { primary: '#ff8844', secondary: '#ffbb88' }, // Orange
    { primary: '#44ff88', secondary: '#88ffbb' }, // Green
    { primary: '#ff44ff', secondary: '#ff88ff' }, // Purple
  ];

  // Create brick layout from hand-crafted level definitions
  // Also creates bumpers, portals, and spawners
  const createBricks = useCallback((level, enemy) => {
    const newBricks = [];
    const newBumpers = [];
    const newPortals = [];
    const newSpawners = [];
    const portalPairs = {}; // Track portal pairs by number

    const enemyId = enemy?.id || 'brick_goblin';
    const themeColor = ENEMY_THEME_COLORS[enemyId] || ENEMY_THEME_COLORS.brick_goblin;

    // Get level definition for this enemy
    const enemyLevels = LEVEL_DEFINITIONS[enemyId] || LEVEL_DEFINITIONS.brick_goblin;
    const levelIndex = Math.min(level - 1, enemyLevels.length - 1);
    const levelDef = enemyLevels[levelIndex] || DEFAULT_LEVEL;

    // Global difficulty scaling (1-100)
    const enemyIndex = enemyDefs.findIndex(e => e.id === enemyId) || 0;
    const diff = getDifficulty(enemyIndex, level);
    const healthBonus = diff.brickHealthBonus;

    for (let row = 0; row < levelDef.length; row++) {
      const rowStr = levelDef[row];
      for (let col = 0; col < rowStr.length && col < BRICK_COLS; col++) {
        const char = rowStr[col];
        if (char === '.') continue; // Empty space

        const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
        const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
        const centerX = x + BRICK_WIDTH / 2;
        const centerY = y + BRICK_HEIGHT / 2;

        // === PINBALL FEATURES ===

        // Bumper (O)
        if (char === 'O') {
          newBumpers.push({
            id: `bumper-${row}-${col}`,
            x: centerX,
            y: centerY,
            radius: 18,
            active: true,
            hitTimer: 0, // For hit animation
            points: 25,
            color: themeColor.primary,
          });
          continue;
        }

        // Portal (@1, @2, @3, @4 - pairs)
        if (char === '@') {
          // Check next char for pair number
          const nextChar = col + 1 < rowStr.length ? rowStr[col + 1] : '1';
          const pairNum = parseInt(nextChar) || 1;
          const pairIndex = Math.min(pairNum - 1, 3);

          const portal = {
            id: `portal-${row}-${col}`,
            x: centerX,
            y: centerY,
            radius: 20,
            pairId: pairNum,
            colors: PORTAL_COLORS[pairIndex],
            animPhase: Math.random() * Math.PI * 2,
            cooldown: 0, // Prevent instant re-teleport
          };

          newPortals.push(portal);

          // Track pairs
          if (!portalPairs[pairNum]) portalPairs[pairNum] = [];
          portalPairs[pairNum].push(portal);
          continue;
        }

        // Portal pair number (skip, handled above)
        if ('1234'.includes(char) && col > 0 && rowStr[col-1] === '@') {
          continue;
        }

        // Spawner (S)
        if (char === 'S') {
          newSpawners.push({
            id: `spawner-${row}-${col}`,
            x: x,
            y: y,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            health: 3 + Math.floor(level / 10), // 3-5 hits based on level
            maxHealth: 3 + Math.floor(level / 10),
            lastSpawn: Date.now(),
            spawnInterval: 6000 - level * 30, // 6s down to 3s
            shakeAmount: 0,
            color: themeColor.primary,
          });
          continue;
        }

        // === BRICKS ===
        let health, type, color;

        switch (char) {
          case '1': // 1-hit brick
            health = 1 + healthBonus;
            type = 'normal';
            break;
          case '2': // 2-hit brick
            health = 2 + healthBonus;
            type = 'normal';
            break;
          case '3': // 3-hit brick (strong)
            health = 3 + healthBonus;
            type = 'normal';
            break;
          case '#': // Indestructible obstacle
            health = 9999;
            type = 'obstacle';
            break;
          case '*': // Power-up brick
            health = 1 + healthBonus;
            type = 'powerup';
            break;
          case 'X': // Explosive brick
            health = 1;
            type = 'explosive';
            break;
          default:
            continue; // Unknown character, skip
        }

        // Cap health
        health = Math.min(health, 12);

        // Determine color
        if (type === 'obstacle') {
          color = '#2a2a4e';
        } else if (type === 'explosive') {
          color = '#ff4400';
        } else if (type === 'powerup') {
          color = '#ffd700';
        } else {
          color = getColorForHealth(health);
        }

        // Invisible bricks for Shadow Smith
        const invisChance = enemy?.gimmick === 'invisible_bricks' ? Math.min(0.15 + level * 0.03, 0.4) : 0;
        const isInvisible = type === 'normal' && Math.random() < invisChance;

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
          canRegenerate: enemy?.gimmick === 'regenerating_bricks' && type === 'normal' && Math.random() < 0.15,
        });
      }
    }

    // Link portal pairs
    newPortals.forEach(portal => {
      const pair = portalPairs[portal.pairId];
      if (pair && pair.length === 2) {
        const other = pair.find(p => p.id !== portal.id);
        if (other) portal.linkedPortalId = other.id;
      }
    });

    // Set pinball feature states
    setBumpers(newBumpers);
    setPortals(newPortals);
    setSpawners(newSpawners);

    return newBricks;
  }, []);

  // Create particles (with limit to prevent memory issues)
  const MAX_PARTICLES = 200;
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
    setParticles(p => [...p, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Create cracking armor particles - fall downward with angular shapes
  const createCrackingParticles = useCallback((x, y, width, height, color) => {
    const newParticles = [];
    // Create multiple "shard" particles that fall and fade
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 2 + 1, // Fall downward
        color,
        size: 4 + Math.random() * 6, // Larger chunks
        life: 1.5, // Last longer
        isShard: true, // Mark as shard for different rendering
        rotation: Math.random() * 45, // Fixed rotation at creation time
      });
    }
    setParticles(p => [...p, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Add floating text (with limit to prevent memory issues)
  const MAX_FLOATING_TEXTS = 30;
  const addFloatingText = useCallback((x, y, text, color) => {
    setFloatingTexts(prev => [...prev, {
      id: Date.now() + Math.random(),
      x, y, text, color,
      life: 1,
    }].slice(-MAX_FLOATING_TEXTS));
  }, []);

  // Show prominent powerup announcement
  const showPowerUpAnnouncement = useCallback((emoji, name, color, isGood = true) => {
    setPowerUpAnnouncement({ emoji, name, color, isGood, id: Date.now() });
    // Auto-hide after animation
    setTimeout(() => setPowerUpAnnouncement(null), 1500);
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
        // Scale regen chance with level - very rare on level 1
        const regenChance = currentLevel === 1 ? 0.002 : currentLevel === 2 ? 0.005 : 0.008;
        if (Math.random() < regenChance) {
          setBricks(prev => {
            const destroyed = prev.filter(b => b.health <= 0 && b.canRegenerate);
            if (destroyed.length > 0) {
              const toRegen = destroyed[Math.floor(Math.random() * destroyed.length)];
              // Visual effect for regeneration
              createParticles(toRegen.x + BRICK_WIDTH/2, toRegen.y + BRICK_HEIGHT/2, '#50ff50', 12);
              addFloatingText(toRegen.x + BRICK_WIDTH/2, toRegen.y, '🔄', '#50ff50');
              return prev.map(b => b.id === toRegen.id ? { ...b, health: 1, hitFlash: 0.5 } : b);
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
  }, [selectedEnemy, activeEffects, gimmickData, currentLevel, createParticles, addFloatingText]);

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

      // Move paddle with keyboard - direct and responsive
      if (!activeEffects.includes('frozen')) {
        const currentPaddle = paddleRef.current;
        const leftPressed = keysRef.current.left;
        const rightPressed = keysRef.current.right;

        if (leftPressed || rightPressed) {
          // Direct movement - constant speed, immediate response
          const speed = isDashing ? DASH_SPEED : keysRef.current.shift ? 24 : KEYBOARD_SPEED;

          let moveAmount = 0;
          if (leftPressed && !rightPressed) moveAmount = -speed * deltaTime;
          if (rightPressed && !leftPressed) moveAmount = speed * deltaTime;

          if (moveAmount !== 0) {
            let newX = currentPaddle.x + moveAmount;
            newX = Math.max(0, Math.min(CANVAS_WIDTH - currentPaddle.width, newX));

            const nextPaddle = { ...currentPaddle, x: newX, vx: moveAmount / deltaTime };
            paddleRef.current = nextPaddle;
            setPaddle(nextPaddle);
          }
        }
        // When no keys pressed, mouse controls take over (handled in separate useEffect)
      }

      // Move balls
      setBalls(prev => {
        let newBalls = prev.map(ball => {
          if (ball.attached) {
            return ball;
          }

          let { x, y, vx, vy, burning } = ball;
          let attached = ball.attached;
          let wasAttached = ball.wasAttached;

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

          const paddleSnapshot = paddleRef.current;

          // Paddle collision (main paddle)
          if (y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM &&
              y + BALL_RADIUS <= CANVAS_HEIGHT - 10 &&
              x >= paddleSnapshot.x && x <= paddleSnapshot.x + paddleSnapshot.width) {

            // Calculate bounce angle based on hit position
            const hitPos = (x - paddleSnapshot.x) / paddleSnapshot.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            const speed = Math.sqrt(vx * vx + vy * vy);

            // === SPIN CONTROL: Add paddle velocity to ball ===
            const spinFactor = paddleSnapshot.vx * 0.15; // Paddle velocity affects ball
            vx = Math.sin(angle) * speed + spinFactor;
            vy = -Math.abs(Math.cos(angle) * speed);
            y = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - BALL_RADIUS;

            // Magnet catch (from upgrade or power-up or enemy gimmick)
            const hasMagnet = stats.upgrades.magnetCatch ||
                             activeEffects.includes('magnet') ||
                             selectedEnemy?.gimmick === 'magnet_paddle';
            if (hasMagnet && !wasAttached) {
              // Ball sticks - will launch on space
              attached = true;
              wasAttached = true;
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

          // Twin paddle collision (Teddy Twins ability)
          if (twinPaddle?.active) {
            // Twin is mirrored on opposite side
            const twinX = CANVAS_WIDTH - paddleSnapshot.x - paddleSnapshot.width;
            if (y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM &&
                y + BALL_RADIUS <= CANVAS_HEIGHT - 10 &&
                x >= twinX && x <= twinX + paddleSnapshot.width) {

              const hitPos = (x - twinX) / paddleSnapshot.width;
              const angle = (hitPos - 0.5) * Math.PI * 0.7;
              const speed = Math.sqrt(vx * vx + vy * vy);

              vx = Math.sin(angle) * speed - (paddleSnapshot.vx * 0.15); // Inverse spin
              vy = -Math.abs(Math.cos(angle) * speed);
              y = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - BALL_RADIUS;

              createParticles(x, y, '#ff80ff', 8);
            }
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

          return { ...ball, x, y, vx, vy, attached, wasAttached };
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
          const bricksSnapshot = bricksRef.current;
          let hitBrickId = null;
          let usedChargedBonus = false;

          for (const brick of bricksSnapshot) {
            if (brick.health <= 0) continue;
            if (x + BALL_RADIUS > brick.x &&
                x - BALL_RADIUS < brick.x + brick.width &&
                y + BALL_RADIUS > brick.y &&
                y - BALL_RADIUS < brick.y + brick.height) {
              // Track which brick was hit for damage application
              hitBrickId = brick.id;

              // Determine bounce direction
              const overlapLeft = (x + BALL_RADIUS) - brick.x;
              const overlapRight = (brick.x + brick.width) - (x - BALL_RADIUS);
              const overlapTop = (y + BALL_RADIUS) - brick.y;
              const overlapBottom = (brick.y + brick.height) - (y - BALL_RADIUS);

              const minOverlapX = Math.min(overlapLeft, overlapRight);
              const minOverlapY = Math.min(overlapTop, overlapBottom);

              // Obstacles and burning balls have special bounce rules
              // Obstacles ALWAYS bounce the ball (they're solid)
              // Burning balls pass through normal bricks but bounce off obstacles and bosses
              if (!burning || brick.type === 'boss' || brick.type === 'obstacle') {
                if (minOverlapX < minOverlapY) {
                  vx = -vx;
                  x = overlapLeft < overlapRight
                    ? brick.x - BALL_RADIUS
                    : brick.x + brick.width + BALL_RADIUS;
                } else {
                  vy = -vy;
                  y = overlapTop < overlapBottom
                    ? brick.y - BALL_RADIUS
                    : brick.y + brick.height + BALL_RADIUS;
                }

                // Chaos clown random bounce
                if (selectedEnemy?.gimmick === 'random_bounces' && Math.random() < 0.3) {
                  vx += (Math.random() - 0.5) * 3;
                  vy += (Math.random() - 0.5) * 2;
                }
              }
              break;
            }
          }

          // Apply damage to hit brick using tracked ID instead of re-checking collision
          if (hitBrickId !== null) {
            setBricks(prevBricks => {
              return prevBricks.map(brick => {
                if (brick.id !== hitBrickId || brick.health <= 0) return brick;

                // Obstacles are indestructible - just bounce and create particles
                if (brick.type === 'obstacle') {
                  createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#6a6a9a', 4);
                  return brick; // No damage to obstacles
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

                // Track tier before damage for armor cracking effect
                const oldTier = getHealthTier(brick.health);
                const oldColor = getColorForHealth(brick.health);

                const newHealth = brick.health - damage;
                const newTier = getHealthTier(Math.max(1, newHealth));
                const newColor = getColorForHealth(Math.max(1, newHealth));

                // Points based on brick's max health (tougher bricks = more points)
                const points = brick.type === 'boss' ? 50 :
                               brick.type === 'explosive' ? 40 :
                               brick.maxHealth >= 8 ? 30 :
                               brick.maxHealth >= 4 ? 20 : 10;

                // Armor cracking effect - when tier changes, old layer breaks off
                if (newHealth > 0 && newTier !== oldTier && brick.type !== 'boss' && brick.type !== 'explosive') {
                  createCrackingParticles(brick.x, brick.y, brick.width, brick.height, oldColor);
                  // Small score bonus for cracking armor
                  setScore(s => s + 5);
                }

                // Charged shot bonus (one-time, tracked via usedChargedBonus)
                if (ball.charged && !usedChargedBonus) {
                  setScore(s => s + points * 0.5);
                  usedChargedBonus = true;
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

                  // Final destruction particles use the last color
                  createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, newColor, 12);
                  addFloatingText(brick.x + brick.width / 2, brick.y, `+${Math.floor(points * (1 + combo * 0.1))}`, newColor);

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
                        createParticles(b.x + b.width / 2, b.y + b.height / 2, getColorForHealth(b.health), 8);
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
                }

                // Update brick with new health, color, hit flash, and reveal if invisible
                return {
                  ...brick,
                  health: newHealth,
                  hitFlash: 1, // Start flash effect
                  invisible: false, // Reveal on hit (no mutation)
                  color: brick.type === 'boss' ? '#ffd700' :
                         brick.type === 'explosive' ? '#ff4400' :
                         newColor
                };
              });
            });
          }

          return { ...ball, x, y, vx, vy, charged: usedChargedBonus ? false : ball.charged };
        });
      });

      // Move power-ups (use paddleRef for current position, avoid state mutation)
      setPowerUps(prev => {
        const currentPaddle = paddleRef.current;
        return prev
          .map(pu => ({ ...pu, y: pu.y + pu.vy * deltaTime }))
          .filter(pu => {
            // Check paddle collision
            if (pu.y + 30 >= CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM &&
                currentPaddle &&
                pu.x >= currentPaddle.x && pu.x <= currentPaddle.x + currentPaddle.width) {

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

      // Update falling hearts animation
      setFallingHearts(prev => prev
        .map(heart => ({
          ...heart,
          y: heart.y + heart.vy * deltaTime,
          vy: heart.vy + 0.5 * deltaTime, // gravity
          rotation: heart.rotation + heart.rotationSpeed * deltaTime,
          opacity: heart.opacity - 0.008 * deltaTime,
          pieces: heart.pieces.map(piece => ({
            ...piece,
            x: piece.x + piece.vx * deltaTime,
            y: piece.y + piece.vy * deltaTime,
            vy: piece.vy + 0.3 * deltaTime,
            rotation: piece.rotation + (piece.vx > 0 ? 3 : -3) * deltaTime,
          }))
        }))
        .filter(heart => heart.opacity > 0 && heart.y < CANVAS_HEIGHT + 100)
      );

      // Decay brick hit flash
      setBricks(prev => prev.map(b => b.hitFlash > 0 ? { ...b, hitFlash: b.hitFlash - 0.1 * deltaTime } : b));

      // === ENEMY SYSTEM UPDATE ===
      // Spawn enemies based on difficulty
      if (difficulty && enemies.length < difficulty.enemyCount) {
        const timeSinceSpawn = now - lastEnemySpawn;
        if (timeSinceSpawn > difficulty.enemySpawnRate) {
          const newEnemy = spawnEnemy();
          if (newEnemy) {
            setEnemies(prev => [...prev, newEnemy]);
            setLastEnemySpawn(now);
          }
        }
      }

      // Update enemy positions
      updateEnemies(deltaTime * 16.67); // Pass actual ms delta

      // Ball-Enemy collision
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          if (ball.attached) return ball;

          enemies.forEach(enemy => {
            // Skip phased ghosts
            if (enemy.isPhased) return;

            // Circle-rectangle collision
            const closestX = Math.max(enemy.x, Math.min(ball.x, enemy.x + enemy.width));
            const closestY = Math.max(enemy.y, Math.min(ball.y, enemy.y + enemy.height));
            const distX = ball.x - closestX;
            const distY = ball.y - closestY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < BALL_RADIUS) {
              // Hit enemy!
              damageEnemy(enemy.id, ball.damage || 1);

              // Bounce ball
              if (Math.abs(distX) > Math.abs(distY)) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }
            }
          });

          return ball;
        });
      });

      // === PINBALL FEATURE COLLISIONS ===

      // Ball-Bumper collision
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          if (ball.attached) return ball;

          bumpers.forEach(bumper => {
            const dx = ball.x - bumper.x;
            const dy = ball.y - bumper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_RADIUS + bumper.radius) {
              // Hit bumper! Bounce with force
              const angle = Math.atan2(dy, dx);
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              const boostSpeed = Math.max(speed * 1.2, ball.baseSpeed * 1.1); // Boost on hit

              ball.vx = Math.cos(angle) * boostSpeed;
              ball.vy = Math.sin(angle) * boostSpeed;

              // Move ball outside bumper
              ball.x = bumper.x + Math.cos(angle) * (BALL_RADIUS + bumper.radius + 2);
              ball.y = bumper.y + Math.sin(angle) * (BALL_RADIUS + bumper.radius + 2);

              // Score and visual feedback
              setScore(s => s + bumper.points);
              addFloatingText(bumper.x, bumper.y - 20, `+${bumper.points}`, bumper.color);

              // Trigger hit animation
              setBumpers(prev => prev.map(b =>
                b.id === bumper.id ? { ...b, hitTimer: 10 } : b
              ));
            }
          });

          return ball;
        });
      });

      // Ball-Portal collision
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          if (ball.attached || ball.portalCooldown > 0) return ball;

          for (const portal of portals) {
            if (portal.cooldown > 0) continue;

            const dx = ball.x - portal.x;
            const dy = ball.y - portal.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_RADIUS + portal.radius * 0.6) {
              // Find linked portal
              const linkedPortal = portals.find(p => p.id === portal.linkedPortalId);
              if (linkedPortal) {
                // Teleport ball to linked portal
                const exitAngle = Math.atan2(ball.vy, ball.vx);
                ball.x = linkedPortal.x + Math.cos(exitAngle) * (linkedPortal.radius + BALL_RADIUS + 5);
                ball.y = linkedPortal.y + Math.sin(exitAngle) * (linkedPortal.radius + BALL_RADIUS + 5);

                // Set cooldown to prevent instant re-teleport
                ball.portalCooldown = 30;

                // Visual feedback
                createParticles(portal.x, portal.y, portal.colors.primary, 8);
                createParticles(linkedPortal.x, linkedPortal.y, linkedPortal.colors.secondary, 8);

                // Set portal cooldowns
                setPortals(prev => prev.map(p =>
                  p.id === portal.id || p.id === linkedPortal.id
                    ? { ...p, cooldown: 30 }
                    : p
                ));

                break; // Only teleport once per frame
              }
            }
          }

          // Decay portal cooldown
          if (ball.portalCooldown > 0) {
            ball.portalCooldown--;
          }

          return ball;
        });
      });

      // Ball-Spawner collision
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          if (ball.attached) return ball;

          spawners.forEach(spawner => {
            if (spawner.health <= 0) return;

            // Rectangle collision
            const closestX = Math.max(spawner.x, Math.min(ball.x, spawner.x + spawner.width));
            const closestY = Math.max(spawner.y, Math.min(ball.y, spawner.y + spawner.height));
            const dx = ball.x - closestX;
            const dy = ball.y - closestY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_RADIUS) {
              // Damage spawner
              setSpawners(prev => prev.map(s => {
                if (s.id !== spawner.id) return s;
                const newHealth = s.health - 1;
                if (newHealth <= 0) {
                  // Spawner destroyed!
                  setScore(sc => sc + 200);
                  addFloatingText(s.x + s.width/2, s.y, '+200 DESTROYED!', '#ffd700');
                  createParticles(s.x + s.width/2, s.y + s.height/2, s.color, 20);
                  return { ...s, health: 0 };
                }
                return { ...s, health: newHealth, shakeAmount: 8 };
              }));

              // Bounce ball
              if (Math.abs(dx) > Math.abs(dy)) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }
            }
          });

          return ball;
        });
      });

      // Update bumper hit timers
      setBumpers(prev => prev.map(b => ({
        ...b,
        hitTimer: Math.max(0, b.hitTimer - deltaTime)
      })));

      // Update portal cooldowns
      setPortals(prev => prev.map(p => ({
        ...p,
        cooldown: Math.max(0, p.cooldown - 1),
        animPhase: p.animPhase + 0.05
      })));

      // Update spawners - spawn enemies and decay shake
      setSpawners(prev => prev.map(s => {
        if (s.health <= 0) return s;

        let updated = { ...s, shakeAmount: Math.max(0, s.shakeAmount - 0.5) };

        // Check if should spawn enemy
        if (now - s.lastSpawn > s.spawnInterval && enemies.length < (difficulty?.enemyCount || 3) + 2) {
          // Spawn an enemy from this spawner
          const newEnemy = spawnEnemy();
          if (newEnemy) {
            // Position enemy at spawner
            newEnemy.x = s.x + s.width / 2 - newEnemy.width / 2;
            newEnemy.y = s.y + s.height;
            setEnemies(e => [...e, newEnemy]);
            updated.lastSpawn = now;
            // Visual feedback
            createParticles(s.x + s.width/2, s.y + s.height, s.color, 6);
          }
        }

        return updated;
      }));

      // Check level complete (obstacles don't count toward completion)
      setBricks(prev => {
        const remaining = prev.filter(b => b.health > 0 && b.type !== 'boss' && b.type !== 'obstacle');
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
  }, [gameState, isPaused, selectedEnemy, activeEffects, applyGimmick, gimmickData, combo, maxCombo, paddle, spawnPowerUp, createParticles, addFloatingText, currentLevel, difficulty, enemies, lastEnemySpawn, spawnEnemy, updateEnemies, damageEnemy, bumpers, portals, spawners]);

  const applyPowerUp = (type) => {
    // Handle character-specific rare power-ups
    if (type.startsWith('rare_')) {
      applyRarePowerUp(type.replace('rare_', ''));
      return;
    }

    switch (type) {
      case 'expand':
        setPaddle(p => ({ ...p, width: Math.min(200, p.width + 20) }));
        showPowerUpAnnouncement('📏', 'EXPAND!', '#50c878', true);
        break;
      case 'shrink':
        setPaddle(p => ({ ...p, width: Math.max(40, p.width - 20) }));
        showPowerUpAnnouncement('📐', 'SHRINK!', '#ff6b6b', false);
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
        showPowerUpAnnouncement('✨', 'MULTI-BALL!', '#ffd700', true);
        break;
      case 'fast':
        setActiveEffects(e => [...e.filter(ef => ef !== 'slow'), 'fast']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'fast')), 5000);
        showPowerUpAnnouncement('⚡', 'SPEED UP!', '#ffff00', false);
        break;
      case 'slow':
        setActiveEffects(e => [...e.filter(ef => ef !== 'fast'), 'slow']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'slow')), 5000);
        showPowerUpAnnouncement('🐌', 'SLOW DOWN!', '#80c0ff', true);
        break;
      case 'life':
        // Heal paddle (restore width)
        setPaddle(p => {
          const healAmount = 20;
          const maxWidth = 200;
          const newWidth = Math.min(maxWidth, p.width + healAmount);
          const newPaddle = { ...p, width: newWidth };
          paddleRef.current = newPaddle;
          return newPaddle;
        });
        showPowerUpAnnouncement('💚', 'HEAL!', '#44ff66', true);
        break;
      case 'laser':
        setActiveEffects(e => [...e, 'laser']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'laser')), 8000);
        showPowerUpAnnouncement('🔫', 'LASER MODE!', '#ff00ff', true);
        break;
      case 'shield':
        setActiveEffects(e => [...e, 'shield']);
        showPowerUpAnnouncement('🛡️', 'SHIELD!', '#4080ff', true);
        break;
      case 'magnet':
        setActiveEffects(e => [...e, 'magnet']);
        setTimeout(() => setActiveEffects(e => e.filter(ef => ef !== 'magnet')), 15000);
        showPowerUpAnnouncement('🧲', 'MAGNET!', '#4080e0', true);
        break;
      case 'mega':
        // Mega ball - smashes through everything!
        setBalls(prev => prev.map(ball => ({ ...ball, mega: true, burning: true })));
        setFlashColor('#ffd700');
        setTimeout(() => setFlashColor(null), 300);
        setTimeout(() => {
          setBalls(prev => prev.map(ball => ({ ...ball, mega: false, burning: false })));
        }, 8000);
        showPowerUpAnnouncement('💫', 'MEGA BALL!', '#ffd700', true);
        break;
      case 'warp':
        // Warp gate - skip to next level!
        showPowerUpAnnouncement('🌀', 'WARP GATE!', '#a060e0', true);
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

  const createBall = (level = 1, enemyIndex = 0) => {
    // Use difficulty system for ball speed (scales from level 1-100)
    const diff = getDifficulty(enemyIndex, level);
    const totalSpeed = diff.ballSpeed;

    // Use paddle position from ref for ball spawn location
    const currentPaddle = paddleRef.current;
    const ballX = currentPaddle ? currentPaddle.x + currentPaddle.width / 2 : CANVAS_WIDTH / 2;

    return {
      id: Date.now(),
      x: ballX,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - BALL_RADIUS,
      vx: (Math.random() - 0.5) * 8,
      vy: -totalSpeed,
      attached: true,
      burning: false,
      baseSpeed: totalSpeed,
    };
  };

  const handleBallLost = () => {
    // Paddle-as-health: shrink paddle when ball is lost
    const PADDLE_DAMAGE = 15; // Pixels lost per ball drop
    const MIN_PADDLE_WIDTH = 30; // Game over threshold

    setPaddle(p => {
      const newWidth = Math.max(MIN_PADDLE_WIDTH - 1, p.width - PADDLE_DAMAGE);
      // Keep paddle centered after shrinking
      const widthDiff = p.width - newWidth;
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - newWidth, p.x + widthDiff / 2));

      if (newWidth < MIN_PADDLE_WIDTH) {
        // Game over!
        handleGameOver();
      }

      const newPaddle = { ...p, x: newX, width: newWidth };
      paddleRef.current = newPaddle;
      return newPaddle;
    });

    setCombo(0);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);

    // Visual feedback - flash red
    setFlashColor('#ff4444');
    setTimeout(() => setFlashColor(null), 150);

    // Spawn falling broken heart animation
    const heartX = CANVAS_WIDTH / 2;
    const heartY = 60;
    setFallingHearts(prev => [...prev, {
      id: Date.now(),
      x: heartX,
      y: heartY,
      vy: 0,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      scale: 1.5,
      pieces: [
        { x: -15, y: 0, rotation: -20, vx: -2, vy: -3 },
        { x: 15, y: 0, rotation: 20, vx: 2, vy: -3 },
      ]
    }]);
  };

  // === ENEMY SYSTEM ===
  const spawnEnemy = useCallback(() => {
    if (!difficulty) return null;

    // Determine enemy type based on difficulty
    const roll = Math.random();
    let type;
    if (difficulty.globalLevel >= 70 && roll < 0.15) {
      type = 'miniboss';
    } else if (difficulty.globalLevel >= 40 && roll < 0.35) {
      type = 'ghost';
    } else if (difficulty.globalLevel >= 20 && roll < 0.55) {
      type = 'bat';
    } else {
      type = 'slime';
    }

    const sprite = ENEMY_SPRITES[type];
    const enemyId = selectedEnemy?.id || 'brick_goblin';
    const themeColors = ENEMY_THEME_COLORS[enemyId] || ENEMY_THEME_COLORS.brick_goblin;

    // Spawn position - from top or sides
    const side = Math.random();
    let x, y, vx, vy;
    const size = sprite.width * sprite.scale;

    if (side < 0.6) {
      // Top spawn
      x = 100 + Math.random() * (CANVAS_WIDTH - 200);
      y = -size;
      vx = (Math.random() - 0.5) * 2 * difficulty.enemySpeed;
      vy = (0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
    } else if (side < 0.8) {
      // Left spawn
      x = -size;
      y = 100 + Math.random() * 200;
      vx = (0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
      vy = (Math.random() - 0.5) * difficulty.enemySpeed;
    } else {
      // Right spawn
      x = CANVAS_WIDTH + size;
      y = 100 + Math.random() * 200;
      vx = -(0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
      vy = (Math.random() - 0.5) * difficulty.enemySpeed;
    }

    return {
      id: Date.now() + Math.random(),
      type,
      x, y, vx, vy,
      health: sprite.health,
      maxHealth: sprite.health,
      frame: 0,
      frameTimer: 0,
      width: size,
      height: size,
      themeColors,
      phaseTimer: 0, // For ghost phasing
      isPhased: false,
    };
  }, [difficulty, selectedEnemy]);

  const updateEnemies = useCallback((deltaTime) => {
    if (!difficulty) return;

    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const sprite = ENEMY_SPRITES[enemy.type];
        let { x, y, vx, vy, frame, frameTimer, phaseTimer, isPhased } = enemy;

        // Update animation frame
        frameTimer += deltaTime;
        if (frameTimer > 200) { // 200ms per frame
          frame = (frame + 1) % sprite.frames.length;
          frameTimer = 0;
        }

        // Type-specific AI
        switch (enemy.type) {
          case 'slime':
            // Bounces horizontally, drifts down slowly
            x += vx;
            y += vy * 0.3;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) {
              vx = -vx;
              x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, x));
            }
            // Bounce off top area
            if (y < 60) {
              vy = Math.abs(vy);
            }
            break;

          case 'bat':
            // Sine wave movement
            x += vx;
            y += Math.sin(Date.now() / 300) * 2;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) {
              vx = -vx;
            }
            // Stay in upper half
            if (y > CANVAS_HEIGHT / 2) {
              vy = -Math.abs(vy);
            } else if (y < 60) {
              vy = Math.abs(vy);
            }
            y += vy * 0.2;
            break;

          case 'ghost':
            // Phases in and out, drifts toward ball
            phaseTimer += deltaTime;
            if (phaseTimer > 2000) {
              isPhased = !isPhased;
              phaseTimer = 0;
            }
            // Slow drift
            x += vx * 0.5;
            y += vy * 0.5;
            // Bounce off walls
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'miniboss':
            // Slow, deliberate movement
            x += vx * 0.3;
            y += vy * 0.2;
            // Stay in play area
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2 - 50) vy = -vy;
            break;
        }

        // Keep in bounds vertically (don't go below middle of screen)
        y = Math.max(60, Math.min(CANVAS_HEIGHT / 2, y));

        return { ...enemy, x, y, vx, vy, frame, frameTimer, phaseTimer, isPhased };
      }).filter(enemy => {
        // Remove enemies that somehow got way off screen
        return enemy.y < CANVAS_HEIGHT && enemy.x > -100 && enemy.x < CANVAS_WIDTH + 100;
      });
    });
  }, [difficulty]);

  const damageEnemy = useCallback((enemyId, damage = 1) => {
    setEnemies(prev => {
      const updated = prev.map(enemy => {
        if (enemy.id === enemyId) {
          const newHealth = enemy.health - damage;
          if (newHealth <= 0) {
            // Enemy killed - reward player
            const sprite = ENEMY_SPRITES[enemy.type];
            setScore(s => s + sprite.points);
            setPaddle(p => ({ ...p, width: Math.min(200, p.width + sprite.paddleReward) }));
            addFloatingText(enemy.x + enemy.width/2, enemy.y, `+${sprite.points}`, '#ffdd44');

            // Spawn particles
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.themeColors.primary, 15);

            return null; // Mark for removal
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });
      return updated.filter(e => e !== null);
    });
  }, [addFloatingText, createParticles]);

  const handleLevelComplete = () => {
    const completedLevel = currentLevel;
    const nextLevel = currentLevel + 1;

    // Bonus points scale with level
    const levelBonus = 100 * completedLevel + (completedLevel > 5 ? 50 * (completedLevel - 5) : 0);
    const finalScore = score + levelBonus;
    setScore(finalScore);

    // Calculate stars earned for this level
    const earnedStars = calculateLevelStars(finalScore, completedLevel);

    // Update stats - track highest level and per-level stats
    setStats(s => {
      const enemyId = selectedEnemy?.id || 'unknown';
      const currentHighest = s.highestLevels[enemyId] || 0;
      const existingLevelStats = s.levelStats[enemyId]?.[completedLevel] || { bestScore: 0, stars: 0, completed: false };
      const isNewBest = finalScore > existingLevelStats.bestScore;

      return {
        ...s,
        levelsCompleted: s.levelsCompleted + 1,
        highestLevels: {
          ...s.highestLevels,
          [enemyId]: Math.max(currentHighest, nextLevel)
        },
        levelStats: {
          ...s.levelStats,
          [enemyId]: {
            ...s.levelStats[enemyId],
            [completedLevel]: {
              bestScore: Math.max(finalScore, existingLevelStats.bestScore),
              stars: Math.max(earnedStars, existingLevelStats.stars),
              completed: true,
            }
          }
        }
      };
    });

    // Store victory info for level select screen
    setVictoryInfo({ level: completedLevel, score: finalScore, stars: earnedStars, isNewBest: finalScore > (getLevelStats(selectedEnemy?.id, completedLevel).bestScore || 0) });

    setFlashColor('#ffd700');
    setTimeout(() => setFlashColor(null), 500);

    // Show level select after a brief celebration
    setTimeout(() => {
      setGameState('levelSelect');
    }, 800);
  };

  // Start a specific level
  const startLevel = (level, fresh = false) => {
    // Calculate difficulty based on enemy and level
    const enemyIndex = enemyDefs.findIndex(e => e.id === selectedEnemy?.id) || 0;
    const diff = getDifficulty(enemyIndex, level);
    setDifficulty(diff);

    // If fresh start (from level select, not continuing), reset everything
    if (fresh || !victoryInfo) {
      setScore(0);
      setLives(3 + stats.upgrades.extraLife);
      setCombo(0);
      setMaxCombo(0);
      setGimmickData({});
      setTeddyMeter(0);
      setTeddyAbilityActive(null);
      setTwinPaddle(null);
      setChargeLevel(0);
      setIsCharging(false);
      setDashCooldown(0);
    }
    setVictoryInfo(null);
    setCurrentLevel(level);
    setBricks(createBricks(level, selectedEnemy));
    setBalls([createBall(level, enemyIndex)]);
    setPowerUps([]);
    setActiveEffects([]);
    // Paddle width scales with difficulty (smaller at higher levels)
    const baseWidth = Math.round(diff.basePaddleWidth);
    const startingWidth = baseWidth + (stats.upgrades.paddleSize * 10);
    const nextPaddle = { x: CANVAS_WIDTH / 2 - startingWidth / 2, width: startingWidth, vx: 0 };
    setPaddle(nextPaddle);
    paddleRef.current = nextPaddle;
    // Reset enemy system
    setEnemies([]);
    setLastEnemySpawn(Date.now());
    setGameState('playing');
    setIsPaused(false);
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

    setStats(s => {
      // Calculate enemy stars earned this game (1 star per 200 points, max 10)
      const currentEnemyStars = s.enemyStars[selectedEnemy?.id] || 0;
      const starsFromScore = Math.min(STARS_TO_UNLOCK, Math.floor(score / POINTS_PER_STAR));
      const newEnemyStars = Math.max(currentEnemyStars, starsFromScore);

      // Check if enemy was defeated (reached 10 stars)
      const wasDefeated = newEnemyStars >= STARS_TO_UNLOCK && currentEnemyStars < STARS_TO_UNLOCK;
      const newEnemiesDefeated = wasDefeated
        ? { ...s.enemiesDefeated, [selectedEnemy?.id]: true }
        : s.enemiesDefeated;

      return {
        ...s,
        totalScore: s.totalScore + score,
        gamesPlayed: s.gamesPlayed + 1,
        stars: s.stars + totalNewStars,
        highScores: {
          ...s.highScores,
          [selectedEnemy?.id]: Math.max(s.highScores[selectedEnemy?.id] || 0, score)
        },
        enemyStars: {
          ...s.enemyStars,
          [selectedEnemy?.id]: newEnemyStars
        },
        enemiesDefeated: newEnemiesDefeated,
      };
    });
  };

  // Select an enemy and go to level select
  const selectEnemy = (enemy) => {
    setSelectedEnemy(enemy);
    setVictoryInfo(null); // Clear any previous victory info
    setGameState('levelSelect');
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
    const nextPaddle = { x: CANVAS_WIDTH / 2 - startingWidth / 2, width: startingWidth, vx: 0 };
    setPaddle(nextPaddle);
    paddleRef.current = nextPaddle;
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
          {/* Paddle Health Bar */}
          <div style={{
            width: '80px',
            height: '10px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '5px',
            overflow: 'hidden',
            marginTop: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {(() => {
              const healthRatio = Math.min(1, Math.max(0, (paddle.width - 30) / 90));
              const barColor = healthRatio < 0.33 ? '#ff4444' : healthRatio < 0.66 ? '#ffcc44' : '#44ff66';
              return (
                <div style={{
                  width: `${healthRatio * 100}%`,
                  height: '100%',
                  background: barColor,
                  transition: 'width 0.2s, background 0.3s',
                  boxShadow: `0 0 6px ${barColor}`,
                }} />
              );
            })()}
          </div>
          <span style={{ fontSize: '10px', color: '#666', marginTop: '2px', display: 'block' }}>
            {Math.round(paddle.width)}px
          </span>
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
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)',
          borderRadius: '8px',
          border: '3px solid #2a2a4e',
          overflow: 'hidden',
          cursor: 'none', // Hide cursor during gameplay for cleaner look
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
              background: brick.invisible ? 'transparent' :
                brick.type === 'obstacle' ? 'linear-gradient(180deg, #3a3a5e 0%, #2a2a4e 50%, #1a1a3e 100%)' :
                `linear-gradient(180deg, ${brick.color}ee 0%, ${brick.color} 50%, ${brick.color}aa 100%)`,
              borderRadius: '4px',
              border: brick.invisible ? '1px dashed rgba(255,255,255,0.1)' :
                brick.type === 'obstacle' ? '2px solid #4a4a6e' :
                `2px solid ${brick.color}`,
              boxShadow: brick.invisible ? 'none' :
                brick.type === 'obstacle' ? 'inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' :
                `0 2px 8px ${brick.color}44, inset 0 1px 0 rgba(255,255,255,0.3)`,
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
            {brick.type === 'obstacle' && (
              <span style={{ fontSize: '14px', opacity: 0.7, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>🧱</span>
            )}
            {brick.health > 1 && !brick.invisible && brick.type !== 'explosive' && brick.type !== 'obstacle' && brick.type !== 'boss' && (
              <span style={{
                fontSize: brick.health >= 10 ? '9px' : '11px',
                fontWeight: '900',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
              }}>{brick.health}</span>
            )}
            {/* Hit flash overlay */}
            {brick.hitFlash > 0 && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'white',
                opacity: brick.hitFlash * 0.7,
                borderRadius: '2px',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        ))}

        {/* === PINBALL FEATURES === */}

        {/* Bumpers */}
        {bumpers.map(bumper => (
          <div
            key={bumper.id}
            style={{
              position: 'absolute',
              left: bumper.x - bumper.radius,
              top: bumper.y - bumper.radius,
              width: bumper.radius * 2,
              height: bumper.radius * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${bumper.color}ff 0%, ${bumper.color}aa 50%, ${bumper.color}66 100%)`,
              border: `3px solid ${bumper.color}`,
              boxShadow: bumper.hitTimer > 0
                ? `0 0 20px ${bumper.color}, 0 0 40px ${bumper.color}, inset 0 0 15px rgba(255,255,255,0.5)`
                : `0 0 10px ${bumper.color}88, inset 0 -3px 6px rgba(0,0,0,0.3)`,
              transform: bumper.hitTimer > 0 ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
          >
            {/* Inner ring */}
            <div style={{
              position: 'absolute',
              inset: '20%',
              borderRadius: '50%',
              background: bumper.hitTimer > 0
                ? 'radial-gradient(circle, #ffffff 0%, #ffffffaa 100%)'
                : `radial-gradient(circle, ${bumper.color}dd 0%, ${bumper.color}88 100%)`,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
            }} />
          </div>
        ))}

        {/* Portals */}
        {portals.map(portal => {
          if (!portal.linkedPortalId) return null; // Don't render unpaired portals
          const pulseSize = Math.sin(portal.animPhase) * 3;
          return (
            <div
              key={portal.id}
              style={{
                position: 'absolute',
                left: portal.x - portal.radius - pulseSize,
                top: portal.y - portal.radius - pulseSize,
                width: (portal.radius + pulseSize) * 2,
                height: (portal.radius + pulseSize) * 2,
                borderRadius: '50%',
                background: `conic-gradient(from ${portal.animPhase}rad, ${portal.colors.primary}, ${portal.colors.secondary}, ${portal.colors.primary})`,
                opacity: portal.cooldown > 0 ? 0.5 : 1,
                boxShadow: `0 0 15px ${portal.colors.primary}, inset 0 0 20px ${portal.colors.secondary}88`,
                transition: 'opacity 0.2s',
              }}
            >
              {/* Inner void */}
              <div style={{
                position: 'absolute',
                inset: '25%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #000000 0%, #111122 100%)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
              }} />
              {/* Swirl effect */}
              <div style={{
                position: 'absolute',
                inset: '10%',
                borderRadius: '50%',
                background: `conic-gradient(from ${-portal.animPhase * 2}rad, transparent 0%, ${portal.colors.primary}44 25%, transparent 50%, ${portal.colors.secondary}44 75%, transparent 100%)`,
              }} />
            </div>
          );
        })}

        {/* Spawners */}
        {spawners.map(spawner => spawner.health > 0 && (
          <div
            key={spawner.id}
            style={{
              position: 'absolute',
              left: spawner.x + (Math.random() - 0.5) * spawner.shakeAmount,
              top: spawner.y + (Math.random() - 0.5) * spawner.shakeAmount,
              width: spawner.width,
              height: spawner.height,
              borderRadius: '6px',
              background: `linear-gradient(180deg,
                ${spawner.health <= 1 ? '#ff4444' : spawner.health <= 2 ? '#ff8844' : '#333'}ee 0%,
                #1a1a2e 50%,
                #0a0a1e 100%)`,
              border: `3px solid ${spawner.health <= 1 ? '#ff4444' : spawner.health <= 2 ? '#ff8844' : spawner.color}`,
              boxShadow: `0 0 ${spawner.shakeAmount > 0 ? 20 : 10}px ${spawner.health <= 1 ? '#ff4444' : spawner.color}88,
                         inset 0 -5px 15px rgba(0,0,0,0.5)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Cave/door opening */}
            <div style={{
              width: '60%',
              height: '70%',
              background: 'radial-gradient(ellipse at center bottom, #000 0%, #111 60%, transparent 100%)',
              borderRadius: '50% 50% 0 0',
              boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.8)',
            }} />
            {/* Eyes in the darkness */}
            <div style={{
              position: 'absolute',
              display: 'flex',
              gap: '8px',
              top: '30%',
            }}>
              <div style={{ width: 6, height: 6, background: spawner.color, borderRadius: '50%', boxShadow: `0 0 6px ${spawner.color}` }} />
              <div style={{ width: 6, height: 6, background: spawner.color, borderRadius: '50%', boxShadow: `0 0 6px ${spawner.color}` }} />
            </div>
            {/* Health indicator */}
            <div style={{
              position: 'absolute',
              bottom: 2,
              left: '10%',
              right: '10%',
              height: 3,
              background: '#000',
              borderRadius: 2,
            }}>
              <div style={{
                width: `${(spawner.health / spawner.maxHealth) * 100}%`,
                height: '100%',
                background: spawner.health <= 1 ? '#ff4444' : spawner.health <= 2 ? '#ffaa44' : '#44ff44',
                borderRadius: 2,
                transition: 'width 0.2s',
              }} />
            </div>
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

        {/* Enemies */}
        {enemies.map(enemy => {
          const sprite = ENEMY_SPRITES[enemy.type];
          const frameData = sprite.frames[enemy.frame];
          const pixelSize = sprite.scale;
          const themeColor = enemy.themeColors.primary;

          return (
            <div
              key={enemy.id}
              style={{
                position: 'absolute',
                left: enemy.x,
                top: enemy.y,
                width: enemy.width,
                height: enemy.height,
                opacity: enemy.isPhased ? 0.4 : 1,
                transition: 'opacity 0.3s',
                filter: enemy.health < enemy.maxHealth ? 'brightness(1.3)' : 'none',
              }}
            >
              {/* Pixel art rendering */}
              <svg width={enemy.width} height={enemy.height} style={{ display: 'block' }}>
                {frameData.map((row, y) =>
                  row.split('').map((char, x) => {
                    if (char === '.') return null;
                    // Get color - use theme color for main body, keep special colors
                    let color = sprite.colors[char];
                    if (!color) return null;
                    // Replace primary color with theme
                    if (char === 'G' || char === 'P' || char === 'R') {
                      color = themeColor;
                    }
                    return (
                      <rect
                        key={`${x}-${y}`}
                        x={x * pixelSize}
                        y={y * pixelSize}
                        width={pixelSize}
                        height={pixelSize}
                        fill={color}
                      />
                    );
                  })
                )}
              </svg>
              {/* Health bar for multi-hit enemies */}
              {enemy.maxHealth > 1 && (
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: enemy.width * 0.8,
                  height: 4,
                  background: '#333',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                    height: '100%',
                    background: enemy.health > enemy.maxHealth / 2 ? '#44dd44' : enemy.health > 1 ? '#dddd44' : '#dd4444',
                    transition: 'width 0.1s',
                  }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Balls */}
        {balls.map(ball => {
          // Explicitly calculate positions for attached vs free balls
          const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM;
          const ballTop = ball.attached
            ? paddleTop - BALL_RADIUS * 2  // Just above paddle
            : ball.y - BALL_RADIUS;
          const ballLeft = ball.attached
            ? paddle.x + paddle.width / 2 - BALL_RADIUS
            : ball.x - BALL_RADIUS;

          return (
          <div
            key={ball.id}
            style={{
              position: 'absolute',
              left: ballLeft,
              top: ballTop,
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
        );
        })}

        {/* Paddle - color changes based on health (width) */}
        {(() => {
          // Calculate paddle health ratio (30px = dead, 120px = full, 200px = max)
          const healthRatio = Math.min(1, (paddle.width - 30) / 90); // 0-1 scale
          const isLowHealth = healthRatio < 0.33;
          const isMedHealth = healthRatio < 0.66;

          // Health-based colors
          const healthGradient = activeEffects.includes('frozen')
            ? 'linear-gradient(180deg, #80e0ff, #60c0e0)'
            : activeEffects.includes('laser')
              ? 'linear-gradient(180deg, #ff60ff, #c040c0)'
              : isDashing
                ? 'linear-gradient(180deg, #ffd700, #ff8800)'
                : isLowHealth
                  ? 'linear-gradient(180deg, #ff6060, #dd4040)'
                  : isMedHealth
                    ? 'linear-gradient(180deg, #ffcc60, #ddaa40)'
                    : 'linear-gradient(180deg, #60ff80, #40dd60)';

          const healthGlow = activeEffects.includes('frozen')
            ? '0 0 20px #80e0ff'
            : activeEffects.includes('laser')
              ? '0 0 20px #ff60ff'
              : isDashing
                ? '0 0 25px #ffd700'
                : isLowHealth
                  ? '0 0 20px #ff6060'
                  : isMedHealth
                    ? '0 0 15px #ffcc60'
                    : '0 0 15px #60ff80';

          return (
            <div style={{
              position: 'absolute',
              left: paddle.x,
              top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM,
              width: paddle.width,
              height: PADDLE_HEIGHT,
              background: healthGradient,
              borderRadius: '6px',
              boxShadow: healthGlow,
              transition: isDashing ? 'none' : 'left 0.05s, width 0.2s, background 0.3s',
            }} />
          );
        })()}

        {/* Twin Paddle (Teddy Twins ability) */}
        {twinPaddle?.active && (
          <div style={{
            position: 'absolute',
            left: CANVAS_WIDTH - paddle.x - paddle.width,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM,
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
              height: p.isShard ? p.size * 0.6 : p.size,
              background: p.color,
              borderRadius: p.isShard ? '2px' : '50%',
              opacity: Math.min(p.life, 1),
              pointerEvents: 'none',
              transform: p.isShard ? `rotate(${p.rotation || 0}deg)` : 'none',
              boxShadow: p.isShard ? `0 2px 4px rgba(0,0,0,0.3)` : 'none',
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

        {/* Falling broken hearts animation */}
        {fallingHearts.map(heart => (
          <div key={heart.id} style={{ position: 'absolute', left: heart.x, top: heart.y, pointerEvents: 'none' }}>
            {/* Left heart piece */}
            <div style={{
              position: 'absolute',
              left: heart.pieces[0].x,
              top: heart.pieces[0].y,
              fontSize: '48px',
              opacity: heart.opacity,
              transform: `rotate(${heart.pieces[0].rotation}deg) scale(${heart.scale})`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
            }}>
              💔
            </div>
            {/* Right heart piece */}
            <div style={{
              position: 'absolute',
              left: heart.pieces[1].x,
              top: heart.pieces[1].y,
              fontSize: '48px',
              opacity: heart.opacity,
              transform: `rotate(${heart.pieces[1].rotation}deg) scale(${heart.scale})`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
            }}>
              💔
            </div>
          </div>
        ))}

        {/* Prominent PowerUp Announcement */}
        {powerUpAnnouncement && (
          <div
            key={powerUpAnnouncement.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '40%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'powerUpAnnounce 1.5s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 0 20px ' + powerUpAnnouncement.color + ')',
              animation: 'powerUpEmoji 0.3s ease-out',
            }}>
              {powerUpAnnouncement.emoji}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '900',
              color: powerUpAnnouncement.color,
              textShadow: `0 0 20px ${powerUpAnnouncement.color}, 0 0 40px ${powerUpAnnouncement.color}80, 2px 2px 4px rgba(0,0,0,0.8)`,
              letterSpacing: '2px',
            }}>
              {powerUpAnnouncement.name}
            </div>
            {!powerUpAnnouncement.isGood && (
              <div style={{
                fontSize: '12px',
                color: '#ff6b6b',
                fontWeight: '600',
              }}>
                (Penalty!)
              </div>
            )}
          </div>
        )}

        {/* Ball launch hint */}
        {balls.some(b => b.attached) && (
          <div style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#888',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            CLICK or SPACE to launch
            <br />
            <span style={{ fontSize: '12px', color: '#666' }}>Hold SPACE to charge!</span>
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
        🖱️ MOUSE to move • CLICK to launch • A/D keys also work
        <br />
        Double-tap A/D to DASH • Hold SPACE to charge shot • Q/W/E for Teddy abilities • ESC to pause
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
        @keyframes powerUpAnnounce {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          30% { transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -60%) scale(0.8); }
        }
        @keyframes powerUpEmoji {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
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
      padding: '40px 20px',
      color: '#fff',
      minHeight: '100vh',
      overflowY: 'auto',
      background: 'radial-gradient(ellipse at top, rgba(96, 160, 255, 0.1) 0%, transparent 50%)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h2 style={{
          fontSize: '38px',
          fontWeight: '800',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #60a0ff, #a060ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 40px rgba(96, 160, 255, 0.3)',
        }}>Choose Your Challenge</h2>
        <p style={{ color: '#6a6a8a', fontSize: '15px' }}>Each enemy has unique brick abilities</p>
      </div>

      {/* Enemy Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        maxWidth: '1000px',
        width: '100%',
        padding: '0 10px',
      }}>
        {enemyDefs.map((enemy, idx) => {
          const bestScore = stats.highScores[enemy.id] || 0;
          const isUnlocked = isEnemyUnlocked(idx);
          const highestLevel = stats.highestLevels[enemy.id] || 0;
          const totalLevelStars = getTotalStarsForEnemy(enemy.id);
          const maxPossibleStars = MAX_LEVELS * 3;
          const isPerfected = totalLevelStars >= maxPossibleStars;
          const isAllLevelsComplete = highestLevel >= MAX_LEVELS;
          const progressPercent = (totalLevelStars / maxPossibleStars) * 100;

          return (
            <div
              key={enemy.id}
              onClick={() => isUnlocked && selectEnemy(enemy)}
              style={{
                background: isUnlocked
                  ? `linear-gradient(180deg, rgba(30,35,50,0.95) 0%, rgba(20,25,40,0.98) 100%)`
                  : 'linear-gradient(180deg, rgba(20,20,25,0.9) 0%, rgba(15,15,20,0.95) 100%)',
                border: 'none',
                borderRadius: '20px',
                padding: '0',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease',
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isUnlocked
                  ? `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
                  : 'inset 0 -2px 10px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${enemy.color}33, inset 0 1px 0 rgba(255,255,255,0.1)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = isUnlocked
                  ? `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
                  : 'inset 0 -2px 10px rgba(0,0,0,0.5)';
              }}
            >
              {/* Color accent bar at top */}
              <div style={{
                height: '4px',
                background: isUnlocked
                  ? `linear-gradient(90deg, ${enemy.color}, ${enemy.accentColor})`
                  : 'rgba(60,60,60,0.5)',
                boxShadow: isUnlocked ? `0 0 15px ${enemy.color}66` : 'none',
              }} />

              {/* Badge */}
              {isUnlocked && (isPerfected || isAllLevelsComplete) && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  fontSize: '11px',
                  background: isPerfected
                    ? 'linear-gradient(135deg, #ffd700, #ff8c00)'
                    : `linear-gradient(135deg, ${enemy.color}, ${enemy.accentColor})`,
                  color: isPerfected ? '#000' : '#fff',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: isPerfected ? '0 0 15px rgba(255,215,0,0.5)' : `0 0 10px ${enemy.color}44`,
                }}>{isPerfected ? '⭐ Perfect' : '✓ Done'}</div>
              )}

              {/* Lock overlay */}
              {!isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '10px',
                  zIndex: 10,
                }}>
                  <span style={{ fontSize: '40px' }}>🔒</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Defeat {enemyDefs[idx - 1]?.name || 'previous enemy'} to unlock
                  </span>
                </div>
              )}

              {/* Content */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
                  {/* Enemy Avatar */}
                  <div style={{
                    fontSize: '50px',
                    width: '75px',
                    height: '75px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isUnlocked
                      ? `radial-gradient(circle, ${enemy.color}33 0%, transparent 70%)`
                      : 'radial-gradient(circle, rgba(60,60,60,0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    border: isUnlocked ? `2px solid ${enemy.color}44` : '2px solid rgba(60,60,60,0.3)',
                    flexShrink: 0,
                  }}>{enemy.emoji}</div>

                  {/* Enemy Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '22px',
                      color: isUnlocked ? '#fff' : '#555',
                      textShadow: isUnlocked ? `0 0 20px ${enemy.color}44` : 'none',
                      marginBottom: '2px',
                    }}>{enemy.name}</div>
                    <div style={{
                      fontSize: '13px',
                      color: isUnlocked ? enemy.color : '#444',
                      fontWeight: '600',
                      marginBottom: '6px',
                    }}>{enemy.title}</div>
                    <div style={{
                      fontSize: '12px',
                      color: isUnlocked ? 'rgba(255,255,255,0.5)' : '#333',
                      lineHeight: '1.4',
                    }}>{enemy.gimmickDesc}</div>
                  </div>
                </div>

                {/* Progress Section */}
                {isUnlocked && (
                  <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                  }}>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}>
                        <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Progress
                        </span>
                        <span style={{ fontSize: '12px', color: '#ffd700', fontWeight: '700' }}>
                          ⭐ {totalLevelStars}/{maxPossibleStars}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: isPerfected
                            ? 'linear-gradient(90deg, #ffd700, #ff8c00)'
                            : `linear-gradient(90deg, ${enemy.color}, ${enemy.accentColor})`,
                          borderRadius: '3px',
                          boxShadow: `0 0 8px ${isPerfected ? '#ffd700' : enemy.color}`,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#555' }}>Level </span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: enemy.color,
                        }}>{highestLevel}</span>
                        <span style={{ fontSize: '12px', color: '#444' }}>/{MAX_LEVELS}</span>
                      </div>
                      {bestScore > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase' }}>Best</div>
                          <div style={{ fontSize: '16px', color: '#ffd700', fontWeight: '700' }}>{bestScore}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '40px',
          padding: '14px 32px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '14px',
          color: '#888',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = '#888';
        }}
      >
        ← Back to Menu
      </button>
    </div>
  );

  // Generate mini preview grid for a level
  const renderLevelPreview = (level, color, isLocked, enemyId) => {
    // Get level definition from LEVEL_DEFINITIONS
    const enemyLevels = LEVEL_DEFINITIONS[enemyId] || LEVEL_DEFINITIONS.brick_goblin;
    const levelIndex = Math.min(level - 1, enemyLevels.length - 1);
    const levelDef = enemyLevels[levelIndex];

    const PREVIEW_COLS = 12; // Match level definition width
    const PREVIEW_ROWS = levelDef.length;

    // Color mapping for brick types
    const getBrickColor = (char, baseColor) => {
      if (isLocked) {
        switch (char) {
          case '#': return '#222';
          case 'X': return '#331111';
          case '*': return '#112211';
          default: return '#1a1a1a';
        }
      }
      switch (char) {
        case '1': return baseColor;
        case '2': return baseColor;
        case '3': return baseColor;
        case '#': return '#4a4a6e'; // Indestructible - gray/purple
        case '*': return '#44cc44'; // Powerup - green
        case 'X': return '#ff6644'; // Explosive - orange/red
        default: return 'transparent';
      }
    };

    const getBrickOpacity = (char, row) => {
      if (isLocked) return 0.3;
      switch (char) {
        case '1': return 0.5 + row * 0.05;
        case '2': return 0.7 + row * 0.04;
        case '3': return 0.85 + row * 0.02;
        case '#': return 1;
        case '*': return 0.9;
        case 'X': return 0.95;
        default: return 0;
      }
    };

    const cells = [];
    for (let r = 0; r < PREVIEW_ROWS; r++) {
      const rowStr = levelDef[r] || '';
      for (let c = 0; c < PREVIEW_COLS; c++) {
        const char = c < rowStr.length ? rowStr[c] : '.';
        const cellColor = getBrickColor(char, color);
        const opacity = getBrickOpacity(char, r);

        cells.push(
          <div key={`${r}-${c}`} style={{
            width: '5px',
            height: '4px',
            background: cellColor,
            borderRadius: '1px',
            opacity: opacity,
          }} />
        );
      }
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${PREVIEW_COLS}, 5px)`,
        gap: '1px',
        padding: '4px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
      }}>
        {cells}
      </div>
    );
  };

  // Level Select Screen
  const renderLevelSelect = () => {
    const enemyId = selectedEnemy?.id || 'unknown';
    const highestLevel = stats.highestLevels[enemyId] || 1;
    const enemyColor = selectedEnemy?.color || '#4080e0';
    const enemyAccent = selectedEnemy?.accentColor || '#6040a0';
    const hasVictory = victoryInfo !== null;
    const nextLevel = hasVictory ? victoryInfo.level + 1 : 1;
    const canContinue = nextLevel <= MAX_LEVELS;
    const totalStars = getTotalStarsForEnemy(enemyId);
    const maxStars = MAX_LEVELS * 3;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px',
        color: '#fff',
        minHeight: '100vh',
        background: `radial-gradient(ellipse at top, ${enemyColor}15 0%, transparent 50%)`,
      }}>
        {/* Victory Celebration */}
        {hasVictory && (
          <div style={{
            background: `linear-gradient(180deg, ${enemyColor}22 0%, transparent 100%)`,
            borderBottom: `2px solid ${enemyColor}44`,
            padding: '25px 50px',
            marginBottom: '20px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
              color: '#000',
              padding: '6px 20px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '1px',
            }}>VICTORY</div>
            <h2 style={{
              color: '#fff',
              fontSize: '32px',
              margin: '15px 0 20px 0',
              textShadow: `0 0 30px ${enemyColor}`,
            }}>
              Level {victoryInfo.level} Complete!
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: '15px',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '15px 25px',
                borderRadius: '12px',
                minWidth: '100px',
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</div>
                <div style={{ color: '#ffd700', fontSize: '28px', fontWeight: '800' }}>{victoryInfo.score}</div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '15px 25px',
                borderRadius: '12px',
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Rating</div>
                <div style={{ fontSize: '32px', display: 'flex', gap: '4px' }}>
                  {[1, 2, 3].map(s => (
                    <span key={s} style={{
                      color: s <= victoryInfo.stars ? '#ffd700' : '#333',
                      textShadow: s <= victoryInfo.stars ? '0 0 10px #ffd700' : 'none',
                      transform: s <= victoryInfo.stars ? 'scale(1.1)' : 'scale(0.9)',
                      display: 'inline-block',
                    }}>★</span>
                  ))}
                </div>
              </div>
            </div>
            {victoryInfo.isNewBest && (
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ffd700)',
                color: '#000',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '800',
                display: 'inline-block',
                animation: 'pulse 1s infinite',
              }}>🏆 NEW HIGH SCORE!</div>
            )}
          </div>
        )}

        {/* Enemy Header Card */}
        <div style={{
          background: `linear-gradient(135deg, ${enemyColor}33 0%, ${enemyAccent}22 100%)`,
          border: `2px solid ${enemyColor}66`,
          borderRadius: '20px',
          padding: '20px 40px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: `0 10px 40px ${enemyColor}22`,
        }}>
          <div style={{
            fontSize: '60px',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle, ${enemyColor}44 0%, transparent 70%)`,
            borderRadius: '50%',
          }}>{selectedEnemy?.emoji}</div>
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '28px',
              margin: 0,
              fontWeight: '800',
              textShadow: `0 2px 10px ${enemyColor}66`,
            }}>
              {selectedEnemy?.name}
            </h2>
            <div style={{ color: enemyColor, fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>
              {selectedEnemy?.title}
            </div>
            {/* Star Progress Bar */}
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '150px',
                height: '8px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(totalStars / maxStars) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px #ffd700',
                }} />
              </div>
              <span style={{ color: '#ffd700', fontSize: '13px', fontWeight: '700' }}>
                ⭐ {totalStars}/{maxStars}
              </span>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '30px',
          padding: '25px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map(level => {
            const isUnlocked = level <= highestLevel;
            const levelData = getLevelStats(enemyId, level);
            const isNext = level === nextLevel && (hasVictory || level === highestLevel);
            const isCompleted = levelData.completed;
            const stars = levelData.stars;

            return (
              <button
                key={level}
                onClick={() => isUnlocked && startLevel(level, !hasVictory || level !== nextLevel)}
                disabled={!isUnlocked}
                style={{
                  width: '105px',
                  height: '130px',
                  borderRadius: '14px',
                  border: 'none',
                  padding: '0',
                  background: isUnlocked
                    ? `linear-gradient(180deg, #1e2235 0%, #151825 100%)`
                    : `linear-gradient(180deg, #111318 0%, #0a0c10 100%)`,
                  color: isUnlocked ? '#fff' : '#333',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: isNext
                    ? `0 0 25px ${enemyColor}66, 0 4px 15px rgba(0,0,0,0.4)`
                    : isUnlocked
                      ? '0 4px 15px rgba(0,0,0,0.3)'
                      : 'inset 0 -2px 5px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
                    e.currentTarget.style.boxShadow = `0 12px 35px ${enemyColor}55, 0 8px 20px rgba(0,0,0,0.4)`;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = isNext
                    ? `0 0 25px ${enemyColor}66, 0 4px 15px rgba(0,0,0,0.4)`
                    : isUnlocked
                      ? '0 4px 15px rgba(0,0,0,0.3)'
                      : 'inset 0 -2px 5px rgba(0,0,0,0.5)';
                }}
              >
                {/* Top accent bar */}
                <div style={{
                  width: '100%',
                  height: '3px',
                  background: isNext
                    ? `linear-gradient(90deg, ${enemyColor}, ${enemyAccent})`
                    : isCompleted
                      ? `linear-gradient(90deg, ${enemyColor}88, ${enemyAccent}66)`
                      : 'rgba(255,255,255,0.1)',
                  boxShadow: isNext ? `0 0 10px ${enemyColor}` : 'none',
                }} />

                {/* Shine effect for next level */}
                {isNext && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    animation: 'shine 2s infinite',
                  }} />
                )}

                {isUnlocked ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 6px 10px',
                    width: '100%',
                  }}>
                    {/* Level number */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: '6px',
                      padding: '0 4px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>Level</span>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: isNext ? '#fff' : enemyColor,
                        textShadow: isNext ? `0 0 10px ${enemyColor}` : 'none',
                      }}>{level}</span>
                    </div>

                    {/* Mini preview */}
                    {renderLevelPreview(level, isNext ? '#fff' : enemyColor, false, enemyId)}

                    {/* Stars */}
                    <div style={{
                      display: 'flex',
                      gap: '3px',
                      marginTop: '8px',
                    }}>
                      {[1, 2, 3].map(s => (
                        <span key={s} style={{
                          fontSize: '14px',
                          color: s <= stars ? '#ffd700' : 'rgba(255,255,255,0.15)',
                          textShadow: s <= stars ? '0 0 6px #ffd700' : 'none',
                        }}>★</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 6px 10px',
                    width: '100%',
                    opacity: 0.5,
                  }}>
                    {/* Level number */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: '6px',
                      padding: '0 4px',
                    }}>
                      <span style={{ fontSize: '11px', color: '#444' }}>Level</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#444' }}>{level}</span>
                    </div>

                    {/* Locked preview */}
                    {renderLevelPreview(level, '#333', true, enemyId)}

                    {/* Lock icon */}
                    <div style={{
                      marginTop: '6px',
                      fontSize: '16px',
                    }}>🔒</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {hasVictory && canContinue ? (
            <button
              onClick={() => startLevel(nextLevel, false)}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '800',
                background: `linear-gradient(180deg, ${enemyColor} 0%, ${enemyAccent} 100%)`,
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: `0 6px 25px ${enemyColor}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Next Level →
            </button>
          ) : (
            <button
              onClick={() => startLevel(highestLevel, true)}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '800',
                background: `linear-gradient(180deg, ${enemyColor} 0%, ${enemyAccent} 100%)`,
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: `0 6px 25px ${enemyColor}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {highestLevel === 1 ? '▶ Play' : `▶ Level ${highestLevel}`}
            </button>
          )}
          <button
            onClick={() => setGameState('select')}
            style={{
              padding: '16px 28px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              color: '#aaa',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            ← Enemies
          </button>
          <button
            onClick={() => setGameState('menu')}
            style={{
              padding: '16px 28px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              color: '#666',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#888';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#666';
            }}
          >
            Menu
          </button>
        </div>

        {/* CSS Keyframes */}
        <style>{`
          @keyframes shine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  };

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
      {gameState === 'levelSelect' && renderLevelSelect()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.BreakoutGame = BreakoutGame;
