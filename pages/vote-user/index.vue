<template>
  <!-- 메인 영역 start -->
  <div>
    <div v-show="isAllReady" class="mobile-content-area">
      <div class="text-h6 q-mb-sm q-pa-sm">
        {{ voteDetail.voteSubject }}
        <div class="row" style="font-size: small">
          <div class="q-ml-sm q-mr-sm">-</div>
          <div>{{ voteDetail.voteBeginDate }}</div>
          <div class="q-ml-sm q-mr-sm">~</div>
          <div>{{ voteDetail.voteEndDate }}</div>
        </div>
      </div>
      <div>
        <div
          v-for="(qestn, index) in voteDetail.voteQestnResponseList"
          :key="qestn.questionSsno"
        >
          <q-card class="q-mb-sm" flat bordered>
            <q-card-section>
              <q-badge
                v-if="qestn.anonymityVoteAlternative == 'Y'"
                color="negative"
                align="middle"
                class="q-mr-sm"
                >익명투표</q-badge
              >
              <q-badge
                v-if="qestn.compoundNumberChoiceAlternative == 'Y'"
                color="secondary"
                align="middle"
                >복수선택</q-badge
              >
              <div class="text-h6 q-mt-sm q-mb-sm">
                {{ qestn.questionContents }}
              </div>
              <q-list>
                <q-item
                  v-for="iem in qestn.voteQestnIemResponseList"
                  :key="iem.itemSsno"
                >
                  <q-item-section avatar>
                    <q-checkbox
                      v-if="qestn.compoundNumberChoiceAlternative == 'Y'"
                      v-model="checkIems"
                      :disable="isVoteComplete"
                      :val="iem.itemSsno"
                      :label="iem.itemName"
                    />

                    <q-radio
                      v-if="qestn.compoundNumberChoiceAlternative == 'N'"
                      v-model="selectIems[index]"
                      :val="qestn.questionSsno + '|' + iem.itemSsno"
                      :disable="isVoteComplete"
                      :label="iem.itemName"
                    />
                  </q-item-section>
                  <q-icon
                    v-if="qestn.voteKindCode == 'RST'"
                    size="20px"
                    name="search"
                    class="q-ml-auto"
                    @click="fn_openRstrntDetail(iem.itemIdentificationId)"
                  />
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row justify-start">
        <dk-btn
          v-show="showVotingBtn"
          push
          color="white"
          text-color="primary"
          label="투표하기"
          class="q-mt-sm"
          @click="fn_voting"
        />
        <dk-btn
          v-show="showResultBtn"
          push
          color="white"
          text-color="primary"
          label="결과"
          class="q-mt-sm q-ml-sm"
          @click="fn_showVoteResult"
        />
        <dk-btn
          v-show="showModifyBtn"
          push
          color="white"
          text-color="primary"
          label="수정"
          class="q-mt-sm q-ml-auto"
          @click="fn_goVoteModify"
        />
      </div>
      <div class="row justify-start q-mt-md">
        <dk-btn
          icon="list"
          push
          color="white"
          text-color="primary"
          label="투표목록"
          unelevated
          rounded
          style="width: 100%"
          @click="$router.push('/vote-list')"
        />
      </div>
    </div>

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
import { useAuthStore } from '../../stores/useAuthStore'
import { type ApiResponse } from '@/interface/server' //, type Code
//import { codeUtil } from '@/utils/code'
//import { imageUtil } from '~/utils/image'
import { dateUtil } from '~/utils/dateUtil'
import { commUtil } from '~/utils/comm'

const { loading } = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const initVoteSsno = router.currentRoute.value.query.ssno

onMounted(() => {
  console.group('##### 로그인 정보 확인 #####')
  console.log('mberId : ', authStore.mberId)
  console.log('token : ', authStore.token)
  console.log('isLogin : ', authStore.isLogin)
  console.groupEnd()
  if (authStore?.isLogin) {
    fn_getVoteDetail(Number(initVoteSsno))
  } else {
    commUtil.alert({
      message: '로그인 후 투표가 가능합니다.',
      callbackFn: fn_loginAlertCallBack
    })
  }
})

const fn_loginAlertCallBack = () => {
  router.push('/login?redirectUrl=vote-user' + location.search)
}

/* 투표 상세 */
interface VoteDetail {
  voteSsno: number
  voteSubject: string
  voteTransmissionAlternative: string
  voteTransmissionCode: string
  voteBeginDate: string
  voteEndDate: string
  voteExposureAlternative: string
  registUserId: string
  voteQestnResponseList: VoteQestn[] | []
}

/** 투표질문 상세 */
interface VoteQestn {
  voteSsno: number
  questionSsno: number
  voteKindCode: string
  questionContents: string
  anonymityVoteAlternative: string
  compoundNumberChoiceAlternative: string
  voteQestnIemResponseList: VoteQestnIem[] | []
}

/** 투표질문항목 상세 */
interface VoteQestnIem {
  voteSno: number
  questionSno: number
  itemSsno: number
  itemIdentificationId: string | ''
  itemName: string
}

const voteDetail = ref<VoteDetail>({
  voteSsno: 0,
  voteSubject: '',
  voteTransmissionAlternative: 'N',
  voteTransmissionCode: '',
  voteBeginDate: '',
  voteEndDate: '',
  voteExposureAlternative: 'N',
  registUserId: '',
  voteQestnResponseList: [
    {
      voteSsno: 0,
      questionSsno: 0,
      voteKindCode: '',
      questionContents: '',
      anonymityVoteAlternative: 'N',
      compoundNumberChoiceAlternative: 'N',
      voteQestnIemResponseList: [
        {
          voteSno: 0,
          questionSno: 0,
          itemSsno: 0,
          itemName: '',
          itemIdentificationId: ''
        }
      ]
    }
  ]
})

const showModifyBtn = ref<boolean>(false)
const showResultBtn = ref<boolean>(false)
const showVotingBtn = ref<boolean>(false)
const isVoteComplete = ref<boolean>(false)
const isAllReady = ref<boolean>(false)
const fn_getVoteDetail = async (ssno: number) => {
  loading.show()
  await $fetch<ApiResponse<VoteDetail>>('/playground/api/vote/getVoteDetail', {
    method: 'POST',
    body: JSON.stringify({
      voteSsno: ssno
    })
  })
    .then((result) => {
      voteDetail.value = result.data
      // 현재시간이랑 투표기간 비교해서 -> 투표전, 투표중, 투표완료 가져오기
      const beginDateFormatString = voteDetail.value.voteBeginDate + ':00'
      const endDateFormatString = voteDetail.value.voteEndDate + ':00'

      // 준비중 : PRP || 투표중 : VTI  || 투표완료 : VTC
      let voteStatusFlag: string = 'NONE'
      const nowVsBeginDate = dateUtil.getDiffDateWithoutAbs(
        new Date(),
        new Date(beginDateFormatString),
        'm'
      )

      const nowVsEndDate = dateUtil.getDiffDateWithoutAbs(
        new Date(),
        new Date(endDateFormatString),
        'm'
      )
      // nowVsBeginDate
      // 결과값 + : 시작됐다
      // 결과값 - : 준비중

      // nowVsEndDate
      // 결과값 + : 투표완료
      // 결과값 - : 1) nowVsBeginDate 가 + 이면 투표중
      //           2)  nowVsBeginDate 가 - 이면 준비중
      if (nowVsBeginDate < 0) {
        voteStatusFlag = 'PRP' // 투표전 준비중
      } else if (nowVsEndDate >= 0) {
        voteStatusFlag = 'VTC' // 투표완료
      } else if (nowVsBeginDate >= 0 && nowVsEndDate < 0) {
        voteStatusFlag = 'VTI' // 투표 중
      } else {
        voteStatusFlag = 'NONE' // 알수 없음
      }

      // 본인이 등록한 투표이고, 투표기간이 시작전일 경우 true
      if (
        voteDetail.value.registUserId == authStore.mberId &&
        voteStatusFlag == 'PRP'
      ) {
        showModifyBtn.value = true
      } else {
        showModifyBtn.value = false
      }

      // 투표기간이 투표 중 일 경우 -> 투표하기, 결과 둘다 노출
      if (voteStatusFlag == 'VTI') {
        showVotingBtn.value = true
        showResultBtn.value = true
      } else if (voteStatusFlag == 'VTC') {
        // 투표기간이 투표완료일 경우 -> 결과만 노출
        showResultBtn.value = true
        showVotingBtn.value = false
        isVoteComplete.value = true // 투표항목 disable
      } else if (voteStatusFlag == 'PRP') {
        isVoteComplete.value = true // 투표항목 disable
      }

      settingVoteAnswer()

      isAllReady.value = true
      loading.hide()
    })
    .catch((error) => {
      loading.hide()
      console.error(error)
    })
}

const rstrntDetailComponent = ref()
const fn_openRstrntDetail = (itemIdentificationId: string) => {
  rstrntDetailComponent.value.fn_getRstrntDetail(Number(itemIdentificationId))
  openDetailYn.value = true
}

const openDetailYn = ref<boolean>(false)
const detailDialogCloseCallback = () => {
  openDetailYn.value = false
}

const checkIems = ref([])
//const checkIems = ref<[]>([])
const selectIems = ref<string[]>([])

/** 투표답변 상세 */
interface VoteAnswer {
  voteSsno: number
  questionSsno: number
  answerUserId: string
  itemSsnoList: number[]
}

/** 사용자가 이미 투표한 항목 */
interface AlreadyAnswer {
  answerUserId: string
  voteSsno: number
  isCheckAnswer: boolean
  voteAnswerSubList: AlreadyAnswerSub[]
}

/** 사용자가 이미 투표한 항목 상세 */
interface AlreadyAnswerSub {
  questionSsno: number
  voteAnswerList: number[]
}

/** 투표 후 return 으로 받는 객체 */
interface VoteAnswerResponse {
  voteSsno: number
  questionSsno: number
  itemSsno: number
  answerUserId: string
}

const voteAnswer = ref<VoteAnswer[]>()
const setVoteAnswer = ref<AlreadyAnswer>()
const settingVoteAnswer = async () => {
  // 내가 이미 답변 했던 내용 세팅해주는 함수
  await $fetch<ApiResponse<AlreadyAnswer>>('/playground/api/vote/getMyVote', {
    method: 'POST',
    body: JSON.stringify({
      voteSsno: voteDetail.value.voteSsno,
      answerUserId: authStore.mberId
    })
  })
    .then((result: ApiResponse<AlreadyAnswer>) => {
      setVoteAnswer.value = result.data
      console.log('setVoteAnswer.value: ', setVoteAnswer.value)
      if (setVoteAnswer.value.isCheckAnswer) {
        const totalQestn: number = voteDetail.value.voteQestnResponseList.length

        // 1. select Box 값 세팅
        const selectList: string[] = new Array(totalQestn)
        const selectQestnIndex: number[] = []
        voteDetail.value.voteQestnResponseList.filter((qestn, index) => {
          if (qestn.compoundNumberChoiceAlternative == 'N') {
            selectQestnIndex.push(index)
          }
        })
        setVoteAnswer.value.voteAnswerSubList.forEach((ans, index) => {
          selectQestnIndex.forEach((i) => {
            if (i == index) {
              selectList[i] = ans.questionSsno + '|' + ans.voteAnswerList[0]
            }
          })
        })

        // 2. check Box 값 세팅
        const checkList: any = []
        const checkQestnIndex: number[] = []
        voteDetail.value.voteQestnResponseList.filter((qestn, index) => {
          if (qestn.compoundNumberChoiceAlternative == 'Y') {
            checkQestnIndex.push(index)
          }
        })
        setVoteAnswer.value.voteAnswerSubList.forEach((ans, index) => {
          checkQestnIndex.forEach((i) => {
            if (i == index) {
              ans.voteAnswerList.forEach((chkIem) => {
                checkList.push(chkIem)
              })
            }
          })
        })

        // 최종 selectIems, checkIems 에 넣어 주기
        selectIems.value = selectList
        checkIems.value = checkList
      }
    })
    .catch((error) => {
      console.error(error)
      commUtil.alert({
        message: error.errorMessage
      })
    })
}

const setAnswerReqForm = () => {
  const voteAnswerList: VoteAnswer[] = []

  // 1. 다중선택
  // 다중선택인 질문을 골라 낸다
  const checkQestn = voteDetail.value.voteQestnResponseList.filter((qes) => {
    return qes.compoundNumberChoiceAlternative == 'Y'
  })

  // 다중선택인 질문의 항목을 forEach 로 돌린다
  if (checkQestn.length > 0) {
    checkQestn.forEach((chQestn) => {
      const checkSsnoList: number[] = []
      chQestn.voteQestnIemResponseList.forEach((chQestnIem) => {
        checkIems.value.forEach((chIem) => {
          if (chQestnIem.itemSsno == chIem) {
            checkSsnoList.push(chIem)
          }
        })
      })
      const voteAnswerCheck = {
        voteSsno: chQestn.voteSsno,
        questionSsno: chQestn.questionSsno,
        answerUserId: authStore.mberId == '' ? 'anonymous' : authStore.mberId,
        itemSsnoList: checkSsnoList
      }
      voteAnswerList.push(voteAnswerCheck)
    })
  }

  // 2. 1개선택
  const selectQestn = voteDetail.value.voteQestnResponseList.filter((qes) => {
    return qes.compoundNumberChoiceAlternative == 'N'
  })

  if (selectQestn.length > 0) {
    selectIems.value.forEach((selQestn: string) => {
      const selArray: string[] = selQestn.split('|')
      const voteAnswerCheck = {
        voteSsno: voteDetail.value.voteSsno,
        questionSsno: Number(selArray[0]),
        answerUserId: authStore.mberId == '' ? 'anonymous' : authStore.mberId,
        itemSsnoList: [Number(selArray[1])]
      }
      voteAnswerList.push(voteAnswerCheck)
    })
  }

  voteAnswer.value = voteAnswerList
}

const fn_voting = () => {
  setAnswerReqForm()

  // validation check
  // 1. 선택한 답변의 질문 수와 voteDetail 에서의 질문 수를 비교
  const selQestnCount: number = voteAnswer.value ? voteAnswer.value.length : 0
  const voteQestnCount: number = voteDetail.value.voteQestnResponseList.length

  if (selQestnCount != voteQestnCount) {
    commUtil.alert({
      message: '투표항목을 선택해주세요.'
    })
    return false
  } else {
    // 2. 질문 수는 동일하지만 질문안의 답변 list 가 비어 있는 경우 check
    let isCompleteAnswer: boolean = true
    voteAnswer.value?.forEach((ans) => {
      if (ans.itemSsnoList.length == 0) {
        isCompleteAnswer = false
      }
    })

    // 3. 최종적으로 check
    if (isCompleteAnswer) {
      fn_addVoteAnswer()
    } else {
      commUtil.alert({
        message: '투표항목을 선택해주세요.'
      })
      return false
    }
  }
}

const fn_addVoteAnswer = async () => {
  loading.show()
  await $fetch<ApiResponse<VoteAnswerResponse[]>>(
    '/playground/api/vote/addVoteAnswer',
    {
      method: 'POST',
      body: JSON.stringify(voteAnswer.value)
    }
  )
    .then((result: ApiResponse<VoteAnswerResponse[]>) => {
      console.log('fn_voting start :::::result : ', result.data)
      commUtil.alert({
        message: '투표가 완료 되었습니다.',
        callbackFn: fn_votingEndCallback
      })
      loading.hide()
    })
    .catch((error) => {
      loading.hide()
      console.error(error)
      commUtil.alert({
        message: error.errorMessage
      })
    })
}

const fn_votingEndCallback = () => {
  router.push('/vote-list')
}

const fn_showVoteResult = () => {
  router.push('/vote-result?ssno=' + voteDetail.value.voteSsno)
}

const fn_goVoteModify = () => {
  console.log('fn_goVoteModify start :::::')
  router.push('/vote-detail?ssno=' + voteDetail.value.voteSsno)
}
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-content-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
</style>
