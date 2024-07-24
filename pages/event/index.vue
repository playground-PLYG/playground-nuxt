<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">이벤트 관리</div>
    </div>
    <div class="search">
      <div class="q-gutter-md row items-start">
        <q-input
          v-model="param.eventName"
          outlined
          label="이벤트명"
          round
          dense
          flat
          class="input"
        />
        <q-select
          v-model="param.eventSectionCodeId"
          outlined
          :options="evnetCodeSearch"
          option-label="codeName"
          option-value="code"
          label="이벤트구분"
          round
          dense
          flat
          class="select"
          emit-value
          map-options
        />
        <q-select
          v-model="param.progrsSttus"
          outlined
          :options="statCodeSearch"
          option-label="codeName"
          option-value="code"
          label="진행상태"
          round
          dense
          flat
          class="select"
          emit-value
          map-options
        />
        <q-btn
          push
          color="green-7"
          class="button"
          label="조회"
          @click="getEventList"
        />
        <q-btn
          push
          color="green-7"
          class="button"
          label="초기화"
          @click="resetForm"
        />
      </div>
    </div>
    <div class="search">
      <div class="table-container">
        <q-table
          flat
          bordered
          :rows="eventList"
          :columns="columns"
          row-key="boardNm"
          :rows-per-page-options="[0]"
          @row-click="rowClick"
        >
          <template #bottom>
            <pagination-layout
              :total-page="totalPages"
              :current-page="currentPage"
              style="margin: 0 auto"
              @send-event="fn_PageReset"
            />
          </template>
        </q-table>
      </div>

      <div class="left-align">
        <q-btn color="blue" label="등록" @click="insert" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableProps, date, useQuasar } from 'quasar'

import type { ApiResponse, Code, Page, PageListInfo } from '@/interface/server'

import { codeUtil } from '@/utils/code'
import { useEventStore } from '@/stores/useEventStore'
import paginationLayout from '@/components/PaginationComponent.vue'

const { loading } = useQuasar()

interface Data {
  eventSerial: number
  eventName: string
  progrsSttus: string
  eventSectionCodeId: string
}
const param = ref<Data>({
  eventSerial: -1,
  eventName: '',
  progrsSttus: '',
  eventSectionCodeId: ''
})

// 반응형 상태 변수 초기화
const eventList = ref<Data[]>([])
const evnetCodeSearch = ref<Code[]>([])
const statCodeSearch = ref<Code[]>([])

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
const totalItems = ref<number | undefined>()
const page = ref<Page | undefined>()

const router = useRouter()
const eventStore = useEventStore()

const columns = ref<QTableProps['columns']>([
  {
    name: 'eventSerial',
    label: '순번',
    field: (row: Data) => {
      const idx = eventList.value.findIndex(
        (event) => event.eventSerial == row.eventSerial
      )

      if (page.value) {
        return (
          page.value.totalElements - page.value.number * page.value.size - idx
        )
      }

      return 0
    },
    align: 'center'
  },
  { name: 'eventName', label: '이벤트명', field: 'eventName', align: 'center' },
  {
    name: 'eventSectionCodeId',
    label: '이벤트구분',
    field: 'eventSectionCodeId',
    align: 'center',
    format: (val) => (val === 'JOIN' ? '참여' : '응모')
  },
  {
    name: 'progrsSttus',
    label: '진행상태',
    field: 'progrsSttus',
    align: 'center',
    format: (val) =>
      val === 'END' ? '종료' : val === 'ING' ? '진행중' : '예정'
  },
  {
    name: 'eventBeginDate',
    label: '시작일시',
    field: 'eventBeginDate',
    align: 'center',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  },
  {
    name: 'eventEndDate',
    label: '종료일시',
    field: 'eventEndDate',
    align: 'center',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  {
    name: 'registDt',
    label: '등록일시',
    field: 'registDt',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  {
    name: 'updtDt',
    label: '수정일시',
    field: 'updtDt',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  }
])

onMounted(() => {
  eventStore.eventSn = ''
  getCodeList()
  getEventList()
})
const getCodeList = async (): Promise<void> => {
  loading.show()
  const eventCode = await codeUtil.getCodeGroupList('EVENT_DIVISION_CODE')
  const statCode = await codeUtil.getCodeGroupList('EVENT_PROGRESS_STATUS')

  evnetCodeSearch.value = [
    {
      code: '',
      codeName: '전체',
      upperCode: '',
      order: 0
    },
    ...eventCode
  ]
  statCodeSearch.value = [
    {
      code: '',
      codeName: '전체',
      upperCode: '',
      order: 0
    },
    ...statCode
  ]
  loading.hide()
}

const getEventList = async () => {
  loading.show()
  await $fetch<ApiResponse<PageListInfo<Data>>>(
    '/playground/public/event/getEventList?page=' +
      (currentPage.value - 1) +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    }
  )
    .then((result) => {
      const { content, ...pageInfo } = result.data
      eventList.value = content

      totalItems.value = result.data.totalElements ?? 0

      totalPages.value = Math.ceil(
        totalItems.value / itemsPerPage.value !== 0
          ? Math.ceil(totalItems.value / itemsPerPage.value)
          : 1
      )

      page.value = pageInfo
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const rowClick = (evt: Event, row: any) => {
  eventStore.eventSn = row.eventSerial
  eventStore.progrsSttus = row.progrsSttus
  eventStore.updateYn = 'Y'
  router.push({ path: '/event-detail' })
  // router.push({ path: '/post/postDetail' })
}

const insert = () => {
  router.push({ path: '/event-detail' })
}

const resetForm = () => {
  param.value.eventName = ''

  currentPage.value = 1
  getEventList()
}

// 목록조회 - 페이징
const fn_PageReset = (pageIdx: number, idx: string) => {
  if (idx === 'pageNum') {
    currentPage.value = pageIdx === 0 ? 1 : pageIdx
  } else {
    itemsPerPage.value = pageIdx
  }
}

watch([currentPage, itemsPerPage], () => {
  getEventList()
})
</script>

<style lang="scss" scoped>
.content {
  margin-top: 2rem;
  margin-left: 5rem;
  margin-right: 5rem;

  .title {
    margin-top: 2rem;
  }

  .search {
    margin-top: 2rem;

    .input {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }
    .select {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }

    .left-align {
      display: flex;
      justify-content: flex-start;
      margin-top: 1rem;
    }
  }
}
</style>
