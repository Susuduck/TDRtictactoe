const TeddyCoaster = () => {
  const { useState, useEffect, useRef, useCallback } = React;

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const HORIZON_Y = 150;
  const GROUND_Y = CANVAS_HEIGHT - 80;
  const TEDDY_Y = CANVAS_HEIGHT - 60;
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
  const [roadPosition, setRoadPosition] = useState(0);
  const [branchChoice, setBranchChoice] = useState(null);
  const [showBranchPrompt, setShowBranchPrompt] = useState(false);
  const [branchTimer, setBranchTimer] = useState(0);
  const [environmentLayers, setEnvironmentLayers] = useState([]);
  const [groundPattern, setGroundPattern] = useState([]);

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastShootRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const branchSpawnRef = useRef(0);
  const bossRef = useRef(null);
  const firingRef = useRef(false);
  const frameRef = useRef(0);

  // Progression system
  const [progression, setProgression] = useState(() => {
    const saved = localStorage.getItem('teddy_coaster_progression_v3');
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
    localStorage.setItem('teddy_coaster_progression_v3', JSON.stringify(progression));
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

  // World color palettes for distinct visual themes
  const worldPalettes = {
    balloon_bay: {
      skyTop: '#87CEEB', skyBottom: '#E0F4FF',
      groundNear: '#7CB342', groundFar: '#558B2F',
      trackColor: '#8B4513', accent: '#FF6B6B',
      fogColor: 'rgba(224, 244, 255, 0.6)'
    },
    candy_canyon: {
      skyTop: '#FFB6C1', skyBottom: '#FFF0F5',
      groundNear: '#FFB347', groundFar: '#FF8C00',
      trackColor: '#8B008B', accent: '#FF69B4',
      fogColor: 'rgba(255, 240, 245, 0.6)'
    },
    ghost_gallery: {
      skyTop: '#2C3E50', skyBottom: '#34495E',
      groundNear: '#1A1A2E', groundFar: '#16213E',
      trackColor: '#4A4A6A', accent: '#9B59B6',
      fogColor: 'rgba(44, 62, 80, 0.7)'
    },
    popcorn_plaza: {
      skyTop: '#F39C12', skyBottom: '#F1C40F',
      groundNear: '#E74C3C', groundFar: '#C0392B',
      trackColor: '#8B4513', accent: '#FFD700',
      fogColor: 'rgba(241, 196, 15, 0.5)'
    },
    carousel_castle: {
      skyTop: '#5DADE2', skyBottom: '#AED6F1',
      groundNear: '#27AE60', groundFar: '#1E8449',
      trackColor: '#2C3E50', accent: '#3498DB',
      fogColor: 'rgba(174, 214, 241, 0.5)'
    },
    mirror_maze: {
      skyTop: '#1ABC9C', skyBottom: '#76D7C4',
      groundNear: '#16A085', groundFar: '#0E6655',
      trackColor: '#1A5276', accent: '#00CED1',
      fogColor: 'rgba(118, 215, 196, 0.5)'
    },
    dino_den: {
      skyTop: '#27AE60', skyBottom: '#82E0AA',
      groundNear: '#784212', groundFar: '#5D3A1A',
      trackColor: '#1E8449', accent: '#00B894',
      fogColor: 'rgba(130, 224, 170, 0.5)'
    },
    rocket_runway: {
      skyTop: '#0C0C1E', skyBottom: '#1A1A3E',
      groundNear: '#2C2C4E', groundFar: '#1A1A2E',
      trackColor: '#4169E1', accent: '#9B59B6',
      fogColor: 'rgba(26, 26, 62, 0.7)'
    },
    pirate_pier: {
      skyTop: '#2980B9', skyBottom: '#5DADE2',
      groundNear: '#C4A35A', groundFar: '#8B7355',
      trackColor: '#5D3A1A', accent: '#E74C3C',
      fogColor: 'rgba(93, 173, 226, 0.5)'
    },
    ringmaster_realm: {
      skyTop: '#8E44AD', skyBottom: '#BB8FCE',
      groundNear: '#C0392B', groundFar: '#922B21',
      trackColor: '#F4D03F', accent: '#E74C3C',
      fogColor: 'rgba(187, 143, 206, 0.5)'
    }
  };

  // 10 Character/World definitions with boss weak points
  const characterDefs = [
    {
      id: 'balloon_bay', name: 'Balloon Bay', boss: 'Balloon Bandit',
      emoji: '🎈', bossEmoji: '🤡', color: '#ff6b6b',
      description: 'Pop the colorful balloons!', bossHealth: 100,
      gimmick: 'floating', gimmickDesc: 'Targets float upward',
      taunt: "Pop quiz time!", winQuote: "My balloons... POP!", loseQuote: "You're full of hot air!",
      weakPoints: [{ name: 'nose', x: 0, y: -10, radius: 20, damage: 2 }],
      sceneryType: 'park'
    },
    {
      id: 'candy_canyon', name: 'Candy Canyon', boss: 'Cotton Candy Witch',
      emoji: '🍭', bossEmoji: '🧙‍♀️', color: '#ff9ff3',
      description: 'Sweet treats await!', bossHealth: 120,
      gimmick: 'zigzag', gimmickDesc: 'Enemies zigzag toward you',
      taunt: "Sweet dreams!", winQuote: "Sugar crash...", loseQuote: "Stuck in my trap!",
      weakPoints: [{ name: 'wand', x: 25, y: 0, radius: 15, damage: 2 }],
      sceneryType: 'candy'
    },
    {
      id: 'ghost_gallery', name: 'Ghost Gallery', boss: 'Ferris Phantom',
      emoji: '👻', bossEmoji: '👻', color: '#a29bfe',
      description: 'Spooky spectral targets!', bossHealth: 150,
      gimmick: 'phasing', gimmickDesc: 'Ghosts phase in and out',
      taunt: "Wooooo!", winQuote: "Fading away...", loseQuote: "You missed!",
      weakPoints: [{ name: 'core', x: 0, y: 0, radius: 25, damage: 1, phaseRequired: true }],
      sceneryType: 'haunted'
    },
    {
      id: 'popcorn_plaza', name: 'Popcorn Plaza', boss: 'Popcorn Poltergeist',
      emoji: '🍿', bossEmoji: '🍿', color: '#ffeaa7',
      description: 'Kernels everywhere!', bossHealth: 130,
      gimmick: 'explosive', gimmickDesc: 'Shoot kernels before they pop!',
      taunt: "Let's get POPPING!", winQuote: "All popped out...", loseQuote: "Kernel panic!",
      weakPoints: [{ name: 'kernel', x: 0, y: -15, radius: 18, damage: 2 }],
      sceneryType: 'carnival'
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
      sceneryType: 'castle'
    },
    {
      id: 'mirror_maze', name: 'Mirror Maze', boss: 'Mirror Master',
      emoji: '🪞', bossEmoji: '🎭', color: '#00cec9',
      description: 'Which one is real?', bossHealth: 200,
      gimmick: 'decoys', gimmickDesc: 'Fake targets appear',
      taunt: "Find the real me!", winQuote: "Shattered...", loseQuote: "Bad luck!",
      weakPoints: [{ name: 'gem', x: 0, y: 0, radius: 20, damage: 2, flickering: true }],
      sceneryType: 'crystal'
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
      sceneryType: 'jungle'
    },
    {
      id: 'rocket_runway', name: 'Rocket Runway', boss: 'Captain Cosmos',
      emoji: '🚀', bossEmoji: '👨‍🚀', color: '#6c5ce7',
      description: 'Blast off!', bossHealth: 280,
      gimmick: 'fast', gimmickDesc: 'Super fast enemies',
      taunt: "3... 2... 1...!", winQuote: "Houston problem...", loseQuote: "Mission complete!",
      weakPoints: [{ name: 'visor', x: 0, y: -10, radius: 18, damage: 2 }],
      sceneryType: 'space'
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
      sceneryType: 'ocean'
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
      sceneryType: 'circus'
    }
  ];

  // Enemy types with visual definitions
  const enemyTypes = [
    { type: 'balloon', emoji: '🎈', points: 10, speed: 0.8, health: 1, size: 40,
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'] },
    { type: 'duck', emoji: '🦆', points: 15, speed: 1.0, health: 1, size: 35,
      colors: ['#F4D03F', '#E67E22'] },
    { type: 'ghost', emoji: '👻', points: 25, speed: 0.7, health: 1, size: 38, phasing: true,
      colors: ['#ECF0F1', '#BDC3C7'] },
    { type: 'clown', emoji: '🤡', points: 30, speed: 0.6, health: 2, size: 45,
      colors: ['#E74C3C', '#3498DB', '#F39C12'] },
    { type: 'bat', emoji: '🦇', points: 20, speed: 1.2, health: 1, size: 30,
      colors: ['#2C3E50', '#8E44AD'] },
    { type: 'candy', emoji: '🍬', points: 15, speed: 0.9, health: 1, size: 32,
      colors: ['#E91E63', '#9C27B0', '#00BCD4'] },
  ];

  // Theme
  const theme = {
    bg: '#1a1625', bgPanel: '#2a2440', border: '#4a4468',
    text: '#ffffff', textMuted: '#8880a0',
    accent: '#e94560', gold: '#f4c542', success: '#50c878', error: '#e85a50'
  };

  // Initialize environment layers based on scenery type
  const initEnvironment = useCallback((sceneryType) => {
    const layers = [];

    // Far background (mountains/structures)
    for (let i = 0; i < 5; i++) {
      layers.push({
        id: `far_${i}`,
        layer: 'far',
        x: i * 200 - 100,
        type: sceneryType,
        variant: Math.floor(Math.random() * 3),
        speed: 0.5
      });
    }

    // Mid-ground (trees/decorations)
    for (let i = 0; i < 10; i++) {
      layers.push({
        id: `mid_${i}`,
        layer: 'mid',
        x: i * 100 - 50,
        type: sceneryType,
        variant: Math.floor(Math.random() * 4),
        speed: 1.5
      });
    }

    // Near ground (posts/signs)
    for (let i = 0; i < 8; i++) {
      layers.push({
        id: `near_${i}`,
        layer: 'near',
        x: i * 150,
        type: sceneryType,
        variant: Math.floor(Math.random() * 2),
        speed: 3
      });
    }

    setEnvironmentLayers(layers);

    // Initialize ground pattern for Mode 7 effect
    const pattern = [];
    for (let i = 0; i < 20; i++) {
      pattern.push({
        offset: i * 50,
        color: i % 2 === 0
      });
    }
    setGroundPattern(pattern);
  }, []);

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
    setEffects([]);
    setLevelProgress(0);
    setTrackOffset(0);
    setRoadPosition(0);
    setBranchChoice(null);
    setShowBranchPrompt(false);
    setBranchTimer(0);
    spawnTimerRef.current = 0;
    branchSpawnRef.current = 0;
    bossRef.current = null;
    frameRef.current = 0;

    if (level === 10) {
      setBossMaxHealth(character.bossHealth);
      setBossHealth(character.bossHealth);
      setLevelTarget(1);
    } else {
      setBossHealth(0);
      setBossMaxHealth(0);
      setLevelTarget(12 + level * 2);
    }

    initEnvironment(character.sceneryType);
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
    const enemyColor = baseEnemy.colors[Math.floor(Math.random() * baseEnemy.colors.length)];

    let enemy = {
      id: Date.now() + Math.random(),
      x: startX,
      y: HORIZON_Y,
      z: 1.0,
      baseX: startX,
      ...baseEnemy,
      color: enemyColor,
      spawnTime: Date.now(),
      angle: 0,
      bobOffset: Math.random() * Math.PI * 2
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
      z: 0.3,
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
    const cooldown = powerMeter > 20 ? 100 : 200;
    if (now - lastShootRef.current < cooldown) return;

    lastShootRef.current = now;
    setPowerMeter(prev => Math.max(0, prev - 3));
    setProgression(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

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
      startX: CANVAS_WIDTH / 2 + 50,
      startY: TEDDY_Y - 20,
      endX: mousePos.x,
      endY: mousePos.y,
      life: 4
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

      if (!hit) {
        const bodyDist = Math.sqrt((hitX - boss.x) ** 2 + (hitY - bossScreenY) ** 2);
        if (bodyDist < 50 * scale) {
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
              color: enemy.color,
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
        setBranchChoice('right');
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
    return 0.3 + (1 - z) * 1.4;
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

  // ============================================
  // DRAWING FUNCTIONS - Yoshi's Safari Style
  // ============================================

  // Draw sky with gradient
  const drawSky = (ctx, palette) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, HORIZON_Y);

    // Add clouds for non-dark worlds
    if (palette.skyTop !== '#0C0C1E' && palette.skyTop !== '#2C3E50') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const cloudOffset = (frameRef.current * 0.2) % 400;
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 200 - cloudOffset) % (CANVAS_WIDTH + 200)) - 100;
        const cy = 30 + Math.sin(i * 1.5) * 20;
        drawCloud(ctx, cx, cy, 40 + i * 10);
      }
    }

    // Stars for space world
    if (palette.skyTop === '#0C0C1E') {
      ctx.fillStyle = '#FFF';
      for (let i = 0; i < 50; i++) {
        const sx = (i * 37 + frameRef.current * 0.1) % CANVAS_WIDTH;
        const sy = (i * 23) % HORIZON_Y;
        const twinkle = Math.sin(frameRef.current * 0.1 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  };

  // Draw a simple cloud
  const drawCloud = (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.15, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw Mode 7-style ground with perspective
  const drawGround = (ctx, palette) => {
    const numStripes = 20;
    const stripeHeight = (CANVAS_HEIGHT - HORIZON_Y) / numStripes;

    for (let i = 0; i < numStripes; i++) {
      const y = HORIZON_Y + i * stripeHeight;
      const t = i / numStripes;

      // Perspective-based stripe width
      const stripeOffset = (trackOffset + i * 20) % 100;
      const isLight = stripeOffset < 50;

      // Interpolate colors based on distance
      const nearColor = palette.groundNear;
      const farColor = palette.groundFar;

      if (isLight) {
        ctx.fillStyle = lerpColor(farColor, nearColor, t);
      } else {
        ctx.fillStyle = lerpColor(darkenColor(farColor, 0.8), darkenColor(nearColor, 0.8), t);
      }

      ctx.fillRect(0, y, CANVAS_WIDTH, stripeHeight + 1);
    }

    // Add ground details based on world
    if (palette === worldPalettes.pirate_pier) {
      // Water effect
      ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
      for (let i = 0; i < 10; i++) {
        const waveY = HORIZON_Y + 50 + Math.sin(frameRef.current * 0.05 + i) * 10;
        ctx.fillRect(0, waveY + i * 30, CANVAS_WIDTH, 5);
      }
    }
  };

  // Draw coaster track with proper perspective
  const drawTrack = (ctx, palette) => {
    const vanishX = CANVAS_WIDTH / 2 + roadPosition * 50;
    const trackWidth = 200;

    // Track supports (posts)
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 8; i++) {
      const t = (i + (trackOffset % 50) / 50) / 8;
      if (t > 1) continue;
      const y = HORIZON_Y + (GROUND_Y - HORIZON_Y) * t;
      const spread = t * trackWidth;
      const postHeight = 30 + t * 50;

      // Left post
      ctx.fillRect(vanishX - spread - 5, y, 10, postHeight);
      // Right post
      ctx.fillRect(vanishX + spread - 5, y, 10, postHeight);
    }

    // Track ties (horizontal bars)
    ctx.fillStyle = palette.trackColor;
    for (let i = 0; i < 15; i++) {
      const t = (i + (trackOffset % 25) / 25) / 15;
      if (t > 1) continue;
      const y = HORIZON_Y + (GROUND_Y - HORIZON_Y) * t;
      const spread = t * trackWidth;
      const tieHeight = 4 + t * 6;

      ctx.fillRect(vanishX - spread - 10, y, spread * 2 + 20, tieHeight);
    }

    // Left rail
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(vanishX - trackWidth - 20, GROUND_Y + 20);
    ctx.stroke();

    // Right rail
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(vanishX + trackWidth + 20, GROUND_Y + 20);
    ctx.stroke();

    // Rail highlights
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vanishX - 2, HORIZON_Y);
    ctx.lineTo(vanishX - trackWidth - 18, GROUND_Y + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vanishX + 2, HORIZON_Y);
    ctx.lineTo(vanishX + trackWidth + 22, GROUND_Y + 20);
    ctx.stroke();
  };

  // Draw scenery layers (parallax)
  const drawScenery = (ctx, layers, palette, sceneryType) => {
    // Far layer (mountains/structures at horizon)
    ctx.save();
    for (const item of layers.filter(l => l.layer === 'far')) {
      const x = item.x;
      if (x < -150 || x > CANVAS_WIDTH + 150) continue;

      ctx.globalAlpha = 0.8;
      drawFarScenery(ctx, x, HORIZON_Y, sceneryType, item.variant);
    }
    ctx.restore();

    // Mid layer (trees/decorations)
    ctx.save();
    for (const item of layers.filter(l => l.layer === 'mid')) {
      const x = item.x;
      if (x < -80 || x > CANVAS_WIDTH + 80) continue;

      const y = HORIZON_Y + 30;
      const scale = 0.7;
      ctx.globalAlpha = 0.9;
      drawMidScenery(ctx, x, y, sceneryType, item.variant, scale);
    }
    ctx.restore();

    // Near layer (posts/signs that zoom past)
    ctx.save();
    for (const item of layers.filter(l => l.layer === 'near')) {
      const x = item.x;
      if (x < -50 || x > CANVAS_WIDTH + 50) continue;

      // Only draw on sides
      if (x > CANVAS_WIDTH * 0.3 && x < CANVAS_WIDTH * 0.7) continue;

      const y = GROUND_Y - 30;
      ctx.globalAlpha = 1;
      drawNearScenery(ctx, x, y, sceneryType, item.variant);
    }
    ctx.restore();

    // Fog/atmosphere at horizon
    ctx.fillStyle = palette.fogColor;
    ctx.fillRect(0, HORIZON_Y - 20, CANVAS_WIDTH, 40);
  };

  // Draw far background elements
  const drawFarScenery = (ctx, x, y, type, variant) => {
    switch (type) {
      case 'park':
      case 'carnival':
        // Ferris wheel
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y - 40, 35, 0, Math.PI * 2);
        ctx.stroke();
        // Spokes
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + frameRef.current * 0.01;
          ctx.beginPath();
          ctx.moveTo(x, y - 40);
          ctx.lineTo(x + Math.cos(angle) * 35, y - 40 + Math.sin(angle) * 35);
          ctx.stroke();
        }
        break;
      case 'candy':
        // Candy mountain
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(x - 60, y);
        ctx.lineTo(x, y - 50);
        ctx.lineTo(x + 60, y);
        ctx.fill();
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x, y - 50, 15, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'haunted':
        // Spooky mansion
        ctx.fillStyle = '#1A1A2E';
        ctx.fillRect(x - 40, y - 50, 80, 50);
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 50);
        ctx.lineTo(x, y - 80);
        ctx.lineTo(x + 50, y - 50);
        ctx.fill();
        // Windows
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 25, y - 35, 10, 15);
        ctx.fillRect(x + 15, y - 35, 10, 15);
        break;
      case 'castle':
        // Castle tower
        ctx.fillStyle = '#8B8B8B';
        ctx.fillRect(x - 25, y - 70, 50, 70);
        ctx.fillStyle = '#696969';
        // Battlements
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(x - 25 + i * 12, y - 80, 8, 10);
        }
        break;
      case 'crystal':
        // Crystal formations
        ctx.fillStyle = '#00CED1';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x - 10, y - 60);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.fillStyle = '#20B2AA';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 15, y - 45);
        ctx.lineTo(x + 25, y);
        ctx.fill();
        break;
      case 'jungle':
        // Volcano
        ctx.fillStyle = '#5D4E37';
        ctx.beginPath();
        ctx.moveTo(x - 60, y);
        ctx.lineTo(x - 15, y - 60);
        ctx.lineTo(x + 15, y - 60);
        ctx.lineTo(x + 60, y);
        ctx.fill();
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 60);
        ctx.lineTo(x, y - 70);
        ctx.lineTo(x + 10, y - 60);
        ctx.fill();
        break;
      case 'space':
        // Planet
        ctx.fillStyle = ['#E74C3C', '#3498DB', '#9B59B6'][variant % 3];
        ctx.beginPath();
        ctx.arc(x, y - 40, 30, 0, Math.PI * 2);
        ctx.fill();
        // Ring
        if (variant === 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(x, y - 40, 45, 10, 0.3, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case 'ocean':
        // Ship
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - 40, y);
        ctx.lineTo(x - 30, y - 20);
        ctx.lineTo(x + 30, y - 20);
        ctx.lineTo(x + 40, y);
        ctx.fill();
        // Mast
        ctx.fillRect(x - 3, y - 60, 6, 40);
        // Sail
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x, y - 55);
        ctx.lineTo(x + 25, y - 35);
        ctx.lineTo(x, y - 25);
        ctx.fill();
        break;
      case 'circus':
        // Big top
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.moveTo(x - 50, y);
        ctx.quadraticCurveTo(x, y - 70, x + 50, y);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(x - 40 + i * 20, y);
          ctx.quadraticCurveTo(x, y - 70, x - 30 + i * 20, y);
          ctx.fill();
        }
        // Flag
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 2, y - 80, 4, 20);
        ctx.fillRect(x + 2, y - 80, 15, 10);
        break;
      default:
        // Default mountain
        ctx.fillStyle = '#5D4E37';
        ctx.beginPath();
        ctx.moveTo(x - 50, y);
        ctx.lineTo(x, y - 60);
        ctx.lineTo(x + 50, y);
        ctx.fill();
        break;
    }
  };

  // Draw mid-ground scenery
  const drawMidScenery = (ctx, x, y, type, variant, scale) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    switch (type) {
      case 'park':
      case 'jungle':
        // Tree
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, 40);
        ctx.lineTo(20, 40);
        ctx.fill();
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-5, 40, 10, 20);
        break;
      case 'candy':
        // Lollipop
        ctx.fillStyle = ['#FF69B4', '#00BFFF', '#98FB98', '#FFD700'][variant];
        ctx.beginPath();
        ctx.arc(0, -20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(0, -20, 10, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-2, -5, 4, 50);
        break;
      case 'haunted':
        // Dead tree
        ctx.strokeStyle = '#2C2C2C';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.lineTo(0, 0);
        ctx.lineTo(-20, -20);
        ctx.moveTo(0, 0);
        ctx.lineTo(15, -15);
        ctx.moveTo(0, 20);
        ctx.lineTo(-15, 5);
        ctx.stroke();
        break;
      case 'castle':
        // Banner
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-3, 0, 6, 50);
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.moveTo(3, 5);
        ctx.lineTo(25, 15);
        ctx.lineTo(3, 25);
        ctx.fill();
        break;
      case 'crystal':
        // Crystal cluster
        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-10, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(10, 40);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 200, 200, 0.7)';
        ctx.beginPath();
        ctx.moveTo(5, 40);
        ctx.lineTo(15, 10);
        ctx.lineTo(25, 40);
        ctx.fill();
        break;
      case 'space':
        // Antenna
        ctx.fillStyle = '#808080';
        ctx.fillRect(-3, 0, 6, 60);
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        // Blink
        if (Math.sin(frameRef.current * 0.1) > 0) {
          ctx.fillStyle = '#FF6666';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'ocean':
        // Palm tree on post
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-4, 0, 8, 50);
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            Math.cos(angle) * 15, Math.sin(angle) * 5 - 10,
            Math.cos(angle) * 30, Math.sin(angle) * 10 - 5
          );
          ctx.lineTo(Math.cos(angle) * 25, Math.sin(angle) * 8 - 3);
          ctx.quadraticCurveTo(Math.cos(angle) * 10, Math.sin(angle) * 3 - 8, 0, 0);
          ctx.fill();
        }
        break;
      case 'circus':
        // Balloon bunch
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(-10, -10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(10, -15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        // Strings
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.lineTo(0, 50);
        ctx.moveTo(10, -3);
        ctx.lineTo(0, 50);
        ctx.moveTo(0, 12);
        ctx.lineTo(0, 50);
        ctx.stroke();
        break;
      default:
        // Bush
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(0, 30, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  // Draw near-ground scenery (posts that zoom past)
  const drawNearScenery = (ctx, x, y, type, variant) => {
    // Track post/sign
    ctx.fillStyle = '#696969';
    ctx.fillRect(x - 5, y - 60, 10, 80);

    // Sign or light
    if (variant === 0) {
      // Sign
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 20, y - 50, 40, 25);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('→', x, y - 33);
    } else {
      // Light
      const blinkOn = Math.sin(frameRef.current * 0.15 + x) > 0;
      ctx.fillStyle = blinkOn ? '#00FF00' : '#004400';
      ctx.beginPath();
      ctx.arc(x, y - 55, 8, 0, Math.PI * 2);
      ctx.fill();
      if (blinkOn) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y - 55, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Draw enemy sprite (canvas-based instead of emoji)
  const drawEnemy = (ctx, enemy, screenY, scale) => {
    ctx.save();
    ctx.translate(enemy.x, screenY);
    ctx.scale(scale, scale);

    const size = enemy.size;
    const halfSize = size / 2;

    // Handle phasing alpha
    if (enemy.phasing) {
      const phaseValue = Math.sin(Date.now() / 200 + (enemy.phaseOffset || 0));
      ctx.globalAlpha = phaseValue > 0.3 ? 0.9 : 0.15;
    }

    // Decoy effect
    if (enemy.isDecoy) {
      ctx.globalAlpha = 0.4;
    }

    // Draw based on enemy type
    switch (enemy.type) {
      case 'balloon':
        // Balloon body
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, halfSize * 0.8, halfSize, 0, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-halfSize * 0.3, -halfSize * 0.3, halfSize * 0.2, halfSize * 0.3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        // Knot
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(-5, halfSize);
        ctx.lineTo(5, halfSize);
        ctx.lineTo(0, halfSize + 8);
        ctx.fill();
        // String
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, halfSize + 8);
        ctx.quadraticCurveTo(10, halfSize + 20, 0, halfSize + 30);
        ctx.stroke();
        break;

      case 'duck':
        // Body
        ctx.fillStyle = '#F4D03F';
        ctx.beginPath();
        ctx.ellipse(0, 5, halfSize * 0.9, halfSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(halfSize * 0.4, -halfSize * 0.2, halfSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#E67E22';
        ctx.beginPath();
        ctx.moveTo(halfSize * 0.7, -halfSize * 0.2);
        ctx.lineTo(halfSize * 1.2, -halfSize * 0.1);
        ctx.lineTo(halfSize * 0.7, 0);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(halfSize * 0.5, -halfSize * 0.35, 3, 0, Math.PI * 2);
        ctx.fill();
        // Wing
        ctx.fillStyle = '#D4AC0D';
        ctx.beginPath();
        ctx.ellipse(-halfSize * 0.2, 5, halfSize * 0.4, halfSize * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ghost':
        // Body
        ctx.fillStyle = 'rgba(236, 240, 241, 0.9)';
        ctx.beginPath();
        ctx.arc(0, -halfSize * 0.2, halfSize * 0.7, Math.PI, 0, false);
        ctx.lineTo(halfSize * 0.7, halfSize * 0.5);
        // Wavy bottom
        for (let i = 0; i < 4; i++) {
          const dir = i % 2 === 0 ? 1 : -1;
          const wx = halfSize * 0.7 - i * (halfSize * 0.35);
          ctx.quadraticCurveTo(wx - halfSize * 0.15, halfSize * 0.5 + dir * 8, wx - halfSize * 0.35, halfSize * 0.5);
        }
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(-halfSize * 0.25, -halfSize * 0.2, 5, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(halfSize * 0.25, -halfSize * 0.2, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'clown':
        // Face
        ctx.fillStyle = '#FFEAA7';
        ctx.beginPath();
        ctx.arc(0, 0, halfSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        // Red nose
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(0, 0, halfSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#FF6B6B';
        for (let i = 0; i < 5; i++) {
          const angle = Math.PI + (i / 4) * Math.PI;
          ctx.beginPath();
          ctx.arc(
            Math.cos(angle) * halfSize * 0.5,
            Math.sin(angle) * halfSize * 0.5 - halfSize * 0.3,
            halfSize * 0.25, 0, Math.PI * 2
          );
          ctx.fill();
        }
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-halfSize * 0.25, -halfSize * 0.2, 8, 0, Math.PI * 2);
        ctx.arc(halfSize * 0.25, -halfSize * 0.2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-halfSize * 0.25, -halfSize * 0.2, 4, 0, Math.PI * 2);
        ctx.arc(halfSize * 0.25, -halfSize * 0.2, 4, 0, Math.PI * 2);
        ctx.fill();
        // Smile
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, halfSize * 0.1, halfSize * 0.3, 0.2, Math.PI - 0.2);
        ctx.stroke();
        break;

      case 'bat':
        // Body
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.ellipse(0, 0, halfSize * 0.3, halfSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        const wingFlap = Math.sin(Date.now() / 50 + enemy.bobOffset) * 0.3;
        ctx.save();
        ctx.rotate(wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, -halfSize * 0.2);
        ctx.quadraticCurveTo(-halfSize, -halfSize * 0.5, -halfSize * 0.8, halfSize * 0.3);
        ctx.lineTo(-halfSize * 0.3, 0);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.rotate(-wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, -halfSize * 0.2);
        ctx.quadraticCurveTo(halfSize, -halfSize * 0.5, halfSize * 0.8, halfSize * 0.3);
        ctx.lineTo(halfSize * 0.3, 0);
        ctx.fill();
        ctx.restore();
        // Eyes
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(-5, -halfSize * 0.2, 3, 0, Math.PI * 2);
        ctx.arc(5, -halfSize * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.moveTo(-8, -halfSize * 0.4);
        ctx.lineTo(-12, -halfSize * 0.7);
        ctx.lineTo(-4, -halfSize * 0.45);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, -halfSize * 0.4);
        ctx.lineTo(12, -halfSize * 0.7);
        ctx.lineTo(4, -halfSize * 0.45);
        ctx.fill();
        break;

      case 'candy':
        // Wrapper
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, halfSize * 0.6, halfSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wrapper ends (twisted)
        ctx.beginPath();
        ctx.moveTo(-halfSize * 0.6, -5);
        ctx.lineTo(-halfSize, -10);
        ctx.lineTo(-halfSize, 10);
        ctx.lineTo(-halfSize * 0.6, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(halfSize * 0.6, -5);
        ctx.lineTo(halfSize, -10);
        ctx.lineTo(halfSize, 10);
        ctx.lineTo(halfSize * 0.6, 5);
        ctx.fill();
        // Stripe
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-halfSize * 0.3, -halfSize * 0.4, halfSize * 0.1, halfSize * 0.8);
        break;

      default:
        // Fallback circle
        ctx.fillStyle = enemy.color || '#E74C3C';
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Explosive warning
    if (enemy.explosive && enemy.spawnTime) {
      const timeLeft = enemy.fuseTime - (Date.now() - enemy.spawnTime);
      if (timeLeft < 1500) {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(Date.now() / 50) * 0.2})`;
        ctx.beginPath();
        ctx.arc(0, 0, halfSize + 10, 0, Math.PI * 2);
        ctx.fill();
        // Fuse spark
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -halfSize - 5, 5 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // Draw boss with weak point indicators
  const drawBoss = (ctx, boss, character, scale) => {
    const screenY = getScreenY(boss.z);

    ctx.save();
    ctx.translate(boss.x, screenY);
    ctx.scale(scale, scale);
    ctx.rotate(boss.angle);

    // Boss glow
    ctx.shadowColor = character.color;
    ctx.shadowBlur = 30;

    // Stagger effect
    if (boss.staggered) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 30) * 0.3;
    }

    // Boss body (still using emoji for now, but with effects)
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character.bossEmoji, 0, 0);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Draw weak point indicators
    for (const wp of character.weakPoints) {
      if (wp.hidden && boss.health > bossMaxHealth * 0.3) continue;
      if (wp.blocks) continue;

      const wpX = wp.x;
      const wpY = wp.y;
      const wpRadius = wp.radius;

      // Pulsing weak point glow
      const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;

      // Outer glow
      ctx.fillStyle = `rgba(255, 255, 0, ${pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(wpX, wpY, wpRadius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Target ring
      ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wpX, wpY, wpRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Cross-hairs on weak point
      ctx.beginPath();
      ctx.moveTo(wpX - wpRadius - 5, wpY);
      ctx.lineTo(wpX - wpRadius + 5, wpY);
      ctx.moveTo(wpX + wpRadius - 5, wpY);
      ctx.lineTo(wpX + wpRadius + 5, wpY);
      ctx.moveTo(wpX, wpY - wpRadius - 5);
      ctx.lineTo(wpX, wpY - wpRadius + 5);
      ctx.moveTo(wpX, wpY + wpRadius - 5);
      ctx.lineTo(wpX, wpY + wpRadius + 5);
      ctx.stroke();

      // Flash if recently hit
      if (boss.weakPointsHit[wp.name] && Date.now() % 500 < 250) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(wpX, wpY, wpRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Boss name plate
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(character.boss, boss.x, screenY - 70 * scale);
    ctx.fillText(character.boss, boss.x, screenY - 70 * scale);
  };

  // Draw Teddy (player character at bottom of screen)
  const drawTeddy = (ctx, aimAngle) => {
    const teddyX = CANVAS_WIDTH / 2;
    const teddyY = TEDDY_Y;

    ctx.save();
    ctx.translate(teddyX, teddyY);

    // Teddy body (brown bear)
    ctx.fillStyle = '#8B4513';

    // Ears
    ctx.beginPath();
    ctx.arc(-35, -55, 15, 0, Math.PI * 2);
    ctx.arc(35, -55, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(-35, -55, 8, 0, Math.PI * 2);
    ctx.arc(35, -55, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, -35, 40, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, -30, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-15, -45, 6, 0, Math.PI * 2);
    ctx.arc(15, -45, 6, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-13, -47, 2, 0, Math.PI * 2);
    ctx.arc(17, -47, 2, 0, Math.PI * 2);
    ctx.fill();

    // Gun arm
    ctx.save();
    ctx.translate(50, -20);
    ctx.rotate(aimAngle);

    // Arm
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, -8, 40, 16);

    // Paw
    ctx.beginPath();
    ctx.arc(40, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Gun
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(35, -6, 35, 12);
    ctx.fillStyle = '#34495E';
    ctx.fillRect(60, -4, 15, 8);

    // Gun barrel
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(70, -3, 10, 6);

    // Muzzle flash when firing
    if (isFiring && powerMeter > 5) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(95, -8);
      ctx.lineTo(90, 0);
      ctx.lineTo(95, 8);
      ctx.fill();
    }

    ctx.restore();

    ctx.restore();
  };

  // Draw crosshair
  const drawCrosshair = (ctx, x, y, hit, lowPower) => {
    const color = hit ? '#FF0000' : (lowPower ? '#FF6600' : '#00FF00');

    // Outer ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 12, y);
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x + 30, y);
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y - 12);
    ctx.moveTo(x, y + 12);
    ctx.lineTo(x, y + 30);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Hit marker effect
    if (hit) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 15);
      ctx.lineTo(x - 5, y - 5);
      ctx.moveTo(x + 15, y - 15);
      ctx.lineTo(x + 5, y - 5);
      ctx.moveTo(x - 15, y + 15);
      ctx.lineTo(x - 5, y + 5);
      ctx.moveTo(x + 15, y + 15);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    }
  };

  // Draw HUD
  const drawHUD = (ctx, palette) => {
    // Score panel (top left)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 150, 90);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 150, 90);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left';
    ctx.fillText(`${score}`, 20, 40);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText('SCORE', 20, 55);

    // Combo
    if (combo > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = combo >= 10 ? '#FF6B6B' : combo >= 5 ? '#FECA57' : '#FFF';
      ctx.fillText(`×${combo}`, 20, 80);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#AAA';
      ctx.fillText('COMBO', 60, 80);
    }

    // Lives (hearts)
    ctx.font = '20px Arial';
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        ctx.fillStyle = '#E74C3C';
        ctx.fillText('❤', 20 + i * 25, 95);
      } else {
        ctx.fillStyle = '#444';
        ctx.fillText('♡', 20 + i * 25, 95);
      }
    }

    // Power meter (top right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(CANVAS_WIDTH - 140, 10, 130, 50);
    ctx.strokeStyle = palette.accent;
    ctx.strokeRect(CANVAS_WIDTH - 140, 10, 130, 50);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'right';
    ctx.fillText('POWER', CANVAS_WIDTH - 20, 25);

    // Power bar
    const barX = CANVAS_WIDTH - 130;
    const barY = 32;
    const barW = 110;
    const barH = 18;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    const powerColor = powerMeter > 50 ? '#00FF00' : powerMeter > 20 ? '#FFFF00' : '#FF0000';
    const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    gradient.addColorStop(0, powerColor);
    gradient.addColorStop(1, darkenColor(powerColor, 0.7));
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * (powerMeter / 100), barH);

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    if (powerMeter < 20) {
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#FF6B6B';
      ctx.textAlign = 'center';
      ctx.fillText('LOW POWER!', barX + barW / 2, barY + 13);
    }

    // Level info (top center)
    ctx.textAlign = 'center';
    if (currentLevel === 10) {
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#E74C3C';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(`BOSS: ${selectedCharacter?.boss}`, CANVAS_WIDTH / 2, 35);
      ctx.fillText(`BOSS: ${selectedCharacter?.boss}`, CANVAS_WIDTH / 2, 35);
    } else {
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(`${selectedCharacter?.name}`, CANVAS_WIDTH / 2, 30);
      ctx.fillText(`${selectedCharacter?.name}`, CANVAS_WIDTH / 2, 30);

      // Progress bar
      const progBarW = 150;
      const progBarH = 8;
      const progBarX = (CANVAS_WIDTH - progBarW) / 2;
      const progBarY = 40;

      ctx.fillStyle = '#333';
      ctx.fillRect(progBarX, progBarY, progBarW, progBarH);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(progBarX, progBarY, progBarW * (levelProgress / levelTarget), progBarH);
      ctx.strokeStyle = '#FFF';
      ctx.strokeRect(progBarX, progBarY, progBarW, progBarH);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#FFF';
      ctx.fillText(`Level ${currentLevel} - ${levelProgress}/${levelTarget}`, CANVAS_WIDTH / 2, 65);
    }

    // Boss health bar
    if (bossRef.current && bossMaxHealth > 0) {
      const barW = 300;
      const barH = 25;
      const barX = (CANVAS_WIDTH - barW) / 2;
      const barY = 75;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX - 5, barY - 5, barW + 10, barH + 10);

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);

      const hp = bossHealth / bossMaxHealth;
      const hpColor = hp > 0.5 ? '#00FF00' : hp > 0.25 ? '#FFFF00' : '#FF0000';
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * hp, barH);

      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barW, barH);

      // Weak point hint
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('⚠ AIM FOR YELLOW WEAK POINTS! ⚠', CANVAS_WIDTH / 2, barY + barH + 15);
    }
  };

  // Draw effects
  const drawEffects = (ctx) => {
    for (const effect of effects) {
      switch (effect.type) {
        case 'destroy':
          const progress = (20 - effect.life) / 20;
          // Explosion particles
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = progress * 40;
            const px = effect.x + Math.cos(angle) * dist;
            const py = effect.y + Math.sin(angle) * dist - progress * 30;
            ctx.fillStyle = effect.color || '#FFD700';
            ctx.globalAlpha = effect.life / 20;
            ctx.beginPath();
            ctx.arc(px, py, 5 - progress * 4, 0, Math.PI * 2);
            ctx.fill();
          }
          // Points text
          if (effect.points > 0) {
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.globalAlpha = effect.life / 20;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.strokeText(`+${effect.points}`, effect.x, effect.y - 20 - progress * 40);
            ctx.fillText(`+${effect.points}`, effect.x, effect.y - 20 - progress * 40);
          }
          ctx.globalAlpha = 1;
          break;

        case 'hit':
          ctx.fillStyle = `rgba(255, 255, 0, ${effect.life / 10})`;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 20 - effect.life, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'weakpoint':
          ctx.font = 'bold 22px Arial';
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.fillStyle = '#FFD700';
          ctx.globalAlpha = effect.life / 15;
          const yOff = (15 - effect.life) * 2;
          ctx.strokeText(effect.text, effect.x, effect.y - yOff);
          ctx.fillText(effect.text, effect.x, effect.y - yOff);
          ctx.globalAlpha = 1;
          break;

        case 'explosion':
          ctx.fillStyle = `rgba(255, 100, 0, ${effect.life / 20})`;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 60 - effect.life * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255, 255, 0, ${effect.life / 25})`;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 40 - effect.life, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'muzzle':
          ctx.fillStyle = `rgba(255, 200, 0, ${effect.life / 5})`;
          ctx.beginPath();
          ctx.arc(CANVAS_WIDTH / 2 + 80, TEDDY_Y - 20, 15 - effect.life * 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'shot':
          // Bullet trail
          ctx.strokeStyle = `rgba(255, 220, 100, ${effect.life / 4})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(effect.startX, effect.startY);
          ctx.lineTo(effect.endX, effect.endY);
          ctx.stroke();
          // Impact spark
          ctx.fillStyle = `rgba(255, 255, 200, ${effect.life / 4})`;
          ctx.beginPath();
          ctx.arc(effect.endX, effect.endY, 8 - effect.life, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'branch':
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#50C878';
          ctx.globalAlpha = effect.life / 15;
          ctx.textAlign = 'center';
          ctx.fillText(`→ ${effect.dir.toUpperCase()}`, effect.x, effect.y - 20);
          ctx.globalAlpha = 1;
          break;
      }
    }
  };

  // Color utility functions
  const lerpColor = (color1, color2, t) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const darkenColor = (hex, factor) => {
    const c = hexToRgb(hex);
    const r = Math.round(c.r * factor);
    const g = Math.round(c.g * factor);
    const b = Math.round(c.b * factor);
    return `rgb(${r}, ${g}, ${b})`;
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
      frameRef.current++;

      // Track scrolling
      setTrackOffset(prev => (prev + 4) % 100);

      // Screen shake decay
      setScreenShake(prev => Math.max(0, prev - 0.5));

      // Power meter recharge when not firing
      if (!firingRef.current) {
        setPowerMeter(prev => Math.min(100, prev + 0.4));
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

      // Update enemies
      setEnemies(prev => {
        const remaining = [];
        for (const enemy of prev) {
          let newZ = enemy.z - enemy.speed * 0.008;
          let newX = enemy.baseX;

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

          if (newZ < 0.05) {
            if (!enemy.isDecoy && enemy.points > 0) {
              setLives(prev => prev - 1);
              setScreenShake(10);
              setCombo(0);
            }
            continue;
          }

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

        boss.attackTimer += deltaTime;
        if (boss.attackTimer > 2500 && !boss.staggered) {
          boss.attackTimer = 0;
          setEnemies(prev => [...prev, {
            id: Date.now(),
            x: boss.x,
            z: boss.z,
            baseX: boss.x,
            emoji: '💥',
            type: 'projectile',
            points: 0,
            speed: 1.5,
            health: 1,
            size: 30,
            color: '#FF4500',
            spawnTime: Date.now(),
            isBossAttack: true,
            bobOffset: 0
          }]);
        }
      }

      // Update environment layers (parallax)
      setEnvironmentLayers(prev => prev.map(item => {
        let newX = item.x - item.speed;
        if (item.layer === 'far' && newX < -200) newX = CANVAS_WIDTH + 100;
        if (item.layer === 'mid' && newX < -100) newX = CANVAS_WIDTH + 50;
        if (item.layer === 'near' && newX < -50) newX = CANVAS_WIDTH + 100;
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

      // Render
      render(ctx);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, lives, spawnEnemy, spawnBoss, selectedCharacter, currentLevel]);

  // Main render function
  const render = (ctx) => {
    const palette = worldPalettes[selectedCharacter?.id] || worldPalettes.balloon_bay;

    const shake = screenShake;
    const offX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const offY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.save();
    ctx.translate(offX, offY);

    // Draw sky
    drawSky(ctx, palette);

    // Draw ground with Mode 7 effect
    drawGround(ctx, palette);

    // Draw track
    drawTrack(ctx, palette);

    // Draw scenery layers
    drawScenery(ctx, environmentLayers, palette, selectedCharacter?.sceneryType);

    // Branch prompt
    if (showBranchPrompt) {
      // Barricade signs
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(CANVAS_WIDTH / 2 - 180, HORIZON_Y + 20, 120, 60);
      ctx.fillRect(CANVAS_WIDTH / 2 + 60, HORIZON_Y + 20, 120, 60);

      ctx.fillStyle = '#FFD700';
      ctx.fillRect(CANVAS_WIDTH / 2 - 175, HORIZON_Y + 25, 110, 50);
      ctx.fillRect(CANVAS_WIDTH / 2 + 65, HORIZON_Y + 25, 110, 50);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚧 ←', CANVAS_WIDTH / 2 - 120, HORIZON_Y + 58);
      ctx.fillText('→ 🚧', CANVAS_WIDTH / 2 + 120, HORIZON_Y + 58);

      // Timer
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFF';
      ctx.fillText(`SHOOT BARRICADE! ${Math.ceil(branchTimer / 1000)}s`, CANVAS_WIDTH / 2, HORIZON_Y + 100);
    }

    // Sort enemies by z (far first)
    const sortedEnemies = [...enemies].sort((a, b) => b.z - a.z);

    // Draw enemies
    for (const enemy of sortedEnemies) {
      const scale = getScaleFromZ(enemy.z);
      const screenY = getScreenY(enemy.z);
      drawEnemy(ctx, enemy, screenY, scale);
    }

    // Draw boss
    if (bossRef.current && selectedCharacter) {
      const scale = getScaleFromZ(bossRef.current.z);
      drawBoss(ctx, bossRef.current, selectedCharacter, scale);
    }

    // Draw effects
    drawEffects(ctx);

    // Calculate aim angle for Teddy's arm
    const aimAngle = Math.atan2(
      mousePos.y - TEDDY_Y + 20,
      mousePos.x - (CANVAS_WIDTH / 2 + 50)
    );

    // Draw Teddy
    drawTeddy(ctx, aimAngle);

    // Draw crosshair
    drawCrosshair(ctx, mousePos.x, mousePos.y, showHitMarker, powerMeter < 20);

    ctx.restore();

    // Draw HUD (not affected by shake)
    drawHUD(ctx, palette);
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
