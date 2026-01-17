const TeddyCoaster = () => {
  const { useState, useEffect, useRef, useCallback } = React;

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const CROSSHAIR_SIZE = 30;
  const SHOOT_COOLDOWN = 150;
  const STARS_PER_CHARACTER = 10;
  const TOTAL_CHARACTERS = 10;

  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, levelSelect, playing, paused, victory, gameover
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [ammo, setAmmo] = useState(30);
  const [maxAmmo, setMaxAmmo] = useState(30);
  const [reloading, setReloading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [targets, setTargets] = useState([]);
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
  const [powerUp, setPowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showHitMarker, setShowHitMarker] = useState(false);

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const bossActiveRef = useRef(false);
  const currentBossRef = useRef(null);

  // Progression system - similar to Ultimate TTT
  const [progression, setProgression] = useState(() => {
    const saved = localStorage.getItem('teddy_coaster_progression');
    if (saved) return JSON.parse(saved);
    return {
      starPoints: 0, // 1 star per level completed, 100 total
      characterStars: Array(10).fill(0), // Stars earned per character (0-10 each)
      highScores: Array(10).fill(null).map(() => Array(10).fill(0)), // High score per level
      totalShots: 0,
      totalHits: 0,
      gamesPlayed: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('teddy_coaster_progression', JSON.stringify(progression));
  }, [progression]);

  // Calculate progression helpers
  const getProgressInfo = useCallback(() => {
    const totalStars = progression.starPoints;
    const currentCharIndex = Math.min(9, Math.floor(totalStars / STARS_PER_CHARACTER));
    const starsOnCurrentChar = totalStars - (currentCharIndex * STARS_PER_CHARACTER);

    const getCharacterStars = (charIdx) => {
      const charStart = charIdx * STARS_PER_CHARACTER;
      const charEnd = charStart + STARS_PER_CHARACTER;
      if (totalStars >= charEnd) return STARS_PER_CHARACTER;
      if (totalStars <= charStart) return 0;
      return totalStars - charStart;
    };

    const isCharacterUnlocked = (charIdx) => {
      if (charIdx === 0) return true;
      return getCharacterStars(charIdx - 1) >= STARS_PER_CHARACTER;
    };

    const isLevelUnlocked = (charIdx, levelIdx) => {
      if (!isCharacterUnlocked(charIdx)) return false;
      if (levelIdx === 0) return true;
      const charStars = getCharacterStars(charIdx);
      return charStars >= levelIdx;
    };

    const isLevelCompleted = (charIdx, levelIdx) => {
      const charStars = getCharacterStars(charIdx);
      return charStars > levelIdx;
    };

    return {
      totalStars,
      currentCharIndex,
      starsOnCurrentChar,
      getCharacterStars,
      isCharacterUnlocked,
      isLevelUnlocked,
      isLevelCompleted,
    };
  }, [progression.starPoints]);

  // 10 Character/World definitions
  const characterDefs = [
    {
      id: 'balloon_bay',
      name: 'Balloon Bay',
      boss: 'Balloon Bandit',
      emoji: '🎈',
      bossEmoji: '🤡',
      color: '#ff6b6b',
      accentColor: '#ff8a8a',
      description: 'Pop the colorful balloons!',
      bossHealth: 100,
      gimmick: 'floating_targets',
      gimmickDesc: 'Targets float upward',
      taunt: "Pop quiz time! Can you burst my balloons?",
      winQuote: "My balloons... POP!",
      loseQuote: "You're full of hot air!"
    },
    {
      id: 'candy_canyon',
      name: 'Candy Canyon',
      boss: 'Cotton Candy Witch',
      emoji: '🍭',
      bossEmoji: '🧙‍♀️',
      color: '#ff9ff3',
      accentColor: '#ffb8f8',
      description: 'Sweet treats await!',
      bossHealth: 120,
      gimmick: 'sticky_slow',
      gimmickDesc: 'Cotton candy slows your aim',
      taunt: "Sweet dreams, little bear! Hehehehe!",
      winQuote: "Too... much... sugar crash...",
      loseQuote: "You're stuck in my sweet trap!"
    },
    {
      id: 'ghost_gallery',
      name: 'Ghost Gallery',
      boss: 'Ferris Phantom',
      emoji: '👻',
      bossEmoji: '👻',
      color: '#a29bfe',
      accentColor: '#b8b3ff',
      description: 'Spooky spectral targets!',
      bossHealth: 150,
      gimmick: 'phasing',
      gimmickDesc: 'Ghosts phase in and out',
      taunt: "Round and round we go! Wooooo!",
      winQuote: "I'm... fading... awaaaaay...",
      loseQuote: "You missed your stop!"
    },
    {
      id: 'popcorn_plaza',
      name: 'Popcorn Plaza',
      boss: 'Popcorn Poltergeist',
      emoji: '🍿',
      bossEmoji: '🍿',
      color: '#ffeaa7',
      accentColor: '#fff3c4',
      description: 'Kernels everywhere!',
      bossHealth: 130,
      gimmick: 'explosive',
      gimmickDesc: 'Some kernels explode!',
      taunt: "Let's get this party POPPING!",
      winQuote: "I'm all... popped out...",
      loseQuote: "Kernel panic! Ha!"
    },
    {
      id: 'carousel_castle',
      name: 'Carousel Castle',
      boss: 'Carousel Knight',
      emoji: '🎠',
      bossEmoji: '🐴',
      color: '#74b9ff',
      accentColor: '#93c9ff',
      description: 'Round and round!',
      bossHealth: 180,
      gimmick: 'circular',
      gimmickDesc: 'Targets move in circles',
      taunt: "On guard! This knight never falls!",
      winQuote: "My noble steed... we ride no more...",
      loseQuote: "You've been jousted!"
    },
    {
      id: 'mirror_maze',
      name: 'Mirror Maze',
      boss: 'Funhouse Mirror Master',
      emoji: '🪞',
      bossEmoji: '🎭',
      color: '#00cec9',
      accentColor: '#33e0db',
      description: 'Which one is real?',
      bossHealth: 200,
      gimmick: 'decoys',
      gimmickDesc: 'Fake targets appear',
      taunt: "Which one is real? Even I forget!",
      winQuote: "I'm shattered... literally...",
      loseQuote: "Bad luck! 7 years of it!"
    },
    {
      id: 'dino_den',
      name: 'Dino Den',
      boss: 'Roller Coaster Rex',
      emoji: '🦖',
      bossEmoji: '🦖',
      color: '#00b894',
      accentColor: '#33d1a8',
      description: 'Prehistoric panic!',
      bossHealth: 250,
      gimmick: 'charging',
      gimmickDesc: 'Dinos charge at you!',
      taunt: "ROOOOAR! This ride has NO brakes!",
      winQuote: "Extinct... again... how unfair...",
      loseQuote: "You're going OFF the rails!"
    },
    {
      id: 'rocket_runway',
      name: 'Rocket Runway',
      boss: 'Captain Cosmos',
      emoji: '🚀',
      bossEmoji: '👨‍🚀',
      color: '#6c5ce7',
      accentColor: '#8b7cf0',
      description: 'Blast off to space!',
      bossHealth: 280,
      gimmick: 'fast_targets',
      gimmickDesc: 'Super fast targets',
      taunt: "3... 2... 1... You're done for!",
      winQuote: "Houston... we have a problem...",
      loseQuote: "Mission accomplished! For ME!"
    },
    {
      id: 'pirate_pier',
      name: 'Pirate Pier',
      boss: 'Captain Plunder Bear',
      emoji: '🏴‍☠️',
      bossEmoji: '🐻',
      color: '#2d3436',
      accentColor: '#636e72',
      description: 'Arrr, treasure targets!',
      bossHealth: 300,
      gimmick: 'waves',
      gimmickDesc: 'Targets bob on waves',
      taunt: "Ye dare challenge the captain?!",
      winQuote: "Me ship... me crew... me booty...",
      loseQuote: "Walk the plank, landlubber!"
    },
    {
      id: 'ringmaster_realm',
      name: "Ringmaster's Realm",
      boss: 'Ringmaster Teddy',
      emoji: '🎪',
      bossEmoji: '🎩',
      color: '#e17055',
      accentColor: '#f08a6f',
      description: 'The FINAL attraction!',
      bossHealth: 400,
      gimmick: 'everything',
      gimmickDesc: 'All gimmicks combined!',
      taunt: "Welcome to MY show! The FINAL act!",
      winQuote: "No... my circus... my dreams...",
      loseQuote: "The show must go on... without YOU!"
    }
  ];

  // Target types for regular stages
  const targetTypes = [
    { type: 'duck', emoji: '🦆', points: 10, speed: 2, health: 1 },
    { type: 'balloon_red', emoji: '🎈', points: 15, speed: 1.5, health: 1 },
    { type: 'balloon_blue', emoji: '🫧', points: 20, speed: 3, health: 1 },
    { type: 'star', emoji: '⭐', points: 25, speed: 2.5, health: 1 },
    { type: 'ghost', emoji: '👻', points: 30, speed: 4, health: 1, phasing: true },
    { type: 'clown', emoji: '🤡', points: 50, speed: 1, health: 2 },
  ];

  const powerUpTypes = [
    { type: 'powerup_ammo', emoji: '📦', points: 5, speed: 1, health: 1, isPowerUp: 'ammo' },
    { type: 'powerup_rapid', emoji: '⚡', points: 5, speed: 1, health: 1, isPowerUp: 'rapid' },
    { type: 'powerup_spread', emoji: '🌟', points: 5, speed: 1, health: 1, isPowerUp: 'spread' }
  ];

  // Theme colors
  const theme = {
    bg: '#1a1625',
    bgPanel: '#2a2440',
    bgDark: '#1a1020',
    border: '#4a4468',
    borderLight: '#5a5478',
    text: '#ffffff',
    textSecondary: '#b8b0c8',
    textMuted: '#8880a0',
    accent: '#e94560',
    accentBright: '#ff6b8a',
    gold: '#f4c542',
    goldGlow: 'rgba(244, 197, 66, 0.4)',
    error: '#e85a50',
    success: '#50c878'
  };

  // Start a specific level
  const startLevel = (character, level) => {
    setSelectedCharacter(character);
    setCurrentLevel(level);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setAmmo(30);
    setMaxAmmo(30);
    setReloading(false);
    setTargets([]);
    setProjectiles([]);
    setEffects([]);
    setLevelProgress(0);
    setTrackOffset(0);
    setPowerUp(null);
    setPowerUpTimer(0);
    spawnTimerRef.current = 0;

    // Level 10 is boss fight
    if (level === 10) {
      setBossMaxHealth(character.bossHealth);
      setBossHealth(character.bossHealth);
      bossActiveRef.current = false;
      currentBossRef.current = null;
      setLevelTarget(1); // Just need to beat boss
    } else {
      setBossHealth(0);
      setBossMaxHealth(0);
      bossActiveRef.current = false;
      currentBossRef.current = null;
      // Regular levels: need to hit target count based on level
      setLevelTarget(15 + level * 3); // 18, 21, 24, 27, 30, 33, 36, 39, 42
    }
  };

  const returnToMenu = () => {
    setGameState('menu');
    setSelectedCharacter(null);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const returnToLevelSelect = () => {
    setGameState('levelSelect');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Get target spawn pattern based on character gimmick
  const getSpawnPattern = useCallback(() => {
    if (!selectedCharacter) return 'default';
    return selectedCharacter.gimmick;
  }, [selectedCharacter]);

  // Spawn targets based on level and character
  const spawnTarget = useCallback(() => {
    if (!selectedCharacter) return;

    const pattern = getSpawnPattern();
    const levelDifficulty = currentLevel / 10; // 0.1 to 1.0

    // Chance for power-up
    if (Math.random() < 0.05) {
      const pu = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setTargets(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * (CANVAS_WIDTH - 100) + 50,
        y: -30,
        ...pu,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random()
      }]);
      return;
    }

    const baseTarget = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    let newTarget = {
      id: Date.now(),
      x: Math.random() * (CANVAS_WIDTH - 100) + 50,
      y: -30,
      ...baseTarget,
      speed: baseTarget.speed * (1 + levelDifficulty * 0.5),
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2
    };

    // Apply gimmick modifications
    switch (pattern) {
      case 'floating_targets':
        newTarget.vy = -1 - Math.random(); // Float up
        newTarget.y = CANVAS_HEIGHT + 30;
        break;
      case 'sticky_slow':
        if (Math.random() < 0.3) {
          newTarget.sticky = true;
          newTarget.emoji = '🍬';
        }
        break;
      case 'phasing':
        newTarget.phasing = true;
        break;
      case 'explosive':
        if (Math.random() < 0.3) {
          newTarget.explosive = true;
          newTarget.emoji = '🌽';
          newTarget.fuseTime = 3000;
          newTarget.spawnTime = Date.now();
          newTarget.points = 30;
        }
        break;
      case 'circular':
        newTarget.circleCenter = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 3 };
        newTarget.circleRadius = 80 + Math.random() * 120;
        newTarget.circleAngle = Math.random() * Math.PI * 2;
        newTarget.circleSpeed = 0.02 + Math.random() * 0.02;
        break;
      case 'decoys':
        if (Math.random() < 0.4) {
          newTarget.isDecoy = true;
          newTarget.opacity = 0.6;
          newTarget.points = -10;
        }
        break;
      case 'charging':
        if (Math.random() < 0.3) {
          const fromLeft = Math.random() < 0.5;
          newTarget.x = fromLeft ? -50 : CANVAS_WIDTH + 50;
          newTarget.y = 100 + Math.random() * 250;
          newTarget.vx = fromLeft ? 6 : -6;
          newTarget.vy = 0;
          newTarget.emoji = '🦕';
          newTarget.health = 2;
          newTarget.points = 40;
        }
        break;
      case 'fast_targets':
        newTarget.speed *= 2;
        newTarget.vx *= 1.5;
        newTarget.vy *= 1.5;
        break;
      case 'waves':
        newTarget.waveOffset = Math.random() * Math.PI * 2;
        newTarget.waveAmp = 30 + Math.random() * 30;
        break;
      case 'everything':
        // Random gimmick for final world
        const gimmicks = ['phasing', 'explosive', 'charging', 'fast_targets'];
        const chosen = gimmicks[Math.floor(Math.random() * gimmicks.length)];
        if (chosen === 'phasing') newTarget.phasing = true;
        if (chosen === 'explosive' && Math.random() < 0.5) {
          newTarget.explosive = true;
          newTarget.emoji = '🌽';
          newTarget.fuseTime = 2500;
          newTarget.spawnTime = Date.now();
        }
        if (chosen === 'fast_targets') {
          newTarget.speed *= 2;
          newTarget.vx *= 1.5;
        }
        break;
    }

    setTargets(prev => [...prev, newTarget]);
  }, [selectedCharacter, currentLevel, getSpawnPattern]);

  // Spawn boss
  const spawnBoss = useCallback(() => {
    if (!selectedCharacter) return;

    bossActiveRef.current = true;
    currentBossRef.current = {
      x: CANVAS_WIDTH / 2,
      y: 100,
      health: bossMaxHealth,
      phase: 1,
      attackTimer: 0,
      invulnerable: false,
      invulnerableTimer: 0
    };
    setBossHealth(bossMaxHealth);
  }, [selectedCharacter, bossMaxHealth]);

  // Shoot function
  const shoot = useCallback(() => {
    if (reloading || ammo <= 0) return;

    const now = Date.now();
    const cooldown = powerUp === 'rapid' ? SHOOT_COOLDOWN / 2 : SHOOT_COOLDOWN;
    if (now - lastShootRef.current < cooldown) return;

    lastShootRef.current = now;

    setProgression(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

    if (powerUp === 'spread') {
      const angles = [-0.2, 0, 0.2];
      angles.forEach(angle => {
        setProjectiles(prev => [...prev, {
          id: Date.now() + angle,
          x: mousePos.x,
          y: CANVAS_HEIGHT - 50,
          targetX: mousePos.x + Math.sin(angle) * 100,
          targetY: mousePos.y,
          speed: 20
        }]);
      });
      setAmmo(prev => Math.max(0, prev - 1));
    } else {
      setProjectiles(prev => [...prev, {
        id: Date.now(),
        x: mousePos.x,
        y: CANVAS_HEIGHT - 50,
        targetX: mousePos.x,
        targetY: mousePos.y,
        speed: 20
      }]);
      setAmmo(prev => prev - 1);
    }

    setEffects(prev => [...prev, {
      id: Date.now(),
      type: 'muzzle',
      x: mousePos.x,
      y: CANVAS_HEIGHT - 60,
      life: 5
    }]);

    if (ammo <= 1) {
      reload();
    }
  }, [mousePos, ammo, reloading, powerUp]);

  const reload = useCallback(() => {
    if (reloading) return;
    setReloading(true);
    setTimeout(() => {
      setAmmo(maxAmmo);
      setReloading(false);
    }, 1500);
  }, [reloading, maxAmmo]);

  // Check hit detection
  const checkHit = useCallback((projX, projY) => {
    let hit = false;

    // Check boss hit
    if (bossActiveRef.current && currentBossRef.current && !currentBossRef.current.invulnerable) {
      const boss = currentBossRef.current;
      const dist = Math.sqrt((projX - boss.x) ** 2 + (projY - boss.y) ** 2);
      if (dist < 60) {
        hit = true;
        const damage = 10;
        currentBossRef.current.health -= damage;
        setBossHealth(prev => Math.max(0, prev - damage));
        setScore(prev => prev + 50);
        setCombo(prev => {
          const newCombo = prev + 1;
          setMaxCombo(max => Math.max(max, newCombo));
          return newCombo;
        });
        setShowHitMarker(true);
        setTimeout(() => setShowHitMarker(false), 100);
        setScreenShake(5);

        setEffects(prev => [...prev, {
          id: Date.now(),
          type: 'hit',
          x: projX,
          y: projY,
          life: 10
        }]);

        // Check boss defeat
        if (currentBossRef.current.health <= 0) {
          bossActiveRef.current = false;
          currentBossRef.current = null;
          setScore(prev => prev + 500);
          setScreenShake(20);
          setLevelProgress(prev => prev + 1);

          setProgression(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
        }

        setProgression(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
      }
    }

    // Check target hits
    setTargets(prev => {
      const newTargets = [];
      for (const target of prev) {
        const dist = Math.sqrt((projX - target.x) ** 2 + (projY - target.y) ** 2);
        const hitRadius = 35;

        // Check if ghost is phasing
        if (target.phasing) {
          const phaseValue = Math.sin(Date.now() / 200);
          if (phaseValue < 0.3) {
            newTargets.push(target);
            continue;
          }
        }

        if (dist < hitRadius) {
          hit = true;
          target.health -= 1;

          if (target.health <= 0) {
            const comboMultiplier = Math.floor(combo / 5) + 1;
            const points = target.points * comboMultiplier;
            setScore(prev => prev + points);
            setCombo(prev => {
              const newCombo = prev + 1;
              setMaxCombo(max => Math.max(max, newCombo));
              return newCombo;
            });

            if (target.isPowerUp) {
              if (target.isPowerUp === 'ammo') {
                setAmmo(prev => Math.min(maxAmmo, prev + 10));
              } else {
                setPowerUp(target.isPowerUp);
                setPowerUpTimer(10000);
              }
            }

            if (target.explosive) {
              setScore(prev => prev + 50);
            }

            // Only count non-decoy, non-powerup targets for progress
            if (!target.isDecoy && !target.isPowerUp && target.points > 0) {
              setLevelProgress(prev => prev + 1);
            }

            setEffects(prev => [...prev, {
              id: Date.now(),
              type: 'destroy',
              x: target.x,
              y: target.y,
              emoji: target.emoji,
              life: 20,
              points: points
            }]);

            setProgression(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
          } else {
            newTargets.push(target);
          }

          setShowHitMarker(true);
          setTimeout(() => setShowHitMarker(false), 100);
        } else {
          newTargets.push(target);
        }
      }
      return newTargets;
    });

    if (!hit) {
      setCombo(0);
    }

    return hit;
  }, [combo, maxAmmo]);

  // Check level completion
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (currentLevel === 10) {
      // Boss level - check if boss is defeated
      if (levelProgress >= levelTarget && !bossActiveRef.current && bossHealth <= 0) {
        // Victory!
        handleVictory();
      } else if (levelProgress >= 15 && !bossActiveRef.current && !currentBossRef.current) {
        // Spawn boss after getting enough targets
        spawnBoss();
      }
    } else {
      // Regular level - check progress
      if (levelProgress >= levelTarget) {
        handleVictory();
      }
    }
  }, [levelProgress, levelTarget, gameState, currentLevel, bossHealth]);

  const handleVictory = () => {
    setGameState('victory');

    // Award star for this level if not already earned
    const progressInfo = getProgressInfo();
    const charIndex = characterDefs.findIndex(c => c.id === selectedCharacter.id);
    const levelIndex = currentLevel - 1;

    if (!progressInfo.isLevelCompleted(charIndex, levelIndex)) {
      setProgression(prev => {
        const newHighScores = [...prev.highScores];
        newHighScores[charIndex] = [...newHighScores[charIndex]];
        newHighScores[charIndex][levelIndex] = Math.max(newHighScores[charIndex][levelIndex], score);

        return {
          ...prev,
          starPoints: prev.starPoints + 1,
          highScores: newHighScores,
          gamesPlayed: prev.gamesPlayed + 1
        };
      });
    } else {
      // Just update high score if already completed
      setProgression(prev => {
        const newHighScores = [...prev.highScores];
        newHighScores[charIndex] = [...newHighScores[charIndex]];
        newHighScores[charIndex][levelIndex] = Math.max(newHighScores[charIndex][levelIndex], score);

        return {
          ...prev,
          highScores: newHighScores,
          gamesPlayed: prev.gamesPlayed + 1
        };
      });
    }
  };

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

      setTrackOffset(prev => (prev + 2) % 100);
      setScreenShake(prev => Math.max(0, prev - 0.5));

      if (powerUpTimer > 0) {
        setPowerUpTimer(prev => {
          const newTime = prev - deltaTime;
          if (newTime <= 0) {
            setPowerUp(null);
          }
          return newTime;
        });
      }

      // Spawn logic
      spawnTimerRef.current += deltaTime;
      const baseRate = 1200 - (currentLevel * 80);
      const spawnRate = bossActiveRef.current ? baseRate * 0.7 : baseRate;
      if (spawnTimerRef.current > spawnRate) {
        spawnTimerRef.current = 0;
        spawnTarget();
      }

      // Update projectiles
      setProjectiles(prev => {
        const newProj = [];
        for (const proj of prev) {
          const dx = proj.targetX - proj.x;
          const dy = proj.targetY - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proj.speed) {
            checkHit(proj.targetX, proj.targetY);
          } else {
            const vx = (dx / dist) * proj.speed;
            const vy = (dy / dist) * proj.speed;
            newProj.push({
              ...proj,
              x: proj.x + vx,
              y: proj.y + vy
            });
          }
        }
        return newProj;
      });

      // Update targets
      setTargets(prev => {
        const newTargets = [];
        for (const target of prev) {
          let newX = target.x;
          let newY = target.y;

          if (target.circleCenter) {
            target.circleAngle += target.circleSpeed;
            newX = target.circleCenter.x + Math.cos(target.circleAngle) * target.circleRadius;
            newY = target.circleCenter.y + Math.sin(target.circleAngle) * target.circleRadius;
          } else if (target.waveOffset !== undefined) {
            newX += target.vx || 0;
            newY += target.vy || 0;
            newX += Math.sin(Date.now() / 300 + target.waveOffset) * 2;
          } else {
            newX += target.vx || 0;
            newY += target.vy || 0;
          }

          if (target.explosive && target.spawnTime) {
            if (Date.now() - target.spawnTime > target.fuseTime) {
              setLives(prev => prev - 1);
              setScreenShake(15);
              setEffects(prev => [...prev, {
                id: Date.now(),
                type: 'explosion',
                x: target.x,
                y: target.y,
                life: 20
              }]);
              continue;
            }
          }

          if (newY > CANVAS_HEIGHT + 50 || newY < -100 ||
              newX < -100 || newX > CANVAS_WIDTH + 100) {
            if (!target.isPowerUp && target.points > 0 && !target.isDecoy) {
              setCombo(0);
            }
            continue;
          }

          if (newY > CANVAS_HEIGHT - 80 && target.points > 0 && !target.isPowerUp && !target.isDecoy) {
            setLives(prev => prev - 1);
            setScreenShake(10);
            setCombo(0);
            continue;
          }

          newTargets.push({
            ...target,
            x: newX,
            y: newY
          });
        }
        return newTargets;
      });

      // Update boss
      if (bossActiveRef.current && currentBossRef.current) {
        const boss = currentBossRef.current;
        boss.x = CANVAS_WIDTH / 2 + Math.sin(Date.now() / 1000) * 200;
        boss.y = 80 + Math.sin(Date.now() / 1500) * 30;

        boss.attackTimer += deltaTime;
        if (boss.attackTimer > 2000) {
          boss.attackTimer = 0;

          setTargets(prev => [...prev, {
            id: Date.now(),
            x: boss.x,
            y: boss.y + 50,
            type: 'boss_proj',
            emoji: '💥',
            points: 0,
            speed: 3,
            health: 1,
            vx: (mousePos.x - boss.x) * 0.02,
            vy: 4,
            damaging: true
          }]);
        }

        if (boss.invulnerable) {
          boss.invulnerableTimer -= deltaTime;
          if (boss.invulnerableTimer <= 0) {
            boss.invulnerable = false;
          }
        }
      }

      // Update effects
      setEffects(prev => prev.filter(e => {
        e.life -= 1;
        return e.life > 0;
      }));

      // Check game over
      if (lives <= 0) {
        setGameState('gameover');
        setProgression(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
        return;
      }

      render(ctx);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, lives, checkHit, spawnTarget, spawnBoss, selectedCharacter, mousePos, powerUpTimer, currentLevel]);

  // Render function
  const render = (ctx) => {
    const shake = screenShake;
    const offsetX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const offsetY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw background with character color
    const charColor = selectedCharacter?.color || '#e94560';
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + trackOffset) % CANVAS_WIDTH;
      const y = (i * 37) % (CANVAS_HEIGHT * 0.6);
      const size = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw track
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 40);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 40);
    ctx.stroke();

    ctx.strokeStyle = '#533a71';
    ctx.lineWidth = 8;
    for (let i = 0; i < 20; i++) {
      const x = ((i * 50) + trackOffset) % CANVAS_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT - 50);
      ctx.lineTo(x, CANVAS_HEIGHT - 30);
      ctx.stroke();
    }

    // Draw coaster car
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎢', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    ctx.fillText('🧸', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 45);

    // Draw targets
    ctx.font = '36px Arial';
    for (const target of targets) {
      if (target.phasing) {
        const phaseValue = Math.sin(Date.now() / 200);
        ctx.globalAlpha = phaseValue > 0.3 ? 1 : 0.3;
      } else if (target.opacity) {
        ctx.globalAlpha = target.opacity;
      }

      if (target.explosive && target.spawnTime) {
        const timeLeft = target.fuseTime - (Date.now() - target.spawnTime);
        if (timeLeft < 1000) {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(target.x, target.y, 25 + Math.sin(Date.now() / 50) * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillText(target.emoji, target.x, target.y);
      ctx.globalAlpha = 1;
    }

    // Draw boss
    if (bossActiveRef.current && currentBossRef.current && selectedCharacter) {
      const boss = currentBossRef.current;

      ctx.shadowColor = selectedCharacter.color;
      ctx.shadowBlur = 20;

      ctx.font = '64px Arial';
      if (boss.invulnerable) {
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.5;
      }
      ctx.fillText(selectedCharacter.bossEmoji, boss.x, boss.y);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(selectedCharacter.boss, boss.x, boss.y - 50);
    }

    // Draw projectiles
    ctx.fillStyle = '#ffdd00';
    for (const proj of projectiles) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 221, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffdd00';
    }

    // Draw effects
    for (const effect of effects) {
      if (effect.type === 'hit') {
        ctx.fillStyle = `rgba(255, 255, 0, ${effect.life / 10})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 20 - effect.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'destroy') {
        ctx.font = `${20 + (20 - effect.life)}px Arial`;
        ctx.globalAlpha = effect.life / 20;
        ctx.fillText(effect.emoji, effect.x, effect.y - (20 - effect.life) * 2);

        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ffdd00';
        ctx.fillText(`+${effect.points}`, effect.x, effect.y - 30 - (20 - effect.life) * 2);
        ctx.globalAlpha = 1;
      } else if (effect.type === 'explosion') {
        ctx.fillStyle = `rgba(255, 100, 0, ${effect.life / 20})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 50 - effect.life * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'muzzle') {
        ctx.fillStyle = `rgba(255, 200, 0, ${effect.life / 5})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 15 - effect.life * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw crosshair
    ctx.strokeStyle = showHitMarker ? '#ff0000' : '#00ff00';
    ctx.lineWidth = 2;
    const cx = mousePos.x;
    const cy = mousePos.y;

    ctx.beginPath();
    ctx.arc(cx, cy, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - CROSSHAIR_SIZE / 2 - 5, cy);
    ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx + 8, cy);
    ctx.lineTo(cx + CROSSHAIR_SIZE / 2 + 5, cy);
    ctx.moveTo(cx, cy - CROSSHAIR_SIZE / 2 - 5);
    ctx.lineTo(cx, cy - 8);
    ctx.moveTo(cx, cy + 8);
    ctx.lineTo(cx, cy + CROSSHAIR_SIZE / 2 + 5);
    ctx.stroke();

    ctx.fillStyle = showHitMarker ? '#ff0000' : '#00ff00';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 35);

    if (combo > 0) {
      ctx.fillStyle = combo >= 10 ? '#ff6b6b' : combo >= 5 ? '#feca57' : '#ffffff';
      ctx.fillText(`Combo: x${combo}`, 20, 65);
    }

    ctx.fillText('❤️'.repeat(lives), 20, 95);

    ctx.textAlign = 'right';
    if (reloading) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('RELOADING...', CANVAS_WIDTH - 20, 35);
    } else {
      ctx.fillStyle = ammo <= 5 ? '#ff6b6b' : '#ffffff';
      ctx.fillText(`Ammo: ${ammo}/${maxAmmo}`, CANVAS_WIDTH - 20, 35);
    }

    if (powerUp) {
      ctx.fillStyle = '#feca57';
      const powerUpName = powerUp === 'rapid' ? '⚡ RAPID FIRE' : '🌟 SPREAD SHOT';
      ctx.fillText(powerUpName, CANVAS_WIDTH - 20, 65);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    if (currentLevel === 10) {
      ctx.fillText(`BOSS FIGHT - ${selectedCharacter?.name}`, CANVAS_WIDTH / 2, 35);
    } else {
      ctx.fillText(`${selectedCharacter?.name} - Level ${currentLevel}`, CANVAS_WIDTH / 2, 35);
      ctx.font = '16px Arial';
      ctx.fillText(`Progress: ${levelProgress}/${levelTarget}`, CANVAS_WIDTH / 2, 55);
    }

    // Boss health bar
    if (bossActiveRef.current && bossMaxHealth > 0) {
      const barWidth = 300;
      const barHeight = 20;
      const barX = (CANVAS_WIDTH - barWidth) / 2;
      const barY = 60;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const healthPercent = bossHealth / bossMaxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      if (selectedCharacter) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(selectedCharacter.boss, CANVAS_WIDTH / 2, barY + 15);
      }
    }
  };

  // Mouse handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleClick = () => {
    if (gameState === 'playing') {
      shoot();
    }
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        } else if (gameState === 'levelSelect') {
          returnToMenu();
        } else {
          returnToMenu();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'playing') {
          reload();
        }
      } else if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        shoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, shoot, reload]);

  const resetProgress = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setProgression({
        starPoints: 0,
        characterStars: Array(10).fill(0),
        highScores: Array(10).fill(null).map(() => Array(10).fill(0)),
        totalShots: 0,
        totalHits: 0,
        gamesPlayed: 0,
      });
    }
  };

  // Star bar component
  const StarBar = ({ stars, maxStars = 10, color = theme.gold }) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array(maxStars).fill(0).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: '14px',
              opacity: i < stars ? 1 : 0.3,
              filter: i < stars ? `drop-shadow(0 0 3px ${color})` : 'none'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1625 0%, #2a1f3d 50%, #1a2535 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '42px',
      fontWeight: 'bold',
      marginBottom: '5px',
      textShadow: '0 0 20px #e94560, 0 0 40px #e94560',
      letterSpacing: '3px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#a0a0a0',
      marginBottom: '20px'
    },
    menuGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '12px',
      maxWidth: '900px',
      width: '100%',
      padding: '10px'
    },
    characterCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
      textAlign: 'center',
      position: 'relative'
    },
    characterEmoji: {
      fontSize: '36px',
      marginBottom: '5px'
    },
    characterName: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    levelGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '10px',
      maxWidth: '500px',
      width: '100%',
      padding: '20px'
    },
    levelCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '10px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
      textAlign: 'center'
    },
    statsBox: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      padding: '12px 20px',
      marginTop: '15px',
      textAlign: 'center',
      fontSize: '13px'
    },
    canvas: {
      border: '3px solid #e94560',
      borderRadius: '10px',
      cursor: 'crosshair',
      boxShadow: '0 0 30px rgba(233, 69, 96, 0.3)'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px'
    },
    overlayTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    button: {
      background: 'linear-gradient(135deg, #e94560, #533a71)',
      border: 'none',
      borderRadius: '25px',
      padding: '12px 30px',
      color: '#fff',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '10px',
      transition: 'all 0.3s ease'
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '8px 20px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px'
    },
    lockedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }
  };

  const progressInfo = getProgressInfo();

  // Render main menu (character select)
  if (gameState === 'menu') {
    return (
      <div style={styles.container}>
        <a href="menu.html" style={styles.backButton}>← Back to Games</a>
        <div style={styles.title}>🎢 TEDDY COASTER 🧸</div>
        <div style={styles.subtitle}>
          Part of Teddy's Review Roundup | Total Stars: {progressInfo.totalStars}/100
        </div>

        <div style={styles.menuGrid}>
          {characterDefs.map((char, index) => {
            const isUnlocked = progressInfo.isCharacterUnlocked(index);
            const charStars = progressInfo.getCharacterStars(index);
            const isComplete = charStars >= STARS_PER_CHARACTER;

            return (
              <div
                key={char.id}
                style={{
                  ...styles.characterCard,
                  borderColor: isUnlocked ? char.color : '#333',
                  opacity: isUnlocked ? 1 : 0.6,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed'
                }}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedCharacter(char);
                    setGameState('levelSelect');
                  }
                }}
                onMouseEnter={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${char.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {!isUnlocked && <div style={styles.lockedOverlay}>🔒</div>}
                {isComplete && (
                  <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#50c878',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>✓</div>
                )}
                <div style={styles.characterEmoji}>{char.emoji}</div>
                <div style={{...styles.characterName, color: char.color}}>{char.name}</div>
                <StarBar stars={charStars} maxStars={10} color={char.color} />
              </div>
            );
          })}
        </div>

        <div style={styles.statsBox}>
          <div>Games Played: {progression.gamesPlayed} | Accuracy: {progression.totalShots > 0 ? Math.round((progression.totalHits / progression.totalShots) * 100) : 0}%</div>
          <button
            onClick={resetProgress}
            style={{
              background: 'transparent',
              border: '1px solid #666',
              color: '#888',
              padding: '5px 15px',
              borderRadius: '15px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '12px'
            }}
          >
            Reset Progress
          </button>
        </div>

        <div style={{
          marginTop: '15px',
          fontSize: '13px',
          color: '#888',
          textAlign: 'center'
        }}>
          <strong>Controls:</strong> Mouse to aim | Click/Space to shoot | R to reload | ESC to pause
        </div>
      </div>
    );
  }

  // Render level select
  if (gameState === 'levelSelect' && selectedCharacter) {
    const charIndex = characterDefs.findIndex(c => c.id === selectedCharacter.id);

    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={returnToMenu}>← Characters</button>

        <div style={{fontSize: '48px', marginBottom: '10px'}}>{selectedCharacter.emoji}</div>
        <div style={{...styles.title, fontSize: '32px', color: selectedCharacter.color}}>
          {selectedCharacter.name}
        </div>
        <div style={styles.subtitle}>{selectedCharacter.description}</div>

        <div style={styles.levelGrid}>
          {Array(10).fill(0).map((_, levelIdx) => {
            const level = levelIdx + 1;
            const isUnlocked = progressInfo.isLevelUnlocked(charIndex, levelIdx);
            const isCompleted = progressInfo.isLevelCompleted(charIndex, levelIdx);
            const isBoss = level === 10;

            return (
              <div
                key={level}
                style={{
                  ...styles.levelCard,
                  borderColor: isUnlocked ? (isBoss ? '#e94560' : selectedCharacter.color) : '#333',
                  background: isCompleted ? `${selectedCharacter.color}20` : 'rgba(255,255,255,0.05)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.5,
                  gridColumn: isBoss ? 'span 5' : 'auto'
                }}
                onClick={() => {
                  if (isUnlocked) {
                    startLevel(selectedCharacter, level);
                  }
                }}
                onMouseEnter={(e) => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {!isUnlocked && <div style={{fontSize: '20px'}}>🔒</div>}
                {isUnlocked && (
                  <>
                    <div style={{fontSize: isBoss ? '32px' : '20px'}}>
                      {isBoss ? selectedCharacter.bossEmoji : (isCompleted ? '⭐' : level)}
                    </div>
                    <div style={{
                      fontSize: isBoss ? '16px' : '12px',
                      color: isBoss ? '#e94560' : '#aaa',
                      marginTop: '5px'
                    }}>
                      {isBoss ? `BOSS: ${selectedCharacter.boss}` : (isCompleted ? 'Complete!' : `Level ${level}`)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div style={{...styles.statsBox, maxWidth: '400px'}}>
          <div style={{color: selectedCharacter.color, marginBottom: '5px'}}>
            <strong>{selectedCharacter.gimmickDesc}</strong>
          </div>
          <div style={{fontStyle: 'italic', color: '#feca57'}}>
            "{selectedCharacter.taunt}"
          </div>
        </div>
      </div>
    );
  }

  // Render game
  return (
    <div style={styles.container}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />

        {gameState === 'paused' && (
          <div style={styles.overlay}>
            <div style={styles.overlayTitle}>PAUSED</div>
            <button style={styles.button} onClick={() => setGameState('playing')}>Resume</button>
            <button style={styles.button} onClick={returnToLevelSelect}>Quit Level</button>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={styles.overlay}>
            <div style={{...styles.overlayTitle, color: '#50c878'}}>
              {currentLevel === 10 ? 'BOSS DEFEATED!' : 'LEVEL COMPLETE!'}
            </div>
            {currentLevel === 10 && (
              <div style={{fontSize: '48px', marginBottom: '10px'}}>{selectedCharacter?.bossEmoji}</div>
            )}
            <div style={{fontSize: '24px', marginBottom: '10px'}}>⭐ +1 Star ⭐</div>
            {currentLevel === 10 && (
              <div style={{fontStyle: 'italic', color: '#feca57', marginBottom: '20px'}}>
                "{selectedCharacter?.winQuote}"
              </div>
            )}
            <div style={{fontSize: '18px', marginBottom: '20px'}}>
              Score: {score} | Max Combo: {maxCombo}
            </div>
            <button style={styles.button} onClick={returnToLevelSelect}>Continue</button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div style={styles.overlay}>
            <div style={{...styles.overlayTitle, color: '#ff6b6b'}}>GAME OVER</div>
            <div style={{fontSize: '48px', marginBottom: '10px'}}>
              {currentLevel === 10 ? selectedCharacter?.bossEmoji : '💔'}
            </div>
            {currentLevel === 10 && (
              <div style={{fontStyle: 'italic', color: '#feca57', marginBottom: '20px'}}>
                "{selectedCharacter?.loseQuote}"
              </div>
            )}
            <div style={{fontSize: '18px', marginBottom: '20px'}}>
              Score: {score} | Max Combo: {maxCombo}
            </div>
            <button style={styles.button} onClick={() => startLevel(selectedCharacter, currentLevel)}>
              Try Again
            </button>
            <button style={styles.button} onClick={returnToLevelSelect}>Back to Levels</button>
          </div>
        )}
      </div>
    </div>
  );
};
