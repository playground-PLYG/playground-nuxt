<template>
  <!-- 식당 팝업 start -->
  <div>
    <dk-dialog
      header-label="식당 선택"
      v-bind="$attrs"
      :footer-visible="false"
      @close-callback="dialogCloseCallback"
    >
      <template #body>
        <div class="dialog-body">
          <div class="row">
            <dk-select
              v-model="select3"
              :options="selectOption3"
              class="col-4 q-pr-sm"
              label="종류"
            />
            <dk-input
              v-model="text"
              label="식당"
              class="col-8"
              clearable
              :max-length="20"
            >
              <template #append>
                <q-icon name="search" @click="fn_searchRstrnt" />
              </template>
            </dk-input>
          </div>
          <q-separator spaced="12px" />

          <div id="scroll-target">
            <div id="scroll-target-id" style="overflow: auto">
              <q-infinite-scroll
                scroll-target="#scroll-target-id"
                @load="onLoad"
              >
                <div
                  v-for="(rstrnt, index) in rstrnt"
                  :key="index"
                  class="rstrnt-list"
                >
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section horizontal class="rstrnt-card">
                      <q-img
                        class="col"
                        src="https://cdn.quasar.dev/img/parallax1.jpg"
                        @click="fn_selectRstrnt(rstrnt)"
                      />
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="justify-flex-start">
                      <dk-btn
                        flat
                        round
                        color="blue"
                        icon="info"
                        @click="fn_rstrntDetail"
                      />
                      {{ rstrnt.rstrntName }}
                    </q-card-actions>
                  </q-card>
                </div>
                <template #loading>
                  <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                  </div>
                </template>
              </q-infinite-scroll>
            </div>
          </div>
        </div>
      </template>
    </dk-dialog>

    <!-- 식당 팝업 end -->

    <!-- 식당 상세 팝업 start -->

    <vote-rstrnt-detail
      v-model="rstrntDetailOpen"
      @close-callback="rstrntDetailCloseCallback"
    />

    <!-- 식당 상세 팝업 end -->
  </div>
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'
import { commUtil } from '~/utils/comm'

const text = ref<string>()

const emit = defineEmits(['close-callback', 'select-rstrnt'])

const dialogCloseCallback = () => {
  emit('close-callback')
}

const select3 = ref()
const selectOption3 = [
  { label: '한식', value: '코드값1' },
  { label: '중식', value: '코드값2' },
  { label: '양식', value: '코드값3' },
  { label: '일식', value: '코드값4' }
]

const fn_searchRstrnt = () => {
  rstrntDetailOpen.value = false
}

interface rstrntData {
  rstrntSsno: number
  rstrntName: string
}

const rstrnt = ref<rstrntData[]>([
  { rstrntSsno: 1, rstrntName: '가쯔야' },
  { rstrntSsno: 2, rstrntName: '스시' },
  { rstrntSsno: 3, rstrntName: '인천집' },
  { rstrntSsno: 4, rstrntName: '향설주랑' },
  { rstrntSsno: 5, rstrntName: '장군보쌈' },
  { rstrntSsno: 6, rstrntName: '동원' }
])

const onLoad = (index: number, done: (stop?: boolean) => void) => {
  setTimeout(() => {
    rstrnt.value.push(
      { rstrntSsno: 7, rstrntName: '순대국' },
      { rstrntSsno: 7, rstrntName: '김밥천국' },
      { rstrntSsno: 7, rstrntName: '알돈' },
      { rstrntSsno: 7, rstrntName: '온센' },
      { rstrntSsno: 7, rstrntName: '쭈담' },
      { rstrntSsno: 7, rstrntName: '돈수백' }
    )

    done() //done(true) 주면 완전 멈춤
  }, 2000)
}

const fn_rstrntDetail = () => {
  rstrntDetailOpen.value = true
}

const selectRstrnt = ref<rstrntData>()

const fn_selectRstrnt = (rstrnt: rstrntData) => {
  selectRstrnt.value = rstrnt
  commUtil.confirm({
    message: '해당 식당을 선택하시겠습니까?',
    callbackFn: fn_confirmCallback
  })
}

const fn_confirmCallback = (isConfirm: boolean) => {
  if (isConfirm) {
    emit('select-rstrnt', selectRstrnt.value)
  } else {
    return
  }
}

const rstrntDetailOpen = ref<boolean>(false)

const rstrntDetailCloseCallback = () => {
  rstrntDetailOpen.value = false
}
</script>

<!-- css -->
<style lang="scss" scoped>
.rstrnt-card {
  max-height: 100px;
}

.dialog-body {
  height: calc(100dvh - 80px);
}

#scroll-target {
  height: calc(100dvh - 150px);
}

#scroll-target-id {
  max-height: 100%;
}
</style>
