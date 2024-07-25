<template>
  <div class="q-pa-md">
    <div class="title">
      <div class="text-h4">이벤트 등록</div>
    </div>
    <q-card class="q-mt-md">
      <q-card-section>
        <q-input
          v-model="param.eventName"
          :readonly="isReadOnly"
          outlined
          type="text"
          label="이벤트명"
          :rules="[event_rules]"
        />
      </q-card-section>
      <q-card-section>
        <div
          v-if="eventStore.updateYn === 'Y'"
          class="q-gutter-md row items-start"
        >
          <q-input
            v-model="param.eventBeginDate"
            :readonly="isReadOnly"
            outlined
            min="1"
            type="text"
            label="이벤트 시작일시"
            class="input"
          />
          <q-input
            v-model="param.eventEndDate"
            :readonly="isReadOnly"
            outlined
            min="1"
            type="text"
            label="이벤트 종료일시"
            class="input"
          />
        </div>
        <div v-else>
          <dk-date-time-from-to-picker
            :from="paramDate.dateFrom"
            :to="paramDate.dateTo"
            @send-from-date="setEventBeginDate"
            @send-to-date="setEventEndDate"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <div>
          <div
            v-if="
              eventStore.updateYn === 'N' || param.eventThumbFileSn !== null
            "
          >
            썸네일 이미지
          </div>
          <div v-if="eventStore.updateYn === 'Y'">
            <q-img
              v-if="
                param.eventThumbFileSn !== null && param.eventThumbFileSn !== ''
              "
              :src="imageUtil.getImageUrl(param.eventThumbFileSn)"
              class="fit"
              :rato="1"
              :img-style="{ borderRadius: '2px' }"
              no-native-menu
            />
          </div>
          <div v-else-if="eventStore.updateYn === 'N'">
            <image-upload
              v-if="
                param.eventThumbFileSn === null || param.eventThumbFileSn === ''
              "
              @file-uploaded="fn_fileUploaded"
            />

            <image-upload
              v-if="
                param.eventThumbFileSn !== null && param.eventThumbFileSn !== ''
              "
              :file-id="param.eventThumbFileSn"
              @file-uploaded="fn_fileUploaded"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="search">
          <div class="q-gutter-md row items-start">
            <q-input
              v-model="param.przwnerCount"
              :readonly="isReadOnly"
              outlined
              min="1"
              type="number"
              label="당첨자 수"
              class="input"
              :rules="[event_rules]"
            />
            <q-select
              v-model="param.eventSectionCodeId"
              :readonly="isReadOnly"
              outlined
              :options="evnetCode"
              option-label="codeName"
              option-value="code"
              label="이벤트구분"
              round
              flat
              class="select"
              emit-value
              map-options
              :rules="[event_rules]"
            />
            <q-select
              v-model="param.drwtMethodCodeId"
              :readonly="param.eventSectionCodeId === 'ENTR' || isReadOnly"
              outlined
              :options="filteredDrwtCode"
              option-label="codeName"
              option-value="code"
              label="추첨방식"
              round
              flat
              class="select"
              emit-value
              map-options
              :rules="[event_rules]"
            />
            <q-select
              v-model="param.pointPymntMethodCodeId"
              :readonly="true"
              outlined
              :options="pymntCode"
              option-label="codeName"
              option-value="code"
              label="포인트 지급방식"
              round
              flat
              class="select"
              emit-value
              map-options
              :rules="[event_rules]"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section
        v-if="param.pointPymntMethodCodeId === 'RAND'"
        class="q-gutter-md row items-start"
      >
        <q-input
          v-model="param.totalPointValue"
          :readonly="isReadOnly"
          outlined
          type="number"
          label="총 포인트"
          class="q-mb-sm"
          min="1"
          :rules="[event_rules]"
        />
        <q-card-section class="test">
          <div
            v-for="(item, index) in pointPayment"
            :key="index"
            class="q-gutter-md row items-start"
          >
            <q-input
              v-model="item.pointPaymentUnitValue"
              :readonly="isReadOnly"
              outlined
              type="number"
              label="포인트 지급단위"
              class="q-mb-sm"
              min="0"
              :rules="[event_rules]"
            />
            <q-btn
              push
              color="white"
              text-color="primary"
              label="+"
              @click="addFixedPoint"
              :disabled="isReadOnly"
            />
            <q-btn
              v-if="index > 0"
              push
              color="white"
              text-color="primary"
              label="-"
              @click="removeFixedPoint(index)"
              :disabled="isReadOnly"
            />
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-section v-if="param.pointPymntMethodCodeId === 'FXTN'">
        <div
          v-for="(item, index) in pointPayment"
          :key="index"
          class="q-gutter-md row items-start"
        >
          <q-input
            v-model="item.fixingPointPayrCount"
            :readonly="isReadOnly"
            outlined
            type="number"
            label="고정포인트 지급자 수"
            class="q-mb-sm"
            min="1"
            :rules="[event_rules]"
          />
          <q-input
            v-model="item.fixingPointValue"
            :readonly="isReadOnly"
            outlined
            type="number"
            label="고정포인트"
            class="q-mb-sm"
            min="1"
            :rules="[event_rules]"
          />
          <q-btn
            push
            color="white"
            text-color="primary"
            label="+"
            @click="addFixedPoint"
            :disabled="isReadOnly"
          />
          <q-btn
            v-if="index > 0"
            push
            color="white"
            text-color="primary"
            label="-"
            @click="removeFixedPoint(index)"
            :disabled="isReadOnly"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="param.cntntsContents"
          :readonly="isReadOnly"
          outlined
          type="text"
          label="컨텐츠"
          :rules="[event_rules]"
        />
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="param.expsrAt"
          :readonly="isReadOnly"
          outlined
          :options="expsrOption"
          label="노출여부"
          round
          flat
          class="select"
          emit-value
          map-options
          :rules="[event_rules]"
        />
      </q-card-section>
      <div class="q-gutter-md row items-start left-align" v-if="isReadOnly">
        <q-btn
          v-if="eventStore.progrsSttus === 'PRE'"
          color="primary"
          label="수정"
          @click="updateEvent"
        />
        <q-btn
          v-if="
            param.eventSectionCodeId === 'ENTR' &&
            eventStore.progrsSttus === 'END' &&
            param.drwtDate === null
          "
          color="primary"
          label="추첨"
          @click="executeEventRaffle"
        />
        <q-btn
          v-if="param.eventSectionCodeId === 'ENTR' && param.drwtDate !== null"
          color="primary"
          label="결과보기"
          @click="setEventPopup"
        />
        <q-btn
          v-if="eventStore.progrsSttus === 'ING'"
          color="primary"
          label="종료"
          @click="modifyEndEvent"
        />
        <q-btn color="primary" label="취소" @click="updateOutEvent" />
      </div>
      <div class="q-gutter-md row items-start right-align" v-if="!isReadOnly">
        <q-btn
          color="primary"
          label="저장"
          @click="addEvent"
          :disabled="!isFormValid"
        />
        <q-btn color="primary" label="취소" @click="outEvent" />
      </div>
    </q-card>
    <div class="popup">
      <q-dialog v-model="showResultPop" @hide="resetResult">
        <q-card style="min-width: 700px; height: 700px">
          <q-layout>
            <q-header>
              <q-toolbar class="bg-primary">
                <q-toolbar-title>이벤트 결과보기</q-toolbar-title>
                <q-btn flat v-close-popup round dense icon="close" />
              </q-toolbar>
            </q-header>
            <q-page-container class="bg-white items-start">
              총 포인트 {{ param.totalPointValue }} / 지급 포인트
              {{ param.provisionPoint }}
              <div class="table-container">
                <div class="table-wrapper">
                  <q-table
                    flat
                    :rows="winData"
                    :columns="winColumns"
                    row-key="boardNm"
                    :rows-per-page-options="[0]"
                    hide-pagination
                  />
                  <q-table
                    flat
                    :rows="loseData"
                    :columns="loseColumns"
                    row-key="boardNm"
                    :rows-per-page-options="[0]"
                    hide-pagination
                  />
                </div>
              </div>
              <div class="q-gutter-md row items-start right-align">
                <q-btn
                  push
                  color="blue"
                  text-color="black"
                  label="엑셀 다운로드"
                  :href="`https://august-cascade-385602.uw.r.appspot.com/playground/public/event/getEventExcelList?eventSn=${eventStore.eventSn}`"
                  target="_blank"
                />
              </div>
            </q-page-container>
          </q-layout>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { type QTableProps, date, useQuasar } from 'quasar'
import { codeUtil } from '@/utils/code'
import type { ApiResponse, Code } from '@/interface/server'
import { useEventStore } from '@/stores/useEventStore'
import { imageUtil } from '~/utils/image'
import { commUtil } from '~/utils/comm'

const router = useRouter()
const eventStore = useEventStore()
const { loading } = useQuasar()

const evnetCode = ref<Code[]>([])
const drwtCode = ref<Code[]>([])
const pymntCode = ref<Code[]>([])
const expsrOption = [
  { label: '노출', value: 'Y' },
  { label: '미노출', value: 'N' }
]

interface Data {
  date: string
  time: string
  dateTime: string
  dateFrom: string
  dateTo: string
}

const winColumns = ref<QTableProps['columns']>([
  { name: 'winner', label: '당첨자 ', field: 'winner', align: 'center' }
])
const loseColumns = ref<QTableProps['columns']>([
  { name: 'loser', label: '미당첨자 ', field: 'loser', align: 'center' }
])
const winData = ref<any[]>([])
const loseData = ref<any[]>([])

const paramDate = ref<Data>({
  date: '',
  time: '',
  dateTime: '',
  dateFrom: '',
  dateTo: ''
})

const param = ref<any>({
  eventName: '', // 이벤트명
  eventBeginDate: '', // 시작일시
  eventEndDate: '', // 종료일시
  eventThumbFileSn: '', // 파일일련번호
  przwnerCount: '', // 당첨자수
  eventSectionCodeId: '', // 이벤트 구분
  drwtMethodCodeId: '', // 추첨방식
  pointPymntMethodCodeId: '', // 포인트지급방식
  totalPointValue: '', // 총 포인트값
  cntntsContents: '', // 컨텐츠
  expsrAt: '', // 노출여부
  drwtDate: '', // 추첨일시
  provisionPoint: '',
  pointPayment: []
})

interface Point {
  pointPaymentUnitValue: string
  fixingPointPayrCount: string
  fixingPointValue: string
}

const pointPayment = ref<any[]>([
  { pointPaymentUnitValue: '', fixingPointPayrCount: '', fixingPointValue: '' }
])

const isReadOnly = ref(false)

// 결과화면
const showResultPop = ref(false)

// notnull 체크
const isFormValid = computed(() => {
  if (
    !param.value.eventName ||
    !param.value.eventBeginDate ||
    !param.value.eventEndDate ||
    !param.value.przwnerCount ||
    !param.value.eventSectionCodeId ||
    !param.value.drwtMethodCodeId ||
    !param.value.pointPymntMethodCodeId ||
    !param.value.cntntsContents ||
    !param.value.expsrAt
  ) {
    return false
  }

  if (param.value.pointPymntMethodCodeId === 'FXTN') {
    return pointPayment.value.every(
      (item) => item.fixingPointPayrCount && item.fixingPointValue
    )
  }

  if (param.value.pointPymntMethodCodeId === 'RAND') {
    return pointPayment.value.every((item) => item.pointPaymentUnitValue)
  }

  return true
})

//포인트지급단위 항목 추가
const addFixedPoint = () => {
  pointPayment.value.push({
    pointPaymentUnitValue: '',
    fixingPointPayrCount: '',
    fixingPointValue: ''
  })
}

//포인트지급단위 항목 제거
const removeFixedPoint = (index: number) => {
  pointPayment.value.splice(index, 1)
}

onMounted(() => {
  isReadOnly.value = false
  getCodeList()
  setEvent()
})

const setEventPopup = async () => {
  loading.show()
  showResultPop.value = true
  const options = {
    eventSerial: eventStore.eventSn
  }
  await $fetch<ApiResponse<any>>('/playground/api/event/getEventResultList', {
    method: 'POST',
    body: JSON.stringify(options)
  })
    .then((result) => {
      const winnerData = result.data.winnerEvent
      const loserData = result.data.loserEvent
      param.value.totalPointValue = result.data.totalPointValue
      param.value.provisionPoint = result.data.provisionPointValue
      for (const idx in winnerData) {
        winData.value.push({
          winner:
            winnerData[idx].memberNm +
            ' / ' +
            winnerData[idx].memberId +
            ' / ' +
            winnerData[idx].przwinPointVal +
            ' / ' +
            winnerData[idx].memberTelno +
            ' / ' +
            date.formatDate(
              winnerData[idx].eventPartcptnDate,
              'YY-MM-DD HH:mm:ss'
            )
        })
      }
      for (const idx in loserData) {
        loseData.value.push({
          loser:
            loserData[idx].memberNm +
            ' / ' +
            loserData[idx].memberId +
            ' / ' +
            date.formatDate(
              loserData[idx].eventPartcptnDate,
              'YY-MM-DD HH:mm:ss'
            )
        })
      }
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const resetResult = () => {
  winData.value = []
  loseData.value = []
}
const setEvent = async () => {
  loading.show()
  if (eventStore.eventSn !== '') {
    isReadOnly.value = true
    const options = {
      eventSerial: eventStore.eventSn
    }
    await $fetch<ApiResponse<any>>('/playground/api/event/getEventDetail', {
      method: 'POST',
      body: JSON.stringify(options)
    })
      .then((result) => {
        const evData = result.data
        const pointList = evData.pointPayment as {
          pointPaymentUnitValue: string
          fixingPointPayrCount: string
          fixingPointValue: string
        }[]

        paramDate.value.dateFrom = evData.eventBeginDate.replaceAll('T', ' ')
        paramDate.value.dateTo = evData.eventEndDate.replaceAll('T', ' ')

        param.value.eventBeginDate = evData.eventBeginDate
        param.value.eventEndDate = evData.eventEndDate

        param.value.eventSerial = evData.eventSerial
        param.value.eventName = evData.eventName
        param.value.eventThumbFileSn = evData.eventThumbFileSn
        param.value.przwnerCount = evData.przwnerCount
        param.value.eventSectionCodeId = evData.eventSectionCodeId
        param.value.drwtMethodCodeId = evData.drwtMethodCodeId
        param.value.pointPymntMethodCodeId = evData.pointPymntMethodCodeId
        param.value.totalPointValue = evData.totalPointValue
        param.value.cntntsContents = evData.cntntsContents
        param.value.expsrAt = evData.expsrAt
        param.value.drwtDate = evData.drwtDate
        pointPayment.value = pointList.map((option) => ({
          pointPaymentUnitValue: option.pointPaymentUnitValue ?? '',
          fixingPointPayrCount: option.fixingPointPayrCount ?? '',
          fixingPointValue: option.fixingPointValue ?? ''
        }))
      })
      .catch((error) => {
        console.error(error)
      })
  }
  loading.hide()
}

//시작일시 데이터
const setEventBeginDate = (val: string) => {
  param.value.eventBeginDate = val.replaceAll('T', ' ')
}
//시작일시 데이터
const setEventEndDate = (val: string) => {
  param.value.eventEndDate = val.replaceAll('T', ' ')
}

const getCodeList = async (): Promise<void> => {
  loading.show()
  evnetCode.value = await codeUtil.getCodeGroupList('EVENT_DIVISION_CODE')
  drwtCode.value = await codeUtil.getCodeGroupList('RAFFLE_METHOD_CODE')
  pymntCode.value = await codeUtil.getCodeGroupList('POINT_PAYMENT_METHOD_CODE')
  loading.hide()
}

const fn_fileUploaded = (fileId: number) => {
  param.value.eventThumbFileSn = fileId
}
const addEvent = async () => {
  param.value.eventBeginDate = param.value.eventBeginDate.replaceAll(' ', 'T')
  param.value.eventEndDate = param.value.eventEndDate.replaceAll(' ', 'T')
  param.value.pointPayment = pointPayment.value

  let countSum = 0
  for (const item of pointPayment.value) {
    countSum += Number(item.fixingPointPayrCount)
  }
  if (param.value.przwnerCount !== countSum) {
    commUtil.alert({
      message: "'당첨자 수'와 '고정포인트 지급자 수'의 합이 같지 않습니다"
    })
    return
  }

  if (
    await commUtil.confirmSync({
      message: '저장하시겠습니까?'
    })
  ) {
    loading.show()
    param.value.eventBeginDate = param.value.eventBeginDate.replaceAll(' ', 'T')
    param.value.eventEndDate = param.value.eventEndDate.replaceAll(' ', 'T')
    param.value.pointPayment = pointPayment.value
    if (isFormValid.value) {
      if (eventStore.eventSn === '') {
        await $fetch<ApiResponse<Point[]>>('/playground/api/event/addEvent', {
          method: 'POST',
          body: JSON.stringify(param.value)
        })
          .then(() => {
            router.push({ path: '/event' })
          })
          .catch((error) => {
            console.error(error)
          })
      } else {
        param.value.eventSerial = eventStore.eventSn
        await $fetch<ApiResponse<Point[]>>(
          '/playground/api/event/modifyEvent',
          {
            method: 'POST',
            body: JSON.stringify(param.value)
          }
        )
          .then(() => {
            eventStore.eventSn = ''
            eventStore.updateYn = 'N'
            router.push({ path: '/event' })
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
    loading.hide()
  }
}

const executeEventRaffle = async () => {
  if (
    await commUtil.confirmSync({
      message: '추첨하시겠습니까?'
    })
  ) {
    loading.show()
    const req = {
      eventSerial: param.value.eventSerial
    }

    await $fetch<ApiResponse<Point[]>>(
      '/playground/api/event/executeEventRaffle',
      {
        method: 'POST',
        body: JSON.stringify(req)
      }
    )
      .then(() => {
        setEvent()
      })
      .catch((error) => {
        console.error(error)
      })
    loading.hide()
  }
}

const modifyEndEvent = async () => {
  if (
    await commUtil.confirmSync({
      message: '종료하시겠습니까?'
    })
  ) {
    loading.show()
    const req = {
      eventSerial: param.value.eventSerial
    }

    await $fetch<ApiResponse<Point[]>>('/playground/api/event/modifyEndEvent', {
      method: 'POST',
      body: JSON.stringify(req)
    })
      .then(() => {
        router.push({ path: '/event' })
      })
      .catch((error) => {
        console.error(error)
      })
    loading.hide()
  }
}

const event_rules = (val: string) => {
  if (!val) {
    return '입력해주세요.'
  }
  return true
}

const outEvent = async () => {
  if (eventStore.eventSn === '') {
    router.push({ path: '/event' })
  } else if (
    await commUtil.confirmSync({
      message: '취소하겠습니까?'
    })
  ) {
    isReadOnly.value = true
    eventStore.updateYn = 'Y'
  }
}

const updateOutEvent = () => {
  eventStore.eventSn = ''
  eventStore.updateYn = 'N'
  router.push({ path: '/event' })
}

const updateEvent = () => {
  isReadOnly.value = false
  eventStore.updateYn = 'N'
}

watch(
  () => param.value.eventSectionCodeId,
  (newVal) => {
    if (eventStore.updateYn === 'N') {
      if (newVal === 'ENTR') {
        param.value.drwtMethodCodeId = 'RFFL'
        param.value.pointPymntMethodCodeId = 'FXTN'
      } else if (newVal === 'JOIN') {
        param.value.drwtMethodCodeId = ''
        param.value.pointPymntMethodCodeId = ''
      }
    }
  }
)
watch(
  () => param.value.drwtMethodCodeId,
  (newVal) => {
    if (eventStore.updateYn === 'N') {
      if (newVal === 'RAND') {
        param.value.pointPymntMethodCodeId = 'RAND'
      } else if (newVal === 'FRSC') {
        param.value.pointPymntMethodCodeId = 'FXTN'
      }
    }
  }
)
watch(
  () => param.value.pointPymntMethodCodeId,
  () => {
    if (eventStore.updateYn === 'N') {
      pointPayment.value = [
        {
          pointPaymentUnitValue: '',
          fixingPointPayrCount: '',
          fixingPointValue: ''
        }
      ]
    }
  }
)
const filteredDrwtCode = computed(() => {
  if (param.value.eventSectionCodeId === 'JOIN') {
    return drwtCode.value.filter((code) => code.code !== 'RFFL')
  }
  return drwtCode.value
})
</script>

<style lang="scss" scoped>
.search {
  .input {
    display: inline-block;
    vertical-align: middle;
    width: 15%;
    padding-right: 0.5rem;
  }
  .select {
    display: inline-block;
    vertical-align: middle;
    width: 25%;
    padding-right: 0.5rem;
  }
}
.table-container {
  .table-wrapper {
    display: flex;
    gap: 20px;
  }
}

.right-align {
  display: flex;
  justify-content: flex-end;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  padding-bottom: 0.5rem;
}
.left-align {
  display: flex;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
