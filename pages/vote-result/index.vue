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
                <div
                  class="row q-mb-sm"
                  style="align-items: center; border: ridge; min-height: 30px"
                >
                  <!-- 투표 1등 일 경우 표시 -->
                  <div style="min-width: 10%">
                    <q-icon
                      v-if="index === 0"
                      size="25px"
                      name="check"
                      class="text-grey"
                    />
                  </div>
                  <div class="text-h8">
                    {{ iem.label }}
                    ({{ iem.cnt }}명)
                  </div>
                </div>
                <div v-if="qestn.detailYn" class="row" style="min-height: 30px">
                  · 박준원 · 이승훈 · 박성종 · 서유진
                </div>
              </div>
              <div class="row justify-center">
                <dk-btn
                  push
                  color="white"
                  text-color="primary"
                  :label="qestn.detailLabel"
                  @click="fn_detailView(qestn)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
  <!-- 메인 영역 end -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

//질문갯수
interface qestnData {
  data: string
  detailYn: boolean
  detailLabel: string
}

const qestn = ref<qestnData[]>([
  { data: '1', detailYn: false, detailLabel: '자세히보기' },
  { data: '2', detailYn: false, detailLabel: '자세히보기' }
])

//항목갯수
interface iemData {
  data: string
  label: string
  cnt: number
}

const iem = ref<iemData[]>([
  { data: '1', label: '항목1번', cnt: 3 },
  { data: '2', label: '항목2번', cnt: 1 }
])

const fn_detailView = (data: qestnData) => {
  data.detailLabel == '자세히보기'
    ? (data.detailLabel = '간단히보기')
    : (data.detailLabel = '자세히보기')
  data.detailYn
  data.detailYn ? (data.detailYn = false) : (data.detailYn = true)
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
