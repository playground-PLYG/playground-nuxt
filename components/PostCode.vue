<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md column" style="max-width: 300px">
      <q-input outlined type="text" v-model="param.zonecode" placeholder="우편번호" />
      <q-btn color="primary" type="button" @click="execDaumPostcode" label="우편번호 찾기" :disabled="!isScriptLoaded" />
      <q-input outlined type="text" v-model="param.roadAddress" placeholder="도로명주소" />
      <q-input outlined type="text" v-model="param.jibunAddress" placeholder="지번주소" />
      <q-input outlined type="text" v-model="param.detailAddress" placeholder="상세주소" />
      <q-input outlined type="text" v-model="param.extraAddress" placeholder="참고항목" />
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'

interface Data {
  zonecode: string,
  roadAddress: string,
  jibunAddress: string,
  detailAddress: string,
  extraAddress: string
}

declare global {
  interface Window {
    daum?: any
  }
}

let param = ref<Data>({
  zonecode: '',
  roadAddress: '',
  jibunAddress: '',
  detailAddress: '',
  extraAddress: ''
})

let isScriptLoaded = ref<boolean>(false);

const loadScript = () => {
  const script = document.createElement("script");
  script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.onload = () => {
    isScriptLoaded.value = true;
  };
  document.head.appendChild(script);

}


const execDaumPostcode = () => {
  var width = 500;
  var height = 600;
  if (window.daum && window.daum.Postcode) {
    new window.daum.Postcode({
      width: width,
      height: height,
      oncomplete: (data: any) => {
        console.log("d a t a :", data);
        param.value = data
      }
    }).open({
      left: (window.screen.width / 2) - (width / 2),
      top: (window.screen.height / 2) - (height / 2)
    });
  } else {
    console.error("Daum Postcode 스크립트가 로드되지 않았습니다.");
  }
}

onMounted(() => {
  loadScript()
})

</script>
