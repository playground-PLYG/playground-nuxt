<template>
  <div class="q-gutter-md q-pa-md">
    <div :class="['sudoku', isMobile ? 'mobile' : '']">
      <div class="controls">
        <label
          >난이도:
          <select v-model="difficulty" @change="generateBoard">
            <option v-for="n in 10" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </label>
        <button @click="resetBoard">새 게임</button>
        <button @click="clearBoard">지우기</button>
        <button @click="checkSolution">확인</button>
      </div>
      <div class="timer">시간: {{ formatTime(timer) }}</div>
      <div v-if="!isViewCorrectAnswerBoard" class="grid problem">
        <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="cell"
            :class="{
              initial: initialBoard[rowIndex][colIndex] !== 0,
              'not-initial': initialBoard[rowIndex][colIndex] === 0,
              highlighted: isHighlighted(rowIndex, colIndex),
              selected:
                selectedCell &&
                selectedCell.row === rowIndex &&
                selectedCell.col === colIndex &&
                initialBoard[rowIndex][colIndex] === 0,
              invalid: isInvalid(rowIndex, colIndex),
              'box-border-right': colIndex % 3 === 2 && colIndex !== 8,
              'box-border-bottom': rowIndex % 3 === 2 && rowIndex !== 8
            }"
            @click="selectCell(rowIndex, colIndex)"
            @touchstart.prevent="touchStart(rowIndex, colIndex)"
            @touchend.prevent="touchEnd"
          >
            <div
              v-if="cell.value || initialBoard[rowIndex][colIndex] !== 0"
              class="cell-value"
            >
              {{ cell.value || initialBoard[rowIndex][colIndex] }}
            </div>
            <div v-else class="notes">
              <span v-for="note in cell.notes" :key="note">{{ note }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="grid correctAnswer">
        <div
          v-for="(row, rowIndex) in correctAnswerBoard"
          :key="rowIndex"
          class="row"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="cell"
            :class="{
              initial: initialBoard[rowIndex][colIndex] !== 0,
              'not-initial': initialBoard[rowIndex][colIndex] === 0,
              'box-border-right': colIndex % 3 === 2 && colIndex !== 8,
              'box-border-bottom': rowIndex % 3 === 2 && rowIndex !== 8
            }"
          >
            <div class="cell-value">
              {{ cell.value }}
            </div>
          </div>
        </div>
      </div>
      <div class="mobile-controls">
        <button
          @mousedown="isViewCorrectAnswerBoard = true"
          @mouseup="isViewCorrectAnswerBoard = false"
          @touchstart="isViewCorrectAnswerBoard = true"
          @touchend="isViewCorrectAnswerBoard = false"
        >
          정답보기
        </button>
        <button @click="toggleNoteMode">
          메모 모드: {{ noteModeActive ? '켜짐' : '꺼짐' }}
        </button>
      </div>
      <div class="mobile-controls vertical">
        <div class="num-buttons vertical">
          <button class="btn-num" @click="clickClearButton">X</button>
        </div>
        <div class="num-buttons">
          <button
            v-for="i in 9"
            :key="i"
            class="btn-num"
            @click="clickButton(i)"
          >
            {{ i }}
          </button>
        </div>
      </div>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Cell {
  value: string
  notes: number[]
}

const { loading, platform } = useQuasar()

const isMobile = ref<boolean | undefined>(platform.is.mobile)

const difficulty = ref(1)
const initialBoard = ref<number[][]>([])
const board = ref<Cell[][]>([])
const correctAnswerBoard = ref<Cell[][]>([])
const isViewCorrectAnswerBoard = ref<boolean>(false)
const message = ref('')
const timer = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const selectedCell = ref<{ row: number; col: number } | null>(null)
const highlightedCell = ref<{ row: number; col: number } | null>(null)

const generateBoard = async () => {
  loading.show()
  resetTimer()
  await generateBoardPromise()
  loading.hide()
}

const generateBoardPromise = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // 1. 먼저 전체 보드를 완성시킵니다.
    const completeBoard = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0))

    fillBoard(completeBoard)

    // 2. 난이도에 따라 힌트를 제거합니다.
    const numClues = Math.floor(
      81 - Math.floor((difficulty.value - 1 + 9) * 0.75) * 4
    )
    const newBoard = completeBoard.map((row) => [...row])

    correctAnswerBoard.value = newBoard.map((row) =>
      row.map((cell) => ({
        value: cell === 0 ? '' : cell.toString(),
        notes: []
      }))
    )

    removeNumbers(newBoard, 81 - numClues)

    initialBoard.value = JSON.parse(JSON.stringify(newBoard))
    board.value = newBoard.map((row) =>
      row.map((cell) => ({
        value: cell === 0 ? '' : cell.toString(),
        notes: []
      }))
    )

    resolve(true)
  })
}

const fillBoard = (board: number[][]): boolean => {
  // 빈 칸을 찾습니다.
  const emptySpot = findEmptySpot(board)
  if (!emptySpot) {
    return true // 빈 칸이 없다면 보드가 완성된 것
  }

  const [row, col] = emptySpot

  // 1부터 9까지의 숫자를 랜덤하게 섞습니다.
  const numbers = shuffle(Array.from({ length: 9 }, (_, i) => i + 1))

  for (const num of numbers) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num

      if (fillBoard(board)) {
        return true
      }

      board[row][col] = 0
    }
  }

  return false // 가능한 숫자가 없을 때 false 반환
}

const removeNumbers = (board: number[][], numRemove: number) => {
  let attempts = numRemove
  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (board[row][col] !== 0) {
      const backup = board[row][col]
      board[row][col] = 0

      const copyBoard = board.map((row) => [...row])

      if (!hasUniqueSolution(copyBoard)) {
        board[row][col] = backup // 되돌리기
      } else {
        attempts--
      }
    }
  }
}

const findEmptySpot = (board: number[][]): [number, number] | null => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col]
      }
    }
  }
  return null
}

const shuffle = (array: number[]): number[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const hasUniqueSolution = (board: number[][]): boolean => {
  let solutionCount = 0

  const countSolutions = (board: number[][]): boolean => {
    const emptySpot = findEmptySpot(board)
    if (!emptySpot) {
      solutionCount++
      return solutionCount > 1 // 두 개 이상의 해가 있다면 false
    }

    const [row, col] = emptySpot

    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(board, row, col, num)) {
        board[row][col] = num

        if (countSolutions(board)) {
          return true
        }

        board[row][col] = 0
      }
    }

    return false
  }

  countSolutions(board)
  return solutionCount === 1
}

const isValidPlacement = (
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) {
      return false
    }
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        return false
      }
    }
  }

  return true
}

const isInvalid = (row: number, col: number): boolean => {
  const value = board.value[row][col].value
  if (value === '') {
    return false
  }

  // 행 검사
  if (
    board.value[row].filter((cell, i) => i !== col && cell.value === value)
      .length > 0
  ) {
    return true
  }

  // 열 검사
  if (
    board.value.filter((r, i) => i !== row && r[col].value === value).length > 0
  ) {
    return true
  }

  // 3x3 박스 검사
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        boxRow + i !== row &&
        boxCol + j !== col &&
        board.value[boxRow + i][boxCol + j].value === value
      ) {
        return true
      }
    }
  }

  return false
}

const checkSolution = () => {
  const isValid = board.value.every((row, rowIndex) =>
    row.every((cell, colIndex) => {
      if (cell.value === '') {
        return false
      }

      return isValidPlacement(
        board.value.map((r) =>
          r.map((c) => (c.value === '' ? 0 : Number.parseInt(c.value)))
        ),
        rowIndex,
        colIndex,
        Number.parseInt(cell.value)
      )
    })
  )
  message.value = isValid ? '정답입니다!' : '오답입니다. 다시 확인해보세요.'
}

const resetTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  timer.value = 0
  timerInterval.value = setInterval(() => {
    timer.value++
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

const clearBoard = () => {
  board.value = board.value.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      initialBoard.value[rowIndex][colIndex] === 0
        ? { value: '', notes: [] }
        : cell
    )
  )
}

const resetBoard = () => {
  generateBoard()
}

const selectCell = (row: number, col: number) => {
  if (initialBoard.value[row][col] === 0) {
    highlightCell(row, col)
    selectedCell.value = { row, col }
  }
}

const highlightCell = (row: number, col: number) => {
  highlightedCell.value = { row, col }
}

const isHighlighted = computed(() => (row: number, col: number) => {
  if (!highlightedCell.value) {
    return false
  }
  return row === highlightedCell.value.row || col === highlightedCell.value.col
})

const noteModeActive = ref(false)
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const toggleNoteMode = () => {
  noteModeActive.value = !noteModeActive.value
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!selectedCell.value) {
    return
  }
  const { row, col } = selectedCell.value

  if (event.key >= '1' && event.key <= '9') {
    if (event.shiftKey || noteModeActive.value) {
      // 노트 모드
      const num = Number.parseInt(event.key)
      toggleNote(row, col, num)
    } else {
      // 일반 입력 모드
      board.value[row][col].value = event.key
    }
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    board.value[row][col].value = ''
  }
}

const toggleNote = (row: number, col: number, num: number) => {
  const noteIndex = board.value[row][col].notes.indexOf(num)
  if (noteIndex === -1) {
    board.value[row][col].notes.push(num)
  } else {
    board.value[row][col].notes.splice(noteIndex, 1)
  }
  board.value[row][col].notes.sort((a, b) => a - b)
}

const clickButton = (num: number) => {
  if (!selectedCell.value) {
    return
  }

  const { row, col } = selectedCell.value

  if (noteModeActive.value) {
    // 노트 모드
    toggleNote(row, col, num)
  } else {
    // 일반 입력 모드
    board.value[row][col].value = num.toString()
  }
}

const clickClearButton = () => {
  if (!selectedCell.value) {
    return
  }

  const { row, col } = selectedCell.value

  board.value[row][col].value = ''
}

const touchStart = (row: number, col: number) => {
  selectCell(row, col)
  longPressTimer.value = setTimeout(() => {
    noteModeActive.value = true
  }, 500) // 0.5초 long press
}

const touchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
}

onMounted(() => {
  generateBoard()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
.sudoku {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  user-select: none;

  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;

    select {
      padding: 5px;
    }
  }

  .mobile-controls {
    margin-top: 20px;
    display: flex;
    gap: 10px;

    button {
      padding: 10px 20px;
      font-size: 16px;
      background-color: #4caf50;
      color: white;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: #45a049;
      }
    }

    .num-buttons {
      display: flex;
      gap: 2px;

      button {
        padding: 10px 15px;
        background-color: #84898d;
        border: 1px solid darkgray;
        border-radius: 10px;
      }
    }

    .num-buttons.vertical {
      justify-content: center;
    }
  }

  .mobile-controls.vertical {
    flex-direction: column;
  }

  .timer {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: bold;
  }

  .grid {
    display: grid;
    grid-template-rows: repeat(9, 1fr);
    gap: 1px;
    background-color: #000;
    border: 2px solid #000;

    .row {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 1px;

      .cell {
        width: 50px;
        height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        position: relative;

        &.initial {
          background-color: #f0f0f0;
          font-weight: bold;
        }

        &.not-initial {
          color: limegreen;
          font-weight: bold;
        }

        &.highlighted {
          background-color: #e6f3ff;
        }

        &.selected {
          background-color: #b3d9ff;
        }

        &.initial.highlighted {
          background-color: #d3d9df;
        }

        &.invalid {
          color: red;
        }

        &.box-border-right {
          border-right: 2px solid #000;
        }

        &.box-border-bottom {
          border-bottom: 2px solid #000;
        }

        .cell-value {
          font-size: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .notes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          font-size: 8px;
          pointer-events: none;

          span {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }
  }

  &.mobile {
    .grid {
      .row .cell {
        width: 40px;
        height: 40px;
      }
    }
  }

  button {
    padding: 5px 10px;
    font-size: 14px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: #45a049;
    }
  }

  p {
    margin-top: 10px;
    font-weight: bold;
  }
}
</style>
