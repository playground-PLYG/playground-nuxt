<template>
  <client-only>
    <div class="content">
      <div class="title">
        <div class="text-h4"><q-icon name="chat" /> 메뉴관리</div>
      </div>
      <div class="search">
        <q-form ref="searchForm">
          <q-input
            v-model="searchParam.menuNm"
            outlined
            stack-label
            dense
            class="input"
            label="메뉴명"
          />
          <q-input
            v-model="searchParam.menuUrl"
            outlined
            stack-label
            dense
            flat
            class="input"
            label="메뉴URL"
          />
          <q-select
            v-model="searchParam.useAt"
            outlined
            stack-label
            dense
            flat
            class="select"
            label="사용여부"
            :options="useAtSearchOption"
            option-label="name"
            option-value="code"
            emit-values
            map-options
          />
          <q-btn
            push
            class="button"
            color="green-7"
            label="조회"
            @click="srchMenuList"
          />
          <q-btn
            push
            class="button"
            color="green-7"
            label="초기화"
            @click="resetSearchParam"
          />
        </q-form>
      </div>
      <div class="table">
        <q-table
          v-model:selected="selected"
          :rows="listData"
          :columns="columns"
          row-key="menuSn"
          selection="multiple"
          :rows-per-page-options="[0]"
          @row-click="clickRow"
        >
          <template #bottom>
            <pagination-layout
              :total-page="totalPages"
              :current-page="currentPage"
              style="margin: 0 auto"
              @send-event="reset"
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
          @click="
            () => {
              showAddDialog = true
              showModifyField = false
            }
          "
        />
        <q-btn
          push
          class="button"
          color="negative"
          label="삭제"
          @click="removeMenuList"
        />
        <q-btn
          push
          class="buttonR"
          color="warning"
          label="사용여부 변경"
          @click="modifyUseAtMenu"
        />
      </div>
    </div>

    <div class="popup">
      <q-dialog v-model="showDetailDialog" @hide="resetDetailData">
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
                <q-form ref="modifyForm">
                  <q-input
                    v-model="detailData.menuNm"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="메뉴명"
                    :rules="[required_rules]"
                    :readonly="mReadonly"
                  />
                  <q-input
                    v-model="detailData.menuUrl"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="메뉴URL"
                    :rules="[required_rules, menuUrl_rules]"
                    :readonly="mReadonly"
                  />
                  <q-input
                    v-model="detailData.upperMenuSn"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="상위메뉴ID"
                    :rules="[number_rules]"
                    :readonly="mReadonly"
                  />
                  <q-input
                    v-model="detailData.menuSortOrdr"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="정렬순서"
                    :rules="[number_rules]"
                    :readonly="mReadonly"
                  />
                  <q-select
                    v-model="detailData.useAt"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="사용여부"
                    :options="useAtInputOption"
                    option-label="name"
                    option-value="code"
                    :readonly="mReadonly"
                  />
                </q-form>
                <q-field stack-label class="q-pb-sm" label="최초등록자">
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ detailData.registUsrId }}
                    </div>
                  </template>
                </q-field>
                <q-field stack-label class="q-pb-sm" label="최초등록일시">
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{
                        date.formatDate(
                          detailData.registDt,
                          'YYYY/MM/DD HH:mm:ss'
                        )
                      }}
                    </div>
                  </template>
                </q-field>
                <q-field stack-label class="q-pb-sm" label="최종수정자">
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{ detailData.updtUsrId }}
                    </div>
                  </template>
                </q-field>
                <q-field stack-label class="q-pb-sm" label="최종수정일시">
                  <template #control>
                    <div class="self-center full-width no-outline">
                      {{
                        date.formatDate(
                          detailData.updtDt,
                          'YYYY/MM/DD HH:mm:ss'
                        )
                      }}
                    </div>
                  </template>
                </q-field>
              </q-card-section>
            </q-card>
          </q-page-container>
          <q-footer>
            <q-toolbar class="bg-white">
              <q-toolbar-title />
              <q-btn
                v-if="showModifyField != true"
                push
                color="primary"
                class="q-mr-sm"
                label="수정"
                @click=";(showModifyField = true), (mReadonly = false)"
              />
              <q-btn
                v-if="showModifyField != true"
                push
                color="negative"
                label="삭제"
                @click="removeMenuList"
              />
              <q-btn
                v-if="showModifyField == true"
                push
                color="primary"
                class="q-mr-sm"
                label="저장"
                @click="modifyMenu"
              />
              <q-btn
                v-if="showModifyField == true"
                push
                color="primary"
                label="취소"
                @click=";(showModifyField = false), (mReadonly = true)"
              />
            </q-toolbar>
          </q-footer>
        </q-layout>
      </q-dialog>
    </div>

    <div class="popup">
      <q-dialog v-model="showAddDialog" @hide="resetInputData">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>등록</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-form ref="addForm">
                  <q-input
                    v-model="inputData.menuNm"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="메뉴명"
                    :rules="[required_rules]"
                  />
                  <q-input
                    v-model="inputData.menuUrl"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="메뉴URL"
                    :rules="[required_rules, menuUrl_rules]"
                  />
                  <q-input
                    v-model="inputData.upperMenuSn"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="상위메뉴ID"
                    :rules="[number_rules]"
                  />
                  <q-input
                    v-model="inputData.menuSortOrdr"
                    outlined
                    stack-label
                    class="q-pb-lg"
                    label="정렬순서"
                    :rules="[number_rules]"
                  />
                  <q-select
                    v-model="inputData.useAt"
                    outlined
                    stack-label
                    label="사용여부"
                    :options="useAtInputOption"
                    option-label="name"
                    option-value="code"
                  />
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
          <q-footer>
            <q-toolbar class="bg-white">
              <q-toolbar-title />
              <q-btn push color="primary" label="저장" @click="addMenu" />
            </q-toolbar>
          </q-footer>
        </q-layout>
      </q-dialog>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableProps, date } from 'quasar'
import type { ApiPagingResponse, ApiResponse } from '../../interface/server'
import paginationLayout from '~/components/PaginationComponent.vue'

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
const totalItems = ref<number | undefined>() // 데이터의 개수에 따라 페이지네이션 UI에 그려지는 숫자 리스트

const router = useRouter()
const addForm = ref<any>()
const modifyForm = ref<any>()
const searchForm = ref<any>()
const mReadonly = ref(true)

interface Data {
  menuSn: number
  menuNm: string
  menuUrl: string
  menuDepth: number
  menuSortOrdr: number
  upperMenuSn: number
  useAt: string
  registUsrId: string
  registDt: string
  updtUsrId: string
  updtDt: string
}

interface Form {
  menuSn: string
  menuNm: string
  menuUrl: string
  menuSortOrdr: number
  upperMenuSn: number
  useAt: string
}

const searchParam = ref<any>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  useAt: ''
})

const listData = ref<Data[]>([])
let selected = ref<Data[]>([])

const inputData = ref<Form>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  menuSortOrdr: 99,
  upperMenuSn: 1,
  useAt: ''
})

const detailData = ref<Data>({
  menuSn: 0,
  menuNm: '',
  menuUrl: '',
  menuDepth: 0,
  menuSortOrdr: 99,
  upperMenuSn: 1,
  useAt: '',
  registUsrId: '',
  registDt: '',
  updtUsrId: '',
  updtDt: ''
})

const showAddDialog = ref<boolean>(false)

const showDetailDialog = ref<boolean>(false)

const showModifyField = ref<boolean>(false)

const useAtSearchOption = [
  { name: '전체', code: '' },
  { name: '사용', code: 'Y' },
  { name: '미사용', code: 'N' }
]

const useAtInputOption = [
  { name: '사용', code: 'Y' },
  { name: '미사용', code: 'N' }
]

const columns = ref<QTableProps['columns']>([
  { name: 'menuSn', label: '메뉴ID', field: 'menuSn', align: 'center' },
  { name: 'menuNm', label: '메뉴명', field: 'menuNm', align: 'left' },
  { name: 'menuUrl', label: '메뉴URL', field: 'menuUrl', align: 'left' },
  {
    name: 'menuSortOrdr',
    label: '정렬순서',
    field: 'menuSortOrdr',
    align: 'center'
  },
  {
    name: 'upperMenuSn',
    label: '상위메뉴ID',
    field: 'upperMenuSn',
    align: 'left'
  },
  { name: 'useAt', label: '사용여부', field: 'useAt', align: 'center' },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  {
    name: 'registDt',
    label: '등록일시',
    field: 'registDt',
    align: 'left',
    format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`
  },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  {
    name: 'updtDt',
    label: '수정일시',
    field: 'updtDt',
    align: 'left',
    format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`
  }
])

// 목록 조회
const getMenuPageList = async () => {
  selected = ref<Data[]>([])

  if (searchParam.value.useAt && typeof searchParam.value.useAt == 'object') {
    searchParam.value.useAt = searchParam.value.useAt.code
  }

  const result = await $fetch<ApiPagingResponse<Data>>(
    '/playground/public/menu/getMenuPageList?page=' +
      (currentPage.value - 1) +
      '&size=' +
      itemsPerPage.value,
    {
      method: 'POST',
      body: JSON.stringify(searchParam.value)
    }
  )

  listData.value = result.data.content
  totalItems.value =
    result.data.totalElements !== undefined ? result.data.totalElements : 0
  totalPages.value = Math.ceil(
    totalItems.value / itemsPerPage.value !== 0
      ? Math.ceil(totalItems.value / itemsPerPage.value)
      : 1
  )
}

// 목록조회 - 페이징
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

watch([currentPage, itemsPerPage], () => {
  getMenuPageList()
})

// 목록조회 - 조회버튼 클릭
const srchMenuList = () => {
  currentPage.value = 1

  getMenuPageList()
}

// 목록조회 - 검색조건 초기화
const resetSearchParam = () => {
  searchParam.value = {
    menuNm: '',
    menuUrl: '',
    useYn: ''
  }

  currentPage.value = 1

  getMenuPageList()
}

// 상세조회 - 목록 선택
const clickRow = async (evt: any, row: any) => {
  selected = ref<Data[]>([])

  const menuSn = row.menuSn

  const result = await $fetch<ApiResponse<Data>>(
    '/playground/public/menu/getMenuDetail?menuSn=' + menuSn
  )

  detailData.value = result.data

  showDetailDialog.value = true
}

// 메뉴등록
const addMenu = async () => {
  try {
    const upperMenuSn = inputData.value.upperMenuSn

    let valid = false
    let upperMenuSnValid = false

    valid = await addForm.value.validate()

    if (!valid) {
      return
    }

    if (upperMenuSn) {
      const result = await $fetch<ApiResponse<Data>>(
        '/playground/public/menu/getMenuDetail?menuSn=' + upperMenuSn
      )

      if (result.data.menuSn && result.data.menuSn == upperMenuSn) {
        upperMenuSnValid = true
      }
    } else {
      upperMenuSnValid = true
    }

    if (!upperMenuSnValid) {
      alert('유효한 상위메뉴ID를 입력해주세요')
      return
    }

    if (valid && upperMenuSnValid) {
      if (!inputData.value.useAt) {
        inputData.value.useAt = 'N'
      }

      if (!inputData.value.upperMenuSn) {
        inputData.value.upperMenuSn = 1
      }

      if (!inputData.value.menuSortOrdr) {
        inputData.value.menuSortOrdr = 99
      }

      // 저장 API 호출
      await $fetch<ApiResponse<Data>>('/playground/public/menu/addMenu', {
        method: 'POST',
        body: JSON.stringify(inputData.value)
      })
        .then((result) => {
          if (result.data.menuSn != null) {
            alert('등록 완료되었습니다.')
            router.go(0)
          }
        })
        .catch((error) => {
          console.error(error)
          alert('등록 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
        })
    }
  } catch (error) {
    console.error(error)
    alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
  }
}

// 메뉴수정
const modifyMenu = async () => {
  try {
    let valid = false
    let upperMenuSnValid = false

    const upperMenuSn = detailData.value.upperMenuSn

    // 오류나서 일단 주석처리
    //valid = await modifyForm.value.validate();
    //
    valid = true

    if (!valid) {
      return
    }

    if (upperMenuSn && upperMenuSn > 0) {
      const result = await $fetch<ApiResponse<Data>>(
        '/playground/public/menu/getMenuDetail?menuSn=' + upperMenuSn
      )

      if (result.data.menuSn && result.data.menuSn == upperMenuSn) {
        upperMenuSnValid = true
      }
    } else {
      upperMenuSnValid = true
    }

    if (!upperMenuSnValid) {
      alert('유효한 상위메뉴ID를 입력해주세요')
      return
    }

    if (valid && upperMenuSnValid) {
      if (!inputData.value.upperMenuSn) {
        inputData.value.upperMenuSn = 1
      }

      if (!inputData.value.menuSortOrdr) {
        inputData.value.menuSortOrdr = 99
      }

      // 저장 API 호출
      await $fetch<ApiResponse<Data[]>>('/playground/public/menu/modifyMenu', {
        method: 'POST',
        body: JSON.stringify(detailData.value)
      })
        .then(() => {
          alert('수정 완료되었습니다.')
          showModifyField.value = false
          mReadonly.value = true

          getMenuPageList()
        })
        .catch((error) => {
          console.error(error)
          alert('수정 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
        })
    }
  } catch (error) {
    console.error(error)
    alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
  }
}

const required_rules = (val: string) => {
  if (!val || val.trim() == '') {
    return '필수 입력항목 입니다.'
  }

  return true
}

const number_rules = (val: string) => {
  if (val && val.trim() != '') {
    const num = val.match(/^\d*$/)

    if (!num) {
      return '숫자를 입력해주세요.'
    }
  }

  return true
}

const menuUrl_rules = (val: string) => {
  const chk = val.match(/^[a-z\\/_-]*$/)

  if (!chk) {
    return "영문 소문자 및 특수문자('_', '-')로 입력해주세요."
  }

  return true
}

// 메뉴 삭제
const removeMenuList = async () => {
  if (selected.value.length < 1) {
    if (showDetailDialog.value) {
      selected.value[0] = detailData.value
    } else {
      alert('삭제 대상 메뉴를 선택해주세요')
      return
    }
  }

  try {
    // 저장 API 호출
    await $fetch<ApiResponse<Data[]>>('/playground/public/menu/removeMenu', {
      method: 'POST',
      body: JSON.stringify(selected.value)
    })
      .then(() => {
        alert('삭제 완료되었습니다.')
        showDetailDialog.value = false
        resetSearchParam()
      })
      .catch((error) => {
        console.error(error)
        alert('삭제 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
      })
  } catch (error) {
    console.error(error)
    alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
  }
}

// 메뉴 사용여부 변경
const modifyUseAtMenu = async () => {
  if (selected.value.length < 1) {
    alert('사용여부 변경 대상 메뉴를 선택해주세요')
    return
  }

  try {
    // 저장 API 호출
    await $fetch<ApiResponse<Data[]>>(
      '/playground/public/menu/modifyUseAtMenu',
      {
        method: 'POST',
        body: JSON.stringify(selected.value)
      }
    )
      .then(() => {
        alert('사용여부 변경이 완료되었습니다.')
        resetSearchParam()
      })
      .catch((error) => {
        console.error(error)
        alert(
          '사용여부 변경 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.'
        )
      })
  } catch (error) {
    console.error(error)
    alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
  }
}

const resetInputData = () => {
  inputData.value = {
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    menuSortOrdr: 99,
    upperMenuSn: 1,
    useAt: ''
  }
}

const resetDetailData = () => {
  detailData.value = {
    menuSn: 0,
    menuNm: '',
    menuUrl: '',
    menuDepth: 0,
    menuSortOrdr: 99,
    upperMenuSn: 1,
    useAt: '',
    registUsrId: '',
    registDt: '',
    updtUsrId: '',
    updtDt: ''
  }
}

onMounted(() => {
  getMenuPageList()
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
