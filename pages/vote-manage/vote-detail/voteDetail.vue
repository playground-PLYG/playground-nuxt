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
                v-model="voteData.voteSubject"
                outlined
                :readonly="!editMode"
                style="font-size: xx-large"
              />
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat round icon="event" :disable="!editMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                @before-show="beginFinishUpdate('BEGIN', 'DATE')"
              >
                <q-date
                  v-model="afterDateTime.beginDate"
                  :options="beginDateLimitFn"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="
                        settingDateTime(
                          afterDateTime.beginDate,
                          'DATE',
                          'BEGIN'
                        )
                      "
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>

            <q-btn flat round icon="access_time" :disable="!editMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                @before-show="beginFinishUpdate('BEGIN', 'TIME')"
              >
                <q-time v-model="afterDateTime.beginTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="
                        settingDateTime(
                          afterDateTime.beginTime,
                          'TIME',
                          'BEGIN'
                        )
                      "
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat color="primary" :disable="!editMode">
              투표시작 일시 :
              {{
                voteData.voteBeginDate.toString().split('T')[0] +
                '  ' +
                voteData.voteBeginDate.toString().split('T')[1].split('.')[0]
              }}
            </q-btn>
            <div style="margin-left: 50px">
              <q-checkbox
                v-model="voteData.anonymityVoteAlternativeBoo"
                :disable="!editMode"
                color="black"
                label="익명투표여부"
              />
            </div>
          </q-card-actions>
          <q-card-actions>
            <q-btn flat round icon="event" :disable="!editMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                @before-show="beginFinishUpdate('FINISH', 'DATE')"
              >
                <q-date
                  v-model="afterDateTime.finishData"
                  :options="finishDateLimitFn"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="
                        settingDateTime(
                          afterDateTime.finishData,
                          'DATE',
                          'FINISH'
                        )
                      "
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="access_time" :disable="!editMode">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
                @before-show="beginFinishUpdate('FINISH', 'TIME')"
              >
                <q-time v-model="afterDateTime.finishTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      v-close-popup
                      label="OK"
                      color="primary"
                      flat
                      @click="
                        settingDateTime(
                          afterDateTime.finishTime,
                          'TIME',
                          'FINISH'
                        )
                      "
                    />
                    <q-btn v-close-popup label="Cancel" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat color="primary" :disable="!editMode">
              투표종료 일시 :
              {{
                voteData.voteEndDate.toString().split('T')[0] +
                '  ' +
                voteData.voteEndDate.toString().split('T')[1].split('.')[0]
              }}
            </q-btn>
            <div style="margin-left: 50px">
              <q-select
                v-model="voteData.voteKindName"
                outlined
                :options="codeName"
                label="투표종류"
                round
                dense
                flat
                class="select"
                :readonly="!editMode"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
      <div
        v-for="(qestn, index) in showQuestionData"
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
                v-model="qestn.questionContents"
                filled
                :name="'qc' + index"
                :readonly="!editMode"
                style="font-size: x-large"
                :dense="true"
              />
            </div>
            <div class="q-pl-lg" style="display: inline-flex">
              <q-btn
                v-show="editMode"
                align="center"
                size="xs"
                :disable="!editMode"
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
                        :id="'addBtn' + qestn.questionSsno"
                        v-close-popup="isDelQuestion"
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="삭제"
                        style="margin-top: 5px"
                        @click="delQuestion(qestn.voteSsno, qestn.questionSsno)"
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
              v-for="(iem, index) in qestn.voteIemResponseList"
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
                <q-item-label :id="index">{{ iem.itemName }}</q-item-label>
                <q-item-label caption>{{ iem.itemSsno }} </q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-btn
                  size="xs"
                  :disable="!editMode"
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
                          :id="'addBtn' + qestn.questionSsno"
                          v-close-popup="delTempleteClose"
                          push
                          color="white"
                          size="xs"
                          text-color="black"
                          label="삭제"
                          style="margin-top: 5px"
                          @click="
                            delVoteItem(
                              qestn.voteSsno,
                              qestn.questionSsno,
                              iem.itemSsno
                            )
                          "
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
                :disable="!editMode"
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
                        :id="'addBtn' + qestn.questionSsno"
                        v-close-popup="addTempleteClose"
                        push
                        color="white"
                        size="xs"
                        text-color="black"
                        label="추가"
                        style="margin-top: 5px"
                        @click="addVoteItem(qestn.voteSsno, qestn.questionSsno)"
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
                  voteData.voteKindName.indexOf('식사') > -1 ? true : false
                "
                size="sm"
                outline
                color="indigo-7"
                label="식당검색"
                :disable="!editMode"
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
          :disable="!editMode"
          @click="addQuestion"
        />
      </q-card-actions>
      <q-card-actions align="center">
        <q-btn
          align="around"
          class="btn-fixed-width"
          color="brown-5"
          :label="editBtnLabel"
          icon="lightbulb_outline"
          @click="setEditMode"
        />
        <q-dialog
          v-model="isEditConfirm"
          persistent
          backdrop-filter="blur(4px)"
        >
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="print" color="primary" text-color="white" />
              <span class="q-ml-sm">투표내용을 수정하시겠습니까?</span>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                label="수정"
                color="primary"
                @click="editVoteDetail"
              />
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
  qestnResponseList: QuestionDetailDataType[]
}

interface QuestionDetailDataType {
  questionSsno: number
  voteSsno: number
  questionContents: string
  compoundNumberChoiceAlternative: string
  voteIemResponseList: VoteItemDetailDataType[]
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

interface PropsType {
  voteData: VoteDetailDataType
  questionData: QuestionDetailDataType[]
  codeData: kindCodeType[]
  codeName: any[]
}

const props = defineProps<PropsType>()
const showVoteData = ref<VoteDetailDataType>()
const showQuestionData = ref<QuestionDetailDataType[]>([])
const editMode = ref<boolean>(false) // editMode = true = 수정
const editBtnLabel = ref<string>('수정하기') // editMode = true = 수정
const isEditConfirm = ref<boolean>(false)
let initBeginDate: string
let initBeginTime: string
let initFinishData: string
let initFinishTime: string

interface afterDateTimeType {
  beginDate: string
  beginTime: string
  finishData: string
  finishTime: string
}

const afterDateTime = ref<afterDateTimeType>({
  beginDate: '',
  beginTime: '',
  finishData: '',
  finishTime: ''
})

const initDetailFunc = () => {
  showVoteData.value = props.voteData
  showQuestionData.value = props.questionData

  initBeginDate = showVoteData.value.voteBeginDate
    .toString()
    .split('T')[0]
    .replaceAll('-', '/')
  initBeginTime = showVoteData.value.voteBeginDate.toString().split('T')[1]
  initFinishData = showVoteData.value.voteEndDate
    .toString()
    .split('T')[0]
    .replaceAll('-', '/')
  initFinishTime = showVoteData.value.voteEndDate.toString().split('T')[1]

  editMode.value = false
  editBtnLabel.value = '수정하기'
}

const beginFinishUpdate = (beginFinish: string, dateTime: string) => {
  if (dateTime == 'DATE') {
    if (beginFinish == 'BEGIN') {
      afterDateTime.value.beginDate = initBeginDate
    } else {
      afterDateTime.value.finishData = initFinishData
    }
  } else if (beginFinish == 'BEGIN') {
      afterDateTime.value.beginTime = initBeginTime
    } else {
      afterDateTime.value.finishTime = initFinishTime
    }
}

const beginDateLimitFn = (date: string) => {
  const chkFinDate: string = afterDateTime.value.finishData
  return (
    date <=
    (chkFinDate == '' || chkFinDate == undefined || chkFinDate == null
      ? initFinishData
      : chkFinDate)
  )
}

const finishDateLimitFn = (date: string) => {
  const chkStrDate: string = afterDateTime.value.beginDate
  return (
    date >=
    (chkStrDate == '' || chkStrDate == undefined || chkStrDate == null
      ? initBeginDate
      : chkStrDate)
  )
}

const settingDateTime = (
  val: string,
  dateTime: string,
  beginFinish: string
) => {
  const nowDate = new Date()
  const nowTime: string = nowDate.getHours() + ':' + nowDate.getMinutes()
  if (showVoteData.value) {
    if (dateTime == 'DATE' && beginFinish == 'BEGIN') {
      showVoteData.value.voteBeginDate =
        val.replaceAll('/', '-') + 'T' + nowTime + ':00.000'
    } else if (dateTime == 'DATE' && beginFinish == 'FINISH') {
      showVoteData.value.voteEndDate =
        val.replaceAll('/', '-') + 'T' + nowTime + ':00.000'
    } else if (dateTime == 'TIME' && beginFinish == 'BEGIN') {
      showVoteData.value.voteBeginDate =
        showVoteData.value.voteBeginDate.toString().split('T')[0] +
        'T' +
        val +
        ':00.000'
    } else if (dateTime == 'TIME' && beginFinish == 'FINISH') {
      showVoteData.value.voteEndDate =
        showVoteData.value.voteEndDate.toString().split('T')[0] +
        'T' +
        val +
        ':00.000'
    }
  }
}

const setEditMode = () => {
  if (editBtnLabel.value == '수정하기') {
    editMode.value = true
    editBtnLabel.value = '확인'
    isEditConfirm.value = false
  } else {
    const chkVoteIem: QuestionDetailDataType[] = showQuestionData.value
    let chkBoolean: boolean = false
    chkVoteIem.forEach((qes) => {
      if (qes.voteIemResponseList.length == 0) {
        chkBoolean = true
      }
    })

    if (chkBoolean) {
      $q.dialog({
        title: '알림',
        message: '질문은 최소 한개가 존재해야 합니다.'
      })
      return false
    } else {
      isEditConfirm.value = true
    }
  }
}

const addVoteItemData = ref<VoteItemDetailDataType>({
  itemSsno: 0,
  itemName: '',
  questionSsno: 0,
  voteSsno: 0
})

const addTempleteClose = ref<boolean>(false)
const addVoteItem = (voteSsno: number, questionSsno: number) => {
  const item_id = addVoteItemData.value.itemSsno
  const item_name = addVoteItemData.value.itemName
  if (
    item_id == 0 ||
    item_id == undefined ||
    item_name == '' ||
    item_name == undefined
  ) {
    $q.dialog({
      title: '알림',
      message: '[추가할 항목과 이름을 작성해 주세요.]'
    })
    return false
  }

  const qestnList = showQuestionData.value
  qestnList.forEach((qes) => {
    if (qes.voteSsno == voteSsno && qes.questionSsno == questionSsno) {
      qes.voteIemResponseList.push({
        itemSsno: addVoteItemData.value.itemSsno,
        itemName: addVoteItemData.value.itemName
      })
    }
  })

  showQuestionData.value = qestnList
  addVoteItemData.value.itemSsno = 0
  addVoteItemData.value.itemName = ''
  addTempleteClose.value = true
}

const delTempleteClose = ref<boolean>(false)
const delVoteItem = (
  voteSsno: number,
  questionSsno: number,
  itemSsno: number
) => {
  const qestnList = showQuestionData.value
  qestnList.forEach((qes) => {
    if (qes.voteSsno == voteSsno && qes.questionSsno == questionSsno) {
      if (qes.voteIemResponseList.length <= 1) {
        $q.dialog({
          title: '알림',
          message: '항목은 최소 한개가 존재해야 합니다.'
        })
        return false
      } else {
        qes.voteIemResponseList = qes.voteIemResponseList.filter((iem) => {
          if (iem.itemSsno != itemSsno) {return iem}
        })
      }
    }
  })
  showQuestionData.value = []
  showQuestionData.value = qestnList
  delTempleteClose.value = true
}

const addQuestion = () => {
  const voteNo: number = props.voteData.voteSsno
  const qestnList = showQuestionData.value
  const tempSsno: number = qestnList[qestnList.length - 1].questionSsno + 1
  qestnList.push({
    questionSsno: tempSsno,
    voteSsno: voteNo,
    questionContents: '질문을 입력해주세요.',
    compoundNumberChoiceAlternative: 'N',
    voteIemResponseList: [
      // {
      //   itemSsno:'0',
      //   itemName:'미입력'
      // }
    ]
  })
  showQuestionData.value = qestnList
}

const isDelQuestion = ref<boolean>(false)
const delQuestion = (voteSsno: number, questionSsno: number) => {
  let qestnList = showQuestionData.value
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
  showQuestionData.value = []
  showQuestionData.value = qestnList
  isDelQuestion.value = true
}

const emits = defineEmits(['chgShowVoteDetail'])

const editVoteDetail = async () => {
  loading.show()
  const editVoteData = showVoteData.value
  const editQuestionData = showQuestionData.value
  const getKindName =
    showVoteData.value !== undefined ? showVoteData.value.voteKindName : ''
  const codeData: kindCodeType[] = props.codeData
  let setKindCode: string = ''
  codeData.forEach((el) => {
    if (el.codeName == getKindName) {
      setKindCode = el.code
    }
  })

  let reqData = {}
  if (editVoteData) {
    const qestnReqList: any = []
    editQuestionData.forEach((qes) => {
      const voteIemReqList: any = []
      qes.voteIemResponseList.forEach((iem) => {
        voteIemReqList.push(iem)
      })
      qestnReqList.push({
        questionSsno: qes.questionSsno,
        voteSsno: qes.voteSsno,
        questionContents: qes.questionContents,
        compoundNumberChoiceAlternative: qes.compoundNumberChoiceAlternative,
        voteIemRequestList: voteIemReqList
      })
    })

    reqData = {
      voteSsno: editVoteData.voteSsno,
      voteKindCode: setKindCode,
      voteKindName: getKindName,
      voteSubject: editVoteData.voteSubject,
      anonymityVoteAlternative: editVoteData.anonymityVoteAlternative,
      anonymityVoteAlternativeBoo:
        editVoteData.anonymityVoteAlternative == 'N' ? false : true,
      voteBeginDate: dateTimeFormatter(editVoteData.voteBeginDate),
      voteEndDate: dateTimeFormatter(editVoteData.voteEndDate),
      voteDeleteAlternative: editVoteData.voteDeleteAlternative,
      registUsrId: editVoteData.registUsrId,
      registDt: editVoteData.registDt,
      updtUsrId: editVoteData.updtUsrId,
      updtDt: editVoteData.updtDt,
      qestnRequestList: qestnReqList
    }
  }
  console.log('############ reqData : ', reqData)
  await $fetch<ApiResponse<VoteDetailDataType>>(
    '/playground/api/vote/modifyVote',
    {
      method: 'PUT',
      body: JSON.stringify(reqData)
    }
  )
    .then((res) => {
      editMode.value = false // 이동시키기
      editBtnLabel.value = '수정하기' // 이동시키기
      isEditConfirm.value = false
      emits('chgShowVoteDetail', false)
      loading.hide()
    })
    .catch((error) => {
      console.error(error)
    })
}

const dateTimeFormatter = (dt: string) => {
  if (dt.length <= 19) {
    //  2024-05-15T17:06:00
    return (
      dt.toString().split('T')[0] + ' ' + dt.toString().split('T')[1] + '.000'
    )
  } else {
    return dt.toString().split('T')[0] + ' ' + dt.toString().split('T')[1]
  }
}

const resetAddVoteItemData = () => {
  addVoteItemData.value.itemSsno = 0
  addVoteItemData.value.itemName = ''
}

defineExpose({
  initDetailFunc
})
</script>
<style lang="scss" scoped>
.my-card {
  width: 100%;
  .select {
    width: 200%;
  }
}
</style>
