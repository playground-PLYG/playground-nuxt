<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div v-if="event" class="event-details">
        <div class="event-header">
          <div class="event-info">
            <h1 class="event-title">{{ event.eventName }}</h1>
            <p class="event-date">기간: {{ event.eventBeginDt }}</p>
            <p class="event-date">~ {{ event.eventEndDt }}</p>
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
          v-if="event && isEventOngoing && event.eventSectionCodeId === 'JOIN'"
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
        <q-btn
          class="q-mb-sm"
          label="이벤트 목록"
          rounded
          push
          style="color: black"
          @click="goEventList"
        />
      </div>
    </div>

    <q-dialog v-model="isOpenPop" :maximized="false" :full-width="false">
      <q-card
        :style="
          isMobile ? { width: '90vw', margin: '20vh auto' } : { width: '40vw' }
        "
      >
        <q-card-section class="header-section">
          <q-toolbar class="text-white q-pa-md">
            <q-toolbar-title>당첨자 확인</q-toolbar-title>
            <q-btn
              v-close-popup
              flat
              round
              dense
              icon="close"
              class="q-ml-sm"
              @click="isOpenPop = false"
            />
          </q-toolbar>
        </q-card-section>

        <q-card-section class="q-pt-none q-pb-none">
          <div class="q-mb-md winner-list">
            <div v-if="prize?.eventPrizeAt === 'Y'" class="congrats-message">
              {{ prize.memberName }}님 축하드립니다! <br />{{
                prize.przwinPointValue
              }}포인트 당첨되었습니다!
            </div>
            <q-list bordered separator>
              <q-item
                v-for="(winner, index) in prize?.prizeWinner"
                :key="index"
                class="winner-item"
              >
                <q-item-section>
                  <div>
                    {{ winner.memberName }} ({{ winner.memberId }}) /
                    {{ winner.pointPaymentUnitValue }}point
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
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

const { loading, platform } = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const eventSn = router.currentRoute.value.query.eventSn
const listTab = router.currentRoute.value.query.tab
const listEventName = router.currentRoute.value.query.eventName

const event = ref<Event>()
const isMobile = ref<boolean | undefined>(platform.is.mobile)
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
  eventBeginDt: string
  eventEndDt: string
}

interface JoinRes {
  eventPrizeAt: string
  przwinPointValue: number
}

interface EventReq {
  eventSerial: number
}

interface Prize {
  eventPrizeAt: string
  przwinPointValue: number
  memberName: string
  prizeWinner: Winner[]
}

interface Winner {
  memberName: string
  memberId: string
  pointPaymentUnitValue: number
}

const isEventOngoing = computed(() => {
  if (!event.value) {
    return false
  }
  const now = new Date()
  const endDate = new Date(event.value.eventEndDate)
  const beginDate = new Date(event.value.eventBeginDate)
  return now <= endDate && now >= beginDate
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
        eventBeginDt: `${dateUtil.getformatString(
          result.eventBeginDate,
          'YYYY년 MM월 DD일 HH시 mm분'
        )}`,
        eventEndDt: formatEventEndDt(result.eventEndDate),
        pointPayment: result.pointPayment
      }
    })
    .catch((err) => {
      console.error(err)
    })
  loading.hide()
}

const formatEventEndDt = (endDt: string) => {
  const endDate = new Date(endDt)
  if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
    const preDay = new Date(endDate)
    preDay.setDate(endDate.getDate() - 1)
    return `${dateUtil.getformatString(
      preDay.toString(),
      'YYYY년 MM월 DD일 24시'
    )}`
  } else {
    return `${dateUtil.getformatString(endDt, 'YYYY년 MM월 DD일 HH시 mm분')}`
  }
}

const loginCheck = () => {
  if (authStore?.isLogin) {
    return true
  } else {
    commUtil.alert({
      message: '로그인 후 참여가 가능합니다.'
    })
    router.push(
      `/login?redirectUrl=event-user/event-user-detail?eventSn=${eventSn}`
    )
    return false
  }
}

const participate = async () => {
  if (event.value?.participationAt === 'Y') {
    commUtil.alert({
      message: '이미 참여한 이벤트입니다.'
    })
    return
  }

  if (!loginCheck()) {
    return
  }

  loading.show()
  await $fetch<ApiResponse<JoinRes>>(
    '/playground/api/eventUser/addEventParticipation',
    {
      method: 'POST',
      body: JSON.stringify(detailReq.value)
    }
  )
    .then((res) => {
      joinRes.value = res.data
      if (joinRes.value.eventPrizeAt == 'Y') {
        commUtil.alert({
          message: `${joinRes.value.przwinPointValue}포인트 당첨되었습니다! 축하드립니다!`
        })
      } else {
        commUtil.alert({
          message: '다음기회에..'
        })
      }

      if (event.value) {
        event.value.participationAt = 'Y'
      }
    })
    .catch((err) => {
      console.error(err)
    })
  loading.hide()
}

const apply = async () => {
  if (event.value?.participationAt === 'Y') {
    commUtil.alert({
      message: '이미 참여한 이벤트입니다.'
    })
    return
  }

  if (!loginCheck()) {
    return
  }

  loading.show()
  await $fetch<ApiResponse<void>>('/playground/api/eventUser/addEventRaffle', {
    method: 'POST',
    body: JSON.stringify(detailReq.value)
  })
    .then((res) => {
      if (res.resultCode == '0000') {
        commUtil.alert({
          message: '응모가 완료되었습니다!'
        })
        if (event.value) {
          event.value.participationAt = 'Y'
        }
      }
    })
    .catch((err) => {
      console.error(err)
    })
  loading.hide()
}

const openWinner = () => {
  getWinners()
}

const getWinners = async () => {
  loading.show()

  await $fetch<ApiResponse<Prize>>(
    '/playground/public/eventUser/getEntryEventWinner',
    {
      method: 'POST',
      body: JSON.stringify(detailReq.value.eventSerial)
    }
  )
    .then((response) => {
      prize.value = response.data
      if (!prize.value.prizeWinner || prize.value.prizeWinner.length === 0) {
        commUtil.alert({
          message: '아직 추첨이 완료되지 않았어요.'
        })
      } else {
        isOpenPop.value = true
      }
      loading.hide()
    })
    .catch((error) => {
      console.error(error)
      loading.hide()
    })
}

const goEventList = () => {
  router.push(`/event-user?eventName=${listEventName}&tab=${listTab}`)
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
            font-size: 15px;
            color: #555;
          }
        }
      }

      .event-description {
        max-width: 500px;
        margin: 20px auto;
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

.winner-list {
  padding: 15px;
  border-radius: 0 0 8px 8px;
}

.winner-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
}

.congrats-message {
  color: #4caf50;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.header-section {
  padding: 0px;
  background-color: #007bff;
  color: white;
}
</style>
