// breakout/data.js
// Game data: sprites, levels, enemies, weapons, powerups

// === PIXEL ART ENEMY SPRITES - D&D INSPIRED (CR 1-20) ===
// Each sprite is a 2D array where each value is a color or null (transparent)
// Sprites are 16x16 pixels, scaled up when rendered
// 20 enemies across 5 tiers, each with unique behaviors
export const ENEMY_SPRITES = {
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
export const ENEMY_THEME_COLORS = {
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
export const LEVEL_DEFINITIONS = {
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
export const DEFAULT_LEVEL = [
  '222222222222',
  '222222222222',
  '222222222222',
  '222222222222',
  '222222222222',
  '222222222222',
];


// === WEAPONS SYSTEM ===
// Unconventional weapons that use ammo - ball goes into containment field while using
export const WEAPONS = {
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

// All unlockable power-ups with costs
export const powerUpUnlocks = {
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
export const upgradeShop = {
  paddleSize: { maxLevel: 3, costPerLevel: [15, 30, 50], name: 'Paddle Size', desc: '+10px starting width' },
  extraLife: { maxLevel: 2, costPerLevel: [30, 60], name: 'Extra Life', desc: '+1 starting life' },
  magnetCatch: { maxLevel: 1, costPerLevel: [100], name: 'Magnet Catch', desc: 'Always catch balls' },
  comboMaster: { maxLevel: 3, costPerLevel: [20, 40, 60], name: 'Combo Master', desc: '+0.5s combo window' },
  luckyDrops: { maxLevel: 3, costPerLevel: [25, 50, 75], name: 'Lucky Drops', desc: '+5% drop chance' },
  teddyPower: { maxLevel: 3, costPerLevel: [20, 40, 60], name: 'Teddy Power', desc: '+10% meter gain' },
};

// Character-specific rare power-ups
export const characterRares = {
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


// Enemy definitions with unique gimmicks
export const enemyDefs = [
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
export const powerUpTypes = {
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
