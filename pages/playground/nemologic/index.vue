<template>
  <client-only>
    <div class="q-gutter-md q-pa-md" @contextmenu.prevent>
      <div :class="['game-play-container', isMobile ? 'mobile' : '']">
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
                {{ hintCell > 0 ? hintCell : '' }}
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
                {{ hintCell > 0 ? hintCell : '' }}
              </span>
            </div>
          </div>
          <div
            class="cells"
            @mousedown.prevent="startDrag"
            @mousemove="continueDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart.prevent="touchStartDrag"
            @touchmove.prevent="touchMoveDrag"
            @touchend.prevent="endDrag"
          >
            <div
              v-for="(cell, index) in gameState"
              :key="`cell-${index}`"
              class="cell"
              :class="{
                filled: cell.filled,
                marked: cell.marked,
                'preview-filled': dragPreview[index]?.filled,
                'preview-unfilled': dragPreview[index]?.unfilled,
                'preview-marked': dragPreview[index]?.marked,
                'preview-unmarked': dragPreview[index]?.unmarked
              }"
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
          <div
            class="cells"
            @mousedown.prevent="startDrag"
            @mousemove="continueDrag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @touchstart.prevent="touchStartDrag"
            @touchmove.prevent="touchMoveDrag"
            @touchend.prevent="endDrag"
          >
            <div
              v-for="(cell, index) in puzzleData.cells"
              :key="`cell-${index}`"
              class="cell"
              :class="{ filled: cell.filled }"
              :style="{ backgroundColor: cell.color }"
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
          <q-btn
            :color="isMarkingMode ? 'primary' : 'secondary'"
            :label="isMarkingMode ? '마킹 모드' : '선택 모드'"
            @click="
              () => {
                isMarkingMode = !isMarkingMode
              }
            "
          />
        </div>
      </div>
    </div>
  </client-only>
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
}

const $q = useQuasar()
const { platform } = useQuasar()

const isMobile = ref<boolean | undefined>(platform.is.mobile)

const isViewCorrectAnswerBoard = ref<boolean>(false)
const isMarkingMode = ref(false)
const isDragging = ref(false)
const dragStartIndex = ref<number | null>(null)
const initialCellState = ref<{ filled: boolean; marked: boolean } | null>(null)
const dragPreview = ref<
  {
    filled: boolean
    unfilled: boolean
    marked: boolean
    unmarked: boolean
    isTarget: boolean
  }[]
>([])

const puzzleData = ref<PuzzleData>({
  name: 'Cloud',
  difficulty: '',
  category: '',
  rows: 20,
  cols: 20,
  cells: [
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
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
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: 'rgb(0, 0, 0)', filled: true },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
    { color: '#fff', filled: false },
    { color: '#fff', filled: false },
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
        marked: false
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

const rowHintsMaxLength = computed(() => {
  return rowHints.value.reduce((max, current) => {
    return Math.max(max, current.length)
  }, 0)
})

// 보드 스타일
const boardStyle = computed(() => {
  return {
    gridTemplateColumns: `auto repeat(${puzzleData.value.cols}, 1fr)`,
    gridTemplateRows: `auto repeat(${puzzleData.value.rows}, 1fr)`
  }
})

const cellMinSize = computed(() => {
  return (
    40 -
    (puzzleData.value.cols > puzzleData.value.rows
      ? puzzleData.value.cols
      : puzzleData.value.rows) +
    'px'
  )
})

// 힌트 계산 함수
const calculateHints = (
  cells: PuzzleData['cells'],
  size: number,
  isRow: boolean
): number[][] => {
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

    hints

    hints.push(lineHints.length ? lineHints : [0])
  }

  console.debug(size, isRow, hints)

  const maxLength = hints.reduce((max, current) => {
    return Math.max(max, current.length)
  }, 0)

  return hints.map((arr) => {
    const diff = maxLength - arr.length
    if (diff > 0) {
      return Array(diff).fill(-1).concat(arr)
    }
    return arr
  })
}

const getClickedCellIndex = (event: MouseEvent | TouchEvent): number | null => {
  const target = event.target as HTMLElement
  const cellElement = target.closest('.cell') as HTMLElement | null

  if (cellElement && cellElement.parentElement?.classList.contains('cells')) {
    const cells = Array.from(cellElement.parentElement.children)
    const index = cells.indexOf(cellElement)

    return index !== -1 ? index : null
  }

  return null
}

const startDrag = (event: MouseEvent) => {
  console.debug(rowHints.value)
  const cellIndex = getClickedCellIndex(event)

  if (cellIndex === null) {
    return
  }

  isDragging.value = true
  dragStartIndex.value = cellIndex

  initialCellState.value = {
    filled: gameState.value[cellIndex].filled,
    marked: gameState.value[cellIndex].marked
  }

  updateDragPreview(cellIndex, cellIndex)
}

const continueDrag = (event: MouseEvent) => {
  if (!isDragging.value || dragStartIndex.value === null) {
    return
  }

  const cellIndex = getClickedCellIndex(event)

  if (cellIndex === null) {
    return
  }

  updateDragPreview(dragStartIndex.value, cellIndex)
}

const endDrag = () => {
  if (isDragging.value && dragStartIndex.value !== null) {
    applyDragAction()
  }
  isDragging.value = false
  dragStartIndex.value = null
  initialCellState.value = null
  dragPreview.value = []
}

const updateDragPreview = (startIndex: number, endIndex: number) => {
  const startRow = Math.floor(startIndex / puzzleData.value.cols)
  const startCol = startIndex % puzzleData.value.cols
  const endRow = Math.floor(endIndex / puzzleData.value.cols)
  const endCol = endIndex % puzzleData.value.cols

  const minRow = Math.min(startRow, endRow)
  const maxRow = Math.max(startRow, endRow)
  const minCol = Math.min(startCol, endCol)
  const maxCol = Math.max(startCol, endCol)

  dragPreview.value = Array(puzzleData.value.rows * puzzleData.value.cols)
    .fill(undefined)
    .map((_cell) => {
      return {
        filled: false,
        unfilled: false,
        marked: false,
        unmarked: false,
        isTarget: false
      }
    })

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const index = row * puzzleData.value.cols + col

      if (isMarkingMode.value) {
        dragPreview.value[index] = {
          filled: false,
          unfilled: false,
          marked: !initialCellState.value!.marked,
          unmarked: initialCellState.value!.marked,
          isTarget: true
        }
      } else {
        dragPreview.value[index] = {
          filled: !initialCellState.value!.filled,
          unfilled: initialCellState.value!.filled,
          marked: false,
          unmarked: false,
          isTarget: true
        }
      }
    }
  }
}

const applyDragAction = () => {
  if (initialCellState.value === null || dragStartIndex.value === null) {
    return
  }

  dragPreview.value.forEach((preview, index) => {
    if (preview.isTarget) {
      if (isMarkingMode.value) {
        gameState.value[index].marked = preview.marked
        gameState.value[index].filled = false
      } else {
        gameState.value[index].filled = preview.filled
        gameState.value[index].marked = false
      }
    }
  })
}

const touchStartDrag = (event: TouchEvent) => {
  const cellIndex = getClickedCellIndex(event)

  if (cellIndex === null) {
    return
  }

  isDragging.value = true
  dragStartIndex.value = cellIndex

  initialCellState.value = {
    filled: gameState.value[cellIndex].filled,
    marked: gameState.value[cellIndex].marked
  }

  updateDragPreview(cellIndex, cellIndex)
}

const touchMoveDrag = (event: TouchEvent) => {
  if (!isDragging.value || dragStartIndex.value === null) {
    return
  }

  const cellIndex = getClickedCellIndex(event)

  if (cellIndex === null) {
    return
  }

  updateDragPreview(dragStartIndex.value, cellIndex)
}

// 솔루션 확인 함수
function checkSolution() {
  let correct = true

  gameState.value.some((cell, index) => {
    if (cell.filled !== puzzleData.value.cells[index].filled) {
      correct = false

      return true
    } else {
      return false
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
    marked: false
  }))
}

onMounted(() => {
  // api 조회
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

  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

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
    overflow: auto;

    .row-hints {
      grid-column: 1;
      grid-row: 2 / -1;
      display: grid;
      grid-template-rows: repeat(v-bind('puzzleData.rows'), 1fr);
      gap: 1px;
      border-right: 1px solid whitesmoke;

      .row-hint {
        display: grid;
        grid-template-columns: repeat(v-bind('rowHintsMaxLength'), 1fr);
        gap: 5px;
        min-height: v-bind('cellMinSize');
        text-align: center;
        border-bottom: 2px solid whitesmoke;
      }
    }

    .col-hints {
      grid-column: 2 / -1;
      grid-row: 1;
      display: grid;
      grid-template-columns: repeat(v-bind('puzzleData.cols'), 1fr);
      gap: 1px;
      border-bottom: 1px solid whitesmoke;

      .col-hint {
        display: grid;
        gap: 1px;
        min-width: v-bind('cellMinSize');
        align-content: end;
        grid-template-columns: repeat(1, 1fr);
        text-align: center;
        border-left: 2px solid whitesmoke;
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
        min-width: v-bind('cellMinSize');
        min-height: v-bind('cellMinSize');

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

        &.preview-filled,
        &.preview-unfilled {
          background-color: rgba(0, 0, 0, 0.5);
        }

        &.preview-marked::after {
          content: '×';
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          font-size: 1.5em;
          color: rgba(255, 0, 0, 0.5);
        }

        &.preview-unmarked::after {
          content: '';
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          font-size: 1.5em;
          color: rgba(255, 0, 0, 0.5);
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
