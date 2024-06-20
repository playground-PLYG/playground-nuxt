<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="chat" /> 투표관리</div>
    </div>
    <div class="search">
      <q-form ref="searchForm" @submit="selectVoteList" @reset="onReset">
        <q-input
          outlined
          clearable
          v-model="searchParam.voteSubject"
          label="투표제목"
          round
          dense
          flat
          class="input"
        />
        <q-select
          outlined
          clearable
          v-model="searchParam.voteKindCode"
          :options="kindCodeNm"
          label="투표종류"
          round
          dense
          flat
          class="select"
        />
        <q-checkbox
          v-model="searchParam.anonymityVoteAlternativeBoo"
          label="익명투표여부"
          class="checkbox"
        />
        <q-input
          outlined
          readonly
          v-model="searchParam.voteBeginDate"
          label="투표시작일자"
          round
          dense
          flat
          class="calendar"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="searchParam.voteBeginDate = ''"
              class="cursor-pointer"
            />
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="searchParam.voteBeginDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        ~
        <q-input
          outlined
          readonly
          v-model="searchParam.voteEndDate"
          label="투표종료일자"
          round
          dense
          flat
          class="calendar"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="searchParam.voteEndDate = ''"
              class="cursor-pointer"
            />
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="searchParam.voteEndDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn
          push
          class="button"
          color="green-7"
          label="초기화"
          type="reset"
        />
      </q-form>
    </div>
    <div class="table">
      <q-table
        :rows="voteList"
        :columns="columns"
        row-key="voteSsno"
        v-model:selected="selected"
        selection="single"
        :rows-per-page-options="[0]"
        @row-click="onClickVote"
      />
    </div>
    <div class="proc">
      <q-btn
        push
        class="float-left"
        color="primary"
        label="등록"
        @click="showVoteRegistForm = true"
      />

      <q-btn
        push
        class="float-right"
        color="red"
        label="투표결과보기"
        @click="onClickResult"
      />
    </div>
  </div>

  <voteDetail
    ref="voteDetailComponent"
    v-model="showVoteDetail"
    :vote-data="selectedVote"
    :question-data="selectedQestn"
    :code-data="kindCode"
    :code-name="kindCodeNm"
    @chgShowVoteDetail="chgShowVoteDetail"
  />

  <voteRegistForm
    ref="registForm"
    v-model="showVoteRegistForm"
    :code-data="kindCode"
    :code-name="kindCodeNm"
    @chgShowVoteRegist="chgShowVoteRegist"
  />

  <voteStatistics ref="statisticsForm" v-model="showVoteStatistics" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type ApiResponse } from '../../interface/server'
import { useQuasar, type QTableProps } from 'quasar'
import voteDetail from './vote-detail/voteDetail.vue'
import voteRegistForm from './vote-detail/voteRegistForm.vue'
import voteStatistics from './statistics/voteStatistics.vue'
import { useRouter } from 'vue-router'
// import { dateUtil } from '~/utils/dateUtil'
const { loading } = useQuasar()
const $q = useQuasar()

interface kindCodeType {
  code: string
  codeName: string
  upperCode: string
}

let kindCode = ref<kindCodeType[]>([])
let kindCodeNm = ref<String[]>([])
let searchCodeParam = ref<kindCodeType>({
  code: '',
  codeName: '',
  upperCode: 'VOTE_KND_CODE'
})

const setKindCode = async () => {
  await $fetch<ApiResponse<kindCodeType[]>>(
    '/playground/public/code/getCodeGroupList',
    {
      method: 'POST',
      body: JSON.stringify(searchCodeParam.value)
    }
  )
    .then((result) => {
      let resData = result.data
      resData.forEach((item) => {
        const kindItem: kindCodeType = {
          code: item.code,
          codeName: item.codeName,
          upperCode: item.upperCode
        }
        kindCode.value.push(kindItem)
        kindCodeNm.value.push(item.codeName)
      })

      selectAllVote()
    })
    .catch((error) => {
      console.error(error)
    })
}

interface ResponseData {
  voteIndex: number
  voteSsno: number
  voteKindCode: string
  voteSubject: string
  anonymityVoteAlternative: string
  voteBeginDate: string
  voteEndDate: string
  voteDeleteAlternative: string
  registUsrId: string
  registDt: string
  updtUsrId: string
  updtDt: string
}

interface pageableData {
  content: ResponseData[]
  number: number
  numberOfElements: number
  pageable: pageableDataType[]
  size: number
  totalElements: number
  totalPages: number
}

interface pageableDataType {
  offset: number
  pageNumber: number
  pageSize: number
}

interface Form {
  voteKindCode: string
  voteSubject: string
  anonymityVoteAlternative: string
  voteBeginDate: string
  voteEndDate: string
  voteDeleteAlternative: string
}

let param = ref<Form>({
  voteKindCode: '',
  voteSubject: '',
  anonymityVoteAlternative: '',
  voteBeginDate: '',
  voteEndDate: '',
  voteDeleteAlternative: ''
})

let voteList = ref<ResponseData[]>([])

const selectAllVote = async () => {
  await $fetch<ApiResponse<pageableData>>(
    '/playground/api/vote/getVotePageList',
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    }
  )
    .then((res) => {
      let resData = res.data.content
      resData.forEach((item: ResponseData, index: number) => {
        let kindNm: string = ''
        kindCode.value.forEach((code) => {
          if (item.voteKindCode == code.code) {
            kindNm = code.codeName
          }
        })

        const voteItem: ResponseData = {
          voteIndex: index + 1,
          voteSsno: item.voteSsno,
          voteKindCode: kindNm == '' ? item.voteKindCode : kindNm,
          voteSubject: item.voteSubject,
          anonymityVoteAlternative: item.anonymityVoteAlternative,
          voteBeginDate: settingDate(item.voteBeginDate),
          voteEndDate: settingDate(item.voteEndDate),
          voteDeleteAlternative: item.voteDeleteAlternative,
          registUsrId: item.registUsrId,
          registDt: settingDate(item.registDt),
          updtUsrId: item.updtUsrId,
          updtDt: settingDate(item.updtDt)
        }
        voteList.value.push(voteItem)
      })
    })
    .catch((error) => {
      console.error(error)
    })
}

const settingDate = (el: string) => {
  return (
    el.toString().split('T')[0] +
    ' ' +
    el.toString().split('T')[1].split('.')[0]
  )
}

interface searchParamType {
  voteSubject: string
  voteKindCode: string
  anonymityVoteAlternativeBoo: boolean
  anonymityVoteAlternative: string
  voteBeginDate: string
  voteEndDate: string
}
let searchParam = ref<searchParamType>({
  voteSubject: '',
  voteKindCode: '',
  anonymityVoteAlternativeBoo: false,
  anonymityVoteAlternative: '',
  voteBeginDate: '',
  voteEndDate: ''
})

let selected = ref<any>()

const columns = ref<QTableProps['columns']>([
  { name: 'voteIndex', label: '번호', field: 'voteIndex', align: 'center' },
  //  { name: 'voteSsno', label: '투표번호', field: 'voteSsno', align: 'center', style: 'display:none'  },
  {
    name: 'voteKindCode',
    label: '투표종류',
    field: 'voteKindCode',
    align: 'center'
  },
  {
    name: 'voteSubject',
    label: '투표제목',
    field: 'voteSubject',
    align: 'center'
  },
  {
    name: 'anonymityVoteAlternative',
    label: '익명투표여부',
    field: 'anonymityVoteAlternative',
    align: 'center'
  },
  {
    name: 'voteBeginDate',
    label: '투표시작일시',
    field: 'voteBeginDate',
    align: 'center'
  },
  {
    name: 'voteEndDate',
    label: '투표종료일시',
    field: 'voteEndDate',
    align: 'center'
  },
  {
    name: 'voteDeleteAlternative',
    label: '투표삭제여부',
    field: 'voteDeleteAlternative',
    align: 'center'
  },
  {
    name: 'registUsrId',
    label: '등록자',
    field: 'registUsrId',
    align: 'center'
  },
  { name: 'registDt', label: '등록일시', field: 'registDt', align: 'center' },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'center' },
  { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'center' }
])

onMounted(() => {
  setKindCode()
})

const selectVoteList = async () => {
  let kindId: string = ''
  kindCode.value.forEach((code) => {
    if (searchParam.value.voteKindCode == code.codeName) {
      kindId = code.code
    }
  })

  let srchParam = ref<Form>({
    voteKindCode: kindId,
    voteSubject: searchParam.value.voteSubject,
    anonymityVoteAlternative: searchParam.value.anonymityVoteAlternativeBoo
      ? 'Y'
      : 'N',
    voteBeginDate: searchParam.value.voteBeginDate.replaceAll('/', '-'),
    voteEndDate: searchParam.value.voteEndDate.replaceAll('/', '-'),
    voteDeleteAlternative: ''
  })
  await $fetch<ApiResponse<pageableData>>(
    '/playground/api/vote/getVotePageList',
    {
      method: 'POST',
      body: JSON.stringify(srchParam.value)
    }
  )
    .then((res) => {
      loading.show()
      voteList.value = []
      let resData = res.data.content
      resData.forEach((item: ResponseData, index: number) => {
        let kindNm: string = ''
        kindCode.value.forEach((code) => {
          if (item.voteKindCode == code.code) {
            kindNm = code.codeName
          }
        })

        const voteItem: ResponseData = {
          voteIndex: index + 1,
          voteSsno: item.voteSsno,
          voteKindCode: kindNm == '' ? item.voteKindCode : kindNm,
          voteSubject: item.voteSubject,
          anonymityVoteAlternative: item.anonymityVoteAlternative,
          voteBeginDate: settingDate(item.voteBeginDate),
          voteEndDate: settingDate(item.voteEndDate),
          voteDeleteAlternative: item.voteDeleteAlternative,
          registUsrId: item.registUsrId,
          registDt: settingDate(item.registDt),
          updtUsrId: item.updtUsrId,
          updtDt: settingDate(item.updtDt)
        }
        voteList.value.push(voteItem)
      })
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const onReset = () => {
  searchParam.value = {
    voteSubject: '',
    voteKindCode: '',
    anonymityVoteAlternativeBoo: false,
    anonymityVoteAlternative: '',
    voteBeginDate: '',
    voteEndDate: ''
  }
}

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

let showVoteDetail = ref<boolean>(false)
let selectedVote = ref<VoteDetailDataType>({
  voteSsno: 0,
  voteKindCode: '',
  voteKindName: '',
  voteSubject: '',
  anonymityVoteAlternative: '',
  anonymityVoteAlternativeBoo: false,
  voteBeginDate: '',
  voteEndDate: '',
  voteDeleteAlternative: '',
  registUsrId: '',
  registDt: '',
  updtUsrId: '',
  updtDt: '',
  excuteResult: '',
  qestnResponseList: []
})

let selectedQestn = ref<QuestionDetailDataType[]>([])

const onClickVote = (evt: Object, row: ResponseData, index: number) => {
  getVoteDetail(row.voteSsno, row.voteKindCode)
}

const voteDetailComponent = ref()

const getVoteDetail = async (ssno: number, kindCdNm: string) => {
  await $fetch<ApiResponse<VoteDetailDataType>>(
    '/playground/api/vote/getVoteDetail',
    {
      method: 'POST',
      body: JSON.stringify({
        voteSsno: ssno
      })
    }
  )
    .then((res) => {
      let resData = res.data

      selectedVote.value = {
        voteSsno: resData.voteSsno,
        voteKindCode: resData.voteKindCode,
        voteKindName: kindCdNm, // 투표종류 한글명
        voteSubject: resData.voteSubject,
        anonymityVoteAlternative: resData.anonymityVoteAlternative,
        anonymityVoteAlternativeBoo:
          resData.anonymityVoteAlternative == 'N' ? false : true, // 익명여부 checkBox true, false 사용
        voteBeginDate: resData.voteBeginDate,
        voteEndDate: resData.voteEndDate,
        voteDeleteAlternative: resData.voteDeleteAlternative,
        registUsrId: resData.registUsrId,
        registDt: resData.registDt,
        updtUsrId: resData.updtUsrId,
        updtDt: resData.updtDt,
        excuteResult: resData.excuteResult,
        qestnResponseList: resData.qestnResponseList
      }
      selectedQestn.value = selectedVote.value.qestnResponseList
    })
    .then(() => {
      voteDetailComponent.value.initDetailFunc()
      showVoteDetail.value = true
    })
    .catch((error) => {
      console.error(error)
    })
}

const router = useRouter()
const chgShowVoteDetail = (call: boolean) => {
  showVoteDetail.value = call
  router.go(0)
}

let showVoteRegistForm = ref<boolean>(false)
const chgShowVoteRegist = (call: boolean) => {
  showVoteRegistForm.value = call
  router.go(0)
}

const onClickResult = () => {
  if (selected.value != undefined && selected.value.length == 1) {
    getVoteResult(selected.value[0])
  } else {
    $q.dialog({
      title: '알림',
      message: '결과를 확인할 투표를 한가지 선택해 주세요.'
    })
    return false
  }
}

let showVoteStatistics = ref<boolean>(false)
const statisticsForm = ref()

const getVoteResult = (row: ResponseData) => {
  console.log('getVoteResult ::: row : ', row)
  /* 이 로직은 지울지 말지 판단이 필요하여 일단 주석만 해둔다
  let dateDiff = new Date(row.voteEndDate).getTime() - new Date().getTime()
  if (dateDiff >= 0) {
    $q.dialog({
      title: '알림',
      message: '투표가 종류된 후에 결과를 확인 할 수 있습니다.'
    })
      .onOk(() => {})
      .onCancel(() => {})
      .onDismiss(() => {
        //I am triggered on both OK and Cancel
      })
  } else {
    console.log('go Vote Result')
    showVoteStatistics.value = true
    statisticsForm.value.initFunc(row.voteSsno, row.voteSubject)
  }
    */
  showVoteStatistics.value = true
  statisticsForm.value.initFunc(row.voteSsno, row.voteSubject)
}
</script>
<style lang="scss" scoped>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}

.search {
  margin-top: 2rem;
  .select {
    display: inline-block;
    vertical-align: middle;
    width: 20%;
    padding-right: 0.5rem;
  }
  .input {
    display: inline-block;
    vertical-align: middle;
    width: 15%;
    padding-right: 0.5rem;
  }
  .checkbox {
    padding-right: 0.5rem;
  }
  .calendar {
    display: inline-block;
    vertical-align: middle;
    width: 18%;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }
  .button {
    margin-right: 0.5rem;
  }
}

.table {
  margin-top: 1rem;
}

.proc {
  margin-top: 1rem;
  .button {
    margin-right: 0.5rem;
  }
  .buttonR {
    margin-left: 0.5rem;
    float: right;
  }
}
</style>
