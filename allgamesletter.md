# Agentic AI Instructions: Mini-Game Implementation

## Your Mission

You are tasked with implementing 14 mini-games for Teddy's Mini-Game Compendium. Each game must be complete, polished, and follow the established patterns in this codebase.

---

## Critical Requirements

### 1. Progression System (MANDATORY)

Every game MUST have:
- **10 Opponents (Worlds)** - Each with unique character and gimmick
- **10 Levels per Opponent** - Progressive difficulty within each opponent
- **Sequential Unlocking** - Must earn 40 points on opponent N-1 to unlock opponent N
- **Star System** - 4 points = 1 star, 10 stars per opponent

**Reference:** Look at `/ultimate-tictactoe-v3.jsx` for the exact progression implementation.

### 2. Standard Opponent Characters

Use these 10 opponents for ALL games (consistent across the compendium):

| Index | Character | Emoji | Color | Theme |
|-------|-----------|-------|-------|-------|
| 0 | Funky Frog | 🐸 | #50c878 | Easy, encouraging |
| 1 | Cheeky Chicken | 🐔 | #e8a840 | Slightly tricky |
| 2 | Disco Dinosaur | 🦕 | #a080c0 | Groovy, dance |
| 3 | Radical Raccoon | 🦝 | #808090 | Sneaky tactics |
| 4 | Electric Eel | ⚡ | #50a8e8 | Shocking surprises |
| 5 | Mysterious Moth | 🦋 | #c090a0 | Darkness, confusion |
| 6 | Professor Penguin | 🐧 | #4080a0 | Smart, academic |
| 7 | Sly Snake | 🐍 | #60a060 | Deceptive |
| 8 | Wolf Warrior | 🐺 | #606080 | Aggressive |
| 9 | Grand Master Grizzly | 👑 | #d4a840 | Ultimate boss |

### 3. File Structure

Each game goes in its own folder:
```
/game-name/
├── game-name.html          # Entry point (load React, Babel, JSX)
├── game-name.jsx           # All game logic in React
└── README.md               # Game documentation
```

### 4. Code Patterns to Follow

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Name - Teddy's Games</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1625 0%, #2d2640 100%);
            min-height: 100vh;
            overflow-x: hidden;
        }
        .loading {
            color: #b8b0c8;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="root"><div class="loading">Loading...</div></div>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" src="game-name.jsx"></script>
    <script type="text/babel">
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<GameName />);
    </script>
</body>
</html>
```

**JSX Structure:**
```javascript
const { useState, useEffect, useCallback, useRef } = React;

// Theme colors (standard across all games)
const theme = {
    bg: '#1a1625',
    bgPanel: '#2a2440',
    bgDark: '#1a1020',
    border: '#4a4468',
    borderLight: '#5a5478',
    text: '#ffffff',
    textSecondary: '#b8b0c8',
    textMuted: '#8880a0',
    accent: '#8b7acc',
    accentBright: '#a898dc',
    gold: '#f4c542',
    goldGlow: 'rgba(244, 197, 66, 0.4)',
    error: '#e85a50',
    success: '#50c878'
};

// Standard opponent definitions
const OPPONENTS = [
    { id: 0, name: 'Funky Frog', emoji: '🐸', color: '#50c878', title: 'The Groovy Beginner' },
    { id: 1, name: 'Cheeky Chicken', emoji: '🐔', color: '#e8a840', title: 'The Cunning Clucker' },
    // ... etc
];

// Main game component
const GameName = () => {
    const [gameState, setGameState] = useState('menu'); // 'menu' | 'select' | 'playing' | 'won' | 'lost'
    const [progression, setProgression] = useState(() => {
        const saved = localStorage.getItem('gamename_progression_v1');
        if (saved) return JSON.parse(saved);
        return { starPoints: Array(10).fill(0) };
    });

    // Save progression
    useEffect(() => {
        localStorage.setItem('gamename_progression_v1', JSON.stringify(progression));
    }, [progression]);

    // ... game implementation
};
```

### 5. Difficulty Scaling

Each opponent should be progressively harder. Use this formula:

```javascript
const getDifficulty = (opponentIndex, levelInOpponent) => {
    // Base difficulty from opponent (0-9)
    const baseDifficulty = opponentIndex * 0.1; // 0.0 to 0.9

    // Level modifier within opponent (0-9)
    const levelModifier = levelInOpponent * 0.01; // 0.0 to 0.09

    // Total difficulty 0.0 to 0.99
    const totalDifficulty = baseDifficulty + levelModifier;

    return {
        // Use these to scale game parameters:
        speedMultiplier: 1 + totalDifficulty * 2,      // 1x to 3x
        accuracyRequired: 0.5 + totalDifficulty * 0.4, // 50% to 90%
        timeLimit: 60 - totalDifficulty * 30,          // 60s to 30s
        aiSkill: totalDifficulty,                      // 0 to 1
        // ... game-specific parameters
    };
};
```

### 6. Star/Points Award System

After each game session:
```javascript
const awardPoints = (won, currentOpponent) => {
    const points = won ? 2 : 0; // Win = 2, Loss = 0
    // For some games, partial success = 1 point

    setProgression(prev => {
        const newPoints = [...prev.starPoints];
        newPoints[currentOpponent] = Math.min(40, newPoints[currentOpponent] + points);
        return { ...prev, starPoints: newPoints };
    });
};

// Check if opponent is unlocked
const isUnlocked = (opponentIndex) => {
    return opponentIndex === 0 || progression.starPoints[opponentIndex - 1] >= 40;
};

// Get stars for display (0-10)
const getStars = (opponentIndex) => {
    return Math.floor(progression.starPoints[opponentIndex] / 4);
};
```

---

## Games to Implement

### Priority Order (by complexity)

**Phase 1 - Easy (start here):**
1. Arm Wrestling - Rapid tap battle
2. Jump Rope - Rhythm tap
3. Batting Cage - Timing swing
4. Beach Ball - Keep airborne
5. Chinchirorin - Dice game

**Phase 2 - Easy-Medium:**
6. Basketball Toss - Arc throw
7. Flappy Teddy - Flap through gaps
8. Honey Catch - Catch falling items
9. Treasure Dig - Hot/cold grid
10. Cook-Off - Order matching

**Phase 3 - Medium:**
11. Shooting Gallery - Tap targets
12. Submarine - Tunnel navigation
13. Fishing - Cast + reel
14. Honey Grid - Voltorb Flip deduction

---

## Game-Specific Instructions

### Arm Wrestling
- Two progress bars filling up
- Player taps rapidly to fill theirs
- AI fills at rate based on difficulty
- Add stamina mechanic at higher levels (can't spam too fast)
- Visual: Arms wrestling, strain effects

### Basketball Toss
- Oscillating power meter
- Tap to set power
- Ball follows parabola arc
- Calculate if it lands in basket
- Higher levels: smaller basket, wind, moving basket

### Shooting Gallery
- Targets pop up from random positions
- Tap to shoot (hit detection)
- Different targets worth different points
- Friendlies appear at higher levels (-50 if hit)
- 60 second rounds

### Submarine (Worm Tunnel)
- Auto-scrolling right
- Tap/hold to rise, release to fall
- Procedural tunnel generation
- Collectibles for bonus points
- Obstacles to avoid

### Flappy Teddy
- Constant gravity
- Tap for upward impulse
- Pipes spawn with gaps
- Pass through gaps for points
- Higher levels: smaller gaps, faster pipes

### Jump Rope
- Rope swings in rhythm (BPM-based)
- Tap to jump when rope comes
- Speed increases as you progress
- Miss = game over
- Higher levels: faster BPM, double dutch

### Batting Cage
- Pitch comes toward you
- Different pitch types (speeds/curves)
- Tap to swing, timing determines hit quality
- 10 pitches per session
- Score based on hit quality

### Honey Pot Drop
- Items fall from top
- Move Teddy left/right to catch
- Good items (+points), bad items (-points/stun)
- 60 second rounds
- Game over items appear at higher levels

### Beach Ball
- Ball affected by gravity
- Tap ball to bop upward
- Ball speeds up over time
- Hit target shrinks over time
- Power-ups occasionally spawn

### Treasure Dig
- Grid of tiles (7x7 to 15x15)
- Hidden treasure somewhere
- Tap tile to dig, get hot/cold feedback
- Limited digs to find treasure
- Higher levels: more treasures, bigger grid, fewer digs

### Fishing
- Power meter for cast distance
- Wait for bite (random timer)
- Tap when "!" appears (tight window)
- Rhythm tapping to reel in
- Line tension system (break = lose fish)

### Honey Grid (Voltorb Flip)
- 5x5 grid of hidden tiles
- Tiles: x1, x2, x3, or TRAP
- Row/column hints show sum and trap count
- Flip tiles to multiply score
- Hit trap = lose everything

### Cook-Off
- Orders appear (recipe + required ingredients)
- Tap ingredients in correct order
- Timer per order
- 3 wrong = game over
- Speed increases as you go

### Chinchirorin
- Roll 3 dice
- Compare combinations to dealer (The Boss)
- Bet system
- Payouts based on combination strength
- The Boss "cheats" at higher levels

---

## After Implementing Each Game

1. **Test thoroughly:**
   - All 10 opponents accessible
   - Progression saves correctly
   - Difficulty scales properly
   - No console errors

2. **Create README.md:**
   - Game description
   - How to play
   - Controls
   - Scoring system
   - Opponent list

3. **Update menu.html:**
   - Add game card with appropriate color and emoji
   - Link to game's HTML file

4. **Update play.bat:**
   - Add numbered option for new game

---

## Reference Files

Study these existing implementations:
- `/ultimate-tictactoe-v3.jsx` - Best example of progression system
- `/teddy-coaster.jsx` - Good example of 10 opponents with stars
- `/snake.jsx` - Complex game with multiple mechanics
- `/menu.html` - How games are listed

---

## Quality Checklist

For each game, ensure:
- [ ] Looks polished (consistent with other games' styling)
- [ ] Feels fun to play
- [ ] Difficulty progression is satisfying (not too easy or frustrating)
- [ ] Each opponent feels unique
- [ ] Progress persists across sessions
- [ ] No bugs or console errors
- [ ] Responsive on different screen sizes
- [ ] Back to menu button works

---

## Getting Started

1. Read this entire document
2. Study `/ultimate-tictactoe-v3.jsx` to understand the progression system
3. Pick a game from Phase 1 (easiest)
4. Create the folder and files
5. Implement the game following the patterns above
6. Test thoroughly
7. Create documentation
8. Move to next game

Good luck! Make Teddy proud.
