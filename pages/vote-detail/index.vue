<template>
  <!-- 메인 영역 start -->
  <div>
    <div class="mobile-content-area">
      <div class="text-h6 q-mb-sm">투표제목</div>
      <dk-input
        v-model="voteData.voteSubject"
        label="제목"
        clearable
        :max-length="20"
      />

      <div class="text-h6">시작시간</div>
      <dk-date-time-picker
        :datetime="voteData.voteBeginDate"
        :date="paramDate.date"
        :time="paramDate.time"
        :date-options="dateOption"
        :time-options="timeOption"
        @send-date="setStartDateTimeValue"
      />

      <div class="text-h6 q-mt-md">종료시간</div>
      <dk-date-time-picker
        :datetime="voteData.voteEndDate"
        :date="paramDate.date"
        :time="paramDate.time"
        :date-options="endDateOption"
        :time-options="endTimeOption"
        @send-date="setEndDateTimeValue"
      />

      <div
        v-for="(question, index) in voteData.voteQestnResponseList"
        :key="index"
      >
        <q-separator spaced="12px" />
        <q-card class="my-card" flat bordered>
          <q-card-section>
            <dk-input
              v-model="question.questionContents"
              label="질문"
              clearable
              :max-length="20"
            />
            <dk-select
              v-model="question.voteKindCode"
              :options="
                voteKindCodeOptions.map((option) => ({
                  label: option.codeName,
                  value: option.code
                }))
              "
              emit-value
              map-options
              label="투표종류"
              class="q-mb-md"
              @update:model-value="resetItemList(question)"
            />
            <div
              v-for="(item, idx) in question.voteQestnIemResponseList"
              :key="idx"
            >
              <div v-if="question.voteKindCode === 'DTE'">
                <dk-date-time-picker
                  v-model="item.itemName"
                  :datetime="item.itemName"
                  label="항목"
                  :date="paramDate.date"
                  :time="paramDate.time"
                  :readonly="question.voteKindCode === 'DTE'"
                  @send-date="(val: string) => setDateItem(item, val)"
                >
                  <template #after>
                    <dk-btn
                      v-if="question.voteQestnIemResponseList.length > 2"
                      push
                      color="white"
                      text-color="primary"
                      label="-"
                      @click="deleteIem(question, item)"
                    />
                  </template>
                </dk-date-time-picker>
              </div>
              <div v-else>
                <dk-input
                  v-model="item.itemName"
                  label="항목"
                  clearable
                  :max-length="20"
                  :readonly="question.voteKindCode === 'RST'"
                >
                  <template #append>
                    <q-icon
                      v-if="question.voteKindCode === 'RST'"
                      name="search"
                      @click="fn_openRstrnt(item)"
                    />
                  </template>
                  <template #after>
                    <dk-btn
                      v-if="question.voteQestnIemResponseList.length > 2"
                      push
                      color="white"
                      text-color="primary"
                      label="-"
                      @click="deleteIem(question, item)"
                    />
                  </template>
                </dk-input>
              </div>
            </div>
            <dk-btn
              push
              color="white"
              text-color="primary"
              label="항목추가"
              class="q-mb-sm"
              @click="addIem(question)"
            />

            <div class="row">
              <dk-check
                v-model="question.anonymityVoteAlternative"
                label="익명투표"
                class="col-6"
                true-value="Y"
                false-value="N"
              />
              <dk-check
                v-model="question.compoundNumberChoiceAlternative"
                label="복수응답"
                class="col-6"
                true-value="Y"
                false-value="N"
              />
            </div>
            <div class="row justify-center">
              <dk-btn
                v-if="voteData.voteQestnResponseList.length > 1"
                push
                color="white"
                text-color="primary"
                label="삭제"
                class="q-mt-sm"
                @click="deleteQestn(index)"
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
        <dk-check
          v-model="voteData.voteExposureAlternative"
          label="노출여부"
          true-value="Y"
          false-value="N"
        />
      </div>
      <div class="row">
        <dk-check
          v-model="voteData.voteTransmissionAlternative"
          label="투표전송"
          class="col-4"
          true-value="Y"
          false-value="N"
        />
        <dk-select
          v-if="voteData.voteTransmissionAlternative === 'Y'"
          v-model="voteData.voteTransmissionCode"
          :options="
            voteTransmissionCodeOptions.map((option) => ({
              label: option.codeName,
              value: option.code
            }))
          "
          emit-value
          map-options
          label="전송방식"
          class="col-8"
        />
      </div>
      <div class="row justify-end">
        <dk-btn
          v-show="btn"
          push
          color="white"
          text-color="primary"
          label="등록"
          class="q-mt-sm"
          @click="fn_addVote"
        />
        <dk-btn
          v-show="!btn"
          push
          color="white"
          text-color="primary"
          label="수정"
          class="q-mt-sm"
          @click="fn_updateVote"
        />
      </div>
      <div class="row justify-start q-mt-md">
        <dk-btn
          v-show="btn"
          icon="arrow_left"
          push
          color="white"
          text-color="primary"
          label="투표 목록 화면으로 돌아가기"
          unelevated
          rounded
          style="width: 100%"
          @click="fn_goVoteList"
        />
        <dk-btn
          v-show="!btn"
          icon="arrow_left"
          push
          color="white"
          text-color="primary"
          label="투표 화면으로 돌아가기"
          unelevated
          rounded
          style="width: 100%"
          @click="fn_goVoteUser"
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
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import type { ApiResponse, Code } from '../../interface/server'
import { useAuthStore } from '../../stores/useAuthStore'
import { codeUtil } from '../../utils/code'
import { commUtil } from '../../utils/comm'

const { loading } = useQuasar()

const router = useRouter()
const authStore = useAuthStore()

const initVoteSsno = router.currentRoute.value.query.ssno
const initTab = router.currentRoute.value.query.tab
const user = ref<{ mberId: string }>({ mberId: authStore.mberId })
const voteTransmissionCodeOptions = ref<Code[]>([])
const voteKindCodeOptions = ref<Code[]>([])

//코드 리스트 가져오기
const getCodeList = async () => {
  voteTransmissionCodeOptions.value = await codeUtil.getCodeGroupList(
    'VOTE_TRNSMIS_CODE'
  )
  voteKindCodeOptions.value = await codeUtil.getCodeGroupList('VOTE_KND_CODE')
}

//시간
interface DateData {
  date: string
  time: string
  dateTime: string
  dateFrom: string
  dateTo: string
}

const paramDate = ref<DateData>({
  date: '',
  time: '',
  dateTime: '',
  dateFrom: '',
  dateTo: ''
})

interface VoteItem {
  itemSsno: number
  itemName: string
  itemIdentificationId: string | null
}

interface VoteQuestion {
  questionSsno: number
  voteSsno: number
  voteKindCode: string
  compoundNumberChoiceAlternative: string
  anonymityVoteAlternative: string
  questionContents: string
  voteQestnIemResponseList: VoteItem[]
}

interface VoteData {
  voteSsno?: number
  voteSubject: string
  voteBeginDate: string
  voteEndDate: string
  voteExposureAlternative: string
  voteTransmissionAlternative: string
  voteTransmissionCode: string
  voteQestnResponseList: VoteQuestion[]
}

interface VoteItemRequest {
  itemName: string
  itemIdentificationId: string | null
  itemSsno?: number
}

interface VoteQuestionRequest {
  questionContents: string
  voteKndCd: string
  compoundNumberChoiceAlternative: string
  anonymityVoteAlternative: string
  voteIemRequestList: VoteItemRequest[]
  questionSsno?: number
}

interface VoteDataRequest {
  userId: string
  voteSubject: string
  voteBeginDate: string
  voteEndDate: string
  voteExposureAlternative: string
  voteTransmissionCode: string
  voteQestnRequestList: VoteQuestionRequest[]
  voteSsno?: number
  voteTransmissionAlternative?: string
}

const voteData = ref<VoteData>({
  voteSubject: '',
  voteBeginDate: '',
  voteEndDate: '',
  voteExposureAlternative: 'Y',
  voteTransmissionCode: '',
  voteQestnResponseList: [],
  voteSsno: 0,
  voteTransmissionAlternative: 'N'
})

const addVoteData = ref<VoteDataRequest>({
  userId: '',
  voteSsno: 0,
  voteSubject: '',
  voteBeginDate: '',
  voteEndDate: '',
  voteExposureAlternative: '',
  voteTransmissionCode: '',
  voteQestnRequestList: [],
  voteTransmissionAlternative: ''
})

const btn = ref<boolean>(true)

//항목리셋
const resetItemList = (question: VoteQuestion) => {
  question.voteQestnIemResponseList = [
    {
      itemName: '',
      itemIdentificationId: '',
      itemSsno: 0
    }
  ]

  addIem(question)
}

//유효성 체크
const valid = () => {
  if (!voteData.value.voteSubject) {
    commUtil.alert({ message: '투표 제목을 입력해 주세요.' })
    return false
  }
  if (!voteData.value.voteBeginDate) {
    commUtil.alert({ message: '투표 시작 시간을 입력해 주세요.' })
    return false
  }
  if (!voteData.value.voteEndDate) {
    commUtil.alert({ message: '투표 종료 시간을 입력해 주세요.' })
    return false
  }
  if (voteData.value.voteQestnResponseList.length === 0) {
    commUtil.alert({ message: '최소 하나의 질문을 추가해 주세요.' })
    return false
  }

  for (const question of voteData.value.voteQestnResponseList) {
    if (!question.questionContents) {
      commUtil.alert({ message: '질문 내용을 입력해 주세요.' })
      return false
    }
    if (!question.voteKindCode) {
      commUtil.alert({ message: '투표 종류를 선택해 주세요.' })
      return false
    }
    if (question.voteQestnIemResponseList.length === 0) {
      commUtil.alert({ message: '항목을 추가해 주세요.' })
      return false
    }
    if (question.voteQestnIemResponseList.length < 2) {
      commUtil.alert({
        message: '각 질문에는 최소 2개의 항목을 추가해 주세요.'
      })
      return false
    }
    for (const item of question.voteQestnIemResponseList) {
      if (!item.itemName) {
        commUtil.alert({ message: '항목 이름을 입력해 주세요.' })
        return false
      }
    }
  }
  if (voteData.value.voteTransmissionAlternative === 'Y') {
    if (
      !voteData.value.voteTransmissionCode ||
      voteData.value.voteTransmissionCode.trim() === ''
    ) {
      commUtil.alert({ message: '전송방식을 선택해 주세요.' })
      return false
    }
  }
  return true
}

// 질문 삭제
const deleteQestn = (index: number) => {
  voteData.value.voteQestnResponseList.splice(index, 1)
}

// 질문 추가
const addQestn = () => {
  if (!voteData.value.voteQestnResponseList) {
    voteData.value.voteQestnResponseList = []
  }

  voteData.value.voteQestnResponseList.push({
    questionContents: '',
    voteKindCode: 'TXT',
    compoundNumberChoiceAlternative: 'N',
    anonymityVoteAlternative: 'N',
    voteQestnIemResponseList: [
      {
        itemName: '',
        itemIdentificationId: '',
        itemSsno: 0
      },
      {
        itemName: '',
        itemIdentificationId: '',
        itemSsno: 0
      }
    ],
    questionSsno: 0,
    voteSsno: 0
  })
}

// 항목 추가
const addIem = (question: VoteQuestion) => {
  question.voteQestnIemResponseList.push({
    itemName: '',
    itemIdentificationId: '',
    itemSsno: 0
  })
}

// 항목 삭제
const deleteIem = (question: VoteQuestion, item: VoteItem) => {
  if (question.voteQestnIemResponseList.length > 1) {
    const index = question.voteQestnIemResponseList.findIndex((i) => i === item)
    question.voteQestnIemResponseList.splice(index, 1)
  }
}

// 투표 등록
const fn_addVote = async () => {
  if (!valid()) {
    return
  }

  addVoteData.value.userId = user.value.mberId
  addVoteData.value.voteSubject = voteData.value.voteSubject
  addVoteData.value.voteBeginDate = voteData.value.voteBeginDate
  addVoteData.value.voteEndDate = voteData.value.voteEndDate
  addVoteData.value.voteExposureAlternative =
    voteData.value.voteExposureAlternative
  addVoteData.value.voteTransmissionCode = voteData.value.voteTransmissionCode
  addVoteData.value.voteTransmissionAlternative =
    voteData.value.voteTransmissionAlternative

  addVoteData.value.voteQestnRequestList =
    voteData.value.voteQestnResponseList.map((question) => {
      return {
        questionContents: question.questionContents,
        voteKndCd: question.voteKindCode,
        compoundNumberChoiceAlternative:
          question.compoundNumberChoiceAlternative,
        anonymityVoteAlternative: question.anonymityVoteAlternative,
        voteIemRequestList: question.voteQestnIemResponseList.map((item) => {
          return {
            itemName: item.itemName,
            itemIdentificationId: item.itemIdentificationId
          }
        })
      }
    })

  if (addVoteData.value.voteTransmissionAlternative === 'N') {
    addVoteData.value.voteTransmissionCode = ''
  }

  loading.show()

  try {
    await $fetch<ApiResponse<VoteData>>('/playground/api/vote/addVote', {
      method: 'POST',
      body: JSON.stringify(addVoteData.value)
    })
    commUtil.alert({
      message: '등록되었습니다.'
    })
    router.push('/vote-list')
  } catch (error) {
    console.error(error)
    commUtil.alert({
      message: '등록되지 않았습니다.'
    })
  }
  loading.hide()
}

// 투표 수정
const fn_updateVote = async () => {
  if (!valid()) {
    return
  }

  addVoteData.value.userId = user.value.mberId
  addVoteData.value.voteSsno = voteData.value.voteSsno
  addVoteData.value.voteSubject = voteData.value.voteSubject
  addVoteData.value.voteBeginDate = voteData.value.voteBeginDate
  addVoteData.value.voteEndDate = voteData.value.voteEndDate
  addVoteData.value.voteExposureAlternative =
    voteData.value.voteExposureAlternative
  addVoteData.value.voteTransmissionCode = voteData.value.voteTransmissionCode
  addVoteData.value.voteTransmissionAlternative =
    voteData.value.voteTransmissionAlternative

  addVoteData.value.voteQestnRequestList =
    voteData.value.voteQestnResponseList.map((question) => {
      return {
        questionContents: question.questionContents,
        voteKndCd: question.voteKindCode,
        compoundNumberChoiceAlternative:
          question.compoundNumberChoiceAlternative,
        anonymityVoteAlternative: question.anonymityVoteAlternative,
        voteIemRequestList: question.voteQestnIemResponseList.map((item) => {
          return {
            itemName: item.itemName,
            itemIdentificationId: item.itemIdentificationId
          }
        })
      }
    })

  if (addVoteData.value.voteTransmissionAlternative === 'N') {
    addVoteData.value.voteTransmissionCode = ''
  }

  loading.show()

  try {
    await $fetch<ApiResponse<VoteData>>('/playground/api/vote/modifyVote', {
      method: 'PUT',
      body: JSON.stringify(addVoteData.value)
    })
    commUtil.alert({
      message: '수정되었습니다.'
    })
    fn_goVoteUser()
  } catch (error) {
    console.error(error)
    commUtil.alert({
      message: '수정되지 않았습니다.'
    })
  }
  loading.hide()
}

// 투표 상세 조회
const fn_getVoteDetail = async (ssno: number) => {
  try {
    const result = await $fetch<ApiResponse<VoteData>>(
      '/playground/api/vote/getVoteDetail',
      {
        method: 'POST',
        body: JSON.stringify({ voteSsno: ssno })
      }
    )
    voteData.value = result.data
    paramDate.value.dateFrom = voteData.value.voteBeginDate
    paramDate.value.dateTo = voteData.value.voteEndDate
  } catch (error) {
    console.error(error)
    commUtil.alert({
      message: '조회되지 않았습니다.'
    })
  }
}

//시작일자 옵션
const date = new Date()
const dateOption = (val: string) => {
  const optDate = date.toISOString().slice(0, 10).replace(/-/g, '/')
  return val >= optDate
}

//종료일자 옵션
const endDateOption = (val: string) => {
  const optDate = voteData.value.voteBeginDate.slice(0, 10).replace(/-/g, '/')
  return val >= optDate
}

//시작시간옵션
const timeOption = (hr: number, min: number | null) => {
  const nowHour = date.getHours()
  const nowMinute = date.getMinutes()

  if (hr < nowHour || (hr === nowHour && min !== null && min < nowMinute)) {
    return false
  }

  return true
}

//종료시간옵션
const endTimeOption = (hr: number, min: number | null) => {
  const beginDateHr = Number(voteData.value.voteBeginDate.slice(11, 13))
  const beginDateMin = Number(voteData.value.voteBeginDate.slice(14, 16))

  if (
    hr < beginDateHr ||
    (hr === beginDateHr && min !== null && min < beginDateMin)
  ) {
    return false
  }

  return true
}

// 시작시간 설정
const setStartDateTimeValue = (val: string) => {
  voteData.value.voteBeginDate = val.replace(/T/g, ' ')
}

// 종료시간 설정
const setEndDateTimeValue = (val: string) => {
  voteData.value.voteEndDate = val.replace(/T/g, ' ')
}

const setDateItem = (item: VoteItem, val: string) => {
  if (item) {
    item.itemName = val
  }
}

// 식당 팝업
const openYn = ref<boolean>(false)
const rstrntItem = ref<VoteItem | null>(null)
const openDetailYn = ref<boolean>(false)
const rstrntDetailComponent = ref()

const dialogCloseCallback = () => {
  openYn.value = false
}

const fn_openRstrnt = (item: VoteItem) => {
  rstrntItem.value = item
  openYn.value = true
}

const rstrntSelect = (data: {
  restaurantSerialNo: string
  restaurantName: string
}) => {
  //레스토랑 sn 문자열 변환
  const restaurantSn = String(data.restaurantSerialNo)
  for (const question of voteData.value.voteQestnResponseList) {
    for (const item of question.voteQestnIemResponseList) {
      const itemSn = String(item.itemIdentificationId)
      if (itemSn === restaurantSn) {
        commUtil.alert({
          message: '이미 선택된 식당입니다. 다시 선택해 주세요.'
        })
        openYn.value = true
        return
      }
    }
  }

  if (rstrntItem.value) {
    rstrntItem.value.itemIdentificationId = data.restaurantSerialNo
    rstrntItem.value.itemName = data.restaurantName
  }

  openYn.value = false
}

const showRstrntDetail = (data: number) => {
  openYn.value = false
  rstrntDetailComponent.value.fn_getRstrntDetail(data)
  openDetailYn.value = true
}

const detailDialogCloseCallback = () => {
  openDetailYn.value = false
  openYn.value = true
}

const fn_goVoteUser = () => {
  router.push('/vote-user?ssno=' + initVoteSsno + '&tab=' + initTab)
}

const fn_goVoteList = () => {
  router.push('/vote-list?initTab=' + initTab)
}

onMounted(() => {
  if (initVoteSsno) {
    fn_getVoteDetail(Number(initVoteSsno))
    btn.value = false
  } else {
    btn.value = true
  }
  getCodeList()
  if (!voteData.value.voteQestnResponseList.length) {
    addQestn()
  }
})
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
