<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div class="title">
        <div class="text-h4"><q-icon name="emoji_events" /> 이벤트</div>
      </div>

      <div class="search">
        <q-form @submit="fn_getEventList" @reset="fn_resetSearchArea">
          <q-card flat class="search-card">
            <q-card-section class="row q-pa-none">
              <div class="row full-width q-px-lg q-pb-lg q-pt-md">
                <div
                  class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md q-pt-sm"
                >
                  <q-input
                    v-model="eventSrchReq.eventName"
                    outlined
                    label="이벤트명"
                    round
                    dense
                    flat
                    class="input"
                  />
                </div>
                <div
                  class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md q-pt-sm"
                >
                  <div class="row full-width justify-end">
                    <div class="q-pl-xs">
                      <q-btn
                        push
                        class="button"
                        color="green-6"
                        label="초기화"
                        type="reset"
                      />
                    </div>
                    <div class="q-pl-xs">
                      <q-btn
                        push
                        class="button"
                        color="green-6"
                        label="조회"
                        type="submit"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-form>
      </div>

      <dk-tabs v-model="tab" @update:model-value="handleTabChange">
        <dk-tab name="ING" label="진행중" />
        <dk-tab name="END" label="종료" />
      </dk-tabs>

      <q-separator />

      <dk-tab-panels v-model="tab">
        <dk-tab-panel name="ING">
          <div class="content-body">
            <div v-if="!eventResList.length" class="no-results">
              <q-icon name="sentiment_very_dissatisfied" size="40px" />
              <div class="message">현재 표시할 이벤트가 없습니다.</div>
            </div>
            <div
              v-else
              :class="[isMobile ? 'col' : 'row', 'justify-center q-gutter-sm']"
            >
              <q-intersection
                v-for="(event, eventIndex) in eventResList"
                :key="eventIndex"
                class="q-ma-sm card-event cursor-pointer"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-none q-pb-xs">
                    <div class="card-img">
                      <q-img
                        :src="event.imageUrl"
                        class="fit"
                        :rato="1"
                        :img-style="{ borderRadius: '2px' }"
                        no-native-menu
                      />
                    </div>
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section class="row justify-between items-center">
                    <div class="event-info">
                      <div class="text-subtitle1">{{ event.eventName }}</div>
                      <div class="text-subtitle6">{{ event.eventDate }}</div>
                    </div>
                    <q-badge color="primary" outline class="q-ml-sm">
                      <template v-if="event.progrsSttus === '예정'">
                        D-{{ event.dDay }}
                      </template>
                      <template v-else>
                        {{ event.participationAt }}
                      </template>
                    </q-badge>
                  </q-card-section>
                </q-card>
              </q-intersection>
            </div>
          </div>
        </dk-tab-panel>

        <dk-tab-panel name="END">
          <div class="content-body">
            <div v-if="!eventResList.length" class="no-results">
              <q-icon name="sentiment_very_dissatisfied" size="40px" />
              <div class="message">현재 표시할 이벤트가 없습니다.</div>
            </div>
            <div
              v-else
              :class="[isMobile ? 'col' : 'row', 'justify-center q-gutter-sm']"
            >
              <q-intersection
                v-for="(event, eventIndex) in eventResList"
                :key="eventIndex"
                class="q-ma-sm card-event cursor-pointer"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-none q-pb-xs">
                    <div class="card-img">
                      <q-img
                        :src="event.imageUrl"
                        class="fit"
                        :rato="1"
                        :img-style="{ borderRadius: '2px' }"
                        no-native-menu
                      />
                    </div>
                  </q-card-section>
                  <q-separator inset />
                  <q-card-section class="row justify-between items-center">
                    <div class="event-info">
                      <div class="text-subtitle1">{{ event.eventName }}</div>
                      <div class="text-subtitle6">{{ event.eventDate }}</div>
                    </div>
                    <q-badge color="primary" outline class="q-ml-sm">
                      {{ event.participationAt }}
                    </q-badge>
                  </q-card-section>
                </q-card>
              </q-intersection>
            </div>
          </div>
        </dk-tab-panel>
      </dk-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QInput, useQuasar } from 'quasar'
import { type ApiResponse, type PageListInfo } from '../../interface/server'
import { imageUtil } from '~/utils/image'
import { dateUtil } from '~/utils/dateUtil'

const { loading, platform } = useQuasar()

const tab = ref('ING')

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수

/** 이벤트 정보 */
interface Event {
  eventSerial: number
  eventName: string
  eventBeginDate: string
  eventEndDate: string
  eventDate: string
  eventThumbFileSn: number
  eventThumbFileUrl?: string
  participationAt: string
  imageUrl: string
  progrsSttus: string
  dDay?: number
}

const eventSrchReq = ref<Pick<Event, 'eventName' | 'progrsSttus'>>({
  eventName: '',
  progrsSttus: 'ING'
})

const isMobile = ref<boolean | undefined>(platform.is.mobile)
const eventResList = ref<Event[]>([])
const maxDataYn = ref<boolean>(false)

onMounted(() => {
  fn_getEventList()
})

const fn_getEventList = async () => {
  loading.show()

  await $fetch<ApiResponse<PageListInfo<Event>>>(
    '/playground/public/eventUser/getEventPageList?page=' +
      (currentPage.value - 1) +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'POST',
      body: JSON.stringify(eventSrchReq.value)
    }
  )
    .then((result) => {
      if (result.data.content.length <= 0) {
        eventResList.value = []
        maxDataYn.value = true
      } else {
        console.log(result.data.content)
        const today = new Date()
        const processedEvents: Event[] = result.data.content.map((event) => {
          const eventBeginDate = new Date(event.eventBeginDate)
          const timeDifference = eventBeginDate.getTime() - today.getTime()
          const dDay = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

          return {
            ...event,
            eventThumbFileUrl: event.eventThumbFileSn
              ? imageUtil.getImageUrl(event.eventThumbFileSn)
              : '/icon/no-image.png',
            eventDate: `${dateUtil.getformatString(
              event.eventBeginDate,
              'YYYY년 MM월 DD일'
            )} ~ ${dateUtil.getformatString(
              event.eventEndDate,
              'YYYY년 MM월 DD일'
            )}`,
            imageUrl: event.eventThumbFileSn
              ? imageUtil.getImageUrl(event.eventThumbFileSn)
              : '/icon/no-image.png',
            dDay: event.progrsSttus === '예정' ? dDay : 0
          }
        })
        eventResList.value = processedEvents
        if (!maxDataYn.value) {
          scrollEvent()
        }
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const scrollEvent = () => {
  // 클래스명이 vote-item인 마지막 요소 가져오기
  const $votes = document.querySelectorAll('.vote-item:last-child')
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentPage.value++
          observer.unobserve(entry.target) // 로딩 이후론 관찰할 필요 없음
          fn_getEventList()
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

const handleTabChange = (newTab: string) => {
  eventSrchReq.value.progrsSttus = newTab
  fn_getEventList()
}

const fn_resetSearchArea = () => {
  eventSrchReq.value = {
    eventName: '',
    progrsSttus: 'ING'
  }
  tab.value = 'ING'
  fn_getEventList()
}
</script>

<style lang="scss" scoped>
.page-wrap {
  .content {
    .search {
      .search-card {
        border: 1px solid lightgrey;
        border-radius: 5px;
      }
    }

    .toolbar-area {
      .toolbar-box {
        border: 1px solid lightgrey;
        border-radius: 5px;
      }
    }

    .content-body {
      .no-results {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        background-color: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #ddd;
        padding: 20px;
        text-align: center;
        .message {
          margin-top: 10px;
          font-size: 16px;
          color: #bababa;
        }
      }
      .card-event {
        height: 400px;
        width: 100%;
        max-width: 300px;

        .card-img {
          width: 100%;
          height: 280px;
        }
      }
    }
  }

  &.mobile .content .content-body {
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border: 1px solid #ddd;
      padding: 20px;
      text-align: center;
      .message {
        margin-top: 10px;
        font-size: 16px;
        color: #bababa;
      }
    }
    .card-event {
      height: 450px;
      max-width: 100%;
      margin-bottom: 2em;
    }

    .card-img {
      height: 380px;
    }
  }
}
</style>
