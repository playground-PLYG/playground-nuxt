<template>
  <!-- 메인 영역 start -->
  <div>
    <div class="mobile-content-area">
      <div class="text-h6 q-mb-sm q-pa-sm">
        {{ voteResult.voteSubject }}
        <div class="row" style="font-size: medium">
          <div class="q-ml-sm q-mr-sm">-</div>
          <div>{{ voteResult.voteBeginDate }}</div>
          <div class="q-ml-sm q-mr-sm">~</div>
          <div>{{ voteResult.voteEndDate }}</div>
        </div>
      </div>
      <div>
        <div v-for="(qestn, index) in voteResult.voteResultList" :key="index">
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

              <div v-for="(iem, index) in qestn.resultDetailList" :key="index">
                <div
                  class="row q-mb-sm"
                  :class="{ highlight: iem.bestItem == true }"
                  style="align-items: center; border: ridge; min-height: 30px"
                >
                  <!-- 투표 1등 일 경우 표시 -->
                  <div style="min-width: 10%">
                    <q-icon
                      v-if="iem.bestItem"
                      size="25px"
                      name="check"
                      class="text-green-10"
                    />
                  </div>
                  <div class="text-h8">
                    {{ iem.itemName }}
                    ({{ iem.itemCount }}명)
                  </div>
                </div>
                <div
                  v-if="qestn.questionDetailYn"
                  class="row"
                  style="min-height: 30px"
                >
                  {{ iem.userIds }}
                </div>
              </div>
              <div class="row justify-center">
                <dk-btn
                  v-show="qestn.questionDetailShowBtn"
                  push
                  color="white"
                  text-color="primary"
                  :label="qestn.questionDetailLabel"
                  @click="fn_detailView(qestn)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
  <!-- 메인 영역 end -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { type ApiResponse } from '@/interface/server'
import { dateUtil } from '~/utils/dateUtil'

const { loading } = useQuasar()
const router = useRouter()
const initVoteSsno = router.currentRoute.value.query.ssno

onMounted(() => {
  fn_getVoteResult(Number(initVoteSsno))
})

// 투표결과
interface VoteResult {
  voteSsno: number
  voteSubject: string
  voteBeginDate: string
  voteEndDate: string
  voteStatus?: string
  voteResultList: VoteResultDetail[]
}

// 투표결과 상세
interface VoteResultDetail {
  questionSsno: number
  questionContents: string
  compoundNumberChoiceAlternative: string
  anonymityVoteAlternative: string
  resultDetailList: VoteResultDetailDetail[]
  questionDetailYn?: boolean
  questionDetailShowBtn?: boolean
  questionDetailLabel?: string
}

// 투표결과 상세의 상세
interface VoteResultDetailDetail {
  itemSsno: number
  itemName: string
  itemCount: number
  itemIdentificationId: string
  selUserIdList: string[]
  userIds: string
  bestItem?: boolean
}

const voteResult = ref<VoteResult>({
  voteSsno: 0,

  voteSubject: '',
  voteBeginDate: '9999-12-31 00:00',
  voteEndDate: '9999-12-31 00:00',
  voteResultList: [
    {
      questionSsno: 0,
      questionContents: '',
      compoundNumberChoiceAlternative: 'N',
      anonymityVoteAlternative: 'N',
      resultDetailList: [
        {
          itemSsno: 0,
          itemName: '',
          itemCount: 0,
          itemIdentificationId: '',
          selUserIdList: [],
          userIds: ''
        }
      ]
    }
  ]
})

const fn_getVoteResult = async (ssno: number) => {
  loading.show()

  await $fetch<ApiResponse<VoteResult>>('/playground/api/vote/getVoteResult', {
    method: 'POST',
    body: JSON.stringify({
      voteSsno: ssno
    })
  })
    .then((result) => {
      voteResult.value = result.data
      console.log('fn_getVoteResult : voteResult.value : ', voteResult.value)

      // 1. 투표상태 정의
      // 현재시간이랑 투표기간 비교해서 -> 투표전, 투표중, 투표완료 가져오기
      const beginDateFormatString = voteResult.value.voteBeginDate + ':00'
      const endDateFormatString = voteResult.value.voteEndDate + ':00'

      // 준비중 : PRP || 투표중 : VTI  || 투표완료 : VTC
      voteResult.value.voteStatus = 'NONE'
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

      if (nowVsBeginDate < 0) {
        voteResult.value.voteStatus = 'PRP' // 투표전 준비중
      } else if (nowVsEndDate >= 0) {
        voteResult.value.voteStatus = 'VTC' // 투표완료
      } else if (nowVsBeginDate >= 0 && nowVsEndDate < 0) {
        voteResult.value.voteStatus = 'VTI' // 투표 중
      } else {
        voteResult.value.voteStatus = 'NONE' // 알수 없음
      }

      // 2. 자세히 보기 처리  구분자 : [·]
      voteResult.value.voteResultList.forEach((qestn) => {
        // 익명일때만 자세히 보기 버튼 삭제
        qestn.questionDetailShowBtn =
          qestn.anonymityVoteAlternative == 'Y' ? false : true

        qestn.questionDetailYn = false
        qestn.questionDetailLabel = '자세히보기'

        const bestCountArray: number[] = []
        qestn.resultDetailList.forEach((iem) => {
          iem.selUserIdList.forEach((userId, index) => {
            if (index == 0) {
              iem.userIds = userId + ' · '
            } else if (index == iem.selUserIdList.length - 1) {
              iem.userIds += userId
            } else {
              iem.userIds += userId + ' · '
            }
          })
          iem.bestItem = false
          bestCountArray.push(iem.itemCount)
        })

        // 3. 투표 1등 처리
        const bestCount = Math.max(...bestCountArray)
        qestn.resultDetailList.forEach((iem) => {
          if (iem.itemCount == bestCount) {
            iem.bestItem = true
          }
        })
      })

      loading.hide()
    })
    .catch((error) => {
      console.error(error)
      loading.hide()
    })
}

const fn_detailView = (data: VoteResultDetail) => {
  data.questionDetailLabel == '자세히보기'
    ? (data.questionDetailLabel = '간단히보기')
    : (data.questionDetailLabel = '자세히보기')
  data.questionDetailYn
  data.questionDetailYn
    ? (data.questionDetailYn = false)
    : (data.questionDetailYn = true)
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

.highlight {
  background-color: rgb(232, 239, 223);
}
</style>
