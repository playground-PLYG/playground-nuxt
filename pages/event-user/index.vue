<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div class="search">
        <q-form @submit.prevent="handleSearch">
          <div class="search-controls">
            <q-input
              v-model="eventSrchReq.eventName"
              outlined
              label="이벤트명"
              round
              dense
              flat
              class="input"
            >
              <template #append>
                <q-icon
                  v-if="eventSrchReq.eventName !== ''"
                  name="close"
                  class="cursor-pointer"
                  @click="eventSrchReq.eventName = ''"
                />
                <q-icon name="search" />
              </template>
            </q-input>
            <dk-btn
              push
              color="white"
              text-color="primary"
              label="조회"
              type="submit"
            />
          </div>
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
              <div
                v-for="(event, eventIndex) in eventResList"
                :key="eventIndex"
                class="q-ma-sm card-event cursor-pointer"
                @click="fn_goEventDetail(event.eventSerial)"
              >
                <q-card flat bordered>
                  <q-card-section
                    v-if="event.imageUrl !== ''"
                    class="q-pa-none"
                  >
                    <div class="card-img">
                      <q-img
                        :src="event.imageUrl"
                        class="contain"
                        :rato="1"
                        :img-style="{ borderRadius: '2px' }"
                        no-native-menu
                      />
                    </div>
                  </q-card-section>
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
              </div>
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
              <div
                v-for="(event, eventIndex) in eventResList"
                :key="eventIndex"
                class="q-ma-sm card-event cursor-pointer"
                @click="fn_goEventDetail(event.eventSerial)"
              >
                <q-card flat bordered>
                  <q-card-section
                    v-if="event.imageUrl !== ''"
                    class="q-pa-none"
                  >
                    <div class="card-img">
                      <q-img
                        :src="event.imageUrl"
                        class="contain"
                        :rato="1"
                        :img-style="{ borderRadius: '2px' }"
                        no-native-menu
                      />
                    </div>
                  </q-card-section>
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
              </div>
            </div>
          </div>
        </dk-tab-panel>
      </dk-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { type ApiResponse, type PageListInfo } from '../../interface/server'
import { imageUtil } from '~/utils/image'
import { dateUtil } from '~/utils/dateUtil'

const { loading, platform } = useQuasar()

const tab = ref('ING')

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10) // 테이블 UI에 보여지는 데이터 개수

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
let observer: IntersectionObserver | null = null

onMounted(() => {
  fn_getEventList()
})

const handleSearch = () => {
  currentPage.value = 1
  eventResList.value = []
  maxDataYn.value = false
  fn_getEventList()
}

const handleTabChange = (tab: string) => {
  eventSrchReq.value.progrsSttus = tab
  handleSearch()
}

const fn_getEventList = async () => {
  if (maxDataYn.value) {
    return
  }

  if (observer) {
    observer.disconnect()
  }
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
      loading.show()
      if (result.data.content.length <= 0) {
        maxDataYn.value = true
      } else {
        const today = new Date()
        const processedEvents: Event[] = result.data.content.map((event) => {
          const eventBeginDate = new Date(event.eventBeginDate)
          const timeDifference = eventBeginDate.getTime() - today.getTime()
          const dDay = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

          return {
            ...event,
            eventDate: `${dateUtil.getformatString(
              event.eventBeginDate,
              'YYYY년 MM월 DD일'
            )} ~ ${dateUtil.getformatString(
              event.eventEndDate,
              'YYYY년 MM월 DD일'
            )}`,
            imageUrl: event.eventThumbFileSn
              ? imageUtil.getImageUrl(event.eventThumbFileSn)
              : '',
            dDay: event.progrsSttus === '예정' ? dDay : 0
          }
        })
        eventResList.value = [...eventResList.value, ...processedEvents]

        nextTick(() => {
          if (!maxDataYn.value) {
            scrollEvent()
          }
        })
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const scrollEvent = () => {
  const $event = document.querySelector('.card-event:last-child')
  if ($event) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentPage.value++
            observer?.unobserve(entry.target)
            fn_getEventList()
          }
        })
      },
      {
        threshold: 0.5
      }
    )
    observer.observe($event)
  }
}

const router = useRouter()
const fn_goEventDetail = (eventSn: number) => {
  router.push('/event-user/event-user-detail?eventSn=' + eventSn)
}
</script>

<style lang="scss" scoped>
.page-wrap {
  .content {
    .search {
      .search-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .input {
        flex: 1;
      }

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
        width: 100%;
        max-width: 300px;

        .card-img {
          width: 100%;
        }
      }

      .load-more {
        display: flex;
        justify-content: center;
        margin-top: 1em;
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
      max-width: 100%;
      margin-bottom: 2em;
    }
  }
}
</style>
