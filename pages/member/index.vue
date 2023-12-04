<template>
    <div class="q-pa-md">
        <div class="q-gutter-md row items-start">
            <q-input outlined v-model="param.mbrNo" label="회원번호" round dense flat />
            <q-input outlined v-model="param.mbrNm" label="회원명" round dense flat />
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
    { name: 'mbrNo', align: 'left', label: '회원번호', field: 'mbrNo', sortable: true },
    { name: 'mbrNm', align: 'center', label: '회원명', field: 'mbrNm', sortable: true },
    { name: 'mbrBrdt', align: 'center', label: '회원생년월일', field: 'mbrBrdt' },
    { name: 'mbrGndrCd', align: 'center', label: '회원성별코드', field: 'mbrGndrCd' },
    { name: 'mbrEmlAddr', align: 'center', label: '회원이메일주소', field: 'mbrEmlAddr' },
    { name: 'mbrTelno', align: 'center', label: '회원전화번호', field: 'mbrTelno' }
])


// api로 조회할 검색 조건 데이터 구조
interface Search {
    mbrNo: string
    mbrNm: string
}

// api로 조회할 데이터 구조
interface Data {
    mbrNo: string
    mbrNm: string
    mbrBrdt: string
    mbrGndrCd: string
    mbrEmlAddr: string
    mbrTelno: string
}

let param = ref<Search>({
    mbrNo: '',
    mbrNm: ''
});


let resData = ref<Data[]>();


const memberSearch = async () => {

    console.log("mbrNo:::::" + param.value.mbrNo);
    console.log("mbrNm:::::" + param.value.mbrNm);

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
