# Worm Kitchen - Development Progress

Track development progress for the Worm Kitchen game.

**Design Document:** [WORM-KITCHEN.md](./WORM-KITCHEN.md)
**Base Game Reference:** `snake.jsx` (RPG Snake)
**Target Files:** `worm-kitchen.html`, `worm-kitchen.jsx`

---

## Development Sprints Overview

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Project Setup & Split Layout | Not Started |
| Sprint 2 | Worm Side Core | Not Started |
| Sprint 3 | Kitchen Side Core | Not Started |
| Sprint 4 | Focus Switching | Not Started |
| Sprint 5 | Recipe System | Not Started |
| Sprint 6 | Polish & Feedback | Not Started |
| Sprint 7 | Audio & Effects | Not Started |
| Sprint 8 | Difficulty & Balance | Not Started |
| Sprint 9 | Menu & Game States | Not Started |
| Sprint 10 | Final Polish & Integration | Not Started |

---

## Sprint 1: Project Setup & Split Layout

### Goal
Create the file structure and implement the dual-window layout with placeholder content.

### Tasks

- [ ] **1.1 Create HTML wrapper**
  - Create `worm-kitchen.html` based on `snake.html`
  - Include React 18 and Babel standalone
  - Set up root div and basic styling

- [ ] **1.2 Create JSX skeleton**
  - Create `worm-kitchen.jsx`
  - Export `WormKitchenGame` component
  - Set up basic state structure (gameState, focus, etc.)

- [ ] **1.3 Implement split-screen layout**
  - 50/50 horizontal split
  - Left side: Green placeholder with "WORM SIDE" text
  - Right side: Warm placeholder with "KITCHEN SIDE" text
  - Responsive sizing (flex-based)

- [ ] **1.4 Add bottom control bar**
  - Show control hints
  - Dynamic based on current focus
  - Styled consistently with other games

- [ ] **1.5 Test layout**
  - Verify on different screen sizes
  - Confirm no overflow issues
  - Check color contrast

### Verification
- [ ] Both panels visible and equally sized
- [ ] Bottom bar shows controls
- [ ] File loads without errors

---

## Sprint 2: Worm Side Core

### Goal
Implement the worm game on the left side, adapted from snake.jsx.

### Tasks

- [ ] **2.1 Port grid rendering from snake.jsx**
  - 20x20 grid
  - 20px cell size (400x400 total)
  - Grid lines with subtle opacity
  - Dark green theme

- [ ] **2.2 Port worm state management**
  - Snake array (position segments)
  - Direction state
  - Next direction (buffer)
  - Movement timing

- [ ] **2.3 Port worm movement logic**
  - Move head in direction
  - Tail follows
  - Wrap around edges (no wall death)
  - Self-collision detection

- [ ] **2.4 Port worm rendering**
  - Head with eyes (👀)
  - Body segments with gradient
  - Rotation based on direction
  - Smooth appearance

- [ ] **2.5 Implement fruit system**
  - 7 fruit types with emojis
  - Random spawning
  - Spawn rates per design doc
  - Collection detection

- [ ] **2.6 Implement fruit → tray connection**
  - When worm eats fruit, add to kitchen tray
  - Tray has 6 slots max
  - If tray full, fruit still collected (worm grows) but not added

- [ ] **2.7 Add worm side HUD**
  - Score display (top-left)
  - Worm length (top-right)
  - "Urgent needs" section (bottom)

- [ ] **2.8 Keyboard controls (worm focus)**
  - Arrow keys for direction
  - WASD alternative
  - Prevent 180-degree turns

### Verification
- [ ] Worm moves correctly
- [ ] Fruits spawn and can be collected
- [ ] Collected fruits appear in tray (kitchen side placeholder for now)
- [ ] Self-collision ends game

---

## Sprint 3: Kitchen Side Core

### Goal
Implement the kitchen order system on the right side.

### Tasks

- [ ] **3.1 Implement ingredient tray component**
  - 6 slots at bottom
  - Shows collected ingredients from worm side
  - Each slot shows emoji + number key (1-6)
  - Empty slots with dotted outline

- [ ] **3.2 Implement order card component**
  - Card layout per design doc
  - Dish icon and name
  - Required ingredients as icons
  - Timer bar (visual)
  - Border color by urgency

- [ ] **3.3 Implement order queue**
  - Array of pending orders
  - Sorted by urgency (time remaining)
  - Max 4 orders visible
  - Auto-scroll/reorder as timers change

- [ ] **3.4 Implement active order display**
  - Expanded view of selected order
  - Shows slots being filled
  - Shows what's still needed
  - Visual feedback on each addition

- [ ] **3.5 Implement order timers**
  - Each order has countdown
  - Timer bar shrinks
  - Color changes by time remaining
  - Expired orders removed with penalty

- [ ] **3.6 Implement order spawning**
  - Spawn new orders over time
  - Respect max order limit
  - Recipe selection weighted by difficulty phase

- [ ] **3.7 Basic order interaction (placeholder)**
  - Click ingredient to add (mouse support)
  - Visual feedback on addition
  - No validation yet (Sprint 5)

### Verification
- [ ] Orders appear and display correctly
- [ ] Timers count down visually
- [ ] Ingredient tray shows collected items
- [ ] Basic click interaction works

---

## Sprint 4: Focus Switching

### Goal
Implement the core focus-switching mechanic between worm and kitchen.

### Tasks

- [ ] **4.1 Implement focus state**
  - `focus: 'worm' | 'kitchen'`
  - Default to 'worm'
  - Space key toggles

- [ ] **4.2 Visual treatment: Worm focused**
  - Worm side: Full brightness
  - Kitchen side: Slight dim (opacity 0.85)
  - Kitchen timers still tick

- [ ] **4.3 Visual treatment: Kitchen focused**
  - Kitchen side: Full brightness
  - Worm side: Desaturated (CSS filter)
  - Worm side: Vignette overlay

- [ ] **4.4 Slow-mo implementation**
  - When kitchen focused, worm speed = 25%
  - Worm continues moving on trajectory
  - Speed stored/restored on switch

- [ ] **4.5 Control routing**
  - Worm focused: Arrow/WASD → worm
  - Kitchen focused: Number keys → ingredients
  - Space always switches focus

- [ ] **4.6 Danger proximity system**
  - Calculate distance to self-collision
  - When <3 cells: Warning state
  - Audio warning (placeholder for now)
  - Visual warning (red border pulse)

- [ ] **4.7 Transition effects**
  - 100ms crossfade between states
  - Distinct audio cues each direction
  - No input blocking during transition

### Verification
- [ ] Space switches focus reliably
- [ ] Visual states clearly different
- [ ] Worm continues in slow-mo when kitchen focused
- [ ] Danger warning triggers correctly
- [ ] Controls route to correct side

---

## Sprint 5: Recipe System

### Goal
Implement full recipe validation and order completion.

### Tasks

- [ ] **5.1 Define recipe data structure**
  - Recipe ID, name, icon
  - Required ingredients (array)
  - Points value
  - Color theme

- [ ] **5.2 Implement all recipes**
  - 8 two-ingredient recipes
  - 5 three-ingredient recipes
  - 3 special recipes
  - Per design document

- [ ] **5.3 Ingredient addition logic**
  - Number key (1-6) adds from tray
  - Ingredient moves to active order slot
  - Removed from tray
  - Visual + audio feedback

- [ ] **5.4 Recipe validation**
  - Check if added ingredients match recipe
  - Wrong ingredient: Bounce back, error sound
  - Correct: Stays in slot

- [ ] **5.5 Order completion**
  - All slots filled = auto-complete
  - Points awarded
  - Order card animates away
  - Satisfying feedback

- [ ] **5.6 Smart auto-selection**
  - Find most urgent completable order
  - If none completable, most urgent overall
  - Highlight selected order

- [ ] **5.7 Ingredient highlighting**
  - Ingredients matching current order glow
  - Pulsing animation
  - Clear visual distinction

- [ ] **5.8 Manual order selection**
  - Tab to cycle orders
  - Click to select
  - Override auto-selection

- [ ] **5.9 Trash/discard mechanic**
  - T or 7 key to enter trash mode
  - Click ingredient to discard
  - Or hold number key to trash

### Verification
- [ ] Recipes complete correctly
- [ ] Wrong ingredients rejected
- [ ] Auto-selection works
- [ ] Points awarded correctly
- [ ] Tray/order state stays consistent

---

## Sprint 6: Polish & Feedback

### Goal
Add juice, feedback, and satisfying micro-interactions.

### Tasks

- [ ] **6.1 Order completion celebration**
  - Card flies up and fades
  - Particle burst
  - Score floats up (+100)
  - Screen flash (subtle)

- [ ] **6.2 Order expiration feedback**
  - Card crumbles/fades to gray
  - Sad sound
  - Penalty shown (-50)
  - Life lost indicator if applicable

- [ ] **6.3 Fruit collection particles**
  - Particle burst on eat
  - Color matches fruit
  - 8-12 particles, gravity fall

- [ ] **6.4 Timer critical state**
  - Card shakes
  - Border pulses red
  - Tick sound accelerates

- [ ] **6.5 Combo indicator**
  - "COMBO x2!" text when completing multiple
  - Multiplier shown on score
  - Builds excitement

- [ ] **6.6 Perfect switch bonus**
  - Detect switch when worm in danger zone
  - "+25 CLOSE CALL!" feedback
  - Encourages risky play

- [ ] **6.7 Worm death animation**
  - Segments scatter
  - Screen shake
  - Sad sound
  - Delay before game over screen

- [ ] **6.8 UI polish**
  - Hover states on buttons
  - Active states on pressed
  - Consistent rounded corners
  - Shadow consistency

### Verification
- [ ] All major actions have feedback
- [ ] Feedback is satisfying, not annoying
- [ ] Visual hierarchy maintained
- [ ] Performance not impacted

---

## Sprint 7: Audio & Effects

### Goal
Implement full audio system and remaining visual effects.

### Tasks

- [ ] **7.1 Audio manager setup**
  - Web Audio API context
  - Volume controls
  - Sound pooling for frequent sounds
  - Mute functionality

- [ ] **7.2 Worm sounds**
  - Eat fruit: Pop (pitch varies by fruit type)
  - Near danger: Warning beeps
  - Death: Splat

- [ ] **7.3 Kitchen sounds**
  - Add ingredient: Click/snap
  - Order complete: Triumphant ding
  - Order expired: Sad buzzer
  - Wrong ingredient: Soft bonk
  - Timer critical: Ticking

- [ ] **7.4 Focus switch sounds**
  - To kitchen: Whoosh + slight reverb
  - To worm: Whoosh + clarity
  - Slow-mo filter on worm sounds when kitchen focused

- [ ] **7.5 Background ambiance (optional)**
  - Subtle kitchen sounds when kitchen focused
  - Nature sounds when worm focused
  - Very low volume, atmospheric

- [ ] **7.6 Visual effects: Slow-mo**
  - Motion blur on worm (CSS)
  - Time warp visual (optional)
  - Subtle particles

- [ ] **7.7 Visual effects: Danger state**
  - Screen edge glow red
  - Worm side vignette intensifies
  - Heartbeat-like pulse

### Verification
- [ ] All sounds play correctly
- [ ] Sounds don't overlap badly
- [ ] Volume feels balanced
- [ ] Can be muted without issues
- [ ] Visual effects enhance, don't distract

---

## Sprint 8: Difficulty & Balance

### Goal
Implement difficulty progression and balance the game feel.

### Tasks

- [ ] **8.1 Time-based difficulty phases**
  - Track elapsed time
  - Phase 1: 0-30s (tutorial)
  - Phase 2: 30-60s
  - Phase 3: 60-90s
  - Phase 4: 90-120s
  - Phase 5: 120-180s
  - Phase 6: 180s+ (chaos)

- [ ] **8.2 Order spawn rate scaling**
  - More orders over time
  - Respect max limit
  - Smooth ramp-up

- [ ] **8.3 Timer duration scaling**
  - Longer timers early
  - Shorter timers late
  - Per design document

- [ ] **8.4 Recipe complexity scaling**
  - 2-ingredient only early
  - 3-ingredient mid game
  - 4-ingredient late game
  - Mystery recipes (hidden) very late

- [ ] **8.5 Tray size scaling**
  - 6 slots early
  - 5 slots mid
  - 4 slots late
  - Creates inventory pressure

- [ ] **8.6 Worm speed scaling**
  - Gradual speed increase
  - Every 60s, reduce tick by 10ms
  - Minimum 100ms
  - Slow-mo scales proportionally

- [ ] **8.7 Tutorial hints**
  - First 30s: Show control hints
  - Point to important elements
  - Fade after first actions

- [ ] **8.8 Playtesting notes**
  - Add dev console logging for timing
  - Track average session length
  - Track common failure points

### Verification
- [ ] Early game feels manageable
- [ ] Late game feels challenging but fair
- [ ] Smooth difficulty curve
- [ ] No sudden spikes

---

## Sprint 9: Menu & Game States

### Goal
Implement all game states, menus, and navigation.

### Tasks

- [ ] **9.1 Menu state**
  - Title and tagline
  - Animated worm icon
  - Start button
  - High score display
  - How to Play button
  - Back to Main Menu button

- [ ] **9.2 How to Play overlay**
  - Visual tutorial
  - Control reference
  - Close button
  - Maybe animated examples

- [ ] **9.3 Pause state**
  - ESC to pause
  - Overlay with blur
  - Resume button
  - Quit to menu button
  - All timers frozen

- [ ] **9.4 Game Over state**
  - Final score (large)
  - Statistics breakdown
  - High score check
  - New high score celebration
  - Play Again button
  - Menu button

- [ ] **9.5 High score persistence**
  - Save to localStorage
  - Load on init
  - Check after each game

- [ ] **9.6 Statistics tracking**
  - Orders completed
  - Fruits eaten
  - Longest combo
  - Highest wave (time survived)
  - Games played

- [ ] **9.7 State transitions**
  - Smooth fade between states
  - No jarring cuts
  - Consistent animation timing

### Verification
- [ ] All states accessible
- [ ] State transitions smooth
- [ ] Data persists correctly
- [ ] ESC works in all contexts

---

## Sprint 10: Final Polish & Integration

### Goal
Final cleanup, integration with menu, and release prep.

### Tasks

- [ ] **10.1 Add to main menu**
  - New card in menu.html
  - Icon: 🐛🍳 or similar
  - Title: "Worm Kitchen"
  - Description: "Dual-window chaos!"
  - Link to worm-kitchen.html

- [ ] **10.2 Update GAMES.md**
  - Add Worm Kitchen section
  - Controls and mechanics
  - Feature list
  - Tips

- [ ] **10.3 Performance audit**
  - Check for memory leaks
  - Verify 60fps maintained
  - Optimize re-renders
  - Test on slower devices

- [ ] **10.4 Cross-browser testing**
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] **10.5 Accessibility review**
  - Keyboard-only playable
  - High contrast check
  - Screen reader basics (menus)

- [ ] **10.6 Bug fixes**
  - Address any found issues
  - Edge cases
  - State consistency

- [ ] **10.7 Final balance pass**
  - Playtest multiple runs
  - Adjust timers if needed
  - Adjust spawn rates if needed

- [ ] **10.8 Code cleanup**
  - Remove debug logs
  - Consistent formatting
  - Comments on complex logic

- [ ] **10.9 Documentation update**
  - Update this progress doc
  - Final design doc review
  - Add version history

### Verification
- [ ] Game appears in main menu
- [ ] All documentation current
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for release

---

## Bug Tracker

Track bugs found during development.

| ID | Sprint | Description | Status | Notes |
|----|--------|-------------|--------|-------|
| — | — | No bugs yet | — | — |

---

## Playtest Notes

Record observations from playtesting.

| Date | Tester | Observation | Action |
|------|--------|-------------|--------|
| — | — | No tests yet | — |

---

## Changelog

| Date | Sprint | Changes |
|------|--------|---------|
| 2025-01-17 | — | Created progress document |

---

*Document Version: 1.0*
*Last Updated: 2025-01-17*
