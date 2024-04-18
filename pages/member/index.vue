<template>
    <div class="q-pa-md">
        <div class="q-gutter-md row items-start">
            <q-input outlined v-model="param.mberNo" label="회원번호" round dense flat />
            <q-input outlined v-model="param.mberNm" label="회원명" round dense flat />
            <q-btn color="primary" label="조회" @click="memberSearch" value="memberSearch"></q-btn>
        </div>
    </div>

    <div class="q-pa-md">
        <q-table flat bordered title="회원 조회" :rows="resData" row-key="mbrNo" :columns="columns"
            class="my-sticky-header-table">
        </q-table>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { date, type QTableProps } from 'quasar';
import { type ApiResponse } from '../../interface/server';

const columns = ref<QTableProps["columns"]>([
    { name: 'mberNo', align: 'left', label: '회원번호', field: 'mberNo', sortable: true },
    { name: 'mberNm', align: 'center', label: '회원명', field: 'mberNm', sortable: true },
    { name: 'mberBymd', align: 'center', label: '회원생년월일', field: 'mberBymd' },
    { name: 'mberSexdstnCode', align: 'center', label: '회원성별코드', field: 'mberSexdstnCode' },
    { name: 'mberEmailAdres', align: 'center', label: '회원이메일주소', field: 'mberEmailAdres' },
    { name: 'mberTelno', align: 'center', label: '회원전화번호', field: 'mberTelno' }
])


// api로 조회할 검색 조건 데이터 구조
interface Search {
    mberNo?: number
    mberNm: string
}

// api로 조회할 데이터 구조
interface Data {
    mberNo: string
    mberNm: string
    mberBymd: string
    mberSexdstnCode: string
    mberEmailAdres: string
    MberTelno: string
}

let param = ref<Search>({
    mberNm: ''
});


let resData = ref<Data[]>();


const memberSearch = async () => {

    console.log("mberNo:::::" + param.value.mberNo);
    console.log("mberNm:::::" + param.value.mberNm);

    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/pgMember/memberSearch", {
        method: 'POST',
        body: JSON.stringify(param.value)
    })
    resData.value = result.data;

};

onMounted(() => {
    memberSearch()
})

</script>
