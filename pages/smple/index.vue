<template>
  <div>
    <!-- 메인 영역 시작 -->
    <div class="content">
      <div class="title">
        <div class="text-h4"><q-icon name="chat" /> 샘플</div>
      </div>
      <div class="table">
        <q-table
          v-model:selected="selected"
          :rows="resData"
          :columns="columns"
          row-key="sampleSsno"
          selection="multiple"
          :rows-per-page-options="[0]"
          @row-click="clickRow"
        >
          <!-- v-slot:bottom의 의미를 모르겠음 페이징이 가운데 정렬안되는 문제도 있는데.. -->
          <template #bottom>
            <paginationLayout
              :total-page="totalPages"
              :current-page="currentPage"
              @send-event="reset"
            />
          </template>
        </q-table>
      </div>
      <div class="proc">
        <!-- <q-btn push class="button" color="primary" label="등록" @click="showInsertDialog = true"/> -->
        <q-btn
          push
          class="button"
          color="primary"
          label="수정"
          @click="clickBtnModify"
        />
        <q-btn push class="button" color="negative" label="삭제" />
        <q-btn
          push
          class="button"
          color="primary"
          label="샘플상세리스트조회"
          @click="clickBtnDetailList"
        />
      </div>
    </div>
    <!-- 메인 영역 종료 -->

    <!-- 팝업 영역 상세조회 Detail-->
    <div class="popup">
      <q-dialog v-model="showDetailDialog">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>상세조회</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-field
                  stack-label
                  label="샘플일련번호"
                  style="padding-bottom: 20px"
                >
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ param.sampleSsno }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  stack-label
                  label="샘플1차내용"
                  style="padding-bottom: 20px"
                >
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ param.sampleContent1 }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  stack-label
                  label="샘플2차내용"
                  style="padding-bottom: 20px"
                >
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ param.sampleContent2 }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  stack-label
                  label="샘플3차내용"
                  style="padding-bottom: 20px"
                >
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ param.sampleContent3 }}
                    </div>
                  </template>
                </q-field>
                <q-field stack-label label="시간" style="padding-bottom: 20px">
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ date.formatDate(param.useDate, 'YYYY-MM-DD HH:mm') }}
                    </div>
                  </template>
                </q-field>
              </q-card-section>
            </q-card>
          </q-page-container>
          <q-footer>
            <q-toolbar class="bg-white">
              <q-toolbar-title />
              <div class="proc">
                <!-- <q-btn push class="button" color="primary" label="수정" @click="clickBtnModify" /> -->
                <q-btn push class="button" color="negative" label="삭제" />
              </div>
            </q-toolbar>
          </q-footer>
        </q-layout>
      </q-dialog>
    </div>
    <!-- 팝업 영역 종료 -->
    <!-- 수정 팝업 -->
    <div class="popup">
      <q-dialog v-model="showUpdateDialog" @hide="onReset">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>수정</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-form ref="updateForm">
                  <q-input
                    v-model="param.sampleContent1"
                    outlined
                    stack-label
                    label="1차내용"
                  />
                  <q-input
                    v-model="param.sampleContent2"
                    outlined
                    stack-label
                    label="2차내용"
                  />
                  <q-input
                    v-model="param.sampleContent3"
                    outlined
                    stack-label
                    label="3차내용"
                  />
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
          <q-footer>
            <q-toolbar class="bg-white">
              <q-toolbar-title />
              <div class="proc">
                <q-btn
                  push
                  color="primary"
                  label="저장"
                  @click="onUpdateSubmit"
                />
                <q-btn
                  push
                  color="primary"
                  label="취소"
                  @click="closeUpdateDialog"
                />
              </div>
            </q-toolbar>
          </q-footer>
        </q-layout>
      </q-dialog>
    </div>
    <!-- 수정 팝업 -->
    <!-- 팝업 상세 목록 -->
    <div class="popup">
      <q-dialog v-model="showDetailListDialog">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>샘플 상세 목록 조회</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <div class="table">
            <q-table
              style="padding-top: 50px"
              :rows="resDetailList"
              :columns="detailColumns"
              row-key="sampleDetailSsno"
            />
          </div>
        </q-layout>
      </q-dialog>
    </div>
    <!-- 팝업 상세 목록 종료 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableProps, date, useQuasar } from 'quasar'
import {
  type ApiPagingResponse,
  type ApiResponse
} from '../../interface/server'

import paginationLayout from '~/components/PaginationComponent.vue'

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
const totalItems = ref<number | undefined>() // 데이터의 개수에 따라 페이지네이션 UI에 그려지는 숫자 리스트

const router = useRouter()
const $q = useQuasar()

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

// 디테일 화면에 전송하기 위한 파라미터
const param = ref<Data>({
  sampleSsno: 0,
  sampleContent1: '',
  sampleContent2: '',
  sampleContent3: '',
  useDate: '',
  beginDate: '',
  endDate: '',
  localDate: '',
  localTime: '',
  from: '',
  to: ''
})

const onReset = () => {
  param.value = {
    sampleSsno: 0,
    sampleContent1: '',
    sampleContent2: '',
    sampleContent3: '',
    useDate: '',
    beginDate: '',
    endDate: '',
    localDate: '',
    localTime: '',
    from: '',
    to: ''
  }
}

// 다중 선택을 위한 selected
const selected = ref<Data[]>()

// 샘플 목록 조회 리스트
const resData = ref<Data[][]>([])

// 샘플 목록 column 정의
const columns = ref<QTableProps['columns']>([
  {
    name: 'sampleSsno',
    label: '샘플일련번호',
    field: 'sampleSsno',
    align: 'center'
  },
  {
    name: 'sampleContent1',
    label: '샘플내용1',
    field: 'sampleContent1',
    align: 'left'
  },
  {
    name: 'sampleContent2',
    label: '샘플내용2',
    field: 'sampleContent2',
    align: 'left'
  },
  {
    name: 'sampleContent3',
    label: '샘플내용3',
    field: 'sampleContent3',
    align: 'left'
  },
  {
    name: 'useDate',
    label: '시간',
    field: 'useDate',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD') : val)
  },
  {
    name: 'beginDate',
    label: '시작시간',
    field: 'beginDate',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  },
  {
    name: 'endDate',
    label: '종료시간',
    field: 'endDate',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  }
])

// 디테일 데이터를 조회하기 위한 interface
interface DetailData {
  sampleSsno: number
}
// 디테일 조회에 필요한 키
const searchDetail = ref<DetailData>({
  sampleSsno: 0
})

// 디테일 팝업 true, false 값
const showDetailDialog = ref<boolean>(false)

const showUpdateDialog = ref<boolean>(false)

// 샘플 상세 목록 조회 Data 영역
interface DetailList {
  sampleSsno?: number
  sampleDetailSsno?: number
  sampleDetailContent1?: string
  sampleDetailContent2?: string
  sampleDetailContent3?: string
}

// 디테일 목록 리스트
const resDetailList = ref<DetailList[]>([])

// 디테일 목록 팝업 true, false 값
const showDetailListDialog = ref<boolean>(false)

// 샘플 상세 목록 column 정의
const detailColumns = ref<QTableProps['columns']>([
  {
    name: 'sampleSsno',
    label: '샘플일련번호',
    field: 'sampleSsno',
    align: 'center'
  },
  {
    name: 'sampleDetailSsno',
    label: '샘플상세일련번호',
    field: 'sampleDetailSsno',
    align: 'center'
  },
  {
    name: 'sampleDetailContent1',
    label: '샘플상세내용1',
    field: 'sampleDetailContent1',
    align: 'left'
  },
  {
    name: 'sampleDetailContent2',
    label: '샘플상세내용2',
    field: 'sampleDetailContent2',
    align: 'left'
  },
  {
    name: 'sampleDetailContent3',
    label: '샘플상세내용3',
    field: 'sampleDetailContent3',
    align: 'left'
  }
])

// 샘플 목록 조회 api
const selectList = async () => {
  const result = await $fetch<ApiPagingResponse<Data[]>>(
    '/playground/public/sample/getSmpleList?page=' +
      (currentPage.value - 1) +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'GET'
    }
  )

  resData.value = result.data.content
  totalItems.value =
    result.data.totalElements !== undefined ? result.data.totalElements : 0
  totalPages.value = Math.ceil(
    totalItems.value / itemsPerPage.value !== 0
      ? Math.ceil(totalItems.value / itemsPerPage.value)
      : 1
  )
}

// 페이징이 바뀌었을 때 처리

watch([currentPage, itemsPerPage], () => {
  selectList()
})

// 화면 mount 된 시점 조회
onMounted(() => {
  selectList()
})

// 목록에서 상세조회 할 때
const clickRow = (evt: Event, row: Data) => {
  param.value = { ...row }
  showDetailDialog.value = true
}

const clickBtnModify = () => {
  if (selected.value == undefined || selected.value.length > 1) {
    $q.dialog({
      title: '알림',
      message: '항목은 1개만 선택 가능합니다.'
    }).onOk(() => {
      return
    })
  } else {
    param.value = { ...selected.value[0] }
    showUpdateDialog.value = true
  }
}

const clickBtnDetailList = async () => {
  if (selected.value == undefined || selected.value.length > 1) {
    $q.dialog({
      title: '알림',
      message: '항목은 1개만 선택 가능합니다.'
    }).onOk(() => {
      return
    })
  } else {
    searchDetail.value = { sampleSsno: selected.value[0].sampleSsno }

    await $fetch<ApiResponse<DetailData[]>>(
      '/playground/public/sample/getSmpleDetailList',
      {
        method: 'POST',
        body: JSON.stringify(searchDetail.value)
      }
    )
      .then((result) => {
        resDetailList.value = result.data
      })
      .catch((_error) => {})
      .finally(() => {
        showDetailListDialog.value = true
      })
  }
}

const closeUpdateDialog = () => {
  showUpdateDialog.value = false
}

interface updateData {
  sampleSsno: number
  sampleContent1: string
  sampleContent2: string
  sampleContent3: string
  useDate: string
  beginDate: string
  endDate: string
}

const updateForm = ref<updateData>()

// 디테일 화면에 전송하기 위한 파라미터
const updateparam = ref<updateData>({
  sampleSsno: 0,
  sampleContent1: '',
  sampleContent2: '',
  sampleContent3: '',
  useDate: '',
  beginDate: '',
  endDate: ''
})

const onUpdateSubmit = async () => {
  updateparam.value = { ...param.value }
  //console.log(param.value.beginEndDate.from)
  //console.log(param.value.beginEndDate.to)
  //updateparam.value.beginDate = param.value.beginEndDate.from
  //updateparam.value.endDate = param.value.beginEndDate.to

  try {
    // 저장 API 호출
    await $fetch<ApiResponse<Data[]>>('/playground/public/sample/modifySmple', {
      method: 'POST',
      body: JSON.stringify(updateparam.value)
    })
      .then(() => {
        $q.dialog({
          title: '알림',
          message: '저장이 완료되었습니다.'
        }).onOk(() => {
          router.go(0)
        })
      })
      .catch((error) => {
        console.error(error)
        $q.dialog({
          title: '오류',
          message: '저장이 실패하였습니다.'
        })
      })
  } catch (error) {
    console.error(error)
  }
}

const reset = (pageIdx: number, idx: string) => {
  if (idx == 'pageNum') {
    if (pageIdx == 0) {
      currentPage.value = 1
    } else {
      currentPage.value = pageIdx
    }
  } else {
    itemsPerPage.value = pageIdx
  }
}
</script>
