<template>
  <q-dialog v-model="localShowDialog">
    <q-card class="roulette-card">
      <q-card-section class="text-center">
        <h5>룰렛 이벤트</h5>
      </q-card-section>
      <q-card-section class="roulette-section">
        <canvas id="rouletteCanvas" />
        <div class="pointer" />
      </q-card-section>
      <q-card-actions align="center">
        <q-btn label="Close" color="primary" flat @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  showDialog: boolean
  pointPayments: Array<{ pointPaymentUnitValue: number | null }> // 포인트 지급 정보
  winningPoint: number | null // 당첨포인트
}>()

//당첨 포인트값
const pointPaymentUnitValue = ref<number[]>(
  props.pointPayments
    .map((x) => x.pointPaymentUnitValue)
    .filter((x): x is number => x !== null)
)

const emit = defineEmits(['update:showDialog', 'rouletteCompleted']) // 룰렛화면표시 , 룰렛회전완료

const localShowDialog = ref(props.showDialog)
const isSpinning = ref(false) // 룰렛 회전중 여부
const rotation = ref(0) // 회전 각도
const spinDuration = 5000 // 회전 걸리는 시간
const spinStartTime = ref(0)

const spinRoulette = () => {
  if (isSpinning.value) {
    return
  }

  isSpinning.value = true
  spinStartTime.value = Date.now()
  const initialRotation = rotation.value // 현재 회전 각도

  const apiWinningPoint = props.winningPoint ?? 0
  const numSections = pointPaymentUnitValue.value.length
  let winningIndex =
    props.pointPayments.findIndex(
      (p) => p.pointPaymentUnitValue === apiWinningPoint
    ) + 1 // pointPayments index

  if (numSections >= 7) {
    winningIndex += 1 // 7개이상일때 winning section에 pointer 각도 조절..
  }

  const arc = (Math.PI * 2) / numSections // 한 섹션 각도
  const winningAngle = -winningIndex * arc - arc / 2 // 당첨포인트 각도
  const rotationOffset = Math.PI * 2 * 15 // 룰렛 회전 수
  const targetRotation = initialRotation + rotationOffset + winningAngle // 룰렛 회전 후 pointer 가리킬 각도

  // console.log('initialRotation :', initialRotation)
  // console.log('winningIndex :', winningIndex)
  // console.log('winningAngle :', winningAngle)
  // console.log('targetRotation :', targetRotation)
  // console.log('arc :', arc)

  const animateSpin = () => {
    const elapsed = Date.now() - spinStartTime.value
    const progress = Math.min(elapsed / spinDuration, 1)
    const easingProgress = easeInOutQuad(progress)
    rotation.value =
      initialRotation + (targetRotation - initialRotation) * easingProgress

    drawRouletteWheel()

    if (progress < 1) {
      requestAnimationFrame(animateSpin)
    } else {
      rotation.value = targetRotation
      drawRouletteWheel()
      isSpinning.value = false
      emit('rouletteCompleted', props.winningPoint ?? 0)
    }
  }

  animateSpin()
}

const easeInOutQuad = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const closeDialog = () => {
  localShowDialog.value = false
}

watch(
  () => props.pointPayments,
  (newVal) => {
    pointPaymentUnitValue.value = newVal
      .map((x) => x.pointPaymentUnitValue)
      .filter((x): x is number => x !== null)
    if (!pointPaymentUnitValue.value.includes(0)) {
      pointPaymentUnitValue.value.push(0)
    }
    if (localShowDialog.value) {
      nextTick(() => drawRouletteWheel())
    }
  },
  { immediate: true }
)

watch(
  () => props.showDialog,
  (newVal) => {
    localShowDialog.value = newVal
    if (newVal) {
      nextTick(() => {
        drawRouletteWheel()
        spinRoulette()
      })
    }
  }
)

const drawRouletteWheel = () => {
  const canvas = document.getElementById('rouletteCanvas') as HTMLCanvasElement
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const pixelRatio = window.devicePixelRatio || 1
  const width = 300
  const height = 300

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.scale(pixelRatio, pixelRatio)

  const centerX = width / 2
  const centerY = height / 2
  const outsideRadius = centerX + 3
  const textRadius = outsideRadius - 40
  const insideRadius = 30

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const arc = (Math.PI * 2) / pointPaymentUnitValue.value.length

  pointPaymentUnitValue.value.forEach((value, i) => {
    const angle = rotation.value + i * arc
    ctx.fillStyle = getColor(i)

    ctx.beginPath()
    ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false)
    ctx.arc(centerX, centerY, insideRadius, angle + arc, angle, true)
    ctx.fill()

    ctx.save()
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.translate(
      centerX + Math.cos(angle + arc / 2) * textRadius,
      centerY + Math.sin(angle + arc / 2) * textRadius
    )
    ctx.rotate(angle + arc / 2 + Math.PI / 2)
    const textValue = value !== null ? `${value}` : '0'
    const textPoint = '포인트'
    ctx.fillText(textValue, -ctx.measureText(textValue).width / 2, -10)
    ctx.fillText(textPoint, -ctx.measureText(textPoint).width / 2, 10)
    ctx.restore()
  })
}

const getColor = (item: number) => {
  const colors = [
    '#5cd3fb',
    '#33CCFF',
    '#2699E6',
    '#1A66CC',
    '#0252bc',
    '#0D33B3',
    '#0505da',
    '#000099'
  ]
  return colors[item % colors.length]
}

onMounted(() => {
  if (localShowDialog.value) {
    nextTick(() => drawRouletteWheel())
  }
})
</script>

<style scoped>
.roulette-card {
  width: 350px;
  margin: 0 auto;
}

.roulette-section {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  position: relative;
}

canvas {
  border-radius: 50%;
  border: 5px solid #000000;
}

.pointer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 20px solid black;
  z-index: 10;
}
</style>
