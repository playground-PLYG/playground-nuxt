<template>
  <div class="puzzle-container">
    <div class="header">
      <span class="text-h5">네모로직 퍼즐 생성</span>
    </div>

    <div class="controls">
      <div class="control-row">
        <div class="control-item">
          <span>행 수</span>
          <q-btn
            flat
            color="primary"
            icon="remove"
            :disable="numRows <= 10"
            @click="adjustGridSize('row', -1)"
          />
          <q-input v-model.number="numRows" type="number" min="2" readonly />
          <q-btn
            flat
            color="primary"
            icon="add"
            @click="adjustGridSize('row', 1)"
          />
        </div>
        <div class="control-item">
          <span>열 수</span>
          <q-btn
            flat
            color="primary"
            icon="remove"
            :disable="numCols <= 10"
            @click="adjustGridSize('col', -1)"
          />
          <q-input v-model.number="numCols" type="number" min="2" readonly />
          <q-btn
            flat
            color="primary"
            icon="add"
            @click="adjustGridSize('col', 1)"
          />
        </div>
      </div>
      <q-btn
        label="그리드 크기 재설정"
        color="primary"
        class="reset-button"
        @click="resetGrid"
      />
      <q-toggle
        v-model="showImagePreview"
        label="이미지 미리보기"
        color="primary"
        class="toggle-preview"
      />
      <q-select
        v-model="difficulty"
        :options="difficultyOptions"
        label="난이도"
        class="difficulty-select"
      />
      <q-select
        v-model="category"
        :options="categoryOptions"
        label="카테고리"
        class="category-select"
      />
    </div>

    <div class="upload-section">
      <input type="file" accept="image/*" @change="handleImageUpload" />
    </div>

    <div v-if="showImagePreview && imageSrc" class="image-preview">
      <img :src="imageSrc" alt="Uploaded Image" />
    </div>

    <div class="grid-wrapper">
      <div v-if="cells.length > 0" class="puzzle-grid" :style="gridStyle">
        <div
          v-for="(cell, index) in cells"
          :key="index"
          class="cell"
          :style="{ backgroundColor: cell.color }"
          @click="toggleCell(index)"
        />
      </div>
    </div>

    <q-btn
      fab
      icon="save"
      color="primary"
      class="save-button"
      @click="savePuzzle"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 타입 정의
interface Cell {
  color: string
  filled: boolean
}

interface PuzzleData {
  name: string
  difficulty: string
  category: string
  rows: number
  cols: number
  cells: Array<{
    color: string
    filled: boolean
  }>
}

type GridAdjustmentType = 'row' | 'col'

// Ref 변수 초기화
const numRows = ref<number>(10)
const numCols = ref<number>(10)
const cells = ref<Cell[]>([])
const imageSrc = ref<string | null>(null)
const showImagePreview = ref<boolean>(false)
const puzzleName = ref<string>('')
const difficulty = ref<string>('')
const category = ref<string>('')

// 선택 옵션들 초기화
const difficultyOptions = [
  { label: '쉬움', value: 'easy' },
  { label: '중간', value: 'medium' },
  { label: '어려움', value: 'hard' }
]

const categoryOptions = [
  { label: '일반', value: 'general' },
  { label: '게임', value: 'games' },
  { label: '퍼즐', value: 'puzzles' }
]

const baseCellSize = 30

// 반응형 그리드 스타일 설정
const gridStyle = computed(() => {
  if (typeof window === 'undefined') {
    return {}
  }

  const containerWidth = window.innerWidth * 0.9
  const containerHeight = window.innerHeight * 0.6
  const maxCellSize = Math.min(
    containerWidth / numCols.value,
    containerHeight / numRows.value
  )

  return {
    gridTemplateColumns: `repeat(${numCols.value}, ${maxCellSize}px)`,
    gridTemplateRows: `repeat(${numRows.value}, ${maxCellSize}px)`,
    width: `${maxCellSize * numCols.value}px`,
    height: `${maxCellSize * numRows.value}px`,
    overflow: 'auto' // 그리드 스크롤 허용
  }
})

// 그리드 크기 조정 함수
const adjustGridSize = (type: GridAdjustmentType, adjustment: number) => {
  if (type === 'row') {
    numRows.value = Math.max(10, numRows.value + adjustment)
  } else {
    numCols.value = Math.max(10, numCols.value + adjustment)
  }
  resetGrid()
}

// 셀 상태 전환 함수
const toggleCell = (index: number) => {
  cells.value[index].filled = !cells.value[index].filled
}

// 퍼즐 저장 함수
const savePuzzle = () => {
  if (!puzzleName.value.trim()) {
    alert('퍼즐명을 입력하세요')
    return
  }

  const puzzleData: PuzzleData = {
    name: puzzleName.value,
    difficulty: difficulty.value,
    category: category.value,
    rows: numRows.value,
    cols: numCols.value,
    cells: cells.value.map((cell) => ({
      color: cell.color,
      filled: cell.filled
    }))
  }
  console.log('퍼즐 저장:', JSON.stringify(puzzleData))
}

// 이미지로 그리드 초기화 함수
const resetGrid = () => {
  if (numRows.value < 10 || numCols.value < 10) {
    return
  }

  cells.value = Array(numRows.value * numCols.value).fill({
    color: '#fff',
    filled: false
  })

  if (imageSrc.value) {
    scaleImageToGrid()
  }
}

// 이미지를 그리드에 맞게 스케일링하는 함수
const scaleImageToGrid = () => {
  const img = new Image()
  img.src = imageSrc.value as string
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const { width: imgWidth, height: imgHeight } = img
    const gridWidth = numCols.value * baseCellSize
    const gridHeight = numRows.value * baseCellSize
    const scale = Math.min(gridWidth / imgWidth, gridHeight / imgHeight)

    canvas.width = imgWidth * scale
    canvas.height = imgHeight * scale
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { data } = imageData
    const scaledCellSize = canvas.width / numCols.value

    for (let row = 0; row < numRows.value; row++) {
      for (let col = 0; col < numCols.value; col++) {
        const cellIndex = row * numCols.value + col
        cells.value[cellIndex] = calculateAverageColor(
          ctx,
          data,
          col,
          row,
          scaledCellSize,
          canvas.width
        )
      }
    }
  }
}

// 특정 셀의 평균 색상을 계산하는 함수
const calculateAverageColor = (
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  col: number,
  row: number,
  cellSize: number,
  canvasWidth: number
): Cell => {
  const startX = col * cellSize
  const startY = row * cellSize
  const endX = startX + cellSize
  const endY = startY + cellSize
  let rTotal = 0,
    gTotal = 0,
    bTotal = 0,
    count = 0

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (Math.floor(y) * canvasWidth + Math.floor(x)) * 4
      const [r, g, b, a] = data.slice(index, index + 4)

      if (a > 128) {
        rTotal += r
        gTotal += g
        bTotal += b
        count++
      }
    }
  }

  if (count > 0) {
    const r = Math.round(rTotal / count)
    const g = Math.round(gTotal / count)
    const b = Math.round(bTotal / count)
    return { color: `rgb(${r}, ${g}, ${b})`, filled: false }
  } else {
    return { color: '#fff', filled: false }
  }
}

// 윈도우 리사이즈 이벤트 처리
const adjustGridOnResize = () => {
  resetGrid()
}

onMounted(() => {
  window.addEventListener('resize', adjustGridOnResize)
  resetGrid()
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustGridOnResize)
})

// 이미지 업로드 처리 함수
const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSrc.value = e.target?.result as string
      resetGrid()
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.puzzle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.header {
  margin-bottom: 10px;
}

.controls {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.control-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 10px;
}

.control-item {
  display: flex;
  align-items: center;
}

.upload-section {
  margin-bottom: 10px;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  margin-bottom: 10px;
}

.grid-wrapper {
  width: 100%;
  max-height: 60vh;
  overflow: auto;
}

.puzzle-grid {
  display: grid;
  gap: 1px;
  background-color: #ccc;
}

.cell {
  width: 100%;
  height: 100%;
}

.save-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
