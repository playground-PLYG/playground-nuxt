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
                outlined
                style="font-size: xx-large"
                v-model="registVoteData.voteSubject"
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
                      label="OK"
                      color="primary"
                      flat
                      @click="onClickDate('BEGIN')"
                      v-close-popup
                    />
                    <q-btn label="Cancel" color="primary" flat v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="access_time" :disable="!insertMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                ref="beginTimeProxy"
              >
                <q-time v-model="registDateTime.beginTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      label="OK"
                      color="primary"
                      flat
                      @click=""
                      v-close-popup
                    />
                    <q-btn label="Cancel" color="primary" flat v-close-popup />
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
                :disable="!insertMode"
                color="black"
                v-model="registVoteData.anonymityVoteAlternativeBoo"
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
                      label="OK"
                      color="primary"
                      flat
                      @click="onClickDate('FINISH')"
                      v-close-popup
                    />
                    <q-btn label="Cancel" color="primary" flat v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="access_time" :disable="!insertMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                ref="finishTimeProxy"
              >
                <q-time v-model="registDateTime.finishTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      label="OK"
                      color="primary"
                      flat
                      @click=""
                      v-close-popup
                    />
                    <q-btn label="Cancel" color="primary" flat v-close-popup />
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
                outlined
                v-model="registVoteData.voteKindName"
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
        class="q-pa-md"
        v-for="(qestn, index) in registVoteData.qestnRequestList"
        :key="qestn.questionSsno"
      >
        <q-card class="my-card">
          <q-card-section class="bg-light-blue-6 text-white">
            <div
              class="q-gutter-y-md column"
              style="width: 90%; display: inline-flex"
            >
              <q-input
                filled
                :readonly="!insertMode"
                :id="qestn.questionContents + index"
                v-model="qestn.questionContents"
                style="font-size: x-large"
                :dense="true"
              />
            </div>
            <div class="q-pl-lg" style="display: inline-flex">
              <q-btn
                align="center"
                size="xs"
                v-show="insertMode"
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
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="삭제"
                        style="margin-top: 5px"
                        v-close-popup
                        @click="delQuestion(qestn.questionSsno)"
                      />
                      <q-btn
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="취소"
                        style="margin-top: 5px"
                        v-close-popup
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
              tag="label"
              v-ripple
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
                          push
                          color="white"
                          size="xs"
                          text-color="black"
                          label="삭제"
                          style="margin-top: 5px"
                          v-close-popup
                          @click="delVoteItem(qestn.questionSsno, iem.itemSsno)"
                        />
                        <q-btn
                          push
                          color="white"
                          size="xs"
                          text-color="black"
                          label="취소"
                          style="margin-top: 5px"
                          v-close-popup
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
                      standout="bg-grey text-white"
                      v-model="addVoteItemData.itemName"
                      label="Item Name"
                      label-color="white"
                      :dense="true"
                      color="white"
                    />
                    <q-input
                      standout="bg-grey text-white"
                      v-model="addVoteItemData.itemSsno"
                      label="Item ID"
                      label-color="white"
                      :dense="true"
                    />
                    <q-card-actions align="center">
                      <q-btn
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="추가"
                        style="margin-top: 5px"
                        v-close-popup
                        @click="addVoteItem(qestn.questionSsno)"
                      />
                      <q-btn
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="취소"
                        style="margin-top: 5px"
                        v-close-popup
                        @click="resetAddVoteItemData"
                      />
                    </q-card-actions>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>
              <q-btn
                size="sm"
                outline
                color="indigo-7"
                label="식당검색"
                :disable="!insertMode"
                v-show="
                  registVoteData.voteKindName.indexOf('식사') > -1
                    ? true
                    : false
                "
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
          @click="addQuestion"
          :disable="!insertMode"
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
              <q-btn flat label="취소" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-btn
          align="between"
          class="btn-fixed-width"
          color="blue-grey-5"
          label="닫기"
          icon="flight_takeoff"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type ApiResponse } from '../../../interface/server'
import { useQuasar } from 'quasar'
const { loading } = useQuasar()

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

let registDateTime = ref<registDateTimeType>({
  //new Date().getFullYear() + '/' + new Date().getMonth() + '/' + new Date().getDay()
  //new Date().getHours() + ':' + new Date().getMinutes()
  beginDate: '',
  beginTime: '',
  finishData: '',
  finishTime: ''
})

let insertMode = ref<boolean>(true)
let insertBtnLabe = ref<string>('등록하기')
let isInsertConfirm = ref<boolean>(false)
let registVoteData = ref<VoteDetailDataType>({
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

let addVoteItemData = ref<VoteItemDetailDataType>({
  itemSsno: 0,
  itemName: ''
})

const setInsertData = () => {
  let reqVote = registVoteData.value
  registVoteData.value.anonymityVoteAlternative =
    reqVote.anonymityVoteAlternativeBoo ? 'Y' : 'N'

  if (
    registVoteData.value.voteSubject == '' ||
    registVoteData.value.voteSubject == undefined ||
    registVoteData.value.voteSubject == null
  ) {
    alert('투표제목을 입력해주세요.')
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
    alert('투표시작 일시 혹은 투표종료 일시를 선택해주세요.')
    return false
  }

  let setBeginDate = dateTimeFormatter(
    registDateTime.value.beginDate,
    registDateTime.value.beginTime
  )
  let setEndDate = dateTimeFormatter(
    registDateTime.value.finishData,
    registDateTime.value.finishTime
  )
  registVoteData.value.voteBeginDate = setBeginDate
  registVoteData.value.voteEndDate = setEndDate

  // 2. 등록하기 버튼 클릭시 투표종류코드 만들어서 보내기 -> props.codeData 사용
  let codeDataList = props.codeData
  let reqCodeName = reqVote.voteKindName
  registVoteData.value.voteKindCode = 'ETC'
  if (
    reqVote.voteKindName == '' ||
    reqVote.voteKindName == undefined ||
    reqVote.voteKindName == null
  ) {
    alert('투표종류를 선택해주세요.')
    return false
  } else {
    for (const cd of codeDataList) {
      if (cd.codeName == reqCodeName) {
        registVoteData.value.voteKindCode = cd.code
      }
    }
  }

  // 3. 등록하기 버튼 클릭시 qestnRequestList 돌려서 voteIemrequestList 0개 있는거 파악해서 alert 뿌리기
  let qestnListLength: number = registVoteData.value.qestnRequestList.length
  if (qestnListLength == 0) {
    alert('질문은 최소 한개가 존재해야 합니다.')
    return false
  }

  let isLengthZero: boolean = false
  registVoteData.value.qestnRequestList.forEach((qestn) => {
    if (qestn.voteIemRequestList.length == 0) {
      isLengthZero = true
    }
  })

  if (!isLengthZero) {
    console.log('final registVoteData : ', registVoteData.value)
    insertVote()
  } else {
    alert('투표항목은 최소 한개가 존재해야 합니다.')
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
        alert('투표등록 중 오류가 발생했습니다.\n 다시 시도해주세요.')
      }
      loading.hide()
    })
    .catch((error) => {
      console.error(error)
    })
}

let tempVoteNo: number = 999
let tempQestnNo: number = 0
const addQuestion = () => {
  let qestnList = registVoteData.value.qestnRequestList
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
    alert('질문은 최소 한개가 존재해야 합니다.')
    return false
  } else {
    qestnList = qestnList.filter((qes) => {
      if (qes.questionSsno != questionSsno) return qes
    })
  }
  registVoteData.value.qestnRequestList = qestnList
}

const addVoteItem = (questionSsno: number) => {
  let valItemSsno = addVoteItemData.value.itemSsno
  let valItemName = addVoteItemData.value.itemName
  if (
    valItemSsno == 0 ||
    valItemSsno == undefined ||
    valItemName == '' ||
    valItemName == undefined
  ) {
    alert('[추가할 항목과 이름을 작성해 주세요.]')
    return false
  }

  let qestnList = registVoteData.value.qestnRequestList
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
  let qestnList = registVoteData.value.qestnRequestList
  qestnList.forEach((qes) => {
    if (qes.questionSsno == questionSsno) {
      if (qes.voteIemRequestList.length <= 1) {
        alert('항목은 최소 한개가 존재해야 합니다.')
        return false
      } else {
        qes.voteIemRequestList = qes.voteIemRequestList.filter((iem) => {
          if (iem.itemSsno != itemSsno) return iem
        })
      }
    }
  })
  registVoteData.value.qestnRequestList = qestnList
}

const beginDateLimitFn = (date: string) => {
  let chkFinDate: string = registDateTime.value.finishData
  return (
    date <=
    (chkFinDate == '' || chkFinDate == undefined || chkFinDate == null
      ? '9999/12/31'
      : chkFinDate)
  )
}

const finishDateLimitFn = (date: string) => {
  let chkStrDate: string = registDateTime.value.beginDate
  return (
    date >=
    (chkStrDate == '' || chkStrDate == undefined || chkStrDate == null
      ? '9999/12/31'
      : chkStrDate)
  )
}

const dateTimeFormatter = (date: string, time: string) => {
  return (
    date.toString().replaceAll('/', '-') + ' ' + time.toString() + ':00.000'
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
