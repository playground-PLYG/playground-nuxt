<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="chat" /> 메뉴관리
      </div>
    </div>
    <div class="search">
      <q-form
        ref="searchForm"
        @submit="onSubmitSelect"
        @reset="onResetSelect"
      >
        <q-input outlined v-model="searchParam.menuNm" label="메뉴명" round dense flat class="input" />
        <q-input outlined v-model="searchParam.menuUrl" label="메뉴URL" round dense flat class="input" />
        <q-select outlined v-model="searchParam.useAt" :options="useAtSelectedOption" label="사용여부" round dense flat class="select"/>
        <!--(사용여부<q-checkbox v-model="useYnSelected" val="Y" label="Y" /><q-checkbox v-model="useYnSelected" val="N" label="N" />)-->
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn push class="button" color="green-7" label="초기화" type="reset" />
      </q-form>
    </div>
    <div class="table">
      <q-table
        :rows="resData"
        :columns="columns"
        row-key="menuSn"
        v-model:selected="selected"
        selection="multiple"
        :rows-per-page-options="[0]"
        @row-click="clickRow"
      />
    </div>
    <div>
      <paginationLayout :totalPage="totalPages" :currentPage="currentPage" @send-event="reset"/>
    </div>
    <div class="proc">
      <q-btn push class="button" color="primary" label="등록" @click="showInsertDialog = true"/>
      <q-btn push class="button" color="negative" label="삭제" />
      <q-btn push class="buttonR" color="warning" label="사용여부 변경"/>
    </div>
  </div>
  
  <div class="popup">
    <q-dialog
      v-model="showInsertDialog"
      @hide="onReset"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>등록</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form ref="insertForm">
                  <q-input v-model="param.menuNm" label="메뉴명" :rules="[(val: string) => !!val || '메뉴명' + ERROR_FIELD_EMPTY]" class="input" outlined />
                  <q-input v-model="param.menuUrl" label="메뉴URL" :rules="[(val: string) => !!val || '메뉴URL' + ERROR_FIELD_EMPTY]" class="input" outlined />
                  <q-input v-model="param.menuDepth" label="메뉴레벨" :rules="[(val: string) => !!val || '메뉴레벨' + ERROR_FIELD_EMPTY]" class="input" outlined />
                  <q-input v-model="param.menuSortOrdr" label="정렬순서" :rules="[(val: string) => !!val || '정렬순서' + ERROR_FIELD_EMPTY]" class="input" outlined />
                  <q-input v-model="param.upperMenuSn" label="상위메뉴ID" style="padding-bottom: 20px;" class="input" outlined />
                  <q-select outlined v-model="param.useAt" :options="useOptions" label="사용여부" class="select" />
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title></q-toolbar-title>
            <q-btn push color="primary" label="저장" @click="onSubmit" />
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>
  </div>

  <div class="popup">
    <q-dialog
      v-model="showUpdateDialog"
      @hide="onReset"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">메뉴 수정</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="insertForm">
            <q-input v-model="param.menuNm" label="메뉴명" :rules="[(val: string) => !!val || '메뉴명' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuUrl" label="메뉴URL" :rules="[(val: string) => !!val || '메뉴URL' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuDepth" label="메뉴레벨" :rules="[(val: string) => !!val || '메뉴레벨' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuSortOrdr" label="정렬순서" :rules="[(val: string) => !!val || '정렬순서' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.upperMenuSn" label="상위메뉴ID" style="padding-bottom: 20px;" class="input" outlined />
            <q-select outlined v-model="param.useAt" :options="useOptions" label="사용여부" class="select" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="수정" @click="onSubmit" />
          <q-btn flat text-color="black" label="닫기" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type ApiResponse } from '../../interface/server';
import { type QTableProps } from 'quasar';
import paginationLayout from '../../components/Pagination.vue';

const router = useRouter();
const insertForm = ref<any>();
const searchForm = ref<any>();

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
let totalItems = ref<number | undefined>() // 데이터의 개수에 따라 페이지네이션 UI에 그려지는 숫자 리스트

const ERROR_FIELD_EMPTY = "(은)는 필수값입니다.";

interface Data {
  menuSn: number,
  menuNm: string,
  menuUrl: string,
  menuDepth?: number,
  menuSortOrdr?: number,
  upperMenuSn: number,
  useAt: string,
  registUsrId: string,
  registDt: string,
  updtUsrId: string,
  updtDt: string
}

interface Form {
  menuSn: string,
  menuNm: string,
  menuUrl: string,
  menuDepth?: number,
  menuSortOrdr?: number,
  upperMenuSn: string,
  useAt: string,
  page?: number,
  size?: number
}

let resData = ref<Data[]>([]);

let param = ref<Form>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  upperMenuSn: '',
  useAt: '',
  page: currentPage.value - 1,
  size: itemsPerPage.value
})

let searchParam = ref<any>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  menuSortOrdr: '',
  upperMenuSn: '',
  useAt: ''
})

let useAtSelectedOption = [
    '전체', 'Y', 'N'
]

let selected = ref<any>();

let inputText = ref<any>();

let useYnSelected = ref<any>(['전체', 'Y', 'N']);

let showInsertDialog = ref<boolean>(false);

let showUpdateDialog = ref<boolean>(false);

const useOptions = ['','Y', 'N']

const searchOptions = [
  {
    label: '메뉴명',
    value: 'menuNm'
  },
  {
    label: '메뉴URL',
    value: 'menuUrl'
  }
]

const columns = ref<QTableProps["columns"]>([
  {
    name: 'menuSn',
    label: '메뉴ID',
    field: 'menuSn',
    align: 'center'
  },
  { name: 'menuNm', label: '메뉴명', field: 'menuNm', align: 'left' },
  { name: 'menuUrl', label: '메뉴URL', field: 'menuUrl', align: 'left' },
  { name: 'menuDepth', label: '메뉴레벨', field: 'menuDepth', align: 'center' },
  { name: 'menuSortOrdr', label: '정렬순서', field: 'menuSortOrdr', align: 'center' },
  { name: 'upperMenuSn', label: '상위메뉴ID', field: 'upperMenuSn', align: 'left' },
  { name: 'useAt', label: '사용여부', field: 'useAt', align: 'center' },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  { name: 'registDt', label: '등록일시', field: 'registDt', align: 'left' },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'left' }
])

const selectAllMenu = async () => {
  const result = await $fetch<ApiResponse<Data[]>>("/playground/public/menu/select-all", {
            method: 'POST',
            body: JSON.stringify(param.value)
        })
  resData.value = result.data.content
  totalItems.value = result.data.totalElements !== undefined ? result.data.totalElements : 0
  totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value !== 0 ? Math.ceil(totalItems.value / itemsPerPage.value) : 1)
}

const reset = (pageIdx: number) => {
  if(pageIdx == 0) {
    currentPage.value = 1
  } else {
    currentPage.value = pageIdx
  }
  param.value.page = currentPage.value - 1
}

watch(currentPage, () => {
  selectAllMenu()
})

const clickRow = (evt: any, row: any, index: any) => {
  param.value = { ...row }
  console.log("evt: ", evt, " row: ", row, " index: ", index)
  showUpdateDialog.value = true
}

const onSubmit = async () => {
  // 저장 API 호출
  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/menu/save", 
    {
        method: 'POST',
        body: JSON.stringify(param.value)
    })
    .then(() => {
      alert('저장이 완료되었습니다.')
      // router.push('/menu-manage')
      // navigateTo('/menu-manage')
      // refreshNuxtData()
      // window.location.reload()
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('저장되지 않았습니다. 잠시 후에 다시 시도 해 주세요.')
    })
}

const onReset = () => {
  param.value = {
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    upperMenuSn: '',
    useAt: ''
  }
}

const onSubmitSelect = async () => {
  // validation
  if (isEmpty(searchParam.value.menuNm) && isEmpty(searchParam.value.menuUrl)) {
    alert('검색어를 적어도 하나 이상 입력 해 주세요.')
    return
  }
  if (isEmpty(useYnSelected.value)) {
    alert('사용여부를 적어도 하나 이상 선택 해 주세요.')
    return
  }

  // 사용여부 선택 시 param 에 값 할당
  searchParam.value.useYn = (useYnSelected.value.length == 1) ? useYnSelected.value[0] : ''

  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/menu/select-by-condition", 
    {
        method: 'POST',
        body: JSON.stringify(searchParam.value)
    })
  .then((result) => {
    resData.value = result.data
  })
  .catch((error) => {
    console.error(error)
  })
}

const onResetSelect = () => {
  searchParam.value = {
    menuId: '',
    menuNm: '',
    menuUrl: '',
    menuLvl: '',
    menuSortOrder: '',
    parentMenuId: '',
    useYn: ''
  }
  selected.value = undefined
  inputText.value = undefined
  useYnSelected.value = ['Y', 'N']
}

const isEmpty = (val: any) => val == null || !(Object.keys(val) || val).length;

// If typescript compiler is yelling because of the type `any`
// const isEmpty = (val: Record<string, unknown> | null | undefined) =>
//   val == null || !(Object.keys(val) || val).length;

onMounted(() => {
  selectAllMenu()
})

</script>
<style>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}

.search {
  margin-top: 2rem;
}

.search .select {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .input {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .button {
  margin-right: 0.5rem;
}

.table {
  margin-top: 1rem;
}

.proc {
  margin-top: 1rem;
}

.proc .button {
  margin-right: 0.5rem;
}

.proc .buttonR {
  margin-left: 0.5rem;
  float: right;
}

</style>