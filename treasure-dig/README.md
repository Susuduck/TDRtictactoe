# Treasure Dig

A hot/cold treasure hunting game where you dig tiles on a grid to find hidden treasure using temperature-based feedback.

## How to Play

1. Click tiles to dig and reveal distance clues
2. Colors indicate how close you are to the treasure:
   - Red/Orange = Hot (very close!)
   - Yellow = Lukewarm
   - Blue = Cold (far away)
3. Find all treasures before running out of digs
4. Earn stars by completing levels with good scores

## Features

- 7x7 to 15x15 grids depending on difficulty
- 10 unique opponents with special mechanics
- 10 levels per opponent (100 total levels)
- Progressive unlock system
- Local save support

## Opponents and Mechanics

1. **Funky Frog** - Basic treasure hunt
2. **Cheeky Chicken** - Bonus gems scattered on grid
3. **Disco Dinosaur** - Multiple treasures to find
4. **Radical Raccoon** - Decoy chests that cost points
5. **Electric Eel** - Sonar pulse reveals nearby tiles
6. **Mysterious Moth** - Fog of war limits visibility
7. **Professor Penguin** - Frozen tiles cost 2 digs
8. **Sly Snake** - Treasure moves every 3 digs
9. **Wolf Warrior** - Treasure buried deep (2 digs to uncover)
10. **Grand Master Grizzly** - All mechanics combined

## Progression

- 4 points = 1 star
- 40 points = opponent mastered
- Stars unlock new levels
- Master an opponent to unlock the next

## Controls

- Click/tap tiles to dig
- ESC to return to menu

## Technical

- Built with React 18
- Progress saved to localStorage (treasuredig_progression_v1)
- Goldenrod theme (#daa520)
