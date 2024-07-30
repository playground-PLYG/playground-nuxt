<template>
  <!-- 메인 영역 시작 -->
  <div>
    <!-- 조회조건 영역 start -->
    <div class="mobile-search-area">
      <dk-input
        v-model="voteSrchReq.voteSubject"
        outlined
        label="투표제목"
        maxlength="12"
      >
        <template #append>
          <q-icon
            v-if="voteSrchReq.voteSubject !== ''"
            name="close"
            class="cursor-pointer"
            @click="voteSrchReq.voteSubject = ''"
          />
          <q-icon name="search" @click="fn_click" />
        </template>
        <template #after>
          <dk-btn
            push
            color="white"
            text-color="primary"
            label="등록"
            @click="fn_goAddVote"
          />
        </template>
      </dk-input>
    </div>
    <!-- 조회조건 영역 end -->
    <q-separator spaced="12px" />

    <div class="q-gutter-y-md">
      <q-card>
        <dk-tabs
          v-model="tab"
          dense
          class="text-grey-7 vote-tab"
          active-color="blue-9"
          indicator-color="blue"
          align="justify"
          @update:model-value="fn_click"
        >
          <dk-tab name="VTI" label="투표중" />
          <dk-tab name="PRP" label="준비중" />
          <dk-tab name="VTC" label="투표완료" />
        </dk-tabs>

        <dk-tab-panels v-model="tab" animated class="text-blue vote-list">
          <dk-tab-panel name="VTI">
            <div
              v-for="(votelist, voteIndex) in resData"
              :key="voteIndex"
              transition="flip-right"
              class="vote-item"
            >
              <q-card
                flat
                bordered
                class="q-mb-sm"
                @click="fn_goVoteDetail(votelist.voteSsno)"
              >
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ votelist.voteSubject }}</q-item-label>
                    <q-item-label caption lines="1"
                      >{{ votelist.voteBeginDate }} ~
                      {{ votelist.voteEndDate }}</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <template v-if="votelist.votePartcptnAt === 'Y'">
                      <q-icon name="check" size="20px" class="text-green" />
                      <span class="text-green">참여</span>
                    </template>
                    <template v-else>
                      <!-- <q-icon name="close" size="20px" /> -->
                      <span>미참여</span>
                    </template>
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </dk-tab-panel>

          <dk-tab-panel name="PRP">
            <div
              v-for="(votelist, voteIndex) in resData"
              :key="voteIndex"
              transition="flip-right"
              class="vote-item"
            >
              <q-card
                flat
                bordered
                class="q-mb-sm"
                @click="fn_goVoteDetail(votelist.voteSsno)"
              >
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ votelist.voteSubject }}</q-item-label>
                    <q-item-label caption lines="1"
                      >{{ votelist.voteBeginDate }} ~
                      {{ votelist.voteEndDate }}</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <template v-if="votelist.votePartcptnAt === 'Y'">
                      <q-icon name="check" size="20px" class="text-green" />
                      <span class="text-green">참여</span>
                    </template>
                    <template v-else>
                      <span>미참여</span>
                    </template>
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </dk-tab-panel>

          <dk-tab-panel name="VTC">
            <div
              v-for="(votelist, voteIndex) in resData"
              :key="voteIndex"
              transition="flip-right"
              class="vote-item"
            >
              <q-card
                flat
                bordered
                class="q-mb-sm"
                @click="fn_goVoteResult(votelist.voteSsno)"
              >
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ votelist.voteSubject }}</q-item-label>
                    <q-item-label caption lines="1"
                      >{{ votelist.voteBeginDate }} ~
                      {{ votelist.voteEndDate }}</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <template v-if="votelist.votePartcptnAt === 'Y'">
                      <q-icon name="check" size="20px" class="text-green" />
                      <span class="text-green">참여</span>
                    </template>
                    <template v-else>
                      <span>미참여</span>
                    </template>
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </dk-tab-panel>
        </dk-tab-panels>
      </q-card>
    </div>
  </div>
  <!-- 메인 영역 종료 -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiResponse, PageListInfo } from '../../interface/server'
import { useAuthStore } from '../../stores/useAuthStore'
import { commUtil } from '~/utils/comm'

const { loading } = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const tab = ref('VTI')
const initTab = router.currentRoute.value.query.initTab

// 조회 리스트
const resData = ref<Data[]>([])
const maxDataYn = ref<boolean>(false)

// 페이징을 위한 파라미터
const currentPage = ref<number>(0) // 스크롤페이지
const itemsPerPage = ref<number>(20) // 데이터 개수

interface mberData {
  mberId: string
}

const param = ref<mberData>({
  mberId: authStore.mberId
})

// 샘플목록 조회 Data 영역
interface Data {
  voteSsno: number
  voteSubject: string
  voteBeginDate: string
  voteEndDate: string
  votePartcptnAt: string
}

interface paramData {
  userId?: string
  voteSubject?: string
  voteStatus?: string
}

const voteSrchReq = ref<paramData>({
  userId: param.value.mberId,
  voteSubject: '',
  voteStatus: ''
})

const fn_goAddVote = () => {
  router.push('/vote-detail?tab=' + tab.value)
}

const fn_goVoteDetail = (voteSsno: number) => {
  router.push('/vote-user?ssno=' + voteSsno + '&tab=' + tab.value)
}

const fn_goVoteResult = (voteSsno: number) => {
  router.push('/vote-result?ssno=' + voteSsno + '&tab=' + tab.value)
}

// 화면 mount 된 시점 조회
onMounted(() => {
  if (initTab) {
    tab.value = initTab.toString()
  }
  fn_click()
})

const fn_click = () => {
  // 변수 초기화
  resData.value = []
  maxDataYn.value = false
  currentPage.value = 0

  //탭 value 셋팅
  voteSrchReq.value.voteStatus = tab.value

  //조회
  fn_getVoteList()
}

//코드 조회
const fn_getVoteList = async () => {
  loading.show()
  await $fetch<ApiResponse<PageListInfo<Data>>>(
    '/playground/public/vote/getVoteList?page=' +
      currentPage.value +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'POST',
      body: JSON.stringify(voteSrchReq.value)
    }
  )
    .then((result) => {
      resData.value = resData.value.concat(result.data.content)
      if (result.data.content.length == 0) {
        maxDataYn.value = true
      }
      loading.hide()
    })
    .then(() => {
      if (!maxDataYn.value) {
        fn_scrollEvent()
      }
    })
    .catch((error) => {
      console.error(error)
      commUtil.alert({ message: '투표리스트가 조회되지 않았습니다.' })
      loading.hide()
    })
}

/*
 * 이거 infinite-scroll로 바꿔서 구현해도 됨
 */ ;['--']
const fn_scrollEvent = () => {
  // 클래스명이 vote-item인 마지막 요소 가져오기
  const $votes = document.querySelectorAll('.vote-item:last-child')
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentPage.value++
          observer.unobserve(entry.target) // 로딩 이후론 관찰할 필요 없음
          fn_getVoteList()
        }
      })
    },
    {
      threshold: 0.5
    }
  )
  // 위 $votes의 첫 번째 요소의 인터섹션 여부를 검사. obs.observe($votes[0]) 이렇게 사용해도 됨
  $votes.forEach((el) => obs.observe(el))
}
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-search-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.vote-item {
  margin-bottom: 10px;
}

.vote-list {
  padding: 0px 0px 0px 0px;
}

.vote-tab {
  height: 50px;
}

.text-green {
  color: green;
}
</style>
