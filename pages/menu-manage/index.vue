<template>
  <div style="margin: 5rem;">
    <q-table
      title="Menu"
      :rows="resData"
      :columns="columns"
      :rows-per-page-options="[10]"
      @row-click="clickRow"
    />
  </div>
  <div style="width: 20rem; margin-top: 7rem; margin-left: 5rem;">
    <q-form
      @submit="onSubmit"
      @reset="onReset"
    >
      <q-input v-model="param.menuNm" label="메뉴명"/>
      <q-input v-model="param.menuUrl" label="메뉴URL"/>
      <q-input v-model="param.menuLvl" label="메뉴레벨"/>
      <q-input v-model="param.menuSortOrder" label="정렬순서"/>
      <q-input v-model="param.parentMenuId" label="상위메뉴ID"/>
      <q-select outlined v-model="param.useYn" :options="options" label="사용여부"/>
      <div style="margin-left: 20rem; margin-top: 5rem; width: 100%; text-align: center;">
        <q-btn color="primary" label="등록하기" type="submit" style="display: inline-block; margin-right: 1rem;" />
        <q-btn color="white" text-color="black" label="초기화" type="reset" style="display: inline-block;" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { type Router } from 'vue-router';
import { type ApiResponse } from '../../interface/server';
import { type QTableProps } from 'quasar';

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

const options = ['Y', 'N']

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
  console.log('clickRow')
  // console.log('evt: ', evt, ' row: ', row, ' index: ', index)
  param.value = row
}

const onSubmit = async () => {
  console.log('param: ', param)
  // 저장 API 호출
  const result = await $fetch<ApiResponse<Data[]>>("/playground/public/menu/save", {
            method: 'POST',
            body: JSON.stringify(param.value)
        })
        .then(() => {
          alert('저장이 완료되었습니다.')
          // Router.push('/menu-manage')
          // navigateTo('/menu-manage')
          // navigateTo('/')
          // refreshNuxtData()
          window.location.reload()
        })
        .catch((error) => {
          console.error(error)
          alert('저장되지 않았습니다. 잠시 후에 다시 시도 해 주세요.')
        })
  console.log('result: ', result)
}

const onReset = () => {
  console.log('onReset')
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

onMounted(() => {
  selectAllMenu()
})
</script>