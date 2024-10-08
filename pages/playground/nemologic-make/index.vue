<template>
  <div class="puzzle-container">
    <div class="header">
      <span class="text-h5">네모로직 퍼즐 생성</span>
    </div>

    <div class="controls">
      <div class="control-row">
        <div class="control-item">
          <span>퍼즐명</span>
          <q-input v-model="puzzleName" maxlength="50" />
        </div>
        <div class="control-item" @wheel.prevent="handleWheel($event, 'row')">
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
        <div class="control-item" @wheel.prevent="handleWheel($event, 'col')">
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
        <div class="control-item">
          <span>난이도</span>
          <q-select
            v-model="difficulty"
            :options="difficultyOptions"
            label="난이도"
            class="difficulty-select"
          />
        </div>
        <div class="control-item">
          <span>카테고리</span>
          <q-select
            v-model="category"
            :options="categoryOptions"
            label="카테고리"
            class="category-select"
          />
        </div>
      </div>
      <q-toggle
        v-model="showImagePreview"
        label="이미지 미리보기"
        color="primary"
        class="toggle-preview"
      />
    </div>

    <div class="content-wrapper">
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

interface SelectOption {
  label: string
  value: string
}

type GridAdjustmentType = 'row' | 'col'

// Ref 변수 초기화
const numRows = ref<number>(10)
const numCols = ref<number>(10)
const cells = ref<Cell[]>([])
const imageSrc = ref<string | null>(null)
const showImagePreview = ref<boolean>(false)
const puzzleName = ref<string>('')
const difficulty = ref<SelectOption>({
  label: '',
  value: ''
})
const category = ref<SelectOption>({ label: '', value: '' })

// 선택 옵션들 초기화
const difficultyOptions = ref<SelectOption[]>([
  { label: '쉬움', value: 'easy' },
  { label: '중간', value: 'medium' },
  { label: '어려움', value: 'hard' }
])

const categoryOptions = ref<SelectOption[]>([
  { label: '일반', value: 'general' },
  { label: '게임', value: 'games' },
  { label: '퍼즐', value: 'puzzles' }
])

const baseCellSize = 30

// 반응형 그리드 스타일 설정
const gridStyle = computed(() => {
  if (typeof window === 'undefined') {
    return {}
  }

  const containerWidth = window.innerWidth * 0.9
  const containerHeight = window.innerHeight * 0.6

  const finalCellSize = Math.min(
    containerWidth / numCols.value,
    containerHeight / numRows.value
  )

  return {
    gridTemplateColumns: `repeat(${numCols.value}, ${finalCellSize - 1}px)`,
    gridTemplateRows: `repeat(${numRows.value}, ${finalCellSize - 1}px)`,
    width: `${finalCellSize * numCols.value}px`,
    height: `${finalCellSize * numRows.value}px`,
    maxWidth: '100%',
    maxHeight: '100%'
  }
})

// 마우스 휠 이벤트 핸들러
const handleWheel = (event: WheelEvent, type: GridAdjustmentType) => {
  const delta = Math.sign(event.deltaY)

  adjustGridSize(type, -delta)
}

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
    difficulty: difficulty.value.value,
    category: category.value.value,
    rows: numRows.value,
    cols: numCols.value,
    cells: cells.value.map((cell) => ({
      color: cell.color,
      filled: cell.filled
    }))
  }

  // TODO 퍼즐 저장
  console.debug('퍼즐 저장:', JSON.stringify(puzzleData))
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
  let rTotal = 0
  let gTotal = 0
  let bTotal = 0
  let count = 0

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

    return {
      color: `rgb(${r}, ${g}, ${b})`,
      filled: true
    }
  }

  return { color: '#fff', filled: false }
}

// 이미지 업로드 처리 함수
const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) {
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    imageSrc.value = e.target?.result as string

    resetGrid()
  }

  reader.readAsDataURL(file)
}

onMounted(() => {
  resetGrid()
})

onUnmounted(() => {
  cells.value = []
})
</script>

<style lang="scss" scoped>
$puzzle-padding: 10px;
$control-item-margin-bottom: 10px;
$save-button-margin: 20px;
$gap-size: 1px;
$background-color: #ccc;

.puzzle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $puzzle-padding;
  width: 100%;
  box-sizing: border-box;

  .header {
    margin-bottom: $control-item-margin-bottom;
    text-align: center;
  }

  .controls {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $control-item-margin-bottom;

    .control-row {
      display: flex;
      width: 100%;
      justify-content: space-between;
      margin-bottom: $control-item-margin-bottom;

      .control-item {
        display: flex;
        align-items: center;
        margin-bottom: $control-item-margin-bottom;

        .q-select {
          width: 150px;
          margin-left: 15px;
        }
      }
    }
  }

  .upload-section {
    margin-bottom: $control-item-margin-bottom;
    width: 100%;
    text-align: center;
  }

  .image-preview {
    max-width: 100%;
    margin-bottom: $control-item-margin-bottom;
    display: flex;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .grid-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: $save-button-margin;

    .puzzle-grid {
      display: grid;
      gap: $gap-size;
      background-color: $background-color;
      box-sizing: border-box; // 그리드가 부모 요소의 크기를 초과하지 않도록 조정
      max-width: 100%; // 그리드가 .grid-wrapper 영역을 벗어나지 않도록
      max-height: 100%; // 동일한 이유로 최대 높이도 설정

      .cell {
        width: 100%;
        height: 100%;
      }
    }
  }

  .save-button {
    position: fixed;
    bottom: $save-button-margin;
    right: $save-button-margin;
  }
}

@media (max-width: 600px) {
  .control-row {
    flex-direction: column;

    .control-item {
      margin-bottom: $control-item-margin-bottom;
    }
  }

  .save-button {
    bottom: 15px;
    right: 15px;
  }
}
</style>
