<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div v-if="event" class="event-details">
        <div class="event-header">
          <div class="event-info">
            <h1 class="event-title">{{ event.eventName }}</h1>
            <p class="event-date">기간: {{ event.eventDate }}</p>
          </div>
          <img
            src="https://m.lpoint.com/upload/images/ha/event/202104/c4bdb28791a4458d9c0dd6d806aadaed.png"
            alt="Event Banner"
            class="event-banner"
          />
        </div>

        <div class="event-description">
          <p>{{ event.contents }}</p>
        </div>
      </div>

      <div class="button-section">
        <q-btn
          v-if="event && isEventOngoing"
          color="primary"
          class="q-mb-sm"
          label="참여하기"
          rounded
          push
          @click="participate"
        />

        <q-btn
          v-if="event && isEventOngoing && event.eventSectionCodeId === 'ENTR'"
          color="primary"
          class="q-mb-sm"
          label="응모하기"
          rounded
          push
          @click="apply"
        />

        <q-btn
          v-if="event && !isEventOngoing && event.eventSectionCodeId === 'ENTR'"
          color="primary"
          class="q-mb-sm"
          label="당첨자 확인"
          rounded
          push
          @click="openWinner"
        />
      </div>
    </div>

    <q-dialog v-model="isOpenPop" persistent>
      <q-card>
        <q-card-section>
          <div class="q-mb-md">
            <h3>당첨자 리스트</h3>
            <q-list>
              <q-item
                v-for="(winner, index) in prize?.prizeWinner"
                :key="index"
              >
                <q-item-section>
                  <div>{{ winner.memberName }}</div>
                  <div>상: {{ winner.pointPaymentUnitValue }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="닫기" @click="isOpenPop = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../../stores/useAuthStore'
import { type ApiResponse } from '../../../interface/server'
import { dateUtil } from '~/utils/dateUtil'

const { loading, platform } = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const eventSn = router.currentRoute.value.query.eventSn
const $q = useQuasar()

const detailReq = ref<EventReq>({ eventSerial: Number(eventSn) })
const joinRes = ref<JoinRes>()
const isOpenPop = ref<boolean>(false)
const prize = ref<Prize | null>(null)

interface Payment {
  pointPaymentUnitValue: number | null
  fixingPointPayrCount: number | null
  fixingPointValue: number | null
}

interface Event {
  eventSerial: number
  eventName: string
  contents: string | null
  eventBeginDate: string
  eventEndDate: string
  eventDate: string
  eventSectionCodeId: string
  drwtMethodCodeId: string
  participationAt: string
  pointPayment: Payment[]
  eventThumbFileUrl?: string
}

interface JoinRes {
  eventPrizeAt: string
  eventName: number
}

interface EventReq {
  eventSerial: number
}

interface Prize {
  eventPrizeAt: string
  przwinPointValue: number
  prizeWinner: Winner[]
}

interface Winner {
  memberName: string
  memberId: string
  pointPaymentUnitValue: number
}

const event = ref<Event | undefined>()
const isMobile = ref<boolean | undefined>(platform.is.mobile)

const isEventOngoing = computed(() => {
  if (!event.value) {
    return false
  }
  const now = new Date()
  const endDate = new Date(event.value.eventEndDate)
  return now <= endDate
})

const getEventDetail = async () => {
  loading.show()
  await $fetch<ApiResponse<Event>>(
    '/playground/public/eventUser/getEventDetail?eventSn=' + eventSn,
    {
      method: 'GET'
    }
  )
    .then((res) => {
      const result = res.data
      event.value = {
        ...result,
        eventDate: `${dateUtil.getformatString(
          result.eventBeginDate,
          'YYYY년 MM월 DD일'
        )} ~ ${dateUtil.getformatString(
          result.eventEndDate,
          'YYYY년 MM월 DD일'
        )}`,
        pointPayment: result.pointPayment
      }
    })
    .catch((err) => {
      console.error(err)
    })
  loading.hide()
}

const loginCheck = () => {
  if (authStore?.isLogin) {
    true
  } else {
    $q.dialog({
      title: '알림',
      message: '로그인 후 참여가 가능합니다.'
    })
    router.push(
      '/login?redirectUrl=event-user/event-user-detail?eventSn=' + eventSn
    )
  }
}

const participate = async () => {
  if (event.value?.participationAt == 'Y') {
    alert('이미 참여한 이벤트입니다.')
    return
  }
  loginCheck()

  loading.show()
  await $fetch<ApiResponse<JoinRes>>('/api/eventUser/addEventParticipation', {
    method: 'POST',
    body: JSON.stringify(detailReq.value)
  })
    .then((res) => {
      joinRes.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
  loading.hide()
}

const apply = () => {}

const openWinner = () => {
  getWinners()
  isOpenPop.value = true
}

const getWinners = async () => {
  loading.show()
  try {
    const response = await $fetch<ApiResponse<Prize>>(
      '/public/eventUser/getEntryEventWinner',
      {
        method: 'POST',
        body: JSON.stringify(detailReq.value)
      }
    )
    prize.value = response.data
  } catch (err) {
    console.error('Error fetching winners:', err)
  }
  loading.hide()
}

onMounted(() => {
  getEventDetail()
})
</script>

<style lang="scss" scoped>
.page-wrap {
  .content {
    .event-details {
      .event-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        .event-banner {
          width: 100%;
          max-width: 600px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        .event-info {
          text-align: center;
          .event-title {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
            color: #333;
          }
          .event-date {
            font-size: 18px;
            color: #555;
          }
        }
      }

      .event-description {
        margin: 20px 0;
        font-size: 16px;
        color: #333;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        line-height: 1.6;
      }
    }

    .button-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
      .q-btn {
        width: 100%;
        max-width: 200px;
      }
    }
  }
}
</style>
