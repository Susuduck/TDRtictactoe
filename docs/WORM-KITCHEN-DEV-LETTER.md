# Dev Letter: Worm Kitchen

**To:** Next AI Developer
**From:** Claude (Opus 4.5)
**Date:** 2025-01-17
**Subject:** Building Worm Kitchen - A Dual-Window Arcade Game

---

## Hello, Future Developer!

You've been tasked with building **Worm Kitchen**, a split-attention arcade game. This letter will get you up to speed quickly.

---

## TL;DR

Build a game with two windows side-by-side:
- **Left (50%)**: Worm/snake game - eat fruits
- **Right (50%)**: Recipe orders - combine fruits into dishes
- **Space** switches focus between them
- When focused on kitchen, the worm goes **slow-mo** but keeps moving
- Core tension: fulfilling orders while keeping the worm alive

---

## Your Documentation

I've created two key documents. **Read them before coding.**

### 1. Design Document
**File:** `docs/WORM-KITCHEN.md`

This is the complete game design specification. It covers:
- Core concept and gameplay loop
- Game design principles (why decisions were made)
- Dual-window layout specifications
- Worm side mechanics
- Kitchen side mechanics (orders, recipes, tray)
- Focus switching and slow-mo details
- All controls
- Complete recipe list
- UI/UX specifications with exact colors and timings
- Visual and audio design
- Difficulty progression table
- Scoring system
- Technical architecture
- Accessibility requirements

**Use this document as your source of truth.** If you're unsure about a mechanic, the answer is likely in here.

### 2. Progress Tracker
**File:** `docs/WORM-KITCHEN-PROGRESS.md`

This breaks the work into **10 sprints** with detailed task lists:

| Sprint | Focus |
|--------|-------|
| 1 | Project setup & split layout |
| 2 | Worm side core (adapted from snake.jsx) |
| 3 | Kitchen side core (orders, tray) |
| 4 | Focus switching mechanic |
| 5 | Recipe system & validation |
| 6 | Polish & feedback (juice) |
| 7 | Audio & effects |
| 8 | Difficulty & balance |
| 9 | Menu & game states |
| 10 | Final polish & integration |

**Work through these in order.** Each sprint builds on the previous. Mark tasks complete as you finish them.

---

## The Base Game

You should base this on the existing **RPG Snake** game:

**File:** `snake.jsx`

This contains:
- Grid rendering system (20x20, cell-based)
- Worm/snake movement logic
- Direction handling with buffering
- Collision detection
- Particle effects
- State management patterns
- Keyboard input handling
- Visual styling that matches the collection

**Do NOT modify snake.jsx.** Copy/adapt the code you need into the new `worm-kitchen.jsx`.

You're removing:
- Enemy system
- Wave/boss system
- Gimmick system
- RPG elements

You're keeping:
- Grid and rendering
- Worm movement
- Collision logic
- Particle system
- Basic styling approach

You're adding:
- Split-screen layout
- Kitchen side (entirely new)
- Focus switching
- Order/recipe system
- Slow-mo mechanic

---

## Key Technical Decisions

### File Structure
Create these files:
```
worm-kitchen.html   # HTML wrapper (copy from snake.html, modify)
worm-kitchen.jsx    # Main React component
```

### Component Architecture
```jsx
const WormKitchenGame = () => {
  // Focus state: 'worm' | 'kitchen'
  const [focus, setFocus] = useState('worm');

  // Shared state
  const [ingredientTray, setIngredientTray] = useState([]);
  const [score, setScore] = useState(0);

  return (
    <div className="game-container">
      <WormSide
        focus={focus}
        onFruitCollected={(fruit) => addToTray(fruit)}
      />
      <KitchenSide
        focus={focus}
        ingredientTray={ingredientTray}
        onIngredientUsed={(idx) => removeFromTray(idx)}
      />
    </div>
  );
};
```

### Slow-Mo Implementation
When `focus === 'kitchen'`:
- Worm game loop uses `SLOW_SPEED` (600ms) instead of `NORMAL_SPEED` (150ms)
- Apply CSS filter to worm side: `filter: grayscale(0.5) brightness(0.8)`
- Add vignette overlay

```jsx
const wormSpeed = focus === 'worm' ? 150 : 600;
```

### Order Timer System
Orders tick down regardless of focus. Use a ref to track elapsed time:

```jsx
const ordersRef = useRef([]);

useEffect(() => {
  const interval = setInterval(() => {
    ordersRef.current = ordersRef.current.map(order => ({
      ...order,
      timeLeft: order.timeLeft - 100
    })).filter(order => order.timeLeft > 0);
  }, 100);
  return () => clearInterval(interval);
}, []);
```

### Recipe Validation
Keep recipes in a simple lookup:

```jsx
const RECIPES = {
  smoothie: { name: 'Smoothie', icon: '🥤', ingredients: ['🍎', '🍌'], points: 60 },
  // ...
};
```

---

## Critical Game Feel Details

These make or break the experience:

### 1. Focus Switch Must Be Instant
No animation delay on Space press. The switch must feel immediate. Visual transitions can fade in, but control must transfer instantly.

### 2. Danger Warning is Essential
When worm is within 3 cells of collision while kitchen-focused:
- Audio: Increasing beep frequency
- Visual: Red pulse on worm side border
- This is what creates tension

### 3. Ingredients Glow When Useful
In the tray, ingredients matching the current order should have a subtle pulse/glow. Players need to see at a glance what they can use.

### 4. Orders Show Ingredients
Each order card displays the ingredients needed as icons. No memorization required. Example:
```
🥤 SMOOTHIE
[🍎] + [🍌]
████████░░░░ 8s
```

### 5. Wrong Ingredient = Bounce, Not Punishment
If player adds wrong ingredient, it bounces back to tray with a soft "bonk" sound. No penalty. This reduces frustration.

---

## Testing Your Work

After each sprint, verify:

1. **Sprint 1**: Both panels visible, 50/50 split
2. **Sprint 2**: Worm moves, eats fruit, fruit appears in tray
3. **Sprint 3**: Orders appear, timers tick, tray shows items
4. **Sprint 4**: Space switches focus, slow-mo works, danger warns
5. **Sprint 5**: Can complete orders, scoring works
6. **Sprint 6-10**: Polish and integration

---

## Adding to Menu

When complete, add to `menu.html`:

```html
<a href="worm-kitchen.html" class="game-card worm-kitchen">
  <div class="game-icon">🐛</div>
  <div class="game-info">
    <div class="game-title">Worm Kitchen</div>
    <div class="game-desc">Dual-window chaos! Feed the worm, fulfill orders, don't let either die.</div>
  </div>
</a>
```

Add matching CSS for the card color (suggest warm orange: `#e67e22`).

---

## Common Pitfalls to Avoid

1. **Don't make it too hard too fast.** The first 30 seconds should be gentle. Single orders, long timers.

2. **Don't skip the slow-mo.** Without it, players will die instantly when switching to kitchen. The 25% speed is carefully chosen.

3. **Don't forget the shopping list.** The worm side should show what ingredients are urgently needed. This drives strategic fruit collection.

4. **Don't over-animate.** Animations for feedback are good. Animations that block input are bad.

5. **Don't use random recipe requirements.** Recipes are fixed. Players learn them over time. Randomness would break pattern learning.

---

## Questions You Might Have

**Q: How many fruits on screen at once?**
A: Just one, like classic snake. Respawns when eaten.

**Q: Can worm die from walls?**
A: No, worm wraps around edges. Only dies from self-collision.

**Q: What happens if tray is full?**
A: Worm still eats fruit (grows), but ingredient doesn't add to tray. Player should clear tray.

**Q: How do orders get selected?**
A: Auto-select most urgent order that CAN be completed with current ingredients. Player can override with Tab.

**Q: What's the max game length?**
A: Indefinite, but difficulty keeps ramping. Most games will end 2-5 minutes in.

---

## Good Luck!

This is a unique game concept. The split-attention mechanic hasn't been done much, so you're breaking new ground.

Focus on the **core loop first** (Sprints 1-5). Get it playable before polishing. A working game with placeholder graphics is better than a beautiful game that doesn't play right.

The design document has all the details. The progress tracker has all the tasks. You've got this.

Happy coding!

— Claude

---

## Quick Reference

| Resource | Location |
|----------|----------|
| Design Doc | `docs/WORM-KITCHEN.md` |
| Progress Tracker | `docs/WORM-KITCHEN-PROGRESS.md` |
| Base Game | `snake.jsx` |
| HTML Template | `snake.html` |
| Menu | `menu.html` |
| Other Docs | `docs/TOWER-DEFENSE.md`, `GAMES.md` |

| Key Mechanic | Value |
|--------------|-------|
| Grid Size | 20x20 |
| Cell Size | 20px |
| Normal Speed | 150ms/move |
| Slow-mo Speed | 600ms/move (25%) |
| Max Orders | 4 |
| Tray Slots | 6 (shrinks to 4 late game) |
| Starting Timers | 20s |
| End Game Timers | 6s |

| Controls | Action |
|----------|--------|
| Space | Switch focus |
| Arrows/WASD | Move worm (worm focus) |
| 1-6 | Add ingredient (kitchen focus) |
| Tab | Select next order |
| T/7 | Trash ingredient |
| ESC | Pause |
