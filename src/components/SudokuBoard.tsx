import React, { useState, useEffect, useCallback } from 'react';
import { SudokuBoard as BoardType, generateBoard, removeNumbers, boardCopy } from '../utils/sudoku';
import { BoardSize, GameVariant, getHebrewChars, getHebrewChar } from '../utils/hebrewChars';
import './SudokuBoard.css';

type Difficulty = 'easy' | 'medium' | 'hard';

interface CellProps {
    value: number;
    isInitial: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isError: boolean;
    variant: GameVariant;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, isInitial, isSelected, isHighlighted, isError, variant, onClick }) => {
    const hebrewChar = getHebrewChar(value, variant);
    const cellClass = `cell ${isInitial ? 'initial' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isError ? 'error' : ''}`;
    
    return (
        <div className={cellClass} onClick={onClick}>
            {value !== 0 && (
                <span style={{ color: hebrewChar.color }}>
                    {hebrewChar.char}
                </span>
            )}
        </div>
    );
};

// Light bulb icon for hints
const LightBulbIcon: React.FC<{ on: boolean }> = ({ on }) => (
    <span
        role="img"
        aria-label={on ? 'Hints On' : 'Hints Off'}
        style={{
            color: on ? '#FFD600' : '#BDBDBD',
            fontSize: '1.5em',
            verticalAlign: 'middle',
            transition: 'color 0.2s',
        }}
    >
        💡
    </span>
);

const SudokuBoard: React.FC = () => {
    const [board, setBoard] = useState<BoardType>([]);
    const [initialBoard, setInitialBoard] = useState<BoardType>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [boardSize, setBoardSize] = useState<BoardSize>(6);
    const [gameVariant, setGameVariant] = useState<GameVariant>('chinese');
    const [showHints, setShowHints] = useState(true);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [errors, setErrors] = useState<Set<string>>(new Set());

    const startNewGame = useCallback(() => {
        const newBoard = generateBoard(boardSize);
        const puzzle = removeNumbers(newBoard, difficulty);
        setBoard(boardCopy(puzzle));
        setInitialBoard(boardCopy(puzzle));
        setSelectedCell(null);
        setErrors(new Set());
        setTimer(0);
        setIsRunning(true);
    }, [boardSize, difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const handleCellClick = (row: number, col: number) => {
        if (initialBoard[row][col] !== 0) return;
        setSelectedCell([row, col]);
    };

    const validateBoard = useCallback((currentBoard: BoardType) => {
        const newErrors = new Set<string>();
        // Check rows
        for (let i = 0; i < boardSize; i++) {
            const row = new Set<number>();
            for (let j = 0; j < boardSize; j++) {
                const value = currentBoard[i][j];
                if (value !== 0) {
                    if (row.has(value)) {
                        newErrors.add(`row-${i}`);
                    }
                    row.add(value);
                }
            }
        }
        // Check columns
        for (let j = 0; j < boardSize; j++) {
            const col = new Set<number>();
            for (let i = 0; i < boardSize; i++) {
                const value = currentBoard[i][j];
                if (value !== 0) {
                    if (col.has(value)) {
                        newErrors.add(`col-${j}`);
                    }
                    col.add(value);
                }
            }
        }
        setErrors(newErrors);
    }, [boardSize]);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (initialBoard[row][col] !== 0) return;

        const newBoard = boardCopy(board);
        const key = event.key.toLowerCase();
        
        // Handle number input
        if (/^[1-9]$/.test(key)) {
            const num = parseInt(key);
            if (num <= boardSize) {
                newBoard[row][col] = num;
                setBoard(newBoard);
                validateBoard(newBoard);
            }
        } else if (key === 'backspace' || key === 'delete') {
            newBoard[row][col] = 0;
            setBoard(newBoard);
            validateBoard(newBoard);
        }
    }, [selectedCell, board, initialBoard, boardSize, validateBoard]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isCellError = (row: number, col: number): boolean => {
        return errors.has(`row-${row}`) || errors.has(`col-${col}`);
    };

    const isCellHighlighted = (row: number, col: number): boolean => {
        if (!selectedCell) return false;
        const [selectedRow, selectedCol] = selectedCell;
        return row === selectedRow || col === selectedCol;
    };

    return (
        <div className="sudoku-container">
            <div className="controls">
                <div className="control-group">
                    <select 
                        value={boardSize} 
                        onChange={(e) => {
                            setBoardSize(Number(e.target.value) as BoardSize);
                            setIsRunning(false);
                        }}
                        className="control-select"
                    >
                        {[4, 5, 6, 7, 8, 9].map(size => (
                            <option key={size} value={size}>{size}x{size}</option>
                        ))}
                    </select>
                    <select 
                        value={gameVariant} 
                        onChange={(e) => setGameVariant(e.target.value as GameVariant)}
                        className="control-select"
                    >
                        <option value="chinese">Chinese Numbers</option>
                        <option value="alphabet">Holly Alphabet</option>
                        <option value="colors">Latin Colors</option>
                    </select>
                    <select 
                        value={difficulty} 
                        onChange={(e) => {
                            setDifficulty(e.target.value as Difficulty);
                            setIsRunning(false);
                        }}
                        className="control-select"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                
                    <button
                        onClick={() => setShowHints(!showHints)}
                        style={{
                            background: showHints ? '#FFF9C4' : '#EEEEEE',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5em',
                            height: '2.2em',
                            width: '30px',
                            marginLeft: '0.5em',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5em',
                        }}
                        aria-label={showHints ? 'Hide Hints' : 'Show Hints'}
                        title={showHints ? 'Hide Hints' : 'Show Hints'}
                    >
                        <LightBulbIcon on={showHints} />
                    </button>
                    <button onClick={startNewGame} title="Start new game">New</button>
                    <div className="timer">{formatTime(timer)}</div>
                </div>
            </div>
            <div 
                className="board" 
                style={{
                    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                    gridTemplateRows: `repeat(${boardSize}, 1fr)`
                }}
            >
                {board.map((row, i) => (
                    row.map((cell, j) => (
                        <Cell
                            key={`${i}-${j}`}
                            value={cell}
                            isInitial={initialBoard[i][j] !== 0}
                            isSelected={selectedCell?.[0] === i && selectedCell?.[1] === j}
                            isHighlighted={isCellHighlighted(i, j)}
                            isError={isCellError(i, j)}
                            variant={gameVariant}
                            onClick={() => handleCellClick(i, j)}
                        />
                    ))
                ))}
            </div>
            <div 
                className="number-pad" 
                style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
            >
                {getHebrewChars(boardSize, gameVariant).map((hebrewChar) => (
                    <button 
                        key={hebrewChar.value} 
                        onClick={() => {
                            if (selectedCell) {
                                const [row, col] = selectedCell;
                                if (initialBoard[row][col] === 0) {
                                    const newBoard = boardCopy(board);
                                    newBoard[row][col] = hebrewChar.value;
                                    setBoard(newBoard);
                                    validateBoard(newBoard);
                                }
                            }
                        }}
                        className="number-button"
                        style={{ color: hebrewChar.color }}
                    >
                        {hebrewChar.char}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SudokuBoard; 