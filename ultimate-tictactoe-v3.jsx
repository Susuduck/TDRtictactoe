import React, { useState, useEffect, useCallback, useRef } from 'react';

const UltimateTicTacToe = () => {
  // Game state
  const [gameState, setGameState] = useState('menu');
  const [bigBoard, setBigBoard] = useState(Array(9).fill(null));
  const [smallBoards, setSmallBoards] = useState(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [activeBoard, setActiveBoard] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  
  // Twist system
  const [currentTwist, setCurrentTwist] = useState(null);
  const [showTwistIntro, setShowTwistIntro] = useState(false);
  const [twistIntroPhase, setTwistIntroPhase] = useState(0);
  
  // Twist-specific state
  const [turnTimer, setTurnTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [fogOfWar, setFogOfWar] = useState(false);
  const [bombCell, setBombCell] = useState(null);
  const [blockedCells, setBlockedCells] = useState([]);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isDoubleDown, setIsDoubleDown] = useState(false);
  const [doubleDownFirst, setDoubleDownFirst] = useState(null);
  
  // Animation state
  const [placingTile, setPlacingTile] = useState(null);
  const [particles, setParticles] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [boardClaimEffect, setBoardClaimEffect] = useState(null);
  const [showVictoryEffect, setShowVictoryEffect] = useState(false);
  const [showDefeatEffect, setShowDefeatEffect] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);
  const [currentBg, setCurrentBg] = useState(0);
  
  // Stats
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);

  // Twist definitions
  const twistDefs = {
    none: { id: 'none', name: null, icon: null, chance: 55 },
    speed_round: { id: 'speed_round', name: 'SPEED ROUND', icon: '⚡', chance: 10, color: '#f4c542' },
    fog_of_war: { id: 'fog_of_war', name: 'FOG OF WAR', icon: '👁', chance: 7, color: '#8080a0' },
    sudden_death: { id: 'sudden_death', name: 'SUDDEN DEATH', icon: '💀', chance: 6, color: '#e85a50' },
    chaos_shuffle: { id: 'chaos_shuffle', name: 'CHAOS SHUFFLE', icon: '🔀', chance: 6, color: '#a080c0' },
    hot_potato: { id: 'hot_potato', name: 'HOT POTATO', icon: '💣', chance: 5, color: '#e88040' },
    shrinking_board: { id: 'shrinking_board', name: 'SHRINKING BOARD', icon: '📉', chance: 5, color: '#60a080' },
    double_down: { id: 'double_down', name: 'DOUBLE DOWN', icon: '✌️', chance: 3, color: '#c060a0' },
    blackout: { id: 'blackout', name: 'BLACKOUT', icon: '🌑', chance: 3, color: '#404060' },
  };

  // Enemy definitions
  const enemyDefs = [
    { id: 'funky_frog', name: 'Funky Frog', title: 'The Groovy Beginner', emoji: '🐸', color: '#50c878', accentColor: '#70e898', taunt: "Ribbit! Let's groove!", winQuote: "Hop hop hooray!", loseQuote: "Ribbit... nice moves!" },
    { id: 'cheeky_chicken', name: 'Cheeky Chicken', title: 'The Cunning Clucker', emoji: '🐔', color: '#e8a840', accentColor: '#f8c860', taunt: "Bawk bawk! Think you can beat me?", winQuote: "Winner winner chicken dinner!", loseQuote: "Bawk... I'll get you next time!" },
    { id: 'disco_dinosaur', name: 'Disco Dinosaur', title: 'The Groovy Giant', emoji: '🦕', color: '#a080c0', accentColor: '#c0a0e0', taunt: "Time to boogie, baby!", winQuote: "Disco never dies!", loseQuote: "The music stops... for now." },
    { id: 'radical_raccoon', name: 'Radical Raccoon', title: 'The Trash Tactician', emoji: '🦝', color: '#808090', accentColor: '#a0a0b0', taunt: "I've been digging through your strategies!", winQuote: "Found victory in the trash!", loseQuote: "Back to the bins..." },
    { id: 'electric_eel', name: 'Electric Eel', title: 'The Shocking Strategist', emoji: '⚡', color: '#50a8e8', accentColor: '#70c8ff', taunt: "Prepare to be shocked!", winQuote: "ZAP! Electrifying victory!", loseQuote: "My circuits are fried..." },
    { id: 'mysterious_moth', name: 'Mysterious Moth', title: 'The Light Seeker', emoji: '🦋', color: '#c090a0', accentColor: '#e0b0c0', taunt: "Drawn to victory like a flame...", winQuote: "The light guided me true!", loseQuote: "The darkness takes me..." },
    { id: 'professor_penguin', name: 'Professor Penguin', title: 'The Antarctic Academic', emoji: '🐧', color: '#4080a0', accentColor: '#60a0c0', taunt: "Let me educate you in defeat.", winQuote: "Class dismissed!", loseQuote: "I must revise my notes..." },
    { id: 'sly_snake', name: 'Sly Snake', title: 'The Slithering Schemer', emoji: '🐍', color: '#60a060', accentColor: '#80c080', taunt: "Sssso you dare challenge me?", winQuote: "Ssssweet victory!", loseQuote: "Thisss isssn't over..." },
    { id: 'wolf_warrior', name: 'Wolf Warrior', title: 'The Pack Leader', emoji: '🐺', color: '#606080', accentColor: '#8080a0', taunt: "The pack hunts together!", winQuote: "AWOOOO! Victory howl!", loseQuote: "The pack will return stronger..." },
    { id: 'grand_master_grizzly', name: 'Grand Master Grizzly', title: 'The Ultimate Challenge', emoji: '👑', color: '#d4a840', accentColor: '#f4c860', taunt: "You dare face the Grand Master?", winQuote: "Undefeated. As expected.", loseQuote: "Impossible! The council will hear of this!" },
  ];

  // AI Memory System
  const [aiMemory, setAiMemory] = useState(() => {
    const saved = localStorage.getItem('ultimateTTT_aiMemory_v3');
    if (saved) return JSON.parse(saved);
    return {
      starPoints: 0,
      playerProfile: {
        firstMoveBoards: Array(9).fill(0),
        firstMoveCells: Array(9).fill(0),
        boardPreferences: Array(9).fill(0),
        cellPreferences: Array(9).fill(0),
        blocksWhenThreatened: { blocks: 0, misses: 0 },
        totalMoves: 0,
        gamesPlayed: 0,
      },
      openingBook: {},
      moveOutcomes: {},
    };
  });

  useEffect(() => {
    localStorage.setItem('ultimateTTT_aiMemory_v3', JSON.stringify(aiMemory));
  }, [aiMemory]);

  const theme = { 
    bg: '#1a1625', bgPanel: '#2a2440', bgDark: '#1a1020', 
    border: '#4a4468', borderLight: '#5a5478', 
    text: '#ffffff', textSecondary: '#b8b0c8', textMuted: '#8880a0', 
    accent: '#8b7acc', accentBright: '#a898dc', 
    gold: '#f4c542', goldGlow: 'rgba(244, 197, 66, 0.4)', 
    error: '#e85a50', success: '#50c878' 
  };

  const backgrounds = [
    { name: 'Cosmic Arena', gradient: 'linear-gradient(135deg, #1a1625 0%, #2a1f3d 50%, #1a2535 100%)', pattern: 'stars' },
    { name: 'Forest Grove', gradient: 'linear-gradient(135deg, #1a1f1a 0%, #2a3020 50%, #1a2518 100%)', pattern: 'none' },
    { name: 'Ocean Depths', gradient: 'linear-gradient(135deg, #0a1a2a 0%, #1a2a3a 50%, #0a2030 100%)', pattern: 'none' },
    { name: 'Sunset Valley', gradient: 'linear-gradient(135deg, #2a1a1a 0%, #3a2515 50%, #2a1820 100%)', pattern: 'none' },
  ];

  const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  // ==================== TWIST SYSTEM ====================

  const rollTwist = useCallback(() => {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    for (const twist of Object.values(twistDefs)) {
      cumulative += twist.chance;
      if (roll < cumulative) {
        return twist.id === 'none' ? null : twist;
      }
    }
    return null;
  }, []);

  const initializeTwist = useCallback((twist) => {
    if (!twist) return;
    
    switch (twist.id) {
      case 'speed_round':
        setTimerSeconds(15);
        break;
      case 'fog_of_war':
        setFogOfWar(true);
        break;
      case 'hot_potato':
        // Place bomb on random cell
        const randomBoard = Math.floor(Math.random() * 9);
        const randomCell = Math.floor(Math.random() * 9);
        setBombCell({ board: randomBoard, cell: randomCell });
        break;
      case 'double_down':
        setIsDoubleDown(true);
        break;
      default:
        break;
    }
  }, []);

  // Timer effect for speed round
  useEffect(() => {
    if (gameState !== 'playing' || !currentTwist || currentTwist.id !== 'speed_round') return;
    if (!isPlayerTurn) return;
    
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          // Time's up - lose turn
          clearInterval(interval);
          setIsPlayerTurn(false);
          return Math.max(5, 15 - Math.floor(turnCount / 2));
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState, currentTwist, isPlayerTurn, turnCount]);

  // Reset timer when turn changes
  useEffect(() => {
    if (currentTwist?.id === 'speed_round' && isPlayerTurn) {
      setTimerSeconds(Math.max(5, 15 - Math.floor(turnCount / 2)));
    }
  }, [isPlayerTurn, currentTwist, turnCount]);

  // Blackout effect
  useEffect(() => {
    if (gameState !== 'playing' || !currentTwist || currentTwist.id !== 'blackout') return;
    if (turnCount > 0 && turnCount % 5 === 0 && !isPlayerTurn) {
      setIsBlackout(true);
      setTimeout(() => setIsBlackout(false), 2000);
    }
  }, [turnCount, currentTwist, gameState, isPlayerTurn]);

  // Chaos shuffle effect
  useEffect(() => {
    if (gameState !== 'playing' || !currentTwist || currentTwist.id !== 'chaos_shuffle') return;
    if (turnCount > 0 && turnCount % 4 === 0) {
      // Find two unclaimed boards
      const unclaimedBoards = bigBoard
        .map((b, i) => b === null ? i : -1)
        .filter(i => i !== -1);
      
      if (unclaimedBoards.length >= 2) {
        const idx1 = Math.floor(Math.random() * unclaimedBoards.length);
        let idx2 = Math.floor(Math.random() * unclaimedBoards.length);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * unclaimedBoards.length);
        
        const board1 = unclaimedBoards[idx1];
        const board2 = unclaimedBoards[idx2];
        
        setSmallBoards(prev => {
          const newBoards = [...prev];
          const temp = newBoards[board1];
          newBoards[board1] = newBoards[board2];
          newBoards[board2] = temp;
          return newBoards;
        });
        
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
      }
    }
  }, [turnCount, currentTwist, gameState, bigBoard]);

  // Shrinking board effect
  useEffect(() => {
    if (gameState !== 'playing' || !currentTwist || currentTwist.id !== 'shrinking_board') return;
    if (turnCount > 0 && turnCount % 3 === 0) {
      // Find a random empty cell to block
      const emptyCells = [];
      smallBoards.forEach((board, boardIdx) => {
        if (bigBoard[boardIdx] === null) {
          board.forEach((cell, cellIdx) => {
            if (cell === null && !blockedCells.some(b => b.board === boardIdx && b.cell === cellIdx)) {
              emptyCells.push({ board: boardIdx, cell: cellIdx });
            }
          });
        }
      });
      
      if (emptyCells.length > 0) {
        const toBlock = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        setBlockedCells(prev => [...prev, toBlock]);
      }
    }
  }, [turnCount, currentTwist, gameState, smallBoards, bigBoard, blockedCells]);

  // Hot potato movement
  useEffect(() => {
    if (gameState !== 'playing' || !currentTwist || currentTwist.id !== 'hot_potato') return;
    
    // Move bomb to new random empty cell
    const emptyCells = [];
    smallBoards.forEach((board, boardIdx) => {
      if (bigBoard[boardIdx] === null) {
        board.forEach((cell, cellIdx) => {
          if (cell === null) {
            emptyCells.push({ board: boardIdx, cell: cellIdx });
          }
        });
      }
    });
    
    if (emptyCells.length > 0) {
      const newBomb = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      setBombCell(newBomb);
    }
  }, [turnCount, currentTwist, gameState]);

  // ==================== DIFFICULTY SYSTEM ====================
  
  const getDifficulty = useCallback((globalStar) => {
    const t = Math.max(0, Math.min(100, globalStar)) / 100;
    const easeInQuad = (x) => x * x;
    const easeInCubic = (x) => x * x * x;
    
    return {
      simulations: Math.floor(30 + (5970 * easeInCubic(t))),
      spotWinChance: 0.5 + (0.5 * t),
      spotBlockChance: 0.2 + (0.8 * t),
      temperature: Math.max(0.1, 1.5 - (1.4 * t)),
      sendingAwareness: 0.1 + (0.9 * easeInQuad(t)),
      patternExploitation: Math.min(1, t * 1.5),
      useOpeningBook: t > 0.15,
      heuristicDepth: 1 + Math.floor(t * 3),
    };
  }, []);

  const getGlobalStar = useCallback((enemyIndex, starsOnEnemy) => {
    return (enemyIndex * 10) + starsOnEnemy + 1;
  }, []);

  const getStarProgress = useCallback(() => {
    const pointsPerEnemy = 40;
    const currentEnemyIndex = Math.min(9, Math.floor(aiMemory.starPoints / pointsPerEnemy));
    const pointsOnCurrentEnemy = aiMemory.starPoints - (currentEnemyIndex * pointsPerEnemy);
    const totalStars = Math.floor(aiMemory.starPoints / 4);
    
    const getEnemyPoints = (enemyIdx) => {
      const enemyStartPoints = enemyIdx * pointsPerEnemy;
      const enemyEndPoints = (enemyIdx + 1) * pointsPerEnemy;
      if (aiMemory.starPoints >= enemyEndPoints) return pointsPerEnemy;
      if (aiMemory.starPoints <= enemyStartPoints) return 0;
      return aiMemory.starPoints - enemyStartPoints;
    };
    
    return {
      totalStars: Math.min(100, totalStars),
      totalPoints: aiMemory.starPoints,
      currentEnemyIndex,
      pointsOnCurrentEnemy,
      getEnemyPoints,
      globalStar: getGlobalStar(currentEnemyIndex, Math.floor(pointsOnCurrentEnemy / 4)),
    };
  }, [aiMemory.starPoints, getGlobalStar]);

  // ==================== GAME LOGIC ====================

  const checkWinner = useCallback((squares) => {
    for (let pattern of winPatterns) {
      const [a,b,c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: pattern };
      }
    }
    return null;
  }, []);

  const isBoardFull = useCallback((squares) => {
    return squares.every(cell => cell !== null);
  }, []);

  const getAvailableMoves = useCallback((boards, bigB, active) => {
    const moves = [];
    
    if (active !== null && bigB[active] === null && !isBoardFull(boards[active])) {
      boards[active].forEach((cell, cellIdx) => {
        if (cell === null) {
          // Check if blocked
          if (!blockedCells.some(b => b.board === active && b.cell === cellIdx)) {
            // Check if bomb is there
            if (!bombCell || bombCell.board !== active || bombCell.cell !== cellIdx) {
              moves.push({ board: active, cell: cellIdx });
            }
          }
        }
      });
    } else {
      boards.forEach((board, boardIdx) => {
        if (bigB[boardIdx] === null && !isBoardFull(board)) {
          board.forEach((cell, cellIdx) => {
            if (cell === null) {
              if (!blockedCells.some(b => b.board === boardIdx && b.cell === cellIdx)) {
                if (!bombCell || bombCell.board !== boardIdx || bombCell.cell !== cellIdx) {
                  moves.push({ board: boardIdx, cell: cellIdx });
                }
              }
            }
          });
        }
      });
    }
    
    return moves;
  }, [isBoardFull, blockedCells, bombCell]);

  const applyMove = useCallback((boards, bigB, move, player) => {
    const newBoards = boards.map(b => [...b]);
    const newBigBoard = [...bigB];
    
    newBoards[move.board][move.cell] = player;
    
    const smallResult = checkWinner(newBoards[move.board]);
    if (smallResult) {
      newBigBoard[move.board] = smallResult.winner;
    } else if (isBoardFull(newBoards[move.board])) {
      newBigBoard[move.board] = 'D';
    }
    
    let newActive = move.cell;
    if (newBigBoard[newActive] !== null || isBoardFull(newBoards[newActive])) {
      newActive = null;
    }
    
    return { boards: newBoards, bigBoard: newBigBoard, activeBoard: newActive };
  }, [checkWinner, isBoardFull]);

  const wouldWinBoard = useCallback((boards, boardIdx, cellIdx, player) => {
    const testBoard = [...boards[boardIdx]];
    testBoard[cellIdx] = player;
    return checkWinner(testBoard)?.winner === player;
  }, [checkWinner]);

  const findThreat = useCallback((boards, bigB, active, player) => {
    const opponent = player === 'O' ? 'X' : 'O';
    const relevantBoards = active !== null ? [active] : 
      boards.map((_, i) => i).filter(i => bigB[i] === null && !isBoardFull(boards[i]));
    
    for (let boardIdx of relevantBoards) {
      for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
        if (boards[boardIdx][cellIdx] === null) {
          if (wouldWinBoard(boards, boardIdx, cellIdx, opponent)) {
            return { board: boardIdx, cell: cellIdx };
          }
        }
      }
    }
    return null;
  }, [isBoardFull, wouldWinBoard]);

  const findWin = useCallback((boards, bigB, active, player) => {
    const relevantBoards = active !== null ? [active] : 
      boards.map((_, i) => i).filter(i => bigB[i] === null && !isBoardFull(boards[i]));
    
    for (let boardIdx of relevantBoards) {
      for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
        if (boards[boardIdx][cellIdx] === null) {
          if (wouldWinBoard(boards, boardIdx, cellIdx, player)) {
            return { board: boardIdx, cell: cellIdx };
          }
        }
      }
    }
    return null;
  }, [isBoardFull, wouldWinBoard]);

  // ==================== AI SYSTEM ====================

  const mctsSearch = useCallback((boards, bigB, active, difficulty, memory) => {
    const aiPlayer = 'O';
    const simulations = difficulty.simulations;
    
    class Node {
      constructor(boards, bigBoard, activeBoard, player, move = null, parent = null) {
        this.boards = boards;
        this.bigBoard = bigBoard;
        this.activeBoard = activeBoard;
        this.player = player;
        this.move = move;
        this.parent = parent;
        this.children = [];
        this.wins = 0;
        this.visits = 0;
        this.untriedMoves = getAvailableMoves(boards, bigBoard, activeBoard);
      }
    }
    
    const root = new Node(boards, bigB, active, aiPlayer);
    
    for (let i = 0; i < simulations; i++) {
      let node = root;
      let currentBoards = boards.map(b => [...b]);
      let currentBigBoard = [...bigB];
      let currentActive = active;
      let currentPlayer = aiPlayer;
      
      while (node.untriedMoves.length === 0 && node.children.length > 0) {
        let bestScore = -Infinity;
        let bestChild = null;
        
        for (let child of node.children) {
          const exploitation = child.wins / child.visits;
          const exploration = Math.sqrt(2 * Math.log(node.visits) / child.visits);
          const ucb = exploitation + (exploration * difficulty.temperature);
          if (ucb > bestScore) {
            bestScore = ucb;
            bestChild = child;
          }
        }
        
        node = bestChild;
        const result = applyMove(currentBoards, currentBigBoard, node.move, currentPlayer);
        currentBoards = result.boards;
        currentBigBoard = result.bigBoard;
        currentActive = result.activeBoard;
        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
      }
      
      if (node.untriedMoves.length > 0) {
        const moveIdx = Math.floor(Math.random() * node.untriedMoves.length);
        const move = node.untriedMoves.splice(moveIdx, 1)[0];
        const result = applyMove(currentBoards, currentBigBoard, move, currentPlayer);
        currentBoards = result.boards;
        currentBigBoard = result.bigBoard;
        currentActive = result.activeBoard;
        
        const childNode = new Node(
          currentBoards, currentBigBoard, currentActive,
          currentPlayer === 'O' ? 'X' : 'O',
          move, node
        );
        node.children.push(childNode);
        node = childNode;
        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
      }
      
      let simPlayer = currentPlayer;
      let simBoards = currentBoards.map(b => [...b]);
      let simBigBoard = [...currentBigBoard];
      let simActive = currentActive;
      let depth = 0;
      const maxDepth = 50;
      
      while (depth < maxDepth) {
        const winner = checkWinner(simBigBoard);
        if (winner) break;
        
        // Sudden death check
        if (currentTwist?.id === 'sudden_death') {
          const anyBoardWon = simBigBoard.some(b => b === 'X' || b === 'O');
          if (anyBoardWon) break;
        }
        
        const playableBoards = simBigBoard.filter(b => b === null).length;
        if (playableBoards === 0) break;
        
        const moves = getAvailableMoves(simBoards, simBigBoard, simActive);
        if (moves.length === 0) break;
        
        let selectedMove = moves[Math.floor(Math.random() * moves.length)];
        
        for (let move of moves) {
          if (wouldWinBoard(simBoards, move.board, move.cell, simPlayer)) {
            selectedMove = move;
            break;
          }
        }
        
        if (Math.random() < 0.5) {
          for (let move of moves) {
            const opp = simPlayer === 'O' ? 'X' : 'O';
            if (wouldWinBoard(simBoards, move.board, move.cell, opp)) {
              selectedMove = move;
              break;
            }
          }
        }
        
        const result = applyMove(simBoards, simBigBoard, selectedMove, simPlayer);
        simBoards = result.boards;
        simBigBoard = result.bigBoard;
        simActive = result.activeBoard;
        simPlayer = simPlayer === 'O' ? 'X' : 'O';
        depth++;
      }
      
      let simResult = 0.5;
      
      // Check for sudden death win
      if (currentTwist?.id === 'sudden_death') {
        const xWon = simBigBoard.some(b => b === 'X');
        const oWon = simBigBoard.some(b => b === 'O');
        if (oWon && !xWon) simResult = 1;
        else if (xWon && !oWon) simResult = 0;
        else if (xWon && oWon) simResult = 0.5;
      } else {
        const finalWinner = checkWinner(simBigBoard);
        if (finalWinner?.winner === aiPlayer) simResult = 1;
        else if (finalWinner?.winner === 'X') simResult = 0;
      }
      
      while (node !== null) {
        node.visits++;
        node.wins += simResult;
        node = node.parent;
        simResult = 1 - simResult;
      }
    }
    
    if (root.children.length === 0) {
      const moves = getAvailableMoves(boards, bigB, active);
      return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
    }
    
    if (difficulty.temperature > 0.5) {
      const totalVisits = root.children.reduce((sum, c) => sum + c.visits, 0);
      let r = Math.random() * totalVisits;
      for (let child of root.children) {
        r -= child.visits;
        if (r <= 0) return child.move;
      }
    }
    
    let bestVisits = -1;
    let bestMove = null;
    for (let child of root.children) {
      if (child.visits > bestVisits) {
        bestVisits = child.visits;
        bestMove = child.move;
      }
    }
    
    return bestMove;
  }, [checkWinner, getAvailableMoves, applyMove, wouldWinBoard, currentTwist]);

  const getAIMove = useCallback((boards, bigB, active) => {
    const progress = getStarProgress();
    const difficulty = getDifficulty(progress.globalStar);
    const memory = aiMemory;
    
    const winMove = findWin(boards, bigB, active, 'O');
    if (winMove && Math.random() < difficulty.spotWinChance) {
      return winMove;
    }
    
    const threatMove = findThreat(boards, bigB, active, 'O');
    if (threatMove && Math.random() < difficulty.spotBlockChance) {
      return threatMove;
    }
    
    if (difficulty.patternExploitation > 0 && memory.playerProfile.totalMoves > 20) {
      const moves = getAvailableMoves(boards, bigB, active);
      
      if (Math.random() < difficulty.patternExploitation * 0.3) {
        const totalBoardPref = memory.playerProfile.boardPreferences.reduce((a, b) => a + b, 1);
        const leastFavBoard = memory.playerProfile.boardPreferences
          .map((pref, idx) => ({ idx, pref: pref / totalBoardPref }))
          .filter(b => moves.some(m => m.board === b.idx))
          .sort((a, b) => a.pref - b.pref)[0];
        
        if (leastFavBoard) {
          const boardMoves = moves.filter(m => m.board === leastFavBoard.idx);
          if (boardMoves.length > 0) {
            return boardMoves[Math.floor(Math.random() * boardMoves.length)];
          }
        }
      }
    }
    
    return mctsSearch(boards, bigB, active, difficulty, memory);
  }, [getStarProgress, getDifficulty, aiMemory, findWin, findThreat, getAvailableMoves, mctsSearch]);

  // ==================== LEARNING SYSTEM ====================

  const learnFromGame = useCallback((outcome, history) => {
    setAiMemory(prev => {
      const newMemory = JSON.parse(JSON.stringify(prev));
      
      if (outcome === 'won') {
        newMemory.starPoints += 2;
      } else if (outcome === 'draw') {
        newMemory.starPoints += 1;
      }
      newMemory.starPoints = Math.min(400, newMemory.starPoints);
      
      newMemory.playerProfile.gamesPlayed++;
      
      if (history.length > 0) {
        const firstMove = history[0];
        if (firstMove.player === 'X') {
          newMemory.playerProfile.firstMoveBoards[firstMove.board]++;
          newMemory.playerProfile.firstMoveCells[firstMove.cell]++;
        }
      }
      
      history.forEach((move) => {
        if (move.player === 'X') {
          newMemory.playerProfile.boardPreferences[move.board]++;
          newMemory.playerProfile.cellPreferences[move.cell]++;
          newMemory.playerProfile.totalMoves++;
        }
      });
      
      if (history.length >= 4) {
        const openingKey = history.slice(0, 6).map(m => `${m.board}-${m.cell}`).join(',');
        if (!newMemory.openingBook[openingKey]) {
          newMemory.openingBook[openingKey] = { wins: 0, losses: 0, draws: 0 };
        }
        if (outcome === 'won') newMemory.openingBook[openingKey].losses++;
        else if (outcome === 'lost') newMemory.openingBook[openingKey].wins++;
        else newMemory.openingBook[openingKey].draws++;
      }
      
      return newMemory;
    });
  }, []);

  // ==================== PARTICLES ====================

  const spawnParticles = useCallback((x, y, color, count = 12) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        size: 4 + Math.random() * 4,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15,
          life: p.life - 0.03,
          size: p.size * 0.97,
        }))
        .filter(p => p.life > 0)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [particles.length]);

  // ==================== GAME ACTIONS ====================

  const handleCellClick = (boardIdx, cellIdx) => {
    if (gameState !== 'playing' || !isPlayerTurn) return;
    if (smallBoards[boardIdx][cellIdx] !== null) return;
    if (bigBoard[boardIdx] !== null) return;
    if (activeBoard !== null && activeBoard !== boardIdx) return;
    if (blockedCells.some(b => b.board === boardIdx && b.cell === cellIdx)) return;
    if (bombCell && bombCell.board === boardIdx && bombCell.cell === cellIdx) return;
    
    const result = applyMove(smallBoards, bigBoard, { board: boardIdx, cell: cellIdx }, 'X');
    
    const boardEl = document.getElementById(`board-${boardIdx}`);
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      const cellX = rect.left + (cellIdx % 3) * (rect.width / 3) + (rect.width / 6);
      const cellY = rect.top + Math.floor(cellIdx / 3) * (rect.height / 3) + (rect.height / 6);
      spawnParticles(cellX, cellY, theme.accent, 8);
    }
    
    setSmallBoards(result.boards);
    setBigBoard(result.bigBoard);
    setLastMove({ board: boardIdx, cell: cellIdx });
    
    if (result.bigBoard[boardIdx] !== null && bigBoard[boardIdx] === null) {
      setBoardClaimEffect({ board: boardIdx, player: 'X' });
      setScreenShake(true);
      setTimeout(() => {
        setBoardClaimEffect(null);
        setScreenShake(false);
      }, 400);
    }
    
    setActiveBoard(result.activeBoard);
    setMoveHistory(prev => [...prev, { board: boardIdx, cell: cellIdx, player: 'X' }]);
    setTurnCount(prev => prev + 1);
    
    // Check for game end
    const winner = checkWinner(result.bigBoard);
    
    // Sudden death check
    if (currentTwist?.id === 'sudden_death' && result.bigBoard[boardIdx] === 'X') {
      handleGameEnd('won');
      return;
    }
    
    if (winner) {
      setWinningLine(winner.line);
      handleGameEnd('won');
    } else if (result.bigBoard.filter(b => b !== null).length === 9) {
      handleGameEnd('draw');
    } else {
      // Double down - get second move
      if (isDoubleDown && !doubleDownFirst) {
        setDoubleDownFirst({ board: boardIdx, cell: cellIdx });
        return;
      }
      setDoubleDownFirst(null);
      setIsPlayerTurn(false);
    }
  };

  // AI turn
  useEffect(() => {
    if (gameState === 'playing' && !isPlayerTurn) {
      const progress = getStarProgress();
      const enemy = enemyDefs[selectedEnemy];
      
      const makeAIMove = () => {
        const aiMove = getAIMove(smallBoards, bigBoard, activeBoard);
        
        if (aiMove) {
          const result = applyMove(smallBoards, bigBoard, aiMove, 'O');
          
          const boardEl = document.getElementById(`board-${aiMove.board}`);
          if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            const cellX = rect.left + (aiMove.cell % 3) * (rect.width / 3) + (rect.width / 6);
            const cellY = rect.top + Math.floor(aiMove.cell / 3) * (rect.height / 3) + (rect.height / 6);
            spawnParticles(cellX, cellY, enemy?.color || '#e85a50', 8);
          }
          
          setSmallBoards(result.boards);
          setBigBoard(result.bigBoard);
          setLastMove(aiMove);
          
          if (result.bigBoard[aiMove.board] !== null && bigBoard[aiMove.board] === null) {
            setBoardClaimEffect({ board: aiMove.board, player: 'O' });
            setScreenShake(true);
            setTimeout(() => {
              setBoardClaimEffect(null);
              setScreenShake(false);
            }, 400);
          }
          
          setActiveBoard(result.activeBoard);
          setMoveHistory(prev => [...prev, { board: aiMove.board, cell: aiMove.cell, player: 'O' }]);
          setTurnCount(prev => prev + 1);
          
          // Sudden death check
          if (currentTwist?.id === 'sudden_death' && result.bigBoard[aiMove.board] === 'O') {
            handleGameEnd('lost');
            return true;
          }
          
          const winner = checkWinner(result.bigBoard);
          if (winner) {
            setWinningLine(winner.line);
            handleGameEnd('lost');
            return true;
          } else if (result.bigBoard.filter(b => b !== null).length === 9) {
            handleGameEnd('draw');
            return true;
          }
          
          return false;
        }
        return true;
      };
      
      const timer = setTimeout(() => {
        const gameEnded = makeAIMove();
        
        // Double down - AI gets second move
        if (!gameEnded && isDoubleDown) {
          setTimeout(() => {
            makeAIMove();
            setIsPlayerTurn(true);
          }, 400);
        } else if (!gameEnded) {
          setIsPlayerTurn(true);
        }
      }, 500 + Math.random() * 300);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, smallBoards, bigBoard, activeBoard, selectedEnemy, getAIMove, applyMove, checkWinner, spawnParticles, getStarProgress, currentTwist, isDoubleDown]);

  const handleGameEnd = (result) => {
    setGameState(result);
    
    if (result === 'won') {
      setWins(w => w + 1);
      setShowVictoryEffect(true);
      setTimeout(() => setShowVictoryEffect(false), 3000);
    } else if (result === 'lost') {
      setLosses(l => l + 1);
      setShowDefeatEffect(true);
      setTimeout(() => setShowDefeatEffect(false), 2000);
    } else {
      setDraws(d => d + 1);
    }
    
    learnFromGame(result, moveHistory);
  };

  const startGame = (enemyIndex) => {
    setSelectedEnemy(enemyIndex);
    setBigBoard(Array(9).fill(null));
    setSmallBoards(Array(9).fill(null).map(() => Array(9).fill(null)));
    setActiveBoard(null);
    setIsPlayerTurn(true);
    setWinningLine(null);
    setLastMove(null);
    setMoveHistory([]);
    setTurnCount(0);
    setBlockedCells([]);
    setBombCell(null);
    setFogOfWar(false);
    setIsBlackout(false);
    setIsDoubleDown(false);
    setDoubleDownFirst(null);
    
    // Roll for twist
    const twist = rollTwist();
    setCurrentTwist(twist);
    
    if (twist) {
      // Show dramatic intro
      setShowTwistIntro(true);
      setTwistIntroPhase(0);
      
      setTimeout(() => setTwistIntroPhase(1), 100);
      setTimeout(() => setTwistIntroPhase(2), 800);
      setTimeout(() => {
        setShowTwistIntro(false);
        setGameState('playing');
        initializeTwist(twist);
      }, 1400);
    } else {
      setGameState('playing');
    }
  };

  const goToMenu = () => {
    setGameState('menu');
    setBigBoard(Array(9).fill(null));
    setSmallBoards(Array(9).fill(null).map(() => Array(9).fill(null)));
    setWinningLine(null);
    setSelectedEnemy(null);
    setCurrentTwist(null);
  };

  const playAgain = () => {
    startGame(selectedEnemy);
  };

  const resetProgress = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem('ultimateTTT_aiMemory_v3');
      window.location.reload();
    }
  };

  // ==================== RENDER HELPERS ====================

  const progress = getStarProgress();
  const currentEnemy = enemyDefs[selectedEnemy ?? progress.currentEnemyIndex];

  const StarBar = ({ points, maxPoints = 40, size = 14, color = theme.gold }) => {
    const pointsPerStar = maxPoints / 10;
    const stars = [];
    
    for (let i = 0; i < 10; i++) {
      const starStart = i * pointsPerStar;
      const starEnd = (i + 1) * pointsPerStar;
      
      let fillPercent = 0;
      if (points >= starEnd) fillPercent = 1;
      else if (points > starStart) fillPercent = (points - starStart) / pointsPerStar;
      
      stars.push(
        <div key={i} style={{ position: 'relative', width: size, height: size }}>
          <span style={{ position: 'absolute', left: 0, top: 0, fontSize: size, lineHeight: 1, color: theme.border }}>★</span>
          {fillPercent > 0 && (
            <span style={{ position: 'absolute', left: 0, top: 0, fontSize: size, lineHeight: 1, width: `${fillPercent * 100}%`, overflow: 'hidden', color }}>★</span>
          )}
        </div>
      );
    }
    
    return <div style={{ display: 'flex', gap: '1px' }}>{stars}</div>;
  };

  const SmallBoard = ({ boardIdx, board, isActive, isWon, wonBy, bigBoardWinLine }) => {
    const isBigWinning = bigBoardWinLine?.includes(boardIdx);
    const isClaiming = boardClaimEffect?.board === boardIdx;
    const enemy = enemyDefs[selectedEnemy ?? 0];
    
    // Fog of war visibility
    const isVisible = !fogOfWar || isWon || (lastMove && (
      lastMove.board === boardIdx ||
      Math.abs(Math.floor(lastMove.board / 3) - Math.floor(boardIdx / 3)) <= 1 &&
      Math.abs(lastMove.board % 3 - boardIdx % 3) <= 1
    ));
    
    return (
      <div 
        id={`board-${boardIdx}`}
        style={{
          position: 'relative',
          background: isActive ? 'rgba(139, 122, 204, 0.15)' : 'rgba(26, 22, 37, 0.6)',
          borderRadius: '10px',
          padding: '6px',
          border: isActive ? `2px solid ${theme.accent}` : isBigWinning ? `2px solid ${theme.gold}` : `1px solid ${theme.border}`,
          boxShadow: isActive ? `0 0 25px ${theme.accent}50` : isBigWinning ? `0 0 25px ${theme.goldGlow}` : 'none',
          transition: 'all 0.3s ease',
          transform: isClaiming ? 'scale(1.05)' : 'scale(1)',
          opacity: isVisible ? 1 : 0.3,
          filter: isVisible ? 'none' : 'blur(4px)',
        }}
      >
        {isWon && (
          <div style={{
            position: 'absolute', inset: 0,
            background: wonBy === 'X' ? `${theme.accent}dd` : wonBy === 'O' ? `${enemy.color}dd` : `${theme.textMuted}90`,
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}>
            {wonBy === 'D' ? (
              <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff80' }}>—</span>
            ) : (
              <svg viewBox="0 0 100 100" style={{ width: '65%', height: '65%' }}>
                {wonBy === 'X' ? (
                  <path d="M20 15 L50 45 L80 15 L85 20 L55 50 L85 80 L80 85 L50 55 L20 85 L15 80 L45 50 L15 20 Z" fill="#fff" />
                ) : (
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="14" />
                )}
              </svg>
            )}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
          {board.map((cell, cellIdx) => {
            const isLastMove = lastMove?.board === boardIdx && lastMove?.cell === cellIdx;
            const isHovered = hoverCell?.board === boardIdx && hoverCell?.cell === cellIdx;
            const isBlocked = blockedCells.some(b => b.board === boardIdx && b.cell === cellIdx);
            const isBomb = bombCell?.board === boardIdx && bombCell?.cell === cellIdx;
            const canClick = gameState === 'playing' && isPlayerTurn && !isWon && cell === null && 
                           (activeBoard === null || activeBoard === boardIdx) && !isBlocked && !isBomb && isVisible;
            
            return (
              <div
                key={cellIdx}
                onClick={() => handleCellClick(boardIdx, cellIdx)}
                onMouseEnter={() => canClick && setHoverCell({ board: boardIdx, cell: cellIdx })}
                onMouseLeave={() => setHoverCell(null)}
                style={{
                  width: '32px', height: '32px',
                  background: isBlocked ? '#40303080' : isBomb ? '#e8504030' : isLastMove ? 'rgba(255,255,255,0.12)' : isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(26, 22, 37, 0.8)',
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                  position: 'relative',
                }}
              >
                {isBlocked && <span style={{ fontSize: '16px', opacity: 0.5 }}>✕</span>}
                {isBomb && <span style={{ fontSize: '18px', animation: 'pulse 0.5s ease-in-out infinite' }}>💣</span>}
                {cell === 'X' && (
                  <svg viewBox="0 0 100 100" style={{ width: '70%', height: '70%' }}>
                    <path d="M20 15 L50 45 L80 15 L85 20 L55 50 L85 80 L80 85 L50 55 L20 85 L15 80 L45 50 L15 20 Z" fill={theme.accentBright} />
                  </svg>
                )}
                {cell === 'O' && (
                  <svg viewBox="0 0 100 100" style={{ width: '70%', height: '70%' }}>
                    <circle cx="50" cy="50" r="30" fill="none" stroke={enemy?.color || '#e85a50'} strokeWidth="14" />
                  </svg>
                )}
                {cell === null && !isBlocked && !isBomb && isHovered && canClick && (
                  <svg viewBox="0 0 100 100" style={{ width: '70%', height: '70%', opacity: 0.4 }}>
                    <path d="M20 15 L50 45 L80 15 L85 20 L55 50 L85 80 L80 85 L50 55 L20 85 L15 80 L45 50 L15 20 Z" fill={theme.accent} />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TwistIntro = ({ twist }) => {
    if (!twist) return null;
    
    const getIntroStyle = () => {
      switch (twist.id) {
        case 'speed_round':
          return { transform: twistIntroPhase >= 1 ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.3s ease-out' };
        case 'fog_of_war':
          return { opacity: twistIntroPhase >= 1 ? 1 : 0, filter: twistIntroPhase >= 1 ? 'blur(0px)' : 'blur(10px)', transition: 'all 0.5s ease-out' };
        case 'sudden_death':
          return { transform: twistIntroPhase >= 1 ? 'scale(1)' : 'scale(2)', opacity: twistIntroPhase >= 1 ? 1 : 0, transition: 'all 0.2s ease-out' };
        case 'chaos_shuffle':
          return { transform: twistIntroPhase >= 1 ? 'rotate(0deg)' : 'rotate(180deg)', opacity: twistIntroPhase >= 1 ? 1 : 0, transition: 'all 0.4s ease-out' };
        case 'hot_potato':
          return { transform: twistIntroPhase >= 1 ? 'scale(1)' : 'scale(0.5)', opacity: twistIntroPhase >= 1 ? 1 : 0, animation: twistIntroPhase >= 1 ? 'pulse 0.3s ease-in-out infinite' : 'none' };
        case 'shrinking_board':
          return { clipPath: twistIntroPhase >= 1 ? 'inset(0%)' : 'inset(50%)', transition: 'clip-path 0.4s ease-out' };
        case 'double_down':
          return { transform: twistIntroPhase >= 1 ? 'translateX(0)' : 'translateX(-50px)', opacity: twistIntroPhase >= 1 ? 1 : 0, transition: 'all 0.3s ease-out' };
        case 'blackout':
          return { opacity: twistIntroPhase >= 1 ? 1 : 0, animation: twistIntroPhase >= 1 ? 'flicker 0.1s ease-in-out 3' : 'none' };
        default:
          return {};
      }
    };
    
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: `rgba(0,0,0,${twistIntroPhase >= 1 ? 0.85 : 0})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        transition: 'background 0.2s ease',
      }}>
        <div style={{
          textAlign: 'center',
          ...getIntroStyle(),
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{twist.icon}</div>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            color: twist.color,
            letterSpacing: '8px',
            textShadow: `0 0 30px ${twist.color}, 0 0 60px ${twist.color}50`,
          }}>
            {twist.name}
          </div>
        </div>
      </div>
    );
  };

  const VictoryOverlay = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at center, rgba(244, 197, 66, 0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 100 }}>
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{ 
          position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px', 
          width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`, 
          background: ['#f4c542', '#8b7acc', '#50c878', '#e85a50', '#60d0ff'][i % 5], 
          borderRadius: Math.random() > 0.5 ? '50%' : '2px', 
          animation: `confettiFall ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`, 
        }} />
      ))}
    </div>
  );

  const DefeatOverlay = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at center, rgba(232, 90, 80, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 100 }} />
  );

  const BackgroundPattern = ({ pattern }) => {
    if (pattern === 'stars') return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{ 
            position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, 
            width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`, 
            background: '#fff', borderRadius: '50%', 
            opacity: 0.15 + Math.random() * 0.35, 
            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>
    );
    return null;
  };

  const ParticlesLayer = () => (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.x - p.size / 2,
          top: p.y - p.size / 2,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: '50%',
          opacity: p.life,
          boxShadow: `0 0 ${p.size}px ${p.color}`,
        }} />
      ))}
    </div>
  );

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    
    @keyframes confettiFall { 
      0% { transform: translateY(0) rotate(0deg); opacity: 1; } 
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
    }
    @keyframes twinkle { 
      0%, 100% { opacity: 0.15; transform: scale(1); } 
      50% { opacity: 0.6; transform: scale(1.3); } 
    }
    @keyframes slideIn { 
      0% { transform: translateY(20px); opacity: 0; } 
      100% { transform: translateY(0); opacity: 1; } 
    }
    @keyframes float { 
      0%, 100% { transform: translateY(0px); } 
      50% { transform: translateY(-8px); } 
    }
    @keyframes pulse { 
      0%, 100% { transform: scale(1); } 
      50% { transform: scale(1.1); } 
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-3px) rotate(-0.5deg); }
      40% { transform: translateX(3px) rotate(0.5deg); }
      60% { transform: translateX(-2px) rotate(-0.3deg); }
      80% { transform: translateX(2px) rotate(0.3deg); }
    }
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes glow { 
      0%, 100% { box-shadow: 0 0 10px currentColor; } 
      50% { box-shadow: 0 0 25px currentColor; } 
    }
    
    * { box-sizing: border-box; }
  `;

  return (
    <div style={{ 
      width: '100%', minHeight: '100vh', 
      background: backgrounds[currentBg].gradient, 
      fontFamily: "'Nunito', sans-serif", 
      color: theme.text, 
      position: 'relative', 
      overflow: 'hidden',
      animation: screenShake ? 'shake 0.3s ease-out' : 'none',
    }}>
      <style>{styles}</style>
      <BackgroundPattern pattern={backgrounds[currentBg].pattern} />
      <ParticlesLayer />
      {showVictoryEffect && <VictoryOverlay />}
      {showDefeatEffect && <DefeatOverlay />}
      {showTwistIntro && <TwistIntro twist={currentTwist} />}
      
      {/* Blackout overlay */}
      {isBlackout && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 500 }} />
      )}

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 5, minHeight: '100vh', padding: '20px' }}>
        
        {/* MENU */}
        {gameState === 'menu' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 40px)' }}>
            <div style={{ textAlign: 'center', animation: 'slideIn 0.5s ease-out' }}>
              <div style={{ marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
                <div style={{
                  width: 120, height: 120,
                  background: `linear-gradient(135deg, ${theme.gold}40 0%, ${theme.gold}20 100%)`,
                  borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 60,
                  boxShadow: `0 4px 30px rgba(0,0,0,0.4)`,
                  border: `4px solid ${theme.gold}`,
                  margin: '0 auto',
                }}>🐻</div>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '8px', background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.accentBright} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ULTIMATE TIC TAC TOE</h1>
              <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>9 boards. 100 stars. An AI that learns YOUR weaknesses.</p>
              <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Win small boards to claim them. Get 3 in a row on the big board to win.
              </p>
              
              <button 
                onClick={() => setGameState('select')} 
                style={{ 
                  padding: '16px 48px', fontSize: '18px', fontWeight: 800, fontFamily: 'inherit', 
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentBright} 100%)`, 
                  border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', 
                  boxShadow: '0 4px 20px rgba(139, 122, 204, 0.4)' 
                }}
              >
                PLAY
              </button>
              
              <div style={{ marginTop: '20px' }}>
                <button onClick={resetProgress} style={{ 
                  padding: '8px 16px', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', 
                  background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '6px', 
                  color: theme.textMuted, cursor: 'pointer' 
                }}>
                  Reset Progress
                </button>
              </div>
              
              {/* Background selector */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {backgrounds.map((bg, i) => (
                  <button key={i} onClick={() => setCurrentBg(i)} style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    border: currentBg === i ? `2px solid ${theme.gold}` : `1px solid ${theme.border}`, 
                    background: bg.gradient, cursor: 'pointer' 
                  }} title={bg.name} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SELECT */}
        {gameState === 'select' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 40px)' }}>
            <div style={{ width: '100%', maxWidth: '800px', animation: 'slideIn 0.5s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>CHOOSE YOUR OPPONENT</h2>
                <p style={{ color: theme.textSecondary, fontSize: '13px' }}>
                  Each opponent spans 10 stars. Earn stars by winning!
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {enemyDefs.map((enemy, idx) => {
                  const isUnlocked = idx === 0 || progress.getEnemyPoints(idx - 1) >= 40;
                  const isCurrent = idx === progress.currentEnemyIndex;
                  const enemyPoints = progress.getEnemyPoints(idx);
                  const isComplete = enemyPoints >= 40;
                  
                  return (
                    <div 
                      key={enemy.id}
                      onClick={() => isUnlocked && startGame(idx)}
                      style={{ 
                        background: !isUnlocked ? theme.bgDark : isCurrent ? `${enemy.color}15` : theme.bgPanel, 
                        borderRadius: '12px', 
                        padding: '16px 10px', 
                        border: isCurrent ? `2px solid ${enemy.color}` : `1px solid ${!isUnlocked ? theme.border : enemy.color}40`, 
                        cursor: isUnlocked ? 'pointer' : 'not-allowed', 
                        opacity: isUnlocked ? 1 : 0.4,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { if (isUnlocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${enemy.color}30`; }}}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {!isUnlocked && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '14px' }}>🔒</div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                          <div style={{
                            width: 56, height: 56,
                            background: `linear-gradient(135deg, ${enemy.color}40 0%, ${enemy.color}20 100%)`,
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28,
                            border: `2px solid ${enemy.color}`,
                          }}>{enemy.emoji}</div>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: enemy.color, marginBottom: '2px' }}>{enemy.name}</div>
                        <div style={{ fontSize: '9px', color: theme.textMuted, marginBottom: '10px' }}>{enemy.title}</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <StarBar points={enemyPoints} size={11} color={enemy.color} />
                        </div>
                        
                        {isComplete && (
                          <div style={{ marginTop: '6px', fontSize: '9px', color: theme.gold, fontWeight: 700 }}>
                            ✓ MASTERED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button onClick={goToMenu} style={{ 
                  padding: '10px 24px', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', 
                  background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '8px', 
                  color: theme.textSecondary, cursor: 'pointer' 
                }}>← BACK</button>
              </div>
            </div>
          </div>
        )}

        {/* GAME */}
        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost' || gameState === 'draw') && (
          <div style={{ minHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Top bar with portraits and twist */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              
              {/* Player portrait - left */}
              <div style={{ 
                background: theme.bgPanel, 
                borderRadius: '16px', 
                padding: '16px 20px', 
                border: `2px solid ${isPlayerTurn && gameState === 'playing' ? theme.accent : theme.border}`,
                boxShadow: isPlayerTurn && gameState === 'playing' ? `0 0 30px ${theme.accent}40` : 'none',
                transition: 'all 0.3s ease',
                minWidth: '180px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 72, height: 72,
                    background: `linear-gradient(135deg, ${theme.accent}40 0%, ${theme.accent}20 100%)`,
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                    border: `3px solid ${theme.accent}`,
                  }}>🐻</div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: theme.accentBright }}>Teddy</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>The Champion</div>
                    <div style={{ 
                      padding: '4px 10px', 
                      background: isPlayerTurn && gameState === 'playing' ? theme.accent : theme.bgDark, 
                      borderRadius: '12px', 
                      fontSize: '10px', 
                      fontWeight: 700,
                      display: 'inline-block',
                    }}>
                      {isPlayerTurn && gameState === 'playing' ? 'YOUR TURN' : 'WAITING'}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <span style={{ color: theme.success }}>W: {wins}</span>
                  <span style={{ color: theme.error }}>L: {losses}</span>
                  <span style={{ color: theme.textMuted }}>D: {draws}</span>
                </div>
              </div>
              
              {/* Twist indicator - center */}
              <div style={{ textAlign: 'center', paddingTop: '10px' }}>
                {currentTwist && (
                  <div style={{ 
                    padding: '10px 24px', 
                    background: `${currentTwist.color}20`, 
                    borderRadius: '12px',
                    border: `2px solid ${currentTwist.color}50`,
                    animation: 'glow 2s ease-in-out infinite',
                    color: currentTwist.color,
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{currentTwist.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '2px' }}>{currentTwist.name}</div>
                    {currentTwist.id === 'speed_round' && (
                      <div style={{ 
                        fontSize: '28px', 
                        fontWeight: 900, 
                        marginTop: '4px',
                        color: timerSeconds <= 5 ? theme.error : currentTwist.color,
                      }}>
                        {timerSeconds}s
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Enemy portrait - right */}
              <div style={{ 
                background: theme.bgPanel, 
                borderRadius: '16px', 
                padding: '16px 20px', 
                border: `2px solid ${!isPlayerTurn && gameState === 'playing' ? currentEnemy?.color : theme.border}`,
                boxShadow: !isPlayerTurn && gameState === 'playing' ? `0 0 30px ${currentEnemy?.color}40` : 'none',
                transition: 'all 0.3s ease',
                minWidth: '180px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexDirection: 'row-reverse' }}>
                  <div style={{
                    width: 72, height: 72,
                    background: `linear-gradient(135deg, ${currentEnemy?.color}40 0%, ${currentEnemy?.color}20 100%)`,
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                    border: `3px solid ${currentEnemy?.color}`,
                  }}>{currentEnemy?.emoji}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: currentEnemy?.color }}>{currentEnemy?.name}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}>{currentEnemy?.title}</div>
                    <div style={{ 
                      padding: '4px 10px', 
                      background: !isPlayerTurn && gameState === 'playing' ? currentEnemy?.color : theme.bgDark, 
                      borderRadius: '12px', 
                      fontSize: '10px', 
                      fontWeight: 700,
                      display: 'inline-block',
                      color: !isPlayerTurn && gameState === 'playing' ? '#1a1625' : theme.text,
                    }}>
                      {!isPlayerTurn && gameState === 'playing' ? 'THINKING...' : 'WAITING'}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <StarBar points={progress.getEnemyPoints(selectedEnemy)} size={11} color={currentEnemy?.color} />
                </div>
              </div>
            </div>
            
            {/* Game board - centered and bigger */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '10px',
                  background: theme.bgDark,
                  padding: '14px',
                  borderRadius: '20px',
                  border: `3px solid ${theme.border}`,
                }}>
                  {smallBoards.map((board, boardIdx) => (
                    <SmallBoard
                      key={boardIdx}
                      boardIdx={boardIdx}
                      board={board}
                      isActive={activeBoard === null ? bigBoard[boardIdx] === null : activeBoard === boardIdx}
                      isWon={bigBoard[boardIdx] !== null}
                      wonBy={bigBoard[boardIdx]}
                      bigBoardWinLine={winningLine}
                    />
                  ))}
                </div>
                
                {/* Hint */}
                {gameState === 'playing' && (
                  <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: theme.textMuted }}>
                    {activeBoard !== null ? (
                      <span>Play in the <span style={{ color: theme.accent, fontWeight: 700 }}>highlighted board</span></span>
                    ) : (
                      <span>Play in <span style={{ color: theme.accent, fontWeight: 700 }}>any available board</span></span>
                    )}
                    {isDoubleDown && doubleDownFirst && (
                      <span style={{ color: theme.gold, marginLeft: '12px' }}>• Place your second piece!</span>
                    )}
                  </div>
                )}

                {/* Result Overlay */}
                {(gameState === 'won' || gameState === 'lost' || gameState === 'draw') && (
                  <div style={{ 
                    position: 'absolute', inset: 0, 
                    background: 'rgba(26, 22, 37, 0.95)', 
                    borderRadius: '20px', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    animation: 'slideIn 0.3s ease-out', zIndex: 20 
                  }}>
                    <div style={{ fontSize: '56px', marginBottom: '12px' }}>{gameState === 'won' ? '🏆' : gameState === 'lost' ? '💀' : '🤝'}</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', color: gameState === 'won' ? theme.gold : gameState === 'lost' ? theme.error : theme.textSecondary }}>
                      {gameState === 'won' ? 'VICTORY!' : gameState === 'lost' ? 'DEFEAT!' : 'DRAW!'}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px', fontStyle: 'italic', maxWidth: '240px', textAlign: 'center' }}>
                      {gameState === 'won' ? currentEnemy?.loseQuote : gameState === 'lost' ? currentEnemy?.winQuote : "A battle of equals!"}
                    </div>
                    
                    <div style={{ marginBottom: '16px', padding: '10px 16px', background: theme.bgDark, borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: gameState === 'won' ? theme.success : gameState === 'draw' ? theme.textSecondary : theme.error, marginBottom: '8px', fontWeight: 700 }}>
                        {gameState === 'won' ? '+½ Star' : gameState === 'draw' ? '+¼ Star' : 'No Progress'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <StarBar points={progress.getEnemyPoints(selectedEnemy)} size={14} color={currentEnemy?.color || theme.gold} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={playAgain} style={{ 
                        padding: '12px 28px', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', 
                        background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentBright} 100%)`, 
                        border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' 
                      }}>PLAY AGAIN</button>
                      <button onClick={() => setGameState('select')} style={{ 
                        padding: '12px 28px', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', 
                        background: 'transparent', border: `2px solid ${theme.border}`, borderRadius: '10px', 
                        color: theme.textSecondary, cursor: 'pointer' 
                      }}>OPPONENTS</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltimateTicTacToe;
