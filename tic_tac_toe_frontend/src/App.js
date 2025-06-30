import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Tic Tac Toe Game - Modern Minimalistic UI
 * Features: 2 Player, Single Player vs Computer (Easy), Responsive, Restart, Win/Draw Detection, Light Theme.
 */

// --- Constants ---
const initialBoard = Array(9).fill(null);
const PLAYER_X = "X";
const PLAYER_O = "O";

/**
 * Returns the winner info or null if no winner.
 * @param board
 * @returns {null|{winner, line:number[]}}
 */
// PUBLIC_INTERFACE
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { winner: board[a], line };
    }
  }
  return null;
}

/**
 * Returns true if the board is full with no winner.
 * @param board
 */
// PUBLIC_INTERFACE
function isDraw(board) {
  return board.every(Boolean) && !calculateWinner(board);
}

/**
 * Returns a random empty index ("easy" AI).
 * @param board
 */
// PUBLIC_INTERFACE
function getAIMove(board) {
  const emptyIndices = board
    .map((cell, idx) => (cell ? null : idx))
    .filter(idx => idx !== null);
  if (emptyIndices.length === 0) return null;
  // Simple random move AI for easy/introductory implementation
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

/**
 * Board Square component
 */
function Square({ value, onClick, isHighlight }) {
  return (
    <button
      className={`ttt-square${isHighlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `${value} square` : "empty square"}
      disabled={Boolean(value)}
    >
      {value}
    </button>
  );
}

/**
 * Game Board component
 */
function Board({ board, onSquareClick, highlightLine }) {
  function renderSquare(idx) {
    const isHighlight = highlightLine && highlightLine.includes(idx);
    return (
      <Square
        key={idx}
        value={board[idx]}
        onClick={() => onSquareClick(idx)}
        isHighlight={isHighlight}
      />
    );
  }

  return (
    <div className="ttt-board" role="grid">
      {[0, 1, 2].map(row =>
        <div className="ttt-board-row" key={row} role="row">
          {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
        </div>
      )}
    </div>
  );
}

/**
 * Mode selection component
 */
function ModeSelector({ mode, setMode }) {
  return (
    <div className="ttt-mode-select">
      <button
        className={`ttt-mode-btn${mode === "2p" ? " selected" : ""}`}
        onClick={() => setMode("2p")}
      >
        2 Player
      </button>
      <button
        className={`ttt-mode-btn${mode === "1p" ? " selected" : ""}`}
        onClick={() => setMode("1p")}
      >
        Single vs Computer
      </button>
    </div>
  );
}

/**
 * Restart button component
 */
function RestartButton({ onRestart }) {
  return (
    <button className="ttt-restart-btn" onClick={onRestart}>
      Restart Game
    </button>
  );
}

/**
 * Main App
 */
function App() {
  // Theme control
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Game state
  const [board, setBoard] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState("2p"); // "2p" or "1p"
  const [gameActive, setGameActive] = useState(true);
  const [status, setStatus] = useState("Next: X");

  const winnerInfo = calculateWinner(board);
  const draw = isDraw(board);

  useEffect(() => {
    // Game status logic
    if (winnerInfo) {
      setGameActive(false);
      setStatus(
        mode === "1p"
          ? winnerInfo.winner === PLAYER_X
            ? "You win! 🎉"
            : "Computer wins! 🤖"
          : `Winner: ${winnerInfo.winner} 🏆`
      );
    } else if (draw) {
      setGameActive(false);
      setStatus("Draw! 🤝");
    } else {
      if (mode === "2p") {
        setStatus(`Next: ${isXNext ? "X" : "O"}`);
      } else {
        if (isXNext) {
          setStatus("Your turn (X)");
        } else {
          setStatus("Computer's turn (O)");
        }
      }
    }
  }, [board, winnerInfo, draw, isXNext, mode]);

  // Logic: If AI's turn and game active, make a move
  useEffect(() => {
    if (
      mode === "1p" &&
      !isXNext &&
      gameActive &&
      !winnerInfo &&
      !draw
    ) {
      const move = getAIMove(board);
      if (move !== null) {
        const timer = setTimeout(() => {
          handleMove(move);
        }, 450); // Delay for realism
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line
  }, [mode, isXNext, gameActive, board]);

  function handleMove(idx) {
    if (board[idx] || winnerInfo || !gameActive) return;
    let nextBoard = board.slice();
    nextBoard[idx] = isXNext ? PLAYER_X : PLAYER_O;
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  }

  function handleSquareClick(idx) {
    if (!gameActive) return;
    if (mode === "1p") {
      if (!isXNext) return; // Player can't move on computer's turn
      handleMove(idx);
    } else {
      handleMove(idx);
    }
  }

  function handleRestart() {
    setBoard(initialBoard);
    setIsXNext(true);
    setGameActive(true);
    setStatus(mode === "1p" ? "Your turn (X)" : "Next: X");
  }

  function handleModeChange(selected) {
    setMode(selected);
    setBoard(initialBoard);
    setIsXNext(true);
    setGameActive(true);
    setStatus(selected === "1p" ? "Your turn (X)" : "Next: X");
  }

  const highlightLine = winnerInfo ? winnerInfo.line : null;

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <p className="ttt-description">
          Play the classic game in minimal style.<br />
          Choose mode and get started!
        </p>
        <ModeSelector mode={mode} setMode={handleModeChange} />
        <div className="ttt-status" aria-live="polite">{status}</div>
        <Board
          board={board}
          onSquareClick={handleSquareClick}
          highlightLine={highlightLine}
        />
        <div className="ttt-controls">
          <RestartButton onRestart={handleRestart} />
        </div>
        <footer className="ttt-footer">
          <span>
            Made with <span aria-label="heart" style={{ color: "#e74c3c" }}>♥</span> & React
          </span>
        </footer>
      </header>
    </div>
  );
}

export default App;

