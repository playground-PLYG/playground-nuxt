<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="chat" /> 식당 리스트
      </div>
    </div>
    <div class="search">
      <q-form ref="searchForm" @submit="onSubmitSelect" @reset="onResetSelect">
        <q-select outlined v-model="searchParam.rstrntKndCode" :options="searchOptions" label="식당종류" round dense flat
          class="select" />
        <q-input outlined v-model="searchParam.rstrntNm" label="식당명" round dense flat class="input" />
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn push class="button" color="green-7" label="초기화" type="reset" />
      </q-form>
    </div>
    <div class="table">
      <q-table :rows="resData" :columns="columns" row-key="rstrntNm" v-model:selected="selected" selection="multiple"
        :rows-per-page-options="[0]" />
    </div>
    <div class="proc">
      <q-btn push class="button" color="primary" label="등록" @click="showInsertDialog = true" />
      <q-btn push class="button" color="negative" label="삭제" />
      <q-btn push class="buttonR" color="warning" label="사용여부 변경" />
    </div>
  </div>


  <div class="popup">
    <q-dialog v-model="showInsertDialog" @hide="onReset">
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
              <q-form ref="insertForm">
                <q-input v-model="param.rstrntNm" label="식당명" class="input" outlined />
                <q-select outlined v-model="param.rstrntKndCode" :options="searchOptions" label="식당종류" class="select" />
                <q-input v-model="param.rstrntDstnc" label="식당거리" class="input" outlined />
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type ApiResponse } from '../../interface/server';
import { type QTableProps } from 'quasar';

const router = useRouter();
const searchForm = ref<any>();

interface Data {
  rstrntSn: number,
  rstrntNm: string,
  rstrntKndCode: String,
  rstrntDstnc: string,
  recentChoiseDt: string
}


let resData = ref<Data[]>([]);

let param = ref<any>({
  rstrntNm: '',
  rstrntKndCode: '',
  rstrntDstnc: '',
})

let searchParam = ref<any>({
  rstrntKndCode: '',
  rstrntNm: ''
})


//let selected = ref<any>();
let selected = ref<Data[]>();

let showInsertDialog = ref<boolean>(false);

let searchOptions = [
  {
    label: '전체',
    value: ''
  },
  {
    label: '한식',
    value: '001'
  },
  {
    label: '중식',
    value: '002'
  },
  {
    label: '일식',
    value: '003'
  },
  {
    label: '양식',
    value: '004'
  }
]

const columns = ref<QTableProps["columns"]>([
  {
    name: 'rstrntSn',
    label: '식당일련번호',
    field: 'rstrntSn',
    align: 'center'
  },
  { name: 'rstrntKndCode', label: '식당종류', field: 'rstrntKndCode', align: 'left' },
  { name: 'rstrntNm', label: '식당명', field: 'rstrntNm', align: 'left' }
])



const onResetSelect = () => {
  searchParam.value = {
    rstrntKndCode: '',
    rstrntNm: ''
  }
  selected.value = undefined
}

const onReset = () => {
  param.value = {
    rstrntNm: '',
    rstrntKndCode: '',
    rstrntDstnc: '',
    recentChoiseDt: ''
  }
}

const onSubmitSelect = async () => {

  if (searchParam.value.rstrntKndCode !== '') {
    console.log("searchOptions: ", searchParam.value.rstrntKndCode.value)
    searchParam.value.rstrntKndCode = searchParam.value.rstrntKndCode.value;
  }

  console.log("searchParam: ", searchParam.value)

  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/restaurant/getRstrntList",
    {
      method: 'POST',
      body: JSON.stringify(searchParam.value)
    })
    .then((result) => {

      resData.value = result.data

      resData.value?.forEach((item) => {
        if (item.rstrntKndCode == '001') {
          item.rstrntKndCode = '한식'
        }
        if (item.rstrntKndCode == '002') {
          item.rstrntKndCode = '중식'
        }
        if (item.rstrntKndCode == '003') {
          item.rstrntKndCode = '일식'
        }
        if (item.rstrntKndCode == '004') {
          item.rstrntKndCode = '양식'
        }
      })

      console.log("리스트조회~~~: ", resData.value)
    })
    .catch((error) => {
      console.error(error)
    })
}

const onSubmit = async () => {

  param.value.rstrntKndCode = param.value.rstrntKndCode.value;
  console.log("Param: ", param.value.rstrntKndCode)
  console.log("Param: ", param.value)

  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/restaurant/addRstrnt",
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    })
    .then(() => {
      alert('저장이 완료되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('저장되지 않았습니다.')
    })
}



onMounted(() => {
  onSubmitSelect()
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