# Treasure Dig: Design Evolution

## A document on how we evolved the game through iterative design

---

## Where We Started: The Problems

The initial game was essentially **"safe minesweeper"** - click tiles, see distance numbers, triangulate to find treasure. It worked, but it had serious issues:

### Problem 1: Early Levels Were Boring
> "The first levels - they're entirely just clicking to find the treasure like a safe version of minesweeper - it's not fun."

Just clicking random tiles hoping to get lucky. No strategy, no engagement, no reason to care.

### Problem 2: Distance Numbers Were Lame
> "The numbers that pop up on tiles are lame AF."

Showing "3.2" on a tile is functional but not fun. It felt like a math exercise, not treasure hunting.

### Problem 3: Finding Treasure = Level Over
Once you found the single treasure, the level just... ended. No buildup, no payoff, no "haul" to admire.

### Problem 4: Temperature/Weather Feedback Was Boring
The hot/cold system (🔥 BURNING! → ❄️ FREEZING!) was better than numbers but still felt generic and disconnected from the treasure hunting fantasy.

---

## First Iteration: Collectibles & Basket

### The Insight
> "It would be cool if there were other things to find too. Not only treasure."

What if the grid was full of stuff? Not just one treasure, but a whole world of items scattered around - bottle caps, hot dogs, little critter friends, gems, silly things.

### What We Added
- **Collectibles system** - coins, food, critters, gems, silly items
- **World-themed pools** - swamp has frogs and mushrooms, urban has pizza and bottle caps
- **Treasure basket** - a visual container for your finds
- **Emoji-based feedback** - replaced boring numbers with reactions

### But It Still Wasn't Enough
The basket was nice, but it was passive. Items just appeared in it. There was no *choice*, no *tension*.

---

## Second Iteration: Physics & Animation

### The Request
> "Put the treasure basket on the right - make it a big basket. Items should fall from off the top of the screen and land in the basket with physics. When it's full it should get a lid on it and go into a truck that drives off."

We added satisfying physics - items falling, bouncing, settling. A truck driving away with your haul. It looked cool.

### But Visuals Aren't Gameplay
Pretty animations don't fix boring mechanics. The core loop was still: click → find stuff → watch it fall into basket. Player was still passive.

---

## The Breakthrough: Real-Life Inspiration

### Asking The Right Question
> "What happens in real life treasure hunting? Let's take lots of inspiration from that."

This was the key insight. Instead of inventing abstract game mechanics, we looked at what actual treasure hunters do.

### Real Treasure Hunting Phases

| Real Life | Game Translation |
|-----------|------------------|
| **Research/Survey** - Study maps, narrow down the area | Prospect phase - scan for signals |
| **Detection** - Metal detector sweeps, mark promising spots | Mark tiles for digging |
| **Excavation** - Dig at marked spots, most hits are junk | Dig phase with dirt clumps |
| **Assessment** - Clean finds, decide what to keep | Sort phase with basket limit |
| **The Haul** - See what you actually got | Reveal + combine phase |

### The Critical Real-World Truth
> "In actual treasure hunting, your detector beeps for EVERYTHING metal. That rusty nail gives the same signal as a gold coin."

This became the core tension: **strong signals could be treasure OR junk**. You don't know until you dig it up and clean off the dirt.

---

## Third Iteration: The Phase System

### The Pain and Choice
> "There should be a real pain and choice - should I use my digs to get more basket items, or should I do the safe thing of treasure hunting?"

We designed resource scarcity into every phase:

| Resource | Creates Tension |
|----------|----------------|
| **Scans** | Can't scan everything - must choose where to look |
| **Digs** | Limited excavations - must choose what to unearth |
| **Basket space** | Can't keep everything - must choose what matters |
| **Knowledge** | Dirt clumps hide their contents - must gamble |

### The Dirt Clump Revelation
> "Maybe when we dig, we don't know what it is until later?"

This was crucial. If treasure and junk both come up as identical "dirt clumps", then:
- Player can't just grab all the treasure and skip junk
- Sorting phase has real tension (which dirt clump is the treasure?)
- Reveal phase has genuine surprise/disappointment
- The gamble becomes emotional

### What's Visible vs Mystery

| Item Type | When Dug Up | Why |
|-----------|-------------|-----|
| **Treasure** | 🟤 Dirt clump | THE mystery - is it here? |
| **Junk** | 🟤 Dirt clump | The trap - looks same as treasure |
| **Collectibles** | 👀 Visible | Informed choices during Sort |

This means during SORT, you're looking at:
```
🔑  🍞  🟤  🧀  🟤  🦴  🟤
Key Bread  ?  Cheese ?  Bone  ?
```

Basket fits 5. You have 7. **Now you have a real decision.**

---

## Fourth Iteration: Combinations

### The Magic Moment
> "Other treasures - some COMBINE to make new ones - EG Key and Lockbox - unlocked box - what's inside?"

Combinations add:
- **Discovery** - finding all the recipes
- **Strategy** - "I need a lockbox! I've seen keys everywhere!"
- **Memory** - remembering what you've seen in previous runs
- **Risk/Reward** - taking a dirt clump hoping it's the matching piece

### Combination Examples

| Items | Result | Points | The Fantasy |
|-------|--------|--------|-------------|
| 🔑 + 📦 | 🎁 Unlocked Box | 100 | What's inside?! |
| 🍞 + 🧀 | 🥪 Sandwich | 30 | Lunch break |
| 🧦 + 🧦 | Matching Pair | 20 | Finally! |
| 💍 + 💎 | Jeweled Ring | 75 | Crafting |
| 🦴 + 🦴 | 💀 Skeleton | 40 | Discovery |
| 🗺️ + 🗺️ | Treasure Map | 50 | Adventure |

### 25+ Recipes
We didn't stop at a few obvious ones. Keys unlock things. Food combines into meals. Matching pairs reward collecting. Gems can be set in rings. Fossils assemble into dinosaurs.

---

## Design Principles That Emerged

### 1. Every Click Should Matter
Old: Click anywhere, see a number, whatever.
New: Scans are limited. Digs are limited. Basket is limited. Every action is a choice.

### 2. Information Should Be Imperfect
Old: You know exactly how far treasure is.
New: Strong signal = treasure OR junk. Dirt clump = mystery. You must commit before knowing.

### 3. Phases Create Rhythm
Old: One long phase of clicking.
New: Prospect → Dig → Sort → Reveal. Each phase has different emotions (curiosity → excavation → tough choices → surprise).

### 4. Real-World Inspiration Beats Abstract Design
We didn't invent the phase system from nothing. We asked "what do real treasure hunters do?" and translated it.

### 5. Keep Pushing - "Good Enough" Isn't
At every stage, we could have stopped:
- Collectibles added? Ship it.
- Physics basket? Ship it.
- Phase system? Ship it.

But each time we asked "what's still missing?" and found another layer.

---

## The Final Loop

```
PROSPECT ──→ DIG ──→ SORT ──→ REVEAL ──→ COMBINE ──→ SCORE
    │         │        │         │          │
    ▼         ▼        ▼         ▼          ▼
 "Where?"  "What?"  "Keep?"   "Oh!"     "Yes!!"

 Curiosity → Commitment → Sacrifice → Surprise → Delight
```

Each phase has a distinct emotion. The player isn't just clicking - they're going through a journey.

---

## What We Didn't Do

### We Didn't Add Complexity For Its Own Sake
Every system serves the core tension. Combinations aren't just "more stuff" - they reward paying attention and taking risks.

### We Didn't Accept The First Answer
- "Add collectibles" → good but passive
- "Add physics" → pretty but still passive
- "Add phases" → now we're getting somewhere
- "Add dirt clumps" → now there's real tension
- "Add combinations" → now there's depth

### We Didn't Ignore Real-World Parallels
The best game mechanics often come from translating real experiences. Treasure hunting has inherent drama - we just needed to capture it.

---

## Questions For Future Iteration

1. **World-specific detection tools?** Light beams in caves, sonar underwater, price scanner in shopping world?

2. **Collection metagame?** "47/100 combinations discovered" across all runs?

3. **Rare combinations?** Some recipes only possible in certain worlds?

4. **Chain combinations?** Key → opens lockbox → contains map piece → map pieces combine → full map?

5. **Themed objectives?** Shopping world: find the best deals. Prehistoric: assemble the dinosaur.

---

## Summary

The game evolved from "click tiles, see numbers" to a **five-phase treasure hunting simulation** with:
- Resource scarcity at every step
- Imperfect information (dirt clumps)
- Meaningful choices (what to scan, dig, keep)
- Surprising outcomes (reveal phase)
- Emergent depth (combinations)

The key was **never accepting "good enough"** and **always asking "what would make this MORE fun?"**

---

*Document created during iterative design session, January 2026*
