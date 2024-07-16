<template>
  <!-- 메인 영역 시작 -->
  <div>
    <!-- 조회조건 영역 start -->
    <div class="mobile-search-area">
      <dk-input v-model="text" outlined label="투표제목" maxlength="12">
        <template #append>
          <q-icon
            v-if="text !== ''"
            name="close"
            class="cursor-pointer"
            @click="text = ''"
          />
          <q-icon name="search" />
        </template>
        <template #after>
          <dk-btn push color="white" text-color="primary" label="등록" />
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
          @click="fn_click"
        >
          <dk-tab name="ing" label="투표중" />
          <dk-tab name="pre" label="준비중" />
          <dk-tab name="end" label="투표완료" />
        </dk-tabs>

        <dk-tab-panels v-model="tab" animated class="text-blue vote-list">
          <dk-tab-panel name="ing">
            <div
              v-for="(votelist, voteIndex) in resData"
              :key="voteIndex"
              transition="flip-right"
              class="vote-item"
            >
              <q-card flat bordered class="q-mb-sm">
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>투표{{ voteIndex + 1 }} 번</q-item-label>
                    <q-item-label caption lines="1"
                      >{{ votelist.beginDate }}
                      {{ votelist.endDate }}</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <q-badge rounded color="green" />
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </dk-tab-panel>

          <dk-tab-panel name="pre">
            <div
              v-for="index in 10"
              :key="index"
              transition="flip-right"
              class="vote-item"
            >
              <q-card flat bordered class="q-mb-sm">
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>투표{{ index }} 번</q-item-label>
                    <q-item-label caption lines="1"
                      >투표기간 From-to</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <q-badge rounded color="green" />
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </dk-tab-panel>

          <dk-tab-panel name="end">
            <div
              v-for="index in 10"
              :key="index"
              transition="flip-right"
              class="vote-item"
            >
              <q-card flat bordered class="q-mb-sm">
                <q-item v-ripple clickable>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white"> Q </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>투표{{ index }} 번</q-item-label>
                    <q-item-label caption lines="1"
                      >투표기간 From-to</q-item-label
                    >
                  </q-item-section>

                  <q-item-section side>
                    <q-badge rounded color="green" />
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
import { type ApiPagingResponse } from '~/interface/server'

const text = ref<string>()
const tab = ref('ing')
const { loading } = useQuasar()

// 화면 mount 된 시점 조회
onMounted(() => {
  selectList()
})

// 페이징을 위한 파라미터
const currentPage = ref<number>(0) // 스크롤페이지
const itemsPerPage = ref<number>(20) // 데이터 개수

// 샘플목록 조회 Data 영역
interface Data {
  sampleSsno: number
  sampleContent1: string
  sampleContent2: string
  sampleContent3: string
  useDate: string
  beginDate: string
  endDate: string
  localDate: string
  localTime: string
  from: string
  to: string
}

// 샘플 목록 조회 리스트
const resData = ref<Data[]>([])
const maxDataYn = ref<boolean>(false)

const fn_click = () => {
  // 변수 초기화
  resData.value = []
  maxDataYn.value = false
  currentPage.value = 0

  //조회
  selectList()
}

// 샘플 목록 조회 api
const selectList = async () => {
  loading.show()
  await $fetch<ApiPagingResponse<Data>>(
    '/playground/public/sample/getSmpleList?page=' +
      currentPage.value +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'GET'
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
        scrollEvent()
      }
    })
    .catch(() => {
      loading.hide()
    })
}

/*
 * 이거 infinite-scroll로 바꿔서 구현해도 됨
 */
const scrollEvent = () => {
  // 클래스명이 vote-item인 마지막 요소 가져오기
  const $votes = document.querySelectorAll('.vote-item:last-child')
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentPage.value++
          observer.unobserve(entry.target) // 로딩 이후론 관찰할 필요 없음
          selectList()
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
</style>
