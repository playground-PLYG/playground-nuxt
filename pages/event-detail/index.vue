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
      <q-card-section class="q-gutter-md row items-start">
        <dk-date-time-from-to-picker
          :from="paramDate.dateFrom"
          :to="paramDate.dateTo"
          @send-from-date="setEventBeginDate"
          @send-to-date="setEventEndDate"
        />
      </q-card-section>
      <q-card-section>
        <div>
          썸네일 이미지
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
          <div v-if="eventStore.updateYn === 'N'">
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
            :rules="[event_rules]"
          />
          <q-input
            v-model="item.fixingPointValue"
            :readonly="isReadOnly"
            outlined
            type="number"
            label="고정포인트"
            class="q-mb-sm"
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
          @click="resultEvent"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { codeUtil } from '@/utils/code'
import type { ApiResponse, Code } from '@/interface/server'
import { useEventStore } from '@/stores/useEventStore'
import { imageUtil } from '~/utils/image'

const router = useRouter()
const eventStore = useEventStore()

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

const setEvent = async () => {
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
  evnetCode.value = await codeUtil.getCodeGroupList('EVENT_DIVISION_CODE')
  drwtCode.value = await codeUtil.getCodeGroupList('RAFFLE_METHOD_CODE')
  pymntCode.value = await codeUtil.getCodeGroupList('POINT_PAYMENT_METHOD_CODE')
}

const fn_fileUploaded = (fileId: number) => {
  param.value.eventThumbFileSn = fileId
}
const addEvent = async () => {
  param.value.eventBeginDate = param.value.eventBeginDate.replaceAll('T', ' ')
  param.value.eventEndDate = param.value.eventEndDate.replaceAll('T', ' ')
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
      await $fetch<ApiResponse<Point[]>>('/playground/api/event/modifyEvent', {
        method: 'POST',
        body: JSON.stringify(param.value)
      })
        .then(() => {
          eventStore.updateYn = 'N'
          router.push({ path: '/event' })
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}

const executeEventRaffle = async () => {
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
}

const modifyEndEvent = async () => {
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
}
const event_rules = (val: string) => {
  if (!val) {
    return '입력해주세요.'
  }
  return true
}

const outEvent = () => {
  router.push({ path: '/event' })
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

const resultEvent = () => {
  eventStore.eventSn = ''
  router.push({ path: '/event' })
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
.input-container {
  width: 100%;
}
</style>
