<template>
    <div class="content">
        <div class="title">
            <div class="text-h4">
                <q-icon name="record_voice_over" /> 회원관리
            </div>
        </div>
        <div class="search">
            <div class="q-gutter-md row items-start">
                <q-input v-model="param.mberId" outlined label="회원아이디" round dense flat class="input"/>
                <q-input v-model="param.mberNm" outlined label="회원명" round dense flat class="input"/>
                <q-btn push color="green-7" class="button" label="조회" value="memberSearch" @click="memberSearch"/>
                <q-btn push color="green-7" class="button" label="초기화" @click="reset" />
            </div>
        </div>
        <div class="table">
            <q-table
v-model:selected="selected" flat bordered :rows="resData" row-key="mberId"
                :columns="columns" 
                class="my-sticky-header-table"
                selection="multiple"
                :rows-per-page-options="[0]"
                @row-click=""/>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type QTableProps, date } from 'quasar';
import { type ApiResponse } from '../../interface/server';
const { loading } = useQuasar();

const columns = ref<QTableProps["columns"]>([
    {
      name: 'index',
      label: '순번',
      field: 'index',
      align: 'center'
    },
    { name: 'mberId', align: 'center', label: '회원아이디', field: 'mberId', sortable: false },
    { name: 'mberNm', align: 'center', label: '회원명', field: 'mberNm', sortable: false },
    { name: 'mberBymd', align: 'center', label: '회원생년월일', field: 'mberBymd' },
    { name: 'mberSexdstnCode', align: 'center', label: '회원성별', field: 'mberSexdstnCode' , format: val => val == 'M'? '남':'여'},
    { name: 'mberEmailAdres', align: 'center', label: '회원이메일주소', field: 'mberEmailAdres' },
    { name: 'mberTelno', align: 'center', label: '회원전화번호', field: 'mberTelno' },
    { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
    { name: 'registDt', label: '등록일시', field: 'registDt', align: 'left' },
    { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
    { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'left' }
])

// api로 조회할 검색 조건 데이터 구조
interface Search {
    mberId?: string
    mberNm: string
}

// api로 조회할 데이터 구조
interface Data {
    index: any
    mberId: string
    mberNm: string
    mberBymd: string
    mberSexdstnCode: string
    mberEmailAdres: string
    MberTelno: string
    registUsrId: string
    registDt: string
    updtUsrId: string
    updtDt: string
}

const param = ref<Search>({
    mberId:'',
    mberNm: ''
});

const resData = ref<Data[]>([]);

const selected = ref<any>();

const reset = () => {
  param.value = {
    mberId: '',
    mberNm: ''
  }
  memberSearch()
}

const memberSearch = async () => {

    loading.show()
    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/member/getMberList", {
        method: 'POST',
        body: JSON.stringify(param.value)
    })
    resData.value = result.data;

    // for (let i = 0; i < result.data.length; i++) {
    //     resData.value = result.data.slice(0).map(r => ({ ...r }))
    // }
    resData.value.forEach((row, index) => {
        row.index = index + 1
    })
    loading.hide()
};

onMounted(() => {
    memberSearch()
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