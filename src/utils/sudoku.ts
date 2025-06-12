export type SudokuBoard = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Strategy = 'Naked Single' | 'Backtracking' | 'Advanced';
export type BoardSize = 4 | 5 | 6 | 7 | 8 | 9;

// Create an empty board
export const createEmptyBoard = (size: BoardSize): SudokuBoard => {
    return Array(size).fill(0).map(() => Array(size).fill(0));
};

// Deep copy a board
export const boardCopy = (board: SudokuBoard): SudokuBoard => {
    return board.map(row => [...row]);
};

// Check if placement is valid (only row and column checks for Sudoku-Lite)
export const isValidPlacement = (board: SudokuBoard, row: number, col: number, num: number): boolean => {
    const size = board.length;
    
    // Check row
    for (let i = 0; i < size; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }

    // Check column
    for (let i = 0; i < size; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }

    return true;
};

// Find an empty cell in the board
const findEmptyCell = (board: SudokuBoard): [number, number] | null => {
    const size = board.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return null;
};

// Solve with strategies and track used strategies
const solveWithStrategies = (board: SudokuBoard, strategiesUsed: Set<Strategy>): boolean => {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; // Board is complete
    }

    const [row, col] = emptyCell;
    const candidates: number[] = [];

    // Find candidates for this cell
    for (let num = 1; num <= board.length; num++) {
        if (isValidPlacement(board, row, col, num)) {
            candidates.push(num);
        }
    }

    // Track strategies
    if (candidates.length === 1) {
        strategiesUsed.add('Naked Single');
    } else if (candidates.length > 1) {
        strategiesUsed.add('Backtracking');
    }

    // Try each candidate
    for (const num of candidates) {
        board[row][col] = num;
        if (solveWithStrategies(board, strategiesUsed)) {
            return true;
        }
        board[row][col] = 0; // Backtrack
    }

    return false;
};

// Fill board completely
const fillBoard = (board: SudokuBoard): boolean => {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; // Board is complete
    }

    const [row, col] = emptyCell;
    const size = board.length;
    const nums = Array.from({length: size}, (_, i) => i + 1);
    
    // Shuffle numbers for randomness
    shuffleArray(nums);

    for (const num of nums) {
        if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
                return true;
            }
            board[row][col] = 0; // Backtrack
        }
    }

    return false;
};

// Get strategy set based on difficulty
const getStrategySet = (difficulty: Difficulty): Set<Strategy> => {
    if (difficulty === 'easy') {
        return new Set<Strategy>(['Naked Single']);
    } else if (difficulty === 'medium') {
        return new Set<Strategy>(['Naked Single', 'Backtracking']);
    } else { // 'hard'
        return new Set<Strategy>(['Naked Single', 'Backtracking', 'Advanced']);
    }
};

// Get target number of cells to remove based on difficulty
const getTargetCellsToRemove = (size: number, difficulty: Difficulty): number => {
    const totalCells = size * size;
    switch (difficulty) {
        case 'easy':
            return Math.floor(totalCells * 0.4); // 40% of cells
        case 'medium':
            return Math.floor(totalCells * 0.6); // 60% of cells
        case 'hard':
            return Math.floor(totalCells * 0.75); // 75% of cells
    }
};

// Remove numbers strategically based on difficulty
const removeNumbersStrategically = (
    fullBoard: SudokuBoard, 
    targetStrategies: Set<Strategy>,
    difficulty: Difficulty,
    maxAttempts = 60
): SudokuBoard => {
    const puzzle = boardCopy(fullBoard);
    const size = fullBoard.length;
    const targetCellsToRemove = getTargetCellsToRemove(size, difficulty);
    
    // Create a list of all cells
    const cells: [number, number][] = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            cells.push([i, j]);
        }
    }
    
    // Shuffle cells for randomness
    shuffleArray(cells);
    
    let removedCells = 0;
    let attempts = 0;
    const maxAttemptsPerCell = 3; // Limit attempts per cell to prevent infinite loops
    
    while (removedCells < targetCellsToRemove && cells.length > 0 && attempts < maxAttempts) {
        const [row, col] = cells.pop()!;
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        
        const strategiesUsed = new Set<Strategy>();
        const puzzleCopy = boardCopy(puzzle);
        
        let cellAttempts = 0;
        let canRemove = false;
        
        while (cellAttempts < maxAttemptsPerCell) {
            if (solveWithStrategies(puzzleCopy, strategiesUsed)) {
                // Check if strategies used are within target strategies
                const isWithinTargets = Array.from(strategiesUsed).every(
                    strategy => targetStrategies.has(strategy)
                );
                
                if (isWithinTargets) {
                    canRemove = true;
                    break;
                }
            }
            cellAttempts++;
        }
        
        if (!canRemove) {
            puzzle[row][col] = backup;
        } else {
            removedCells++;
        }
        
        attempts++;
    }
    
    return puzzle;
};

// Shuffle array in place
const shuffleArray = <T>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

// Generate a complete Sudoku board
export const generateBoard = (size: BoardSize): SudokuBoard => {
    const board = createEmptyBoard(size);
    fillBoard(board);
    return board;
};

// Remove numbers from a complete board based on difficulty
export const removeNumbers = (board: SudokuBoard, difficulty: Difficulty): SudokuBoard => {
    const size = board.length;
    const totalCells = size * size;
    let targetEmptyCells: number;
    
    switch (difficulty) {
        case 'easy':
            targetEmptyCells = Math.floor(totalCells * 0.4); // 40% empty
            break;
        case 'medium':
            targetEmptyCells = Math.floor(totalCells * 0.6); // 60% empty
            break;
        case 'hard':
            targetEmptyCells = Math.floor(totalCells * 0.75); // 75% empty
            break;
        default:
            targetEmptyCells = Math.floor(totalCells * 0.4); // Default to easy
    }
    
    const puzzle = boardCopy(board);
    const cells: [number, number][] = [];
    
    // Create a list of all cells
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            cells.push([i, j]);
        }
    }
    
    // Shuffle cells for randomness
    shuffleArray(cells);
    
    let removedCells = 0;
    let attempts = 0;
    const maxAttempts = size * size * 2; // Allow more attempts for larger boards
    
    while (removedCells < targetEmptyCells && cells.length > 0 && attempts < maxAttempts) {
        const [row, col] = cells.pop()!;
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        
        // Verify the puzzle is still solvable
        const puzzleCopy = boardCopy(puzzle);
        if (solveWithStrategies(puzzleCopy, new Set())) {
            removedCells++;
        } else {
            puzzle[row][col] = backup;
        }
        
        attempts++;
    }
    
    return puzzle;
};

// Check if the whole board is valid (only row and column checks for Sudoku-Lite)
export const isBoardValid = (board: SudokuBoard): boolean => {
    const size = board.length;

    // Check rows
    for (let i = 0; i < size; i++) {
        const row = new Set<number>();
        for (let j = 0; j < size; j++) {
            if (board[i][j] !== 0) {
                if (row.has(board[i][j])) return false;
                row.add(board[i][j]);
            }
        }
    }

    // Check columns
    for (let j = 0; j < size; j++) {
        const col = new Set<number>();
        for (let i = 0; i < size; i++) {
            if (board[i][j] !== 0) {
                if (col.has(board[i][j])) return false;
                col.add(board[i][j]);
            }
        }
    }

    return true;
};

// Complete a partially filled board
export const completeBoard = (board: SudokuBoard): SudokuBoard => {
    const size = board.length;
    const completedBoard = boardCopy(board);
    
    // Find all empty cells
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (completedBoard[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    // Try to fill each empty cell
    for (const [row, col] of emptyCells) {
        const candidates = Array.from({length: size}, (_, i) => i + 1);
        shuffleArray(candidates); // Randomize for variety
        
        let filled = false;
        for (const num of candidates) {
            if (isValidPlacement(completedBoard, row, col, num)) {
                completedBoard[row][col] = num;
                filled = true;
                break;
            }
        }
        
        // If we couldn't fill this cell, backtrack and try again
        if (!filled) {
            // Reset the board and try again
            return completeBoard(boardCopy(board));
        }
    }
    
    return completedBoard;
}; 