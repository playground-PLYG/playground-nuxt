<template>
  <!-- 메인 영역 start -->
  <div>
    <div class="mobile-content-area">
      <div class="text-h6 q-mb-sm">투표제목</div>
      <dk-input v-model="text" label="제목" clearable :max-length="20" />

      <!-- 시작시간 종료시간 옵션 줘야함 -->
      <div class="text-h6">시작시간</div>
      <dk-date-time-picker
        :datetime="param.val"
        :date="param.date"
        :time="param.time"
        @send-date="setStartDateTimeValue"
      />
      <div class="text-h6 q-mt-md">종료시간</div>
      <dk-date-time-picker
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

    <!-- 식당 팝업 start -->
    <vote-rstrnt-list
      v-model="openYn"
      @select-rstrnt="rstrntSelect"
      @show-rstrnt-detail="showRstrntDetail"
      @close-callback="dialogCloseCallback"
    />
    <!-- 식당 팝업 end -->

    <!-- 식당 상세 팝업 start -->
    <vote-rstrnt-detail
      ref="rstrntDetailComponent"
      v-model="openDetailYn"
      @close-callback="detailDialogCloseCallback"
    />
    <!-- 식당 상세 팝업 end -->
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
  openYn.value = true
}

//식당 팝업
const openYn = ref<boolean>(false)

const dialogCloseCallback = () => {
  openYn.value = false
}

const rstrntSelect = (data: object) => {
  openYn.value = false
  console.log(data)
}

const openDetailYn = ref<boolean>(false)

const rstrntDetailComponent = ref()
const showRstrntDetail = (data: number) => {
  openYn.value = false
  rstrntDetailComponent.value.fn_getRstrntDetail(data)
  openDetailYn.value = true
}
const detailDialogCloseCallback = () => {
  openDetailYn.value = false
  openYn.value = true
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
</style>
