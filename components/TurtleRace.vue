<template>
  <q-dialog v-model="localShowDialog">
    <q-card>
      <q-card-section class="text-center">
        <h5>달려라 병아리 레이스!</h5>
        <!-- 병아리..거북이... -->
      </q-card-section>
      <div class="turtle-race-section">
        <div class="race-track" :class="{ 'race-track-move': endLineMove }">
          <div class="start-line" :class="{ 'start-line-move': startLineMove }">
            <div class="start-text">START</div>
          </div>
          <div class="end-line" :class="{ 'end-line-move': endLineMove }">
            <div class="end-text">FINISH</div>
          </div>
          <div
            v-for="line in 2"
            :key="line"
            class="lane-line"
            :class="{ 'lane-line-move': endLineMove }"
            :style="{ top: `${line * 33.33}%` }"
          />
          <div
            v-for="(turtle, index) in turtles"
            :key="index"
            class="turtle"
            :style="{
              left: turtle.left,
              bottom: `${turtle.position}px`,
              transition: turtle.transition ? 'left 0.5s linear' : 'none'
            }"
          >
            🐤
          </div>
        </div>
      </div>
      <q-card-actions align="center">
        <q-btn label="Close" color="primary" flat @click="closeDialog" />
        <q-btn color="primary" flat @click="startRace">Start Race</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Turtle {
  left: string
  position: number
  speed: number
  transition?: boolean
  state: 'goingLeft' | 'goingBackRight' | 'goingForwardRight' | 'goingFinish'
}

const props = defineProps<{
  showDialog: boolean
}>()

const emit = defineEmits(['update:showDialog'])

const localShowDialog = ref(props.showDialog)
const startLineMove = ref(false)
const endLineMove = ref(false)
const turtles = ref<Turtle[]>([
  {
    left: '85%',
    position: 30,
    speed: 0.4,
    state: 'goingLeft',
    transition: true
  },
  {
    left: '85%',
    position: 130,
    speed: 0.65,
    state: 'goingLeft',
    transition: true
  },
  {
    left: '85%',
    position: 230,
    speed: 0.2,
    state: 'goingLeft',
    transition: true
  }
])

const startRace = () => {
  startLineMove.value = true
  endLineMove.value = true

  const finishLine = 10
  const backLine = 70
  let raceEnded = false

  const race = () => {
    turtles.value.forEach((turtle) => {
      if (raceEnded && turtle.state !== 'goingFinish') {
        return // 레이스가 끝났으면 병아리 움직이지 않음
      }

      let newLeft = Number.parseFloat(turtle.left)

      if (turtle.state === 'goingLeft') {
        newLeft -= turtle.speed
        if (newLeft <= finishLine) {
          turtle.state = 'goingBackRight'
          newLeft = finishLine
        }
      } else if (turtle.state === 'goingBackRight') {
        newLeft += turtle.speed
        if (newLeft >= backLine) {
          turtle.state = 'goingForwardRight'
          newLeft = backLine
        }
      } else if (turtle.state === 'goingForwardRight') {
        newLeft -= turtle.speed
        if (newLeft <= finishLine) {
          turtle.state = 'goingFinish'
          newLeft = finishLine
          if (!raceEnded) {
            raceEnded = true
          }
        }
      }

      turtle.left = `${newLeft}%`
    })

    // 모든 병아리가 finishLine을 넘지 않았고 레이스가 끝나지 않았을 경우
    if (turtles.value.some((turtle) => turtle.state !== 'goingFinish')) {
      requestAnimationFrame(race)
    }
  }

  requestAnimationFrame(race)
}

const closeDialog = () => {
  localShowDialog.value = false
  emit('update:showDialog', false)
}

watch(
  () => props.showDialog,
  (newVal) => {
    localShowDialog.value = newVal
    if (newVal) {
      startRace()
    }
  }
)

watch(localShowDialog, (newVal) => {
  emit('update:showDialog', newVal)
})
</script>

<style scoped>
.turtle-race-section {
  width: 300px;
  display: flex;
  justify-content: center;
  margin: 0 20px;
  position: relative;
  overflow: hidden;
  /* 배경이미지....찾아야함 */
  background-image: url('https://media.istockphoto.com/id/1397509122/ko/%EB%B2%A1%ED%84%B0/%EC%B6%95%EA%B5%AC%EC%9E%A5%EC%97%90-%ED%91%B8%EB%A5%B8-%EC%9E%94%EB%94%94%EC%9D%98-%EC%A7%88%EA%B0%90.jpg?s=612x612&w=0&k=20&c=oEN5AFId3ieINqNhm2Wia1lRwJdb2-t9elSajQqxAzU=');
  background-size: cover;
  background-position: center;
}

.race-track {
  position: relative;
  width: 300%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.race-track::before {
  content: '';
  position: absolute;
  top: 0;
  left: -300px; /* 처음에 왼쪽 끝에 위치 */
  width: 13.5%; /* end-line 위치까지 */
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0.6) 10px,
    transparent 10px,
    transparent 20px
  );
  transition: left 4s linear 1s; /* end-line과 동일한 타이밍으로 이동 */
}

.race-track-move::before {
  left: 0; /* end-line의 원래 위치 */
}

.turtle {
  position: absolute;
  font-size: 1.8rem;
}

.start-line {
  position: absolute;
  left: 86%;
  width: 2px;
  height: 100%;
  background-color: rgb(255, 255, 255);
  top: 0;
  transform: translateX(0%);
  transition: left 1s linear; /* 1초 동안 이동 */
}

.start-line-move {
  left: 100%; /* 오른쪽 끝으로 이동 */
}

.start-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: rgb(255, 255, 255);
  letter-spacing: 1rem;
  left: 15px;
  transform: rotate(-90deg);
  text-shadow: -2px 0px #000, 0px 2px #000, 2px 0px #000, 0px -2px #000;
}

.end-line {
  position: absolute;
  left: -300px; /* 처음에 왼쪽 끝에 위치 */
  width: 2px;
  height: 100%;
  background-color: rgb(255, 255, 255);
  top: 0;
  transform: translateX(0%);
  transition: left 4s linear 1s; /* 4초 동안 이동, 1초 후에 시작 */
}

.end-line-move {
  left: 13.5%; /* end-line의 원래 위치 */
}

.end-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: rgb(255, 255, 255);
  transform: rotate(-90deg);
  left: -20px;
  top: -15px;
  letter-spacing: 1rem;
  text-shadow: -2px 0px #000, 0px 2px #000, 2px 0px #000, 0px -2px #000;
}

.lane-line {
  position: absolute;
  width: 300%;
  border-top: 2px dashed #fff;
  transition: left 4s linear; /* end-line과 같은 타이밍으로 이동 */
  left: -200px; /* 처음에 왼쪽 끝에 위치 */
}

.lane-line-move {
  left: 0; /* end-line의 원래 위치 */
}

.lane-line:nth-child(3) {
  top: 33.33%;
}

.lane-line:nth-child(4) {
  top: 66.66%;
}
</style>
