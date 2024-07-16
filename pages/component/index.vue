<template>
  <div class="content q-pa-md q-gutter-md">
    <div class="title">
      <div class="text-h5">컴포넌트 샘플</div>
    </div>

    <!-- input Start -->
    <q-separator inset />
    <div class="text-h6 bg-secondary">일반 인풋 박스</div>
    <dk-input
      v-model="inputText"
      type="text"
      label="일반 텍스트"
      maxlength="10"
      clearable
    />
    <div>{{ inputText }}</div>

    <div class="text-h6 bg-secondary">검색 인풋 박스</div>
    <dk-input
      v-model="inputText2"
      type="search"
      label="검색 테스트"
      maxlength="10"
      clearable
    >
      <template #append>
        <q-icon name="search" @click="fn_searchClick" />
      </template>
    </dk-input>
    <div>{{ inputText2 }}</div>

    <!-- input End -->

    <!-- 버튼 Start -->
    <div class="text-h6 bg-secondary">버튼</div>
    <dk-btn label="버튼" @click="fn_buttonClick" />
    <!-- 버튼 End -->

    <!-- 라디오 Start -->
    <div class="text-h6 bg-secondary">라디오</div>
    <dk-radio v-model="radio" name="radio" val="1" label="test1" />
    <dk-radio v-model="radio" name="radio" val="2" label="test2" />
    <dk-radio v-model="radio" name="radio" val="3" label="test3" />
    <div>{{ radio }}</div>
    <!-- 라디오 End -->

    <!-- 셀렉트박스 Start -->
    <div class="text-h6 bg-secondary">셀렉트</div>
    <dk-select v-model="select" :options="selectOption" label="셀렉트박스" />
    <div>{{ select }}</div>
    <!-- 셀렉트박스 End -->

    <!-- 체크박스 Start -->
    <div class="text-h6 bg-secondary">체크박스</div>
    <dk-check v-model="check" label="체크박스" />
    <div>{{ check }}</div>
    <!-- 체크박스 End -->

    <!-- 탭 Start -->
    <div class="text-h6 bg-secondary">탭</div>
    <dk-tabs v-model="tab">
      <dk-tab name="test1" label="test1" />
      <dk-tab name="test2" label="test2" />
      <dk-tab name="test3" label="test3" />
    </dk-tabs>

    <q-separator />

    <dk-tab-panels v-model="tab">
      <dk-tab-panel name="test1">
        <div class="text-h6">test1</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </dk-tab-panel>

      <dk-tab-panel name="test2">
        <div class="text-h6">test2</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </dk-tab-panel>

      <dk-tab-panel name="test3">
        <div class="text-h6">test3</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </dk-tab-panel>
    </dk-tab-panels>
    <!-- 탭 End -->

    <!-- dialog Start 헤더명이랑 닫기버튼 이벤트 콜백 -->
    <div class="text-h6 bg-secondary">다이어로그</div>
    <dk-btn label="dialog 호출" color="primary" @click="dialog = true" />
    <dk-dialog
      v-model="dialog"
      header-label="헤더라벨"
      @close-callback="dialogCloseCallback"
    >
      <template #body>
        <dk-input label="다이얼로그 테스트" />
        <dk-input label="다이얼로그 테스트2" />
        <dk-input label="다이얼로그 테스트3" />
        <dk-input label="다이얼로그 테스트4" />
        <dk-input label="다이얼로그 테스트5" />
        <!-- 
            <q-card>
          <q-card-section>
            <dk-input label="다이얼로그 테스트" />
            <dk-input label="다이얼로그 테스트2" />
          </q-card-section>
        </q-card>
         -->
      </template>

      <template #footer>
        <div>footer 영역입니다.</div>
        <!--
        <q-card>
          <div>footer 영역입니다.</div>
          <q-card-section>
            <dk-btn label="OK" />
          </q-card-section>
        </q-card>
        -->
      </template>
    </dk-dialog>
    <!-- dialog End -->

    <!-- Date Picker Start -->
    <div class="text-h6 bg-secondary">datePicker</div>
    <dk-date-picker :date="param.date" @send-date="setDateValue" />

    <div class="text-h6 bg-secondary">timePicker</div>
    <dk-time-picker :date="param.time" @send-date="setTimeValue" />

    <div class="text-h6 bg-secondary">datetimePicker</div>
    <dk-date-time-picker
      :datetime="param.dateTime"
      :date="param.date"
      :time="param.time"
      :date-options="dateOption"
      :time-options="timeOption"
      @send-date="setDateTimeValue"
    />

    <div class="text-h6 bg-secondary">dateFromToPicker</div>
    <dk-date-from-to-picker
      :from="param.dateFrom"
      :to="param.dateTo"
      @send-from-date="setDateFromValue"
      @send-to-date="setDateToValue"
    />

    <div class="text-h6 bg-secondary">dateTimeFromToPicker</div>
    <dk-date-time-from-to-picker
      :from="param.dateFrom"
      :to="param.dateTo"
      @send-from-date="setDateTimeFromValue"
      @send-to-date="setDateTimeToValue"
    />
  </div>
  <!-- Date Picker End -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Data {
  date: string
  time: string
  dateTime: string
  dateFrom: string
  dateTo: string
}

const param = ref<Data>({
  date: '',
  time: '',
  dateTime: '',
  dateFrom: '',
  dateTo: ''
})

//인풋박스
const inputText = ref<string>()
const inputText2 = ref<string>()
const fn_searchClick = () => {
  alert('돋보기 버튼 클릭')
}

//버튼
const fn_buttonClick = () => {
  alert('버튼 클릭')
}

//달력 옵션
const dateOption = ['2024/07/03']
/*
const dateOption2 = (val: string) => {
  return val >= '2023/11/03' && val <= '2024/07/31'
}
*/

const timeOption = (hr: number, min: number | null) => {
  if (hr > 6) {
    return false
  }

  if (min != null && min % 5 != 0) {
    return false
  }

  return true
}

//라디오버튼
const radio = ref()

//셀렉트박스
const select = ref()
const selectOption = ['test1', 'test2', 'test3']

//체크박스
const check = ref(false)

//탭
const tab = ref('test1')

//다이어로그
const dialog = ref(false)

const dialogCloseCallback = () => {
  alert('닫기버튼 클릭')
}

const setDateValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setTimeValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setDateTimeValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setDateFromValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setDateToValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setDateTimeFromValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}

const setDateTimeToValue = (val: string) => {
  console.debug('setDateValue :::: ', val)
}
</script>
