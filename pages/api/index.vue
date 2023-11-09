<template>
    <div>
        api 통신 샘플
        email : <input :value="param.email" />
        userId : <input :value="param.userId" />
        name : <input :value="param.name" />
        <button @click="testFetch">testFetch</button>
        <input type="button" @click="testFetch" value="testFetch">
        <div>data : {{ resData }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type ApiPagingResponse } from '../../interface/server';

// api로 조회할 검색 조건 데이터 구조
interface Search {
  userId: string
  name: string
  email: string
}

// api로 조회할 데이터 구조
interface Data {
  userId: string
  name: string
  email: string
}

let param = ref<Search>({
    userId: '',
    name: '',
    email: ''
});
let resData = ref<Data[]>();

const testFetch = async () => {
    const result = await $fetch<ApiPagingResponse<Data>>("/playground/public/sample/users", {
            method: 'POST',
            body: JSON.stringify(param.value)
        });
    resData.value = result.data.content;
};
</script>