<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="chat" /> {{ resultList.voteSubject }}
      </div>
    </div>

    <q-separator inset />

    <div class="q-pa-md" v-if="createdYn">
      <q-card class="my-card">
        <q-card-section class="bg-primary text-white">
          <div
            class="q-gutter-y-md column"
            style="width: 90%; display: inline-flex"
          >
            {{ resultList.qestnName }}
            <br />
            투표기간 :
            {{
              dateUtil.getformatString(
                resultList.voteBeginDate,
                'YYYY-MM-DD HH:mm'
              )
            }}
            ~
            {{
              dateUtil.getformatString(
                resultList.voteEndDate,
                'YYYY-MM-DD HH:mm'
              )
            }}
          </div>
        </q-card-section>
        <q-list>
          <q-item
            v-for="(iem, ind) in resultList.voteRstrntIemList"
            :key="iem.iemSsno"
            tag="label"
            v-ripple
          >
            <q-item-section avatar>
              <q-radio
                v-model="selectedRadioValue"
                v-if="!compnoYn"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :val="iem.iemSsno"
                :label="iem.iemName"
                color="light-blue-7"
                :disable="false"
              />
              <q-checkbox
                v-model="selectedCheckValue"
                v-if="compnoYn"
                :val="iem.iemSsno"
                :label="iem.iemName"
                color="light-blue-7"
                :disable="false"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
    <div align="center" v-if="createdYn">
      <q-btn
        class="glossy"
        rounded
        color="deep-orange"
        label="투표하기"
        @click="fn_voteCheck"
      />
    </div>
    <div align="center" v-if="!createdYn">
      <q-btn
        class="glossy"
        rounded
        color="deep-orange"
        label="투표생성"
        @click="fn_createLunchVote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiResponse, IFetchOptions } from '~/interface/server'
import { useAuthStore } from '~/stores/useAuthStore'
import { dateUtil } from '~/utils/dateUtil'

const { loading } = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

interface Data {
  voteSsno: number
  voteKindCode: string
  voteSubject: string
  anonymityVoteYn: string
  voteBeginDate: string
  voteEndDate: string
  voteDeleteYn: string
  qestnSsno: number
  qestnName: string
  compnoChoiseYn: string
  voteRstrntIemList: [
    {
      iemSsno: number
      iemName: string
    }
  ]
}

interface answerType {
  voteSsno: number
  questionSsno: number
  itemSsno: number
  answerUserId: string
  answerContents?: string
}

interface answerResponseType {
  answerSsno: number
}

let resultList = ref<Data>({
  voteSsno: -1,
  voteKindCode: '',
  voteSubject: '',
  anonymityVoteYn: '',
  voteBeginDate: '',
  voteEndDate: '',
  voteDeleteYn: '',
  qestnSsno: -1,
  qestnName: '',
  compnoChoiseYn: '',
  voteRstrntIemList: [
    {
      iemSsno: -1,
      iemName: ''
    }
  ]
})

let selectedRadioValue = ref<Number>()
let selectedCheckValue = ref<Number[]>([])

let createdYn = false //투표 생성 여부
let compnoYn = false // 복수선택 여부 (Y: true, N: false)
let annoymityYn = false // 익명투표 여부 (Y: true, N: false)

// 화면 mount 된 시점 조회
onMounted(() => {
  selectList()
})

const fn_createLunchVote = async () => {
  if (!authStore?.isLogin) {
    $q.dialog({
      title: '알림',
      message: '로그인 후 투표생성이 가능합니다.'
    }).onOk(() => {
      router.push('/login?redirectUrl=lunch-vote')
      return
    })
    return
  }

  loading.show()
  await $fetch<ApiResponse<Data>>(
    '/playground/api/voteRstrnt/addTodayLunchVote',
    {
      method: 'POST'
    }
  )
    .then((result) => {
      if (result.resultCode == '0000') {
        selectList()
      }
    })
    .finally(() => {
      loading.hide()
    })
}

// 당일 점심메뉴 조회
const selectList = async () => {
  loading.show()
  const result = await $fetch<ApiResponse<Data[]>>(
    '/playground/api/voteRstrnt/getVoteRstrntList',
    {
      method: 'POST'
    }
  )
  loading.hide()

  if (result.data[0] == undefined) {
    createdYn = false
    resultList.value.voteSubject = '투표'
  } else {
    createdYn = true
    resultList.value = result.data[0]
    console.log(resultList.value)

    if (resultList.value.compnoChoiseYn == 'N') {
      compnoYn = false
    } else {
      compnoYn = true
    }

    if (resultList.value.anonymityVoteYn == 'N') {
      annoymityYn = false
    } else {
      annoymityYn = true
    }
  }
}

//투표하기
let insertVoteResult: answerType[] = []

const fn_voteCheck = () => {
  if (authStore?.isLogin) {
    fn_isDuplicateVote()
  } else {
    $q.dialog({
      title: '알림',
      message: '로그인 후 투표가 가능합니다.'
    }).onOk(() => {
      router.push('/login?redirectUrl=lunch-vote')
      return
    })
  }
}

const fn_makeData = () => {
  if (resultList.value.compnoChoiseYn == 'N') {
    insertVoteResult = []
    resultList.value.voteRstrntIemList.forEach((val, idx) => {
      if (val.iemSsno == selectedRadioValue.value) {
        insertVoteResult.push({
          voteSsno: resultList.value.voteSsno,
          questionSsno: resultList.value.qestnSsno,
          itemSsno: val.iemSsno,
          answerUserId: !annoymityYn ? authStore.mberId : 'anonymous',
          answerContents: val.iemName
        })
      }
    })
  } else {
    insertVoteResult = []
    let filterList = resultList.value.voteRstrntIemList.filter((x) =>
      selectedCheckValue.value.includes(x.iemSsno)
    )
    filterList.forEach((val, idx) => {
      insertVoteResult.push({
        voteSsno: resultList.value.voteSsno,
        questionSsno: resultList.value.qestnSsno,
        itemSsno: val.iemSsno,
        answerUserId: !annoymityYn ? authStore.mberId : 'anonymous',
        answerContents: val.iemName
      })
    })
  }
}

const fn_voteAnswer = async () => {
  fn_makeData()

  await $fetch<ApiResponse<answerResponseType>>(
    '/playground/public/voteAnswer/addAnswer',
    {
      method: 'POST',
      body: JSON.stringify(insertVoteResult)
    }
  )
    .then((res) => {
      console.log('##### addAnswer res :', res.data)
      if (res.data) {
        $q.dialog({
          title: '알림',
          message: '투표가 완료 되었습니다.'
        })
      } else {
        $q.dialog({
          title: '알림',
          message: '투표 중 오류가 발생했습니다.\n다시 시도해주세요.'
        })
      }
    })
    .catch((error) => {
      console.error(error)
    })
    .finally(() => {
      loading.hide()
    })
}

const fn_isDuplicateVote = async () => {
  loading.show()
  await $fetch<ApiResponse<Boolean>>(
    '/playground/public/voteAnswer/isDuplicateVote',
    {
      method: 'POST',
      body: JSON.stringify({
        voteSsno: resultList.value.voteSsno,
        answerUserId: authStore.mberId
      })
    }
  )
    .then((result) => {
      console.log('######### isDuplicateVote : result : ', result.data) // true(중복투표) false(처음투표)
      loading.hide()
      if (result.data) {
        $q.dialog({
          title: '알림',
          message: '이미 투표를 완료 하셨습니다.'
        })
      } else {
        fn_voteAnswer()
      }
    })
    .catch((error) => {
      console.error(error)
    })
    .finally(() => {
      loading.hide()
    })
}
</script>
