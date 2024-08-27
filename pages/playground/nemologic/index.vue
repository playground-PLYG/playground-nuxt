<template>
  <div class="game-play-container">
    <div class="game-header">
      <h2>{{ puzzleData.name }}</h2>
      <div class="game-info">
        <span>난이도: {{ puzzleData.difficulty }}</span>
        <span>카테고리: {{ puzzleData.category }}</span>
      </div>
    </div>

    <div class="game-board" :style="boardStyle">
      <div class="row-hints">
        <div
          v-for="(hint, index) in rowHints"
          :key="`row-${index}`"
          class="row-hint"
        >
          <span
            v-for="(hintCell, hintCellIndex) in hint"
            :key="`row-${index}-${hintCellIndex}`"
            class="row-hint-cell"
          >
            {{ hintCell }}
          </span>
        </div>
      </div>
      <div class="col-hints">
        <div
          v-for="(hint, index) in colHints"
          :key="`col-${index}`"
          class="col-hint"
        >
          <span
            v-for="(hintCell, hintCellIndex) in hint"
            :key="`col-${index}-${hintCellIndex}`"
            class="col-hint-cell"
          >
            {{ hintCell }}
          </span>
        </div>
      </div>
      <div class="cells">
        <div
          v-for="(cell, index) in gameState"
          :key="`cell-${index}`"
          class="cell"
          :class="{ filled: cell.filled, marked: cell.marked }"
          @click="toggleCell(index)"
          @contextmenu.prevent="markCell(index)"
        />
      </div>
    </div>

    <div
      v-if="isViewCorrectAnswerBoard"
      class="game-board q-mt-lg"
      :style="boardStyle"
    >
      <div class="row-hints">
        <div
          v-for="(hint, index) in rowHints"
          :key="`row-${index}`"
          class="row-hint"
        >
          <span
            v-for="(hintCell, hintCellIndex) in hint"
            :key="`row-${index}-${hintCellIndex}`"
            class="row-hint-cell"
          >
            {{ hintCell }}
          </span>
        </div>
      </div>
      <div class="col-hints">
        <div
          v-for="(hint, index) in colHints"
          :key="`col-${index}`"
          class="col-hint"
        >
          <span
            v-for="(hintCell, hintCellIndex) in hint"
            :key="`col-${index}-${hintCellIndex}`"
            class="col-hint-cell"
          >
            {{ hintCell }}
          </span>
        </div>
      </div>
      <div class="cells">
        <div
          v-for="(cell, index) in puzzleData.cells"
          :key="`cell-${index}`"
          class="cell"
          :class="{ filled: cell.filled }"
          :style="{ backgroundColor: cell.color }"
          @click="toggleCell(index)"
          @contextmenu.prevent="markCell(index)"
        />
      </div>
    </div>

    <div class="game-controls">
      <q-btn color="primary" label="확인" @click="checkSolution" />
      <q-btn color="secondary" label="리셋" @click="resetGame" />
      <q-btn
        @mousedown="isViewCorrectAnswerBoard = true"
        @mouseup="isViewCorrectAnswerBoard = false"
        @touchstart="isViewCorrectAnswerBoard = true"
        @touchend="isViewCorrectAnswerBoard = false"
      >
        정답보기(테스트용)
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

interface PuzzleData {
  name: string
  difficulty: string
  category: string
  rows: number
  cols: number
  cells: Array<{ color: string; filled: boolean }>
}

interface GameCell {
  filled: boolean
  marked: boolean
  correct: boolean
}

const $q = useQuasar()

const isViewCorrectAnswerBoard = ref<boolean>(false)

// 퍼즐 데이터 (실제로는 props나 store에서 받아올 수 있습니다)
const puzzleData = ref<PuzzleData>({
  name: 'GPS',
  difficulty: 'easy',
  category: 'general',
  rows: 10,
  cols: 10,
  cells: [
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false }
  ]
})

// 게임 상태
const gameState = ref<GameCell[]>(
  Array(puzzleData.value.rows * puzzleData.value.cols)
    .fill(undefined)
    .map((_cell) => {
      return {
        filled: false,
        marked: false,
        correct: false
      }
    })
)

// 힌트 계산
const rowHints = computed(() => {
  return calculateHints(puzzleData.value.cells, puzzleData.value.cols, true)
})

const colHints = computed(() => {
  return calculateHints(puzzleData.value.cells, puzzleData.value.rows, false)
})

// 보드 스타일
const boardStyle = computed(() => {
  return {
    gridTemplateColumns: `auto repeat(${puzzleData.value.cols}, 1fr)`,
    gridTemplateRows: `auto repeat(${puzzleData.value.rows}, 1fr)`
  }
})

// 힌트 계산 함수
function calculateHints(
  cells: PuzzleData['cells'],
  size: number,
  isRow: boolean
): number[][] {
  const hints: number[][] = []
  for (let i = 0; i < size; i++) {
    const line = isRow
      ? cells.slice(i * size, (i + 1) * size)
      : cells.filter((_, index) => index % size === i)
    let currentCount = 0
    const lineHints: number[] = []
    for (const cell of line) {
      if (cell.filled) {
        currentCount++
      } else if (currentCount > 0) {
        lineHints.push(currentCount)
        currentCount = 0
      }
    }
    if (currentCount > 0) {
      lineHints.push(currentCount)
    }
    hints.push(lineHints.length ? lineHints : [0])
  }
  return hints
}

// 셀 토글 함수
function toggleCell(index: number) {
  gameState.value[index].filled = !gameState.value[index].filled
  gameState.value[index].marked = false
}

// 셀 마킹 함수
function markCell(index: number) {
  gameState.value[index].filled = false
  gameState.value[index].marked = !gameState.value[index].marked
}

// 솔루션 확인 함수
function checkSolution() {
  let correct = true
  gameState.value.forEach((cell, index) => {
    cell.correct = cell.filled === puzzleData.value.cells[index].filled
    if (!cell.correct) {
      correct = false
    }
  })

  if (correct) {
    $q.notify({
      color: 'positive',
      message: '축하합니다! 퍼즐을 완성했습니다!',
      icon: 'check_circle'
    })
  } else {
    $q.notify({
      color: 'negative',
      message: '아직 정답이 아닙니다. 다시 시도해보세요.',
      icon: 'error'
    })
  }
}

// 게임 리셋 함수
function resetGame() {
  gameState.value = gameState.value.map(() => ({
    filled: false,
    marked: false,
    correct: false
  }))
}

onMounted(() => {
  // 여기서 퍼즐 데이터를 로드하거나 초기화할 수 있습니다.
})
</script>

<style lang="scss" scoped>
.game-play-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  .game-header {
    text-align: center;
    margin-bottom: 20px;

    .game-info {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }

  .game-board {
    display: grid;
    gap: 1px;
    background-color: #ccc;
    border: 1px solid #ccc;

    .row-hints {
      grid-column: 1;
      grid-row: 2 / -1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: flex-end;
      padding-right: 5px;

      .row-hint {
        display: flex;
        flex-direction: row;
        gap: 8px;
      }
    }

    .col-hints {
      grid-column: 2 / -1;
      grid-row: 1;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      padding-bottom: 5px;

      .col-hint {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
    }

    .cells {
      grid-column: 2 / -1;
      grid-row: 2 / -1;
      display: grid;
      grid-template-columns: repeat(v-bind('puzzleData.cols'), 1fr);
      gap: 1px;

      .cell {
        aspect-ratio: 1;
        background-color: white;
        border: 1px solid #ccc;
        cursor: pointer;

        &.filled {
          background-color: black;
        }

        &.marked {
          background-color: #f0f0f0;
          &::after {
            content: '×';
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            font-size: 1.5em;
            color: #ff0000;
          }
        }

        &.correct {
          border-color: #4caf50;
        }
      }
    }
  }

  .game-controls {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
}
</style>
