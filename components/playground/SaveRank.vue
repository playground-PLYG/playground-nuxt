<template>
  <q-dialog
    v-model="isVisible"
    persistent
    :maximized="isMobile"
    :full-width="isMobile"
    :class="['save-rank', isMobile ? 'mobile' : '']"
  >
    <q-card class="q-pa-md rounded-borders">
      <q-card-section
        class="q-mb-md text-h6 bg-primary text-white rounded-borders"
      >
        <div class="q-mb-md">랭킹 등록</div>
        <q-btn flat icon="close" class="close-btn" @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submitRanking">
          <q-input
            v-model="nickname"
            label="닉네임"
            required
            autofocus
            class="q-mb-md"
            outlined
            :rules="[
              (val) => (val && val.length > 0) || '닉네임을 입력해주세요'
            ]"
          />
          <q-btn
            label="등록"
            type="submit"
            color="primary"
            class="full-width"
            :loading="isSubmitting"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { ApiResponse } from 'interface/server'

const props = defineProps<PropsType>()
const emit = defineEmits(['update:isVisible', 'rankingSubmitted'])

interface PropsType {
  isVisible: boolean
  gameTyCode: string
  gameTime: number
  gameOneAtrbCn?: string
  gameTwoAtrbCn?: string
  gameThreeAtrbCn?: string
  gameFourAtrbCn?: string
  gameFiveAtrbCn?: string
}

const { platform } = useQuasar()

const isMobile = ref<boolean | undefined>(platform.is.mobile)

const nickname = ref('')
const isSubmitting = ref(false)
const isVisible = ref<boolean>(props.isVisible)

const closeDialog = () => {
  isVisible.value = false

  emit('update:isVisible', false)
}

const submitRanking = async () => {
  if (!nickname.value) {
    return
  }

  isSubmitting.value = true

  await $fetch<ApiResponse<void>>('/playground/public/game/addRank', {
    method: 'POST',
    body: JSON.stringify({
      gameTyCode: props.gameTyCode,
      ncmCn: nickname.value,
      gameTime: props.gameTime,
      gameOneAtrbCn: props.gameOneAtrbCn,
      gameTwoAtrbCn: props.gameTwoAtrbCn,
      gameThreeAtrbCn: props.gameThreeAtrbCn,
      gameFourAtrbCn: props.gameFourAtrbCn,
      gameFiveAtrbCn: props.gameFiveAtrbCn
    })
  })
    .then((_response) => {})
    .catch((error) => {
      alert(error.data.errorMessage)
    })

  isSubmitting.value = false

  emit('rankingSubmitted')
  closeDialog()
}

watch(
  () => props.isVisible,
  (_newValue) => {
    isVisible.value = props.isVisible
  }
)
</script>

<style lang="scss" scoped>
.rounded-borders {
  border-radius: 16px;
}

.bg-primary {
  background-color: #027be3;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.full-width {
  width: 100%;
}
</style>
