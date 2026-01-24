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

  // === PIXEL ART SPRITES (CC0 from Superpowers Asset Pack) ===
  const SPRITES = {
    // Player ships
    ship1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/1.png',
    ship2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/2.png',
    ship3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/3.png',
    ship4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/4.png',
    ship5: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/5.png',
    // Projectiles
    shot1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/1.png',
    shot2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/2.png',
    shot3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/3.png',
    shot4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/4.png',
    // Effects
    fx1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-1.png',
    fx2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-2.png',
    fx3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-3.png',
    shield1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/shield-1.png',
    shield2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/shield-2.png',
    // Power-ups
    powerUp1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-1.png',
    powerUp2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-2.png',
    powerUp3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-3.png',
    gem1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/gem-1.png',
    gem2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/gem-2.png',
    bomb: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/bomb.png',
    rocket: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/rocket-1.png',
    // Enemy ships (using different ships as enemies)
    enemy1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/6.png',
    enemy2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/7.png',
    enemy3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/8.png',
    enemy4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/9.png',
    enemy5: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/10.png',
  };

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

  // === PIXEL ART ENEMY SPRITES - D&D INSPIRED (CR 1-20) ===
  // Each sprite is a 2D array where each value is a color or null (transparent)
  // Sprites are 16x16 pixels, scaled up when rendered
  // 20 enemies across 5 tiers, each with unique behaviors
  const ENEMY_SPRITES = {
    // === TIER 1: CR 1-4 (Easy) ===

    // Rat (CR 1) - Tiny, fast, scurries unpredictably
    rat: {
      frames: [
        [
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '..bb............',
          '..bBBb..........',
          '.bBBBBbbbbbb....',
          '.BeBBBBBBBBBb...',
          '.BBBBBBBBBBB....',
          '..b.b....b.b....',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
          '..bb............',
          '..bBBb..........',
          '.bBBBBbbbbbb....',
          '.BeBBBBBBBBBb...',
          '.BBBBBBBBBBB....',
          '..b.b....b.b....',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'B': '#8b7355', 'b': '#6b5344', 'e': '#111111' },
      width: 16, height: 16, scale: 2,
      health: 1, points: 25, paddleReward: 3,
      tier: 1, behavior: 'scurry', special: null,
    },

    // Kobold (CR 2) - Small reptilian, moves in diagonal patterns
    kobold: {
      frames: [
        [
          '................',
          '................',
          '................',
          '.....OOO........',
          '....OeOeO.......',
          '....OOOOO.......',
          '.....OmO........',
          '....OOOOO.......',
          '...OOOOOOO......',
          '...O.OOO.O......',
          '...O.OOO.O......',
          '....O...O.......',
          '................',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '................',
          '.....OOO........',
          '....OeOeO.......',
          '....OOOOO.......',
          '.....OmO........',
          '....OOOOO.......',
          '...OOOOOOO......',
          '....OOOOO.......',
          '...O.....O......',
          '...O.....O......',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'O': '#dd8833', 'e': '#ffff00', 'm': '#ff4444' },
      width: 16, height: 16, scale: 2,
      health: 1, points: 50, paddleReward: 5,
      tier: 1, behavior: 'diagonal', special: null,
    },

    // Goblin (CR 3) - Classic green menace, bounces off walls
    goblin: {
      frames: [
        [
          '................',
          '................',
          '.....GGG........',
          '....GGGGG.......',
          '...GGeGGeG......',
          '...GGGGGGG......',
          '....GGmGG.......',
          '....GGGGG.......',
          '...GGGGGGG......',
          '...G.GGG.G......',
          '...G.GGG.G......',
          '....G...G.......',
          '................',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '.....GGG........',
          '....GGGGG.......',
          '...GGeGGeG......',
          '...GGGGGGG......',
          '....GmmmG.......',
          '....GGGGG.......',
          '...GGGGGGG......',
          '....GGGGG.......',
          '...G.....G......',
          '...G.....G......',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'G': '#44aa44', 'e': '#ff0000', 'm': '#222222' },
      width: 16, height: 16, scale: 2,
      health: 2, points: 75, paddleReward: 6,
      tier: 1, behavior: 'bounce', special: null,
    },

    // Skeleton (CR 4) - Bony warrior, drops bones when destroyed
    skeleton: {
      frames: [
        [
          '................',
          '................',
          '.....WWW........',
          '....WWWWW.......',
          '...WWeWWeW......',
          '...WWWWWWW......',
          '....WmmmW.......',
          '.....WWW........',
          '....WWWWW.......',
          '...WW.W.WW......',
          '..WW..W..WW.....',
          '.....WWW........',
          '....WW.WW.......',
          '...WW...WW......',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '.....WWW........',
          '....WWWWW.......',
          '...WWeWWeW......',
          '...WWWWWWW......',
          '....WmmmW.......',
          '.....WWW........',
          '....WWWWW.......',
          '...WW.W.WW......',
          '....W.W.W.......',
          '.....WWW........',
          '....WW.WW.......',
          '....W...W.......',
          '................',
          '................',
        ],
      ],
      colors: { 'W': '#f0f0e0', 'e': '#ff0000', 'm': '#222222' },
      width: 16, height: 16, scale: 2,
      health: 2, points: 100, paddleReward: 8,
      tier: 1, behavior: 'bounce', special: 'dropBones',
    },

    // === TIER 2: CR 5-8 (Medium) ===

    // Zombie (CR 5) - Slow shambler, can revive once
    zombie: {
      frames: [
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggeggegg.....',
          '...ggggggg......',
          '....gmmgg.......',
          '.....ggg........',
          '....ggggg.......',
          '...ggggggg......',
          '...g.ggg.g......',
          '...g.ggg.g......',
          '....g...g.......',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggeggegg.....',
          '...ggggggg......',
          '....gmmgg.......',
          '.....ggg........',
          '....ggggg.......',
          '...ggggggg......',
          '....ggggg.......',
          '...g.....g......',
          '...g.....g......',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'g': '#556b55', 'e': '#ffff00', 'm': '#442222' },
      width: 16, height: 16, scale: 2,
      health: 3, points: 125, paddleReward: 10,
      tier: 2, behavior: 'shamble', special: 'revive',
    },

    // Orc (CR 6) - Aggressive charger, speeds up when hit
    orc: {
      frames: [
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggeggeg......',
          '...ggggggg......',
          '....gtttg.......',
          '.....ggg........',
          '...ggggggg......',
          '..ggggggggg.....',
          '..g..ggg..g.....',
          '..g..ggg..g.....',
          '...g.....g......',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggeggeg......',
          '...ggggggg......',
          '....gtttg.......',
          '.....ggg........',
          '...ggggggg......',
          '..ggggggggg.....',
          '....ggggg.......',
          '..g.......g.....',
          '..g.......g.....',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'g': '#668844', 'e': '#ff0000', 't': '#f0f0e0' },
      width: 16, height: 16, scale: 2,
      health: 4, points: 150, paddleReward: 12,
      tier: 2, behavior: 'charge', special: null,
    },

    // Giant Spider (CR 7) - Crawls on walls, shoots webs
    spider: {
      frames: [
        [
          '................',
          '..l..lll..l.....',
          '...l.lll.l......',
          '....lllll.......',
          '...lllllll......',
          '..lllelelll.....',
          '...lllllll......',
          '....lllll.......',
          '...l.lll.l......',
          '..l..lll..l.....',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '.l...lll...l....',
          '..l..lll..l.....',
          '...l.lll.l......',
          '....lllll.......',
          '...lllllll......',
          '..lllelelll.....',
          '...lllllll......',
          '....lllll.......',
          '...l.lll.l......',
          '..l..lll..l.....',
          '.l...lll...l....',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'l': '#333333', 'e': '#ff0000' },
      width: 16, height: 16, scale: 2,
      health: 3, points: 175, paddleReward: 14,
      tier: 2, behavior: 'crawl', special: 'web',
    },

    // Harpy (CR 8) - Flying swooper, dives at paddle
    harpy: {
      frames: [
        [
          '................',
          '................',
          '..w........w....',
          '..ww......ww....',
          '..www....www....',
          '...wwwwwwww.....',
          '....wffwfw......',
          '....ffffff......',
          '....fefefe......',
          '....ffffff......',
          '.....fmmf.......',
          '......ff........',
          '......ff........',
          '.....f..f.......',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '................',
          '....wffwfw......',
          '....ffffff......',
          '....fefefe......',
          '....ffffff......',
          '.....fmmf.......',
          '...wwwffwww.....',
          '..www....www....',
          '..ww......ww....',
          '..w........w....',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'w': '#886644', 'f': '#ffccaa', 'e': '#000000', 'm': '#ff4466' },
      width: 16, height: 16, scale: 2,
      health: 3, points: 200, paddleReward: 16,
      tier: 2, behavior: 'swoop', special: null,
    },

    // === TIER 3: CR 9-12 (Hard) ===

    // Mimic (CR 9) - Disguises as powerup, surprises player
    mimic: {
      frames: [
        [
          '................',
          '................',
          '..BBBBBBBBBB....',
          '..BGGGGGGGBB....',
          '..BGGGGGGGGB....',
          '..BGGGGGGGGB....',
          '..BGGGGGGGGB....',
          '..BBBBBBBBBB....',
          '..B........B....',
          '..BBBBBBBBBB....',
          '................',
          '................',
          '................',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '..BBTTTTTTBB....',
          '..BT......TB....',
          '..T.eeeeeee.T...',
          '..TRRRRRRRRT....',
          '..TRTRTRTRRT....',
          '..TRRRRRRRRT....',
          '..T........T....',
          '..BBBBBBBBBB....',
          '..l........l....',
          '..l........l....',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'B': '#8b4513', 'G': '#ffd700', 'T': '#8b4513', 'R': '#ff4444', 'e': '#ffff00', 'l': '#8b4513' },
      width: 16, height: 16, scale: 2,
      health: 4, points: 250, paddleReward: 18,
      tier: 3, behavior: 'ambush', special: 'disguise',
    },

    // Owlbear (CR 10) - Big and stompy, rhythmic movement
    owlbear: {
      frames: [
        [
          '................',
          '..BB......BB....',
          '..BBB....BBB....',
          '...BBBBBBBB.....',
          '..BeeBBBBeeB....',
          '..BBBBBBBBBB....',
          '...BBOOBOBB.....',
          '...BBBBBBBB.....',
          '....BBBBBB......',
          '...BBBBBBBB.....',
          '..BBBBBBBBBB....',
          '..BB.BBBB.BB....',
          '..BB.BBBB.BB....',
          '..B...BB...B....',
          '................',
          '................',
        ],
        [
          '................',
          '..BB......BB....',
          '..BBB....BBB....',
          '...BBBBBBBB.....',
          '..BeeBBBBeeB....',
          '..BBBBBBBBBB....',
          '...BBOOBOBB.....',
          '...BBBBBBBB.....',
          '....BBBBBB......',
          '...BBBBBBBB.....',
          '..BBBBBBBBBB....',
          '...BBBBBBBB.....',
          '..B........B....',
          '..B........B....',
          '................',
          '................',
        ],
      ],
      colors: { 'B': '#5c4033', 'e': '#ffff00', 'O': '#ff8800' },
      width: 16, height: 16, scale: 2.5,
      health: 5, points: 300, paddleReward: 20,
      tier: 3, behavior: 'rhythm', special: null,
    },

    // Gelatinous Cube (CR 10) - Slow drifter, absorbs projectiles temporarily
    cube: {
      frames: [
        [
          '................',
          '.CCCCCCCCCCCC...',
          '.CCCCCCCCCCCC...',
          '.CCccccccccCC...',
          '.CCc......cCC...',
          '.CCc..ss..cCC...',
          '.CCc..ss..cCC...',
          '.CCc......cCC...',
          '.CCc..bb..cCC...',
          '.CCc......cCC...',
          '.CCccccccccCC...',
          '.CCCCCCCCCCCC...',
          '.CCCCCCCCCCCC...',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '.CCCCCCCCCCCC...',
          '.CCccccccccCC...',
          '.CCc......cCC...',
          '.CCc.ss...cCC...',
          '.CCc.ss...cCC...',
          '.CCc......cCC...',
          '.CCc...bb.cCC...',
          '.CCc......cCC...',
          '.CCccccccccCC...',
          '.CCCCCCCCCCCC...',
          '.CCCCCCCCCCCC...',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'C': '#88ff88', 'c': '#44cc44', 's': '#ffffff', 'b': '#f0f0e0' },
      width: 16, height: 16, scale: 2.5,
      health: 6, points: 325, paddleReward: 22,
      tier: 3, behavior: 'drift', special: 'absorb',
    },

    // Troll (CR 11) - Regenerates health if not killed quickly
    troll: {
      frames: [
        [
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggggggg......',
          '..gggeggeggg....',
          '..ggggggggg.....',
          '...ggnnngg......',
          '....ggggg.......',
          '...ggggggg......',
          '..ggggggggg.....',
          '..gg.ggg.gg.....',
          '..gg.ggg.gg.....',
          '..g...g...g.....',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggggggg......',
          '..gggeggeggg....',
          '..ggggggggg.....',
          '...ggnnngg......',
          '....ggggg.......',
          '...ggggggg......',
          '..ggggggggg.....',
          '...ggggggg......',
          '..g.......g.....',
          '..g.......g.....',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'g': '#446633', 'e': '#ff4400', 'n': '#222222' },
      width: 16, height: 16, scale: 2.5,
      health: 5, points: 350, paddleReward: 24,
      tier: 3, behavior: 'bounce', special: 'regenerate',
    },

    // === TIER 4: CR 13-16 (Deadly) ===

    // Werewolf (CR 12) - Fast frenzy movement when low health
    werewolf: {
      frames: [
        [
          '................',
          '....gg....gg....',
          '....ggg..ggg....',
          '.....gggggg.....',
          '....gggggggg....',
          '...gggeggeggg...',
          '...gggggggggg...',
          '....ggnnngg.....',
          '.....ggggg......',
          '....ggggggg.....',
          '...ggggggggg....',
          '...g..ggg..g....',
          '...g..ggg..g....',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '....gg....gg....',
          '....ggg..ggg....',
          '.....gggggg.....',
          '....gggggggg....',
          '...gggeggeggg...',
          '...gggggggggg...',
          '....ggnnngg.....',
          '.....ggggg......',
          '....ggggggg.....',
          '...ggggggggg....',
          '....ggggggg.....',
          '..g.........g...',
          '..g.........g...',
          '................',
          '................',
        ],
      ],
      colors: { 'g': '#555555', 'e': '#ffcc00', 'n': '#ffffff' },
      width: 16, height: 16, scale: 2.5,
      health: 5, points: 400, paddleReward: 26,
      tier: 4, behavior: 'frenzy', special: null,
    },

    // Basilisk (CR 13) - Slithers slowly, petrifies paddle briefly on hit
    basilisk: {
      frames: [
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggyggyggg....',
          '...gggggggggg...',
          '....ggggggggggg.',
          '.....ggggggggg..',
          '......ggggggg...',
          '.......ggggg....',
          '........ggg.....',
          '.........g......',
          '................',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '.....ggg........',
          '....ggggg.......',
          '...ggyggyggg....',
          '...ggggggggg....',
          '....gggggggg....',
          '..ggggggggg.....',
          '.ggggggggg......',
          '..ggggggg.......',
          '....ggggg.......',
          '......ggg.......',
          '.......g........',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'g': '#228833', 'y': '#ffff00' },
      width: 16, height: 16, scale: 2.5,
      health: 6, points: 450, paddleReward: 28,
      tier: 4, behavior: 'slither', special: 'petrify',
    },

    // Beholder (CR 14) - Hovers and shoots eye rays
    beholder: {
      frames: [
        [
          '....ssssss......',
          '...s.s..s.s.....',
          '..s..ssss..s....',
          '..ssBBBBBBss....',
          '.ssBBBBBBBBss...',
          '.sBBBBBBBBBBs...',
          '.sBBBrBBrBBBs...',
          '.sBBBBBBBBBBs...',
          '.sBBBBmmBBBBs...',
          '.sBBBBBBBBBBs...',
          '..sBBBBBBBBs....',
          '...sBBBBBBs.....',
          '....ssssss......',
          '................',
          '................',
          '................',
        ],
        [
          '...s.ssss.s.....',
          '..s.s....s.s....',
          '..s..ssss..s....',
          '..ssBBBBBBss....',
          '.ssBBBBBBBBss...',
          '.sBBBBBBBBBBs...',
          '.sBBBrBBrBBBs...',
          '.sBBBBBBBBBBs...',
          '.sBBBBmmBBBBs...',
          '.sBBBBBBBBBBs...',
          '..sBBBBBBBBs....',
          '...sBBBBBBs.....',
          '....ssssss......',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'B': '#885533', 's': '#885533', 'r': '#ff0000', 'm': '#ffccaa' },
      width: 16, height: 16, scale: 2.5,
      health: 7, points: 500, paddleReward: 30,
      tier: 4, behavior: 'hover', special: 'shoot',
    },

    // Mind Flayer (CR 15) - Floats, confuses paddle controls temporarily
    mindflayer: {
      frames: [
        [
          '................',
          '.....PPPP.......',
          '....PPPPPP......',
          '...PPPPPPPP.....',
          '...PgPPPPgP.....',
          '...PPPPPPPP.....',
          '....tttttt......',
          '....tttttt......',
          '....tttttt......',
          '....tttttt......',
          '.....PPPP.......',
          '....PPPPPP......',
          '...PP....PP.....',
          '...P......P.....',
          '................',
          '................',
        ],
        [
          '................',
          '.....PPPP.......',
          '....PPPPPP......',
          '...PPPPPPPP.....',
          '...PgPPPPgP.....',
          '...PPPPPPPP.....',
          '....t.tt.t......',
          '....tttttt......',
          '.....tttt.......',
          '....tttttt......',
          '.....PPPP.......',
          '....PPPPPP......',
          '...PP....PP.....',
          '...P......P.....',
          '................',
          '................',
        ],
      ],
      colors: { 'P': '#9966aa', 't': '#cc99bb', 'g': '#00ffff' },
      width: 16, height: 16, scale: 2.5,
      health: 6, points: 550, paddleReward: 32,
      tier: 4, behavior: 'float', special: 'confuse',
    },

    // === TIER 5: CR 17-20 (Legendary) ===

    // Vampire (CR 16) - Elegant glider, heals when hitting paddle
    vampire: {
      frames: [
        [
          '................',
          '..cc......cc....',
          '..ccc....ccc....',
          '...cccccccc.....',
          '....PPPPPP......',
          '...PPPPPgPP.....',
          '...PrPPPPrP.....',
          '...PPPPPPPP.....',
          '....PttttP......',
          '.....PPPP.......',
          '....PPPPPP......',
          '...PP....PP.....',
          '...P......P.....',
          '................',
          '................',
          '................',
        ],
        [
          '................',
          '................',
          '....PPPPPP......',
          '...PPPPPgPP.....',
          '...PrPPPPrP.....',
          '...PPPPPPPP.....',
          '....PttttP......',
          '.....PPPP.......',
          '..cccPPPPccc....',
          '..cc.PP.PP.cc...',
          '..c..P....P.c...',
          '..c..P....P.c...',
          '................',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'P': '#222222', 'c': '#440000', 'r': '#ff0000', 'g': '#aaaaaa', 't': '#ffffff' },
      width: 16, height: 16, scale: 2.5,
      health: 7, points: 600, paddleReward: 34,
      tier: 5, behavior: 'glide', special: 'lifesteal',
    },

    // Young Dragon (CR 17) - Flies majestically, breathes fire
    dragon: {
      frames: [
        [
          '................',
          '...rr....rr.....',
          '..rrrr..rrrr....',
          '...rrrrrrrr.....',
          '....rrrrrr......',
          '...rrrrrrrr.....',
          '..rryrrrryrr....',
          '..rrrrrrrrrr....',
          '..rrrrrrrrrrr...',
          '...rrrrrrrrrrrr.',
          '....rrrrrr......',
          '...rrrrrrrr.....',
          '...rr....rr.....',
          '...r......r.....',
          '................',
          '................',
        ],
        [
          '................',
          '...rr....rr.....',
          '..rrrr..rrrr....',
          '...rrrrrrrr.....',
          '....rrrrrr......',
          '...rrrrrrrr.....',
          '..rryrrrryrr....',
          '..rrrrrrrrrr....',
          '.rrrrrrrrrrr....',
          'rrrrrrrrrrr.....',
          '...rrrrrrrr.....',
          '...rrrrrrrr.....',
          '...rr....rr.....',
          '...r......r.....',
          '................',
          '................',
        ],
      ],
      colors: { 'r': '#cc2200', 'y': '#ffff00' },
      width: 16, height: 16, scale: 3,
      health: 8, points: 750, paddleReward: 38,
      tier: 5, behavior: 'soar', special: 'firebreath',
    },

    // Lich (CR 18) - Floating undead mage, summons minions
    lich: {
      frames: [
        [
          '................',
          '......cc........',
          '.....cccc.......',
          '....cccccc......',
          '...ccceceeccc...',
          '...ccccccccc....',
          '....ccccccc.....',
          '....cPPPPPc.....',
          '...ccPPPPPcc....',
          '...PPPPPPPPP....',
          '...PPPPPPPPP....',
          '...PP.PPP.PP....',
          '...P..PPP..P....',
          '......PPP.......',
          '.....PPPPP......',
          '................',
        ],
        [
          '................',
          '......cc........',
          '.....cccc.......',
          '....cccccc......',
          '...ccceceeccc...',
          '...ccccccccc....',
          '....ccccccc.....',
          '....cPPPPPc.....',
          '...ccPPPPPcc....',
          '...PPPPPPPPP....',
          '...PPPPPPPPP....',
          '....PPPPPPP.....',
          '...P.......P....',
          '......PPP.......',
          '.....PPPPP......',
          '................',
        ],
      ],
      colors: { 'P': '#333355', 'c': '#ddddcc', 'e': '#00ff00' },
      width: 16, height: 16, scale: 3,
      health: 8, points: 850, paddleReward: 42,
      tier: 5, behavior: 'float', special: 'summon',
    },

    // Tarrasque (CR 20) - MASSIVE boss, reflects projectiles
    tarrasque: {
      frames: [
        [
          '..hhh....hhh....',
          '.hhhhh..hhhhh...',
          '.BBBBBBBBBBBBB..',
          'BBBByBBBByBBBBB.',
          'BBBBBBBBBBBBBBB.',
          'BBBBBmmmmmBBBBB.',
          'BBBBBBBBBBBBBBB.',
          '.BBBBBBBBBBBBB..',
          '.BBBBBBBBBBBBB..',
          '..BBBBBBBBBBB...',
          '.BBB.BBBBB.BBB..',
          '.BBB.BBBBB.BBB..',
          '.BB...BBB...BB..',
          '................',
          '................',
          '................',
        ],
        [
          '..hhh....hhh....',
          '.hhhhh..hhhhh...',
          '.BBBBBBBBBBBBB..',
          'BBBByBBBByBBBBB.',
          'BBBBBBBBBBBBBBB.',
          'BBBBBmmmmmBBBBB.',
          'BBBBBBBBBBBBBBB.',
          '.BBBBBBBBBBBBB..',
          '.BBBBBBBBBBBBB..',
          '..BBBBBBBBBBB...',
          '...BBBBBBBBB....',
          '.BB.........BB..',
          '.BB.........BB..',
          '................',
          '................',
          '................',
        ],
      ],
      colors: { 'B': '#553311', 'h': '#664422', 'y': '#ff0000', 'm': '#ffccaa' },
      width: 16, height: 16, scale: 4,
      health: 15, points: 2000, paddleReward: 50,
      tier: 5, behavior: 'rampage', special: 'reflect',
    },
  };

  // World-themed color variants for enemies
  const ENEMY_THEME_COLORS = {
    brick_goblin: { primary: '#44dd44', secondary: '#22aa22', brick1: '#44dd44', brick2: '#66ff66', alien: '#33cc33' },
    magnet_mage: { primary: '#4488ff', secondary: '#2266dd', brick1: '#4488ff', brick2: '#66aaff', alien: '#3377ee' },
    wind_witch: { primary: '#88ddaa', secondary: '#55aa77', brick1: '#88ddaa', brick2: '#aaffcc', alien: '#77cc99' },
    shadow_smith: { primary: '#aa66cc', secondary: '#7744aa', brick1: '#aa66cc', brick2: '#cc88ee', alien: '#9955bb' },
    fire_phoenix: { primary: '#ff6644', secondary: '#dd4422', brick1: '#ff6644', brick2: '#ff8866', alien: '#ee5533' },
    frost_fairy: { primary: '#66ddff', secondary: '#44aadd', brick1: '#66ddff', brick2: '#88eeff', alien: '#55ccee' },
    chaos_clown: { primary: '#ff66aa', secondary: '#dd4488', brick1: '#ff66aa', brick2: '#ff88cc', alien: '#ee5599' },
    portal_wizard: { primary: '#aa66ff', secondary: '#8844dd', brick1: '#aa66ff', brick2: '#cc88ff', alien: '#9955ee' },
    titan_king: { primary: '#ffdd44', secondary: '#ddaa22', brick1: '#ffdd44', brick2: '#ffee66', alien: '#eecc33' },
    cosmic_dragon: { primary: '#ff44ff', secondary: '#dd22dd', brick1: '#ff44ff', brick2: '#ff66ff', alien: '#ee33ee' },
  };

  // Level definitions - hand-crafted layouts for each enemy
  // Legend: '.'=empty, '1'=1-hit, '2'=2-hit, '3'=3-hit, '#'=indestructible, '*'=powerup, 'X'=explosive
  // New: 'F'=frozen (2-phase), 'P'=split/sPlit (breaks into 4), 'E'=enemy spawner brick, 'S'=spawner point (pinball)
  const LEVEL_DEFINITIONS = {
    // BRICK GOBLIN - Simple shapes, learning levels
    brick_goblin: [
      // Level 1: Welcome pyramid
      [
        '....1111....',
        '...222222...',
        '..11111111..',
        '.2222222222.',
        '111111111111',
        '222222222222',
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
      // Level 4: Frozen Diamond - intro to frozen bricks
      [
        '.....FF.....',
        '....2222....',
        '...2FFFF2...',
        '...2FFFF2...',
        '....2222....',
        '.....FF.....',
      ],
      // Level 5: Split Challenge - intro to split bricks
      [
        '.PPPPPPPPPP.',
        '.P..P..P..P.',
        '.PPPPPPPPPP.',
        '.2........2.',
        '.2.222222.2.',
        '.2222222222.',
      ],
      // Level 6: Enemy Castle - intro to spawner bricks
      [
        '3.3.E.E.3.3.',
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
      // Level 10: Goblin Maze
      [
        '3#3#3#3#3#3#',
        '3..3..3..3.3',
        '3#.3#.3#.3#3',
        '3..3..3..3.3',
        '3#3#3#3#3#3#',
        '333333333333',
      ],
      // Level 11: Goblin Gauntlet
      [
        '#3#3#3#3#3#3',
        '3*3333333*33',
        '333#33#33333',
        '33333333##33',
        'X333333333X3',
        '333333333333',
      ],
      // Level 12: Boss - The Goblin King
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
      // Level 10: Magnetic Storm
      [
        '33O33..33O33',
        '3333333333..',
        'O.33##33..O.',
        '..33##33..O.',
        '3333333333..',
        '33O33..33O33',
      ],
      // Level 11: Polarity Shift
      [
        '#3#3O3#3#3#3',
        '3*33333333*3',
        '33O3333333O3',
        '333333333333',
        '3*33O33O33*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Magnet Mage Boss
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
      // Level 8: Gusts - 2 portal pairs
      [
        '@1.222.@2....',
        '..222..#..22',
        '@2222....222',
        '222..#..222.',
        '22..#..222..',
        '...#.@1.22..',
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
      // Level 10: Cyclone
      [
        '@133333333@1',
        '33.333333.33',
        '333..33..333',
        '333..33..333',
        '33.333333.33',
        '@233333333@2',
      ],
      // Level 11: Hurricane
      [
        '#3@13333@13#',
        '3*33333333*3',
        '@233333333@2',
        '333333333333',
        '3*33@13@13*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Wind Witch Boss
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
      // Level 10: Shadow Forge
      [
        'S33333333S33',
        '33#333#33333',
        '333333333333',
        '333333333333',
        '33#333#33333',
        'S33333333S33',
      ],
      // Level 11: Umbral Depths
      [
        '#3S3#3#3S3#3',
        '3*33333333*3',
        '33S333333S33',
        '333333333333',
        '3*33S33S33*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Shadow Smith Boss
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
      // Level 10: Inferno
      [
        'X33O33O33X33',
        '333333333333',
        '@133X33X33@1',
        '333333333333',
        'S333333333S3',
        'X33X33X33X33',
      ],
      // Level 11: Pyre
      [
        '#3X3#3#3X3#3',
        '3*33333333*3',
        '33X3O3O3X333',
        '333333333333',
        '3*33X33X33*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Fire Phoenix Boss
      [
        '..*3333*33..',
        '..33333333..',
        '.3333##3333.',
        '333333333333',
        '3X33X33X33X3',
        '#3#3#33#3#3#',
      ],
    ],

    // FROST FAIRY - World 6: Ice theme, freezing patterns
    frost_fairy: [
      // Level 1: Snowflakes - gentle intro
      [
        '..2....2....',
        '.222..222...',
        '..2....2....',
        '....O.......',
        '..2....2....',
        '.222..222...',
      ],
      // Level 2: Icicles - hanging dangers
      [
        '333.333.333.',
        '33...33...33',
        '3.....3.....3',
        '..O.......O.',
        '............',
        '............',
      ],
      // Level 3: Frozen lake - portal slide
      [
        '@1222222222@1',
        '222222222222',
        '.2222222222.',
        '..22222222..',
        '@2..2222..@2',
        '............',
      ],
      // Level 4: Ice crystals - spawner guards
      [
        'S..333..333S',
        '..3##33##3..',
        '.3..33..3...',
        '3....O....3.',
        '.3......3...',
        '..333333....',
      ],
      // Level 5: Snowstorm - bumper chaos
      [
        'O.2222.O2222',
        '22222222.222',
        '2222.O.22222',
        '22222222.222',
        'O.2222.O2222',
        '222222222222',
      ],
      // Level 6: Glacier - multi portal
      [
        '@1#3333#@2..',
        '33333333333.',
        '3333333333..',
        '@2#3333#@1..',
        '..3333333333',
        '.33333333333',
      ],
      // Level 7: Blizzard - heavy combo
      [
        'S.O.22.O.2S.',
        '222222222222',
        '@1.2222222@1',
        '222222222222',
        '@2.2222222@2',
        'S.O.22.O.2S.',
      ],
      // Level 8: Ice palace
      [
        '#333##333#..',
        '3*3333333*3.',
        '33333333333.',
        '3O33O33O33O.',
        '333333333333',
        '#3#3#33#3#3#',
      ],
      // Level 9: Permafrost maze
      [
        'S#.#.#.#.#S.',
        '.333333333.#',
        '#.O.....O.#.',
        '.#.O...O.#..',
        '#.333333333.',
        '.#.#.#.#.#S.',
      ],
      // Level 10: Blizzard
      [
        'FF33O33O33FF',
        '333333333333',
        'F3333333333F',
        '333333333333',
        'FF333333FF33',
        '#F#F#FF#F#F#',
      ],
      // Level 11: Absolute Zero
      [
        '#3F3#3#3F3#3',
        '3*33F33F33*3',
        '33F3O3O3F333',
        '33333F333333',
        '3*33F33F33*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Frost Fairy Boss - The Frozen Heart
      [
        '@1..4444..@1',
        '..44444444..',
        '.4444##4444.',
        '44O4444O444.',
        '4*44444444*4',
        '#4#4#44#4#4#',
      ],
    ],

    // CHAOS CLOWN - World 7: Unpredictable patterns
    chaos_clown: [
      // Level 1: Juggling balls - bumpers everywhere
      [
        '.O..O..O..O.',
        '...222222...',
        '..22222222..',
        '...222222...',
        '.O..O..O..O.',
        '............',
      ],
      // Level 2: Circus tent - zigzag
      [
        '......33....',
        '....333333..',
        '..33333333..',
        '333333333333',
        '3#3.3..3.3#3',
        '............',
      ],
      // Level 3: Clown face - silly pattern
      [
        '.3333333333.',
        '.3*3....3*3.',
        '.333333333..',
        '.3...O....3.',
        '.3.33333.3..',
        '.3333333333.',
      ],
      // Level 4: Balloon pop - scattered
      [
        'S..2..2..2S.',
        '..2..2..2...',
        '.2..O..2..O.',
        '2..2..2..2..',
        '..2..2..2...',
        '@1.2..2..@1.',
      ],
      // Level 5: Ring toss - portal madness
      [
        '@1..@2..@1..',
        '..33..33..33',
        '@2......@2..',
        '33..33..33..',
        '@1..@2..@1..',
        '..33..33..33',
      ],
      // Level 6: Funhouse mirror
      [
        '#333..333#..',
        '3333..3333..',
        '333O..O333..',
        '333O..O333..',
        '3333..3333..',
        '#333..333#..',
      ],
      // Level 7: Pie in the face
      [
        '....S....S..',
        '..33333333..',
        '.3333333333.',
        '33333##33333',
        '.3333333333.',
        '..O.O..O.O..',
      ],
      // Level 8: Trapeze - swinging portals
      [
        '@1.###.@1...',
        '..33333333..',
        '@2.33..33.@2',
        '..33....33..',
        '@1.33..33.@1',
        '...#####....',
      ],
      // Level 9: Chaos maze
      [
        'S#S#.#.#S#S.',
        '.X.X.X.X.X.#',
        '#.O.O.O.O.#.',
        '.#.X.X.X.X..',
        '#.333333333.',
        '.#.#.#.#.#S.',
      ],
      // Level 10: Madhouse
      [
        'X33O33O33X33',
        '333S33S33333',
        '@133333333@1',
        '333333333333',
        'X333S33S333X',
        '@233O33O33@2',
      ],
      // Level 11: Pandemonium
      [
        '#3X3S3S3X3#3',
        '3*33O33O33*3',
        '@1X333333X@1',
        '333333333333',
        '3*@233S3@2*3',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Chaos Clown Boss
      [
        '@1.4*44*4.@1',
        '.O44444444O.',
        '.4444##4444.',
        '@2444444442@2',
        '.4X44XX44X4.',
        '#4#4#44#4#4#',
      ],
    ],

    // PORTAL WIZARD - World 8: Portal-heavy levels
    portal_wizard: [
      // Level 1: Portal 101 - simple pairs
      [
        '@1.......@1.',
        '222222222222',
        '............',
        '@2.......@2.',
        '222222222222',
        '............',
      ],
      // Level 2: Warp grid
      [
        '@12222222@1.',
        '2222222222..',
        '@22222222@2.',
        '222222222222',
        '@12222222@1.',
        '222222222222',
      ],
      // Level 3: Dimension hop
      [
        '@1@2@3@4....',
        '333333333333',
        '............',
        '............',
        '333333333333',
        '@4@3@2@1....',
      ],
      // Level 4: Portal maze
      [
        '#@1..#@2..#.',
        '.333..333..3',
        '@2..@1..@3..',
        '.333..333..3',
        '#@3..#@4..#.',
        '.333..333@4.',
      ],
      // Level 5: Teleport chaos
      [
        'S@1.O.@2..S.',
        '33333333333.',
        '@2......@1..',
        '...O..O.....',
        '@3......@4..',
        '@433333333@3',
      ],
      // Level 6: Void corridors
      [
        '#@1333@2333#',
        '@3.......@4.',
        '333#...#333.',
        '333#...#333.',
        '@4.......@3.',
        '#@2333@1333#',
      ],
      // Level 7: Infinity loop
      [
        '@1@2..@1@2..',
        '.333333333..',
        '@2.......@1.',
        '@1.......@2.',
        '.333333333..',
        '@2@1..@2@1..',
      ],
      // Level 8: Portal storm
      [
        'S@1S@2S@3S@4',
        '333333333333',
        '@4@3@2@1....',
        '....@1@2@3@4',
        '333333333333',
        'S@4S@3S@2S@1',
      ],
      // Level 9: Dimensional rift
      [
        '#@1#.#@2#.#.',
        '.O.333.O.333',
        '@2.....@1...',
        '...@3.....@4',
        '.333.O.333.O',
        '#.#@4#.#@3#.',
      ],
      // Level 10: Tesseract
      [
        '@1@2333333@3',
        '33333@43333.',
        '@3333333@1..',
        '..@133333@3.',
        '3333@433333.',
        '@4@33333@2@1',
      ],
      // Level 11: Multiverse
      [
        '#3@13@23@33#',
        '3*@43333@4*3',
        '@1@2333@3@43',
        '333333333333',
        '3*@13@23@33*',
        '#3#3#3#3#3#3',
      ],
      // Level 12: Portal Wizard Boss
      [
        '@1@24*44*4@3',
        '@3O44##44O@4',
        '@1444444@244',
        '.444444444..',
        '@4O44##44O@1',
        '@2@14*44*4@2',
      ],
    ],

    // TITAN KING - World 9: Grand, fortress-like levels
    titan_king: [
      // Level 1: Royal guard - fortified intro
      [
        '####44444###',
        '#444444444#.',
        '#4.4....4.4#',
        '#444....444#',
        '#4.4....4.4#',
        '############',
      ],
      // Level 2: Throne room
      [
        '..#4444#....',
        '.#444444#...',
        '#4444444444#',
        '#44#44#44#4#',
        '.444....444.',
        '..########..',
      ],
      // Level 3: Castle walls - bumper towers
      [
        '#O#4444#O#..',
        '444444444444',
        '#4#4##4#4#..',
        '444444444444',
        '#O#4444#O#..',
        '############',
      ],
      // Level 4: Treasury - portal vault
      [
        '@1######@2..',
        '#*444444*#..',
        '#44444444#..',
        '#44444444#..',
        '#*444444*#..',
        '@2######@1..',
      ],
      // Level 5: King's army - spawner barracks
      [
        'S##4444##S..',
        '#44444444#..',
        '#4..O...4#..',
        '#4......4#..',
        '#44444444#..',
        '###4444###..',
      ],
      // Level 6: Grand hall
      [
        '444##44##444',
        '44O4444O444.',
        '4444444444..',
        '4444444444..',
        '44O4444O444.',
        '444##44##444',
      ],
      // Level 7: Siege warfare
      [
        'S#S#S##S#S#S',
        '4X4444444X4.',
        '444444444444',
        '@1@2....@2@1',
        '444444444444',
        '############',
      ],
      // Level 8: Royal maze
      [
        '#4#.#4#.#4#.',
        '4O4.4O4.4O4.',
        '#4###4###4#.',
        '4444444444..',
        '#4###4###4#.',
        '@1.#.@2.#@2@1',
      ],
      // Level 9: King's final test
      [
        'S##@1##@1##S',
        '#*44444444*#',
        '#44OOOO44#..',
        '#4444444444#',
        '#*44XXXX44*#',
        '@2#########@2',
      ],
      // Level 10: Throne Room
      [
        '#44O44O44#33',
        '444444444444',
        '@1444##444@1',
        '444444444444',
        'S4444444444S',
        '#44X44X44#33',
      ],
      // Level 11: Titan's Wrath
      [
        '#3#4S4S4#3#3',
        '4*44O44O44*4',
        '@144444444@1',
        '444444444444',
        '4*44X44X44*4',
        '#4#4#4#4#4#4',
      ],
      // Level 12: Titan King Boss
      [
        '###5555###..',
        '#*5555555*#.',
        '#555##555#..',
        '@1O555O55@1.',
        '#5555555555#',
        '######X#####',
      ],
    ],

    // COSMIC DRAGON - World 10: Ultimate challenge
    cosmic_dragon: [
      // Level 1: Stellar intro - everything combined
      [
        'S@1O.O.O@1S.',
        '333333333333',
        '@2.......@2.',
        '.O.O.O.O.O..',
        '333333333333',
        'S@1O.O.O@1S.',
      ],
      // Level 2: Nebula formation
      [
        '@1@2@3@4....',
        '.4O44O44O4..',
        '.444444444..',
        '.444444444..',
        '.4O44O44O4..',
        '@4@3@2@1....',
      ],
      // Level 3: Black hole
      [
        '555555555555',
        '55.S....S.55',
        '5....O....5.',
        '5....O....5.',
        '55.S....S.55',
        '555555555555',
      ],
      // Level 4: Supernova
      [
        '..@1XXX@2...',
        '.X555555X...',
        '@35555555@4.',
        '@45555555@3.',
        '.X555555X...',
        '..@2XXX@1...',
      ],
      // Level 5: Asteroid field
      [
        'S.O.S.O.S.O.',
        '.55.55.55.55',
        'O.O.O.O.O.O.',
        '.55.55.55.55',
        'S.O.S.O.S.O.',
        '.55.55.55.55',
      ],
      // Level 6: Wormhole nexus
      [
        '@1@2@3@4@1@2',
        '555555555555',
        '@3#####@4...',
        '@4#####@3...',
        '555555555555',
        '@2@1@4@3@2@1',
      ],
      // Level 7: Cosmic storm
      [
        'S#S#S#S#S#S#',
        '.X.X.X.X.X.X',
        '@1O@2O@3O@4O',
        'O@4O@3O@2O@1',
        '.X.X.X.X.X.X',
        '#S#S#S#S#S#S',
      ],
      // Level 8: Dragon scales
      [
        '5*5*5*5*5*5.',
        '*5*5*5*5*5*.',
        '5555555555..',
        '*5*5*5*5*5*.',
        '5*5*5*5*5*5.',
        '######X#####',
      ],
      // Level 9: Singularity
      [
        '@1S#@2S#@3S#',
        '5555555555..',
        '@4O555555O@1',
        '@1O555555O@4',
        '5555555555..',
        '#S@3#S@2#S@1',
      ],
      // Level 10: Event Horizon
      [
        'S@15555555@2S',
        '555555555555',
        '@3O55##55O@4',
        '555555555555',
        'X555XX555X55',
        '@4@35555@1@2#',
      ],
      // Level 11: Supernova
      [
        '#5@15@25@3#5',
        '5*55O55O55*5',
        '@4X555555X@1',
        '555555555555',
        '5*@255S5@35*',
        '#5#5#5#5#5#5',
      ],
      // Level 12: Cosmic Dragon Boss - THE FINAL BATTLE
      [
        '@1@2@1@2@3@4',
        'S*555555*S..',
        '55O5##5O55..',
        '55O5##5O55..',
        'S*555555*S..',
        '@2@1@3@4#@1@2',
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
  const [debugMode, setDebugMode] = useState(false); // Debug mode - unlocks all levels
  const [levelEditorEnabled, setLevelEditorEnabled] = useState(true); // Toggle level editor access (debug feature)

  // === LEVEL EDITOR STATE ===
  const [editorLevel, setEditorLevel] = useState(Array(6).fill('.'.repeat(12))); // Current level being edited
  const [editorSelectedTool, setEditorSelectedTool] = useState('1'); // Current brick/tool selected
  const [editorSelectedEnemy, setEditorSelectedEnemy] = useState('brick_goblin'); // Enemy to edit levels for
  const [editorLevelNumber, setEditorLevelNumber] = useState(1); // Which level slot (1-12)
  const [editorTestMode, setEditorTestMode] = useState(false); // Playing the level being edited
  const [customLevels, setCustomLevels] = useState(() => {
    const saved = localStorage.getItem('teddyball_custom_levels');
    return saved ? JSON.parse(saved) : {};
  }); // { enemyId: { levelNum: [...rows] } }

  // === WEAPONS SYSTEM ===
  // Unconventional weapons that use ammo - ball goes into containment field while using
  const WEAPONS = {
    bubble_wand: {
      id: 'bubble_wand',
      name: 'Bubble Wand',
      emoji: '🫧',
      color: '#88ddff',
      desc: 'Blow magical bubbles that float up and pop on bricks',
      maxAmmo: 8,
      brickChar: 'B', // Specific powerup brick character
    },
    gravity_anchor: {
      id: 'gravity_anchor',
      name: 'Gravity Anchor',
      emoji: '⚓',
      color: '#4a6fa5',
      desc: 'Drop anchors that create gravity wells, pulling bricks down',
      maxAmmo: 3,
      brickChar: 'A',
    },
    prism_beam: {
      id: 'prism_beam',
      name: 'Prism Beam',
      emoji: '💎',
      color: '#ff88ff',
      desc: 'Fire a light beam that splits and refracts off obstacles',
      maxAmmo: 5,
      brickChar: 'R',
    },
    vine_launcher: {
      id: 'vine_launcher',
      name: 'Vine Launcher',
      emoji: '🌿',
      color: '#44aa44',
      desc: 'Shoot organic vines that spread across connected bricks',
      maxAmmo: 4,
      brickChar: 'V',
    },
    echo_pulse: {
      id: 'echo_pulse',
      name: 'Echo Pulse',
      emoji: '🔊',
      color: '#ffaa00',
      desc: 'Send sound waves that crack all bricks in their path',
      maxAmmo: 6,
      brickChar: 'W', // W for Wave
    },
  };

  const [activeWeapon, setActiveWeapon] = useState(null); // Current weapon being used
  const [weaponAmmo, setWeaponAmmo] = useState({}); // { weaponId: ammoCount }
  const [containmentField, setContainmentField] = useState(false); // Ball sucked into paddle
  const [weaponProjectiles, setWeaponProjectiles] = useState([]); // Active weapon effects (bubbles, vines, etc)

  // Power-ups
  const [powerUps, setPowerUps] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);

  // Gimmick state
  const [gimmickData, setGimmickData] = useState({});

  // === ENEMY SYSTEM ===
  const [enemies, setEnemies] = useState([]);
  const [lastEnemySpawn, setLastEnemySpawn] = useState(0);
  const [difficulty, setDifficulty] = useState(null); // Current difficulty settings
  const [enemyProjectiles, setEnemyProjectiles] = useState([]); // Webs, eye rays, fire, etc.
  const [paddleDebuffs, setPaddleDebuffs] = useState({
    petrified: 0,    // Can't move (basilisk)
    confused: 0,     // Reversed controls (mind flayer)
    webbed: 0,       // Slowed movement (spider)
  });

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

  // Twin paddle for Teddy Split ability
  const [twinPaddle, setTwinPaddle] = useState(null);

  // === INVASION MODE (Space Invaders style before bosses) ===
  const [invasionMode, setInvasionMode] = useState(false);
  const [shipProjectiles, setShipProjectiles] = useState([]);
  const [invasionFormation, setInvasionFormation] = useState({
    offsetX: 0,           // Formation horizontal offset
    direction: 1,         // 1 = right, -1 = left
    descendAmount: 0,     // How far formation has descended
    speed: 0.8,           // Movement speed
  });
  const [lastShipFire, setLastShipFire] = useState(0);
  const SHIP_FIRE_COOLDOWN = 180; // ms between shots
  const [pendingBossLevel, setPendingBossLevel] = useState(null); // Level to start after invasion clears

  // Invasion sequence phases:
  // 'normal' - Regular breakout gameplay
  // 'ball_grabbed' - Alien flying in to grab ball
  // 'alert' - UH OH alert showing
  // 'shoot_alien' - Paddle transforms to ship, player shoots alien
  // 'transform' - Bricks transform into aliens
  // 'invasion' - Full invasion mode gameplay
  // 'boss_intro' - Boss appearing after invasion
  const [invasionPhase, setInvasionPhase] = useState('normal');
  const [ballGrabber, setBallGrabber] = useState(null); // The alien grabbing the ball
  const [invasionTimer, setInvasionTimer] = useState(0); // Timer for phase transitions
  const [transformProgress, setTransformProgress] = useState(0); // 0-1 for transformation animations
  const [paddleTransformProgress, setPaddleTransformProgress] = useState(0); // 0-1 for paddle-to-ship animation
  const [brickMorphProgress, setBrickMorphProgress] = useState(0); // 0-1 for brick-to-alien morph

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
  const dashCooldownRef = useRef(0);
  const teddyMeterRef = useRef(0);
  const teddyAbilityActiveRef = useRef(null);
  const isChargingRef = useRef(false);
  const chargeLevelRef = useRef(0);
  const ballsRef = useRef([]);
  const bricksRef = useRef([]);
  const paddleRef = useRef(paddle);
  const launchDelayRef = useRef(0); // Prevents immediate ball launch when starting game
  const weaponAmmoRef = useRef({}); // Track weapon ammo for keyboard handler

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
    // Regular powerups with brick characters for specific drops
    expand: { emoji: '📏', color: '#50c878', effect: 'Wider Paddle', weight: 3, brickChar: 'e' },
    shrink: { emoji: '📐', color: '#ff6b6b', effect: 'Shrink! (penalty)', weight: 1, brickChar: 'k' },
    multi: { emoji: '✨', color: '#ffd700', effect: 'Multi-Ball', weight: 3, brickChar: 'm' },
    fast: { emoji: '⚡', color: '#ffff00', effect: 'Speed Up', weight: 1, brickChar: 'f' },
    slow: { emoji: '🐌', color: '#80c0ff', effect: 'Slow Down', weight: 2, brickChar: 's' },
    life: { emoji: '❤️', color: '#ff4444', effect: '+1 Life', weight: 2, brickChar: 'l' },
    laser: { emoji: '🔫', color: '#ff00ff', effect: 'Laser Paddle', weight: 2, brickChar: 'z' },
    shield: { emoji: '🛡️', color: '#4080ff', effect: 'Shield', weight: 2, brickChar: 'h' },
    magnet: { emoji: '🧲', color: '#4080e0', effect: 'Magnet Catch', weight: 2, brickChar: 'g' },
    mega: { emoji: '💫', color: '#ffd700', effect: 'Mega Ball!', weight: 1, brickChar: 'M' },
    warp: { emoji: '🌀', color: '#a060e0', effect: 'WARP GATE!', weight: 0.5, brickChar: 'w' },
    // Weapon powerups (special - gives weapon + ammo)
    weapon_bubble: { emoji: '🫧', color: '#88ddff', effect: 'Bubble Wand', weight: 0, brickChar: 'B', isWeapon: true, weaponId: 'bubble_wand' },
    weapon_anchor: { emoji: '⚓', color: '#4a6fa5', effect: 'Gravity Anchor', weight: 0, brickChar: 'A', isWeapon: true, weaponId: 'gravity_anchor' },
    weapon_prism: { emoji: '💎', color: '#ff88ff', effect: 'Prism Beam', weight: 0, brickChar: 'R', isWeapon: true, weaponId: 'prism_beam' },
    weapon_vine: { emoji: '🌿', color: '#44aa44', effect: 'Vine Launcher', weight: 0, brickChar: 'V', isWeapon: true, weaponId: 'vine_launcher' },
    weapon_echo: { emoji: '🔊', color: '#ffaa00', effect: 'Echo Pulse', weight: 0, brickChar: 'W', isWeapon: true, weaponId: 'echo_pulse' },
  };

  // Map brick characters to powerup/weapon types for specific drops
  const brickCharToPowerUp = Object.entries(powerUpTypes).reduce((acc, [key, val]) => {
    if (val.brickChar) acc[val.brickChar] = key;
    return acc;
  }, {});

  // Save stats
  useEffect(() => {
    localStorage.setItem('teddyball_stats', JSON.stringify(stats));
  }, [stats]);

  // Enemy progression helpers - sequential unlocking
  const STARS_TO_UNLOCK = 10; // Stars needed to unlock next enemy
  const POINTS_PER_STAR = 200; // Score needed per star (2000 total to fully complete an enemy)

  const getEnemyStars = (enemyId) => stats.enemyStars[enemyId] || 0;

  const isEnemyUnlocked = (enemyIndex) => {
    if (debugMode) return true; // Debug mode unlocks all
    if (enemyIndex === 0) return true; // First enemy always unlocked
    const prevEnemy = enemyDefs[enemyIndex - 1];
    return getEnemyStars(prevEnemy.id) >= STARS_TO_UNLOCK;
  };

  const isEnemyComplete = (enemyId) => getEnemyStars(enemyId) >= STARS_TO_UNLOCK;

  // Level star thresholds - score needed for 1/2/3 stars (scales with level)
  const MAX_LEVELS = 12;
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
  useEffect(() => { weaponAmmoRef.current = weaponAmmo; }, [weaponAmmo]);

  // Fire weapon function - creates weapon-specific projectiles
  const fireWeapon = useCallback(() => {
    if (!activeWeapon || !weaponAmmo[activeWeapon] || weaponAmmo[activeWeapon] <= 0) return;

    const weapon = WEAPONS[activeWeapon];
    if (!weapon) return;

    const currentPaddle = paddleRef.current;
    if (!currentPaddle) return;

    // Consume ammo
    setWeaponAmmo(prev => ({
      ...prev,
      [activeWeapon]: prev[activeWeapon] - 1
    }));

    // Enable containment field - suck ball into paddle
    setContainmentField(true);
    setBalls(prev => prev.map(ball => ({
      ...ball,
      attached: true,
      containedForWeapon: true,
      vx: 0,
      vy: 0,
    })));

    // Create weapon-specific projectile
    const paddleCenterX = currentPaddle.x + currentPaddle.width / 2;
    const paddleTop = CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM - PADDLE_HEIGHT;

    const projectile = {
      id: Date.now() + Math.random(),
      type: activeWeapon,
      x: paddleCenterX,
      y: paddleTop - 10,
      vx: 0,
      vy: -6,
      life: 1,
      color: weapon.color,
      emoji: weapon.emoji,
    };

    // Weapon-specific projectile behavior
    switch (activeWeapon) {
      case 'bubble_wand':
        // Create 3 bubbles that float up with wavy motion
        const bubbles = [];
        for (let i = 0; i < 3; i++) {
          bubbles.push({
            ...projectile,
            id: Date.now() + Math.random() + i,
            x: paddleCenterX + (i - 1) * 30,
            vx: (i - 1) * 0.5,
            vy: -3 - Math.random(),
            size: 15 + Math.random() * 10,
            wobblePhase: Math.random() * Math.PI * 2,
            damage: 2,
          });
        }
        setWeaponProjectiles(prev => [...prev, ...bubbles]);
        break;

      case 'gravity_anchor':
        // Drop an anchor that creates a gravity well
        setWeaponProjectiles(prev => [...prev, {
          ...projectile,
          vy: 0,
          size: 30,
          gravityRadius: 120,
          pullStrength: 0.5,
          duration: 180, // 3 seconds at 60fps
          damage: 1,
        }]);
        break;

      case 'prism_beam':
        // Fire a beam that splits on obstacles
        setWeaponProjectiles(prev => [...prev, {
          ...projectile,
          vy: -12,
          isBeam: true,
          beamLength: 40,
          splits: 2, // Can split twice
          damage: 3,
        }]);
        break;

      case 'vine_launcher':
        // Shoot a vine that spreads on hit
        setWeaponProjectiles(prev => [...prev, {
          ...projectile,
          vy: -8,
          isVine: true,
          spreadCount: 4, // Spreads to 4 adjacent bricks
          damage: 1,
        }]);
        break;

      case 'echo_pulse':
        // Send a horizontal wave across the screen
        setWeaponProjectiles(prev => [...prev, {
          ...projectile,
          y: paddleTop - 50,
          vy: -2,
          isWave: true,
          waveWidth: CANVAS_WIDTH,
          waveHeight: 30,
          damage: 1,
        }]);
        break;
    }

    // Release containment field after a short delay
    setTimeout(() => {
      setContainmentField(false);
      setBalls(prev => prev.map(ball => {
        if (ball.containedForWeapon) {
          return {
            ...ball,
            attached: false,
            containedForWeapon: false,
            vy: -ball.baseSpeed,
            vx: (Math.random() - 0.5) * 2,
          };
        }
        return ball;
      }));
    }, 500);

    // Flash effect
    setFlashColor(weapon.color);
    setTimeout(() => setFlashColor(null), 100);
    addFloatingText(paddleCenterX, paddleTop - 30, weapon.emoji, weapon.color);

  }, [activeWeapon, weaponAmmo, addFloatingText]);

  // === INVASION SEQUENCE FUNCTIONS ===

  // Trigger the invasion sequence when ball is launched on boss level
  const triggerInvasionSequence = useCallback(() => {
    if (invasionPhase !== 'normal' || !pendingBossLevel) return;

    const themeColor = ENEMY_THEME_COLORS[selectedEnemy?.id] || ENEMY_THEME_COLORS.brick_goblin;

    // Create the UFO that will grab the ball
    setBallGrabber({
      x: CANVAS_WIDTH + 50,
      y: -50,
      targetX: CANVAS_WIDTH / 2,
      targetY: 150,
      phase: 'flying_in', // flying_in -> grabbing -> flying_with_ball -> shot -> dying
      health: 3,
      color: themeColor.alien,
      emoji: '🛸', // Always use UFO emoji for the ball grabber
      hasBall: false,
      hitTimer: 0,
      beamActive: false, // Tractor beam for grabbing ball
      beamProgress: 0,
    });

    setInvasionPhase('ball_grabbed');
    setInvasionTimer(0);

    // Dramatic flash
    setFlashColor('#ff4444');
    setTimeout(() => setFlashColor(null), 200);

  }, [invasionPhase, pendingBossLevel, selectedEnemy]);

  // Ref for invasion phase checks in event handlers
  const invasionPhaseRef = useRef(invasionPhase);
  const pendingBossLevelRef = useRef(pendingBossLevel);
  useEffect(() => { invasionPhaseRef.current = invasionPhase; }, [invasionPhase]);
  useEffect(() => { pendingBossLevelRef.current = pendingBossLevel; }, [pendingBossLevel]);

  // Check if ball launch should trigger invasion
  const shouldTriggerInvasion = useCallback(() => {
    return invasionPhaseRef.current === 'normal' && pendingBossLevelRef.current !== null;
  }, []);

  // Keyboard controls with Teddy abilities - stable event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
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
          activateTeddyAbility('supercharge');
        }
        e.preventDefault();
      }
      if (e.key === 'w' || e.key === 'W') {
        keysRef.current.w = true;
        if (teddyMeterRef.current >= TEDDY_METER_MAX && !teddyAbilityActiveRef.current) {
          activateTeddyAbility('barrier');
        }
        e.preventDefault();
      }
      if (e.key === 'e' || e.key === 'E') {
        keysRef.current.e = true;
        if (teddyMeterRef.current >= TEDDY_METER_MAX && !teddyAbilityActiveRef.current) {
          activateTeddyAbility('split');
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

      // Weapon selection: 1-5 keys to select weapon
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const weaponKeys = ['bubble_wand', 'gravity_anchor', 'prism_beam', 'vine_launcher', 'echo_pulse'];
        const weaponId = weaponKeys[parseInt(e.key) - 1];
        if (weaponAmmoRef.current[weaponId] > 0) {
          setActiveWeapon(prev => prev === weaponId ? null : weaponId);
        }
        e.preventDefault();
      }

      // Fire weapon: F key
      if (e.key === 'f' || e.key === 'F') {
        fireWeapon();
        e.preventDefault();
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
                const isCharged = power > 0.5;
                return {
                  ...ball,
                  x: currentPaddle.x + currentPaddle.width / 2, // Launch from paddle position
                  attached: false,
                  vy: -speed,
                  charged: isCharged,
                  chargedHits: isCharged ? 3 : 0, // 3 charged hits before wearing off
                  damage: isCharged ? 3 : 1, // Starts at 3x damage
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
  }, [activateTeddyAbility, fireWeapon]); // Minimal dependencies - refs handle the rest

  // Mouse/pointer control for paddle - smooth and responsive
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const handlePointerMove = (e) => {
      if (activeEffects.includes('frozen')) return;
      // Check for petrified debuff
      if (paddleDebuffs.petrified > 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // Account for any CSS scaling of the canvas
      const scaleX = CANVAS_WIDTH / rect.width;
      let mouseX = (e.clientX - rect.left) * scaleX;

      // Confusion reverses mouse position
      if (paddleDebuffs.confused > 0) {
        mouseX = CANVAS_WIDTH - mouseX;
      }

      // Calculate paddle position centered on pointer
      setPaddle(prev => {
        let targetX = Math.max(0, Math.min(CANVAS_WIDTH - prev.width, mouseX - prev.width / 2));

        // Webbed slows down movement (lerp instead of instant)
        if (paddleDebuffs.webbed > 0) {
          targetX = prev.x + (targetX - prev.x) * 0.3;
        }

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

    // Click/touch to launch ball or fire ship
    const handleClick = (e) => {
      // Prevent immediate launch when game starts (same click that started the game)
      if (Date.now() < launchDelayRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {

        // In invasion mode (shoot_alien or invasion phase), click fires the ship
        if (invasionPhaseRef.current === 'shoot_alien' || invasionPhaseRef.current === 'invasion') {
          keysRef.current.mouseDown = true;
          return;
        }

        // Launch attached ball on click - use paddle position
        const currentPaddle = paddleRef.current;
        if (!currentPaddle) return;

        // Check if this is a boss level that should trigger invasion
        if (shouldTriggerInvasion()) {
          // Launch ball normally first, then trigger invasion
          setBalls(prev => prev.map(ball => {
            if (ball.attached) {
              return {
                ...ball,
                x: currentPaddle.x + currentPaddle.width / 2,
                attached: false,
                vy: -ball.baseSpeed,
                vx: 0, // Straight up so alien can intercept
              };
            }
            return ball;
          }));
          // Trigger invasion after a short delay
          setTimeout(() => triggerInvasionSequence(), 800);
          return;
        }

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

    // Mouse up to stop firing
    const handleMouseUp = () => {
      keysRef.current.mouseDown = false;
    };

    // Mouse down for continuous fire
    const handleMouseDown = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        if (invasionPhaseRef.current === 'shoot_alien' || invasionPhaseRef.current === 'invasion') {
          keysRef.current.mouseDown = true;
        }
      }
    };

    // Use both mouse and pointer events for maximum compatibility
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support for mobile and some trackpads
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleClick, { passive: true });
      canvas.addEventListener('touchend', handleMouseUp, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', handleClick);
        canvas.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, [gameState, isPaused, activeEffects, paddleDebuffs, shouldTriggerInvasion, triggerInvasionSequence]);

  // Teddy Ability activation
  const activateTeddyAbility = useCallback((ability) => {
    setTeddyMeter(0);
    setTeddyAbilityActive(ability);
    setFlashColor('#ffd700');
    setTimeout(() => setFlashColor(null), 200);

    switch (ability) {
      case 'supercharge':
        // Next ball hit does 3x damage and breaks through 3 bricks in a line
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'SUPERCHARGE!', '#ffd700');
        setTimeout(() => setTeddyAbilityActive(null), 10000); // 10s to use it
        break;
      case 'barrier':
        // 5-second invincible bottom
        setActiveEffects(e => [...e, 'teddy_barrier']);
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'BARRIER!', '#4080ff');
        setTimeout(() => {
          setActiveEffects(e => e.filter(ef => ef !== 'teddy_barrier'));
          setTeddyAbilityActive(null);
        }, 5000);
        break;
      case 'split':
        // Paddle splits into two for 10 seconds
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'SPLIT!', '#ff80ff');
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
        let health, type, color, specificPowerUp = null;

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
          case '*': // Random power-up brick
            health = 1 + healthBonus;
            type = 'powerup';
            break;
          case 'X': // Explosive brick
            health = 1;
            type = 'explosive';
            break;
          case 'F': // Frozen brick - must crack ice first, then destroy
            health = 2;
            type = 'frozen';
            break;
          case 'P': // sPlit brick - breaks into 4 mini-bricks
            health = 1;
            type = 'split';
            break;
          case 'E': // Enemy spawner - spawns enemies when hit, distinct look
            health = 3 + Math.floor(healthBonus / 2); // Contains this many enemies
            type = 'spawner';
            break;
          // === SPECIFIC POWERUP BRICKS ===
          case 'e': // Expand powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'expand';
            break;
          case 'k': // shrinK powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'shrink';
            break;
          case 'm': // Multi-ball powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'multi';
            break;
          case 'f': // Fast powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'fast';
            break;
          case 's': // Slow powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'slow';
            break;
          case 'l': // Life powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'life';
            break;
          case 'z': // laZer powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'laser';
            break;
          case 'h': // sHield powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'shield';
            break;
          case 'g': // maGnet powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'magnet';
            break;
          case 'M': // Mega ball powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'mega';
            break;
          case 'w': // Warp powerup brick
            health = 1 + healthBonus;
            type = 'powerup_specific';
            specificPowerUp = 'warp';
            break;
          // === WEAPON BRICKS ===
          case 'B': // Bubble Wand weapon brick
            health = 2 + healthBonus;
            type = 'weapon';
            specificPowerUp = 'weapon_bubble';
            break;
          case 'A': // gravity Anchor weapon brick
            health = 2 + healthBonus;
            type = 'weapon';
            specificPowerUp = 'weapon_anchor';
            break;
          case 'R': // pRism beam weapon brick
            health = 2 + healthBonus;
            type = 'weapon';
            specificPowerUp = 'weapon_prism';
            break;
          case 'V': // Vine launcher weapon brick
            health = 2 + healthBonus;
            type = 'weapon';
            specificPowerUp = 'weapon_vine';
            break;
          case 'W': // echo Wave weapon brick
            health = 2 + healthBonus;
            type = 'weapon';
            specificPowerUp = 'weapon_echo';
            break;
          default:
            continue; // Unknown character, skip
        }

        // Cap health
        health = Math.min(health, 12);

        // Determine color based on type and specific powerup
        if (type === 'obstacle') {
          color = '#2a2a4e';
        } else if (type === 'explosive') {
          color = '#ff4400';
        } else if (type === 'powerup') {
          color = '#ffd700';
        } else if (type === 'powerup_specific' && specificPowerUp && powerUpTypes[specificPowerUp]) {
          color = powerUpTypes[specificPowerUp].color;
        } else if (type === 'weapon' && specificPowerUp && powerUpTypes[specificPowerUp]) {
          color = powerUpTypes[specificPowerUp].color;
        } else if (type === 'frozen') {
          color = '#88ddff'; // Icy blue
        } else if (type === 'split') {
          color = '#aa66cc'; // Purple
        } else if (type === 'spawner') {
          color = '#44aa44'; // Green (enemy color)
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
          // New brick type properties
          cracked: false, // For frozen bricks - becomes true after first hit
          enemiesRemaining: type === 'spawner' ? health : 0, // For spawner bricks
          // Specific powerup for powerup_specific and weapon types
          specificPowerUp: specificPowerUp,
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
  const MAX_PARTICLE_AGE = 4000; // 4 seconds max lifetime as backup

  const createParticles = useCallback((x, y, color, count = 8) => {
    const now = Date.now();
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: now + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        color,
        size: 3 + Math.random() * 4,
        life: 1,
        createdAt: now,
      });
    }
    setParticles(p => [...p, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Create paddle bounce particles - sparkly, reflects paddle state
  const createPaddleBounceParticles = useCallback((x, y, paddleColor, count = 6) => {
    const now = Date.now();
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      // Mix paddle color with white for sparkle effect
      const colors = [paddleColor, '#ffffff', paddleColor, '#ffff88'];
      newParticles.push({
        id: now + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 2, // Go upward
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
        life: 0.8,
        createdAt: now,
        isSparkle: true,
      });
    }
    setParticles(p => [...p, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Create brick shatter particles - a satisfying puff, but not over the top
  const createBrickShatterParticles = useCallback((x, y, width, height, color) => {
    const now = Date.now();
    const newParticles = [];

    // A nice puff of particles - visible but not dramatic
    const particleCount = 8 + Math.floor(Math.random() * 5); // 8-12 particles
    for (let i = 0; i < particleCount; i++) {
      const spawnX = x + (Math.random() - 0.5) * width * 0.7;
      const spawnY = y + (Math.random() - 0.5) * height * 0.7;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      newParticles.push({
        id: now + Math.random(),
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // Slight upward drift
        color,
        size: 2 + Math.random() * 2.5, // Small but visible
        life: 0.4 + Math.random() * 0.3, // Visible puff
        createdAt: now,
        isDissolve: true,
      });
    }
    setParticles(p => [...p, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Create cracking armor particles - chunky jagged pieces
  const createCrackingParticles = useCallback((x, y, width, height, color, crackPattern = []) => {
    const now = Date.now();
    const newParticles = [];
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Generate a random asymmetric jagged polygon
    const randomJaggedPoly = () => {
      // 5-7 points, irregularly placed
      const numPoints = 5 + Math.floor(Math.random() * 3);
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints + (Math.random() - 0.5) * 0.8;
        const radius = 30 + Math.random() * 20; // Vary the radius for jagged look
        points.push({
          x: 50 + Math.cos(angle) * radius,
          y: 50 + Math.sin(angle) * radius,
        });
      }
      return `polygon(${points.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
    };

    if (crackPattern.length > 0) {
      // Create 4-7 chunky pieces
      const numPieces = 4 + Math.floor(Math.random() * 4);

      // Gather all crack points to distribute pieces along them
      const allPoints = [];
      crackPattern.forEach(crack => {
        if (crack.points) {
          crack.points.forEach(p => allPoints.push(p));
        }
      });

      // Pick evenly spaced points for our pieces
      for (let i = 0; i < numPieces; i++) {
        const pointIdx = Math.floor((i / numPieces) * allPoints.length);
        const pt = allPoints[pointIdx] || { x: 50, y: 50 };

        const pieceX = x + (pt.x / 100) * width;
        const pieceY = y + (pt.y / 100) * height;

        // Direction from brick center
        const dx = pieceX - centerX;
        const dy = pieceY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 1.2 + Math.random() * 1.3; // Slower, heavier feel

        newParticles.push({
          id: now + Math.random() + i,
          x: pieceX,
          y: pieceY,
          vx: (dx / dist) * speed + (Math.random() - 0.5) * 1.2,
          vy: (dy / dist) * speed - 0.3, // Minimal upward, gravity takes over
          color,
          size: 22 + Math.random() * 16, // Bigger: 22-38px
          life: 1.8,
          createdAt: now,
          isArmorShard: true,
          clipPath: randomJaggedPoly(),
          rotation: Math.random() * 40 - 20,
          rotationSpeed: (Math.random() - 0.5) * 10, // Slower rotation
          gravity: 0.5, // Very heavy
        });
      }

      // Just a few tiny debris particles (not many)
      for (let i = 0; i < 3; i++) {
        const pt = allPoints[Math.floor(Math.random() * allPoints.length)] || { x: 50, y: 50 };
        newParticles.push({
          id: now + Math.random() + 1000 + i,
          x: x + (pt.x / 100) * width + (Math.random() - 0.5) * 10,
          y: y + (pt.y / 100) * height + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 3,
          vy: -0.5 + Math.random(),
          color: '#666666',
          size: 2 + Math.random() * 2,
          life: 0.5,
          createdAt: now,
        });
      }

    } else {
      // Fallback: 4-7 chunky random pieces
      const numPieces = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numPieces; i++) {
        const angle = (Math.PI * 2 * i) / numPieces + Math.random() * 0.5;
        const spawnDist = Math.min(width, height) * 0.25;
        const spawnX = centerX + Math.cos(angle) * spawnDist;
        const spawnY = centerY + Math.sin(angle) * spawnDist;
        const speed = 1.2 + Math.random() * 1.3;

        newParticles.push({
          id: now + Math.random() + i,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          color,
          size: 22 + Math.random() * 16,
          life: 1.8,
          createdAt: now,
          isArmorShard: true,
          clipPath: randomJaggedPoly(),
          rotation: Math.random() * 40 - 20,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.5,
        });
      }
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

  // Spawn a specific powerup (from specific powerup bricks or weapon bricks)
  const spawnSpecificPowerUp = useCallback((x, y, powerUpId) => {
    const puType = powerUpTypes[powerUpId];
    if (!puType) return;

    setPowerUps(prev => [...prev, {
      id: Date.now() + Math.random(),
      x, y,
      type: powerUpId,
      vy: 2,
      ...puType,
    }]);
  }, []);

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

    // CRITICAL: Reset lastTimeRef when game loop starts to avoid huge deltaTime
    // on first frame (which would cause ball to fly across screen instantly)
    lastTimeRef.current = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      // Cap deltaTime to prevent physics explosions if tab was backgrounded
      const deltaTime = Math.min(3.0, (now - lastTimeRef.current) / 16.67); // Normalize to ~60fps, cap at 3 frames
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
      // Check for enemy debuffs
      const isPetrified = paddleDebuffs.petrified > 0;
      const isConfused = paddleDebuffs.confused > 0;
      const isWebbed = paddleDebuffs.webbed > 0;

      if (!activeEffects.includes('frozen') && !isPetrified) {
        const currentPaddle = paddleRef.current;
        // Confusion reverses controls
        const leftPressed = isConfused ? keysRef.current.right : keysRef.current.left;
        const rightPressed = isConfused ? keysRef.current.left : keysRef.current.right;

        if (leftPressed || rightPressed) {
          // Direct movement - constant speed, immediate response
          let speed = isDashing ? DASH_SPEED : keysRef.current.shift ? 24 : KEYBOARD_SPEED;
          // Webbed reduces speed by 60%
          if (isWebbed) speed *= 0.4;

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

      // === INVASION SEQUENCE PHASES ===
      if (invasionPhase !== 'normal' && invasionPhase !== 'invasion') {
        setInvasionTimer(t => t + deltaTime);

        // Phase: ball_grabbed - Alien flying in to grab the ball
        if (invasionPhase === 'ball_grabbed' && ballGrabber) {
          setBallGrabber(prev => {
            if (!prev) return null;
            let grabber = { ...prev };

            if (grabber.phase === 'flying_in') {
              // Fly toward center-top of screen
              const dx = grabber.targetX - grabber.x;
              const dy = grabber.targetY - grabber.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const speed = 8;

              if (dist < speed * deltaTime) {
                grabber.x = grabber.targetX;
                grabber.y = grabber.targetY;
                grabber.phase = 'grabbing';
              } else {
                grabber.x += (dx / dist) * speed * deltaTime;
                grabber.y += (dy / dist) * speed * deltaTime;
              }
            } else if (grabber.phase === 'grabbing') {
              // Find and grab the ball
              const ball = ballsRef.current[0];
              if (ball) {
                const dx = ball.x - grabber.x;
                const dy = ball.y - grabber.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 40 || grabber.hasBall) {
                  grabber.hasBall = true;
                  // Move ball with grabber
                  setBalls(prev => prev.map(b => ({
                    ...b,
                    x: grabber.x,
                    y: grabber.y + 20,
                    vx: 0,
                    vy: 0,
                    attached: false,
                    grabbedByAlien: true,
                  })));

                  // After grabbing, show alert
                  if (invasionTimer > 60) {
                    setInvasionPhase('alert');
                    setInvasionTimer(0);
                  }
                } else {
                  // Chase the ball
                  grabber.x += (dx / dist) * 6 * deltaTime;
                  grabber.y += (dy / dist) * 6 * deltaTime;
                }
              }
            }

            return grabber;
          });
        }

        // Phase: alert - Show UH OH! alert
        if (invasionPhase === 'alert') {
          if (invasionTimer > 100) { // Show alert for ~1.7 seconds
            setInvasionPhase('paddle_transform');
            setInvasionTimer(0);
            setPaddleTransformProgress(0);
          }
        }

        // Phase: paddle_transform - Animated paddle-to-ship transformation
        if (invasionPhase === 'paddle_transform') {
          // Animate paddle transformation over ~1.5 seconds (90 frames)
          setPaddleTransformProgress(p => {
            const newProgress = Math.min(1, p + 0.018 * deltaTime);
            if (newProgress >= 1) {
              // Transformation complete - enter shoot_alien phase
              setInvasionPhase('shoot_alien');
              setInvasionTimer(0);
              setInvasionMode(true);
              addFloatingText(
                paddleRef.current.x + paddleRef.current.width / 2,
                CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 40,
                '⚔️ ARMED!',
                '#60ff80'
              );
              // Flash effect
              setFlashColor('#60ff80');
              setTimeout(() => setFlashColor(null), 150);
            }
            return newProgress;
          });
        }

        // Phase: shoot_alien - Player must shoot the alien to free the ball
        if (invasionPhase === 'shoot_alien') {
          // Ship fires projectiles when space or mouse is pressed
          const isFiring = keysRef.current.space || keysRef.current.mouseDown;
          if (isFiring && now - lastShipFire > SHIP_FIRE_COOLDOWN) {
            const currentPaddle = paddleRef.current;
            // Create twin projectiles for more dramatic effect
            setShipProjectiles(prev => [
              ...prev,
              {
                id: now + Math.random(),
                x: currentPaddle.x + currentPaddle.width / 2 - 8,
                y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20,
                speed: 14,
              },
              {
                id: now + Math.random() + 0.1,
                x: currentPaddle.x + currentPaddle.width / 2 + 8,
                y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20,
                speed: 14,
              }
            ]);
            setLastShipFire(now);
            // Visual feedback - small flash
            createParticles(
              currentPaddle.x + currentPaddle.width / 2,
              CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 15,
              '#80ffff',
              3
            );
          }

          // Move projectiles upward
          setShipProjectiles(prev => prev
            .map(p => ({ ...p, y: p.y - p.speed * deltaTime }))
            .filter(p => p.y > -20)
          );

          // Check if projectiles hit the ball grabber
          if (ballGrabber) {
            setShipProjectiles(prevProj => {
              let hit = false;
              const remaining = prevProj.filter(p => {
                const dx = p.x - ballGrabber.x;
                const dy = p.y - ballGrabber.y;
                if (Math.sqrt(dx * dx + dy * dy) < 40) {
                  hit = true;
                  return false;
                }
                return true;
              });

              if (hit) {
                setBallGrabber(prev => {
                  if (!prev) return null;
                  const newHealth = prev.health - 1;
                  if (newHealth <= 0) {
                    // Alien destroyed! Free the ball
                    setInvasionPhase('transform');
                    setInvasionTimer(0);
                    setTransformProgress(0);
                    // Release ball back to paddle
                    setBalls(prev => prev.map(b => ({
                      ...b,
                      x: paddleRef.current.x + paddleRef.current.width / 2,
                      y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20,
                      vx: 0,
                      vy: 0,
                      attached: true,
                      grabbedByAlien: false,
                    })));
                    createParticles(prev.x, prev.y, prev.color, 20);
                    addFloatingText(prev.x, prev.y, 'FREED!', '#44ff44');
                    return null;
                  }
                  createParticles(prev.x, prev.y, prev.color, 8);
                  return { ...prev, health: newHealth, hitTimer: 10 };
                });
              }

              return remaining;
            });

            // Update hit timer
            setBallGrabber(prev => {
              if (!prev) return null;
              return { ...prev, hitTimer: Math.max(0, prev.hitTimer - deltaTime) };
            });

            // Move ball with grabber
            if (ballGrabber.hasBall) {
              // Alien moves erratically while being shot at
              setBallGrabber(prev => {
                if (!prev) return null;
                const wobbleX = Math.sin(now * 0.01) * 2;
                const wobbleY = Math.cos(now * 0.008) * 1;
                return {
                  ...prev,
                  x: Math.max(50, Math.min(CANVAS_WIDTH - 50, prev.x + wobbleX)),
                  y: Math.max(80, Math.min(250, prev.y + wobbleY)),
                };
              });
              setBalls(prev => prev.map(b => ({
                ...b,
                x: ballGrabber.x,
                y: ballGrabber.y + 25,
              })));
            }
          }
        }

        // Phase: transform - Bricks transform into aliens with morphing animation
        if (invasionPhase === 'transform') {
          // Update brick morph progress (slower for dramatic effect)
          setBrickMorphProgress(p => {
            const newProgress = Math.min(1, p + 0.015 * deltaTime);
            return newProgress;
          });
          setTransformProgress(p => Math.min(1, p + 0.015 * deltaTime));

          // Add wobble/shake to existing bricks during transformation
          if (transformProgress > 0.3 && transformProgress < 0.9) {
            setBricks(prev => prev.map((brick, i) => ({
              ...brick,
              morphWobble: Math.sin(now * 0.02 + i * 0.5) * 3 * (1 - Math.abs(transformProgress - 0.6) / 0.3),
            })));
          }

          if (transformProgress >= 1) {
            // Transform complete - create invasion bricks
            setBricks(createInvasionBricks(pendingBossLevel, selectedEnemy));
            setInvasionPhase('invasion');
            setInvasionTimer(0);
            setBrickMorphProgress(0);
            // Ball stays attached, player can launch it
            addFloatingText(CANVAS_WIDTH / 2, 100, '🛸 INVASION! 🛸', '#ff6644');
            setFlashColor('#ff6644');
            setTimeout(() => setFlashColor(null), 200);
          }
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // === INVASION MODE LOGIC ===
      if (invasionMode && invasionPhase === 'invasion') {
        // Ship fires projectiles when space or mouse is pressed
        const isFiring = keysRef.current.space || keysRef.current.mouseDown;
        if (isFiring && now - lastShipFire > SHIP_FIRE_COOLDOWN) {
          const currentPaddle = paddleRef.current;
          // Twin projectiles for better firepower
          setShipProjectiles(prev => [
            ...prev,
            {
              id: now + Math.random(),
              x: currentPaddle.x + currentPaddle.width / 2 - 8,
              y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20,
              speed: 14,
            },
            {
              id: now + Math.random() + 0.1,
              x: currentPaddle.x + currentPaddle.width / 2 + 8,
              y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20,
              speed: 14,
            }
          ]);
          setLastShipFire(now);
          // Visual feedback
          createParticles(
            currentPaddle.x + currentPaddle.width / 2,
            CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 15,
            '#80ffff',
            3
          );
        }

        // Move projectiles upward
        setShipProjectiles(prev => prev
          .map(p => ({ ...p, y: p.y - p.speed * deltaTime }))
          .filter(p => p.y > -20)
        );

        // Move brickinoid formation (Space Invaders style)
        setInvasionFormation(prev => {
          let newOffsetX = prev.offsetX + prev.direction * prev.speed * deltaTime;
          let newDirection = prev.direction;
          let newDescend = prev.descendAmount;

          // Check if formation hit edges - need to reverse and descend
          const FORMATION_MARGIN = 30;
          if (newOffsetX > FORMATION_MARGIN || newOffsetX < -FORMATION_MARGIN) {
            newDirection = -prev.direction;
            newOffsetX = Math.max(-FORMATION_MARGIN, Math.min(FORMATION_MARGIN, newOffsetX));
            newDescend = prev.descendAmount + 8; // Descend a bit
          }

          return {
            ...prev,
            offsetX: newOffsetX,
            direction: newDirection,
            descendAmount: newDescend,
          };
        });

        // Check projectile-brick collisions
        setShipProjectiles(prevProjectiles => {
          let remainingProjectiles = [...prevProjectiles];

          setBricks(prevBricks => {
            return prevBricks.map(brick => {
              if (brick.health <= 0 || brick.type === 'obstacle') return brick;

              // Calculate brick position with formation offset
              const brickX = brick.x + invasionFormation.offsetX;
              const brickY = brick.y + invasionFormation.descendAmount;

              // Check each projectile
              for (let i = remainingProjectiles.length - 1; i >= 0; i--) {
                const proj = remainingProjectiles[i];
                if (
                  proj.x >= brickX &&
                  proj.x <= brickX + brick.width &&
                  proj.y >= brickY &&
                  proj.y <= brickY + brick.height
                ) {
                  // Hit! Remove projectile
                  remainingProjectiles.splice(i, 1);

                  // Damage brick
                  const newHealth = brick.health - 1;
                  const points = brick.type === 'gold' ? 50 : 10;
                  setScore(s => s + points);

                  // Create hit particles
                  createParticles(brickX + brick.width / 2, brickY + brick.height / 2, brick.color, 4);

                  if (newHealth <= 0) {
                    // Brick destroyed
                    createBrickShatterParticles(brickX, brickY, brick.width, brick.height, brick.color);
                    addFloatingText(brickX + brick.width / 2, brickY, `+${points}`, brick.color);

                    // Chance to drop power-up
                    if (Math.random() < 0.1) {
                      spawnPowerUp(brickX + brick.width / 2, brickY + brick.height / 2);
                    }
                  }

                  return { ...brick, health: newHealth, hitFlash: 1 };
                }
              }
              return brick;
            });
          });

          return remainingProjectiles;
        });

        // Check if invasion complete (all bricks destroyed)
        // This is handled in the normal level complete check below

        // Check if brickinoids reached the bottom (player loses)
        const lowestBrick = bricks.reduce((lowest, b) => {
          if (b.health <= 0 || b.type === 'obstacle') return lowest;
          const brickBottom = b.y + b.height + invasionFormation.descendAmount;
          return brickBottom > lowest ? brickBottom : lowest;
        }, 0);

        if (lowestBrick >= CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 20) {
          // Brickinoids reached the ship! Lose a life
          setLives(l => l - 1);
          setInvasionFormation(prev => ({ ...prev, descendAmount: 0 })); // Reset descent
          if (lives <= 1) {
            setGameState('gameover');
          }
        }

        // Skip normal ball physics in invasion mode
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
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

            // Calculate paddle color for particles based on health and effects
            const healthRatio = Math.min(1, (paddleSnapshot.width - 30) / 90);
            const paddleColor = activeEffects.includes('frozen') ? '#80e0ff'
              : activeEffects.includes('laser') ? '#ff60ff'
              : isDashing ? '#ffd700'
              : healthRatio < 0.33 ? '#ff6060'
              : healthRatio < 0.66 ? '#ffcc60'
              : '#60ff80';
            createPaddleBounceParticles(x, y, paddleColor, isDashing ? 10 : 6);

            // Dash hit bonus
            if (isDashing) {
              addFloatingText(x, y - 20, 'DASH HIT!', '#ffd700');
              setScore(s => s + 25);
            }
          }

          // Twin paddle collision (Teddy Split ability)
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
            // Check for teddy barrier (from ability)
            if (activeEffects.includes('teddy_barrier')) {
              ball.vy = -Math.abs(ball.vy);
              ball.y = CANVAS_HEIGHT - BALL_RADIUS;
              createParticles(ball.x, ball.y, '#ffd700', 15);
              addFloatingText(ball.x, ball.y - 20, 'SAVED!', '#ffd700');
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
            if (brick.health <= 0 || brick.dying) continue;
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

                // === FROZEN BRICK: First hit cracks ice, second hit destroys ===
                if (brick.type === 'frozen' && !brick.cracked) {
                  // First hit - crack the ice
                  createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#aaeeff', 10);
                  addFloatingText(brick.x + brick.width / 2, brick.y, '❄️ CRACK!', '#88ddff');
                  return { ...brick, cracked: true, hitFlash: 1 };
                }

                // === SPAWNER BRICK: Spawn enemy on each hit ===
                if (brick.type === 'spawner' && brick.enemiesRemaining > 0) {
                  // Spawn an enemy from this brick
                  const newEnemy = spawnEnemy();
                  if (newEnemy) {
                    // Spawn at brick position instead of random
                    newEnemy.x = brick.x + brick.width / 2 - newEnemy.width / 2;
                    newEnemy.y = brick.y + brick.height;
                    newEnemy.vy = Math.abs(newEnemy.vy); // Always move down initially
                    setEnemies(prev => [...prev, newEnemy]);
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#44aa44', 8);
                    addFloatingText(brick.x + brick.width / 2, brick.y, '👾', '#44aa44');
                  }
                  const remaining = brick.enemiesRemaining - 1;
                  if (remaining <= 0) {
                    // All enemies spawned, brick is destroyed
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#44aa44', 15);
                    setScore(s => s + 50);
                    return { ...brick, health: 0, enemiesRemaining: 0, hitFlash: 1 };
                  }
                  return { ...brick, enemiesRemaining: remaining, hitFlash: 1 };
                }

                // Calculate damage (Teddy Supercharge, charged shot, mega ball)
                let damage = ball.damage || 1;
                if (teddyAbilityActive === 'supercharge') {
                  damage = 3;
                  setTeddyAbilityActive(null); // Used up
                  addFloatingText(brick.x + brick.width/2, brick.y, 'SUPERCHARGE!', '#ffd700');
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

                // Armor cracking effect - when tier changes, show cracks THEN break
                let armorCracking = brick.armorCracking || false;
                let armorCrackTimer = brick.armorCrackTimer || 0;
                let pendingColor = brick.pendingColor;
                let crackPattern = brick.crackPattern || [];

                if (newHealth > 0 && newTier !== oldTier && brick.type !== 'boss' && brick.type !== 'explosive') {
                  // Start armor cracking animation - cracks appear first
                  armorCracking = true;
                  armorCrackTimer = 1; // Will count down
                  pendingColor = newColor; // Color to change to after crack animation

                  // Generate earthquake-style crack pattern - can mix both types:
                  // Through-cracks: edge to edge cracks
                  // Nexus cracks: multiple cracks meeting at a point
                  // A brick can have: just throughs, just nexus, or both!
                  crackPattern = [];

                  // Helper to create jagged path between two points
                  const createJaggedPath = (startX, startY, endX, endY) => {
                    const points = [{ x: startX, y: startY }];
                    const numSegments = 3 + Math.floor(Math.random() * 2);
                    for (let j = 1; j < numSegments; j++) {
                      const t = j / numSegments;
                      const baseX = startX + (endX - startX) * t;
                      const baseY = startY + (endY - startY) * t;
                      const jitter = 12;
                      points.push({
                        x: Math.max(0, Math.min(100, baseX + (Math.random() - 0.5) * jitter)),
                        y: Math.max(0, Math.min(100, baseY + (Math.random() - 0.5) * jitter)),
                      });
                    }
                    points.push({ x: endX, y: endY });
                    return points;
                  };

                  // Get random point on edge (0=top, 1=right, 2=bottom, 3=left)
                  const getEdgePoint = (edge) => {
                    if (edge === 0) return { x: 15 + Math.random() * 70, y: 0 };
                    if (edge === 1) return { x: 100, y: 15 + Math.random() * 70 };
                    if (edge === 2) return { x: 15 + Math.random() * 70, y: 100 };
                    return { x: 0, y: 15 + Math.random() * 70 };
                  };

                  // Decide how many of each type (can have both!)
                  // 60% chance for through-cracks, 60% chance for nexus - often get both
                  const hasThroughCracks = Math.random() < 0.6;
                  const hasNexusCracks = Math.random() < 0.6;

                  // Ensure at least one type
                  const finalHasThrough = hasThroughCracks || !hasNexusCracks;
                  const finalHasNexus = hasNexusCracks || !hasThroughCracks;

                  // Add through-cracks (0-2 cracks going edge to edge)
                  if (finalHasThrough) {
                    const numThroughCracks = 1 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numThroughCracks; i++) {
                      const startEdge = Math.floor(Math.random() * 4);
                      let endEdge = (startEdge + 2) % 4; // Prefer opposite
                      if (Math.random() < 0.3) endEdge = (startEdge + 1) % 4; // Sometimes adjacent

                      const start = getEdgePoint(startEdge);
                      const end = getEdgePoint(endEdge);
                      crackPattern.push({ points: createJaggedPath(start.x, start.y, end.x, end.y) });
                    }
                  }

                  // Add nexus cracks (2-4 cracks meeting at a central point)
                  if (finalHasNexus) {
                    const nexusX = 25 + Math.random() * 50;
                    const nexusY = 25 + Math.random() * 50;
                    const numNexusCracks = 2 + Math.floor(Math.random() * 3);
                    const usedEdges = [];

                    for (let i = 0; i < numNexusCracks; i++) {
                      let edge;
                      if (usedEdges.length < 4) {
                        do { edge = Math.floor(Math.random() * 4); } while (usedEdges.includes(edge));
                        usedEdges.push(edge);
                      } else {
                        edge = Math.floor(Math.random() * 4);
                      }

                      const edgePoint = getEdgePoint(edge);
                      crackPattern.push({ points: createJaggedPath(edgePoint.x, edgePoint.y, nexusX, nexusY) });
                    }
                  }

                  // Small score bonus for cracking armor
                  setScore(s => s + 5);
                }

                // Charged shot bonus - decrement chargedHits and adjust damage
                if (ball.charged && ball.chargedHits > 0 && !usedChargedBonus) {
                  setScore(s => s + points * 0.5);
                  usedChargedBonus = true;
                }

                // Build Teddy Meter on brick hits
                const meterGain = (brick.type === 'boss' ? 3 : 1) * (1 + stats.upgrades.teddyPower * 0.1);
                setTeddyMeter(prev => Math.min(TEDDY_METER_MAX, prev + meterGain));

                if (newHealth <= 0) {
                  // Brick destroyed - quick pop then gone
                  setScore(s => s + points * (1 + combo * 0.1));
                  setCombo(c => {
                    const newCombo = c + 1;
                    if (newCombo > maxCombo) setMaxCombo(newCombo);
                    return newCombo;
                  });

                  // Reset combo timer
                  if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
                  comboTimerRef.current = setTimeout(() => setCombo(0), 2000);

                  // Create shatter particles
                  createBrickShatterParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.width, brick.height, oldColor);
                  addFloatingText(brick.x + brick.width / 2, brick.y, `+${Math.floor(points * (1 + combo * 0.1))}`, oldColor);

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

                  // === SPLIT BRICK: Break into 4 mini-bricks ===
                  if (brick.type === 'split') {
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#aa66cc', 12);
                    addFloatingText(brick.x + brick.width / 2, brick.y, '💔 SPLIT!', '#aa66cc');

                    // Create 4 mini-bricks in a 2x2 grid
                    const miniWidth = brick.width / 2 - 2;
                    const miniHeight = brick.height / 2 - 2;
                    const miniColor = '#cc88ee';
                    const miniBricks = [
                      { x: brick.x, y: brick.y }, // Top-left
                      { x: brick.x + brick.width / 2, y: brick.y }, // Top-right
                      { x: brick.x, y: brick.y + brick.height / 2 }, // Bottom-left
                      { x: brick.x + brick.width / 2, y: brick.y + brick.height / 2 }, // Bottom-right
                    ].map((pos, i) => ({
                      id: `${brick.id}-mini-${i}`,
                      x: pos.x,
                      y: pos.y,
                      width: miniWidth,
                      height: miniHeight,
                      health: 1,
                      maxHealth: 1,
                      type: 'mini',
                      color: miniColor,
                      invisible: false,
                      canRegenerate: false,
                      cracked: false,
                      enemiesRemaining: 0,
                    }));

                    // Add mini-bricks to the game
                    setBricks(allBricks => [...allBricks, ...miniBricks]);
                  }

                  // Spawn power-up (5% base chance, powerup bricks always drop)
                  if (brick.type === 'powerup' || Math.random() < 0.05) {
                    spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                  }
                  // Spawn specific powerup from powerup_specific bricks
                  if (brick.type === 'powerup_specific' && brick.specificPowerUp) {
                    spawnSpecificPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.specificPowerUp);
                  }
                  // Spawn weapon from weapon bricks
                  if (brick.type === 'weapon' && brick.specificPowerUp) {
                    spawnSpecificPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.specificPowerUp);
                  }
                }

                // Update brick state
                return {
                  ...brick,
                  health: newHealth,
                  hitFlash: 1,
                  invisible: false,
                  // Armor cracking state - cracks show, then armor breaks off
                  armorCracking,
                  armorCrackTimer,
                  pendingColor,
                  crackPattern,
                  // Dying state - quick pop animation
                  dying: newHealth <= 0,
                  deathTimer: newHealth <= 0 ? 1.0 : undefined, // Death animation
                  deathColor: newHealth <= 0 ? oldColor : undefined,
                  // Don't change color if armor is cracking (will change when crack finishes)
                  color: brick.type === 'boss' ? '#ffd700' :
                         brick.type === 'explosive' ? '#ff4400' :
                         armorCracking ? oldColor : newColor
                };
              });
            });
          }

          // Handle charged shot degradation
          let newChargedHits = ball.chargedHits || 0;
          let newCharged = ball.charged;
          let newDamage = ball.damage || 1;

          if (usedChargedBonus && ball.charged) {
            newChargedHits = Math.max(0, newChargedHits - 1);
            // Damage decreases: 3 -> 2 -> 1 -> 1 (based on hits remaining)
            newDamage = newChargedHits > 0 ? newChargedHits : 1;
            // Charged status ends when hits run out
            newCharged = newChargedHits > 0;
          }

          return { ...ball, x, y, vx, vy, charged: newCharged, chargedHits: newChargedHits, damage: newDamage };
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

      // Update particles (uses 'now' from top of game loop for age check)
      setParticles(prev => prev
        .map(p => {
          // Different gravity for different particle types
          const gravity = p.isArmorShard ? (p.gravity || 0.15)
            : p.isDissolve ? 0.02  // Very gentle
            : p.isSparkle ? 0.1
            : 0.3;

          // Different life decay rates
          const lifeDecay = p.isArmorShard ? 0.018
            : p.isDissolve ? 0.04
            : 0.025;

          return {
            ...p,
            x: p.x + p.vx * deltaTime,
            y: p.y + p.vy * deltaTime,
            vx: p.isArmorShard ? p.vx * 0.99 : p.vx, // Air resistance for armor
            vy: p.vy + gravity * deltaTime,
            life: p.life - lifeDecay * deltaTime,
            rotation: p.rotationSpeed ? (p.rotation || 0) + p.rotationSpeed * deltaTime : p.rotation,
          };
        })
        .filter(p => p.life > 0 && (now - (p.createdAt || 0)) < MAX_PARTICLE_AGE)
      );

      // Update floating texts
      setFloatingTexts(prev => prev
        .map(t => ({ ...t, y: t.y - 1 * deltaTime, life: t.life - 0.02 * deltaTime }))
        .filter(t => t.life > 0)
      );

      // === UPDATE WEAPON PROJECTILES ===
      setWeaponProjectiles(prev => {
        const updatedProjectiles = [];
        const currentBricks = bricksRef.current;

        prev.forEach(proj => {
          let p = { ...proj };

          // Movement based on type
          if (p.type === 'bubble_wand') {
            // Bubbles float up with wavy motion
            p.y += p.vy * deltaTime;
            p.x += Math.sin((p.wobblePhase || 0) + p.y * 0.05) * 0.5;
            p.life -= 0.005 * deltaTime;

            // Check collision with bricks
            currentBricks.forEach(brick => {
              if (brick.health > 0 && brick.type !== 'obstacle') {
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                const dist = Math.sqrt((p.x - brickCenterX) ** 2 + (p.y - brickCenterY) ** 2);
                if (dist < (p.size || 15) + 20) {
                  // Pop! Damage brick
                  setBricks(allBricks => allBricks.map(b =>
                    b.id === brick.id ? { ...b, health: b.health - (p.damage || 1), hitFlash: 1 } : b
                  ));
                  createParticles(p.x, p.y, p.color, 6);
                  p.life = 0;
                }
              }
            });
          } else if (p.type === 'gravity_anchor') {
            // Gravity anchor stays in place and pulls bricks
            p.duration = (p.duration || 180) - deltaTime;
            p.life = p.duration > 0 ? 1 : 0;

            // Pull nearby bricks down (damage them)
            if (p.duration > 0 && p.duration % 30 < deltaTime) {
              currentBricks.forEach(brick => {
                if (brick.health > 0 && brick.type !== 'obstacle') {
                  const dist = Math.sqrt((p.x - (brick.x + brick.width/2)) ** 2 + (p.y - (brick.y + brick.height/2)) ** 2);
                  if (dist < (p.gravityRadius || 120)) {
                    setBricks(allBricks => allBricks.map(b =>
                      b.id === brick.id ? { ...b, health: b.health - (p.damage || 1), hitFlash: 1 } : b
                    ));
                    createParticles(brick.x + brick.width/2, brick.y + brick.height/2, '#4a6fa5', 3);
                  }
                }
              });
            }
          } else if (p.type === 'prism_beam') {
            // Beam travels fast, splits on obstacles
            p.y += p.vy * deltaTime;
            p.life -= 0.008 * deltaTime;

            // Check collision with bricks
            currentBricks.forEach(brick => {
              if (brick.health > 0) {
                if (p.x > brick.x && p.x < brick.x + brick.width &&
                    p.y > brick.y && p.y < brick.y + brick.height) {
                  if (brick.type === 'obstacle' && p.splits > 0) {
                    // Split into two beams going diagonally
                    updatedProjectiles.push({
                      ...p,
                      id: Date.now() + Math.random(),
                      vx: -4,
                      vy: p.vy,
                      splits: p.splits - 1,
                    });
                    updatedProjectiles.push({
                      ...p,
                      id: Date.now() + Math.random() + 1,
                      vx: 4,
                      vy: p.vy,
                      splits: p.splits - 1,
                    });
                    p.life = 0;
                  } else {
                    setBricks(allBricks => allBricks.map(b =>
                      b.id === brick.id ? { ...b, health: b.health - (p.damage || 1), hitFlash: 1 } : b
                    ));
                    createParticles(p.x, p.y, '#ff88ff', 5);
                  }
                }
              }
            });

            p.x += (p.vx || 0) * deltaTime;
          } else if (p.type === 'vine_launcher') {
            // Vine travels up, spreads on hit
            p.y += p.vy * deltaTime;
            p.life -= 0.006 * deltaTime;

            currentBricks.forEach(brick => {
              if (brick.health > 0 && brick.type !== 'obstacle') {
                if (p.x > brick.x && p.x < brick.x + brick.width &&
                    p.y > brick.y && p.y < brick.y + brick.height) {
                  // Hit! Damage and spread
                  setBricks(allBricks => {
                    const newBricks = allBricks.map(b => {
                      if (b.id === brick.id) {
                        return { ...b, health: b.health - (p.damage || 1), hitFlash: 1, vineMarked: true };
                      }
                      // Spread to adjacent bricks
                      const dx = Math.abs((b.x + b.width/2) - (brick.x + brick.width/2));
                      const dy = Math.abs((b.y + b.height/2) - (brick.y + brick.height/2));
                      if (dx < 80 && dy < 40 && b.health > 0 && b.type !== 'obstacle' && !b.vineMarked) {
                        return { ...b, health: b.health - 1, hitFlash: 1, vineMarked: true };
                      }
                      return b;
                    });
                    return newBricks;
                  });
                  createParticles(p.x, p.y, '#44aa44', 8);
                  p.life = 0;
                }
              }
            });
          } else if (p.type === 'echo_pulse') {
            // Wave moves up, damages all bricks it touches
            p.y += p.vy * deltaTime;
            p.life -= 0.008 * deltaTime;

            currentBricks.forEach(brick => {
              if (brick.health > 0 && brick.type !== 'obstacle') {
                if (brick.y + brick.height > p.y - 15 && brick.y < p.y + 15) {
                  setBricks(allBricks => allBricks.map(b =>
                    b.id === brick.id && !b.echoHit ? { ...b, health: b.health - (p.damage || 1), hitFlash: 1, echoHit: true } : b
                  ));
                }
              }
            });
          }

          // Keep projectile if still alive and on screen
          if (p.life > 0 && p.y > -50 && p.y < CANVAS_HEIGHT + 50) {
            updatedProjectiles.push(p);
          }
        });

        return updatedProjectiles;
      });

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

      // Decay brick hit flash, armor cracking, and death animations
      setBricks(prev => prev
        .map(b => {
          let updated = b;
          // Decay hit flash
          if (b.hitFlash > 0) {
            updated = { ...updated, hitFlash: b.hitFlash - 0.15 * deltaTime };
          }
          // Decay armor crack timer - when done, armor breaks off
          if (b.armorCracking && b.armorCrackTimer > 0) {
            const newTimer = b.armorCrackTimer - 0.04 * deltaTime;
            if (newTimer <= 0) {
              // Armor crack animation complete - break off the armor pieces along crack lines
              createCrackingParticles(b.x, b.y, b.width, b.height, b.color, b.crackPattern);
              updated = {
                ...updated,
                armorCracking: false,
                armorCrackTimer: 0,
                crackPattern: [], // Clear cracks for fresh layer
                color: b.pendingColor || b.color,
                pendingColor: undefined,
              };
            } else {
              updated = { ...updated, armorCrackTimer: newTimer };
            }
          }
          // Decay death timer for dying bricks - fast and punchy
          if (b.dying && b.deathTimer > 0) {
            updated = { ...updated, deathTimer: b.deathTimer - 0.12 * deltaTime };
          }
          return updated;
        })
        // Filter out fully dead bricks (death animation complete)
        .filter(b => !b.dying || b.deathTimer > 0)
      );

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
              const sprite = ENEMY_SPRITES[enemy.type];

              // Tarrasque reflects balls back with extra force
              if (enemy.special === 'reflect') {
                ball.vx = -ball.vx * 1.5;
                ball.vy = -ball.vy * 1.5;
                addFloatingText(enemy.x + enemy.width/2, enemy.y, '🛡️ REFLECT!', '#ffaa00');
                createParticles(ball.x, ball.y, '#ffdd44', 8);
                // Tarrasque takes reduced damage
                damageEnemy(enemy.id, Math.max(1, (ball.damage || 1) - 1));
              }
              // Gelatinous Cube absorbs ball temporarily
              else if (enemy.special === 'absorb' && !ball.absorbed) {
                ball.absorbed = true;
                ball.absorbedBy = enemy.id;
                ball.absorbTimer = 60; // 60 frames trapped
                ball.vx = 0;
                ball.vy = 0;
                addFloatingText(enemy.x + enemy.width/2, enemy.y, '🧪 ABSORBED!', '#88ff88');
              }
              else {
                // Normal hit
                damageEnemy(enemy.id, ball.damage || 1);

                // Bounce ball
                if (Math.abs(distX) > Math.abs(distY)) {
                  ball.vx = -ball.vx;
                } else {
                  ball.vy = -ball.vy;
                }
              }
            }
          });

          // Handle absorbed ball release
          if (ball.absorbed) {
            const absorber = enemies.find(e => e.id === ball.absorbedBy);
            if (absorber) {
              ball.x = absorber.x + absorber.width/2;
              ball.y = absorber.y + absorber.height/2;
            }
            ball.absorbTimer--;
            if (ball.absorbTimer <= 0 || !absorber) {
              ball.absorbed = false;
              ball.absorbedBy = null;
              ball.vx = (Math.random() - 0.5) * ball.baseSpeed;
              ball.vy = ball.baseSpeed;
              addFloatingText(ball.x, ball.y, '💨 RELEASED!', '#88ff88');
            }
          }

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

      // === ENEMY ABILITIES: Shoot projectiles ===
      const currentPaddle = paddleRef.current;
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const timeSinceSpecial = now - (enemy.lastSpecialTime || 0);

          // Spider shoots webs every 4 seconds
          if (enemy.special === 'web' && timeSinceSpecial > 4000 && currentPaddle) {
            setEnemyProjectiles(prev => [...prev, {
              id: Date.now() + Math.random(),
              type: 'web',
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height,
              vx: 0,
              vy: 3,
              width: 20,
              height: 20,
              color: '#cccccc',
            }]);
            return { ...enemy, lastSpecialTime: now };
          }

          // Beholder shoots eye rays every 3 seconds
          if (enemy.special === 'shoot' && timeSinceSpecial > 3000 && currentPaddle) {
            const angle = Math.atan2(
              (CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM) - enemy.y,
              currentPaddle.x + currentPaddle.width/2 - enemy.x
            );
            setEnemyProjectiles(prev => [...prev, {
              id: Date.now() + Math.random(),
              type: 'eyeray',
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height,
              vx: Math.cos(angle) * 5,
              vy: Math.sin(angle) * 5,
              width: 8,
              height: 8,
              color: '#ff4444',
            }]);
            addFloatingText(enemy.x + enemy.width/2, enemy.y, '👁️', '#ff4444');
            return { ...enemy, lastSpecialTime: now };
          }

          // Dragon breathes fire every 5 seconds
          if (enemy.special === 'firebreath' && timeSinceSpecial > 5000 && currentPaddle) {
            // Create 3 fire projectiles in a spread
            for (let i = -1; i <= 1; i++) {
              setEnemyProjectiles(prev => [...prev, {
                id: Date.now() + Math.random() + i,
                type: 'fire',
                x: enemy.x + enemy.width / 2 + i * 15,
                y: enemy.y + enemy.height,
                vx: i * 1.5,
                vy: 4,
                width: 16,
                height: 16,
                color: '#ff6622',
              }]);
            }
            addFloatingText(enemy.x + enemy.width/2, enemy.y, '🔥', '#ff4400');
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height, '#ff6622', 10);
            return { ...enemy, lastSpecialTime: now };
          }

          return enemy;
        });
      });

      // Update enemy projectiles and check paddle collision
      setEnemyProjectiles(prev => {
        return prev.map(proj => ({
          ...proj,
          x: proj.x + proj.vx,
          y: proj.y + proj.vy,
        })).filter(proj => {
          // Check paddle collision
          if (currentPaddle &&
              proj.y + proj.height >= CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM &&
              proj.y <= CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM &&
              proj.x + proj.width >= currentPaddle.x &&
              proj.x <= currentPaddle.x + currentPaddle.width) {

            // Apply effect based on projectile type
            if (proj.type === 'web') {
              setPaddleDebuffs(d => ({ ...d, webbed: 180 })); // 3 seconds at 60fps
              addFloatingText(proj.x, proj.y, '🕸️ WEBBED!', '#cccccc');
              createParticles(proj.x, proj.y, '#ffffff', 8);
            } else if (proj.type === 'eyeray') {
              // Eye ray shrinks paddle
              setPaddle(p => ({ ...p, width: Math.max(40, p.width - 15) }));
              addFloatingText(proj.x, proj.y, '⚡ ZAP!', '#ff4444');
              setScreenShake(true);
              setTimeout(() => setScreenShake(false), 100);
            } else if (proj.type === 'fire') {
              // Fire damages player (shrink paddle significantly)
              setPaddle(p => ({ ...p, width: Math.max(40, p.width - 10) }));
              addFloatingText(proj.x, proj.y, '🔥 BURN!', '#ff6622');
              createParticles(proj.x, proj.y, '#ff4400', 12);
            }
            return false; // Remove projectile
          }

          // Remove if off screen
          return proj.y < CANVAS_HEIGHT + 50 && proj.y > -50;
        });
      });

      // === ENEMY-PADDLE COLLISION: Apply debuffs from touching enemies ===
      if (currentPaddle) {
        enemies.forEach(enemy => {
          const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM;
          const paddleBottom = CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM;

          if (enemy.y + enemy.height >= paddleTop &&
              enemy.y <= paddleBottom &&
              enemy.x + enemy.width >= currentPaddle.x &&
              enemy.x <= currentPaddle.x + currentPaddle.width) {

            // Apply special effects based on enemy type
            if (enemy.special === 'petrify') {
              setPaddleDebuffs(d => ({ ...d, petrified: 90 })); // 1.5 seconds
              addFloatingText(enemy.x + enemy.width/2, paddleTop - 20, '🗿 PETRIFIED!', '#888888');
            } else if (enemy.special === 'confuse') {
              setPaddleDebuffs(d => ({ ...d, confused: 240 })); // 4 seconds
              addFloatingText(enemy.x + enemy.width/2, paddleTop - 20, '🌀 CONFUSED!', '#9966aa');
            } else if (enemy.special === 'lifesteal') {
              // Vampire heals when touching paddle
              setEnemies(e => e.map(en =>
                en.id === enemy.id
                  ? { ...en, health: Math.min(en.maxHealth, en.health + 1) }
                  : en
              ));
              addFloatingText(enemy.x + enemy.width/2, enemy.y, '💉 DRAIN!', '#ff0000');
            }

            // All enemies shrink paddle on touch
            setPaddle(p => ({ ...p, width: Math.max(40, p.width - 5) }));
            createParticles(enemy.x + enemy.width/2, paddleTop, '#ff4444', 6);

            // Push enemy away
            setEnemies(e => e.map(en =>
              en.id === enemy.id
                ? { ...en, y: en.y - 30, vy: -Math.abs(en.vy || 1) }
                : en
            ));
          }
        });
      }

      // Decay paddle debuffs
      setPaddleDebuffs(d => ({
        petrified: Math.max(0, d.petrified - 1),
        confused: Math.max(0, d.confused - 1),
        webbed: Math.max(0, d.webbed - 1),
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
  }, [gameState, isPaused, selectedEnemy, activeEffects, applyGimmick, gimmickData, combo, maxCombo, spawnPowerUp, createParticles, createPaddleBounceParticles, createBrickShatterParticles, createCrackingParticles, addFloatingText, currentLevel, difficulty, enemies, lastEnemySpawn, spawnEnemy, updateEnemies, damageEnemy, bumpers, portals, spawners, paddleDebuffs, invasionMode, invasionFormation, lastShipFire, bricks, lives, invasionPhase, ballGrabber, invasionTimer, transformProgress, pendingBossLevel, createInvasionBricks, paddleTransformProgress, brickMorphProgress]); // NOTE: paddle intentionally omitted - use paddleRef to avoid restarting game loop on every paddle move

  const applyPowerUp = (type) => {
    // Handle character-specific rare power-ups
    if (type.startsWith('rare_')) {
      applyRarePowerUp(type.replace('rare_', ''));
      return;
    }

    // Handle weapon powerups
    if (type.startsWith('weapon_')) {
      const weaponType = powerUpTypes[type];
      if (weaponType && weaponType.weaponId) {
        const weapon = WEAPONS[weaponType.weaponId];
        if (weapon) {
          // Add ammo to weapon (or give full ammo if first pickup)
          setWeaponAmmo(prev => ({
            ...prev,
            [weapon.id]: Math.min((prev[weapon.id] || 0) + weapon.maxAmmo, weapon.maxAmmo * 2)
          }));
          showPowerUpAnnouncement(weapon.emoji, weapon.name + '!', weapon.color, true);
          addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40, `+${weapon.maxAmmo} ammo`, weapon.color);
        }
      }
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

    // Enemy pools by tier
    const tierEnemies = {
      1: ['rat', 'kobold', 'goblin', 'skeleton'],
      2: ['zombie', 'orc', 'spider', 'harpy'],
      3: ['mimic', 'owlbear', 'cube', 'troll'],
      4: ['werewolf', 'basilisk', 'beholder', 'mindflayer'],
      5: ['vampire', 'dragon', 'lich', 'tarrasque'],
    };

    // Determine max tier based on difficulty (globalLevel 1-100)
    let maxTier = 1;
    if (difficulty.globalLevel >= 80) maxTier = 5;
    else if (difficulty.globalLevel >= 60) maxTier = 4;
    else if (difficulty.globalLevel >= 40) maxTier = 3;
    else if (difficulty.globalLevel >= 20) maxTier = 2;

    // Roll for tier - higher tiers are rarer
    const tierRoll = Math.random();
    let tier = 1;
    if (maxTier >= 5 && tierRoll < 0.05) tier = 5;
    else if (maxTier >= 4 && tierRoll < 0.15) tier = 4;
    else if (maxTier >= 3 && tierRoll < 0.30) tier = 3;
    else if (maxTier >= 2 && tierRoll < 0.50) tier = 2;

    // Pick random enemy from tier
    const tierPool = tierEnemies[tier];
    const type = tierPool[Math.floor(Math.random() * tierPool.length)];

    const sprite = ENEMY_SPRITES[type];
    if (!sprite) {
      console.warn('Unknown enemy type:', type);
      return null;
    }

    const enemyId = selectedEnemy?.id || 'brick_goblin';
    const themeColors = ENEMY_THEME_COLORS[enemyId] || ENEMY_THEME_COLORS.brick_goblin;

    // Spawn position - from top or sides
    const side = Math.random();
    let x, y, vx, vy;
    const size = sprite.width * sprite.scale;

    // Behavior-specific spawn patterns
    const behavior = sprite.behavior || 'bounce';

    if (behavior === 'swoop' || behavior === 'soar') {
      // Flying enemies spawn from top corners
      x = Math.random() < 0.5 ? 50 : CANVAS_WIDTH - 50 - size;
      y = -size;
      vx = x < CANVAS_WIDTH / 2 ? 1 * difficulty.enemySpeed : -1 * difficulty.enemySpeed;
      vy = 0.5 * difficulty.enemySpeed;
    } else if (behavior === 'crawl') {
      // Crawlers spawn from sides
      const fromLeft = Math.random() < 0.5;
      x = fromLeft ? -size : CANVAS_WIDTH + size;
      y = 50 + Math.random() * 150;
      vx = fromLeft ? 0.8 * difficulty.enemySpeed : -0.8 * difficulty.enemySpeed;
      vy = 0.2 * difficulty.enemySpeed;
    } else if (side < 0.6) {
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
      tier,
      behavior: sprite.behavior || 'bounce',
      special: sprite.special,
      x, y, vx, vy,
      health: sprite.health,
      maxHealth: sprite.health,
      frame: 0,
      frameTimer: 0,
      width: size,
      height: size,
      themeColors,
      phaseTimer: 0,
      isPhased: false,
      // Special state for unique abilities
      hasRevived: false, // For zombie
      enraged: false, // For orc, werewolf
      disguised: sprite.special === 'disguise', // For mimic
      regenTimer: 0, // For troll
      lastSpecialTime: 0, // For abilities with cooldowns
      confused: false, // Confused state (for mind flayer)
      petrified: false, // Petrified state (for basilisk)
    };
  }, [difficulty, selectedEnemy]);

  const updateEnemies = useCallback((deltaTime) => {
    if (!difficulty) return;

    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        const sprite = ENEMY_SPRITES[enemy.type];
        if (!sprite) return enemy;

        let { x, y, vx, vy, frame, frameTimer, phaseTimer, isPhased, regenTimer, enraged } = enemy;
        const behavior = enemy.behavior || sprite.behavior || 'bounce';
        const speedMult = enraged ? 1.8 : 1;

        // Update animation frame
        frameTimer += deltaTime;
        if (frameTimer > 200) {
          frame = (frame + 1) % sprite.frames.length;
          frameTimer = 0;
        }

        // Behavior-based AI
        switch (behavior) {
          case 'scurry': // Rat - fast unpredictable movement
            x += vx * 1.5 * speedMult;
            y += vy * 0.5;
            // Random direction changes
            if (Math.random() < 0.02) {
              vx = (Math.random() - 0.5) * 3 * difficulty.enemySpeed;
            }
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y < 60) vy = Math.abs(vy);
            break;

          case 'diagonal': // Kobold - moves in diagonal patterns
            x += vx * speedMult;
            y += vy * 0.6;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'bounce': // Standard bouncing (goblin, skeleton, troll)
            x += vx * speedMult;
            y += vy * 0.3;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) {
              vx = -vx;
              x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, x));
            }
            if (y < 60) vy = Math.abs(vy);
            break;

          case 'shamble': // Zombie - slow, lurching movement
            x += vx * 0.3 * speedMult;
            y += vy * 0.15;
            // Occasional lurch
            if (Math.random() < 0.01) {
              x += (Math.random() - 0.5) * 20;
            }
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y < 60) vy = Math.abs(vy);
            break;

          case 'charge': // Orc - speeds up when hit, aggressive
            const chargeSpeed = enraged ? 2.5 : 1.2;
            x += vx * chargeSpeed * speedMult;
            y += vy * 0.4;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'crawl': // Spider - crawls along edges
            x += vx * 0.8 * speedMult;
            // Stick to upper part but oscillate
            y = 80 + Math.sin(Date.now() / 500) * 30;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            break;

          case 'swoop': // Harpy - dives down then back up
            x += vx * speedMult;
            phaseTimer += deltaTime;
            if (phaseTimer < 1500) {
              // Diving phase
              y += 2 * difficulty.enemySpeed;
            } else if (phaseTimer < 3000) {
              // Rising phase
              y -= 1.5 * difficulty.enemySpeed;
            } else {
              phaseTimer = 0;
            }
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            y = Math.max(60, Math.min(CANVAS_HEIGHT * 0.6, y));
            break;

          case 'ambush': // Mimic - stays still when disguised, attacks when revealed
            if (!enemy.disguised) {
              x += vx * 1.5 * speedMult;
              y += vy * 0.8;
              if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
              if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            }
            break;

          case 'rhythm': // Owlbear - stompy rhythmic movement
            phaseTimer += deltaTime;
            const phase = Math.floor(phaseTimer / 500) % 4;
            if (phase < 2) {
              x += vx * speedMult;
            } else {
              y += vy * 0.3;
            }
            if (phaseTimer > 2000) phaseTimer = 0;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'drift': // Gelatinous Cube - very slow, methodical
            x += vx * 0.2 * speedMult;
            y += vy * 0.1;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'frenzy': // Werewolf - fast when low health
            const frenzyMult = enemy.health <= enemy.maxHealth / 2 ? 2.2 : 1;
            x += vx * frenzyMult * speedMult;
            y += vy * 0.4 * frenzyMult;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'slither': // Basilisk - snake-like movement
            x += vx * 0.6 * speedMult;
            y += Math.sin(Date.now() / 200) * 1.5;
            y += vy * 0.2;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            break;

          case 'hover': // Beholder - floats in place, occasional repositioning
            phaseTimer += deltaTime;
            if (phaseTimer > 2000) {
              // Reposition
              vx = (Math.random() - 0.5) * 2 * difficulty.enemySpeed;
              vy = (Math.random() - 0.5) * difficulty.enemySpeed;
              phaseTimer = 0;
            }
            x += vx * 0.5;
            y += vy * 0.3;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 80 || y >= CANVAS_HEIGHT / 2 - 30) vy = -vy;
            break;

          case 'float': // Mind Flayer, Lich - eerie floating
            x += Math.sin(Date.now() / 400) * 1;
            y += Math.cos(Date.now() / 600) * 0.5;
            x += vx * 0.3;
            y += vy * 0.2;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 70 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'glide': // Vampire - smooth elegant movement
            x += vx * 1.2 * speedMult;
            y += Math.sin(Date.now() / 500) * 0.8;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
            break;

          case 'soar': // Dragon - majestic flying patterns
            x += vx * 1.5 * speedMult;
            y += Math.sin(Date.now() / 800) * 2;
            y += vy * 0.2;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            y = Math.max(60, Math.min(CANVAS_HEIGHT / 2 - 20, y));
            break;

          case 'rampage': // Tarrasque - slow but unstoppable
            x += vx * 0.4 * speedMult;
            y += vy * 0.15;
            // Occasional stomp
            if (Math.random() < 0.005) {
              createParticles(x + enemy.width/2, y + enemy.height, '#664422', 8);
            }
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y <= 60 || y >= CANVAS_HEIGHT / 2 - 40) vy = -vy;
            break;

          default:
            // Fallback bounce behavior
            x += vx * speedMult;
            y += vy * 0.3;
            if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
            if (y < 60) vy = Math.abs(vy);
        }

        // Troll regeneration
        if (enemy.special === 'regenerate' && enemy.health < enemy.maxHealth) {
          regenTimer = (regenTimer || 0) + deltaTime;
          if (regenTimer > 3000) { // Regen 1 HP every 3 seconds
            enemy.health = Math.min(enemy.maxHealth, enemy.health + 1);
            regenTimer = 0;
            createParticles(x + enemy.width/2, y + enemy.height/2, '#66ff66', 5);
          }
        }

        // Keep in bounds vertically
        y = Math.max(60, Math.min(CANVAS_HEIGHT / 2 + 50, y));

        return { ...enemy, x, y, vx, vy, frame, frameTimer, phaseTimer, isPhased, regenTimer };
      }).filter(enemy => {
        return enemy.y < CANVAS_HEIGHT && enemy.x > -100 && enemy.x < CANVAS_WIDTH + 100;
      });
    });
  }, [difficulty, createParticles]);

  const damageEnemy = useCallback((enemyId, damage = 1) => {
    setEnemies(prev => {
      const updated = prev.map(enemy => {
        if (enemy.id === enemyId) {
          const sprite = ENEMY_SPRITES[enemy.type];
          let newHealth = enemy.health - damage;
          let updatedEnemy = { ...enemy, health: newHealth };

          // Handle special abilities on damage
          if (enemy.special === 'disguise' && enemy.disguised) {
            // Mimic reveals itself
            updatedEnemy.disguised = false;
            addFloatingText(enemy.x + enemy.width/2, enemy.y, '⚠️ MIMIC!', '#ff4444');
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#8b4513', 10);
          }

          // Orc enrages when hit
          if (enemy.type === 'orc' && !enemy.enraged) {
            updatedEnemy.enraged = true;
            addFloatingText(enemy.x + enemy.width/2, enemy.y, '💢 ENRAGED!', '#ff6644');
          }

          if (newHealth <= 0) {
            // Zombie revive check
            if (enemy.special === 'revive' && !enemy.hasRevived) {
              updatedEnemy.health = Math.ceil(enemy.maxHealth / 2);
              updatedEnemy.hasRevived = true;
              addFloatingText(enemy.x + enemy.width/2, enemy.y, '💀 REVIVED!', '#55ff55');
              createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#556b55', 12);
              return updatedEnemy;
            }

            // Enemy killed - reward player
            setScore(s => s + sprite.points);
            setPaddle(p => ({ ...p, width: Math.min(200, p.width + sprite.paddleReward) }));
            addFloatingText(enemy.x + enemy.width/2, enemy.y, `+${sprite.points}`, '#ffdd44');

            // Spawn particles
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.themeColors?.primary || '#ffffff', 15);

            // Skeleton drops bones (extra particles)
            if (enemy.special === 'dropBones') {
              createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#f0f0e0', 20);
              addFloatingText(enemy.x + enemy.width/2, enemy.y + 20, '🦴', '#f0f0e0');
            }

            // Lich summons a minion on death
            if (enemy.special === 'summon') {
              // Spawn a skeleton minion
              const minionSprite = ENEMY_SPRITES.skeleton;
              const minion = {
                id: Date.now() + Math.random(),
                type: 'skeleton',
                tier: 1,
                behavior: 'bounce',
                special: 'dropBones',
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 2,
                vy: 0.5,
                health: minionSprite.health,
                maxHealth: minionSprite.health,
                frame: 0,
                frameTimer: 0,
                width: minionSprite.width * minionSprite.scale,
                height: minionSprite.height * minionSprite.scale,
                themeColors: enemy.themeColors,
                phaseTimer: 0,
                isPhased: false,
                hasRevived: false,
                enraged: false,
              };
              setEnemies(e => [...e, minion]);
              addFloatingText(enemy.x + enemy.width/2, enemy.y - 10, '☠️ SUMMON!', '#00ff00');
            }

            return null; // Mark for removal
          }
          return updatedEnemy;
        }
        return enemy;
      });
      return updated.filter(e => e !== null);
    });
  }, [addFloatingText, createParticles]);

  const handleLevelComplete = () => {
    // Check if this was invasion mode completion
    if (invasionMode && pendingBossLevel) {
      // Invasion cleared! Now start the actual boss level
      setFlashColor('#00ff00');
      setTimeout(() => setFlashColor(null), 300);

      // Brief celebration then start boss level
      setTimeout(() => {
        // Calculate difficulty for boss level
        const enemyIndex = enemyDefs.findIndex(e => e.id === selectedEnemy?.id) || 0;
        const diff = getDifficulty(enemyIndex, pendingBossLevel);

        // Exit invasion mode and start boss level
        setInvasionMode(false);
        setBricks(createBricks(pendingBossLevel, selectedEnemy));
        setBalls([createBall(pendingBossLevel, enemyIndex)]);
        setShipProjectiles([]);
        setPendingBossLevel(null);

        // Keep current score, lives, etc. - continuous from invasion
      }, 600);

      return;
    }

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

  // Create invasion mode bricks (brickinoid formation)
  const createInvasionBricks = useCallback((bossLevel, enemy) => {
    const newBricks = [];
    const themeColor = ENEMY_THEME_COLORS[enemy?.id] || ENEMY_THEME_COLORS.brick_goblin;

    // Invasion layout - dense formation of enemies
    // 5 rows, 10 columns, varied types based on row
    const rows = 5;
    const cols = 10;
    const startX = (CANVAS_WIDTH - cols * (BRICK_WIDTH + BRICK_PADDING)) / 2;
    const startY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Determine brick type based on position
        // Top rows are tougher, edges have special types
        let health = 1;
        let type = 'normal';
        let color = themeColor.brick1;

        if (row === 0) {
          // Top row: armored (2 health)
          health = 2;
          color = themeColor.brick2;
        } else if (row === 1 && (col === 0 || col === cols - 1)) {
          // Second row edges: gold bricks
          type = 'gold';
          color = '#ffd700';
          health = 1;
        } else if (row === 2 && col === Math.floor(cols / 2)) {
          // Center of third row: explosive
          type = 'explosive';
          color = '#ff6644';
          health = 1;
        }

        // Level 12 invasion is harder
        if (bossLevel === 12) {
          health += 1;
          if (row <= 1) health += 1;
        }

        const x = startX + col * (BRICK_WIDTH + BRICK_PADDING);
        const y = startY + row * (BRICK_HEIGHT + BRICK_PADDING + 2);

        // Assign alien type based on brick characteristics
        // Different aliens for different brick types
        let alienType = 'grunt'; // Default grunt alien
        if (type === 'gold') {
          alienType = 'elite'; // Gold bricks = elite aliens
        } else if (type === 'explosive') {
          alienType = 'bomber'; // Explosive bricks = bomber aliens
        } else if (health >= 3) {
          alienType = 'heavy'; // High health = heavy aliens
        } else if (row === 0) {
          alienType = 'commander'; // Top row = commanders
        }

        newBricks.push({
          id: `invasion-${row}-${col}`,
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          health,
          maxHealth: health,
          color,
          type,
          hitFlash: 0,
          isInvader: true, // Flag for pixel art rendering
          alienType, // Type of alien (determines sprite)
          spriteIndex: (row + col) % 5, // Variety within type
        });
      }
    }

    return newBricks;
  }, []);

  // Start a specific level
  const startLevel = (level, fresh = false) => {
    // Calculate difficulty based on enemy and level
    const enemyIndex = enemyDefs.findIndex(e => e.id === selectedEnemy?.id) || 0;
    const diff = getDifficulty(enemyIndex, level);
    setDifficulty(diff);

    // Check if this is a boss level that needs invasion first
    const isBossLevel = level === 6 || level === 12;

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

    // Clear particles and floating texts from previous level
    setParticles([]);
    setFloatingTexts([]);
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
    setEnemyProjectiles([]);
    setPaddleDebuffs({ petrified: 0, confused: 0, webbed: 0 });
    setLastEnemySpawn(Date.now());

    if (isBossLevel) {
      // Boss level: Start normally but prepare for invasion sequence
      // The invasion triggers when the ball is launched
      setInvasionMode(false);
      setInvasionPhase('normal');
      setPendingBossLevel(level);
      setCurrentLevel(level);
      setBricks(createBricks(level, selectedEnemy));
      setBalls([createBall(level, enemyIndex)]);
      setShipProjectiles([]);
      setBallGrabber(null);
      setInvasionTimer(0);
      setTransformProgress(0);
      setInvasionFormation({
        offsetX: 0,
        direction: 1,
        descendAmount: 0,
        speed: level === 12 ? 1.2 : 0.8,
      });
    } else {
      // Normal level start
      setInvasionMode(false);
      setPendingBossLevel(null);
      setCurrentLevel(level);
      setBricks(createBricks(level, selectedEnemy));
      // Create ball AFTER paddle is positioned so it spawns in correct location
      setBalls([createBall(level, enemyIndex)]);
    }

    // Prevent click that started the game from also launching the ball
    launchDelayRef.current = Date.now() + 200;
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
    // Clear particles and floating texts
    setParticles([]);
    setFloatingTexts([]);
    setGimmickData({});
    setTeddyMeter(0);
    setTeddyAbilityActive(null);
    setTwinPaddle(null);
    setChargeLevel(0);
    setIsCharging(false);
    setDashCooldown(0);
    // Prevent click that started the game from also launching the ball
    launchDelayRef.current = Date.now() + 200;
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
  // Ability cooldown tracking for command ribbon
  const getAbilityState = (abilityKey) => {
    const isReady = teddyMeter >= TEDDY_METER_MAX;
    const isActive = teddyAbilityActive === abilityKey;
    if (isActive) return 'active';
    if (isReady) return 'ready';
    return 'charging';
  };

  const renderGame = () => {
    const ballAttached = balls.some(b => b.attached);
    const chargePercent = chargeLevel;

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      transform: screenShake ? `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)` : 'none',
    }}>
      {/* Game canvas with integrated HUD frame */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #1a1a3e 100%)',
          borderRadius: '12px',
          border: '4px solid #2a2a4e',
          boxShadow: '0 0 40px rgba(64, 128, 224, 0.15), inset 0 0 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          cursor: 'none',
        }}>

        {/* Subtle playfield background - drifting particles */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(64, 128, 224, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(139, 90, 43, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 90, 43, 0.05) 0%, transparent 40%)
          `,
          pointerEvents: 'none',
        }} />

        {/* Integrated HUD Bar - sits on top frame edge (JRPG battle UI style) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '52px',
          background: 'linear-gradient(180deg, rgba(15,15,30,0.95) 0%, rgba(15,15,30,0.85) 80%, transparent 100%)',
          borderBottom: '2px solid rgba(64, 128, 224, 0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '6px 16px',
          gap: '12px',
          zIndex: 20,
        }}>
          {/* Score - gold accent */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '90px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>
              {Math.floor(score).toLocaleString()}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Level + Lives + Combo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '4px 10px',
              background: 'rgba(64, 128, 224, 0.2)',
              borderRadius: '4px',
              border: '1px solid rgba(64, 128, 224, 0.3)',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#6090d0' }}>Lv.{currentLevel}</span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: Math.max(0, lives) }, (_, i) => (
                <span key={i} style={{ fontSize: '18px', filter: 'drop-shadow(0 0 4px rgba(255,100,100,0.5))' }}>❤️</span>
              ))}
              {Array.from({ length: Math.max(0, 3 - lives) }, (_, i) => (
                <span key={i} style={{ fontSize: '18px', opacity: 0.3 }}>🖤</span>
              ))}
            </div>
            {combo > 2 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 8px',
                background: 'linear-gradient(135deg, rgba(255,150,0,0.3), rgba(255,100,0,0.2))',
                borderRadius: '4px',
                animation: 'comboPulse 0.5s ease-in-out infinite',
              }}>
                <span style={{ fontSize: '14px' }}>🔥</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffaa00' }}>{combo}x</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Teddy Meter + Command Ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {/* Teddy Meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '20px',
                filter: teddyMeter >= TEDDY_METER_MAX ? 'drop-shadow(0 0 8px #ffd700)' : 'none',
                animation: teddyMeter >= TEDDY_METER_MAX ? 'teddyReady 0.8s ease-in-out infinite' : 'none',
              }}>🧸</span>
              <div style={{
                width: '60px',
                height: '8px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(139, 90, 43, 0.5)',
              }}>
                <div style={{
                  width: `${(teddyMeter / TEDDY_METER_MAX) * 100}%`,
                  height: '100%',
                  background: teddyMeter >= TEDDY_METER_MAX
                    ? 'linear-gradient(90deg, #ffd700, #ffaa00)'
                    : 'linear-gradient(90deg, #8b5a2b, #a06030)',
                  boxShadow: teddyMeter >= TEDDY_METER_MAX ? '0 0 10px #ffd700' : 'none',
                  transition: 'width 0.2s',
                }} />
              </div>
            </div>

            {/* Command Ribbon - Q/W/E abilities */}
            <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
              {[
                { key: 'supercharge', label: 'Q', name: 'Charge', color: '#ff6b35', icon: '⚡' },
                { key: 'barrier', label: 'W', name: 'Barrier', color: '#4080ff', icon: '🛡️' },
                { key: 'split', label: 'E', name: 'Split', color: '#ff80ff', icon: '✨' },
              ].map(ability => {
                const state = getAbilityState(ability.key);
                const isReady = state === 'ready';
                const isActive = state === 'active';
                const fillPercent = isActive ? 100 : isReady ? 100 : (teddyMeter / TEDDY_METER_MAX) * 100;

                return (
                  <div
                    key={ability.key}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '4px 8px',
                      minWidth: '52px',
                      background: isActive
                        ? `linear-gradient(180deg, ${ability.color}40, ${ability.color}20)`
                        : 'rgba(0,0,0,0.4)',
                      borderRadius: '6px',
                      border: `2px solid ${isReady || isActive ? ability.color : 'rgba(255,255,255,0.1)'}`,
                      opacity: isReady || isActive ? 1 : 0.6,
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Fill ring/bar indicator */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${fillPercent}%`,
                      background: isReady
                        ? `linear-gradient(180deg, ${ability.color}30, ${ability.color}10)`
                        : `linear-gradient(180deg, rgba(255,255,255,0.05), transparent)`,
                      transition: 'height 0.3s',
                    }} />

                    {/* Key label */}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: isReady || isActive ? ability.color : '#555',
                      position: 'relative',
                    }}>{ability.label}</span>

                    {/* Icon + Name */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      position: 'relative',
                    }}>
                      <span style={{ fontSize: '10px' }}>{ability.icon}</span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: '600',
                        color: isReady || isActive ? '#fff' : '#666',
                      }}>{ability.name}</span>
                    </div>

                    {/* Ready pulse */}
                    {isReady && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '4px',
                        boxShadow: `inset 0 0 15px ${ability.color}40`,
                        animation: 'abilityPulse 1s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Active Effects */}
          {activeEffects.length > 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {activeEffects.includes('shield') && (
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(64,128,255,0.3)', borderRadius: '3px', color: '#4080ff', fontWeight: '700' }}>SHIELD</span>
              )}
              {activeEffects.includes('laser') && (
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,0,255,0.3)', borderRadius: '3px', color: '#ff00ff', fontWeight: '700' }}>LASER</span>
              )}
              {activeEffects.includes('fast') && (
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,0,0.3)', borderRadius: '3px', color: '#ffff00', fontWeight: '700' }}>FAST</span>
              )}
              {activeEffects.includes('slow') && (
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(128,192,255,0.3)', borderRadius: '3px', color: '#80c0ff', fontWeight: '700' }}>SLOW</span>
              )}
              {activeEffects.includes('frozen') && (
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(128,224,255,0.3)', borderRadius: '3px', color: '#80e0ff', fontWeight: '700' }}>FROZEN</span>
              )}
            </div>
          )}

          {/* Boss/Opponent indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: `linear-gradient(135deg, ${selectedEnemy?.color}20, ${selectedEnemy?.color}10)`,
            borderRadius: '8px',
            border: `1px solid ${selectedEnemy?.color}40`,
          }}>
            <span style={{ fontSize: '24px', filter: `drop-shadow(0 0 6px ${selectedEnemy?.color}80)` }}>{selectedEnemy?.emoji}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: selectedEnemy?.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedEnemy?.name}
              </span>
              <span style={{ fontSize: '9px', color: '#666' }}>{selectedEnemy?.title}</span>
            </div>
          </div>
        </div>

        {/* Invasion mode banner */}
        {invasionMode && (
          <div style={{
            position: 'absolute',
            top: 45,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 24px',
            background: 'linear-gradient(180deg, rgba(255,60,60,0.9), rgba(180,40,40,0.9))',
            borderRadius: '4px',
            border: '2px solid #ff8080',
            boxShadow: '0 0 20px rgba(255,60,60,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
            animation: 'invasionPulse 1s ease-in-out infinite',
            zIndex: 20,
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '900',
              color: '#fff',
              textShadow: '0 0 10px #ff0000, 2px 2px 0 #800000',
              letterSpacing: '4px',
            }}>
              BRICKINOID INVASION!
            </span>
          </div>
        )}

        {/* Ball Grabber UFO */}
        {ballGrabber && (
          <>
            {/* Tractor beam effect when grabbing/has ball */}
            {(ballGrabber.phase === 'grabbing' || ballGrabber.hasBall) && (
              <div style={{
                position: 'absolute',
                left: ballGrabber.x - 20,
                top: ballGrabber.y + 15,
                width: 40,
                height: ballGrabber.hasBall ? 30 : 80,
                background: 'linear-gradient(180deg, rgba(128, 255, 128, 0.6) 0%, rgba(128, 255, 128, 0.2) 50%, transparent 100%)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                animation: 'tractorBeam 0.3s ease-in-out infinite',
                zIndex: 25,
                pointerEvents: 'none',
              }}>
                {/* Beam particles */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${20 + Math.sin(Date.now() * 0.01 + i) * 15}%`,
                    top: `${(i * 20) + (Date.now() * 0.05 + i * 20) % 100}%`,
                    width: 4,
                    height: 4,
                    background: '#80ff80',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #80ff80',
                    opacity: 0.8,
                  }} />
                ))}
              </div>
            )}
            {/* UFO body */}
            <div style={{
              position: 'absolute',
              left: ballGrabber.x - 30,
              top: ballGrabber.y - 25,
              width: 60,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: ballGrabber.hitTimer > 0
                ? 'brightness(2) drop-shadow(0 0 20px #ff0000)'
                : 'drop-shadow(0 0 20px #88ff88)',
              animation: ballGrabber.hitTimer > 0 ? 'ufoHit 0.1s infinite' : 'ufoHover 1s ease-in-out infinite',
              zIndex: 30,
              transition: 'filter 0.1s',
            }}>
              {/* Pixel art UFO */}
              <img
                src={SPRITES.enemy1}
                alt="UFO"
                style={{
                  width: 60,
                  height: 60,
                  imageRendering: 'pixelated',
                  transform: 'rotate(180deg)', // Flip to face downward
                }}
              />
              {/* Health indicator */}
              <div style={{
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '4px',
              }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: i < ballGrabber.health
                      ? 'radial-gradient(circle at 30% 30%, #ff6666, #ff0000)'
                      : '#333',
                    border: '2px solid #ff8888',
                    boxShadow: i < ballGrabber.health ? '0 0 6px #ff0000' : 'none',
                  }} />
                ))}
              </div>
              {/* "SHOOT ME!" indicator when not hit recently */}
              {ballGrabber.hasBall && ballGrabber.hitTimer <= 0 && invasionPhase === 'shoot_alien' && (
                <div style={{
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#ffff00',
                  textShadow: '0 0 8px #ffff00',
                  whiteSpace: 'nowrap',
                  animation: 'pulse 0.5s infinite',
                }}>
                  ⬇️ SHOOT ⬇️
                </div>
              )}
            </div>
          </>
        )}

        {/* UH OH! Alert during alert phase */}
        {invasionPhase === 'alert' && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 100,
            animation: 'alertShake 0.1s ease-in-out infinite',
          }}>
            <div style={{
              fontSize: '72px',
              fontWeight: '900',
              color: '#ff0000',
              textShadow: '0 0 30px #ff0000, 0 0 60px #ff4444, 4px 4px 0 #800000',
              animation: 'alertPulse 0.3s ease-in-out infinite',
            }}>
              UH OH!
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffaa00',
              textShadow: '0 0 10px #ff6600',
              marginTop: '10px',
            }}>
              ALIEN STOLE YOUR BALL!
            </div>
            <div style={{
              fontSize: '16px',
              color: '#fff',
              marginTop: '15px',
              opacity: 0.9,
            }}>
              SHOOT IT DOWN!
            </div>
            <div style={{
              fontSize: '14px',
              color: '#80ff80',
              marginTop: '8px',
              animation: 'pulse 0.8s infinite',
            }}>
              🎯 CLICK or SPACE to fire 🎯
            </div>
          </div>
        )}

        {/* Transformation progress */}
        {invasionPhase === 'transform' && (
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 50,
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ff6644',
              textShadow: '0 0 20px #ff4422',
              marginBottom: '15px',
            }}>
              BRICKS TRANSFORMING...
            </div>
            <div style={{
              width: 200,
              height: 12,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 6,
              overflow: 'hidden',
              border: '2px solid #ff6644',
            }}>
              <div style={{
                width: `${transformProgress * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff6644, #ffaa00)',
                transition: 'width 0.1s',
              }} />
            </div>
          </div>
        )}

        {/* Danger zone indicator - glows when ball is low */}
        {!invasionMode && balls.some(b => !b.attached && b.y > CANVAS_HEIGHT - 120) && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(180deg, transparent, rgba(255,60,60,0.15))',
            borderTop: '1px solid rgba(255,60,60,0.3)',
            animation: 'dangerPulse 0.5s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        )}
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

        {/* Bricks (Brickinoids in invasion mode - move with formation) */}
        {bricks.map((brick, brickIndex) => (brick.health > 0 || brick.dying) && (
          <div
            key={brick.id}
            style={{
              position: 'absolute',
              left: brick.x + (invasionMode ? invasionFormation.offsetX : 0) + (brick.morphWobble || 0),
              top: brick.y + (invasionMode ? invasionFormation.descendAmount : 0),
              width: brick.width,
              height: brick.height,
              background: (brick.isInvader && invasionPhase === 'invasion') ? 'transparent' : (
                invasionPhase === 'transform' ? (
                // Morphing gradient - bricks turning into alien colors
                transformProgress > 0.5
                  ? `linear-gradient(180deg,
                      hsl(${120 + brickIndex * 10}, 70%, ${50 + transformProgress * 20}%) 0%,
                      hsl(${100 + brickIndex * 10}, 60%, ${40 + transformProgress * 15}%) 50%,
                      hsl(${80 + brickIndex * 10}, 50%, ${30 + transformProgress * 10}%) 100%)`
                  : `linear-gradient(180deg, ${brick.color}ee 0%, ${brick.color} 50%, ${brick.color}aa 100%)`
              ) : brick.invisible ? 'transparent' :
                brick.type === 'obstacle' ? 'linear-gradient(180deg, #3a3a5e 0%, #2a2a4e 50%, #1a1a3e 100%)' :
                brick.type === 'spawner' ? 'linear-gradient(180deg, #1a3a1a 0%, #0a2a0a 50%, #002200 100%)' :
                brick.type === 'frozen' ? `linear-gradient(180deg, #aaeeff 0%, ${brick.cracked ? '#6699aa' : '#88ddff'} 50%, #66bbdd 100%)` :
                brick.dying ? `linear-gradient(180deg, ${brick.deathColor || brick.color}ee 0%, ${brick.deathColor || brick.color} 50%, ${brick.deathColor || brick.color}aa 100%)` :
                `linear-gradient(180deg, ${brick.color}ee 0%, ${brick.color} 50%, ${brick.color}aa 100%)`),
              borderRadius: (brick.isInvader && invasionPhase === 'invasion') ? '0' : (
                invasionPhase === 'transform' && transformProgress > 0.7
                ? `${8 + transformProgress * 10}px` // Become more rounded like UFOs
                : brick.type === 'spawner' ? '8px' : '4px'),
              border: (brick.isInvader && invasionPhase === 'invasion') ? 'none' : (
                invasionPhase === 'transform' ? (
                `2px solid hsl(${120 + brickIndex * 10}, 80%, ${60 + transformProgress * 20}%)`
              ) : brick.invisible ? '1px dashed rgba(255,255,255,0.1)' :
                brick.type === 'obstacle' ? '2px solid #4a4a6e' :
                brick.type === 'spawner' ? '3px solid #44ff44' :
                brick.type === 'frozen' ? `2px solid ${brick.cracked ? '#88aacc' : '#aaeeff'}` :
                brick.dying ? `2px solid ${brick.deathColor || brick.color}` :
                `2px solid ${brick.color}`),
              boxShadow: (brick.isInvader && invasionPhase === 'invasion') ? 'none' : (
                invasionPhase === 'transform' ? (
                `0 0 ${10 + transformProgress * 20}px hsl(${120 + brickIndex * 10}, 80%, 50%)`
              ) : brick.invisible ? 'none' :
                brick.type === 'obstacle' ? 'inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' :
                brick.type === 'spawner' ? '0 0 15px #44ff44, inset 0 0 10px rgba(68,255,68,0.3)' :
                brick.type === 'frozen' ? '0 0 10px #88ddff, inset 0 1px 0 rgba(255,255,255,0.5)' :
                `0 2px 8px ${brick.color}44, inset 0 1px 0 rgba(255,255,255,0.3)`),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Dying bricks: special types get dramatic death, normal bricks fade quietly
              opacity: brick.dying
                ? Math.max(0, brick.deathTimer * brick.deathTimer) // Quick quadratic fade
                : brick.invisible ? 0.2 : 1,
              transform: brick.dying
                ? (() => {
                    const isSpecial = brick.type === 'explosive' || brick.type === 'boss' || brick.type === 'gold';
                    if (isSpecial) {
                      // Dramatic death for special bricks
                      const t = 1 - brick.deathTimer;
                      const shake = Math.sin(t * 50) * (1 - t) * 8;
                      const scale = t < 0.1 ? 1 + t * 3 : 1.3 - t * 0.5;
                      const rotate = shake * 2;
                      const skewX = Math.sin(t * 30) * (1 - t) * 5;
                      return `scale(${scale}) rotate(${rotate}deg) skewX(${skewX}deg) translate(${shake}px, ${shake * 0.5}px)`;
                    } else {
                      // Simple shrink for normal bricks - subtle
                      const scale = 0.5 + brick.deathTimer * 0.5;
                      return `scale(${scale})`;
                    }
                  })()
                : brick.armorCracking
                  ? `scale(${1 + Math.sin(brick.armorCrackTimer * 10) * 0.02})` // Subtle shake when cracking
                  : 'none',
              filter: brick.dying
                ? (brick.type === 'explosive' || brick.type === 'boss' || brick.type === 'gold')
                  ? `brightness(${1 + (1 - brick.deathTimer) * 2}) contrast(${1 + (1 - brick.deathTimer) * 0.5}) saturate(${1.5 - brick.deathTimer * 0.5})`
                  : `brightness(${1 + (1 - brick.deathTimer) * 0.5})` // Subtle brightness for normal bricks
                : 'none',
              pointerEvents: brick.dying ? 'none' : 'auto',
            }}
          >
            {/* Morphing pixel art alien during transformation */}
            {invasionPhase === 'transform' && transformProgress > 0.4 && (
              <div style={{
                position: 'absolute',
                width: `${16 + transformProgress * 16}px`,
                height: `${16 + transformProgress * 16}px`,
                opacity: (transformProgress - 0.4) / 0.6,
                transform: `scale(${0.5 + transformProgress * 0.5}) rotate(${Math.sin(brickIndex + transformProgress * 10) * 10}deg)`,
                filter: `drop-shadow(0 0 ${5 + transformProgress * 10}px hsl(${120 + brickIndex * 10}, 80%, 60%))`,
                animation: 'invasionPulse 0.3s infinite',
                zIndex: 5,
              }}>
                <img
                  src={[SPRITES.enemy1, SPRITES.enemy2, SPRITES.enemy3, SPRITES.enemy4, SPRITES.enemy5][brickIndex % 5]}
                  alt="Alien"
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    transform: 'rotate(180deg)',
                  }}
                />
              </div>
            )}
            {/* Pixel art alien for invasion bricks - fully replaces brick appearance */}
            {brick.isInvader && invasionPhase === 'invasion' && (
              <div style={{
                position: 'absolute',
                width: brick.width,
                height: brick.height + 16,
                top: -8,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={(() => {
                    // Different sprites based on alien type
                    switch (brick.alienType) {
                      case 'commander': return SPRITES.enemy1; // Top row commanders
                      case 'elite': return SPRITES.enemy2; // Gold/elite aliens
                      case 'bomber': return SPRITES.enemy3; // Explosive bombers
                      case 'heavy': return SPRITES.enemy4; // High-health heavies
                      default: return SPRITES.enemy5; // Regular grunts
                    }
                  })()}
                  alt={brick.alienType || 'Invader'}
                  style={{
                    width: brick.width - 4,
                    height: brick.height + 12,
                    imageRendering: 'pixelated',
                    transform: 'rotate(180deg)',
                    filter: brick.hitFlash > 0
                      ? 'brightness(2) drop-shadow(0 0 10px #fff)'
                      : `drop-shadow(0 0 4px ${brick.color || '#88ff88'})`,
                    transition: 'filter 0.15s',
                    opacity: brick.dying ? 0.5 : 1,
                  }}
                />
                {/* Health indicator for multi-hit aliens */}
                {brick.maxHealth > 1 && !brick.dying && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '2px',
                  }}>
                    {[...Array(brick.maxHealth)].map((_, i) => (
                      <div key={i} style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: i < brick.health ? '#ff4444' : '#333',
                        border: '1px solid #ff6666',
                        boxShadow: i < brick.health ? '0 0 4px #ff0000' : 'none',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )}
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
            {/* Frozen brick - shows ice crystal, cracks when hit once */}
            {brick.type === 'frozen' && !brick.invisible && (
              <>
                <span style={{ fontSize: '14px', filter: brick.cracked ? 'grayscale(50%)' : 'none' }}>
                  {brick.cracked ? '🧊' : '❄️'}
                </span>
                {brick.cracked && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                    borderRadius: '4px',
                  }} />
                )}
              </>
            )}
            {/* Split brick - shows split symbol */}
            {brick.type === 'split' && !brick.invisible && (
              <span style={{ fontSize: '12px' }}>💜</span>
            )}
            {/* Mini brick (from split) - smaller, simpler */}
            {brick.type === 'mini' && !brick.invisible && (
              <span style={{ fontSize: '8px' }}>✧</span>
            )}
            {/* Spawner brick - distinctive enemy look with count */}
            {brick.type === 'spawner' && !brick.invisible && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <span style={{ fontSize: '12px', animation: 'explosivePulse 1s ease-in-out infinite' }}>👾</span>
                <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>
                  ×{brick.enemiesRemaining}
                </span>
              </div>
            )}
            {/* Specific powerup brick - shows powerup emoji */}
            {brick.type === 'powerup_specific' && !brick.invisible && brick.specificPowerUp && powerUpTypes[brick.specificPowerUp] && (
              <span style={{
                fontSize: '14px',
                filter: `drop-shadow(0 0 4px ${powerUpTypes[brick.specificPowerUp].color})`,
                animation: 'powerUpFloat 1.5s ease-in-out infinite',
              }}>
                {powerUpTypes[brick.specificPowerUp].emoji}
              </span>
            )}
            {/* Random powerup brick - shows star */}
            {brick.type === 'powerup' && !brick.invisible && (
              <span style={{
                fontSize: '12px',
                filter: 'drop-shadow(0 0 4px #ffd700)',
                animation: 'powerUpFloat 1.5s ease-in-out infinite',
              }}>
                ⭐
              </span>
            )}
            {/* Weapon brick - shows weapon emoji with glow */}
            {brick.type === 'weapon' && !brick.invisible && brick.specificPowerUp && powerUpTypes[brick.specificPowerUp] && (
              <span style={{
                fontSize: '16px',
                filter: `drop-shadow(0 0 6px ${powerUpTypes[brick.specificPowerUp].color}) drop-shadow(0 0 12px ${powerUpTypes[brick.specificPowerUp].color})`,
                animation: 'comboPulse 1s ease-in-out infinite',
              }}>
                {powerUpTypes[brick.specificPowerUp].emoji}
              </span>
            )}
            {brick.health > 1 && !brick.invisible && brick.type !== 'explosive' && brick.type !== 'obstacle' && brick.type !== 'boss' && brick.type !== 'frozen' && brick.type !== 'spawner' && brick.type !== 'powerup_specific' && brick.type !== 'weapon' && brick.type !== 'powerup' && (
              <span style={{
                fontSize: brick.health >= 10 ? '9px' : '11px',
                fontWeight: '900',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
              }}>{brick.health}</span>
            )}
            {/* Armor crack overlay - jagged earthquake-style cracks */}
            {brick.crackPattern && brick.crackPattern.length > 0 && !brick.invisible && !brick.dying && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
              >
                {brick.crackPattern.map((crack, idx) => {
                  // Build polyline points string (no % - SVG uses viewBox coordinates)
                  const pointsStr = crack.points
                    ? crack.points.map(p => `${p.x},${p.y}`).join(' ')
                    : `${crack.x1},${crack.y1} ${crack.x2},${crack.y2}`;
                  const offsetPointsStr = crack.points
                    ? crack.points.map(p => `${p.x + 1},${p.y + 1}`).join(' ')
                    : `${crack.x1 + 1},${crack.y1 + 1} ${crack.x2 + 1},${crack.y2 + 1}`;

                  return (
                    <g key={idx}>
                      {/* Dark crack line */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="rgba(0,0,0,0.7)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Light highlight edge for depth */}
                      <polyline
                        points={offsetPointsStr}
                        fill="none"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}
              </svg>
            )}
            {/* Hit flash overlay */}
            {brick.hitFlash > 0 && !brick.dying && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'white',
                opacity: brick.hitFlash * 0.5,
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
              {/* Health bar for multi-hit enemies - centered using left/right auto margin */}
              {enemy.maxHealth > 1 && (
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: enemy.width * 0.75,
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
                </div>
              )}
            </div>
          );
        })}

        {/* Enemy Projectiles */}
        {enemyProjectiles.map(proj => (
          <div
            key={proj.id}
            style={{
              position: 'absolute',
              left: proj.x - proj.width/2,
              top: proj.y - proj.height/2,
              width: proj.width,
              height: proj.height,
              borderRadius: proj.type === 'eyeray' ? '50%' : proj.type === 'web' ? '2px' : '4px',
              background: proj.type === 'web'
                ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(200,200,200,0.6) 100%)'
                : proj.type === 'eyeray'
                  ? 'radial-gradient(circle, #ff0000 0%, #ff4444 50%, #990000 100%)'
                  : 'radial-gradient(circle, #ffff00 0%, #ff8800 50%, #ff4400 100%)',
              boxShadow: proj.type === 'web'
                ? '0 0 5px rgba(255,255,255,0.5)'
                : proj.type === 'eyeray'
                  ? '0 0 10px #ff0000, 0 0 20px #ff4444'
                  : '0 0 15px #ff6600, 0 0 25px #ff4400',
              animation: proj.type === 'fire' ? 'flicker 0.1s infinite' : 'none',
            }}
          >
            {proj.type === 'web' && (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'conic-gradient(from 0deg, transparent 0%, white 10%, transparent 20%, white 30%, transparent 40%, white 50%, transparent 60%, white 70%, transparent 80%, white 90%, transparent 100%)',
                borderRadius: '50%',
                opacity: 0.8,
              }} />
            )}
          </div>
        ))}

        {/* Paddle Debuff Indicators */}
        {(paddleDebuffs.petrified > 0 || paddleDebuffs.confused > 0 || paddleDebuffs.webbed > 0) && (
          <div style={{
            position: 'absolute',
            left: paddle.x + paddle.width/2,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 30,
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '5px',
            fontSize: '16px',
            animation: 'pulse 0.5s infinite',
          }}>
            {paddleDebuffs.petrified > 0 && <span title="Petrified!">🗿</span>}
            {paddleDebuffs.confused > 0 && <span title="Confused!">🌀</span>}
            {paddleDebuffs.webbed > 0 && <span title="Webbed!">🕸️</span>}
          </div>
        )}

        {/* Balls with trail effect */}
        {balls.map(ball => {
          // Skip rendering if ball object is malformed
          if (!ball || typeof ball.x !== 'number' || typeof ball.y !== 'number') {
            return null;
          }

          const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM;
          const isAttached = ball.attached === true;

          // For attached balls, ALWAYS position at paddle (ignore stored position)
          // For free balls, use stored position but clamp to valid range
          let ballTop, ballLeft;

          if (isAttached) {
            // Attached: always at paddle
            ballTop = paddleTop - BALL_RADIUS * 2;
            ballLeft = paddle.x + paddle.width / 2 - BALL_RADIUS;
          } else {
            // Free: use stored position
            ballTop = ball.y - BALL_RADIUS;
            ballLeft = ball.x - BALL_RADIUS;

            // Safety: if a "free" ball is in the bottom area where attached balls should be,
            // and its velocity is 0 (hasn't launched), treat it as attached
            if (ballTop > paddleTop - BALL_RADIUS * 3 && Math.abs(ball.vy || 0) < 1) {
              ballTop = paddleTop - BALL_RADIUS * 2;
              ballLeft = paddle.x + paddle.width / 2 - BALL_RADIUS;
            }
          }

          // Determine trail color based on ball state
          // Charged ball: green (0 hits) -> yellow (1 hit) -> red (2 hits) -> white (3+ hits, discharged)
          const chargedHits = ball.chargedHits || 0;
          const trailColor = ball.mega ? '#ffd700'
            : ball.burning ? '#ff6030'
            : ball.charged && chargedHits === 0 ? '#40ff40'  // Green - full charge
            : ball.charged && chargedHits === 1 ? '#ffff40'  // Yellow - after 1st hit
            : ball.charged && chargedHits === 2 ? '#ff4040'  // Red - after 2nd hit
            : '#ffffff';
          const trailIntensity = ball.mega ? 1 : ball.burning ? 0.8 : ball.charged ? 0.7 - chargedHits * 0.1 : 0.3;
          const speed = Math.sqrt((ball.vx || 0) ** 2 + (ball.vy || 0) ** 2);
          const showTrail = !isAttached && speed > 3;

          return (
          <React.Fragment key={ball.id}>
            {/* Ball trail - velocity-based streaks */}
            {showTrail && (
              <>
                {[0.7, 0.5, 0.3].map((opacity, i) => {
                  const trailX = ballLeft - (ball.vx || 0) * 0.1 * (i + 1);
                  const trailY = ballTop - (ball.vy || 0) * 0.1 * (i + 1);
                  const trailSize = BALL_RADIUS * 2 * (0.8 - i * 0.15);
                  return (
                    <div
                      key={`trail-${ball.id}-${i}`}
                      style={{
                        position: 'absolute',
                        left: trailX + (BALL_RADIUS - trailSize / 2),
                        top: trailY + (BALL_RADIUS - trailSize / 2),
                        width: trailSize,
                        height: trailSize,
                        background: `radial-gradient(circle, ${trailColor}${Math.floor(opacity * trailIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                      }}
                    />
                  );
                })}
              </>
            )}

            {/* Main ball */}
            {/* Charged ball colors: green (0 hits) -> yellow (1 hit) -> red (2 hits) -> white (3+ hits) */}
            <div
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
                    : ball.charged && (ball.chargedHits || 0) === 0
                      ? 'radial-gradient(circle, #40ff40 0%, #20cc20 100%)' // Green - full charge
                      : ball.charged && ball.chargedHits === 1
                        ? 'radial-gradient(circle, #ffff40 0%, #cccc20 100%)' // Yellow - after 1st hit
                        : ball.charged && ball.chargedHits === 2
                          ? 'radial-gradient(circle, #ff4040 0%, #cc2020 100%)' // Red - after 2nd hit
                          : 'radial-gradient(circle, #ffffff 0%, #c0c0c0 100%)', // White - normal or discharged
                borderRadius: '50%',
                boxShadow: ball.mega
                  ? '0 0 20px #ffd700, 0 0 40px #ff8800, 0 0 60px #ff4400'
                  : ball.burning
                    ? '0 0 15px #ff6030, 0 0 30px #ff3000'
                    : ball.charged && (ball.chargedHits || 0) === 0
                      ? '0 0 20px #40ff40, 0 0 10px #20cc20'
                      : ball.charged && ball.chargedHits === 1
                        ? '0 0 15px #ffff40, 0 0 8px #cccc20'
                        : ball.charged && ball.chargedHits === 2
                          ? '0 0 12px #ff4040, 0 0 6px #cc2020'
                          : '0 0 10px rgba(255,255,255,0.5)',
                transform: ball.mega ? 'scale(1.5)' : 'scale(1)',
                transition: 'transform 0.2s',
              }}
            />
          </React.Fragment>
        );
        })}

        {/* Ship (Invasion Mode) or Paddle (Normal Mode) or Transformation Animation */}
        {invasionMode ? (
          // Pixel art ship for invasion mode
          <div style={{
            position: 'absolute',
            left: paddle.x + paddle.width / 2 - 32,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 32,
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Pixel art spaceship sprite */}
            <img
              src={SPRITES.ship1}
              alt="Player Ship"
              style={{
                width: 64,
                height: 64,
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 12px #60ff80) drop-shadow(0 0 6px #40cc60)',
                transform: 'rotate(0deg)',
                animation: 'shipReady 1s ease-in-out infinite',
              }}
            />
            {/* Thruster flame effect below ship */}
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 20,
              height: 18,
              background: 'linear-gradient(180deg, #ff8800 0%, #ff4400 30%, #ff2200 60%, transparent 100%)',
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 50% 70%, 0% 100%)',
              animation: 'thrusterFlicker 0.1s infinite',
              opacity: 0.9,
            }} />
          </div>
        ) : invasionPhase === 'paddle_transform' ? (
          // Paddle-to-ship transformation animation
          <div style={{
            position: 'absolute',
            left: paddle.x,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - (paddleTransformProgress * 10),
            width: paddle.width,
            height: PADDLE_HEIGHT + (paddleTransformProgress * 15),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Morphing paddle/ship hybrid */}
            <div style={{
              position: 'relative',
              width: `${paddle.width * (1 - paddleTransformProgress * 0.5)}px`,
              height: `${PADDLE_HEIGHT + paddleTransformProgress * 20}px`,
              background: `linear-gradient(180deg,
                ${paddleTransformProgress > 0.3 ? '#80ffaa' : '#6080ff'} 0%,
                ${paddleTransformProgress > 0.5 ? '#40cc60' : '#4060cc'} 50%,
                ${paddleTransformProgress > 0.7 ? '#209940' : '#304090'} 100%)`,
              borderRadius: paddleTransformProgress < 0.5
                ? '6px'
                : `${6 + paddleTransformProgress * 10}px ${6 + paddleTransformProgress * 10}px 4px 4px`,
              transform: `scaleY(${1 + paddleTransformProgress * 0.3}) perspective(100px) rotateX(${paddleTransformProgress * 10}deg)`,
              boxShadow: `0 0 ${10 + paddleTransformProgress * 20}px ${paddleTransformProgress > 0.5 ? '#60ff80' : '#6080ff'}`,
              transition: 'background 0.1s',
              clipPath: paddleTransformProgress > 0.6
                ? `polygon(50% 0%, ${100 - paddleTransformProgress * 15}% 60%, 100% 100%, 0% 100%, ${paddleTransformProgress * 15}% 60%)`
                : 'none',
            }}>
              {/* Emerging cockpit */}
              {paddleTransformProgress > 0.4 && (
                <div style={{
                  position: 'absolute',
                  top: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: `${8 + paddleTransformProgress * 6}px`,
                  height: `${8 + paddleTransformProgress * 6}px`,
                  background: 'radial-gradient(circle at 30% 30%, #ffffff, #80ffff)',
                  borderRadius: '50%',
                  opacity: (paddleTransformProgress - 0.4) / 0.6,
                  boxShadow: '0 0 10px #80ffff',
                }} />
              )}
              {/* Emerging wings */}
              {paddleTransformProgress > 0.5 && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: -5 - paddleTransformProgress * 10,
                    width: 10 + paddleTransformProgress * 8,
                    height: 12,
                    background: 'linear-gradient(90deg, #209940, #40cc60)',
                    opacity: (paddleTransformProgress - 0.5) / 0.5,
                    clipPath: 'polygon(100% 0%, 100% 100%, 0% 70%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    right: -5 - paddleTransformProgress * 10,
                    width: 10 + paddleTransformProgress * 8,
                    height: 12,
                    background: 'linear-gradient(-90deg, #209940, #40cc60)',
                    opacity: (paddleTransformProgress - 0.5) / 0.5,
                    clipPath: 'polygon(0% 0%, 0% 100%, 100% 70%)',
                  }} />
                </>
              )}
              {/* Emerging cannon */}
              {paddleTransformProgress > 0.7 && (
                <div style={{
                  position: 'absolute',
                  top: -paddleTransformProgress * 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 5,
                  height: paddleTransformProgress * 10,
                  background: 'linear-gradient(180deg, #ffcc00, #ff8800)',
                  borderRadius: '3px 3px 0 0',
                  opacity: (paddleTransformProgress - 0.7) / 0.3,
                  boxShadow: '0 0 8px #ffcc00',
                }} />
              )}
            </div>
            {/* Transformation particles */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${10 + (i * 12)}%`,
                  top: `${50 + Math.sin(paddleTransformProgress * Math.PI * 4 + i) * 30}%`,
                  width: 4,
                  height: 4,
                  background: i % 2 === 0 ? '#60ff80' : '#80ffff',
                  borderRadius: '50%',
                  opacity: Math.sin(paddleTransformProgress * Math.PI) * 0.8,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? '#60ff80' : '#80ffff'}`,
                }} />
              ))}
            </div>
            {/* "TRANSFORMING" text */}
            <div style={{
              position: 'absolute',
              top: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#60ff80',
              textShadow: '0 0 10px #60ff80',
              whiteSpace: 'nowrap',
              animation: 'pulse 0.3s infinite',
            }}>
              ⚡ TRANSFORMING ⚡
            </div>
          </div>
        ) : (
        // Normal paddle
        (() => {
          // Calculate paddle health ratio (30px = dead, 120px = full, 200px = max)
          const healthRatio = Math.min(1, (paddle.width - 30) / 90); // 0-1 scale
          const isLowHealth = healthRatio < 0.33;
          const isMedHealth = healthRatio < 0.66;

          // Charging shrink effect (up to 8% smaller at full charge)
          const chargeShrink = isCharging && balls.some(b => b.attached)
            ? 1 - (chargeLevel / 100) * 0.08
            : 1;

          // Health-based colors (override with charge color when charging)
          const healthGradient = isCharging && balls.some(b => b.attached)
            ? chargeLevel > 50
              ? 'linear-gradient(180deg, #ffd700, #ff8800)' // Gold when high charge
              : 'linear-gradient(180deg, #4080e0, #3060b0)' // Blue when charging
            : activeEffects.includes('frozen')
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

          const healthGlow = isCharging && balls.some(b => b.attached)
            ? chargeLevel > 50
              ? '0 0 20px #ffd700'
              : '0 0 15px #4080e0'
            : activeEffects.includes('frozen')
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
              left: 0,
              top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM,
              width: paddle.width,
              height: PADDLE_HEIGHT,
              background: healthGradient,
              borderRadius: '6px',
              boxShadow: healthGlow,
              transform: `translateX(${paddle.x}px) scaleX(${chargeShrink})`,
              transformOrigin: 'center',
              willChange: 'transform', // Hint to browser for GPU acceleration
              transition: 'transform 0.1s, background 0.2s',
            }} />
          );
        })())}

        {/* Containment Field effect when weapon is charging */}
        {containmentField && (
          <div style={{
            position: 'absolute',
            left: paddle.x - 10,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - 30,
            width: paddle.width + 20,
            height: 50,
            background: `radial-gradient(ellipse at center bottom, ${activeWeapon && WEAPONS[activeWeapon] ? WEAPONS[activeWeapon].color : '#ffd700'}44 0%, transparent 70%)`,
            border: `2px solid ${activeWeapon && WEAPONS[activeWeapon] ? WEAPONS[activeWeapon].color : '#ffd700'}88`,
            borderRadius: '50% 50% 10% 10%',
            boxShadow: `0 0 20px ${activeWeapon && WEAPONS[activeWeapon] ? WEAPONS[activeWeapon].color : '#ffd700'}66, inset 0 0 15px ${activeWeapon && WEAPONS[activeWeapon] ? WEAPONS[activeWeapon].color : '#ffd700'}44`,
            animation: 'teddyReady 0.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Ship projectiles - pixel art */}
        {invasionMode && shipProjectiles.map(proj => (
          <div key={proj.id} style={{
            position: 'absolute',
            left: proj.x - 8,
            top: proj.y - 12,
            width: 16,
            height: 24,
          }}>
            <img
              src={SPRITES.shot1}
              alt="Projectile"
              style={{
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 6px #80ffff) drop-shadow(0 0 3px #40ff80)',
              }}
            />
          </div>
        ))}

        {/* Twin Paddle (Teddy Split ability) */}
        {twinPaddle?.active && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM,
            width: paddle.width,
            height: PADDLE_HEIGHT,
            background: 'linear-gradient(180deg, #ff80ff, #c060c0)',
            borderRadius: '6px',
            boxShadow: '0 0 20px #ff80ff',
            opacity: 0.9,
            transform: `translateX(${CANVAS_WIDTH - paddle.x - paddle.width}px)`,
            willChange: 'transform',
          }} />
        )}

        {/* Charge bar when holding space with attached ball */}
        {isCharging && balls.some(b => b.attached) && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: CANVAS_HEIGHT - PADDLE_HEIGHT - 25,
            width: paddle.width,
            height: 6,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '3px',
            overflow: 'hidden',
            transform: `translateX(${paddle.x}px)`,
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

        {/* Shield indicator - positioned just below paddle area */}
        {activeEffects.includes('shield') && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: CANVAS_HEIGHT - 8,
            width: '100%',
            height: 4,
            background: 'linear-gradient(90deg, transparent, #4080ff, transparent)',
            boxShadow: '0 0 10px #4080ff',
          }} />
        )}

        {/* Teddy Barrier indicator - golden safety net */}
        {activeEffects.includes('teddy_barrier') && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: CANVAS_HEIGHT - 10,
            width: '100%',
            height: 6,
            background: 'linear-gradient(90deg, transparent 5%, #ffd700 30%, #ffaa00 50%, #ffd700 70%, transparent 95%)',
            boxShadow: '0 0 15px #ffd700, 0 0 30px rgba(255, 215, 0, 0.5)',
            animation: 'barrierPulse 1s ease-in-out infinite',
          }} />
        )}

        {/* Particles */}
        {particles.map(p => {
          // For chunks, use actual brick dimensions so clip-path works correctly
          const pWidth = p.isChunk && p.chunkWidth ? p.chunkWidth : p.size;
          const pHeight = p.isChunk && p.chunkHeight ? p.chunkHeight
            : p.isArmorShard ? p.size * 0.5
            : p.isShard ? p.size * 0.6
            : p.isBrickShard ? p.size * 0.7
            : p.size;

          return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x - pWidth / 2,
              top: p.y - pHeight / 2,
              width: pWidth,
              height: pHeight,
              background: p.isDissolve
                ? `radial-gradient(circle, ${p.color} 0%, ${p.color}88 50%, transparent 100%)`
                : p.isSparkle
                  ? `radial-gradient(circle, ${p.color} 0%, transparent 70%)`
                  : p.isChunk
                    ? `linear-gradient(180deg, ${p.color}ee 0%, ${p.color} 50%, ${p.color}aa 100%)`
                  : p.isArmorShard
                    ? `linear-gradient(135deg, ${p.color} 0%, ${p.color}cc 50%, ${p.color}88 100%)`
                    : p.color,
              borderRadius: p.isChunk ? '4px'
                : p.isArmorShard ? '2px'
                : p.isShard ? '2px'
                : p.isBrickShard ? '3px'
                : p.isDissolve ? '50%'
                : '50%',
              clipPath: p.clipPath || 'none',
              opacity: p.isDissolve
                ? Math.min(p.life * 1.5, 1)
                : p.isChunk
                  ? Math.min(p.life * 0.6, 1)
                  : p.isArmorShard
                    ? Math.min(p.life * 0.8, 1)
                    : Math.min(p.life, 1) * (p.isSparkle ? 1.5 : 1),
              pointerEvents: 'none',
              transform: (p.isShard || p.isBrickShard || p.isArmorShard || p.isChunk)
                ? `rotate(${p.rotation || 0}deg)`
                : 'none',
              boxShadow: p.isSparkle
                ? `0 0 ${p.size}px ${p.color}`
                : p.isChunk
                  ? `0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)`
                  : p.isArmorShard
                    ? `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`
                    : p.isShard || p.isBrickShard
                      ? '0 2px 4px rgba(0,0,0,0.3)'
                      : 'none',
              border: p.isChunk ? `2px solid ${p.color}`
                : p.isArmorShard ? `1px solid ${p.color}`
                : 'none',
            }}
          />
        );})}

        {/* Weapon Projectiles */}
        {weaponProjectiles.map(proj => {
          if (proj.type === 'bubble_wand') {
            return (
              <div
                key={proj.id}
                style={{
                  position: 'absolute',
                  left: proj.x - (proj.size || 15) / 2,
                  top: proj.y - (proj.size || 15) / 2,
                  width: proj.size || 15,
                  height: proj.size || 15,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${proj.color}66, ${proj.color}33)`,
                  border: `2px solid ${proj.color}88`,
                  boxShadow: `0 0 10px ${proj.color}44, inset 0 0 5px rgba(255,255,255,0.5)`,
                  opacity: proj.life,
                  pointerEvents: 'none',
                }}
              />
            );
          } else if (proj.type === 'gravity_anchor') {
            return (
              <div key={proj.id} style={{ position: 'absolute', left: proj.x - 15, top: proj.y - 20, pointerEvents: 'none' }}>
                <div style={{ fontSize: '30px', filter: `drop-shadow(0 0 10px ${proj.color})` }}>⚓</div>
                <div style={{
                  position: 'absolute',
                  left: -45,
                  top: -35,
                  width: proj.gravityRadius * 2,
                  height: proj.gravityRadius * 2,
                  borderRadius: '50%',
                  border: `2px dashed ${proj.color}66`,
                  animation: 'portalSpin 3s linear infinite',
                  opacity: (proj.duration || 0) / 180,
                }} />
              </div>
            );
          } else if (proj.type === 'prism_beam') {
            return (
              <div
                key={proj.id}
                style={{
                  position: 'absolute',
                  left: proj.x - 3,
                  top: proj.y - 20,
                  width: 6,
                  height: proj.beamLength || 40,
                  background: `linear-gradient(180deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)`,
                  boxShadow: `0 0 15px ${proj.color}, 0 0 30px ${proj.color}88`,
                  opacity: proj.life,
                  pointerEvents: 'none',
                  borderRadius: '3px',
                }}
              />
            );
          } else if (proj.type === 'vine_launcher') {
            return (
              <div
                key={proj.id}
                style={{
                  position: 'absolute',
                  left: proj.x - 8,
                  top: proj.y - 15,
                  fontSize: '24px',
                  filter: `drop-shadow(0 0 8px ${proj.color})`,
                  opacity: proj.life,
                  pointerEvents: 'none',
                }}
              >🌿</div>
            );
          } else if (proj.type === 'echo_pulse') {
            return (
              <div
                key={proj.id}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: proj.y - 15,
                  width: CANVAS_WIDTH,
                  height: 30,
                  background: `linear-gradient(180deg, transparent, ${proj.color}66, ${proj.color}, ${proj.color}66, transparent)`,
                  boxShadow: `0 0 20px ${proj.color}88`,
                  opacity: proj.life,
                  pointerEvents: 'none',
                }}
              />
            );
          }
          return null;
        })}

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

        {/* Launch State Widget - clean prompt near paddle */}
        {balls.some(b => b.attached) && (
          <div style={{
            position: 'absolute',
            left: paddle.x + paddle.width / 2,
            bottom: 90,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeInUp 0.3s ease-out',
            pointerEvents: 'none',
          }}>
            {/* Charge indicator ring */}
            {isCharging && (
              <div style={{
                position: 'relative',
                width: '50px',
                height: '50px',
                marginBottom: '4px',
              }}>
                <svg width="50" height="50" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background ring */}
                  <circle
                    cx="25" cy="25" r="20"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  {/* Charge fill ring */}
                  <circle
                    cx="25" cy="25" r="20"
                    fill="none"
                    stroke={chargeLevel > 50 ? '#ffd700' : '#4080e0'}
                    strokeWidth="4"
                    strokeDasharray={`${(chargeLevel / 100) * 125.6} 125.6`}
                    style={{ transition: 'stroke-dasharray 0.1s, stroke 0.2s' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: chargeLevel > 50 ? '#ffd700' : '#fff',
                }}>
                  {Math.floor(chargeLevel)}%
                </div>
              </div>
            )}

            {/* Launch prompt */}
            <div style={{
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#fff',
                textAlign: 'center',
                letterSpacing: '0.5px',
              }}>
                {isCharging ? (
                  <span style={{ color: chargeLevel > 50 ? '#ffd700' : '#4080e0' }}>
                    Release to fire!
                  </span>
                ) : (
                  <>Hold <span style={{ color: '#ffd700', fontWeight: '800' }}>SPACE</span> to charge</>
                )}
              </div>
              {!isCharging && (
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'center' }}>
                  or CLICK to quick launch
                </div>
              )}
            </div>
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

      {/* Weapon HUD - shows available weapons */}
      {Object.keys(weaponAmmo).some(k => weaponAmmo[k] > 0) && (
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '8px',
        }}>
          {Object.entries(WEAPONS).map(([id, weapon], index) => {
            const ammo = weaponAmmo[id] || 0;
            if (ammo <= 0) return null;
            const isActive = activeWeapon === id;
            return (
              <div
                key={id}
                onClick={() => setActiveWeapon(isActive ? null : id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: isActive ? `${weapon.color}44` : 'rgba(0,0,0,0.3)',
                  border: isActive ? `2px solid ${weapon.color}` : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '12px', color: '#666' }}>{index + 1}</span>
                <span style={{ fontSize: '16px', filter: isActive ? `drop-shadow(0 0 4px ${weapon.color})` : 'none' }}>
                  {weapon.emoji}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: isActive ? weapon.color : '#888' }}>
                  ×{ammo}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls hint - minimal */}
      <div style={{
        marginTop: '8px',
        color: '#4a4a6a',
        fontSize: '10px',
        textAlign: 'center',
        opacity: 0.8,
      }}>
        MOUSE/A·D to move • SPACE to charge • Q/W/E abilities • 1-5 weapons • F fire • ESC pause
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
        @keyframes barrierPulse {
          0%, 100% { opacity: 0.8; box-shadow: 0 0 15px #ffd700, 0 0 30px rgba(255, 215, 0, 0.5); }
          50% { opacity: 1; box-shadow: 0 0 25px #ffd700, 0 0 50px rgba(255, 215, 0, 0.7); }
        }
        @keyframes comboPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes teddyReady {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes abilityPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes dangerPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes thrusterFlicker {
          0%, 100% { opacity: 1; height: 12px; }
          50% { opacity: 0.7; height: 8px; }
        }
        @keyframes invasionPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes alertShake {
          0%, 100% { transform: translate(-50%, -50%) rotate(-2deg); }
          50% { transform: translate(-50%, -50%) rotate(2deg); }
        }
        @keyframes alertPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes tractorBeam {
          0%, 100% { opacity: 0.6; transform: scaleX(1); }
          50% { opacity: 0.9; transform: scaleX(1.1); }
        }
        @keyframes ufoHover {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes ufoHit {
          0%, 100% { transform: translateX(-3px) rotate(-5deg); }
          50% { transform: translateX(3px) rotate(5deg); }
        }
        @keyframes morphGlow {
          0%, 100% { box-shadow: 0 0 10px currentColor; }
          50% { box-shadow: 0 0 30px currentColor, 0 0 50px currentColor; }
        }
        @keyframes shipReady {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.02); filter: brightness(1.2); }
        }
      `}</style>
    </div>
  );
  }

  const renderMenu = () => {
    // Find the last played / highest unlocked world for Continue feature
    const lastPlayedWorld = enemyDefs.find(e => stats.highestLevels[e.id] > 0) || enemyDefs[0];
    const lastPlayedLevel = stats.highestLevels[lastPlayedWorld?.id] || 1;
    const lastPlayedScore = stats.highScores[lastPlayedWorld?.id] || 0;

    // Calculate next unlock milestone
    const nextUnlockStars = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].find(s => s > stats.stars) || 100;
    const progressToNext = nextUnlockStars > 0 ? (stats.stars / nextUnlockStars) * 100 : 100;

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#fff',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(64, 128, 224, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)
        `,
        animation: 'backgroundShift 20s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(64, 128, 224, 0.3)',
              animation: `floatParticle ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Logo section */}
      <div style={{
        fontSize: '90px',
        marginBottom: '12px',
        animation: 'teddyBounce 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 30px rgba(139, 90, 43, 0.5))',
      }}>🧸</div>
      <h1 style={{
        fontSize: '56px',
        fontWeight: '900',
        marginBottom: '6px',
        background: 'linear-gradient(135deg, #d2691e 0%, #ffd700 50%, #8b4513 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
        letterSpacing: '2px',
      }}>TEDDYBALL</h1>
      <p style={{ color: '#7a7a9a', marginBottom: '24px', fontSize: '14px', letterSpacing: '1px' }}>
        Dash, Spin, Charge, and Smash!
      </p>

      {/* Continue Card - shows last progress */}
      {stats.gamesPlayed > 0 && (
        <div
          onClick={() => {
            setSelectedEnemy(lastPlayedWorld);
            setGameState('levelSelect');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, rgba(139, 90, 43, 0.2), rgba(139, 90, 43, 0.1))',
            borderRadius: '14px',
            border: '2px solid rgba(139, 90, 43, 0.4)',
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '320px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.6)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 90, 43, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(139, 90, 43, 0.4)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '36px' }}>{lastPlayedWorld?.emoji}</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: '#8b5a2b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
              Continue
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              {lastPlayedWorld?.name} • Lv.{lastPlayedLevel}
            </div>
            {lastPlayedScore > 0 && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                Best: {lastPlayedScore.toLocaleString()}
              </div>
            )}
          </div>
          <div style={{ fontSize: '24px', color: '#ffd700' }}>▶</div>
        </div>
      )}

      {/* Progression Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 215, 0, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '22px' }}>⭐</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#ffd700' }}>{stats.stars}</span>
        </div>

        {/* Progress bar to next unlock */}
        <div style={{
          width: '120px',
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressToNext}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ fontSize: '11px', color: '#888' }}>
          <span style={{ color: '#ffd700' }}>{nextUnlockStars - stats.stars}</span> to next unlock
        </div>
      </div>

      {/* Main buttons */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          onClick={() => setGameState('select')}
          style={{
            padding: '18px 44px',
            fontSize: '18px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4080e0, #6040a0)',
            border: 'none',
            borderRadius: '14px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 6px 25px rgba(64, 128, 224, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 35px rgba(64, 128, 224, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(64, 128, 224, 0.4)';
          }}
        >
          🎮 Play
        </button>

        <button
          onClick={() => setGameState('shop')}
          style={{
            padding: '18px 44px',
            fontSize: '18px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffd700, #ff8800)',
            border: 'none',
            borderRadius: '14px',
            color: '#1a1a2e',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 6px 25px rgba(255, 215, 0, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 35px rgba(255, 215, 0, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.4)';
          }}
        >
          🛒 Shop
        </button>
      </div>

      {/* Level Editor button - only visible when debugMode is on */}
      {debugMode && levelEditorEnabled && (
        <button
          onClick={() => setGameState('levelEditor')}
          style={{
            marginTop: '16px',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #8b5a2b, #d2691e)',
            border: '2px solid #ffd700',
            borderRadius: '10px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(139, 90, 43, 0.5)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 90, 43, 0.7)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 90, 43, 0.5)';
          }}
        >
          🔧 Level Editor
        </button>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginTop: '12px',
        color: '#5a5a7a',
        fontSize: '12px',
      }}>
        <span>🎮 {stats.gamesPlayed} Games</span>
        <span>🏆 {stats.levelsCompleted} Levels</span>
      </div>

      {/* Back button */}
      <button
        onClick={() => window.location.href = 'menu.html'}
        style={{
          marginTop: '24px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: '#6a6a8a',
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.color = '#aaa';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = '#6a6a8a';
        }}
      >
        ← Back to Menu
      </button>

      {/* Debug Mode Toggle */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 16px',
          background: debugMode ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 100, 100, 0.3)',
          border: debugMode ? '2px solid #ff6666' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: '6px',
          color: debugMode ? '#fff' : '#666',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: debugMode ? '700' : '400',
          transition: 'all 0.2s',
        }}
      >
        🔧 DEBUG {debugMode ? 'ON' : 'OFF'}
      </button>

      <style>{`
        @keyframes teddyBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          25% { transform: translateY(-10px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(5deg); }
          75% { transform: translateY(-10px) rotate(0deg); }
        }
        @keyframes backgroundShift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
    );
  };

  // State for hovered world in select screen
  const [hoveredWorld, setHoveredWorld] = React.useState(null);

  const renderEnemySelect = () => {
    // Get the previewed world (hovered or first unlocked)
    const previewWorld = hoveredWorld || enemyDefs.find((_, idx) => isEnemyUnlocked(idx)) || enemyDefs[0];
    const previewIdx = enemyDefs.findIndex(e => e.id === previewWorld.id);
    const previewUnlocked = isEnemyUnlocked(previewIdx);
    const previewHighestLevel = stats.highestLevels[previewWorld.id] || 0;
    const previewTotalStars = getTotalStarsForEnemy(previewWorld.id);
    const previewMaxStars = MAX_LEVELS * 3;
    const previewBestScore = stats.highScores[previewWorld.id] || 0;
    const previewDifficulty = previewIdx + 1; // 1-10 difficulty based on world order

    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '4px',
          color: '#fff',
          textShadow: '0 0 20px rgba(64, 128, 224, 0.3)',
        }}>Select World</h2>
        <p style={{ color: '#666', fontSize: '12px' }}>Choose your challenge</p>
      </div>

      {/* Main content - Chapter Select Layout */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flex: 1,
        width: '100%',
        maxWidth: '1100px',
        overflow: 'hidden',
      }}>
        {/* Left: World Cards (60%) */}
        <div style={{
          flex: '0 0 55%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          paddingRight: '8px',
        }}>
          {enemyDefs.map((enemy, idx) => {
            const isUnlocked = isEnemyUnlocked(idx);
            const highestLevel = stats.highestLevels[enemy.id] || 0;
            const totalLevelStars = getTotalStarsForEnemy(enemy.id);
            const maxPossibleStars = MAX_LEVELS * 3;
            const isPerfected = totalLevelStars >= maxPossibleStars;
            const isAllLevelsComplete = highestLevel >= MAX_LEVELS;
            const isHovered = hoveredWorld?.id === enemy.id;
            const prevEnemy = enemyDefs[idx - 1];
            const prevStars = prevEnemy ? getTotalStarsForEnemy(prevEnemy.id) : 0;
            const starsNeeded = 10; // Need 10 stars from previous world

            return (
              <div
                key={enemy.id}
                onClick={() => isUnlocked && selectEnemy(enemy)}
                onMouseEnter={() => setHoveredWorld(enemy)}
                onMouseLeave={() => setHoveredWorld(null)}
                style={{
                  position: 'relative',
                  background: isHovered
                    ? `linear-gradient(135deg, ${enemy.color}15, rgba(25,28,40,0.95))`
                    : 'rgba(25,28,40,0.85)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: isHovered
                    ? `2px solid ${enemy.color}60`
                    : '2px solid transparent',
                  transform: isHovered ? 'translateX(4px)' : 'none',
                  overflow: 'hidden',
                }}
              >
                {/* World color accent strip */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: isUnlocked
                    ? `linear-gradient(180deg, ${enemy.color}, ${enemy.color}80)`
                    : 'rgba(100,100,100,0.3)',
                }} />

                {/* Lock strip for locked worlds - keep theme visible */}
                {!isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '100px',
                    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    zIndex: 5,
                  }}>
                    <span style={{ fontSize: '14px' }}>🔒</span>
                    <span style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>
                      {prevStars}/{starsNeeded}★
                    </span>
                  </div>
                )}

                {/* Content */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingLeft: '8px',
                  opacity: isUnlocked ? 1 : 0.7,
                }}>
                  {/* Enemy Avatar */}
                  <div style={{
                    fontSize: '32px',
                    filter: isUnlocked ? `drop-shadow(0 0 8px ${enemy.color}60)` : 'grayscale(0.3)',
                    transition: 'filter 0.2s',
                  }}>{enemy.emoji}</div>

                  {/* Enemy Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '15px',
                        color: isUnlocked ? '#fff' : '#999',
                      }}>{enemy.name}</span>
                      {isPerfected && <span style={{ fontSize: '12px' }}>👑</span>}
                      {isAllLevelsComplete && !isPerfected && <span style={{ fontSize: '11px', color: '#4a4' }}>✓</span>}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: isUnlocked ? enemy.color : '#666',
                      fontWeight: '600',
                    }}>
                      {enemy.title}
                    </div>
                  </div>

                  {/* Progress - always visible */}
                  <div style={{
                    textAlign: 'right',
                    minWidth: '50px',
                    opacity: isUnlocked ? 1 : 0.5,
                  }}>
                    {isUnlocked ? (
                      <>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: enemy.color }}>
                          {highestLevel}<span style={{ fontSize: '10px', color: '#444' }}>/{MAX_LEVELS}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#ffd700' }}>
                          {totalLevelStars}★
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#555' }}>
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected World Panel (45%) */}
        <div style={{
          flex: '0 0 45%',
          background: 'rgba(20,22,35,0.95)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          border: `2px solid ${previewWorld.color}30`,
          boxShadow: `0 0 40px ${previewWorld.color}10, inset 0 0 60px rgba(0,0,0,0.3)`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}>
          {/* Big Emblem */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '72px',
              filter: previewUnlocked
                ? `drop-shadow(0 0 20px ${previewWorld.color})`
                : 'grayscale(0.5)',
              marginBottom: '8px',
              animation: previewUnlocked ? 'worldEmblemFloat 3s ease-in-out infinite' : 'none',
            }}>
              {previewWorld.emoji}
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: previewUnlocked ? previewWorld.color : '#666',
              marginBottom: '4px',
              textAlign: 'center',
            }}>{previewWorld.name}</h3>
            <span style={{
              fontSize: '13px',
              color: previewUnlocked ? '#aaa' : '#555',
              fontStyle: 'italic',
            }}>{previewWorld.title}</span>
          </div>

          {/* Signature Mechanic */}
          <div style={{
            background: `linear-gradient(135deg, ${previewWorld.color}15, rgba(0,0,0,0.3))`,
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px',
            border: `1px solid ${previewWorld.color}30`,
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Signature Mechanic
            </div>
            <div style={{ fontSize: '14px', color: '#fff', lineHeight: '1.4' }}>
              {previewWorld.gimmickDesc}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            {/* Difficulty */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
                Difficulty
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      background: i < Math.ceil(previewDifficulty / 2)
                        ? previewDifficulty <= 4 ? '#4a4' : previewDifficulty <= 7 ? '#da4' : '#d44'
                        : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
                Progress
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: previewWorld.color }}>
                {previewUnlocked ? `${previewHighestLevel}/${MAX_LEVELS}` : '—'}
              </div>
            </div>

            {/* Stars */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
                Stars
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffd700' }}>
                {previewUnlocked ? `${previewTotalStars}/${previewMaxStars} ⭐` : '—'}
              </div>
            </div>

            {/* Best Score */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
                Best Score
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                {previewUnlocked && previewBestScore > 0 ? previewBestScore.toLocaleString() : '—'}
              </div>
            </div>
          </div>

          {/* Rewards/Unlocks hint */}
          {previewUnlocked && previewTotalStars < previewMaxStars && (
            <div style={{
              background: 'rgba(255,215,0,0.1)',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '16px',
              border: '1px solid rgba(255,215,0,0.2)',
              fontSize: '11px',
              color: '#ffd700',
              textAlign: 'center',
            }}>
              🌟 Earn {previewMaxStars - previewTotalStars} more stars to master this world!
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* CTA Button */}
          {previewUnlocked ? (
            <button
              onClick={() => selectEnemy(previewWorld)}
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '800',
                background: `linear-gradient(135deg, ${previewWorld.color}, ${previewWorld.color}cc)`,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 20px ${previewWorld.color}40`,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = `0 6px 30px ${previewWorld.color}60`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${previewWorld.color}40`;
              }}
            >
              ▶ Start
            </button>
          ) : (
            <div style={{
              padding: '16px 32px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'rgba(100,100,100,0.3)',
              borderRadius: '12px',
              color: '#666',
              textAlign: 'center',
            }}>
              🔒 Complete {enemyDefs[previewIdx - 1]?.name} to unlock
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => setGameState('menu')}
        style={{
          marginTop: '16px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: '#666',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#aaa'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#666'; }}
      >
        ← Back to Menu
      </button>

      <style>{`
        @keyframes worldEmblemFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
    );
  };

  // Generate mini preview grid for a level
  const renderLevelPreview = (level, color, isLocked, enemyId) => {
    // Get level definition from LEVEL_DEFINITIONS
    const enemyLevels = LEVEL_DEFINITIONS[enemyId] || LEVEL_DEFINITIONS.brick_goblin;
    const levelIndex = Math.min(level - 1, enemyLevels.length - 1);
    const levelDef = enemyLevels[levelIndex];

    const PREVIEW_COLS = 12; // Match level definition width
    const PREVIEW_ROWS = levelDef.length;

    // Color mapping for brick types and pinball features
    const getBrickColor = (char, baseColor) => {
      if (isLocked) {
        switch (char) {
          case '#': return '#222';
          case 'X': return '#331111';
          case '*': return '#112211';
          case 'O': return '#333'; // Bumper
          case '@': return '#224'; // Portal
          case 'S': return '#322'; // Spawner point
          case 'P': return '#221133'; // Split brick
          case 'F': return '#112233'; // Frozen brick
          case 'E': return '#223311'; // Enemy spawner brick
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
        case 'O': return '#ffcc44'; // Bumper - yellow
        case '@': return '#4488ff'; // Portal - blue
        case 'S': return '#aa44aa'; // Spawner point - purple
        case 'P': return '#cc88ee'; // Split brick - light purple
        case 'F': return '#88ddff'; // Frozen brick - ice blue
        case 'E': return '#44cc66'; // Enemy spawner brick - green glow
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
        case 'O': return 1; // Bumper
        case '@': return 0.8; // Portal
        case 'S': return 1; // Spawner point
        case 'P': return 0.9; // Split brick
        case 'F': return 0.85; // Frozen brick
        case 'E': return 1; // Enemy spawner brick
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

  // === LEVEL EDITOR ===
  const renderLevelEditor = () => {
    // Brick type palette with colors and descriptions
    const brickPalette = [
      { char: '.', name: 'Empty', color: 'transparent', emoji: '⬜' },
      { char: '1', name: '1-Hit', color: '#44ff44', emoji: '🟩' },
      { char: '2', name: '2-Hit', color: '#88ff44', emoji: '🟨' },
      { char: '3', name: '3-Hit', color: '#ffaa00', emoji: '🟧' },
      { char: '#', name: 'Obstacle', color: '#3a3a5e', emoji: '🧱' },
      { char: '*', name: 'Random Powerup', color: '#ffd700', emoji: '⭐' },
      { char: 'X', name: 'Explosive', color: '#ff4400', emoji: '💥' },
      { char: 'F', name: 'Frozen', color: '#88ddff', emoji: '❄️' },
      { char: 'P', name: 'Split', color: '#aa66cc', emoji: '💜' },
      { char: 'E', name: 'Spawner', color: '#44aa44', emoji: '👾' },
      { char: 'O', name: 'Bumper', color: '#ff6600', emoji: '🔴' },
      { char: '@', name: 'Portal', color: '#8800ff', emoji: '🌀' },
      // Specific powerup bricks
      { char: 'e', name: 'Expand', color: '#50c878', emoji: '📏' },
      { char: 'm', name: 'Multi-Ball', color: '#ffd700', emoji: '✨' },
      { char: 'l', name: 'Life', color: '#ff4444', emoji: '❤️' },
      { char: 'z', name: 'Laser', color: '#ff00ff', emoji: '🔫' },
      { char: 'h', name: 'Shield', color: '#4080ff', emoji: '🛡️' },
      { char: 'g', name: 'Magnet', color: '#4080e0', emoji: '🧲' },
      { char: 'M', name: 'Mega Ball', color: '#ffd700', emoji: '💫' },
      { char: 's', name: 'Slow', color: '#80c0ff', emoji: '🐌' },
      // Weapon bricks
      { char: 'B', name: 'Bubble Wand', color: '#88ddff', emoji: '🫧' },
      { char: 'A', name: 'Gravity Anchor', color: '#4a6fa5', emoji: '⚓' },
      { char: 'R', name: 'Prism Beam', color: '#ff88ff', emoji: '💎' },
      { char: 'V', name: 'Vine Launcher', color: '#44aa44', emoji: '🌿' },
      { char: 'W', name: 'Echo Pulse', color: '#ffaa00', emoji: '🔊' },
    ];

    const handleCellClick = (row, col) => {
      setEditorLevel(prev => {
        const newLevel = [...prev];
        const rowStr = newLevel[row] || '.'.repeat(12);
        const chars = rowStr.split('');
        chars[col] = editorSelectedTool;
        newLevel[row] = chars.join('');
        return newLevel;
      });
    };

    const handleSaveLevel = () => {
      const key = `${editorSelectedEnemy}_${editorLevelNumber}`;
      const newCustomLevels = {
        ...customLevels,
        [editorSelectedEnemy]: {
          ...customLevels[editorSelectedEnemy],
          [editorLevelNumber]: editorLevel,
        }
      };
      setCustomLevels(newCustomLevels);
      localStorage.setItem('teddyball_custom_levels', JSON.stringify(newCustomLevels));
      addFloatingText(CANVAS_WIDTH / 2, 100, '✓ Level Saved!', '#44ff44');
    };

    const handleLoadLevel = () => {
      const customLevel = customLevels[editorSelectedEnemy]?.[editorLevelNumber];
      if (customLevel) {
        setEditorLevel(customLevel);
        addFloatingText(CANVAS_WIDTH / 2, 100, '✓ Custom Level Loaded', '#4080e0');
      } else {
        // Load default level
        const defaultLevels = LEVEL_DEFINITIONS[editorSelectedEnemy] || LEVEL_DEFINITIONS.brick_goblin;
        const defaultLevel = defaultLevels[editorLevelNumber - 1] || Array(6).fill('.'.repeat(12));
        setEditorLevel(defaultLevel);
        addFloatingText(CANVAS_WIDTH / 2, 100, '✓ Default Level Loaded', '#ffaa00');
      }
    };

    const handleClearLevel = () => {
      setEditorLevel(Array(6).fill('.'.repeat(12)));
    };

    const handleExportLevel = () => {
      const levelCode = editorLevel.map(row => `'${row}'`).join(',\n      ');
      const output = `// Level ${editorLevelNumber} for ${editorSelectedEnemy}\n[\n      ${levelCode},\n],`;
      navigator.clipboard.writeText(output);
      addFloatingText(CANVAS_WIDTH / 2, 100, '📋 Copied to clipboard!', '#ffd700');
    };

    const handleTestLevel = () => {
      // Start playing with the current editor level
      setSelectedEnemy(enemyDefs.find(e => e.id === editorSelectedEnemy) || enemyDefs[0]);
      setCurrentLevel(editorLevelNumber);
      // Temporarily use custom level
      const testBricks = [];
      editorLevel.forEach((rowStr, row) => {
        for (let col = 0; col < rowStr.length && col < 12; col++) {
          const char = rowStr[col];
          if (char === '.') continue;
          const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
          const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
          const palette = brickPalette.find(p => p.char === char);
          testBricks.push({
            id: `${row}-${col}`,
            x, y,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            health: char === '3' ? 3 : char === '2' ? 2 : char === '#' ? 9999 : 1,
            maxHealth: char === '3' ? 3 : char === '2' ? 2 : char === '#' ? 9999 : 1,
            type: char === '#' ? 'obstacle' : char === 'X' ? 'explosive' : 'normal',
            color: palette?.color || '#888',
          });
        }
      });
      setBricks(testBricks);
      setBalls([{
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - PADDLE_OFFSET_BOTTOM - PADDLE_HEIGHT - 20,
        vx: 0,
        vy: 0,
        attached: true,
        baseSpeed: 8,
      }]);
      setScore(0);
      setGameState('playing');
      setEditorTestMode(true);
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        color: '#fff',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <button
            onClick={() => setGameState('menu')}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #666',
              borderRadius: '6px',
              color: '#aaa',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #8b5a2b, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🔧 Level Editor
          </h1>
        </div>

        {/* Enemy & Level Selection */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Enemy:</label>
            <select
              value={editorSelectedEnemy}
              onChange={(e) => setEditorSelectedEnemy(e.target.value)}
              style={{
                padding: '8px 16px',
                background: '#2a2a4e',
                border: '1px solid #4a4a6e',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {enemyDefs.map(enemy => (
                <option key={enemy.id} value={enemy.id}>{enemy.emoji} {enemy.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Level:</label>
            <select
              value={editorLevelNumber}
              onChange={(e) => setEditorLevelNumber(parseInt(e.target.value))}
              style={{
                padding: '8px 16px',
                background: '#2a2a4e',
                border: '1px solid #4a4a6e',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <option key={n} value={n}>Level {n}</option>
              ))}
            </select>
          </div>
          <button onClick={handleLoadLevel} style={{ padding: '8px 16px', background: '#4080e0', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', alignSelf: 'flex-end' }}>
            📂 Load
          </button>
        </div>

        {/* Main Editor Area */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Brick Palette */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #4a4a6e',
          }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#aaa' }}>Brick Palette</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
              {brickPalette.map(brick => (
                <button
                  key={brick.char}
                  onClick={() => setEditorSelectedTool(brick.char)}
                  style={{
                    padding: '6px 8px',
                    background: editorSelectedTool === brick.char ? '#4080e0' : 'rgba(255,255,255,0.1)',
                    border: editorSelectedTool === brick.char ? '2px solid #ffd700' : '1px solid #4a4a6e',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{brick.emoji}</span>
                  <span>{brick.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Editor */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #4a4a6e',
          }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#aaa' }}>Level Grid (12×6)</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 50px)',
              gap: '2px',
              background: '#1a1a2e',
              padding: '10px',
              borderRadius: '6px',
            }}>
              {editorLevel.map((rowStr, row) => (
                Array.from({ length: 12 }).map((_, col) => {
                  const char = rowStr[col] || '.';
                  const brick = brickPalette.find(b => b.char === char) || brickPalette[0];
                  return (
                    <button
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick(row, col)}
                      style={{
                        width: '50px',
                        height: '20px',
                        background: char === '.' ? 'rgba(255,255,255,0.05)' : brick.color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                      }}
                    >
                      {char !== '.' && brick.emoji}
                    </button>
                  );
                })
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
              <button onClick={handleSaveLevel} style={{ padding: '10px 20px', background: '#44aa44', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                💾 Save
              </button>
              <button onClick={handleClearLevel} style={{ padding: '10px 20px', background: '#aa4444', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                🗑️ Clear
              </button>
              <button onClick={handleExportLevel} style={{ padding: '10px 20px', background: '#aa8800', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                📋 Export
              </button>
              <button onClick={handleTestLevel} style={{ padding: '10px 20px', background: '#4080e0', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                ▶️ Test Play
              </button>
            </div>
          </div>
        </div>

        {/* Level Code Preview */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(0,0,0,0.3)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #4a4a6e',
          maxWidth: '700px',
          width: '100%',
        }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#aaa' }}>Level Code Preview</h3>
          <pre style={{
            background: '#1a1a2e',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#88ff88',
            overflow: 'auto',
          }}>
            {`[\n${editorLevel.map(row => `  '${row}'`).join(',\n')},\n]`}
          </pre>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          color: '#666',
          fontSize: '11px',
          textAlign: 'center',
        }}>
          Click palette items to select, then click grid cells to place • Save stores to local storage • Export copies code to clipboard
        </div>
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

        {/* Enemy Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          borderLeft: `3px solid ${enemyColor}`,
        }}>
          <span style={{ fontSize: '40px' }}>{selectedEnemy?.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{selectedEnemy?.name}</span>
              <span style={{ fontSize: '12px', color: enemyColor, fontWeight: '600' }}>{selectedEnemy?.title}</span>
            </div>
            {/* Star Progress */}
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '120px',
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(totalStars / maxStars) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
                }} />
              </div>
              <span style={{ color: '#ffd700', fontSize: '12px', fontWeight: '700' }}>
                {totalStars}/{maxStars} ★
              </span>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
        }}>
          {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map(level => {
            const isUnlocked = debugMode || level <= highestLevel;
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
                  width: '90px',
                  height: '100px',
                  borderRadius: '8px',
                  border: isNext ? `2px solid ${enemyColor}` : '1px solid rgba(255,255,255,0.1)',
                  padding: '0',
                  background: isUnlocked ? 'rgba(30,35,50,0.8)' : 'rgba(20,20,25,0.6)',
                  color: isUnlocked ? '#fff' : '#333',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isUnlocked ? 1 : 0.5,
                }}
                onMouseEnter={e => {
                  if (isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = enemyColor;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isNext ? enemyColor : 'rgba(255,255,255,0.1)';
                }}
              >
                {isUnlocked ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 4px',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}>
                    {/* Level number */}
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: isNext ? enemyColor : '#fff',
                    }}>{level}</div>

                    {/* Mini preview */}
                    {renderLevelPreview(level, isNext ? enemyColor : '#666', false, enemyId)}

                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3].map(s => (
                        <span key={s} style={{
                          fontSize: '12px',
                          color: s <= stars ? '#ffd700' : 'rgba(255,255,255,0.2)',
                        }}>★</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '4px',
                  }}>
                    <span style={{ fontSize: '16px', color: '#444', fontWeight: '700' }}>{level}</span>
                    <span style={{ fontSize: '14px' }}>🔒</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setGameState('select')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#888'; }}
          >
            ← Back
          </button>

          {hasVictory && canContinue ? (
            <button
              onClick={() => startLevel(nextLevel, false)}
              style={{
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '700',
                background: enemyColor,
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Next Level →
            </button>
          ) : (
            <button
              onClick={() => startLevel(highestLevel, true)}
              style={{
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '700',
                background: enemyColor,
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {highestLevel === 1 ? 'Play' : `Continue`}
            </button>
          )}

          <button
            onClick={() => setGameState('menu')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#555',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#888'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#555'; }}
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
      {gameState === 'levelEditor' && renderLevelEditor()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
    </div>
  );
};

window.BreakoutGame = BreakoutGame;
