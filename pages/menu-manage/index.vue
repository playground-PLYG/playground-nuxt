<template>
  <div class="search">
    <q-form
      ref="searchForm"
      @submit="onSubmitSelect"
      @reset="onResetSelect"
    >
      <q-input outlined v-model="searchParam.menuNm" label="메뉴명" round dense flat class="input" />
      <q-input outlined v-model="searchParam.menuUrl" label="메뉴URL" round dense flat class="input" />
      (사용여부<q-checkbox v-model="useYnSelected" val="Y" label="Y" /><q-checkbox v-model="useYnSelected" val="N" label="N" />)
      <q-btn color="primary" label="조회" type="submit" class="button" /><q-btn color="white" text-color="black" label="초기화" type="reset" class="button" />
    </q-form>
  </div>
  <div class="table">
    <q-table
      title="Menu"
      :rows="resData"
      :columns="columns"
      :rows-per-page-options="[0]"
      @row-click="clickRow"
    />
    <q-btn color="primary" label="등록" style="margin-top: 1rem;" @click="showInsertDialog = true"/>
  </div>
  <div>
    <q-dialog
      v-model="showInsertDialog"
      @hide="onReset"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">메뉴 등록</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="insertForm">
            <q-input v-model="param.menuNm" label="메뉴명" :rules="[val => !!val || '메뉴명' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuUrl" label="메뉴URL" :rules="[val => !!val || '메뉴URL' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuLvl" label="메뉴레벨" :rules="[val => !!val || '메뉴레벨' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuSortOrder" label="정렬순서" :rules="[val => !!val || '정렬순서' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.parentMenuId" label="상위메뉴ID" style="padding-bottom: 20px;" class="input" outlined />
            <q-select outlined v-model="param.useYn" :options="useOptions" label="사용여부" class="select" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="등록" @click="onSubmit" />
          <q-btn flat text-color="black" label="닫기" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <div>
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
            <q-input v-model="param.menuNm" label="메뉴명" :rules="[val => !!val || '메뉴명' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuUrl" label="메뉴URL" :rules="[val => !!val || '메뉴URL' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuLvl" label="메뉴레벨" :rules="[val => !!val || '메뉴레벨' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuSortOrder" label="정렬순서" :rules="[val => !!val || '정렬순서' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.parentMenuId" label="상위메뉴ID" style="padding-bottom: 20px;" class="input" outlined />
            <q-select outlined v-model="param.useYn" :options="useOptions" label="사용여부" class="select" />
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

const router = useRouter();
const insertForm = ref<any>();
const searchForm = ref<any>();

const ERROR_FIELD_EMPTY = "(은)는 필수값입니다.";

interface Data {
  menuId: string,
  menuNm: string,
  menuUrl: string,
  menuLvl: string,
  menuSortOrder: string,
  parentMenuId: string,
  regMbrNo: string,
  regDt: string,
  mdfcnMbrNo: string,
  mdfcnDt: string,
  useYn: string
}

interface Form {
  menuId: string,
  menuNm: string,
  menuUrl: string,
  menuLvl: string,
  menuSortOrder: string,
  parentMenuId: string,
  useYn: string
}

let resData = ref<Data[]>();

let param = ref<Form>({
  menuId: '',
  menuNm: '',
  menuUrl: '',
  menuLvl: '',
  menuSortOrder: '',
  parentMenuId: '',
  useYn: ''
})

let searchParam = ref<any>({
  menuId: '',
  menuNm: '',
  menuUrl: '',
  menuLvl: '',
  menuSortOrder: '',
  parentMenuId: '',
  useYn: ''
})

let selected = ref<any>();

let inputText = ref<any>();

let useYnSelected = ref<any>(['Y', 'N']);

let showInsertDialog = ref<boolean>(false);

let showUpdateDialog = ref<boolean>(false);

const useOptions = ['Y', 'N']

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
    name: 'menuId',
    label: '메뉴ID',
    field: 'menuId',
    align: 'center'
  },
  { name: 'menuNm', label: '메뉴명', field: 'menuNm', align: 'left' },
  { name: 'menuUrl', label: '메뉴URL', field: 'menuUrl', align: 'left' },
  { name: 'menuLvl', label: '메뉴레벨', field: 'menuLvl', align: 'center' },
  { name: 'menuSortOrder', label: '정렬순서', field: 'menuSortOrder', align: 'center' },
  { name: 'parentMenuId', label: '상위메뉴ID', field: 'parentMenuId', align: 'left' },
  { name: 'useYn', label: '사용여부', field: 'useYn', align: 'center' },
  { name: 'regMbrNo', label: '등록자', field: 'regMbrNo', align: 'left' },
  { name: 'regDt', label: '등록일시', field: 'regDt', align: 'left' },
  { name: 'mdfcnMbrNo', label: '수정자', field: 'mdfcnMbrNo', align: 'left' },
  { name: 'mdfcnDt', label: '수정일시', field: 'mdfcnDt', align: 'left' }
])

const selectAllMenu = async () => {
  const result = await $fetch<ApiResponse<Data[]>>("/playground/public/menu/select-all", {
            method: 'GET'
        })
  resData.value = result.data
}

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
    menuId: '',
    menuNm: '',
    menuUrl: '',
    menuLvl: '',
    menuSortOrder: '',
    parentMenuId: '',
    useYn: ''
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
.search {
  margin-top: 3rem;
  margin-left: 5rem;
}

.search .select {
  display: inline-block;
  vertical-align: middle;
  width: 10%;
  padding-right: 1rem;
}

.search .input {
  display: inline-block;
  vertical-align: middle;
  width: 20%;
  padding-right: 1rem;
}

.button {
  display: inline-block;
  margin-left: 1rem;
}

.table {
  margin-left: 5rem;
  margin-right: 5rem;
  margin-top: 1rem;
}

.form {
  margin-top: 7rem;
  margin-left: 5rem;
}

.form .input
, .form .select
{
  width: 20rem;
  padding-top: 5px;
}

.buttons {
  margin-top: 5rem;
  width: 100%;
  text-align: center;
}
</style>