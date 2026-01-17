const { useState, useEffect, useCallback, useRef } = React;

const SnakeGame = () => {
  // Game constants
  const GRID_SIZE = 20;
  const CELL_SIZE = 24;
  const BASE_SPEED = 150;

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

  // Stats tracking
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('snake_rpg_stats');
    if (saved) return JSON.parse(saved);
    return { totalScore: 0, gamesPlayed: 0, enemiesDefeated: {}, highScores: {} };
  });

  // Refs
  const gameLoopRef = useRef(null);
  const lastMoveRef = useRef(Date.now());

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
    normal: { emoji: '🍎', points: 10, color: '#ff6b6b' },
    bonus: { emoji: '🍊', points: 25, color: '#ffa500' },
    super: { emoji: '⭐', points: 50, color: '#ffd700' },
    power: { emoji: '💎', points: 30, color: '#00ffff', effect: 'invincible' },
    speed: { emoji: '⚡', points: 15, color: '#ffff00', effect: 'speed_boost' },
    shrink: { emoji: '🍃', points: 20, color: '#90ee90', effect: 'shrink' },
    boss: { emoji: '💀', points: 100, color: '#ff0000', damage: true },
  };

  // Save stats
  useEffect(() => {
    localStorage.setItem('snake_rpg_stats', JSON.stringify(stats));
  }, [stats]);

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
  }, [gameState, direction, isPaused, activeEffects]);

  // Spawn food
  const spawnFood = useCallback((currentSnake = snake) => {
    const occupied = new Set(currentSnake.map(s => `${s.x},${s.y}`));
    hazards.forEach(h => occupied.add(`${h.x},${h.y}`));

    let pos;
    let attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
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
    }

    setFood({ ...pos, type });
  }, [snake, hazards, isBossWave]);

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
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: zoneType,
            life: 100
          }]);
        }
        break;

      case 'fake_food':
        if (Math.random() < 0.01 && powerUps.length < 3) {
          setPowerUps(p => [...p, {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: 'fake',
            emoji: '🍎',
          }]);
        }
        break;

      case 'ice_walls':
        if (Math.random() < 0.015) {
          const wallX = Math.floor(Math.random() * GRID_SIZE);
          const wallY = Math.floor(Math.random() * GRID_SIZE);
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
          const strikeX = Math.floor(Math.random() * GRID_SIZE);
          const strikeY = Math.floor(Math.random() * GRID_SIZE);
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
          setGimmickData(d => ({ ...d, darkZones: [
            ...(d.darkZones || []).slice(-5),
            { x: Math.floor(Math.random() * (GRID_SIZE - 5)), y: Math.floor(Math.random() * (GRID_SIZE - 5)), size: 5, life: 100 }
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
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
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
        newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
        newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;

        // Self collision
        if (currentSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          if (!activeEffects.includes('invincible')) {
            handleGameOver();
            return currentSnake;
          }
        }

        // Hazard collision
        const hitHazard = hazards.find(h => h.x === newHead.x && h.y === newHead.y);
        if (hitHazard) {
          if (hitHazard.type === 'ice_wall' || hitHazard.type === 'lightning') {
            if (!activeEffects.includes('invincible')) {
              handleGameOver();
              return currentSnake;
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

        // Food collision
        let newSnake;
        if (newHead.x === food.x && newHead.y === food.y) {
          const foodData = foodTypes[food.type];
          setScore(s => s + foodData.points);
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

    setStats(s => ({
      ...s,
      totalScore: s.totalScore + score,
      gamesPlayed: s.gamesPlayed + 1,
      highScores: {
        ...s.highScores,
        [selectedEnemy?.id]: Math.max(s.highScores[selectedEnemy?.id] || 0, score)
      }
    }));
  };

  const startGame = (enemy) => {
    setSelectedEnemy(enemy);
    setSnake([{ x: 10, y: 10 }]);
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
    spawnFood([{ x: 10, y: 10 }]);
    setGameState('playing');
    setIsPaused(false);
  };

  // Render functions
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

      <div style={{ marginTop: '40px', color: '#6a8f6a', fontSize: '14px' }}>
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

  const renderGame = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      transform: screenShake ? `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)` : 'none',
    }}>
      {/* HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: GRID_SIZE * CELL_SIZE,
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

      {/* Active effects */}
      {activeEffects.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
        }}>
          {activeEffects.includes('invincible') && (
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
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
        background: 'linear-gradient(135deg, #1a2a20 0%, #0d1f15 100%)',
        borderRadius: '8px',
        border: '3px solid #2a3a30',
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
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute',
              left: i * CELL_SIZE,
              top: 0,
              width: '1px',
              height: '100%',
              background: 'rgba(80, 200, 120, 0.1)',
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              top: i * CELL_SIZE,
              width: '100%',
              height: '1px',
              background: 'rgba(80, 200, 120, 0.1)',
            }} />
          </React.Fragment>
        ))}

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
        Arrow keys or WASD to move • ESC to pause
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

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2520 0%, #0d3320 50%, #1a2525 100%)',
    }}>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'select' && renderEnemySelect()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.SnakeGame = SnakeGame;
