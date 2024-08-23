<template>
  <div class="q-gutter-md q-pa-md">
    <div class="tetris-game">
      <div class="game-container">
        <div class="board-wrap">
          <div class="board">
            <div v-for="(row, y) in displayBoard" :key="y" class="row">
              <div
                v-for="(cell, x) in row"
                :key="x"
                :class="['cell', `color-${cell}`]"
              />
            </div>
          </div>
        </div>
        <div class="side-panel">
          <div class="next-piece">
            <div class="text-h5">Next</div>
            <div class="piece-preview-wrap">
              <div class="piece-preview">
                <div v-for="(row, y) in nextPieceDisplay" :key="y" class="row">
                  <div
                    v-for="(cell, x) in row"
                    :key="x"
                    :class="['cell', `color-${cell}`]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="hold-piece">
            <div class="text-h5">Hold (c key)</div>
            <div class="piece-preview-wrap">
              <div class="piece-preview">
                <div v-for="(row, y) in holdPieceDisplay" :key="y" class="row">
                  <div
                    v-for="(cell, x) in row"
                    :key="x"
                    :class="['cell', `color-${cell}`]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="score-board-wrap">
            <div class="score-board">
              <div class="text-h5 q-mb-md">Score: {{ score }}</div>
              <div class="text-h5 q-mb-md">Time: {{ formatTime(time) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="controls">
        <button @click="startGame">시작</button>
        <button @click="pauseGame">일시정지</button>
        <button @click="resetGame">리셋</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 25
const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2]
  ],
  [
    [3, 3, 0],
    [0, 3, 3]
  ],
  [
    [0, 4, 4],
    [4, 4, 0]
  ],
  [
    [5, 5, 5],
    [0, 5, 0]
  ],
  [
    [6, 6, 6],
    [6, 0, 0]
  ],
  [
    [7, 7, 7],
    [0, 0, 7]
  ]
]
const SIDE_X = 7
const SIDE_Y = 7

const board = ref<number[][]>([])
const nextPiece = ref<number[][]>([])
const holdPiece = ref<number[][]>([])
const currentPiece = ref<{
  shape: number[][]
  x: number
  y: number
} | null>(null)
const score = ref(0)
const time = ref(0)
const gameInterval = ref<ReturnType<typeof setInterval> | null>(null)
const gameSpeed = ref(1000)
const isGameOver = ref(false)

const initializeBoard = () => {
  board.value = Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0))
}

const displayBoard = computed(() => {
  const display = board.value.map((row) => [...row])
  if (currentPiece.value) {
    const { shape, x, y } = currentPiece.value
    shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (
          value &&
          y + dy >= 0 &&
          y + dy < BOARD_HEIGHT &&
          x + dx >= 0 &&
          x + dx < BOARD_WIDTH
        ) {
          display[y + dy][x + dx] = value
        }
      })
    })
  }
  return display
})

const centerPiece = (piece: number[][]) => {
  const display = Array(SIDE_Y)
    .fill(0)
    .map(() => Array(SIDE_X).fill(0))
  if (piece && piece.length) {
    const width = piece[0].length
    const height = piece.length

    const startX = Math.floor((SIDE_X - width) / 2)
    const startY = Math.floor((SIDE_Y - height) / 2)

    piece.forEach((row, y) => {
      row.forEach((value, x) => {
        display[startY + y][startX + x] = value
      })
    })
  }

  return display
}

const nextPieceDisplay = computed(() => {
  return centerPiece(nextPiece.value)
})

const holdPieceDisplay = computed(() => {
  return centerPiece(holdPiece.value)
})

const newPiece = () => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return {
    shape,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
    y: 0
  }
}

const canMove = (piece: typeof currentPiece.value, dx: number, dy: number) => {
  if (!piece) {
    return false
  }
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + dx
        const newY = piece.y + y + dy
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board.value[newY][newX])
        ) {
          return false
        }
      }
    }
  }
  return true
}

const movePiece = (dx: number, dy: number) => {
  if (currentPiece.value && canMove(currentPiece.value, dx, dy)) {
    currentPiece.value.x += dx
    currentPiece.value.y += dy
    return true
  }
  return false
}

const rotatePiece = () => {
  if (!currentPiece.value) {
    return
  }
  const rotated = currentPiece.value.shape[0].map((_, i) =>
    currentPiece.value!.shape.map((row) => row[i]).reverse()
  )
  const originalShape = currentPiece.value.shape
  currentPiece.value.shape = rotated
  if (!canMove(currentPiece.value, 0, 0)) {
    currentPiece.value.shape = originalShape
  }
}

const mergePiece = () => {
  if (!currentPiece.value) {
    return
  }
  for (let y = 0; y < currentPiece.value.shape.length; y++) {
    for (let x = 0; x < currentPiece.value.shape[y].length; x++) {
      if (currentPiece.value.shape[y][x]) {
        board.value[currentPiece.value.y + y][currentPiece.value.x + x] =
          currentPiece.value.shape[y][x]
      }
    }
  }
}

const clearLines = () => {
  let linesCleared = 0
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board.value[y].every((cell) => cell !== 0)) {
      board.value.splice(y, 1)
      board.value.unshift(Array(BOARD_WIDTH).fill(0))
      linesCleared++
      y++
    }
  }
  if (linesCleared > 0) {
    score.value += linesCleared * 100
  }
}

const gameLoop = () => {
  if (isGameOver.value) {
    return
  }

  if (!currentPiece.value) {
    currentPiece.value =
      nextPiece.value.length > 0
        ? { shape: nextPiece.value, x: 4, y: 0 }
        : newPiece()
    nextPiece.value = newPiece().shape
    if (!canMove(currentPiece.value, 0, 0)) {
      gameOver()
      return
    }
    // 새 블록이 생성되면 즉시 다음 루프 실행
    requestAnimationFrame(gameLoop)
    return
  }

  if (!movePiece(0, 1)) {
    mergePiece()
    clearLines()
    currentPiece.value = null
    // 블록이 바닥에 닿았을 때도 즉시 다음 루프 실행
    requestAnimationFrame(gameLoop)
  } else {
    // 블록이 아직 떨어지고 있을 때는 gameSpeed에 따라 다음 루프 실행
    setTimeout(() => requestAnimationFrame(gameLoop), gameSpeed.value)
  }
}

const startGame = () => {
  if (!gameInterval.value) {
    isGameOver.value = false
    initializeBoard()
    nextPiece.value = newPiece().shape
    requestAnimationFrame(gameLoop) // 게임 루프 시작
    gameInterval.value = setInterval(() => {
      if (!isGameOver.value) {
        time.value++
      }
    }, 1000)
  }
}

const pauseGame = () => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
    gameInterval.value = null
  }
  isGameOver.value = true // 이렇게 하면 gameLoop가 멈춥니다
}

const resetGame = () => {
  pauseGame()
  initializeBoard()
  currentPiece.value = null
  nextPiece.value = []
  holdPiece.value = []
  score.value = 0
  time.value = 0
  isGameOver.value = false
}

const gameOver = () => {
  isGameOver.value = true
  pauseGame()
  alert(`Game Over! Your score: ${score.value}`)
}

const holdCurrentPiece = () => {
  if (!currentPiece.value || isGameOver.value) {
    return
  }
  if (holdPiece.value.length === 0) {
    holdPiece.value = currentPiece.value.shape
    currentPiece.value = null
  } else {
    const temp = holdPiece.value
    holdPiece.value = currentPiece.value.shape
    currentPiece.value = { shape: temp, x: 4, y: 0 }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!gameInterval.value || isGameOver.value) {
    return
  }
  switch (event.key) {
    case 'ArrowLeft':
      movePiece(-1, 0)
      break
    case 'ArrowRight':
      movePiece(1, 0)
      break
    case 'ArrowDown':
      movePiece(0, 1)
      break
    case 'ArrowUp':
      rotatePiece()
      break
    case ' ':
      while (movePiece(0, 1)) {
        // Do Nothing
      }
      break
    case 'c':
    case 'C':
      holdCurrentPiece()
      break
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  pauseGame()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.tetris-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;

  .game-container {
    display: flex;
    gap: 20px;
  }

  .board-wrap {
    height: fit-content;
    background-color: #222;
    border: 2px solid #444;

    .board {
      display: grid;
      grid-template-rows: repeat(25, 25px);
      grid-template-columns: repeat(10, 25px);
      gap: 1px;
      padding: 10px;

      .row {
        display: contents;
      }

      .cell {
        width: 25px;
        height: 25px;
        border: 1px solid #444;

        &.color-0 {
          background-color: #111;
        }
        &.color-1 {
          background-color: #00ffff;
        }
        &.color-2 {
          background-color: #ffff00;
        }
        &.color-3 {
          background-color: #ff00ff;
        }
        &.color-4 {
          background-color: #00ff00;
        }
        &.color-5 {
          background-color: #ff0000;
        }
        &.color-6 {
          background-color: #0000ff;
        }
        &.color-7 {
          background-color: #ff7f00;
        }
      }
    }
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 30px;

    .piece-preview-wrap {
      width: max-content;
      height: max-content;
      padding: 3px;
      background-color: #222;
      border: 2px solid #444;

      .piece-preview {
        display: grid;
        grid-template-rows: repeat(7, 15px);
        grid-template-columns: repeat(7, 15px);
        gap: 1px;

        .row {
          display: contents;
        }

        .cell {
          width: 15px;
          height: 15px;
          border: 1px solid #444;

          &.color-0 {
            background-color: #111;
          }
          &.color-1 {
            background-color: #00ffff;
          }
          &.color-2 {
            background-color: #ffff00;
          }
          &.color-3 {
            background-color: #ff00ff;
          }
          &.color-4 {
            background-color: #00ff00;
          }
          &.color-5 {
            background-color: #ff0000;
          }
          &.color-6 {
            background-color: #0000ff;
          }
          &.color-7 {
            background-color: #ff7f00;
          }
        }
      }
    }

    .score-board-wrap {
      padding-top: 120px;
    }
  }

  .controls {
    margin-top: 20px;

    button {
      margin: 0 10px;
      padding: 10px 20px;
      font-size: 16px;
      background-color: #4caf50;
      color: white;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #45a049;
      }
    }
  }
}
</style>
