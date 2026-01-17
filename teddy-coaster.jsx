const TeddyCoaster = () => {
  const { useState, useEffect, useRef, useCallback } = React;

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const CROSSHAIR_SIZE = 30;
  const SHOOT_COOLDOWN = 150;

  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, victory, gameover
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
  const [currentWave, setCurrentWave] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [trackOffset, setTrackOffset] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [powerUp, setPowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showHitMarker, setShowHitMarker] = useState(false);
  const [defeatedBosses, setDefeatedBosses] = useState([]);

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const bossActiveRef = useRef(false);
  const currentBossRef = useRef(null);

  // Stats persistence
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('teddy_coaster_stats');
    return saved ? JSON.parse(saved) : {
      totalScore: 0,
      gamesPlayed: 0,
      highScore: 0,
      bossesDefeated: 0,
      totalShots: 0,
      totalHits: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('teddy_coaster_stats', JSON.stringify(stats));
  }, [stats]);

  // Enemy/Boss definitions with gimmicks
  const enemyDefs = [
    {
      id: 'balloon_bandit',
      name: 'Balloon Bandit',
      emoji: '🎈',
      color: '#ff6b6b',
      health: 100,
      gimmick: 'balloon_shield',
      gimmickDesc: 'Surrounded by balloon shields that must be popped first',
      taunt: "Pop quiz time! Can you get through my balloons?",
      winQuote: "You're full of hot air!",
      loseQuote: "My beautiful balloons... POP!",
      spawnPattern: 'balloons'
    },
    {
      id: 'cotton_candy_witch',
      name: 'Cotton Candy Witch',
      emoji: '🧙‍♀️',
      color: '#ff9ff3',
      health: 120,
      gimmick: 'sticky_shots',
      gimmickDesc: 'Shoots sticky cotton candy that slows your aim',
      taunt: "Sweet dreams, little bear! Hehehehe!",
      winQuote: "You're stuck in my sweet trap!",
      loseQuote: "Too... much... sugar crash...",
      spawnPattern: 'spiral'
    },
    {
      id: 'ferris_phantom',
      name: 'Ferris Phantom',
      emoji: '👻',
      color: '#a29bfe',
      health: 150,
      gimmick: 'phase_shift',
      gimmickDesc: 'Phases in and out - only hittable when visible',
      taunt: "Round and round we go! Now you see me...",
      winQuote: "You missed your stop! Wooooo!",
      loseQuote: "I'm... fading... awaaaaay...",
      spawnPattern: 'circle'
    },
    {
      id: 'popcorn_poltergeist',
      name: 'Popcorn Poltergeist',
      emoji: '🍿',
      color: '#ffeaa7',
      health: 130,
      gimmick: 'explosive_kernels',
      gimmickDesc: 'Spawns popcorn kernels that explode if not shot',
      taunt: "Let's get this party POPPING!",
      winQuote: "Kernel panic! Ha!",
      loseQuote: "I'm all... popped out...",
      spawnPattern: 'scatter'
    },
    {
      id: 'carousel_knight',
      name: 'Carousel Knight',
      emoji: '🐴',
      color: '#74b9ff',
      health: 180,
      gimmick: 'rotating_guard',
      gimmickDesc: 'Shield rotates - hit from the exposed side',
      taunt: "On guard! This knight never falls off his horse!",
      winQuote: "You've been jousted!",
      loseQuote: "My noble steed... we ride no more...",
      spawnPattern: 'joust'
    },
    {
      id: 'funhouse_mirror',
      name: 'Funhouse Mirror Master',
      emoji: '🪞',
      color: '#00cec9',
      health: 200,
      gimmick: 'mirror_clones',
      gimmickDesc: 'Creates mirror copies - find the real one!',
      taunt: "Which one is real? Even I forget sometimes!",
      winQuote: "Bad luck! 7 years of it!",
      loseQuote: "I'm shattered... literally...",
      spawnPattern: 'mirrors'
    },
    {
      id: 'roller_coaster_rex',
      name: 'Roller Coaster Rex',
      emoji: '🦖',
      color: '#00b894',
      health: 250,
      gimmick: 'track_charge',
      gimmickDesc: 'Charges along the track - dodge and shoot!',
      taunt: "ROOOOAR! This ride has NO brakes!",
      winQuote: "You're going OFF the rails!",
      loseQuote: "Extinct... again... how unfair...",
      spawnPattern: 'charge'
    },
    {
      id: 'ringmaster_teddy',
      name: 'Ringmaster Teddy',
      emoji: '🎪',
      color: '#e17055',
      health: 300,
      gimmick: 'summon_circus',
      gimmickDesc: 'Summons circus minions and has multiple phases',
      taunt: "Welcome to MY show! The FINAL attraction!",
      winQuote: "The show must go on... without YOU!",
      loseQuote: "No... my circus... my dreams...",
      spawnPattern: 'boss_final'
    }
  ];

  // Target types for regular enemies
  const targetTypes = [
    { type: 'duck', emoji: '🦆', points: 10, speed: 2, health: 1 },
    { type: 'balloon_red', emoji: '🎈', points: 15, speed: 1.5, health: 1 },
    { type: 'balloon_blue', emoji: '🫧', points: 20, speed: 3, health: 1 },
    { type: 'star', emoji: '⭐', points: 25, speed: 2.5, health: 1 },
    { type: 'ghost', emoji: '👻', points: 30, speed: 4, health: 1, phasing: true },
    { type: 'clown', emoji: '🤡', points: 50, speed: 1, health: 2 },
    { type: 'powerup_ammo', emoji: '📦', points: 5, speed: 1, health: 1, isPowerUp: 'ammo' },
    { type: 'powerup_rapid', emoji: '⚡', points: 5, speed: 1, health: 1, isPowerUp: 'rapid' },
    { type: 'powerup_spread', emoji: '🌟', points: 5, speed: 1, health: 1, isPowerUp: 'spread' }
  ];

  const startGame = (enemy) => {
    setSelectedEnemy(enemy);
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
    setCurrentWave(1);
    setWaveProgress(0);
    setTrackOffset(0);
    setBossHealth(enemy.health);
    setBossMaxHealth(enemy.health);
    bossActiveRef.current = false;
    currentBossRef.current = null;
    spawnTimerRef.current = 0;
    setPowerUp(null);
    setPowerUpTimer(0);
  };

  const returnToMenu = () => {
    setGameState('menu');
    setSelectedEnemy(null);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Spawn targets based on wave and boss pattern
  const spawnTarget = useCallback(() => {
    if (!selectedEnemy) return;

    const patterns = {
      balloons: () => {
        // Spawn in balloon clusters
        const centerX = Math.random() * (CANVAS_WIDTH - 200) + 100;
        const centerY = Math.random() * (CANVAS_HEIGHT - 200) + 50;
        const newTargets = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          newTargets.push({
            id: Date.now() + i,
            x: centerX + Math.cos(angle) * 40,
            y: centerY + Math.sin(angle) * 40,
            ...targetTypes[1],
            vx: (Math.random() - 0.5) * 2,
            vy: -1 - Math.random()
          });
        }
        return newTargets;
      },
      spiral: () => {
        // Spiral pattern
        const angle = (Date.now() / 500) % (Math.PI * 2);
        const radius = 100 + Math.sin(Date.now() / 1000) * 50;
        return [{
          id: Date.now(),
          x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
          y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
          ...targetTypes[Math.floor(Math.random() * 4)],
          vx: Math.cos(angle + Math.PI / 2) * 2,
          vy: Math.sin(angle + Math.PI / 2) * 2,
          sticky: Math.random() < 0.3
        }];
      },
      circle: () => {
        // Circular movement
        return [{
          id: Date.now(),
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT * 0.6,
          ...targetTypes[4], // ghost
          vx: 0,
          vy: 0,
          circleCenter: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 3 },
          circleRadius: 100 + Math.random() * 100,
          circleAngle: Math.random() * Math.PI * 2,
          circleSpeed: 0.02 + Math.random() * 0.02
        }];
      },
      scatter: () => {
        // Random scatter with some explosive
        const newTargets = [];
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const isExplosive = Math.random() < 0.4;
          newTargets.push({
            id: Date.now() + i,
            x: Math.random() * CANVAS_WIDTH,
            y: -30,
            ...(isExplosive ? {
              type: 'kernel', emoji: '🌽', points: -20, speed: 1, health: 1,
              explosive: true, fuseTime: 3000, spawnTime: Date.now()
            } : targetTypes[Math.floor(Math.random() * 4)]),
            vx: (Math.random() - 0.5) * 3,
            vy: 1 + Math.random() * 2
          });
        }
        return newTargets;
      },
      joust: () => {
        // Knight charging pattern
        const fromLeft = Math.random() < 0.5;
        return [{
          id: Date.now(),
          x: fromLeft ? -50 : CANVAS_WIDTH + 50,
          y: 100 + Math.random() * 200,
          type: 'knight', emoji: '🛡️', points: 40, speed: 4, health: 2,
          vx: fromLeft ? 5 : -5,
          vy: 0,
          shieldAngle: fromLeft ? 0 : Math.PI,
          hasShield: true
        }];
      },
      mirrors: () => {
        // Mirror clone spawn
        const realX = Math.random() * (CANVAS_WIDTH - 100) + 50;
        const realY = Math.random() * (CANVAS_HEIGHT - 200) + 50;
        const newTargets = [{
          id: Date.now(),
          x: realX,
          y: realY,
          type: 'mirror_real', emoji: '🎭', points: 100, speed: 2, health: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          isReal: true
        }];
        // Add fakes
        for (let i = 0; i < 3; i++) {
          newTargets.push({
            id: Date.now() + i + 1,
            x: Math.random() * (CANVAS_WIDTH - 100) + 50,
            y: Math.random() * (CANVAS_HEIGHT - 200) + 50,
            type: 'mirror_fake', emoji: '🎭', points: -10, speed: 2, health: 1,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            isReal: false,
            opacity: 0.7
          });
        }
        return newTargets;
      },
      charge: () => {
        // Dinosaur charge warning then attack
        const lane = Math.floor(Math.random() * 3);
        const laneY = 100 + lane * 120;
        return [{
          id: Date.now(),
          x: -100,
          y: laneY,
          type: 'dino', emoji: '🦖', points: 60, speed: 8, health: 3,
          vx: 8,
          vy: 0,
          warningShown: false
        }];
      },
      boss_final: () => {
        // Mix of everything
        const patterns = ['balloons', 'spiral', 'scatter', 'joust'];
        const chosen = patterns[Math.floor(Math.random() * patterns.length)];
        return this[chosen] ? this[chosen]() : [{
          id: Date.now(),
          x: Math.random() * CANVAS_WIDTH,
          y: -30,
          ...targetTypes[Math.floor(Math.random() * 6)],
          vx: (Math.random() - 0.5) * 3,
          vy: 1 + Math.random() * 2
        }];
      }
    };

    const patternFunc = patterns[selectedEnemy.spawnPattern];
    if (patternFunc) {
      const newTargets = patternFunc();
      if (newTargets) {
        setTargets(prev => [...prev, ...newTargets]);
      }
    } else {
      // Default spawn
      setTargets(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * CANVAS_WIDTH,
        y: -30,
        ...targetTypes[Math.floor(Math.random() * 6)],
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 2
      }]);
    }
  }, [selectedEnemy]);

  // Spawn boss
  const spawnBoss = useCallback(() => {
    if (!selectedEnemy) return;

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
  }, [selectedEnemy, bossMaxHealth]);

  // Shoot function
  const shoot = useCallback(() => {
    if (reloading || ammo <= 0) return;

    const now = Date.now();
    const cooldown = powerUp === 'rapid' ? SHOOT_COOLDOWN / 2 : SHOOT_COOLDOWN;
    if (now - lastShootRef.current < cooldown) return;

    lastShootRef.current = now;

    // Update stats
    setStats(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

    if (powerUp === 'spread') {
      // Spread shot - 3 projectiles
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

    // Add muzzle flash effect
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

        // Add hit effect
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

          // Victory!
          setStats(prev => ({
            ...prev,
            bossesDefeated: prev.bossesDefeated + 1,
            totalHits: prev.totalHits + 1
          }));

          setDefeatedBosses(prev => [...prev, selectedEnemy.id]);

          setTimeout(() => {
            setGameState('victory');
            setStats(prev => ({
              ...prev,
              totalScore: prev.totalScore + score + 500,
              gamesPlayed: prev.gamesPlayed + 1,
              highScore: Math.max(prev.highScore, score + 500)
            }));
          }, 1000);
        }

        setStats(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
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

        // Check shield
        if (target.hasShield) {
          const angleToProj = Math.atan2(projY - target.y, projX - target.x);
          const shieldAngle = target.shieldAngle || 0;
          const angleDiff = Math.abs(angleToProj - shieldAngle);
          if (angleDiff < Math.PI / 2 || angleDiff > Math.PI * 1.5) {
            newTargets.push(target);
            continue;
          }
        }

        if (dist < hitRadius) {
          hit = true;
          target.health -= 1;

          if (target.health <= 0) {
            // Target destroyed
            const comboMultiplier = Math.floor(combo / 5) + 1;
            const points = target.points * comboMultiplier;
            setScore(prev => prev + points);
            setCombo(prev => {
              const newCombo = prev + 1;
              setMaxCombo(max => Math.max(max, newCombo));
              return newCombo;
            });

            // Handle power-ups
            if (target.isPowerUp) {
              if (target.isPowerUp === 'ammo') {
                setAmmo(prev => Math.min(maxAmmo, prev + 10));
              } else {
                setPowerUp(target.isPowerUp);
                setPowerUpTimer(10000);
              }
            }

            // Handle explosive
            if (target.explosive) {
              // Defused!
              setScore(prev => prev + 50);
            }

            // Add destroy effect
            setEffects(prev => [...prev, {
              id: Date.now(),
              type: 'destroy',
              x: target.x,
              y: target.y,
              emoji: target.emoji,
              life: 20,
              points: points
            }]);

            setWaveProgress(prev => prev + 1);
            setStats(prev => ({ ...prev, totalHits: prev.totalHits + 1 }));
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
  }, [combo, score, selectedEnemy, maxAmmo]);

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

      // Update track offset (scrolling background)
      setTrackOffset(prev => (prev + 2) % 100);

      // Decrease screen shake
      setScreenShake(prev => Math.max(0, prev - 0.5));

      // Update power-up timer
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
      const spawnRate = bossActiveRef.current ? 800 : 1200 - (currentWave * 50);
      if (spawnTimerRef.current > spawnRate) {
        spawnTimerRef.current = 0;
        spawnTarget();
      }

      // Check if should spawn boss
      if (waveProgress >= 20 && !bossActiveRef.current) {
        spawnBoss();
      }

      // Update projectiles
      setProjectiles(prev => {
        const newProj = [];
        for (const proj of prev) {
          const dx = proj.targetX - proj.x;
          const dy = proj.targetY - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proj.speed) {
            // Reached target, check hit
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

          // Circle movement
          if (target.circleCenter) {
            target.circleAngle += target.circleSpeed;
            newX = target.circleCenter.x + Math.cos(target.circleAngle) * target.circleRadius;
            newY = target.circleCenter.y + Math.sin(target.circleAngle) * target.circleRadius;
          } else {
            newX += target.vx || 0;
            newY += target.vy || 0;
          }

          // Check explosive timeout
          if (target.explosive && target.spawnTime) {
            if (Date.now() - target.spawnTime > target.fuseTime) {
              // Explode! Damage player
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

          // Remove if off screen
          if (newY > CANVAS_HEIGHT + 50 || newY < -100 ||
              newX < -100 || newX > CANVAS_WIDTH + 100) {
            // Missed target
            if (!target.isPowerUp && target.points > 0) {
              setCombo(0);
            }
            continue;
          }

          // Check collision with player area
          if (newY > CANVAS_HEIGHT - 80 && target.points > 0 && !target.isPowerUp) {
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

        // Boss movement
        boss.x = CANVAS_WIDTH / 2 + Math.sin(Date.now() / 1000) * 200;
        boss.y = 80 + Math.sin(Date.now() / 1500) * 30;

        // Boss attack
        boss.attackTimer += deltaTime;
        if (boss.attackTimer > 2000) {
          boss.attackTimer = 0;

          // Boss shoots projectile at player
          setTargets(prev => [...prev, {
            id: Date.now(),
            x: boss.x,
            y: boss.y + 50,
            type: 'boss_proj',
            emoji: selectedEnemy.id === 'cotton_candy_witch' ? '🍭' : '💥',
            points: 0,
            speed: 3,
            health: 1,
            vx: (mousePos.x - boss.x) * 0.02,
            vy: 4,
            damaging: true
          }]);
        }

        // Invulnerability timer
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
        setStats(prev => ({
          ...prev,
          totalScore: prev.totalScore + score,
          gamesPlayed: prev.gamesPlayed + 1,
          highScore: Math.max(prev.highScore, score)
        }));
        return;
      }

      // Render
      render(ctx);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, lives, checkHit, spawnTarget, spawnBoss, selectedEnemy, mousePos, powerUpTimer, waveProgress, currentWave, score]);

  // Render function
  const render = (ctx) => {
    const shake = screenShake;
    const offsetX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const offsetY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw background (coaster track view)
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

    // Draw track rails
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 40);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 40);
    ctx.stroke();

    // Track ties
    ctx.strokeStyle = '#533a71';
    ctx.lineWidth = 8;
    for (let i = 0; i < 20; i++) {
      const x = ((i * 50) + trackOffset) % CANVAS_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT - 50);
      ctx.lineTo(x, CANVAS_HEIGHT - 30);
      ctx.stroke();
    }

    // Draw coaster car (player)
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎢', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    ctx.fillText('🧸', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 45);

    // Draw targets
    ctx.font = '36px Arial';
    for (const target of targets) {
      // Ghost phasing effect
      if (target.phasing) {
        const phaseValue = Math.sin(Date.now() / 200);
        ctx.globalAlpha = phaseValue > 0.3 ? 1 : 0.3;
      } else if (target.opacity) {
        ctx.globalAlpha = target.opacity;
      }

      // Explosive warning
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

      // Draw shield
      if (target.hasShield) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 30, target.shieldAngle - Math.PI/3, target.shieldAngle + Math.PI/3);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Draw boss
    if (bossActiveRef.current && currentBossRef.current && selectedEnemy) {
      const boss = currentBossRef.current;

      // Boss glow
      ctx.shadowColor = selectedEnemy.color;
      ctx.shadowBlur = 20;

      // Boss sprite
      ctx.font = '64px Arial';
      if (boss.invulnerable) {
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.5;
      }
      ctx.fillText(selectedEnemy.emoji, boss.x, boss.y);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Boss name
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(selectedEnemy.name, boss.x, boss.y - 50);
    }

    // Draw projectiles
    ctx.fillStyle = '#ffdd00';
    for (const proj of projectiles) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Trail
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

        // Points popup
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

    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, CROSSHAIR_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Cross lines
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

    // Center dot
    ctx.fillStyle = showHitMarker ? '#ff0000' : '#00ff00';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD (not affected by shake)
    // Score
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 35);

    // Combo
    if (combo > 0) {
      ctx.fillStyle = combo >= 10 ? '#ff6b6b' : combo >= 5 ? '#feca57' : '#ffffff';
      ctx.fillText(`Combo: x${combo}`, 20, 65);
    }

    // Lives
    ctx.fillText('❤️'.repeat(lives), 20, 95);

    // Ammo
    ctx.textAlign = 'right';
    if (reloading) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('RELOADING...', CANVAS_WIDTH - 20, 35);
    } else {
      ctx.fillStyle = ammo <= 5 ? '#ff6b6b' : '#ffffff';
      ctx.fillText(`Ammo: ${ammo}/${maxAmmo}`, CANVAS_WIDTH - 20, 35);
    }

    // Power-up indicator
    if (powerUp) {
      ctx.fillStyle = '#feca57';
      const powerUpName = powerUp === 'rapid' ? '⚡ RAPID FIRE' : '🌟 SPREAD SHOT';
      ctx.fillText(powerUpName, CANVAS_WIDTH - 20, 65);
    }

    // Wave progress
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Wave ${currentWave} - ${waveProgress}/20`, CANVAS_WIDTH / 2, 35);

    // Boss health bar
    if (bossActiveRef.current && bossMaxHealth > 0) {
      const barWidth = 300;
      const barHeight = 20;
      const barX = (CANVAS_WIDTH - barWidth) / 2;
      const barY = 50;

      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Health
      const healthPercent = bossHealth / bossMaxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Boss name
      if (selectedEnemy) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(selectedEnemy.name, CANVAS_WIDTH / 2, barY + 15);
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

  const handleClick = (e) => {
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

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '10px',
      textShadow: '0 0 20px #e94560, 0 0 40px #e94560',
      letterSpacing: '3px'
    },
    subtitle: {
      fontSize: '18px',
      color: '#a0a0a0',
      marginBottom: '30px'
    },
    menuGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      width: '100%',
      padding: '20px'
    },
    enemyCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
      position: 'relative',
      overflow: 'hidden'
    },
    enemyCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },
    enemyEmoji: {
      fontSize: '48px',
      marginBottom: '10px'
    },
    enemyName: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    enemyGimmick: {
      fontSize: '14px',
      color: '#a0a0a0',
      marginBottom: '10px'
    },
    enemyTaunt: {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#feca57'
    },
    defeatedBadge: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: '#00ff00',
      color: '#000',
      padding: '3px 8px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    statsBox: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      padding: '15px 25px',
      marginTop: '20px',
      textAlign: 'center'
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
    instructions: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      padding: '15px 25px',
      marginTop: '15px',
      fontSize: '14px',
      color: '#a0a0a0',
      textAlign: 'center'
    }
  };

  // Render menu
  if (gameState === 'menu') {
    return (
      <div style={styles.container}>
        <a href="menu.html" style={styles.backButton}>← Back to Games</a>
        <div style={styles.title}>🎢 TEDDY COASTER 🧸</div>
        <div style={styles.subtitle}>A Rail Shooter Adventure!</div>

        <div style={styles.menuGrid}>
          {enemyDefs.map((enemy, index) => {
            const isDefeated = defeatedBosses.includes(enemy.id);
            const isLocked = index > 0 && !defeatedBosses.includes(enemyDefs[index - 1].id);

            return (
              <div
                key={enemy.id}
                style={{
                  ...styles.enemyCard,
                  borderColor: enemy.color,
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer'
                }}
                onClick={() => !isLocked && startGame(enemy)}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${enemy.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isDefeated && <div style={styles.defeatedBadge}>DEFEATED</div>}
                {isLocked && <div style={{...styles.defeatedBadge, background: '#666'}}>LOCKED</div>}
                <div style={styles.enemyEmoji}>{enemy.emoji}</div>
                <div style={{...styles.enemyName, color: enemy.color}}>{enemy.name}</div>
                <div style={styles.enemyGimmick}>{enemy.gimmickDesc}</div>
                <div style={styles.enemyTaunt}>"{enemy.taunt}"</div>
              </div>
            );
          })}
        </div>

        <div style={styles.statsBox}>
          <div>High Score: {stats.highScore} | Games Played: {stats.gamesPlayed} | Bosses Defeated: {stats.bossesDefeated}</div>
          <div>Accuracy: {stats.totalShots > 0 ? Math.round((stats.totalHits / stats.totalShots) * 100) : 0}%</div>
        </div>

        <div style={styles.instructions}>
          <strong>Controls:</strong> Mouse to aim | Click/Space to shoot | R to reload | ESC to pause
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
            <button style={styles.button} onClick={returnToMenu}>Quit to Menu</button>
          </div>
        )}

        {gameState === 'victory' && (
          <div style={styles.overlay}>
            <div style={{...styles.overlayTitle, color: '#00ff00'}}>VICTORY!</div>
            <div style={styles.enemyEmoji}>{selectedEnemy?.emoji}</div>
            <div style={{fontSize: '18px', marginBottom: '10px'}}>You defeated {selectedEnemy?.name}!</div>
            <div style={{fontStyle: 'italic', color: '#feca57', marginBottom: '20px'}}>
              "{selectedEnemy?.loseQuote}"
            </div>
            <div style={{fontSize: '24px', marginBottom: '20px'}}>
              Final Score: {score} | Max Combo: {maxCombo}
            </div>
            <button style={styles.button} onClick={returnToMenu}>Continue</button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div style={styles.overlay}>
            <div style={{...styles.overlayTitle, color: '#ff6b6b'}}>GAME OVER</div>
            <div style={styles.enemyEmoji}>{selectedEnemy?.emoji}</div>
            <div style={{fontStyle: 'italic', color: '#feca57', marginBottom: '20px'}}>
              "{selectedEnemy?.winQuote}"
            </div>
            <div style={{fontSize: '24px', marginBottom: '20px'}}>
              Final Score: {score} | Max Combo: {maxCombo}
            </div>
            <button style={styles.button} onClick={() => startGame(selectedEnemy)}>Try Again</button>
            <button style={styles.button} onClick={returnToMenu}>Back to Menu</button>
          </div>
        )}
      </div>
    </div>
  );
};
