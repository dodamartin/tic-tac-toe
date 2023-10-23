import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(false);
  const [winner, setWinner] = useState(null);
  const [computerLevel, setComputerLevel] = useState('');
  const [gameMode, setGameMode] = useState(''); // Set the initial game mode to 'multiplayer'
  const [gameStarted, setGameStarted] = useState(false);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);

  useEffect(() => {
    if (gameStarted && !winner && !xIsNext) {
      const computerMoveTimeout = setTimeout(() => makeComputerMove(), 500);
      return () => clearTimeout(computerMoveTimeout);
    }
  }, [xIsNext, computerLevel, winner, gameStarted]);

  const handleClick = (i) => {
    if (squares[i] || winner) {
      return;
    }
    const squaresCopy = squares.slice();
    squaresCopy[i] = xIsNext ? 'X' : 'O';
    setSquares(squaresCopy);
    setXIsNext(!xIsNext);
  
    // Check for a winner
    const gameWinner = calculateWinner(squaresCopy);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') {
        setXWins(xWins + 1); // X wins
      } else if (gameWinner === 'O') {
        setOWins(oWins + 1); // O wins
      }
    }
  };

  const renderSquare = (i) => {
    return (
      <button className="square" onClick={() => handleClick(i)}>
        {squares[i]}
      </button>
    );
  };

  const getStatus = () => {
    if (winner) {
      return `Winner: ${winner}`;
    } else if (squares.every((square) => square)) {
      return "It's a draw!";
    } else {
      return `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
  };

  const makeComputerMove = () => {
    if (gameMode === 'computer' && !winner) {
      const availableMoves = squares
        .map((square, index) => (square ? null : index))
        .filter((index) => index !== null);
  
      if (availableMoves.length > 0) {
        if (computerLevel === 'easy') {
          // Easy level: Random moves
          const randomIndex = Math.floor(Math.random() * availableMoves.length);
          const squaresCopy = squares.slice();
          squaresCopy[availableMoves[randomIndex]] = 'O';
          setSquares(squaresCopy);
          setXIsNext(true); // Set X as the next player
  
          // Check if O wins with this move
          const newWinner = calculateWinner(squaresCopy);
          if (newWinner === 'O') {
            setWinner(newWinner); // O wins
            return; // Prevent X from making an extra move
          }
        } else if (computerLevel === 'medium') {
          // Medium level: Basic strategy
          const squaresCopy = squares.slice();
  
          // Check if the computer can win with its next move
          for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            squaresCopy[move] = 'O';
            if (calculateWinner(squaresCopy) === 'O') {
              setSquares(squaresCopy);
              setXIsNext(true);
              setWinner('O');
              return; // Prevent X from making an extra move
            }
            squaresCopy[move] = null; // Reset the move
          }
  
          // Check if the player can win with their next move and block it
          for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            squaresCopy[move] = 'X';
            if (calculateWinner(squaresCopy) === 'X') {
              squaresCopy[move] = 'O'; // Block the player's winning move
              setSquares(squaresCopy);
              setXIsNext(true);
              setWinner(calculateWinner(squaresCopy));
              return; // Prevent X from making an extra move
            }
            squaresCopy[move] = null; // Reset the move
          }
  
          // If no immediate wins or blocks, make a random move
          const randomIndex = Math.floor(Math.random() * availableMoves.length);
          squaresCopy[availableMoves[randomIndex]] = 'O';
          setSquares(squaresCopy);
          setXIsNext(true);
        }
        setWinner(calculateWinner(squares));
      }
    }
  };
  
  const handleLevelChange = (level) => {
    setComputerLevel(level);
    startGame();
  };

  const handleModeChange = (mode) => {
    setGameMode(mode);
    startGame();
  };

  const startGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(Math.random() >= 0.5);
    setWinner(null);
    setGameStarted(true);
  };

  const renderLevelButtons = () => {
    return (
      <>
        <button
          onClick={() => handleLevelChange('easy')}
          className={`level-button ${computerLevel === 'easy' ? 'selected' : ''}`}
        >
          Easy
        </button>
        <button
          onClick={() => handleLevelChange('medium')}
          className={`level-button ${computerLevel === 'medium' ? 'selected' : ''}`}
        >
          Medium
        </button>
      </>
    );
  };

  const renderGameModeButtons = () => {
    return (
      <div className="mode-buttons">
        <button
          onClick={() => handleModeChange('multiplayer')}
          className={`mode-button ${gameMode === 'multiplayer' ? 'selected' : ''}`}
        >
          Multiplayer
        </button>
        <button
          onClick={() => handleModeChange('computer')}
          className={`mode-button ${gameMode === 'computer' ? 'selected' : ''}`}
        >
          Play against Computer
        </button>
      </div>
    );
  };

  const renderBoard = () => {
    if (gameStarted && (gameMode === 'computer' || gameMode === 'multiplayer')) {
      // Render the board only when the game has started and a valid game mode is selected.
      if (gameMode === 'computer' && !computerLevel) {
        return (
          <div>
            <p>Please select a computer level.</p>
            {renderLevelButtons()}
          </div>
        );
      } else {
        return (
          <>
            <div className="level-buttons">
              {gameMode === 'computer' && renderLevelButtons()}
            </div>
            <div className="status">{getStatus()}</div>
            <button onClick={startGame} className="start-button">
              Start New Game
            </button>
            <div className="board-row">
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </div>
            <div className="board-row">
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </div>
            <div className="board-row">
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
            <div className="win-count">
              <p>X Wins: {xWins}</p>
              <p>O Wins: {oWins}</p>
            </div>
          </>
        );
      }
    }
  };

  return (
    <div className="game">
      <div className="game-board">
        <div style={{marginBottom:"20px", textAlign:'center'}}>
          {renderBoard()} 
        </div>  
        {renderGameModeButtons()}
      </div>
    </div>
  );
};

const calculateWinner = (squares) => {
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

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
};

export default App;
