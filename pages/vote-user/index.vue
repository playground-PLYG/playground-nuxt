<template>
  <!-- 메인 영역 start -->
  <div>
    <div class="mobile-content-area">
      <div class="text-h6 q-mb-sm q-pa-sm">
        2024 제 1회 점심 투표
        <div class="row" style="font-size: medium">
          <div class="q-ml-sm q-mr-sm">-</div>
          <div>2024.01.01 10:00</div>
          <div class="q-ml-sm q-mr-sm">~</div>
          <div>2024.01.04 22:00</div>
        </div>
      </div>
      <div>
        <div v-for="(qestn, index) in qestn" :key="index">
          <q-card class="q-mb-sm" flat bordered>
            <q-card-section>
              <q-badge color="negative" align="middle" class="q-mr-sm"
                >익명투표</q-badge
              >
              <q-badge color="secondary" align="middle">복수선택</q-badge>
              <div class="text-h6 q-mt-sm q-mb-sm">질문 제목</div>

              <div v-for="(iem, index) in iem" :key="index">
                <div class="row" style="align-items: center">
                  <!-- 복수 선택일 경우 -->
                  <dk-check
                    v-model="checkIem"
                    :val="iem.data"
                    indeterminate-value="null"
                  >
                    <template #default>
                      {{ iem.label }}
                    </template>
                  </dk-check>
                  <q-icon
                    size="20px"
                    name="search"
                    class="q-ml-auto"
                    @click="fn_openRstrnt"
                  />
                </div>
              </div>
              <div v-for="(iem, index) in iem" :key="index">
                <div class="row" style="align-items: center">
                  <!-- 복수 선택이 아닐 경우 -->
                  <dk-radio v-model="selectIem" :val="iem.data">
                    <template #default>
                      {{ iem.label }}
                    </template>
                  </dk-radio>
                  <q-icon
                    size="20px"
                    name="search"
                    class="q-ml-auto"
                    @click="fn_openRstrnt"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row justify-start">
        <dk-btn
          push
          color="white"
          text-color="primary"
          label="투표하기"
          class="q-mt-sm"
        />
        <dk-btn
          push
          color="white"
          text-color="primary"
          label="결과"
          class="q-mt-sm q-ml-sm"
        />
        <dk-btn
          push
          color="white"
          text-color="primary"
          label="수정"
          class="q-mt-sm q-ml-auto"
        />
      </div>
    </div>
    <!-- 식당 팝업 start -->
    <vote-rstrnt-list
      v-model="openYn"
      @select-rstrnt="rstrntSelect"
      @close-callback="dialogCloseCallback"
    />
    <!-- 식당 팝업 end -->
  </div>
  <!-- 메인 영역 end -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

//질문갯수
interface qestnData {
  data: string
}

const qestn = ref<qestnData[]>([{ data: '1' }, { data: '2' }])

//항목갯수
interface iemData {
  data: string
  label: string
}

const iem = ref<iemData[]>([
  { data: '1', label: '항목1번' },
  { data: '2', label: '항목2번' }
])

const checkIem = ref([])

const selectIem = ref()

const fn_openRstrnt = () => {
  console.log('ASDF')
  openYn.value = true
}

const openYn = ref<boolean>(false)

const dialogCloseCallback = () => {
  openYn.value = false
}

const rstrntSelect = (data: object) => {
  openYn.value = false
  console.log(data)
}
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-content-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
</style>
