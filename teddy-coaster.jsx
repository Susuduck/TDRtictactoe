const TeddyCoaster = () => {
  const { useState, useEffect, useRef, useCallback } = React;

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const HORIZON_Y = 180;
  const GROUND_Y = CANVAS_HEIGHT - 100;
  const TEDDY_Y = CANVAS_HEIGHT - 80;
  const STARS_PER_CHARACTER = 10;

  // Game state
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [powerMeter, setPowerMeter] = useState(100);
  const [mousePos, setMousePos] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [effects, setEffects] = useState([]);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [levelTarget, setLevelTarget] = useState(20);
  const [trackOffset, setTrackOffset] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [showHitMarker, setShowHitMarker] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [roadPosition, setRoadPosition] = useState(0); // 0 = center, -1 = left, 1 = right
  const [branchChoice, setBranchChoice] = useState(null); // null, 'left', 'right'
  const [showBranchPrompt, setShowBranchPrompt] = useState(false);
  const [branchTimer, setBranchTimer] = useState(0);
  const [environmentItems, setEnvironmentItems] = useState([]);

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const branchSpawnRef = useRef(0);
  const bossRef = useRef(null);
  const firingRef = useRef(false);

  // Progression system
  const [progression, setProgression] = useState(() => {
    const saved = localStorage.getItem('teddy_coaster_progression_v2');
    if (saved) return JSON.parse(saved);
    return {
      starPoints: 0,
      highScores: Array(10).fill(null).map(() => Array(10).fill(0)),
      totalShots: 0,
      totalHits: 0,
      gamesPlayed: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('teddy_coaster_progression_v2', JSON.stringify(progression));
  }, [progression]);

  // Calculate progression
  const getProgressInfo = useCallback(() => {
    const totalStars = progression.starPoints;
    const getCharacterStars = (charIdx) => {
      const charStart = charIdx * STARS_PER_CHARACTER;
      const charEnd = charStart + STARS_PER_CHARACTER;
      if (totalStars >= charEnd) return STARS_PER_CHARACTER;
      if (totalStars <= charStart) return 0;
      return totalStars - charStart;
    };
    const isCharacterUnlocked = (charIdx) => charIdx === 0 || getCharacterStars(charIdx - 1) >= STARS_PER_CHARACTER;
    const isLevelUnlocked = (charIdx, levelIdx) => {
      if (!isCharacterUnlocked(charIdx)) return false;
      if (levelIdx === 0) return true;
      return getCharacterStars(charIdx) >= levelIdx;
    };
    const isLevelCompleted = (charIdx, levelIdx) => getCharacterStars(charIdx) > levelIdx;
    return { totalStars, getCharacterStars, isCharacterUnlocked, isLevelUnlocked, isLevelCompleted };
  }, [progression.starPoints]);

  // 10 Character/World definitions with boss weak points
  const characterDefs = [
    {
      id: 'balloon_bay', name: 'Balloon Bay', boss: 'Balloon Bandit',
      emoji: '🎈', bossEmoji: '🤡', color: '#ff6b6b',
      description: 'Pop the colorful balloons!', bossHealth: 100,
      gimmick: 'floating', gimmickDesc: 'Targets float upward',
      taunt: "Pop quiz time!", winQuote: "My balloons... POP!", loseQuote: "You're full of hot air!",
      weakPoints: [{ name: 'nose', x: 0, y: -10, radius: 20, damage: 2 }],
      environment: 'balloons'
    },
    {
      id: 'candy_canyon', name: 'Candy Canyon', boss: 'Cotton Candy Witch',
      emoji: '🍭', bossEmoji: '🧙‍♀️', color: '#ff9ff3',
      description: 'Sweet treats await!', bossHealth: 120,
      gimmick: 'zigzag', gimmickDesc: 'Enemies zigzag toward you',
      taunt: "Sweet dreams!", winQuote: "Sugar crash...", loseQuote: "Stuck in my trap!",
      weakPoints: [{ name: 'wand', x: 25, y: 0, radius: 15, damage: 2 }],
      environment: 'candy'
    },
    {
      id: 'ghost_gallery', name: 'Ghost Gallery', boss: 'Ferris Phantom',
      emoji: '👻', bossEmoji: '👻', color: '#a29bfe',
      description: 'Spooky spectral targets!', bossHealth: 150,
      gimmick: 'phasing', gimmickDesc: 'Ghosts phase in and out',
      taunt: "Wooooo!", winQuote: "Fading away...", loseQuote: "You missed!",
      weakPoints: [{ name: 'core', x: 0, y: 0, radius: 25, damage: 1, phaseRequired: true }],
      environment: 'haunted'
    },
    {
      id: 'popcorn_plaza', name: 'Popcorn Plaza', boss: 'Popcorn Poltergeist',
      emoji: '🍿', bossEmoji: '🍿', color: '#ffeaa7',
      description: 'Kernels everywhere!', bossHealth: 130,
      gimmick: 'explosive', gimmickDesc: 'Shoot kernels before they pop!',
      taunt: "Let's get POPPING!", winQuote: "All popped out...", loseQuote: "Kernel panic!",
      weakPoints: [{ name: 'kernel', x: 0, y: -15, radius: 18, damage: 2 }],
      environment: 'carnival'
    },
    {
      id: 'carousel_castle', name: 'Carousel Castle', boss: 'Carousel Knight',
      emoji: '🎠', bossEmoji: '🐴', color: '#74b9ff',
      description: 'Round and round!', bossHealth: 180,
      gimmick: 'circular', gimmickDesc: 'Enemies orbit around',
      taunt: "On guard!", winQuote: "We ride no more...", loseQuote: "Jousted!",
      weakPoints: [
        { name: 'helmet', x: 0, y: -20, radius: 15, damage: 3 },
        { name: 'shield', x: -20, y: 5, radius: 20, damage: 0, blocks: true }
      ],
      environment: 'castle'
    },
    {
      id: 'mirror_maze', name: 'Mirror Maze', boss: 'Mirror Master',
      emoji: '🪞', bossEmoji: '🎭', color: '#00cec9',
      description: 'Which one is real?', bossHealth: 200,
      gimmick: 'decoys', gimmickDesc: 'Fake targets appear',
      taunt: "Find the real me!", winQuote: "Shattered...", loseQuote: "Bad luck!",
      weakPoints: [{ name: 'gem', x: 0, y: 0, radius: 20, damage: 2, flickering: true }],
      environment: 'mirrors'
    },
    {
      id: 'dino_den', name: 'Dino Den', boss: 'Coaster Rex',
      emoji: '🦖', bossEmoji: '🦖', color: '#00b894',
      description: 'Prehistoric panic!', bossHealth: 250,
      gimmick: 'charging', gimmickDesc: 'Dinos charge fast!',
      taunt: "ROOOAR!", winQuote: "Extinct again...", loseQuote: "Off the rails!",
      weakPoints: [
        { name: 'eye', x: -15, y: -20, radius: 12, damage: 3 },
        { name: 'eye', x: 15, y: -20, radius: 12, damage: 3 }
      ],
      environment: 'jungle'
    },
    {
      id: 'rocket_runway', name: 'Rocket Runway', boss: 'Captain Cosmos',
      emoji: '🚀', bossEmoji: '👨‍🚀', color: '#6c5ce7',
      description: 'Blast off!', bossHealth: 280,
      gimmick: 'fast', gimmickDesc: 'Super fast enemies',
      taunt: "3... 2... 1...!", winQuote: "Houston problem...", loseQuote: "Mission complete!",
      weakPoints: [{ name: 'visor', x: 0, y: -10, radius: 18, damage: 2 }],
      environment: 'space'
    },
    {
      id: 'pirate_pier', name: 'Pirate Pier', boss: 'Captain Plunder',
      emoji: '🏴‍☠️', bossEmoji: '🐻', color: '#636e72',
      description: 'Arrr, treasure!', bossHealth: 300,
      gimmick: 'waves', gimmickDesc: 'Enemies bob on waves',
      taunt: "Walk the plank!", winQuote: "Me booty...", loseQuote: "Landlubber!",
      weakPoints: [
        { name: 'hat', x: 0, y: -25, radius: 20, damage: 2 },
        { name: 'sword', x: 30, y: 10, radius: 15, damage: 1 }
      ],
      environment: 'pirate'
    },
    {
      id: 'ringmaster_realm', name: "Ringmaster's Realm", boss: 'Ringmaster Teddy',
      emoji: '🎪', bossEmoji: '🎩', color: '#e17055',
      description: 'The FINAL show!', bossHealth: 400,
      gimmick: 'everything', gimmickDesc: 'All gimmicks combined!',
      taunt: "The FINAL act!", winQuote: "My circus...", loseQuote: "Show goes on!",
      weakPoints: [
        { name: 'hat', x: 0, y: -30, radius: 25, damage: 3 },
        { name: 'cane', x: 35, y: 0, radius: 12, damage: 2 },
        { name: 'heart', x: 0, y: 10, radius: 15, damage: 5, hidden: true }
      ],
      environment: 'circus'
    }
  ];

  // Enemy types with z-depth
  const enemyTypes = [
    { type: 'balloon', emoji: '🎈', points: 10, speed: 0.8, health: 1, size: 40 },
    { type: 'duck', emoji: '🦆', points: 15, speed: 1.0, health: 1, size: 35 },
    { type: 'ghost', emoji: '👻', points: 25, speed: 0.7, health: 1, size: 38, phasing: true },
    { type: 'clown', emoji: '🤡', points: 30, speed: 0.6, health: 2, size: 45 },
    { type: 'bat', emoji: '🦇', points: 20, speed: 1.2, health: 1, size: 30 },
    { type: 'candy', emoji: '🍬', points: 15, speed: 0.9, health: 1, size: 32 },
  ];

  // Theme
  const theme = {
    bg: '#1a1625', bgPanel: '#2a2440', border: '#4a4468',
    text: '#ffffff', textMuted: '#8880a0',
    accent: '#e94560', gold: '#f4c542', success: '#50c878', error: '#e85a50'
  };

  // Start level
  const startLevel = (character, level) => {
    setSelectedCharacter(character);
    setCurrentLevel(level);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setPowerMeter(100);
    setEnemies([]);
    setProjectiles([]);
    setEffects([]);
    setLevelProgress(0);
    setTrackOffset(0);
    setRoadPosition(0);
    setBranchChoice(null);
    setShowBranchPrompt(false);
    setBranchTimer(0);
    setEnvironmentItems([]);
    spawnTimerRef.current = 0;
    branchSpawnRef.current = 0;
    bossRef.current = null;

    if (level === 10) {
      setBossMaxHealth(character.bossHealth);
      setBossHealth(character.bossHealth);
      setLevelTarget(1);
    } else {
      setBossHealth(0);
      setBossMaxHealth(0);
      setLevelTarget(12 + level * 2);
    }

    // Initialize environment
    initEnvironment(character.environment);
  };

  // Initialize environment items for parallax
  const initEnvironment = (envType) => {
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        x: Math.random() * CANVAS_WIDTH * 2 - CANVAS_WIDTH / 2,
        z: 0.3 + Math.random() * 0.7,
        type: envType,
        variant: Math.floor(Math.random() * 3)
      });
    }
    setEnvironmentItems(items);
  };

  const returnToMenu = () => {
    setGameState('menu');
    setSelectedCharacter(null);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  };

  const returnToLevelSelect = () => {
    setGameState('levelSelect');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
  };

  // Spawn enemy with z-depth (distance)
  const spawnEnemy = useCallback(() => {
    if (!selectedCharacter) return;

    const baseEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const xSpread = 300;
    const startX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * xSpread;

    let enemy = {
      id: Date.now() + Math.random(),
      x: startX,
      y: HORIZON_Y,
      z: 1.0, // Far away (0 = close, 1 = far)
      baseX: startX,
      ...baseEnemy,
      spawnTime: Date.now(),
      angle: 0
    };

    // Apply gimmick
    const gimmick = selectedCharacter.gimmick;
    switch (gimmick) {
      case 'floating':
        enemy.floatOffset = Math.random() * Math.PI * 2;
        enemy.floatAmp = 30;
        break;
      case 'zigzag':
        enemy.zigzagPhase = Math.random() * Math.PI * 2;
        enemy.zigzagAmp = 80;
        break;
      case 'phasing':
        enemy.phasing = true;
        enemy.phaseOffset = Math.random() * Math.PI * 2;
        break;
      case 'explosive':
        if (Math.random() < 0.3) {
          enemy.explosive = true;
          enemy.emoji = '🌽';
          enemy.fuseTime = 4000;
          enemy.points = 40;
        }
        break;
      case 'circular':
        enemy.orbitRadius = 50 + Math.random() * 50;
        enemy.orbitSpeed = 0.02;
        enemy.orbitAngle = Math.random() * Math.PI * 2;
        break;
      case 'decoys':
        if (Math.random() < 0.5) {
          enemy.isDecoy = true;
          enemy.points = -15;
        }
        break;
      case 'charging':
        enemy.speed *= 1.5;
        break;
      case 'fast':
        enemy.speed *= 2;
        break;
      case 'waves':
        enemy.wavePhase = Math.random() * Math.PI * 2;
        enemy.waveAmp = 20;
        break;
      case 'everything':
        // Random combination
        if (Math.random() < 0.3) enemy.phasing = true;
        if (Math.random() < 0.3) enemy.speed *= 1.5;
        if (Math.random() < 0.2) enemy.isDecoy = true;
        break;
    }

    setEnemies(prev => [...prev, enemy]);
  }, [selectedCharacter]);

  // Spawn boss
  const spawnBoss = useCallback(() => {
    if (!selectedCharacter) return;

    bossRef.current = {
      x: CANVAS_WIDTH / 2,
      y: HORIZON_Y + 80,
      z: 0.3, // Closer than regular enemies
      health: bossMaxHealth,
      phase: 1,
      attackTimer: 0,
      staggered: false,
      staggerTimer: 0,
      weakPointsHit: {},
      angle: 0
    };
    setBossHealth(bossMaxHealth);
  }, [selectedCharacter, bossMaxHealth]);

  // Shoot - uses power meter
  const shoot = useCallback(() => {
    if (powerMeter < 5) return;

    const now = Date.now();
    const cooldown = powerMeter > 20 ? 100 : 200; // Slower when low power
    if (now - lastShootRef.current < cooldown) return;

    lastShootRef.current = now;
    setPowerMeter(prev => Math.max(0, prev - 3));
    setProgression(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

    // Instant hit detection at crosshair position
    checkHit(mousePos.x, mousePos.y);

    // Muzzle flash effect
    setEffects(prev => [...prev, {
      id: Date.now(),
      type: 'muzzle',
      x: CANVAS_WIDTH / 2,
      y: TEDDY_Y - 30,
      life: 5
    }]);

    // Shot trail effect
    setEffects(prev => [...prev, {
      id: Date.now() + 1,
      type: 'shot',
      startX: CANVAS_WIDTH / 2,
      startY: TEDDY_Y - 30,
      endX: mousePos.x,
      endY: mousePos.y,
      life: 3
    }]);
  }, [mousePos, powerMeter]);

  // Check hit at position
  const checkHit = useCallback((hitX, hitY) => {
    let hit = false;

    // Check boss weak points
    if (bossRef.current && selectedCharacter) {
      const boss = bossRef.current;
      const scale = getScaleFromZ(boss.z);
      const bossScreenY = getScreenY(boss.z);

      for (const wp of selectedCharacter.weakPoints) {
        if (wp.blocks) continue;
        if (wp.hidden && boss.health > bossMaxHealth * 0.3) continue;

        const wpX = boss.x + wp.x * scale;
        const wpY = bossScreenY + wp.y * scale;
        const wpRadius = wp.radius * scale;

        // Check if phasing requirement met
        if (wp.phaseRequired) {
          const phaseValue = Math.sin(Date.now() / 300);
          if (phaseValue < 0.5) continue;
        }

        const dist = Math.sqrt((hitX - wpX) ** 2 + (hitY - wpY) ** 2);
        if (dist < wpRadius) {
          hit = true;
          boss.health -= wp.damage * 10;
          boss.staggered = true;
          boss.staggerTimer = 200;
          boss.weakPointsHit[wp.name] = (boss.weakPointsHit[wp.name] || 0) + 1;

          setBossHealth(prev => Math.max(0, prev - wp.damage * 10));
          setScore(prev => prev + 100);
          setCombo(prev => {
            const newCombo = prev + 1;
            setMaxCombo(m => Math.max(m, newCombo));
            return newCombo;
          });
          setShowHitMarker(true);
          setTimeout(() => setShowHitMarker(false), 100);
          setScreenShake(8);

          setEffects(prev => [...prev, {
            id: Date.now(),
            type: 'weakpoint',
            x: wpX,
            y: wpY,
            life: 15,
            text: `${wp.name.toUpperCase()}!`
          }]);

          // Check boss defeat
          if (boss.health <= 0) {
            bossRef.current = null;
            setScore(prev => prev + 1000);
            setScreenShake(25);
            setLevelProgress(prev => prev + 1);
          }

          setProgression(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
          break;
        }
      }

      // Check if hit boss body (no weak point)
      if (!hit) {
        const bodyDist = Math.sqrt((hitX - boss.x) ** 2 + (hitY - bossScreenY) ** 2);
        if (bodyDist < 50 * scale) {
          // Hit body but not weak point - small damage
          hit = true;
          boss.health -= 2;
          setBossHealth(prev => Math.max(0, prev - 2));
          setScore(prev => prev + 10);

          setEffects(prev => [...prev, {
            id: Date.now(),
            type: 'hit',
            x: hitX,
            y: hitY,
            life: 8
          }]);

          if (boss.health <= 0) {
            bossRef.current = null;
            setScore(prev => prev + 1000);
            setLevelProgress(prev => prev + 1);
          }
        }
      }
    }

    // Check regular enemies
    setEnemies(prev => {
      const remaining = [];
      for (const enemy of prev) {
        const scale = getScaleFromZ(enemy.z);
        const screenY = getScreenY(enemy.z);
        const enemyRadius = (enemy.size / 2) * scale;

        // Check phasing
        if (enemy.phasing) {
          const phaseValue = Math.sin(Date.now() / 200 + (enemy.phaseOffset || 0));
          if (phaseValue < 0.3) {
            remaining.push(enemy);
            continue;
          }
        }

        const dist = Math.sqrt((hitX - enemy.x) ** 2 + (hitY - screenY) ** 2);
        if (dist < enemyRadius) {
          hit = true;
          enemy.health -= 1;

          if (enemy.health <= 0) {
            const comboMult = Math.floor(combo / 5) + 1;
            const points = enemy.points * comboMult;
            setScore(prev => prev + (points > 0 ? points : 0));

            if (!enemy.isDecoy && enemy.points > 0) {
              setCombo(prev => {
                const newCombo = prev + 1;
                setMaxCombo(m => Math.max(m, newCombo));
                return newCombo;
              });
              setLevelProgress(prev => prev + 1);
            } else if (enemy.isDecoy) {
              setCombo(0);
            }

            setEffects(prev => [...prev, {
              id: Date.now(),
              type: 'destroy',
              x: enemy.x,
              y: screenY,
              emoji: enemy.emoji,
              life: 20,
              points: points
            }]);

            setProgression(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
          } else {
            remaining.push(enemy);
          }

          setShowHitMarker(true);
          setTimeout(() => setShowHitMarker(false), 100);
        } else {
          remaining.push(enemy);
        }
      }
      return remaining;
    });

    // Check branch barricades
    if (showBranchPrompt) {
      const leftX = CANVAS_WIDTH / 2 - 120;
      const rightX = CANVAS_WIDTH / 2 + 120;
      const barricadeY = HORIZON_Y + 50;

      if (Math.abs(hitX - leftX) < 40 && Math.abs(hitY - barricadeY) < 30) {
        setBranchChoice('right'); // Shoot left, go right
        setShowBranchPrompt(false);
        setRoadPosition(1);
        setEffects(prev => [...prev, { id: Date.now(), type: 'branch', x: leftX, y: barricadeY, life: 15, dir: 'right' }]);
        hit = true;
      } else if (Math.abs(hitX - rightX) < 40 && Math.abs(hitY - barricadeY) < 30) {
        setBranchChoice('left');
        setShowBranchPrompt(false);
        setRoadPosition(-1);
        setEffects(prev => [...prev, { id: Date.now(), type: 'branch', x: rightX, y: barricadeY, life: 15, dir: 'left' }]);
        hit = true;
      }
    }

    if (!hit) {
      setCombo(0);
    }

    return hit;
  }, [combo, selectedCharacter, bossMaxHealth, showBranchPrompt]);

  // Convert z-depth to scale (0=close/big, 1=far/small)
  const getScaleFromZ = (z) => {
    return 0.3 + (1 - z) * 1.2; // Range from 0.3 (far) to 1.5 (close)
  };

  // Convert z-depth to screen Y position
  const getScreenY = (z) => {
    return HORIZON_Y + (GROUND_Y - HORIZON_Y) * (1 - z);
  };

  // Victory handler
  const handleVictory = useCallback(() => {
    setGameState('victory');
    const progressInfo = getProgressInfo();
    const charIndex = characterDefs.findIndex(c => c.id === selectedCharacter.id);
    const levelIndex = currentLevel - 1;

    if (!progressInfo.isLevelCompleted(charIndex, levelIndex)) {
      setProgression(prev => ({
        ...prev,
        starPoints: prev.starPoints + 1,
        gamesPlayed: prev.gamesPlayed + 1
      }));
    } else {
      setProgression(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    }
  }, [selectedCharacter, currentLevel, getProgressInfo]);

  // Check level completion
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (currentLevel === 10) {
      if (levelProgress >= levelTarget && !bossRef.current && bossHealth <= 0) {
        handleVictory();
      } else if (levelProgress >= 10 && !bossRef.current) {
        spawnBoss();
      }
    } else {
      if (levelProgress >= levelTarget) {
        handleVictory();
      }
    }
  }, [levelProgress, levelTarget, gameState, currentLevel, bossHealth, handleVictory, spawnBoss]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = 0;

    const gameLoop = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Track scrolling
      setTrackOffset(prev => (prev + 3) % 100);

      // Screen shake decay
      setScreenShake(prev => Math.max(0, prev - 0.5));

      // Power meter recharge when not firing
      if (!firingRef.current) {
        setPowerMeter(prev => Math.min(100, prev + 0.3));
      }

      // Branch spawning
      branchSpawnRef.current += deltaTime;
      if (branchSpawnRef.current > 8000 && !showBranchPrompt && !bossRef.current && Math.random() < 0.01) {
        setShowBranchPrompt(true);
        setBranchTimer(3000);
        branchSpawnRef.current = 0;
      }

      // Branch timer
      if (showBranchPrompt) {
        setBranchTimer(prev => {
          if (prev <= 0) {
            setShowBranchPrompt(false);
            // Random path if not chosen
            setRoadPosition(Math.random() < 0.5 ? -1 : 1);
            return 0;
          }
          return prev - deltaTime;
        });
      }

      // Enemy spawning
      spawnTimerRef.current += deltaTime;
      const spawnRate = bossRef.current ? 1500 : 1000 - currentLevel * 50;
      if (spawnTimerRef.current > spawnRate && !showBranchPrompt) {
        spawnTimerRef.current = 0;
        spawnEnemy();
      }

      // Update enemies (move toward player)
      setEnemies(prev => {
        const remaining = [];
        for (const enemy of prev) {
          let newZ = enemy.z - enemy.speed * 0.008;
          let newX = enemy.baseX;

          // Apply movement patterns
          const time = Date.now() - enemy.spawnTime;

          if (enemy.floatOffset !== undefined) {
            newX += Math.sin(time / 500 + enemy.floatOffset) * enemy.floatAmp;
          }
          if (enemy.zigzagPhase !== undefined) {
            newX += Math.sin(time / 300 + enemy.zigzagPhase) * enemy.zigzagAmp * (1 - enemy.z);
          }
          if (enemy.orbitRadius !== undefined) {
            enemy.orbitAngle += enemy.orbitSpeed;
            newX = enemy.baseX + Math.cos(enemy.orbitAngle) * enemy.orbitRadius * (1 - enemy.z);
          }
          if (enemy.wavePhase !== undefined) {
            newX += Math.sin(time / 400 + enemy.wavePhase) * enemy.waveAmp;
          }

          // Explosive timer
          if (enemy.explosive && enemy.spawnTime) {
            if (Date.now() - enemy.spawnTime > enemy.fuseTime) {
              setLives(prev => prev - 1);
              setScreenShake(15);
              setEffects(prev => [...prev, {
                id: Date.now(), type: 'explosion',
                x: enemy.x, y: getScreenY(enemy.z), life: 20
              }]);
              continue;
            }
          }

          // Remove if too close (hit player)
          if (newZ < 0.05) {
            if (!enemy.isDecoy && enemy.points > 0) {
              setLives(prev => prev - 1);
              setScreenShake(10);
              setCombo(0);
            }
            continue;
          }

          // Remove if off screen
          if (newX < -100 || newX > CANVAS_WIDTH + 100) continue;

          remaining.push({ ...enemy, x: newX, z: newZ });
        }
        return remaining;
      });

      // Update boss
      if (bossRef.current) {
        const boss = bossRef.current;
        boss.angle = Math.sin(Date.now() / 1000) * 0.1;
        boss.x = CANVAS_WIDTH / 2 + Math.sin(Date.now() / 800) * 100;

        if (boss.staggered) {
          boss.staggerTimer -= deltaTime;
          if (boss.staggerTimer <= 0) boss.staggered = false;
        }

        // Boss attacks
        boss.attackTimer += deltaTime;
        if (boss.attackTimer > 2500 && !boss.staggered) {
          boss.attackTimer = 0;
          // Spawn attack projectile
          setEnemies(prev => [...prev, {
            id: Date.now(),
            x: boss.x,
            z: boss.z,
            baseX: boss.x,
            emoji: '💥',
            points: 0,
            speed: 1.5,
            health: 1,
            size: 30,
            spawnTime: Date.now(),
            isBossAttack: true
          }]);
        }
      }

      // Update environment (parallax)
      setEnvironmentItems(prev => prev.map(item => {
        let newX = item.x - 2 * item.z;
        if (newX < -100) newX = CANVAS_WIDTH + 100;
        return { ...item, x: newX };
      }));

      // Update effects
      setEffects(prev => prev.filter(e => {
        e.life -= 1;
        return e.life > 0;
      }));

      // Game over check
      if (lives <= 0) {
        setGameState('gameover');
        setProgression(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
        return;
      }

      render(ctx);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, lives, spawnEnemy, spawnBoss, selectedCharacter, currentLevel]);

  // Render
  const render = (ctx) => {
    const shake = screenShake;
    const offX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const offY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.save();
    ctx.translate(offX, offY);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    skyGrad.addColorStop(0, selectedCharacter?.color || '#1a1a2e');
    skyGrad.addColorStop(1, '#2a1f3d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, HORIZON_Y);

    // Ground/track with perspective
    const groundGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#3a3060');
    groundGrad.addColorStop(1, '#1a1020');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, HORIZON_Y, CANVAS_WIDTH, CANVAS_HEIGHT - HORIZON_Y);

    // Perspective track lines
    ctx.strokeStyle = selectedCharacter?.color || '#e94560';
    ctx.lineWidth = 2;
    const vanishX = CANVAS_WIDTH / 2;

    // Left rail
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(-50, CANVAS_HEIGHT);
    ctx.stroke();

    // Right rail
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(CANVAS_WIDTH + 50, CANVAS_HEIGHT);
    ctx.stroke();

    // Track ties (perspective)
    ctx.strokeStyle = '#4a4060';
    ctx.lineWidth = 6;
    for (let i = 0; i < 15; i++) {
      const t = (i + trackOffset / 20) / 15;
      const y = HORIZON_Y + (GROUND_Y - HORIZON_Y) * t;
      const spread = t * (CANVAS_WIDTH / 2 + 50);
      ctx.beginPath();
      ctx.moveTo(vanishX - spread, y);
      ctx.lineTo(vanishX + spread, y);
      ctx.stroke();
    }

    // Environment items (parallax)
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    for (const item of environmentItems) {
      const scale = 0.5 + item.z * 0.5;
      const y = HORIZON_Y - 20 * scale;
      ctx.globalAlpha = 0.3 + item.z * 0.4;
      const envEmojis = { balloons: '🎈', candy: '🍭', haunted: '🏚️', carnival: '🎡', castle: '🏰', mirrors: '🪞', jungle: '🌴', space: '🌟', pirate: '⚓', circus: '🎪' };
      ctx.fillText(envEmojis[item.type] || '🌲', item.x, y);
    }
    ctx.globalAlpha = 1;

    // Branch prompt barricades
    if (showBranchPrompt) {
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('🚧', CANVAS_WIDTH / 2 - 120, HORIZON_Y + 50);
      ctx.fillText('🚧', CANVAS_WIDTH / 2 + 120, HORIZON_Y + 50);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('SHOOT TO CHOOSE PATH!', CANVAS_WIDTH / 2, HORIZON_Y + 30);
      ctx.fillText(`${Math.ceil(branchTimer / 1000)}s`, CANVAS_WIDTH / 2, HORIZON_Y + 80);
    }

    // Sort enemies by z (far first)
    const sortedEnemies = [...enemies].sort((a, b) => b.z - a.z);

    // Draw enemies
    for (const enemy of sortedEnemies) {
      const scale = getScaleFromZ(enemy.z);
      const screenY = getScreenY(enemy.z);
      const size = enemy.size * scale;

      // Phasing effect
      if (enemy.phasing) {
        const phaseValue = Math.sin(Date.now() / 200 + (enemy.phaseOffset || 0));
        ctx.globalAlpha = phaseValue > 0.3 ? 0.9 : 0.2;
      }

      // Decoy effect
      if (enemy.isDecoy) {
        ctx.globalAlpha = 0.5;
      }

      // Explosive warning
      if (enemy.explosive && enemy.spawnTime) {
        const timeLeft = enemy.fuseTime - (Date.now() - enemy.spawnTime);
        if (timeLeft < 1500) {
          ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 50) * 0.3})`;
          ctx.beginPath();
          ctx.arc(enemy.x, screenY, size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enemy.emoji, enemy.x, screenY);
      ctx.globalAlpha = 1;
    }

    // Draw boss
    if (bossRef.current && selectedCharacter) {
      const boss = bossRef.current;
      const scale = getScaleFromZ(boss.z);
      const screenY = getScreenY(boss.z);

      ctx.save();
      ctx.translate(boss.x, screenY);
      ctx.rotate(boss.angle);

      // Boss glow
      ctx.shadowColor = selectedCharacter.color;
      ctx.shadowBlur = 30;

      // Boss stagger effect
      if (boss.staggered) {
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 30) * 0.3;
      }

      // Boss sprite
      ctx.font = `${80 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedCharacter.bossEmoji, 0, 0);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Draw weak points indicators
      for (const wp of selectedCharacter.weakPoints) {
        if (wp.hidden && boss.health > bossMaxHealth * 0.3) continue;
        if (wp.blocks) continue;

        const wpX = wp.x * scale;
        const wpY = wp.y * scale;
        const wpRadius = wp.radius * scale;

        // Weak point glow
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wpX, wpY, wpRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Weak point flash if hit recently
        if (boss.weakPointsHit[wp.name] && Date.now() % 500 < 250) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fill();
        }
      }

      ctx.restore();

      // Boss name
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(selectedCharacter.boss, boss.x, screenY - 70 * scale);
    }

    // Effects
    for (const effect of effects) {
      if (effect.type === 'destroy') {
        const progress = (20 - effect.life) / 20;
        ctx.font = `${30 + progress * 20}px Arial`;
        ctx.globalAlpha = effect.life / 20;
        ctx.fillText(effect.emoji, effect.x, effect.y - progress * 50);
        if (effect.points > 0) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = theme.gold;
          ctx.fillText(`+${effect.points}`, effect.x, effect.y - 40 - progress * 30);
        }
        ctx.globalAlpha = 1;
      } else if (effect.type === 'hit') {
        ctx.fillStyle = `rgba(255, 255, 0, ${effect.life / 10})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 15 - effect.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'weakpoint') {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = theme.gold;
        ctx.globalAlpha = effect.life / 15;
        ctx.fillText(effect.text, effect.x, effect.y - (15 - effect.life) * 3);
        ctx.globalAlpha = 1;
      } else if (effect.type === 'explosion') {
        ctx.fillStyle = `rgba(255, 100, 0, ${effect.life / 20})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 60 - effect.life * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'muzzle') {
        ctx.fillStyle = `rgba(255, 200, 0, ${effect.life / 5})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 20 - effect.life * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'shot') {
        ctx.strokeStyle = `rgba(255, 220, 0, ${effect.life / 3})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effect.startX, effect.startY);
        ctx.lineTo(effect.endX, effect.endY);
        ctx.stroke();
      } else if (effect.type === 'branch') {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = theme.success;
        ctx.globalAlpha = effect.life / 15;
        ctx.fillText(`→ ${effect.dir.toUpperCase()}`, effect.x, effect.y - 20);
        ctx.globalAlpha = 1;
      }
    }

    // Draw Teddy at bottom (first person view)
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🧸', CANVAS_WIDTH / 2, TEDDY_Y);

    // Gun/pointer from teddy
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, TEDDY_Y - 40);
    ctx.lineTo(CANVAS_WIDTH / 2 + (mousePos.x - CANVAS_WIDTH / 2) * 0.3, TEDDY_Y - 50);
    ctx.stroke();

    // Crosshair
    const cx = mousePos.x;
    const cy = mousePos.y;
    ctx.strokeStyle = showHitMarker ? '#ff0000' : (powerMeter > 20 ? '#00ff00' : '#ff6600');
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 30, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx, cy - 30);
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    ctx.fillStyle = showHitMarker ? '#ff0000' : '#00ff00';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 35);

    if (combo > 0) {
      ctx.fillStyle = combo >= 10 ? '#ff6b6b' : combo >= 5 ? '#feca57' : '#fff';
      ctx.fillText(`Combo: x${combo}`, 20, 65);
    }

    ctx.fillText('❤️'.repeat(Math.max(0, lives)), 20, 95);

    // Power meter
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText('POWER', CANVAS_WIDTH - 20, 30);
    ctx.fillStyle = '#333';
    ctx.fillRect(CANVAS_WIDTH - 120, 40, 100, 15);
    ctx.fillStyle = powerMeter > 50 ? '#00ff00' : powerMeter > 20 ? '#ffff00' : '#ff0000';
    ctx.fillRect(CANVAS_WIDTH - 120, 40, powerMeter, 15);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - 120, 40, 100, 15);

    if (powerMeter < 20) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '12px Arial';
      ctx.fillText('LOW POWER!', CANVAS_WIDTH - 20, 70);
    }

    // Level info
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    if (currentLevel === 10) {
      ctx.fillText(`BOSS: ${selectedCharacter?.boss}`, CANVAS_WIDTH / 2, 30);
    } else {
      ctx.fillText(`${selectedCharacter?.name} - Lv.${currentLevel}`, CANVAS_WIDTH / 2, 30);
      ctx.font = '14px Arial';
      ctx.fillText(`${levelProgress}/${levelTarget}`, CANVAS_WIDTH / 2, 50);
    }

    // Boss health bar
    if (bossRef.current && bossMaxHealth > 0) {
      const barW = 300, barH = 20;
      const barX = (CANVAS_WIDTH - barW) / 2, barY = 60;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      const hp = bossHealth / bossMaxHealth;
      ctx.fillStyle = hp > 0.5 ? '#00ff00' : hp > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(barX, barY, barW * hp, barH);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(barX, barY, barW, barH);

      // Weak point hint
      ctx.font = '12px Arial';
      ctx.fillStyle = theme.gold;
      ctx.fillText('AIM FOR WEAK POINTS!', CANVAS_WIDTH / 2, barY + 35);
    }
  };

  // Mouse handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseDown = () => {
    setIsFiring(true);
    firingRef.current = true;
  };

  const handleMouseUp = () => {
    setIsFiring(false);
    firingRef.current = false;
  };

  // Continuous firing
  useEffect(() => {
    if (gameState !== 'playing' || !isFiring) return;
    const interval = setInterval(() => {
      if (firingRef.current) shoot();
    }, 100);
    return () => clearInterval(interval);
  }, [gameState, isFiring, shoot]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
        else if (gameState === 'levelSelect') returnToMenu();
        else returnToMenu();
      } else if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        shoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, shoot]);

  const resetProgress = () => {
    if (confirm('Reset all progress?')) {
      setProgression({
        starPoints: 0,
        highScores: Array(10).fill(null).map(() => Array(10).fill(0)),
        totalShots: 0, totalHits: 0, gamesPlayed: 0
      });
    }
  };

  const StarBar = ({ stars, maxStars = 10, color = theme.gold }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array(maxStars).fill(0).map((_, i) => (
        <span key={i} style={{ fontSize: '12px', opacity: i < stars ? 1 : 0.3, filter: i < stars ? `drop-shadow(0 0 3px ${color})` : 'none' }}>★</span>
      ))}
    </div>
  );

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1a1625 0%, #2a1f3d 50%, #1a2535 100%)', fontFamily: '"Segoe UI", sans-serif', color: '#fff', padding: '20px' },
    title: { fontSize: '38px', fontWeight: 'bold', marginBottom: '5px', textShadow: '0 0 20px #e94560' },
    subtitle: { fontSize: '13px', color: '#a0a0a0', marginBottom: '15px' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxWidth: '850px', width: '100%' },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', cursor: 'pointer', border: '2px solid transparent', textAlign: 'center', position: 'relative', transition: 'all 0.2s' },
    levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxWidth: '450px' },
    button: { background: 'linear-gradient(135deg, #e94560, #533a71)', border: 'none', borderRadius: '20px', padding: '10px 25px', color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', margin: '8px' },
    backButton: { position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '15px', padding: '6px 15px', color: '#fff', cursor: 'pointer', fontSize: '13px' },
    canvas: { border: '3px solid #e94560', borderRadius: '10px', cursor: 'crosshair', boxShadow: '0 0 30px rgba(233,69,96,0.3)' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }
  };

  const progressInfo = getProgressInfo();

  // Menu
  if (gameState === 'menu') {
    return (
      <div style={styles.container}>
        <a href="menu.html" style={styles.backButton}>← Games</a>
        <div style={styles.title}>🎢 TEDDY COASTER 🧸</div>
        <div style={styles.subtitle}>Rail Shooter | Stars: {progressInfo.totalStars}/100 | Hold click for rapid fire!</div>
        <div style={styles.menuGrid}>
          {characterDefs.map((char, i) => {
            const unlocked = progressInfo.isCharacterUnlocked(i);
            const stars = progressInfo.getCharacterStars(i);
            return (
              <div key={char.id} style={{ ...styles.card, borderColor: unlocked ? char.color : '#333', opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'not-allowed' }}
                onClick={() => unlocked && (setSelectedCharacter(char), setGameState('levelSelect'))}>
                {!unlocked && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔒</div>}
                <div style={{ fontSize: '32px' }}>{char.emoji}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: char.color }}>{char.name}</div>
                <StarBar stars={stars} color={char.color} />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
          Accuracy: {progression.totalShots > 0 ? Math.round(progression.totalHits / progression.totalShots * 100) : 0}% |
          <button onClick={resetProgress} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginLeft: '10px' }}>Reset</button>
        </div>
      </div>
    );
  }

  // Level select
  if (gameState === 'levelSelect' && selectedCharacter) {
    const charIdx = characterDefs.findIndex(c => c.id === selectedCharacter.id);
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={returnToMenu}>← Back</button>
        <div style={{ fontSize: '40px' }}>{selectedCharacter.emoji}</div>
        <div style={{ ...styles.title, fontSize: '28px', color: selectedCharacter.color }}>{selectedCharacter.name}</div>
        <div style={styles.subtitle}>{selectedCharacter.gimmickDesc} | "{selectedCharacter.taunt}"</div>
        <div style={styles.levelGrid}>
          {Array(10).fill(0).map((_, lvl) => {
            const unlocked = progressInfo.isLevelUnlocked(charIdx, lvl);
            const done = progressInfo.isLevelCompleted(charIdx, lvl);
            const isBoss = lvl === 9;
            return (
              <div key={lvl} style={{ ...styles.card, borderColor: unlocked ? (isBoss ? '#e94560' : selectedCharacter.color) : '#333', background: done ? `${selectedCharacter.color}20` : 'rgba(255,255,255,0.05)', opacity: unlocked ? 1 : 0.4, gridColumn: isBoss ? 'span 5' : 'auto' }}
                onClick={() => unlocked && startLevel(selectedCharacter, lvl + 1)}>
                {!unlocked ? <div>🔒</div> : (
                  <>
                    <div style={{ fontSize: isBoss ? '28px' : '18px' }}>{isBoss ? selectedCharacter.bossEmoji : (done ? '⭐' : lvl + 1)}</div>
                    <div style={{ fontSize: '11px', color: isBoss ? '#e94560' : '#aaa' }}>{isBoss ? `BOSS` : (done ? 'Done' : `Lv ${lvl + 1}`)}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
          <strong>Weak Points:</strong> {selectedCharacter.weakPoints.filter(w => !w.blocks).map(w => w.name).join(', ')}
        </div>
      </div>
    );
  }

  // Game
  return (
    <div style={styles.container}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.canvas}
          onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />

        {gameState === 'paused' && (
          <div style={styles.overlay}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>PAUSED</div>
            <button style={styles.button} onClick={() => setGameState('playing')}>Resume</button>
            <button style={styles.button} onClick={returnToLevelSelect}>Quit</button>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={styles.overlay}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.success }}>{currentLevel === 10 ? 'BOSS DEFEATED!' : 'LEVEL COMPLETE!'}</div>
            {currentLevel === 10 && <div style={{ fontSize: '40px' }}>{selectedCharacter?.bossEmoji}</div>}
            <div style={{ fontSize: '20px', margin: '10px' }}>⭐ +1 Star ⭐</div>
            {currentLevel === 10 && <div style={{ fontStyle: 'italic', color: theme.gold }}>"{selectedCharacter?.winQuote}"</div>}
            <div style={{ margin: '15px' }}>Score: {score} | Combo: x{maxCombo}</div>
            <button style={styles.button} onClick={returnToLevelSelect}>Continue</button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div style={styles.overlay}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: theme.error }}>GAME OVER</div>
            <div style={{ fontSize: '40px' }}>{currentLevel === 10 ? selectedCharacter?.bossEmoji : '💔'}</div>
            {currentLevel === 10 && <div style={{ fontStyle: 'italic', color: theme.gold }}>"{selectedCharacter?.loseQuote}"</div>}
            <div style={{ margin: '15px' }}>Score: {score}</div>
            <button style={styles.button} onClick={() => startLevel(selectedCharacter, currentLevel)}>Retry</button>
            <button style={styles.button} onClick={returnToLevelSelect}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};
