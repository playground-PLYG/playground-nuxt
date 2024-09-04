<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
    <div class="content q-pa-md q-gutter-md">
      <div class="search">
        <q-form>
          <div class="search-controls">
            <q-input
              v-model="floodedCarSrchReq.nowVhclNo"
              outlined
              label="차량번호"
              round
              dense
              flat
              class="input"
              :rules="[nowVhclNo_rules]"
            >
              <template #append>
                <q-icon
                  v-if="floodedCarSrchReq.nowVhclNo !== ''"
                  name="close"
                  class="cursor-pointer"
                  @click="floodedCarSrchReq.nowVhclNo = ''"
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
            v-for="(floodedCar, idx) in floodedCarResList"
            :key="idx"
            class="q-ma-sm card-flooded-car cursor-pointer"
          >
            <q-card flat bordered>
              <q-card-section class="row justify-between items-center">
                <div>
                  <div class="now-vhcl-no">
                    차량 번호 : {{ floodedCar.nowVhclNo }}
                  </div>
                  <div class="acdn-kind-nm">
                    사고 종류 : {{ floodedCar.acdnKindNm }}
                  </div>
                  <div class="acdn-occr-dtm">
                    사고 발생일시 : {{ floodedCar.acdnOccrDtm }}
                  </div>
                  <div class="acdn-occr-dtm">
                    자료작성일자 : {{ floodedCar.dtaWrtDt }}
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
const itemsPerPage = ref<number>(20) // 테이블 UI에 보여지는 데이터 개수

interface FloodedCarSrch {
  nowVhclNo: string
}

interface FloodedCarRes {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      numOfRows: number
      pageNo: number
      totalCount: number
      items: {
        item: FloodedCarResBody[]
      }
    }
  }
}

interface FloodedCarResBody {
  nowVhclNo: string
  acdnOccrDtm: string
  acdnKindNm: string
  dtaWrtDt: string
}

const floodedCarSrchReq = ref<FloodedCarSrch>({
  nowVhclNo: ''
})

const isMobile = ref<boolean | undefined>(platform.is.mobile)
const floodedCarResList = ref<FloodedCarResBody[]>([])
const maxDataYn = ref<boolean>(false)
let observer: IntersectionObserver | null = null

const nowVhclNo_rules = (val: string) => {
  if (val) {
    // eslint-disable-next-line regexp/no-obscure-range
    if (/^[가-힇|0-9]*$/.test(val)) {
      return true
    } else {
      return false
    }
  }

  return true
}

const handleSearch = () => {
  if (!nowVhclNo_rules(floodedCarSrchReq.value.nowVhclNo)) {
    return
  }

  currentPage.value = 1
  floodedCarResList.value = []
  maxDataYn.value = false

  fn_getFloodedCarList()
}

const fn_getFloodedCarList = async () => {
  if (maxDataYn.value) {
    return
  }

  if (!nowVhclNo_rules(floodedCarSrchReq.value.nowVhclNo)) {
    return
  }

  if (observer) {
    observer.disconnect()
  }

  loading.show()

  await $fetch<ApiResponse<FloodedCarRes>>(
    '/playground/public/floodedCar/getList',
    {
      method: 'POST',
      body: JSON.stringify({
        nowVhclNo: floodedCarSrchReq.value.nowVhclNo,
        numOfRows: itemsPerPage.value,
        pageNo: currentPage.value
      })
    }
  )
    .then((result) => {
      if (result.data.response.body.items.item.length <= 0) {
        maxDataYn.value = true
      } else {
        floodedCarResList.value = [
          ...floodedCarResList.value,
          ...result.data.response.body.items.item
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
  const $event = document.querySelector('.card-flooded-car:last-child')

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
      .card-flooded-car {
        width: 100%;
        max-width: 300px;
      }
    }
  }

  &.mobile .content .content-body {
    .card-flooded-car {
      max-width: 100%;
    }
  }
}
</style>
