import React, { useState, useEffect, useCallback } from 'react';
import { SudokuBoard as BoardType, generateBoard, removeNumbers, boardCopy } from '../utils/sudoku';
import { BoardSize, GameVariant, getHebrewChars, getHebrewChar } from '../utils/hebrewChars';
import styles from './SudokuBoard.module.css';

type Difficulty = 'easy' | 'medium' | 'hard';

interface CellProps {
    value: number;
    isInitial: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isError: boolean;
    variant: GameVariant;
    onClick: () => void;
    showHints: boolean;
}

// Utility for combining class names
function cn(...args: (string | false | undefined)[]) {
    return args.filter(Boolean).join(' ');
}

const Cell: React.FC<CellProps> = ({ value, isInitial, isSelected, isHighlighted, isError, variant, onClick, showHints }) => {
    const hebrewChar = getHebrewChar(value, variant);
    const cellClass = cn(
        styles.cell,
        isInitial && styles.initial,
        isSelected && styles.selected,
        isHighlighted && styles.highlighted,
        isError && showHints && styles.error,
        isError && showHints && styles.wrong
    );
    return (
        <div className={cellClass} onClick={onClick}>
            {value !== 0 && (
                <span className={styles.cellSpan} style={{ color: hebrewChar.color }}>
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
        <div className={styles.sudokuContainer}>
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <select 
                        value={boardSize} 
                        onChange={(e) => {
                            setBoardSize(Number(e.target.value) as BoardSize);
                            setIsRunning(false);
                        }}
                        className={styles.controlSelect}
                    >
                        {[4, 5, 6, 7, 8, 9].map(size => (
                            <option key={size} value={size}>{size}x{size}</option>
                        ))}
                    </select>
                    <select 
                        value={gameVariant} 
                        onChange={(e) => setGameVariant(e.target.value as GameVariant)}
                        className={styles.controlSelect}
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
                        className={styles.controlSelect}
                    >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                
                <button 
                        onClick={() => setShowHints(!showHints)}
                        className={styles.controlGroupButton}
                        style={{
                            background: showHints ? '#FFF9C4' : '#EEEEEE',
                            height: '2.2em',
                            width: '30px',
                            marginLeft: '0.5em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5em',
                            transition: 'background 0.2s',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '0.5em',
                        }}
                        aria-label={showHints ? 'Hide Hints' : 'Show Hints'}
                        title={showHints ? 'Hide Hints' : 'Show Hints'}
                    >
                        <LightBulbIcon on={showHints} />
                </button>
                    <button onClick={startNewGame} title="Start new game" className={styles.controlGroupButton}>New</button>
                    <div className={styles.timer}>{formatTime(timer)}</div>
                </div>
            </div>
            <div 
                className={styles.board} 
                style={{
                    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                    gridTemplateRows: `repeat(${boardSize}, 1fr)`
                }}
                data-cols={boardSize}
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
                            showHints={showHints}
                        />
                    ))
                ))}
            </div>
            <div 
                className={styles.numberPad} 
                style={{ gridTemplateColumns: `repeat(${boardSize+1}, 1fr)` }}
                data-cols={boardSize}
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
                        className={styles.numberButton}
                        style={{ color: hebrewChar.color }}
                    >
                        {hebrewChar.char}
                    </button>
                ))}
                <button
                    key="clear"
                    onClick={() => {
                        if (selectedCell) {
                            const [row, col] = selectedCell;
                            if (initialBoard[row][col] === 0) {
                                const newBoard = boardCopy(board);
                                newBoard[row][col] = 0;
                                setBoard(newBoard);
                                validateBoard(newBoard);
                            }
                        }
                    }}
                    className={styles.numberButton}
                    style={{ color: '#888' }}
                    title="Clear cell"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default SudokuBoard; 