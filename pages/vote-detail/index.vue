<template>
  <!-- 메인 영역 start -->
  <div>
    <!-- 조회조건 영역 start -->
    <div class="mobile-content-area">
      <div class="text-h6 q-mb-sm">투표제목</div>
      <dk-input v-model="text" label="제목" clearable :max-length="20" />

      <!-- 시작시간 종료시간 옵션 줘야함 -->
      <div class="text-h6">시작시간</div>
      <date-time-picker
        :datetime="param.val"
        :date="param.date"
        :time="param.time"
        @send-date="setStartDateTimeValue"
      />
      <div class="text-h6 q-mt-md">종료시간</div>
      <date-time-picker
        :datetime="param.val"
        :date="param.date"
        :time="param.time"
        @send-date="setEndDateTimeValue"
      />

      <div v-for="(qestn, index) in qestn" :key="index">
        <q-separator spaced="12px" />
        <q-card class="my-card" flat bordered>
          <q-card-section>
            <dk-input v-model="text" label="질문" clearable :max-length="20" />
            <dk-select
              v-model="select"
              :options="selectOption"
              label="투표종류"
              class="q-mb-md"
            />
            <div v-for="(iem, index) in iem" :key="index">
              <dk-input v-model="text" label="항목" clearable :max-length="20">
                <template #append>
                  <q-icon name="search" @click="fn_openRstrnt" />
                </template>
                <template #after>
                  <dk-btn
                    push
                    color="white"
                    text-color="primary"
                    label="-"
                    @click="deleteIem(iem)"
                  />
                </template>
              </dk-input>
            </div>
            <dk-btn
              push
              color="white"
              text-color="primary"
              label="항목추가"
              class="q-mb-sm"
              @click="addIem"
            />

            <div class="row">
              <dk-check v-model="check" label="익명투표" class="col-6" />
              <dk-check v-model="check" label="복수응답" class="col-6" />
            </div>
            <div class="row justify-center">
              <dk-btn
                push
                color="white"
                text-color="primary"
                label="삭제"
                class="q-mt-sm"
                @click="deleteQestn"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <dk-btn
        push
        color="white"
        text-color="primary"
        label="질문추가"
        class="q-mt-md q-mb-sm"
        @click="addQestn"
      />
      <div>
        <dk-check v-model="check" label="미노출" />
      </div>
      <div class="row">
        <dk-check v-model="check" label="투표전송" class="col-4" />
        <dk-select
          v-model="select2"
          :options="selectOption2"
          label="전송방식"
          class="col-8"
        />
      </div>
      <div class="row justify-end">
        <dk-btn
          push
          color="white"
          text-color="primary"
          label="등록"
          class="q-mt-sm"
        />
      </div>
    </div>
    <!-- 조회조건 영역 end -->

    <!-- 식당 팝업 start -->
    <dk-dialog
      v-model="dialog"
      header-label="식당 선택"
      @close-callback="dialogCloseCallback"
    >
      <template #body>
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
        <div id="scroll-target-id" style="overflow: auto">
          <q-infinite-scroll scroll-target="#scroll-target-id" @load="onLoad">
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
      </template>
    </dk-dialog>
    <!-- 식당 팝업 end -->
  </div>
  <!-- 메인 영역 end -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

const text = ref<string>()

const param = ref<any>({
  val: ''
})

// 셀렉트 옵션
const select = ref()
const selectOption = [
  { label: '텍스트', value: '코드값1' },
  { label: '식당', value: '코드값2' },
  { label: '일자', value: '코드값3' }
]

const select2 = ref()
const selectOption2 = [
  { label: '즉시', value: '코드값1' },
  { label: '투표 1시간 전', value: '코드값2' },
  { label: '투표 시작 시', value: '코드값3' }
]

const select3 = ref()
const selectOption3 = [
  { label: '한식', value: '코드값1' },
  { label: '중식', value: '코드값2' },
  { label: '양식', value: '코드값3' },
  { label: '일식', value: '코드값4' }
]

//체크박스 옵션
//체크박스
const check = ref(false)

//질문갯수
interface qestnData {
  data: string
}

const qestn = ref<qestnData[]>([{ data: '1' }])

const addQestn = () => {
  qestn.value.push({ data: '99' })
}

const deleteQestn = () => {
  alert('질문삭제')
}

//항목갯수
interface iemData {
  data: string
}

const iem = ref<iemData[]>([{ data: '1' }, { data: '2' }])

//항목추가
const addIem = () => {
  iem.value.push({ data: '99' })
}

//항목삭제
const deleteIem = (val: iemData) => {
  if (iem.value.length > 1) {
    iem.value.forEach((item, index) => {
      if (item.data === val.data) {
        iem.value.splice(index, 1)
      }
    })
  }
}

//시작일시 데이터
const setStartDateTimeValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

//종료일시 데이터
const setEndDateTimeValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const fn_openRstrnt = () => {
  dialog.value = true
}

//식당 팝업
const dialog = ref(false)

const dialogCloseCallback = () => {
  dialog.value = false
}

const fn_searchRstrnt = () => {
  alert('식당 검색')
}

interface rstrntData {
  rstrntName: string
}

const rstrnt = ref<rstrntData[]>([
  { rstrntName: '가쯔야' },
  { rstrntName: '스시' },
  { rstrntName: '인천집' },
  { rstrntName: '향설주랑' },
  { rstrntName: '장군보쌈' },
  { rstrntName: '동원' }
])

const fn_rstrntDetail = () => {
  alert('상세보기')
}

const onLoad = (index: number, done: (stop?: boolean) => void) => {
  setTimeout(() => {
    rstrnt.value.push(
      { rstrntName: '순대국' },
      { rstrntName: '김밥천국' },
      { rstrntName: '알돈' },
      { rstrntName: '온센' },
      { rstrntName: '쭈담' },
      { rstrntName: '돈수백' }
    )

    done() //done(true) 주면 완전 멈춤
  }, 2000)
}
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-content-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;

  :deep(.dk-input) {
    margin-bottom: 15px;
  }
}

.rstrnt-card {
  max-height: 100px;
}

// 아래 부분 임시로 만든거임 각 기기별로 화면 나눠서 적정하게 짤라지도록 해야 infinite-scroll가능
#scroll-target-id {
  max-height: 510px;
}

@media all and (min-height: 768px) and (max-height: 1024px) {
  #scroll-target-id {
    max-height: 680px;
  }
}
@media all and (min-height: 1024) {
  #scroll-target-id {
    max-height: 840px;
  }
}
</style>
