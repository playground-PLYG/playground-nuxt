<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div class="search">
        <q-form>
          <div class="search-controls">
            <q-input
              v-model="emergencyDisasterMsgSrchReq.rgnNm"
              outlined
              label="시도 시군구"
              round
              dense
              flat
              class="input"
              :rules="[sidosigungu_rules]"
            >
              <template #append>
                <q-icon
                  v-if="emergencyDisasterMsgSrchReq.rgnNm !== ''"
                  name="close"
                  class="cursor-pointer"
                  @click="emergencyDisasterMsgSrchReq.rgnNm = ''"
                />
                <div @click="handleSearch">
                  <q-icon name="search" />
                </div>
              </template>
            </q-input>
          </div>
        </q-form>
      </div>

      <div class="content-body">
        <div :class="[isMobile ? 'col' : 'row', 'justify-center q-gutter-sm']">
          <div
            v-for="(row, idx) in emergencyDisasterMsgResList"
            :key="idx"
            class="q-ma-sm card-body cursor-pointer"
          >
            <q-card flat bordered>
              <q-card-section class="row justify-between items-center">
                <div>
                  <div class="crt-dt">
                    {{ row.crtDt }}
                  </div>
                  <div class="rcptnRgnNm">
                    {{ row.rcptnRgnNm }}
                  </div>
                  <div class="emrgStepNm">
                    {{ row.emrgStepNm }}
                  </div>
                  <div class="dstSeNm">
                    {{ row.dstSeNm }}
                  </div>
                  <div class="msg-cn">
                    {{ row.msgCn }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { ApiResponse } from 'interface/server'

const { loading, platform } = useQuasar()

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(100) // 테이블 UI에 보여지는 데이터 개수

interface EmergencyDisasterMsgSrch {
  crtDt: string
  rgnNm: string
}

interface EmergencyDisasterMsgRes {
  header: {
    resultCode: string
    resultMsg: string
    errorMsg: string | null
  }
  numOfRows: number
  pageNo: number
  totalCount: number
  body: EmergencyDisasterMsgResBody[]
}

interface EmergencyDisasterMsgResBody {
  sn: string
  crtDt: string
  msgCn: string
  rcptnRgnNm: string
  emrgStepNm: string
  dstSeNm: string
  regYmd: string
  mdfcnYmd: string
}

const emergencyDisasterMsgSrchReq = ref<EmergencyDisasterMsgSrch>({
  crtDt: '',
  rgnNm: ''
})

const isMobile = ref<boolean | undefined>(platform.is.mobile)
const emergencyDisasterMsgResList = ref<EmergencyDisasterMsgResBody[]>([])
const maxDataYn = ref<boolean>(false)
let observer: IntersectionObserver | null = null

const sidosigungu_rules = (val: string) => {
  if (val) {
    // eslint-disable-next-line regexp/no-obscure-range
    if (/^[가-힇]*$/.test(val)) {
      return true
    } else {
      return false
    }
  }

  return true
}

const handleSearch = () => {
  if (!sidosigungu_rules(emergencyDisasterMsgSrchReq.value.rgnNm)) {
    return
  }

  currentPage.value = 1
  emergencyDisasterMsgResList.value = []
  maxDataYn.value = false

  fn_getFloodedCarList()
}

const fn_getFloodedCarList = async () => {
  if (maxDataYn.value) {
    return
  }

  if (!sidosigungu_rules(emergencyDisasterMsgSrchReq.value.rgnNm)) {
    return
  }

  if (observer) {
    observer.disconnect()
  }

  loading.show()

  await $fetch<ApiResponse<EmergencyDisasterMsgRes>>(
    '/playground/public/emergencyDisasterMsg/getList',
    {
      method: 'POST',
      body: JSON.stringify({
        rgnNm: emergencyDisasterMsgSrchReq.value.rgnNm,
        numOfRows: itemsPerPage.value,
        pageNo: currentPage.value
      })
    }
  )
    .then((result) => {
      if (result.data.body.length <= 0) {
        maxDataYn.value = true
      } else {
        emergencyDisasterMsgResList.value = [
          ...emergencyDisasterMsgResList.value,
          ...result.data.body
        ]

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
  const $event = document.querySelector('.card-body:last-child')

  if ($event) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentPage.value++
            observer?.unobserve(entry.target)
            fn_getFloodedCarList()
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
      .card-body {
        width: 100%;
        max-width: 300px;
      }
    }
  }

  &.mobile .content .content-body {
    .card-body {
      max-width: 100%;
    }
  }
}
</style>
