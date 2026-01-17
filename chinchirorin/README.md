# Chinchirorin (Dice Cup)

A traditional Japanese dice gambling game where you roll 3 dice against a dealer (The Boss).

## How to Play

1. **Place your bet** using the +/- buttons
2. **Roll the dice** by clicking the ROLL DICE button
3. **Compare results** with The Boss to determine the winner
4. **Win or lose honey** based on the outcome

## Dice Combinations (Ranked Best to Worst)

| Combination | Name | Payout |
|-------------|------|--------|
| 6-6-6 | Triple Six | 5x bet |
| Any Triple | Triple | 3x bet |
| 4-5-6 | Shigoro | 2x bet |
| Pair + Point | Point (1-6) | 1x bet |
| No Pair | Menashi | No score |
| 1-2-3 | Hifumi (Bust) | Lose 2x |

## Progression System

- **10 Opponents** with increasing difficulty
- Each opponent has different **luck** and **cheating tendencies**
- **10 Levels** per opponent with increasing bet requirements
- **Star System**: Win matches to earn points (4 points = 1 star)
- **40 Points** to master an opponent and unlock the next one

## Opponents

1. Funky Frog - Fair and square
2. Cheeky Chicken - Sometimes rerolls bad results
3. Disco Dinosaur - Gets luckier with style
4. Radical Raccoon - Uses weighted dice occasionally
5. Electric Eel - Dice stick to favorable sides
6. Mysterious Moth - Can swap dice in shadows
7. Professor Penguin - Bends probability slightly
8. Sly Snake - Quick tail swaps dice
9. Wolf Warrior - Pack mates signal winning rolls
10. Grand Master Grizzly - Master of all tricks

## Match Rules

- Each match consists of **5 rounds**
- Win by having **more honey** than your starting amount after 5 rounds
- Lose all your honey and the match ends immediately
- Starting honey increases with level difficulty

## Controls

- Click +/- buttons to adjust bet amount
- Click ROLL DICE to roll
- Press Quit to return to level select

## Technical Details

- Built with React 18
- Progress saved to localStorage (`chinchirorin_progression_v1`)
- Dark red theme (#8b0000 accent)
