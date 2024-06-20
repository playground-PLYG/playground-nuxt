<template>
  <!-- notice dialogRef here -->
  <q-form ref="dialogRef" @hide="">
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
                :readonly="true"
                v-model="showVoteData.voteSubject"
                style="font-size: xx-large"
              />
            </div>
          </q-card-section>
          <q-card-actions>
            <q-chip outline color="primary" icon="event">
              시작일시 : {{ showVoteData.voteBeginDate }}
            </q-chip>
            <div style="margin-left: 50px">
              <q-checkbox
                color="black"
                :disable="true"
                v-model="showVoteData.anonymityVoteAlternativeBoo"
                label="익명투표여부"
              />
            </div>
          </q-card-actions>
          <q-card-actions>
            <q-chip outline color="primary" icon="event">
              종료일시 : {{ showVoteData.voteEndDate }}
            </q-chip>
            <div style="margin-left: 50px">
              <!-- :options="codeName" -->
              <q-select
                outlined
                v-model="showVoteData.voteKindName"
                label="투표종류"
                round
                dense
                class="select"
                flat
                :readonly="true"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
      <div
        class="q-pa-md"
        v-for="(qestn, index) in showVoteData.qestnResponseList"
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
                :name="'qc' + index"
                v-model="qestn.questionContents"
                style="font-size: x-large"
                :dense="true"
                :readonly="true"
              />
            </div>
          </q-card-section>
          <q-list>
            <q-item v-for="iem in qestn.voteIemResponseList">
              <q-item-section avatar>
                <q-radio
                  v-model="selectVal[index]"
                  :val="iem.itemSsno"
                  color="light-blue-7"
                  :label="iem.itemName"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
      <div class="q-pa-md q-gutter-sm" align="center">
        <q-btn
          class="glossy"
          rounded
          color="blue-grey-5"
          label="투표하기"
          icon="cloud_upload"
          @click="settingAnswer"
        />
        <q-btn
          class="glossy"
          rounded
          color="blue-grey-5"
          label="닫기 (홈으로)"
          @click="router.push('/')"
        />
      </div>
    </q-card>
  </q-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../interface/server'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore'

const { loading } = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const voteSsno = router.currentRoute.value.query.ssno
const $q = useQuasar()

onMounted(() => {
  console.group('##### 로그인 정보 확인 #####')
  console.log('mberId : ', authStore.mberId)
  console.log('token : ', authStore.token)
  console.log('isLogin : ', authStore.isLogin)
  console.groupEnd()

  if (authStore?.isLogin) {
    isDuplicateVote()
  } else {
    $q.dialog({
      title: '알림',
      message: '로그인 후 투표가 가능합니다.'
    })
    router.push('/login?redirectUrl=vote' + location.search)
  }
})

interface VoteDetailDataType {
  voteSsno: number
  voteKindCode: string
  voteKindName: string
  voteSubject: string
  anonymityVoteAlternative: string
  anonymityVoteAlternativeBoo: boolean
  voteBeginDate: string
  voteEndDate: string
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

let selectVal = ref<String[]>([''])

let showVoteData = ref<VoteDetailDataType>({
  voteSsno: 0,
  voteKindCode: '',
  voteKindName: '',
  voteSubject: '',
  anonymityVoteAlternative: 'N',
  anonymityVoteAlternativeBoo: false,
  voteBeginDate: '',
  voteEndDate: '',
  qestnResponseList: []
})

const isDuplicateVote = async () => {
  loading.show()
  await $fetch<ApiResponse<Boolean>>(
    '/playground/public/voteAnswer/isDuplicateVote',
    {
      method: 'POST',
      body: JSON.stringify({
        voteSsno: voteSsno,
        answerUserId: authStore.mberId
      })
    }
  )
    .then((result) => {
      console.log('######### isDuplicateVote : result : ', result.data) // true(중복투표) false(처음투표)
      if (result.data) {
        $q.dialog({
          title: '알림',
          message: '이미 투표를 완료 하셨습니다.\n 홈으로 이동합니다.'
        })
        router.push('/')
      } else {
        setKindCode()
      }
      loading.hide()
    })
    .catch((error) => {
      console.error(error)
    })
}

let kindCode = ref<kindCodeType[]>([])
let kindCodeNm = ref<String[]>([])
const setKindCode = async () => {
  loading.show()
  await $fetch<ApiResponse<kindCodeType[]>>(
    '/playground/public/code/getCodeGroupList',
    {
      method: 'POST',
      body: JSON.stringify({
        code: '',
        codeName: '',
        upperCode: 'VOTE_KND_CODE'
      })
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
      setVoteDetail()
    })
    .catch((error) => {
      console.error(error)
    })
}

const setVoteDetail = async () => {
  await $fetch<ApiResponse<VoteDetailDataType>>(
    '/playground/public/voteAnswer/getVoteDetail',
    {
      method: 'POST',
      body: JSON.stringify({
        voteSsno: voteSsno
      })
    }
  )
    .then((res) => {
      let resData = res.data
      let kindNm: string = ''
      kindCode.value.forEach((code) => {
        if (resData.voteKindCode == code.code) {
          kindNm = code.codeName
        }
      })

      if (
        resData.voteSsno == null ||
        resData.voteSsno == undefined ||
        resData.voteSsno == 0
      ) {
        loading.hide()
        router.push('/')
      } else {
        showVoteData.value = {
          voteSsno: resData.voteSsno,
          voteKindCode: resData.voteKindCode,
          voteKindName: kindNm,
          voteSubject: resData.voteSubject,
          anonymityVoteAlternative: resData.anonymityVoteAlternative,
          anonymityVoteAlternativeBoo:
            resData.anonymityVoteAlternative == 'N' ? false : true,
          voteBeginDate: dateTimeFormatter(resData.voteBeginDate),
          voteEndDate: dateTimeFormatter(resData.voteEndDate),
          qestnResponseList: resData.qestnResponseList
        }

        console.log('init showVoteData.value ######### : ', showVoteData.value)

        loading.hide()
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

const dateTimeFormatter = (dt: string) => {
  //"yyyy-MM-ddTHH:mm:ss.SSS"
  let dtTimeHH = dt?.toString().split('T')[1].substring(0, 2)
  let amPm = 0 <= Number(dtTimeHH) && Number(dtTimeHH) < 12 ? 'AM' : 'PM'
  return (
    dt?.toString().split('T')[0] +
    '  ' +
    amPm +
    ' ' +
    dt?.toString().split('T')[1].substring(0, 5)
  )
}

interface answerType {
  voteSsno: number
  questionSsno: number
  itemSsno: number
  answerUserId: string
  answerContents?: string
}

interface answerResponseType extends answerType {
  answerSsno: number
}

const settingAnswer = () => {
  console.log('############### settingAnswer #################')
  console.log('## settingAnswer ####### : select :', showVoteData.value)
  let voteData = showVoteData.value
  let insertVoteResult: answerType[] = []

  console.log('## settingAnswer ####### : selectVal :', selectVal.value)
  let selectedData = selectVal.value

  voteData.qestnResponseList.forEach((qestn, index) => {
    let selectIemSsno: number = 0
    selectedData.forEach((sel, i) => {
      if (index == i) {
        selectIemSsno = Number(sel)
      }
    })

    insertVoteResult.push({
      voteSsno: qestn.voteSsno,
      questionSsno: qestn.questionSsno,
      itemSsno: selectIemSsno,
      answerUserId: authStore.mberId, // 이거 어떻게 해야 할지 생각...
      answerContents: String(selectIemSsno) // 임시로 item Id 넣어줌
    })
  })
  addAnswer(insertVoteResult)
}

const addAnswer = async (resultList: answerType[]) => {
  console.log('############### addAnswer #################')
  console.log('## addAnswer ####### : resultList :', resultList)
  loading.show()
  await $fetch<ApiResponse<answerResponseType>>(
    '/playground/public/voteAnswer/addAnswer',
    {
      method: 'POST',
      body: JSON.stringify(resultList)
    }
  )
    .then((res) => {
      console.log('##### addAnswer res :', res.data)
      if (res.data) {
        $q.dialog({
          title: '알림',
          message: '투표가 완료 되었습니다.'
        })
        router.push('/vote-manage')
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
  loading.hide()
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
