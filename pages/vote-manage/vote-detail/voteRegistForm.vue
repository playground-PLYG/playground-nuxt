<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw">
      <div class="q-pa-md">
        <div class="row items-start q-gutter-md">
          <q-responsive :ratio="4 / 3" class="col" style="max-height: 100px">
            <q-card class="column" flat bordered>
              <q-img
                class="col"
                src="https://cdn.quasar.dev/img/parallax1.jpg"
              />
            </q-card>
          </q-responsive>
        </div>
        <q-card class="my-card" flat bordered>
          <q-card-section>
            <div class="text-h4">
              <q-input
                v-model="registVoteData.voteSubject"
                outlined
                style="font-size: xx-large"
                :disable="!insertMode"
              />
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat round icon="event" :disable="!insertMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="registDateTime.beginDate"
                  :options="beginDateLimitFn"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="onClickDate('BEGIN')"
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="access_time" :disable="!insertMode">
              <q-popup-proxy
                ref="beginTimeProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time v-model="registDateTime.beginTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click=""
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>

            <q-btn flat color="primary" :disable="!insertMode">
              투표시작 일시 :
              {{
                registDateTime.beginDate +
                ' ' +
                registDateTime.beginTime +
                ':00'
              }}
            </q-btn>
            <div style="margin-left: 50px">
              <q-checkbox
                v-model="registVoteData.anonymityVoteAlternativeBoo"
                :disable="!insertMode"
                color="black"
                label="익명투표여부"
              />
            </div>
          </q-card-actions>
          <q-card-actions>
            <q-btn flat round icon="event" :disable="!insertMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="registDateTime.finishData"
                  :options="finishDateLimitFn"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="onClickDate('FINISH')"
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="access_time" :disable="!insertMode">
              <q-popup-proxy
                ref="finishTimeProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time v-model="registDateTime.finishTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click=""
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat color="primary" :disable="!insertMode">
              투표종료 일시 :
              {{
                registDateTime.finishData +
                ' ' +
                registDateTime.finishTime +
                ':00'
              }}
            </q-btn>
            <div style="margin-left: 50px">
              <q-select
                v-model="registVoteData.voteKindName"
                outlined
                :options="codeName"
                label="투표종류"
                round
                dense
                flat
                class="select"
                :readonly="!insertMode"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>

      <div
        v-for="(qestn, index) in registVoteData.qestnRequestList"
        :key="qestn.questionSsno"
        class="q-pa-md"
      >
        <q-card class="my-card">
          <q-card-section class="bg-light-blue-6 text-white">
            <div
              class="q-gutter-y-md column"
              style="width: 90%; display: inline-flex"
            >
              <q-input
                :id="qestn.questionContents + index"
                v-model="qestn.questionContents"
                filled
                :readonly="!insertMode"
                style="font-size: x-large"
                :dense="true"
              />
            </div>
            <div class="q-pl-lg" style="display: inline-flex">
              <q-btn
                v-show="insertMode"
                align="center"
                size="xs"
                :disable="!insertMode"
                icon="close"
                outline
                round
                color="white"
              >
                <q-popup-proxy :offset="[200, -20]">
                  <q-banner class="bg-indigo-10 text-white">
                    질문을 삭제하시겠습니까?
                    <q-card-actions align="center">
                      <q-btn
                        v-close-popup
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="삭제"
                        style="margin-top: 5px"
                        @click="delQuestion(qestn.questionSsno)"
                      />
                      <q-btn
                        v-close-popup
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="취소"
                        style="margin-top: 5px"
                      />
                    </q-card-actions>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>
            </div>
          </q-card-section>
          <q-list>
            <q-item
              v-for="(iem, ind) in qestn.voteIemRequestList"
              :key="iem.itemSsno"
              v-ripple
              tag="label"
            >
              <q-item-section avatar>
                <q-radio
                  v-model="qestn.questionSsno"
                  :val="iem.itemSsno"
                  color="light-blue-7"
                  :disable="true"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label :id="ind">{{ iem.itemName }}</q-item-label>
                <q-item-label caption>{{ iem.itemSsno }} </q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-btn
                  size="xs"
                  :disable="!insertMode"
                  icon="close"
                  outline
                  round
                  color="grey-7"
                >
                  <q-popup-proxy :offset="[200, -20]">
                    <q-banner class="bg-indigo-10 text-white">
                      항목을 삭제하시겠습니까?
                      <q-card-actions align="center">
                        <q-btn
                          v-close-popup
                          push
                          color="white"
                          size="xs"
                          text-color="black"
                          label="삭제"
                          style="margin-top: 5px"
                          @click="delVoteItem(qestn.questionSsno, iem.itemSsno)"
                        />
                        <q-btn
                          v-close-popup
                          push
                          color="white"
                          size="xs"
                          text-color="black"
                          label="취소"
                          style="margin-top: 5px"
                        />
                      </q-card-actions>
                    </q-banner>
                  </q-popup-proxy>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-card-actions align="left">
              <!-- <q-checkbox color="black" v-model="selectSubjective" label="주관식여부" /> -->
              <q-btn
                size="sm"
                outline
                color="indigo-7"
                label="항목추가"
                :disable="!insertMode"
              >
                <q-popup-proxy :offset="[10, 10]">
                  <q-banner class="bg-indigo-5 text-white">
                    항목 검색해서 세팅하는 형식으로 변경 예정
                    <q-input
                      v-model="addVoteItemData.itemName"
                      standout="bg-grey text-white"
                      label="Item Name"
                      label-color="white"
                      :dense="true"
                      color="white"
                    />
                    <q-input
                      v-model="addVoteItemData.itemSsno"
                      standout="bg-grey text-white"
                      label="Item ID"
                      label-color="white"
                      :dense="true"
                    />
                    <q-card-actions align="center">
                      <q-btn
                        v-close-popup
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="추가"
                        style="margin-top: 5px"
                        @click="addVoteItem(qestn.questionSsno)"
                      />
                      <q-btn
                        v-close-popup
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="취소"
                        style="margin-top: 5px"
                        @click="resetAddVoteItemData"
                      />
                    </q-card-actions>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>
              <q-btn
                v-show="
                  registVoteData.voteKindName.indexOf('식사') > -1
                    ? true
                    : false
                "
                size="sm"
                outline
                color="indigo-7"
                label="식당검색"
                :disable="!insertMode"
              />
            </q-card-actions>
          </q-list>
        </q-card>
      </div>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn
          outline
          rounded
          color="indigo-7"
          label="질문추가하기"
          :disable="!insertMode"
          @click="addQuestion"
        />
      </q-card-actions>
      <q-card-actions align="center">
        <q-btn
          align="around"
          class="btn-fixed-width"
          color="brown-5"
          :label="insertBtnLabe"
          icon="lightbulb_outline"
          @click="setInsertData"
        />
        <q-dialog
          v-model="isInsertConfirm"
          persistent
          backdrop-filter="blur(4px)"
        >
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="print" color="primary" text-color="white" />
              <span class="q-ml-sm">투표내용을 수정하시겠습니까?</span>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="수정" color="primary" @click="" />
              <q-btn v-close-popup flat label="취소" color="primary" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-btn
          v-close-popup
          align="between"
          class="btn-fixed-width"
          color="blue-grey-5"
          label="닫기"
          icon="flight_takeoff"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../../interface/server'
const { loading } = useQuasar()
const $q = useQuasar()

interface VoteDetailDataType {
  voteSsno: number
  voteKindCode: string
  voteKindName: string
  voteSubject: string
  anonymityVoteAlternative: string
  anonymityVoteAlternativeBoo: boolean
  voteBeginDate: string
  voteEndDate: string
  voteDeleteAlternative: string
  registUsrId: string
  registDt: string
  updtUsrId: string
  updtDt: string
  excuteResult?: string
  qestnRequestList: QuestionDetailDataType[]
}

interface QuestionDetailDataType {
  questionSsno: number
  voteSsno: number
  questionContents: string
  compoundNumberChoiceAlternative: string
  voteIemRequestList: VoteItemDetailDataType[]
}

interface VoteItemDetailDataType {
  itemSsno: number
  itemName: string
  questionSsno?: number
  voteSsno?: number
}

interface kindCodeType {
  code: string
  codeName: string
  upperCode: string
}

interface registDateTimeType {
  beginDate: string
  beginTime: string
  finishData: string
  finishTime: string
}

interface PropsType {
  codeData: kindCodeType[]
  codeName: any[]
}

const props = defineProps<PropsType>()

const registDateTime = ref<registDateTimeType>({
  //new Date().getFullYear() + '/' + new Date().getMonth() + '/' + new Date().getDay()
  //new Date().getHours() + ':' + new Date().getMinutes()
  beginDate: '',
  beginTime: '',
  finishData: '',
  finishTime: ''
})

const insertMode = ref<boolean>(true)
const insertBtnLabe = ref<string>('등록하기')
const isInsertConfirm = ref<boolean>(false)
const registVoteData = ref<VoteDetailDataType>({
  voteSsno: 0,
  voteKindCode: '',
  voteKindName: '',
  voteSubject: '',
  anonymityVoteAlternative: 'N',
  anonymityVoteAlternativeBoo: false,
  voteBeginDate: '',
  voteEndDate: '',
  voteDeleteAlternative: 'N',
  registUsrId: '',
  registDt: '',
  updtUsrId: '',
  updtDt: '',
  qestnRequestList: []
})

const addVoteItemData = ref<VoteItemDetailDataType>({
  itemSsno: 0,
  itemName: ''
})

const setInsertData = () => {
  const reqVote = registVoteData.value
  registVoteData.value.anonymityVoteAlternative =
    reqVote.anonymityVoteAlternativeBoo ? 'Y' : 'N'

  if (
    registVoteData.value.voteSubject == '' ||
    registVoteData.value.voteSubject == undefined ||
    registVoteData.value.voteSubject == null
  ) {
    $q.dialog({
      title: '알림',
      message: '투표제목을 입력해주세요.'
    })
    return false
  }

  // 1. 등록하기 버튼 클릭시 날짜, 시간 잘 들어가는지 확인하고 형식 맞춰서 보내주기
  if (
    registDateTime.value.beginDate == '' ||
    registDateTime.value.beginDate == undefined ||
    registDateTime.value.beginDate == null ||
    registDateTime.value.beginTime == '' ||
    registDateTime.value.beginTime == undefined ||
    registDateTime.value.beginTime == null ||
    registDateTime.value.finishData == '' ||
    registDateTime.value.finishData == undefined ||
    registDateTime.value.finishData == null ||
    registDateTime.value.finishTime == '' ||
    registDateTime.value.finishTime == undefined ||
    registDateTime.value.finishTime == null
  ) {
    $q.dialog({
      title: '알림',
      message: '투표시작 일시 혹은 투표종료 일시를 선택해주세요.'
    })
    return false
  }

  const setBeginDate = dateTimeFormatter(
    registDateTime.value.beginDate,
    registDateTime.value.beginTime
  )
  const setEndDate = dateTimeFormatter(
    registDateTime.value.finishData,
    registDateTime.value.finishTime
  )
  registVoteData.value.voteBeginDate = setBeginDate
  registVoteData.value.voteEndDate = setEndDate

  // 2. 등록하기 버튼 클릭시 투표종류코드 만들어서 보내기 -> props.codeData 사용
  const codeDataList = props.codeData
  const reqCodeName = reqVote.voteKindName
  registVoteData.value.voteKindCode = 'ETC'
  if (
    reqVote.voteKindName == '' ||
    reqVote.voteKindName == undefined ||
    reqVote.voteKindName == null
  ) {
    $q.dialog({
      title: '알림',
      message: '투표종류를 선택해주세요.'
    })
    return false
  } else {
    for (const cd of codeDataList) {
      if (cd.codeName == reqCodeName) {
        registVoteData.value.voteKindCode = cd.code
      }
    }
  }

  // 3. 등록하기 버튼 클릭시 qestnRequestList 돌려서 voteIemrequestList 0개 있는거 파악해서 alert 뿌리기
  const qestnListLength: number = registVoteData.value.qestnRequestList.length
  if (qestnListLength == 0) {
    $q.dialog({
      title: '알림',
      message: '질문은 최소 한개가 존재해야 합니다.'
    })
    return false
  }

  let isLengthZero: boolean = false
  registVoteData.value.qestnRequestList.forEach((qestn) => {
    if (qestn.voteIemRequestList.length == 0) {
      isLengthZero = true
    }
  })

  if (!isLengthZero) {
    insertVote()
  } else {
    $q.dialog({
      title: '알림',
      message: '투표항목은 최소 한개가 존재해야 합니다.'
    })
    return false
  }
}

const emits = defineEmits(['chgShowVoteRegist'])
const insertVote = async () => {
  loading.show()
  await $fetch<ApiResponse<VoteDetailDataType>>(
    '/playground/api/vote/addVote',
    {
      method: 'POST',
      body: JSON.stringify(registVoteData.value)
    }
  )
    .then((res) => {
      console.log('###### insertVote res : ', res)
      if (res.data) {
        emits('chgShowVoteRegist', false)
      } else {
        $q.dialog({
          title: '알림',
          message: '투표등록 중 오류가 발생했습니다.\n 다시 시도해주세요.'
        })
      }
      loading.hide()
    })
    .catch((error) => {
      console.error(error)
    })
}

const tempVoteNo: number = 999
let tempQestnNo: number = 0
const addQuestion = () => {
  const qestnList = registVoteData.value.qestnRequestList
  qestnList.push({
    questionSsno: tempQestnNo,
    voteSsno: tempVoteNo,
    questionContents: '질문을 입력해주세요.',
    compoundNumberChoiceAlternative: 'N',
    voteIemRequestList: []
  })
  ++tempQestnNo
  registVoteData.value.qestnRequestList = qestnList
}

const delQuestion = (questionSsno: number) => {
  let qestnList = registVoteData.value.qestnRequestList
  if (qestnList.length <= 1) {
    $q.dialog({
      title: '알림',
      message: '질문은 최소 한개가 존재해야 합니다.'
    })
    return false
  } else {
    qestnList = qestnList.filter((qes) => {
      if (qes.questionSsno != questionSsno) {return qes}
    })
  }
  registVoteData.value.qestnRequestList = qestnList
}

const addVoteItem = (questionSsno: number) => {
  const valItemSsno = addVoteItemData.value.itemSsno
  const valItemName = addVoteItemData.value.itemName
  if (
    valItemSsno == 0 ||
    valItemSsno == undefined ||
    valItemName == '' ||
    valItemName == undefined
  ) {
    $q.dialog({
      title: '알림',
      message: '[추가할 항목과 이름을 작성해 주세요.]'
    })
    return false
  }

  const qestnList = registVoteData.value.qestnRequestList
  qestnList.forEach((qes) => {
    if (qes.questionSsno == questionSsno) {
      qes.voteIemRequestList.push({
        itemSsno: addVoteItemData.value.itemSsno,
        itemName: addVoteItemData.value.itemName
      })
    }
  })

  registVoteData.value.qestnRequestList = qestnList
  addVoteItemData.value.itemSsno = 0
  addVoteItemData.value.itemName = ''
}

const delVoteItem = (questionSsno: number, itemSsno: number) => {
  const qestnList = registVoteData.value.qestnRequestList
  qestnList.forEach((qes) => {
    if (qes.questionSsno == questionSsno) {
      if (qes.voteIemRequestList.length <= 1) {
        $q.dialog({
          title: '알림',
          message: '항목은 최소 한개가 존재해야 합니다.'
        })
        return false
      } else {
        qes.voteIemRequestList = qes.voteIemRequestList.filter((iem) => {
          if (iem.itemSsno != itemSsno) {return iem}
        })
      }
    }
  })
  registVoteData.value.qestnRequestList = qestnList
}

const beginDateLimitFn = (date: string) => {
  const chkFinDate: string = registDateTime.value.finishData
  return (
    date <=
    (chkFinDate == '' || chkFinDate == undefined || chkFinDate == null
      ? '9999/12/31'
      : chkFinDate)
  )
}

const finishDateLimitFn = (date: string) => {
  const chkStrDate: string = registDateTime.value.beginDate
  return (
    date >=
    (chkStrDate == '' || chkStrDate == undefined || chkStrDate == null
      ? '9999/12/31'
      : chkStrDate)
  )
}

const dateTimeFormatter = (date: string, time: string) => {
  return (
    date.toString().replaceAll('/', '-') + ' ' + time.toString() + ':00.010'
  )
}

const beginTimeProxy = ref()
const finishTimeProxy = ref()
const onClickDate = (beginFinish: string) => {
  if (beginFinish == 'BEGIN') {
    beginTimeProxy.value.show()
  } else if (beginFinish == 'FINISH') {
    finishTimeProxy.value.show()
  }
}

const resetAddVoteItemData = () => {
  addVoteItemData.value.itemSsno = 0
  addVoteItemData.value.itemName = ''
}
</script>
<style lang="scss" scoped>
.my-card {
  width: 100%;
  .select {
    width: 200%;
  }
}
</style>
