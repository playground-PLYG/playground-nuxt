<template>
  <q-dialog
    v-model="isVisible"
    persistent
    :maximized="isMobile"
    :full-width="isMobile"
    :class="['rank-list', isMobile ? 'mobile' : '']"
  >
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 text-center">Ranking</div>
      </q-card-section>

      <q-card-section class="rank-list-container">
        <div class="rank-list q-mx-auto">
          <q-list bordered padding>
            <q-item
              v-for="(rank, index) in rankingData"
              :key="rank.gameResultSn"
              clickable
              class="rank-item q-mb-md"
            >
              <q-item-section avatar>
                <q-avatar
                  size="md"
                  :color="getMedalColor(index)"
                  text-color="white"
                >
                  <q-icon v-if="index < 3" :name="getMedalIcon(index)" />
                  <span v-else>{{ index + 1 }}</span>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ rank.ncmCn }}</q-item-label>
                <q-item-label caption>{{
                  formatTime(rank.gameTime)
                }}</q-item-label>

                <!-- 게임 속성 1 -->
                <q-badge
                  v-if="fields.gameOneAtrbCn.show"
                  color="primary"
                  class="q-mr-sm q-mt-sm"
                >
                  {{ fields.gameOneAtrbCn.title || '항목 1' }}:
                  {{
                    fields.gameOneAtrbCn.formatFnc
                      ? fields.gameOneAtrbCn.formatFnc(rank.gameOneAtrbCn || '')
                      : rank.gameOneAtrbCn
                  }}
                </q-badge>

                <!-- 게임 속성 2 -->
                <q-badge
                  v-if="fields.gameTwoAtrbCn.show"
                  color="secondary"
                  class="q-mr-sm q-mt-sm"
                >
                  {{ fields.gameTwoAtrbCn.title || '항목 2' }}:
                  {{
                    fields.gameTwoAtrbCn.formatFnc
                      ? fields.gameTwoAtrbCn.formatFnc(rank.gameTwoAtrbCn || '')
                      : rank.gameTwoAtrbCn
                  }}
                </q-badge>

                <!-- 게임 속성 3 -->
                <q-badge
                  v-if="fields.gameThreeAtrbCn.show"
                  color="accent"
                  class="q-mr-sm q-mt-sm"
                >
                  {{ fields.gameThreeAtrbCn.title || '항목 3' }}:
                  {{
                    fields.gameThreeAtrbCn.formatFnc
                      ? fields.gameThreeAtrbCn.formatFnc(
                          rank.gameThreeAtrbCn || ''
                        )
                      : rank.gameThreeAtrbCn
                  }}
                </q-badge>

                <!-- 게임 속성 4 -->
                <q-badge
                  v-if="fields.gameFourAtrbCn.show"
                  color="positive"
                  class="q-mr-sm q-mt-sm"
                >
                  {{ fields.gameFourAtrbCn.title || '항목 4' }}:
                  {{
                    fields.gameFourAtrbCn.formatFnc
                      ? fields.gameFourAtrbCn.formatFnc(
                          rank.gameFourAtrbCn || ''
                        )
                      : rank.gameFourAtrbCn
                  }}
                </q-badge>

                <!-- 게임 속성 5 -->
                <q-badge
                  v-if="fields.gameFiveAtrbCn.show"
                  color="negative"
                  class="q-mr-sm q-mt-sm"
                >
                  {{ fields.gameFiveAtrbCn.title || '항목 5' }}:
                  {{
                    fields.gameFiveAtrbCn.formatFnc
                      ? fields.gameFiveAtrbCn.formatFnc(
                          rank.gameFiveAtrbCn || ''
                        )
                      : rank.gameFiveAtrbCn
                  }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-none">
        <q-btn
          label="닫기"
          color="primary"
          class="full-width-btn"
          @click="closePopup"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { ApiResponse } from 'interface/server'

interface PropsType {
  gameTyCode: string
  fields: {
    gameOneAtrbCn: {
      show: boolean
      title?: string
      formatFnc?: (txt: string) => string
    }
    gameTwoAtrbCn: {
      show: boolean
      title?: string
      formatFnc?: (txt: string) => string
    }
    gameThreeAtrbCn: {
      show: boolean
      title?: string
      formatFnc?: (txt: string) => string
    }
    gameFourAtrbCn: {
      show: boolean
      title?: string
      formatFnc?: (txt: string) => string
    }
    gameFiveAtrbCn: {
      show: boolean
      title?: string
      formatFnc?: (txt: string) => string
    }
  }
  isVisible: boolean
}

interface Rank {
  gameTyCode: string
  ncmCn: string
  gameTime: number
  gameOneAtrbCn?: string
  gameTwoAtrbCn?: string
  gameThreeAtrbCn?: string
  gameFourAtrbCn?: string
  gameFiveAtrbCn?: string
  gameResultSn: number
}

const { platform } = useQuasar()
const isMobile = ref<boolean | undefined>(platform.is.mobile)

const props = defineProps<PropsType>()
const emit = defineEmits(['update:isVisible'])

const rankingData = ref<Rank[]>([])
const loading = ref<boolean>(false)
const isVisible = ref<boolean>(props.isVisible)

const fetchRankingData = async () => {
  loading.value = true

  await $fetch<ApiResponse<Rank[]>>('/playground/public/game/getRankList', {
    method: 'POST',
    body: JSON.stringify({ gameTyCode: props.gameTyCode })
  })
    .then((response) => {
      rankingData.value = response.data
    })
    .catch((error) => {
      alert(error.data.errorMessage)
    })

  loading.value = false
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

const getMedalColor = (index: number) => {
  if (index === 0) {
    return 'yellow-8'
  }
  if (index === 1) {
    return 'grey-5'
  }
  if (index === 2) {
    return 'orange-9'
  }
  return 'grey-4'
}

const getMedalIcon = (index: number) => {
  if (index === 0) {
    return 'mdi-medal'
  }
  if (index === 1) {
    return 'mdi-medal-outline'
  }
  if (index === 2) {
    return 'mdi-medal-outline'
  }
  return ''
}

watch(() => props.gameTyCode, fetchRankingData, { immediate: true })

watch(
  () => props.isVisible,
  () => {
    isVisible.value = props.isVisible

    if (props.isVisible) {
      fetchRankingData()
    }
  },
  { immediate: true }
)

const closePopup = () => {
  isVisible.value = false
  emit('update:isVisible', false)
}

onMounted(fetchRankingData)
</script>

<style lang="scss" scoped>
.q-dialog__inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-card {
  width: 40vw; /* PC에서 팝업의 가로폭을 화면의 40%로 설정 */
  max-width: 1200px; /* 최대 가로폭을 1200px로 설정 */
  min-width: 300px; /* 최소 가로폭을 설정하여 너무 좁아지지 않도록 */
}

.rank-list-container {
  max-height: calc(
    100vh - 150px
  ); /* 모바일에서 팝업의 최대 높이를 화면에서 150px 정도를 제외한 높이로 설정 */
  min-height: 300px; /* 모바일에서 너무 짧아지지 않도록 최소 높이 설정 */
}

.rank-list {
  max-height: 100%; /* rank-list가 rank-list-container의 최대 높이에 맞도록 설정 */
  overflow-y: auto; /* 내용이 넘치면 스크롤바가 생기도록 설정 */
}

.rank-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.q-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem; /* 아이콘의 폰트 크기 조정 */
  border: 2px solid; /* 테두리 추가 */
}

.q-avatar.gold {
  background: gold;
  border-color: gold;
}

.q-avatar.silver {
  background: silver;
  border-color: silver;
}

.q-avatar.bronze {
  background: #cd7f32;
  border-color: #cd7f32;
}

.q-item-label {
  font-weight: bold; /* 닉네임을 굵게 */
}

.q-item-label.caption {
  color: #666; /* 점수를 약간 회색으로 표시하여 강조 */
}

.full-width-btn {
  width: 100%;
}

@media (max-width: 600px) {
  .q-card {
    width: 90vw; /* 모바일에서 팝업의 가로폭을 화면의 90%로 설정 */
    max-width: none; /* 최대 가로폭 제한 해제 */
  }

  .rank-list-container {
    min-height: calc(
      100vh - 145px
    ); /* 모바일에서 닫기 버튼을 화면 아래에 고정하기 위해 계산된 최소 높이 설정 */
  }

  .rank-list {
    max-height: calc(
      100vh - 150px
    ); /* 모바일에서 목록의 최대 높이를 설정하여 닫기 버튼이 가려지지 않도록 조정 */
  }
}
</style>
