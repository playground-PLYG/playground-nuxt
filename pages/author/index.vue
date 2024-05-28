<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="rss_feed" /> 권한관리
      </div>
    </div>
    <div class="search">
      <q-form @submit="getAuthorList" @reset="onResetSelect">
        <q-input outlined v-model="searchParam.authorId" label="권한ID" round dense flat class="input" />
        <q-input outlined v-model="searchParam.authorNm" label="권한명" round dense flat class="input" />
        <q-select outlined v-model="searchParam.deleteAt" :options="searchOptions" label="삭제여부" round dense flat
          class="select" emit-value map-options />
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn push class="button" color="green-7" label="초기화" type="reset" />
      </q-form>
    </div>
    <div class="table">
      <q-table :rows="resData" :columns="columns" row-key="authorId" v-model:selected="selected" selection="single"
        :rows-per-page-options="[0]" @row-click="clickRow" />
    </div>
    <div class="proc">
      <q-btn push class="button" color="primary" label="등록" @click="showInsertDialog = true" />
      <q-btn push class="button" color="primary" label="권한별 메뉴 등록" @click="clickAuthorMenuAdd" />
      <!--<q-btn push class="button" color="negative" label="삭제" @click="removeAuthor" />-->
    </div>
  </div>

  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="showUpdateDialog" @hide="onReset">
      <q-card style="width: 600px; max-width: 100vw; ">
        <q-toolbar class="bg-primary">
          <q-toolbar-title style="color: white;">권한수정</q-toolbar-title>
          <q-btn flat v-close-popup round dense icon=" close" style="color: white;" />
        </q-toolbar>
        <q-card-section>
          <q-form @submit="modifySubmit">
            <q-input v-model="param.authorId" label="권한ID" class="input" :rules="[nm_rules]" outlined :readonly="readonly" />
            <q-input v-model="param.authorNm" label="권한명" class="input" :rules="[nm_rules]" outlined />
            <q-select outlined v-model="param.deleteAt" emit-value map-options :options="inputOptions" label="삭제여부"
              class="select" :rules="[select_rules]" />
            <q-input v-model="param.registDt" label="등록일시" class="input" :rules="[nm_rules]" outlined :readonly="readonly" />
            <q-input v-model="param.updtDt" label="수정일시" class="input" :rules="[nm_rules]" outlined :readonly="readonly" />
            <q-toolbar class="bg-white">
              <q-toolbar-title></q-toolbar-title>
              <q-btn push color="primary" label="수정" type="submit" @click="modifyAuthor" />
            </q-toolbar>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>

  <div class="popup">
    <q-dialog v-model="showInsertDialog">
      <q-layout container>
        <q-header>
          <q-toolbar class="bg-primary">
            <q-toolbar-title>등록</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form @submit="onSubmit">
                <q-input v-model="param.authorId" label="권한ID" class="input" outlined :rules="[nm_rules]" />
                <q-input v-model="param.authorNm" label="권한명" class="input" outlined :rules="[nm_rules]" />
                <q-toolbar class="bg-white">
                  <q-toolbar-title></q-toolbar-title>
                  <q-btn push color="primary" label="등록" type="submit" />
                </q-toolbar>
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>

  <div class="popup">
      <q-dialog v-model="showMenuMapngDialog">
        <q-layout container style="width: 800px; max-width: 100vw;">
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>권한메뉴매핑</q-toolbar-title>
              <q-btn flat v-close-popup round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-input v-model="MenuParam.authorId" label="권한ID" class="input" outlined :readonly="true" />
                <q-table :rows="resMenuData" row-key="menuSn" :columns="MenuColumns"
                    v-model:selected="menuSelected"
                    selection="single"
                    :rows-per-page-options="[0]"
                    @selection="clickMenuRow"/>
              </q-card-section>
              <q-toolbar class="bg-white">
                <q-toolbar-title></q-toolbar-title>
                <div class="q-gutter-md row items-start">
                  <q-btn push color="primary" label="등록" type="submit" @click="addMenuMapng" />
                  <q-btn push color="primary" label="삭제" type="submit" @click="removeMenuMapng" />
                </div>
              </q-toolbar>
            </q-card>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type ApiResponse } from '../../interface/server';
import { useQuasar } from 'quasar';
import { type QTableProps } from 'quasar';
import type { PiniaVuePlugin } from 'pinia';

const router = useRouter();
const { loading } = useQuasar();

// 권한 데이터 구조
interface Data {
  authorId: string,
  authorNm: string,
  deleteAt: string,
  registUsrId: string,
  registDt: string
  updtUsrId: string,
  updtDt: string
}

// 권한 상세 데이터 구조
interface AuthorData {
  authorId?: string,
  authorNm: string,
  deleteAt: string,
  registDt?: string | undefined,
  updtDt?: string | undefined
}

interface MenuData {
  authorId?: string,
  authorNm: string,
  menuSn: number,
  menuNm: string,
  menuUrl: string,
  authorMenuAddAt: string
}

let param = ref<AuthorData>({
  authorId: '',
  authorNm: '',
  deleteAt: 'N',
  registDt: '',
  updtDt: ''
})

let searchParam = ref<AuthorData>({
  authorId: '',
  authorNm: '',
  deleteAt: ''
})

let MenuParam = ref<MenuData>({
  authorId: '',
  authorNm: '',
  menuSn: 0,
  menuNm: '',
  menuUrl: '',
  authorMenuAddAt: ''
})

let resData = ref<Data[]>([]);
let resMenuData = ref<MenuData[]>([]);

let selected = ref<any[]>();
let menuSelected = ref<any>();

let showInsertDialog = ref<boolean>(false);
let showUpdateDialog = ref<boolean>(false);
let showMenuMapngDialog = ref<boolean>(false);
let readonly = ref(true);
let modifyClick = '';

const searchOptions = [
  { label: '전체', value: '' },
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' }
]

const inputOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' }
]

const nm_rules = (val: string) => {
  if (!val) {
    return '값을 입력해주세요.';
  }
  return true;
}

const select_rules = (val: string) => {
  if (!val) {
    return '값을 선택해주세요.';
  }
  return true;
}

const columns = ref<QTableProps["columns"]>([
  { name: 'authorId', label: '권한ID', field: 'authorId', align: 'center' },
  { name: 'authorNm', label: '권한명', field: 'authorNm', align: 'left' },
  { name: 'deleteAt', label: '삭제여부', field: 'deleteAt', align: 'center' },
  { name: 'registUsrId', label: '등록사용자ID', field: 'registUsrId', align: 'left' },
  { name: 'registDt', label: '등록일시', field: 'registDt', align: 'center' },
  { name: 'updtUsrId', label: '수정사용자ID', field: 'updtUsrId', align: 'left' },
  { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'center' }
])

const MenuColumns = ref<QTableProps["columns"]>([
    { name: 'menuSn', align: 'center', label: '메뉴일련번호', field: 'menuSn', sortable: false },
    { name: 'menuNm', align: 'center', label: '메뉴명', field: 'menuNm', sortable: false },
    { name: 'menuUrl', align: 'center', label: '메뉴URL', field: 'menuUrl', sortable: false },
    { name: 'authorMenuAddAt', align: 'center', label: '메뉴등록여부', field: 'authorMenuAddAt', sortable: false }
])


const clickRow = (evt: Event, row: any, index: number) => {
  param.value = { ...row }
  showUpdateDialog.value = true
}

const onResetSelect = () => {
  searchParam.value = {
    authorId: '',
    authorNm: '',
    deleteAt: 'N'
  }
  selected.value = undefined
}

const onReset = () => {
  param.value = {
    authorId: '',
    authorNm: '',
    deleteAt: 'N'
  }
  readonly.value = true;
  modifyClick = '';
}

const getAuthorList = async () => {
  
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/author/getAuthorList",
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
  loading.hide()
}

const onSubmit = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/author/addAuthor",
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    })
    .then(() => {
      alert('등록되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('등록되지 않았습니다.')
    })
  loading.hide()
}

const modifySubmit = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/author/modifyAuthor",
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    })
    .then(() => {
      alert('수정되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('수정되지 않았습니다.')
    })
  loading.hide()
}


const removeAuthor = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/author/removeAuthor",
    {
      method: 'POST',
      body: JSON.stringify(selected.value)
    })
    .then(() => {
      alert('삭제되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('삭제되지 않았습니다.')
    })
  loading.hide()
}

const modifyAuthor = async () => {
  readonly.value = false;
  modifyClick = '수정';
}

const clickAuthorMenuAdd = async () => {
  if (typeof selected.value === 'undefined') {
    alert("메뉴 등록할 권한을 선택해주시기 바랍니다.")
    return
  }
 
  loading.show()
  await $fetch<ApiResponse<MenuData[]>>(
    "/playground/public/author/getAuthorMenuList",
    {
      method: 'POST',
      body: JSON.stringify(selected.value[0])
    })
    .then((result) => {
      resMenuData.value = result.data
      showMenuMapngDialog.value = true
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const clickMenuRow = async (details: any) => {
  MenuParam.value = details.rows[0]
}

const addMenuMapng = async () => {
  if(MenuParam.value.authorMenuAddAt == "Y"){
    alert("권한 중복 매핑은 불가합니다.")
    return
  }
  loading.show()
  await $fetch<ApiResponse<MenuData[]>>(
    "/playground/public/author/addAuthorMenu",
    {
      method: 'POST',
      body: JSON.stringify(MenuParam.value)
    })
    .then(() => {
      alert(MenuParam.value.authorId + '권한별 메뉴가 등록되었습니다.')
      clickAuthorMenuAdd()
      //router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert(MenuParam.value.authorId + '권한별 메뉴가 등록되지 않았습니다.')
    })
   loading.hide()
}

const removeMenuMapng = async () => {
  if(menuSelected.value.authorMenuAddAt == "N"){
    alert("매핑되지 않은 권한은 삭제 불가합니다.")
    return
  }
  loading.show()
  await $fetch<ApiResponse<MenuData[]>>(
    "/playground/public/author/removeAuthorMenu",
    {
      method: 'POST',
      body: JSON.stringify(menuSelected.value)
    })
    .then(() => {
      alert(MenuParam.value.authorId + '권한별 메뉴가 삭제되었습니다.')
      clickAuthorMenuAdd()
      //router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert(MenuParam.value.authorId + '권한별 메뉴가 삭제되지 않았습니다.')
    })
  loading.hide()
}

onMounted(() => {
  getAuthorList()
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

</style>