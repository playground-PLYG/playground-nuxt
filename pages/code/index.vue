<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="school" /> 코드관리</div>
    </div>
    <div class="search">
      <q-form
        ref="searchForm"
        @submit="fn_srchCodeList"
        @reset="fn_codeSrchReset"
      >
        <q-input
          v-model="codeSrchReq.code"
          outlined
          stack-label
          label="코드ID"
          round
          dense
          flat
          class="input"
        />
        <q-input
          v-model="codeSrchReq.codeName"
          outlined
          stack-label
          label="코드명"
          round
          dense
          flat
          class="input"
        />
        <q-select
          v-model="codeSrchReq.groupCode"
          outlined
          stack-label
          :options="groupCdOptions"
          label="그룹코드여부"
          emit-value
          map-options
          round
          dense
          flat
          class="input"
        />
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn
          push
          class="button"
          color="green-7"
          label="초기화"
          type="reset"
        />
      </q-form>
    </div>
    <div class="table">
      <q-table
        v-model:selected="selectedItems"
        :rows="resData"
        :columns="columns"
        row-key="codeSerialNo"
        selection="multiple"
        :rows-per-page-options="[0]"
        @row-click="fn_openModifyCodePopup"
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
    <div class="proc">
      <q-btn
        push
        class="button"
        color="primary"
        label="등록"
        @click="fn_openAddCodePopup"
      />
      <q-btn
        push
        class="button"
        color="negative"
        label="삭제"
        @click="fn_removeCode"
      />
    </div>
    <div class="popup">
      <q-dialog ref="codeForm" v-model="isShowCodePopup" @hide="fn_codeReset">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>
                {{ popupTitle }}
              </q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-form @submit="fu_handleSubmit">
                  <q-card-section class="q-pt-none">
                    <q-input
                      v-model="param.code"
                      label="코드ID"
                      class="input"
                      outlined
                      :rules="[codeid_rules]"
                      :readonly="readonly"
                    />
                    <q-input
                      v-model="param.codeName"
                      label="코드명"
                      class="input"
                      outlined
                      :rules="[codeNm_rules]"
                      :readonly="readonly"
                    />
                    <q-checkbox
                      v-model="groupCdCheck"
                      left-label
                      label="상위코드 선택"
                      :disable="readonly"
                    />
                    <q-select
                      v-if="groupCdCheck"
                      v-model="param.upperCode"
                      outlined
                      :options="options"
                      :rules="[upCode_rules]"
                      emit-value
                      fill-input
                      hide-selected
                      input-debounce="0"
                      refresh
                      use-input
                      :readonly="readonly"
                      @filter="Fn_upCodefilter"
                    >
                      <template #option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.value }}</q-item-label>
                            <q-item-label caption>{{
                              scope.opt.label
                            }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <q-input
                      v-model="param.order"
                      label="정렬순번"
                      type="number"
                      class="input"
                      outlined
                      :rules="[sortSn_rules]"
                      :readonly="readonly"
                    />
                    <q-field
                      v-show="!isAdding"
                      stack-label
                      class="q-pb-sm"
                      label="최초등록자"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline">
                          {{ param.registUsrId }}
                        </div>
                      </template>
                    </q-field>
                    <q-field
                      v-show="!isAdding"
                      stack-label
                      class="q-pb-sm"
                      label="최초등록일시"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline">
                          {{
                            date.formatDate(
                              param.registDt,
                              'YYYY/MM/DD HH:mm:ss'
                            )
                          }}
                        </div>
                      </template>
                    </q-field>
                    <q-field
                      v-show="!isAdding"
                      stack-label
                      class="q-pb-sm"
                      label="최종수정자"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline">
                          {{ param.updtUsrId }}
                        </div>
                      </template>
                    </q-field>
                    <q-field
                      v-show="!isAdding"
                      stack-label
                      class="q-pb-sm"
                      label="최종수정일시"
                    >
                      <template #control>
                        <div class="self-center full-width no-outline">
                          {{
                            date.formatDate(param.updtDt, 'YYYY/MM/DD HH:mm:ss')
                          }}
                        </div>
                      </template>
                    </q-field>
                    <q-toolbar class="bg-white">
                      <q-toolbar-title />
                      <div class="proc">
                        <q-btn
                          v-show="readonly === true && !isAdding"
                          push
                          color="primary"
                          class="q-mr-sm"
                          label="수정"
                          @click="fn_modify"
                        />
                        <q-btn
                          v-show="isAdding"
                          push
                          color="primary"
                          label="저장"
                          type="submit"
                        />
                        <q-btn
                          v-show="readonly === false && !isAdding"
                          push
                          class="q-mr-sm"
                          color="primary"
                          label="저장"
                          type="submit"
                        />
                        <q-btn
                          v-show="readonly === true && !isAdding"
                          push
                          class="button"
                          color="negative"
                          label="삭제"
                          type="reset"
                          @click="fn_removeCode"
                        />
                        <q-btn
                          v-show="readonly === false && !isAdding"
                          push
                          color="primary"
                          label="취소"
                          @click="fn_cancel"
                        />
                      </div>
                    </q-toolbar>
                  </q-card-section>
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { type QTableProps, date, useQuasar } from 'quasar'
import type { PageListInfo } from '../../interface/server'
import paginationLayout from '../../components/Pagination.vue'
import { type ApiResponse } from '@/interface/server'
const { loading } = useQuasar()

const columns = ref<QTableProps['columns']>([
  {
    name: 'codeSerialNo',
    align: 'left',
    label: '코드일련번호',
    field: 'codeSerialNo',
    sortable: true
  },
  {
    name: 'code',
    align: 'left',
    label: '코드ID',
    field: 'code',
    sortable: true
  },
  {
    name: 'codeName',
    align: 'center',
    label: '코드명',
    field: 'codeName'
  },
  {
    name: 'upperCode',
    align: 'center',
    label: '상위코드ID',
    field: 'upperCode',
    sortable: true
  },
  {
    name: 'groupCode',
    align: 'center',
    label: '그룹코드사용여부',
    field: 'groupCode'
  },
  {
    name: 'order',
    align: 'center',
    label: '정렬순번',
    field: 'order',
    sortable: true
  },
  {
    name: 'registUsrId',
    align: 'center',
    label: '등록자',
    field: 'registUsrId'
  },
  {
    name: 'registDt',
    align: 'center',
    label: '등록일시',
    field: 'registDt',
    format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`
  },
  {
    name: 'updtUsrId',
    align: 'center',
    label: '수정자',
    field: 'updtUsrId'
  },
  {
    name: 'updtDt',
    align: 'center',
    label: '수정일시',
    field: 'updtDt',
    format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`
  }
])

const isShowCodePopup = ref<boolean>(false) // 코드 팝업 표시 여부
const isAdding = ref<boolean>(true) // 코드 추가 여부
const popupTitle = ref<string>('메뉴 등록')
const resData = ref<Data[]>([])
const allCodeData = ref<Data[]>()
const selectedItems = ref<Data[]>([]) // 선택된 항목들
const groupCdCheck = ref<boolean>(false) // 그룹 코드 사용 여부 체크
const readonly = ref<boolean>(true)
let uppercodeList: Option[] = [] // 상위 코드 목록
const oldData = ref<Data>() //기존데이터

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
const totalItems = ref<number | undefined>()

const groupCdOptions = [
  { label: '전체', value: '' },
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' }
]

//상위코드 선택옵션 데이터타입
interface Option {
  label: string
  value: string
}

interface Data {
  codeSerialNo?: string
  code: string
  codeName: string
  upperCode: string
  groupCode: string
  order?: number
  registUsrId: string
  registDt: string
  updtUsrId: string
  updtDt: string
}

const codeSrchReq = ref<Pick<Data, 'code' | 'codeName' | 'groupCode'>>({
  code: '',
  codeName: '',
  groupCode: ''
})

const param = ref<Data>({
  codeSerialNo: '',
  code: '',
  codeName: '',
  upperCode: '',
  groupCode: '',
  order: 0,
  registUsrId: '',
  registDt: '',
  updtUsrId: '',
  updtDt: ''
})

const codeid_rules = (val: string) => {
  if (!val) {
    return '코드ID를 입력해주세요.'
  }
  return true
}

const codeNm_rules = (val: string) => {
  if (!val) {
    return '코드명을 입력해주세요.'
  }
  return true
}

const upCode_rules = (val: string) => {
  if (!val) {
    return '코드를 선택해주세요.'
  }
  return true
}

const sortSn_rules = (val: string) => {
  if (!val) {
    return '정렬순번을 입력해주세요.'
  }
  return true
}

const options = ref(uppercodeList)

//상위코드 검색필터
const Fn_upCodefilter = (val: string, update: (arg0: () => void) => void) => {
  update(() => {
    // 소문자로 변환
    const needle = val.toLocaleLowerCase()

    options.value = uppercodeList.filter((v) => {
      // 상위코드를 소문자로 변환
      const vlaLower = v.value.toLocaleLowerCase()
      //해당 값이 있는지 확인
      return vlaLower.includes(needle)
    })
  })
}

// 코드 등록 팝업 열기
const fn_openAddCodePopup = () => {
  isShowCodePopup.value = true
  fn_openCodePopup(true)
  readonly.value = false
}

//코드 수정
const fn_openModifyCodePopup = (_evt: Event, row: Data, _index: number) => {
  oldData.value = { ...row }
  param.value = { ...row }

  groupCdCheck.value = param.value.groupCode === 'Y' ? false : true
  isShowCodePopup.value = true
  fn_openCodePopup(false)
}

// 코드 팝업 열기
const fn_openCodePopup = (adding: boolean) => {
  isAdding.value = adding
  popupTitle.value = adding ? '코드 등록' : '코드 상세'
}

//코드 수정 활성화
const fn_modify = () => {
  readonly.value = false
  popupTitle.value = '코드 수정'
}

//코드 수정 취소
const fn_cancel = () => {
  readonly.value = true
  popupTitle.value = '코드 상세'
}

//submit 이벤트 핸들러
const fu_handleSubmit = () => {
  if (isAdding.value) {
    fn_addCode()
  } else {
    fn_modifyCode()
  }
}

//코드 등록
const fn_addCode = async () => {
  // 그룹 코드 사용 여부에 따라 그룹 코드 설정
  const isGroupCodeUsed = groupCdCheck.value
  param.value.groupCode = isGroupCodeUsed && param.value.upperCode ? 'N' : 'Y'
  param.value.upperCode = isGroupCodeUsed ? param.value.upperCode : ''

  loading.show()

  await $fetch<ApiResponse<Data[]>>('/playground/public/code/addCode', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
    .then(() => {
      alert('등록되었습니다.')
      fn_codeReset()
    })
    .catch((error) => {
      console.error(error)
      alert('등록되지 않았습니다.')
    })

  loading.hide()
}

// 코드 수정
const fn_modifyCode = async () => {
  // 그룹 코드 사용 여부에 따라 그룹 코드 설정
  const isGroupCodeUsed = groupCdCheck.value
  param.value.groupCode = isGroupCodeUsed && param.value.upperCode ? 'N' : 'Y'
  param.value.upperCode = isGroupCodeUsed ? param.value.upperCode : ''

  //기존 row데이터와 수정된 param
  if (JSON.stringify(param.value) === JSON.stringify(oldData.value)) {
    alert('변경된 내용이 없습니다.')
    return
  }

  loading.show()

  await $fetch<ApiResponse<Data[]>>('/playground/public/code/addCode', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
    .then(() => {
      alert('수정되었습니다.')
      fn_codeReset()
    })
    .catch((error) => {
      console.error(error)
      alert('수정되지 않았습니다.')
    })

  loading.hide()
}

//코드 조회
const fn_getCodeList = async () => {
  await $fetch<ApiResponse<PageListInfo<Data>>>(
    '/playground/public/code/getCodePageList?page=' +
      (currentPage.value - 1) +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'POST',
      body: JSON.stringify(codeSrchReq.value)
    }
  )
    .then((result) => {
      resData.value = result.data.content

      totalItems.value = result.data.totalElements ?? 0

      totalPages.value = Math.ceil(
        totalItems.value / itemsPerPage.value !== 0
          ? Math.ceil(totalItems.value / itemsPerPage.value)
          : 1
      )
    })
    .catch((error) => {
      console.error(error)
      alert('코드리스트가 조회되지 않았습니다.')
    })
}

// 목록조회 - 조회버튼 클릭
const fn_srchCodeList = () => {
  currentPage.value = 1

  fn_getCodeList()
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
  fn_getCodeList()
})

//상위 코드 조회
const fn_getUpCodeList = async () => {
  await $fetch<ApiResponse<Data[]>>('/playground/public/code/getAllCodeList', {
    method: 'GET'
  })
    .then((result) => {
      allCodeData.value = result.data

      // 그룹 코드인 항목만 필터링
      const filterOptions = allCodeData.value
        .filter((item) => item.groupCode === 'Y')
        .map((item) => ({ label: item.codeName, value: item.code }))

      // 중복 제거 후 정렬
      const uniqueSort = [...new Set(filterOptions)].sort((a, b) =>
        a.value.localeCompare(b.value)
      )

      uppercodeList = uniqueSort
    })
    .catch((error) => {
      console.error(error)
      alert('조회되지 않았습니다.')
    })
}

//코드 삭제
const fn_removeCode = async () => {
  if (!isShowCodePopup.value) {
    if (!selectedItems.value || selectedItems.value.length === 0) {
      return alert('삭제할 코드를 선택해 주세요.')
    }
  }
  const codeNames = selectedItems?.value
    ?.map((item) => item.codeName)
    .join(', ')

  const paramCodeName = !isAdding.value ? param.value.codeName : ''

  if (
    confirm(
      `선택한 코드를 정말 삭제하시겠습니까?\n\n 코드 : ${codeNames}${paramCodeName}`
    )
  ) {
    try {
      const itemsDelete = !isAdding.value ? [param.value] : selectedItems.value

      loading.show()

      await $fetch<ApiResponse<Data[]>>('/playground/public/code/removeCode', {
        method: 'POST',
        body: JSON.stringify(itemsDelete)
      })
      alert('삭제되었습니다.')
      fn_codeReset()
    } catch (error) {
      console.error(error)
      alert('삭제되지 않았습니다.')
    }

    loading.hide()
  } else {
    alert('삭제가 취소되었습니다.')
    selectedItems.value = []
  }
}

// 목록조회 - 검색조건 초기화
const fn_codeSrchReset = () => {
  codeSrchReq.value = {
    code: '',
    codeName: '',
    groupCode: ''
  }

  currentPage.value = 1

  fn_getCodeList()
}

const fn_codeReset = () => {
  readonly.value = true
  isShowCodePopup.value = false
  groupCdCheck.value = false
  selectedItems.value = []

  param.value = {
    codeSerialNo: '',
    code: '',
    codeName: '',
    upperCode: '',
    groupCode: '',
    order: 0,
    registUsrId: '',
    registDt: '',
    updtUsrId: '',
    updtDt: ''
  }
  fn_getCodeList()
  fn_getUpCodeList()
}

onMounted(() => {
  fn_getUpCodeList()
  fn_getCodeList()
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
    .button {
      margin-right: 0.5rem;
    }
  }

  .table {
    margin-top: 1rem;

    .items-center {
      padding: 0;
      .flex-center {
        padding: 0;
      }
    }
  }

  .proc {
    margin-top: 1rem;
    padding-bottom: 1rem;

    .button {
      margin-right: 0.5rem;
    }
    .buttonR {
      margin-left: 0.5rem;
      float: right;
    }
  }
}
</style>
